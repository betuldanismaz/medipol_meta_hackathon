"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { AgentPersona, AgentStyle } from "@/types/agent";
import { Bot, Flame, Handshake, Scale, Zap } from "lucide-react";

const STYLE_OPTIONS: {
  id: AgentStyle;
  label: string;
  desc: string;
  icon: typeof Flame;
}[] = [
  {
    id: "aggressive",
    label: "Sert pazarlıkçı",
    desc: "Erken teklif düşük tutar, taviz zor.",
    icon: Flame,
  },
  {
    id: "balanced",
    label: "Dengeli",
    desc: "Kazan-kazan, nazik ama net.",
    icon: Scale,
  },
  {
    id: "flexible",
    label: "Esnek / uyumlu",
    desc: "Karşı tarafın ihtiyaçlarına öncelik.",
    icon: Handshake,
  },
  {
    id: "quick_closer",
    label: "Hızlı kapatıcı",
    desc: "Az turda makul orta noktada anlaş.",
    icon: Zap,
  },
];

const AVATARS = ["sparkle", "moon", "fox", "owl", "wave", "rocket"] as const;

export function PersonaSetupForm({
  initial,
  onSubmit,
  submitLabel = "Kaydet",
}: {
  initial?: AgentPersona | null;
  onSubmit: (persona: AgentPersona) => Promise<void> | void;
  submitLabel?: string;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [style, setStyle] = useState<AgentStyle>(initial?.style ?? "balanced");
  const [avatar, setAvatar] = useState<string>(initial?.avatar ?? AVATARS[0]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      setError("Agent adı zorunlu.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({ name: name.trim(), style, avatar });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Beklenmeyen hata.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-2">
        <Label htmlFor="persona-name">Agent ismi</Label>
        <Input
          id="persona-name"
          placeholder="Ör. Ali Hocam"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <p className="text-xs text-muted-foreground">
          Agent karşı tarafa bu isimle hitap eder. Sevdiğin bir isim koy, kişilik katar.
        </p>
      </div>

      <div>
        <Label className="mb-2 block">Avatar</Label>
        <div className="flex flex-wrap gap-2">
          {AVATARS.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => setAvatar(a)}
              className={cn(
                "h-12 w-12 rounded-2xl border flex items-center justify-center transition",
                avatar === a
                  ? "border-[var(--brand)] bg-gradient-brand text-primary-foreground shadow-[var(--shadow-glow)]"
                  : "border-border bg-card hover:border-foreground/30",
              )}
              aria-label={`Avatar ${a}`}
            >
              <Bot className="w-5 h-5" />
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label className="mb-2 block">Müzakere stili</Label>
        <div className="grid sm:grid-cols-2 gap-3">
          {STYLE_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const active = style === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setStyle(opt.id)}
                className={cn(
                  "text-left rounded-xl border p-4 transition",
                  active
                    ? "border-[var(--brand)] bg-accent shadow-[var(--shadow-glow)]"
                    : "border-border hover:border-foreground/30",
                )}
              >
                <Icon className="w-4 h-4 mb-2 text-[var(--brand)]" />
                <div className="font-semibold text-sm">{opt.label}</div>
                <div className="text-xs text-muted-foreground mt-1">{opt.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      <Button
        type="submit"
        disabled={submitting}
        className="w-full bg-gradient-brand text-primary-foreground hover:opacity-90"
      >
        {submitting ? "Kaydediliyor..." : submitLabel}
      </Button>
    </form>
  );
}
