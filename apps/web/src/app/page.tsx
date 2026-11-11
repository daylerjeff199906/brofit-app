import Link from "next/link";
import {
  ArrowUpRight,
  ArrowDown,
  Dumbbell,
  MapPin,
  Ticket,
} from "lucide-react";
import { GymCard } from "@brofit/ui";
import { HomeSearch, Plans, FAQ, Steps } from "@/components/experiences";
import { gyms } from "@/lib/demo";
export default function Home() {
  return (
    <>
      <section className="hero container">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="live-dot" /> EL FITNESS SE MUEVE CONTIGO
          </div>
          <h1>
            ENTRENA
            <br />
            DONDE
            <br />
            <span>QUIERAS.</span>
          </h1>
          <p>
            Descubre gimnasios, compara instalaciones y compra pases o
            membresías flexibles desde un solo lugar.
          </p>
          <div className="hero-actions">
            <Link className="button primary" href="/gimnasios">
              Explorar gimnasios <ArrowUpRight size={20} />
            </Link>
            <Link className="text-link" href="/como-funciona">
              Cómo funciona{" "}
              <span className="round-arrow">
                <ArrowUpRight size={18} />
              </span>
            </Link>
          </div>
          <div className="hero-bottom">
            <span className="mono">PRIMERA VERSIÓN · DEMO</span>
            <ArrowDown size={19} />
          </div>
        </div>
        <div className="hero-visual">
          <img
            src="/images/athlete-editorial.png"
            alt="Atleta en entrenamiento: fotografía referencial DEMO"
            fetchPriority="high"
          />
          <span className="image-label mono">
            ESPACIOS DISTINTOS.
            <br />
            LAS MISMAS GANAS.
          </span>
          <div className="hero-stamp">
            <ArrowUpRight size={55} strokeWidth={1.6} />
            <span>
              CAMBIA DE LUGAR.
              <br />
              NO DE OBJETIVO.
            </span>
          </div>
          <span className="photo-credit mono">FOTO REFERENCIAL · DEMO</span>
        </div>
      </section>
      <section className="mobile-process" aria-label="Tu recorrido">
        <div>
          <strong>01</strong>
          <span>
            <h3>Explora gimnasios</h3>
            <p>Conoce los espacios disponibles.</p>
          </span>
        </div>
        <div>
          <strong>02</strong>
          <span>
            <h3>Elige tu acceso</h3>
            <p>Un pase o varias visitas.</p>
          </span>
        </div>
        <div>
          <strong>03</strong>
          <span>
            <h3>Entrena a tu ritmo</h3>
            <p>Cuando el sistema esté conectado, usa tu pase.</p>
          </span>
        </div>
      </section>
      <section className="search-section container">
        <HomeSearch />
        <p className="demo-note">
          <span>DEMO</span> Explora una idea en movimiento. Gimnasios, precios y
          planes de ejemplo; sin compras reales.
        </p>
      </section>
      <div className="brand-strip">
        <div className="container">
          <span>MENOS EXCUSAS.</span>
          <span aria-hidden="true">↗</span>
          <span>MÁS POSIBILIDADES.</span>
          <span aria-hidden="true">↗</span>
          <span>MÁS MOVIMIENTO.</span>
          <span aria-hidden="true">↗</span>
        </div>
      </div>
      <section className="section container">
        <div className="section-heading">
          <div>
            <p className="eyebrow lime">01 / ENCUENTRA TU ESPACIO</p>
            <h2>
              Tu próximo entrenamiento
              <br />
              empieza en otro lugar.
            </h2>
          </div>
          <Link href="/gimnasios" className="text-link">
            Explorar gimnasios <ArrowUpRight size={20} />
          </Link>
        </div>
        <div className="gym-grid">
          {gyms.slice(0, 3).map((g) => (
            <GymCard key={g.id} {...g} href={`/gimnasios/${g.slug}/`} />
          ))}
        </div>
        <div className="benefits">
          <div>
            <MapPin />
            <span>
              Elige dónde.<small>Cerca de casa, del trabajo o de ti.</small>
            </span>
          </div>
          <div>
            <Ticket />
            <span>
              Elige cómo.<small>Un pase o visitas en distintos espacios.</small>
            </span>
          </div>
          <div>
            <Dumbbell />
            <span>
              Entrena a tu manera.
              <small>Encuentra el equipo para tu objetivo.</small>
            </span>
          </div>
        </div>
      </section>
      <section className="section cream-section">
        <div className="container">
          <div className="section-heading">
            <div>
              <p className="eyebrow">02 / SIN DAR TANTAS VUELTAS</p>
              <h2>
                Tú pones las ganas.
                <br />
                Así funciona el resto.
              </h2>
            </div>
            <Link className="text-link" href="/como-funciona">
              Conoce el recorrido <ArrowUpRight size={20} />
            </Link>
          </div>
          <Steps />
        </div>
      </section>
      <section className="section container">
        <div className="section-heading">
          <div>
            <p className="eyebrow lime">03 / MUÉVETE COMO QUIERAS</p>
            <h2>
              Un día o muchos.
              <br />
              Siempre a tu ritmo.
            </h2>
          </div>
          <p className="section-aside">
            Pases individuales y membresías con visitas definidas.
            <br />
            Sin promesas de acceso ilimitado.
          </p>
        </div>
        <Plans />
      </section>
      <section className="partner-banner container">
        <div>
          <p className="eyebrow">PARA LOS QUE HACEN POSIBLE EL MOVIMIENTO</p>
          <h2>
            Tu gimnasio.
            <br />
            Su próximo lugar favorito.
          </h2>
          <p>
            Conecta tu espacio con personas que quieren entrenar.
            <br />
            Conoce la propuesta para gimnasios aliados.
          </p>
          <Link className="button dark-button" href="/para-gimnasios">
            Afiliar mi gimnasio <ArrowUpRight size={20} />
          </Link>
        </div>
        <span className="giant-arrow" aria-hidden="true">
          ↗
        </span>
      </section>
      <section className="section container faq-section">
        <div>
          <p className="eyebrow lime">04 / TODO CLARO, ANTES DE EMPEZAR</p>
          <h2>
            Buenas preguntas.
            <br />
            Respuestas directas.
          </h2>
          <p className="muted">Conoce la idea antes de dar el primer paso.</p>
        </div>
        <FAQ />
      </section>
      <section className="final-cta container">
        <p className="eyebrow">EL MEJOR LUGAR ES DONDE EMPIEZAS.</p>
        <h2>
          HOY SE
          <br />
          <span>ENTRENA.</span>
        </h2>
        <Link className="button primary" href="/gimnasios">
          Encuentra tu próximo gimnasio <ArrowUpRight size={20} />
        </Link>
      </section>
    </>
  );
}
