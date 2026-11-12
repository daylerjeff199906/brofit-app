"use client";
import { useState } from "react";
import Link from "next/link";
import { useResource } from "./use-resource";
import { ResourceMessage } from "./account-live";
import { soles, type Offer } from "@/lib/api";
export function AccessMockup({ gymId }: { gymId: string }) {
  const [membership, setMembership] = useState(false);
  const resource = useResource<{ data: Offer[] }>(
    "/offers?gymId=" + encodeURIComponent(gymId),
  );
  const offer = resource.data?.data.find(
    (o) => o.kind === (membership ? "MEMBERSHIP" : "DAY_PASS"),
  );
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
      <ResourceMessage {...resource} />
      {offer ? (
        <>
          <p className="eyebrow">
            {offer.kind === "MEMBERSHIP" ? "MEMBRESÍA" : "PASE INDIVIDUAL"} /
            SANDBOX
          </p>
          <h3>
            {offer.visits} {offer.visits === 1 ? "INGRESO" : "VISITAS"}
          </h3>
          <p>{offer.description}</p>
          <div className="access-price">
            <p className="eyebrow">PRECIO DE PRUEBA</p>
            <strong>{soles(offer.priceCents)}</strong>
            <p>No se realiza ningún cobro real.</p>
          </div>
          <dl className="access-labels">
            <div>
              <dt>Vigencia</dt>
              <dd>{offer.validityDays} días</dd>
            </div>
            <div>
              <dt>Máximo por día</dt>
              <dd>{offer.maxPerDay} visita</dd>
            </div>
            <div>
              <dt>Máximo por gimnasio</dt>
              <dd>{offer.maxPerGym} visitas</dd>
            </div>
            <div>
              <dt>Gimnasios elegibles</dt>
              <dd>{offer.gyms.length}</dd>
            </div>
          </dl>
          <ul className="conditions">
            {offer.conditions.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
          <Link className="button primary" href={`/checkout/${offer.id}`}>
            Elegir este acceso ↗
          </Link>
        </>
      ) : !resource.loading && !resource.error ? (
        <p>Esta modalidad no está disponible actualmente.</p>
      ) : null}
      <Link className="lime-link" href="/planes">
        Comparar opciones de acceso ↗
      </Link>
    </aside>
  );
}
