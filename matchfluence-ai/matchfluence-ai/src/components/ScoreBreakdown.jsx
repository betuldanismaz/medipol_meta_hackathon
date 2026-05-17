import { scoreLabels } from '../lib/scoring.js'

export default function ScoreBreakdown({ breakdown }) {
  if (!breakdown) return null

  return (
    <div className="space-y-3">
      {Object.entries(breakdown).map(([key, value]) => (
        <div key={key}>
          <div className="mb-1 flex items-center justify-between gap-3 text-xs">
            <span className="font-semibold text-slate-200">{scoreLabels[key] || key}</span>
            <span className="text-slate-400">
              {value.weighted}/{value.weight} puan · raw {value.raw}/100
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-gradient-to-r from-indigo-300 to-cyan-200" style={{ width: `${value.raw}%` }} />
          </div>
        </div>
      ))}
    </div>
  )
}
