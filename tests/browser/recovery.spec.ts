import { test, expect } from "@playwright/test";
import { randomUUID } from "node:crypto";
test("recuperación por correo cambia la contraseña desde el navegador", async ({
  page,
  request,
}) => {
  const email = `recovery-${randomUUID()}@example.test`,
    password = "BROFIT-browser-initial-2026!",
    updated = "BROFIT-browser-updated-2026!";
  const headers = { Origin: "http://localhost:3001" };
  async function mail(subject: string, since: number) {
    for (let n = 0; n < 75; n++) {
      const list = await (
        await request.get("http://localhost:8026/api/v1/messages")
      ).json();
      const found = list.messages.find(
        (m: { Created: string; Subject: string; To: { Address: string }[] }) =>
          new Date(m.Created).getTime() >= since &&
          m.Subject.includes(subject) &&
          m.To.some((t) => t.Address === email),
      );
      if (found) {
        const text = await (
          await request.get("http://localhost:8026/api/v1/message/" + found.ID)
        ).json();
        return text.Text.match(/#token=([a-f0-9]{64})/)[1] as string;
      }
      await new Promise((r) => setTimeout(r, 400));
    }
    throw Error("Correo no recibido");
  }
  const since = Date.now();
  expect(
    (
      await request.post("/api/auth/register", {
        headers,
        data: { name: "Recuperación", lastName: "Navegador", email, password },
      })
    ).ok(),
  ).toBeTruthy();
  expect(
    (
      await request.post("/api/auth/verify-email", {
        headers,
        data: { token: await mail("Verifica", since) },
      })
    ).ok(),
  ).toBeTruthy();
  await page.goto("/recuperar-clave/");
  await page.getByLabel("Correo electrónico", { exact: true }).fill(email);
  const recoverySince = Date.now();
  await page
    .getByRole("button", { name: "Enviar enlace de recuperación" })
    .click();
  await expect(page.getByRole("status")).toContainText("recibirás un enlace");
  const reset = await mail("Recupera", recoverySince);
  await page.goto("/recuperar-clave/#token=" + reset);
  await page.getByLabel("Nueva contraseña", { exact: true }).fill(updated);
  await page.getByLabel("Confirmar contraseña", { exact: true }).fill(updated);
  await page.getByRole("button", { name: "Actualizar contraseña" }).click();
  await expect(page.getByRole("status")).toContainText(
    "Contraseña actualizada",
  );
  await page.getByRole("link", { name: "Ir a iniciar sesión" }).click();
  await page.getByLabel("Correo electrónico", { exact: true }).fill(email);
  await page.getByLabel("Contraseña", { exact: true }).fill(updated);
  await page
    .getByRole("button", { name: "Iniciar sesión", exact: false })
    .click();
  await expect(page).toHaveURL(/\/app\/?$/);
});
