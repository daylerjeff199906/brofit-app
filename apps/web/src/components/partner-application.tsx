"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Button, Modal } from "@brofit/ui";
import { useSession } from "./session";
import { useResource } from "./use-resource";
import { post } from "@/lib/api";
export function PartnerApplication() {
  const { user } = useSession();
  const [open, setOpen] = useState(false),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [error, setError] = useState("");
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setBusy(true);
    setError("");
    try {
      const result = await post<{ message: string }>(
        "/me/partner-application",
        {
          gymName: data.get("gymName"),
          district: data.get("district"),
          message: data.get("message"),
        },
      );
      setMessage(result.message);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <Button onClick={() => setOpen(true)}>Solicitar afiliación ↗</Button>
      <Modal
        open={open}
        title="El siguiente espacio podría ser el tuyo."
        onClose={() => setOpen(false)}
      >
        {user ? (
          message ? (
            <p className="form-feedback" role="status">
              {message}
            </p>
          ) : (
            <form onSubmit={submit} className="operation-form">
              <p>
                La solicitud no publica tu gimnasio ni crea una alianza
                comercial. Primero verificaremos el local y acordaremos las
                condiciones contigo.
              </p>
              <label className="form-field">
                <span>Nombre del gimnasio</span>
                <input name="gymName" required minLength={2} maxLength={120} />
              </label>
              <label className="form-field">
                <span>Distrito</span>
                <input name="district" required minLength={2} maxLength={80} />
              </label>
              <label className="form-field">
                <span>Cuéntanos sobre el espacio</span>
                <textarea
                  name="message"
                  required
                  minLength={10}
                  maxLength={2000}
                />
              </label>
              <p>
                Te identificaremos con el correo verificado de tu cuenta.
                Guardaremos la solicitud para su evaluación.
              </p>
              {error && (
                <p className="form-feedback error-message" role="alert">
                  {error}
                </p>
              )}
              <Button loading={busy} type="submit">
                Enviar solicitud ↗
              </Button>
            </form>
          )
        ) : (
          <>
            <p>
              Crea una cuenta y verifica tu correo para enviar la solicitud de
              tu gimnasio.
            </p>
            <Link className="button primary" href="/registro">
              Crear cuenta ↗
            </Link>
            <Link className="button secondary" href="/login">
              Ya tengo cuenta
            </Link>
          </>
        )}
      </Modal>
    </>
  );
}
export function ApplicationsManager({
  gyms,
}: {
  gyms: { id: string; name: string }[];
}) {
  const applications = useResource<{
    data: {
      id: string;
      gymName: string;
      district: string;
      message: string;
      user: { name: string; email: string };
    }[];
  }>("/admin/applications");
  const [message, setMessage] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function assign(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setBusy(true);
    setError("");
    try {
      const result = await post<{ message: string }>("/admin/staff", {
        email: data.get("email"),
        gymId: data.get("gymId"),
      });
      setMessage(result.message);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo asignar.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="section">
      <h2>Solicitudes de afiliación</h2>
      <div className="admin-card-list">
        {applications.data?.data.map((a) => (
          <article key={a.id} className="live-card">
            <h3>{a.gymName}</h3>
            <p>
              {a.district} · {a.user.name} · {a.user.email}
            </p>
            <p>{a.message}</p>
          </article>
        ))}
      </div>
      {applications.error && (
        <p className="form-feedback error-message" role="alert">
          {applications.error}
        </p>
      )}
      {applications.data && !applications.data.data.length && (
        <p className="muted">Sin solicitudes todavía.</p>
      )}
      <details className="live-card">
        <summary>Asignar una cuenta verificada a un gimnasio</summary>
        <p>
          Verifica al establecimiento antes de habilitar su personal. La cuenta
          asignada deberá volver a iniciar sesión.
        </p>
        <form onSubmit={assign} className="operation-form">
          <label className="form-field">
            <span>Correo del aliado</span>
            <input name="email" type="email" required />
          </label>
          <label className="form-field">
            <span>Gimnasio</span>
            <select name="gymId" required>
              {gyms.map((g) => (
                <option key={g.id} value={g.id}>
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
          {message && (
            <p className="form-feedback" role="status">
              {message}
            </p>
          )}
          <Button loading={busy} type="submit">
            Asignar rol de aliado
          </Button>
        </form>
      </details>
    </section>
  );
}
