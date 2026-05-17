import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/site/SiteShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Sparkles, Users, ArrowLeft, Star, type LucideIcon } from "lucide-react";
import { influencers } from "@/lib/mock-data";
import { ApplyButton } from "./apply-button";

export function generateStaticParams() {
  return influencers.map((i) => ({ id: i.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const i = influencers.find((x) => x.id === id);
  return { title: i ? `${i.name} — Influencer` : "Profil" };
}

export default async function InfluencerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const i = influencers.find((x) => x.id === id);
  if (!i) notFound();

  return (
    <SiteShell>
      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
        <Link href="/influencers" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4 mr-1" /> Profillere dön
        </Link>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <div className="aspect-square rounded-3xl overflow-hidden border border-border">
              <img src={i.avatar} alt={i.name} className="w-full h-full object-cover" />
            </div>
          </div>
          <div className="md:col-span-2">
            <Badge className="bg-gradient-brand text-primary-foreground border-transparent">
              <Sparkles className="w-3 h-3 mr-1" /> AI Seviye: {i.aiLevel}
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold mt-3">{i.name}</h1>
            <div className="text-muted-foreground">{i.handle}</div>
            <div className="mt-2 flex items-center text-sm text-muted-foreground"><MapPin className="w-4 h-4 mr-1" />{i.city}</div>

            <div className="grid grid-cols-3 gap-3 mt-6">
              <Stat icon={Users} label="Takipçi" value={`${(i.followers/1000).toFixed(0)}k`} />
              <Stat icon={Sparkles} label="Etkileşim" value={`${i.engagement}%`} />
              <Stat icon={Star} label="Puan" value={i.rating.toFixed(1)} />
            </div>

            <h3 className="font-semibold mt-8 mb-2">Hakkında</h3>
            <p className="text-muted-foreground">{i.bio}</p>

            <h3 className="font-semibold mt-6 mb-2">Nişler</h3>
            <div className="flex flex-wrap gap-2">
              {i.niches.map((n) => <Badge key={n} variant="secondary">{n}</Badge>)}
            </div>

            <h3 className="font-semibold mt-6 mb-2">Son işbirlikleri</h3>
            <ul className="space-y-2">
              {i.recentWork.map((w) => <li key={w} className="text-sm text-muted-foreground">• {w}</li>)}
            </ul>

            <div className="mt-8 flex gap-3">
              <ApplyButton />
              <Button variant="outline">Kaydet</Button>
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}

function Stat({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border p-3 bg-card">
      <Icon className="w-4 h-4 text-[var(--brand)] mb-1" />
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-semibold">{value}</div>
    </div>
  );
}
