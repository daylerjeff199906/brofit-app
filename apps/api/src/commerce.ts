import {
  Inject,
  Injectable,
  ForbiddenException,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { Prisma, type User } from "@prisma/client";
import { Database } from "./database";
import { hashToken, makeToken } from "./security";
import { config } from "./config";
function limaDay(date: Date) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Lima" }).format(
    date,
  );
}
export function assertStaff(user: User, gymId?: string) {
  if (
    user.role !== "PLATFORM_ADMIN" &&
    (user.role !== "GYM_STAFF" || (gymId && user.gymId !== gymId))
  )
    throw new ForbiddenException("No tienes permisos para este gimnasio.");
}
export function assertAdmin(user: User) {
  if (user.role !== "PLATFORM_ADMIN")
    throw new ForbiddenException("Acceso solo para administración.");
}
@Injectable()
export class CommerceService {
  constructor(@Inject(Database) private readonly db: Database) {}
  async createOrder(
    user: User,
    offerId: string,
    gymId: string | undefined,
    key: string,
  ) {
    if (!user.emailVerifiedAt)
      throw new ForbiddenException("Verifica tu correo antes de comprar.");
    const requestHash = hashToken(
      JSON.stringify({ offerId, gymId: gymId || null }),
    );
    const existing = await this.db.order.findUnique({
      where: {
        userId_idempotencyKey: { userId: user.id, idempotencyKey: key },
      },
    });
    if (existing) {
      if (existing.requestHash !== requestHash)
        throw new ConflictException(
          "La clave de compra ya se usó con otra oferta.",
        );
      return existing;
    }
    try {
      return await this.db.serializable(async (tx) => {
        const offer = await tx.offer.findUnique({
          where: { id: offerId },
          include: {
            gyms: { where: { status: "ACTIVE" }, select: { id: true } },
          },
        });
        if (!offer || !offer.active)
          throw new NotFoundException("La oferta ya no está disponible.");
        const eligible = offer.gyms.map((g) => g.id);
        if (offer.kind === "DAY_PASS" && (!gymId || !eligible.includes(gymId)))
          throw new ForbiddenException("Selecciona un gimnasio elegible.");
        if (!eligible.length)
          throw new ForbiddenException(
            "La oferta no tiene gimnasios disponibles.",
          );
        return tx.order.create({
          data: {
            userId: user.id,
            offerId: offer.id,
            idempotencyKey: key,
            requestHash,
            name: offer.name,
            priceCents: offer.priceCents,
            currency: offer.currency,
            visits: offer.visits,
            validityDays: offer.validityDays,
            maxPerDay: offer.maxPerDay,
            maxPerGym: offer.maxPerGym,
            eligibleGymIds: offer.kind === "DAY_PASS" ? [gymId!] : eligible,
            conditions: offer.conditions,
          },
        });
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        const replay = await this.db.order.findUnique({
          where: {
            userId_idempotencyKey: { userId: user.id, idempotencyKey: key },
          },
        });
        if (replay?.requestHash === requestHash) return replay;
      }
      throw error;
    }
  }
  async order(user: User, id: string) {
    const order = await this.db.order.findFirst({
      where: { id, userId: user.id },
      include: { pass: true },
    });
    if (!order) throw new NotFoundException("Orden no disponible.");
    return order;
  }
  async confirm(user: User, id: string) {
    if (config.PAYMENTS_PROVIDER !== "sandbox")
      throw new ForbiddenException("Proveedor no habilitado.");
    return this.db.serializable(async (tx) => {
      await tx.$queryRaw`SELECT "id" FROM "Order" WHERE "id" = ${id} AND "userId" = ${user.id} FOR UPDATE`;
      const order = await tx.order.findFirst({
        where: { id, userId: user.id },
        include: { pass: true, offer: { select: { active: true } } },
      });
      if (!order) throw new NotFoundException("Orden no disponible.");
      if (order.status === "PAID" && order.pass)
        return { orderId: id, pass: order.pass, provider: "sandbox" };
      if (order.status !== "PENDING" || !order.offer.active)
        throw new ConflictException(
          "La oferta fue retirada o la orden no está pendiente.",
        );
      const count = await tx.gym.count({
        where: { id: { in: order.eligibleGymIds }, status: "ACTIVE" },
      });
      if (count !== order.eligibleGymIds.length)
        throw new ConflictException(
          "La elegibilidad cambió. Crea una nueva orden.",
        );
      await tx.payment.create({
        data: {
          orderId: id,
          provider: "sandbox",
          amountCents: order.priceCents,
        },
      });
      const pass = await tx.pass.create({
        data: {
          orderId: id,
          userId: user.id,
          name: order.name,
          remaining: order.visits,
          visits: order.visits,
          expiresAt: new Date(Date.now() + order.validityDays * 86400_000),
          maxPerDay: order.maxPerDay,
          maxPerGym: order.maxPerGym,
          eligibleGymIds: order.eligibleGymIds,
        },
      });
      await tx.order.update({
        where: { id },
        data: { status: "PAID", paidAt: new Date() },
      });
      await tx.auditLog.create({
        data: {
          actorId: user.id,
          action: "SANDBOX_PAYMENT_CONFIRMED",
          entityId: id,
        },
      });
      return { orderId: id, pass, provider: "sandbox" };
    });
  }
  async passes(user: User) {
    const passes = await this.db.pass.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return {
      data: passes.map((p) => ({
        ...p,
        status:
          p.expiresAt <= new Date()
            ? "EXPIRED"
            : p.remaining <= 0
              ? "USED"
              : "ACTIVE",
      })),
    };
  }
  async activity(user: User) {
    return {
      data: await this.db.checkIn.findMany({
        where: { userId: user.id },
        select: {
          id: true,
          createdAt: true,
          gym: { select: { id: true, name: true, district: true } },
          pass: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
    };
  }
  async token(user: User, passId: string, gymId: string) {
    const token = makeToken();
    const expiresAt = new Date(Date.now() + 60_000);
    await this.db.serializable(async (tx) => {
      const pass = await tx.pass.findFirst({
        where: { id: passId, userId: user.id },
      });
      if (!pass) throw new NotFoundException("Pase no disponible.");
      if (
        pass.expiresAt <= new Date() ||
        pass.remaining < 1 ||
        !pass.eligibleGymIds.includes(gymId)
      )
        throw new ForbiddenException(
          "Pase vencido, sin visitas o no elegible para este gimnasio.",
        );
      const gym = await tx.gym.findFirst({
        where: { id: gymId, status: "ACTIVE" },
      });
      if (!gym) throw new ForbiddenException("Gimnasio no disponible.");
      await tx.checkInToken.deleteMany({ where: { passId, consumedAt: null } });
      await tx.checkInToken.create({
        data: { tokenHash: hashToken(token), passId, gymId, expiresAt },
      });
    });
    return { token, expiresAt, gymId, passId };
  }
  async redeem(user: User, token: string, gymId: string) {
    assertStaff(user, gymId);
    const tokenHash = hashToken(token);
    return this.db.serializable(async (tx) => {
      await tx.$queryRaw`SELECT p."id" FROM "Pass" p JOIN "CheckInToken" t ON t."passId" = p."id" WHERE t."tokenHash" = ${tokenHash} AND t."gymId" = ${gymId} FOR UPDATE OF p`;
      const record = await tx.checkInToken.findUnique({
        where: { tokenHash },
        include: { pass: true, checkIn: true },
      });
      if (!record || record.gymId !== gymId)
        throw new ForbiddenException("Código inválido para este gimnasio.");
      if (record.checkIn)
        return { receipt: record.checkIn, alreadyRedeemed: true };
      if (record.consumedAt || record.expiresAt <= new Date())
        throw new ForbiddenException("El código expiró. Solicita uno nuevo.");
      const pass = record.pass;
      if (
        !pass.userId ||
        pass.remaining < 1 ||
        pass.expiresAt <= new Date() ||
        !pass.eligibleGymIds.includes(gymId)
      )
        throw new ForbiddenException("El pase no permite este ingreso.");
      const gym = await tx.gym.findFirst({
        where: { id: gymId, status: "ACTIVE" },
      });
      if (!gym) throw new ForbiddenException("El gimnasio no está habilitado.");
      const history = await tx.checkIn.findMany({
        where: { passId: pass.id },
        select: { createdAt: true, gymId: true },
      });
      if (
        history.filter((c) => limaDay(c.createdAt) === limaDay(new Date()))
          .length >= pass.maxPerDay
      )
        throw new ForbiddenException(
          "Ya alcanzaste el límite de visitas de hoy.",
        );
      if (history.filter((c) => c.gymId === gymId).length >= pass.maxPerGym)
        throw new ForbiddenException(
          "Ya alcanzaste el límite de visitas a este gimnasio.",
        );
      const claim = await tx.checkInToken.updateMany({
        where: { tokenHash, consumedAt: null },
        data: { consumedAt: new Date() },
      });
      if (!claim.count)
        throw new ConflictException("El código ya fue utilizado.");
      const balance = await tx.pass.updateMany({
        where: { id: pass.id, remaining: { gt: 0 } },
        data: { remaining: { decrement: 1 } },
      });
      if (!balance.count) throw new ConflictException("No quedan visitas.");
      const receipt = await tx.checkIn.create({
        data: {
          tokenHash,
          userId: pass.userId,
          passId: pass.id,
          gymId,
          validatedBy: user.id,
        },
      });
      await tx.settlement.create({
        data: { checkInId: receipt.id, amountCents: gym.settlementCents },
      });
      await tx.auditLog.create({
        data: {
          actorId: user.id,
          action: "CHECK_IN_CONFIRMED",
          entityId: receipt.id,
        },
      });
      return { receipt, alreadyRedeemed: false };
    });
  }
  async partnerVisits(user: User) {
    assertStaff(user);
    return {
      data: await this.db.checkIn.findMany({
        where:
          user.role === "PLATFORM_ADMIN" ? {} : { gymId: user.gymId || "none" },
        select: {
          id: true,
          createdAt: true,
          gym: { select: { id: true, name: true } },
          pass: { select: { name: true } },
          settlement: { select: { amountCents: true, currency: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
    };
  }
}
