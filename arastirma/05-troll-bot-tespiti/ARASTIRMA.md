# F5 — Troll ve Bot Tespit & İzolasyon Sistemi
**Sorumlu:** Emre

## Modül Özeti
Sosyal medya hesaplarını analiz ederek troll veya bot olup olmadığını tespit eden ve bu hesapları izole bir "sandbox" ortamına yönlendiren YZ sistemi. Trollerle etkileşim kuran gerçek kullanıcılar korunur.

## Problem Tanımı
Troll ve botlar gerçek kullanıcıların deneyimini zehirliyor, koordineli saldırılar organize ediyor ve platformun güvenilirliğini düşürüyor. Mevcut sistemler ya çok yavaş ya çok saldırgan (yanlış pozitif yüksek).

## Çözüm Yaklaşımı
1. Hesap davranış verisi analiz edilir (mock data ile)
2. Bot/troll skoru hesaplanır
3. Yüksek skorlu hesaplar "sandbox" moduna alınır
4. Sandbox'ta hesap "normal çalışıyormuş" gibi görür ama kimseyle gerçekte etkileşim kuramaz

## Teknik Mimari

### Tespit Sinyalleri

**Bot Sinyalleri:**
- Paylaşım frekansı: günde 100+ paylaşım
- Profil oluşturma tarihi: < 30 gün + yüksek aktivite
- Takip/takipçi oranı: anormal (10.000 takip / 3 takipçi)
- İçerik tekrarı: aynı metin %90+ benzerlik
- Paylaşım saatleri: 7/24 düzenli aralıklar (insan değil)
- Profil fotoğrafı: GAN üretimi tespit (opsiyonel)

**Troll Sinyalleri:**
- Yorum içeriği: hakaret oranı yüksek (F4 ile entegre)
- Hedef çeşitliliği: çok farklı hesaplara saldırı
- Koordinasyon: aynı anda benzer içerik paylaşan hesap kümeleri
- Hesap yaşı + aktivite artışı: belirli olaylarla tetiklenen aktivite

### Sandbox Mekanizması
```
Normal kullanıcı → Platform
Bot/Troll (tespit edildi) → Sandbox sunucu
  Sandbox özellikleri:
  - Hesap kendi yorumlarını görür
  - Gerçek kullanıcılar bu yorumları görmez
  - Hesap "etkileşim alıyormuş" hisseder (ghost mode)
  - Sistem sessizce izole eder, ban atmaz
```

### Skor Hesaplama
```python
bot_skoru = (
    paylaşım_frekansı_puanı * 0.3 +
    içerik_tekrar_puanı * 0.25 +
    profil_yaşı_puanı * 0.2 +
    takip_oranı_puanı * 0.15 +
    saat_düzeni_puanı * 0.1
)

# 0-40: Normal kullanıcı
# 41-70: Şüpheli, izlemeye al
# 71-100: Bot/Troll → Sandbox
```

## Araştırma Notları

### Akademik Referanslar
- Botometer (OSoMe - Indiana University): bot tespit API'si
- "Bot or Not?" araştırmaları
- Twitter bot tespiti için açık veri setleri

### Benzer Sistemler
- Twitter/X'in "challenge" sistemi (CAPTCHA)
- Reddit'in bot karşıtı r/botwatch toplulukları
- Instagram'ın fake follower temizliği

### Yanlış Pozitif Riski
Bu sistemin en büyük riski: gerçek insanları bot sanmak.
Mitigasyon stratejileri:
- İlk aşamada sadece izleme (ban yok)
- Sandbox öncesi 48 saat "şüpheli" listesi
- Manuel inceleme kuyruğu (demo'da gösterilir)
- İtiraz mekanizması gösterimi

### Mock Veri Yapısı
```json
{
  "hesap_id": "usr_4821",
  "günlük_paylaşım": 340,
  "hesap_yaşı_gün": 12,
  "takip_sayısı": 15000,
  "takipçi_sayısı": 8,
  "içerik_tekrar_oranı": 0.87,
  "aktif_saatler": "7/24 düzenli",
  "hedef_çeşitliliği": "yüksek"
}
```

## Kapsam Dışı
- Gerçek platform API entegrasyonu
- IP bazlı ban sistemi
- Hukuki boyut (hesap kapatma kararları)
- GAN yüz tespiti (deepfake profil fotoğrafı)

## Demo Senaryosu
```
Analiz edilen: 10 mock hesap
Sonuç:
  3 hesap → Normal (skor < 40)
  4 hesap → Şüpheli (skor 41-70, izlemeye alındı)
  3 hesap → Bot/Troll (skor > 70, sandbox'a yönlendirildi)

Görsel: Hesap kartları + skor göstergesi + sandbox ikonu
```
