# Agent Bağlamı — Mehmet
## Proje: InfluMatch — Influencer × İşletme Eşleştirme Platformu

Sen bu projenin **Veri Mimarı ve Sunum Stratejisti** isin.
Görevin: Tüm ekibin kullanacağı mock veriyi hazırlamak, sunum deck'ini yazmak ve demo senaryosunu kurgulamak.

---

## Proje Özeti

**InfluMatch**, influencer'ların ve yerel işletmelerin (kafe, butik, dükkan) birbirini Tinder mantığıyla keşfettiği bir platformdur.
- Kullanıcılar profil kartlarını görür, sağa/sola kaydırır
- YZ uyum skoru (0–100) + gerekçe gösterilir
- İki taraf da sağa kaydırırsa "Match!" oluşur
- Hedef kullanıcı: küçük/orta işletmeler + 10K–500K takipçili micro-influencer'lar

**Stack:**
- Frontend: Next.js 14 (Betül + Emre)
- Backend: FastAPI (Ömer)
- YZ: Kural tabanlı eşleştirme skoru (Emir)

---

## Senin Sorumlulukların

### Yapacakların (öncelik sırasıyla)

1. **`mock_data.json`** — 10 influencer + 8 işletme, gerçekçi Türkiye verisi
2. **Sunum deck** — 5 slayt, jüri için
3. **Demo senaryosu** — 3 dakikalık akış, kim ne söyler
4. **Jüri soru-cevap hazırlığı** — tahmin edilen 5 zor soru + cevapları

### Yapmadığın Şeyler (scope dışı)
- Kod yazmak (mock JSON yeterli)
- Frontend / backend geliştirme

---

## mock_data.json Formatı ve İçeriği

Bu dosya `backend/data/mock_data.json` olarak kaydedilecek. Ömer startup'ta okuyacak.

