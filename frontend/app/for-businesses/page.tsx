import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "İşletmeler İçin — InfluMatch",
  description: "Kafe, butik veya yerel dükkan; doğru influencer'ı saniyeler içinde bul.",
};

export default function ForBusinessesPage() {
  return (
    <SiteShell>
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-20 grid lg:grid-cols-2 gap-12 items-center">
        <div className="order-2 lg:order-1 aspect-square rounded-3xl bg-gradient-brand p-1 shadow-[var(--shadow-glow)]">
          <div className="w-full h-full rounded-[calc(1.5rem-4px)] bg-card overflow-hidden">
            <img src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=900" alt="Kafe" className="w-full h-full object-cover" />
          </div>
        </div>
        <div className="order-1 lg:order-2">
          <Badge variant="secondary" className="mb-4 rounded-full">İşletme Paneli</Badge>
          <h1 className="text-4xl md:text-5xl font-bold">Doğru sesi <span className="text-gradient">bulun</span>.</h1>
          <p className="mt-5 text-lg text-muted-foreground">
            İlan verin, kriterlerinizi seçin, başvuran influencer'ları kaydırarak değerlendirin.
          </p>
          <ul className="mt-6 space-y-3">
            {[
              "Niş, konum, takipçi aralığına göre filtreleme",
              "AI puanı ile influencer'ın size uyumu",
              "Kampanya etkisi: izlenme, etkileşim, satış",
              "Daha önce çalıştığı işletmelerin yorumları",
            ].map((b) => (
              <li key={b} className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-[var(--brand)] mt-0.5" />{b}</li>
            ))}
          </ul>
          <div className="mt-8 flex gap-3">
            <Button asChild size="lg" className="bg-gradient-brand text-primary-foreground"><Link href="/auth/register">İşletme Olarak Katıl</Link></Button>
            <Button asChild size="lg" variant="outline"><Link href="/influencers">Influencer'ları Gör</Link></Button>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
