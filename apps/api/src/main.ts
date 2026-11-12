import "reflect-metadata";
import { Module } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { json } from "express";
import type { Request, Response, NextFunction } from "express";
import { Database } from "./database";
import { config, webOrigin } from "./config";
import { AuthService } from "./auth";
import { MailService } from "./mail";
import { CatalogService } from "./catalog";
import { CommerceService } from "./commerce";
import { ApiExceptionFilter } from "./http";
import { hashToken } from "./security";
import {
  AuthController,
  PublicController,
  AccountController,
  OrdersController,
  PartnerController,
  AdminController,
} from "./controllers";
@Module({
  providers: [
    Database,
    AuthService,
    MailService,
    CatalogService,
    CommerceService,
  ],
  controllers: [
    AuthController,
    PublicController,
    AccountController,
    OrdersController,
    PartnerController,
    AdminController,
  ],
})
class AppModule {}
export async function createApp() {
  const app = await NestFactory.create(AppModule, {
    logger: ["error", "warn", "log"],
    bodyParser: false,
  });
  app.setGlobalPrefix("api");
  app.use(helmet());
  app.use(json({ limit: "16kb" }));
  app.use(cookieParser());
  app.useGlobalFilters(new ApiExceptionFilter());
  const db = app.get(Database);
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader("Cache-Control", "no-store");
    if (
      !["GET", "HEAD", "OPTIONS"].includes(req.method) &&
      req.headers.origin !== webOrigin
    ) {
      res
        .status(403)
        .json({
          error: {
            code: "ORIGIN_REJECTED",
            message: "Origen de solicitud no permitido.",
          },
        });
      return;
    }
    next();
  });
  app.use(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const now = Date.now();
      const window = 15 * 60_000;
      const path = req.path.replace(/\/$/, "");
      const authRequest =
        req.method === "POST" &&
        /^\/api\/auth\/(login|register|forgot-password|resend-verification|reset-password)/.test(
          path,
        );
      const keys = [
        {
          key: `ip:${req.ip}:${authRequest ? "auth" : "api"}`,
          max: authRequest ? 80 : 1200,
        },
      ];
      if (authRequest && typeof req.body?.email === "string") {
        keys.push({
          key: `email:${path}:${req.body.email.toLowerCase().trim()}`,
          max: path.endsWith("/login") ? 10 : 4,
        });
      }
      for (const key of keys) {
        const id = hashToken(
          `${config.RATE_LIMIT_NAMESPACE}:${key.key}:${Math.floor(now / window)}`,
        );
        const bucket = await db.rateBucket.upsert({
          where: { id },
          create: { id, count: 1, expiresAt: new Date(now + window) },
          update: { count: { increment: 1 } },
        });
        if (bucket.count > key.max) {
          res.setHeader("Retry-After", "900");
          res
            .status(429)
            .json({
              error: {
                code: "RATE_LIMITED",
                message: "Demasiados intentos. Espera unos minutos.",
              },
            });
          return;
        }
      }
      next();
    } catch {
      res
        .status(503)
        .json({
          error: {
            code: "UNAVAILABLE",
            message: "Servicio temporalmente no disponible.",
          },
        });
    }
  });
  app.enableShutdownHooks();
  return app;
}
async function bootstrap() {
  const app = await createApp();
  await app.listen(config.PORT, config.HOST);
  const db = app.get(Database);
  const cleanup = setInterval(
    () =>
      void Promise.all([
        db.session.deleteMany({ where: { expiresAt: { lt: new Date() } } }),
        db.authToken.deleteMany({
          where: { expiresAt: { lt: new Date(Date.now() - 86400_000) } },
        }),
        db.oAuthState.deleteMany({ where: { expiresAt: { lt: new Date() } } }),
        db.rateBucket.deleteMany({ where: { expiresAt: { lt: new Date() } } }),
        db.mailJob.deleteMany({
          where: { sentAt: { lt: new Date(Date.now() - 7 * 86400_000) } },
        }),
      ]).catch(() => console.warn(JSON.stringify({ event: "cleanup_retry" }))),
    60000,
  );
  cleanup.unref();
  console.log(`BROFIT API http://localhost:${config.PORT}/api`);
}
if (require.main === module)
  bootstrap().catch(() => {
    console.error(
      "No se pudo iniciar BROFIT API. Revisa la configuración y PostgreSQL.",
    );
    process.exitCode = 1;
  });
