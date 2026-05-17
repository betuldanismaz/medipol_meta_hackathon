"use client";

import { useMemo, useState } from "react";
import { SiteShell } from "@/components/site/SiteShell";
import CampaignForm from "@/components/matchfluence/CampaignForm";
import InfluencerSwipeCards from "@/components/matchfluence/InfluencerSwipeCards";
import LandingPage from "@/components/matchfluence/LandingPage";
import MatchResult from "@/components/matchfluence/MatchResult";
import { sampleCampaign } from "@/data/matchfluenceInfluencers";
import { getMatchScore, getProfiles, postSwipe } from "@/lib/api";
import { getProfilesMock, postSwipeMock } from "@/lib/mockApi";
import { rankInfluencers } from "@/lib/matchfluenceScoring";
import type { CampaignInput, RankedInfluencer } from "@/types";

const STEPS = {
  landing: "landing",
  form: "form",
  swipe: "swipe",
  result: "result",
} as const;

type Step = (typeof STEPS)[keyof typeof STEPS];

const isMockEnabled = process.env.NEXT_PUBLIC_USE_MOCK !== "false";

export default function MatchfluenceApp() {
  const [step, setStep] = useState<Step>(STEPS.landing);
  const [campaign, setCampaign] = useState<CampaignInput>(sampleCampaign);
  const [rankedInfluencers, setRankedInfluencers] = useState<RankedInfluencer[]>([]);
  const [selectedInfluencers, setSelectedInfluencers] = useState<RankedInfluencer[]>([]);
  const [rejectedInfluencers, setRejectedInfluencers] = useState<RankedInfluencer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedIds = useMemo(
    () => new Set(selectedInfluencers.map((item) => item.id)),
    [selectedInfluencers],
  );

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const restart = () => {
    setCampaign(sampleCampaign);
    setRankedInfluencers([]);
    setSelectedInfluencers([]);
    setRejectedInfluencers([]);
    setError(null);
    setStep(STEPS.landing);
    scrollToTop();
  };

  const loadProfiles = async () => {
    setLoading(true);
    setError(null);

    try {
      if (isMockEnabled) {
        setRankedInfluencers(await getProfilesMock(campaign));
      } else {
        const profiles = await getProfiles(campaign);
        const enriched = await Promise.all(
          profiles.map(async (profile) => {
            const matchScore = await getMatchScore(profile.id, campaign);
            return { ...profile, matchScore };
          }),
        );
        setRankedInfluencers(
          enriched.sort((l, r) => r.matchScore.score - l.matchScore.score),
        );
      }

      setSelectedInfluencers([]);
      setRejectedInfluencers([]);
      setStep(STEPS.swipe);
      scrollToTop();
    } catch (cause) {
      const message =
        cause instanceof Error
          ? cause.message
          : "Influencer verisi yüklenirken beklenmeyen bir hata oluştu.";
      setError(message);
      setRankedInfluencers(isMockEnabled ? rankInfluencers([], campaign) : []);
    } finally {
      setLoading(false);
    }
  };

  const acceptInfluencer = async (influencer: RankedInfluencer) => {
    setSelectedInfluencers((prev) => {
      const next = prev.some((item) => item.id === influencer.id) ? prev : [...prev, influencer];
      if (next.length >= 3) {
        window.setTimeout(() => setStep(STEPS.result), 250);
      }
      return next;
    });

    try {
      if (isMockEnabled) {
        await postSwipeMock(
          { inf_id: influencer.id, biz_id: campaign.businessId, direction: "accept" },
          campaign,
        );
      } else {
        await postSwipe(
          { inf_id: influencer.id, biz_id: campaign.businessId, direction: "accept" },
          campaign,
        );
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Swipe kaydı gönderilemedi.");
    }
  };

  const rejectInfluencer = async (influencer: RankedInfluencer) => {
    setRejectedInfluencers((prev) =>
      prev.some((item) => item.id === influencer.id) ? prev : [...prev, influencer],
    );

    try {
      if (isMockEnabled) {
        await postSwipeMock(
          { inf_id: influencer.id, biz_id: campaign.businessId, direction: "reject" },
          campaign,
        );
      } else {
        await postSwipe(
          { inf_id: influencer.id, biz_id: campaign.businessId, direction: "reject" },
          campaign,
        );
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Swipe kaydı gönderilemedi.");
    }
  };

  return (
    <SiteShell>
      {error && (
        <div className="mx-auto mt-4 w-full max-w-4xl px-4 sm:px-6">
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        </div>
      )}

      {step === STEPS.landing && (
        <LandingPage isMock={isMockEnabled} onStart={() => setStep(STEPS.form)} />
      )}

      {step === STEPS.form && (
        <CampaignForm
          campaign={campaign}
          isMock={isMockEnabled}
          setCampaign={setCampaign}
          onAnalyze={loadProfiles}
        />
      )}

      {step === STEPS.swipe &&
        (loading ? (
          <LoadingState />
        ) : (
          <InfluencerSwipeCards
            rankedInfluencers={rankedInfluencers}
            campaign={campaign}
            isMock={isMockEnabled}
            onAccept={(inf) => void acceptInfluencer(inf)}
            onReject={(inf) => void rejectInfluencer(inf)}
            onRestart={restart}
          />
        ))}

      {step === STEPS.result && (
        <MatchResult
          selectedInfluencers={selectedInfluencers}
          rejectedInfluencers={rejectedInfluencers}
          rankedInfluencers={rankedInfluencers}
          campaign={campaign}
          isMock={isMockEnabled}
          onRestart={restart}
          onBackToCards={() => setStep(STEPS.swipe)}
        />
      )}

      {step === STEPS.swipe && selectedIds.size > 0 && !loading && (
        <div className="fixed bottom-5 left-1/2 z-40 -translate-x-1/2">
          <button
            onClick={() => setStep(STEPS.result)}
            className="rounded-full bg-gradient-brand px-5 py-3 text-sm font-semibold text-white shadow-[var(--shadow-glow)] hover:opacity-90 transition"
          >
            {selectedIds.size} seçimi görüntüle
          </button>
        </div>
      )}
    </SiteShell>
  );
}

function LoadingState() {
  return (
    <section className="mx-auto flex min-h-[55vh] w-full max-w-3xl items-center px-4 py-8">
      <div className="w-full rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 h-10 w-10 rounded-full border-2 border-[var(--brand)] border-t-transparent animate-spin" />
        <p className="text-lg font-semibold">Influencer havuzu analiz ediliyor...</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Niche, lokasyon, etkileşim ve bütçe sinyalleri hesaplanıyor.
        </p>
      </div>
    </section>
  );
}
