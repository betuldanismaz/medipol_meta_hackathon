"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getNegotiationInbox } from "@/lib/api";
import type { InboxItem } from "@/types/agent";
import { Bot, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<string, { label: string; tone: string }> = {
  active: { label: "Aktif", tone: "bg-emerald-500/15 text-emerald-700" },
  agreed: { label: "Anlaşıldı", tone: "bg-emerald-500/15 text-emerald-700" },
  rejected: { label: "Reddedildi", tone: "bg-red-500/15 text-red-700" },
  expired: { label: "Süresi doldu", tone: "bg-amber-500/15 text-amber-700" },
  human_takeover: { label: "İnsan devraldı", tone: "bg-amber-500/15 text-amber-700" },
};

export default function NegotiationInboxPage() {
  const [items, setItems] = useState<InboxItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const rows = await getNegotiationInbox();
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Bot className="w-7 h-7 text-[var(--brand)]" />
          Agent Inbox
        </h1>
        <p className="text-muted-foreground mt-1">
          Aktif tüm müzakereler. Premium'sun, her şey paralel yürür.
        </p>
      </div>

      {loading && <div className="text-muted-foreground text-sm">Yükleniyor...</div>}

      {error && (
        <div className="text-sm text-red-600 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
          Henüz müzakere yok. Bir match olduğunda agent'lar otomatik konuşmaya başlar.
        </div>
      )}

      <div className="grid gap-3">
        {items.map((item) => (
          <Link
            key={item.negotiation.id}
            href={`/dashboard/negotiations/${item.negotiation.id}`}
            className="group rounded-2xl border border-border bg-card hover:border-foreground/30 transition p-5 flex items-center justify-between gap-4"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold truncate">
                  {item.counterpart_display_name}
                </span>
                <span
                  className={cn(
                    "text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full",
                    STATUS_LABELS[item.negotiation.status]?.tone ?? "bg-muted",
                  )}
                >
                  {STATUS_LABELS[item.negotiation.status]?.label ?? item.negotiation.status}
                </span>
              </div>
              <div className="text-sm text-muted-foreground truncate">
                {item.last_round_summary ?? "Agent'lar konuşmaya başlıyor..."}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Tur {item.negotiation.current_round}/{item.negotiation.max_rounds}
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition" />
          </Link>
        ))}
      </div>
    </div>
  );
}
