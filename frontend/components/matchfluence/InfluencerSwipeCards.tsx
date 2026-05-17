"use client";

import type { TouchEvent } from "react";
import { useMemo, useState } from "react";
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
  const [swipeHint, setSwipeHint] = useState("");

  const current = rankedInfluencers[index];
  const next = rankedInfluencers[index + 1];
  const shortReasons = useMemo(
    () => current?.matchScore.reasons.slice(0, 3) ?? [],
    [current?.matchScore.reasons],
  );

  const moveNext = (direction: "accept" | "reject") => {
    if (!current) return;

    if (direction === "accept") onAccept(current);
    if (direction === "reject") onReject(current);

    setSwipeHint(direction === "accept" ? "Secildi" : "Pas gecildi");
    window.setTimeout(() => setSwipeHint(""), 550);
    setIndex((prev) => prev + 1);
  };

  const handleTouchStart = (event: TouchEvent<HTMLElement>) => {
    setDragStart(event.touches[0]?.clientX ?? null);
  };

  const handleTouchEnd = (event: TouchEvent<HTMLElement>) => {
    if (dragStart == null) return;

    const end = event.changedTouches[0]?.clientX ?? dragStart;
    const delta = end - dragStart;

    if (Math.abs(delta) > 70) {
      moveNext(delta > 0 ? "accept" : "reject");
    }

    setDragStart(null);
  };

  if (!current) {
    return (
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-3xl items-center px-4 py-8">
        <div className="matchfluence-panel w-full rounded-3xl p-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-sm font-black text-emerald-700">
            OK
          </div>
          <h1 className="mt-5 text-3xl font-black text-slate-950">Tum kartlar incelendi</h1>
          <p className="mt-3 text-slate-500">
            Sectigin adaylar sonuc ekraninda listelendi. Yeni kampanya icin basa donebilirsin.
          </p>
          <button
            onClick={onRestart}
            className="mt-6 rounded-2xl bg-slate-950 px-6 py-3 font-bold text-white"
          >
            Yeni kampanya baslat
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl flex-col px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <DemoDataBadge isMock={isMock} />
          <h1 className="mt-3 text-3xl font-black text-slate-950">Swipe eslestirme</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            {campaign.businessName} icin en uygun adaylari incele. Mobilde saga veya sola
            kaydirabilirsin.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 shadow-sm">
          {index + 1} / {rankedInfluencers.length} aday
        </div>
      </div>

      <div className="grid flex-1 gap-6 lg:grid-cols-[minmax(0,1fr)_330px] lg:items-center">
        <div className="relative mx-auto w-full max-w-md select-none">
          {next ? <MiniBackCard influencer={next} /> : null}
          <article
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="matchfluence-panel relative z-10 overflow-hidden rounded-3xl p-5 transition active:scale-[.99]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-500">#{index + 1} oneri</p>
                <h2 className="mt-1 text-3xl font-black text-slate-950">{current.name}</h2>
                <p className="mt-1 text-sm text-slate-500">{current.location}</p>
                <p className="mt-1 text-xs text-slate-400">{current.handle}</p>
              </div>
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-lg font-black text-slate-700">
                {current.name
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)}
              </div>
            </div>

            <div className="mt-5 rounded-2xl bg-slate-50 p-4">
              <div className="flex items-end justify-between">
                <span className="text-sm font-semibold text-slate-600">Match Score</span>
                <span className="text-5xl font-black text-slate-950">
                  {current.matchScore.score}
                </span>
              </div>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-indigo-400"
                  style={{ width: `${current.matchScore.score}%` }}
                />
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {current.niches.slice(0, 4).map((niche) => (
                <span
                  key={niche}
                  className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700"
                >
                  {niche}
                </span>
              ))}
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2 text-center">
              <Metric label="Takipci" value={current.followers.toLocaleString("tr-TR")} />
              <Metric label="Etkilesim" value={`%${current.engagementRate}`} />
              <Metric label="Fiyat" value={`${current.price.toLocaleString("tr-TR")} TL`} />
            </div>

            <p className="mt-5 rounded-2xl border border-slate-100 bg-white p-4 text-sm leading-6 text-slate-600">
              {current.bio}
            </p>
            {swipeHint ? (
              <p className="mt-3 text-center text-sm font-bold text-emerald-600">{swipeHint}</p>
            ) : null}

            <div className="safe-area mt-6 grid grid-cols-2 gap-3">
              <button
                onClick={() => moveNext("reject")}
                className="rounded-2xl border border-rose-200 bg-white px-5 py-4 font-black text-rose-600 transition hover:bg-rose-50"
              >
                Pas gec
              </button>
              <button
                onClick={() => moveNext("accept")}
                className="rounded-2xl bg-emerald-500 px-5 py-4 font-black text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-600"
              >
                Sec
              </button>
            </div>
          </article>
        </div>

        <aside className="matchfluence-panel rounded-3xl p-5">
          <h3 className="text-xl font-black text-slate-950">Skor kirilimi</h3>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Skor; niche, lokasyon, kitle, butce ve etkileşim sinyallerinden olusur.
          </p>
          <div className="mt-5">
            <ScoreBreakdown breakdown={current.matchScore.breakdown} />
          </div>
          <div className="mt-5 rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Neden onerildi?
            </p>
            <ul className="mt-2 space-y-2 text-sm leading-6 text-slate-600">
              {shortReasons.map((reason) => (
                <li key={reason} className="flex gap-2">
                  <span className="text-emerald-500">OK</span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </section>
  );
}

function MiniBackCard({ influencer }: { influencer: RankedInfluencer }) {
  return (
    <div className="absolute inset-x-7 top-5 z-0 h-full rounded-3xl border border-slate-200 bg-white/60 p-5 opacity-70 blur-[.2px]">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-4 w-24 rounded-full bg-slate-200" />
          <div className="mt-3 h-7 w-40 rounded-full bg-slate-200" />
        </div>
        <div className="text-sm font-black text-slate-400">{influencer.matchScore.score}</div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3">
      <div className="text-sm font-black text-slate-950">{value}</div>
      <div className="mt-1 text-[11px] text-slate-500">{label}</div>
    </div>
  );
}
