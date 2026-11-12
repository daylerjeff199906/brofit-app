"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Mark } from "@brofit/ui";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { useSession } from "./session";
export function Logo() {
  return (
    <Link href="/" className="logo" aria-label="BROFIT — ya, inicio">
      <Mark />
      <span>BROFIT</span>
      <em>—ya</em>
    </Link>
  );
}
export function Header() {
  const { user } = useSession();
  const [open, setOpen] = useState(false);
  const path = usePathname();
  return (
    <>
      <a className="skip-link" href="#contenido">
        Saltar al contenido
      </a>
      <div className="prototype-bar">
        BROFIT — YA / ENTORNO SANDBOX · GIMNASIOS DE PRUEBA · SIN COBROS REALES
      </div>
      <header className="header">
        <div className="container nav-wrap">
          <Logo />
          <button
            className="icon-button menu-button"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
            aria-controls="main-nav"
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
          <nav
            id="main-nav"
            className={open ? "nav open" : "nav"}
            aria-label="Principal"
          >
            {[
              ["/", "Inicio"],
              ["/gimnasios", "Gimnasios"],
              ["/planes", "Planes"],
              ["/como-funciona", "Cómo funciona"],
              ["/para-gimnasios", "Para gimnasios"],
            ].map(([href, label]) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                aria-current={
                  (href === "/" ? path === "/" : path.startsWith(href))
                    ? "page"
                    : undefined
                }
              >
                {label}
              </Link>
            ))}
            <Link
              className="nav-login"
              href={user ? "/app/perfil" : "/login"}
              onClick={() => setOpen(false)}
            >
              {user ? "Mi perfil" : "Iniciar sesión"}
            </Link>
            <Link
              className="button primary nav-cta"
              href={user ? "/app" : "/registro"}
              onClick={() => setOpen(false)}
            >
              {user ? "Mi espacio" : "Crear cuenta"} <ArrowUpRight size={16} />
            </Link>
          </nav>
        </div>
      </header>
    </>
  );
}
export function Footer() {
  return (
    <footer>
      <div className="container footer-top">
        <div className="footer-brand">
          <Logo />
          <p>Entrena donde quieras.</p>
          <p>
            Descubre gimnasios, compara su equipamiento y elige la forma de
            acceso que mejor se adapte a ti.
          </p>
        </div>
        <div className="footer-group">
          <h3>Explora</h3>
          <Link href="/gimnasios">Gimnasios</Link>
          <Link href="/planes">Pases y membresías</Link>
          <Link href="/como-funciona">Cómo funciona</Link>
        </div>
        <div className="footer-group">
          <h3>Cuenta</h3>
          <Link href="/login">Iniciar sesión</Link>
          <Link href="/registro">Crear cuenta</Link>
          <Link href="/app">Mi espacio</Link>
          <Link href="/app/perfil">Mi perfil</Link>
          <Link href="/app/pases">Mis pases</Link>
          <Link href="/app/actividad">Mi actividad</Link>
        </div>
        <div className="footer-group">
          <h3>Aliados</h3>
          <Link href="/para-gimnasios">Afiliar gimnasio</Link>
          <p>Piloto por validar · Perú</p>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>
          © 2026 BROFIT — ya · Prototipo conceptual, sin servicio comercial
          activo.
        </span>
        <span>Diseño brutalista / negro + lima</span>
      </div>
    </footer>
  );
}
