"use client";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@brofit/ui";
export function AccessMockup() {
  const [membership, setMembership] = useState(false);
  return (
    <aside className="access-panel" id="acceso">
      <p className="eyebrow lime">ACCESO AL GIMNASIO</p>
      <h2>
        ELIGE CÓMO
        <br />
        <span>ENTRENAR.</span>
      </h2>
      <div className="access-tabs" role="group" aria-label="Tipo de acceso">
        <button aria-pressed={!membership} onClick={() => setMembership(false)}>
          Una visita
        </button>
        <button aria-pressed={membership} onClick={() => setMembership(true)}>
          Multigym
        </button>
      </div>
      <p className="eyebrow">
        {membership ? "MEMBRESÍA MULTIGIMNASIO" : "PASE INDIVIDUAL"} / DEMO
      </p>
      <h3>{membership ? "VARIAS VISITAS" : "1 INGRESO"}</h3>
      <p>
        {membership
          ? "Una membresía para visitar distintos gimnasios elegibles, con cupo y vigencia definidos."
          : "Para una visita puntual a este gimnasio, con condiciones publicadas antes del pago."}
      </p>
      <div className="access-price">
        <p className="eyebrow">PRECIO</p>
        <strong>Por definir</strong>
        <p>No hay tarifas reales disponibles.</p>
      </div>
      <dl className="access-labels">
        <div>
          <dt>Disponibilidad</dt>
          <dd>No habilitada</dd>
        </div>
        <div>
          <dt>{membership ? "Visitas incluidas" : "Horario de ingreso"}</dt>
          <dd>Por confirmar</dd>
        </div>
        <div>
          <dt>Duración</dt>
          <dd>Por confirmar</dd>
        </div>
        {membership && (
          <div>
            <dt>Gimnasios elegibles</dt>
            <dd>Por confirmar</dd>
          </div>
        )}
      </dl>
      <Button disabled>Compra no disponible · DEMO</Button>
      <p className="small-note">
        Cuando haya ofertas reales, aquí verás el precio en soles, la vigencia y
        las restricciones antes de continuar.
      </p>
      <Link className="lime-link" href="/planes">
        Comparar opciones de acceso ↗
      </Link>
    </aside>
  );
}
