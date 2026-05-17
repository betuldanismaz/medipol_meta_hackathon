import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";
import { Sparkles, Heart, MessageSquare, BarChart3, Shield, MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "Nasıl Çalışır",
  description: "Swipe akışı, AI eşleştirme ve karşılıklı değerlendirme nasıl işliyor?",
};

const steps = [
  { icon: Sparkles, t: "AI önerileri", d: "Geçmiş işlerin, nişin ve konumun analiz edilerek sana en uygun ilanlar / influencer'lar sıralanır." },
  { icon: Heart, t: "Tinder tarzı swipe", d: "Sağa kaydır beğen, sola kaydır geç. Karşılıklı beğeni eşleşmeyi açar." },
  { icon: MessageSquare, t: "Doğrudan mesajlaşma", d: "Eşleşme açıldığında doğrudan iletişime geç, brief'i paylaş, anlaş." },
  { icon: BarChart3, t: "Performans takibi", d: "Kampanya sonrası izlenme, etkileşim ve satış etkisini dashboard'dan izle." },
  { icon: Shield, t: "Karşılıklı değerlendirme", d: "Hem işletme hem influencer puanlanır. Topluluk güveni böyle korunur." },
  { icon: MapPin, t: "Konum bazlı eşleşme", d: "Şehir ve semt bazında filtrele. Seyahatte de yerel önerilerden faydalan." },
];

export default function HowItWorksPage() {
  return (
    <SiteShell>
      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-20 text-center">
        <h1 className="text-4xl md:text-5xl font-bold">Nasıl <span className="text-gradient">çalışır</span>?</h1>
        <p className="mt-5 text-lg text-muted-foreground max-w-2xl mx-auto">
          InfluMatch, kariyer ilan platformu mantığını swipe deneyimiyle birleştirir. Aşağıda akışın tamamı.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-16 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {steps.map((s, i) => (
          <div key={i} className="rounded-2xl border border-border p-6 bg-card">
            <div className="w-11 h-11 rounded-xl bg-gradient-brand text-primary-foreground grid place-items-center mb-4">
              <s.icon className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-lg">{s.t}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-5xl px-4 sm:px-6 pb-24">
        <div className="rounded-2xl border border-border p-8 md:p-12 bg-card">
          <h2 className="text-2xl md:text-3xl font-bold">AI eşleşme nasıl çalışır?</h2>
          <div className="mt-6 grid md:grid-cols-2 gap-6 text-sm">
            <div>
              <div className="font-semibold mb-2">Influencer seviyelendirme</div>
              <p className="text-muted-foreground">Geçmiş kampanyalar, ortalama etkileşim oranı ve niş tutarlılığına göre Mikro / Orta / Üst etiketi verilir.</p>
            </div>
            <div>
              <div className="font-semibold mb-2">İşletme uyumu</div>
              <p className="text-muted-foreground">İşletmenin kategorisi, hedef bütçesi ve geçmiş influencer profillerine göre öneri puanı hesaplanır.</p>
            </div>
            <div>
              <div className="font-semibold mb-2">Konum bazlı öneri</div>
              <p className="text-muted-foreground">Şehir ve semt eşleşmesinin yanı sıra seyahat planlarına göre yerel öneriler.</p>
            </div>
            <div>
              <div className="font-semibold mb-2">Çift taraflı güven</div>
              <p className="text-muted-foreground">Tamamlanan her iş sonrası iki taraf birbirini değerlendirir; ortalama puan profilde gösterilir.</p>
            </div>
          </div>
          <div className="mt-8">
            <Button asChild className="bg-gradient-brand text-primary-foreground hover:opacity-90">
              <Link href="/auth/register">Hesap Aç</Link>
            </Button>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
