export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}
export async function api<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch("/api" + path, {
    ...options,
    credentials: "same-origin",
    cache: "no-store",
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });
  const body = await response.json().catch(() => null);
  if (!response.ok)
    throw new ApiError(
      body?.error?.message ||
        "No pudimos completar la solicitud. Intenta nuevamente.",
      response.status,
    );
  return body as T;
}
export const post = <T>(path: string, body: unknown) =>
  api<T>(path, { method: "POST", body: JSON.stringify(body) });
export function safeNext(value: string | null) {
  return value && /^\/(app|checkout|partner|admin)(\/|\?|$)/.test(value)
    ? value
    : "/app";
}
export type Account = {
  id: string;
  email: string;
  name: string;
  lastName: string;
  phone: string | null;
  role: "CUSTOMER" | "GYM_STAFF" | "PLATFORM_ADMIN";
  gymId: string | null;
  emailVerifiedAt: string | null;
  nearby: boolean;
  newsletter: boolean;
  googleConnected: boolean;
};
export type Offer = {
  id: string;
  name: string;
  description: string;
  kind: "DAY_PASS" | "MEMBERSHIP";
  priceCents: number;
  currency: string;
  visits: number;
  validityDays: number;
  maxPerDay: number;
  maxPerGym: number;
  conditions: string[];
  demo: boolean;
  gyms: { id: string; name: string; slug: string }[];
};
export type AccessPass = {
  id: string;
  name: string;
  remaining: number;
  visits: number;
  expiresAt: string;
  eligibleGymIds: string[];
  status: "ACTIVE" | "EXPIRED" | "USED";
};
export type Order = {
  id: string;
  name: string;
  priceCents: number;
  currency: string;
  status: string;
  conditions: string[];
  eligibleGymIds: string[];
  visits: number;
  validityDays: number;
  pass?: AccessPass;
};
export const soles = (cents: number) =>
  new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(
    cents / 100,
  );
