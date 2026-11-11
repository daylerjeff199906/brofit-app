"use client";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, ArrowLeft } from "lucide-react";
import { Button } from "@brofit/ui";
type Mode = "login" | "registro" | "recuperar";
function Password({
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
    <label className="form-field">
      <span>{label}</span>
      <span className="password-field">
        <input
          name={name}
          type={show ? "text" : "password"}
          required
          minLength={8}
          autoComplete="off"
          placeholder={confirm ? "Repite tu contraseña" : "Mínimo 8 caracteres"}
        />
        <button
          type="button"
          aria-label={`${show ? "Ocultar" : "Mostrar"} ${label.toLowerCase()}`}
          aria-pressed={show}
          onClick={() => setShow(!show)}
        >
          {show ? "Ocultar" : "Mostrar"}
        </button>
      </span>
      {!confirm && (
        <small>Utiliza datos de prueba y al menos 8 caracteres.</small>
      )}
    </label>
  );
}
export function AuthMockup({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [feedback, setFeedback] = useState("");
  const [step, setStep] = useState(0);
  const [complete, setComplete] = useState(false);
  const register = mode === "registro";
  const recovery = mode === "recuperar";
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setFeedback("");
    if (register || (recovery && step === 2)) {
      if (data.get("password") !== data.get("confirm")) {
        setFeedback("Las contraseñas no coinciden. Revisa ambos campos.");
        return;
      }
    }
    if (recovery) {
      if (step === 1 && data.get("code") !== "123456") {
        setFeedback("En esta demo utiliza el código de ejemplo 123456.");
        return;
      }
      if (step < 2) {
        setStep(step + 1);
        return;
      }
      e.currentTarget.reset();
      setComplete(true);
      return;
    }
    e.currentTarget.reset();
    setComplete(true);
  }
  const title = register ? (
    <>
      EMPIEZA
      <br />
      <span>AQUÍ.</span>
    </>
  ) : recovery ? (
    <>
      VUELVE
      <br />A <span>MOVERTE.</span>
    </>
  ) : (
    <>
      TU PRÓXIMO
      <br />
      <span>COMIENZO.</span>
    </>
  );
  return (
    <section className={`auth-layout ${recovery ? "recovery-layout" : ""}`}>
      <aside className="auth-art">
        <img
          src="/images/athlete-editorial.png"
          alt="Atleta en entrenamiento, fotografía referencial"
        />
        <div className="auth-art-scrim" />
        <div className="auth-art-copy">
          <p className="eyebrow">
            {register
              ? "TU PRÓXIMO PASO"
              : recovery
                ? "TU ACCESO, A TU RITMO"
                : "EL FITNESS SE MUEVE CONTIGO"}
          </p>
          <h2>{title}</h2>
          <p>
            {register
              ? "Una cuenta para descubrir gimnasios, revisar tus pases y entrenar donde quieras."
              : recovery
                ? "Recuperar tu acceso debe ser tan simple como encontrar tu próximo gimnasio."
                : "Tu ciudad tiene más de un lugar para entrenar. Encuentra el tuyo."}
          </p>
          <span className="energy-mark">///</span>
        </div>
        <span className="auth-image-credit">FOTOGRAFÍA REFERENCIAL · DEMO</span>
      </aside>
      <div className="auth-panel">
        <div className="auth-form-wrap">
          {recovery && (
            <>
              <Link className="back-link" href="/login">
                <ArrowLeft size={15} /> Volver al inicio de sesión
              </Link>
              <div
                className="recovery-progress"
                aria-label={`Paso ${step + 1} de 3`}
              >
                {["Correo", "Verificación", "Nueva clave"].map((s, i) => (
                  <div key={s} className={i <= step ? "current" : ""}>
                    <strong>0{i + 1}</strong>
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            </>
          )}
          {complete ? (
            <div className="auth-complete" role="status">
              <span className="success-tick">↗</span>
              <p className="eyebrow">RECORRIDO DEMO COMPLETADO</p>
              <h1>
                {recovery
                  ? "TODO LISTO PARA SEGUIR."
                  : register
                    ? "TU SIGUIENTE PASO."
                    : "VAMOS A MOVERTE."}
              </h1>
              <p>
                {recovery
                  ? "Has recorrido la recuperación de ejemplo. No se modificó ninguna contraseña real."
                  : register
                    ? "Validamos el formulario de ejemplo. No se creó una cuenta ni se guardaron tus datos."
                    : "Formulario de ejemplo validado. Puedes explorar el espacio personal sin una sesión real."}
              </p>
              <Button onClick={() => router.push(recovery ? "/login" : "/app")}>
                {recovery ? "Ir a iniciar sesión" : "Explorar mi espacio DEMO"}{" "}
                <ArrowUpRight size={17} />
              </Button>
            </div>
          ) : (
            <>
              <p className="eyebrow">
                {register
                  ? "REGISTRO / 02"
                  : recovery
                    ? `SEGURIDAD / 0${step + 1}`
                    : "TU CUENTA / 01"}
              </p>
              <h1 className="auth-title">
                {register ? (
                  "CREA TU CUENTA."
                ) : recovery ? (
                  step === 0 ? (
                    <>
                      ¿OLVIDASTE TU
                      <br />
                      <mark>CONTRASEÑA?</mark>
                    </>
                  ) : step === 1 ? (
                    <>
                      VERIFICA TU
                      <br />
                      <mark>ACCESO.</mark>
                    </>
                  ) : (
                    <>
                      UNA NUEVA
                      <br />
                      <mark>CONTRASEÑA.</mark>
                    </>
                  )
                ) : (
                  <>
                    VUELVE A<br />
                    <mark>TU RITMO.</mark>
                  </>
                )}
              </h1>
              <p className="auth-description">
                {register
                  ? "Un par de datos y estarás listo para explorar."
                  : recovery
                    ? step === 0
                      ? "Ingresa un correo de ejemplo para recorrer la recuperación. Esta pantalla todavía no envía correos reales."
                      : step === 1
                        ? "No enviamos ningún correo. Usa el código DEMO 123456 para avanzar."
                        : "Elige una clave de prueba. No cambiaremos ninguna contraseña real."
                    : "Entra al recorrido de ejemplo y descubre tu próximo espacio."}
              </p>
              <form
                onSubmit={submit}
                key={`${mode}-${step}`}
                className="auth-form"
              >
                {register && (
                  <div className="form-row">
                    <label className="form-field">
                      <span>Nombre</span>
                      <input
                        name="name"
                        required
                        placeholder="Tu nombre"
                        autoComplete="off"
                      />
                    </label>
                    <label className="form-field">
                      <span>Apellido</span>
                      <input
                        name="lastName"
                        required
                        placeholder="Tu apellido"
                        autoComplete="off"
                      />
                    </label>
                  </div>
                )}
                {(!recovery || step === 0) && (
                  <label className="form-field">
                    <span>Correo electrónico</span>
                    <input
                      name="email"
                      type="email"
                      required
                      autoComplete="off"
                      placeholder="tu@correo.com"
                    />
                  </label>
                )}
                {(!recovery || step === 2) && (
                  <Password
                    label={recovery ? "Nueva contraseña" : "Contraseña"}
                    name="password"
                  />
                )}
                {(register || (recovery && step === 2)) && (
                  <Password
                    label="Confirmar contraseña"
                    name="confirm"
                    confirm
                  />
                )}
                {recovery && step === 1 && (
                  <label className="form-field">
                    <span>Código de verificación DEMO</span>
                    <input
                      name="code"
                      required
                      pattern="[0-9]{6}"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="123456"
                      autoComplete="off"
                    />
                  </label>
                )}
                {!register && !recovery && (
                  <Link href="/recuperar-clave" className="forgot-link">
                    ¿Olvidaste tu contraseña?
                  </Link>
                )}
                {!recovery && (
                  <label className="check-field">
                    <input name="demo" type="checkbox" required />
                    <span>
                      Comprendo que esto es un prototipo y{" "}
                      {register
                        ? "no se creará una cuenta real."
                        : "no se iniciará una sesión real."}
                    </span>
                  </label>
                )}
                {feedback && (
                  <p className="form-feedback error-message" role="alert">
                    {feedback}
                  </p>
                )}
                <Button type="submit">
                  {register
                    ? "Crear cuenta DEMO"
                    : recovery
                      ? step === 0
                        ? "Simular solicitud"
                        : step === 1
                          ? "Verificar código DEMO"
                          : "Validar nueva clave DEMO"
                      : "Validar acceso DEMO"}{" "}
                  <ArrowUpRight size={16} />
                </Button>
              </form>
              <p className="auth-switch">
                {register ? (
                  <>
                    ¿Ya tienes una cuenta?{" "}
                    <Link href="/login">Inicia sesión</Link>
                  </>
                ) : (
                  <>
                    ¿Todavía no tienes cuenta?{" "}
                    <Link href="/registro">Regístrate aquí</Link>
                  </>
                )}
              </p>
            </>
          )}
          <p className="form-disclaimer">
            <strong>MODO DEMO.</strong> No ingreses credenciales reales; no
            almacenamos datos en este prototipo.
          </p>
        </div>
      </div>
    </section>
  );
}
