"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { getMe, updateMe } from "@/lib/api";
import { setStoredUser } from "@/lib/auth-storage";
import type { AuthUser } from "@/types/agent";

function fallbackAvatar(seed: string | number): string {
  return `https://i.pravatar.cc/240?u=${seed}`;
}

export default function ProfilePage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const me = await getMe();
        if (!active) return;
        setUser(me);
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

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;
    setSaving(true);
    const fd = new FormData(event.currentTarget);
    try {
      const updated = await updateMe({
        display_name: String(fd.get("name") || user.display_name),
        city: String(fd.get("city") || "") || undefined,
        bio: String(fd.get("bio") || "") || undefined,
      });
      setUser(updated);
      setStoredUser(updated);
      toast.success("Profil güncellendi.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Güncellenemedi");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-muted-foreground text-sm">Yükleniyor...</div>;
  }

  if (error || !user) {
    return (
      <div className="text-red-600 text-sm whitespace-pre-wrap">{error ?? "Profil yüklenemedi."}</div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="animate-rise">
        <p className="text-eyebrow">Hesap</p>
        <h1 className="font-display text-5xl md:text-6xl mt-3 leading-[1.05]">
          Pro<span className="italic text-gradient">fil</span>
        </h1>
        <p className="text-muted-foreground mt-3">Hesap bilgilerini güncelle.</p>
      </div>

      <form
        onSubmit={onSubmit}
        className="mt-8 surface-glass-strong surface-hairline rounded-3xl p-7 space-y-4 animate-rise"
        style={{ animationDelay: "120ms" }}
      >
        <div className="flex items-center gap-4">
          <img
            src={user.avatar_url ?? fallbackAvatar(user.id)}
            alt={user.display_name}
            className="w-20 h-20 rounded-full object-cover"
          />
          <div>
            <div className="text-sm font-medium">{user.display_name}</div>
            <div className="text-xs text-muted-foreground">{user.email}</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {user.role} · {user.tier === "premium" ? "Premium" : "Free"}
            </div>
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="name">Ad Soyad / İşletme adı</Label>
          <Input id="name" name="name" defaultValue={user.display_name} required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="city">Şehir</Label>
          <Input id="city" name="city" defaultValue={user.city ?? ""} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea id="bio" name="bio" rows={4} defaultValue={user.bio ?? ""} />
        </div>
        <Button
          type="submit"
          disabled={saving}
          className="bg-gradient-brand text-primary-foreground hover:opacity-90"
        >
          {saving ? "Kaydediliyor..." : "Kaydet"}
        </Button>
      </form>
    </div>
  );
}
