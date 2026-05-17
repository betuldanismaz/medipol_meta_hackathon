"use client";

import { Button } from "@/components/ui/button";
import type { AgreementRead, ProposedTerms } from "@/types/agent";
import { Check, RotateCcw, X } from "lucide-react";

type Props = {
  agreement: AgreementRead | null;
  pendingTerms: ProposedTerms | null;
  onDecision: (decision: "accept" | "renegotiate" | "reject") => Promise<void> | void;
  disabled?: boolean;
};

export function AgreementCard({ agreement, pendingTerms, onDecision, disabled }: Props) {
  const terms = agreement?.final_terms ?? pendingTerms;
  if (!terms) return null;

  const rows: { label: string; value: string }[] = [
    {
      label: "Ücret",
      value:
        terms.price != null
          ? `${terms.price.toLocaleString("tr-TR")} ${terms.currency}`
          : "—",
    },
    {
      label: "Süre",
      value: terms.duration_days != null ? `${terms.duration_days} gün` : "—",
    },
    { label: "Kapsam", value: terms.scope ?? "—" },
    {
      label: "Ek şartlar",
      value: terms.extra_conditions.length ? terms.extra_conditions.join(", ") : "—",
    },
  ];

  const status = agreement?.status ?? "proposed";
  const accepted = agreement?.accepted_by_a && agreement?.accepted_by_b;

  return (
    <div className="rounded-2xl border-2 border-[var(--brand)] bg-gradient-to-br from-card to-accent/40 p-6 shadow-[var(--shadow-glow)]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-lg">
          {agreement ? "Önerilen Anlaşma" : "Mevcut Teklif"}
        </h3>
        <span className="text-xs uppercase tracking-wide bg-gradient-brand text-primary-foreground rounded-full px-3 py-1">
          {status}
        </span>
      </div>

      <ul className="grid sm:grid-cols-2 gap-3 text-sm mb-5">
        {rows.map((row) => (
          <li
            key={row.label}
            className="rounded-xl bg-background/70 border border-border px-3 py-2 flex justify-between"
          >
            <span className="text-muted-foreground">{row.label}</span>
            <span className="font-medium">{row.value}</span>
          </li>
        ))}
      </ul>

      {accepted ? (
        <div className="rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-sm px-3 py-2">
          ✅ Her iki taraf da onayladı — anlaşma kesinleşti.
        </div>
      ) : (
        <div className="grid sm:grid-cols-3 gap-2">
          <Button
            disabled={disabled}
            onClick={() => onDecision("accept")}
            className="bg-gradient-brand text-primary-foreground hover:opacity-90"
          >
            <Check className="w-4 h-4 mr-1" />
            Kabul ediyorum
          </Button>
          <Button
            disabled={disabled}
            variant="outline"
            onClick={() => onDecision("renegotiate")}
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Bir kez daha pazarlık
          </Button>
          <Button
            disabled={disabled}
            variant="ghost"
            onClick={() => onDecision("reject")}
            className="text-red-600 hover:bg-red-500/10"
          >
            <X className="w-4 h-4 mr-1" />
            Reddet
          </Button>
        </div>
      )}
    </div>
  );
}
