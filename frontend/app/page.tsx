import { getHealth, type HealthStatus } from "@/lib/api";

export default async function Home() {
  let health: HealthStatus | null = null;
  let error: string | null = null;

  try {
    health = await getHealth();
  } catch (e) {
    error = e instanceof Error ? e.message : "unknown error";
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-3xl font-bold">Medipol Meta Hackathon</h1>
      <p className="text-sm opacity-70">Sosyal Medya YZ Ekosistemi</p>

      <section className="rounded-lg border border-black/10 dark:border-white/10 p-6 min-w-80">
        <h2 className="text-lg font-semibold mb-3">Backend Health</h2>
        {health ? (
          <ul className="space-y-1 font-mono text-sm">
            <li>status: <span className="text-green-600">{health.status}</span></li>
            <li>db: <span className={health.db === "ok" ? "text-green-600" : "text-red-600"}>{health.db}</span></li>
          </ul>
        ) : (
          <p className="text-red-600 font-mono text-sm">{error}</p>
        )}
      </section>
    </main>
  );
}
