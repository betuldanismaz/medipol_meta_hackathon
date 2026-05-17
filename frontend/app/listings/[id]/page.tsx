"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/site/SiteShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, CheckCircle2, ArrowLeft } from "lucide-react";
import { getPublicListing } from "@/lib/api";
import type { ListingPublic } from "@/types/agent";
import { ApplyButton } from "./apply-button";

function fmtBudget(min: number | null, max: number | null): string {
  if (min == null && max == null) return "—";
  if (min != null && max != null)
    return `₺${min.toLocaleString("tr-TR")} – ₺${max.toLocaleString("tr-TR")}`;
  return `₺${(min ?? max ?? 0).toLocaleString("tr-TR")}`;
}

function fallbackCover(seed: string | number): string {
  return `https://picsum.photos/seed/listing-${seed}/1200/600`;
}

export default function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const listingId = Number(id);
  const [listing, setListing] = useState<ListingPublic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const data = await getPublicListing(listingId);
        if (!active) return;
        setListing(data);
      } catch (err) {
        if (!active) return;
        const status = (err as Error & { status?: number }).status;
        if (status === 404) {
          notFound();
        }
        setError(err instanceof Error ? err.message : "Yüklenemedi");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [listingId]);

  if (loading) {
    return (
      <SiteShell>
        <section className="mx-auto max-w-5xl px-4 sm:px-6 py-10 text-muted-foreground">
          Yükleniyor...
        </section>
      </SiteShell>
    );
  }

  if (error || !listing) {
    return (
      <SiteShell>
        <section className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
          <p className="text-red-600 text-sm whitespace-pre-wrap">{error ?? "İlan bulunamadı."}</p>
        </section>
      </SiteShell>
    );
  }

  const extras = (listing.extras ?? {}) as {
    deliverables?: string[];
    preferred_tiers?: string[];
    target_categories?: string[];
  };
  const requirements: string[] = [];
  if (extras.deliverables?.length) requirements.push(`Beklenen içerik: ${extras.deliverables.join(", ")}`);
  if (extras.preferred_tiers?.length) requirements.push(`Tier: ${extras.preferred_tiers.join(", ")}`);
  if (extras.target_categories?.length) requirements.push(`Kategori: ${extras.target_categories.join(", ")}`);

  return (
    <SiteShell>
      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
        <Link
          href="/listings"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> İlanlara dön
        </Link>
        <div className="rounded-3xl overflow-hidden border border-border">
          <div className="aspect-[21/9]">
            <img
              src={listing.cover_url ?? fallbackCover(listing.id)}
              alt={listing.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-8">
          <div className="md:col-span-2">
            <Badge variant="secondary">{listing.category ?? "Genel"}</Badge>
            <h1 className="text-3xl md:text-4xl font-bold mt-3">{listing.title}</h1>
            <div className="mt-2 text-muted-foreground flex items-center flex-wrap gap-4 text-sm">
              <span className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {[listing.district, listing.city].filter(Boolean).join(", ") || "—"}
              </span>
              <span className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {new Date(listing.created_at).toLocaleDateString("tr-TR")}
              </span>
            </div>
            {listing.business_name && (
              <p className="mt-3 text-sm text-muted-foreground">
                İşletme: <span className="text-foreground font-medium">{listing.business_name}</span>
                {listing.business_sector && <> · {listing.business_sector}</>}
              </p>
            )}
            <h3 className="font-semibold mt-8 mb-2">İlan açıklaması</h3>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {listing.description}
            </p>
            {requirements.length > 0 && (
              <>
                <h3 className="font-semibold mt-8 mb-3">Aranan özellikler</h3>
                <ul className="space-y-2">
                  {requirements.map((r) => (
                    <li key={r} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-[var(--brand)]" />
                      {r}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          <aside className="md:sticky md:top-24 self-start rounded-2xl border border-border p-6 bg-card">
            <div className="text-sm text-muted-foreground">Bütçe</div>
            <div className="text-2xl font-bold text-[var(--brand)] mt-1">
              {fmtBudget(listing.budget_min, listing.budget_max)}
            </div>
            <ApplyButton listingId={listing.id} />
            <Button variant="outline" className="w-full mt-2">
              Kaydet
            </Button>
            <div className="mt-5 text-xs text-muted-foreground">
              ID: <span className="text-foreground">{listing.external_id ?? listing.id}</span>
            </div>
          </aside>
        </div>
      </section>
    </SiteShell>
  );
}
