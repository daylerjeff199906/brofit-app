# BROFIT — ya

**Entrena donde quieras.** Monorepo funcional con Next.js, NestJS, Prisma y PostgreSQL. Diseño negro/lima, fuentes locales e imágenes editoriales integradas. Las cuentas se guardan en PostgreSQL; gimnasios, tarifas y pagos del entorno son de prueba.

## Empezar

Requisitos: Node.js 22.14+, pnpm 10.28.2 y Docker Desktop en ejecución.

```powershell
cd D:\FREELANCE\brofit
pnpm install --frozen-lockfile
pnpm run setup
pnpm dev
```

`pnpm run setup` conserva tus archivos de entorno existentes, genera una clave local privada para cifrar el correo, levanta PostgreSQL/Mailpit, genera Prisma, aplica migraciones y carga datos DEMO de manera idempotente. No borra bases de datos.

- Aplicación: **http://localhost:3001**
- API: **http://localhost:4100/api/health**
- Correos locales: **http://localhost:8026**
- OpenAPI: **http://localhost:3001/api/openapi.json**
- PostgreSQL: `localhost:5434`, base/usuario `brofit`, contraseña de desarrollo `brofit_local`.

Usa `localhost:3001` de forma consistente para cookies y Origin. Los puertos se eligieron para no interferir con las aplicaciones existentes del equipo. En Windows, detén la API antes de volver a generar Prisma o aplicar migraciones: el motor nativo puede estar bloqueado por el proceso en ejecución.

## Qué funciona

- Registro con correo y contraseña, verificación por enlace, login, logout y recuperación que revoca sesiones anteriores.
- Google OAuth con PKCE, state y nonce, listo para configurar las credenciales de tu proyecto. Vinculación explícita desde el perfil de una cuenta local existente.
- Catálogo y fichas conectados a PostgreSQL a través de NestJS, búsqueda y filtros, ofertas publicadas y estados de error/carga/vacío.
- Perfil y preferencias persistentes, exportación de datos y eliminación de cuenta.
- Checkout **sandbox**: precios/reglas desde servidor, órdenes idempotentes, pago de prueba confirmado y pase con saldo/vencimiento. No cobra dinero ni pide tarjeta.
- Mis pases: QR temporal real generado con token de servidor y código manual alternativo. Recepción valida el código; los límites diarios y por gimnasio se aplican transaccionalmente. Repetir el canje no consume otra visita.
- Historial de usuario, portal del gimnasio, revisión de cambios, solicitudes de afiliación, administración de gimnasios/ofertas/personal, órdenes, auditoría y liquidaciones sandbox con exportación CSV.

## Primer recorrido

1. Abre `/registro`, crea tu cuenta y consulta el mensaje en Mailpit.
2. Abre su enlace en `localhost:3001`, verifica tu correo e inicia sesión.
3. Explora un gimnasio, elige su acceso y confirma la compra sandbox.
4. En `/app/pases`, elige gimnasio y genera un código de 60 segundos.
5. En otra ventana de navegador, entra como aliado, abre `/partner` y pega el código para validar el ingreso.
6. Revisa el saldo y `/app/actividad`; un código repetido devuelve el ingreso ya registrado.

Para las cuentas locales iniciales `admin@brofit.local` y `aliado@brofit.local`, solicita un enlace desde `/recuperar-clave` y establece una contraseña en Mailpit. **No hay contraseñas predeterminadas.** El aliado inicial pertenece a Concreto Club. La semilla de cuentas elevadas requiere `SEED_DEMO=true` y se rechaza en producción. Los paneles son `/admin` y `/partner`, protegidos también por el backend.

## Configurar Google

En Google Cloud crea un cliente OAuth de tipo **aplicación web**, con:

- Origen autorizado: `http://localhost:3001`.
- URI de redirección exacta: `http://localhost:3001/api/auth/google/callback`.
- Pantalla de consentimiento configurada y cuentas de prueba autorizadas mientras esté en modo testing.

Configura en `apps/api/.env` y reinicia NestJS:

```dotenv
GOOGLE_CLIENT_ID=tu-client-id
GOOGLE_CLIENT_SECRET=tu-client-secret
```

Sin esas credenciales, el botón se muestra deshabilitado con una explicación. El callback tiene una prueba de regresión con proveedor simulado; no se afirma que el login real de Google esté activado sin configurar tu proyecto.

