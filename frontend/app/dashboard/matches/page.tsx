"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { getMatchDetails } from "@/lib/api";
import type { MatchDetail } from "@/types/agent";

const STATUS_LABEL: Record<MatchDetail["status"], { label: string; cls: string }> = {
  matched: {
    label: "Eşleşti",
    cls: "bg-gradient-brand text-primary-foreground border-transparent",
  },
  pending: { label: "Bekliyor", cls: "" },
  rejected: { label: "Reddedildi", cls: "bg-red-500/10 text-red-600 border-red-300" },
};

function fallbackAvatar(seed: string | number): string {
  return `https://i.pravatar.cc/120?u=${seed}`;
}

export default function MatchesPage() {
  const [items, setItems] = useState<MatchDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const rows = await getMatchDetails();
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

  return (
    <div>
      <div className="animate-rise">
        <p className="text-eyebrow">Karşılıklı beğeniler</p>
        <h1 className="font-display text-5xl md:text-6xl mt-3 leading-[1.05]">
          Eş<span className="italic text-gradient">leşmeler</span>
        </h1>
        <p className="text-muted-foreground mt-3 max-w-md">
          Her ikinizin de evet dediği bağlantılar burada.
        </p>
      </div>

      {error && (
        <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300 text-sm px-4 py-3 whitespace-pre-wrap">
          {error}
        </div>
      )}

      {loading && (
        <div className="text-sm text-muted-foreground mt-8 animate-pulse">
          Yükleniyor…
        </div>
      )}

      {!loading && items.length === 0 && !error && (
        <div className="mt-8 rounded-3xl border border-dashed border-border surface-glass p-12 text-center text-muted-foreground">
          Henüz eşleşme yok. Keşfet sayfasından başla.
        </div>
      )}

      <div className="grid gap-3 mt-8">
        {items.map((m, idx) => {
          const meta = STATUS_LABEL[m.status];
          return (
            <Link
              key={m.id}
              href="/dashboard/messages"
              className="surface-glass surface-hairline rounded-2xl p-4 flex items-center gap-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-glow)] animate-rise"
              style={{ animationDelay: `${120 + idx * 60}ms` }}
            >
              <img
                src={m.counterpart_avatar_url ?? fallbackAvatar(m.counterpart_id ?? m.id)}
                alt={m.counterpart_display_name ?? "—"}
                className="w-14 h-14 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">
                  {m.counterpart_display_name ?? "—"}
                  {m.listing_title ? ` · ${m.listing_title}` : ""}
                </div>
                <div className="text-sm text-muted-foreground truncate">
                  {m.last_message ?? "Henüz mesaj yok"}
                </div>
              </div>
              <div className="text-right">
                <Badge className={meta.cls}>{meta.label}</Badge>
                <div className="text-xs text-muted-foreground mt-1">
                  {m.last_activity_at
                    ? new Date(m.last_activity_at).toLocaleDateString("tr-TR")
                    : "—"}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
