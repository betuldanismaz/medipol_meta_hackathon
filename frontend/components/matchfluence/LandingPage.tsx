import DemoDataBadge from "@/components/matchfluence/DemoDataBadge";

type LandingPageProps = {
  isMock: boolean;
  onStart: () => void;
};

export default function LandingPage({ isMock, onStart }: LandingPageProps) {
  return (
    <section className="mx-auto flex min-h-[90vh] w-full max-w-6xl flex-col justify-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
        <div>
          <DemoDataBadge isMock={isMock} />
          <div className="mt-6 inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-300">
            Yapay zeka destekli mikro-influencer eslestirme MVP'si
          </div>
          <h1 className="mt-5 text-4xl font-black tracking-tight text-white sm:text-6xl">
            Lokal isletmeler icin dogru influencer'i saniyeler icinde bul.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
            Matchfluence AI, kampanya hedefinizi alir, influencer havuzunu aciklanabilir skor motoruyla analiz eder ve mobil uyumlu kart deneyimiyle en uygun mikro-influencer adaylarini one cikarir.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={onStart}
              className="rounded-2xl bg-white px-6 py-4 text-base font-bold text-slate-950 shadow-glow transition hover:-translate-y-0.5 hover:bg-indigo-50"
            >
              Demo kampanya olustur
            </button>
            <a
              href="#how-it-works"
              className="rounded-2xl border border-white/15 bg-white/5 px-6 py-4 text-center text-base font-semibold text-white transition hover:bg-white/10"
            >
              Skor mantigini gor
            </a>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-3 text-center sm:max-w-xl">
            {[
              ["8+", "Mock influencer"],
              ["6", "Skor bileseni"],
              ["100", "Ust skor limiti"],
            ].map(([value, label]) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-2xl font-black text-white">{value}</div>
                <div className="mt-1 text-xs text-slate-400">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card-gradient relative overflow-hidden rounded-[2rem] p-5">
          <div className="absolute -right-20 -top-20 h-44 w-44 rounded-full bg-fuchsia-500/20 blur-3xl" />
          <div className="absolute -bottom-16 -left-16 h-44 w-44 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="relative rounded-[1.5rem] bg-slate-950/60 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Top match</p>
                <h2 className="text-2xl font-black text-white">Derya Koc</h2>
              </div>
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-400/15 text-3xl">
                🌱
              </div>
            </div>
            <div className="mt-5 rounded-2xl bg-emerald-400/10 p-4">
              <div className="flex items-end justify-between">
                <span className="text-sm text-emerald-100">Match Score</span>
                <span className="text-4xl font-black text-emerald-200">86</span>
              </div>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-[86%] rounded-full bg-emerald-300" />
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {[
                "Niche uyumu yuksek",
                "Kadikoy lokasyon avantaji",
                "8.2% engagement orani",
                "Butceye uygun mikro-influencer",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-slate-200"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-400/20 text-indigo-100">
                    ✓
                  </span>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div id="how-it-works" className="mt-12 grid gap-4 sm:grid-cols-3">
        {[
          ["1", "Kampanya bilgisi", "Isletme, hedef kitle, butce ve niche bilgileri girilir."],
          ["2", "Aciklanabilir skor", "Niche, lokasyon, engagement, kitle, butce ve deneyim birlikte puanlanir."],
          ["3", "Swipe demo", "Kartlar mobil uyumlu akista incelenir ve neden onerildigi gorulur."],
        ].map(([step, title, text]) => (
          <div key={step} className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-lg font-black text-slate-950">
              {step}
            </div>
            <h3 className="font-bold text-white">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">{text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
