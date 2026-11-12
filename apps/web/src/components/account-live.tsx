"use client";
import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import QRCode from "qrcode";
import { Button, EmptyState, Modal } from "@brofit/ui";
import {
  api,
  post,
  type AccessPass,
  type Offer,
  type Order,
  soles,
} from "@/lib/api";
import { useResource } from "./use-resource";
import { useSession } from "./session";
import { AccountHeading } from "./account-shell";
type GymShort = { id: string; name: string; slug: string };
type Visit = {
  id: string;
  createdAt: string;
  gym: { name: string; district: string };
  pass: { name: string };
};
export function ResourceMessage({
  error,
  loading,
  reload,
}: {
  error: string;
  loading: boolean;
  reload: () => void;
}) {
  return loading ? (
    <p className="loading-note" role="status">
      Cargando…
    </p>
  ) : error ? (
    <div className="form-feedback error-message" role="alert">
      {error}{" "}
      <button type="button" onClick={reload}>
        Reintentar
      </button>
    </div>
  ) : null;
}
export function Dashboard() {
  const { user } = useSession();
  const passes = useResource<{ data: AccessPass[] }>("/me/passes");
  const activity = useResource<{ data: Visit[] }>("/me/activity");
  const active = passes.data?.data.filter((p) => p.status === "ACTIVE") || [];
  return (
    <>
      <AccountHeading
        eyebrow="INICIO / MI ESPACIO"
        title={`HOLA${user?.name ? ", " + user.name.toUpperCase() : ""}.`}
        accent="¡A ENTRENAR!"
        description="Tus pases, tus visitas y tu próximo entrenamiento."
      />
      <ResourceMessage {...passes} />
      <div className="account-stats">
        <article>
          <p className="eyebrow">PASES ACTIVOS</p>
          <strong>{String(active.length).padStart(2, "0")}</strong>
          <p>
            {active.reduce((s, p) => s + p.remaining, 0)} visitas disponibles
          </p>
        </article>
        <article>
          <p className="eyebrow">VISITAS REALIZADAS</p>
          <strong>
            {String(activity.data?.data.length || 0).padStart(2, "0")}
          </strong>
          <p>Ingresos confirmados</p>
        </article>
        <article>
          <p className="eyebrow">TU PRÓXIMO PASO</p>
          <h3>{active.length ? "A ENTRENAR" : "EXPLORAR"}</h3>
          <p>Encuentra tu espacio</p>
        </article>
      </div>
      <div className="account-main-grid">
        <article className="account-feature">
          <div className="inactive-ticket-art" aria-label="BROFIT, tus pases">
            <span aria-hidden="true">/</span>
            <div>
              BROFIT
              <br />
              <em>— YA</em>
            </div>
            <span aria-hidden="true">/</span>
            <small>ENTORNO SANDBOX</small>
          </div>
          <div className="account-card-copy">
            <p className="eyebrow lime">MIS PASES</p>
            <h3>
              {active.length
                ? "TU SIGUIENTE VISITA YA TE ESPERA."
                : "TU PRÓXIMO ENTRENAMIENTO COMIENZA AQUÍ."}
            </h3>
            <p>
              {active.length
                ? "Consulta tu saldo y genera un código temporal para el gimnasio elegido."
                : "Explora un gimnasio o una membresía. Las compras de este entorno no cobran dinero real."}
            </p>
            <div className="inline-actions">
              <Link
                className="button primary"
                href={active.length ? "/app/pases" : "/gimnasios"}
              >
                {active.length ? "Ver mis pases" : "Explorar gimnasios"} ↗
              </Link>
              <Link className="button secondary" href="/planes">
                Comparar planes ↗
              </Link>
            </div>
          </div>
        </article>
        <article className="getting-started">
          <p className="eyebrow lime">TU RECORRIDO</p>
          <h3>LISTO PARA EMPEZAR.</h3>
          {[
            ["Explora los gimnasios", "Compara equipamiento y condiciones."],
            ["Elige tu acceso", "Confirma una compra sandbox sin cobro real."],
            ["Valida tu ingreso", "Presenta el QR temporal en recepción."],
          ].map(([title, description], i) => (
            <div className="mini-step" key={title}>
              <strong>0{i + 1}</strong>
              <div>
                <h4>{title}</h4>
                <p>{description}</p>
              </div>
            </div>
          ))}
          <Link className="lime-link" href="/como-funciona">
            Conocer cómo funciona ↗
          </Link>
        </article>
      </div>
    </>
  );
}
export function Passes() {
  const resource = useResource<{ data: AccessPass[] }>("/me/passes");
  const gyms = useResource<{ data: GymShort[] }>("/gyms?pageSize=100");
  const [filter, setFilter] = useState("ALL");
  const [selected, setSelected] = useState<AccessPass | null>(null);
  const [gymId, setGymId] = useState("");
  const [access, setAccess] = useState<{
    token: string;
    expiresAt: string;
  } | null>(null);
  const [qr, setQr] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [remaining, setRemaining] = useState(0);
  useEffect(() => {
    if (!access) return;
    let live = true;
    void QRCode.toDataURL(access.token, {
      width: 280,
      margin: 3,
      errorCorrectionLevel: "M",
    }).then((url) => {
      if (live) setQr(url);
    });
    const tick = () => {
      const seconds = Math.max(
        0,
        Math.ceil((new Date(access.expiresAt).getTime() - Date.now()) / 1000),
      );
      setRemaining(seconds);
      if (!seconds) {
        setQr("");
        setAccess(null);
      }
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => {
      live = false;
      clearInterval(timer);
    };
  }, [access]);
  function close() {
    setSelected(null);
    setAccess(null);
    setQr("");
    setError("");
  }
  async function generate() {
    if (!selected) return;
    setBusy(true);
    setError("");
    setAccess(null);
    setQr("");
    try {
      setAccess(
        await post("/me/check-in-tokens", { passId: selected.id, gymId }),
      );
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "No se pudo generar el código.",
      );
    } finally {
      setBusy(false);
    }
  }
  const list = (resource.data?.data || []).filter(
    (p) => filter === "ALL" || p.status === filter,
  );
  return (
    <>
      <AccountHeading
        eyebrow="MI CUENTA / PASES"
        title="TUS PRÓXIMAS"
        accent="VISITAS."
        description="Saldo, vigencia y acceso en un solo lugar."
      />
      <ResourceMessage {...resource} />
      <div className="filter-row">
        {[
          ["ALL", "Todos"],
          ["ACTIVE", "Activos"],
          ["USED", "Usados"],
          ["EXPIRED", "Vencidos"],
        ].map(([value, label]) => (
          <button
            key={value}
            className="chip"
            aria-pressed={filter === value}
            onClick={() => setFilter(value)}
          >
            {label}
          </button>
        ))}
      </div>
      {!resource.loading && !resource.error && !list.length ? (
        <EmptyState
          title="Aún no hay pases aquí."
          action={
            <Link className="button primary" href="/gimnasios">
              Explorar gimnasios ↗
            </Link>
          }
        >
          Elige un gimnasio y prueba una compra sandbox para obtener tu primer
          pase.
        </EmptyState>
      ) : (
        <div className="pass-list">
          {list.map((p) => (
            <article className="live-card" key={p.id}>
              <span className="badge">
                {p.status === "ACTIVE"
                  ? "ACTIVO"
                  : p.status === "USED"
                    ? "USADO"
                    : "VENCIDO"}{" "}
                · SANDBOX
              </span>
              <h3>{p.name}</h3>
              <strong className="pass-balance">
                {p.remaining}
                <small> / {p.visits} visitas</small>
              </strong>
              <p>
                Vence:{" "}
                {new Date(p.expiresAt).toLocaleDateString("es-PE", {
                  timeZone: "America/Lima",
                })}
              </p>
              <Button
                disabled={p.status !== "ACTIVE"}
                onClick={() => {
                  setSelected(p);
                  setGymId(p.eligibleGymIds[0]);
                  setError("");
                }}
              >
                Generar QR temporal ↗
              </Button>
            </article>
          ))}
        </div>
      )}
      <Modal open={!!selected} title="Tu próximo ingreso." onClose={close}>
        <p>
          El código vence en 60 segundos. Cada ingreso confirmado descuenta una
          sola visita.
        </p>
        <label className="form-field">
          <span>Gimnasio elegible</span>
          <select
            value={gymId}
            onChange={(e) => {
              setGymId(e.target.value);
              setAccess(null);
              setQr("");
            }}
          >
            {gyms.data?.data
              .filter((g) => selected?.eligibleGymIds.includes(g.id))
              .map((g) => (
                <option value={g.id} key={g.id}>
                  {g.name}
                </option>
              ))}
          </select>
        </label>
        {error && (
          <p className="form-feedback error-message" role="alert">
            {error}
          </p>
        )}
        {qr && access ? (
          <div className="pass-qr">
            <img src={qr} alt="Código QR temporal de acceso" />
            <p aria-live="polite">Vence en {remaining} segundos</p>
            <label className="form-field">
              <span>Código manual alternativo</span>
              <textarea
                readOnly
                value={access.token}
                aria-label="Código manual temporal"
              />
            </label>
            <p>
              El pase se consume al validarlo en recepción, no al mostrarlo.
            </p>
          </div>
        ) : (
          <p className="muted">
            Genera un nuevo código cuando estés en recepción.
          </p>
        )}
        <Button loading={busy} onClick={generate}>
          {access ? "Renovar código" : "Generar código de acceso"}
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            close();
            void resource.reload();
          }}
        >
          Cerrar y actualizar saldo
        </Button>
      </Modal>
    </>
  );
}
export function ActivityView() {
  const r = useResource<{ data: Visit[] }>("/me/activity");
  return (
    <>
      <AccountHeading
        eyebrow="MI CUENTA / ACTIVIDAD"
        title="CADA VISITA"
        accent="CUENTA."
        description="Tus ingresos confirmados por el gimnasio."
      />
      <ResourceMessage {...r} />
      {r.data && !r.data.data.length ? (
        <EmptyState
          title="Tu historia empieza aquí."
          action={
            <Link className="button primary" href="/gimnasios">
              Explorar gimnasios ↗
            </Link>
          }
        >
          Todavía no hay ingresos confirmados.
        </EmptyState>
      ) : (
        <div className="activity-list">
          {r.data?.data.map((v) => (
            <article key={v.id} className="live-card">
              <span className="eyebrow lime">INGRESO CONFIRMADO</span>
              <h3>{v.gym.name}</h3>
              <p>
                {v.gym.district} ·{" "}
                {new Date(v.createdAt).toLocaleString("es-PE", {
                  timeZone: "America/Lima",
                })}
              </p>
              <p>{v.pass.name}</p>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
export function Checkout({ offerId }: { offerId: string }) {
  const { user, loading } = useSession();
  const offers = useResource<{ data: Offer[] }>("/offers");
  const [gymId, setGymId] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [paid, setPaid] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [key] = useState(() => crypto.randomUUID());
  const offer = offers.data?.data.find((o) => o.id === offerId);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!offer) return;
    setBusy(true);
    setError("");
    try {
      const current =
        order ||
        (await api<Order>("/orders", {
          method: "POST",
          headers: { "Idempotency-Key": key },
          body: JSON.stringify({
            offerId,
            ...(offer.kind === "DAY_PASS"
              ? { gymId: gymId || offer.gyms[0]?.id }
              : {}),
          }),
        }));
      setOrder(current);
      await post(`/orders/${current.id}/confirm-sandbox`, {
        sandboxConsent: true,
      });
      setPaid(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo completar.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="container page-space checkout-page">
      <p className="eyebrow lime">TU ACCESO / CHECKOUT SANDBOX</p>
      <h1 className="page-title">
        EL SIGUIENTE
        <br />
        <span>PASO ES TUYO.</span>
      </h1>
      <ResourceMessage {...offers} />
      {paid ? (
        <div className="live-card" role="status">
          <h2>Tu pase está disponible.</h2>
          <p>Compra sandbox confirmada. No se ha cobrado dinero real.</p>
          <Link className="button primary" href="/app/pases">
            Ver mis pases ↗
          </Link>
        </div>
      ) : offer ? (
        <div className="checkout-grid">
          <article className="live-card">
            <span className="badge">DATOS Y PAGO DE PRUEBA</span>
            <h2>{offer.name}</h2>
            <p>{offer.description}</p>
            <strong className="price">{soles(offer.priceCents)}</strong>
            <ul className="conditions">
              {offer.conditions.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
            <p>
              {offer.visits} visitas · Vigencia: {offer.validityDays} días ·
              Máximo {offer.maxPerDay} por día y {offer.maxPerGym} por gimnasio.
            </p>
            <h3>Gimnasios elegibles</h3>
            <p>{offer.gyms.map((g) => g.name).join(", ")}</p>
          </article>
          <form className="live-card checkout-form" onSubmit={submit}>
            <h2>Todo claro.</h2>
            <p>
              Los precios se calculan en el servidor. Este entorno emite pases
              de prueba y registra ingresos sandbox.
            </p>
            {offer.kind === "DAY_PASS" && (
              <label className="form-field">
                <span>Elige tu gimnasio</span>
                <select
                  value={gymId || offer.gyms[0]?.id || ""}
                  onChange={(e) => {
                    setGymId(e.target.value);
                    setOrder(null);
                  }}
                  disabled={!!order}
                >
                  {offer.gyms.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <label className="check-field">
              <input type="checkbox" required />
              <span>
                Entiendo que es una compra sandbox, sin cobro real, y revisé las
                condiciones.
              </span>
            </label>
            {error && (
              <p className="form-feedback error-message" role="alert">
                {error}
              </p>
            )}
            {loading ? (
              <p>Cargando cuenta…</p>
            ) : user ? (
              <Button type="submit" loading={busy}>
                Confirmar compra sandbox ↗
              </Button>
            ) : (
              <Link
                className="button primary"
                href={
                  "/login?next=" + encodeURIComponent("/checkout/" + offerId)
                }
              >
                Inicia sesión para continuar ↗
              </Link>
            )}
            <p className="small muted">No se solicitan datos de tarjeta.</p>
          </form>
        </div>
      ) : !offers.loading && !offers.error ? (
        <EmptyState
          title="Oferta no disponible."
          action={
            <Link href="/gimnasios" className="button primary">
              Volver al catálogo
            </Link>
          }
        >
          Puede haber sido retirada por el administrador.
        </EmptyState>
      ) : null}
    </div>
  );
}
