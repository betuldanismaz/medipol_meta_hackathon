"use client";

import { useEffect, useRef, useState } from "react";
import type {
  AgreementRead,
  NegotiationDetail,
  NegotiationMessageRead,
  NegotiationRead,
  StreamEvent,
} from "@/types/agent";
import { buildStreamUrl, getNegotiation } from "@/lib/api";

type State = {
  negotiation: NegotiationRead | null;
  messages: NegotiationMessageRead[];
  agreement: AgreementRead | null;
  connected: boolean;
  error: string | null;
};

const INITIAL: State = {
  negotiation: null,
  messages: [],
  agreement: null,
  connected: false,
  error: null,
};

export function useNegotiationStream(negotiationId: number | null) {
  const [state, setState] = useState<State>(INITIAL);
  const socketRef = useRef<WebSocket | null>(null);
  const keepaliveRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (negotiationId == null) {
      setState(INITIAL);
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const detail: NegotiationDetail = await getNegotiation(negotiationId);
        if (cancelled) return;
        setState((prev) => ({
          ...prev,
          negotiation: detail,
          messages: detail.messages,
          agreement: detail.agreement,
          error: null,
        }));
      } catch (err) {
        if (cancelled) return;
        setState((prev) => ({
          ...prev,
          error: err instanceof Error ? err.message : "Yüklenemedi",
        }));
      }
    })();

    const ws = new WebSocket(buildStreamUrl(negotiationId));
    socketRef.current = ws;

    ws.onopen = () => {
      setState((prev) => ({ ...prev, connected: true }));
      keepaliveRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) ws.send("ping");
      }, 25_000);
    };

    ws.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data) as StreamEvent;
        setState((prev) => applyEvent(prev, parsed));
      } catch {
        // ignore malformed payloads
      }
    };

    ws.onerror = () => {
      setState((prev) => ({ ...prev, connected: false }));
    };

    ws.onclose = () => {
      setState((prev) => ({ ...prev, connected: false }));
      if (keepaliveRef.current) {
        clearInterval(keepaliveRef.current);
        keepaliveRef.current = null;
      }
    };

    return () => {
      cancelled = true;
      if (keepaliveRef.current) clearInterval(keepaliveRef.current);
      ws.close();
    };
  }, [negotiationId]);

  return state;
}

function applyEvent(prev: State, event: StreamEvent): State {
  if (event.type === "snapshot") {
    return {
      ...prev,
      negotiation: event.data.negotiation,
      messages: event.data.messages,
      agreement: event.data.agreement,
    };
  }
  if (event.type === "message") {
    const existing = prev.messages.find((m) => m.id === event.data.id);
    if (existing) return prev;
    return { ...prev, messages: [...prev.messages, event.data] };
  }
  if (event.type === "state") {
    return {
      ...prev,
      negotiation: prev.negotiation
        ? { ...prev.negotiation, ...event.data }
        : prev.negotiation,
    };
  }
  return prev;
}
