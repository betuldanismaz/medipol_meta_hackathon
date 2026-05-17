"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { NegotiationChat } from "@/components/agent/NegotiationChat";
import { getMe } from "@/lib/api";
import type { AuthUser } from "@/types/agent";
import { ArrowLeft, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NegotiationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const negotiationId = Number(id);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const me = await getMe();
        if (!active) return;
        setUser(me);
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
    return <div className="text-muted-foreground text-sm">Yükleniyor...</div>;
  }

  if (error || !user) {
    return (
      <div className="space-y-3">
        <p className="text-red-600 text-sm">{error ?? "Bilinmeyen hata"}</p>
        <Button asChild>
          <Link href="/auth/login">Giriş yap</Link>
        </Button>
      </div>
    );
  }

  if (user.tier !== "premium") {
    return (
      <div className="max-w-xl mx-auto rounded-3xl border border-border bg-card p-10 text-center space-y-3">
        <div className="grid place-items-center w-12 h-12 rounded-full bg-accent mx-auto">
          <Lock className="w-5 h-5 text-[var(--brand)]" />
        </div>
        <h2 className="text-xl font-bold">Agent müzakere Premium'da</h2>
        <p className="text-muted-foreground text-sm">
          Bu sayfaya erişmek için Premium üyelik gerekli. Free hesaplar in-app chat ile
          devam edebilir.
        </p>
        <Button asChild className="bg-gradient-brand text-primary-foreground hover:opacity-90">
          <Link href="/dashboard/billing">Premium'a geç</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Link
        href="/dashboard/negotiations"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Inbox'a dön
      </Link>
      <NegotiationChat negotiationId={negotiationId} currentUser={user} />
    </div>
  );
}
