"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getProfiles, postSwipe, getMatchScore } from "@/lib/api";
import type { Profile, MatchScore } from "@/types";
import ProfileCard from "@/components/ProfileCard";
import SwipeButtons from "@/components/SwipeButtons";
import MatchBanner from "@/components/MatchBanner";
import ScoreBadge from "@/components/ScoreBadge";

// Demo: sabit bir işletme olarak hareket ediyoruz
const CURRENT_USER_ID = "biz_1";

export default function SwipePage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [swiping, setSwiping] = useState(false);
  const [matchId, setMatchId] = useState<string | null>(null);
  const [score, setScore] = useState<MatchScore | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getProfiles()
      .then((data) => {
        // Kendi profilimizi listeden çıkar
        setProfiles(data.filter((p) => p.id !== CURRENT_USER_ID));
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const current = profiles[index] ?? null;

  async function handleSwipe(direction: "left" | "right") {
    if (!current || swiping) return;
    setSwiping(true);
    setScore(null);

    try {
      const result = await postSwipe({
        user_id: CURRENT_USER_ID,
        target_id: current.id,
        direction,
      });

      if (direction === "right") {
        // Skoru al
        const scoreData = await getMatchScore(current.id, CURRENT_USER_ID).catch(() => null);
        setScore(scoreData);

        if (result.match && result.match_id) {
          setMatchId(result.match_id);
        }
      }
    } catch (e) {
      console.error("Swipe hatası:", e);
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
      {/* Başlık */}
      <div className="flex items-center justify-between w-80">
        <h1 className="text-2xl font-bold">InfluMatch</h1>
        <Link
          href="/matches"
          className="text-sm text-violet-600 dark:text-violet-400 hover:underline"
        >
          Eşleşmelerim →
        </Link>
      </div>

      {/* Kart veya bitiş ekranı */}
      {current ? (
        <>
          <ProfileCard profile={current} />

          {/* Skor (sadece sağa swipe sonrası) */}
          {score && <ScoreBadge score={score.score} reasons={score.reasons} />}

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

      {/* Match popup */}
      {matchId && (
        <MatchBanner matchId={matchId} onClose={() => setMatchId(null)} />
      )}
    </main>
  );
}
