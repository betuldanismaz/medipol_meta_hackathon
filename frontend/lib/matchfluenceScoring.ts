import type {
  CampaignInput,
  InfluencerProfile,
  MatchBreakdown,
  MatchScore,
  RankedInfluencer,
} from "@/types";

const WEIGHTS: Record<keyof MatchBreakdown, number> = {
  nicheMatch: 28,
  locationMatch: 18,
  engagementFit: 20,
  audienceFit: 16,
  budgetFit: 10,
  campaignExperience: 8,
};

const MICRO_MIN = 5_000;
const MICRO_MAX = 100_000;

const clamp = (value: number, min = 0, max = 100) =>
  Math.min(max, Math.max(min, value));

const normalize = (value = "") =>
  value
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const includesAny = (source: string | string[], candidates: string[]) => {
  const normalizedSource = normalize(Array.isArray(source) ? source.join(" ") : source);
  return candidates.some((candidate) => normalizedSource.includes(normalize(candidate)));
};

const getOverlapRatio = (source: string[], target: string[]) => {
  if (!source.length || !target.length) {
    return 0;
  }

  const sourceNormalized = source.map(normalize);
  const targetNormalized = target.map(normalize);
  const overlaps = sourceNormalized.filter((item) =>
    targetNormalized.some((candidate) => item.includes(candidate) || candidate.includes(item)),
  );

  return overlaps.length / Math.max(targetNormalized.length, 1);
};

const scoreNiche = (
  influencerNiches: string[],
  preferredNiches: string[],
  sector: string,
) => {
  const baseline = preferredNiches.length ? preferredNiches : normalize(sector).split(" ");
  return clamp(getOverlapRatio(influencerNiches, baseline) * 100, 12, 100);
};

const scoreLocation = (influencerLocation: string, campaignLocation: string) => {
  const inf = normalize(influencerLocation);
  const camp = normalize(campaignLocation);

  if (!inf || !camp) {
    return 40;
  }
  if (inf === camp || inf.includes(camp) || camp.includes(inf)) {
    return 100;
  }

  const infParts = inf.split(" ");
  const campParts = camp.split(" ");
  const shared = infParts.filter((part) => campParts.includes(part));

  if (shared.includes("istanbul")) {
    return 75;
  }
  if (shared.length > 0) {
    return 58;
  }
  return 20;
};

const scoreEngagement = (engagementRate: number) => {
  if (engagementRate >= 8) return 100;
  if (engagementRate >= 6) return 90;
  if (engagementRate >= 4.5) return 74;
  if (engagementRate >= 3) return 58;
  if (engagementRate >= 2) return 38;
  return 20;
};

const scoreAudience = (audience: string[], targetAudience: string) => {
  const tokens = normalize(targetAudience).split(" ").filter((token) => token.length > 2);
  if (!tokens.length) {
    return 45;
  }

  const hits = tokens.filter((token) => includesAny(audience, [token]));
  return clamp((hits.length / Math.min(tokens.length, 8)) * 100, 18, 100);
};

const scoreBudget = (price: number, budget: number) => {
  if (!budget || budget <= 0) {
    return 50;
  }
  if (price <= budget * 0.75) return 100;
  if (price <= budget) return 88;
  if (price <= budget * 1.2) return 62;
  if (price <= budget * 1.5) return 36;
  return 15;
};

const scoreCampaignExperience = (pastCampaigns: string[]) =>
  clamp(pastCampaigns.length * 24, 24, 100);

const scoreMicroInfluencerFit = (followers: number, engagementRate: number) => {
  if (followers < MICRO_MIN) {
    return 55;
  }
  if (followers <= MICRO_MAX) {
    return engagementRate >= 5 ? 100 : 88;
  }
  if (followers <= 150_000) {
    return engagementRate >= 4 ? 62 : 45;
  }
  return 28;
};

const combineReasons = (
  influencer: InfluencerProfile,
  campaign: CampaignInput,
  breakdown: MatchBreakdown,
) => {
  const sharedNiches = influencer.niches.filter((niche) =>
    campaign.preferredNiches.some((preferred) => {
      const nicheValue = normalize(niche);
      const preferredValue = normalize(preferred);
      return nicheValue.includes(preferredValue) || preferredValue.includes(nicheValue);
    }),
  );

  const reasons: string[] = [];

  if (sharedNiches.length) {
    reasons.push(`${sharedNiches.join(", ")} nislerinde dogrudan uyum gosteriyor.`);
  }
  if (breakdown.locationMatch >= 75) {
    reasons.push(`${campaign.location} lokasyonuna yakin veya ayni bolgede icerik uretiyor.`);
  }
  if (breakdown.engagementFit >= 80) {
    reasons.push(`%${influencer.engagementRate} engagement ile mikro-influencer kalitesi guclu.`);
  }
  if (breakdown.budgetFit >= 80) {
    reasons.push(`${influencer.price.toLocaleString("tr-TR")} TL fiyat seviyesi kampanya butcesine uyuyor.`);
  }
  if (breakdown.campaignExperience >= 70) {
    reasons.push("Benzer marka veya kampanya tecrubesi bulunuyor.");
  }

  if (!reasons.length) {
    reasons.push("Skor, tek bir metrik yerine birden fazla uyum sinyalinin dengeli sonucudur.");
  }

  return reasons.slice(0, 4);
};

export const scoreLabels: Record<keyof MatchBreakdown, string> = {
  nicheMatch: "Niche uyumu",
  locationMatch: "Lokasyon uyumu",
  engagementFit: "Engagement orani",
  audienceFit: "Hedef kitle uyumu",
  budgetFit: "Butce uyumu",
  campaignExperience: "Gecmis kampanya deneyimi",
};

export function calculateMatchScore(
  influencer: InfluencerProfile,
  campaign: CampaignInput,
): MatchScore {
  const engagementBase = scoreEngagement(influencer.engagementRate);
  const microBonus = scoreMicroInfluencerFit(influencer.followers, influencer.engagementRate);

  const breakdown: MatchBreakdown = {
    nicheMatch: Math.round(scoreNiche(influencer.niches, campaign.preferredNiches, campaign.sector)),
    locationMatch: Math.round(scoreLocation(influencer.location, campaign.location)),
    engagementFit: Math.round((engagementBase * 0.7) + (microBonus * 0.3)),
    audienceFit: Math.round(scoreAudience(influencer.audience, campaign.targetAudience)),
    budgetFit: Math.round(scoreBudget(influencer.price, Number(campaign.budget))),
    campaignExperience: Math.round(scoreCampaignExperience(influencer.pastCampaigns)),
  };

  const score = clamp(
    Math.round(
      Object.entries(breakdown).reduce((total, [key, value]) => {
        const weight = WEIGHTS[key as keyof MatchBreakdown];
        return total + ((value / 100) * weight);
      }, 0),
    ),
    0,
    100,
  );

  return {
    score,
    reasons: combineReasons(influencer, campaign, breakdown),
    breakdown,
  };
}

export function rankInfluencers(
  influencers: InfluencerProfile[],
  campaign: CampaignInput,
): RankedInfluencer[] {
  return influencers
    .map((influencer) => ({
      ...influencer,
      matchScore: calculateMatchScore(influencer, campaign),
    }))
    .sort((left, right) => right.matchScore.score - left.matchScore.score);
}
