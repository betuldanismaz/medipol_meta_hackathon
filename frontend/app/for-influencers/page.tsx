import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Influencer'lar İçin",
  description: "Geliriniz için doğru markalarla eşleşin. AI seviyelendirme ile uygun fırsatlar.",
};

export default function ForInfluencersPage() {
  return (
    <SiteShell>
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-20 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <Badge variant="secondary" className="mb-4 rounded-full">Influencer Paneli</Badge>
          <h1 className="text-4xl md:text-5xl font-bold">Markaları sen <span className="text-gradient">seç</span>.</h1>
          <p className="mt-5 text-lg text-muted-foreground">
            Mikro takipçiden üst seviyeye, sana uygun ilanlar profiline düşer. Sağa kaydır, başvur, anlaş.
          </p>
          <ul className="mt-6 space-y-3">
            {[
              "Konum ve niş bazlı kişiselleştirilmiş ilanlar",
              "AI seviyendir – uygun bütçedeki fırsatlara odaklan",
              "Kampanya geçmişi ve puanın profilinde",
              "Doğrudan işletmelerle mesajlaş",
            ].map((b) => (
              <li key={b} className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-[var(--brand)] mt-0.5" />{b}</li>
            ))}
          </ul>
          <div className="mt-8 flex gap-3">
            <Button asChild size="lg" className="bg-gradient-brand text-primary-foreground"><Link href="/auth/register">Influencer Olarak Katıl</Link></Button>
            <Button asChild size="lg" variant="outline"><Link href="/listings">İlanları Gör</Link></Button>
          </div>
        </div>
        <div className="aspect-square rounded-2xl overflow-hidden border border-border shadow-sm">
          <div className="w-full h-full bg-card overflow-hidden">
            <img src="https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=900" alt="Influencer" className="w-full h-full object-cover" />
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