```json
{
  "influencers": [
    {
      "id": "inf_1",
      "name": "Ayşe Kaya",
      "type": "influencer",
      "niche": "moda",
      "followers": 28000,
      "city": "İstanbul",
      "bio": "Sürdürülebilir moda ve minimalist yaşam",
      "avatar_url": null,
      "engagement_rate": 0.042,
      "past_brands": ["Zara", "Mango"],
      "content_style": "lifestyle"
    },
    {
      "id": "inf_2",
      "name": "Can Demir",
      "type": "influencer",
      "niche": "yemek",
      "followers": 15000,
      "city": "İzmir",
      "bio": "Sokak lezzetleri ve restoran keşifleri",
      "avatar_url": null,
      "engagement_rate": 0.061,
      "past_brands": [],
      "content_style": "review"
    },
    {
      "id": "inf_3",
      "name": "Zeynep Arslan",
      "type": "influencer",
      "niche": "güzellik",
      "followers": 72000,
      "city": "İstanbul",
      "bio": "Doğal güzellik rutinleri ve cilt bakımı",
      "avatar_url": null,
      "engagement_rate": 0.038,
      "past_brands": ["The Ordinary", "Dermokozmetik"],
      "content_style": "tutorial"
    },
    {
      "id": "inf_4",
      "name": "Mert Yıldız",
      "type": "influencer",
      "niche": "spor",
      "followers": 9500,
      "city": "Ankara",
      "bio": "CrossFit ve beslenme",
      "avatar_url": null,
      "engagement_rate": 0.078,
      "past_brands": [],
      "content_style": "educational"
    },
    {
      "id": "inf_5",
      "name": "Selin Çelik",
      "type": "influencer",
      "niche": "teknoloji",
      "followers": 45000,
      "city": "İstanbul",
      "bio": "Gadget incelemeleri ve üretkenlik ipuçları",
      "avatar_url": null,
      "engagement_rate": 0.029,
      "past_brands": ["Samsung", "Logitech"],
      "content_style": "review"
    },
    {
      "id": "inf_6",
      "name": "Berk Doğan",
      "type": "influencer",
      "niche": "yemek",
      "followers": 33000,
      "city": "İstanbul",
      "bio": "Fine dining ve kokteyl kültürü",
      "avatar_url": null,
      "engagement_rate": 0.051,
      "past_brands": ["Gordon's", "Nespresso"],
      "content_style": "lifestyle"
    },
    {
      "id": "inf_7",
      "name": "Defne Şahin",
      "type": "influencer",
      "niche": "yaşam",
      "followers": 19000,
      "city": "Antalya",
      "bio": "Minimalist ev dekorasyonu ve seyahat",
      "avatar_url": null,
      "engagement_rate": 0.055,
      "past_brands": [],
      "content_style": "lifestyle"
    },
    {
      "id": "inf_8",
      "name": "Arda Kılıç",
      "type": "influencer",
      "niche": "moda",
      "followers": 88000,
      "city": "İstanbul",
      "bio": "Erkek moda ve sokak stili",
      "avatar_url": null,
      "engagement_rate": 0.033,
      "past_brands": ["H&M", "Levi's", "Adidas"],
      "content_style": "lookbook"
    },
    {
      "id": "inf_9",
      "name": "Naz Yılmaz",
      "type": "influencer",
      "niche": "güzellik",
      "followers": 11000,
      "city": "Bursa",
      "bio": "Günlük makyaj ve saç bakımı",
      "avatar_url": null,
      "engagement_rate": 0.069,
      "past_brands": [],
      "content_style": "tutorial"
    },
    {
      "id": "inf_10",
      "name": "Tuna Avcı",
      "type": "influencer",
      "niche": "spor",
      "followers": 26000,
      "city": "İzmir",
      "bio": "Outdoor spor ve doğa yürüyüşü",
      "avatar_url": null,
      "engagement_rate": 0.047,
      "past_brands": ["Decathlon"],
      "content_style": "adventure"
    }
  ],
  "businesses": [
    {
      "id": "biz_1",
      "name": "Kahve & Stil",
      "type": "business",
      "niche": "moda",
      "city": "İstanbul",
      "bio": "Moda odaklı konsept kafe, butik koleksiyon satışı",
      "avatar_url": null,
      "target_followers": "10k-50k",
      "budget_tier": "small",
      "past_collaborations": []
    },
    {
      "id": "biz_2",
      "name": "Yeşil Tabak",
      "type": "business",
      "niche": "yemek",
      "city": "İstanbul",
      "bio": "Vegan ve organik restorant, Beşiktaş",
      "avatar_url": null,
      "target_followers": "10k-50k",
      "budget_tier": "small",
      "past_collaborations": ["inf_past_1"]
    },
    {
      "id": "biz_3",
      "name": "FitZone Studio",
      "type": "business",
      "niche": "spor",
      "city": "Ankara",
      "bio": "Fonksiyonel antrenman ve CrossFit merkezi",
      "avatar_url": null,
      "target_followers": "1k-10k",
      "budget_tier": "small",
      "past_collaborations": []
    },
    {
      "id": "biz_4",
      "name": "Glow Cilt Bakım",
      "type": "business",
      "niche": "güzellik",
      "city": "İstanbul",
      "bio": "Klinik cilt bakım merkezi ve ürün satışı",
      "avatar_url": null,
      "target_followers": "50k-500k",
      "budget_tier": "medium",
      "past_collaborations": []
    },
    {
      "id": "biz_5",
      "name": "Teknosan",
      "type": "business",
      "niche": "teknoloji",
      "city": "İstanbul",
      "bio": "Aksesuarlar ve gadget mağazası",
      "avatar_url": null,
      "target_followers": "10k-50k",
      "budget_tier": "medium",
      "past_collaborations": []
    },
    {
      "id": "biz_6",
      "name": "Botanik Kafe",
      "type": "business",
      "niche": "yaşam",
      "city": "Antalya",
      "bio": "Doğal malzemeler, bitki çayları, huzurlu ortam",
      "avatar_url": null,
      "target_followers": "10k-50k",
      "budget_tier": "small",
      "past_collaborations": []
    },
    {
      "id": "biz_7",
      "name": "Urban Threads",
      "type": "business",
      "niche": "moda",
      "city": "İstanbul",
      "bio": "Erkek sokak giyim butik markası",
      "avatar_url": null,
      "target_followers": "50k-500k",
      "budget_tier": "medium",
      "past_collaborations": []
    },
    {
      "id": "biz_8",
      "name": "Çevik Mutfak",
      "type": "business",
      "niche": "yemek",
      "city": "İzmir",
      "bio": "Fast-casual, yerel malzeme odaklı restoran",
      "avatar_url": null,
      "target_followers": "10k-50k",
      "budget_tier": "small",
      "past_collaborations": []
    }
  ]
}
```

---

## Sunum Deck — 5 Slayt Yapısı

### Slayt 1 — Problem (30 saniye)
**Başlık:** "Küçük işletmeler doğru influencer'ı nasıl buluyor?"
- Yerel kafe Japonya'ya giden influencer ile anlaşıyor, hayal kırıklığı
- Influencer da kendine uygun işletmeleri manuel arıyor — zaman kaybı
- İki taraf da birbirini bulamıyor

### Slayt 2 — Çözüm (30 saniye)
**Başlık:** "InfluMatch — Tinder gibi, ama iş için"
- İşletme ilan açar, influencer kaydırır
- YZ her çift için uyum skoru hesaplar
- Karşılıklı sağa kaydırma = bağlantı

