# F1 — Trend & Konu Araştırma Sistemi
**Sorumlu:** Betül

## Modül Özeti
İçerik üreticileri için gerçek zamanlı (veya yakın gerçek zamanlı) trend ve konu araştırması yapan, sonuçları medya formatında (başlık, özet, görsel öneri, hashtag) sunan bir YZ sistemi.

## Problem Tanımı
İçerik üreticileri hangi konuda içerik yapacaklarına karar vermek için saatler harcıyor. Trend olan konuları bulmak, rakip analizi yapmak ve içerik açığı tespit etmek manuel ve yavaş bir süreç.

## Çözüm Yaklaşımı
1. Kullanıcı niş/kategori girer (örn: "teknoloji", "yemek", "fitness")
2. Sistem web search + LLM ile güncel trendleri toplar
3. Her trend için medya kartı üretir: başlık, açıklama, tahmini etkileşim, önerilen format (reel/video/gönderi)

## Teknik Mimari

### Girdiler
- Kullanıcının niş kategorisi (metin)
- Coğrafya tercihi (TR / Global)
- Platform tercihi (Instagram, YouTube, TikTok, X)

### İşlem Akışı
```
Kullanıcı girdisi
    → Web Search (güncel trendler)
    → LLM ile içerik açığı analizi
    → Medya kartı üretimi (GenAI)
    → Kullanıcıya sunum
```

### Çıktılar
- Trend başlığı + açıklama
- Önerilen içerik formatı
- Tahmini etkileşim seviyesi (düşük/orta/yüksek)
- Örnek başlık seçenekleri (3 adet)
- Önerilen hashtag listesi

## Araştırma Notları

### Kullanılabilecek Veri Kaynakları
- Google Trends (kamuya açık)
- Twitter/X Trending (mock veya scraping)
- YouTube Trending API
- Reddit r/TurkeyTrends, r/worldnews
- Haber API'leri (NewsAPI.org — ücretsiz plan mevcut)

### Benzer Ürünler (Referans Al, Kopyalama)
- Exploding Topics
- SparkToro
- BuzzSumo (ücretli)

### Dikkat Edilecekler
- Trend verisi saatlik değişir — cache mekanizması şart
- "Trend" ile "viral olmuş ama geçmiş" ayrımı yapılmalı
- Türkçe içerik için Türkiye'ye özel trend kaynakları öncelikli

## Kapsam Dışı (Bu Modül İçin)
- Gerçek zamanlı API stream (demo = mock data)
- İçerik otomatik üretimi (bu F8'in işi)
- Hesap bağlantısı / yayınlama (bu F2'nin işi)
- Görsel üretimi

## Demo Senaryosu
```
Kullanıcı: "fitness" nişi, Türkiye, Instagram
Sistem → 5 trend konu kartı döner:
  1. "Pilates reformer" — Yüksek ilgi, Reel önerisi, 8 hashtag
  2. "Sessiz yürüyüş" — Orta ilgi, Carousel önerisi, 5 hashtag
  ...
```

## Kaynaklar & Okuma Listesi
- NewsAPI docs: https://newsapi.org/docs
- Google Trends Pytrends kütüphanesi: github.com/GeneralMills/pytrends
- "Content Gap Analysis" metodolojisi araştırılacak
