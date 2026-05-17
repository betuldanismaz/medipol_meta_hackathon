"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getProfiles, postSwipe } from "@/lib/api";
import { sampleCampaign } from "@/data/matchfluenceInfluencers";
import type { RankedInfluencer } from "@/types";
import ProfileCard from "@/components/ProfileCard";
import SwipeButtons from "@/components/SwipeButtons";
import MatchBanner from "@/components/MatchBanner";
import ScoreBadge from "@/components/ScoreBadge";

export default function SwipePage() {
  const [profiles, setProfiles] = useState<RankedInfluencer[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [swiping, setSwiping] = useState(false);
  const [matchShown, setMatchShown] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getProfiles(sampleCampaign)
      .then(setProfiles)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const current = profiles[index] ?? null;

  async function handleSwipe(direction: "accept" | "reject") {
    if (!current || swiping) return;
    setSwiping(true);

    try {
      const result = await postSwipe(
        { inf_id: current.id, biz_id: sampleCampaign.businessId, direction },
        sampleCampaign,
      );
      if (direction === "accept" && result.ok) {
        setMatchShown(true);
      }
    } catch (e) {
      console.error("Swipe hatasi:", e);
    } finally {
      setSwiping(false);
      setIndex((i) => i + 1);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-zinc-400 animate-pulse">Profiller yükleniyor…</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-red-500 text-sm font-mono">{error}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 p-8">
      <div className="flex items-center justify-between w-80">
        <h1 className="text-2xl font-bold">InfluMatch</h1>
        <Link
          href="/matches"
          className="text-sm text-violet-600 dark:text-violet-400 hover:underline"
        >
          Eşleşmelerim →
        </Link>
      </div>

      {current ? (
        <>
          <ProfileCard profile={current} />
          <ScoreBadge score={current.matchScore.score} reasons={current.matchScore.reasons} />
          <SwipeButtons
            onLeft={() => handleSwipe("reject")}
            onRight={() => handleSwipe("accept")}
            disabled={swiping}
          />
          <p className="text-xs text-zinc-400">
            {index + 1} / {profiles.length}
          </p>
        </>
      ) : (
        <div className="text-center space-y-3">
          <p className="text-4xl">🎊</p>
          <p className="font-semibold">Tüm profilleri gördünüz!</p>
          <Link
            href="/matches"
            className="inline-block mt-2 px-4 py-2 rounded-lg bg-violet-600 text-white text-sm hover:bg-violet-700 transition-colors"
          >
            Eşleşmelerimi Gör
          </Link>
        </div>
      )}

      {matchShown && (
        <MatchBanner matchId={sampleCampaign.businessId} onClose={() => setMatchShown(false)} />
      )}
    </main>
  );
}
