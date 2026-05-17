"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Heart,
  MessageSquare,
  User,
  BarChart3,
  LogOut,
  Bot,
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { clearAuth } from "@/lib/auth-storage";

const nav = [
  { to: "/dashboard", label: "Özet", icon: LayoutDashboard, exact: true },
  { to: "/dashboard/matches", label: "Eşleşmeler", icon: Heart, exact: false },
  { to: "/dashboard/negotiations", label: "Agent Inbox", icon: Bot, exact: false },
  { to: "/dashboard/messages", label: "Mesajlar", icon: MessageSquare, exact: false },
  { to: "/dashboard/analytics", label: "İstatistik", icon: BarChart3, exact: false },
  { to: "/dashboard/profile", label: "Profil", icon: User, exact: false },
  { to: "/dashboard/billing", label: "Premium", icon: CreditCard, exact: false },
] as const;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isActive = (to: string, exact: boolean) =>
    exact ? pathname === to : pathname === to || pathname.startsWith(to + "/");

  const handleLogout = () => {
    clearAuth();
    router.push("/");
    router.refresh();
  };

  return (
    <div className="aurora-stage min-h-screen text-foreground">
      {/* Atmospheric backdrop — sits behind everything */}
      <div aria-hidden className="aurora-bg" />
      <div aria-hidden className="aurora-grain" />

      <div className="relative z-10 flex min-h-screen">
        {/* ─── Desktop sidebar ─── */}
        <aside className="hidden md:flex w-72 flex-col shrink-0 px-4 py-5">
          <div className="surface-glass-strong surface-hairline rounded-3xl flex flex-col h-full overflow-hidden">
            {/* Brand */}
            <Link
              href="/"
              className="flex items-center gap-3 px-5 pt-6 pb-5 group"
            >
              <Image
                src="/Logo.png"
                alt="InfluMatch"
                width={40}
                height={40}
                className="object-contain"
              />
              <div className="flex flex-col leading-tight">
                <span className="font-display text-xl tracking-tight">
                  Influ<span className="italic">Match</span>
                </span>
                <span className="text-eyebrow !text-[0.625rem]">
                  Beta
                </span>
              </div>
            </Link>

            <div className="px-5">
              <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
              <p className="px-3 mb-2 text-eyebrow">Çalışma alanı</p>
              {nav.map((n) => {
                const active = isActive(n.to, n.exact);
                return (
                  <Link
                    key={n.to}
                    href={n.to}
                    className={cn(
                      "group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-300",
                      active
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {/* Active rail */}
                    <span
                      className={cn(
                        "absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-full transition-all duration-300",
                        active
                          ? "bg-gradient-to-b from-[var(--brand)] via-[var(--brand-2)] to-[var(--brand-3)] opacity-100 shadow-[0_0_12px_var(--brand)]"
                          : "opacity-0"
                      )}
                    />
                    {/* Hover/active surface */}
                    <span
                      className={cn(
                        "absolute inset-0 rounded-xl transition-opacity duration-300",
                        active
                          ? "opacity-100 bg-gradient-to-r from-[oklch(0.66_0.26_350/0.10)] to-transparent"
                          : "opacity-0 group-hover:opacity-100 bg-[oklch(0_0_0/0.03)] dark:bg-[oklch(1_0_0/0.04)]"
                      )}
                    />
                    <n.icon
                      className={cn(
                        "relative w-4 h-4 transition-colors",
                        active ? "text-[var(--brand)]" : ""
                      )}
                      strokeWidth={active ? 2.2 : 1.7}
                    />
                    <span
                      className={cn(
                        "relative flex-1",
                        active
                          ? "font-display text-base italic tracking-tight"
                          : "font-medium"
                      )}
                    >
                      {n.label}
                    </span>
                    {active && (
                      <span className="relative inline-flex items-center justify-center w-1.5 h-1.5 rounded-full bg-[var(--brand)] glow-dot" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Profile pill */}
            <div className="px-3 pb-4">
              <div className="rounded-2xl p-3 surface-glass surface-hairline">
                <div className="flex items-center gap-3">
                  <div className="relative w-9 h-9 rounded-full bg-gradient-brand p-px shrink-0">
                    <div className="w-full h-full rounded-full bg-card grid place-items-center text-sm font-medium">
                      D
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">
                      Demo Kullanıcı
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      @demouser
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    aria-label="Çıkış"
                    className="grid place-items-center w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-[oklch(0_0_0/0.05)] dark:hover:bg-[oklch(1_0_0/0.05)] transition"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* ─── Main column ─── */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile chip nav */}
          <header className="md:hidden sticky top-0 z-20 border-b border-border/60 backdrop-blur-xl bg-background/70">
            <div className="flex items-center gap-2 px-4 h-14 overflow-x-auto">
              {nav.map((n) => {
                const active = isActive(n.to, n.exact);
                return (
                  <Link
                    key={n.to}
                    href={n.to}
                    className={cn(
                      "text-xs whitespace-nowrap px-3 py-1.5 rounded-full border transition",
                      active
                        ? "bg-gradient-brand text-primary-foreground border-transparent shadow-[var(--shadow-glow)]"
                        : "border-border bg-card/60 text-muted-foreground"
                    )}
                  >
                    {n.label}
                  </Link>
                );
              })}
              <button
                type="button"
                onClick={handleLogout}
                className="text-xs whitespace-nowrap px-3 py-1.5 rounded-full border border-border text-muted-foreground"
              >
                Çıkış
              </button>
            </div>
          </header>

          <main className="flex-1 p-6 md:p-10 lg:p-12 max-w-[1400px] w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
