"use client";
import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@brofit/ui";
import { post, safeNext } from "@/lib/api";
import { useResource } from "./use-resource";
import { useSession } from "./session";
type Mode = "login" | "registro" | "recuperar" | "verificar";
export function PasswordField({
  label,
  name,
  confirm = false,
}: {
  label: string;
  name: string;
  confirm?: boolean;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="form-field">
      <label htmlFor={"auth-" + name}>{label}</label>
      <span className="password-field">
        <input
          id={"auth-" + name}
          name={name}
          type={show ? "text" : "password"}
          minLength={12}
          maxLength={128}
          required
          autoComplete={confirm ? "new-password" : "current-password"}
          placeholder={
            confirm ? "Repite la contraseña" : "Al menos 12 caracteres"
          }
        />
        <button
          type="button"
          aria-label={`${show ? "Ocultar" : "Mostrar"} ${label.toLowerCase()}`}
          onClick={() => setShow(!show)}
        >
          {show ? "Ocultar" : "Mostrar"}
        </button>
      </span>
    </div>
  );
}
export function AuthScreen({ mode }: { mode: Mode }) {
  const router = useRouter();
  const { refresh } = useSession();
  const { data: settings } = useResource<{ googleEnabled: boolean }>(
    "/auth/config",
  );
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const register = mode === "registro",
    recover = mode === "recuperar",
    verify = mode === "verificar";
  useEffect(() => {
    function receiveToken() {
      const fragment = new URLSearchParams(window.location.hash.slice(1));
      const incomingToken = fragment.get("token");
      if (incomingToken) {
        setToken(incomingToken);
        setDone(false);
        setMessage("");
        setError("");
        window.history.replaceState(
          null,
          "",
          window.location.pathname + window.location.search,
        );
      }
    }
    receiveToken();
    window.addEventListener("hashchange", receiveToken);
    if (new URLSearchParams(window.location.search).has("error"))
      setError(
        "No pudimos completar el acceso con Google. Si ya tienes cuenta, ingresa con tu contraseña y vincula Google desde tu perfil.",
      );
    return () => window.removeEventListener("hashchange", receiveToken);
  }, []);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setError("");
    setBusy(true);
    try {
      const password = String(data.get("password") || "");
      if ((register || (recover && token)) && password !== data.get("confirm"))
        throw Error("Las contraseñas no coinciden.");
      if (mode === "login") {
        await post("/auth/login", {
          email: String(data.get("email")).trim(),
          password,
        });
        form.reset();
        await refresh();
        router.replace(
          safeNext(new URLSearchParams(window.location.search).get("next")),
        );
        return;
      }
      const result = register
        ? await post<{ message: string }>("/auth/register", {
            name: data.get("name"),
            lastName: data.get("lastName"),
            email: String(data.get("email")).trim(),
            password,
          })
        : recover && token
          ? await post<{ message: string }>("/auth/reset-password", {
              token,
              password,
            })
          : await post<{ message: string }>(
              verify ? "/auth/resend-verification" : "/auth/forgot-password",
              { email: String(data.get("email")).trim() },
            );
      setMessage(result.message);
      form.reset();
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo completar.");
    } finally {
      setBusy(false);
    }
  }
  async function verifyToken() {
    setBusy(true);
    setError("");
    try {
      const result = await post<{ message: string }>("/auth/verify-email", {
        token,
      });
      setToken("");
      setMessage(result.message);
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Enlace no válido.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="auth-layout">
      <aside className="auth-art">
        <img
          src="/images/athlete-editorial.png"
          alt="Atleta conceptual en entrenamiento"
        />
        <div className="auth-art-scrim" />
        <div className="auth-art-copy">
          <p className="eyebrow">
            {register ? "TU PRÓXIMO PASO" : "TU ACCESO, A TU RITMO"}
          </p>
          <h2>
            {register ? (
              <>
                EMPIEZA
                <br />
                <span>AQUÍ.</span>
              </>
            ) : (
              <>
                VUELVE
                <br />A <span>MOVERTE.</span>
              </>
            )}
          </h2>
          <p>Descubre gimnasios, revisa tus pases y entrena donde quieras.</p>
          <span className="energy-mark">///</span>
        </div>
        <span className="auth-image-credit">FOTOGRAFÍA CONCEPTUAL</span>
      </aside>
      <div className="auth-panel">
        <div className="auth-form-wrap">
          {(recover || verify) && (
            <Link className="back-link" href="/login">
              ← Volver al inicio de sesión
            </Link>
          )}
          <p className="eyebrow">
            {register
              ? "REGISTRO"
              : recover
                ? "RECUPERA TU ACCESO"
                : verify
                  ? "VERIFICA TU CORREO"
                  : "BIENVENIDO DE NUEVO"}
          </p>
          <h1 className="auth-title">
            {done ? (
              "REVISA TU SIGUIENTE PASO."
            ) : register ? (
              "CREA TU CUENTA."
            ) : recover ? (
              token ? (
                <>
                  TU NUEVA
                  <br />
                  <mark>CONTRASEÑA.</mark>
                </>
              ) : (
                <>
                  ¿OLVIDASTE TU
                  <br />
                  <mark>CONTRASEÑA?</mark>
                </>
              )
            ) : verify ? (
              <>
                CONFIRMA TU
                <br />
                <mark>CORREO.</mark>
              </>
            ) : (
              <>
                VUELVE A<br />
                <mark>TU RITMO.</mark>
              </>
            )}
          </h1>
          <p className="auth-description">
            {register
              ? "Crea tu cuenta y verifica tu correo para comenzar."
              : recover
                ? token
                  ? "Elige una contraseña nueva. Se cerrarán tus otras sesiones."
                  : "Te enviaremos un enlace que vence en 30 minutos."
                : verify
                  ? "El correo verificado protege tu cuenta y tus pases."
                  : "Ingresa con tu correo y contraseña, o usa Google."}
          </p>
          {error && (
            <p className="form-feedback error-message" role="alert">
              {error}
            </p>
          )}
          {done ? (
            <div className="auth-complete">
              <p role="status">{message}</p>
              <Link className="button primary" href="/login">
                Ir a iniciar sesión ↗
              </Link>
              {register && (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setDone(false);
                    router.push("/verificar-correo");
                  }}
                >
                  Solicitar otro enlace
                </Button>
              )}
            </div>
          ) : verify && token ? (
            <Button onClick={verifyToken} loading={busy}>
              Verificar mi correo ↗
            </Button>
          ) : (
            <form className="auth-form" onSubmit={submit}>
              {register && (
                <div className="form-row">
                  <label className="form-field">
                    <span>Nombre</span>
                    <input
                      name="name"
                      required
                      maxLength={80}
                      autoComplete="given-name"
                      placeholder="Tu nombre"
                    />
                  </label>
                  <label className="form-field">
                    <span>Apellidos</span>
                    <input
                      name="lastName"
                      required
                      maxLength={80}
                      autoComplete="family-name"
                      placeholder="Tus apellidos"
                    />
                  </label>
                </div>
              )}
              {!(recover && token) && (
                <label className="form-field">
                  <span>Correo electrónico</span>
                  <input
                    name="email"
                    type="email"
                    required
                    maxLength={254}
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@correo.com"
                  />
                </label>
              )}
              {((!recover && !verify) || (recover && token)) && (
                <PasswordField
                  name="password"
                  label={recover ? "Nueva contraseña" : "Contraseña"}
                />
              )}
              {(register || (recover && token)) && (
                <PasswordField
                  name="confirm"
                  label="Confirmar contraseña"
                  confirm
                />
              )}
              {mode === "login" && (
                <Link className="forgot-link" href="/recuperar-clave">
                  ¿Olvidaste tu contraseña?
                </Link>
              )}
              <Button type="submit" loading={busy}>
                {register
                  ? "Crear mi cuenta"
                  : recover
                    ? token
                      ? "Actualizar contraseña"
                      : "Enviar enlace de recuperación"
                    : verify
                      ? "Reenviar verificación"
                      : "Iniciar sesión"}{" "}
                ↗
              </Button>
              {mode === "login" && (
                <Link className="forgot-link" href="/verificar-correo">
                  ¿Necesitas verificar tu correo?
                </Link>
              )}
            </form>
          )}
          {!done && !recover && !verify && (
            <div className="google-login">
              <span>O CONTINÚA CON</span>
              {settings?.googleEnabled ? (
                <a
                  className="button google-button"
                  href="/api/auth/google/start"
                >
                  G <span>Continuar con Google</span>
                </a>
              ) : (
                <>
                  <Button variant="secondary" disabled>
                    Google · pendiente de configurar
                  </Button>
                  <p>
                    El acceso con Google se habilitará al configurar el proyecto
                    OAuth.
                  </p>
                </>
              )}
            </div>
          )}
          <p className="auth-switch">
            {register ? (
              <>
                ¿Ya tienes una cuenta? <Link href="/login">Inicia sesión</Link>
              </>
            ) : (
              <>
                ¿Todavía no tienes cuenta?{" "}
                <Link href="/registro">Regístrate aquí</Link>
              </>
            )}
          </p>
          <p className="form-disclaimer">
            Tu cuenta y tus datos se guardan en BROFIT. Los establecimientos y
            los pagos del entorno actual son de prueba.
          </p>
        </div>
      </div>
    </section>
  );
}
