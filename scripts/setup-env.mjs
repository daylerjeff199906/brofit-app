import { randomBytes } from "node:crypto";
import { writeFile, access } from "node:fs/promises";
async function create(path, body) {
  try {
    await access(path);
    console.log(`Conservado: ${path}`);
  } catch {
    await writeFile(path, body, { flag: "wx" });
    console.log(`Creado: ${path}`);
  }
}
await create(
  "apps/api/.env",
  `DATABASE_URL=postgresql://brofit:brofit_local@localhost:5434/brofit\nWEB_BASE_URL=http://localhost:3001\nPORT=4100\nHOST=127.0.0.1\nPAYMENTS_PROVIDER=sandbox\nSEED_DEMO=true\nSMTP_HOST=127.0.0.1\nSMTP_PORT=1026\nSMTP_SECURE=false\nMAIL_FROM=\"BROFIT <no-reply@brofit.local>\"\nMAIL_ENCRYPTION_KEY=${randomBytes(32).toString("hex")}\n`,
);
await create(
  "apps/web/.env.local",
  "API_BASE_URL=http://127.0.0.1:4100\nWEB_BASE_URL=http://localhost:3001\n",
);
