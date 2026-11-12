"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Modal } from "@brofit/ui";
import { api } from "@/lib/api";
import { useSession } from "./session";
import { useResource } from "./use-resource";
import { AccountHeading } from "./account-shell";
export function Profile() {
  const { user, refresh } = useSession();
  const router = useRouter();
  const { data: settings } = useResource<{ googleEnabled: boolean }>(
    "/auth/config",
  );
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [remove, setRemove] = useState(false);
  if (!user) return null;
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await api("/me/profile", {
        method: "PATCH",
        body: JSON.stringify({
          name: data.get("name"),
          lastName: data.get("lastName"),
          phone: data.get("phone") || null,
          nearby: data.has("nearby"),
          newsletter: data.has("newsletter"),
        }),
      });
      await refresh();
      setMessage("Tus cambios se guardaron correctamente.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar.");
    } finally {
      setBusy(false);
    }
  }
  async function download() {
    try {
      const data = await api("/me/export");
      const url = URL.createObjectURL(
        new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
      );
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "brofit-mis-datos.json";
      anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo exportar.");
    }
  }
  async function deleteAccount(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const data = new FormData(e.currentTarget);
      await api("/me/account", {
        method: "DELETE",
        body: JSON.stringify({ password: data.get("password") }),
      });
      await refresh();
      router.replace("/");
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo eliminar.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <AccountHeading
        eyebrow="CUENTA / PERFIL"
        title="MI"
        accent="PERFIL."
        description="Tus datos y tus preferencias, en un solo lugar."
        badge="CUENTA VERIFICADA"
      />
      <div className="profile-layout">
        <aside className="profile-summary">
          <div className="avatar">{user.name.slice(0, 2).toUpperCase()}</div>
          <p className="eyebrow">TU PERFIL</p>
          <h3>
            {user.name} {user.lastName}
          </h3>
          <p>{user.email}</p>
          <span className="badge">CORREO VERIFICADO</span>
        </aside>
        <form className="profile-form" onSubmit={submit}>
          <div className="form-section-head">
            <div>
              <p className="eyebrow lime">01 / DATOS PERSONALES</p>
              <h3>INFORMACIÓN BÁSICA</h3>
            </div>
          </div>
          <div className="form-row">
            <label className="form-field">
              <span>Nombre</span>
              <input
                name="name"
                defaultValue={user.name}
                required
                maxLength={80}
                autoComplete="given-name"
              />
            </label>
            <label className="form-field">
              <span>Apellidos</span>
              <input
                name="lastName"
                defaultValue={user.lastName}
                required
                maxLength={80}
                autoComplete="family-name"
              />
            </label>
          </div>
          <label className="form-field">
            <span>Correo electrónico verificado</span>
            <input type="email" readOnly value={user.email} />
          </label>
          <label className="form-field">
            <span>Teléfono (opcional)</span>
            <input
              name="phone"
              type="tel"
              defaultValue={user.phone || ""}
              maxLength={25}
              autoComplete="tel"
              placeholder="+51 9XX XXX XXX"
            />
          </label>
          <section className="preferences">
            <p className="eyebrow lime">02 / PREFERENCIAS</p>
            <h3>TU FORMA DE ENTRENAR</h3>
            <label className="preference-option">
              <input
                type="checkbox"
                name="nearby"
                defaultChecked={user.nearby}
              />
              <span>
                <strong>Priorizar mi zona</strong>
                <small>Sin activar la ubicación precisa del dispositivo.</small>
              </span>
            </label>
            <label className="preference-option">
              <input
                type="checkbox"
                name="newsletter"
                defaultChecked={user.newsletter}
              />
              <span>
                <strong>Guardar preferencia de novedades</strong>
                <small>
                  Podrás cambiarla cuando quieras; este entorno no envía
                  campañas.
                </small>
              </span>
            </label>
          </section>
          {message && (
            <p className="form-feedback" role="status">
              {message}
            </p>
          )}
          {error && (
            <p className="form-feedback error-message" role="alert">
              {error}
            </p>
          )}
          <div className="profile-actions">
            <Button type="submit" loading={busy}>
              Guardar cambios ↗
            </Button>
            <Button type="reset" variant="secondary">
              Restablecer formulario
            </Button>
          </div>
        </form>
        <section className="profile-security">
          <p className="eyebrow lime">03 / SEGURIDAD</p>
          <h3>PROTEGE TU CUENTA.</h3>
          <p>Recupera tu contraseña mediante un enlace enviado a tu correo.</p>
          <Link className="button secondary" href="/recuperar-clave">
            Cambiar contraseña ↗
          </Link>
          <hr />
          {user.googleConnected ? (
            <p>✓ Google vinculado.</p>
          ) : settings?.googleEnabled ? (
            <a
              className="button secondary"
              href="/api/auth/google/start?link=1"
            >
              Vincular mi cuenta de Google ↗
            </a>
          ) : (
            <p>Google estará disponible al configurar OAuth.</p>
          )}
          <hr />
          <Button variant="secondary" onClick={download}>
            Descargar mis datos
          </Button>
          <button
            className="danger-link"
            type="button"
            onClick={() => setRemove(true)}
          >
            Eliminar mi cuenta
          </button>
        </section>
      </div>
      <Modal
        open={remove}
        title="Eliminar tu cuenta"
        onClose={() => setRemove(false)}
      >
        <p>
          Se eliminarán tu cuenta y tus sesiones. Las operaciones de prueba se
          conservarán anonimizadas. Esta acción no se puede deshacer.
        </p>
        <form onSubmit={deleteAccount}>
          <label className="form-field">
            <span>Contraseña actual</span>
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              required
              maxLength={128}
            />
          </label>
          <label className="check-field">
            <input type="checkbox" required />
            <span>Quiero eliminar mi cuenta.</span>
          </label>
          {error && (
            <p className="form-feedback error-message" role="alert">
              {error}
            </p>
          )}
          <Button type="submit" loading={busy}>
            Eliminar definitivamente
          </Button>
        </form>
        <p className="muted small">
          Si accediste solo con Google, primero establece una contraseña desde
          recuperación.
        </p>
      </Modal>
    </>
  );
}
