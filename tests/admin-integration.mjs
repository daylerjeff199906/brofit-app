import { test, before } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
const base = process.env.TEST_API_URL || "http://localhost:4101/api";
const origin = "http://localhost:3001";
async function call(path, method = "GET", body, cookie) {
  const response = await fetch(base + path, {
    method,
    headers: {
      Origin: origin,
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return {
    status: response.status,
    data: await response.json(),
    cookie: response.headers.get("set-cookie")?.split(";")[0],
  };
}
async function token(email, subject, since) {
  for (let n = 0; n < 50; n++) {
    const list = await fetch("http://localhost:8026/api/v1/messages").then(
      (r) => r.json(),
    );
    const found = list.messages.find(
      (m) =>
        new Date(m.Created).getTime() >= since &&
        m.Subject.includes(subject) &&
        m.To.some((t) => t.Address === email),
    );
    if (found) {
      const mail = await fetch(
        "http://localhost:8026/api/v1/message/" + found.ID,
      ).then((r) => r.json());
      return mail.Text.match(/#token=([a-f0-9]{64})/)[1];
    }
    await new Promise((r) => setTimeout(r, 400));
  }
  throw Error("Correo no recibido");
}
before(async () => {
  assert.equal((await call("/health")).status, 200);
});
test("administración crea, modera y asigna aliados sin romper las reglas de pases", async () => {
  const password = randomUUID() + "aA!",
    since = Date.now();
  await call("/auth/forgot-password", "POST", { email: "admin@brofit.local" });
  const reset = await token("admin@brofit.local", "Recupera", since);
  assert.equal(
    (await call("/auth/reset-password", "POST", { token: reset, password }))
      .status,
    201,
  );
  const admin = (
    await call("/auth/login", "POST", { email: "admin@brofit.local", password })
  ).cookie;
  assert.ok(admin);
  const unique = randomUUID().slice(0, 8);
  const email = `partner-${unique}@example.test`;
  const start = Date.now();
  await call("/auth/register", "POST", {
    name: "Nuevo",
    lastName: "Aliado",
    email,
    password,
  });
  await call("/auth/verify-email", "POST", {
    token: await token(email, "Verifica", start),
  });
  const customer = (await call("/auth/login", "POST", { email, password }))
    .cookie;
  const application = {
    gymName: "QA Gym " + unique,
    district: "Distrito DEMO",
    message: "Solicitud de integración automatizada de prueba.",
  };
  assert.equal(
    (await call("/me/partner-application", "POST", application, customer))
      .status,
    201,
  );
  assert.equal(
    (await call("/admin/staff", "POST", { email, gymId: "demo-01" }, customer))
      .status,
    403,
  );
  assert.ok(
    (await call("/admin/applications", "GET", undefined, admin)).data.data.some(
      (a) => a.user.email === email,
    ),
  );
  const gym = await call(
    "/admin/gyms",
    "POST",
    {
      name: "QA Gym " + unique,
      slug: "qa-" + unique,
      district: "Distrito DEMO",
      address: "Dirección ficticia",
      category: "Funcional",
      description: "Creado en prueba automatizada",
      hours: "Horario DEMO",
      equipment: ["Pesas"],
      services: [],
      image: "/images/gym-1.jpg",
    },
    admin,
  );
  assert.equal(gym.status, 201);
  const id = gym.data.id;
  assert.equal((await call("/gyms/" + gym.data.slug)).status, 404);
  assert.equal(
    (await call("/admin/gyms/" + id, "PATCH", { status: "ACTIVE" }, admin))
      .status,
    200,
  );
  assert.equal((await call("/gyms/" + gym.data.slug)).status, 200);
  const offerInput = {
    name: "QA pase",
    description: "Oferta de prueba",
    kind: "DAY_PASS",
    priceCents: 3900,
    visits: 1,
    validityDays: 7,
    maxPerDay: 1,
    maxPerGym: 1,
    conditions: ["Una visita de prueba"],
    gymIds: [id],
  };
  assert.equal(
    (await call("/admin/offers", "POST", { ...offerInput, visits: 2 }, admin))
      .status,
    403,
  );
  const offer = await call("/admin/offers", "POST", offerInput, admin);
  assert.equal(offer.status, 201);
  assert.equal(
    (
      await call(
        "/admin/offers/" + offer.data.id,
        "PATCH",
        { visits: 100 },
        admin,
      )
    ).status,
    403,
  );
  assert.equal(
    (await call("/admin/staff", "POST", { email, gymId: id }, admin)).status,
    201,
  );
  assert.equal(
    (await call("/auth/me", "GET", undefined, customer)).status,
    401,
  );
  const staff = (await call("/auth/login", "POST", { email, password })).cookie;
  const assigned = await call("/partner/gym", "GET", undefined, staff);
  assert.deepEqual(
    assigned.data.map((g) => g.id),
    [id],
  );
  assert.equal(
    (await call("/partner/gym/demo-01", "PATCH", { hours: "no" }, staff))
      .status,
    403,
  );
  await call(
    "/admin/offers/" + offer.data.id,
    "PATCH",
    { active: false },
    admin,
  );
  await call("/admin/gyms/" + id, "PATCH", { status: "PAUSED" }, admin);
  assert.equal(
    (await call("/me/account", "DELETE", { password }, staff)).status,
    200,
  );
});
