import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "InfluMatch — Influencer ve İşletmeleri Eşleştiren Platform",
  description:
    "Kafeler, butikler ve influencer'lar için AI destekli, konum bazlı akıllı eşleşme.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
