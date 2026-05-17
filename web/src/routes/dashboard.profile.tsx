import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/profile")({
  head: () => ({ meta: [{ title: "Profil — Dashboard" }] }),
  component: Profile,
});

function Profile() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold">Profil</h1>
      <p className="text-muted-foreground mt-1">Hesap bilgilerini güncelle.</p>

      <form
        onSubmit={(e) => { e.preventDefault(); toast.success("Profil güncellendi!"); }}
        className="mt-6 rounded-2xl border border-border bg-card p-6 space-y-4"
      >
        <div className="flex items-center gap-4">
          <img src="https://i.pravatar.cc/150?u=me" alt="" className="w-20 h-20 rounded-full object-cover" />
          <Button type="button" variant="outline" size="sm">Fotoğraf değiştir</Button>
        </div>
        <div className="grid gap-2"><Label htmlFor="name">Ad Soyad</Label><Input id="name" defaultValue="Demo Kullanıcı" /></div>
        <div className="grid gap-2"><Label htmlFor="handle">Kullanıcı adı</Label><Input id="handle" defaultValue="@demouser" /></div>
        <div className="grid gap-2"><Label htmlFor="city">Şehir</Label><Input id="city" defaultValue="İstanbul" /></div>
        <div className="grid gap-2"><Label htmlFor="bio">Bio</Label><Textarea id="bio" rows={4} defaultValue="Yerel mekanları keşfediyorum." /></div>
        <Button type="submit" className="bg-gradient-brand text-primary-foreground hover:opacity-90">Kaydet</Button>
      </form>
    </div>
  );
}
