import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  Res,
  Headers,
  Inject,
} from "@nestjs/common";
import type { Request, Response } from "express";
import { z } from "zod";
import { AuthService } from "./auth";
import { Database } from "./database";
import { CatalogService } from "./catalog";
import { CommerceService, assertStaff, assertAdmin } from "./commerce";
import { parse, emailSchema, passwordSchema, tokenSchema } from "./http";
import { config } from "./config";
const emailBody = z.object({ email: emailSchema }).strict();
export const registerSchema = z
  .object({
    name: z.string().trim().min(1).max(80),
    lastName: z.string().trim().min(1).max(80),
    email: emailSchema,
    password: passwordSchema,
  })
  .strict();
export const profileSchema = z
  .object({
    name: z.string().trim().min(1).max(80).optional(),
    lastName: z.string().trim().min(1).max(80).optional(),
    phone: z.string().trim().max(25).nullable().optional(),
    nearby: z.boolean().optional(),
    newsletter: z.boolean().optional(),
  })
  .strict();
const gymPatch = z
  .object({
    name: z.string().trim().min(2).max(120).optional(),
    description: z.string().max(2000).optional(),
    hours: z.string().max(500).optional(),
    equipment: z.array(z.string().max(80)).max(50).optional(),
    services: z.array(z.string().max(80)).max(30).optional(),
  })
  .strict();
