"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import {
  getConversations,
  getMe,
  getMessages,
  postMessage,
} from "@/lib/api";
import type {
  AuthUser,
  ConversationItem,
  MessageRead,
} from "@/types/agent";

function fallbackAvatar(seed: string | number): string {
  return `https://i.pravatar.cc/120?u=${seed}`;
}

function timeLabel(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) {
    return d.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString("tr-TR");
}

export default function MessagesPage() {
  const [me, setMe] = useState<AuthUser | null>(null);
  const [convs, setConvs] = useState<ConversationItem[]>([]);
  const [activeMatch, setActiveMatch] = useState<number | null>(null);
  const [messages, setMessages] = useState<MessageRead[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  const activeConv = useMemo(
    () => convs.find((c) => c.match_id === activeMatch),
    [convs, activeMatch],
  );

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const [user, list] = await Promise.all([getMe(), getConversations()]);
        if (!active) return;
        setMe(user);
        setConvs(list);
        if (list.length > 0) setActiveMatch(list[0].match_id);
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

  useEffect(() => {
    if (activeMatch == null) {
      setMessages([]);
      return;
    }
    let active = true;
    void (async () => {
      try {
        const rows = await getMessages(activeMatch);
        if (!active) return;
        setMessages(rows);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Mesajlar yüklenemedi");
      }
    })();
    return () => {
      active = false;
    };
  }, [activeMatch]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const send = async () => {
    if (!text.trim() || activeMatch == null) return;
    setSending(true);
    try {
      const msg = await postMessage(activeMatch, text.trim());
      setMessages((prev) => [...prev, msg]);
      setText("");
      // refresh conversations to update last_message preview
      void getConversations().then(setConvs).catch(() => undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gönderilemedi");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <div className="text-muted-foreground text-sm">Yükleniyor...</div>;
  }

  return (
    <div className="-m-6 md:-m-8 h-[calc(100vh-3.5rem)] md:h-screen grid md:grid-cols-[280px_1fr]">
      <div className="border-r border-border bg-card/60 backdrop-blur-xl overflow-y-auto">
        <div className="p-4 border-b border-border">
          <p className="text-eyebrow">Mesajlar</p>
          <div className="font-display text-xl mt-1">Sohbetler</div>
        </div>
        {convs.length === 0 && (
          <div className="p-4 text-sm text-muted-foreground">Henüz sohbet yok.</div>
        )}
        {convs.map((c) => (
          <button
            key={c.match_id}
            onClick={() => setActiveMatch(c.match_id)}
            className={`w-full flex items-center gap-3 p-3 hover:bg-accent text-left ${
              activeMatch === c.match_id ? "bg-accent" : ""
            }`}
          >
            <img
              src={c.counterpart_avatar_url ?? fallbackAvatar(c.counterpart_id)}
              alt=""
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="min-w-0 flex-1">
              <div className="font-medium text-sm truncate">{c.counterpart_display_name}</div>
              <div className="text-xs text-muted-foreground truncate">
                {c.last_message ?? "—"}
              </div>
            </div>
          </button>
        ))}
      </div>
      <div className="flex flex-col min-h-0">
        {error && (
          <div className="bg-red-500/10 text-red-700 text-sm p-3 whitespace-pre-wrap">{error}</div>
        )}
        {activeConv ? (
          <>
            <div className="h-16 border-b border-border px-5 flex items-center gap-3 bg-card/60 backdrop-blur-xl">
              <img
                src={activeConv.counterpart_avatar_url ?? fallbackAvatar(activeConv.counterpart_id)}
                alt=""
                className="w-9 h-9 rounded-full object-cover ring-2 ring-[var(--brand)]/30"
              />
              <div className="font-display text-lg">{activeConv.counterpart_display_name}</div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-10">
                  İlk mesajı sen at.
                </p>
              )}
              {messages.map((m) => {
                const mine = me ? m.sender_id === me.id : false;
                return (
                  <div
                    key={m.id}
                    className={`flex ${mine ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm ${
                        mine
                          ? "bg-gradient-brand text-primary-foreground rounded-br-sm"
                          : "bg-muted rounded-bl-sm"
                      }`}
                    >
                      {m.content}
                      <div className="text-[10px] opacity-70 mt-1">{timeLabel(m.created_at)}</div>
                    </div>
                  </div>
                );
              })}
              <div ref={endRef} />
            </div>
            <div className="p-3 border-t border-border flex gap-2 bg-card/60 backdrop-blur-xl">
              <Input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && void send()}
                placeholder="Mesaj yaz..."
                disabled={sending}
              />
              <Button
                onClick={() => void send()}
                disabled={sending}
                className="bg-gradient-brand text-primary-foreground hover:opacity-90"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </>
        ) : (
          <div className="flex-1 grid place-items-center text-sm text-muted-foreground">
            Bir sohbet seç.
          </div>
        )}
      </div>
    </div>
  );
}
