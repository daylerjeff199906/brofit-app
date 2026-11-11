import Link from "next/link";
import { notFound } from "next/navigation";
import { Dumbbell, MapPin } from "lucide-react";
import { gyms } from "@/lib/demo";
import { AccessMockup } from "@/components/access-mockup";
export function generateStaticParams() {
  return gyms.map((g) => ({ slug: g.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return {
    title: gyms.find((g) => g.slug === slug)?.name || "Gimnasio no encontrado",
  };
}
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const g = gyms.find((g) => g.slug === slug);
  if (!g) notFound();
  const words = g.name.split(" ");
  return (
    <>
      <section className="gym-detail-top">
        <div className="container">
          <p className="breadcrumbs">
            <Link href="/">INICIO</Link> /{" "}
            <Link href="/gimnasios">GIMNASIOS</Link> / FICHA DEMO
          </p>
          <div className="detail-header">
            <div>
              <p className="eyebrow lime">
                GIMNASIO / FICHA DE REFERENCIA · DEMO
              </p>
              <h1 className="detail-title">
                {words.slice(0, -1).join(" ")} <span>{words.at(-1)}.</span>
              </h1>
              <p className="page-intro">
                Conoce el espacio antes de elegir tu acceso: máquinas,
                servicios, reglas y horarios en un solo lugar.
              </p>
              <div className="tag-list">
                <span>✓ Equipamiento de ejemplo</span>
                <span>Datos ilustrativos</span>
                <span>No afiliado</span>
              </div>
            </div>
            <aside className="detail-prompt">
              <p className="eyebrow lime">TU PRÓXIMA VISITA</p>
              <h2>COMIENZA INFORMÁNDOTE.</h2>
              <a href="#acceso" className="button primary">
                Ver opciones de acceso ↓
              </a>
            </aside>
          </div>
        </div>
      </section>
      <div className="container detail-main">
        <div className="demo-banner">
          <strong>DEMO</strong>
          <p>
            Este establecimiento y sus fotos son ejemplos de interfaz. No se
            trata de un gimnasio afiliado ni existen precios o cupos
            habilitados.
          </p>
        </div>
        <div className="gym-gallery">
          <div className="gallery-main">
            <img
              src={g.image}
              alt={`Ambiente referencial para la ficha ficticia ${g.name}`}
            />
            <span className="badge">FOTOGRAFÍA REFERENCIAL / DEMO</span>
          </div>
          <div className="gallery-side">
            <img
              src="/images/gym-2.jpg"
              alt="Entrenamiento con pesas, referencia de equipamiento"
            />
            <img
              src="/images/athlete-editorial.png"
              alt="Atleta, fotografía de referencia"
            />
          </div>
        </div>
        <div className="reference-detail-grid">
          <div>
            <nav
              className="detail-section-nav"
              aria-label="Secciones del gimnasio"
            >
              {[
                ["resumen", "Resumen"],
                ["equipamiento", "Equipamiento"],
                ["horarios", "Horarios"],
                ["ubicacion", "Ubicación"],
                ["condiciones", "Condiciones"],
              ].map(([id, label]) => (
                <a key={id} href={`#${id}`}>
                  {label}
                </a>
              ))}
            </nav>
            <section className="detail-section" id="resumen">
              <p className="eyebrow lime">01 / SOBRE EL ESPACIO</p>
              <h2>
                ENTRENA CON TODA LA <span>INFORMACIÓN.</span>
              </h2>
              <p>
                En BROFIT — ya podrás explorar cada gimnasio antes de elegir tu
                visita, sin tener que consultar por separado qué máquinas ofrece
                o cuáles son sus reglas.
              </p>
              <div className="detail-facts">
                {[
                  [
                    "Conoce las instalaciones",
                    "Imágenes y servicios verificados.",
                  ],
                  [
                    "Revisa el equipamiento",
                    "Busca las máquinas que necesitas.",
                  ],
                  ["Elige tu acceso", "Condiciones claras antes del pago."],
                ].map(([title, desc], i) => (
                  <article key={title}>
                    <strong>0{i + 1}</strong>
                    <h3>{title}</h3>
                    <p>{desc}</p>
                  </article>
                ))}
              </div>
            </section>
            <section className="detail-section" id="equipamiento">
              <p className="eyebrow lime">02 / EQUIPAMIENTO</p>
              <h2>
                LO QUE <span>NECESITAS.</span>
              </h2>
              <p>
                Listado de categorías ilustrativas, a confirmar con cada
                gimnasio cuando se incorpore a la plataforma.
              </p>
              <div className="equipment-grid">
                {g.equipment.map((e) => (
                  <article key={e}>
                    <Dumbbell />
                    <h3>{e}</h3>
                    <p>Referencia DEMO</p>
                  </article>
                ))}
              </div>
              <h3 className="detail-subtitle">SERVICIOS DEL LOCAL</h3>
              <div className="tag-list">
                {g.services.map((s) => (
                  <span key={s}>{s} · por confirmar</span>
                ))}
              </div>
            </section>
            <section className="detail-section" id="horarios">
              <p className="eyebrow lime">03 / HORARIOS</p>
              <h2>
                ¿CUÁNDO <span>PUEDES IR?</span>
              </h2>
              <p>
                Al integrar un establecimiento real, sus horarios se mostrarán
                aquí con fechas de actualización.
              </p>
              <table className="hours-table">
                <caption className="sr-only">
                  Horarios pendientes de confirmación
                </caption>
                <tbody>
                  {["Lunes a viernes", "Sábados", "Domingos / feriados"].map(
                    (d) => (
                      <tr key={d}>
                        <th scope="row">{d}</th>
                        <td>Horario por confirmar</td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </section>
            <section className="detail-section" id="ubicacion">
              <p className="eyebrow lime">04 / UBICACIÓN</p>
              <h2>
                CONOCE <span>CÓMO LLEGAR.</span>
              </h2>
              <div className="location-panel">
                <div className="map-placeholder">
                  <svg
                    aria-hidden="true"
                    className="map-grid"
                    width="100%"
                    height="100%"
                  >
                    <defs>
                      <pattern
                        id="map-grid"
                        width="30"
                        height="30"
                        patternUnits="userSpaceOnUse"
                      >
                        <path
                          d="M30 0H0V30"
                          fill="none"
                          stroke="#444"
                          strokeWidth="1"
                        />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#map-grid)" />
                  </svg>
                  <MapPin size={27} />
                  <span>MAPA DISPONIBLE AL INCORPORAR DATOS VERIFICADOS</span>
                </div>
                <div>
                  <h3>Dirección por confirmar</h3>
                  <p>
                    La ubicación real y el mapa aparecerán cuando el gimnasio se
                    afilie. No necesitas compartir tu ubicación para explorar.
                  </p>
                  <Link className="lime-link" href="/gimnasios">
                    Volver al explorador ↗
                  </Link>
                </div>
              </div>
            </section>
            <section className="detail-section" id="condiciones">
              <p className="eyebrow lime">05 / ANTES DE COMPRAR</p>
              <h2>
                TODO <span>CLARO.</span>
              </h2>
              <ol className="gym-rules">
                <li>
                  La duración, fecha de vencimiento y condiciones se confirmarán
                  al elegir un pase.
                </li>
                <li>
                  La disponibilidad dependerá del gimnasio, día y tipo de
                  acceso.
                </li>
                <li>
                  Si eliges una membresía, se informarán visitas restantes y
                  locales elegibles.
                </li>
                <li>
                  El ingreso mediante QR se habilitará solo con una compra
                  confirmada por el servidor.
                </li>
              </ol>
            </section>
          </div>
          <AccessMockup />
        </div>
      </div>
      <section className="detail-final">
        <div className="container">
          <div>
            <p className="eyebrow lime">SIGUE EXPLORANDO</p>
            <h2>
              BUSCA TU <span>PRÓXIMO GYM.</span>
            </h2>
          </div>
          <Link className="button primary" href="/gimnasios">
            Volver a gimnasios ↗
          </Link>
        </div>
      </section>
    </>
  );
}
