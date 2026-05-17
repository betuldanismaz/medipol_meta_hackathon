"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { SiteShell } from "@/components/site/SiteShell";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MapPin, Search } from "lucide-react";
import { getPublicListings } from "@/lib/api";
import type { ListingPublic } from "@/types/agent";

const CATS = ["Tümü", "Kafe", "Moda", "Yemek", "Seyahat", "Teknoloji", "Yaşam Tarzı"];

function fmtBudget(min: number | null, max: number | null): string {
  if (min == null && max == null) return "—";
  if (min != null && max != null) return `₺${min.toLocaleString("tr-TR")} – ₺${max.toLocaleString("tr-TR")}`;
  return `₺${(min ?? max ?? 0).toLocaleString("tr-TR")}`;
}

function fallbackCover(seed: string | number): string {
  return `https://picsum.photos/seed/listing-${seed}/800/600`;
}

export default function ListingsPage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("Tümü");
  const [items, setItems] = useState<ListingPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    void (async () => {
      try {
        const rows = await getPublicListings({ limit: 60 });
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
      items.filter((l) => {
        const matchesCat = cat === "Tümü" || (l.category && l.category.toLowerCase() === cat.toLowerCase());
        const matchesQ =
          !q ||
          ((l.title + (l.city ?? "") + (l.district ?? "") + (l.business_name ?? ""))
            .toLowerCase()
            .includes(q.toLowerCase()));
        return matchesCat && matchesQ;
      }),
    [items, q, cat],
  );

  return (
    <SiteShell>
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">İlanlar</h1>
          <p className="text-muted-foreground mt-1">
            {loading ? "Yükleniyor..." : `${filtered.length} aktif ilan`}
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="İşletme, şehir veya semt ara..."
              className="pl-9"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {CATS.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap border transition ${
                  cat === c
                    ? "bg-gradient-brand text-primary-foreground border-transparent"
                    : "border-border bg-card hover:bg-accent"
                }`}
              >
                {c}
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
            Filtreye uyan ilan yok.
          </div>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((l) => (
            <Link
              key={l.id}
              href={`/listings/${l.id}`}
              className="group rounded-2xl border border-border overflow-hidden bg-card hover:shadow-[var(--shadow-glow)] transition"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={l.cover_url ?? fallbackCover(l.id)}
                  alt={l.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary">{l.category ?? "Genel"}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(l.created_at).toLocaleDateString("tr-TR")}
                  </span>
                </div>
                <h3 className="font-semibold text-lg">{l.business_name ?? l.title}</h3>
                <div className="flex items-center text-sm text-muted-foreground mt-1">
                  <MapPin className="w-3 h-3 mr-1" />
                  {[l.district, l.city].filter(Boolean).join(", ") || "Lokasyon yok"}
                </div>
                <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{l.description}</p>
                <div className="mt-3 text-sm font-medium text-[var(--brand)]">
                  {fmtBudget(l.budget_min, l.budget_max)}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
