"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SiteShell } from "@/components/site/SiteShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, X, MapPin, Sparkles, Users, RotateCcw, ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { getDiscoveryFeed, postSwipeV2 } from "@/lib/api";
import { getToken } from "@/lib/auth-storage";
import { PaywallModal } from "@/components/agent/PaywallModal";
import type { DiscoveryCard, ListingPublic, PublicProfile } from "@/types/agent";
import { useRouter } from "next/navigation";

function fallbackAvatar(seed: string | number): string {
  return `https://i.pravatar.cc/600?u=${seed}`;
}

function fallbackCover(seed: string | number): string {
  return `https://picsum.photos/seed/listing-${seed}/800/600`;
}

export default function DiscoverPage() {
  const router = useRouter();
  const [cards, setCards] = useState<DiscoveryCard[]>([]);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1 | 0>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [paywallReason, setPaywallReason] = useState<string | null>(null);

  const reload = async () => {
    if (!getToken()) {
      setError("Keşif için önce giriş yapmalısın.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const feed = await getDiscoveryFeed(20);
      setCards(feed.cards);
      setIndex(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void reload();
  }, []);

  const current = cards[index];
  const next = cards[index + 1];

  const swipe = async (dir: 1 | -1) => {
    if (!current) return;
    setDirection(dir);
    const card = current;
    setTimeout(() => {
      setIndex((i) => i + 1);
      setDirection(0);
    }, 250);

    if (dir !== 1) return;
    try {
      if (card.listing) {
        const res = await postSwipeV2({ listing_id: card.listing.id, direction: "accept" });
        handleSwipeResult(res, card.listing.title);
      } else if (card.user) {
        // Business swipe: ilk listing'i kullan
        const { getMyListings } = await import("@/lib/api");
        const listings = await getMyListings();
        if (listings.length === 0) {
          toast.message("Önce bir ilan oluşturman gerek.", {
            description: "Influencer'a teklif göndermek için aktif ilan lazım.",
          });
          return;
        }
        const res = await postSwipeV2({
          listing_id: listings[0].id,
          candidate_id: card.user.id,
          direction: "accept",
        });
        handleSwipeResult(res, card.user.display_name);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Swipe gönderilemedi");
    }
  };

  const handleSwipeResult = (
    res: Awaited<ReturnType<typeof postSwipeV2>>,
    label: string,
  ) => {
    if (res.status === "matched") {
      if (res.auto_started_negotiation_id) {
        toast.success(`Eşleştin: ${label}! Agent konuşmaya başladı.`, {
          action: {
            label: "Aç",
            onClick: () => router.push(`/dashboard/negotiations/${res.auto_started_negotiation_id}`),
          },
        });
      } else if (res.paywall) {
        setPaywallReason(res.paywall_reason);
        setPaywallOpen(true);
      } else {
        toast.success(`Eşleştin: ${label}!`);
      }
    } else {
      toast.success(`Beğeni gönderildi: ${label}`);
    }
  };

  return (
    <SiteShell>
      <section className="mx-auto max-w-2xl px-4 sm:px-6 py-10">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold">Keşfet</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Sağa kaydır beğen, sola kaydır geç. Skor XGBoost / kural tabanlı eşleştirmeden.
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 text-red-700 text-sm p-3 mb-4 whitespace-pre-wrap">
            {error}
          </div>
        )}

        <div className="relative h-[600px]">
          {loading ? (
            <div className="absolute inset-0 grid place-items-center rounded-3xl border border-border bg-card text-muted-foreground">
              Yükleniyor...
            </div>
          ) : !current ? (
            <div className="absolute inset-0 grid place-items-center rounded-3xl border border-border bg-card text-center p-8">
              <div>
                <Sparkles className="w-10 h-10 text-[var(--brand)] mx-auto mb-3" />
                <h3 className="text-xl font-semibold">Hepsi bu kadar!</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Yarın yeni eşleşmeler için tekrar gel.
                </p>
                <Button onClick={reload} className="mt-5" variant="outline">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Yeniden çek
                </Button>
              </div>
            </div>
          ) : (
            <>
              {next && <CardView card={next} stacked />}
              <AnimatePresence>
                <motion.div
                  key={index}
                  className="absolute inset-0"
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{
                    scale: 1,
                    opacity: 1,
                    x: direction * 600,
                    rotate: direction * 20,
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  onDragEnd={(_, info) => {
                    if (info.offset.x > 120) void swipe(1);
                    else if (info.offset.x < -120) void swipe(-1);
                  }}
                >
                  <CardView card={current} />
                </motion.div>
              </AnimatePresence>
            </>
          )}
        </div>

        {current && (
          <div className="mt-6 flex justify-center gap-4">
            <button
              onClick={() => void swipe(-1)}
              className="w-14 h-14 grid place-items-center rounded-full bg-card border border-border shadow-md hover:bg-destructive hover:text-destructive-foreground transition"
            >
              <X className="w-6 h-6" />
            </button>
            <button
              onClick={() => void swipe(1)}
              className="w-14 h-14 grid place-items-center rounded-full bg-gradient-brand text-primary-foreground shadow-[var(--shadow-glow)] hover:scale-105 transition"
            >
              <Heart className="w-6 h-6 fill-current" />
            </button>
          </div>
        )}

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <Link href="/listings" className="underline">
            İlanları liste halinde görüntüle
          </Link>
        </div>

        <PaywallModal
          open={paywallOpen}
          onOpenChange={setPaywallOpen}
          reason={paywallReason ?? undefined}
        />
      </section>
    </SiteShell>
  );
}

function CardView({ card, stacked = false }: { card: DiscoveryCard; stacked?: boolean }) {
  if (card.listing) return <ListingCardView listing={card.listing} score={card.score} reasons={card.reasons} stacked={stacked} />;
  if (card.user) return <ProfileCardView user={card.user} score={card.score} reasons={card.reasons} stacked={stacked} />;
  return null;
}

function ListingCardView({
  listing,
  score,
  reasons,
  stacked,
}: {
  listing: ListingPublic;
  score: number;
  reasons: string[];
  stacked: boolean;
}) {
  return (
    <div
      className="absolute inset-0 rounded-3xl overflow-hidden bg-card border border-border shadow-[var(--shadow-glow)]"
      style={stacked ? { transform: "scale(0.95) translateY(20px)", opacity: 0.6 } : undefined}
    >
      <div className="relative h-3/5">
        <img
          src={listing.cover_url ?? fallbackCover(listing.id)}
          alt={listing.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
        <Badge className="absolute top-4 left-4 bg-background/90 text-foreground backdrop-blur">
          <Sparkles className="w-3 h-3 mr-1" /> Uyum: {score}/100
        </Badge>
        <div className="absolute bottom-5 left-5 right-5 text-white">
          <div className="text-2xl font-bold">{listing.business_name ?? listing.title}</div>
          <div className="opacity-80 text-sm line-clamp-1">{listing.title}</div>
          <div className="flex items-center text-sm mt-1 opacity-90">
            <MapPin className="w-3 h-3 mr-1" />
            {[listing.district, listing.city].filter(Boolean).join(", ") || "—"}
          </div>
        </div>
      </div>
      <div className="p-5">
        <div className="text-sm text-[var(--brand)] font-semibold">
          {listing.budget_min != null && listing.budget_max != null
            ? `₺${listing.budget_min.toLocaleString("tr-TR")} - ₺${listing.budget_max.toLocaleString("tr-TR")}`
            : "Bütçe görüşülecek"}
        </div>
        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{listing.description}</p>
        {reasons.length > 0 && (
          <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
            {reasons.slice(0, 2).map((r) => (
              <li key={r}>• {r}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function ProfileCardView({
  user,
  score,
  reasons,
  stacked,
}: {
  user: PublicProfile;
  score: number;
  reasons: string[];
  stacked: boolean;
}) {
  const data = (user.profile ?? {}) as { tier?: string; follower_count?: number; engagement_rate?: number };
  return (
    <div
      className="absolute inset-0 rounded-3xl overflow-hidden bg-card border border-border shadow-[var(--shadow-glow)]"
      style={stacked ? { transform: "scale(0.95) translateY(20px)", opacity: 0.6 } : undefined}
    >
      <div className="relative h-3/5">
        <img
          src={user.avatar_url ?? fallbackAvatar(user.external_id ?? user.id)}
          alt={user.display_name}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
        <Badge className="absolute top-4 left-4 bg-background/90 text-foreground backdrop-blur">
          <Sparkles className="w-3 h-3 mr-1" /> Uyum: {score}/100
        </Badge>
        <div className="absolute bottom-5 left-5 right-5 text-white">
          <div className="text-2xl font-bold">{user.display_name}</div>
          <div className="opacity-80 text-sm">{user.username ?? "—"}</div>
          <div className="flex items-center text-sm mt-1 opacity-90">
            <MapPin className="w-3 h-3 mr-1" />
            {[user.district, user.city].filter(Boolean).join(", ") || "—"}
          </div>
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4 text-[var(--brand)]" />
            <b>{(data.follower_count ?? 0).toLocaleString("tr-TR")}</b>
          </div>
          {data.engagement_rate != null && (
            <div>
              <ImageIcon className="w-3 h-3 inline mr-1 text-[var(--brand)]" />
              %{(data.engagement_rate * 100).toFixed(1)}
            </div>
          )}
        </div>
        {reasons.length > 0 && (
          <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
            {reasons.slice(0, 2).map((r) => (
              <li key={r}>• {r}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
