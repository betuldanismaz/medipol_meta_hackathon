"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles } from "lucide-react";
import { useState } from "react";
import { loginUser } from "@/lib/api";
import { setStoredUser, setToken } from "@/lib/auth-storage";

export default function LoginPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    const fd = new FormData(event.currentTarget);
    try {
      const res = await loginUser(
        String(fd.get("email")),
        String(fd.get("pw")),
      );
      setToken(res.access_token);
      setStoredUser(res.user);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Giriş başarısız oldu.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:block bg-gradient-brand relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.2),transparent_60%)]" />
        <div className="relative h-full flex flex-col justify-between p-12 text-primary-foreground">
          <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
            <Sparkles className="w-5 h-5" /> InfluMatch
          </Link>
          <div>
            <h2 className="text-4xl font-bold leading-tight">Eşleşmelerin seni bekliyor.</h2>
            <p className="mt-3 opacity-90 max-w-md">
              Bir sonraki kampanyana giriş yaparak başla.
            </p>
          </div>
          <div className="text-sm opacity-80">© InfluMatch</div>
        </div>
      </div>
      <div className="flex items-center justify-center p-6">
        <form onSubmit={onSubmit} className="w-full max-w-sm space-y-5">
          <div>
            <h1 className="text-2xl font-bold">Tekrar hoş geldin</h1>
            <p className="text-sm text-muted-foreground mt-1">Hesabına giriş yap.</p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">E-posta</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="ornek@mail.com"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="pw">Şifre</Label>
            <Input id="pw" name="pw" type="password" required />
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
            {submitting ? "Giriş yapılıyor..." : "Giriş Yap"}
          </Button>
          <p className="text-sm text-center text-muted-foreground">
            Hesabın yok mu?{" "}
            <Link href="/auth/register" className="text-[var(--brand)] font-medium">
              Üye ol
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
