// Server Components Docker network üzerinden backend container'ına ulaşır,
// browser ise host'tan localhost:8000'e bağlanır. İkisini ayrı tutuyoruz.
const API_URL =
  typeof window === "undefined"
    ? process.env.API_URL_INTERNAL ?? "http://backend:8000"
    : process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type HealthStatus = {
  status: string;
  db: string;
};

export async function getHealth(): Promise<HealthStatus> {
  const res = await fetch(`${API_URL}/health`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Health check failed: ${res.status}`);
  }
  return res.json();
}
