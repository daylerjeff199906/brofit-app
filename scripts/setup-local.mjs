import { spawnSync } from "node:child_process";
const manager = process.env.npm_execpath;
function run(command, args) {
  const result = spawnSync(command, args, { stdio: "inherit", shell: false });
  if (result.status !== 0) process.exit(result.status || 1);
}
if (!manager) throw Error("Ejecuta este comando con pnpm run setup");
run(process.execPath, ["scripts/setup-env.mjs"]);
run("docker", ["compose", "-f", "infra/compose.yaml", "up", "-d", "--wait"]);
for (const script of ["db:generate", "db:migrate", "db:seed"]) {
  const javascript = /\.(cjs|mjs|js)$/i.test(manager);
  run(
    javascript ? process.execPath : manager,
    javascript ? [manager, "run", script] : ["run", script],
  );
}
console.log(
  "BROFIT preparado. Ejecuta pnpm dev. Web: http://localhost:3001 · Correos: http://localhost:8026",
);
