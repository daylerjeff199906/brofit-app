import "server-only";
import { notFound } from "next/navigation";
export async function serverApi<T>(path: string): Promise<T> {
  const result = await fetch(
    (process.env.API_BASE_URL || "http://127.0.0.1:4100") + "/api" + path,
    { cache: "no-store", signal: AbortSignal.timeout(8000) },
  );
  if (result.status === 404) notFound();
  if (!result.ok) throw Error("No se pudo cargar la información.");
  return result.json() as Promise<T>;
}
