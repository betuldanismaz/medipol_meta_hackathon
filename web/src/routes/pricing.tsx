import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Fiyatlar — InfluMatch" },
      { name: "description", content: "Free, Pro ve Business planları. İhtiyacına uygun olanı seç." },
    ],
  }),
  component: Pricing,
});

const plans = [
  { name: "Free", price: "₺0", desc: "Başlamak için yeterli.", features: ["Aylık 10 swipe", "Temel profil", "Topluluk desteği"], cta: "Ücretsiz Başla", highlight: false },
  { name: "Pro", price: "₺199", desc: "Aktif kullanıcılar için.", features: ["Sınırsız swipe", "AI eşleşme önerileri", "Öncelikli destek", "Gelişmiş filtreler"], cta: "Pro'ya Geç", highlight: true },
  { name: "Business", price: "₺899", desc: "İşletmeler ve ekipler.", features: ["Çoklu ilan", "Ekip üyeleri", "Kampanya analitiği", "API erişimi", "Özel hesap yöneticisi"], cta: "İletişime Geç", highlight: false },
];

function Pricing() {
  return (
    <SiteShell>
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h1 className="text-4xl md:text-5xl font-bold">Basit, <span className="text-gradient">şeffaf</span> fiyatlar</h1>
          <p className="mt-4 text-muted-foreground text-lg">Aylık, istediğin zaman iptal edebilirsin.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`rounded-3xl border p-8 bg-card relative ${p.highlight ? "border-[var(--brand)] shadow-[var(--shadow-glow)]" : "border-border"}`}
            >
              {p.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-brand text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                  EN POPÜLER
                </div>
              )}
              <h3 className="text-xl font-semibold">{p.name}</h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-4xl font-bold">{p.price}</span>
                <span className="text-muted-foreground">/ ay</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{p.desc}</p>
              <ul className="mt-6 space-y-3 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2"><Check className="w-4 h-4 text-[var(--brand)] mt-0.5" />{f}</li>
                ))}
              </ul>
              <Button asChild className={`w-full mt-8 ${p.highlight ? "bg-gradient-brand text-primary-foreground hover:opacity-90" : ""}`} variant={p.highlight ? "default" : "outline"}>
                <Link to="/auth/register">{p.cta}</Link>
              </Button>
            </div>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
