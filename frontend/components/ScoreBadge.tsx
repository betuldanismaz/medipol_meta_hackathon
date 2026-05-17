type Props = {
  score: number;
  reasons: string[];
};

export default function ScoreBadge({ score, reasons }: Props) {
  const color =
    score >= 80
      ? "text-green-600 bg-green-50 dark:bg-green-950 dark:text-green-400"
      : score >= 60
        ? "text-yellow-600 bg-yellow-50 dark:bg-yellow-950 dark:text-yellow-400"
        : "text-red-600 bg-red-50 dark:bg-red-950 dark:text-red-400";

  return (
    <div className="w-80 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-900 p-4 space-y-3">
      <div className="flex items-center gap-3">
        <span className={`text-2xl font-bold px-3 py-1 rounded-lg ${color}`}>{score}/100</span>
        <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300">Uyum Skoru</span>
      </div>
      <ul className="space-y-1">
        {reasons.map((r, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-zinc-500 dark:text-zinc-400">
            <span className="text-violet-500 mt-0.5">✦</span>
            <span>{r}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
