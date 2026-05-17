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
          <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
            <span className="font-medium text-foreground">
              {scoreLabels[key as keyof MatchBreakdown] ?? key}
            </span>
            <span className="text-muted-foreground">{value}/100</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-brand transition-all duration-500"
              style={{ width: `${value}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
