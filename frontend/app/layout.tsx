import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Medipol Meta Hackathon",
  description: "Sosyal Medya YZ Ekosistemi",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
