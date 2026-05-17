"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getHealth, getMatchDetails, getMyStats } from "@/lib/api";
import { getToken } from "@/lib/auth-storage";
import type { MatchDetail, UserStats } from "@/types/agent";
import type { HealthStatus } from "@/lib/api";
import {
  ArrowUpRight,
  Heart,
  MousePointerClick,
  Hourglass,
  Star,
  Activity,
  Compass,
} from "lucide-react";

export default function DashboardHomePage() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [matches, setMatches] = useState<MatchDetail[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    void (async () => {
      try {
        const h = await getHealth();
        if (active) setHealth(h);
      } catch (err) {
        if (active)
          setHealthError(err instanceof Error ? err.message : "Bağlanılamadı");
      }
    })();

    if (!getToken()) {
      setError("Stats için giriş yap.");
      return () => {
        active = false;
      };
    }

    void (async () => {
      try {
        const [s, m] = await Promise.all([getMyStats(), getMatchDetails()]);
        if (!active) return;
        setStats(s);
        setMatches(m.slice(0, 3));
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Yüklenemedi");
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const apiOk = health?.status === "ok";
  const dbOk = health?.db === "ok";

  const today = new Date();
  const dateLabel = today
    .toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    .replace(/^./, (c) => c.toUpperCase());

  const STAT_DEFS = [
    {
      label: "Aktif eşleşme",
      value: stats ? String(stats.active_matches) : "—",
      icon: Heart,
      hero: true,
      delta: stats ? "Karşılıklı" : undefined,
    },
    {
      label: "Bu hafta swipe",
      value: stats ? String(stats.weekly_swipes) : "—",
      icon: MousePointerClick,
      delta: stats ? "Son 7 gün" : undefined,
    },
    {
      label: "Devam eden müzakere",
      value: stats ? String(stats.pending_negotiations) : "—",
      icon: Hourglass,
      delta: stats ? "Agent aktif" : undefined,
    },
    {
      label: "Onaylı anlaşma",
      value: stats ? String(stats.confirmed_agreements) : "—",
      icon: Star,
      delta: stats ? "Tamamlandı" : undefined,
    },
  ] as const;

  return (
    <div className="space-y-10">
      {/* ─── Header ─── */}
      <header
        className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 animate-rise"
        style={{ animationDelay: "60ms" }}
      >
        <div>
          <p className="text-eyebrow">{dateLabel}</p>
          <h1 className="font-display text-5xl md:text-6xl mt-3 leading-[1.05]">
            Merhaba, <span className="italic text-gradient">tekrar</span>.
          </h1>
          <p className="text-muted-foreground mt-3 max-w-md">
            Bugünkü eşleşme aktiviten bir bakışta. Agent'ların arka planda{" "}
            <span className="text-foreground font-medium">senin için çalışıyor</span>.
          </p>
        </div>

        <Link
          href="/discover"
          className="group relative inline-flex items-center gap-2 self-start sm:self-auto px-5 py-3 rounded-2xl bg-gradient-brand text-primary-foreground text-sm font-medium shadow-[var(--shadow-glow)] transition-transform duration-300 hover:-translate-y-0.5"
        >
          <Compass className="w-4 h-4" strokeWidth={2.2} />
          Keşfetmeye devam et
          <ArrowUpRight
            className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            strokeWidth={2.2}
          />
        </Link>
      </header>

      {/* ─── Auth notice ─── */}
      {error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300 text-sm px-4 py-3 whitespace-pre-wrap">
          {error}
        </div>
      )}

      {/* ─── Stat grid ─── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_DEFS.map((s, i) => (
          <StatCard key={s.label} {...s} delay={120 + i * 80} />
        ))}
      </section>

      {/* ─── Activity + Hero CTA ─── */}
      <section className="grid lg:grid-cols-[1.4fr_1fr] gap-6">
        {/* Activity timeline */}
        <article
          className="surface-glass-strong surface-hairline rounded-3xl p-7 animate-rise"
          style={{ animationDelay: "460ms" }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-eyebrow">Akış</p>
              <h3 className="font-display text-2xl mt-1">
                Son <span className="italic">aktivite</span>
              </h3>
            </div>
            <Link
              href="/dashboard/matches"
              className="text-xs text-muted-foreground hover:text-foreground transition inline-flex items-center gap-1"
            >
              Tümü <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          {matches.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              Henüz aktivite yok. Keşfet sayfasından başla.
            </p>
          ) : (
            <ol className="relative space-y-5">
              <span
                aria-hidden
                className="absolute left-[11px] top-2 bottom-2 w-px bg-gradient-to-b from-border via-border/60 to-transparent"
              />
              {matches.map((m, i) => {
                const accents = [
                  "from-[oklch(0.66_0.26_350)] to-[oklch(0.58_0.24_295)]",
                  "from-[oklch(0.78_0.16_60)] to-[oklch(0.66_0.26_350)]",
                  "from-[oklch(0.58_0.24_295)] to-[oklch(0.78_0.16_60)]",
                ];
                return (
                  <li key={m.id} className="relative pl-9">
                    <span
                      className={`absolute left-0 top-1 w-6 h-6 rounded-full p-px bg-gradient-to-br ${accents[i % accents.length]}`}
                    >
                      <span className="block w-full h-full rounded-full bg-card grid place-items-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-foreground/80" />
                      </span>
                    </span>
                    <div className="flex flex-wrap items-baseline gap-x-2">
                      <span className="font-medium">
                        {m.counterpart_display_name ?? "—"}
                      </span>
                      <span className="text-xs text-muted-foreground/80 ml-auto font-mono">
                        {m.last_activity_at
                          ? new Date(m.last_activity_at).toLocaleDateString("tr-TR")
                          : "—"}
                      </span>
                    </div>
                    {m.listing_title && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {m.listing_title}
                      </p>
                    )}
                  </li>
                );
              })}
            </ol>
          )}
        </article>

        {/* Hero CTA */}
        <article
          className="relative overflow-hidden rounded-3xl p-8 text-primary-foreground animate-rise shadow-[var(--shadow-glow)]"
          style={{ animationDelay: "540ms" }}
        >
          <span aria-hidden className="absolute inset-0 bg-gradient-brand" />
          <span
            aria-hidden
            className="absolute -top-12 -right-12 w-56 h-56 rounded-full bg-white/25 blur-3xl"
          />
          <span
            aria-hidden
            className="absolute -bottom-16 -left-12 w-72 h-72 rounded-full bg-[oklch(0.78_0.16_60/0.6)] blur-3xl"
          />
          <span
            aria-hidden
            className="absolute inset-0 opacity-30 mix-blend-overlay"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.6 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
            }}
          />

          <div className="relative">
            <p className="text-eyebrow !text-white/70">Hızlı eylem</p>
            <h3 className="font-display text-3xl md:text-4xl leading-tight mt-2">
              Yeni bir <span className="italic">eşleşme</span> ister misin?
            </h3>
            <p className="text-sm text-white/80 mt-3 max-w-sm">
              Yakınındaki butikleri ve influencer'ları keşfet. Agent'ın senin için
              müzakere etsin.
            </p>

            <div className="mt-7 flex items-center gap-3">
              <Link
                href="/discover"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-foreground text-sm font-medium hover:bg-white/90 transition"
              >
                Keşfet
                <ArrowUpRight className="w-4 h-4" strokeWidth={2.2} />
              </Link>
              <Link
                href="/dashboard/negotiations"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/30 text-sm font-medium text-white hover:bg-white/10 transition"
              >
                Agent inbox
              </Link>
            </div>
          </div>
        </article>
      </section>

      {/* ─── Backend status ─── */}
      <section
        className="surface-glass surface-hairline rounded-3xl p-7 animate-rise"
        style={{ animationDelay: "620ms" }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            <span className="grid place-items-center w-10 h-10 rounded-2xl bg-[oklch(0_0_0/0.04)] dark:bg-[oklch(1_0_0/0.06)]">
              <Activity className="w-4 h-4" strokeWidth={2} />
            </span>
            <div>
              <p className="text-eyebrow">Sistem</p>
              <h3 className="font-display text-xl mt-0.5">
                Backend <span className="italic">bağlantısı</span>
              </h3>
            </div>
          </div>
          <span
            className={`inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full border ${
              health
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                : "bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/30"
            }`}
          >
            <span
              className={`relative inline-flex w-1.5 h-1.5 rounded-full ${
                health ? "bg-emerald-500" : "bg-red-500"
              }`}
            >
              <span
                className={`absolute inset-0 rounded-full ${
                  health ? "bg-emerald-500" : "bg-red-500"
                } animate-ping opacity-60`}
              />
            </span>
            {health ? "Çevrimiçi" : "Erişilemiyor"}
          </span>
        </div>

        {health ? (
          <ul className="grid sm:grid-cols-2 gap-2 text-sm font-mono">
            <li className="flex justify-between border border-border rounded-xl px-4 py-2.5 bg-background/40">
              <span className="text-muted-foreground">api.status</span>
              <span
                className={
                  apiOk
                    ? "text-emerald-600 dark:text-emerald-300"
                    : "text-red-600"
                }
              >
                {health.status}
              </span>
            </li>
            <li className="flex justify-between border border-border rounded-xl px-4 py-2.5 bg-background/40">
              <span className="text-muted-foreground">db.status</span>
              <span
                className={
                  dbOk
                    ? "text-emerald-600 dark:text-emerald-300"
                    : "text-red-600"
                }
              >
                {health.db}
              </span>
            </li>
          </ul>
        ) : (
          <p className="text-sm text-red-600 font-mono whitespace-pre-wrap">
            {healthError ?? "unknown error"}
          </p>
        )}
      </section>
    </div>
  );
}

