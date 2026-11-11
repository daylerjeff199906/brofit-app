# BROFIT — ya | Design System y dirección de arte

> **Documento normativo de diseño para el proyecto**  
> **Eslogan INALTERABLE:** **Entrena donde quieras.**  
> **Estilo:** brutalismo digital contemporáneo aplicado a un fitness marketplace.  
> **Versión:** 1.0.  
> **Producto y alcance:** [PROJECT.md](./PROJECT.md)

---

## 0. Regla principal para diseñadores y asistentes de código

**La referencia visual es una web fitness oscura y potente, con fotografía deportiva profesional, grandes titulares, fondos casi negros y verde lima neón.** Adaptar esa dirección a una plataforma de **descubrimiento, pases y acceso multigimnasio**: NO convertir BROFIT en la landing de un gimnasio único o en una app de rutinas.

La identidad debe sentirse:

- **Brutalista:** grandes contrastes, formas geométricas, bordes definidos, tipografía con carácter, bloques editoriales.
- **Moderna:** espacios limpios, navegación clara, interacción rápida y componentes consistentes.
- **Deportiva:** imágenes auténticas de esfuerzo, máquinas, espacios y movimiento.
- **Funcional:** el contenido manda; siempre debe entenderse dónde entrenar, cuánto cuesta y cómo acceder.

**Prohibido:** degradados, sombras decorativas, glassmorphism, fondos pastel predominantes, botones sin contraste, efectos 3D innecesarios, exceso de iconos o decoraciones que afecten la lectura.

---

## 1. ADN visual de marca

| Atributo | Regla |
|---|---|
| Marca textual | **BROFIT — ya** |
| Eslogan | **Entrena donde quieras.** |
| Isotipo | **B geométrica combinada con una mancuerna**, reconocible a 24 px |
| Personalidad | Directa, accesible, activa, urbana, inclusiva |
| Composición | Contraste alto, jerarquías marcadas, grillas limpias |
| Superficies | Negro profundo como predominante y crema/blanco para descanso visual |
| Acabado | Plano; sin sombras ni gradientes |
| Fotografía | Fitness editorial: personas reales, gimnasios y equipamiento |
| Localización | Español peruano natural, sin abusar de jerga |

### Uso del nombre

- Mostrar preferentemente `BROFIT — ya` en titulares de marca y material promocional.
- En interfaz compacta se admite `BROFIT` si el isotipo o «— ya» aparece cerca.
- **No reemplazar el nombre oficial con «BROFIT FLEX», «BROFIT PASS» ni «GymBros».**
- Mantener el eslogan escrito exactamente: **Entrena donde quieras.**
- Las variantes tipográficas pueden usar mayúsculas en titulares, pero las piezas corporativas deben conservar la forma oficial.

---

## 2. Paleta de color

### Tokens de marca

| Token | HEX | Nombre | Uso |
|---|---|---|---|
| `lime` | `#C9FF3F` | Lima eléctrico | CTA principal, resaltados, icono principal |
| `ink` | `#0B0B0B` | Negro profundo | Fondo dominante, encabezado, branding |
| `surface-dark` | `#171717` | Carbono | Cards sobre fondo negro |
| `cream` | `#F5F2E8` | Crema cálido | Bloques claros, superficies secundarias |
| `white` | `#FFFFFF` | Blanco | Texto y paneles de alto contraste |
| `cement` | `#9CA3AF` | Gris cemento | Metadata, controles inactivos y divisores |
| `lime-dark` | `#A6E100` | Lima intenso | Hover alternativo y acentos |
| `orange` | `#FF5A00` | Naranja fuerte | Campañas o alertas editoriales, nunca éxito/error por sí solo |

### Distribución sugerida

- **65 %** negro/carbono: base de la landing y áreas premium.
- **25 %** blanco/crema: tarjetas, contenido extenso, paneles y zonas con formularios.
- **10 %** lima: botones, títulos enfatizados, iconos y pequeños bloques de marca.
- Naranja: **opcional** y excepcional, principalmente campañas.

### Contrastes

