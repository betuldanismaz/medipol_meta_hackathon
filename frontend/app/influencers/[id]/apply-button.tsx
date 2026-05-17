"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getMyListings, postSwipeV2 } from "@/lib/api";
import { getToken } from "@/lib/auth-storage";

export function ApplyButton({ influencerId }: { influencerId: number }) {
  const router = useRouter();

  const handle = async () => {
    if (!getToken()) {
      toast.message("Önce işletme hesabıyla giriş yap.");
      router.push("/auth/login");
      return;
    }
    try {
      const myListings = await getMyListings();
      if (myListings.length === 0) {
        toast.message("Önce bir ilan oluştur.", {
          description: "Influencer'a teklif göndermek için aktif ilan gerekli.",
        });
        return;
      }
      const result = await postSwipeV2({
        listing_id: myListings[0].id,
        candidate_id: influencerId,
        direction: "accept",
      });
      if (result.status === "matched") {
        toast.success("Eşleştin! Agent inbox'a göz at.");
        router.push("/dashboard/negotiations");
      } else if (result.paywall) {
        toast.message("Eşleşme yapıldı", {
          description: result.paywall_reason ?? "Agent için premium gerekli.",
        });
        router.push("/dashboard/billing");
      } else {
        toast.success("Teklif gönderildi! Influencer'ın onayını bekle.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Hata");
    }
  };

  return (
    <Button onClick={handle} className="bg-gradient-brand text-primary-foreground hover:opacity-90">
      Teklif Gönder
    </Button>
  );
}
