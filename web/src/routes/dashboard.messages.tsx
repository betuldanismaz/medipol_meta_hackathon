import { createFileRoute } from "@tanstack/react-router";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { matches, influencers } from "@/lib/mock-data";
import { useState } from "react";

export const Route = createFileRoute("/dashboard/messages")({
  head: () => ({ meta: [{ title: "Mesajlar — Dashboard" }] }),
  component: Messages,
});

function Messages() {
  const convs = matches.map((m) => ({ ...m, inf: influencers.find((i) => i.id === m.influencerId)! }));
  const [active, setActive] = useState(convs[0]?.id);
  const [text, setText] = useState("");
  const [msgs, setMsgs] = useState([
    { from: "them", t: "Merhaba! Brief'i paylaşabilir misiniz?", at: "10:32" },
    { from: "me", t: "Tabii, hemen gönderiyorum.", at: "10:35" },
    { from: "them", t: "Harika, cumartesi 14:00 müsait misiniz?", at: "10:36" },
  ]);

  const send = () => {
    if (!text.trim()) return;
    setMsgs([...msgs, { from: "me", t: text, at: "şimdi" }]);
    setText("");
  };

  const activeConv = convs.find((c) => c.id === active);

  return (
    <div className="-m-6 md:-m-8 h-[calc(100vh-3.5rem)] md:h-screen grid md:grid-cols-[280px_1fr]">
      <div className="border-r border-border bg-card overflow-y-auto">
        <div className="p-4 border-b border-border font-semibold">Sohbetler</div>
        {convs.map((c) => (
          <button
            key={c.id}
            onClick={() => setActive(c.id)}
            className={`w-full flex items-center gap-3 p-3 hover:bg-accent text-left ${active === c.id ? "bg-accent" : ""}`}
          >
            <img src={c.inf.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
            <div className="min-w-0 flex-1">
              <div className="font-medium text-sm truncate">{c.inf.name}</div>
              <div className="text-xs text-muted-foreground truncate">{c.lastMessage ?? "—"}</div>
            </div>
          </button>
        ))}
      </div>
      <div className="flex flex-col min-h-0">
        {activeConv && (
          <>
            <div className="h-16 border-b border-border px-4 flex items-center gap-3 bg-card">
              <img src={activeConv.inf.avatar} alt="" className="w-9 h-9 rounded-full object-cover" />
              <div className="font-semibold">{activeConv.inf.name}</div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {msgs.map((m, i) => (
                <div key={i} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm ${m.from === "me" ? "bg-gradient-brand text-primary-foreground rounded-br-sm" : "bg-muted rounded-bl-sm"}`}>
                    {m.t}
                    <div className="text-[10px] opacity-70 mt-1">{m.at}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-border flex gap-2 bg-card">
              <Input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Mesaj yaz..." />
              <Button onClick={send} className="bg-gradient-brand text-primary-foreground hover:opacity-90"><Send className="w-4 h-4" /></Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