@Controller("auth")
export class AuthController {
  constructor(@Inject(AuthService) private readonly auth: AuthService) {}
  @Get("config") settings() {
    return {
      googleEnabled: !!(config.GOOGLE_CLIENT_ID && config.GOOGLE_CLIENT_SECRET),
      paymentsProvider: "sandbox",
      emailVerificationRequired: true,
    };
  }
  @Post("register") register(@Body() body: unknown) {
    return this.auth.register(parse(registerSchema, body));
  }
  @Post("login") login(
    @Body() body: unknown,
    @Res({ passthrough: true }) res: Response,
  ) {
    const data = parse(
      z
        .object({ email: emailSchema, password: z.string().min(1).max(128) })
        .strict(),
      body,
    );
    return this.auth.login(data.email, data.password, res);
  }
  @Get("me") async me(@Req() req: Request) {
    return this.auth.publicUser(await this.auth.user(req));
  }
  @Post("logout") logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.auth.logout(req, res);
  }
  @Post("verify-email") verify(@Body() body: unknown) {
    return this.auth.verifyEmail(parse(tokenSchema, body).token);
  }
  @Post("resend-verification") resend(@Body() body: unknown) {
    return this.auth.requestMail(parse(emailBody, body).email, "VERIFY");
  }
  @Post("forgot-password") forgot(@Body() body: unknown) {
    return this.auth.requestMail(parse(emailBody, body).email, "RESET");
  }
  @Post("reset-password") reset(@Body() body: unknown) {
    const data = parse(
      tokenSchema.extend({ password: passwordSchema }).strict(),
      body,
    );
    return this.auth.resetPassword(data.token, data.password);
  }
  @Get("google/start") google(
    @Req() req: Request,
    @Res() res: Response,
    @Query("link") link?: string,
  ) {
    return this.auth.startGoogle(req, res, link === "1");
  }
  @Get("google/callback") async googleCallback(
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const data = parse(
        z.object({
          code: z.string().max(4096),
          state: z.string().regex(/^[a-f0-9]{64}$/),
        }),
        req.query,
      );
      await this.auth.finishGoogle(req, res, data.code, data.state);
    } catch {
      res.clearCookie("brofit_oauth", {
        path: "/api/auth/google",
        httpOnly: true,
        sameSite: "lax",
        secure: config.NODE_ENV === "production",
      });
      res.redirect(
        new URL("/login?error=google", config.WEB_BASE_URL).toString(),
      );
    }
  }
}
@Controller()
export class PublicController {
  constructor(
    @Inject(CatalogService) private readonly catalog: CatalogService,
    @Inject(Database) private readonly db: Database,
  ) {}
  @Get("health") async health() {
    await this.db.$queryRaw`SELECT 1`;
    return {
      status: "ok",
      database: "connected",
      paymentsProvider: "sandbox",
      mail: "outbox",
    };
  }
  @Get("gyms") gyms(@Query() query: unknown) {
    return this.catalog.gyms(
      parse(
        z
          .object({
            q: z.string().max(120).optional(),
            district: z.string().max(80).optional(),
            category: z.string().max(80).optional(),
            equipment: z.string().max(80).optional(),
            service: z.string().max(80).optional(),
            maxPrice: z.coerce.number().min(0).optional(),
            page: z.coerce.number().int().min(1).default(1),
            pageSize: z.coerce.number().int().min(1).max(100).default(20),
          })
          .strict(),
        query,
      ),
    );
  }
  @Get("gyms/:slug") gym(@Param("slug") slug: string) {
    return this.catalog.gym(parse(z.string().max(120), slug));
  }
  @Get("offers") offers(@Query("gymId") gymId?: string) {
    return this.catalog.offers(
      gymId ? parse(z.string().max(100), gymId) : undefined,
    );
  }
}
@Controller("me")
export class AccountController {
  constructor(
    @Inject(AuthService) private readonly auth: AuthService,
    @Inject(CommerceService) private readonly commerce: CommerceService,
  ) {}
  @Patch("profile") async profile(@Req() req: Request, @Body() body: unknown) {
    return this.auth.update(
      await this.auth.user(req),
      parse(profileSchema, body),
    );
  }
  @Get("export") async export(@Req() req: Request) {
    return this.auth.export(await this.auth.user(req));
  }
  @Delete("account") async remove(
    @Req() req: Request,
    @Body() body: unknown,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.auth.delete(
      await this.auth.user(req),
      parse(z.object({ password: z.string().max(128) }).strict(), body)
        .password,
      res,
    );
  }
  @Get("passes") async passes(@Req() req: Request) {
    return this.commerce.passes(await this.auth.user(req));
  }
  @Get("activity") async activity(@Req() req: Request) {
    return this.commerce.activity(await this.auth.user(req));
  }
  @Post("check-in-tokens") async token(
    @Req() req: Request,
    @Body() body: unknown,
  ) {
    const data = parse(
      z
        .object({ passId: z.string().max(100), gymId: z.string().max(100) })
        .strict(),
      body,
    );
    return this.commerce.token(
      await this.auth.user(req),
      data.passId,
      data.gymId,
    );
  }
}
@Controller("orders")
export class OrdersController {
  constructor(
    @Inject(AuthService) private readonly auth: AuthService,
    @Inject(CommerceService) private readonly commerce: CommerceService,
  ) {}
  @Post() async create(
    @Req() req: Request,
    @Body() body: unknown,
    @Headers("idempotency-key") key: unknown,
  ) {
    const data = parse(
      z
        .object({
          offerId: z.string().max(100),
          gymId: z.string().max(100).optional(),
        })
        .strict(),
      body,
    );
    return this.commerce.createOrder(
      await this.auth.user(req),
      data.offerId,
      data.gymId,
      parse(z.string().min(16).max(100), key),
    );
  }
  @Get(":id") async order(@Req() req: Request, @Param("id") id: string) {
    return this.commerce.order(await this.auth.user(req), id);
  }
  @Post(":id/confirm-sandbox") async confirm(
    @Req() req: Request,
    @Param("id") id: string,
    @Body() body: unknown,
  ) {
    parse(z.object({ sandboxConsent: z.literal(true) }).strict(), body);
    return this.commerce.confirm(await this.auth.user(req), id);
  }
}
@Controller("partner")
export class PartnerController {
  constructor(
    @Inject(AuthService) private readonly auth: AuthService,
    @Inject(Database) private readonly db: Database,
    @Inject(CommerceService) private readonly commerce: CommerceService,
  ) {}
  @Get("gym") async gym(@Req() req: Request) {
    const user = await this.auth.user(req);
    assertStaff(user);
    return this.db.gym.findMany({
      where: user.role === "PLATFORM_ADMIN" ? {} : { id: user.gymId || "none" },
      take: 100,
    });
  }
  @Patch("gym/:id") async update(
    @Req() req: Request,
    @Param("id") id: string,
    @Body() body: unknown,
  ) {
    const user = await this.auth.user(req);
    assertStaff(user, id);
    const data = parse(gymPatch, body);
    return this.db.gym.update({
      where: { id },
      data: {
        ...data,
        ...(user.role === "GYM_STAFF" ? { status: "PENDING" as const } : {}),
      },
    });
  }
  @Post("check-ins/redeem") async redeem(
    @Req() req: Request,
    @Body() body: unknown,
  ) {
    const data = parse(
      z
        .object({
          token: z.string().regex(/^[a-f0-9]{64}$/),
          gymId: z.string().max(100),
        })
        .strict(),
      body,
    );
    return this.commerce.redeem(
      await this.auth.user(req),
      data.token,
      data.gymId,
    );
  }
  @Get("check-ins") async visits(@Req() req: Request) {
    return this.commerce.partnerVisits(await this.auth.user(req));
  }
}
@Controller("admin")
export class AdminController {
  constructor(
    @Inject(AuthService) private readonly auth: AuthService,
    @Inject(Database) private readonly db: Database,
  ) {}
  @Get("gyms") async gyms(@Req() req: Request) {
    assertAdmin(await this.auth.user(req));
    return {
      data: await this.db.gym.findMany({ orderBy: { name: "asc" }, take: 100 }),
    };
  }
  @Patch("gyms/:id") async update(
    @Req() req: Request,
    @Param("id") id: string,
    @Body() body: unknown,
  ) {
    const user = await this.auth.user(req);
    assertAdmin(user);
    const data = parse(
      gymPatch
        .extend({ status: z.enum(["PENDING", "ACTIVE", "PAUSED"]).optional() })
        .strict(),
      body,
    );
    return this.db.serializable(async (tx) => {
      const gym = await tx.gym.update({ where: { id }, data });
      await tx.auditLog.create({
        data: { actorId: user.id, action: "GYM_UPDATED", entityId: id },
      });
      return gym;
    });
  }
  @Get("offers") async offers(@Req() req: Request) {
    assertAdmin(await this.auth.user(req));
    return {
      data: await this.db.offer.findMany({
        include: { gyms: { select: { id: true, name: true } } },
        take: 100,
      }),
    };
  }
  @Patch("offers/:id") async offer(
    @Req() req: Request,
    @Param("id") id: string,
    @Body() body: unknown,
  ) {
    const user = await this.auth.user(req);
    assertAdmin(user);
    const data = parse(
      z
        .object({
          active: z.boolean().optional(),
          priceCents: z.number().int().min(100).max(10000000).optional(),
          visits: z.number().int().min(1).max(100).optional(),
          validityDays: z.number().int().min(1).max(365).optional(),
        })
        .strict(),
      body,
    );
    return this.db.serializable(async (tx) => {
      const offer = await tx.offer.update({ where: { id }, data });
      await tx.auditLog.create({
        data: { actorId: user.id, action: "OFFER_UPDATED", entityId: id },
      });
      return offer;
    });
  }
  @Get("transactions") async transactions(@Req() req: Request) {
    assertAdmin(await this.auth.user(req));
    return {
      data: await this.db.order.findMany({
        select: {
          id: true,
          name: true,
          priceCents: true,
          currency: true,
          status: true,
          createdAt: true,
          payment: { select: { provider: true, confirmedAt: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
    };
  }
  @Get("settlements") async settlements(@Req() req: Request) {
    assertAdmin(await this.auth.user(req));
    return {
      data: await this.db.settlement.findMany({
        include: { checkIn: { select: { gymId: true, createdAt: true } } },
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
    };
  }
  @Get("audit") async audit(@Req() req: Request) {
    assertAdmin(await this.auth.user(req));
    return {
      data: await this.db.auditLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
    };
  }
}
