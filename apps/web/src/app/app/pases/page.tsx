import Link from "next/link";
import { Ticket } from "lucide-react";
import { AccountHeading } from "@/components/account-shell";
export const metadata = { title: "Mis pases · DEMO" };
export default function Page() {
  return (
    <>
      <AccountHeading
        eyebrow="MI CUENTA / PASES"
        title="TUS PRÓXIMAS"
        accent="VISITAS."
        description="Tus pases y membresías, en un solo lugar."
      />
      <div className="account-empty">
        <Ticket size={44} />
        <p className="eyebrow lime">AÚN NO HAY PASES</p>
        <h3>TU PRÓXIMO ENTRENAMIENTO TE ESPERA.</h3>
        <p>
          Los pases aparecerán aquí después de una compra verificada. En esta
          maqueta no se emiten pases ni códigos de acceso.
        </p>
        <div className="inline-actions">
          <Link className="button primary" href="/gimnasios">
            Explorar gimnasios ↗
          </Link>
          <Link className="button secondary" href="/planes">
            Comparar accesos ↗
          </Link>
        </div>
      </div>
    </>
  );
}
