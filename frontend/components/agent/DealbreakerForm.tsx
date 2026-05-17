"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { Dealbreakers } from "@/types/agent";

const DAYS = [
  "Pzt",
  "Sal",
  "Çar",
  "Per",
  "Cum",
  "Cmt",
  "Paz",
] as const;

const DEFAULTS: Dealbreakers = {
  min_price: null,
  max_price: null,
  max_hours_per_week: null,
  forbidden_days: [],
  required_days: [],
  forbidden_categories: [],
  require_in_person: false,
  free_notes: "",
};

function toggle(list: string[] | null, value: string): string[] {
  const current = list ?? [];
  return current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
}

export function DealbreakerForm({
  initial,
  onSubmit,
  submitLabel = "Kaydet",
  showSubmit = true,
}: {
  initial?: Dealbreakers | null;
  onSubmit: (payload: Dealbreakers) => Promise<void> | void;
  submitLabel?: string;
  showSubmit?: boolean;
}) {
  const [state, setState] = useState<Dealbreakers>({ ...DEFAULTS, ...(initial ?? {}) });
  const [forbiddenCatRaw, setForbiddenCatRaw] = useState(
    (initial?.forbidden_categories ?? []).join(", "),
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const payload: Dealbreakers = {
        ...state,
        forbidden_categories: forbiddenCatRaw
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        free_notes: state.free_notes?.trim() || null,
      };
      await onSubmit(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Beklenmeyen hata.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="min_price">Min ücret (TRY)</Label>
          <Input
            id="min_price"
            type="number"
            min={0}
            value={state.min_price ?? ""}
            onChange={(e) =>
              setState((s) => ({
                ...s,
                min_price: e.target.value === "" ? null : Number(e.target.value),
              }))
            }
            placeholder="Ör. 3000"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="max_price">Max ücret / bütçe tavanı</Label>
          <Input
            id="max_price"
            type="number"
            min={0}
            value={state.max_price ?? ""}
            onChange={(e) =>
              setState((s) => ({
                ...s,
                max_price: e.target.value === "" ? null : Number(e.target.value),
              }))
            }
            placeholder="Ör. 15000"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="max_hours">Haftalık max saat</Label>
          <Input
            id="max_hours"
            type="number"
            min={0}
            value={state.max_hours_per_week ?? ""}
            onChange={(e) =>
              setState((s) => ({
                ...s,
                max_hours_per_week:
                  e.target.value === "" ? null : Number(e.target.value),
              }))
            }
            placeholder="Ör. 20"
          />
        </div>
        <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
          <div>
            <div className="text-sm font-medium">Yüz yüze şart</div>
            <div className="text-xs text-muted-foreground">
              Sadece sahada / iş yerinde olur.
            </div>
          </div>
          <Switch
            checked={state.require_in_person}
            onCheckedChange={(v) => setState((s) => ({ ...s, require_in_person: v }))}
          />
        </div>
      </div>

      <div>
        <Label className="mb-2 block">Çalışılmayacak günler</Label>
        <div className="flex flex-wrap gap-2">
          {DAYS.map((day) => {
            const active = state.forbidden_days?.includes(day);
            return (
              <button
                type="button"
                key={day}
                onClick={() =>
                  setState((s) => ({ ...s, forbidden_days: toggle(s.forbidden_days, day) }))
                }
                className={cn(
                  "rounded-full px-3 py-1 text-xs border transition",
                  active
                    ? "bg-red-500/10 border-red-400 text-red-600"
                    : "border-border hover:border-foreground/30",
                )}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <Label className="mb-2 block">Zorunlu uygunluk günleri</Label>
        <div className="flex flex-wrap gap-2">
          {DAYS.map((day) => {
            const active = state.required_days?.includes(day);
            return (
              <button
                type="button"
                key={day}
                onClick={() =>
                  setState((s) => ({ ...s, required_days: toggle(s.required_days, day) }))
                }
                className={cn(
                  "rounded-full px-3 py-1 text-xs border transition",
                  active
                    ? "bg-emerald-500/10 border-emerald-400 text-emerald-600"
                    : "border-border hover:border-foreground/30",
                )}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="forbidden_cats">Yasak kategoriler / markalar (virgülle)</Label>
        <Input
          id="forbidden_cats"
          value={forbiddenCatRaw}
          onChange={(e) => setForbiddenCatRaw(e.target.value)}
          placeholder="Ör. tütün, alkol, kumar"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="free_notes">Ekstra notlar (agent'ın asla geçemeyeceği)</Label>
        <Textarea
          id="free_notes"
          rows={4}
          value={state.free_notes ?? ""}
          onChange={(e) => setState((s) => ({ ...s, free_notes: e.target.value }))}
          placeholder="Ör. 'Pazar günü asla çalışmıyorum. Ürün fotosu çekmem.'"
        />
        <p className="text-xs text-muted-foreground">
          Bu alan agent'ın dealbreaker'larına eklenir, müzakerede ihlal etmez.
        </p>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {showSubmit && (
        <Button
          type="submit"
          disabled={submitting}
          className="w-full bg-gradient-brand text-primary-foreground hover:opacity-90"
        >
          {submitting ? "Kaydediliyor..." : submitLabel}
        </Button>
      )}
    </form>
  );
}