### Slayt 3 — YZ Farkı (45 saniye)
**Başlık:** "Eşleştirme kör değil — skorlu"
- 4 boyutlu analiz: niş uyumu, takipçi tieri, şehir, etkileşim oranı
- "Bu öneri neden?" sorusunu doğrudan yanıtlar
- Ekran görüntüsü: skor + reasoning kartı

### Slayt 4 — Demo (canlı gösterim — 60 saniye)
**Başlık:** "Canlı demo"
- Uygulama açık, jüri izler
- İşletme profili: "Kahve & Stil" / İstanbul / moda nişi
- Sağa kaydır → skor: 78/100, 3 gerekçe → Match bildirimi

### Slayt 5 — Traction Potential (30 saniye)
**Başlık:** "Neden şimdi, neden bu ekip?"
- Türkiye'de 2M+ aktif içerik üretici
- Micro-influencer pazarı büyüyor, araç yok
- Ekip: GenAI güçlü, full-stack, 4 saatte çalışan MVP

---

## Demo Senaryosu — 3 Dakika

```
0:00–0:30  Betül / Mehmet:
  "Diyelim ki İstanbul'da küçük bir kafe sahibisiniz.
   Moda nişinde içerik üretebilecek biri arıyorsunuz.
   Normalde bunu Instagram'da saatlerce araştırırsınız.
   InfluMatch'te 30 saniye."

0:30–1:30  Betül (uygulamayı gösterir):
  - Ana sayfayı açar: influencer kartları görünür
  - "Ayşe Kaya — moda, 28K takipçi, İstanbul" kartı
  - Sağa kaydırır
  - Skor belirir: 78/100
  - Reasons: "Moda nişi örtüşüyor / Takipçi tieri uygun / Aynı şehir"
  - Match bildirimi görünür

1:30–2:00  Emir (YZ kısmını anlatır):
  "Buradaki skor rastgele değil. Sistemimiz 4 faktöre bakıyor:
   niş uyumu, takipçi büyüklüğü, şehir ve etkileşim oranı.
   Weighted scoring ile hesaplıyoruz, her eşleşme için gerekçe üretiyoruz."

2:00–2:30  Mehmet (kapanış):
  "Türkiye'de 2 milyonun üzerinde içerik üretici var.
   Micro-influencer segmenti hızla büyüyor.
   Bu platform o iki tarafı buluşturuyor — YZ destekli, lokal odaklı."

2:30–3:00  Soru-cevap hazırlık
```

---

## Tahmin Edilen Jüri Soruları

| Soru | Cevap |
|------|-------|
| YZ burada gerçekten ne yapıyor? | 4 boyutlu ağırlıklı skor: niş uyumu (40p), takipçi tieri (25p), şehir (20p), engagement (15p). Her eşleşme için insan okunabilir gerekçe üretiliyor. |
| Benzer ürün yok mu? | AspireIQ, Grin gibi global platformlar var ama Türkiye'deki küçük işletmelere, Türkçe ve lokal odaklı, düşük bütçe tieriyle çalışan yok. |
| Gerçek veri var mı? | Şu an mock. Gerçekte Instagram API veya kullanıcı profil girişiyle beslenir. |
| Para nasıl kazanırsınız? | Eşleşme başına komisyon veya işletme aboneliği — henüz business model odağımız değildi, teknik MVP'ye odaklandık. |
| Neden Tinder mekanizması? | Mutual consent: iki taraf da isterse bağlantı kurulur. Spam gönderme yok, soğuk DM yok. |

---

## Öncelik Sırası (4 saat)

| Saat | Görev |
|------|-------|
| 0:00–0:45 | `mock_data.json` tamamla ve `backend/data/` klasörüne koy |
| 0:45–1:30 | Sunum deck'ini yaz (Google Slides veya PowerPoint) |
| 1:30–2:00 | Demo senaryosunu prova et — Betül ile birlikte |
| 2:00–2:30 | Jüri soruları hazırla, ekibe dağıt |
| 2:30–3:00 | Deck son düzeltmeleri, ekran görüntüleri ekle |
| 3:00–4:00 | Prova — herkes kendi bölümünü biliyor mu? |

---

## Kritik Notlar

- **Mock veri gerçekçi olsun:** İsimler Türkçe, şehirler gerçek, nişler tutarlı. Sahte hissettiren veri jüriye kötü görünür.
- **Sunum süresini aş:** 3 dakika demo + 2 dakika soru-cevap. Fazla söyleme, göster.
- **Skor 78/100:** Demo'da bu skoru hatırla. Gerekçeler: "Moda nişi örtüşüyor", "Takipçi uyumlu", "Aynı şehir".
- **Betül ile prova yap:** Demo sırasında uygulama donmamalı — en az 2 kez çalıştırın.
