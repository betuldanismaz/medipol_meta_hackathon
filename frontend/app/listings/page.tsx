"use client";

import Link from "next/link";
import { SiteShell } from "@/components/site/SiteShell";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MapPin, Search } from "lucide-react";
import { listings } from "@/lib/mock-data";
import { useState, useMemo } from "react";

const cats = ["Tümü", "Kafe", "Moda", "Yemek", "Seyahat", "Teknoloji", "Yaşam Tarzı"];

export default function ListingsPage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("Tümü");
  const filtered = useMemo(() => listings.filter((l) =>
    (cat === "Tümü" || l.category === cat) &&
    (q === "" || (l.business + l.city + l.district).toLowerCase().includes(q.toLowerCase()))
  ), [q, cat]);

  return (
    <SiteShell>
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">İlanlar</h1>
          <p className="text-muted-foreground mt-1">{filtered.length} aktif ilan</p>
        </div>
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="İşletme, şehir veya semt ara..." className="pl-9" />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {cats.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap border transition ${cat === c ? "bg-gradient-brand text-primary-foreground border-transparent" : "border-border bg-card hover:bg-accent"}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((l) => (
            <Link key={l.id} href={`/listings/${l.id}`} className="group rounded-2xl border border-border overflow-hidden bg-card hover:shadow-[var(--shadow-glow)] transition">
              <div className="aspect-[4/3] overflow-hidden">
                <img src={l.cover} alt={l.business} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary">{l.category}</Badge>
                  <span className="text-xs text-muted-foreground">{l.postedAt}</span>
                </div>
                <h3 className="font-semibold text-lg">{l.business}</h3>
                <div className="flex items-center text-sm text-muted-foreground mt-1"><MapPin className="w-3 h-3 mr-1" />{l.district}, {l.city}</div>
                <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{l.description}</p>
                <div className="mt-3 text-sm font-medium text-[var(--brand)]">{l.budget}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
