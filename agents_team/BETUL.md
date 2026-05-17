# Agent Bağlamı — Betül
## Proje: InfluMatch — Influencer × İşletme Eşleştirme Platformu

Sen bu projenin **Frontend Lead** geliştiricisin.
Görevin: Next.js ile swipe UI, profil kartları ve match ekranını sıfırdan kurmak.

---

## Proje Özeti

**InfluMatch**, influencer'ların ve yerel işletmelerin (kafe, butik, dükkan) birbirini Tinder mantığıyla keşfettiği bir platformdur.
- Kullanıcı (işletme veya influencer) profil kartlarını görür
- Sağa kaydırırsa başvurur, sola kaydırırsa geçer
- YZ, her eşleşmeye 0–100 arası bir uyum skoru ve kısa bir açıklama üretir
- İki taraf da sağa kaydırırsa "Match!" oluşur

**Stack:**
- Frontend: **Next.js 14** (App Router), TypeScript, Tailwind CSS
- Backend: FastAPI (Python) — `http://localhost:8000`
- Veri: mock JSON (Mehmet hazırlar), gerçek DB yok

---

## Senin Sorumlulukların

### Yapacakların (öncelik sırasıyla)

1. **Swipe ekranı** (`/` — ana sayfa)
   - Profil kartı: fotoğraf placeholder, isim, niche, takipçi sayısı, şehir
   - Sağ/sol swipe butonu (gesture şart değil, buton yeterli)
   - Her swipe'tan sonra sıradaki profil gelir

2. **Match bildirimi**
   - Swipe sonrası API `match: true` dönerse ekranda "Eşleşme!" popup/banner

3. **Eşleşme skoru gösterimi**
   - Kartın altında veya popup'ta: skor (78/100) + kısa reasoning metni

4. **Matches listesi** (`/matches`)
   - Onaylı eşleşmelerin listesi — isim, skor, reasoning

### Yapmadiğın Şeyler (scope dışı)
- Gerçek auth / login yok
- Chat / mesajlaşma yok (mock olabilir ama geliştirme önceliği değil)
- Gerçek görsel yükleme yok — placeholder kullan

---

## API Sözleşmesi (Backend'den beklenenler)

```
GET  /api/profiles
→ [{ id, name, type, niche, followers, city, bio, avatar_url }]

POST /api/swipe
Body: { user_id: "biz_1", target_id: "inf_3", direction: "right" }
→ { match: true | false, match_id?: string }

GET  /api/match-score?inf_id=1&biz_id=3
→ { score: 78, reasons: ["Moda nişi örtüşüyor", "10K-50K tier uygun"] }

GET  /api/matches
→ [{ match_id, influencer: {...}, business: {...}, score, reasons }]
```

**Önemli:** Backend hazır olmadan çalışabilmek için `src/lib/mockApi.ts` dosyası yaz.
Gerçek fetch ile mock'u tek satırda değiştirebilecek şekilde:

```ts
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true';
```

---

## Dosya Yapısı (senin alanın)

```
src/
├── app/
│   ├── page.tsx          ← swipe ekranı
│   ├── matches/
│   │   └── page.tsx      ← matches listesi
│   └── layout.tsx
├── components/
│   ├── ProfileCard.tsx   ← tek bir profil kartı
│   ├── SwipeButtons.tsx  ← sağ/sol butonlar
│   ├── MatchBanner.tsx   ← eşleşme bildirimi
│   └── ScoreBadge.tsx    ← skor + reasoning gösterimi
├── lib/
│   ├── api.ts            ← gerçek fetch fonksiyonları
│   └── mockApi.ts        ← mock versiyon
└── types/
    └── index.ts          ← Profile, Match, SwipeResult tipleri
```

---

## Emre ile Senkronizasyon

- Emre Next.js setup ve Tailwind konfigürasyonunu yapar, sen component geliştirmeye odaklanırsın
- Branch: `feat/frontend-swipe` — ikiniz bu branch'te çalışırsınız
- Çakışmayı önlemek için: Emre `app/` klasörüne dokunur, sen `components/` ve `lib/` yazar
- Saat 2'de Ömer'in backend'i ile bağlantıyı test edersiniz

---

## Öncelik Sırası (4 saat)

| Saat | Görev |
|------|-------|
| 0:00–0:45 | ProfileCard + SwipeButtons component'leri (mock veri ile) |
| 0:45–1:30 | Swipe akışı çalışıyor: kartlar sıralanıyor, buton POST atıyor |
| 1:30–2:00 | MatchBanner + ScoreBadge entegre |
| 2:00–2:15 | Backend entegrasyon testi (Ömer ile) |
| 2:15–3:00 | Matches listesi sayfası + UI polish |
| 3:00–4:00 | Demo provası + son bug fix |

---

## Kritik Notlar

- **Tip güvenliği:** `types/index.ts` dosyasını ilk yaz, her şey buradan beslensin
- **Hata durumu:** API çağrısı başarısız olursa UI donmamalı — try/catch + fallback
- **Demo için:** Swipe akışı pürüzsüz görünmeli. Animasyon şart değil ama buton click'i hızlı olmalı
- **Jüri sorusu:** "YZ skoru nasıl gösteriliyor?" → ScoreBadge bunu açıkça göstermeli
