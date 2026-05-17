"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { SiteShell } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, X, MapPin, Sparkles, Users, Zap, Star, ArrowRight, Store, Camera } from "lucide-react";
import { influencers, listings } from "@/lib/mock-data";
import { getLegacyMatchScore, getLegacyProfiles, postLegacySwipe } from "@/lib/api";
import type { LegacyMatchScore, LegacyProfile } from "@/types";
import MatchBanner from "@/components/MatchBanner";

const CURRENT_USER_ID = "biz_1";

export default function Home() {
  const [profiles, setProfiles] = useState<LegacyProfile[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [swiping, setSwiping] = useState(false);
  const [matchId, setMatchId] = useState<string | null>(null);
  const [score, setScore] = useState<LegacyMatchScore | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getLegacyProfiles()
      .then((data) => {
        setProfiles(data.filter((profile) => profile.id !== CURRENT_USER_ID));
      })
      .catch((cause) => setError(cause instanceof Error ? cause.message : "Profiller yüklenemedi."))
      .finally(() => setLoading(false));
  }, []);

  const current = profiles[index] ?? null;

  async function handleSwipe(direction: "left" | "right") {
    if (!current || swiping) return;
    setSwiping(true);
    setScore(null);
    try {
      const result = await postLegacySwipe({
        user_id: CURRENT_USER_ID,
        target_id: current.id,
        direction,
      });
      if (direction === "right") {
        const scoreData = await getLegacyMatchScore(current.id, CURRENT_USER_ID).catch(() => null);
        setScore(scoreData);
        if (result.match && result.match_id) setMatchId(result.match_id);
      }
    } catch (cause) {
      console.error("Swipe hatası:", cause);
    } finally {
      setSwiping(false);
      setIndex((v) => v + 1);
    }
  }

  return (
    <SiteShell>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,oklch(0.95_0.04_340/0.5),transparent)]" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-20 pb-16 md:pt-28 md:pb-24 grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <Badge variant="secondary" className="mb-5 rounded-full px-3 py-1 text-xs">
              <Sparkles className="w-3 h-3 mr-1.5" /> AI Destekli Eşleşme
            </Badge>
            <h1 className="text-4xl sm:text-5xl md:text-[3.5rem] font-bold leading-[1.08] tracking-tight">
              İşletmeni{" "}
              <span className="text-gradient">doğru influencer</span>{" "}
              ile eşleştir.
            </h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-lg leading-relaxed">
              Kafeler, butikler ve yerel işletmeler ilan veriyor; influencer'lar sağa kaydırıyor.
              Konum, niş ve geçmiş işlere göre AI öneriyor.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-gradient-brand text-primary-foreground hover:opacity-90 shadow-sm">
                <Link href="/auth/register">
                  Hemen Başla <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/discover">Keşfetmeye Başla</Link>
              </Button>
            </div>

            {/* Social proof */}
            <div className="mt-10 flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex -space-x-2">
                {influencers.slice(0, 4).map((i) => (
                  <img
                    key={i.id}
                    src={i.avatar}
                    alt={i.name}
                    className="w-8 h-8 rounded-full ring-2 ring-background object-cover"
                  />
                ))}
              </div>
              <div>
                <div className="font-semibold text-foreground">10.000+ aktif kullanıcı</div>
                <div className="flex items-center gap-0.5 mt-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-current text-[var(--brand-3)]" />
                  ))}
                  <span className="ml-1 text-xs">4.9 / 5</span>
                </div>
              </div>
            </div>
          </div>

          {/* Hero card preview */}
          <div className="relative h-[420px] md:h-[460px]">
            {influencers.slice(0, 3).map((inf, idx) => (
              <div
                key={inf.id}
                className="absolute inset-0 mx-auto max-w-sm rounded-2xl overflow-hidden bg-card border border-border shadow-sm"
                style={{
                  transform: `translateY(${idx * 14}px) translateX(${idx * 10}px) rotate(${(idx - 1) * 3}deg)`,
                  zIndex: 10 - idx,
                  opacity: 1 - idx * 0.18,
                }}
              >
                <div className="relative h-[60%]">
                  <img
                    src={inf.avatar}
                    alt={inf.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <div className="text-xl font-bold">{inf.name}</div>
                    <div className="flex items-center text-xs opacity-90 mt-0.5">
                      <MapPin className="w-3 h-3 mr-1" />{inf.city}
                    </div>
                  </div>
                  <Badge className="absolute top-3 right-3 bg-background/85 text-foreground backdrop-blur text-xs">
                    <Sparkles className="w-2.5 h-2.5 mr-1" /> {inf.aiLevel}
                  </Badge>
                </div>
                <div className="p-4">
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {inf.niches.slice(0, 3).map((n) => (
                      <Badge key={n} variant="secondary" className="text-xs">{n}</Badge>
                    ))}
                  </div>
                  {idx === 0 && (
                    <div className="mt-3 flex gap-2.5 justify-center">
                      <button className="w-10 h-10 grid place-items-center rounded-full bg-card border border-border shadow-sm hover:bg-destructive/10 hover:border-destructive/30 hover:text-destructive transition">
                        <X className="w-4 h-4" />
                      </button>
                      <button className="w-10 h-10 grid place-items-center rounded-full bg-gradient-brand text-primary-foreground shadow-sm hover:opacity-90 hover:scale-105 transition">
                        <Heart className="w-4 h-4 fill-current" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats inline */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        <div className="rounded-2xl border border-border bg-card p-5 grid grid-cols-2 md:grid-cols-4 gap-px">
          {[
            { v: "10K+", l: "Aktif Influencer", icon: Users },
            { v: "2.4K", l: "Kayıtlı İşletme", icon: Store },
            { v: "48K", l: "Kampanya", icon: Camera },
            { v: "%92", l: "Memnuniyet", icon: Zap },
          ].map((s) => (
            <div key={s.l} className="flex flex-col items-center py-4 px-2 text-center">
              <s.icon className="w-5 h-5 text-[var(--brand)] mb-2.5" />
              <div className="text-2xl font-bold">{s.v}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Üç adımda eşleş</h2>
          <p className="mt-3 text-muted-foreground">Kayıt ol, kaydır, kazan. Hepsi bu.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {[
            { n: "01", t: "Profilini oluştur", d: "Influencer ya da işletme — birkaç dakikada profilini hazırla." },
            { n: "02", t: "Kaydırarak keşfet", d: "Sağa kaydırarak ilgini bildir. Karşılıklı beğenide eşleşme." },
            { n: "03", t: "Anlaş ve çalış", d: "Doğrudan mesajlaş, anlaş, kampanyayı başlat." },
          ].map((s) => (
            <div key={s.n} className="rounded-2xl border border-border p-7 bg-card hover:shadow-sm transition">
              <div className="text-4xl font-bold text-gradient mb-4">{s.n}</div>
              <h3 className="text-lg font-semibold mb-2">{s.t}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured listings */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-16">
        <div className="flex items-end justify-between mb-7">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Öne çıkan ilanlar</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">Bugün yeni eklenen fırsatlar</p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/listings">Tümünü gör</Link>
          </Button>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {listings.slice(0, 3).map((l) => (
            <Link
              key={l.id}
              href={`/listings/${l.id}`}
              className="group rounded-2xl border border-border overflow-hidden bg-card hover:shadow-sm transition"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={l.cover}
                  alt={l.business}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
              </div>
              <div className="p-4">
                <Badge variant="secondary" className="mb-2 text-xs">{l.category}</Badge>
                <h3 className="font-semibold">{l.business}</h3>
                <div className="flex items-center text-xs text-muted-foreground mt-1.5">
                  <MapPin className="w-3 h-3 mr-1" />{l.district}, {l.city}
                </div>
                <div className="mt-2.5 text-sm font-semibold text-[var(--brand)]">{l.budget}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-20">
        <div className="rounded-2xl bg-gradient-brand p-10 md:p-14 text-center text-primary-foreground overflow-hidden relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.15),transparent_55%)]" />
          <div className="relative">
            <h2 className="text-2xl md:text-4xl font-bold max-w-2xl mx-auto leading-tight">
              Bir sonraki eşleşmen burada başlıyor.
            </h2>
            <p className="relative mt-3 opacity-90 max-w-md mx-auto text-sm leading-relaxed">
              Ücretsiz katıl, ilk eşleşmeni dakikalar içinde yap.
            </p>
            <div className="relative mt-7 flex justify-center gap-3 flex-wrap">
              <Button asChild size="lg" variant="secondary">
                <Link href="/auth/register">Hesap Aç</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="bg-transparent border-white/30 text-white hover:bg-white/10"
              >
                <Link href="/how-it-works">Daha Fazla</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {matchId ? <MatchBanner matchId={matchId} onClose={() => setMatchId(null)} /> : null}
    </SiteShell>
  );
}
