import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("../", import.meta.url));
const env = {
  ...process.env,
  NODE_ENV: "test",
  PORT: "4101",
  RATE_LIMIT_NAMESPACE: `qa-${randomUUID()}`,
  TEST_API_URL: "http://localhost:4101/api",
};
const api = spawn(process.execPath, ["dist/main.js"], {
  cwd: root + "/apps/api",
  env,
  stdio: ["ignore", "ignore", "pipe"],
});
api.stderr.on("data", (chunk) => process.stderr.write(chunk));
try {
  let ready = false;
  for (let n = 0; n < 80; n++) {
    try {
      if ((await fetch(env.TEST_API_URL + "/health")).ok) {
        ready = true;
        break;
      }
    } catch {}
    await new Promise((r) => setTimeout(r, 250));
  }
  if (!ready) throw Error("API de pruebas no inició");
  const test = spawn(process.execPath, ["--test", "tests/integration.mjs"], {
    cwd: root,
    env,
    stdio: "inherit",
  });
  process.exitCode = await new Promise((resolve) => test.on("exit", resolve));
} finally {
  api.kill("SIGTERM");
}
