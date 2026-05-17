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
  AnalyticsResponse,
  AuthResponse,
  AuthUser,
  ConversationItem,
  Dealbreakers,
  DealbreakersRead,
  DiscoveryFeed,
  InboxItem,
  InstagramPostRead,
  ListingPublic,
  MatchDetail,
  MessageRead,
  NegotiationDetail,
  NegotiationMessageRead,
  NegotiationRead,
  PricingResponse,
  PublicProfile,
  SwipeResultV2,
  TaxonomyResponse,
  UserRole,
  UserStats,
} from "@/types/agent";
import {
  getProfilesMock,
  postSwipeMock,
  getMatchScoreMock,
  getMatchesMock,
} from "@/lib/mockApi";
import { getToken } from "@/lib/auth-storage";
import {
  analytics as mockAnalytics,
  influencers as mockInfluencers,
  listings as mockListings,
  matches as mockMatches,
} from "@/lib/mock-data";

const API_URL =
  typeof window === "undefined"
    ? process.env.API_URL_INTERNAL ?? "http://backend:8000"
    : process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== "false";

export type HealthStatus = { status: string; db: string };

const nowIso = () => new Date().toISOString();

const mockUser: AuthUser = {
  id: 1,
  external_id: "mock-user-1",
  email: "demo@influmatch.local",
  display_name: "Demo Kullanici",
  username: "demo",
  avatar_url: "https://i.pravatar.cc/300?u=demo-user",
  role: "business",
  tier: "premium",
  premium_until: null,
  agent_persona: {
    name: "Mina",
    avatar: "sparkles",
    style: "balanced",
  },
  profile: { sector: "Kafe", content_categories: ["Kafe", "Yasam Tarzi"] },
  city: "Istanbul",
  district: "Kadikoy",
  latitude: null,
  longitude: null,
  bio: "Mock modda calisan demo hesap.",
  created_at: nowIso(),
};

const mockAuthResponse = (patch: Partial<AuthUser> = {}): AuthResponse => ({
  access_token: "mock-token",
  token_type: "bearer",
  user: { ...mockUser, ...patch },
});

function toPublicInfluencer(item: (typeof mockInfluencers)[number], index: number): PublicProfile {
  return {
    id: index + 1,
    external_id: item.id,
    display_name: item.name,
    username: item.handle,
    avatar_url: item.avatar,
    role: "influencer",
    tier: "free",
    city: item.city,
    district: null,
    bio: item.bio,
    profile: {
      tier: item.aiLevel === "Mikro" ? "micro" : item.aiLevel === "Orta" ? "mid" : "macro",
      follower_count: item.followers,
      engagement_rate: item.engagement / 100,
      content_categories: item.niches,
      rating: item.rating,
      recent_work: item.recentWork,
    },
  };
}

function toPublicListing(item: (typeof mockListings)[number], index: number): ListingPublic {
  const numericBudget = item.budget.match(/\d[\d.]*/g)?.map((part) => Number(part.replace(/\./g, ""))) ?? [];

  return {
    id: index + 1,
    external_id: item.id,
    owner_id: 1,
    type: "collab",
    title: item.description,
    description: item.description,
    category: item.category,
    cover_url: item.cover,
    budget_min: numericBudget[0] ?? null,
    budget_max: numericBudget[1] ?? numericBudget[0] ?? null,
    city: item.city,
    district: item.district,
    latitude: null,
    longitude: null,
    extras: { requirements: item.requirements, posted_at: item.postedAt },
    active: true,
    created_at: nowIso(),
    business_name: item.business,
    business_avatar_url: null,
    business_sector: item.businessType,
  };
}

