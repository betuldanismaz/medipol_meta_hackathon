export type ProfileType = "influencer" | "business";

export type Profile = {
  id: string;
  name: string;
  type: ProfileType;
  niche: string;
  followers: number;
  city: string;
  bio: string;
  avatar_url: string | null;
};

export type SwipeDirection = "right" | "left";

export type SwipePayload = {
  user_id: string;
  target_id: string;
  direction: SwipeDirection;
};

export type SwipeResult = {
  match: boolean;
  match_id?: string;
};

export type MatchScore = {
  score: number;
  reasons: string[];
};

export type Match = {
  match_id: string;
  influencer: Profile;
  business: Profile;
  score: number;
  reasons: string[];
};
