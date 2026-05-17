"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, Store, Briefcase } from "lucide-react";
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
      {/* Form panel */}
      <div className="flex items-center justify-center p-6 order-2 lg:order-1">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <Image src="/Logo.png" alt="InfluMatch" width={32} height={32} className="object-contain" />
            <span className="font-semibold">InfluMatch</span>
          </Link>

          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Hesap aç</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Saniyeler içinde başla. Sonra agent persona kurarsın.
              </p>
            </div>

            {/* Role selector */}
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
                        ? "border-[var(--brand)] bg-accent shadow-sm"
                        : "border-border hover:border-foreground/30 hover:bg-accent/50"
                    }`}
                  >
                    <Icon className={`w-4 h-4 mb-2 ${active ? "text-[var(--brand)]" : "text-muted-foreground"}`} />
                    <div className="font-semibold text-xs">{r.label}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{r.desc}</div>
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
              <div className="text-sm text-destructive bg-destructive/10 border border-destructive/25 rounded-lg px-3 py-2.5">
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
              <Link href="/auth/login" className="text-[var(--brand)] font-medium hover:underline">
                Giriş yap
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* Brand panel */}
      <div className="hidden lg:flex bg-gradient-brand relative overflow-hidden flex-col justify-between p-12 text-primary-foreground order-1 lg:order-2">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_25%,rgba(255,255,255,0.18),transparent_55%)]" />
        <Link href="/" className="relative flex items-center gap-2.5 font-semibold text-lg">
          <Image src="/Logo.png" alt="InfluMatch" width={40} height={40} className="object-contain brightness-0 invert" />
          InfluMatch
        </Link>
        <div className="relative">
          <h2 className="text-3xl font-bold leading-tight">
            Senin yerine müzakere eden bir agent.
          </h2>
          <p className="mt-3 opacity-85 max-w-md text-sm leading-relaxed">
            Eşleşme sonrası kişiselleştirilmiş agent karşı tarafla anlaşır. Sen sadece onayla.
          </p>
        </div>
        <div className="relative text-xs opacity-70">© {new Date().getFullYear()} InfluMatch</div>
      </div>
    </div>
  );
}
