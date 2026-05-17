"use client";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function ApplyButton() {
  return (
    <Button
      onClick={() => toast.success("Başvurun gönderildi!")}
      className="w-full mt-5 bg-gradient-brand text-primary-foreground hover:opacity-90"
    >
      Başvur
    </Button>
  );
}
