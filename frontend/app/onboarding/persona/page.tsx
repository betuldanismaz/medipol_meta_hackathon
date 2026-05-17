"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PersonaSetupForm } from "@/components/agent/PersonaSetupForm";
import { DealbreakerForm } from "@/components/agent/DealbreakerForm";
import { Button } from "@/components/ui/button";
import {
  getDealbreakers,
  getMe,
  updateMe,
  upsertDealbreakers,
} from "@/lib/api";
import type { AuthUser, Dealbreakers } from "@/types/agent";
import { Sparkles } from "lucide-react";

const STEPS = ["persona", "dealbreakers"] as const;
type Step = (typeof STEPS)[number];

export default function PersonaOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("persona");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [dealbreakers, setDealbreakers] = useState<Dealbreakers | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const [me, db] = await Promise.all([getMe(), getDealbreakers()]);
        if (!active) return;
        setUser(me);
        setDealbreakers(db);
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

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center text-muted-foreground">
        Yükleniyor...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen grid place-items-center p-8">
        <div className="max-w-md text-center space-y-3">
          <p className="text-red-600 text-sm">{error}</p>
          <Button asChild>
            <Link href="/auth/login">Giriş yap</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/30 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-6 text-sm text-muted-foreground">
          <Sparkles className="w-4 h-4 text-[var(--brand)]" />
          Agent kurulumu — 2 adım
        </div>

        <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            {STEPS.map((s, i) => (
              <div
                key={s}
                className={`h-1.5 flex-1 rounded-full ${
                  step === s
                    ? "bg-gradient-brand"
                    : STEPS.indexOf(step) > i
                    ? "bg-[var(--brand)]/40"
                    : "bg-border"
                }`}
              />
            ))}
          </div>

          {step === "persona" && (
            <>
              <h1 className="text-2xl font-bold">Agent'ını tanıt</h1>
              <p className="text-sm text-muted-foreground mt-1 mb-6">
                Karşı tarafa senin yerine konuşacak. İsim, görsel ve müzakere stilini seç.
              </p>
              <PersonaSetupForm
                initial={user?.agent_persona ?? null}
                submitLabel="Devam et"
                onSubmit={async (persona) => {
                  const updated = await updateMe({ agent_persona: persona });
                  setUser(updated);
                  setStep("dealbreakers");
                }}
              />
            </>
          )}

          {step === "dealbreakers" && (
            <>
              <h1 className="text-2xl font-bold">Asla taviz verilmeyecekler</h1>
              <p className="text-sm text-muted-foreground mt-1 mb-6">
                Agent bu sınırların dışına çıkmaz. Boş bıraktıklarında esneklik olur.
              </p>
              <DealbreakerForm
                initial={dealbreakers}
                submitLabel="Tamamla"
                onSubmit={async (payload) => {
                  await upsertDealbreakers(payload);
                  router.push("/dashboard");
                }}
              />
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => setStep("persona")}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  ← Persona'ya geri dön
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
