import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RotateCcw, ChevronLeft } from "lucide-react";
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
  const visibleSelected =
    selectedInfluencers.length > 0 ? selectedInfluencers : best ? [best] : [];

  if (!best) return null;

  const score = best.matchScore.score;
  const scoreColor =
    score >= 80 ? "text-emerald-600" : score >= 60 ? "text-[var(--brand)]" : "text-foreground";

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <DemoDataBadge isMock={isMock} />
          <h1 className="mt-4 text-3xl font-bold">Match Sonucu</h1>
          <p className="mt-1.5 text-muted-foreground">
            {campaign.businessName} için seçilen adaylar.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onBackToCards}>
            <ChevronLeft className="w-4 h-4 mr-1" /> Kartlara dön
          </Button>
          <Button className="bg-gradient-brand text-primary-foreground hover:opacity-90" onClick={onRestart}>
            <RotateCcw className="w-4 h-4 mr-1.5" /> Yeni demo
          </Button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <StatBox label="Seçilen" value={selectedInfluencers.length} />
        <StatBox label="Pas geçilen" value={rejectedInfluencers.length} />
        <StatBox label="Analiz edilen" value={rankedInfluencers.length} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_1.1fr]">
        {/* Best match */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
            En iyi aday
          </p>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">{best.name}</h2>
              <p className="text-sm text-muted-foreground mt-0.5">{best.location}</p>
              <p className="text-xs text-muted-foreground/60">{best.handle}</p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-brand text-white font-bold text-lg shadow-sm shrink-0">
              {best.name.split(" ").map((p) => p[0]).join("").slice(0, 2)}
            </div>
          </div>

          <div className="mt-5 rounded-xl bg-muted p-4">
            <div className="flex items-end justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Match Score</span>
              <span className={`text-5xl font-bold ${scoreColor}`}>{score}</span>
            </div>
            <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-border">
              <div
                className="h-full rounded-full bg-gradient-brand"
                style={{ width: `${score}%` }}
              />
            </div>
          </div>

          <div className="mt-5">
            <ScoreBreakdown breakdown={best.matchScore.breakdown} />
          </div>
        </div>

        {/* Right side */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h3 className="font-semibold mb-4">Seçilen adaylar</h3>
            <div className="space-y-3">
              {visibleSelected.map((inf) => (
                <ResultRow key={inf.id} influencer={inf} />
              ))}
            </div>
          </div>

          <details className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <summary className="cursor-pointer text-sm font-semibold text-foreground select-none">
              Demo hakkında
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Matchfluence AI, takipçi sayısını tek başına yeterli görmez. Niche, lokasyon,
              etkileşim, hedef kitle ve bütçe uyumunu birlikte hesaplayarak daha uygun
              mikro-influencer önerileri sunar.
            </p>
          </details>
        </div>
      </div>
    </section>
  );
}

function ResultRow({ influencer }: { influencer: RankedInfluencer }) {
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="font-semibold text-foreground">{influencer.name}</h4>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {influencer.niches.join(" · ")}
          </p>
        </div>
        <div className="rounded-lg bg-gradient-brand px-2.5 py-1.5 text-sm font-bold text-white shadow-sm">
          {influencer.matchScore.score}
        </div>
      </div>
      <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground line-clamp-2">
        {influencer.matchScore.reasons.slice(0, 2).join(" ")}
      </p>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 text-center shadow-sm">
      <div className="text-3xl font-bold text-foreground">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