- En lima `#C9FF3F`: texto **negro**, nunca blanco.
- En negro `#0B0B0B`: texto blanco/crema o lima.
- En crema `#F5F2E8`: texto negro.
- Texto secundario `#9CA3AF` sobre negro, solo si cumple contraste real según tamaño.
- No comunicar estados únicamente mediante color; agregar etiqueta e iconografía cuando ayude.

### Variables CSS

```css
:root {
  --bf-lime: #C9FF3F;
  --bf-lime-hover: #A6E100;
  --bf-ink: #0B0B0B;
  --bf-carbon: #171717;
  --bf-cream: #F5F2E8;
  --bf-white: #FFFFFF;
  --bf-cement: #9CA3AF;
  --bf-orange: #FF5A00;

  --bf-bg: var(--bf-ink);
  --bf-fg: var(--bf-white);
  --bf-surface: var(--bf-carbon);
  --bf-border: #404040;
  --bf-action: var(--bf-lime);
  --bf-action-fg: var(--bf-ink);

  --bf-font-display: 'Archivo', sans-serif;
  --bf-font-body: 'Space Grotesk', sans-serif;
  --bf-font-mono: 'IBM Plex Mono', monospace;

  --bf-radius-none: 0;
  --bf-radius-sm: 4px;
  --bf-radius-md: 8px;

  --bf-spacing-1: 4px;
  --bf-spacing-2: 8px;
  --bf-spacing-3: 12px;
  --bf-spacing-4: 16px;
  --bf-spacing-6: 24px;
  --bf-spacing-8: 32px;
  --bf-spacing-12: 48px;
  --bf-spacing-16: 64px;

  --bf-line: 1px solid var(--bf-border);
}

/* Un foco visible es parte del diseño, no un defecto estético. */
:focus-visible {
  outline: 3px solid var(--bf-lime);
  outline-offset: 3px;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

> Ajustar el outline del foco cuando el control tenga fondo lima (usar negro o contorno doble con suficiente contraste).

---

## 3. Tipografía

### Familias

- **Archivo** (`700–900`; ideal `800/900` solo en display): logotipo tipográfico de referencia, titulares editoriales, números grandes.
- **Space Grotesk** (`400–700`): navegación, párrafos, botones, fichas, formularios.
- **IBM Plex Mono** (`400–600`): microetiquetas, códigos, identificadores, estadísticas breves.

> Si se desarrolla el logotipo final, construir un **vector propio**, no depender de texto plano con una familia cualquiera. Respetar licencias y cargar fuentes de forma optimizada.

### Escala sugerida

| Elemento | Desktop | Móvil | Peso / interlineado |
|---|---|---|---|
| Hero | 72–96 px | 42–54 px | Archivo 900 / 0.93–1.0 |
| Título sección | 36–52 px | 28–36 px | Archivo 800 / 1.05 |
| Título card | 20–26 px | 19–22 px | Archivo 700 / 1.1 |
| Cuerpo | 16–18 px | 16 px | Space Grotesk 400–500 / 1.5 |
| Botón | 14–16 px | 14–16 px | Space Grotesk 700 |
| Etiqueta mono | 11–13 px | 11–12 px | IBM Plex Mono 500 |

Usar titulares mayúsculos de manera selectiva, no en textos largos. Evitar las frases partidas arbitrariamente que afecten comprensión y lectura en móviles.

---

## 4. Logotipo e isotipo (dirección aprobada)

### Construcción preferida — B + mancuerna

1. Crear **una B inclinada geométrica** con cortes rectos inspirados en fuerza y movimiento.
2. Incorporar **pequeños discos de mancuerna a los extremos horizontales** del símbolo o integrarlos en el eje sin comprometer la lectura de la B.
3. Mantener **BROFIT** como wordmark dominante; **— ya** en cápsula rectangular o etiqueta compacta lima.
4. Resolverlo como símbolo plano, de uno o dos colores, reconocible en 24, 32, 48 y 128 px.
5. El brazo flexionado puede explorarse como **alternativa secundaria de campaña**, pero NO es obligatorio ni se debe mezclar con la mancuerna en una sola forma ilegible.

### Variantes obligatorias

- `primary-dark`: isotipo lima + BROFIT blanco + «— ya» lima, fondo negro.
- `primary-light`: isotipo negro + BROFIT negro + «— ya» negro/lima, fondo crema.
- `monochrome-dark`: todo blanco sobre negro.
- `monochrome-light`: todo negro sobre blanco.
- `app-icon`: B + mancuerna centrada, sin textos pequeños, fondo negro o lima.
- `favicon`: versión simplificada de B, sin «— ya».

### Reglas de protección

- Zona libre mínima alrededor del logo: aproximadamente media altura de la B.
- No estirar ni rotar el logotipo.
- No aplicar sombra, contorno brillante, relieve, bisel o degradado.
- No usar símbolos de mancuernas genéricas junto al nombre sin integración visual.
- Verificar legibilidad en un solo color y en tamaños pequeños.
- El diseño final es conceptual hasta que exista un SVG original revisado y aprobado.

---

## 5. Lenguaje gráfico neobrutalista

- **Bordes:** rectos y sólidos (1 px en estructuras, 2 px en controles destacados); máximo 8 px de radio en UI general.
- **Recortes:** paneles trapezoidales o ángulos diagonales ocasionales en banners y hero.
- **Marcas de energía:** líneas inclinadas `///`, contornos de flechas y rayas gruesas, siempre con función compositiva.
- **Iconos:** Lucide o set lineal uniforme; grosor próximo a 2 px, iconos minimalistas.
- **Fotografía:** negros profundos, luz lateral, encuadres definidos, personas diversas, máquinas y espacios reales.
- **Fondos:** negro/carbono. Textura de gimnasio o concreto muy sutil **solo** en campañas; no detrás de párrafos extensos.
- **Motion:** hover breve y directo (120–200 ms); desplazamientos cortos, nunca animaciones que bloqueen la operación.
- **Sin sombras, sin gradientes, sin glassmorphism.**

