"use client";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function ApplyButton() {
  return (
    <Button
      onClick={() => toast.success("İşbirliği teklifi gönderildi!")}
      className="bg-gradient-brand text-primary-foreground hover:opacity-90"
    >
      Teklif Gönder
    </Button>
  );
}
