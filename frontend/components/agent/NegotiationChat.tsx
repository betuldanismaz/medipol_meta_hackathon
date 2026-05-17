"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useNegotiationStream } from "@/hooks/useNegotiationStream";
import {
  extendNegotiation,
  finalizeNegotiation,
  interveneNegotiation,
} from "@/lib/api";
import { AgreementCard } from "@/components/agent/AgreementCard";
import type {
  AgreementRead,
  AuthUser,
  NegotiationMessageRead,
} from "@/types/agent";
import {
  Bot,
  Brain,
  ChevronDown,
  ChevronUp,
  HandMetal,
  Plus,
  Send,
  StopCircle,
  Wifi,
  WifiOff,
} from "lucide-react";

type Props = {
  negotiationId: number;
  currentUser: AuthUser;
};

const STATUS_LABELS: Record<string, { label: string; tone: string }> = {
  active: { label: "Aktif", tone: "bg-emerald-500/15 text-emerald-700" },
  agreed: { label: "Anlaşıldı", tone: "bg-emerald-500/15 text-emerald-700" },
  rejected: { label: "Reddedildi", tone: "bg-red-500/15 text-red-700" },
  expired: { label: "Süresi doldu", tone: "bg-amber-500/15 text-amber-700" },
  human_takeover: { label: "İnsan devraldı", tone: "bg-amber-500/15 text-amber-700" },
};

export function NegotiationChat({ negotiationId, currentUser }: Props) {
  const stream = useNegotiationStream(negotiationId);
  const [intervenContent, setIntervenContent] = useState("");
  const [decisionLoading, setDecisionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [openReasoning, setOpenReasoning] = useState<Record<number, boolean>>({});
  const [agreement, setAgreement] = useState<AgreementRead | null>(stream.agreement);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setAgreement(stream.agreement);
  }, [stream.agreement]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [stream.messages.length]);

  const status = stream.negotiation?.status ?? "active";
  const isExpiredOrStuck = ["expired", "human_takeover", "rejected"].includes(status);
  const isUserA = stream.negotiation?.user_a_id === currentUser.id;
  const ownAgentRole = isUserA ? "agent_a" : "agent_b";

  const submitIntervention = async (halt = false) => {
    if (!intervenContent.trim() && !halt) return;
    setActionError(null);
    try {
      await interveneNegotiation(negotiationId, {
        content: intervenContent.trim() || "(durduruldu)",
        halt,
      });
      setIntervenContent("");
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Hata");
    }
  };

  const onDecision = async (decision: "accept" | "renegotiate" | "reject") => {
    setDecisionLoading(true);
    setActionError(null);
    try {
      const detail = await finalizeNegotiation(negotiationId, decision);
      setAgreement(detail.agreement);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Hata");
    } finally {
      setDecisionLoading(false);
    }
  };

  const onExtend = async () => {
    setActionError(null);
    try {
      await extendNegotiation(negotiationId, 1);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Hata");
    }
  };

  const showAgreement = useMemo(() => {
    return (
      agreement !== null ||
      (stream.negotiation?.status === "agreed" && stream.negotiation?.last_proposed_terms)
    );
  }, [agreement, stream.negotiation?.status, stream.negotiation?.last_proposed_terms]);

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 rounded-3xl border border-border bg-card overflow-hidden flex flex-col">
        <header className="border-b border-border p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-brand text-primary-foreground grid place-items-center">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold">
                {currentUser.agent_persona?.name ?? "Senin Agent'ın"} ↔ Karşı Agent
              </div>
              <div className="text-xs text-muted-foreground">
                Tur {stream.negotiation?.current_round ?? 0} /
                {" "}{stream.negotiation?.max_rounds ?? 10}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "text-xs px-2.5 py-1 rounded-full",
                STATUS_LABELS[status]?.tone ?? "bg-muted text-muted-foreground",
              )}
            >
              {STATUS_LABELS[status]?.label ?? status}
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1 text-xs",
                stream.connected ? "text-emerald-600" : "text-muted-foreground",
              )}
            >
              {stream.connected ? (
                <Wifi className="w-3 h-3" />
              ) : (
                <WifiOff className="w-3 h-3" />
              )}
              {stream.connected ? "canlı" : "bağlantı kapalı"}
            </span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[60vh]">
          {stream.error && (
            <div className="text-sm text-red-600 bg-red-500/10 rounded-lg px-3 py-2">
              {stream.error}
            </div>
          )}
          {stream.messages.length === 0 && !stream.error && (
            <div className="text-sm text-muted-foreground text-center py-10">
              Agent'lar konuşmaya başlıyor...
            </div>
          )}
          {stream.messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              ownAgentRole={ownAgentRole}
              currentUserId={currentUser.id}
              open={!!openReasoning[msg.id]}
              onToggle={() =>
                setOpenReasoning((prev) => ({ ...prev, [msg.id]: !prev[msg.id] }))
              }
            />
          ))}
          <div ref={messagesEndRef} />
        </div>

        {!isExpiredOrStuck && (
          <div className="border-t border-border p-3 space-y-2">
            <div className="flex gap-2">
              <Textarea
                rows={2}
                placeholder="Agent'ın yerine yaz / yön ver — örn. '300 TL daha yukarı çık, kapsam pazarlığına gir.'"
                value={intervenContent}
                onChange={(e) => setIntervenContent(e.target.value)}
                className="resize-none"
              />
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  size="icon"
                  className="bg-gradient-brand text-primary-foreground hover:opacity-90"
                  onClick={() => submitIntervention(false)}
                  aria-label="Müdahale et"
                >
                  <Send className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  onClick={() => submitIntervention(true)}
                  aria-label="Müzakereyi durdur"
                  title="Müzakereyi durdur"
                >
                  <StopCircle className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <HandMetal className="w-3 h-3" />
              Bu mesaj agent'ına yönlendirme olarak iletilir; karşı tarafa direkt
              gönderilmez.
            </p>
          </div>
        )}
        {status === "expired" && (
          <div className="border-t border-border p-3">
            <Button
              type="button"
              className="w-full bg-gradient-brand text-primary-foreground hover:opacity-90"
              onClick={onExtend}
            >
              <Plus className="w-4 h-4 mr-1" />
              +5 tur paketi — ₺29 (mock)
            </Button>
          </div>
        )}
        {actionError && (
          <div className="border-t border-border p-3 text-sm text-red-600">
            {actionError}
          </div>
        )}
      </div>

      <aside className="space-y-4">
        {showAgreement && (
          <AgreementCard
            agreement={agreement}
            pendingTerms={stream.negotiation?.last_proposed_terms ?? null}
            disabled={decisionLoading}
            onDecision={onDecision}
          />
        )}
        <div className="rounded-2xl border border-border bg-card p-5 text-sm">
          <h3 className="font-semibold mb-2">Bu nasıl çalışıyor?</h3>
          <ul className="space-y-2 text-muted-foreground">
            <li>• Her agent kendi dealbreaker'larından sapmaz.</li>
            <li>• 🧠 Düşünce balonuyla agent'ın gerekçesini gör.</li>
            <li>• Müdahale et: yön ver veya sen yaz.</li>
            <li>• 10 tur sonu: +5 tur paketi (₺29) veya in-app chat.</li>
          </ul>
        </div>
      </aside>
    </div>
  );
}

