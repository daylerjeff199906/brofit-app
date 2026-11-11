import Link from "next/link";
export default function NotFound() {
  return (
    <div className="container page-space empty">
      <p className="eyebrow lime">404 / FUERA DE RUTA</p>
      <h1>Este espacio no está disponible.</h1>
      <p>Vuelve al catálogo y encuentra otro lugar para entrenar.</p>
      <Link className="button primary" href="/gimnasios">
        Explorar gimnasios ↗
      </Link>
    </div>
  );
}
