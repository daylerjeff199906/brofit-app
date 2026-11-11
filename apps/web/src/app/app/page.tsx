import Link from "next/link";
import { AccountHeading } from "@/components/account-shell";
export const metadata = { title: "Mi espacio · DEMO" };
export default function Page() {
  return (
    <>
      <AccountHeading
        eyebrow="INICIO / MI ESPACIO"
        title="HOLA,"
        accent="¡A ENTRENAR!"
        description="Este es tu espacio personal. Cuando tengas pases, aparecerán aquí."
      />
      <div className="account-stats">
        <article>
          <p className="eyebrow">PASES ACTIVOS</p>
          <strong>00</strong>
          <p>Aún no tienes pases</p>
        </article>
        <article>
          <p className="eyebrow">VISITAS REALIZADAS</p>
          <strong>00</strong>
          <p>Tu actividad comenzará aquí</p>
        </article>
        <article>
          <p className="eyebrow">TU MEMBRESÍA</p>
          <h3>SIN PLAN</h3>
          <p>Explora opciones flexibles</p>
        </article>
      </div>
      <div className="account-main-grid">
        <article className="account-feature">
          <div
            className="inactive-ticket-art"
            aria-label="Pase de ejemplo inactivo, sin QR"
          >
            <span aria-hidden="true">/</span>
            <div>
              BROFIT
              <br />
              <em>— YA</em>
            </div>
            <span aria-hidden="true">/</span>
            <small>PASE DE EJEMPLO · INACTIVO</small>
          </div>
          <div className="account-card-copy">
            <p className="eyebrow lime">MIS PASES</p>
            <h3>TU PRÓXIMO ENTRENAMIENTO COMIENZA AQUÍ.</h3>
            <p>
              No tienes pases activos. Encuentra un gimnasio, consulta su
              equipamiento y elige el acceso que necesitas.
            </p>
            <div className="inline-actions">
              <Link className="button primary" href="/gimnasios">
                Explorar gimnasios ↗
              </Link>
              <Link className="button secondary" href="/app/pases">
                Mis pases →
              </Link>
            </div>
          </div>
        </article>
        <article className="getting-started">
          <p className="eyebrow lime">TU PRIMER PASO</p>
          <h3>LISTO PARA EMPEZAR.</h3>
          {[
            [
              "Explora los gimnasios",
              "Encuentra el espacio y las máquinas que buscas.",
            ],
            [
              "Revisa el tipo de acceso",
              "Consulta pases individuales y membresías.",
            ],
            [
              "Entrena a tu ritmo",
              "Cuando el sistema esté conectado, usa tu pase.",
            ],
          ].map(([title, desc], i) => (
            <div className="mini-step" key={title}>
              <strong>0{i + 1}</strong>
              <div>
                <h4>{title}</h4>
                <p>{desc}</p>
              </div>
            </div>
          ))}
          <Link className="lime-link" href="/como-funciona">
            Conocer cómo funciona ↗
          </Link>
        </article>
      </div>
      <article className="account-discovery">
        <div>
          <p className="eyebrow">ENCUENTRA TU LUGAR</p>
          <h3>UN GYM PARA CADA DÍA.</h3>
          <p>
            Fuerza, cardio, funcional y más: compara el equipamiento antes de
            elegir.
          </p>
          <Link className="button secondary" href="/gimnasios">
            Ver catálogo DEMO ↗
          </Link>
        </div>
        <img
          src="/images/athlete-editorial.png"
          alt="Entrenamiento: imagen referencial"
        />
      </article>
    </>
  );
}
