
## Hemen yapmanız gereken tek şey — API contract

Tablo gördünüz. Şu an Ömer ve Emir 15 dakika otursun, o 4 endpoint'in giriş/çıkış formatını bir kağıda yazıp fotoğraflasın. Bunu yapmadan Betül ve Emre boşa kod yazar.

Örnek format:
```json
GET /api/match-score?inf_id=1&biz_id=3
→ { "score": 78, "reasons": ["Moda nişi örtüşüyor", "10K-50K tier uygun"] }
```

Betül bu response'u alır almaz UI'ı bağlayabilir. Emir henüz gerçek algoritmasını yazmadan, Ömer `return {"score": 75, "reasons": ["test"]}` dönen mock bir endpoint yazar — Betül bloklanmaz.

Bu pattern adı: **contract-first geliştirme.** Hackathon'da çoğu ekip bunu yapmaz, senkronizasyon sorunuyla 2. saatte zaman kaybeder. Siz ilk saatte çözün.

Başka netleşmesini istediğiniz bir şey var mı?
