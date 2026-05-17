# Emir — YZ Eşleştirme Mantığı Prompt

> META_PROMPT_HALLUSINASYON_ONLEME.md'yi önce ekle, sonra bunu kullan.

---

## Görev Promptu

```
Emir olarak çalışıyorum. Görevim: influencer–işletme eşleştirme skoru
ve "neden eşleştik?" açıklaması.

YAPILACAKLAR (öncelik sırasıyla):
1. match_score() Python fonksiyonu — 0–100 arası sayı döndür
2. Skoru oluşturan faktörleri belirle (aşağıya bakın)
3. GET /api/match-score endpoint'ini FastAPI'ye entegre et
   (Ömer route'u açar, sen iç mantığı yazarsın)
4. reasoning metni — 1-2 cümle, Türkçe, jüri için kritik

SKOR FAKTÖRLERİ (kural tabanlı — LLM zorunlu değil):
  niche_overlap    : influencer niche ile işletme sektörü örtüşüyor mu?
  follower_tier    : nano(<10k)=40, micro(10-100k)=70, macro(100k+)=90 puan
  engagement_proxy : follower sayısına göre tahmin (gerçek veri yok)
  location_match   : aynı şehir/bölge → bonus puan

Ağırlık örneği: niche*0.4 + tier*0.3 + engagement*0.2 + location*0.1

REASONING METNİ (opsiyonel LLM kullanımı):
Eğer Claude API kullanmak istersen sadece reasoning için kullan:
  - Model: claude-haiku-4-5-20251001 (hızlı, ucuz)
  - Input: skor faktörleri + influencer/işletme isimleri
  - Output: Türkçe 1-2 cümle açıklama
  - Timeout: 5 saniye — cevap gelmezse fallback metin kullan

FALLBACK (LLM çağrısı başarısız olursa):
  f"Niche örtüşmesi ve {follower_tier} seviyesi bu eşleşmeyi güçlü kılıyor."

API YANITI:
  {
    "inf_id": "inf_001",
    "biz_id": "biz_003",
    "score": 84,
    "reasoning": "Moda niche'i ve İstanbul lokasyonu bu eşleşmeyi öne çıkarıyor.",
    "factors": {
      "niche_overlap": 90,
      "follower_tier": 70,
      "location_match": 100
    }
  }

KISITLAR:
- Gerçek sosyal medya API'si yok — follower sayısı mock veriden gelir
- LLM kullanmak zorunlu değil; kural tabanlı yeterli
- pip install anthropic sadece LLM reasoning için gerekli

TAMAMLANMA KRİTERİ (saat 2:15):
- Skor 0-100 döndürüyor
- reasoning Türkçe, anlamlı
- Endpoint saat 2 checkpoint'te hazır
- "YZ burada tam olarak ne yapıyor?" sorusuna 30 saniyelik cevabın var
```

---

## Hızlı Skor Şablonu

```
Şu eşleştirme fonksiyonunu yaz:
  Influencer özellikleri: [niche, followers, location]
  İşletme özellikleri:    [sector, target_city, budget_tier]
  Döndür: score (int), reasoning (str), factors (dict)

- Kural tabanlı önce, LLM sonra (varsa)
- Tüm değerler 0-100 arasında normalize et
- Ağırlıkları sabit değişken olarak tanımla (sonra kolayca ayarlanabilsin)
```
