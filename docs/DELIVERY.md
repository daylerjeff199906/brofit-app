# Entrega de la iteración 1

Se implementó la primera iteración del BUILD_PROMPT: monorepo, branding, componentes compartidos, homepage, catálogo, cuatro fichas, planes, funcionamiento y propuesta para aliados. La API NestJS solo ofrece `/health`; no se implementaron las iteraciones de comercio ni acceso.

## Validación

- Compilación de Next.js con las nueve rutas públicas de contenido.
- TypeScript estricto en web y API.
- ESLint y formato Prettier.
- Cinco pruebas automatizadas del catálogo: combinación de filtros, búsqueda sin tildes, estado vacío, orden sin mutación y consistencia DEMO.
- Las nueve rutas públicas respondieron HTTP 200 con la marca; `/health` respondió `status: ok` y `commerceEnabled: false`.
- Verificación visual pendiente: el navegador integrado de Codex no pudo adjuntar su vista previa. No se obtuvieron capturas desktop/móvil ni se ejecutaron pruebas E2E de navegador. Los estilos incluyen variantes desde 320 px y reducción de movimiento, pero esa cobertura responsive requiere revisión visual.

## Variables e integraciones

El frontend no requiere variables ni servicios externos. `.env.example` documenta la configuración futura; no hay secretos reales. PostgreSQL local queda definido en `infra/compose.yaml`. Prisma incluye configuración sin modelos ni migraciones; pnpm bloquea sus postinstall por defecto. Al comenzar la iteración 2, habilitar únicamente los scripts de Prisma requeridos y generar el cliente tras definir los modelos.

La fotografía referencial está alojada localmente y rotulada DEMO. El isotipo es conceptual. El mapa, disponibilidad real, autenticación, pagos, pases, QR, paneles privados y captura de solicitudes quedan pendientes. Ningún botón indica una transacción o registro inexistente como completado.

La copia alojada es privada y sirve la exportación estática del frontend. La API y PostgreSQL requieren despliegue independiente para la siguiente etapa. El código y los comandos están documentados en el README principal.
