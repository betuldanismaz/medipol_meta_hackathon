import DemoDataBadge from "@/components/matchfluence/DemoDataBadge";
import ScoreBreakdown from "@/components/matchfluence/ScoreBreakdown";
import type { CampaignInput, RankedInfluencer } from "@/types";

type MatchResultProps = {
  selectedInfluencers: RankedInfluencer[];
  rejectedInfluencers: RankedInfluencer[];
  rankedInfluencers: RankedInfluencer[];
  campaign: CampaignInput;
  isMock: boolean;
  onRestart: () => void;
  onBackToCards: () => void;
};

export default function MatchResult({
  selectedInfluencers,
  rejectedInfluencers,
  rankedInfluencers,
  campaign,
  isMock,
  onRestart,
  onBackToCards,
}: MatchResultProps) {
  const best = selectedInfluencers[0] ?? rankedInfluencers[0];
  const visibleSelected = selectedInfluencers.length > 0 ? selectedInfluencers : best ? [best] : [];

  if (!best) {
    return null;
  }

  return (
    <section className="mx-auto min-h-[calc(100vh-4rem)] w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <DemoDataBadge isMock={isMock} />
          <h1 className="mt-4 text-3xl font-black text-slate-950 sm:text-5xl">Match sonucu</h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            {campaign.businessName} icin secilen adaylar ve en guclu skor.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onBackToCards}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            Kartlara don
          </button>
          <button
            onClick={onRestart}
            className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white transition hover:bg-slate-800"
          >
            Yeni demo
          </button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="matchfluence-panel rounded-3xl p-5">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
            En iyi aday
          </p>
          <div className="mt-4 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black text-slate-950">{best.name}</h2>
              <p className="mt-1 text-sm text-slate-500">{best.location}</p>
              <p className="mt-1 text-xs text-slate-400">{best.handle}</p>
            </div>
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-lg font-black text-slate-700">
              {best.name
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)}
            </div>
          </div>

          <div className="mt-5 rounded-2xl bg-slate-50 p-5">
            <div className="flex items-end justify-between">
              <span className="text-sm font-bold text-slate-600">Match Score</span>
              <span className="text-6xl font-black text-emerald-600">
                {best.matchScore.score}
              </span>
            </div>
            <div className="mt-3 h-4 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-emerald-400"
                style={{ width: `${best.matchScore.score}%` }}
              />
            </div>
          </div>

          <div className="mt-5">
            <ScoreBreakdown breakdown={best.matchScore.breakdown} />
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <Stat label="Secilen" value={selectedInfluencers.length} />
            <Stat label="Pas gecilen" value={rejectedInfluencers.length} />
            <Stat label="Analiz edilen" value={rankedInfluencers.length} />
          </div>

          <div className="matchfluence-panel rounded-3xl p-5">
            <h3 className="text-xl font-black text-slate-950">Secilen adaylar</h3>
            <div className="mt-4 space-y-3">
              {visibleSelected.map((influencer) => (
                <ResultRow key={influencer.id} influencer={influencer} />
              ))}
            </div>
          </div>

          <details className="matchfluence-soft-panel rounded-3xl p-5">
            <summary className="cursor-pointer text-sm font-black text-slate-700">
              Kisa demo anlatimi
            </summary>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Matchfluence AI, takipci sayisini tek basina yeterli gormez. Niche, lokasyon,
              etkileşim, hedef kitle ve butce uyumunu birlikte hesaplayarak daha uygun
              mikro-influencer onerileri sunar.
            </p>
          </details>
        </div>
      </div>
    </section>
  );
}

function ResultRow({ influencer }: { influencer: RankedInfluencer }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="font-black text-slate-950">{influencer.name}</h4>
          <p className="mt-1 text-xs text-slate-500">{influencer.niches.join(" | ")}</p>
        </div>
        <div className="rounded-xl bg-slate-950 px-3 py-2 text-sm font-black text-white">
          {influencer.matchScore.score}
        </div>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        {influencer.matchScore.reasons.slice(0, 2).join(" ")}
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="matchfluence-soft-panel rounded-2xl p-4 text-center">
      <div className="text-3xl font-black text-slate-950">{value}</div>
      <div className="mt-1 text-xs text-slate-500">{label}</div>
    </div>
  );
}
