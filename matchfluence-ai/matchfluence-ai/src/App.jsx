import { useMemo, useState } from 'react'
import LandingPage from './components/LandingPage.jsx'
import CampaignForm from './components/CampaignForm.jsx'
import InfluencerSwipeCards from './components/InfluencerSwipeCards.jsx'
import MatchResult from './components/MatchResult.jsx'
import { influencers, sampleCampaign } from './data/influencers.js'
import { rankInfluencers } from './lib/scoring.js'

const STEPS = {
  landing: 'landing',
  form: 'form',
  swipe: 'swipe',
  result: 'result',
}

export default function App() {
  const [step, setStep] = useState(STEPS.landing)
  const [campaign, setCampaign] = useState(sampleCampaign)
  const [selectedInfluencers, setSelectedInfluencers] = useState([])
  const [rejectedInfluencers, setRejectedInfluencers] = useState([])

  const rankedInfluencers = useMemo(() => rankInfluencers(influencers, campaign), [campaign])

  const restart = () => {
    setCampaign(sampleCampaign)
    setSelectedInfluencers([])
    setRejectedInfluencers([])
    setStep(STEPS.landing)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const startAnalysis = () => {
    setSelectedInfluencers([])
    setRejectedInfluencers([])
    setStep(STEPS.swipe)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const acceptInfluencer = (influencer) => {
    setSelectedInfluencers((prev) => {
      const next = prev.some((item) => item.id === influencer.id) ? prev : [...prev, influencer]
      if (next.length >= 3) {
        window.setTimeout(() => setStep(STEPS.result), 300)
      }
      return next
    })
  }

  const rejectInfluencer = (influencer) => {
    setRejectedInfluencers((prev) => (prev.some((item) => item.id === influencer.id) ? prev : [...prev, influencer]))
  }

  return (
    <main className="min-h-screen bg-mesh text-white">
      <div className="fixed inset-0 -z-10 bg-[#070a13]" />
      <Header currentStep={step} onRestart={restart} />
      {step === STEPS.landing && <LandingPage onStart={() => setStep(STEPS.form)} />}
      {step === STEPS.form && (
        <CampaignForm campaign={campaign} setCampaign={setCampaign} onAnalyze={startAnalysis} />
      )}
      {step === STEPS.swipe && (
        <InfluencerSwipeCards
          rankedInfluencers={rankedInfluencers}
          campaign={campaign}
          onAccept={acceptInfluencer}
          onReject={rejectInfluencer}
          onRestart={restart}
        />
      )}
      {step === STEPS.result && (
        <MatchResult
          selectedInfluencers={selectedInfluencers}
          rejectedInfluencers={rejectedInfluencers}
          rankedInfluencers={rankedInfluencers}
          campaign={campaign}
          onRestart={restart}
          onBackToCards={() => setStep(STEPS.swipe)}
        />
      )}

      {step === STEPS.swipe && selectedInfluencers.length > 0 && (
        <button
          onClick={() => setStep(STEPS.result)}
          className="fixed bottom-4 left-1/2 z-40 -translate-x-1/2 rounded-full bg-white px-5 py-3 text-sm font-black text-slate-950 shadow-glow"
        >
          {selectedInfluencers.length} seçimi görüntüle
        </button>
      )}
    </main>
  )
}

function Header({ currentStep, onRestart }) {
  const stepLabel = {
    landing: 'Tanıtım',
    form: 'Kampanya',
    swipe: 'Swipe',
    result: 'Sonuç',
  }[currentStep]

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <button onClick={onRestart} className="flex items-center gap-2 text-left">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-300 to-cyan-200 text-lg font-black text-slate-950">M</span>
          <span>
            <span className="block text-sm font-black text-white">Matchfluence AI</span>
            <span className="block text-xs text-slate-400">Hackathon MVP</span>
          </span>
        </button>
        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300">{stepLabel}</div>
      </div>
    </header>
  )
}
