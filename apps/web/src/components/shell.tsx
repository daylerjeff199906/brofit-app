"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Mark } from "@brofit/ui";
import { ArrowUpRight, Menu, X } from "lucide-react";
export function Logo() {
  return (
    <Link href="/" className="logo" aria-label="BROFIT — ya, inicio">
      <Mark />
      <span>BROFIT</span>
      <em>— ya</em>
    </Link>
  );
}
export function Header() {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  return (
    <>
      <a className="skip-link" href="#contenido">
        Saltar al contenido
      </a>
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
            ].map(([href, name]) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                aria-current={path === href ? "page" : undefined}
              >
                {name}
              </Link>
            ))}
            <Link
              className="nav-partner"
              href="/para-gimnasios"
              onClick={() => setOpen(false)}
            >
              Para gimnasios <ArrowUpRight size={15} />
            </Link>
            <Link
              className="button primary nav-cta"
              href="/gimnasios"
              onClick={() => setOpen(false)}
            >
              Encuentra tu espacio <ArrowUpRight size={17} />
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
        <div>
          <Logo />
          <p>Entrena donde quieras.</p>
        </div>
        <div className="footer-links">
          <Link href="/gimnasios">Gimnasios</Link>
          <Link href="/planes">Pases y membresías</Link>
          <Link href="/como-funciona">Cómo funciona</Link>
          <Link href="/para-gimnasios">Para gimnasios</Link>
        </div>
        <p className="footer-note">
          Hecho para moverte.
          <br />
          Pensado para elegir.
        </p>
      </div>
      <div className="container footer-bottom">
        <span>© BROFIT — ya · Prototipo 2026</span>
        <span>DEMO · Sin ventas ni afiliaciones activas</span>
        <span>Lima, Perú ↗</span>
      </div>
    </footer>
  );
}
