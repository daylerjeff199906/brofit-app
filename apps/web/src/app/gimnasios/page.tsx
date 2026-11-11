import type { Metadata } from "next";
import { Catalog } from "@/components/experiences";
export const metadata: Metadata = { title: "Explora gimnasios" };
export default function Page() {
  return (
    <>
      <section className="public-page-hero">
        <div className="container">
          <p className="breadcrumbs">INICIO / Gimnasios</p>
          <p className="eyebrow lime line-eyebrow">PLATAFORMA MULTIGIMNASIO</p>
          <h1 className="page-title">
            GIMNASIOS <span>PARA TI.</span>
          </h1>
          <p className="page-intro">
            Descubre cómo será el explorador de gimnasios: búsqueda por zona,
            tipo de entrenamiento y equipamiento.
          </p>
        </div>
      </section>
      <div className="container catalog-body">
        <div className="demo-banner">
          <strong>DEMO</strong>
          <p>
            Estos establecimientos son fichas de ejemplo. No representan
            gimnasios afiliados, direcciones, disponibilidad ni tarifas reales.
          </p>
        </div>
        <Catalog />
      </div>
    </>
  );
}
