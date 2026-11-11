import Link from "next/link";
import { Activity } from "lucide-react";
import { AccountHeading } from "@/components/account-shell";
export const metadata = { title: "Mi actividad · DEMO" };
export default function Page() {
  return (
    <>
      <AccountHeading
        eyebrow="MI CUENTA / ACTIVIDAD"
        title="CADA VISITA"
        accent="CUENTA."
        description="Aquí podrás revisar tus ingresos y movimientos."
      />
      <div className="account-empty">
        <Activity size={44} />
        <p className="eyebrow lime">TU HISTORIA EMPIEZA AQUÍ</p>
        <h3>TODAVÍA NO HAY MOVIMIENTOS.</h3>
        <p>
          Cuando el sistema esté conectado, tus ingresos confirmados aparecerán
          en este historial. No mostramos visitas ficticias como actividad real.
        </p>
        <Link className="button primary" href="/gimnasios">
          Encuentra tu próximo gimnasio ↗
        </Link>
      </div>
    </>
  );
}
