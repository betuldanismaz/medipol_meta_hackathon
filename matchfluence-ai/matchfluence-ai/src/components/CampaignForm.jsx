import { sampleCampaign } from '../data/influencers.js'
import DemoDataBadge from './DemoDataBadge.jsx'

const nicheOptions = ['kahve', 'lokal mekan', 'lifestyle', 'yemek', 'moda', 'beauty', 'fitness', 'teknoloji', 'vegan', 'anne-çocuk']

export default function CampaignForm({ campaign, setCampaign, onAnalyze }) {
  const updateField = (field, value) => setCampaign((prev) => ({ ...prev, [field]: value }))

  const toggleNiche = (niche) => {
    setCampaign((prev) => {
      const exists = prev.preferredNiches.includes(niche)
      return {
        ...prev,
        preferredNiches: exists
          ? prev.preferredNiches.filter((item) => item !== niche)
          : [...prev.preferredNiches, niche],
      }
    })
  }

  return (
    <section className="mx-auto flex min-h-screen w-full max-w-5xl items-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <DemoDataBadge />
            <h1 className="mt-4 text-3xl font-black text-white sm:text-5xl">Kampanya oluştur</h1>
            <p className="mt-3 max-w-2xl text-slate-300">
              Demo için hazır kampanya bilgileri dolu geliyor. İsterseniz değiştirip skorları canlı yeniden hesaplayabilirsiniz.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setCampaign(sampleCampaign)}
            className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-white hover:bg-white/10"
          >
            Örnek kampanyayı yükle
          </button>
        </div>

        <div className="card-gradient rounded-[2rem] p-4 sm:p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="İşletme adı">
              <input value={campaign.businessName} onChange={(e) => updateField('businessName', e.target.value)} className="input" />
            </Field>
            <Field label="Sektör">
              <input value={campaign.sector} onChange={(e) => updateField('sector', e.target.value)} className="input" />
            </Field>
            <Field label="Lokasyon">
              <input value={campaign.location} onChange={(e) => updateField('location', e.target.value)} className="input" />
            </Field>
            <Field label="Bütçe / TL">
              <input type="number" min="0" value={campaign.budget} onChange={(e) => updateField('budget', e.target.value)} className="input" />
            </Field>
            <Field label="Hedef kitle" wide>
              <textarea value={campaign.targetAudience} onChange={(e) => updateField('targetAudience', e.target.value)} className="input min-h-24 resize-none" />
            </Field>
            <Field label="Kampanya hedefi" wide>
              <textarea value={campaign.campaignGoal} onChange={(e) => updateField('campaignGoal', e.target.value)} className="input min-h-24 resize-none" />
            </Field>
          </div>

          <div className="mt-5">
            <label className="text-sm font-semibold text-slate-200">Tercih edilen nişler</label>
            <div className="mt-3 flex flex-wrap gap-2">
              {nicheOptions.map((niche) => {
                const active = campaign.preferredNiches.includes(niche)
                return (
                  <button
                    key={niche}
                    type="button"
                    onClick={() => toggleNiche(niche)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      active ? 'bg-white text-slate-950' : 'border border-white/15 bg-white/5 text-slate-200 hover:bg-white/10'
                    }`}
                  >
                    {niche}
                  </button>
                )
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={onAnalyze}
            className="mt-7 w-full rounded-2xl bg-gradient-to-r from-indigo-300 via-fuchsia-300 to-cyan-200 px-6 py-4 text-base font-black text-slate-950 shadow-glow transition hover:-translate-y-0.5"
          >
            Influencer'ları analiz et
          </button>
        </div>
      </div>
      <style>{`
        .input {
          width: 100%;
          border-radius: 1rem;
          border: 1px solid rgba(255,255,255,.12);
          background: rgba(15,23,42,.75);
          color: white;
          padding: .9rem 1rem;
          outline: none;
        }
        .input:focus {
          border-color: rgba(165,180,252,.75);
          box-shadow: 0 0 0 4px rgba(99,102,241,.18);
        }
      `}</style>
    </section>
  )
}

function Field({ label, children, wide }) {
  return (
    <label className={`block ${wide ? 'md:col-span-2' : ''}`}>
      <span className="mb-2 block text-sm font-semibold text-slate-200">{label}</span>
      {children}
    </label>
  )
}
