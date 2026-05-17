import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { matches, influencers, listings } from "@/lib/mock-data";

export default function MatchesPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold">Eşleşmeler</h1>
      <p className="text-muted-foreground mt-1">Karşılıklı beğenilerin.</p>
      <div className="grid gap-3 mt-6">
        {matches.map((m) => {
          const inf = influencers.find((i) => i.id === m.influencerId)!;
          const lst = listings.find((l) => l.id === m.listingId)!;
          return (
            <Link key={m.id} href="/dashboard/messages" className="rounded-2xl border border-border bg-card p-4 flex items-center gap-4 hover:shadow-[var(--shadow-glow)] transition">
              <img src={inf.avatar} alt={inf.name} className="w-14 h-14 rounded-full object-cover" />
              <div className="flex-1 min-w-0">
                <div className="font-semibold">{inf.name} ↔ {lst.business}</div>
                <div className="text-sm text-muted-foreground truncate">{m.lastMessage ?? "Henüz mesaj yok"}</div>
              </div>
              <div className="text-right">
                <Badge variant={m.status === "matched" ? "default" : m.status === "completed" ? "secondary" : "outline"} className={m.status === "matched" ? "bg-gradient-brand text-primary-foreground border-transparent" : ""}>
                  {m.status === "matched" ? "Eşleşti" : m.status === "completed" ? "Tamamlandı" : "Bekliyor"}
                </Badge>
                <div className="text-xs text-muted-foreground mt-1">{m.at}</div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
