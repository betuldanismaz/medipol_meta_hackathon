import type { InfluencerProfile } from "@/types";

type Props = {
  profile: InfluencerProfile;
};

export default function ProfileCard({ profile }: Props) {
  return (
    <div className="w-80 rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-900 shadow-lg overflow-hidden">
      {/* Avatar */}
      <div className="h-48 bg-linear-to-br from-violet-400 to-indigo-500 flex items-center justify-center">
        <span className="text-7xl">{profile.avatar}</span>
      </div>

      {/* Bilgiler */}
      <div className="p-5 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold leading-tight">{profile.name}</h2>
            <p className="text-sm text-zinc-400">{profile.handle}</p>
          </div>
          <span className="text-xs px-2 py-1 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300 shrink-0 mt-1">
            Influencer
          </span>
        </div>

        <div className="flex flex-wrap gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <span>📍 {profile.location}</span>
          <span>👥 {profile.followers.toLocaleString("tr-TR")}</span>
          <span>⚡ %{profile.engagementRate} etkileşim</span>
          <span>💰 {profile.price.toLocaleString("tr-TR")} TL</span>
        </div>

        <div className="flex flex-wrap gap-1">
          {profile.niches.map((niche) => (
            <span
              key={niche}
              className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
            >
              #{niche}
            </span>
          ))}
        </div>

        <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-snug">{profile.bio}</p>
      </div>
    </div>
  );
}
