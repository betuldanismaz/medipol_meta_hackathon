# Mehmet — Mock Veri & Sunum Prompt

> META_PROMPT_HALLUSINASYON_ONLEME.md'yi önce ekle, sonra bunu kullan.

---

## Görev Promptu (Saat 0 — Mock Veri)

```
Mehmet olarak çalışıyorum. Görevim: gerçekçi Türkiye odaklı mock JSON
ve sunum içeriği hazırlamak.

MOCK VERİ — 10 Influencer:
Her birinde: id, name, niche, followers, location, score, avatar_url

Niche çeşitliliği (her biri 1-2 kişi):
  Moda & Yaşam | Yemek & Mutfak | Teknoloji & Gadget |
  Fitness & Sağlık | Seyahat | Oyun & Esports |
  Güzellik & Makyaj | Eğitim & Kariyer

Şehirler: İstanbul, Ankara, İzmir, Antalya, Bursa
Avatar: https://i.pravatar.cc/150?img=[1-70 arası sayı]
Score: 60-95 arası (gerçekçi dağılım)

MOCK VERİ — 8 İşletme:
Her birinde: id, name, sector, target_city, budget_tier, description

Sektörler: e-ticaret | gıda & restoran | teknoloji | kozmetik |
           spor & outdoor | turizm | eğitim | moda

Çıktı: data/influencers.json ve data/businesses.json

---

KISIT: Türkiye odaklı, gerçekçi isimler — hayali ama inandırıcı.
       Takipçi sayıları: 8k – 450k arası (mega influencer yok).
```

---

## Görev Promptu (Saat 1 — Sunum Deck)

```
5 slayt sunum içeriği hazırla. Platform: Google Slides veya Canva.
Metin kısa, görsel odaklı.

SLAYT 1 — Problem (başlık + 2 madde):
  "İşletmeler doğru influencer'ı bulmak için saatler harcıyor"
  - Yanlış eşleşme = bütçe israfı
  - Manuel arama ölçeklenmiyor

SLAYT 2 — Çözüm (başlık + görsel fikri):
  "Swipe + YZ Skoru ile Anında Eşleşme"
  - Tinder benzeri arayüz görseli (ekran görüntüsü veya mockup)
  - "Her eşleşme neden doğru?" açıklaması

SLAYT 3 — YZ Farkı:
  - Niche örtüşmesi, takipçi kalitesi, lokasyon uyumu
  - Skor 0-100, Türkçe açıklama
  - "Sezgisel değil, veri odaklı"

SLAYT 4 — Canlı Demo Notu:
  "Demo: [buraya demo URL veya localhost]"
  Senaryo: İşletme giriş → swipe → match → skor gör

SLAYT 5 — Sonraki Adımlar (3 madde, gerçekçi):
  - Gerçek influencer API entegrasyonu
  - Kampanya takip paneli
  - Mobil uygulama

KISIT: Her slayt maks. 30 kelime metin. Büyük punto, az kelime.
```

---

## Demo Senaryosu Provası (Saat 3 Öncesi)

```
Betül ile birlikte 3 dakikalık demo provası:

00:00-00:30  Mehmet anlatır → "İşletmeler influencer bulmakta zorlanıyor,
             yanlış eşleşme bütçeyi eritiyor."
00:30-01:00  Betül gösterir → platforma giriş, profil kartları
01:00-02:30  Betül gösterir → swipe, match animasyonu, skor ekranı
             Mehmet yorumlar → "YZ skoru 84 diyor, neden? Çünkü..."
02:30-03:00  Mehmet kapatır → "Sonraki adımda gerçek API + mobil"

Jüri sorusu tahmini:
  S: "YZ burada ne yapıyor tam olarak?" → Emir cevaplar
  S: "Gerçek verilerle çalışıyor mu?" → "Demo verisi, gerçek entegrasyon sonraki adım"
  S: "Rakipler?" → "Manuel ajans sürecini otomatize ediyoruz"
```
