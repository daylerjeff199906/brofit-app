# BROFIT — ya | Prompt maestro para iniciar el desarrollo

> Copia este documento como instrucciones iniciales en Codex, Cursor, Claude Code u otro asistente de programación.  
> **REQUISITO:** antes de escribir código, leer íntegramente [`PROJECT.md`](./PROJECT.md) y [`DESIGN.md`](./DESIGN.md). No ignorar sus reglas de negocio ni visuales.

---

## Rol

Actúa como un equipo senior integrado por Product Designer, UX Engineer, Tech Lead Full Stack y QA Engineer. Tu tarea es **crear la primera versión funcional, responsive y mantenible de BROFIT — ya**, una plataforma de acceso a gimnasios afiliados mediante pases individuales y membresías multigimnasio.

### Identidad obligatoria

- Nombre: **BROFIT — ya**.
- Eslogan: **Entrena donde quieras.**
- Estilo: **brutalismo digital moderno**, fondo negro, acentos lima eléctrico y fotografía deportiva con alto contraste.
- Isotipo propuesto: **B geométrica + mancuerna**; wordmark BROFIT con `— ya` como firma visual.
- Colores canónicos: lima `#C9FF3F`, negro `#0B0B0B`, crema `#F5F2E8`, blanco `#FFFFFF`.
- Tipos: Archivo (display), Space Grotesk (interfaz), IBM Plex Mono (etiquetas).
- Sin gradientes, sin sombras decorativas, sin glassmorphism.
- Los diseños deben seguir **exactamente `DESIGN.md`**, no una landing de gimnasio convencional.

## Producto y stack

Usa la arquitectura del archivo `PROJECT.md`:

- Monorepo `pnpm` + Turborepo.
- `apps/web`: Next.js App Router, React, TypeScript, Tailwind CSS.
- `apps/api`: NestJS, TypeScript, Prisma y PostgreSQL.
- `packages/ui`: componentes reutilizables y tokens visuales.
- `packages/types`: tipos o contratos compartidos.
- Docker Compose para servicios locales.

Los permisos por rol y reglas de negocio viven en backend. La API es fuente de verdad para precios, saldos, cobros y validación de entradas.

## Orden de trabajo obligatorio

### Iteración 1: Fundaciones + identidad visual

1. Estructura el monorepo y configura TypeScript estricto, formato, lint y variables de entorno documentadas.
2. Implementa los tokens de `DESIGN.md` en CSS/Tailwind sin desviaciones.
3. Desarrolla en `packages/ui`: Button, Input, FilterChip, GymCard, PlanCard, Badge, EmptyState, Modal y navbar responsive.
4. Genera un **placeholder vectorial geométrico** del isotipo B+mancuerna como componente SVG propio mientras se aprueba el logo final.
5. Construye homepage con hero fotográfico (asset local autorizado o placeholder marcado como DEMO), dos CTA, beneficios, exploración, planes, sección para aliados y preguntas frecuentes.
6. Optimiza el hero desktop y móvil; no usar una misma composición recortada de manera ilegible.
7. Prepara páginas `/gimnasios`, `/gimnasios/[slug]`, `/planes` y `/como-funciona` con datos DEMO centralizados.
8. Asegura que todo se vea coherente desde 320 px hasta desktop y que la navegación funcione.

**Entregable de la iteración 1:** un frontend visual real y navegable. No simular que pagos, QR o reservas están conectados si aún no lo están.

### Iteración 2: Backend y operaciones básicas

1. Define esquemas Prisma de usuarios, roles, gimnasios, fotos, equipamientos, ofertas, órdenes, pagos, pases, membresías, visitas, liquidaciones y logs de auditoría.
2. Crea migraciones, semillas de DEMO y documentación de endpoints (OpenAPI).
3. Implementa autenticación segura y controles de acceso por usuario/rol/gimnasio.
4. Habilita CRUD de gimnasios, equipamientos y ofertas con validaciones.
5. Conecta los listados públicos del frontend con la API real y estados de loading/empty/error.
6. Agrega un panel básico de aliado y un panel mínimo de administración.

