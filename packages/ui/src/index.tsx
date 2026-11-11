"use client";
import {
  useEffect,
  useRef,
  useId,
  type ReactNode,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
} from "react";
export function Mark() {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M11 6h14l7 6-2 8 2 7-8 7H7L11 6Zm7 6-1 6h6l2-3-2-3h-5Zm-2 12-1 5h8l2-3-2-2h-7Z"
      />
      <path d="M2 15h4v12H2zm32-2h4v12h-4zM5 19h9v4H5zm23-2h7v4h-7z" />
    </svg>
  );
}
export function Badge({ children }: { children: ReactNode }) {
  return <span className="badge">{children}</span>;
}
export function Button({
  children,
  variant = "primary",
  loading = false,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
  loading?: boolean;
}) {
  return (
    <button
      {...props}
      disabled={props.disabled || loading}
      aria-busy={loading}
      className={`button ${variant} ${props.className || ""}`}
    >
      {loading ? "Cargando…" : children}
    </button>
  );
}
export function Input({
  label,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="input-field">
      <span>{label}</span>
      <input {...props} />
    </label>
  );
}
export function FilterChip({
  children,
  selected,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { selected: boolean }) {
  return (
    <button {...props} className="chip" aria-pressed={selected}>
      {children}
    </button>
  );
}
export function EmptyState({
  title,
  children,
  action,
}: {
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="empty">
      <span className="empty-symbol">↗</span>
      <h2>{title}</h2>
      <p>{children}</p>
      {action}
    </div>
  );
}
export function GymCard({
  image,
  name,
  district,
  category,
  price,
  href,
}: {
  image: string;
  name: string;
  district: string;
  category: string;
  price: number;
  href: string;
}) {
  return (
    <article className="gym-card">
      <a className="card-photo" href={href}>
        <img
          src={image}
          alt={`Imagen de ambiente referencial para ${name}`}
          loading="lazy"
        />
        <Badge>DEMO</Badge>
        <span className="photo-arrow" aria-hidden="true">
          ↗
        </span>
      </a>
      <div className="card-body">
        <p className="eyebrow">
          {district} <span>· {category}</span>
        </p>
        <h3>
          <a href={href}>{name}</a>
        </h3>
        <div className="card-bottom">
          <p>
            <span>Pase desde</span>
            <strong>S/ {price.toFixed(2)}</strong>
          </p>
          <a href={href} aria-label={`Ver gimnasio ${name}`}>
            Ver gimnasio ↗
          </a>
        </div>
      </div>
    </article>
  );
}
export function PlanCard({
  name,
  price,
  description,
  conditions,
  onSelect,
  featured = false,
}: {
  name: string;
  price: number;
  description: string;
  conditions: string[];
  onSelect: () => void;
  featured?: boolean;
}) {
  return (
    <article className={`plan-card ${featured ? "featured" : ""}`}>
      <div className="plan-top">
        <span className="eyebrow">
          {featured ? "EXPLORA LA RED" : "A TU RITMO"}
        </span>
        <Badge>DEMO</Badge>
      </div>
      <h3>{name}</h3>
      <p>{description}</p>
      <div className="price">
        S/ {price}
        <small> / precio de ejemplo</small>
      </div>
      <ul>
        {conditions.map((c) => (
          <li key={c}>
            ↗ <span>{c}</span>
          </li>
        ))}
      </ul>
      <Button variant={featured ? "primary" : "secondary"} onClick={onSelect}>
        Ver condiciones <span>↗</span>
      </Button>
    </article>
  );
}
export function Modal({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    if (open && !ref.current?.open) ref.current?.showModal();
    else if (!open && ref.current?.open) ref.current.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-head">
        <h2 id={titleId}>{title}</h2>
        <button
          className="icon-button"
          aria-label="Cerrar ventana"
          onClick={onClose}
        >
          ×
        </button>
      </div>
      {children}
    </dialog>
  );
}
