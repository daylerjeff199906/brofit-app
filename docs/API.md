# API BROFIT

Base local: `http://localhost:4100/api`. La web usa `/api` en su propio origen y Next.js lo redirige internamente a NestJS. Contrato OpenAPI: `http://localhost:3001/api/openapi.json`.

Todas las escrituras requieren `Origin` igual al origen de `WEB_BASE_URL`. La cookie de sesión es HttpOnly; el navegador la adjunta automáticamente. Registro público nunca acepta roles. JSON máximo 16 KiB. Errores uniformes: `{ "error": { "code": "...", "message": "...", "details": {} } }`; `details` solo aparece en validación. 401 sesión, 403 permiso/elegibilidad/origen, 409 conflicto, 422 validación, 429 límite.

## Cuenta y acceso

- `POST /auth/register`: `{ name, lastName, email, password }`, contraseña de 12–128 caracteres. Respuesta genérica y correo de verificación.
- `POST /auth/verify-email`: `{ token }`. Token de un solo uso que llega en el fragmento del enlace del correo; nunca en un GET que modifique datos.
- `POST /auth/login`: `{ email, password }`. Solo cuenta verificada. Cookie de 7 días.
- `GET /auth/me`, `POST /auth/logout`.
- `POST /auth/resend-verification`, `POST /auth/forgot-password`: `{ email }`, respuesta genérica.
- `POST /auth/reset-password`: `{ token, password }`, revoca todas las sesiones.
- `GET /auth/google/start`; para vincular desde una sesión existente: `?link=1`.
- `GET /auth/google/callback`: state, PKCE y nonce validados. Una cuenta local con el mismo email requiere vinculación explícita desde el perfil.
- `PATCH /me/profile`: subconjunto de `{ name, lastName, phone, nearby, newsletter }`; no permite cambiar email/rol/gimnasio.
- `GET /me/export`, `DELETE /me/account` con `{ password }`.
- `POST /me/partner-application`: `{ gymName, district, message }`, requiere sesión. Actualiza una solicitud por cuenta.

## Catálogo

- `GET /gyms`: `q`, `district`, `category`, `equipment`, `service`, `maxPrice`, `page`, `pageSize` (máximo 100). Devuelve `data` y `pagination`.
- `GET /gyms/:slug`: solo fichas activas.
- `GET /offers`: ofertas publicadas, filtro opcional `gymId`.

## Compra y acceso sandbox

- `POST /orders`: `{ offerId, gymId? }` con `Idempotency-Key` de 16–100 caracteres, generado una vez por intención y reutilizado en los reintentos. DAY_PASS requiere gimnasio elegible. El servidor captura precio, visitas, reglas y elegibilidad; nunca acepta precio del cliente. Misma clave y distinto payload: 409.
- `GET /orders/:id`: solo titular.
- `POST /orders/:id/confirm-sandbox`: `{ sandboxConsent: true }`. Nunca cobra dinero ni recibe tarjetas. La confirmación es idempotente y emite un pase único. Una oferta retirada impide confirmar órdenes pendientes.
- `GET /me/passes`, `GET /me/activity`.
- `POST /me/check-in-tokens`: `{ passId, gymId }`, código opaco de 60 segundos. Emitir otro invalida los códigos pendientes anteriores de ese pase.
- `POST /partner/check-ins/redeem`: `{ token, gymId }`, solo personal asignado o administrador. Comprueba vigencia, saldo, gimnasio, límite diario de Lima y límite por gimnasio. Canje y ledger en la misma transacción. Repetir el mismo código devuelve el comprobante existente sin descontar otra visita.

## Aliado y administración

- `GET /partner/gym`, `PATCH /partner/gym/:id`: solo gimnasio asignado. Campos editables: nombre, descripción, horarios, equipos y servicios. Los cambios del aliado pasan a PENDING para revisión.
- `GET /partner/check-ins`: ingresos/liquidación del gimnasio asignado, sin emails de clientes.
- Administración exige PLATFORM_ADMIN en cada endpoint.
- `GET/POST /admin/gyms`, `PATCH /admin/gyms/:id`: crear ficha DEMO y aprobar, pausar o revisar. POST exige nombre, slug, distrito, dirección, categoría, descripción, horarios, arrays equipment/services e imagen local `/images/...`.
- `GET/POST /admin/offers`, `PATCH /admin/offers/:id`: crear/publicar/retirar y ajustar tarifas. POST exige `{ name, description, kind, priceCents, visits, validityDays, maxPerDay, maxPerGym, conditions, gymIds }`. DAY_PASS siempre tiene una visita y un gimnasio. PATCH permite active, priceCents, visits y validityDays, preservando esa regla.
- `GET /admin/applications`: solicitudes verificables de aliados.
- `POST /admin/staff`: `{ email, gymId }`, cuenta previamente verificada; no permite convertir un administrador. Cambiar asignación invalida sesiones del aliado.
- `GET /admin/transactions`, `/admin/settlements`, `/admin/audit`: hasta 100 registros por pantalla en esta base local. El catálogo público sí pagina; se deberá extender paginación administrativa antes de operar a mayor escala.

Los correos y solicitudes no garantizan una afiliación comercial. Los datos comerciales requieren revisión antes de activar un gimnasio real.
