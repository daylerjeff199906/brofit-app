# Maquetas guiadas por las referencias

Actualización visual solicitada el 11 de noviembre de 2026. Las capturas del usuario son referencias de estilo y composición. No son una fuente de empresas afiliadas, precios, ubicaciones, cuentas ni actividad real.

## Pantallas

| Ruta                       | Maqueta e interacción                                                                       |
| -------------------------- | ------------------------------------------------------------------------------------------- |
| `/`                        | Hero fotográfico, titular condensado en cursiva y recorrido compacto móvil                  |
| `/gimnasios`               | Cabecera editorial, aviso DEMO, filtros y tarjetas oscuras                                  |
| `/gimnasios/concreto-club` | Galería, anclas, equipamiento, horarios pendientes, ubicación y selector de acceso          |
| `/registro`                | Composición fotografía/crema, validación de datos, confirmación y visibilidad de contraseña |
| `/login`                   | Formulario DEMO y acceso al espacio de ejemplo tras validación                              |
| `/recuperar-clave`         | Tres pasos: correo de ejemplo, código DEMO `123456` y validación de nueva clave             |
| `/app`                     | Cabecera lima, navegación de cuenta, indicadores vacíos y próximos pasos                    |
| `/app/perfil`              | Datos personales, preferencias, validación local y limpieza del formulario                  |
| `/app/pases`               | Estado sin pases, con navegación a catálogo y planes                                        |
| `/app/actividad`           | Estado sin movimientos, sin actividad ficticia                                              |

## Decisiones visuales

Se mantienen los colores canónicos, superficies planas y bordes sólidos. Los titulares incorporan Barlow Condensed, con cursiva en las cabeceras deportivas, para acercarse al tratamiento de las capturas. Space Grotesk e IBM Plex Mono se conservan. La fotografía `athlete-editorial.png` fue generada con ImageGen para esta maqueta; representa una atleta conceptual, no una usuaria o afiliada real.

La cuenta usa sidebar en escritorio y navegación horizontal en móvil. Los formularios tienen etiquetas, controles de al menos 44 px, foco visible y validación nativa. La recuperación usa un código explícitamente DEMO. No se envían correos, crean cuentas, guardan contraseñas, activan membresías ni emiten QR. El perfil solo mantiene valores mientras la pantalla está abierta; no usa localStorage ni envía solicitudes con los datos.

## Verificación y límites

Se ejecutan compilación, TypeScript, lint, formato y las pruebas del catálogo. Se comprueban las rutas por HTTP. La revisión visual automática fue detenida porque Computer Use no pudo identificar con suficiente certeza la URL de Chrome para aplicar su política. No se presentan capturas de implementación ni una auditoría visual móvil como realizadas.
