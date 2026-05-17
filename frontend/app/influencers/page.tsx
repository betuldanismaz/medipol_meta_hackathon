"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { SiteShell } from "@/components/site/SiteShell";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MapPin, Search, Sparkles, Users } from "lucide-react";
import { getPublicInfluencers } from "@/lib/api";
import type { PublicProfile } from "@/types/agent";

const TIERS = ["Tümü", "nano", "micro", "mid", "macro"] as const;

function tierLabel(t: string): string {
  return t === "nano" ? "Nano" : t === "micro" ? "Micro" : t === "mid" ? "Mid" : t === "macro" ? "Macro" : t;
}

function fallbackAvatar(seed: string | number): string {
  return `https://i.pravatar.cc/300?u=${seed}`;
}

export default function InfluencersPage() {
  const [q, setQ] = useState("");
  const [tier, setTier] = useState<(typeof TIERS)[number]>("Tümü");
  const [items, setItems] = useState<PublicProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    void (async () => {
      try {
        const rows = await getPublicInfluencers({ limit: 100 });
        if (!active) return;
        setItems(rows);
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

  const filtered = useMemo(
    () =>
      items.filter((i) => {
        const profile = (i.profile ?? {}) as { tier?: string; content_categories?: string[] };
        const matchesTier = tier === "Tümü" || profile.tier === tier;
        const matchesQ =
          !q ||
          (i.display_name + (i.username ?? "") + (i.city ?? "") + (profile.content_categories ?? []).join(" "))
            .toLowerCase()
            .includes(q.toLowerCase());
        return matchesTier && matchesQ;
      }),
    [items, q, tier],
  );

  return (
    <SiteShell>
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Influencer'lar</h1>
          <p className="text-muted-foreground mt-1">
            {loading ? "Yükleniyor..." : `${filtered.length} profil`}
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="İsim, şehir, niş..."
              className="pl-9"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {TIERS.map((t) => (
              <button
                key={t}
                onClick={() => setTier(t)}
                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap border transition ${
                  tier === t
                    ? "bg-gradient-brand text-primary-foreground border-transparent"
                    : "border-border bg-card hover:bg-accent"
                }`}
              >
                {t !== "Tümü" && <Sparkles className="w-3 h-3 inline mr-1" />}
                {t === "Tümü" ? t : tierLabel(t)}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 text-red-700 text-sm p-3 mb-4 whitespace-pre-wrap">
            {error}
          </div>
        )}

        {!loading && filtered.length === 0 && !error && (
          <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
            Filtreye uyan profil yok.
          </div>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((i) => {
            const profile = (i.profile ?? {}) as {
              tier?: string;
              follower_count?: number;
              content_categories?: string[];
              engagement_rate?: number;
            };
            return (
              <Link
                key={i.id}
                href={`/influencers/${i.id}`}
                className="group rounded-2xl border border-border overflow-hidden bg-card hover:shadow-sm transition"
              >
                <div className="aspect-[4/3] relative overflow-hidden">
                  <img
                    src={i.avatar_url ?? fallbackAvatar(i.external_id ?? i.id)}
                    alt={i.display_name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <Badge className="absolute top-3 left-3 bg-background/90 text-foreground backdrop-blur">
                    <Sparkles className="w-3 h-3 mr-1" /> {tierLabel(profile.tier ?? "nano")}
                  </Badge>
                </div>
                <div className="p-5">
                  <h3 className="font-semibold">{i.display_name}</h3>
                  <div className="text-xs text-muted-foreground">{i.username ?? "—"}</div>
                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <MapPin className="w-3 h-3 mr-1" />
                    {[i.district, i.city].filter(Boolean).join(", ") || "—"}
                  </div>
                  <div className="flex items-center gap-3 text-sm mt-3">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-[var(--brand)]" />
                      {(profile.follower_count ?? 0).toLocaleString("tr-TR")}
                    </span>
                    {profile.engagement_rate != null && (
                      <span className="text-xs">
                        ⚡ %{(profile.engagement_rate * 100).toFixed(1)}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-3">
                    {(profile.content_categories ?? []).slice(0, 3).map((n) => (
                      <Badge key={n} variant="secondary" className="text-xs">
                        {n}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </SiteShell>
  );
}
