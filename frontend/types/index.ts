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
