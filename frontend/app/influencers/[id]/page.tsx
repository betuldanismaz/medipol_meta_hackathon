"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/site/SiteShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Sparkles, Users, ArrowLeft, type LucideIcon, ImageIcon } from "lucide-react";
import { getInfluencerPosts, getPublicInfluencer } from "@/lib/api";
import type { InstagramPostRead, PublicProfile } from "@/types/agent";
import { ApplyButton } from "./apply-button";

function tierLabel(t: string | undefined): string {
  if (!t) return "Nano";
  return t.charAt(0).toUpperCase() + t.slice(1);
}

function fallbackAvatar(seed: string | number): string {
  return `https://i.pravatar.cc/600?u=${seed}`;
}

export default function InfluencerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const userId = Number(id);
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [posts, setPosts] = useState<InstagramPostRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const [p, ps] = await Promise.all([
          getPublicInfluencer(userId),
          getInfluencerPosts(userId, 9).catch(() => [] as InstagramPostRead[]),
        ]);
        if (!active) return;
        setProfile(p);
        setPosts(ps);
      } catch (err) {
        if (!active) return;
        const status = (err as Error & { status?: number }).status;
        if (status === 404) notFound();
        setError(err instanceof Error ? err.message : "Yüklenemedi");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [userId]);

  if (loading) {
    return (
      <SiteShell>
        <section className="mx-auto max-w-5xl px-4 sm:px-6 py-10 text-muted-foreground">
          Yükleniyor...
        </section>
      </SiteShell>
    );
  }

  if (error || !profile) {
    return (
      <SiteShell>
        <section className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
          <p className="text-red-600 text-sm whitespace-pre-wrap">{error ?? "Profil bulunamadı."}</p>
        </section>
      </SiteShell>
    );
  }

  const data = (profile.profile ?? {}) as {
    tier?: string;
    follower_count?: number;
    engagement_rate?: number;
    content_categories?: string[];
    past_collaboration_count?: number;
  };

  return (
    <SiteShell>
      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
        <Link
          href="/influencers"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Profillere dön
        </Link>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <div className="aspect-square rounded-3xl overflow-hidden border border-border">
              <img
                src={profile.avatar_url ?? fallbackAvatar(profile.external_id ?? profile.id)}
                alt={profile.display_name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="md:col-span-2">
            <Badge className="bg-gradient-brand text-primary-foreground border-transparent">
              <Sparkles className="w-3 h-3 mr-1" /> {tierLabel(data.tier)}
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold mt-3">{profile.display_name}</h1>
            <div className="text-muted-foreground">{profile.username ?? "—"}</div>
            <div className="mt-2 flex items-center text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 mr-1" />
              {[profile.district, profile.city].filter(Boolean).join(", ") || "—"}
            </div>

            <div className="grid grid-cols-3 gap-3 mt-6">
              <Stat
                icon={Users}
                label="Takipçi"
                value={(data.follower_count ?? 0).toLocaleString("tr-TR")}
              />
              <Stat
                icon={Sparkles}
                label="Etkileşim"
                value={data.engagement_rate != null ? `%${(data.engagement_rate * 100).toFixed(1)}` : "—"}
              />
              <Stat icon={ImageIcon} label="İşbirliği" value={String(data.past_collaboration_count ?? 0)} />
            </div>

            {profile.bio && (
              <>
                <h3 className="font-semibold mt-8 mb-2">Hakkında</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{profile.bio}</p>
              </>
            )}

            {data.content_categories?.length ? (
              <>
                <h3 className="font-semibold mt-6 mb-2">Kategoriler</h3>
                <div className="flex flex-wrap gap-2">
                  {data.content_categories.map((n) => (
                    <Badge key={n} variant="secondary">
                      {n}
                    </Badge>
                  ))}
                </div>
              </>
            ) : null}

            <div className="mt-8 flex gap-3">
              <ApplyButton influencerId={profile.id} />
              <Button variant="outline">Kaydet</Button>
            </div>
          </div>
        </div>

        {posts.length > 0 && (
          <div className="mt-12">
            <h3 className="font-semibold mb-4">Son içerikler</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {posts.map((p) => {
                const metrics = (p.metrics ?? {}) as { likes?: number; reach?: number };
                return (
                  <div key={p.id} className="rounded-2xl border border-border bg-card p-4">
                    <div className="text-xs text-muted-foreground uppercase tracking-wide">
                      {p.type}
                    </div>
                    <p className="text-sm mt-2 line-clamp-3">{p.caption ?? "—"}</p>
                    {p.hashtags && p.hashtags.length > 0 && (
                      <div className="mt-2 text-xs text-[var(--brand)] line-clamp-1">
                        {p.hashtags.join(" ")}
                      </div>
                    )}
                    <div className="mt-3 flex gap-3 text-xs text-muted-foreground">
                      {metrics.likes != null && <span>❤ {metrics.likes.toLocaleString("tr-TR")}</span>}
                      {metrics.reach != null && <span>👁 {metrics.reach.toLocaleString("tr-TR")}</span>}
                      {p.posted_at && (
                        <span>· {new Date(p.posted_at).toLocaleDateString("tr-TR")}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </SiteShell>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border p-3 bg-card">
      <Icon className="w-4 h-4 text-[var(--brand)] mb-1" />
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-semibold">{value}</div>
    </div>
  );
}
