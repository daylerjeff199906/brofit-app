import type { Metadata } from "next";
import { Catalog } from "@/components/experiences";
export const metadata: Metadata = { title: "Explora gimnasios" };
export default function Page() {
  return (
    <div className="container page-space">
      <p className="eyebrow lime">EXPLORA / LIMA, PERÚ</p>
      <h1 className="page-title">
        TU PRÓXIMO
        <br />
        <span>ESPACIO.</span>
      </h1>
      <p className="page-intro">
        Por tu zona, por tu equipo, por tus ganas. Encuentra dónde entrenar.
      </p>
      <p className="demo-note">
        <span>DEMO</span> Todos los establecimientos, horarios y precios son
        ficticios.
      </p>
      <Catalog />
    </div>
  );
}
