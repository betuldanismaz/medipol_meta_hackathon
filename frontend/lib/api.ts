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
import type {
  AgentPersona,
  AgreementRead,
  AuthResponse,
  AuthUser,
  Dealbreakers,
  DealbreakersRead,
  InboxItem,
  NegotiationDetail,
  NegotiationMessageRead,
  NegotiationRead,
  PricingResponse,
  UserRole,
} from "@/types/agent";
import {
  getProfilesMock,
  postSwipeMock,
  getMatchScoreMock,
  getMatchesMock,
} from "@/lib/mockApi";
import { getToken } from "@/lib/auth-storage";

const API_URL =
  typeof window === "undefined"
    ? process.env.API_URL_INTERNAL ?? "http://backend:8000"
    : process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

export type HealthStatus = { status: string; db: string };

export function getApiBase(): string {
  return API_URL;
}

export function getWsBase(): string {
  return API_URL.replace(/^http/, "ws");
}

async function fetchJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }
  const token = getToken();
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      cache: "no-store",
      ...init,
      headers,
    });
  } catch {
    throw new Error(
      `Backend'e ulaşılamadı (${API_URL}${path}). Backend çalışıyor mu? ` +
        "Terminalde 'docker compose up backend db' veya yerel olarak " +
        "'cd backend && uvicorn app.main:app --reload' deneyin. " +
        "Yalnız UI testi için NEXT_PUBLIC_USE_MOCK=true ile mock moda geçebilirsiniz.",
    );
  }

  if (!response.ok) {
    let message = `API isteği başarısız oldu: ${response.status}`;
    try {
      const body = await response.json();
      if (body?.detail) {
        message =
          typeof body.detail === "string"
            ? body.detail
            : body.detail.message ?? message;
      }
    } catch {
      // ignore body parse failure
    }
    const error = new Error(message) as Error & { status?: number };
    error.status = response.status;
    throw error;
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Legacy demo endpoints (mock-friendly)
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Auth & users
// ---------------------------------------------------------------------------
export type RegisterPayload = {
  email: string;
  password: string;
  display_name: string;
  role: UserRole;
  city?: string;
};

export function registerUser(payload: RegisterPayload): Promise<AuthResponse> {
  return fetchJson<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function loginUser(email: string, password: string): Promise<AuthResponse> {
  return fetchJson<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function getMe(): Promise<AuthUser> {
  return fetchJson<AuthUser>("/users/me");
}

export function updateMe(
  patch: Partial<
    Pick<
      AuthUser,
      | "display_name"
      | "city"
      | "district"
      | "latitude"
      | "longitude"
      | "bio"
      | "avatar_url"
    >
  > & {
    agent_persona?: AgentPersona;
    profile?: Record<string, unknown>;
  },
): Promise<AuthUser> {
  return fetchJson<AuthUser>("/users/me", {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

export function getDealbreakers(): Promise<DealbreakersRead | null> {
  return fetchJson<DealbreakersRead | null>("/users/me/dealbreakers");
}

export function upsertDealbreakers(payload: Dealbreakers): Promise<DealbreakersRead> {
  return fetchJson<DealbreakersRead>("/users/me/dealbreakers", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

// ---------------------------------------------------------------------------
// Negotiations
// ---------------------------------------------------------------------------
export function startNegotiation(matchId: number): Promise<NegotiationRead> {
  return fetchJson<NegotiationRead>("/negotiations/start", {
    method: "POST",
    body: JSON.stringify({ match_id: matchId }),
  });
}

export function getNegotiation(id: number): Promise<NegotiationDetail> {
  return fetchJson<NegotiationDetail>(`/negotiations/${id}`);
}

export function getNegotiationInbox(): Promise<InboxItem[]> {
  return fetchJson<InboxItem[]>("/negotiations/inbox");
}

export function interveneNegotiation(
  id: number,
  payload: { content: string; guidance?: string; halt?: boolean },
): Promise<NegotiationMessageRead> {
  return fetchJson<NegotiationMessageRead>(`/negotiations/${id}/intervene`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function finalizeNegotiation(
  id: number,
  decision: "accept" | "renegotiate" | "reject",
): Promise<NegotiationDetail> {
  return fetchJson<NegotiationDetail>(`/negotiations/${id}/finalize`, {
    method: "POST",
    body: JSON.stringify({ decision }),
  });
}

export function extendNegotiation(id: number, pack = 1): Promise<NegotiationRead> {
  return fetchJson<NegotiationRead>(`/negotiations/${id}/extend`, {
    method: "POST",
    body: JSON.stringify({ pack }),
  });
}

export function buildStreamUrl(id: number): string {
  const token = getToken();
  const url = new URL(`${getWsBase()}/negotiations/${id}/stream`);
  if (token) url.searchParams.set("token", token);
  return url.toString();
}

// ---------------------------------------------------------------------------
// Billing
// ---------------------------------------------------------------------------
export function getPricing(): Promise<PricingResponse> {
  return fetchJson<PricingResponse>("/billing/pricing");
}

export function upgradePlanMock(
  plan: "premium_individual" | "premium_business",
  months = 1,
): Promise<AuthUser> {
  return fetchJson<AuthUser>("/billing/mock/upgrade", {
    method: "POST",
    body: JSON.stringify({ plan, months }),
  });
}

// ---------------------------------------------------------------------------
// Public / discovery / stats / messages / analytics (v2)
// ---------------------------------------------------------------------------
import type {
  AnalyticsResponse,
  ConversationItem,
  DiscoveryFeed,
  InstagramPostRead,
  ListingPublic,
  MatchDetail,
  MessageRead,
  PublicProfile,
  SwipeResultV2,
  TaxonomyResponse,
  UserStats,
} from "@/types/agent";

export function getPublicListings(
  filters: { city?: string; category?: string; q?: string; limit?: number } = {},
): Promise<ListingPublic[]> {
  const params = new URLSearchParams();
  if (filters.city) params.set("city", filters.city);
  if (filters.category) params.set("category", filters.category);
  if (filters.q) params.set("q", filters.q);
  if (filters.limit) params.set("limit", String(filters.limit));
  const qs = params.toString();
  return fetchJson<ListingPublic[]>(`/public/listings${qs ? `?${qs}` : ""}`);
}

export function getPublicListing(id: number): Promise<ListingPublic> {
  return fetchJson<ListingPublic>(`/public/listings/${id}`);
}

export function getPublicInfluencers(
  filters: { tier?: string; city?: string; niche?: string; q?: string; limit?: number } = {},
): Promise<PublicProfile[]> {
  const params = new URLSearchParams();
  if (filters.tier) params.set("tier", filters.tier);
  if (filters.city) params.set("city", filters.city);
  if (filters.niche) params.set("niche", filters.niche);
  if (filters.q) params.set("q", filters.q);
  if (filters.limit) params.set("limit", String(filters.limit));
  const qs = params.toString();
  return fetchJson<PublicProfile[]>(`/public/influencers${qs ? `?${qs}` : ""}`);
}

export function getPublicInfluencer(id: number): Promise<PublicProfile> {
  return fetchJson<PublicProfile>(`/public/influencers/${id}`);
}

export function getInfluencerPosts(id: number, limit = 12): Promise<InstagramPostRead[]> {
  return fetchJson<InstagramPostRead[]>(`/public/influencers/${id}/posts?limit=${limit}`);
}

export function getTaxonomy(): Promise<TaxonomyResponse> {
  return fetchJson<TaxonomyResponse>("/public/taxonomy");
}

export function getDiscoveryFeed(limit = 20): Promise<DiscoveryFeed> {
  return fetchJson<DiscoveryFeed>(`/discovery/feed?limit=${limit}`);
}

export function getMyStats(): Promise<UserStats> {
  return fetchJson<UserStats>("/users/me/stats");
}

export function getMyAnalytics(): Promise<AnalyticsResponse> {
  return fetchJson<AnalyticsResponse>("/analytics/me");
}

export function getMatchDetails(): Promise<MatchDetail[]> {
  return fetchJson<MatchDetail[]>("/matches/details");
}

export function getMyListings(): Promise<ListingPublic[]> {
  return fetchJson<ListingPublic[]>("/listings/mine");
}

export function postSwipeV2(payload: {
  listing_id: number;
  candidate_id?: number;
  direction: "accept" | "reject";
}): Promise<SwipeResultV2> {
  return fetchJson<SwipeResultV2>("/matches/swipe", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getConversations(): Promise<ConversationItem[]> {
  return fetchJson<ConversationItem[]>("/messages/conversations");
}

export function getMessages(matchId: number): Promise<MessageRead[]> {
  return fetchJson<MessageRead[]>(`/messages/${matchId}`);
}

export function postMessage(matchId: number, content: string): Promise<MessageRead> {
  return fetchJson<MessageRead>("/messages", {
    method: "POST",
    body: JSON.stringify({ match_id: matchId, content }),
  });
}
