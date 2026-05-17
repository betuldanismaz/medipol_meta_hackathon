# Matchfluence AI

Küçük ve lokal işletmelerin kampanya hedeflerine en uygun mikro-influencer'ları hızlıca bulmasını sağlayan yapay zeka destekli influencer–işletme eşleştirme MVP'si.

## Problem

Küçük işletmeler influencer seçerken çoğu zaman yalnızca takipçi sayısına bakıyor. Bu yaklaşım, yüksek takipçili ama düşük etkileşimli hesapların gereğinden fazla öne çıkmasına neden oluyor. Lokal işletmeler için asıl değer; doğru niş, doğru lokasyon, sağlıklı etkileşim, uygun hedef kitle ve bütçe uyumudur.

## Çözüm

Matchfluence AI, işletmenin kampanya bilgilerini alır ve mock influencer verisini açıklanabilir bir skor motoruyla analiz eder. Kullanıcı, Tinder benzeri mobil kart arayüzünde influencer'ları sağa/sola kaydırır veya butonlarla seçer. Sonuç ekranında skor, skor kırılımı ve “neden önerildi?” açıklaması gösterilir.

Bu MVP gerçek sosyal medya API'si, scraping, auth, ödeme, mesajlaşma veya dashboard karmaşası içermez. Hackathon demosu için frontend-first, deploy edilebilir ve açıklanabilir bir akış sunar.

## Kullanılan teknolojiler

- Vite
- React
- Tailwind CSS
- JavaScript
- Vercel uyumlu statik frontend
- Mock social media data

## AI yaklaşımı

Bu MVP'de “AI” katmanı, açıklanabilir ve deterministik bir matching/scoring engine olarak tasarlanmıştır. Gerçek LLM veya sosyal medya API entegrasyonu yoktur. Böylece demo sırasında sistemin neden belirli influencer'ları önerdiği net şekilde gösterilebilir.

Sistem sadece takipçi sayısına göre sıralama yapmaz. Mikro-influencer mantığı özellikle vurgulanır: düşük/orta takipçi sayısına rağmen yüksek etkileşim, doğru niş ve lokasyon uyumu olan hesaplar daha yüksek skor alabilir.

## Match score formülü

Toplam skor 0-100 arasındadır.

| Bileşen | Ağırlık |
| --- | ---: |
| Niş uyumu | 30 |
| Lokasyon uyumu | 20 |
| Etkileşim sağlığı | 20 |
| Hedef kitle uyumu | 15 |
| Bütçe uygunluğu | 10 |
| Kampanya deneyimi | 5 |

Kod konumu:

```txt
src/lib/scoring.js
```

Her influencer için şu çıktılar üretilir:

- `totalScore`
- `scoreBreakdown`
- `explanation`

Örnek açıklama:

```txt
Bu influencer, Moda Bean Coffee için güçlü bir adaydır çünkü kahve ve lokal mekan uyumu öne çıkıyor, lokasyon skoru yüksek, etkileşim oranı sağlıklı ve bütçe aralığına uygundur.
```

## Demo akışı

1. Kullanıcı landing page'den başlar.
2. İşletme kampanyası formu açılır.
3. Örnek kampanya bilgileri düzenlenebilir.
4. Sistem mock influencer datasını analiz eder.
5. Influencer kartları skor sırasıyla gösterilir.
6. Kullanıcı sağa/sola kaydırır veya butonlarla seçer/pas geçer.
7. Match result ekranında en iyi aday, skor kırılımı ve açıklama görünür.

## Open source / vibe coding kullanım notu

Bu proje hackathon MVP'si olarak açık kaynak frontend araçlarıyla hazırlanmıştır:

- React ve Vite uygulama çatısı
- Tailwind CSS ile hızlı responsive tasarım
- Mock data ve deterministik açıklanabilir skor motoru

Vibe coding kullanımı: fikir, kapsam, bileşen yapısı, skor motoru ve demo akışı yapay zeka destekli geliştirme yaklaşımıyla hızlandırılmıştır. Üretilen kodlar hackathon kriterlerine göre manuel olarak düzenlenebilir, test edilebilir ve sunuma hazır hale getirilebilir.

## Nasıl çalıştırılır?

```bash
npm install
npm run dev
```

Tarayıcıda Vite'ın verdiği local URL'i açın.

## Build kontrolü

```bash
npm run build
```

Build çıktısı `dist/` klasörüne alınır.

## Vercel deploy

1. Projeyi GitHub reposuna yükleyin.
2. Vercel'de **New Project** seçin.
3. Framework olarak Vite otomatik algılanır.
4. Build command:

```bash
npm run build
```

5. Output directory:

```bash
dist
```

6. Deploy edin.

## Kapsam dışı bırakılanlar

- Gerçek sosyal medya API entegrasyonu
- Gerçek veri scraping
- Authentication
- Ödeme
- Gerçek mesajlaşma
- ROI tracking
- Email analizi
- Production-level backend/database mimarisi

## Hackathon sunum cümlesi

Matchfluence AI, küçük işletmeler için influencer seçimini sadece takipçi sayısına bağlı olmaktan çıkarır. Açıklanabilir skor motoru; niş, lokasyon, etkileşim, hedef kitle, bütçe ve deneyim faktörlerini birlikte değerlendirerek daha doğru mikro-influencer eşleşmeleri üretir.
