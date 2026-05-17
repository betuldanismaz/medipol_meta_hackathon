# F2 — İçerik Üreticisi Hesap Yönetim Sistemi
**Sorumlu:** Ömer

## Modül Özeti
İçerik üreticilerinin kendi sosyal medya hesaplarını tek panelden yönetmesini sağlayan, YZ destekli bir yönetim asistanı. Gönderi planlama, performans özeti, en iyi paylaşım zamanı önerisi.

## Problem Tanımı
İçerik üreticileri birden fazla platformda içerik yönetirken zaman kaybı, tutarsız paylaşım takvimi ve performans verilerini yorumlayamama sorunları yaşıyor.

## Çözüm Yaklaşımı
1. Mock hesap verisi üzerinden performans analizi
2. YZ ile "bu hafta ne paylaşmalısın?" önerisi
3. İçerik takvimi otomatik oluşturma
4. Yorum/etkileşim özeti (F8 ile entegre)

## Teknik Mimari

### Girdiler
- Kullanıcının platform seçimi
- Mock/örnek hesap istatistikleri (takipçi sayısı, etkileşim oranı, son paylaşımlar)
- Hedef (büyüme / etkileşim / marka)

### Çıktılar
- Haftalık içerik takvimi (gün + saat + format önerisi)
- Performans özet raporu (metin formatında, anlaşılır dil)
- "Bu haftanın önceliği" YZ tavsiyesi
- Hangi içerik türü en çok etkileşim aldı? (grafik)

### Entegrasyonlar (Demo İçin Mock)
- F1 → Trend verisini takvime ekler
- F8 → Yorum analizini performans özetine ekler
- F6 → Duygu analizi uyarılarını panele taşır

## Araştırma Notları

### Referans Ürünler
- Buffer
- Later
- Hootsuite
- Metricool (Türkiye'de yaygın)

### Mock Veri Yapısı
```json
{
  "kullanici": "içerik_üreticisi_01",
  "platform": "instagram",
  "takipci": 12500,
  "son_30_gun": {
    "toplam_gonderim": 18,
    "ortalama_begeni": 340,
    "ortalama_yorum": 22,
    "en_iyi_gun": "Salı",
    "en_iyi_saat": "19:00"
  }
}
```

### YZ Karar Mantığı
- "En iyi zaman" → mock veriden hesaplanır, LLM yorumlar
- "Ne paylaşmalısın" → F1 trend verisi + mevcut performans + hedef
- Raporlama dili → sade, emoji'siz, net Türkçe

## Kapsam Dışı
- Gerçek OAuth / platform bağlantısı
- Otomatik paylaşım (publish) özelliği
- Ücretli API kullanımı
- Mobil uygulama

## Demo Senaryosu
```
Giriş: Mock Instagram hesabı verisi
Çıkış:
  → "Bu hafta Salı ve Perşembe 19:00'da Reel paylaş"
  → "Son carousel'ların etkileşimi düştü, format değiştir"
  → Haftalık 7 günlük takvim kartları
```
