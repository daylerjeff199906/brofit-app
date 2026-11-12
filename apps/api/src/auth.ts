import {
  Injectable,
  Inject,
  UnauthorizedException,
  ForbiddenException,
  ConflictException,
  ServiceUnavailableException,
} from "@nestjs/common";
import { Prisma, type User } from "@prisma/client";
import { OAuth2Client, CodeChallengeMethod } from "google-auth-library";
import type { Request, Response } from "express";
import { Database } from "./database";
import { config } from "./config";
import {
  hashPassword,
  verifyPassword,
  makeToken,
  hashToken,
  seal,
  unseal,
} from "./security";
import { queueAuthMail } from "./mail";
import { safeUser } from "./http";
const SESSION = "brofit_session";
const cookieOptions = {
  httpOnly: true,
  secure: config.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/api",
};
const dummyHash = hashPassword(makeToken());
const accepted = {
  message:
    "Si el correo corresponde a una cuenta elegible, recibirás un enlace. Revisa tu bandeja de entrada.",
};
export type Registration = {
  name: string;
  lastName: string;
  email: string;
  password: string;
};
@Injectable()
export class AuthService {
  constructor(@Inject(Database) private readonly db: Database) {}
  async register(input: Registration) {
    const passwordHash = await hashPassword(input.password);
    try {
      await this.db.serializable(async (tx) => {
        if (await tx.user.findUnique({ where: { email: input.email } })) return;
        const user = await tx.user.create({
          data: {
            name: input.name,
            lastName: input.lastName,
            email: input.email,
            passwordHash,
          },
        });
        await queueAuthMail(tx, user.id, "VERIFY");
        await tx.auditLog.create({
          data: { actorId: user.id, action: "REGISTER", entityId: user.id },
        });
      });
    } catch (error) {
      if (!(
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ))
        throw error;
    }
    return accepted;
  }
  async session(user: User, response: Response) {
    const token = makeToken();
    await this.db.serializable(async (tx) => {
      const current = await tx.user.findUnique({ where: { id: user.id } });
      if (!current || current.credentialVersion !== user.credentialVersion)
        throw new UnauthorizedException("Vuelve a iniciar sesión.");
      if (!current.emailVerifiedAt)
        throw new ForbiddenException(
          "Verifica tu correo antes de iniciar sesión.",
        );
      await tx.session.create({
        data: {
          tokenHash: hashToken(token),
          userId: user.id,
          credentialVersion: current.credentialVersion,
          expiresAt: new Date(Date.now() + 7 * 86400_000),
        },
      });
    });
    response.cookie(SESSION, token, {
      ...cookieOptions,
      maxAge: 7 * 86400_000,
    });
    return this.publicUser(user);
  }
  publicUser(user: User) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      lastName: user.lastName,
      phone: user.phone,
      role: user.role,
      gymId: user.gymId,
      emailVerifiedAt: user.emailVerifiedAt,
      nearby: user.nearby,
      newsletter: user.newsletter,
      googleConnected: !!user.googleSub,
    };
  }
  async login(email: string, password: string, response: Response) {
    const user = await this.db.user.findUnique({ where: { email } });
    const valid = await verifyPassword(
      password,
      user?.passwordHash || (await dummyHash),
    );
    if (!user || !valid)
      throw new UnauthorizedException("Correo o contraseña incorrectos.");
    return this.session(user, response);
  }
  async user(req: Request) {
    const token = (req.cookies as Record<string, string> | undefined)?.[
      SESSION
    ];
    if (!token || !/^[a-f0-9]{64}$/.test(token))
      throw new UnauthorizedException("Inicia sesión para continuar.");
    const session = await this.db.session.findUnique({
      where: { tokenHash: hashToken(token) },
      include: { user: true },
    });
    if (
      !session ||
      session.expiresAt <= new Date() ||
      session.credentialVersion !== session.user.credentialVersion
    )
      throw new UnauthorizedException("Tu sesión venció. Vuelve a ingresar.");
    return session.user;
  }
  async logout(req: Request, response: Response) {
    const token = (req.cookies as Record<string, string> | undefined)?.[
      SESSION
    ];
    if (token)
      await this.db.session.deleteMany({
        where: { tokenHash: hashToken(token) },
      });
    response.clearCookie(SESSION, cookieOptions);
    return { message: "Sesión cerrada." };
  }
  async requestMail(email: string, kind: "VERIFY" | "RESET") {
    await this.db.serializable(async (tx) => {
      const user = await tx.user.findUnique({ where: { email } });
      if (user && (kind === "RESET" || !user.emailVerifiedAt))
        await queueAuthMail(tx, user.id, kind);
    });
    return accepted;
  }
  async verifyEmail(token: string) {
    await this.db.serializable(async (tx) => {
      const record = await tx.authToken.findUnique({
        where: { tokenHash: hashToken(token) },
      });
      if (
        !record ||
        record.kind !== "VERIFY" ||
        record.consumedAt ||
        record.expiresAt <= new Date()
      )
        throw new ForbiddenException(
          "El enlace no es válido o ya venció. Solicita otro.",
        );
      const claim = await tx.authToken.updateMany({
        where: { tokenHash: record.tokenHash, consumedAt: null },
        data: { consumedAt: new Date() },
      });
      if (!claim.count)
        throw new ConflictException("El enlace ya fue utilizado.");
      await tx.user.update({
        where: { id: record.userId },
        data: { emailVerifiedAt: new Date() },
      });
    });
    return { message: "Correo verificado. Ya puedes iniciar sesión." };
  }
  async resetPassword(token: string, password: string) {
    const passwordHash = await hashPassword(password);
    await this.db.serializable(async (tx) => {
      const record = await tx.authToken.findUnique({
        where: { tokenHash: hashToken(token) },
      });
      if (
        !record ||
        record.kind !== "RESET" ||
        record.consumedAt ||
        record.expiresAt <= new Date()
      )
        throw new ForbiddenException("El enlace no es válido o ya venció.");
      await tx.authToken.updateMany({
        where: { userId: record.userId, kind: "RESET", consumedAt: null },
        data: { consumedAt: new Date() },
      });
      await tx.user.update({
        where: { id: record.userId },
        data: { passwordHash, credentialVersion: { increment: 1 } },
      });
      await tx.session.deleteMany({ where: { userId: record.userId } });
      await tx.auditLog.create({
        data: {
          actorId: record.userId,
          action: "PASSWORD_RESET",
          entityId: record.userId,
        },
      });
    });
    return {
      message: "Contraseña actualizada. Inicia sesión con tu nueva clave.",
    };
  }
  async update(
    user: User,
    input: {
      name?: string;
      lastName?: string;
      phone?: string | null;
      nearby?: boolean;
      newsletter?: boolean;
    },
  ) {
    return this.db.user.update({
      where: { id: user.id },
      data: input,
      select: safeUser,
    });
  }
  async export(user: User) {
    const [profile, orders, passes, activity] = await Promise.all([
      this.db.user.findUnique({ where: { id: user.id }, select: safeUser }),
      this.db.order.findMany({
        where: { userId: user.id },
        select: {
          id: true,
          name: true,
          status: true,
          priceCents: true,
          currency: true,
          createdAt: true,
        },
      }),
      this.db.pass.findMany({
        where: { userId: user.id },
        select: { id: true, name: true, remaining: true, expiresAt: true },
      }),
      this.db.checkIn.findMany({
        where: { userId: user.id },
        select: { id: true, gymId: true, createdAt: true },
      }),
    ]);
    return { profile, orders, passes, activity };
  }
  async delete(user: User, password: string, response: Response) {
    if (!(await verifyPassword(password, user.passwordHash)))
      throw new UnauthorizedException("Confirma tu contraseña actual.");
    await this.db.serializable(async (tx) => {
      await tx.auditLog.deleteMany({ where: { actorId: user.id } });
      await tx.checkInToken.deleteMany({
        where: { pass: { userId: user.id }, consumedAt: null },
      });
      await tx.user.delete({ where: { id: user.id } });
    });
    response.clearCookie(SESSION, cookieOptions);
    return {
      message: "Cuenta eliminada. Las operaciones sandbox quedan anonimizadas.",
    };
  }
  private googleClient() {
    if (!config.GOOGLE_CLIENT_ID || !config.GOOGLE_CLIENT_SECRET)
      throw new ServiceUnavailableException(
        "El acceso con Google aún requiere configurar las credenciales OAuth.",
      );
    return new OAuth2Client(
      config.GOOGLE_CLIENT_ID,
      config.GOOGLE_CLIENT_SECRET,
      new URL("/api/auth/google/callback", config.WEB_BASE_URL).toString(),
    );
  }
  async startGoogle(req: Request, response: Response, link: boolean) {
    const client = this.googleClient();
    const user = link ? await this.user(req) : null;
    const state = makeToken();
    const nonce = makeToken();
    const codes = await client.generateCodeVerifierAsync();
    await this.db.oAuthState.create({
      data: {
        stateHash: hashToken(state),
        nonce,
        encryptedVerifier: seal(codes.codeVerifier, config.MAIL_ENCRYPTION_KEY),
        linkUserId: user?.id,
        expiresAt: new Date(Date.now() + 10 * 60_000),
      },
    });
    response.cookie("brofit_oauth", state, {
      ...cookieOptions,
      path: "/api/auth/google",
      maxAge: 10 * 60_000,
    });
    response.redirect(
      client.generateAuthUrl({
        scope: ["openid", "email", "profile"],
        state,
        nonce,
        code_challenge: codes.codeChallenge,
        code_challenge_method: CodeChallengeMethod.S256,
        access_type: "online",
        prompt: "select_account",
      }),
    );
  }
  async finishGoogle(
    req: Request,
    response: Response,
    code: string,
    state: string,
  ) {
    try {
      const cookie = (req.cookies as Record<string, string> | undefined)
        ?.brofit_oauth;
      if (!cookie || hashToken(cookie) !== hashToken(state))
        throw new ForbiddenException();
      const record = await this.db.oAuthState.findUnique({
        where: { stateHash: hashToken(state) },
      });
      if (!record || record.expiresAt <= new Date())
        throw new ForbiddenException();
      const consumed = await this.db.oAuthState.deleteMany({
        where: { stateHash: record.stateHash },
      });
      if (!consumed.count) throw new ForbiddenException();
      const client = this.googleClient();
      const { tokens } = await client.getToken({
        code,
        codeVerifier: unseal(
          record.encryptedVerifier,
          config.MAIL_ENCRYPTION_KEY,
        ),
      });
      if (!tokens.id_token) throw new ForbiddenException();
      const ticket = await client.verifyIdToken({
        idToken: tokens.id_token,
        audience: config.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload() as ReturnType<
        typeof ticket.getPayload
      > & { nonce?: string };
      if (
        !payload ||
        payload.nonce !== record.nonce ||
        !payload.email_verified ||
        !payload.email ||
        !payload.sub
      )
        throw new ForbiddenException();
      const email = payload.email.toLowerCase();
      let user = await this.db.user.findUnique({
        where: { googleSub: payload.sub },
      });
      if (record.linkUserId) {
        const current = await this.user(req);
        if (
          current.id !== record.linkUserId ||
          current.email !== email ||
          (user && user.id !== current.id)
        )
          throw new ForbiddenException();
        user = await this.db.user.update({
          where: { id: current.id },
          data: { googleSub: payload.sub, emailVerifiedAt: new Date() },
        });
      } else if (!user) {
        if (await this.db.user.findUnique({ where: { email } }))
          throw new ConflictException(
            "Inicia sesión con tu contraseña y vincula Google desde tu perfil.",
          );
        user = await this.db.user.create({
          data: {
            email,
            name: payload.given_name || "Usuario",
            lastName: payload.family_name || "",
            googleSub: payload.sub,
            emailVerifiedAt: new Date(),
            passwordHash: await hashPassword(makeToken()),
          },
        });
      }
      await this.session(user, response);
      response.redirect(new URL("/app", config.WEB_BASE_URL).toString());
    } finally {
      response.clearCookie("brofit_oauth", {
        ...cookieOptions,
        path: "/api/auth/google",
      });
    }
  }
}
