"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { postSwipeV2 } from "@/lib/api";
import { getToken } from "@/lib/auth-storage";

export function ApplyButton({ listingId }: { listingId: number }) {
  const router = useRouter();

  const handle = async () => {
    if (!getToken()) {
      toast.message("Önce giriş yap", { description: "Başvuru için hesap gerekli." });
      router.push("/auth/login");
      return;
    }
    try {
      const result = await postSwipeV2({ listing_id: listingId, direction: "accept" });
      if (result.status === "matched") {
        toast.success("Eşleştin! Agent inbox'a göz at.");
        router.push("/dashboard/negotiations");
      } else if (result.paywall) {
        toast.message("Eşleşme yapıldı", {
          description: result.paywall_reason ?? "Agent için premium gerekli.",
        });
        router.push("/dashboard/billing");
      } else {
        toast.success("Başvurun gönderildi! İşletmenin onayını bekle.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Hata");
    }
  };

  return (
    <Button
      onClick={handle}
      className="w-full mt-5 bg-gradient-brand text-primary-foreground hover:opacity-90"
    >
      Başvur
    </Button>
  );
}
