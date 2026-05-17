"use client";

import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import { getMyAnalytics } from "@/lib/api";
import type { AnalyticsResponse } from "@/types/agent";

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const d = await getMyAnalytics();
        if (!active) return;
        setData(d);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Yüklenemedi");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div>
      <div className="animate-rise">
        <p className="text-eyebrow">Kampanya performansı</p>
        <h1 className="font-display text-5xl md:text-6xl mt-3 leading-[1.05]">
          İstatis<span className="italic text-gradient">tik</span>
        </h1>
        <p className="text-muted-foreground mt-3 max-w-md">
          Erişim, etkileşim ve satış etkisi — zamanla nasıl büyüyorsun.
        </p>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 text-red-700 text-sm p-3 whitespace-pre-wrap">
          {error}
        </div>
      )}
      {loading && <div className="text-sm text-muted-foreground mt-6">Yükleniyor...</div>}

      {data && (
        <>
          <div className="grid sm:grid-cols-3 gap-4 mt-6">
            <Stat label="Toplam erişim" value={fmtNumber(data.total_views)} />
            <Stat
              label="Ortalama etkileşim"
              value={`%${(data.average_engagement * 100).toFixed(1)}`}
            />
            <Stat
              label="Tahmini satış etkisi"
              value={`+%${data.estimated_sales_lift_pct.toFixed(1)}`}
            />
          </div>

          {data.monthly.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
              Henüz veri yok. Influencer'sın eğer post seed'i yüklendiyse buraya gelecek.
            </div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-6 mt-6">
              <Chart title="Erişim (aylık)">
                <ResponsiveContainer>
                  <AreaChart data={data.monthly}>
                    <defs>
                      <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="oklch(0.65 0.26 350)" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="oklch(0.65 0.26 350)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.93 0.01 320)" />
                    <XAxis dataKey="month" stroke="oklch(0.5 0.03 310)" fontSize={12} />
                    <YAxis stroke="oklch(0.5 0.03 310)" fontSize={12} />
                    <Tooltip
                      contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.93 0.01 320)" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="views"
                      stroke="oklch(0.65 0.26 350)"
                      strokeWidth={2}
                      fill="url(#g1)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Chart>
              <Chart title="Etkileşim oranı (%)">
                <ResponsiveContainer>
                  <BarChart data={data.monthly}>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.93 0.01 320)" />
                    <XAxis dataKey="month" stroke="oklch(0.5 0.03 310)" fontSize={12} />
                    <YAxis stroke="oklch(0.5 0.03 310)" fontSize={12} />
                    <Tooltip
                      contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.93 0.01 320)" }}
                    />
                    <Bar
                      dataKey="engagement"
                      fill="oklch(0.62 0.24 300)"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Chart>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="surface-glass-strong surface-hairline rounded-3xl p-6 animate-rise">
      <div className="text-eyebrow">{label}</div>
      <div className="font-display text-4xl mt-2 leading-none tracking-tight">{value}</div>
    </div>
  );
}

function Chart({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="surface-glass-strong surface-hairline rounded-3xl p-6 animate-rise">
      <h3 className="font-display text-xl mb-4 tracking-tight">{title}</h3>
      <div className="h-64">{children}</div>
    </div>
  );
}

function fmtNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString("tr-TR");
}
