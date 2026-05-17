import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MapPin, Search, Sparkles, Users } from "lucide-react";
import { influencers } from "@/lib/mock-data";
import { useState, useMemo } from "react";

export const Route = createFileRoute("/influencers")({
  head: () => ({
    meta: [
      { title: "Influencer'lar — InfluMatch" },
      { name: "description", content: "Konum, niş ve takipçi sayısına göre influencer ara." },
    ],
  }),
  component: InfluencersPage,
});

const levels = ["Tümü", "Mikro", "Orta", "Üst"];

function InfluencersPage() {
  const [q, setQ] = useState("");
  const [lvl, setLvl] = useState("Tümü");
  const filtered = useMemo(() => influencers.filter((i) =>
    (lvl === "Tümü" || i.aiLevel === lvl) &&
    (q === "" || (i.name + i.handle + i.city + i.niches.join(" ")).toLowerCase().includes(q.toLowerCase()))
  ), [q, lvl]);

  return (
    <SiteShell>
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Influencer'lar</h1>
          <p className="text-muted-foreground mt-1">{filtered.length} profil</p>
        </div>
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="İsim, şehir, niş..." className="pl-9" />
          </div>
          <div className="flex gap-2">
            {levels.map((c) => (
              <button
                key={c}
                onClick={() => setLvl(c)}
                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap border transition ${lvl === c ? "bg-gradient-brand text-primary-foreground border-transparent" : "border-border bg-card hover:bg-accent"}`}
              >
                {c !== "Tümü" && <Sparkles className="w-3 h-3 inline mr-1" />}{c}
              </button>
            ))}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((i) => (
            <Link key={i.id} to="/influencers/$id" params={{ id: i.id }} className="group rounded-2xl border border-border overflow-hidden bg-card hover:shadow-[var(--shadow-glow)] transition">
              <div className="aspect-[4/3] relative overflow-hidden">
                <img src={i.avatar} alt={i.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <Badge className="absolute top-3 left-3 bg-background/90 text-foreground backdrop-blur">
                  <Sparkles className="w-3 h-3 mr-1" /> {i.aiLevel}
                </Badge>
              </div>
              <div className="p-5">
                <h3 className="font-semibold">{i.name}</h3>
                <div className="text-xs text-muted-foreground">{i.handle}</div>
                <div className="flex items-center text-sm text-muted-foreground mt-1"><MapPin className="w-3 h-3 mr-1" />{i.city}</div>
                <div className="flex items-center gap-3 text-sm mt-3">
                  <span className="flex items-center gap-1"><Users className="w-3 h-3 text-[var(--brand)]" />{(i.followers/1000).toFixed(0)}k</span>
                  <span>⭐ {i.rating}</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-3">
                  {i.niches.map((n) => <Badge key={n} variant="secondary" className="text-xs">{n}</Badge>)}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
