import { test, expect, type APIRequestContext } from "@playwright/test";
import { randomUUID } from "node:crypto";
const mailbox = "http://localhost:8026/api/v1";
async function mailToken(
  request: APIRequestContext,
  email: string,
  subject: string,
  since: number,
) {
  for (let i = 0; i < 75; i++) {
    const response = await request.get(mailbox + "/messages");
    const list = await response.json();
    const item = list.messages?.find(
      (m: { Subject: string; Created: string; To: { Address: string }[] }) =>
        new Date(m.Created).getTime() >= since &&
        m.Subject.includes(subject) &&
        m.To.some((t) => t.Address === email),
    );
    if (item) {
      const mail = await (
        await request.get(mailbox + "/message/" + item.ID)
      ).json();
      const token = mail.Text?.match(/#token=([a-f0-9]{64})/)?.[1];
      if (token) return token as string;
    }
    await new Promise((r) => setTimeout(r, 400));
  }
  throw Error("Correo de prueba no recibido");
}
test("registro, correo, login, perfil y compra sandbox desde el navegador", async ({
  page,
  request,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const email = `browser-${randomUUID()}@example.test`;
  const password = "BROFIT-browser-password-2026!";
  const since = Date.now();
  await page.goto("/registro/");
  await page.getByLabel("Nombre", { exact: true }).fill("Prueba");
  await page.getByLabel("Apellidos", { exact: true }).fill("Navegador");
  await page.getByLabel("Correo electrónico", { exact: true }).fill(email);
  await page.getByLabel("Contraseña", { exact: true }).fill(password);
  await page.getByLabel("Confirmar contraseña", { exact: true }).fill(password);
  const registered = page.waitForResponse(
    (response) =>
      response.url().includes("/api/auth/register") &&
      response.request().method() === "POST" &&
      ![307, 308].includes(response.status()),
  );
  await page.getByRole("button", { name: "Crear mi cuenta" }).click();
  expect((await registered).ok()).toBeTruthy();
  await expect(page.getByRole("status")).toContainText("recibirás un enlace");
  const token = await mailToken(request, email, "Verifica", since);
  await page.goto("/verificar-correo/#token=" + token);
  await page.getByRole("button", { name: "Verificar mi correo" }).click();
  await expect(page.getByRole("status")).toContainText("Correo verificado");
  await page.getByRole("link", { name: "Ir a iniciar sesión" }).click();
  await page.getByLabel("Correo electrónico", { exact: true }).fill(email);
  await page.getByLabel("Contraseña", { exact: true }).fill(password);
  await page
    .getByRole("button", { name: "Iniciar sesión", exact: false })
    .click();
  await expect(page).toHaveURL(/\/app\/?$/);
  await expect(page.getByRole("heading", { name: /HOLA/ })).toBeVisible();
  await page.screenshot({
    path: "artifacts/dashboard-desktop.png",
    fullPage: true,
  });
  await page.goto("/app/perfil/");
  await page.getByLabel("Nombre", { exact: true }).fill("Perfil actualizado");
  await page.getByRole("button", { name: "Guardar cambios" }).click();
  await expect(page.getByRole("status")).toContainText(
    "guardaron correctamente",
  );
  await page.reload();
  await expect(page.getByLabel("Nombre", { exact: true })).toHaveValue(
    "Perfil actualizado",
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: "artifacts/perfil-mobile.png",
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBeTruthy();
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/gimnasios/");
  await page.getByRole("searchbox").fill("Concreto");
  await expect(page.locator(".gym-card")).toHaveCount(1);
  await page.getByRole("link", { name: "Ver gimnasio Concreto Club" }).click();
  await page.getByRole("link", { name: "Elegir este acceso" }).click();
  await expect(page).toHaveURL(/\/checkout\/day-demo-01\/?$/, {
    timeout: 20000,
  });
  await expect(
    page.getByRole("heading", { name: "Pase · Concreto Club" }),
  ).toBeVisible();
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Confirmar compra sandbox" }).click();
  await expect(
    page.getByRole("heading", { name: "Tu pase está disponible." }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Ver mis pases" }).click();
  await page.getByRole("button", { name: "Generar QR temporal" }).click();
  await page.getByRole("button", { name: "Generar código de acceso" }).click();
  await expect(page.getByAltText("Código QR temporal de acceso")).toBeVisible();
  await page.getByRole("button", { name: "Cerrar y actualizar saldo" }).click();
  await page.getByRole("button", { name: "Cerrar sesión" }).click();
  await expect(page).toHaveURL(/login/);
  await page.goto("/app/");
  await expect(page).toHaveURL(/login/);
  expect(errors).toEqual([]);
});
test("inicio y registro se ajustan a 320px sin desbordamiento", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });
  for (const route of ["/", "/registro/", "/login/", "/gimnasios/"]) {
    await page.goto(route);
    await expect(page.locator("h1")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
      route,
    ).toBeTruthy();
  }
  await page.goto("/");
  await page.screenshot({
    path: "artifacts/inicio-mobile.png",
    fullPage: false,
    caret: "initial",
  });
  await page.getByRole("button", { name: "Abrir menú" }).click();
  await expect(
    page.getByRole("navigation", { name: "Principal" }),
  ).toBeVisible();
});
