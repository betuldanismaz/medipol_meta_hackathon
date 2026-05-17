# Agent Bağlamı — Ömer
## Proje: InfluMatch — Influencer × İşletme Eşleştirme Platformu

Sen bu projenin **Backend Lead** geliştiricisin.
Görevin: FastAPI ile tüm API endpoint'lerini kurmak, mock veriyi servis etmek ve Emir'in YZ modülünü entegre etmek.

---

## Proje Özeti

**InfluMatch**, influencer'ların ve yerel işletmelerin (kafe, butik, dükkan) birbirini Tinder mantığıyla keşfettiği bir platformdur.
- Kullanıcı profil kartlarını görür, sağa/sola kaydırır
- Sağa kaydırma → backend swipe kaydeder → iki taraf da sağa kaydırdıysa match oluşur
- YZ (Emir'in modülü) her çift için 0–100 uyum skoru ve reasoning üretir
- Frontend (Betül + Emre) bu API'yi Next.js'ten tüketir

**Stack:**
- Backend: **FastAPI** (Python 3.11+), Uvicorn
- Veri: In-memory (dict/list) — gerçek DB yok, JSON dosyasından yükle
- YZ modülü: Emir yazar, sen `/api/match-score` endpoint'ine bağlarsın
- Port: `8000`, CORS: `http://localhost:3000` (Next.js)

---

## Senin Sorumlulukların

### Yapacakların (öncelik sırasıyla)

1. **FastAPI boilerplate** — CORS, router yapısı, startup
2. **Tüm endpoint'leri** önce mock, sonra gerçek veriyle doldur
3. **Swipe mantığı** — kim kime sağa kaydırdı, match kontrolü
4. **Emir'in match-score fonksiyonunu** `/api/match-score` endpoint'ine bağla
5. **Hata yönetimi** — 404, validation error, anlaşılır mesajlar

### Yapmadığın Şeyler (scope dışı)
- Gerçek veritabanı yok (SQLite bile şart değil)
- JWT / auth yok
- Dosya upload yok

---

## API Sözleşmesi (senin yazacakların)

```
GET  /api/profiles
→ [
    {
      "id": "inf_1",
      "name": "Ayşe Kaya",
      "type": "influencer",          // "influencer" | "business"
      "niche": "moda",
      "followers": 28000,
      "city": "İstanbul",
      "bio": "Sürdürülebilir moda içerikleri",
      "avatar_url": null
    }
  ]

POST /api/swipe
Body: { "user_id": "biz_1", "target_id": "inf_3", "direction": "right" }
→ { "match": false }
veya
→ { "match": true, "match_id": "match_abc123" }

GET  /api/match-score?inf_id=inf_1&biz_id=biz_2
→ { "score": 78, "reasons": ["Moda nişi örtüşüyor", "Follower tier uygun"] }

GET  /api/matches
→ [
    {
      "match_id": "match_abc123",
      "influencer": { ...profil },
      "business": { ...profil },
      "score": 78,
      "reasons": ["..."]
    }
  ]
```

---

## Dosya Yapısı (senin alanın)

```
backend/
├── main.py               ← FastAPI app, CORS, router include
├── routers/
│   ├── profiles.py       ← GET /api/profiles
│   ├── swipe.py          ← POST /api/swipe
│   ├── matches.py        ← GET /api/matches
│   └── score.py          ← GET /api/match-score (Emir'in fonksiyonu buraya bağlanır)
├── data/
│   └── mock_data.json    ← Mehmet'in hazırladığı JSON buraya koyulur
├── models.py             ← Pydantic modeller (Profile, SwipeRequest, MatchResult)
├── state.py              ← In-memory store (swipe kayıtları, match listesi)
└── requirements.txt
```

---

## Kritik Kodlar

### main.py başlangıcı

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import profiles, swipe, matches, score

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(profiles.router, prefix="/api")
app.include_router(swipe.router, prefix="/api")
app.include_router(matches.router, prefix="/api")
app.include_router(score.router, prefix="/api")
```

### state.py (in-memory store)

```python
# Global state — hackathon için yeterli
swipes: dict[str, list[str]] = {}   # user_id → [sağa kaydırılan id'ler]
matches: list[dict] = []

def record_swipe(user_id: str, target_id: str) -> bool:
    swipes.setdefault(user_id, []).append(target_id)
    # Karşılıklı sağa kaydırma kontrolü
    return user_id in swipes.get(target_id, [])
```

---

## Emir ile Senkronizasyon

Emir `matching.py` adında bir modül yazar. Sen bunu şöyle bağlarsın:

```python
# routers/score.py
from matching import calculate_score   # Emir'in fonksiyonu

@router.get("/match-score")
def match_score(inf_id: str, biz_id: str):
    inf = get_profile(inf_id)
    biz = get_profile(biz_id)
    return calculate_score(inf, biz)
```

Emir modülünü bitirene kadar mock dön:
```python
return {"score": 75, "reasons": ["Test verisi"]}
```

---

## Öncelik Sırası (4 saat)

| Saat | Görev |
|------|-------|
| 0:00–0:30 | main.py + CORS + requirements.txt, uvicorn çalışıyor |
| 0:30–1:00 | Tüm endpoint'ler mock veri döner (Mehmet'in JSON'u henüz gelmeden dummy) |
| 1:00–1:30 | mock_data.json gelince profiller gerçek veriden döner |
| 1:30–2:00 | Swipe mantığı + match kontrolü çalışıyor |
| 2:00–2:15 | Frontend ile entegrasyon testi |
| 2:15–3:00 | Emir'in match-score modülü gelince entegre et, son bug fix |
| 3:00–4:00 | Stabil tut, demo sırasında çalışır halde olsun |

---

## Kritik Notlar

- **İlk 30 dakika:** Endpoint'ler `{"status": "ok"}` dönsün bile olur — Betül'ün bloklanmaması önemli
- **Veri yükleme:** JSON dosyasını startup'ta bir kere yükle, global liste tut
- **Demo için:** Sunumda API çağrıları terminalde görünür olsun — `uvicorn --reload` çalıştır
- **Jüri sorusu:** "Backend nasıl çalışıyor?" → Swagger UI (`/docs`) göster, otomatik geliyor
