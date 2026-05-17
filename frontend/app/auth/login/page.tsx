"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
      const res = await loginUser(String(fd.get("email")), String(fd.get("pw")));
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
      {/* Sol panel */}
      <div className="hidden lg:flex bg-gradient-brand relative overflow-hidden flex-col justify-between p-12 text-primary-foreground">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(255,255,255,0.18),transparent_55%)]" />
        <Link href="/" className="relative flex items-center gap-2.5 font-semibold text-lg">
          <Image src="/logo.svg" alt="InfluMatch" width={32} height={32} className="rounded-xl" />
          InfluMatch
        </Link>
        <div className="relative">
          <h2 className="text-3xl font-bold leading-tight">Eşleşmelerin seni bekliyor.</h2>
          <p className="mt-3 opacity-85 max-w-md text-sm leading-relaxed">
            Bir sonraki kampanyana giriş yaparak başla.
          </p>
        </div>
        <div className="relative text-xs opacity-70">© {new Date().getFullYear()} InfluMatch</div>
      </div>

      {/* Sağ panel */}
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <Image src="/logo.svg" alt="InfluMatch" width={28} height={28} className="rounded-lg" />
            <span className="font-semibold">InfluMatch</span>
          </Link>

          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Tekrar hoş geldin</h1>
              <p className="text-sm text-muted-foreground mt-1">Hesabına giriş yap.</p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">E-posta</Label>
              <Input id="email" name="email" type="email" placeholder="ornek@mail.com" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="pw">Şifre</Label>
              <Input id="pw" name="pw" type="password" required />
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
              {submitting ? "Giriş yapılıyor..." : "Giriş Yap"}
            </Button>

            <p className="text-sm text-center text-muted-foreground">
              Hesabın yok mu?{" "}
              <Link href="/auth/register" className="text-[var(--brand)] font-medium hover:underline">
                Üye ol
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
