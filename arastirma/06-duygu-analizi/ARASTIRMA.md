# F6 — Duygu Analizi & Zararlı Akım Filtresi
**Sorumlu:** Mehmet

## Modül Özeti
Kullanıcının sosyal medya deneyimindeki içerikleri duygu analizi ile sınıflandıran, kullanıcıyı kötü hissettiren akım ve içerikleri tespit eden ve bunları filtreleyen bir YZ sistemi. Kullanıcı hangi içeriklerin kendisini nasıl hissettirdiğini görebilir.

## Problem Tanımı
Sosyal medya algoritmaları "dikkat çeken" içeriği öne çıkarır — bu genellikle öfke, korku veya kaygı tetikleyen içerikler. Kullanıcılar bunun farkında değil ve dijital refahları bozuluyor.

## Çözüm Yaklaşımı
1. Kullanıcının feed'indeki içerikler (mock) duygu analizine tabi tutulur
2. Her içerik etiketlenir: Pozitif / Nötr / Olumsuz / Toksik
3. "Duygu ısı haritası" gösterilir (hangi içerikler hangi duyguyu tetikledi)
4. Kullanıcı filtre tercihlerini belirler
5. Olumsuz içerikler gizlenir veya uyarıyla gösterilir

## Teknik Mimari

### Duygu Kategorileri
```
Ana kategoriler:
  - Pozitif: mutluluk, ilham, eğlence, merak
  - Nötr: bilgilendirici, tarafsız
  - Olumsuz: üzüntü, endişe, kaygı
  - Toksik: öfke, nefret, korku körükleme, kışkırtma

Alt kategoriler (gelişmiş):
  - Kıskançlık tetikleyici (örn: lüks yaşam içerikleri)
  - Karşılaştırma tuzağı (vücut imajı, başarı karşılaştırması)
  - Felaket haberciliği (doom scrolling içeriği)
  - FOMO tetikleyici
```

### Girdiler
- Mock feed içerikleri (metin listesi)
- Kullanıcının hassasiyet profili (isteğe bağlı)
- Filtre seviyesi: Hafif / Orta / Sert

### Çıktılar
- Her içerik için duygu etiketi + güven skoru
- Feed'in genel "duygu tonu" özeti
- Isı haritası: hangi içerik türü hangi duyguyu tetikliyor
- Filtrelenmiş vs filtrelenmemiş feed karşılaştırması
- "Bu hafta feed'in seni %40 olumsuz içerikle karşılaştırdı" gibi özet

### Filtre Mekanizması
```
Kullanıcı tercihlerine göre:
  Toksik içerik → Otomatik gizle
  Olumsuz içerik → Blur + "Olumsuz içerik" uyarısı + Göster butonu
  Karşılaştırma tuzağı → "Bu içerik karşılaştırma duygusu yaratabilir" etiketi
  Felaket haberciliği → Günlük limit önerisi
```

## Araştırma Notları

### Akademik Referanslar
- "Social Media and Mental Health" — Jean Twenge araştırmaları
- Doomscrolling ve anksiyete ilişkisi araştırmaları
- NLP duygu analizi: VADER, TextBlob, Türkçe için BERTurk

### Türkçe Duygu Analizi Araçları
- BERTurk (Türkçe BERT modeli) — duygu analizi fine-tuning mevcut
- SentimentTR (açık kaynak)
- Google Cloud Natural Language API (Türkçe destekli, ücretli)

### Mock Feed Veri Yapısı
```json
[
  {
    "id": "post_001",
    "metin": "Bugün spor salonuna gittim, çok iyi hissediyorum!",
    "platform": "instagram",
    "beklenen_duygu": "pozitif"
  },
  {
    "id": "post_002", 
    "metin": "Ülke mahvoldu, her şey berbat gidiyor artık",
    "platform": "twitter",
    "beklenen_duygu": "toksik/felaket"
  }
]
```

### Dikkat Edilecekler
- İroni ve sarkazm tespiti zor — LLM yardımcı olur ama %100 değil
- Kültürel bağlam önemli (Türkçe'de abartılı ifadeler olumlu bağlamda kullanılabilir)
- "Paternalist" olmamak — kullanıcı tercih yapmalı, sistem zorla filtrelememeli
- Gizlilik: içerikler işlenirken kullanıcı verisi saklanmamalı (demo: tamamen client-side)

## Kapsam Dışı
- Kullanıcının gerçek psikolojik durumu tespiti (klinik tanı değil)
- Uzun vadeli kullanıcı profili oluşturma
- Gerçek platform feed erişimi
- Bildirim/alarm sistemi

## Demo Senaryosu
```
Giriş: 20 mock sosyal medya gönderisi

Analiz:
  8 Pozitif (%40) — yeşil
  5 Nötr (%25) — gri
  5 Olumsuz (%25) — sarı
  2 Toksik (%10) — kırmızı

Görsel: Renk kodlu feed + ısı haritası + filtre toggle

Filtre açık: 2 toksik içerik gizlendi, 5 olumsuz bulanıklaştırıldı
```
