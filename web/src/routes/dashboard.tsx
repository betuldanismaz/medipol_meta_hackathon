import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { Sparkles, LayoutDashboard, Heart, MessageSquare, User, BarChart3, LogOut } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — InfluMatch" }] }),
  component: DashboardLayout,
});

const nav = [
  { to: "/dashboard", label: "Özet", icon: LayoutDashboard, exact: true },
  { to: "/dashboard/matches", label: "Eşleşmeler", icon: Heart, exact: false },
  { to: "/dashboard/messages", label: "Mesajlar", icon: MessageSquare, exact: false },
  { to: "/dashboard/analytics", label: "İstatistik", icon: BarChart3, exact: false },
  { to: "/dashboard/profile", label: "Profil", icon: User, exact: false },
] as const;

function DashboardLayout() {
  const loc = useLocation();
  const isRoot = loc.pathname === "/dashboard" || loc.pathname === "/dashboard/";
  return (
    <div className="min-h-screen flex">
      <aside className="hidden md:flex w-64 border-r border-border bg-card flex-col">
        <Link to="/" className="flex items-center gap-2 font-semibold px-6 h-16 border-b border-border">
          <span className="grid place-items-center w-8 h-8 rounded-xl bg-gradient-brand text-primary-foreground">
            <Sparkles className="w-4 h-4" />
          </span>
          InfluMatch
        </Link>
        <nav className="flex-1 p-3 space-y-1">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: n.exact }}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition"
              activeProps={{ className: "bg-accent text-foreground font-medium" }}
            >
              <n.icon className="w-4 h-4" /> {n.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-border">
          <Link to="/" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-accent">
            <LogOut className="w-4 h-4" /> Çıkış
          </Link>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden h-14 border-b border-border flex items-center px-4 gap-3 overflow-x-auto">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} activeOptions={{ exact: n.exact }}
              className="text-xs whitespace-nowrap px-3 py-1.5 rounded-full border border-border"
              activeProps={{ className: "bg-gradient-brand text-primary-foreground border-transparent" }}>
              {n.label}
            </Link>
          ))}
        </header>
        <main className="flex-1 p-6 md:p-8">
          {isRoot ? <DashboardHome /> : <Outlet />}
        </main>
      </div>
    </div>
  );
}

function DashboardHome() {
  return (
    <div>
      <h1 className="text-3xl font-bold">Merhaba 👋</h1>
      <p className="text-muted-foreground mt-1">Bugünkü eşleşme aktiviten.</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        {[
          { l: "Aktif Eşleşme", v: "12", c: "bg-gradient-brand text-primary-foreground" },
          { l: "Bu hafta swipe", v: "84" },
          { l: "Bekleyen Başvuru", v: "5" },
          { l: "Ortalama Puan", v: "4.8 ⭐" },
        ].map((s) => (
          <div key={s.l} className={`rounded-2xl border border-border p-5 ${s.c ?? "bg-card"}`}>
            <div className="text-sm opacity-80">{s.l}</div>
            <div className="text-3xl font-bold mt-2">{s.v}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mt-8">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="font-semibold mb-4">Son aktivite</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex justify-between"><span>Zeynep Aydın seni beğendi</span><span className="text-muted-foreground">2 saat</span></li>
            <li className="flex justify-between"><span>Moda Kahve ile eşleştin</span><span className="text-muted-foreground">5 saat</span></li>
            <li className="flex justify-between"><span>Yeni mesaj: Alsancak Atölye</span><span className="text-muted-foreground">dün</span></li>
          </ul>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="font-semibold mb-2">Hızlı eylem</h3>
          <p className="text-sm text-muted-foreground mb-4">Yeni eşleşmeler için keşfetmeye devam et.</p>
          <Link to="/discover" className="inline-block bg-gradient-brand text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90">
            Keşfet
          </Link>
        </div>
      </div>
    </div>
  );
}
