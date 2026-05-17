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

const stepLabels: Record<Step, string> = {
  landing: "Tanitim",
  form: "Kampanya",
  swipe: "Swipe",
  result: "Sonuc",
};

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
        const profiles = await getProfiles(campaign);
        const enriched = await Promise.all(
          profiles.map(async (profile) => {
            const matchScore = await getMatchScore(profile.id, campaign);
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
        await postSwipe(
          { inf_id: influencer.id, biz_id: campaign.businessId, direction: "accept" },
          campaign,
        );
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
        await postSwipe(
          { inf_id: influencer.id, biz_id: campaign.businessId, direction: "reject" },
          campaign,
        );
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Swipe kaydi gonderilemedi.");
    }
  };

  return (
    <main className="matchfluence-shell min-h-screen overflow-hidden bg-[#f8fafc] text-slate-950">
      <NetworkBackground />
      <Header currentStep={step} onRestart={restart} />

      {error ? (
        <div className="relative z-10 mx-auto mt-4 w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 shadow-sm">
            {error}
          </div>
        </div>
      ) : null}

      <div className="relative z-10">
        {step === STEPS.landing ? (
          <LandingPage isMock={isMockEnabled} onStart={() => setStep(STEPS.form)} />
        ) : null}

        {step === STEPS.form ? (
          <CampaignForm
            campaign={campaign}
            isMock={isMockEnabled}
            setCampaign={setCampaign}
            onAnalyze={loadProfiles}
          />
        ) : null}

        {step === STEPS.swipe ? (
          loading ? (
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
          )
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
      </div>

      {step === STEPS.swipe && selectedIds.size > 0 && !loading ? (
        <button
          onClick={() => setStep(STEPS.result)}
          className="fixed bottom-4 left-1/2 z-40 -translate-x-1/2 rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white shadow-xl shadow-slate-950/20 transition hover:-translate-y-0.5"
        >
          {selectedIds.size} secimi goruntule
        </button>
      ) : null}

      <style jsx global>{`
        .matchfluence-panel {
          border: 1px solid rgba(15, 23, 42, 0.08);
          background: rgba(255, 255, 255, 0.86);
          box-shadow: 0 22px 70px rgba(15, 23, 42, 0.08);
          backdrop-filter: blur(18px);
        }

        .matchfluence-soft-panel {
          border: 1px solid rgba(15, 23, 42, 0.08);
          background: rgba(255, 255, 255, 0.66);
          backdrop-filter: blur(14px);
        }

        .safe-area {
          padding-bottom: max(1rem, env(safe-area-inset-bottom));
        }

        .matchfluence-input {
          width: 100%;
          border-radius: 1rem;
          border: 1px solid rgba(15, 23, 42, 0.12);
          background: rgba(255, 255, 255, 0.88);
          color: rgb(15, 23, 42);
          padding: 0.9rem 1rem;
          outline: none;
          transition:
            border-color 160ms ease,
            box-shadow 160ms ease,
            background 160ms ease;
        }

        .matchfluence-input:focus {
          border-color: rgba(99, 102, 241, 0.6);
          background: white;
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.12);
        }

        .network-lines line {
          animation: network-line-pulse 7s ease-in-out infinite;
        }

        .network-node {
          animation: network-node-pulse 4.8s ease-in-out infinite;
        }

        @keyframes network-line-pulse {
          0%,
          100% {
            opacity: 0.16;
          }

          50% {
            opacity: 0.36;
          }
        }

        @keyframes network-node-pulse {
          0%,
          100% {
            opacity: 0.52;
            transform: scale(1);
          }

          50% {
            opacity: 0.95;
            transform: scale(1.35);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .network-lines line,
          .network-node {
            animation: none;
          }
        }
      `}</style>
    </main>
  );
}

function Header({ currentStep, onRestart }: { currentStep: Step; onRestart: () => void }) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <button onClick={onRestart} className="flex items-center gap-2 text-left">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-sm font-black text-white">
            M
          </span>
          <span>
            <span className="block text-sm font-black text-slate-950">Matchfluence AI</span>
            <span className="block text-xs text-slate-500">Influencer eslestirme</span>
          </span>
        </button>
        <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
          {stepLabels[currentStep]}
        </div>
      </div>
    </header>
  );
}

function LoadingState() {
  return (
    <section className="mx-auto flex min-h-[55vh] w-full max-w-3xl items-center px-4 py-8">
      <div className="matchfluence-panel w-full rounded-3xl p-6 text-center">
        <p className="text-lg font-bold text-slate-950">Influencer havuzu analiz ediliyor...</p>
        <p className="mt-2 text-sm text-slate-500">
          Niche, lokasyon, etkileşim ve butce sinyalleri hesaplanıyor.
        </p>
      </div>
    </section>
  );
}

function NetworkBackground() {
  const nodes = [
    [10, 22],
    [24, 48],
    [38, 24],
    [56, 40],
    [74, 20],
    [88, 48],
    [18, 78],
    [46, 72],
    [70, 82],
    [92, 72],
  ];
  const links = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 4],
    [4, 5],
    [1, 6],
    [6, 7],
    [7, 8],
    [8, 9],
    [3, 7],
    [5, 9],
  ];

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_18%,rgba(99,102,241,0.12),transparent_26%),radial-gradient(circle_at_82%_16%,rgba(14,165,233,0.10),transparent_24%),radial-gradient(circle_at_52%_84%,rgba(244,114,182,0.10),transparent_28%)]" />
      <svg className="absolute inset-0 h-full w-full opacity-70" viewBox="0 0 100 100" preserveAspectRatio="none">
        <g className="network-lines">
          {links.map(([from, to]) => (
            <line
              key={`${from}-${to}`}
              x1={nodes[from][0]}
              y1={nodes[from][1]}
              x2={nodes[to][0]}
              y2={nodes[to][1]}
              stroke="rgba(99,102,241,0.45)"
              strokeWidth="0.18"
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </g>
        <g>
          {nodes.map(([cx, cy], index) => (
            <circle
              key={`${cx}-${cy}`}
              className="network-node"
              cx={cx}
              cy={cy}
              r="1.8"
              fill="white"
              stroke="rgba(99,102,241,0.55)"
              strokeWidth="0.24"
              vectorEffect="non-scaling-stroke"
              style={{ animationDelay: `${index * 180}ms` }}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}
