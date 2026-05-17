"use client";

import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-muted/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 grid gap-10 md:grid-cols-4">
        <div>
          <Link href="/" className="flex items-center gap-2.5 font-semibold">
            <Image src="/logo.svg" alt="InfluMatch logo" width={28} height={28} className="rounded-lg" />
            <span>InfluMatch</span>
          </Link>
          <p className="mt-3 text-sm text-muted-foreground max-w-xs leading-relaxed">
            Influencer'ları ve yerel işletmeleri AI destekli, konum bazlı eşleştiriyoruz.
          </p>
        </div>
        <FooterCol
          title="Ürün"
          links={[
            ["/how-it-works", "Nasıl Çalışır"],
            ["/discover", "Keşfet"],
            ["/pricing", "Fiyatlar"],
            ["/matchfluence", "AI Eşleştirme"],
          ]}
        />
        <FooterCol
          title="Kullanıcılar"
          links={[
            ["/for-influencers", "Influencer'lar"],
            ["/for-businesses", "İşletmeler"],
            ["/listings", "İlanlar"],
          ]}
        />
        <FooterCol
          title="Şirket"
          links={[
            ["/about", "Hakkımızda"],
            ["/contact", "İletişim"],
          ]}
        />
      </div>
      <div className="border-t border-border/50 py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} InfluMatch. Tüm hakları saklıdır.
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h4 className="text-sm font-semibold mb-4">{title}</h4>
      <ul className="space-y-2.5">
        {links.map(([to, label]) => (
          <li key={to}>
            <Link href={to} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
