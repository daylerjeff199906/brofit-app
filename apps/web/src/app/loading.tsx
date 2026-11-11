export default function Loading() {
  return (
    <div className="container page-space" role="status">
      <p className="eyebrow lime">BUSCANDO TU PRÓXIMO ESPACIO…</p>
      <div className="skeleton" />
      <span className="sr-only">Cargando página</span>
    </div>
  );
}