### Iteración 3: Compra y pases

1. Diseña el contrato de integración de pagos con un proveedor intercambiable.
2. Usa modo sandbox o MOCK explícito en local; no cobrar dinero real sin autorización y credenciales válidas.
3. Crea orden de compra y calcula precio siempre desde servidor.
4. Confirma el pago a partir de webhook verificado o integración sandbox equivalente.
5. Emite pase individual o membresía con cupo y vencimiento.
6. Implementa «Mis pases», historial y estados adecuados.

### Iteración 4: Validación de ingresos

1. Emitir QR con token corto, temporal y verificable en servidor.
2. Validar elegibilidad por gimnasio, saldo, fecha y estado.
3. Impedir doble canje y carreras concurrentes con una operación transaccional/idempotente.
4. Registrar check-in, actualizar cupo y generar entrada de conciliación.
5. Construir panel de recepción para validar QR o ingresar un código manual alternativo.
6. Probar QR expirado, repetido, inválido, sin saldo y gimnasio no elegible.

### Iteración 5: Calidad y preparación del piloto

1. Pruebas unitarias de negocio y E2E del recorrido exploración → compra (sandbox) → emisión → ingreso.
2. Auditoría básica de accesibilidad (teclado, contraste, labels, estados).
3. Ajustes responsive, lazy load, optimización de imágenes y tiempos de carga.
4. Documentación de instalación, despliegue, backups y limitaciones conocidas.
5. Diferenciar contenido DEMO de real en todas las superficies.

---

## Restricciones críticas

- **No inventes** establecimientos afiliados, testimonios, descuentos, ratings, número de descargas ni métricas.
- Los ejemplos DEMO son válidos solo si quedan marcados explícitamente y separados de producción.
- **No** uses «acceso ilimitado» sin una regla comercial real.
- No conviertas el producto en una app de entrenamientos o en el sitio de una sola cadena.
- No generes un QR decorativo que parezca un pase válido.
- No coloques claves ni secretos reales en el repositorio.
- El usuario debe poder buscar gimnasios sin habilitar localización precisa.
- No uses el contenido de la imagen de referencia como fuente de cifras, ubicaciones, ofertas ni testimonios reales.
- No sustituyas una implementación funcional con una sola captura de pantalla.
- Si una integración requiere credenciales externas, crea el contrato, modo sandbox y documentación; describe lo que falta conectar.
- Antes de usar la marca comercialmente, debe verificarse la disponibilidad marcaria en Perú.

## Calidad de experiencia

- Foco y etiquetas accesibles; botones táctiles de mínimo 44 px.
- CTA principal fácil de localizar en cualquier pantalla.
- Consulta de precio, vigencia y restricciones antes de pagar.
- Loading, error, empty, success y disabled para cada flujo clave.
- Feedback claro en registro, pago, acceso y QR.
- No usar sombras, gradientes ni efectos innecesarios para reemplazar jerarquía visual.
- Componentes compartidos: no duplicar estilos ni lógica entre páginas.

## Qué entregar en cada iteración

Incluye:

1. Resumen de funcionalidades realmente implementadas.
2. Árbol de archivos nuevos/modificados.
3. Comandos exactos para ejecutar web/API y pruebas.
4. Variables de entorno necesarias **sin secretos**.
5. Capturas o renderizados visuales de desktop y móvil cuando sea posible.
6. Pruebas realizadas y resultados.
7. Limitaciones pendientes, expresadas claramente.

## Primer mensaje de ejecución sugerido

> Lee `docs/PROJECT.md` y `docs/DESIGN.md`. Implementa solo la **Iteración 1** de `docs/BUILD_PROMPT.md`. Crea el monorepo, el sistema de diseño BROFIT — ya y una homepage responsive moderna de brutalismo oscuro con lima eléctrico, además del catálogo y detalle de gimnasio con datos DEMO rotulados. Prioriza la calidad visual y la usabilidad; incluye comandos para arrancar el proyecto. No implementes pagos ficticios como si fueran reales.
