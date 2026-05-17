import DemoDataBadge from "@/components/matchfluence/DemoDataBadge";

type LandingPageProps = {
  isMock: boolean;
  onStart: () => void;
};

const infoCards = [
  ["1", "Kampanya", "Isletme, hedef kitle ve butce girilir."],
  ["2", "AI skor", "Niche, lokasyon ve etkileşim birlikte puanlanır."],
  ["3", "Swipe", "En uygun adaylar kartlarla incelenir."],
] as const;

export default function LandingPage({ isMock, onStart }: LandingPageProps) {
  return (
    <section className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl flex-col justify-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <DemoDataBadge isMock={isMock} />
          <h1 className="mt-5 max-w-3xl text-4xl font-black tracking-tight text-slate-950 sm:text-6xl">
            Kampanyan icin dogru mikro-influencer'i bul.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            Kampanya bilgilerini gir, adaylari AI skoruyla sirala ve Tinder benzeri kartlarla
            en uygun influencerlari sec.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={onStart}
              className="rounded-2xl bg-slate-950 px-6 py-4 text-base font-bold text-white shadow-xl shadow-slate-950/15 transition hover:-translate-y-0.5 hover:bg-slate-800"
            >
              Kampanya olustur
            </button>
            <a
              href="#how-it-works"
              className="rounded-2xl border border-slate-200 bg-white/80 px-6 py-4 text-center text-base font-semibold text-slate-700 transition hover:bg-white"
            >
              Skor mantigini gor
            </a>
          </div>

          <div id="how-it-works" className="mt-8 grid gap-3 sm:grid-cols-3">
            {infoCards.map(([step, title, text]) => (
              <div key={step} className="matchfluence-soft-panel rounded-2xl p-4">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-sm font-black text-white">
                  {step}
                </div>
                <h3 className="font-bold text-slate-950">{title}</h3>
                <p className="mt-2 text-sm leading-5 text-slate-500">{text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="matchfluence-panel overflow-hidden rounded-3xl p-5">
          <div className="rounded-2xl border border-slate-100 bg-white p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500">Top match</p>
                <h2 className="mt-1 text-2xl font-black text-slate-950">Derya Koc</h2>
                <p className="mt-1 text-sm text-slate-500">Kadikoy, Istanbul</p>
              </div>
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-3xl">
                DK
              </div>
            </div>

            <div className="mt-5 rounded-2xl bg-slate-50 p-4">
              <div className="flex items-end justify-between">
                <span className="text-sm font-semibold text-slate-600">Match Score</span>
                <span className="text-5xl font-black text-emerald-600">86</span>
              </div>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200">
                <div className="h-full w-[86%] rounded-full bg-emerald-400" />
              </div>
            </div>

            <div className="mt-5 space-y-2">
              {["Niche uyumu yuksek", "Lokasyon avantaji", "Butceye uygun"].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3 text-sm text-slate-700"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                    OK
                  </span>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