## Configurar correo real

Mailpit es un servidor SMTP real para desarrollo: recibe los mensajes y los muestra localmente, pero no los entrega a buzones externos. Para entrega externa reemplaza `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD` y `MAIL_FROM` en `apps/api/.env` por los valores de tu proveedor. Configura el remitente y los registros de dominio que exija ese proveedor. Ninguna clave SMTP u OAuth va al frontend ni al repositorio.

Plantillas de entorno: `apps/api/.env.example` y `apps/web/.env.example`. Mantén `MAIL_ENCRYPTION_KEY` estable para poder descifrar mensajes pendientes. No uses estas credenciales locales de PostgreSQL fuera del equipo.

## Comandos

```powershell
pnpm dev:web
pnpm dev:api
pnpm build
pnpm --filter @brofit/api start
pnpm --filter @brofit/web start
pnpm typecheck
pnpm lint
pnpm test
pnpm test:integration
pnpm exec playwright install chromium
pnpm test:browser
pnpm format:check
```

Las pruebas de integración necesitan PostgreSQL, Mailpit y las semillas (`pnpm run setup`). Lanzan una API aislada en puerto 4101 con namespace propio para throttle y prueban operaciones contra la base local. Crean usuarios de prueba, anonimizan sus compras al eliminarlos y dejan las fichas de QA pausadas. Pueden generar nuevos correos; para entrar como admin/aliado después de las pruebas, pide otro enlace de recuperación. Las pruebas del navegador requieren web/API en ejecución y usan perfiles Chromium separados de tu navegador habitual.

## Todo dentro de Docker

Después de `pnpm run setup`, detén los procesos locales que ocupen 3001/4100:

```powershell
docker compose -f infra/compose.yaml --profile full up --build -d
```

El perfil `full` añade web y API. El comando sin perfil levanta solo PostgreSQL y Mailpit. Esta composición está preparada para desarrollo local y datos DEMO; no es una receta de producción con secretos, TLS, backups o servicios gestionados. Consulta el [estado de entrega y verificación](docs/STATUS.md).

## Estructura

```text
apps/web/        Next.js App Router: público, cuenta, aliado y administración
apps/api/        NestJS: autenticación, catálogo, correo y comercio sandbox
  prisma/        Modelo relacional, migraciones versionadas y semillas
packages/ui/     Componentes y tokens compartidos
packages/types/  Contratos de catálogo
packages/config/ TypeScript estricto compartido
infra/           Compose, PostgreSQL, Mailpit y Dockerfiles
scripts/         Setup y ejecución de integración
tests/           Seguridad, catálogo, OAuth, integración y Playwright
docs/            Especificaciones y documentación de operación
```

## Despliegue y límites

La aplicación ahora requiere **servidor Next.js, servidor NestJS y PostgreSQL**. La publicación anterior de Sites se conserva como maqueta estática; no está conectada a la base de datos de tu equipo. Se retiró la configuración de exportación estática para evitar publicar una copia que parezca funcional sin backend. El identificador de Site se conserva para trazabilidad.

Para producción faltan credenciales Google/SMTP, proveedor de cobros real con webhook verificado, gimnasio/fotos/ofertas autorizadas, políticas comerciales y de datos, hosting compatible con Node/PostgreSQL, TLS, backups y monitoreo. No se han realizado cobros reales. El mapa continúa siendo una referencia visual porque no existen coordenadas de establecimientos verificados. La recepción usa el código manual alternativo al QR; no se integra una cámara en esta base.

Contratos: [API](docs/API.md). Controles y alcance de auditoría: [Seguridad](docs/SECURITY.md). El historial de maquetas en `docs/MOCKUPS.md` y `docs/DELIVERY.md` describe entregas anteriores, no el estado funcional actual.

## Assets

`athlete-editorial.png` fue generado con ImageGen para BROFIT y no representa una usuaria o afiliada real. Las fotos de ambiente locales provienen de Unsplash bajo su licencia: photo-1534438327276-14e5300c3a48, photo-1517836357463-d25dfeac3438 y photo-1571902943202-507ec2618e8f. Fuentes locales Archivo, Barlow Condensed, Space Grotesk e IBM Plex Mono vía @fontsource con sus licencias. El isotipo B+mancuerna sigue siendo conceptual.
