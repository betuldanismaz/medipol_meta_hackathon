# F7 — Algoritma Manipülasyonu & Oyunlaştırma (Platform = Tuval)
**Sorumlu:** Ömer

## Modül Özeti
Sosyal medya algoritmalarını pasif tüketim aracından aktif yaratıcı bir platforma dönüştüren sistem. Kullanıcılar algoritmayı "oynayarak" yönlendirir, platform bir tuval, kullanıcılar ise sanatçı olur. Topluluk etkileşimini oyunlaştırır.

## Problem Tanımı
Sosyal medya algoritmaları kullanıcıyı pasif tüketiciye dönüştürür. Kullanıcılar ne göreceklerini kontrol edemez, kendi içerik deneyimlerini şekillendiremez. Bu da bağımlılık ve çaresizlik hissi yaratır.

## Çözüm Yaklaşımı
Algoritmayı "kırmak" değil, "eğitmek" — ama eğlenceli bir şekilde:
1. Kullanıcı "Feed Tasarımcısı" rolüne girer
2. Belirli eylemlerle algoritmayı yönlendirir (mekanik oyun gibi)
3. Toplulukla birlikte kolektif bir feed "tuval" oluşturur
4. YZ, kullanıcının tercihlerini öğrenir ve görselleştirir

## Teknik Mimari

### Oyunlaştırma Mekanikleri

**Bireysel Seviye:**
- "Temizle" mekaniği: istemediğin içerik türlerini sürükle-bırak ile kaldır
- "Keşfet" görevi: algoritmana hiç girmemiş bir konu seç, YZ seni orada yönlendirir
- "Denge skoru": feed'inin çeşitlilik puanı (tek tip içerik = düşük puan)
- "Algoritma haritası": feed'ini oluşturan faktörlerin görsel ağı

**Topluluk Seviyesi:**
- "Kolektif tuval": topluluk üyelerinin feed tercihleri birleşince ortaya çıkan tema
- "Akım yarışması": en yaratıcı feed tasarımı topluluk oylamasıyla seçilir
- "Zincir içerik": kullanıcı A içerik üretir → B devam eder → C sonlandırır (algoritmik yönlendirme ile)

**YZ Rolü:**
- Kullanıcı tercihlerini analiz eder
- "Bu ay feed'in %70 haber, %20 eğlence, %10 sanat — bu dengeli mi?" sorar
- Öneriler sunar: "Bir hafta tam zıt bir feed dene ve nasıl hissettiğini gör"

### Girdiler
- Mock feed tercihleri
- Kullanıcı eylemleri (beğeni, kaydet, atla, engelle)
- Topluluk verisi (anonim, mock)

### Çıktılar
- Etkileşimli algoritma haritası (görsel)
- Feed "kişilik profili" (metin + görsel)
- Topluluk tuval gösterimi
- Önümüzdeki hafta için feed tahmini

## Araştırma Notları

### İlham Kaynakları
- r/place (Reddit'in kolektif piksel tuval projesi) — topluluk yaratıcılığı
- Twitch Plays Pokemon — kolektif kontrol mekaniği
- Duolingo streak sistemi — davranış değişikliği için oyunlaştırma
- TikTok "Not Interested" butonu — kullanıcı kontrol hissi

### Akademik Referanslar
- "Algorithmic Awareness" araştırmaları (kullanıcılar algoritmayı ne kadar anlıyor)
- Self-Determination Theory (özerklik, yeterlilik, bağ) — motivasyon
- "Meaningful Choice" oyun tasarımı prensipleri

### Teknik Yaklaşım
```
Mock feed verisi
    → Kullanıcı eylemleri (drag-drop, butonlar)
    → Preference vektörü güncelleme
    → YZ ile feed simülasyonu
    → Görsel algoritma haritası güncelleme
    → Topluluk verisine katkı (anonim)
```

### Görselleştirme Fikirleri
- Kuvvet yönlendirmeli ağ grafiği (D3.js force graph)
- Isı haritası (hangi içerik türü ne sıklıkla görünüyor)
- Zaman çizelgesi (feed'in değişimi)
- "Tuval" metaforu: farklı renklerde içerik türleri, kullanıcı fırçası ile düzenler

## Kapsam Dışı
- Gerçek platform API manipülasyonu (teknik olarak imkansız, kapsam dışı)
- NFT veya kripto entegrasyonu
- Gerçek para ödüllü yarışmalar
- Kullanıcı sıralama/rekabet sistemleri

## Demo Senaryosu
```
Deneyim:
  1. Kullanıcı "Feed Tasarımcısı" paneline girer
  2. Önünde 20 içerik kartı var (renkli, kategorilere göre)
  3. Sürükle-bırak ile feed'i yeniden düzenler
  4. YZ: "Bu düzenlemeyle feed'in %60 daha çeşitli oldu"
  5. "Topluluk tuvali"nde diğer kullanıcıların tercihleri mozaik görsel olarak gösterilir
  6. Algoritma haritası: beğeni → haber → siyaset zinciri görsel olarak kırılıyor
```
