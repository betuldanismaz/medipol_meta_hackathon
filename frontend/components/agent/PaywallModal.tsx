"use client";

import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reason?: string;
  isBusiness?: boolean;
};

export function PaywallModal({ open, onOpenChange, reason, isBusiness }: Props) {
  const price = isBusiness ? 499 : 149;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[var(--brand)]" />
            Agent erişimi Premium ile açılır
          </DialogTitle>
          <DialogDescription>
            {reason ??
              "Eşleştin — agent'lar konuşmaya hazır. Müzakere için Premium üyelik gerekli."}
          </DialogDescription>
        </DialogHeader>
        <ul className="text-sm space-y-2 text-muted-foreground">
          <li>• Sınırsız eş zamanlı müzakere</li>
          <li>• Canlı izle + 'müdahale et' butonu</li>
          <li>• 🧠 Reasoning balonu</li>
          <li>• Anlaşma özet kartı (Kabul / Pazarlık / Red)</li>
        </ul>
        <DialogFooter className="flex sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="sm:flex-1">
            Şimdi değil
          </Button>
          <Button
            asChild
            className="sm:flex-1 bg-gradient-brand text-primary-foreground hover:opacity-90"
          >
            <Link href="/dashboard/billing">₺{price}/ay'a geç</Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
