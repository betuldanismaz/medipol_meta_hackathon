"use client";

import type { TouchEvent } from "react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, X, RotateCcw, Check } from "lucide-react";
import DemoDataBadge from "@/components/matchfluence/DemoDataBadge";
import ScoreBreakdown from "@/components/matchfluence/ScoreBreakdown";
import type { CampaignInput, RankedInfluencer } from "@/types";

type InfluencerSwipeCardsProps = {
  rankedInfluencers: RankedInfluencer[];
  campaign: CampaignInput;
  isMock: boolean;
  onAccept: (influencer: RankedInfluencer) => void;
  onReject: (influencer: RankedInfluencer) => void;
  onRestart: () => void;
};

export default function InfluencerSwipeCards({
  rankedInfluencers,
  campaign,
  isMock,
  onAccept,
  onReject,
  onRestart,
}: InfluencerSwipeCardsProps) {
  const [index, setIndex] = useState(0);
  const [dragStart, setDragStart] = useState<number | null>(null);
  const [swipeHint, setSwipeHint] = useState<"accept" | "reject" | null>(null);

  const current = rankedInfluencers[index];
  const next = rankedInfluencers[index + 1];
  const shortReasons = useMemo(
    () => current?.matchScore.reasons.slice(0, 3) ?? [],
    [current?.matchScore.reasons],
  );

  const moveNext = (direction: "accept" | "reject") => {
    if (!current) return;
    if (direction === "accept") onAccept(current);
    else onReject(current);
    setSwipeHint(direction);
    window.setTimeout(() => {
      setSwipeHint(null);
      setIndex((prev) => prev + 1);
    }, 350);
  };

  const handleTouchStart = (event: TouchEvent<HTMLElement>) => {
    setDragStart(event.touches[0]?.clientX ?? null);
  };

  const handleTouchEnd = (event: TouchEvent<HTMLElement>) => {
    if (dragStart == null) return;
    const end = event.changedTouches[0]?.clientX ?? dragStart;
    const delta = end - dragStart;
    if (Math.abs(delta) > 70) moveNext(delta > 0 ? "accept" : "reject");
    setDragStart(null);
  };

  if (!current) {
    return (
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-lg items-center px-4 py-10">
        <div className="w-full rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-brand text-white shadow-sm">
            <Check className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold">Tüm kartlar incelendi</h1>
          <p className="mt-2 text-muted-foreground text-sm">
            Seçtiğin adaylar sonuç ekranında listelendi.
          </p>
          <Button onClick={onRestart} className="mt-6" variant="outline">
            <RotateCcw className="w-4 h-4 mr-2" /> Yeni kampanya başlat
          </Button>
        </div>
      </section>
    );
  }

  const score = current.matchScore.score;
  const scoreColor =
    score >= 80 ? "text-emerald-600" : score >= 60 ? "text-[var(--brand)]" : "text-muted-foreground";

  return (
    <section className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl flex-col px-4 py-8 sm:px-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <DemoDataBadge isMock={isMock} />
          <h1 className="mt-3 text-2xl font-bold">Swipe Eşleştirme</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {campaign.businessName} için adayları incele.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card px-3.5 py-2 text-sm font-medium text-muted-foreground">
          {index + 1} / {rankedInfluencers.length} aday
        </div>
      </div>

      <div className="grid flex-1 gap-6 lg:grid-cols-[1fr_300px] lg:items-start">
        {/* Card */}
        <div className="relative mx-auto w-full max-w-md select-none">
          {/* Back card */}
          {next && (
            <div className="absolute inset-x-6 top-4 z-0 h-full rounded-2xl border border-border bg-card opacity-50 blur-[1px]" />
          )}

          <article
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className={`relative z-10 overflow-hidden rounded-2xl border bg-card shadow-sm transition-all duration-300 ${
              swipeHint === "accept"
                ? "border-emerald-400 shadow-emerald-100"
                : swipeHint === "reject"
                  ? "border-destructive shadow-red-100"
                  : "border-border"
            }`}
          >
            <div className="p-5">
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">#{index + 1} öneri</p>
                  <h2 className="mt-0.5 text-2xl font-bold">{current.name}</h2>
                  <p className="mt-0.5 text-sm text-muted-foreground">{current.location}</p>
                  <p className="text-xs text-muted-foreground/70">{current.handle}</p>
                </div>
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-brand text-white font-bold text-lg shadow-sm">
                  {current.name.split(" ").map((p) => p[0]).join("").slice(0, 2)}
                </div>
              </div>

              {/* Score */}
              <div className="mt-5 rounded-xl bg-muted p-4">
                <div className="flex items-end justify-between">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Match Score</span>
                  <span className={`text-4xl font-bold ${scoreColor}`}>{score}</span>
                </div>
                <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full rounded-full bg-gradient-brand transition-all duration-700"
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>

              {/* Niches */}
              <div className="mt-4 flex flex-wrap gap-1.5">
                {current.niches.slice(0, 4).map((niche) => (
                  <Badge key={niche} variant="secondary">{niche}</Badge>
                ))}
              </div>

              {/* Metrics */}
              <div className="mt-4 grid grid-cols-3 gap-2">
                <Metric label="Takipçi" value={current.followers.toLocaleString("tr-TR")} />
                <Metric label="Etkileşim" value={`%${current.engagementRate}`} />
                <Metric label="Fiyat" value={`${current.price.toLocaleString("tr-TR")} ₺`} />
              </div>

              {/* Bio */}
              <p className="mt-4 rounded-xl border border-border bg-background p-3.5 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                {current.bio}
              </p>

              {/* Swipe feedback */}
              {swipeHint && (
                <div
                  className={`mt-3 text-center text-sm font-semibold ${
                    swipeHint === "accept" ? "text-emerald-600" : "text-destructive"
                  }`}
                >
                  {swipeHint === "accept" ? "✓ Seçildi" : "✕ Pas geçildi"}
                </div>
              )}

              {/* Buttons */}
              <div className="mt-5 grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => moveNext("reject")}
                  className="border-destructive/30 text-destructive hover:bg-destructive/10 h-11"
                >
                  <X className="w-4 h-4 mr-1.5" /> Pas Geç
                </Button>
                <Button
                  onClick={() => moveNext("accept")}
                  className="bg-gradient-brand text-primary-foreground hover:opacity-90 h-11"
                >
                  <Heart className="w-4 h-4 mr-1.5 fill-current" /> Seç
                </Button>
              </div>
            </div>
          </article>
        </div>

        {/* Score sidebar */}
        <aside className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h3 className="font-semibold text-foreground mb-1">Skor Kırılımı</h3>
          <p className="text-xs text-muted-foreground mb-4">
            Niche, lokasyon, kitle, bütçe ve etkileşim sinyalleri.
          </p>
          <ScoreBreakdown breakdown={current.matchScore.breakdown} />

          {shortReasons.length > 0 && (
            <div className="mt-5 rounded-xl bg-muted p-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2.5">
                Neden önerildi?
              </p>
              <ul className="space-y-2">
                {shortReasons.map((reason) => (
                  <li key={reason} className="flex gap-2 text-sm text-foreground">
                    <span className="text-emerald-500 shrink-0">✓</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted p-3 text-center">
      <div className="text-sm font-semibold text-foreground">{value}</div>
      <div className="mt-0.5 text-[11px] text-muted-foreground">{label}</div>
    </div>
  );
}
