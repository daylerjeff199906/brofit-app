import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Clock, ArrowLeft } from "lucide-react";
import { Badge } from "@brofit/ui";
import { gyms } from "@/lib/demo";
import { OfferButton } from "@/components/experiences";
export function generateStaticParams() {
  return gyms.map((g) => ({ slug: g.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return {
    title: gyms.find((g) => g.slug === slug)?.name || "Gimnasio no encontrado",
  };
}
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const g = gyms.find((g) => g.slug === slug);
  if (!g) notFound();
  return (
    <div className="container page-space">
      <Link className="back-link" href="/gimnasios">
        <ArrowLeft size={16} /> Volver a gimnasios
      </Link>
      <div className="detail-header">
        <div>
          <p className="eyebrow lime">LIMA / {g.district.toUpperCase()}</p>
          <h1 className="detail-title">{g.name}</h1>
          <p>
            <MapPin size={16} /> {g.address}
          </p>
        </div>
        <Badge>GIMNASIO FICTICIO · DEMO</Badge>
      </div>
      <div className="detail-grid">
        <div>
          <div className="detail-photo">
            <img
              src={g.image}
              alt={`Fotografía referencial de entrenamiento para ${g.name}`}
            />
            <span className="badge">IMAGEN REFERENCIAL</span>
          </div>
          <section className="detail-section">
            <p className="eyebrow lime">EL ESPACIO</p>
            <h2>Un lugar para darlo todo.</h2>
            <p>{g.description}</p>
          </section>
          <section className="detail-section" id="equipamiento">
            <h2>Equipamiento y servicios</h2>
            <div className="tag-list">
              {[...g.equipment, ...g.services].map((e) => (
                <span key={e}>{e}</span>
              ))}
            </div>
          </section>
          <section className="detail-section">
            <h2>Horarios de ejemplo</h2>
            <p>
              <Clock size={19} /> {g.hours}
            </p>
            <p className="muted">
              Disponibilidad ilustrativa. No existe información de aforo en
              tiempo real.
            </p>
          </section>
        </div>
        <aside className="pass-panel">
          <Badge>PASE INDIVIDUAL · DEMO</Badge>
          <h2>Hoy, aquí.</h2>
          <p>Una visita a {g.name}.</p>
          <div className="price">
            S/ {g.price.toFixed(2)}
            <small> / visita de ejemplo</small>
          </div>
          <ul className="conditions">
            <li>1 ingreso al gimnasio seleccionado.</li>
            <li>7 días de vigencia de ejemplo.</li>
            <li>Acceso durante el horario publicado, sujeto a aforo.</li>
            <li>No incluye clases ni servicios adicionales.</li>
          </ul>
          <OfferButton />
          <p className="small muted">
            No es una oferta comercial. No se cobra dinero ni se emiten pases en
            esta demo.
          </p>
          <Link href="/planes" className="text-link">
            Conoce las membresías ↗
          </Link>
        </aside>
      </div>
    </div>
  );
}
