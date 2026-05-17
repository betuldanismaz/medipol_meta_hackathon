# InfluMatch — Çok Sayfalı Frontend Planı

## Not: Framework
Proje şablonu **Next.js değil, TanStack Start (React + Vite, SSR destekli)** üzerine kurulu. Lovable'da framework değiştirilemiyor, ama TanStack Start da Next.js gibi dosya-tabanlı routing, SSR ve SEO meta desteği sunuyor — yani "birden çok sayfalı, gerçek route'lara sahip" site isteğiniz birebir karşılanıyor. Sadece frontend yapılacak, backend yok (mock data ile).

## Ürün Özeti
İşletmeler (kafeler, butikler, dükkanlar) ile influencer'ları konum ve niş bazlı eşleştiren, Tinder benzeri swipe mantığıyla çalışan ilan/başvuru platformu. Hem influencer hem işletme tarafı var; iki taraflı değerlendirme ve AI öneri vurgusu UI'da yer alacak.

## Sayfa / Route Yapısı

Her sayfa kendi route dosyası olacak (gerçek URL'ler, SSR ve SEO meta'lı).

```text
/                       Landing — hero, nasıl çalışır, iki taraf için CTA
/how-it-works           Swipe akışı, AI eşleştirme, değerlendirme anlatımı
/for-influencers        Influencer tarafı pazarlama sayfası
/for-businesses         İşletme/kafe tarafı pazarlama sayfası
/pricing                Planlar (Free / Pro / Business)
/about                  Ekip, misyon
/contact                İletişim formu (mock)

/auth/login             Giriş
/auth/register          Rol seçimli kayıt (Influencer / İşletme)

/discover               Tinder tarzı swipe arayüzü (rol-aware)
/listings               İlan listesi + filtreler (konum, niş, bütçe)
/listings/$id           İlan detayı + başvuru butonu

/influencers            Influencer arama (işletme görünümü)
/influencers/$id        Influencer profil detayı + AI seviye rozeti

/dashboard              Tek birleşik dashboard (rol-aware sekmeler)
                        - Eşleşmeler, başvurular, mesajlar, istatistikler
/dashboard/matches      Eşleşmeler listesi
/dashboard/messages     Mesaj kutusu (mock chat)
/dashboard/profile      Profil düzenleme
/dashboard/analytics    Etki/performans grafikleri (mock chart)
```

Toplam ~17 route. Konuşmada üç ayrı dashboard'un karmaşık olduğu söylendiği için **tek dashboard + rol-bazlı sekmeler** tercih edildi.

## Ana Bileşenler
- **SwipeCard** — kart yığını, sağa/sola sürükleme animasyonu (framer-motion)
- **ListingCard / InfluencerCard** — grid ve liste görünümleri
- **MatchModal** — eşleşme bildirimi
- **FilterBar** — konum, kategori, takipçi aralığı, bütçe
- **AIBadge** — "AI Seviye: Mikro / Orta / Üst" rozeti
- **RatingStars** — karşılıklı değerlendirme
- **StatsChart** — recharts ile mock performans grafikleri
- **Navbar / Footer** — tüm sayfaların ortak shell'i

## Mock Data
`src/lib/mock-data.ts` içinde sahte influencer'lar, ilanlar, eşleşmeler, mesajlar. Backend yok — her şey client-side state.

## Tasarım Yönü
Modern, genç, sosyal medya estetiği. Sıcak gradient vurgular (pembe/mor/turuncu), beyaz arka plan, yumuşak köşeler, bol whitespace. Tailwind + shadcn/ui üzerinden.

## Kapsam Dışı
- Gerçek auth / backend / DB
- Gerçek AI / Instagram analizi (sadece UI'da gösterilen mock skorlar)
- Gerçek mesajlaşma (mock chat UI)
- Ödeme entegrasyonu

İsterseniz onaylayın, kuralım. Farklı sayfalar ya da farklı isim (Türkçe/İngilizce) tercih ederseniz söyleyin.