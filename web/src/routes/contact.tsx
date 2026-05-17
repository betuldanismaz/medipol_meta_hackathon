import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, MapPin, Phone } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "İletişim — InfluMatch" },
      { name: "description", content: "Sorularınız için bize ulaşın." },
    ],
  }),
  component: Contact,
});

function Contact() {
  const [sent, setSent] = useState(false);
  return (
    <SiteShell>
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-20 grid md:grid-cols-2 gap-12">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold">İletişim</h1>
          <p className="mt-4 text-muted-foreground">Sorularınız, geri bildirimleriniz ve ortaklık talepleriniz için.</p>
          <ul className="mt-8 space-y-4 text-sm">
            <li className="flex items-center gap-3"><Mail className="w-4 h-4 text-[var(--brand)]" /> hello@influmatch.app</li>
            <li className="flex items-center gap-3"><Phone className="w-4 h-4 text-[var(--brand)]" /> +90 (212) 000 00 00</li>
            <li className="flex items-center gap-3"><MapPin className="w-4 h-4 text-[var(--brand)]" /> Karaköy, İstanbul</li>
          </ul>
        </div>
        <form
          onSubmit={(e) => { e.preventDefault(); setSent(true); toast.success("Mesajınız iletildi!"); }}
          className="rounded-2xl border border-border p-6 bg-card space-y-4"
        >
          <div className="grid gap-2"><Label htmlFor="name">Adınız</Label><Input id="name" required /></div>
          <div className="grid gap-2"><Label htmlFor="email">E-posta</Label><Input id="email" type="email" required /></div>
          <div className="grid gap-2"><Label htmlFor="msg">Mesaj</Label><Textarea id="msg" rows={5} required /></div>
          <Button type="submit" className="w-full bg-gradient-brand text-primary-foreground hover:opacity-90" disabled={sent}>
            {sent ? "Gönderildi" : "Gönder"}
          </Button>
        </form>
      </section>
    </SiteShell>
  );
}