**Importante:** la landing puede ser intensa; el checkout, el QR, los formularios y la gestión de gimnasios deben priorizar velocidad, serenidad y claridad.

---

## 6. Layout, responsive y estructura

- Sistema de 12 columnas desktop, 8 tablet y 4 móvil.
- Ancho útil máximo: 1280–1440 px según pantalla.
- Gutter desktop: 24–32 px; móvil: 16–20 px.
- Secciones con aire suficiente; alternar grandes bloques oscuros con cards claras.
- Touch targets de al menos 44 × 44 px.
- Sticky nav solo si no ocupa espacio excesivo en móvil.
- Evitar scroll horizontal no intencional.
- Puntos de ruptura sugeridos: 640 / 768 / 1024 / 1280 px.

### Homepage — jerarquía requerida

```text
┌───────────────────────────────────────────────────────────────┐
│ LOGO  Inicio  Gimnasios  Planes  Cómo funciona    Entrar  CTA  │
├───────────────────────────────────────────────────────────────┤
│  ETIQUETA / BROFIT — ya                                      │
│  ENTRENA DONDE                   [FOTO ATLETA / GIMNASIO]      │
│  QUIERAS.                                                     │
│  Descubre gimnasios, compara equipos y compra accesos.       │
│  [EXPLORAR GIMNASIOS] [CÓMO FUNCIONA]                        │
├───────────────────────────────────────────────────────────────┤
│  EXPLORA      COMPRA TU PASE      INGRESA CON QR              │
├───────────────────────────────────────────────────────────────┤
│  ENCUENTRA TU PRÓXIMO GYM / BUSCADOR / LISTADO + MAPA         │
├───────────────────────────────────────────────────────────────┤
│  POR OBJETIVO / EQUIPAMIENTO / SERVICIOS                     │
├───────────────────────────────────────────────────────────────┤
│  DOS FORMAS DE ENTRENAR: PASES Y MEMBRESÍAS                  │
├───────────────────────────────────────────────────────────────┤
│  PARA GIMNASIOS ALIADOS / CTA AFILIACIÓN                      │
├───────────────────────────────────────────────────────────────┤
│  PREGUNTAS FRECUENTES / CTA FINAL / FOOTER                    │
└───────────────────────────────────────────────────────────────┘
```