const mockPublicInfluencers = () => mockInfluencers.map(toPublicInfluencer);
const mockPublicListings = () => mockListings.map(toPublicListing);

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
  if (USE_MOCK) return { status: "ok", db: "mock" };
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
    return mockInfluencers.map((item) => ({
      id: item.id,
      name: item.name,
      type: "influencer",
      niche: item.niches[0] ?? "Genel",
      followers: item.followers,
      city: item.city,
      bio: item.bio,
      avatar_url: item.avatar,
    }));
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
    const profiles = await getLegacyProfiles();
    return profiles.slice(0, 2).map((profile, index) => ({
      match_id: `mock-match-${index + 1}`,
      influencer: profile,
      business: {
        id: "biz_1",
        name: "Moda Kahve",
        type: "business",
        niche: "Kafe",
        followers: 0,
        city: "Istanbul",
        bio: "Yerel kahve markasi.",
        avatar_url: null,
      },
      score: 82 - index * 6,
      reasons: ["Lokasyon uyumu", "Nis uyumu", "Butce araligi uygun"],
    }));
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
  if (USE_MOCK) {
    return Promise.resolve(
      mockAuthResponse({
        email: payload.email,
        display_name: payload.display_name,
        role: payload.role,
        city: payload.city ?? null,
      }),
    );
  }

  return fetchJson<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function loginUser(email: string, password: string): Promise<AuthResponse> {
  if (USE_MOCK) {
    void password;
    return Promise.resolve(mockAuthResponse({ email }));
  }

  return fetchJson<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function getMe(): Promise<AuthUser> {
  if (USE_MOCK) return Promise.resolve(mockUser);
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
  if (USE_MOCK) return Promise.resolve({ ...mockUser, ...patch });

  return fetchJson<AuthUser>("/users/me", {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

export function getDealbreakers(): Promise<DealbreakersRead | null> {
  if (USE_MOCK) {
    return Promise.resolve({
      min_price: 2500,
      max_price: 9000,
      max_hours_per_week: null,
      forbidden_days: [],
      required_days: [],
      forbidden_categories: [],
      require_in_person: false,
      free_notes: "Mock demo kosullari.",
      updated_at: nowIso(),
    });
  }

  return fetchJson<DealbreakersRead | null>("/users/me/dealbreakers");
}

export function upsertDealbreakers(payload: Dealbreakers): Promise<DealbreakersRead> {
  if (USE_MOCK) return Promise.resolve({ ...payload, updated_at: nowIso() });

  return fetchJson<DealbreakersRead>("/users/me/dealbreakers", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

// ---------------------------------------------------------------------------
// Negotiations
// ---------------------------------------------------------------------------
const mockTerms = {
  price: 4500,
  currency: "TRY",
  duration_days: 7,
  scope: "1 reels, 3 story ve kisa mekan ziyareti",
  extra_conditions: ["Icerik yayin oncesi onaylanacak"],
};

function mockNegotiation(id = 1): NegotiationDetail {
  return {
    id,
    match_id: 1,
    user_a_id: 1,
    user_b_id: 2,
    status: "active",
    current_round: 2,
    max_rounds: 5,
    last_proposed_terms: mockTerms,
    started_at: nowIso(),
    ended_at: null,
    messages: [
      {
        id: 1,
        negotiation_id: id,
        round: 1,
        role: "agent_a",
        content: "Merhaba, kampanya icin uygun bir kapsam ve butce onerebilirim.",
        reasoning: null,
        proposed_terms: mockTerms,
        status_signal: "proposal",
        created_at: nowIso(),
      },
    ],
    agreement: null,
  };
}

export function startNegotiation(matchId: number): Promise<NegotiationRead> {
  if (USE_MOCK) return Promise.resolve({ ...mockNegotiation(matchId), messages: undefined, agreement: undefined } as NegotiationRead);

  return fetchJson<NegotiationRead>("/negotiations/start", {
    method: "POST",
    body: JSON.stringify({ match_id: matchId }),
  });
}

export function getNegotiation(id: number): Promise<NegotiationDetail> {
  if (USE_MOCK) return Promise.resolve(mockNegotiation(id));
  return fetchJson<NegotiationDetail>(`/negotiations/${id}`);
}

export function getNegotiationInbox(): Promise<InboxItem[]> {
  if (USE_MOCK) {
    const negotiation = mockNegotiation(1);
    return Promise.resolve([
      {
        negotiation,
        counterpart_display_name: "Zeynep Aydin",
        last_round_summary: "Agent teklif sartlarini netlestiriyor.",
        unread: true,
      },
    ]);
  }

  return fetchJson<InboxItem[]>("/negotiations/inbox");
}

export function interveneNegotiation(
  id: number,
  payload: { content: string; guidance?: string; halt?: boolean },
): Promise<NegotiationMessageRead> {
  if (USE_MOCK) {
    return Promise.resolve({
      id: Date.now(),
      negotiation_id: id,
      round: 3,
      role: "user_a",
      content: payload.content,
      reasoning: payload.guidance ?? null,
      proposed_terms: null,
      status_signal: payload.halt ? "halt" : "human_note",
      created_at: nowIso(),
    });
  }

  return fetchJson<NegotiationMessageRead>(`/negotiations/${id}/intervene`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function finalizeNegotiation(
  id: number,
  decision: "accept" | "renegotiate" | "reject",
): Promise<NegotiationDetail> {
  if (USE_MOCK) {
    const detail = mockNegotiation(id);
    return Promise.resolve({
      ...detail,
      status: decision === "accept" ? "agreed" : decision === "reject" ? "rejected" : "active",
      ended_at: decision === "renegotiate" ? null : nowIso(),
    });
  }

  return fetchJson<NegotiationDetail>(`/negotiations/${id}/finalize`, {
    method: "POST",
    body: JSON.stringify({ decision }),
  });
}

export function extendNegotiation(id: number, pack = 1): Promise<NegotiationRead> {
  if (USE_MOCK) {
    const negotiation = mockNegotiation(id);
    return Promise.resolve({ ...negotiation, max_rounds: negotiation.max_rounds + pack * 3 });
  }

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
  if (USE_MOCK) {
    return Promise.resolve({
      premium_individual_try: 149,
      premium_business_try: 349,
      extra_rounds_try: 49,
      extra_rounds_per_pack: 3,
      max_rounds_default: 5,
    });
  }

  return fetchJson<PricingResponse>("/billing/pricing");
}

export function upgradePlanMock(
  plan: "premium_individual" | "premium_business",
  months = 1,
): Promise<AuthUser> {
  if (USE_MOCK) {
    return Promise.resolve({
      ...mockUser,
      tier: "premium",
      premium_until: new Date(Date.now() + months * 30 * 24 * 60 * 60 * 1000).toISOString(),
      profile: { ...(mockUser.profile ?? {}), plan },
    });
  }

  return fetchJson<AuthUser>("/billing/mock/upgrade", {
    method: "POST",
    body: JSON.stringify({ plan, months }),
  });
}

// ---------------------------------------------------------------------------
// Public / discovery / stats / messages / analytics (v2)
// ---------------------------------------------------------------------------
export function getPublicListings(
  filters: { city?: string; category?: string; q?: string; limit?: number } = {},
): Promise<ListingPublic[]> {
  if (USE_MOCK) {
    const q = filters.q?.toLowerCase();
    const rows = mockPublicListings().filter((item) => {
      const cityOk = !filters.city || item.city?.toLowerCase() === filters.city.toLowerCase();
      const categoryOk = !filters.category || item.category?.toLowerCase() === filters.category.toLowerCase();
      const qOk =
        !q ||
        [item.title, item.description, item.business_name, item.city, item.district]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(q);
      return cityOk && categoryOk && qOk;
    });
    return Promise.resolve(rows.slice(0, filters.limit ?? rows.length));
  }

  const params = new URLSearchParams();
  if (filters.city) params.set("city", filters.city);
  if (filters.category) params.set("category", filters.category);
  if (filters.q) params.set("q", filters.q);
  if (filters.limit) params.set("limit", String(filters.limit));
  const qs = params.toString();
  return fetchJson<ListingPublic[]>(`/public/listings${qs ? `?${qs}` : ""}`);
}

export function getPublicListing(id: number): Promise<ListingPublic> {
  if (USE_MOCK) {
    const listing = mockPublicListings().find((item) => item.id === id);
    if (!listing) return Promise.reject(new Error("Mock ilan bulunamadi."));
    return Promise.resolve(listing);
  }

  return fetchJson<ListingPublic>(`/public/listings/${id}`);
}

export function getPublicInfluencers(
  filters: { tier?: string; city?: string; niche?: string; q?: string; limit?: number } = {},
): Promise<PublicProfile[]> {
  if (USE_MOCK) {
    const q = filters.q?.toLowerCase();
    const rows = mockPublicInfluencers().filter((item) => {
      const profile = item.profile as { tier?: string; content_categories?: string[] };
      const tierOk = !filters.tier || profile.tier === filters.tier;
      const cityOk = !filters.city || item.city?.toLowerCase() === filters.city.toLowerCase();
      const nicheOk =
        !filters.niche ||
        profile.content_categories?.some((category) => category.toLowerCase() === filters.niche?.toLowerCase());
      const qOk =
        !q ||
        [item.display_name, item.username, item.city, ...(profile.content_categories ?? [])]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(q);
      return tierOk && cityOk && nicheOk && qOk;
    });
    return Promise.resolve(rows.slice(0, filters.limit ?? rows.length));
  }

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
  if (USE_MOCK) {
    const influencer = mockPublicInfluencers().find((item) => item.id === id);
    if (!influencer) return Promise.reject(new Error("Mock influencer bulunamadi."));
    return Promise.resolve(influencer);
  }

  return fetchJson<PublicProfile>(`/public/influencers/${id}`);
}

export function getInfluencerPosts(id: number, limit = 12): Promise<InstagramPostRead[]> {
  if (USE_MOCK) {
    return Promise.resolve(
      Array.from({ length: Math.min(limit, 6) }, (_, index) => ({
        id: id * 100 + index,
        external_id: `mock-post-${id}-${index}`,
        influencer_id: id,
        type: index % 2 === 0 ? "reels" : "post",
        caption: "Mock kampanya icerigi ve yerel marka vitrini.",
        hashtags: ["influmatch", "yerelmarka", "isbirligi"],
        mentioned_brands: ["Moda Kahve"],
        location_tag: "Istanbul",
        posted_at: nowIso(),
        metrics: { likes: 1200 + index * 140, comments: 45 + index * 5, views: 18000 + index * 1200 },
      })),
    );
  }

  return fetchJson<InstagramPostRead[]>(`/public/influencers/${id}/posts?limit=${limit}`);
}

export function getTaxonomy(): Promise<TaxonomyResponse> {
  if (USE_MOCK) {
    return Promise.resolve({
      sectors: ["Kafe", "Moda", "Yemek", "Seyahat", "Teknoloji"].map((label, id) => ({
        id,
        kind: "sector",
        code: label.toLowerCase(),
        label,
        parent_code: null,
      })),
      categories: ["Kafe", "Moda", "Yemek", "Seyahat", "Yasam Tarzi"].map((label, id) => ({
        id: id + 10,
        kind: "category",
        code: label.toLowerCase(),
        label,
        parent_code: null,
      })),
      content_styles: ["Reels", "Story", "Post"].map((label, id) => ({
        id: id + 20,
        kind: "content_style",
        code: label.toLowerCase(),
        label,
        parent_code: null,
      })),
      positions: ["Influencer", "Calisan", "Isletme"].map((label, id) => ({
        id: id + 30,
        kind: "position",
        code: label.toLowerCase(),
        label,
        parent_code: null,
      })),
    });
  }

  return fetchJson<TaxonomyResponse>("/public/taxonomy");
}

export function getDiscoveryFeed(limit = 20): Promise<DiscoveryFeed> {
  if (USE_MOCK) {
    const listingCards = mockPublicListings().map((listing, index) => ({
      user: null,
      listing,
      score: 88 - index * 4,
      reasons: ["Lokasyon yakin", "Kategori ilgisi yuksek", "Butce uyumlu"],
    }));
    const profileCards = mockPublicInfluencers().map((user, index) => ({
      user,
      listing: null,
      score: 91 - index * 3,
      reasons: ["Nis uyumu guclu", "Etkilesim orani iyi", "Yerel hedef kitle uyuyor"],
    }));

    return Promise.resolve({ cards: [...listingCards, ...profileCards].slice(0, limit) });
  }

  return fetchJson<DiscoveryFeed>(`/discovery/feed?limit=${limit}`);
}

export function getMyStats(): Promise<UserStats> {
  if (USE_MOCK) {
    return Promise.resolve({
      active_matches: mockMatches.filter((item) => item.status === "matched").length,
      weekly_swipes: 34,
      pending_negotiations: 2,
      confirmed_agreements: 1,
      total_listings: mockListings.length,
    });
  }

  return fetchJson<UserStats>("/users/me/stats");
}

export function getMyAnalytics(): Promise<AnalyticsResponse> {
  if (USE_MOCK) {
    const totalViews = mockAnalytics.reduce((sum, item) => sum + item.views, 0);
    return Promise.resolve({
      total_views: totalViews,
      average_engagement:
        mockAnalytics.reduce((sum, item) => sum + item.engagement, 0) / mockAnalytics.length,
      estimated_sales_lift_pct: 18,
      monthly: mockAnalytics,
    });
  }

  return fetchJson<AnalyticsResponse>("/analytics/me");
}

export function getMatchDetails(): Promise<MatchDetail[]> {
  if (USE_MOCK) {
    const listings = mockPublicListings();
    const users = mockPublicInfluencers();
    return Promise.resolve(
      mockMatches.map((match, index) => {
        const listing = listings.find((item) => item.external_id === match.listingId) ?? listings[index % listings.length];
        const user = users.find((item) => item.external_id === match.influencerId) ?? users[index % users.length];
        return {
          id: index + 1,
          listing_id: listing.id,
          candidate_id: user.id,
          status: match.status === "completed" ? "matched" : match.status,
          created_at: nowIso(),
          listing_title: listing.title,
          listing_cover_url: listing.cover_url,
          counterpart_id: user.id,
          counterpart_display_name: user.display_name,
          counterpart_avatar_url: user.avatar_url,
          last_message: match.lastMessage ?? null,
          last_activity_at: nowIso(),
        };
      }),
    );
  }

  return fetchJson<MatchDetail[]>("/matches/details");
}

export function getMyListings(): Promise<ListingPublic[]> {
  if (USE_MOCK) return Promise.resolve(mockPublicListings().slice(0, 2));
  return fetchJson<ListingPublic[]>("/listings/mine");
}

export function postSwipeV2(payload: {
  listing_id: number;
  candidate_id?: number;
  direction: "accept" | "reject";
}): Promise<SwipeResultV2> {
  if (USE_MOCK) {
    return Promise.resolve({
      match_id: Math.floor(Math.random() * 1000) + 1,
      status: payload.direction === "accept" ? "matched" : "rejected",
      auto_started_negotiation_id: payload.direction === "accept" ? 1 : null,
      paywall: false,
      paywall_reason: null,
    });
  }

  return fetchJson<SwipeResultV2>("/matches/swipe", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getConversations(): Promise<ConversationItem[]> {
  if (USE_MOCK) {
    const users = mockPublicInfluencers();
    return Promise.resolve(
      users.slice(0, 3).map((user, index) => ({
        match_id: index + 1,
        counterpart_id: user.id,
        counterpart_display_name: user.display_name,
        counterpart_avatar_url: user.avatar_url,
        last_message: index === 0 ? "Brief detaylarini paylasabilir misiniz?" : "Takvim uygunsa baslayabiliriz.",
        last_message_at: nowIso(),
      })),
    );
  }

  return fetchJson<ConversationItem[]>("/messages/conversations");
}

export function getMessages(matchId: number): Promise<MessageRead[]> {
  if (USE_MOCK) {
    return Promise.resolve([
      {
        id: 1,
        match_id: matchId,
        sender_id: 2,
        content: "Merhaba, kampanya detaylarini konusalim.",
        created_at: nowIso(),
      },
      {
        id: 2,
        match_id: matchId,
        sender_id: 1,
        content: "Tabii, mock modda demo akisi hazir.",
        created_at: nowIso(),
      },
    ]);
  }

  return fetchJson<MessageRead[]>(`/messages/${matchId}`);
}

export function postMessage(matchId: number, content: string): Promise<MessageRead> {
  if (USE_MOCK) {
    return Promise.resolve({
      id: Date.now(),
      match_id: matchId,
      sender_id: 1,
      content,
      created_at: nowIso(),
    });
  }

  return fetchJson<MessageRead>("/messages", {
    method: "POST",
    body: JSON.stringify({ match_id: matchId, content }),
  });
}
