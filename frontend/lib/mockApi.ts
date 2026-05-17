import type { Profile, SwipePayload, SwipeResult, MatchScore, Match } from "@/types";

const MOCK_PROFILES: Profile[] = [
  {
    id: "inf_1",
    name: "Ayşe Kaya",
    type: "influencer",
    niche: "moda",
    followers: 28000,
    city: "İstanbul",
    bio: "Sürdürülebilir moda içerikleri üretiyorum.",
    avatar_url: null,
  },
  {
    id: "inf_2",
    name: "Burak Demir",
    type: "influencer",
    niche: "yemek",
    followers: 52000,
    city: "Ankara",
    bio: "Sokak lezzetlerini keşfediyorum.",
    avatar_url: null,
  },
  {
    id: "inf_3",
    name: "Zeynep Arslan",
    type: "influencer",
    niche: "yaşam tarzı",
    followers: 15000,
    city: "İzmir",
    bio: "Minimalist yaşam, seyahat ve kafe köşeleri.",
    avatar_url: null,
  },
  {
    id: "biz_1",
    name: "Butik Nora",
    type: "business",
    niche: "moda",
    followers: 0,
    city: "İstanbul",
    bio: "El yapımı kadın giyimi.",
    avatar_url: null,
  },
  {
    id: "biz_2",
    name: "Café Verde",
    type: "business",
    niche: "yemek",
    followers: 0,
    city: "İstanbul",
    bio: "Organik kahve ve sağlıklı atıştırmalıklar.",
    avatar_url: null,
  },
];

const MOCK_MATCHES: Match[] = [
  {
    match_id: "match_001",
    influencer: MOCK_PROFILES[0],
    business: MOCK_PROFILES[3],
    score: 87,
    reasons: ["Aynı niş (moda)", "Takipçi kitlesi uygun", "Aynı şehir"],
  },
  {
    match_id: "match_002",
    influencer: MOCK_PROFILES[1],
    business: MOCK_PROFILES[4],
    score: 74,
    reasons: ["Yemek nişi örtüşüyor", "Hedef kitle benzer"],
  },
];

// Hangi profillere sağa swipe edildiğini takip eder (session boyunca)
const swipedRight = new Set<string>();

export async function mockGetProfiles(): Promise<Profile[]> {
  await delay(200);
  return MOCK_PROFILES;
}

export async function mockPostSwipe(payload: SwipePayload): Promise<SwipeResult> {
  await delay(300);
  if (payload.direction === "right") {
    swipedRight.add(payload.target_id);
    // İlk sağa kaydırma match simülasyonu
    if (swipedRight.size === 1) {
      return { match: true, match_id: "match_demo_001" };
    }
  }
  return { match: false };
}

export async function mockGetMatchScore(infId: string, bizId: string): Promise<MatchScore> {
  await delay(200);
  const existing = MOCK_MATCHES.find(
    (m) => m.influencer.id === infId && m.business.id === bizId,
  );
  if (existing) {
    return { score: existing.score, reasons: existing.reasons };
  }
  return {
    score: 65,
    reasons: ["Genel niş uyumu", "Benzer takipçi kitlesi"],
  };
}

export async function mockGetMatches(): Promise<Match[]> {
  await delay(200);
  return MOCK_MATCHES;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