### Hero

- Fondo casi negro y fotografía deportiva auténtica a la derecha (o como imagen de fondo con superposición **sólida**, no gradiente).
- H1 obligatorio: **«ENTRENA DONDE QUIERAS.»** (palabra «QUIERAS.» en lima, cuando quede bien).
- Supporting copy: «Descubre gimnasios, compara instalaciones y compra pases o membresías flexibles desde un solo lugar».
- CTA primaria **«Explorar gimnasios»**.
- CTA secundaria **«Cómo funciona»**.
- No inventar métricas de usuarios, gimnasios, descargas o valoraciones bajo el hero.

### Sección de gimnasio / explorador

- Primero: ciudad o ubicación elegida, buscador y filtros.
- Filtros: cercanía, precio, tipo de entrenamiento, equipamiento, servicios y horario disponible.
- Cards con foto, nombre, ubicación **real**, servicios principales, precio **real** de pase y CTA «Ver gimnasio».
- Rating solo cuando se haya recogido suficiente información auténtica; de otro modo omitir.
- Mapa accesible con alternativa lista; no impedir acceso si la persona rechaza geolocalización.

### Planes

- Máximo 2 tipos visibles en MVP: **Pase individual** y **Membresía multigimnasio** (con variantes de visitas si corresponde).
- Mostrar precio real y moneda PEN, duración, visitas, gimnasios elegibles y restricciones antes del CTA.
- Nunca presentar «sin límites» o «sin contratos» si no coincide con las condiciones efectivas.
- Etiquetas de «POPULAR» solo si existe un criterio real; de otro modo no usarla.

### Secciones sociales

- Testimonios **solo** con autorización y evidencia real. Durante desarrollo usar placeholders indicados como ejemplo o simplemente omitir la sección.
- En lugar de cifras inventadas, mostrar fotos verificadas de gimnasios y un apartado «Cómo funciona».

---

## 7. Componentes UI esenciales

| Componente | Diseño | Estados obligatorios |
|---|---|---|
| `ButtonPrimary` | Lima sólido, texto negro, radio 4 px, flecha opcional | default, hover, focus, loading, disabled |
| `ButtonSecondary` | Fondo negro, borde blanco/crema, texto claro | default, hover, focus, disabled |
| `InputSearch` | Superficie sólida, icono de lupa y label accesible | idle, focus, result, empty, error |
| `FilterChip` | Rectangular, borde sólido, selección lima | idle, selected, disabled |
| `GymCard` | Foto + nombre + datos verificados + CTA | loading, available, unavailable, error |
| `GymDetails` | Galería, datos y reglas de acceso | loading, loaded, not-found |
| `PlanCard` | Precio grande, condiciones, beneficios reales | default, selected, unavailable |
| `DigitalPass` | Pase visual con estado, vigencia, QR temporal | active, used, expired, invalid |
| `CheckInResult` | Resultado claro con mensaje y hora | success, duplicate, expired, ineligible, error |
| `EmptyState` | Mensaje útil con acción | sin gimnasios, sin pases, filtros vacíos |
| `StatusBadge` | Colores semánticos y texto legible | pending, active, paused, rejected |
| `ModalDialog` | Plano, cierre visible, foco atrapado | open, close, confirmation |
| `Toast` | Feedback corto, no único canal de información | success, warning, error |

### Ejemplo de botón en CSS

```css
.bf-button-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 48px;
  padding: 12px 22px;
  border: 2px solid var(--bf-lime);
  border-radius: var(--bf-radius-sm);
  background: var(--bf-lime);
  color: var(--bf-ink);
  font: 700 15px/1.2 var(--bf-font-body);
  text-decoration: none;
  cursor: pointer;
  transition: background-color 160ms ease, transform 160ms ease;
}
.bf-button-primary:hover { background: var(--bf-lime-hover); }
.bf-button-primary:active { transform: translateY(1px); }
.bf-button-primary:disabled { opacity: .55; cursor: not-allowed; }
```

---

## 8. Estados, contenido y accesibilidad

### Copy