function MessageBubble({
  message,
  ownAgentRole,
  currentUserId,
  open,
  onToggle,
}: {
  message: NegotiationMessageRead;
  ownAgentRole: "agent_a" | "agent_b";
  currentUserId: number;
  open: boolean;
  onToggle: () => void;
}) {
  const isOwnAgent = message.role === ownAgentRole;
  const isUserMessage = message.role === "user_a" || message.role === "user_b";
  const isOwnUser =
    (message.role === "user_a" && ownAgentRole === "agent_a") ||
    (message.role === "user_b" && ownAgentRole === "agent_b");

  const align = isOwnAgent || isOwnUser ? "items-end" : "items-start";
  const bg = isUserMessage
    ? isOwnUser
      ? "bg-secondary border-secondary"
      : "bg-secondary/60 border-secondary"
    : isOwnAgent
    ? "bg-gradient-brand text-primary-foreground border-transparent"
    : "bg-card border-border";

  return (
    <div className={cn("flex flex-col gap-1", align)}>
      <div className={cn("max-w-[80%] rounded-2xl border px-4 py-2 text-sm", bg)}>
        <div className="flex items-center gap-2 text-xs opacity-80 mb-1">
          <span>
            {isUserMessage
              ? isOwnUser
                ? "Sen (müdahale)"
                : "Karşı kullanıcı (müdahale)"
              : isOwnAgent
              ? "Agent (sen)"
              : "Karşı Agent"}
          </span>
          <span>· tur {message.round}</span>
        </div>
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>
      {message.reasoning && (
        <button
          type="button"
          onClick={onToggle}
          className="text-xs inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
        >
          <Brain className="w-3 h-3" />
          {open ? "Düşünceyi gizle" : "Düşünce balonu"}
          {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      )}
      {open && message.reasoning && (
        <div className="max-w-[80%] text-xs rounded-xl bg-accent/40 border border-dashed border-border px-3 py-2 italic text-muted-foreground">
          🧠 {message.reasoning}
        </div>
      )}
      {message.proposed_terms?.price != null && (
        <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
          teklif: ₺{message.proposed_terms.price.toLocaleString("tr-TR")}
        </div>
      )}
    </div>
  );
}
