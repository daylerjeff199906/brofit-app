"use client";
import { useEffect, useState } from "react";
import {
  Search,
  ArrowUpRight,
  MapPin,
  SlidersHorizontal,
  ArrowRight,
  Compass,
  Ticket,
  ScanLine,
} from "lucide-react";
import {
  Button,
  Input,
  FilterChip,
  GymCard,
  EmptyState,
  PlanCard,
  Modal,
  Badge,
} from "@brofit/ui";
import { faqs } from "@/lib/demo";
import type { Gym } from "@brofit/types";
import { useResource } from "./use-resource";
import { ResourceMessage } from "./account-live";
import { soles, type Offer } from "@/lib/api";
import Link from "next/link";
import { filterGyms } from "@/lib/catalog";
export function HomeSearch() {
  const resource = useResource<{ data: Gym[] }>("/gyms?pageSize=100");
  const gyms = resource.data?.data || [];
  const [district, setDistrict] = useState("");
  const [query, setQuery] = useState("");
  return (
    <form action="/gimnasios/" className="home-search">
      <label>
        <MapPin size={20} />
        <span>
          <small>¿DÓNDE ENTRENAMOS?</small>
          <select
            name="distrito"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            aria-label="Distrito"
          >
            <option value="">Lima · Todos los distritos</option>
            {gyms.map((g) => (
              <option key={g.id}>{g.district}</option>
            ))}
          </select>
        </span>
      </label>
      <label className="search-query">
        <Search size={20} />
        <input
          name="q"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Buscar por nombre o equipamiento"
          placeholder="Busca tu próximo gimnasio"
        />
      </label>
      <button className="button primary" type="submit">
        Buscar gimnasios <ArrowUpRight size={19} />
      </button>
    </form>
  );
}
export function Catalog() {
  const resource = useResource<{ data: Gym[] }>("/gyms?pageSize=100");
  const gyms = resource.data?.data || [];
  const [query, setQuery] = useState("");
  const [district, setDistrict] = useState("");
  const [category, setCategory] = useState("Todos");
  useEffect(() => {
    const initial = new URLSearchParams(window.location.search);
    setQuery(initial.get("q") || "");
    setDistrict(initial.get("distrito") || "");
    setCategory(initial.get("tipo") || "Todos");
  }, []);
  const [equipment, setEquipment] = useState("");
  const [service, setService] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("name");
  const filtered = filterGyms(gyms, {
    query,
    district,
    category,
    equipment,
    service,
    maxPrice,
    sort,
  });
  function reset() {
    setQuery("");
    setDistrict("");
    setCategory("Todos");
    setEquipment("");
    setService("");
    setMaxPrice("");
  }
  return (
    <>
      <ResourceMessage {...resource} />
      <div className="catalog-controls">
        <Input
          label="Busca por nombre, distrito o equipamiento"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="¿Cuál es tu próximo espacio?"
        />
        <label className="input-field">
          <span>Distrito · Lima</span>
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
          >
            <option value="">Todos los distritos</option>
            {gyms.map((g) => (
              <option key={g.id}>{g.district}</option>
            ))}
          </select>
        </label>
        <label className="input-field">
          <span>Precio máximo del pase DEMO</span>
          <select
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          >
            <option value="">Cualquier precio</option>
            <option value="25">Hasta S/ 25</option>
            <option value="30">Hasta S/ 30</option>
            <option value="35">Hasta S/ 35</option>
          </select>
        </label>
      </div>
      <div className="filter-row">
        {["Todos", "Musculación", "Funcional", "Cardio"].map((c) => (
          <FilterChip
            key={c}
            selected={c === category}
            onClick={() => setCategory(c)}
          >
            {c}
          </FilterChip>
        ))}
        <details className="extra-filters">
          <summary>
            <SlidersHorizontal size={16} /> Más filtros
          </summary>
          <div>
            <label className="input-field">
              <span>Equipamiento</span>
              <select
                value={equipment}
                onChange={(e) => setEquipment(e.target.value)}
              >
                <option value="">Todo el equipamiento</option>
                {Array.from(new Set(gyms.flatMap((g) => g.equipment))).map(
                  (e) => (
                    <option key={e}>{e}</option>
                  ),
                )}
              </select>
            </label>
            <label className="input-field">
              <span>Servicios</span>
              <select
                value={service}
                onChange={(e) => setService(e.target.value)}
              >
                <option value="">Todos los servicios</option>
                {Array.from(new Set(gyms.flatMap((g) => g.services))).map(
                  (s) => (
                    <option key={s}>{s}</option>
                  ),
                )}
              </select>
            </label>
          </div>
        </details>
      </div>
      <div className="results-line">
        <p aria-live="polite">
          {filtered.length} espacios de ejemplo{" "}
          <span>· Todos los resultados son DEMO</span>
        </p>
        <label>
          Ordenar:{" "}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            aria-label="Ordenar resultados"
          >
            <option value="name">Nombre</option>
            <option value="price">Menor precio</option>
          </select>
        </label>
      </div>
      {filtered.length ? (
        <div className="gym-grid catalog-grid">
          {filtered.map((g) => (
            <GymCard key={g.id} {...g} href={`/gimnasios/${g.slug}/`} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No encontramos espacios con esos filtros."
          action={
            <Button onClick={reset}>
              Limpiar filtros <ArrowRight size={17} />
            </Button>
          }
        >
          Prueba otro distrito, equipamiento o precio para seguir explorando.
        </EmptyState>
      )}
      <div className="info-strip">
        <MapPin size={21} />
        <p>
          Puedes buscar sin compartir tu ubicación. El mapa y los horarios en
          tiempo real estarán disponibles cuando existan gimnasios verificados.
        </p>
      </div>
    </>
  );
}
export function Plans() {
  const resource = useResource<{ data: Offer[] }>("/offers");
  const available = resource.data?.data || [];
  const plans = available.filter(
    (p, i) =>
      p.kind === "MEMBERSHIP" ||
      available.findIndex((o) => o.kind === "DAY_PASS") === i,
  );
  const [selected, setSelected] = useState<string | null>(null);
  const plan = plans.find((p) => p.id === selected);
  return (
    <>
      <div className="plans-grid">
        <ResourceMessage {...resource} />
        {plans.map((p, i) => (
          <PlanCard
            key={p.id}
            {...p}
            price={p.priceCents / 100}
            featured={i === 1}
            onSelect={() => setSelected(p.id)}
          />
        ))}
      </div>
      <Modal
        open={!!plan}
        title={plan?.name || "Condiciones"}
        onClose={() => setSelected(null)}
      >
        <Badge>OFERTA DEMO · PAGO SANDBOX</Badge>
        <p>{plan?.description}</p>
        <ul className="conditions">
          {plan?.conditions.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
        <p>
          Los precios y la elegibilidad son ejemplos. La política de cancelación
          y reembolso debe definirse antes del piloto comercial.
        </p>
        {plan && (
          <Link className="button primary" href={`/checkout/${plan.id}`}>
            Continuar con {soles(plan.priceCents)} · sandbox ↗
          </Link>
        )}
      </Modal>
    </>
  );
}
export function FAQ() {
  return (
    <div className="faq-list">
      {faqs.map(([q, a], i) => (
        <details key={q}>
          <summary>
            <span className="mono">0{i + 1}</span>
            {q}
            <span className="faq-plus">+</span>
          </summary>
          <p>{a}</p>
        </details>
      ))}
    </div>
  );
}
export function Steps() {
  return (
    <div className="steps-grid">
      {[
        {
          icon: Compass,
          title: "Encuentra tu espacio.",
          copy: "Explora por distrito, equipamiento y precio. Elige dónde te dan ganas de entrenar.",
        },
        {
          icon: Ticket,
          title: "Elige cómo moverte.",
          copy: "Un pase por un día o una membresía con visitas. Conoce siempre las condiciones.",
        },
        {
          icon: ScanLine,
          title: "Llega. Valida. Entrena.",
          copy: "Genera tu código temporal y valídalo en recepción. En este entorno, los ingresos y pagos son de prueba.",
        },
      ].map((s, i) => (
        <article key={s.title}>
          <div className="step-top">
            <s.icon size={29} />
            <span className="mono">0{i + 1} /</span>
          </div>
          <h3>{s.title}</h3>
          <p>{s.copy}</p>
        </article>
      ))}
    </div>
  );
}
export { PartnerApplication as PartnerInterest } from "./partner-application";
