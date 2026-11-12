type Method = "get" | "post" | "patch" | "delete";
const routes: [Method, string, string, boolean][] = [
  ["get", "/health", "Estado de API y PostgreSQL", false],
  ["get", "/auth/config", "Proveedores habilitados", false],
  ["post", "/auth/register", "Registro con correo y contraseña", false],
  ["post", "/auth/login", "Crear sesión HttpOnly", false],
  ["get", "/auth/me", "Cuenta de la sesión", true],
  ["post", "/auth/logout", "Cerrar sesión", true],
  ["post", "/auth/verify-email", "Consumir enlace de verificación", false],
  ["post", "/auth/resend-verification", "Solicitar otro enlace", false],
  ["post", "/auth/forgot-password", "Solicitar recuperación", false],
  [
    "post",
    "/auth/reset-password",
    "Cambiar contraseña y revocar sesiones",
    false,
  ],
  ["get", "/auth/google/start", "Iniciar OAuth con Google", false],
  [
    "get",
    "/auth/google/callback",
    "Callback OAuth con state PKCE y nonce",
    false,
  ],
  [
    "get",
    "/gyms",
    "Catálogo paginado; q, district, category, equipment, service, maxPrice",
    false,
  ],
  ["get", "/gyms/{slug}", "Ficha pública", false],
  ["get", "/offers", "Ofertas publicadas; filtro gymId", false],
  ["patch", "/me/profile", "Actualizar datos y preferencias", true],
  ["get", "/me/passes", "Pases y saldo", true],
  ["get", "/me/activity", "Ingresos del titular", true],
  ["get", "/me/export", "Exportar datos de cuenta", true],
  ["delete", "/me/account", "Eliminar cuenta y anonimizar sandbox", true],
  ["post", "/me/partner-application", "Solicitud de afiliación", true],
  ["post", "/me/check-in-tokens", "Crear token opaco de 60 segundos", true],
  ["post", "/orders", "Orden con precio y reglas en servidor", true],
  ["get", "/orders/{id}", "Orden del titular", true],
  [
    "post",
    "/orders/{id}/confirm-sandbox",
    "Confirmar sin dinero real; operación idempotente",
    true,
  ],
  ["get", "/partner/gym", "Gimnasio asignado; requiere rol aliado", true],
  ["patch", "/partner/gym/{id}", "Cambiar ficha y enviarla a revisión", true],
  ["get", "/partner/check-ins", "Ingresos del gimnasio asignado", true],
  [
    "post",
    "/partner/check-ins/redeem",
    "Canje atómico e idempotente por token",
    true,
  ],
  ["get", "/admin/gyms", "Gimnasios; solo PLATFORM_ADMIN", true],
  ["post", "/admin/gyms", "Crear ficha DEMO pendiente", true],
  ["patch", "/admin/gyms/{id}", "Editar, aprobar o pausar", true],
  ["get", "/admin/offers", "Ofertas de administración", true],
  ["post", "/admin/offers", "Crear oferta sandbox", true],
  ["patch", "/admin/offers/{id}", "Actualizar o retirar oferta", true],
  ["get", "/admin/applications", "Solicitudes de aliados", true],
  ["post", "/admin/staff", "Asignar personal a un gimnasio", true],
  ["get", "/admin/transactions", "Órdenes sandbox", true],
  ["get", "/admin/settlements", "Liquidaciones de prueba", true],
  ["get", "/admin/audit", "Auditoría sin contraseñas ni tokens", true],
];
const string = { type: "string" };
const bodySchemas: Record<string, Record<string, unknown>> = {
  "/auth/register": {
    name: string,
    lastName: string,
    email: { type: "string", format: "email" },
    password: { type: "string", minLength: 12, maxLength: 128 },
  },
  "/auth/login": {
    email: { type: "string", format: "email" },
    password: string,
  },
  "/auth/verify-email": {
    token: { type: "string", pattern: "^[a-f0-9]{64}$" },
  },
  "/auth/reset-password": {
    token: string,
    password: { type: "string", minLength: 12, maxLength: 128 },
  },
  "/auth/forgot-password": { email: { type: "string", format: "email" } },
  "/auth/resend-verification": { email: { type: "string", format: "email" } },
  "/me/check-in-tokens": { passId: string, gymId: string },
  "/partner/check-ins/redeem": { token: string, gymId: string },
  "/orders": {
    offerId: string,
    gymId: { type: "string", description: "Obligatorio para DAY_PASS" },
  },
  "/orders/{id}/confirm-sandbox": { sandboxConsent: { const: true } },
  "/me/account": { password: string },
  "/me/partner-application": {
    gymName: string,
    district: string,
    message: string,
  },
  "/admin/staff": { email: { type: "string", format: "email" }, gymId: string },
};
export function openApi() {
  const paths: Record<string, Record<string, unknown>> = {};
  for (const [method, path, summary, privateRoute] of routes) {
    const parameters: unknown[] = [...path.matchAll(/\{(\w+)\}/g)].map((m) => ({
      name: m[1],
      in: "path",
      required: true,
      schema: { type: "string" },
    }));
    if (method === "post" && path === "/orders")
      parameters.push({
        name: "Idempotency-Key",
        in: "header",
        required: true,
        schema: { type: "string", minLength: 16, maxLength: 100 },
      });
    if (path === "/gyms")
      for (const name of [
        "q",
        "district",
        "category",
        "equipment",
        "service",
        "maxPrice",
        "page",
        "pageSize",
      ])
        parameters.push({ name, in: "query", schema: { type: "string" } });
    const properties = bodySchemas[path];
    paths[path] = {
      ...paths[path],
      [method]: {
        summary,
        security: privateRoute ? [{ sessionCookie: [] }] : [],
        parameters,
        ...(properties
          ? {
              requestBody: {
                required: true,
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      additionalProperties: false,
                      properties,
                      required: Object.keys(properties).filter(
                        (k) => !(path === "/orders" && k === "gymId"),
                      ),
                    },
                  },
                },
              },
            }
          : {}),
        responses: {
          "200": {
            description: "Operación correcta; POST puede responder 201",
          },
          "201": { description: "Recurso creado o confirmación idempotente" },
          "401": { description: "Sesión inválida" },
          "403": { description: "Permiso, Origin o elegibilidad rechazados" },
          "409": { description: "Conflicto de intención o estado" },
          "422": { description: "Validación rechazada" },
          "429": { description: "Límite de intentos" },
        },
      },
    };
  }
  return {
    openapi: "3.1.0",
    info: {
      title: "BROFIT API",
      version: "0.2.0",
      description:
        "Todas las escrituras requieren Origin igual a WEB_BASE_URL. Comercio exclusivamente sandbox. Para formularios administrativos completos ver docs/API.md.",
    },
    servers: [{ url: "/api" }],
    components: {
      securitySchemes: {
        sessionCookie: { type: "apiKey", in: "cookie", name: "brofit_session" },
      },
    },
    paths,
  };
}
