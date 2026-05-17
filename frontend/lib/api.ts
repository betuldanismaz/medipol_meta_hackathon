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

import type {
  MatchRecord,
  MatchScore,
  RankedInfluencer,
  SwipePayload,
  SwipeResponse,
} from "@/types";

export async function getHealth(): Promise<HealthStatus> {
  const res = await fetch(`${API_URL}/health`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Health check failed: ${res.status}`);
  }
  return res.json();
}

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      cache: "no-store",
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
    });
  } catch {
    throw new Error("Matchfluence backend'ine ulasilamadi. Demo icin NEXT_PUBLIC_USE_MOCK=true kullanabilirsiniz.");
  }

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `API istegi basarisiz oldu: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function getProfiles(): Promise<RankedInfluencer[]> {
  return fetchJson<RankedInfluencer[]>("/api/profiles");
}

export async function postSwipe(payload: SwipePayload): Promise<SwipeResponse> {
  return fetchJson<SwipeResponse>("/api/swipe", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getMatchScore(inf_id: string, biz_id: string): Promise<MatchScore> {
  const query = new URLSearchParams({ inf_id, biz_id }).toString();
  return fetchJson<MatchScore>(`/api/match-score?${query}`);
}

export async function getMatches(): Promise<MatchRecord[]> {
  return fetchJson<MatchRecord[]>("/api/matches");
}
