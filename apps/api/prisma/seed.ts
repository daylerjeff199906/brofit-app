import { PrismaClient } from "@prisma/client";
import { gyms } from "../../web/src/lib/demo";
import { hashPassword, makeToken } from "../src/security";
import { queueAuthMail } from "../src/mail";
import { config } from "../src/config";
const db = new PrismaClient();
async function seed() {
  if (config.NODE_ENV === "production" || process.env.SEED_DEMO !== "true")
    throw Error("Seed demo requiere SEED_DEMO=true en un entorno local.");
  for (const g of gyms) {
    await db.gym.upsert({
      where: { id: g.id },
      update: {},
      create: {
        id: g.id,
        slug: g.slug,
        name: g.name,
        district: g.district,
        address: g.address,
        category: g.category,
        equipment: g.equipment,
        services: g.services,
        hours: g.hours,
        image: g.image,
        description: g.description,
        status: "ACTIVE",
        demo: true,
      },
    });
    await db.offer.upsert({
      where: { id: `day-${g.id}` },
      update: {},
      create: {
        id: `day-${g.id}`,
        name: `Pase · ${g.name}`,
        description: "Una visita a un gimnasio de demostración.",
        kind: "DAY_PASS",
        priceCents: g.price * 100,
        visits: 1,
        validityDays: 7,
        maxPerDay: 1,
        maxPerGym: 1,
        conditions: [
          "Una visita al gimnasio seleccionado.",
          "Válido por 7 días desde la confirmación sandbox.",
          "Acceso dentro del horario de ejemplo; servicios adicionales no incluidos.",
        ],
        gyms: { connect: { id: g.id } },
        demo: true,
      },
    });
  }
  await db.offer.upsert({
    where: { id: "membership-flex" },
    update: {},
    create: {
      id: "membership-flex",
      name: "Multigym · 8 visitas",
      description: "8 visitas para explorar la red DEMO.",
      kind: "MEMBERSHIP",
      priceCents: 12900,
      visits: 8,
      validityDays: 30,
      maxPerDay: 1,
      maxPerGym: 4,
      conditions: [
        "8 visitas durante 30 días desde la confirmación.",
        "Máximo una visita por día (America/Lima).",
        "Máximo 4 visitas al mismo gimnasio.",
        "Solo gimnasios DEMO elegibles; sin renovación automática.",
      ],
      gyms: { connect: gyms.map((g) => ({ id: g.id })) },
      demo: true,
    },
  });
  for (const item of [
    {
      email: "admin@brofit.local",
      name: "Administración",
      role: "PLATFORM_ADMIN" as const,
      gymId: null,
    },
    {
      email: "aliado@brofit.local",
      name: "Recepción",
      role: "GYM_STAFF" as const,
      gymId: "demo-01",
    },
  ]) {
    if (await db.user.findUnique({ where: { email: item.email } })) continue;
    const passwordHash = await hashPassword(makeToken());
    await db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          ...item,
          lastName: "BROFIT",
          passwordHash,
          emailVerifiedAt: new Date(),
        },
      });
      await queueAuthMail(tx, user.id, "RESET");
    });
  }
  console.log(
    "Semillas DEMO aplicadas. Admin y aliado reciben enlaces de configuración en Mailpit; no hay contraseñas predeterminadas.",
  );
}
seed()
  .catch(() => {
    console.error(
      "No se pudo aplicar la semilla local. Revisa SEED_DEMO y PostgreSQL.",
    );
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
