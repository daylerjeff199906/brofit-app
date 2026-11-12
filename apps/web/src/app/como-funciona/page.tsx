import Link from "next/link";
import { Steps, FAQ } from "@/components/experiences";
export const metadata = { title: "Cómo funciona" };
export default function Page() {
  return (
    <div className="container page-space">
      <p className="eyebrow lime">MENOS VUELTAS. MÁS MOVIMIENTO.</p>
      <h1 className="page-title">
        ELIGE. LLEGA.
        <br />
        <span>ENTRENA.</span>
      </h1>
      <p className="page-intro">
        Un recorrido simple para descubrir tu próximo espacio.
      </p>
      <Steps />
      <div className="info-strip">
        <p>
          <strong>Estás en el entorno sandbox.</strong> Puedes crear tu cuenta,
          verificar tu correo, adquirir un pase de prueba y validar un ingreso
          desde el portal del gimnasio. No se realizan cobros reales.
        </p>
      </div>
      <section className="section">
        <h2>Lo que necesitas saber.</h2>
        <FAQ />
      </section>
      <Link className="button primary" href="/gimnasios">
        Explorar gimnasios ↗
      </Link>
    </div>
  );
}
