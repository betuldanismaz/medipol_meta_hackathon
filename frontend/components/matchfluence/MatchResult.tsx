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

  if (!best) {
    return null;
  }

  return (
    <section className="mx-auto min-h-screen w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <DemoDataBadge isMock={isMock} />
          <h1 className="mt-4 text-3xl font-black text-white sm:text-5xl">Match sonucu</h1>
          <p className="mt-3 max-w-2xl text-slate-300">
            {campaign.businessName} kampanyasi icin secilen adaylar ve aciklanabilir skor kirilimi.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onBackToCards}
            className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-white hover:bg-white/10"
          >
            Kartlara don
          </button>
          <button
            onClick={onRestart}
            className="rounded-2xl bg-white px-4 py-3 text-sm font-black text-slate-950"
          >
            Yeni demo
          </button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[.95fr_1.05fr]">
        <div className="card-gradient rounded-[2rem] p-5">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-200">En iyi aday</p>
          <div className="mt-4 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black text-white">{best.name}</h2>
              <p className="mt-1 text-sm text-slate-300">{best.location}</p>
              <p className="mt-1 text-xs text-slate-400">{best.handle}</p>
            </div>
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white/10 text-4xl">
              {best.avatar}
            </div>
          </div>
          <div className="mt-5 rounded-3xl bg-emerald-300/10 p-5">
            <div className="flex items-end justify-between">
              <span className="text-sm font-bold text-emerald-100">Match Score</span>
              <span className="text-6xl font-black text-emerald-100">{best.matchScore.score}</span>
            </div>
            <div className="mt-3 h-4 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-emerald-300"
                style={{ width: `${best.matchScore.score}%` }}
              />
            </div>
          </div>
          <div className="mt-5">
            <ScoreBreakdown breakdown={best.matchScore.breakdown} />
          </div>
          <div className="mt-5 rounded-3xl border border-white/10 bg-white/[0.05] p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Neden onerildi?</p>
            <ul className="mt-2 space-y-2 text-sm leading-6 text-slate-200">
              {best.matchScore.reasons.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <Stat label="Secilen" value={selectedInfluencers.length} />
            <Stat label="Pas gecilen" value={rejectedInfluencers.length} />
            <Stat label="Analiz edilen" value={rankedInfluencers.length} />
          </div>

          <div className="card-gradient rounded-[2rem] p-5">
            <h3 className="text-xl font-black text-white">Secilen adaylar</h3>
            <div className="mt-4 space-y-3">
              {(selectedInfluencers.length > 0 ? selectedInfluencers : [best]).map((influencer) => (
                <ResultRow key={influencer.id} influencer={influencer} />
              ))}
            </div>
          </div>

          <div className="card-gradient rounded-[2rem] p-5">
            <h3 className="text-xl font-black text-white">Juriye anlatim cumlesi</h3>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Matchfluence AI, takipci sayisini tek basina basari gostergesi kabul etmez. Skor motoru; niche uyumu, lokasyon yakinligi, engagement sagligi, hedef kitle ortusmesi, butce uygunlugu ve gecmis kampanya deneyimini birlikte hesaplar. Bu sayede lokal isletmeler icin daha uygun maliyetli ve daha yuksek etkilesim potansiyelli mikro-influencer onerileri one cikarilir.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ResultRow({ influencer }: { influencer: RankedInfluencer }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-2xl">
            {influencer.avatar}
          </div>
          <div>
            <h4 className="font-black text-white">{influencer.name}</h4>
            <p className="mt-1 text-xs text-slate-400">{influencer.niches.join(" | ")}</p>
          </div>
        </div>
        <div className="rounded-2xl bg-white px-3 py-2 text-sm font-black text-slate-950">
          {influencer.matchScore.score}
        </div>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-300">{influencer.matchScore.reasons.join(" ")}</p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 text-center">
      <div className="text-3xl font-black text-white">{value}</div>
      <div className="mt-1 text-xs text-slate-400">{label}</div>
    </div>
  );
}
