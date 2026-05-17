# F3 — Dezenformasyon & Deep Search Sistemi
**Sorumlu:** Emir

## Modül Özeti
Kullanıcıya sunulan bir iddia veya içerik için derin kaynak araştırması yapan, bilginin özünü çıkaran ve güvenilirlik skoru ile birlikte geri dönen bir YZ sistemi. Siber zorbalık içeriklerini de tespit eder.

## Problem Tanımı
Sosyal medyada yayılan yanlış bilgi hızla viral oluyor. Kullanıcılar neye inanacaklarını bilemez hale geliyor. Mevcut fact-check sistemleri yavaş, İngilizce ağırlıklı ve kullanıcı dostu değil.

## Çözüm Yaklaşımı
1. Kullanıcı bir iddia/metin yapıştırır veya URL girer
2. Sistem web search ile çoklu kaynak araştırması yapar
3. LLM kaynakları karşılaştırır, tutarsızlıkları bulur
4. "Doğruluk özeti" + "kaynak güvenilirlik raporu" döner
5. Siber zorbalık tespiti: içerik kişiye yönelik saldırı mı?

## Teknik Mimari

### Girdiler
- İddia metni veya URL (metin kutusu)
- Dil tercihi (TR / EN / Otomatik)
- Konu kategorisi (siyaset, sağlık, bilim, gündem)

### İşlem Akışı
```
İddia girişi
    → Web Search (en az 5 farklı kaynak)
    → Kaynak güvenilirlik değerlendirmesi
    → LLM ile çapraz karşılaştırma
    → Tutarsızlık tespiti
    → Özet rapor üretimi
    → Güvenilirlik skoru (0-100)
```

### Çıktılar
- Güvenilirlik skoru (0-100, renkli gösterim)
- "Doğru / Yanıltıcı / Belirsiz / Yanlış" etiketi
- Kaynak listesi (güvenilir / taraflı / güvenilmez)
- Özet açıklama (3-5 cümle, sade dil)
- Siber zorbalık tespiti: Evet/Hayır + gerekçe

### Siber Zorbalık Alt Modülü
- Kişiye yönelik hakaret, tehdit, utandırma tespiti
- Koordineli saldırı paterni tanıma (aynı anda çok sayıda benzer yorum)
- Çıktı: "Bu içerik siber zorbalık belirtisi taşıyor" uyarısı

## Araştırma Notları

### Fact-Check Kaynakları (Türkçe)
- Teyit.org (Türkiye'nin önde gelen fact-check platformu)
- AFP Fact Check Türkçe
- Reuters Fact Check

### Uluslararası Kaynaklar
- Snopes.com
- PolitiFact
- FullFact.org

### Güvenilirlik Skoru Mantığı
```
Yüksek güvenilirlik işaretleri:
+ Birden fazla bağımsız kaynak teyit ediyor (+20 puan her biri)
+ Akademik/resmi kurum kaynağı (+30 puan)
+ Fact-check sitesi doğrulamış (+25 puan)

Düşük güvenilirlik işaretleri:
- Tek kaynak (-30 puan)
- Kaynak bilinmiyor (-40 puan)
- Fact-check sitesi çürütmüş (-50 puan)
- Sosyal medya paylaşımı tek kanıt (-20 puan)
```

### Dikkat Edilecekler
- LLM halüsinasyon riski YÜKSEK bu modülde — her iddia mutlaka web search ile desteklenmeli, LLM kendi bilgisine dayanmamalı
- "Bilmiyorum" demek yanlış bilgi vermekten iyidir — sistem belirsiz durumlarda "Yeterli kaynak bulunamadı" demeli
- Türkçe kaynak eksikliği → EN kaynak + Türkçe özet stratejisi

## Kapsam Dışı
- Gerçek zamanlı sosyal medya taraması
- Video/görsel içerik doğrulama (deepfake tespiti)
- Otomatik içerik kaldırma
- Kullanıcı puanlama sistemi

## Demo Senaryosu
```
Giriş: "5G kuleleri COVID-19 yayıyor" iddiası
Süreç: 6 kaynak tarandı (WHO, Reuters, Teyit.org, BBC, CNN, Nature)
Çıkış:
  Skor: 2/100 (Kırmızı)
  Etiket: YANLIŞ
  Özet: "Bu iddia bilimsel olarak çürütülmüştür. WHO, CDC ve 
         bağımsız 47 çalışma herhangi bir ilişki olmadığını 
         doğrulamıştır."
  Kaynaklar: WHO (güvenilir), Reuters (güvenilir), Teyit.org (güvenilir)
```
