"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/discover", label: "Keşfet" },
  { to: "/how-it-works", label: "Nasıl Çalışır" },
  { to: "/pricing", label: "Fiyatlar" },
] as const;

export function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/75 border-b border-border/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between gap-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 font-semibold text-lg shrink-0">
          <Image src="/logo.svg" alt="InfluMatch logo" width={32} height={32} className="rounded-xl" />
          <span className="tracking-tight">InfluMatch</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-0.5">
          {nav.map((n) => {
            const active = pathname === n.to;
            return (
              <Link
                key={n.to}
                href={n.to}
                className={cn(
                  "px-3.5 py-2 text-sm rounded-lg transition-colors",
                  active
                    ? "text-foreground font-medium bg-accent"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/60",
                )}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          <Button asChild variant="ghost" size="sm">
            <Link href="/auth/login">Giriş</Link>
          </Button>
          <Button asChild size="sm" className="bg-gradient-brand text-primary-foreground hover:opacity-90 shadow-sm">
            <Link href="/auth/register">Üye Ol</Link>
          </Button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-accent transition-colors"
          onClick={() => setOpen(!open)}
          aria-label="Menü"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl">
          <div className="px-4 py-4 flex flex-col gap-1">
            {nav.map((n) => (
              <Link
                key={n.to}
                href={n.to}
                className="py-2.5 px-3 text-sm rounded-lg hover:bg-accent transition-colors"
                onClick={() => setOpen(false)}
              >
                {n.label}
              </Link>
            ))}
            <div className="flex gap-2 pt-3 border-t border-border/50 mt-2">
              <Button asChild variant="outline" size="sm" className="flex-1">
                <Link href="/auth/login">Giriş</Link>
              </Button>
              <Button asChild size="sm" className="flex-1 bg-gradient-brand text-primary-foreground">
                <Link href="/auth/register">Üye Ol</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