| Contexto | Texto sugerido |
|---|---|
| Hero | «Entrena donde quieras.» |
| CTA exploración | «Explorar gimnasios» |
| Buscar | «Buscar gimnasios por zona o nombre» |
| Detalle | «Ver equipamiento» / «Ver condiciones del pase» |
| Pase comprado | «¡Listo! Tu pase está disponible.» |
| Sin gimnasios | «Aún no hay gimnasios disponibles en esta zona.» |
| Ubicación denegada | «Puedes buscar manualmente por ciudad o distrito.» |
| Pase vencido | «Este pase ya venció. Consulta otros accesos.» |
| QR usado | «Este ingreso ya fue registrado.» |
| Validación correcta | «Ingreso confirmado. ¡A entrenar!» |
| CTA aliados | «Afiliar mi gimnasio» |

### Usabilidad y accesibilidad

- Navegación por teclado, foco visible y orden lógico.
- Contraste mínimo WCAG AA en texto e información funcional.
- Etiquetas siempre presentes: no depender solo de placeholder.
- Feedback de pagos y entradas en texto completo, no solo iconos.
- Evitar fotografía como único soporte de información.
- Respetar `prefers-reduced-motion`.
- Imágenes optimizadas con `alt` útil y lazy loading fuera del hero.
- Responsive real de 320 px a pantallas anchas; evitar botones demasiado pequeños.

---

## 9. Estilo por superficie

### Landing pública

- **Más expresiva**: hero fotográfico, grandes titulares, secciones negras y bloque lima, banners de captación.
- No usar tarjetas de «planes de entrenamiento» como producto principal. Son **pases y membresías a distintos gimnasios**.

### App de usuarios

- **Más simple**: navegación clara, gimnasio + mapa + precio como primer objetivo, pase accesible en pocos toques.
- El QR debe poder ampliarse y tener un mecanismo alternativo de validación.

### Portal de gimnasios

- **Operativo**: alto contraste, tablas legibles, validación QR siempre accesible.
- La marca está presente, pero la prioridad es evitar errores de entrada.

### Panel administrativo

- Superficies claras o oscuras bien delimitadas; tablas, filtros y estados.
- Los cambios críticos necesitan confirmación, registro de auditoría y mensajes explícitos.

---

## 10. Assets a producir

- [ ] Logo horizontal `brofit-logo-dark.svg` y `brofit-logo-light.svg`.
- [ ] Isotipo B+mancuerna `brofit-mark.svg` en monocromo y lima.
- [ ] Favicon `favicon.svg` (solo B+mancuerna, sin texto pequeño).
- [ ] App icon en versiones cuadradas y adaptativas.
- [ ] Hero panorámico desktop y recorte vertical móvil, con fotografías autorizadas.
- [ ] Fotografías reales de gimnasios afiliados.
- [ ] Plantilla de publicación 1:1 y story 9:16.
- [ ] Stickers de acceso «Gimnasio afiliado a BROFIT — ya».
- [ ] Plantilla de pase QR con tipografía y estados.
- [ ] OG social 1200 × 630 px.

**No utilizar códigos QR dibujados como si fueran válidos.** El QR de verdad se genera con datos/tokens del sistema.

---

## 11. Checklist final de revisión visual

- [ ] Se lee **BROFIT — ya** y el eslogan es exactamente «Entrena donde quieras.».
- [ ] Predomina el negro con acentos lima; no hay degradados ni sombras.
- [ ] La B+mancuerna funciona a 24 px.
- [ ] Los CTA principales contrastan con el fondo.
- [ ] El diseño se siente deportivo pero no excluyente.
- [ ] La landing comunica **varios gimnasios**, no un gimnasio propio.
- [ ] Todas las cifras, ubicaciones, testimonios y tarifas visibles son reales o DEMO claramente marcado.
- [ ] Las pantallas principales tienen estados loading, error, vacío y éxito.
- [ ] El flujo de compra y QR es más claro que la decoración.
- [ ] Desktop, tablet y móvil están revisados.

---

**Este archivo es la fuente única de verdad para el diseño de BROFIT — ya.** Si un prototipo, prompt o código contradice estas reglas, prevalece `DESIGN.md` salvo actualización explícita aprobada.
