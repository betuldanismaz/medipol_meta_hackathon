import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Camera, Store } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/auth/register")({
  head: () => ({ meta: [{ title: "Üye Ol — InfluMatch" }] }),
  component: Register,
});

function Register() {
  const [role, setRole] = useState<"influencer" | "business">("influencer");
  const navigate = useNavigate();
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="flex items-center justify-center p-6 order-2 lg:order-1">
        <form
          onSubmit={(e) => { e.preventDefault(); navigate({ to: "/dashboard" }); }}
          className="w-full max-w-md space-y-5"
        >
          <div>
            <h1 className="text-2xl font-bold">Hesap aç</h1>
            <p className="text-sm text-muted-foreground mt-1">Saniyeler içinde başla.</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {([
              { id: "influencer", label: "Influencer", icon: Camera },
              { id: "business", label: "İşletme", icon: Store },
            ] as const).map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setRole(r.id)}
                className={`rounded-xl border p-4 text-left transition ${role === r.id ? "border-[var(--brand)] bg-accent shadow-[var(--shadow-glow)]" : "border-border hover:border-foreground/30"}`}
              >
                <r.icon className="w-5 h-5 mb-2 text-[var(--brand)]" />
                <div className="font-semibold text-sm">{r.label}</div>
              </button>
            ))}
          </div>

          <div className="grid gap-2"><Label htmlFor="name">Ad Soyad / İşletme adı</Label><Input id="name" required /></div>
          <div className="grid gap-2"><Label htmlFor="email">E-posta</Label><Input id="email" type="email" required /></div>
          <div className="grid gap-2"><Label htmlFor="pw">Şifre</Label><Input id="pw" type="password" required /></div>
          <Button type="submit" className="w-full bg-gradient-brand text-primary-foreground hover:opacity-90">Hesap Aç</Button>
          <p className="text-sm text-center text-muted-foreground">
            Hesabın var mı? <Link to="/auth/login" className="text-[var(--brand)] font-medium">Giriş yap</Link>
          </p>
        </form>
      </div>
      <div className="hidden lg:block bg-gradient-brand relative overflow-hidden order-1 lg:order-2">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.2),transparent_60%)]" />
        <div className="relative h-full flex flex-col justify-between p-12 text-primary-foreground">
          <Link to="/" className="flex items-center gap-2 font-semibold text-lg">
            <Sparkles className="w-5 h-5" /> InfluMatch
          </Link>
          <div>
            <h2 className="text-4xl font-bold leading-tight">İlk eşleşmen dakikalar içinde.</h2>
            <p className="mt-3 opacity-90 max-w-md">Yerel işletmeler ve içerik üreticiler tek platformda.</p>
          </div>
          <div className="text-sm opacity-80">© InfluMatch</div>
        </div>
      </div>
    </div>
  );
}
