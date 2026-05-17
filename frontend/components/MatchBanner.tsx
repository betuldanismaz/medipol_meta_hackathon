"use client";

import Link from "next/link";

type Props = {
  matchId: string;
  onClose: () => void;
};

export default function MatchBanner({ matchId, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-8 text-center shadow-2xl max-w-sm w-full mx-4 space-y-4">
        <div className="text-6xl">🎉</div>
        <h2 className="text-2xl font-bold text-violet-600 dark:text-violet-400">Eşleşme!</h2>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm">
          Harika bir uyum buldunuz. Şimdi eşleşmelerinizi inceleyebilirsiniz.
        </p>
        <p className="text-xs text-zinc-400 font-mono">#{matchId}</p>
        <div className="flex gap-3 justify-center pt-2">
          <Link
            href="/matches"
            className="px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition-colors"
          >
            Eşleşmeleri Gör
          </Link>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            Devam Et
          </button>
        </div>
      </div>
    </div>
  );
}
