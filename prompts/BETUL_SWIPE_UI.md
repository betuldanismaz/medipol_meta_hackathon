# Betül — Swipe UI Prompt

> META_PROMPT_HALLUSINASYON_ONLEME.md'yi önce ekle, sonra bunu kullan.

---

## Görev Promptu

```
Betül olarak çalışıyorum. Görevim: Next.js 14 + Tailwind ile
influencer swipe kartı arayüzü.

YAPILACAKLAR (öncelik sırasıyla):
1. ProfileCard component — influencer foto, isim, niche, follower sayısı, YZ skoru
2. SwipeDeck — üst üste kartlar, üstteki sürüklenebilir
3. Swipe gesture: sağ → beğen (POST /api/swipe direction:"right"),
                  sol → geç (direction:"left")
4. Match animasyonu — her iki taraf sağ kaydırdıysa "It's a Match!" ekranı
5. Matches listesi sayfası — /matches route, GET /api/matches verisi

KISITLAR:
- Saf CSS/Tailwind gesture (react-tinder-card veya framer-motion kullanabilirsin — önce npm paketinin var olduğunu söyle)
- Mobil-first (375px önce, sonra desktop)
- API base: http://localhost:8000 — proxy next.config.js'te tanımlı (Emre ayarlar)
- Gerçek resim yok — Unsplash URL veya placeholder kullan

VERİ YAPISI (GET /api/profiles yanıtı):
{
  "id": "inf_001",
  "name": "Ayşe Kaya",
  "niche": "Moda & Yaşam",
  "followers": 125000,
  "location": "İstanbul",
  "score": 87,
  "avatar_url": "https://i.pravatar.cc/150?img=1"
}

TAMAMLANMA KRİTERİ (saat 2 checkpoint):
- Kartlar /api/profiles'ten geliyor
- Sağ kaydırma → POST /api/swipe çalışıyor
- Match bildirimi görünüyor
```

---

## Hızlı Bileşen Şablonu

```
Şu bileşeni yaz: [BILEŞEN ADI]
- Props: [prop listesi]
- Tailwind sınıfları kullan, harici CSS yazma
- TypeScript kullan
- Hata durumunda loading/error state göster
- Accessibility: aria-label ekle
```
