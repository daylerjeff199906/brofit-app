"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Button } from "@brofit/ui";
import { AccountHeading } from "./account-shell";
export function ProfileMockup() {
  const [message, setMessage] = useState("");
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(
      "Cambios validados en modo DEMO. No se han guardado ni enviado tus datos.",
    );
  }
  return (
    <>
      <AccountHeading
        eyebrow="CUENTA / PERFIL"
        title="MI"
        accent="PERFIL."
        description="Actualiza tus datos y preferencias para personalizar tu experiencia."
        badge="SIN DATOS GUARDADOS"
      />
      <div className="profile-layout">
        <aside className="profile-summary">
          <div className="avatar">TU</div>
          <p className="eyebrow">TU PERFIL DEMO</p>
          <h3>Tu información, en un solo lugar.</h3>
          <p>Una vez que inicies sesión, verás tus datos reales aquí.</p>
          <span className="badge">SIN SESIÓN</span>
        </aside>
        <form
          className="profile-form"
          onSubmit={submit}
          onReset={() =>
            setMessage("Formulario limpio. No hay datos guardados.")
          }
        >
          <div className="form-section-head">
            <div>
              <p className="eyebrow lime">01 / DATOS PERSONALES</p>
              <h3>INFORMACIÓN BÁSICA</h3>
            </div>
            <span className="mono">EDITABLE EN DEMO</span>
          </div>
          <div className="form-row">
            <label className="form-field">
              <span>Nombre</span>
              <input
                name="name"
                placeholder="Tu nombre"
                required
                autoComplete="off"
              />
            </label>
            <label className="form-field">
              <span>Apellidos</span>
              <input
                name="lastName"
                placeholder="Tus apellidos"
                required
                autoComplete="off"
              />
            </label>
          </div>
          <label className="form-field">
            <span>Correo electrónico</span>
            <input
              name="email"
              type="email"
              placeholder="tu@correo.com"
              required
              autoComplete="off"
            />
          </label>
          <label className="form-field">
            <span>Teléfono (opcional)</span>
            <input
              name="phone"
              type="tel"
              minLength={6}
              maxLength={20}
              placeholder="+51 9XX XXX XXX"
              autoComplete="off"
            />
          </label>
          <section className="preferences">
            <p className="eyebrow lime">02 / PREFERENCIAS</p>
            <h3>TU FORMA DE ENTRENAR</h3>
            <label className="preference-option">
              <input type="checkbox" name="nearby" />
              <span>
                <strong>Priorizar gimnasios cercanos</strong>
                <small>
                  Usar la zona elegida en la búsqueda, sin activar ubicación
                  automática.
                </small>
              </span>
            </label>
            <label className="preference-option">
              <input type="checkbox" name="news" />
              <span>
                <strong>Recibir novedades por correo</strong>
                <small>
                  Opción demostrativa; no te suscribe a ninguna lista.
                </small>
              </span>
            </label>
          </section>
          {message && (
            <p className="form-feedback" role="status">
              {message}
            </p>
          )}
          <div className="profile-actions">
            <Button type="submit">Validar cambios DEMO ↗</Button>
            <Button type="reset" variant="secondary">
              Limpiar formulario
            </Button>
          </div>
        </form>
        <section className="profile-security">
          <p className="eyebrow lime">03 / SEGURIDAD</p>
          <h3>PROTEGE TU CUENTA.</h3>
          <p>Cambia tu contraseña o recupera el acceso cuando lo necesites.</p>
          <Link className="button secondary" href="/recuperar-clave">
            Ver cambio de clave DEMO ↗
          </Link>
        </section>
      </div>
    </>
  );
}
