# F4 — Otomatik Pozitif Dil Moderasyonu
**Sorumlu:** Emre

## Modül Özeti
Sosyal medya yorumlarında tespit edilen kötü/zorbalık içeren kelimeleri ve ifadeleri, anlamı koruyan ama pozitif dile çeviren bir YZ moderasyon sistemi. "Salak" → "Seni seviyorum" gibi yaratıcı dönüşümler.

## Problem Tanımı
Kötü kelime filtreleri genellikle sansür (***) uygular. Bu hem iletişimi bozar hem de kullanıcıyı daha agresif yapar. Alternatif yaklaşım: kelimenin enerjisini al, pozitife çevir — kullanıcı fark etmeden zararsız hale gelir.

## Çözüm Yaklaşımı
1. Yorum/metin girer
2. Zararlı ifadeler tespit edilir (sınıflandırma)
3. Her zararlı ifade bağlama uygun pozitif bir ifadeyle değiştirilir
4. Orijinal metin ile dönüştürülmüş metin yan yana gösterilir

## Teknik Mimari

### Dönüşüm Mantığı
Bu sistemin özü "anlam koruyarak ton değiştirme":
- Hakaret → Şefkatli eleştiri
- Tehdit → Empati ifadesi
- Aşağılama → Teşvik
- Küfür → Nötr ifade

### Girdiler
- Ham yorum metni
- Platform bağlamı (isteğe bağlı): YouTube / Instagram / X
- Moderasyon seviyesi: Yumuşak / Orta / Katı

### Çıktılar
- Orijinal metin (solda/üstte)
- Dönüştürülmüş metin (sağda/altta, yeşil vurgu)
- Tespit edilen zararlı ifadeler listesi
- Dönüşüm gerekçesi (kısa açıklama)
- Zararlılık skoru (0-10)

### Örnek Dönüşümler
| Orijinal | Dönüştürülmüş | Gerekçe |
|----------|---------------|---------|
| "Salak mısın?" | "Bunu anlamaman beni şaşırttı" | Soru korundu, hakaret kaldırıldı |
| "Seni sevmiyorum" | "Seninle aramda mesafe var" | Duygu korundu, saldırganlık azaldı |
| "Defol git" | "Bu konuda farklı düşünüyoruz" | Ret ifadesi korundu |
| "Aptal" | "Farklı bir bakış açısına ihtiyacın var" | Eleştiri korundu |

## Araştırma Notları

### İlgili Akademik Çalışmalar
- "Positive Reframing" psikoloji literatürü
- Motivasyonel görüşme (Motivational Interviewing) teknikleri
- NLP ile duygu tonu transferi (style transfer) araştırmaları

### Teknik Yaklaşımlar
**Yaklaşım A — Kural Tabanlı + LLM:**
- Kötü kelime listesi (seed list) → hızlı tespit
- LLM → bağlama uygun dönüşüm üretimi
- Avantaj: hızlı, öngörülebilir
- Dezavantaj: yeni argolar kaçabilir

**Yaklaşım B — Tam LLM:**
- Metin direkt LLM'e gider, dönüşüm orada üretilir
- Avantaj: bağlam anlayışı çok daha iyi
- Dezavantaj: yavaş, pahalı, tutarsız olabilir

**Öneri:** Yaklaşım A (demo için ideal)

### Türkçe'ye Özel Zorluklar
- Argolar ve kısaltmalar hızla değişiyor (nbş, amk vb.)
- Bağlaç ve ek yapısı LLM için karmaşık
- Alıntı / ironi tespiti zor ("çok zeki birisisin" alaycı olabilir)
- Çözüm: Türkçe zorbalık veri seti araştır (HatEval, OffComTR)

### Veri Setleri
- OffComTR: Türkçe saldırgan yorum veri seti
- HatEval 2019: çok dilli nefret söylemi
- Kendi oluşturulacak seed list (demo için 200-500 kelime yeterli)

## Kapsam Dışı
- Sesli içerik moderasyonu
- Görsel/video moderasyonu (F5'e yakın ama değil)
- Gerçek zamanlı platform entegrasyonu
- Kullanıcı başına öğrenme (kişiselleştirilmiş moderasyon)

## Demo Senaryosu
```
Giriş: "Bu videoyu yapan kim bilmiyorum ama ciddi salak biri, 
        hiç araştırmadan saçmalıyor"

Çıkış:
  Zararlılık skoru: 6/10
  Tespit: "salak" (hakaret), "saçmalıyor" (aşağılama)
  
  Dönüştürülmüş:
  "Bu videoyu yapan kim bilmiyorum ama daha fazla araştırma 
   yapabilirdi, bazı noktalar eksik kalmış"
   
  Değişen: salak → daha fazla araştırma yapabilirdi
           saçmalıyor → bazı noktalar eksik kalmış
```
