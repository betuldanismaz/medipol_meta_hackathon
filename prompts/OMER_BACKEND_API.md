# Ömer — Backend FastAPI Prompt

> META_PROMPT_HALLUSINASYON_ONLEME.md'yi önce ekle, sonra bunu kullan.

---

## Görev Promptu

```
Ömer olarak çalışıyorum. Görevim: Python 3.11 + FastAPI ile
influencer-işletme eşleştirme backend'i.

YAPILACAKLAR (öncelik sırasıyla):
1. FastAPI boilerplate + CORS middleware
2. Mock JSON'dan influencer ve işletme listesi dönen endpoint
3. POST /api/swipe → in-memory dict'te sakla, mutual match kontrolü yap
4. GET /api/matches → her iki tarafın sağ kaydırdığı eşleşmeleri döndür
5. Hata mesajları: 404, 422 için anlaşılır JSON yanıt

API SÖZLEŞMESI (değiştirme):
  GET  /api/profiles    → List[Profile]
  POST /api/swipe       → {user_id: str, target_id: str, direction: "left"|"right"}
                          yanıt → {match: bool, match_id?: str}
  GET  /api/match-score → ?inf_id=&biz_id= (Emir yazar, sen sadece route ekle)
  GET  /api/matches     → List[Match]

VERİ MODELLERİ:
Profile: id, name, niche, followers, location, score, avatar_url
Match:   id, influencer_id, business_id, matched_at, score

IN-MEMORY DEPOLAMA (veritabanı yok):
swipes: dict[str, dict[str, str]]  # {user_id: {target_id: direction}}
matches: list[dict]

KISITLAR:
- Veritabanı yok — her şey bellek içinde
- Gerçek auth yok — user_id query param olarak alınır
- pip install fastapi uvicorn pydantic komutunu ver
- Sunucu: uvicorn main:app --reload --port 8000

TAMAMLANMA KRİTERİ (saat 2 checkpoint):
- Tüm 4 endpoint çalışıyor
- CORS: Next.js localhost:3000'e izin veriyor
- Mock veri Mehmet'in JSON'ından geliyor
- Mutual match doğru tespit ediliyor
```

---

## Hızlı Endpoint Şablonu

```
Şu endpoint'i yaz:
  Method: [GET/POST]
  Path: /api/[path]
  Input: [Pydantic model veya query params]
  Output: [dönen yapı]
  Özel mantık: [varsa açıkla]

- Type annotation kullan
- HTTPException ile hata fırlat
- Docstring yazma — endpoint adı yeterli
```
