"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { SiteShell } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, X, MapPin, Sparkles, Users, Zap, Star, ArrowRight, Store, Camera } from "lucide-react";
import { influencers, listings } from "@/lib/mock-data";
import { getLegacyMatchScore, getLegacyProfiles, postLegacySwipe } from "@/lib/api";
import type { LegacyMatchScore, LegacyProfile } from "@/types";
import ProfileCard from "@/components/ProfileCard";
import SwipeButtons from "@/components/SwipeButtons";
import MatchBanner from "@/components/MatchBanner";
import ScoreBadge from "@/components/ScoreBadge";

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
      .catch((cause) => setError(cause instanceof Error ? cause.message : "Profiller yuklenemedi."))
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

        if (result.match && result.match_id) {
          setMatchId(result.match_id);
        }
      }
    } catch (cause) {
      console.error("Swipe hatasi:", cause);
    } finally {
      setSwiping(false);
      setIndex((value) => value + 1);
    }
  }

  // Eğer eski swipe ekranını göstermek istersen (URL parametresi veya state ile kontrol edilebilir)
  // Şimdilik ana Landing Page'i gösteriyoruz, ancak çakışan kodları temizledik.

  return (
    <SiteShell>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_10%,oklch(0.95_0.05_340/0.6),transparent_50%),radial-gradient(circle_at_80%_30%,oklch(0.92_0.08_60/0.5),transparent_50%)]" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-20 pb-16 md:pt-28 md:pb-24 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <Badge variant="secondary" className="mb-5 rounded-full">
              <Sparkles className="w-3 h-3 mr-1" /> AI Destekli Eşleşme
            </Badge>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.05]">
              İşletmeni <span className="text-gradient">doğru influencer</span> ile eşleştir.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl">
              Kafeler, butikler ve yerel işletmeler ilan veriyor; influencer'lar sağa kaydırıyor. Konum, niş ve geçmiş işlere göre AI öneriyor.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-gradient-brand text-primary-foreground hover:opacity-90">
                <Link href="/auth/register">Hemen Başla <ArrowRight className="ml-2 w-4 h-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/discover">Keşfetmeye Başla</Link>
              </Button>
            </div>
            <div className="mt-10 flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex -space-x-2">
                {influencers.slice(0, 4).map((i) => (
                  <img key={i.id} src={i.avatar} alt={i.name} className="w-9 h-9 rounded-full ring-2 ring-background object-cover" />
                ))}
              </div>
              <div>
                <div className="font-semibold text-foreground">10.000+ aktif kullanıcı</div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-current text-[var(--brand-3)]" />)}
                  <span className="ml-1">4.9 / 5</span>
                </div>
              </div>
            </div>
          </div>

          {/* Hero card stack */}
          <div className="relative h-[460px] md:h-[520px]">
            {influencers.slice(0, 3).map((inf, idx) => (
              <div
                key={inf.id}
                className="absolute inset-0 mx-auto max-w-sm rounded-3xl overflow-hidden bg-card border border-border shadow-[var(--shadow-glow)]"
                style={{
                  transform: `translateY(${idx * 16}px) translateX(${idx * 12}px) rotate(${(idx - 1) * 4}deg)`,
                  zIndex: 10 - idx,
                  opacity: 1 - idx * 0.15,
                }}
              >
                <div className="relative h-3/5">
                  <img src={inf.avatar} alt={inf.name} className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <Badge className="absolute top-4 left-4 bg-background/90 text-foreground backdrop-blur">
                    <Sparkles className="w-3 h-3 mr-1" /> AI: {inf.aiLevel}
                  </Badge>
                  <div className="absolute bottom-4 left-4 text-white">
                    <div className="text-2xl font-bold">{inf.name}</div>
                    <div className="flex items-center text-sm opacity-90"><MapPin className="w-3 h-3 mr-1" />{inf.city}</div>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {inf.niches.map((n) => <Badge key={n} variant="secondary">{n}</Badge>)}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{inf.bio}</p>
                  {idx === 0 && (
                    <div className="mt-4 flex gap-3 justify-center">
                      <button className="w-12 h-12 grid place-items-center rounded-full bg-card border border-border shadow-md hover:bg-destructive hover:text-destructive-foreground transition">
                        <X className="w-5 h-5" />
                      </button>
                      <button className="w-12 h-12 grid place-items-center rounded-full bg-gradient-brand text-primary-foreground shadow-[var(--shadow-glow)] hover:scale-105 transition">
                        <Heart className="w-5 h-5 fill-current" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { v: "10K+", l: "Aktif Influencer", icon: Users },
          { v: "2.4K", l: "Kayıtlı İşletme", icon: Store },
          { v: "48K", l: "Tamamlanan Kampanya", icon: Camera },
          { v: "%92", l: "Memnuniyet Oranı", icon: Zap },
        ].map((s) => (
          <div key={s.l} className="rounded-2xl border border-border p-6 bg-card">
            <s.icon className="w-5 h-5 text-[var(--brand)] mb-3" />
            <div className="text-3xl font-bold">{s.v}</div>
            <div className="text-sm text-muted-foreground mt-1">{s.l}</div>
          </div>
        ))}
      </section>

      {/* How */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">Üç adımda eşleş</h2>
          <p className="mt-4 text-muted-foreground">Kayıt ol, kaydır, kazan. Hepsi bu.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { n: "01", t: "Profilini oluştur", d: "Influencer ya da işletme — birkaç dakikada profilini hazırla." },
            { n: "02", t: "Kaydırarak keşfet", d: "Sağa kaydırarak ilgini bildir. Karşılıklı beğenide eşleşme." },
            { n: "03", t: "Anlaş ve çalış", d: "Doğrudan mesajlaş, anlaş, kampanyayı başlat." },
          ].map((s) => (
            <div key={s.n} className="rounded-2xl border border-border p-8 bg-card hover:shadow-[var(--shadow-glow)] transition">
              <div className="text-5xl font-bold text-gradient mb-4">{s.n}</div>
              <h3 className="text-xl font-semibold mb-2">{s.t}</h3>
              <p className="text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured listings */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-20">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold">Öne çıkan ilanlar</h2>
            <p className="mt-2 text-muted-foreground">Bugün yeni eklenen fırsatlar</p>
          </div>
          <Button asChild variant="outline"><Link href="/listings">Tümünü gör</Link></Button>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {listings.slice(0, 3).map((l) => (
            <Link key={l.id} href={`/listings/${l.id}`} className="group rounded-2xl border border-border overflow-hidden bg-card hover:shadow-[var(--shadow-glow)] transition">
              <div className="aspect-[4/3] overflow-hidden">
                <img src={l.cover} alt={l.business} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
              </div>
              <div className="p-5">
                <Badge variant="secondary" className="mb-2">{l.category}</Badge>
                <h3 className="font-semibold text-lg">{l.business}</h3>
                <div className="flex items-center text-sm text-muted-foreground mt-1"><MapPin className="w-3 h-3 mr-1" />{l.district}, {l.city}</div>
                <div className="mt-3 text-sm font-medium text-[var(--brand)]">{l.budget}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-24">
        <div className="rounded-3xl bg-gradient-brand p-10 md:p-16 text-center text-primary-foreground relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.2),transparent_50%)]" />
          <h2 className="relative text-3xl md:text-5xl font-bold max-w-2xl mx-auto">
            Bir sonraki eşleşmen burada başlıyor.
          </h2>
          <p className="relative mt-4 opacity-90 max-w-xl mx-auto">
            Ücretsiz katıl, ilk eşleşmeni dakikalar içinde yap.
          </p>
          <div className="relative mt-8 flex justify-center gap-3 flex-wrap">
            <Button asChild size="lg" variant="secondary"><Link href="/auth/register">Hesap Aç</Link></Button>
            <Button asChild size="lg" variant="outline" className="bg-transparent border-white/30 text-white hover:bg-white/10"><Link href="/how-it-works">Daha Fazla</Link></Button>
          </div>
        </div>
      </section>
      {matchId ? <MatchBanner matchId={matchId} onClose={() => setMatchId(null)} /> : null}
    </SiteShell>
  );
}
