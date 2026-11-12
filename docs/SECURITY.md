# Controles y revisión

Sesiones opacas de 256 bits con hash SHA-256 en PostgreSQL, cookie HttpOnly/SameSite=Lax y Secure en producción, TTL absoluto de siete días. Una versión de credenciales impide que un login iniciado antes de un cambio de contraseña cree una sesión válida después. Contraseñas nuevas: scrypt N=131072, r=8, p=1, sal de 128 bits y clave de 64 bytes. Se admite el formato anterior de hashes locales para no invalidar las primeras cuentas de prueba.

Correo: enlaces aleatorios con hash en DB, vencimiento de 30 minutos y consumo transaccional. Los enlaces llevan el token en el fragmento; el cliente lo elimina de la URL y lo envía por POST. La bandeja de salida se cifra con AES-256-GCM y borra su payload tras el envío. El worker usa leases para evitar que dos instancias envíen el mismo job a la vez, con reintento acotado. SMTP entrega al menos una vez; ante una caída exacta después de enviar puede duplicarse un mensaje, pero su token solo se consume una vez.

Google: state aleatorio vinculado a cookie, PKCE S256, nonce y validación del ID token por google-auth-library. No se enlaza automáticamente una cuenta local preexistente. Prueba de regresión del callback con proveedor externo simulado; el flujo real de Google requiere credenciales y no se afirma probado sin ellas.

Solicitudes: schemas estrictos, payload de 16 KiB, Origin exacto obligatorio en escrituras, cabeceras Helmet y CSP con nonce en Next. Contraseñas, cookies y tokens no se imprimen. Logging de URL entrante de Next desactivado. Throttle persistente por origen de red y cuenta; normaliza mayúsculas de rutas para que Express no permita eludirlo. El proxy local hace que varias visitas compartan IP; antes de un despliegue distribuido se debe definir explícitamente qué proxies son confiables, sin aceptar X-Forwarded-For arbitrario.

Canjes: transacciones serializables y reintentos acotados de conflictos; confirmación bloquea la fila de orden. Restricciones únicas de pago/pase/ingreso/ledger, saldos actualizados en la transacción. La autorización se aplica en backend por titular, rol y gimnasio; ningún permiso depende del estado de React.

Retención local: sesiones siete días, tokens de correo 30 minutos (limpieza tras un día), state OAuth diez minutos, jobs enviados siete días y solicitudes de aliado 180 días desde su actualización. Exportación y eliminación de cuenta disponibles; operaciones sandbox quedan sin el identificador de titular. Mailpit contiene mensajes de prueba: su bandeja tiene acceso solo loopback. Antes de producción deben fijarse políticas de backups, retención contable y atención de datos personales con el operador.

## Dependencias

Auditoría nativa ejecutada con el lockfile. Se actualizó Nodemailer a 10.5.0 y Prisma/Client a 6.19.3. No se ejecutó una corrección automática forzada ni se aprobaron scripts de instalación en bloque. `onlyBuiltDependencies: []` bloquea postinstall; la generación Prisma se ejecuta explícitamente durante setup/build.

Quedan dos advisories en herramientas, no expuestos por handlers HTTP:

- `deepmerge-ts` 7.1.5, GHSA-ggr8-5vv4-36mx (alto), depende de `prisma > @prisma/config`. Requiere fusionar grafos de objetos recursivos; la configuración local de migración es del repositorio confiable, no de usuarios. La corrección publicada exige 8.x; no se fuerza una versión mayor transitoria contra el contrato de Prisma.
- `minimatch` 10.2.6, GHSA-g3hv-75wg-m249 (moderado), usado por typescript-eslint para archivos del repositorio, no por peticiones o patrones del usuario.

Revisar esas dependencias el 11 de diciembre de 2026 o al actualizar Prisma/ESLint, lo que ocurra primero. Esto no equivale a una auditoría externa de producción.
