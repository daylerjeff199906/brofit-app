"use client";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@brofit/ui";
import { api, post, soles, type Offer } from "@/lib/api";
import { useSession } from "./session";
import { useResource } from "./use-resource";
import { ResourceMessage } from "./account-live";
import { ApplicationsManager } from "./partner-application";
type ManagedGym = {
  id: string;
  name: string;
  slug: string;
  status: "ACTIVE" | "PAUSED" | "PENDING";
  description: string;
  hours: string;
  equipment: string[];
  services: string[];
  district: string;
};
function Gate({
  children,
  admin = false,
}: {
  children: ReactNode;
  admin?: boolean;
}) {
  const { user, loading } = useSession();
  const router = useRouter();
  const path = usePathname();
  useEffect(() => {
    if (!loading && !user)
      router.replace("/login?next=" + encodeURIComponent(path));
  }, [user, loading, router, path]);
  if (loading || !user)
    return (
      <div className="container page-space" role="status">
        Cargando…
      </div>
    );
  if (admin ? user.role !== "PLATFORM_ADMIN" : user.role === "CUSTOMER")
    return (
      <div className="container page-space">
        <h1>Acceso restringido.</h1>
        <p>Tu cuenta no tiene permisos para este panel.</p>
        <Link href="/app" className="button primary">
          Volver a mi espacio
        </Link>
      </div>
    );
  return children;
}
const errorText = (e: unknown) =>
  e instanceof Error ? e.message : "No se pudo completar la operación.";
