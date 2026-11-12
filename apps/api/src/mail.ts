import {
  Injectable,
  Inject,
  OnModuleInit,
  OnModuleDestroy,
} from "@nestjs/common";
import nodemailer from "nodemailer";
import type { Prisma } from "@prisma/client";
import { Database } from "./database";
import { config } from "./config";
import { seal, unseal, hashToken, makeToken } from "./security";
export async function queueAuthMail(
  tx: Prisma.TransactionClient,
  userId: string,
  kind: "VERIFY" | "RESET",
) {
  const token = makeToken();
  const path = kind === "VERIFY" ? "/verificar-correo" : "/recuperar-clave";
  const url = new URL(path, config.WEB_BASE_URL);
  url.hash = `token=${token}`;
  await tx.authToken.updateMany({
    where: { userId, kind, consumedAt: null },
    data: { consumedAt: new Date() },
  });
  await tx.authToken.create({
    data: {
      userId,
      kind,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + 30 * 60_000),
    },
  });
  const payload = {
    subject:
      kind === "VERIFY"
        ? "Verifica tu correo · BROFIT — ya"
        : "Recupera tu acceso · BROFIT — ya",
    text: `${kind === "VERIFY" ? "Confirma tu correo para activar tu cuenta." : "Establece una nueva contraseña para tu cuenta."}\n\n${url.toString()}\n\nEl enlace vence en 30 minutos y se puede usar una sola vez. Si no lo solicitaste, ignora este correo.`,
  };
  await tx.mailJob.create({
    data: {
      userId,
      encryptedPayload: seal(
        JSON.stringify(payload),
        config.MAIL_ENCRYPTION_KEY,
      ),
    },
  });
}
@Injectable()
export class MailService implements OnModuleInit, OnModuleDestroy {
  constructor(@Inject(Database) private readonly db: Database) {}
  private timer?: ReturnType<typeof setInterval>;
  private busy = false;
  private transport = nodemailer.createTransport({
    host: config.SMTP_HOST,
    port: config.SMTP_PORT,
    secure: config.SMTP_SECURE === "true",
    auth: config.SMTP_USER
      ? { user: config.SMTP_USER, pass: config.SMTP_PASSWORD }
      : undefined,
    connectionTimeout: 5000,
    socketTimeout: 10000,
    logger: false,
    debug: false,
  });
  onModuleInit() {
    this.timer = setInterval(() => void this.flush(), 2000);
    this.timer.unref();
    void this.flush();
  }
  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
    this.transport.close();
  }
  async flush() {
    if (this.busy) return;
    this.busy = true;
    try {
      const jobs = await this.db.mailJob.findMany({
        where: {
          sentAt: null,
          attempts: { lt: 8 },
          availableAt: { lte: new Date() },
          OR: [
            { lockedAt: null },
            { lockedAt: { lt: new Date(Date.now() - 120_000) } },
          ],
        },
        take: 10,
        orderBy: { createdAt: "asc" },
        include: { user: { select: { email: true } } },
      });
      for (const job of jobs) {
        const claim = await this.db.mailJob.updateMany({
          where: {
            id: job.id,
            sentAt: null,
            OR: [
              { lockedAt: null },
              { lockedAt: { lt: new Date(Date.now() - 120_000) } },
            ],
          },
          data: { lockedAt: new Date(), attempts: { increment: 1 } },
        });
        if (!claim.count) continue;
        try {
          const payload = JSON.parse(
            unseal(job.encryptedPayload, config.MAIL_ENCRYPTION_KEY),
          ) as { subject: string; text: string };
          await this.transport.sendMail({
            from: config.MAIL_FROM,
            to: job.user.email,
            ...payload,
          });
          await this.db.mailJob.update({
            where: { id: job.id },
            data: { sentAt: new Date(), lockedAt: null, encryptedPayload: "" },
          });
        } catch (error) {
          await this.db.mailJob.updateMany({
            where: { id: job.id },
            data: {
              lockedAt: null,
              availableAt: new Date(
                Date.now() + Math.min(3600, 2 ** job.attempts * 10) * 1000,
              ),
            },
          });
          console.warn(
            JSON.stringify({
              event: "mail_delivery_retry",
              attempt: job.attempts + 1,
              code:
                error && typeof error === "object" && "code" in error
                  ? String(error.code).slice(0, 64)
                  : "UNKNOWN",
            }),
          );
        }
      }
    } catch {
      console.error(JSON.stringify({ event: "mail_worker_failure" }));
    } finally {
      this.busy = false;
    }
  }
}
