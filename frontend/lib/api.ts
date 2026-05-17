import type {
  CampaignInput,
  InfluencerProfile,
  LegacyMatch,
  LegacyMatchScore,
  LegacyProfile,
  LegacySwipePayload,
  LegacySwipeResult,
  MatchRecord,
  MatchScore,
  RankedInfluencer,
  SwipePayload,
  SwipeResponse,
} from "@/types";
import {
  getProfilesMock,
  postSwipeMock,
  getMatchScoreMock,
  getMatchesMock,
} from "@/lib/mockApi";

const API_URL =
  typeof window === "undefined"
    ? process.env.API_URL_INTERNAL ?? "http://backend:8000"
    : process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

export type HealthStatus = { status: string; db: string };

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      cache: "no-store",
      ...init,
      headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    });
  } catch {
    throw new Error(
      "Backend'e ulasilamadi. Demo icin NEXT_PUBLIC_USE_MOCK=true kullanabilirsiniz.",
    );
  }
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `API istegi basarisiz oldu: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export async function getHealth(): Promise<HealthStatus> {
  return fetchJson<HealthStatus>("/health");
}

export async function getProfiles(campaign?: CampaignInput): Promise<RankedInfluencer[]> {
  if (USE_MOCK) {
    if (!campaign) throw new Error("Mock profil listesi icin kampanya bilgisi gerekli.");
    return getProfilesMock(campaign);
  }
  return fetchJson<RankedInfluencer[]>("/api/profiles");
}

export async function postSwipe(
  payload: SwipePayload,
  campaign?: CampaignInput,
): Promise<SwipeResponse> {
  if (USE_MOCK) {
    if (!campaign) throw new Error("Mock swipe icin kampanya bilgisi gerekli.");
    return postSwipeMock(payload, campaign);
  }
  return fetchJson<SwipeResponse>("/api/swipe", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getMatchScore(
  influencerId: string,
  campaign: CampaignInput | string,
): Promise<MatchScore> {
  if (USE_MOCK) {
    if (typeof campaign === "string") throw new Error("Mock skor icin kampanya bilgisi gerekli.");
    return getMatchScoreMock(influencerId, campaign);
  }
  const query = new URLSearchParams({
    inf_id: influencerId,
    biz_id: typeof campaign === "string" ? campaign : campaign.businessId,
  }).toString();
  return fetchJson<MatchScore>(`/api/match-score?${query}`);
}

export async function getMatches(): Promise<MatchRecord[]> {
  if (USE_MOCK) return getMatchesMock();
  return fetchJson<MatchRecord[]>("/api/matches");
}

export async function getLegacyProfiles(): Promise<LegacyProfile[]> {
  if (USE_MOCK) {
    return [];
  }

  return fetchJson<LegacyProfile[]>("/api/profiles");
}

export async function postLegacySwipe(payload: LegacySwipePayload): Promise<LegacySwipeResult> {
  if (USE_MOCK) {
    return { match: false, match_id: null };
  }

  return fetchJson<LegacySwipeResult>("/api/swipe", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getLegacyMatchScore(infId: string, bizId: string): Promise<LegacyMatchScore> {
  if (USE_MOCK) {
    return { score: 0, reasons: ["Mock mode aktif."] };
  }

  const query = new URLSearchParams({ inf_id: infId, biz_id: bizId }).toString();
  return fetchJson<LegacyMatchScore>(`/api/match-score?${query}`);
}

export async function getLegacyMatches(): Promise<LegacyMatch[]> {
  if (USE_MOCK) {
    return [];
  }

  return fetchJson<LegacyMatch[]>("/api/matches");
}

export type { InfluencerProfile };
