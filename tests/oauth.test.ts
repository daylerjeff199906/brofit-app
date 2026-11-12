import { test } from "node:test";
import assert from "node:assert/strict";
import type { Request, Response } from "express";
import { Database } from "../apps/api/src/database";
import { AuthService } from "../apps/api/src/auth";
import { config } from "../apps/api/src/config";
import { makeToken, hashToken, seal } from "../apps/api/src/security";
test("OAuth termina la sesión y limpia state antes de redirigir", async () => {
  const db = new Database();
  const auth = new AuthService(db);
  const state = makeToken(),
    nonce = makeToken(),
    email = `oauth-${makeToken().slice(0, 12)}@example.test`;
  let headersSent = false;
  const response = {
    cookie() {
      assert.equal(headersSent, false);
    },
    clearCookie() {
      assert.equal(headersSent, false);
    },
    redirect() {
      headersSent = true;
    },
  } as unknown as Response;
  try {
    await db.oAuthState.create({
      data: {
        stateHash: hashToken(state),
        nonce,
        encryptedVerifier: seal("test-verifier", config.MAIL_ENCRYPTION_KEY),
        expiresAt: new Date(Date.now() + 60000),
      },
    });
    Object.defineProperty(auth, "googleClient", {
      value: () => ({
        getToken: async () => ({
          tokens: { id_token: "id-token-from-provider" },
        }),
        verifyIdToken: async () => ({
          getPayload: () => ({
            nonce,
            email,
            email_verified: true,
            sub: makeToken(),
            given_name: "Prueba",
          }),
        }),
      }),
    });
    const destination = await auth.finishGoogle(
      { cookies: { brofit_oauth: state } } as unknown as Request,
      response,
      "provider-code",
      state,
    );
    assert.equal(destination, new URL("/app", config.WEB_BASE_URL).toString());
    assert.equal(headersSent, false);
    assert.equal(
      await db.oAuthState.count({ where: { stateHash: hashToken(state) } }),
      0,
    );
  } finally {
    await db.user.deleteMany({ where: { email } });
    await db.oAuthState.deleteMany({ where: { stateHash: hashToken(state) } });
    await db.$disconnect();
  }
});
