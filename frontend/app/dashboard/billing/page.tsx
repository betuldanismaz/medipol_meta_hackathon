"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getMe, getPricing, upgradePlanMock } from "@/lib/api";
import { setStoredUser } from "@/lib/auth-storage";
import type { AuthUser, PricingResponse } from "@/types/agent";
import { Check, CreditCard, Sparkles } from "lucide-react";

type PlanKey = "premium_individual" | "premium_business";

function BillingInner() {
  const params = useSearchParams();
  const requestedPlan = params.get("plan") as PlanKey | null;
  const [user, setUser] = useState<AuthUser | null>(null);
  const [pricing, setPricing] = useState<PricingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<PlanKey | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const [me, price] = await Promise.all([getMe(), getPricing()]);
        if (!active) return;
        setUser(me);
        setPricing(price);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Yüklenemedi");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const handleUpgrade = async (plan: PlanKey) => {
    setSubmitting(plan);
    setError(null);
    setSuccess(null);
    try {
      const updated = await upgradePlanMock(plan, 1);
      setUser(updated);
      setStoredUser(updated);
      setSuccess("Premium aktif! Agent erişimi açıldı.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hata");
    } finally {
      setSubmitting(null);
    }
  };

  if (loading) return <div className="text-muted-foreground text-sm">Yükleniyor...</div>;
  if (error && !user) return <div className="text-red-600 text-sm">{error}</div>;

  const isBusiness = user?.role === "business";
  const planForRole: PlanKey = isBusiness ? "premium_business" : "premium_individual";
  const price = isBusiness
    ? pricing?.premium_business_try ?? 499
    : pricing?.premium_individual_try ?? 149;
  const planLabel = isBusiness ? "Business" : "Pro";

  return (
    <div className="max-w-3xl space-y-6">
      <div className="animate-rise">
        <p className="text-eyebrow flex items-center gap-2">
          <CreditCard className="w-3.5 h-3.5 text-[var(--brand)]" />
          Plan & ödeme
        </p>
        <h1 className="font-display text-5xl md:text-6xl mt-3 leading-[1.05]">
          Pre<span className="italic text-gradient">mium</span>
        </h1>
        <p className="text-muted-foreground mt-3 max-w-md text-sm">
          MVP mock ödeme — gerçek Stripe / iyzico v2'de eklenecek.
        </p>
      </div>

      <div className="surface-glass surface-hairline rounded-2xl p-5 animate-rise" style={{ animationDelay: "120ms" }}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Mevcut plan
            </div>
            <div className="text-lg font-semibold mt-0.5">
              {user?.tier === "premium" ? `Premium (${planLabel})` : "Free"}
            </div>
            {user?.premium_until && (
              <div className="text-xs text-muted-foreground mt-1">
                Geçerli: {new Date(user.premium_until).toLocaleDateString("tr-TR")} tarihine kadar
              </div>
            )}
          </div>
          {user?.tier === "premium" && (
            <span className="text-xs bg-gradient-brand text-primary-foreground rounded-full px-3 py-1">
              AKTİF
            </span>
          )}
        </div>
      </div>

      <div
        className={`surface-glass-strong surface-hairline relative rounded-3xl ${
          requestedPlan === planForRole
            ? "ring-2 ring-[var(--brand)] shadow-[var(--shadow-glow)]"
            : ""
        } p-8 animate-rise`}
        style={{ animationDelay: "200ms" }}
      >
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          <Sparkles className="w-3.5 h-3.5 text-[var(--brand)]" />
          {isBusiness ? "İşletme" : "Influencer / Çalışan"} planı
        </div>
        <h2 className="font-display text-3xl tracking-tight">
          {planLabel} <span className="italic">Premium</span>
        </h2>
        <div className="mt-3 flex items-baseline gap-1">
          <span className="font-display text-5xl tracking-tight">₺{price}</span>
          <span className="text-muted-foreground">/ ay</span>
        </div>
        <ul className="mt-5 space-y-2 text-sm">
          {[
            "gpt-5-nano destekli kişisel agent",
            "Sınırsız eş zamanlı müzakere",
            "Canlı izleme + 'müdahale et' butonu",
            "Reasoning balonu — agent'ın gerekçesini gör",
            "Semantic memory: geçmiş anlaşmalardan öğrenme",
            ...(isBusiness
              ? [
                  "Dashboard analytics + çoklu ilan",
                  "Agent stil / agresiflik ayarı",
                ]
              : []),
          ].map((f) => (
            <li key={f} className="flex items-start gap-2">
              <Check className="w-4 h-4 text-[var(--brand)] mt-0.5" />
              <span>{f}</span>
            </li>
          ))}
        </ul>

        <Button
          className="mt-6 w-full bg-gradient-brand text-primary-foreground hover:opacity-90"
          onClick={() => handleUpgrade(planForRole)}
          disabled={submitting === planForRole || user?.tier === "premium"}
        >
          {user?.tier === "premium"
            ? "Zaten Premium'sun"
            : submitting === planForRole
            ? "İşleniyor..."
            : `Mock ödeme — ₺${price}/ay`}
        </Button>

        {success && (
          <div className="mt-4 text-sm text-emerald-700 bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-3 py-2">
            {success}
          </div>
        )}
        {error && (
          <div className="mt-4 text-sm text-red-600 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
            {error}
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Ekstra paket: 10 tur biten her müzakerede +5 tur ₺
        {pricing?.extra_rounds_try ?? 29} ile inline olarak satın alınabilir.
      </p>
    </div>
  );
}

export default function BillingPage() {
  return (
    <Suspense fallback={<div className="text-muted-foreground text-sm">Yükleniyor...</div>}>
      <BillingInner />
    </Suspense>
  );
}
