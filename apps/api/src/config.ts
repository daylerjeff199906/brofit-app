import "dotenv/config";
import { z } from "zod";
export const config = z
  .object({
    RATE_LIMIT_NAMESPACE: z.string().default("brofit"),
    DATABASE_URL: z.string().startsWith("postgresql://"),
    WEB_BASE_URL: z.string().url(),
    PORT: z.coerce.number().int().default(4100),
    HOST: z.string().default("127.0.0.1"),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    PAYMENTS_PROVIDER: z.literal("sandbox"),
    SMTP_HOST: z.string(),
    SMTP_PORT: z.coerce.number().int(),
    SMTP_SECURE: z.enum(["true", "false"]).default("false"),
    SMTP_USER: z.string().optional(),
    SMTP_PASSWORD: z.string().optional(),
    MAIL_FROM: z.string(),
    MAIL_ENCRYPTION_KEY: z.string().regex(/^[a-f0-9]{64}$/),
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
  })
  .parse(process.env);
if (
  config.NODE_ENV === "production" &&
  !config.WEB_BASE_URL.startsWith("https://")
)
  throw Error("Production requires HTTPS");
export const webOrigin = new URL(config.WEB_BASE_URL).origin;
