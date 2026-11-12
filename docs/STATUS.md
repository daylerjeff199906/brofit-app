# Estado de entrega funcional

Entrega local del 11 de noviembre de 2026 (America/Lima). Sustituye el estado de las maquetas estáticas anteriores.

## Aplicación

- Monorepo Next.js + NestJS + Prisma/PostgreSQL, migraciones y semillas idempotentes.
- Registro, verificación, sesiones y recuperación por correo; perfil, exportación y eliminación de cuenta.
- Catálogo, checkout sandbox, pases, QR temporal, recepción con código manual, historial y administración.
- Diseño adaptable con las referencias negro/lima e imágenes locales.
- Google implementado y desactivado hasta configurar sus credenciales, por decisión del usuario.
- SMTP local mediante Mailpit; el envío externo requiere configurar un proveedor SMTP.

## Operación local

Web: http://localhost:3001. API: http://localhost:4100/api/health. Bandeja de pruebas: http://localhost:8026.

`pnpm run setup` se ejecutó correctamente: conserva archivos existentes, levanta los servicios, genera Prisma, aplica migraciones y carga semillas. No hay contraseñas de administración predeterminadas; solicita recuperación para `admin@brofit.local` o `aliado@brofit.local` y abre su enlace en Mailpit.

## Verificación

- Instalación con lockfile congelado, compilación de Next.js/NestJS, lint y formato comprobados.
- Nueve pruebas de catálogo, seguridad y callback OAuth aprobadas. El proveedor Google se simula en la regresión; no se ha iniciado sesión contra Google real.
- Tres pruebas de integración aprobadas contra PostgreSQL y SMTP reales: administración, flujo completo con canje concurrente y límites de autenticación.
- Tres pruebas Playwright aprobadas tanto en los servidores locales como en Docker: registro/verificación/login/compra/pase, vista móvil a 320px y recuperación de contraseña. La ejecución final en contenedores terminó en 31,9 segundos.
- Las imágenes Docker de web y API se construyeron correctamente. El perfil `full` quedó en ejecución con los cuatro servicios locales. Web y proxy `/api/health/` devolvieron HTTP 200; la API confirmó la conexión PostgreSQL.

Los correos se procesan mediante una cola con reintentos. Las pruebas esperan hasta 30 segundos para contemplar el primer reintento SMTP. La prueba de rate limit contempla el cambio de ventana fija sin modificar los límites del servidor.

La publicación anterior de Sites sigue siendo una maqueta estática. Esta entrega utiliza servidores locales y PostgreSQL; no se desplegó en producción. Cobros, ofertas y gimnasios son de prueba. Ver [README](../README.md), [API](API.md) y [seguridad](SECURITY.md) para configuración y límites.
