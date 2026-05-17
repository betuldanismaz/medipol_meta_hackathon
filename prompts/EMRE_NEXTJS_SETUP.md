# Emre — Next.js Kurulum & UI Polish Prompt

> META_PROMPT_HALLUSINASYON_ONLEME.md'yi önce ekle, sonra bunu kullan.

---

## Görev Promptu (Saat 0 — Kurulum)

```
Emre olarak çalışıyorum. Saat 0 görevim: Next.js projesini kur,
proxy config yaz, Betül'ün swipe UI'ını çalıştırabileceği ortamı hazırla.

YAPILACAKLAR (sırayla — ~30 dakika):
1. Next.js 14 projesi: npx create-next-app@14 frontend --typescript --tailwind
2. next.config.js'e proxy rewrites ekle:
     /api/* → http://localhost:8000/api/*
3. package.json'a scripts ekle: "dev": "next dev -p 3000"
3. Tailwind config — custom renk paleti (mor/teal tema — bakınız tasarım)
4. Layout: globals.css, layout.tsx
5. /pages/index.tsx ve /pages/matches.tsx placeholder sayfalar

PROXY CONFIG (next.config.js):
  async rewrites() {
    return [{ source: "/api/:path*", destination: "http://localhost:8000/api/:path*" }]
  }

KLASÖR YAPISI:
  frontend/
    components/
      ProfileCard.tsx    ← Betül yazar
      SwipeDeck.tsx      ← Betül yazar
      MatchBanner.tsx    ← Betül yazar
    pages/
      index.tsx          ← swipe ekranı
      matches.tsx        ← eşleşmeler listesi
    lib/
      api.ts             ← fetch helper (base url boş — proxy ile çalışır)
    next.config.js

API HELPER (lib/api.ts):
  const BASE = ""  // proxy sayesinde relative path yeterli
  export const getProfiles = () => fetch("/api/profiles").then(r => r.json())
  export const swipe = (body) => fetch("/api/swipe", {method:"POST", ...})
  export const getMatches = () => fetch("/api/matches").then(r => r.json())

TAMAMLANMA KRİTERİ (saat 0 bitiminde):
- next dev başlıyor, hata yok
- /api/profiles isteği FastAPI'ye (8000) ulaşıyor
- Tailwind çalışıyor
- Betül import edip component yazmaya başlayabiliyor
```

---

## Görev Promptu (Saat 2:15 — UI Polish)

```
Checkpoint sonrası UI polish görevi.

YAPILACAKLAR:
1. Renk & spacing tutarlılığı — tek bir Tailwind tema rengi seç, tüm sayfalara uygula
2. Mobil görünüm — 375px breakpoint, swipe kartlar tam genişlik
3. Loading state — skeleton kart (profiller yüklenirken)
4. Basit hata mesajı — API çağrısı başarısız olursa kullanıcıya göster
5. YZ skor rozeti — ProfileCard'da görünür, renkli badge

KISIT: Büyük refactor yapma — küçük, hızlı iyileştirmeler.
       Saat 3'e 45 dakika var.
```