export function Partner() {
  return (
    <Gate>
      <PartnerContent />
    </Gate>
  );
}
function PartnerContent() {
  const gyms = useResource<ManagedGym[]>("/partner/gym");
  const visits = useResource<{
    data: {
      id: string;
      createdAt: string;
      gym: { name: string };
      settlement: { amountCents: number };
    }[];
  }>("/partner/check-ins");
  const [gymId, setGymId] = useState("");
  const gym = gyms.data?.find((g) => g.id === (gymId || gyms.data?.[0]?.id));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState("");
  const [notice, setNotice] = useState("");
  async function redeem(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!gym) return;
    setBusy(true);
    setError("");
    setReceipt("");
    try {
      const data = new FormData(e.currentTarget);
      const result = await post<{
        alreadyRedeemed: boolean;
        receipt: { id: string };
      }>("/partner/check-ins/redeem", {
        gymId: gym.id,
        token: String(data.get("token")).trim(),
      });
      setReceipt(
        result.alreadyRedeemed
          ? "Este ingreso ya estaba registrado. No se descontó otra visita."
          : "Ingreso confirmado. ¡A entrenar!",
      );
      await visits.reload();
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  }
  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!gym) return;
    const data = new FormData(e.currentTarget);
    setBusy(true);
    setError("");
    try {
      await api("/partner/gym/" + gym.id, {
        method: "PATCH",
        body: JSON.stringify({
          description: data.get("description"),
          hours: data.get("hours"),
          equipment: String(data.get("equipment"))
            .split(",")
            .map((v) => v.trim())
            .filter(Boolean),
          services: String(data.get("services"))
            .split(",")
            .map((v) => v.trim())
            .filter(Boolean),
        }),
      });
      setNotice("Cambios guardados y enviados a revisión del administrador.");
      await gyms.reload();
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="container operations-page">
      <Link className="back-link" href="/app">
        ← Mi cuenta
      </Link>
      <p className="eyebrow lime">PORTAL DEL GIMNASIO</p>
      <h1 className="page-title">
        RECIBE.
        <br />
        <span>VALIDA. ENTRENA.</span>
      </h1>
      <ResourceMessage {...gyms} />
      <label className="form-field ops-gym-select">
        <span>Tu gimnasio</span>
        <select
          value={gym?.id || ""}
          onChange={(e) => {
            setGymId(e.target.value);
            setReceipt("");
            setNotice("");
          }}
        >
          {gyms.data?.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
      </label>
      {error && (
        <p role="alert" className="form-feedback error-message">
          {error}
        </p>
      )}
      {gym && (
        <div className="operations-grid">
          <section className="live-card">
            <p className="eyebrow lime">01 / RECEPCIÓN</p>
            <h2>Valida un ingreso.</h2>
            <p>
              Pega el código manual del pase temporal. El servidor comprobará su
              vigencia, gimnasio y saldo antes de registrar el acceso.
            </p>
            <form onSubmit={redeem} className="operation-form">
              <label className="form-field">
                <span>Código temporal</span>
                <textarea
                  name="token"
                  required
                  minLength={64}
                  maxLength={64}
                  autoComplete="off"
                  placeholder="Código de 64 caracteres del pase"
                />
              </label>
              <Button loading={busy} type="submit">
                Validar ingreso ↗
              </Button>
            </form>
            {receipt && (
              <div className="receipt-card" role="status">
                <h3>{receipt}</h3>
                <p>Registro guardado en el historial del gimnasio.</p>
              </div>
            )}
          </section>
          <section className="live-card">
            <p className="eyebrow lime">02 / TU FICHA</p>
            <h2>{gym.name}</h2>
            <span className="badge">{gym.status}</span>
            <p>
              Los cambios del aliado requieren revisión; la ficha quedará
              pendiente hasta que la apruebe administración.
            </p>
            <form key={gym.id} onSubmit={save} className="operation-form">
              <label className="form-field">
                <span>Descripción</span>
                <textarea
                  name="description"
                  defaultValue={gym.description}
                  maxLength={2000}
                />
              </label>
              <label className="form-field">
                <span>Horarios</span>
                <input name="hours" defaultValue={gym.hours} maxLength={500} />
              </label>
              <label className="form-field">
                <span>Equipamiento, separado por comas</span>
                <input
                  name="equipment"
                  defaultValue={gym.equipment.join(", ")}
                />
              </label>
              <label className="form-field">
                <span>Servicios, separados por comas</span>
                <input name="services" defaultValue={gym.services.join(", ")} />
              </label>
              <Button loading={busy} type="submit">
                Enviar cambios a revisión ↗
              </Button>
            </form>
            {notice && (
              <p role="status" className="form-feedback">
                {notice}
              </p>
            )}
          </section>
        </div>
      )}
      <section className="section">
        <h2>Ingresos confirmados</h2>
        <ResourceMessage {...visits} />
        <Table
          headers={["Fecha · Lima", "Gimnasio", "Liquidación sandbox"]}
          rows={(visits.data?.data || []).map((v) => [
            new Date(v.createdAt).toLocaleString("es-PE", {
              timeZone: "America/Lima",
            }),
            v.gym.name,
            soles(v.settlement?.amountCents || 0),
          ])}
        />
      </section>
    </div>
  );
}
export function Administration() {
  return (
    <Gate admin>
      <AdminContent />
    </Gate>
  );
}
function AdminContent() {
  const gyms = useResource<{ data: ManagedGym[] }>("/admin/gyms");
  const offers = useResource<{ data: (Offer & { active: boolean })[] }>(
    "/admin/offers",
  );
  const orders = useResource<{
    data: {
      id: string;
      name: string;
      priceCents: number;
      status: string;
      createdAt: string;
    }[];
  }>("/admin/transactions");
  const settlements = useResource<{
    data: {
      id: string;
      amountCents: number;
      checkIn: { gymId: string; createdAt: string };
    }[];
  }>("/admin/settlements");
  const audit = useResource<{
    data: { id: string; action: string; entityId: string; createdAt: string }[];
  }>("/admin/audit");
  const [tab, setTab] = useState("gyms");
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  async function action(id: string, work: () => Promise<unknown>) {
    setBusy(id);
    setError("");
    setNotice("");
    try {
      await work();
      setNotice("Cambios guardados.");
      await Promise.all([gyms.reload(), offers.reload(), audit.reload()]);
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy("");
    }
  }
  async function createGym(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget,
      d = new FormData(form);
    await action("create", async () => {
      await post("/admin/gyms", {
        name: d.get("name"),
        slug: d.get("slug"),
        district: d.get("district"),
        address: d.get("address"),
        category: d.get("category"),
        description: d.get("description"),
        hours: d.get("hours"),
        equipment: String(d.get("equipment"))
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        services: [],
        image: "/images/gym-1.jpg",
      });
      form.reset();
    });
  }
  async function createOffer(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget,
      d = new FormData(form);
    await action("offer-create", async () => {
      await post("/admin/offers", {
        name: d.get("name"),
        description: d.get("description"),
        kind: d.get("kind"),
        priceCents: Math.round(Number(d.get("price")) * 100),
        visits: Number(d.get("visits")),
        validityDays: Number(d.get("days")),
        maxPerDay: Number(d.get("maxPerDay")),
        maxPerGym: Number(d.get("maxPerGym")),
        conditions: String(d.get("conditions")).split("\n").filter(Boolean),
        gymIds: d.getAll("gymIds"),
      });
      form.reset();
    });
  }
  return (
    <div className="container operations-page">
      <Link className="back-link" href="/app">
        ← Mi cuenta
      </Link>
      <p className="eyebrow lime">ADMINISTRACIÓN BROFIT</p>
      <h1 className="page-title">
        TODO EN
        <br />
        <span>MOVIMIENTO.</span>
      </h1>
      <nav className="operations-nav" aria-label="Administración">
        {[
          ["gyms", "Gimnasios"],
          ["offers", "Ofertas"],
          ["transactions", "Órdenes"],
          ["settlements", "Liquidaciones"],
          ["audit", "Auditoría"],
        ].map(([value, label]) => (
          <button
            key={value}
            className="chip"
            aria-pressed={value === tab}
            onClick={() => setTab(value)}
          >
            {label}
          </button>
        ))}
      </nav>
      {error && (
        <p className="form-feedback error-message" role="alert">
          {error}
        </p>
      )}
      {notice && (
        <p className="form-feedback" role="status">
          {notice}
        </p>
      )}
      {tab === "gyms" && (
        <>
          <ResourceMessage {...gyms} />
          <div className="admin-card-list">
            {gyms.data?.data.map((g) => (
              <article className="live-card" key={g.id}>
                <span className="badge">{g.status} · DEMO</span>
                <h3>{g.name}</h3>
                <p>{g.district}</p>
                <div className="inline-actions">
                  <Button
                    disabled={!!busy || g.status === "ACTIVE"}
                    onClick={() =>
                      action(g.id, () =>
                        api("/admin/gyms/" + g.id, {
                          method: "PATCH",
                          body: JSON.stringify({ status: "ACTIVE" }),
                        }),
                      )
                    }
                  >
                    Aprobar
                  </Button>
                  <Button
                    variant="secondary"
                    disabled={!!busy || g.status === "PAUSED"}
                    onClick={() =>
                      action(g.id, () =>
                        api("/admin/gyms/" + g.id, {
                          method: "PATCH",
                          body: JSON.stringify({ status: "PAUSED" }),
                        }),
                      )
                    }
                  >
                    Pausar
                  </Button>
                </div>
              </article>
            ))}
          </div>
          <details className="live-card">
            <summary>Crear gimnasio DEMO</summary>
            <form className="operation-form" onSubmit={createGym}>
              {[
                ["name", "Nombre"],
                ["slug", "Slug (letras minúsculas y guiones)"],
                ["district", "Distrito"],
                ["address", "Dirección de ejemplo"],
                ["hours", "Horario de ejemplo"],
                ["equipment", "Equipamiento, separado por comas"],
              ].map(([name, label]) => (
                <label className="form-field" key={name}>
                  <span>{label}</span>
                  <input
                    name={name}
                    required
                    maxLength={
                      name === "equipment"
                        ? 2000
                        : name === "address"
                          ? 250
                          : 120
                    }
                  />
                </label>
              ))}
              <label className="form-field">
                <span>Tipo de entrenamiento</span>
                <select name="category">
                  <option>Musculación</option>
                  <option>Funcional</option>
                  <option>Cardio</option>
                </select>
              </label>
              <label className="form-field">
                <span>Descripción</span>
                <textarea name="description" maxLength={2000} required />
              </label>
              <Button type="submit" loading={busy === "create"}>
                Crear ficha para revisión ↗
              </Button>
            </form>
          </details>
        </>
      )}
      {tab === "gyms" && <ApplicationsManager gyms={gyms.data?.data || []} />}
      {tab === "offers" && (
        <>
          <ResourceMessage {...offers} />
          <div className="admin-card-list">
            {offers.data?.data.map((o) => (
              <article className="live-card" key={o.id}>
                <span className="badge">
                  {o.active ? "PUBLICADA" : "RETIRADA"}
                </span>
                <h3>{o.name}</h3>
                <p>{o.gyms.map((g) => g.name).join(", ")}</p>
                <form
                  className="admin-offer-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const d = new FormData(e.currentTarget);
                    void action(o.id, () =>
                      api("/admin/offers/" + o.id, {
                        method: "PATCH",
                        body: JSON.stringify({
                          priceCents: Math.round(Number(d.get("price")) * 100),
                        }),
                      }),
                    );
                  }}
                >
                  <label className="form-field">
                    <span>Precio en soles · sandbox</span>
                    <input
                      name="price"
                      type="number"
                      min="1"
                      max="100000"
                      step="0.01"
                      defaultValue={o.priceCents / 100}
                      required
                    />
                  </label>
                  <Button type="submit" disabled={!!busy}>
                    Guardar precio
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={!!busy}
                    onClick={() =>
                      action(o.id, () =>
                        api("/admin/offers/" + o.id, {
                          method: "PATCH",
                          body: JSON.stringify({ active: !o.active }),
                        }),
                      )
                    }
                  >
                    {o.active ? "Retirar oferta" : "Publicar oferta"}
                  </Button>
                </form>
              </article>
            ))}
          </div>
          <details className="live-card">
            <summary>Crear oferta sandbox</summary>
            <form className="operation-form" onSubmit={createOffer}>
              <label className="form-field">
                <span>Nombre</span>
                <input name="name" required maxLength={120} />
              </label>
              <label className="form-field">
                <span>Descripción</span>
                <textarea name="description" maxLength={2000} />
              </label>
              <label className="form-field">
                <span>Tipo</span>
                <select name="kind">
                  <option value="DAY_PASS">
                    Pase individual (1 visita y 1 gimnasio)
                  </option>
                  <option value="MEMBERSHIP">Membresía</option>
                </select>
              </label>
              <div className="form-row">
                {[
                  ["price", "Precio S/", "25"],
                  ["visits", "Visitas", "1"],
                  ["days", "Vigencia en días", "7"],
                  ["maxPerDay", "Máximo por día", "1"],
                  ["maxPerGym", "Máximo por gimnasio", "1"],
                ].map(([name, label, value]) => (
                  <label className="form-field" key={name}>
                    <span>{label}</span>
                    <input
                      name={name}
                      type="number"
                      min="1"
                      max={name === "price" ? 100000 : 365}
                      step={name === "price" ? "0.01" : "1"}
                      defaultValue={value}
                      required
                    />
                  </label>
                ))}
              </div>
              <fieldset>
                <legend>Gimnasios elegibles</legend>
                {gyms.data?.data.map((g) => (
                  <label className="check-field" key={g.id}>
                    <input name="gymIds" type="checkbox" value={g.id} />
                    <span>{g.name}</span>
                  </label>
                ))}
              </fieldset>
              <label className="form-field">
                <span>Condiciones (una por línea)</span>
                <textarea name="conditions" required maxLength={5000} />
              </label>
              <Button type="submit" loading={busy === "offer-create"}>
                Crear oferta sandbox ↗
              </Button>
            </form>
          </details>
        </>
      )}
      {tab === "transactions" && (
        <>
          <ResourceMessage {...orders} />
          <Table
            headers={["Fecha", "Oferta", "Precio sandbox", "Estado"]}
            rows={(orders.data?.data || []).map((o) => [
              new Date(o.createdAt).toLocaleString("es-PE"),
              o.name,
              soles(o.priceCents),
              o.status,
            ])}
          />
        </>
      )}
      {tab === "settlements" && (
        <>
          <ResourceMessage {...settlements} />
          <Table
            headers={["Fecha de ingreso", "Gimnasio", "Importe de prueba"]}
            rows={(settlements.data?.data || []).map((s) => [
              new Date(s.checkIn.createdAt).toLocaleString("es-PE"),
              gyms.data?.data.find((g) => g.id === s.checkIn.gymId)?.name ||
                s.checkIn.gymId,
              soles(s.amountCents),
            ])}
          />
          <Button
            variant="secondary"
            onClick={() => {
              const rows = settlements.data?.data || [];
              const csv =
                "checkInDate,gymId,amountCents\n" +
                rows
                  .map((r) =>
                    [r.checkIn.createdAt, r.checkIn.gymId, r.amountCents].join(
                      ",",
                    ),
                  )
                  .join("\n");
              const url = URL.createObjectURL(
                new Blob([csv], { type: "text/csv" }),
              );
              const a = document.createElement("a");
              a.href = url;
              a.download = "brofit-liquidaciones-sandbox.csv";
              a.click();
              setTimeout(() => URL.revokeObjectURL(url), 1000);
            }}
          >
            Exportar liquidaciones CSV ↗
          </Button>
        </>
      )}
      {tab === "audit" && (
        <>
          <ResourceMessage {...audit} />
          <Table
            headers={["Fecha", "Acción", "Entidad"]}
            rows={(audit.data?.data || []).map((a) => [
              new Date(a.createdAt).toLocaleString("es-PE"),
              a.action,
              a.entityId,
            ])}
          />
        </>
      )}
    </div>
  );
}
function Table({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="data-table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            {headers.map((h) => (
              <th scope="col" key={h}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((v, j) => (
                <td key={j}>{v}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {!rows.length && (
        <p className="loading-note">No hay registros todavía.</p>
      )}
    </div>
  );
}
