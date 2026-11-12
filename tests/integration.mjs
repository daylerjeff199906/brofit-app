import { test, before } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
const base = process.env.TEST_API_URL || "http://localhost:4100/api";
const origin = "http://localhost:3001";
const mailbox = "http://localhost:8026/api/v1";
before(async () => {
  for (let n = 0; n < 60; n++) {
    try {
      if ((await fetch(base + "/health")).ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw Error("API no está lista en " + base);
});
async function request(
  path,
  { method = "GET", body, cookie, key, originHeader = origin } = {},
) {
  const response = await fetch(base + path, {
    method,
    headers: {
      Origin: originHeader,
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(cookie ? { Cookie: cookie } : {}),
      ...(key ? { "Idempotency-Key": key } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    redirect: "manual",
  });
  const data = await response.json().catch(() => null);
  return {
    status: response.status,
    data,
    cookie: response.headers.get("set-cookie")?.split(";")[0],
    headers: response.headers,
  };
}
async function mailToken(email, subject, since = 0) {
  // Allow the worker's first retry (10s backoff after a connection timeout).
  for (let n = 0; n < 75; n++) {
    const messages = await fetch(mailbox + "/messages").then((r) => r.json());
    const item = messages.messages?.find(
      (m) =>
        new Date(m.Created).getTime() >= since &&
        m.Subject.includes(subject) &&
        m.To?.some((t) => t.Address === email),
    );
    if (item) {
      const mail = await fetch(`${mailbox}/message/${item.ID}`).then((r) =>
        r.json(),
      );
      const token = mail.Text?.match(/#token=([a-f0-9]{64})/)?.[1];
      if (token) return token;
    }
    await new Promise((r) => setTimeout(r, 400));
  }
  throw Error("No llegó el correo esperado a Mailpit");
}
async function newUser() {
  const email = `qa-${randomUUID()}@example.test`;
  const password = "BROFIT-test-password-2026!";
  const reg = await request("/auth/register", {
    method: "POST",
    body: { email, password, name: "Prueba", lastName: "Integración" },
  });
  assert.equal(reg.status, 201);
  const verify = await mailToken(email, "Verifica");
  assert.equal(
    (
      await request("/auth/verify-email", {
        method: "POST",
        body: { token: verify },
      })
    ).status,
    201,
  );
  const login = await request("/auth/login", {
    method: "POST",
    body: { email, password },
  });
  assert.equal(login.status, 201);
  return { email, password, cookie: login.cookie };
}
test("plataforma: correo, sesión, sandbox, canje concurrente, permisos y recuperación", async () => {
  assert.equal((await request("/health")).data.database, "connected");
  assert.equal((await request("/auth/me")).status, 401);
  assert.equal(
    (
      await request("/auth/register", {
        method: "POST",
        body: {
          name: "A",
          lastName: "B",
          email: "reject@example.test",
          password: "123456789012",
          role: "PLATFORM_ADMIN",
        },
      })
    ).status,
    422,
  );
  assert.equal(
    (
      await request("/auth/logout", {
        method: "POST",
        body: {},
        originHeader: "https://attacker.test",
      })
    ).status,
    403,
  );
  const email = `qa-${randomUUID()}@example.test`,
    password = "BROFIT-test-password-2026!";
  const body = { name: "Cliente", lastName: "QA", email, password };
  const reg = await request("/auth/register", { method: "POST", body });
  assert.equal(reg.status, 201);
  assert.deepEqual(
    (await request("/auth/register", { method: "POST", body })).data,
    reg.data,
  );
  assert.equal(
    (
      await request("/auth/login", {
        method: "POST",
        body: { email, password },
      })
    ).status,
    403,
  );
  const token = await mailToken(email, "Verifica");
  assert.equal(
    (await request("/auth/verify-email", { method: "POST", body: { token } }))
      .status,
    201,
  );
  assert.equal(
    (await request("/auth/verify-email", { method: "POST", body: { token } }))
      .status,
    403,
  );
  const login = await request("/auth/login", {
    method: "POST",
    body: { email, password },
  });
  assert.equal(login.status, 201);
  assert.match(login.headers.get("set-cookie"), /HttpOnly/i);
  assert.match(login.headers.get("set-cookie"), /SameSite=Lax/i);
  let cookie = login.cookie;
  assert.equal(login.data.passwordHash, undefined);
  assert.equal(login.data.role, "CUSTOMER");
  assert.equal(
    (
      await request("/me/profile", {
        method: "PATCH",
        cookie,
        body: { name: "Actualizado", nearby: true },
      })
    ).data.name,
    "Actualizado",
  );
  assert.equal((await request("/admin/gyms", { cookie })).status, 403);
  assert.equal((await request("/partner/gym", { cookie })).status, 403);
  assert.equal(
    (
      await request("/orders", {
        method: "POST",
        cookie,
        key: randomUUID(),
        body: { offerId: "day-demo-01", gymId: "demo-01", priceCents: 1 },
      })
    ).status,
    422,
  );
  const key = randomUUID(),
    input = { offerId: "day-demo-01", gymId: "demo-01" };
  const orders = await Promise.all(
    Array.from({ length: 4 }, () =>
      request("/orders", { method: "POST", cookie, key, body: input }),
    ),
  );
  assert.ok(orders.every((o) => o.status === 201));
  assert.equal(new Set(orders.map((o) => o.data.id)).size, 1);
  const order = orders[0].data;
  assert.equal(order.priceCents, 2500);
  assert.equal(
    (
      await request("/orders", {
        method: "POST",
        cookie,
        key,
        body: { offerId: "membership-flex" },
      })
    ).status,
    409,
  );
  const other = await newUser();
  assert.equal(
    (await request(`/orders/${order.id}`, { cookie: other.cookie })).status,
    404,
  );
  assert.equal(
    (
      await request(`/orders/${order.id}/confirm-sandbox`, {
        method: "POST",
        cookie,
        body: { sandboxConsent: false },
      })
    ).status,
    422,
  );
  const confirmations = await Promise.all(
    Array.from({ length: 4 }, () =>
      request(`/orders/${order.id}/confirm-sandbox`, {
        method: "POST",
        cookie,
        body: { sandboxConsent: true },
      }),
    ),
  );
  assert.ok(
    confirmations.every((c) => c.status === 201),
    JSON.stringify(
      confirmations.map((c) => ({ status: c.status, error: c.data?.error })),
    ),
  );
  assert.equal(new Set(confirmations.map((c) => c.data.pass.id)).size, 1);
  const pass = confirmations[0].data.pass;
  assert.equal(
    (
      await request("/me/check-in-tokens", {
        method: "POST",
        cookie: other.cookie,
        body: { passId: pass.id, gymId: "demo-01" },
      })
    ).status,
    404,
  );
  assert.equal(
    (
      await request("/me/check-in-tokens", {
        method: "POST",
        cookie,
        body: { passId: pass.id, gymId: "demo-02" },
      })
    ).status,
    403,
  );
  const access = await request("/me/check-in-tokens", {
    method: "POST",
    cookie,
    body: { passId: pass.id, gymId: "demo-01" },
  });
  assert.equal(access.status, 201);
  const since = Date.now();
  await request("/auth/forgot-password", {
    method: "POST",
    body: { email: "aliado@brofit.local" },
  });
  const staffPassword = randomUUID() + "!aA";
  const staffReset = await mailToken("aliado@brofit.local", "Recupera", since);
  assert.equal(
    (
      await request("/auth/reset-password", {
        method: "POST",
        body: { token: staffReset, password: staffPassword },
      })
    ).status,
    201,
  );
  const staff = (
    await request("/auth/login", {
      method: "POST",
      body: { email: "aliado@brofit.local", password: staffPassword },
    })
  ).cookie;
  assert.ok(staff);
  assert.equal(
    (
      await request("/partner/check-ins/redeem", {
        method: "POST",
        cookie: staff,
        body: { token: access.data.token, gymId: "demo-02" },
      })
    ).status,
    403,
  );
  const checks = await Promise.all(
    Array.from({ length: 6 }, () =>
      request("/partner/check-ins/redeem", {
        method: "POST",
        cookie: staff,
        body: { token: access.data.token, gymId: "demo-01" },
      }),
    ),
  );
  assert.ok(checks.every((c) => c.status === 201));
  assert.equal(new Set(checks.map((c) => c.data.receipt.id)).size, 1);
  const passes = (await request("/me/passes", { cookie })).data.data;
  assert.equal(passes.find((p) => p.id === pass.id).remaining, 0);
  assert.equal((await request("/me/activity", { cookie })).data.data.length, 1);
  assert.equal(
    (
      await request("/me/check-in-tokens", {
        method: "POST",
        cookie,
        body: { passId: pass.id, gymId: "demo-01" },
      })
    ).status,
    403,
  );
  assert.equal(
    (
      await request("/partner/gym/demo-02", {
        method: "PATCH",
        cookie: staff,
        body: { name: "No permitido" },
      })
    ).status,
    403,
  );
  const forgot = await request("/auth/forgot-password", {
    method: "POST",
    body: { email },
  });
  assert.equal(forgot.status, 201);
  const reset = await mailToken(email, "Recupera"),
    newPassword = "BROFIT-new-password-2026!";
  assert.equal(
    (
      await request("/auth/reset-password", {
        method: "POST",
        body: { token: reset, password: newPassword },
      })
    ).status,
    201,
  );
  assert.equal((await request("/auth/me", { cookie })).status, 401);
  assert.equal(
    (
      await request("/auth/reset-password", {
        method: "POST",
        body: { token: reset, password: newPassword },
      })
    ).status,
    403,
  );
  assert.equal(
    (
      await request("/auth/login", {
        method: "POST",
        body: { email, password },
      })
    ).status,
    401,
  );
  cookie = (
    await request("/auth/login", {
      method: "POST",
      body: { email, password: newPassword },
    })
  ).cookie;
  assert.equal(
    (await request("/me/export", { cookie })).data.profile.email,
    email,
  );
  assert.equal(
    (
      await request("/me/account", {
        method: "DELETE",
        cookie,
        body: { password: newPassword },
      })
    ).status,
    200,
  );
  await request("/me/account", {
    method: "DELETE",
    cookie: other.cookie,
    body: { password: other.password },
  });
  assert.equal((await request("/auth/me", { cookie })).status, 401);
});
test("el login limita intentos por cuenta y rechaza Origin ausente", async () => {
  const email = `rate-${randomUUID()}@example.test`;
  const statuses = [];
  // Up to 21 attempts cover a run crossing the fixed 15-minute window boundary.
  for (let n = 0; n < 21 && !statuses.includes(429); n++)
    statuses.push(
      (
        await request(n % 2 ? "/auth/LOGIN" : "/auth/login", {
          method: "POST",
          body: { email, password: "wrong" },
        })
      ).status,
    );
  assert.ok(
    statuses.includes(429),
    "Both route spellings must share the account limit",
  );
  assert.equal(
    (
      await request("/auth/logout", {
        method: "POST",
        body: {},
        originHeader: "null",
      })
    ).status,
    403,
  );
});
