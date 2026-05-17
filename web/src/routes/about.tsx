import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Hakkımızda — InfluMatch" },
      { name: "description", content: "InfluMatch'in misyonu ve kurucu ekibi." },
    ],
  }),
  component: About,
});

const team = [
  { name: "Ada Yılmaz", role: "Kurucu & CEO", img: "https://i.pravatar.cc/300?u=ada" },
  { name: "Kerem Öztürk", role: "CTO", img: "https://i.pravatar.cc/300?u=kerem" },
  { name: "Lale Karaca", role: "Tasarım Lideri", img: "https://i.pravatar.cc/300?u=lale" },
  { name: "Onur Şahin", role: "Büyüme", img: "https://i.pravatar.cc/300?u=onur" },
];

function About() {
  return (
    <SiteShell>
      <section className="mx-auto max-w-4xl px-4 sm:px-6 py-20 text-center">
        <h1 className="text-4xl md:text-5xl font-bold">Yerel hikayeleri <span className="text-gradient">büyütüyoruz</span>.</h1>
        <p className="mt-5 text-lg text-muted-foreground">
          InfluMatch, küçük işletmelerin doğru sesle buluşmasını, içerik üreticilerin de anlamlı işbirlikleri yapmasını sağlamak için kuruldu.
        </p>
      </section>
      <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-24">
        <h2 className="text-2xl font-bold mb-8 text-center">Ekibimiz</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
          {team.map((m) => (
            <div key={m.name} className="rounded-2xl border border-border p-5 bg-card text-center">
              <img src={m.img} alt={m.name} className="w-24 h-24 rounded-full object-cover mx-auto mb-4" />
              <div className="font-semibold">{m.name}</div>
              <div className="text-sm text-muted-foreground">{m.role}</div>
            </div>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
