export type MatchBreakdown = {
  nicheMatch: number;
  locationMatch: number;
  engagementFit: number;
  audienceFit: number;
  budgetFit: number;
  campaignExperience: number;
};

export type MatchScore = {
  score: number;
  reasons: string[];
  breakdown: MatchBreakdown;
};

export type LegacyMatchScore = {
  score: number;
  reasons: string[];
};

export type InfluencerProfile = {
  id: string;
  name: string;
  handle: string;
  location: string;
  niches: string[];
  followers: number;
  engagementRate: number;
  avgViews: number;
  price: number;
  audience: string[];
  pastCampaigns: string[];
  bio: string;
  avatar: string;
};

export type CampaignInput = {
  businessId: string;
  businessName: string;
  sector: string;
  location: string;
  targetAudience: string;
  budget: number;
  campaignGoal: string;
  preferredNiches: string[];
};

export type RankedInfluencer = InfluencerProfile & {
  matchScore: MatchScore;
};

export type SwipeDirection = "accept" | "reject";

export type SwipePayload = {
  inf_id: string;
  biz_id: string;
  direction: SwipeDirection;
};

export type SwipeResponse = {
  ok: boolean;
  message: string;
};

export type MatchRecord = {
  influencerId: string;
  businessId: string;
  matchScore: MatchScore;
};

export type LegacyProfile = {
  id: string;
  name: string;
  type: "influencer" | "business";
  niche: string;
  followers: number;
  city: string;
  bio: string;
  avatar_url: string | null;
};

export type LegacySwipePayload = {
  user_id: string;
  target_id: string;
  direction: "left" | "right";
};

export type LegacySwipeResult = {
  match: boolean;
  match_id: string | null;
};

export type LegacyMatch = {
  match_id: string;
  influencer: LegacyProfile;
  business: LegacyProfile;
  score: number;
  reasons: string[];
};
