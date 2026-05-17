import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 grid gap-8 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 font-semibold">
            <span className="grid place-items-center w-7 h-7 rounded-lg bg-gradient-brand text-primary-foreground">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
            InfluMatch
          </div>
          <p className="mt-3 text-sm text-muted-foreground max-w-xs">
            Influencer'ları ve yerel işletmeleri AI destekli, konum bazlı eşleştiriyoruz.
          </p>
        </div>
        <FooterCol title="Ürün" links={[["/how-it-works","Nasıl Çalışır"],["/discover","Keşfet"],["/pricing","Fiyatlar"]]} />
        <FooterCol title="Kullanıcılar" links={[["/for-influencers","Influencer'lar"],["/for-businesses","İşletmeler"],["/listings","İlanlar"]]} />
        <FooterCol title="Şirket" links={[["/about","Hakkımızda"],["/contact","İletişim"]]} />
      </div>
      <div className="border-t border-border/60 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} InfluMatch. Tüm hakları saklıdır.
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h4 className="text-sm font-semibold mb-3">{title}</h4>
      <ul className="space-y-2">
        {links.map(([to, label]) => (
          <li key={to}>
            <Link to={to} className="text-sm text-muted-foreground hover:text-foreground">{label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
