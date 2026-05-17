# F8 — Yorum & Etkileşim Bazlı İçerik Öneri Sistemi
**Sorumlu:** Betül

## Modül Özeti
İçerik üreticisinin mevcut yorumlarını, etkileşim verilerini, güncel gündemi ve ekosistemi analiz ederek kişiselleştirilmiş yeni içerik fikirleri üreten YZ sistemi. "Takipçilerin ne istiyor?" sorusunu veriye dayalı yanıtlar.

## Problem Tanımı
İçerik üreticileri takipçilerinin ne istediğini tahmin etmeye çalışıyor. Yorum okumak zaman alıcı, sistematik değil ve bağlamdan yoksun. Gündem + takipçi isteği + kendi nişi üçgeninde doğru içerik bulmak çok zor.

## Çözüm Yaklaşımı
1. Üreticinin mevcut yorumları taranır (mock)
2. Takipçi talepleri, soruları ve tepkileri kategorize edilir
3. Güncel gündem (F1 ile entegre) göz önünde bulundurulur
4. YZ bu üç veri kaynağını birleştirir → içerik fikirleri üretir
5. Her fikir için: başlık, format, açıklama, tahminî etkileşim

## Teknik Mimari

### Veri Kaynakları

**Kaynak 1 — Yorum Analizi:**
- Soru yorumları: "bunu nasıl yaptın?" türü (talep = tutorial)
- Eleştiri yorumları: "şunu eksik bırakmışsın" (talep = derinlik)
- Beğeni yorumları: "bunu devam ettir!" (talep = seri içerik)
- Konu önerileri: "bir de şunu yap" (doğrudan talep)

**Kaynak 2 — Etkileşim Verisi:**
- Hangi içerik türü en çok kayıt aldı?
- Hangi başlıkta izleme süresi uzun?
- Hangi içerikte yorum/beğeni oranı yüksek?

**Kaynak 3 — Gündem & Ekosistem (F1):**
- Bu hafta nişiyle ilgili trending konular
- Rakip üreticilerin son içerikleri (boşluk analizi)
- Mevsimsel/dönemsel fırsatlar

### İşlem Akışı
```
Yorum verisi (mock)
    → Duygu + niyet analizi (LLM)
    → Talep kategorileri çıkar
    
Etkileşim verisi (mock)
    → Performans örüntüleri
    
Gündem verisi (F1'den)
    → Trend fırsatları

Üç kaynak → LLM sentezi → İçerik fikirleri (5-10 adet)
```

### Çıktı Formatı
```json
{
  "fikir_no": 1,
  "başlık_önerisi": "Pilates Reformer vs Mat: Hangisi Daha İyi?",
  "format": "Karşılaştırma videosu (8-12 dk)",
  "kaynak": "23 takipçi soru sordu + trending konu",
  "tahmini_etkileşim": "yüksek",
  "aciliyet": "bu hafta (trend düşmeden)",
  "ipucu": "İlk 30 saniyede reformer fiyatını söyle, merak yaratır"
}
```

## Araştırma Notları

### Yorum Analizi NLP Görevleri
- Intent detection (niyet tespiti): soru mu, eleştiri mi, talep mi?
- Named entity recognition: hangi konular bahsediliyor?
- Sentiment analysis (F6 ile örtüşür, burada içerik odaklı)
- Topic modeling: yorumlardaki ana temalar

### Mock Yorum Veri Seti
```json
[
  {"yorum": "Abla bir de reformer aletsiz evde pilates yap", "niyet": "talep", "konu": "pilates_evde"},
  {"yorum": "Bu kadar hızlı anlatma, adım adım göster", "niyet": "eleştiri", "konu": "format"},
  {"yorum": "Bunu hangi stüdyoda çektin?", "niyet": "soru", "konu": "lokasyon"},
  {"yorum": "Devamı ne zaman geliyor?!", "niyet": "beklenti", "konu": "seri_içerik"}
]
```

### F2 ile Entegrasyon
- F2 içerik takvimini yönetiyor → F8 o takvime içerik fikirleri besliyor
- F8 çıktısı → F2'ye otomatik taslak olarak gönderilir

### F1 ile Entegrasyon
- F1 trendleri → F8 bu trendleri takipçi talebiyle çapraz kontrol eder
- "Trend var ama takipçilerin ilgisi yok → düşük öncelik"
- "Trend var + takipçi talebi var → yüksek öncelik"

## Kapsam Dışı
- Otomatik içerik yazma/üretme (bu F1'in uzantısı olabilir ama kapsam dışı)
- Yayınlama otomasyonu
- Rakip hesap scraping (etik ve teknik olarak kapsam dışı)
- Video/görsel analizi

## Demo Senaryosu
```
Giriş:
  - Mock: 50 yorum (fitness içerik üreticisi)
  - Mock: Son 10 içerik performans verisi
  - F1'den: 3 trend konu

Çıkış: 7 içerik fikri, öncelik sırasına göre:
  1. 🔥 "Evde Reformer Alternatifi" (26 talep + trending)
  2. ⚡ "Adım Adım Başlangıç Serisi" (eleştirilerden çıktı)
  3. 📅 "Haftalık Program Paylaşımı" (takipçi isteği)
  ...
```
