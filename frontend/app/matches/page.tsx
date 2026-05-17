import Link from "next/link";
import { getMatches } from "@/lib/api";
import { matchfluenceInfluencers } from "@/data/matchfluenceInfluencers";
import ScoreBadge from "@/components/ScoreBadge";

export default async function MatchesPage() {
  let matches;
  try {
    matches = await getMatches();
  } catch {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-red-500 text-sm font-mono">Eşleşmeler yüklenemedi.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center gap-6 p-8">
      <div className="flex items-center justify-between w-full max-w-lg">
        <h1 className="text-2xl font-bold">Eşleşmelerim</h1>
        <Link href="/" className="text-sm text-violet-600 dark:text-violet-400 hover:underline">
          ← Keşfet
        </Link>
      </div>

      {matches.length === 0 ? (
        <p className="text-zinc-400 mt-12">Henüz eşleşmen yok. Swipe yapmaya devam et!</p>
      ) : (
        <ul className="w-full max-w-lg space-y-6">
          {matches.map((match) => {
            const influencer = matchfluenceInfluencers.find(
              (inf) => inf.id === match.influencerId,
            );
            return (
              <li
                key={`${match.influencerId}-${match.businessId}`}
                className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-900 p-5 space-y-4 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{influencer?.avatar ?? "👤"}</span>
                  <div>
                    <p className="font-semibold">{influencer?.name ?? match.influencerId}</p>
                    <p className="text-sm text-zinc-400">
                      {influencer?.handle} · {influencer?.location}
                    </p>
                  </div>
                </div>

                <ScoreBadge
                  score={match.matchScore.score}
                  reasons={match.matchScore.reasons}
                />
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
