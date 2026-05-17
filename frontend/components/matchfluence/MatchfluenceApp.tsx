"use client";

import { useMemo, useState } from "react";
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

  const selectedIds = useMemo(() => new Set(selectedInfluencers.map((item) => item.id)), [selectedInfluencers]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
        const profiles = await getProfiles();
        const enriched = await Promise.all(
          profiles.map(async (profile) => {
            const matchScore = await getMatchScore(profile.id, campaign.businessId);
            return { ...profile, matchScore };
          }),
        );

        setRankedInfluencers(
          enriched.sort((left, right) => right.matchScore.score - left.matchScore.score),
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
          : "Influencer verisi yuklenirken beklenmeyen bir hata olustu.";

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
        await postSwipe({ inf_id: influencer.id, biz_id: campaign.businessId, direction: "accept" });
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Swipe kaydi gonderilemedi.");
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
        await postSwipe({ inf_id: influencer.id, biz_id: campaign.businessId, direction: "reject" });
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Swipe kaydi gonderilemedi.");
    }
  };

  return (
    <main className="min-h-screen bg-mesh text-white">
      <div className="fixed inset-0 -z-10 bg-[#070a13]" />
      <Header currentStep={step} onRestart={restart} />

      {error ? (
        <div className="mx-auto mt-4 w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-rose-300/20 bg-rose-300/10 px-4 py-3 text-sm text-rose-100">
            {error}
          </div>
        </div>
      ) : null}

      {step === STEPS.landing ? <LandingPage isMock={isMockEnabled} onStart={() => setStep(STEPS.form)} /> : null}

      {step === STEPS.form ? (
        <CampaignForm
          campaign={campaign}
          isMock={isMockEnabled}
          setCampaign={setCampaign}
          onAnalyze={loadProfiles}
        />
      ) : null}

      {step === STEPS.swipe ? (
        <div>
          {loading ? (
            <LoadingState />
          ) : (
            <InfluencerSwipeCards
              rankedInfluencers={rankedInfluencers}
              campaign={campaign}
              isMock={isMockEnabled}
              onAccept={(influencer) => void acceptInfluencer(influencer)}
              onReject={(influencer) => void rejectInfluencer(influencer)}
              onRestart={restart}
            />
          )}
        </div>
      ) : null}

      {step === STEPS.result ? (
        <MatchResult
          selectedInfluencers={selectedInfluencers}
          rejectedInfluencers={rejectedInfluencers}
          rankedInfluencers={rankedInfluencers}
          campaign={campaign}
          isMock={isMockEnabled}
          onRestart={restart}
          onBackToCards={() => setStep(STEPS.swipe)}
        />
      ) : null}

      {step === STEPS.swipe && selectedIds.size > 0 && !loading ? (
        <button
          onClick={() => setStep(STEPS.result)}
          className="fixed bottom-4 left-1/2 z-40 -translate-x-1/2 rounded-full bg-white px-5 py-3 text-sm font-black text-slate-950 shadow-glow"
        >
          {selectedIds.size} secimi goruntule
        </button>
      ) : null}

      <style jsx global>{`
        .bg-mesh {
          background:
            radial-gradient(circle at top left, rgba(99, 102, 241, 0.2), transparent 30%),
            radial-gradient(circle at top right, rgba(34, 211, 238, 0.14), transparent 32%),
            radial-gradient(circle at bottom left, rgba(217, 70, 239, 0.16), transparent 32%),
            #070a13;
        }

        .card-gradient {
          background: linear-gradient(145deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.04));
          border: 1px solid rgba(255, 255, 255, 0.12);
          box-shadow: 0 24px 80px rgba(0, 0, 0, 0.32);
          backdrop-filter: blur(18px);
        }

        .shadow-glow {
          box-shadow:
            0 10px 30px rgba(255, 255, 255, 0.18),
            0 20px 60px rgba(99, 102, 241, 0.25);
        }

        .safe-area {
          padding-bottom: max(1rem, env(safe-area-inset-bottom));
        }

        .matchfluence-input {
          width: 100%;
          border-radius: 1rem;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(15, 23, 42, 0.75);
          color: white;
          padding: 0.9rem 1rem;
          outline: none;
        }

        .matchfluence-input:focus {
          border-color: rgba(165, 180, 252, 0.75);
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.18);
        }
      `}</style>
    </main>
  );
}

function Header({ currentStep, onRestart }: { currentStep: Step; onRestart: () => void }) {
  const stepLabel =
    {
      landing: "Tanitim",
      form: "Kampanya",
      swipe: "Swipe",
      result: "Sonuc",
    }[currentStep] ?? "Demo";

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <button onClick={onRestart} className="flex items-center gap-2 text-left">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-300 to-cyan-200 text-lg font-black text-slate-950">
            M
          </span>
          <span>
            <span className="block text-sm font-black text-white">Matchfluence AI</span>
            <span className="block text-xs text-slate-400">Hackathon MVP</span>
          </span>
        </button>
        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300">
          {stepLabel}
        </div>
      </div>
    </header>
  );
}

function LoadingState() {
  return (
    <section className="mx-auto flex min-h-[50vh] w-full max-w-3xl items-center px-4 py-8">
      <div className="card-gradient w-full rounded-[2rem] p-6 text-center">
        <p className="text-lg font-bold text-white">Influencer havuzu analiz ediliyor...</p>
        <p className="mt-2 text-sm text-slate-300">
          Niche, lokasyon, engagement, butce ve gecmis deneyim sinyalleri hesaplanıyor.
        </p>
      </div>
    </section>
  );
}
