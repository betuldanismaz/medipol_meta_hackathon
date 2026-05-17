import type { LegacyProfile } from "@/types";

type Props = {
  profile: LegacyProfile;
};

export default function ProfileCard({ profile }: Props) {
  const initials = profile.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="w-80 rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-900 shadow-lg overflow-hidden">
      {/* Avatar */}
      <div className="h-48 bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center">
        {profile.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={profile.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-5xl font-bold text-white">{initials}</span>
        )}
      </div>

      {/* Bilgiler */}
      <div className="p-5 space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold truncate">{profile.name}</h2>
          <span className="text-xs px-2 py-1 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300 shrink-0 ml-2">
            {profile.type === "influencer" ? "Influencer" : "İşletme"}
          </span>
        </div>

        <div className="flex gap-3 text-sm text-zinc-500 dark:text-zinc-400">
          <span>#{profile.niche}</span>
          <span>•</span>
          <span>{profile.city}</span>
          {profile.type === "influencer" && (
            <>
              <span>•</span>
              <span>{profile.followers.toLocaleString("tr-TR")} takipçi</span>
            </>
          )}
        </div>

        <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-snug">{profile.bio}</p>
      </div>
    </div>
  );
}
