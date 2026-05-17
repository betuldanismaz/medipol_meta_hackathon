import { scoreLabels } from "@/lib/matchfluenceScoring";
import type { MatchBreakdown } from "@/types";

type ScoreBreakdownProps = {
  breakdown: MatchBreakdown;
};

export default function ScoreBreakdown({ breakdown }: ScoreBreakdownProps) {
  return (
    <div className="space-y-3">
      {Object.entries(breakdown).map(([key, value]) => (
        <div key={key}>
          <div className="mb-1 flex items-center justify-between gap-3 text-xs">
            <span className="font-semibold text-slate-700">
              {scoreLabels[key as keyof MatchBreakdown] ?? key}
            </span>
            <span className="text-slate-500">{value}/100</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-cyan-400"
              style={{ width: `${value}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
