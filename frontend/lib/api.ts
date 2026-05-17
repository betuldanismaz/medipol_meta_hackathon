import type { Profile, SwipePayload, SwipeResult, MatchScore, Match } from "@/types";
import {
  mockGetProfiles,
  mockPostSwipe,
  mockGetMatchScore,
  mockGetMatches,
} from "@/lib/mockApi";

// Server Components Docker network üzerinden backend container'ına ulaşır,
// browser ise host'tan localhost:8000'e bağlanır.
const API_URL =
  typeof window === "undefined"
    ? process.env.API_URL_INTERNAL ?? "http://backend:8000"
    : process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

export type { Profile, SwipePayload, SwipeResult, MatchScore, Match };

// Legacy health check (ana sayfa kaldırıldı ama endpoint çalışıyor)
export type HealthStatus = { status: string; db: string };

export async function getHealth(): Promise<HealthStatus> {
  const res = await fetch(`${API_URL}/health`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
  return res.json();
}

export async function getProfiles(): Promise<Profile[]> {
  if (USE_MOCK) return mockGetProfiles();
  const res = await fetch(`${API_URL}/api/profiles`, { cache: "no-store" });
  if (!res.ok) throw new Error(`getProfiles failed: ${res.status}`);
  return res.json();
}

export async function postSwipe(payload: SwipePayload): Promise<SwipeResult> {
  if (USE_MOCK) return mockPostSwipe(payload);
  const res = await fetch(`${API_URL}/api/swipe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`postSwipe failed: ${res.status}`);
  return res.json();
}

export async function getMatchScore(infId: string, bizId: string): Promise<MatchScore> {
  if (USE_MOCK) return mockGetMatchScore(infId, bizId);
  const res = await fetch(
    `${API_URL}/api/match-score?inf_id=${infId}&biz_id=${bizId}`,
    { cache: "no-store" },
  );
  if (!res.ok) throw new Error(`getMatchScore failed: ${res.status}`);
  return res.json();
}

export async function getMatches(): Promise<Match[]> {
  if (USE_MOCK) return mockGetMatches();
  const res = await fetch(`${API_URL}/api/matches`, { cache: "no-store" });
  if (!res.ok) throw new Error(`getMatches failed: ${res.status}`);
  return res.json();
}
