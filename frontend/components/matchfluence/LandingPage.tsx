import { Button } from "@/components/ui/button";
import { Sparkles, Brain, MapPin, TrendingUp } from "lucide-react";
import DemoDataBadge from "@/components/matchfluence/DemoDataBadge";

type LandingPageProps = {
  isMock: boolean;
  onStart: () => void;
};

const steps = [
  {
    n: "01",
    icon: Brain,
    title: "Kampanya",
    desc: "İşletme, hedef kitle ve bütçe girilir.",
  },
  {
    n: "02",
    icon: Sparkles,
    title: "AI Skor",
    desc: "Niche, lokasyon ve etkileşim birlikte puanlanır.",
  },
  {
    n: "03",
    icon: TrendingUp,
    title: "Swipe",
    desc: "En uygun adaylar kartlarla incelenir.",
  },
] as const;

export default function LandingPage({ isMock, onStart }: LandingPageProps) {
  return (
    <section className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl flex-col justify-center px-4 py-12 sm:px-6">
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
        {/* Left column */}
        <div>
          <DemoDataBadge isMock={isMock} />
          <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl leading-[1.08]">
            Kampanyan için{" "}
            <span className="text-gradient">doğru influencer'ı</span> bul.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-muted-foreground">
            Kampanya bilgilerini gir, adayları AI skoru ile sırala ve Tinder benzeri
            kartlarla en uygun influencer'ları seç.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              onClick={onStart}
              size="lg"
              className="bg-gradient-brand text-primary-foreground hover:opacity-90"
            >
              <Sparkles className="w-4 h-4 mr-2" /> Kampanya oluştur
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="#how-it-works">Nasıl çalışır?</a>
            </Button>
          </div>

          {/* Steps */}
          <div id="how-it-works" className="mt-10 grid gap-3 sm:grid-cols-3">
            {steps.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.n}
                  className="rounded-2xl border border-border bg-card p-4 shadow-sm"
                >
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-brand text-white shadow-sm">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="font-semibold text-foreground">{s.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground leading-5">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column — preview card */}
        <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
          <div className="rounded-2xl border border-border bg-background p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  En iyi eşleşme
                </p>
                <h2 className="mt-1 text-2xl font-bold text-foreground">Derya Koç</h2>
                <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3" /> Kadıköy, İstanbul
                </div>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-brand text-white font-bold text-lg shadow-sm">
                DK
              </div>
            </div>

            <div className="mt-5 rounded-2xl bg-muted p-4">
              <div className="flex items-end justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Match Score
                </span>
                <span className="text-5xl font-bold text-gradient">86</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-border">
                <div className="h-full w-[86%] rounded-full bg-gradient-brand" />
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {["Niche uyumu yüksek", "Lokasyon avantajı", "Bütçeye uygun"].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2.5 rounded-xl border border-border bg-card p-2.5 text-sm text-foreground"
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-brand text-white text-[10px] font-bold shrink-0">
                    ✓
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
