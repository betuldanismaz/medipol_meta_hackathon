import Link from "next/link";
import { getMatches } from "@/lib/api";
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
          {matches.map((match) => (
            <li
              key={match.match_id}
              className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-900 p-5 space-y-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{match.influencer.name}</p>
                  <p className="text-sm text-zinc-400">
                    {match.influencer.niche} · {match.influencer.followers.toLocaleString("tr-TR")}{" "}
                    takipçi · {match.influencer.city}
                  </p>
                </div>
                <span className="text-zinc-300 dark:text-zinc-600 text-2xl">×</span>
                <div className="text-right">
                  <p className="font-semibold">{match.business.name}</p>
                  <p className="text-sm text-zinc-400">{match.business.city}</p>
                </div>
              </div>

              <ScoreBadge score={match.score} reasons={match.reasons} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
