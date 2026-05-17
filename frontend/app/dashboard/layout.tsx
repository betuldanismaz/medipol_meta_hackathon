"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, LayoutDashboard, Heart, MessageSquare, User, BarChart3, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/dashboard", label: "Özet", icon: LayoutDashboard, exact: true },
  { to: "/dashboard/matches", label: "Eşleşmeler", icon: Heart, exact: false },
  { to: "/dashboard/messages", label: "Mesajlar", icon: MessageSquare, exact: false },
  { to: "/dashboard/analytics", label: "İstatistik", icon: BarChart3, exact: false },
  { to: "/dashboard/profile", label: "Profil", icon: User, exact: false },
] as const;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = (to: string, exact: boolean) =>
    exact ? pathname === to : pathname === to || pathname.startsWith(to + "/");

  return (
    <div className="min-h-screen flex">
      <aside className="hidden md:flex w-64 border-r border-border bg-card flex-col">
        <Link href="/" className="flex items-center gap-2 font-semibold px-6 h-16 border-b border-border">
          <span className="grid place-items-center w-8 h-8 rounded-xl bg-gradient-brand text-primary-foreground">
            <Sparkles className="w-4 h-4" />
          </span>
          InfluMatch
        </Link>
        <nav className="flex-1 p-3 space-y-1">
          {nav.map((n) => {
            const active = isActive(n.to, n.exact);
            return (
              <Link
                key={n.to}
                href={n.to}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition",
                  active
                    ? "bg-accent text-foreground font-medium"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                <n.icon className="w-4 h-4" /> {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-border">
          <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-accent">
            <LogOut className="w-4 h-4" /> Çıkış
          </Link>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden h-14 border-b border-border flex items-center px-4 gap-3 overflow-x-auto">
          {nav.map((n) => {
            const active = isActive(n.to, n.exact);
            return (
              <Link
                key={n.to}
                href={n.to}
                className={cn(
                  "text-xs whitespace-nowrap px-3 py-1.5 rounded-full border",
                  active
                    ? "bg-gradient-brand text-primary-foreground border-transparent"
                    : "border-border",
                )}
              >
                {n.label}
              </Link>
            );
          })}
        </header>
        <main className="flex-1 p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
