import { Link } from "@tanstack/react-router";
import { Sparkles, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const nav = [
  { to: "/how-it-works", label: "Nasıl Çalışır" },
  { to: "/for-influencers", label: "Influencer'lar" },
  { to: "/for-businesses", label: "İşletmeler" },
  { to: "/discover", label: "Keşfet" },
  { to: "/pricing", label: "Fiyatlar" },
] as const;

export function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/70 border-b border-border/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-semibold text-lg">
          <span className="grid place-items-center w-8 h-8 rounded-xl bg-gradient-brand text-primary-foreground shadow-[var(--shadow-glow)]">
            <Sparkles className="w-4 h-4" />
          </span>
          <span>InfluMatch</span>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg"
              activeProps={{ className: "text-foreground font-medium" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="hidden md:flex items-center gap-2">
          <Button asChild variant="ghost" size="sm"><Link to="/auth/login">Giriş</Link></Button>
          <Button asChild size="sm" className="bg-gradient-brand text-primary-foreground hover:opacity-90">
            <Link to="/auth/register">Üye Ol</Link>
          </Button>
        </div>
        <button className="md:hidden p-2" onClick={() => setOpen(!open)} aria-label="Menü">
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t border-border/60 bg-background">
          <div className="px-4 py-3 flex flex-col gap-1">
            {nav.map((n) => (
              <Link key={n.to} to={n.to} className="py-2 text-sm" onClick={() => setOpen(false)}>{n.label}</Link>
            ))}
            <div className="flex gap-2 pt-2">
              <Button asChild variant="outline" size="sm" className="flex-1"><Link to="/auth/login">Giriş</Link></Button>
              <Button asChild size="sm" className="flex-1 bg-gradient-brand text-primary-foreground"><Link to="/auth/register">Üye Ol</Link></Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
