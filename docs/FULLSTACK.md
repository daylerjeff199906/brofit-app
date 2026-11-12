# Base funcional local

## Alcance y contrato

Next.js con servidor en `http://localhost:3001`; NestJS en `http://localhost:4100/api`; PostgreSQL dedicado en puerto 5434; Mailpit dedicado en SMTP 1026 y bandeja 8026. Se conservan las imágenes y el diseño actual. La publicación estática anterior sigue siendo la maqueta; no representa el nuevo servidor ni su base de datos local.

Entregas verificables: (1) migración y catálogo persistente; (2) registro, verificación, sesión y recuperación por correo; (3) cuenta y perfil conectados; (4) órdenes sandbox, pases y canje transaccional; (5) paneles de aliado/administrador y recorrido de integración.

## Límites de confianza

Entradas HTTP son no confiables: Zod estricto, límites de tamaño y de solicitudes. Ningún rol, precio o saldo proviene del navegador. Sesiones opacas se guardan con hash en PostgreSQL y cookie HttpOnly; no se usa localStorage. Se exige Origin autorizado en escrituras. Contraseñas scrypt con sal aleatoria. Tokens de correo con hash, TTL y consumo atómico; recuperación revoca sesiones. Bandeja de salida cifrada para no guardar enlaces de acceso sin protección en PostgreSQL.

Todos los establecimientos/ofertas de semilla son DEMO. El único proveedor habilitado es sandbox y requiere confirmación explícita del usuario, sin tarjeta ni dinero real. Cada emisión y canje deja auditoría. La elegibilidad, los límites diarios/por gimnasio y el saldo se comprueban en una transacción serializable con reintento acotado. Idempotencia por usuario y clave de intención, rechaza payload distinto.

## Correos

Mailpit recibe mensajes locales reales por SMTP, visibles en su bandeja. Enviar a destinatarios externos requiere configurar SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASSWORD y MAIL_FROM del proveedor elegido. Google OAuth no forma parte del login por correo y contraseña; necesita un proyecto OAuth y credenciales independientes.

## Datos y operación

Se recopilan nombre, apellidos y correo para cuenta/acceso; teléfono es opcional. No se registra PII ni tokens en logs. Sesiones y tokens tienen TTL. Hay exportación y eliminación de cuenta sin operaciones comerciales reales; órdenes sandbox se anonimizan al borrar la cuenta. Las copias de seguridad de producción requerirán una política de retención definida por el operador.
