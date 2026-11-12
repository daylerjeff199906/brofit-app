import {
  Catch,
  ExceptionFilter,
  ArgumentsHost,
  HttpException,
  UnprocessableEntityException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type { Response } from "express";
import { z } from "zod";
export function parse<T>(schema: z.ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success)
    throw new UnprocessableEntityException({
      code: "VALIDATION_ERROR",
      message: "Revisa los datos ingresados.",
      details: result.error.flatten(),
    });
  return result.data;
}
export const emailSchema = z
  .email()
  .max(254)
  .transform((v) => v.trim().toLowerCase());
export const passwordSchema = z
  .string()
  .min(12, "Usa al menos 12 caracteres.")
  .max(128);
export const tokenSchema = z
  .object({ token: z.string().regex(/^[a-f0-9]{64}$/) })
  .strict();
export const safeUser = {
  id: true,
  email: true,
  name: true,
  lastName: true,
  phone: true,
  role: true,
  gymId: true,
  emailVerifiedAt: true,
  nearby: true,
  newsletter: true,
  createdAt: true,
} as const;
@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(error: unknown, host: ArgumentsHost) {
    let status = 500;
    let message = "No se pudo completar la operación.";
    let code = "INTERNAL_ERROR";
    let details: unknown;
    if (error instanceof HttpException) {
      status = error.getStatus();
      const body = error.getResponse();
      if (typeof body === "string") message = body;
      else {
        const b = body as {
          message?: string;
          code?: string;
          details?: unknown;
        };
        message = b.message || message;
        code = b.code || `HTTP_${status}`;
        details = b.details;
      }
    } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        status = 409;
        message = "La operación ya existe o está en proceso.";
        code = "CONFLICT";
      } else if (error.code === "P2025") {
        status = 404;
        message = "Recurso no disponible.";
        code = "NOT_FOUND";
      }
    }
    if (status === 500)
      console.error(
        JSON.stringify({
          event: "request_failure",
          type: error instanceof Error ? error.constructor.name : "unknown",
          code:
            error instanceof Prisma.PrismaClientKnownRequestError
              ? error.code
              : undefined,
        }),
      );
    host
      .switchToHttp()
      .getResponse<Response>()
      .status(status)
      .json({ error: { code, message, ...(details ? { details } : {}) } });
  }
}