/* ─────────────── Stat card ─────────────── */

type StatCardProps = {
  label: string;
  value: string;
  delta?: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  hero?: boolean;
  delay?: number;
};

function StatCard({ label, value, delta, icon: Icon, hero, delay = 0 }: StatCardProps) {
  return (
    <article
      className={`group relative overflow-hidden rounded-3xl p-6 animate-rise transition-transform duration-500 hover:-translate-y-1 ${
        hero
          ? "text-primary-foreground shadow-[var(--shadow-glow)]"
          : "surface-glass-strong surface-hairline"
      }`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {hero && (
        <>
          <span aria-hidden className="absolute inset-0 bg-gradient-brand" />
          <span
            aria-hidden
            className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/30 blur-2xl"
          />
        </>
      )}

      <div className="relative flex items-start justify-between">
        <span
          className={`grid place-items-center w-9 h-9 rounded-xl ${
            hero
              ? "bg-white/20 backdrop-blur-sm ring-1 ring-inset ring-white/30"
              : "bg-[oklch(0_0_0/0.04)] dark:bg-[oklch(1_0_0/0.06)]"
          }`}
        >
          <Icon className="w-4 h-4" strokeWidth={2} />
        </span>
        {delta && (
          <span
            className={`text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded-full ${
              hero
                ? "bg-white/20 text-white/95"
                : "bg-[oklch(0_0_0/0.04)] dark:bg-[oklch(1_0_0/0.06)] text-muted-foreground"
            }`}
          >
            {delta}
          </span>
        )}
      </div>

      <div className="relative mt-7">
        <p
          className={`text-xs uppercase tracking-[0.18em] ${
            hero ? "text-white/75" : "text-muted-foreground"
          }`}
        >
          {label}
        </p>
        <p className="font-display text-5xl mt-2 leading-none tracking-tight">
          {value}
        </p>
      </div>
    </article>
  );
}
