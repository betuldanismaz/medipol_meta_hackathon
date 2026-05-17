import { useMemo, useState } from 'react'
import ScoreBreakdown from './ScoreBreakdown.jsx'
import DemoDataBadge from './DemoDataBadge.jsx'

export default function InfluencerSwipeCards({ rankedInfluencers, campaign, onAccept, onReject, onRestart }) {
  const [index, setIndex] = useState(0)
  const [dragStart, setDragStart] = useState(null)
  const [swipeHint, setSwipeHint] = useState('')

  const current = rankedInfluencers[index]
  const next = rankedInfluencers[index + 1]
  const progress = useMemo(() => Math.round((index / rankedInfluencers.length) * 100), [index, rankedInfluencers.length])

  const moveNext = (direction) => {
    if (!current) return
    if (direction === 'accept') onAccept(current)
    if (direction === 'reject') onReject(current)
    setSwipeHint(direction === 'accept' ? 'Sağa kaydırıldı' : 'Sola kaydırıldı')
    window.setTimeout(() => setSwipeHint(''), 550)
    setIndex((prev) => prev + 1)
  }

  const handleTouchStart = (event) => {
    setDragStart(event.touches[0].clientX)
  }

  const handleTouchEnd = (event) => {
    if (dragStart == null) return
    const end = event.changedTouches[0].clientX
    const delta = end - dragStart
    if (Math.abs(delta) > 70) {
      moveNext(delta > 0 ? 'accept' : 'reject')
    }
    setDragStart(null)
  }

  if (!current) {
    return (
      <section className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-4 py-8">
        <div className="card-gradient w-full rounded-[2rem] p-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-white/10 text-3xl">✅</div>
          <h1 className="mt-5 text-3xl font-black text-white">Tüm kartlar incelendi</h1>
          <p className="mt-3 text-slate-300">Seçtiğiniz influencer'lar match ekranında listelendi. Yeni demo için başa dönebilirsiniz.</p>
          <button onClick={onRestart} className="mt-6 rounded-2xl bg-white px-6 py-3 font-bold text-slate-950">Yeni kampanya başlat</button>
        </div>
      </section>
    )
  }

  return (
    <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <DemoDataBadge />
          <h1 className="mt-3 text-3xl font-black text-white">Swipe eşleştirme</h1>
          <p className="mt-2 text-sm text-slate-400">
            {campaign.businessName} için skorlanmış influencer kartları. Mobilde sağa/sola kaydırabilirsiniz.
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
          {index + 1}/{rankedInfluencers.length} kart · %{progress} tamamlandı
        </div>
      </div>

      <div className="grid flex-1 gap-6 lg:grid-cols-[minmax(0,1fr)_330px] lg:items-center">
        <div className="relative mx-auto w-full max-w-md select-none">
          {next && <MiniBackCard influencer={next} />}
          <article
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="card-gradient relative z-10 overflow-hidden rounded-[2rem] p-5 transition active:scale-[.99]"
          >
            <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-indigo-400/20 blur-3xl" />
            <div className="absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-fuchsia-400/20 blur-3xl" />

            <div className="relative">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-400">#{index + 1} öneri</p>
                  <h2 className="mt-1 text-3xl font-black text-white">{current.name}</h2>
                  <p className="mt-1 text-sm text-slate-300">{current.location}</p>
                </div>
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-white/10 text-4xl">
                  {current.avatar}
                </div>
              </div>

              <div className="mt-5 rounded-3xl bg-white/[0.06] p-4">
                <div className="flex items-end justify-between">
                  <span className="text-sm font-semibold text-slate-300">Match Score</span>
                  <span className="text-5xl font-black text-white">{current.totalScore}</span>
                </div>
                <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-gradient-to-r from-emerald-300 via-cyan-200 to-indigo-300" style={{ width: `${current.totalScore}%` }} />
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {current.niches.map((niche) => (
                  <span key={niche} className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-slate-200">{niche}</span>
                ))}
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                <Metric label="Takipçi" value={current.followers.toLocaleString('tr-TR')} />
                <Metric label="Etkileşim" value={`%${current.engagementRate}`} />
                <Metric label="Fiyat" value={`${current.price.toLocaleString('tr-TR')}₺`} />
              </div>

              <p className="mt-5 rounded-3xl border border-white/10 bg-slate-950/50 p-4 text-sm leading-6 text-slate-300">{current.bio}</p>
              {swipeHint && <p className="mt-3 text-center text-sm font-bold text-emerald-200">{swipeHint}</p>}

              <div className="safe-area mt-6 grid grid-cols-2 gap-3">
                <button onClick={() => moveNext('reject')} className="rounded-2xl border border-rose-300/20 bg-rose-400/10 px-5 py-4 font-black text-rose-100 transition hover:bg-rose-400/20">← Pas geç</button>
                <button onClick={() => moveNext('accept')} className="rounded-2xl border border-emerald-300/20 bg-emerald-300 px-5 py-4 font-black text-emerald-950 transition hover:bg-emerald-200">Seç →</button>
              </div>
            </div>
          </article>
        </div>

        <aside className="card-gradient rounded-[2rem] p-5">
          <h3 className="text-xl font-black text-white">Skor kırılımı</h3>
          <p className="mt-2 text-sm text-slate-400">Sistem mikro-influencer kalitesini takipçi sayısından bağımsız, açıklanabilir bileşenlerle ölçer.</p>
          <div className="mt-5">
            <ScoreBreakdown breakdown={current.scoreBreakdown} />
          </div>
          <div className="mt-5 rounded-3xl bg-white/[0.06] p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Neden önerildi?</p>
            <p className="mt-2 text-sm leading-6 text-slate-200">{current.explanation}</p>
          </div>
        </aside>
      </div>
    </section>
  )
}

function MiniBackCard({ influencer }) {
  return (
    <div className="absolute inset-x-7 top-5 z-0 h-full rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 opacity-60 blur-[.2px]">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-4 w-24 rounded-full bg-white/10" />
          <div className="mt-3 h-7 w-40 rounded-full bg-white/10" />
        </div>
        <div className="text-3xl">{influencer.avatar}</div>
      </div>
    </div>
  )
}

function Metric({ label, value }) {
  return (
    <div className="rounded-2xl bg-white/[0.06] p-3">
      <div className="text-sm font-black text-white">{value}</div>
      <div className="mt-1 text-[11px] text-slate-400">{label}</div>
    </div>
  )
}
