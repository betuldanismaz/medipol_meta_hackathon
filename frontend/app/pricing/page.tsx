import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";
import { Check, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Fiyatlar",
  description:
    "Free, Pro (Influencer/Çalışan) ve Business planları. Agent müzakere yalnızca Premium üyelerde aktiftir.",
};

type Plan = {
  name: string;
  audience: string;
  price: string;
  desc: string;
  features: string[];
  cta: string;
  href: string;
  highlight?: boolean;
};

const plans: Plan[] = [
  {
    name: "Free",
    audience: "Tüm roller",
    price: "₺0",
    desc: "Tanıyalım. Eşleşmeleri keşfet, agent açma sonraki adım.",
    features: [
      "Tüm rollere kayıt",
      "Aylık 10 swipe",
      "Eşleşme + basit in-app chat",
      "Agent müzakere kapalı",
    ],
    cta: "Ücretsiz Başla",
    href: "/auth/register",
  },
  {
    name: "Pro",
    audience: "Influencer & Çalışan",
    price: "₺149",
    desc: "Kişisel müzakere agent'ı seninle anlaşır.",
    features: [
      "gpt-5-nano destekli kişisel agent",
      "Sınırsız eş zamanlı müzakere",
      "Semantic memory (geçmiş anlaşmalardan öğrenme)",
      "Canlı 'müdahale et' + reasoning balonu",
      "Anlaşma özet kartı + 1-tık onay",
    ],
    cta: "Pro'ya Geç",
    href: "/dashboard/billing?plan=premium_individual",
    highlight: true,
  },
  {
    name: "Business",
    audience: "İşletme",
    price: "₺499",
    desc: "İşletme tarafı için ek dashboard ve kontrol.",
    features: [
      "İşletme agent + çoklu ilan yönetimi",
      "Agent agresiflik / stil ayarı",
      "Dashboard analytics (anlaşma oranı, ortalama bütçe)",
      "Sınırsız eş zamanlı müzakere",
      "Öncelikli destek",
    ],
    cta: "Business'a Geç",
    href: "/dashboard/billing?plan=premium_business",
  },
];

export default function PricingPage() {
  return (
    <SiteShell>
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border text-xs text-muted-foreground mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[var(--brand)]" />
            Agent v2 — gpt-5-nano destekli müzakere
          </div>
          <h1 className="text-4xl md:text-5xl font-bold">
            Basit, <span className="text-gradient">şeffaf</span> fiyatlar
          </h1>
          <p className="mt-4 text-muted-foreground text-lg">
            Aylık abonelik. Free hesaplar match olur ama agent kapalıdır. Agent açmak için
            iki tarafın da Premium olması gerekir.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`rounded-2xl border p-7 bg-card relative flex flex-col ${
                p.highlight
                  ? "border-[var(--brand)] shadow-sm ring-1 ring-[var(--brand)]/20"
                  : "border-border"
              }`}
            >
              {p.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-brand text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                  EN POPÜLER
                </div>
              )}
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  {p.audience}
                </div>
                <h3 className="text-xl font-semibold mt-1">{p.name}</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{p.price}</span>
                  <span className="text-muted-foreground">/ ay</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{p.desc}</p>
              </div>
              <ul className="mt-6 space-y-3 text-sm flex-1">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-[var(--brand)] mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                asChild
                className={`w-full mt-8 ${
                  p.highlight
                    ? "bg-gradient-brand text-primary-foreground hover:opacity-90"
                    : ""
                }`}
                variant={p.highlight ? "default" : "outline"}
              >
                <Link href={p.href}>{p.cta}</Link>
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-dashed border-border bg-card p-6 text-sm text-muted-foreground">
          <strong className="text-foreground">Ek paket:</strong> Premium kullanıcılar 10
          tur sonu anlaşma yoksa <span className="text-foreground font-semibold">+5 tur
          paketi ₺29</span>'a açabilir. Hackathon MVP'sinde ödeme simüle edilir; gerçek
          Stripe / iyzico entegrasyonu v2 backlog'undadır.
        </div>
      </section>
    </SiteShell>
  );
}
