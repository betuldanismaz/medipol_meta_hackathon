import Link from "next/link";
import { getHealth, type HealthStatus } from "@/lib/api";

async function fetchHealth(): Promise<{ data: HealthStatus | null; error: string | null }> {
  try {
    const data = await getHealth();
    return { data, error: null };
  } catch (e) {
    return { data: null, error: e instanceof Error ? e.message : "unknown error" };
  }
}

export default async function DashboardHomePage() {
  const { data: health, error } = await fetchHealth();
  const dbOk = health?.db === "ok";
  const apiOk = health?.status === "ok";

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
          <Link href="/discover" className="inline-block bg-gradient-brand text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90">
            Keşfet
          </Link>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Backend Bağlantısı</h3>
          <span
            className={`inline-flex items-center gap-2 text-xs font-medium px-2.5 py-1 rounded-full ${
              health ? "bg-green-500/15 text-green-700 dark:text-green-400" : "bg-red-500/15 text-red-700 dark:text-red-400"
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${health ? "bg-green-500" : "bg-red-500"}`} />
            {health ? "Çevrimiçi" : "Erişilemiyor"}
          </span>
        </div>
        {health ? (
          <ul className="mt-4 grid sm:grid-cols-2 gap-2 text-sm font-mono">
            <li className="flex justify-between border border-border rounded-lg px-3 py-2">
              <span className="text-muted-foreground">api.status</span>
              <span className={apiOk ? "text-green-600" : "text-red-600"}>{health.status}</span>
            </li>
            <li className="flex justify-between border border-border rounded-lg px-3 py-2">
              <span className="text-muted-foreground">db.status</span>
              <span className={dbOk ? "text-green-600" : "text-red-600"}>{health.db}</span>
            </li>
          </ul>
        ) : (
          <p className="mt-4 text-sm text-red-600 font-mono">{error ?? "unknown error"}</p>
        )}
      </div>
    </div>
  );
}
