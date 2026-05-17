"use client";

import { analytics } from "@/lib/mock-data";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from "recharts";

export default function AnalyticsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold">İstatistik</h1>
      <p className="text-muted-foreground mt-1">Kampanya etkinlik özetin.</p>

      <div className="grid sm:grid-cols-3 gap-4 mt-6">
        {[
          { l: "Toplam izlenme", v: "157K" },
          { l: "Ortalama etkileşim", v: "%5.9" },
          { l: "Satış etkisi", v: "+24%" },
        ].map((s) => (
          <div key={s.l} className="rounded-2xl border border-border bg-card p-5">
            <div className="text-sm text-muted-foreground">{s.l}</div>
            <div className="text-3xl font-bold mt-2">{s.v}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mt-6">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="font-semibold mb-4">İzlenme (aylık)</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <AreaChart data={analytics}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.65 0.26 350)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="oklch(0.65 0.26 350)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.93 0.01 320)" />
                <XAxis dataKey="month" stroke="oklch(0.5 0.03 310)" fontSize={12} />
                <YAxis stroke="oklch(0.5 0.03 310)" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.93 0.01 320)" }} />
                <Area type="monotone" dataKey="views" stroke="oklch(0.65 0.26 350)" strokeWidth={2} fill="url(#g1)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="font-semibold mb-4">Etkileşim oranı (%)</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={analytics}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.93 0.01 320)" />
                <XAxis dataKey="month" stroke="oklch(0.5 0.03 310)" fontSize={12} />
                <YAxis stroke="oklch(0.5 0.03 310)" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.93 0.01 320)" }} />
                <Bar dataKey="engagement" fill="oklch(0.62 0.24 300)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
