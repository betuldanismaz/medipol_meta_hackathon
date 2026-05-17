import ScoreBreakdown from './ScoreBreakdown.jsx'
import DemoDataBadge from './DemoDataBadge.jsx'

export default function MatchResult({ selectedInfluencers, rejectedInfluencers, rankedInfluencers, campaign, onRestart, onBackToCards }) {
  const best = selectedInfluencers[0] || rankedInfluencers[0]

  return (
    <section className="mx-auto min-h-screen w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <DemoDataBadge />
          <h1 className="mt-4 text-3xl font-black text-white sm:text-5xl">Match sonucu</h1>
          <p className="mt-3 max-w-2xl text-slate-300">
            {campaign.businessName} kampanyası için seçilen adaylar ve açıklanabilir skor kırılımı.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={onBackToCards} className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-white hover:bg-white/10">Kartlara dön</button>
          <button onClick={onRestart} className="rounded-2xl bg-white px-4 py-3 text-sm font-black text-slate-950">Yeni demo</button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[.95fr_1.05fr]">
        <div className="card-gradient rounded-[2rem] p-5">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-200">En iyi aday</p>
          <div className="mt-4 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black text-white">{best.name}</h2>
              <p className="mt-1 text-sm text-slate-300">{best.location}</p>
            </div>
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white/10 text-4xl">{best.avatar}</div>
          </div>
          <div className="mt-5 rounded-3xl bg-emerald-300/10 p-5">
            <div className="flex items-end justify-between">
              <span className="text-sm font-bold text-emerald-100">Match Score</span>
              <span className="text-6xl font-black text-emerald-100">{best.totalScore}</span>
            </div>
            <div className="mt-3 h-4 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-emerald-300" style={{ width: `${best.totalScore}%` }} />
            </div>
          </div>
          <div className="mt-5">
            <ScoreBreakdown breakdown={best.scoreBreakdown} />
          </div>
          <div className="mt-5 rounded-3xl border border-white/10 bg-white/[0.05] p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">AI açıklaması</p>
            <p className="mt-2 text-sm leading-6 text-slate-200">{best.explanation}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <Stat label="Seçilen" value={selectedInfluencers.length} />
            <Stat label="Pas geçilen" value={rejectedInfluencers.length} />
            <Stat label="Analiz edilen" value={rankedInfluencers.length} />
          </div>

          <div className="card-gradient rounded-[2rem] p-5">
            <h3 className="text-xl font-black text-white">Seçilen adaylar</h3>
            <div className="mt-4 space-y-3">
              {(selectedInfluencers.length ? selectedInfluencers : [best]).map((influencer) => (
                <ResultRow key={influencer.id} influencer={influencer} />
              ))}
            </div>
          </div>

          <div className="card-gradient rounded-[2rem] p-5">
            <h3 className="text-xl font-black text-white">Jüriye söylenecek teknik cümle</h3>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Matchfluence AI, takipçi sayısını tek başına başarı göstergesi kabul etmez. Skor motoru; niş uyumu, lokasyon yakınlığı, etkileşim sağlığı, hedef kitle örtüşmesi, bütçe uygunluğu ve geçmiş kampanya deneyimini ağırlıklı olarak hesaplar. Bu sayede küçük işletmeler için daha uygun maliyetli ve daha yüksek etkileşimli mikro-influencer eşleşmeleri öne çıkarılır.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

function ResultRow({ influencer }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-2xl">{influencer.avatar}</div>
          <div>
            <h4 className="font-black text-white">{influencer.name}</h4>
            <p className="mt-1 text-xs text-slate-400">{influencer.niches.join(' · ')}</p>
          </div>
        </div>
        <div className="rounded-2xl bg-white px-3 py-2 text-sm font-black text-slate-950">{influencer.totalScore}</div>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-300">{influencer.explanation}</p>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 text-center">
      <div className="text-3xl font-black text-white">{value}</div>
      <div className="mt-1 text-xs text-slate-400">{label}</div>
    </div>
  )
}
