# BROFIT — ya

Entrena donde quieras.

Actualización de maquetas: ver [docs/MOCKUPS.md](docs/MOCKUPS.md). Incluye registro, login, recuperación por pasos, mi espacio, perfil, pases y actividad en modo DEMO, además de la adaptación de las pantallas públicas a las referencias visuales. Los formularios validan datos de prueba sin crear cuentas ni persistir contraseñas.

Primera entrega: frontend navegable de descubrimiento de gimnasios, siguiendo `docs/PROJECT.md`, `docs/DESIGN.md` y la iteración 1 de `docs/BUILD_PROMPT.md`.

## Stack y decisión

Next.js App Router + React + TypeScript estricto + Tailwind 4; pnpm + Turborepo. Next.js permite mantener landing, catálogo público y futuras superficies privadas en una aplicación. NestJS queda separado para la futura autoridad de precios, permisos, pagos y canjes. Vite sería apropiado para una SPA; Astro sería una alternativa para una web centrada en contenido.

## Arranque

Requisitos: Node.js 22.14+ y pnpm 10.28.2 (el campo packageManager fija la versión).

```powershell
cd D:\FREELANCE\brofit
pnpm install
pnpm dev:web
```

Web: http://localhost:3000. No necesita variables, API ni base de datos para explorar la demo. Fuentes e imágenes se sirven localmente.

```powershell
pnpm dev:api
# API de fundación: http://localhost:4000/health
docker compose -f infra/compose.yaml up -d
```

La API solo expone `/health`. PostgreSQL y Prisma están preparados para la siguiente etapa; aún no hay modelos, migraciones ni autenticación. Copia `.env.example` a `.env` para configurar servicios futuros; no contiene credenciales comerciales. La contraseña de PostgreSQL es exclusivamente de desarrollo local. Prisma lee `.env` desde `apps/api` o su directorio de esquema; coloca allí DATABASE_URL cuando se añadan modelos. Para NestJS usa variables del proceso al iniciar.

## Verificación

```powershell
pnpm typecheck
pnpm build
pnpm lint
pnpm test
pnpm format:check
```

`pnpm build` compila web/API. La web genera una exportación estática en `apps/web/out`; al implementar sesiones/SSR se deberá quitar `output: 'export'` de Next y usar un despliegue con servidor.

## Funcionalidad entregada

- Inicio con hero, buscador, gimnasios, beneficios, recorrido, planes, aliados y preguntas frecuentes.
- Catálogo con búsqueda y filtros combinables por distrito, precio, entrenamiento, equipamiento y servicios, orden y estado vacío.
- Cuatro fichas sintéticas con equipamiento, horarios, servicios y condiciones.
- Planes comparables y condiciones en diálogo nativo con foco modal y cierre con Escape.
- Páginas de funcionamiento y aliados, navegación móvil, carga/error/404, foco visible y movimiento reducido.
- Marca vectorial conceptual B + mancuerna; fuentes locales Archivo, Space Grotesk e IBM Plex Mono.

## Estructura

```text
apps/web/src/app/          Rutas y estilos responsive
apps/web/src/components/   Navegación y experiencias interactivas
apps/web/src/lib/demo.ts   Única fuente de contenido sintético
apps/web/public/           Fotografía referencial y favicon
apps/api/                 NestJS: health; configuración Prisma
packages/ui/              Componentes compartidos y tokens
packages/types/           Contratos Gym/Plan
packages/config/          TypeScript estricto compartido
infra/compose.yaml        PostgreSQL local
docs/                     Especificaciones originales y estado de entrega
```

## Límites reales

No hay afiliaciones, compras, autenticación, mapas operativos, pases, reservas, QR ni persistencia. Los botones relacionados comunican esta limitación. No se recopilan solicitudes de aliados. La web no consulta la API en esta etapa. La membresía y todos los precios, lugares, direcciones y horarios son DEMO. No se muestran métricas, reseñas ni distancias inventadas. No hay filtros de cercanía u horarios en tiempo real sin datos verificados.

Antes del piloto faltan las iteraciones 2–5: modelo de dominio, permisos, catálogo real, proveedor de pagos, webhooks, emisión, validación transaccional de ingresos y pruebas de negocio/E2E. También faltan políticas comerciales y validación de marca. El logo es conceptual.

## Imágenes referenciales

Imágenes de Unsplash descargadas como assets locales bajo su [licencia](https://unsplash.com/license). Representan ambientes; no identifican aliados ni instalaciones de las fichas ficticias.

- hero.jpg / gym-1.jpg: images.unsplash.com/photo-1534438327276-14e5300c3a48
- gym-2.jpg: images.unsplash.com/photo-1517836357463-d25dfeac3438
- gym-3.jpg: images.unsplash.com/photo-1571902943202-507ec2618e8f

Las fuentes se distribuyen mediante @fontsource, con las licencias incluidas en sus paquetes.

La fotografía editorial `athlete-editorial.png` fue generada con ImageGen para las maquetas. El recurso `athlete.jpg` corresponde a images.unsplash.com/photo-1518310383802-640c2de311b2 y se conserva como alternativa de referencia. Barlow Condensed se añadió como tipografía de titulares para seguir las nuevas capturas.
