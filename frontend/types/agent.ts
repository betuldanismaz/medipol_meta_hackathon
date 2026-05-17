export type UserRole = "influencer" | "worker" | "business";
export type UserTier = "free" | "premium";
export type AgentStyle = "aggressive" | "balanced" | "flexible" | "quick_closer";
export type MessageRole =
  | "agent_a"
  | "agent_b"
  | "user_a"
  | "user_b"
  | "system";

export type NegotiationStatus =
  | "active"
  | "agreed"
  | "rejected"
  | "expired"
  | "human_takeover";

export type AgreementStatus =
  | "proposed"
  | "confirmed"
  | "rejected"
  | "renegotiating";

export type AgentPersona = {
  name: string;
  avatar: string;
  style: AgentStyle;
};

export type Dealbreakers = {
  min_price: number | null;
  max_price: number | null;
  max_hours_per_week: number | null;
  forbidden_days: string[] | null;
  required_days: string[] | null;
  forbidden_categories: string[] | null;
  require_in_person: boolean;
  free_notes: string | null;
};

export type DealbreakersRead = Dealbreakers & { updated_at: string };

export type ProposedTerms = {
  price: number | null;
  currency: string;
  duration_days: number | null;
  scope: string | null;
  extra_conditions: string[];
};

export type AuthUser = {
  id: number;
  external_id: string | null;
  email: string;
  display_name: string;
  username: string | null;
  avatar_url: string | null;
  role: UserRole;
  tier: UserTier;
  premium_until: string | null;
  agent_persona: AgentPersona | null;
  profile: Record<string, unknown> | null;
  city: string | null;
  district: string | null;
  latitude: number | null;
  longitude: number | null;
  bio: string | null;
  created_at: string;
};

export type AuthResponse = {
  access_token: string;
  token_type: "bearer";
  user: AuthUser;
};

export type NegotiationMessageRead = {
  id: number;
  negotiation_id: number;
  round: number;
  role: MessageRole;
  content: string;
  reasoning: string | null;
  proposed_terms: ProposedTerms | null;
  status_signal: string | null;
  created_at: string;
};

export type AgreementRead = {
  id: number;
  negotiation_id: number;
  final_terms: ProposedTerms;
  status: AgreementStatus;
  accepted_by_a: boolean;
  accepted_by_b: boolean;
  created_at: string;
};

export type NegotiationRead = {
  id: number;
  match_id: number;
  user_a_id: number;
  user_b_id: number;
  status: NegotiationStatus;
  current_round: number;
  max_rounds: number;
  last_proposed_terms: ProposedTerms | null;
  started_at: string;
  ended_at: string | null;
};

export type NegotiationDetail = NegotiationRead & {
  messages: NegotiationMessageRead[];
  agreement: AgreementRead | null;
};

export type InboxItem = {
  negotiation: NegotiationRead;
  counterpart_display_name: string;
  last_round_summary: string | null;
  unread: boolean;
};

export type PricingResponse = {
  premium_individual_try: number;
  premium_business_try: number;
  extra_rounds_try: number;
  extra_rounds_per_pack: number;
  max_rounds_default: number;
};

export type PublicProfile = {
  id: number;
  external_id: string | null;
  display_name: string;
  username: string | null;
  avatar_url: string | null;
  role: UserRole;
  tier: UserTier;
  city: string | null;
  district: string | null;
  bio: string | null;
  profile: Record<string, unknown> | null;
};

export type ListingPublic = {
  id: number;
  external_id: string | null;
  owner_id: number;
  type: "collab" | "job";
  title: string;
  description: string;
  category: string | null;
  cover_url: string | null;
  budget_min: number | null;
  budget_max: number | null;
  city: string | null;
  district: string | null;
  latitude: number | null;
  longitude: number | null;
  extras: Record<string, unknown> | null;
  active: boolean;
  created_at: string;
  business_name: string | null;
  business_avatar_url: string | null;
  business_sector: string | null;
};

export type InstagramPostRead = {
  id: number;
  external_id: string | null;
  influencer_id: number;
  type: string;
  caption: string | null;
  hashtags: string[] | null;
  mentioned_brands: string[] | null;
  location_tag: string | null;
  posted_at: string | null;
  metrics: Record<string, number | string | null> | null;
};

export type TaxonomyTermRead = {
  id: number;
  kind: string;
  code: string;
  label: string;
  parent_code: string | null;
};

export type TaxonomyResponse = {
  sectors: TaxonomyTermRead[];
  categories: TaxonomyTermRead[];
  content_styles: TaxonomyTermRead[];
  positions: TaxonomyTermRead[];
};

export type DiscoveryCard = {
  user: PublicProfile | null;
  listing: ListingPublic | null;
  score: number;
  reasons: string[];
};

export type DiscoveryFeed = { cards: DiscoveryCard[] };

export type UserStats = {
  active_matches: number;
  weekly_swipes: number;
  pending_negotiations: number;
  confirmed_agreements: number;
  total_listings: number;
};

export type AnalyticsMonthly = { month: string; views: number; engagement: number };
export type AnalyticsResponse = {
  total_views: number;
  average_engagement: number;
  estimated_sales_lift_pct: number;
  monthly: AnalyticsMonthly[];
};

export type MatchDetail = {
  id: number;
  listing_id: number;
  candidate_id: number;
  status: "pending" | "matched" | "rejected";
  created_at: string;
  listing_title: string | null;
  listing_cover_url: string | null;
  counterpart_id: number | null;
  counterpart_display_name: string | null;
  counterpart_avatar_url: string | null;
  last_message: string | null;
  last_activity_at: string | null;
};

export type ConversationItem = {
  match_id: number;
  counterpart_id: number;
  counterpart_display_name: string;
  counterpart_avatar_url: string | null;
  last_message: string | null;
  last_message_at: string | null;
};

export type MessageRead = {
  id: number;
  match_id: number;
  sender_id: number;
  content: string;
  created_at: string;
};

export type SwipeResultV2 = {
  match_id: number | null;
  status: "pending" | "matched" | "rejected";
  auto_started_negotiation_id: number | null;
  paywall: boolean;
  paywall_reason: string | null;
};

export type StreamEvent =
  | {
      type: "snapshot";
      data: {
        negotiation: NegotiationRead;
        messages: NegotiationMessageRead[];
        agreement: AgreementRead | null;
      };
    }
  | { type: "message"; data: NegotiationMessageRead }
  | {
      type: "state";
      data: Pick<
        NegotiationRead,
        "id" | "status" | "current_round" | "max_rounds" | "last_proposed_terms"
      >;
    };
