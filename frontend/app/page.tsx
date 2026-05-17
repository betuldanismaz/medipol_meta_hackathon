"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getLegacyMatchScore, getLegacyProfiles, postLegacySwipe } from "@/lib/api";
import type { LegacyMatchScore, LegacyProfile } from "@/types";
import ProfileCard from "@/components/ProfileCard";
import SwipeButtons from "@/components/SwipeButtons";
import MatchBanner from "@/components/MatchBanner";
import ScoreBadge from "@/components/ScoreBadge";

const CURRENT_USER_ID = "biz_1";

export default function SwipePage() {
  const [profiles, setProfiles] = useState<LegacyProfile[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [swiping, setSwiping] = useState(false);
  const [matchId, setMatchId] = useState<string | null>(null);
  const [score, setScore] = useState<LegacyMatchScore | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getLegacyProfiles()
      .then((data) => {
        setProfiles(data.filter((profile) => profile.id !== CURRENT_USER_ID));
      })
      .catch((cause) => setError(cause instanceof Error ? cause.message : "Profiller yuklenemedi."))
      .finally(() => setLoading(false));
  }, []);

  const current = profiles[index] ?? null;

  async function handleSwipe(direction: "left" | "right") {
    if (!current || swiping) return;
    setSwiping(true);
    setScore(null);

    try {
      const result = await postLegacySwipe({
        user_id: CURRENT_USER_ID,
        target_id: current.id,
        direction,
      });

      if (direction === "right") {
        const scoreData = await getLegacyMatchScore(current.id, CURRENT_USER_ID).catch(() => null);
        setScore(scoreData);

        if (result.match && result.match_id) {
          setMatchId(result.match_id);
        }
      }
    } catch (cause) {
      console.error("Swipe hatasi:", cause);
    } finally {
      setSwiping(false);
      setIndex((value) => value + 1);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-zinc-400 animate-pulse">Profiller yukleniyor...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="space-y-4 text-center">
          <p className="text-sm text-red-500 font-mono">{error}</p>
          <Link
            href="/matchfluence"
            className="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Matchfluence demosuna git
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 p-8">
      <div className="flex w-80 items-center justify-between">
        <h1 className="text-2xl font-bold">InfluMatch</h1>
        <div className="flex items-center gap-3">
          <Link
            href="/matchfluence"
            className="text-sm text-slate-500 hover:underline dark:text-slate-300"
          >
            Matchfluence
          </Link>
          <Link
            href="/matches"
            className="text-sm text-violet-600 hover:underline dark:text-violet-400"
          >
            Eslesmelerim ->
          </Link>
        </div>
      </div>

      {current ? (
        <>
          <ProfileCard profile={current} />
          {score ? <ScoreBadge score={score.score} reasons={score.reasons} /> : null}
          <SwipeButtons
            onLeft={() => handleSwipe("left")}
            onRight={() => handleSwipe("right")}
            disabled={swiping}
          />
          <p className="text-xs text-zinc-400">
            {index + 1} / {profiles.length}
          </p>
        </>
      ) : (
        <div className="space-y-3 text-center">
          <p className="text-4xl">Tamam</p>
          <p className="font-semibold">Tum profilleri gordunuz.</p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/matches"
              className="inline-block rounded-lg bg-violet-600 px-4 py-2 text-sm text-white transition-colors hover:bg-violet-700"
            >
              Eslesmelerimi Gor
            </Link>
            <Link
              href="/matchfluence"
              className="inline-block rounded-lg border border-black/10 px-4 py-2 text-sm transition-colors hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5"
            >
              Matchfluence demo
            </Link>
          </div>
        </div>
      )}

      {matchId ? <MatchBanner matchId={matchId} onClose={() => setMatchId(null)} /> : null}
    </main>
  );
}
