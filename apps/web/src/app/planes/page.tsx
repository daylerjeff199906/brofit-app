import { Plans, FAQ } from "@/components/experiences";
export const metadata = { title: "Pases y membresías" };
export default function Page() {
  return (
    <div className="container page-space">
      <p className="eyebrow lime">DOS FORMAS DE MOVERTE</p>
      <h1 className="page-title">
        TU RITMO.
        <br />
        <span>TU ELECCIÓN.</span>
      </h1>
      <p className="page-intro">
        Prueba un gimnasio por un día o explora distintos espacios con visitas
        definidas.
      </p>
      <p className="demo-note">
        <span>SANDBOX</span> Precios, vigencias y condiciones de ejemplo. Las
        compras de prueba no cobran dinero real.
      </p>
      <Plans />
      <div className="info-strip">
        <p>
          En la membresía de ejemplo son elegibles Concreto Club, Movimiento
          Studio, Norte Fuerza y Ritmo Training. Todos son ficticios. El pase
          individual corresponde solo al gimnasio elegido. Cancelaciones y
          reembolsos pendientes de definición comercial.
        </p>
      </div>
      <section className="section">
        <h2>Primero, todo claro.</h2>
        <FAQ />
      </section>
    </div>
  );
}
