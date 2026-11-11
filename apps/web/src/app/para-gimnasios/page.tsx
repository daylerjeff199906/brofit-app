import { PartnerInterest } from "@/components/experiences";
export const metadata = { title: "Para gimnasios" };
export default function Page() {
  return (
    <div className="container page-space">
      <p className="eyebrow lime">LA FUERZA DE LA RED EMPIEZA EN TU ESPACIO</p>
      <h1 className="page-title">
        ABRE LA PUERTA.
        <br />
        <span>SUMA MOVIMIENTO.</span>
      </h1>
      <p className="page-intro">
        Una propuesta para conectar gimnasios independientes con personas que
        buscan dónde entrenar.
      </p>
      <div className="partner-layout">
        <img
          src="/images/gym-3.jpg"
          alt="Gimnasio referencial, no afiliado a BROFIT"
        />
        <div>
          <BadgeText />
          <h2>Tu espacio, en el mapa.</h2>
          <p>
            Antes de publicar un gimnasio, verificaremos su información y
            acordaremos condiciones transparentes.
          </p>
          <ul className="conditions">
            <li>Verificación del establecimiento y su equipamiento.</li>
            <li>Acuerdo de precio por ingreso y restricciones.</li>
            <li>Publicación tras la aprobación del equipo.</li>
            <li>
              Validación de entradas y conciliación en el portal de aliados.
            </li>
          </ul>
          <PartnerInterest />
        </div>
      </div>
    </div>
  );
}
function BadgeText() {
  return (
    <p className="eyebrow lime">
      PILOTO EN PREPARACIÓN · SIN AFILIACIONES ACTIVAS
    </p>
  );
}
