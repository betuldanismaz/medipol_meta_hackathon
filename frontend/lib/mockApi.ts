import { matchfluenceInfluencers } from "@/data/matchfluenceInfluencers";
import { calculateMatchScore, rankInfluencers } from "@/lib/matchfluenceScoring";
import type {
  CampaignInput,
  MatchRecord,
  MatchScore,
  RankedInfluencer,
  SwipePayload,
  SwipeResponse,
} from "@/types";

const mockMatches: MatchRecord[] = [];

const sleep = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getProfilesMock(campaign: CampaignInput): Promise<RankedInfluencer[]> {
  await sleep();
  return rankInfluencers(matchfluenceInfluencers, campaign);
}

export async function postSwipeMock(payload: SwipePayload, campaign: CampaignInput): Promise<SwipeResponse> {
  await sleep(150);

  const influencer = matchfluenceInfluencers.find((item) => item.id === payload.inf_id);
  if (!influencer) {
    return { ok: false, message: "Mock influencer bulunamadi." };
  }

  const matchScore = calculateMatchScore(influencer, campaign);
  mockMatches.push({
    influencerId: payload.inf_id,
    businessId: payload.biz_id,
    matchScore,
  });

  return {
    ok: true,
    message: payload.direction === "accept" ? "Mock swipe kaydedildi." : "Mock ret kaydedildi.",
  };
}

export async function getMatchScoreMock(influencerId: string, campaign: CampaignInput): Promise<MatchScore> {
  await sleep(120);

  const influencer = matchfluenceInfluencers.find((item) => item.id === influencerId);
  if (!influencer) {
    throw new Error("Mock influencer bulunamadi.");
  }

  return calculateMatchScore(influencer, campaign);
}

export async function getMatchesMock(): Promise<MatchRecord[]> {
  await sleep(100);
  return [...mockMatches];
}
