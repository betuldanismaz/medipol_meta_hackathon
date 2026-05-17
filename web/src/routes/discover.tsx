import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, X, MapPin, Sparkles, Users, RotateCcw } from "lucide-react";
import { influencers } from "@/lib/mock-data";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export const Route = createFileRoute("/discover")({
  head: () => ({
    meta: [
      { title: "Keşfet — InfluMatch" },
      { name: "description", content: "Tinder tarzı swipe ile influencer'ları keşfet." },
    ],
  }),
  component: Discover,
});

function Discover() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1 | 0>(0);
  const current = influencers[index];
  const next = influencers[index + 1];

  const swipe = (dir: 1 | -1) => {
    setDirection(dir);
    if (dir === 1) toast.success(`${current.name} ile beğeni gönderildi!`);
    setTimeout(() => {
      setIndex((i) => i + 1);
      setDirection(0);
    }, 250);
  };

  const reset = () => setIndex(0);

  return (
    <SiteShell>
      <section className="mx-auto max-w-2xl px-4 sm:px-6 py-10">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold">Keşfet</h1>
          <p className="text-sm text-muted-foreground mt-1">Sağa kaydır beğen, sola kaydır geç.</p>
        </div>

        <div className="relative h-[560px]">
          {!current ? (
            <div className="absolute inset-0 grid place-items-center rounded-3xl border border-border bg-card text-center p-8">
              <div>
                <Sparkles className="w-10 h-10 text-[var(--brand)] mx-auto mb-3" />
                <h3 className="text-xl font-semibold">Hepsi bu kadar!</h3>
                <p className="text-sm text-muted-foreground mt-2">Yarın yeni eşleşmeler için tekrar gel.</p>
                <Button onClick={reset} className="mt-5" variant="outline"><RotateCcw className="w-4 h-4 mr-2" />Baştan başla</Button>
              </div>
            </div>
          ) : (
            <>
              {next && <Card inf={next} stacked />}
              <AnimatePresence>
                <motion.div
                  key={current.id}
                  className="absolute inset-0"
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1, x: direction * 600, rotate: direction * 20 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  onDragEnd={(_, info) => {
                    if (info.offset.x > 120) swipe(1);
                    else if (info.offset.x < -120) swipe(-1);
                  }}
                >
                  <Card inf={current} />
                </motion.div>
              </AnimatePresence>
            </>
          )}
        </div>

        {current && (
          <div className="mt-6 flex justify-center gap-4">
            <button onClick={() => swipe(-1)} className="w-14 h-14 grid place-items-center rounded-full bg-card border border-border shadow-md hover:bg-destructive hover:text-destructive-foreground transition">
              <X className="w-6 h-6" />
            </button>
            <button onClick={() => swipe(1)} className="w-14 h-14 grid place-items-center rounded-full bg-gradient-brand text-primary-foreground shadow-[var(--shadow-glow)] hover:scale-105 transition">
              <Heart className="w-6 h-6 fill-current" />
            </button>
          </div>
        )}

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <Link to="/listings" className="underline">Bunun yerine ilanlara göz at</Link>
        </div>
      </section>
    </SiteShell>
  );
}

function Card({ inf, stacked = false }: { inf: typeof influencers[number]; stacked?: boolean }) {
  return (
    <div
      className="absolute inset-0 rounded-3xl overflow-hidden bg-card border border-border shadow-[var(--shadow-glow)]"
      style={stacked ? { transform: "scale(0.95) translateY(20px)", opacity: 0.6 } : undefined}
    >
      <div className="relative h-3/5">
        <img src={inf.avatar} alt={inf.name} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
        <Badge className="absolute top-4 left-4 bg-background/90 text-foreground backdrop-blur">
          <Sparkles className="w-3 h-3 mr-1" /> AI: {inf.aiLevel}
        </Badge>
        <div className="absolute bottom-5 left-5 right-5 text-white">
          <div className="text-3xl font-bold">{inf.name}</div>
          <div className="opacity-80 text-sm">{inf.handle}</div>
          <div className="flex items-center text-sm mt-1 opacity-90"><MapPin className="w-3 h-3 mr-1" />{inf.city}</div>
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1"><Users className="w-4 h-4 text-[var(--brand)]" /><b>{(inf.followers/1000).toFixed(0)}k</b> takipçi</div>
          <div><b>{inf.engagement}%</b> etkileşim</div>
          <div>⭐ {inf.rating}</div>
        </div>
        <div className="flex flex-wrap gap-1.5 my-3">
          {inf.niches.map((n) => <Badge key={n} variant="secondary">{n}</Badge>)}
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">{inf.bio}</p>
      </div>
    </div>
  );
}
