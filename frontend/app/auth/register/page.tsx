"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Camera, Store, Briefcase } from "lucide-react";
import { useState } from "react";
import { registerUser } from "@/lib/api";
import { setStoredUser, setToken } from "@/lib/auth-storage";
import type { UserRole } from "@/types/agent";

const ROLES: { id: UserRole; label: string; icon: typeof Camera; desc: string }[] = [
  { id: "influencer", label: "Influencer", icon: Camera, desc: "Markalarla işbirliği." },
  { id: "worker", label: "Çalışan", icon: Briefcase, desc: "Esnek iş arıyorum." },
  { id: "business", label: "İşletme", icon: Store, desc: "İlan açacağım." },
];

export default function RegisterPage() {
  const [role, setRole] = useState<UserRole>("influencer");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    const fd = new FormData(event.currentTarget);
    try {
      const res = await registerUser({
        email: String(fd.get("email")),
        password: String(fd.get("pw")),
        display_name: String(fd.get("name")),
        role,
        city: (fd.get("city") || "").toString() || undefined,
      });
      setToken(res.access_token);
      setStoredUser(res.user);
      router.push("/onboarding/persona");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kayıt başarısız oldu.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="flex items-center justify-center p-6 order-2 lg:order-1">
        <form onSubmit={onSubmit} className="w-full max-w-md space-y-5">
          <div>
            <h1 className="text-2xl font-bold">Hesap aç</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Saniyeler içinde başla. Sonra agent persona kurarsın.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {ROLES.map((r) => {
              const Icon = r.icon;
              const active = role === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id)}
                  className={`rounded-xl border p-3 text-left transition ${
                    active
                      ? "border-[var(--brand)] bg-accent shadow-[var(--shadow-glow)]"
                      : "border-border hover:border-foreground/30"
                  }`}
                >
                  <Icon className="w-4 h-4 mb-2 text-[var(--brand)]" />
                  <div className="font-semibold text-xs">{r.label}</div>
                  <div className="text-[10px] text-muted-foreground mt-1">{r.desc}</div>
                </button>
              );
            })}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="name">Ad Soyad / İşletme adı</Label>
            <Input id="name" name="name" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">E-posta</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="pw">Şifre</Label>
            <Input id="pw" name="pw" type="password" required minLength={6} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="city">Şehir (opsiyonel)</Label>
            <Input id="city" name="city" placeholder="İstanbul" />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={submitting}
            className="w-full bg-gradient-brand text-primary-foreground hover:opacity-90"
          >
            {submitting ? "Hesap açılıyor..." : "Hesap Aç"}
          </Button>
          <p className="text-sm text-center text-muted-foreground">
            Hesabın var mı?{" "}
            <Link href="/auth/login" className="text-[var(--brand)] font-medium">
              Giriş yap
            </Link>
          </p>
        </form>
      </div>
      <div className="hidden lg:block bg-gradient-brand relative overflow-hidden order-1 lg:order-2">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.2),transparent_60%)]" />
        <div className="relative h-full flex flex-col justify-between p-12 text-primary-foreground">
          <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
            <Sparkles className="w-5 h-5" /> InfluMatch
          </Link>
          <div>
            <h2 className="text-4xl font-bold leading-tight">
              Senin yerine müzakere eden bir agent.
            </h2>
            <p className="mt-3 opacity-90 max-w-md">
              Eşleşme sonrası kişiselleştirilmiş agent karşı tarafla anlaşır.
              Sen sadece onayla.
            </p>
          </div>
          <div className="text-sm opacity-80">© InfluMatch</div>
        </div>
      </div>
    </div>
  );
}
