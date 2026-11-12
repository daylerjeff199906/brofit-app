"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useSession } from "./session";
const items = [
  ["/app", "Inicio"],
  ["/app/pases", "Mis pases"],
  ["/app/actividad", "Actividad"],
  ["/app/perfil", "Mi perfil"],
];
export function AccountShell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useSession();
  useEffect(() => {
    if (!loading && !user)
      router.replace("/login?next=" + encodeURIComponent(path));
  }, [loading, user, path, router]);
  if (loading || !user)
    return (
      <div className="container page-space" role="status">
        Cargando tu cuenta…
      </div>
    );
  return (
    <>
      <section className="account-banner">
        <div className="container">
          <div>
            <p className="eyebrow">MI CUENTA / TU ESPACIO</p>
            <h1>
              BROFIT <span>A TU RITMO.</span>
            </h1>
          </div>
          <p>Entrena donde quieras.</p>
        </div>
      </section>
      <div className="container account-layout">
        <aside className="account-sidebar">
          <div className="sidebar-identity">
            <div className="avatar">{user.name.slice(0, 2).toUpperCase()}</div>
            <div>
              <strong>{user.name}</strong>
              <p>Cuenta verificada</p>
            </div>
          </div>
          <nav aria-label="Mi cuenta">
            {items.map(([href, label], i) => (
              <Link
                key={href}
                href={href}
                aria-current={
                  path.replace(/\/$/, "") === href ? "page" : undefined
                }
              >
                <span className="mono">0{i + 1}</span>
                {label}
                <span className="account-nav-arrow">↗</span>
              </Link>
            ))}
          </nav>
          <div className="sidebar-account-actions">
            {user.role === "PLATFORM_ADMIN" && (
              <Link href="/admin">Administración ↗</Link>
            )}
            {user.role !== "CUSTOMER" && (
              <Link href="/partner">Portal del gimnasio ↗</Link>
            )}
            <button
              type="button"
              onClick={async () => {
                await logout();
                router.push("/login");
              }}
            >
              Cerrar sesión →
            </button>
          </div>
          <div className="sidebar-bottom">
            <p className="eyebrow lime">ALGO NUEVO TE ESPERA</p>
            <p>Descubre espacios y elige cuándo entrenar.</p>
            <Link href="/gimnasios" className="button primary">
              Explorar gimnasios ↗
            </Link>
          </div>
        </aside>
        <div className="account-content">{children}</div>
      </div>
    </>
  );
}
export function AccountHeading({
  eyebrow,
  title,
  accent,
  description,
  badge = "ENTORNO SANDBOX",
}: {
  eyebrow: string;
  title: string;
  accent: string;
  description: string;
  badge?: string;
}) {
  return (
    <div className="account-heading">
      <p className="eyebrow lime">{eyebrow}</p>
      <h2>
        {title} <span>{accent}</span>
      </h2>
      <div>
        <p>{description}</p>
        <span className="badge">{badge}</span>
      </div>
    </div>
  );
}
