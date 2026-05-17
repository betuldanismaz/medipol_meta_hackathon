import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/site/SiteShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, CheckCircle2, ArrowLeft } from "lucide-react";
import { listings } from "@/lib/mock-data";
import { ApplyButton } from "./apply-button";

export function generateStaticParams() {
  return listings.map((l) => ({ id: l.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const l = listings.find((x) => x.id === id);
  return { title: l ? `${l.business} — İlan` : "İlan" };
}

export default async function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const l = listings.find((x) => x.id === id);
  if (!l) notFound();

  return (
    <SiteShell>
      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
        <Link href="/listings" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4 mr-1" /> İlanlara dön
        </Link>
        <div className="rounded-3xl overflow-hidden border border-border">
          <div className="aspect-[21/9]">
            <img src={l.cover} alt={l.business} className="w-full h-full object-cover" />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-8">
          <div className="md:col-span-2">
            <Badge variant="secondary">{l.category}</Badge>
            <h1 className="text-3xl md:text-4xl font-bold mt-3">{l.business}</h1>
            <div className="mt-2 text-muted-foreground flex items-center flex-wrap gap-4 text-sm">
              <span className="flex items-center"><MapPin className="w-4 h-4 mr-1" />{l.district}, {l.city}</span>
              <span className="flex items-center"><Calendar className="w-4 h-4 mr-1" />{l.postedAt}</span>
            </div>
            <h3 className="font-semibold mt-8 mb-2">İlan açıklaması</h3>
            <p className="text-muted-foreground leading-relaxed">{l.description}</p>
            <h3 className="font-semibold mt-8 mb-3">Aranan özellikler</h3>
            <ul className="space-y-2">
              {l.requirements.map((r) => (
                <li key={r} className="flex items-center gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-[var(--brand)]" />{r}</li>
              ))}
            </ul>
          </div>

          <aside className="md:sticky md:top-24 self-start rounded-2xl border border-border p-6 bg-card">
            <div className="text-sm text-muted-foreground">Bütçe</div>
            <div className="text-2xl font-bold text-[var(--brand)] mt-1">{l.budget}</div>
            <ApplyButton />
            <Button variant="outline" className="w-full mt-2">Kaydet</Button>
            <div className="mt-5 text-xs text-muted-foreground">
              İşletme tipi: <span className="text-foreground">{l.businessType}</span>
            </div>
          </aside>
        </div>
      </section>
    </SiteShell>
  );
}
