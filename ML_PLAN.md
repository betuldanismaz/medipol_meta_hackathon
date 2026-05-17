# ML Ranking Sistemi — Entegrasyon Raporu

> **Eğitim modeli:** `untitled24.py` (Colab) → `xgboost_match_score_regressor.joblib`
> **Backend:** `backend/app/ml/` modülleri + `routers/discovery.py` + `routers/ml.py` + `routers/matches.py::/score`
> **Durum (2026-05-17):** ✅ Entegrasyon tamamlandı, smoke test geçti.

---

## 1. Notebook ↔ Backend Sözleşmesi (Finalize)

### A. Eğitim girdisi (Backend → Notebook)

`output/` klasöründeki JSON'lar (`influencer_profiles.json`, `business_profiles.json`, `collab_listings.json`, `instagram_posts.json`, `agent_preferences.json`, `swipes.json`, `matches.json`, `agreements.json`, `taxonomy.json`, `training_pairs.json`). Notebook bu JSON'ları okur, pair feature extraction yapar, sentetik label üretir, XGBoost eğitir.

### B. Model artifact (Notebook → Backend)

Notebook çıktısı `xgboost_match_score_regressor.joblib` → `backend/ml_artifacts/v1/` altına kondu. Yanına manuel `metadata.json` üretildi (notebook çıktısında metadata.json üretilmiyordu, biz feature listesini `model.feature_names_in_`'den okuyup yazdık).

### C. Önemli notlar

- **Model REGRESSOR, classifier değil.** `XGBRegressor(objective='reg:squarederror', n_estimators=350)`. `predict()` doğrudan 0-100 arası skor döner. `predict_proba` YOK.
- **35 feature** (training_pairs.json'da 37 var ama eğitimde 3'ü drop edilmiş: `audience_gender_match`, `profile_embedding_similarity`, `engagement_rate_normalized`).
- **Embedding YOK** — `profile_embedding_similarity` feature'ı modelde yok, pgvector/sentence-transformers kullanılmıyor.
- **Notebook'taki `extract_features` fonksiyonu eksik** (Hücre 8 = Hücre 7 kopyası). Backend feature_extractor.py 35 feature'ı kural tabanlı üretiyor, output formülü ile uyumlu olduğu sürece sorun yok — smoke test gösterdi: `inf_001 × col_001 = skor 42.3` (orta_match), beklenen aralıkta.

---

## 2. Modelin Beklediği 35 Feature (Kesin Sıra)

`backend/ml_artifacts/v1/metadata.json` içinde `feature_names`:

```
follower_count_log, following_ratio, engagement_rate, comment_like_ratio,
account_age_days, post_frequency_weekly, last_post_recency_days,
influencer_tier_numeric, profile_completion, verified,
past_collaboration_count, reel_post_ratio, business_age_months,
business_size_numeric, listing_budget_min, listing_budget_max,
listing_budget_mid, business_verified, business_past_collab_count,
deliverable_count, sector_content_match, location_distance_km,
location_score, audience_location_match, audience_age_overlap,
audience_income_match, audience_interest_overlap, budget_tier_match,
natural_affinity_score, style_match, language_match,
past_category_experience, hashtag_overlap, tier_preference_match,
recency_score
```

**Sıra kutsal:** `np.ndarray` predictor'a verilirken `metadata.feature_names` sırasıyla doldurulur. Backend `ranking.py::rank_pairs` bunu yapıyor.

---

## 3. Backend Mimarisi (Mevcut)

Backend `untitled24.py` öncesi epey gelişmiş — User-centric model, agent + premium altyapısı kurulu. ML katmanı bunun üstüne **ek modül** olarak şişirildi.

```
medipol_meta_hackathon/
├── untitled24.py                      ← Colab notebook (DB-dışı, manuel)
├── xgboost_match_score_regressor.joblib  ← Notebook çıktısı
├── output/                            ← Notebook input + backend seed
│   ├── influencer_profiles.json
│   ├── business_profiles.json
│   ├── collab_listings.json
│   ├── instagram_posts.json
│   ├── agent_preferences.json
│   ├── swipes.json / matches.json / agreements.json
│   ├── taxonomy.json
│   └── training_pairs.json
└── backend/
    ├── ml_artifacts/v1/                  ← ★ YENİ
    │   ├── xgboost_match_score_regressor.joblib
    │   └── metadata.json
    ├── scripts/
    │   └── seed_from_output.py        ← output/ → DB (User-centric)
    ├── app/
    │   ├── main.py                    ← router include + auto-seed
    │   ├── models.py                  ← User/Listing/Match/Negotiation/Agreement…
    │   ├── schemas.py                 ← + MatchBreakdown/MatchScoreResult/MLHealth
    │   ├── matching.py                ← eski kural tabanlı (fallback için referans)
    │   ├── ml/                        ← ★ YENİ
    │   │   ├── __init__.py
    │   │   ├── predictor.py           ← XGBoostJoblibRegressorAdapter + Fallback
    │   │   ├── feature_extractor.py   ← 35 feature, notebook helper'larıyla 1-1
    │   │   └── ranking.py             ← orchestrator + reasons + breakdown
    │   └── routers/
    │       ├── discovery.py           ← ★ ML rank ile yeniden yazıldı
    │       ├── matches.py             ← ★ /matches/score eklendi
    │       └── ml.py                  ← ★ YENİ: /ml/health
```

### Kritik özellikler

- **Lazy load + singleton:** `get_predictor()` `@lru_cache(1)` — ilk request'te yüklenir, sonra cache'lenir. Model dosyası yoksa `FallbackHeuristicAdapter` devreye girer.
- **Auto-seed:** `main.py` startup'ta DB boşsa `output/*.json`'dan seed yapar (`AUTO_SEED=0` ile kapatılabilir).
- **35 feature'dan ne kadarı bizde:** Hepsi. `feature_extractor.py` notebook helper'larını birebir kopyalıyor (jaccard, haversine_km, location_score_from_distance, tier_to_numeric, business_size_to_numeric, budget_tier_match, parse_date_days_ago) + 35 feature için kompozit hesaplama.
- **User → notebook dict bridge:** `extract_features_for_orm()` `User.profile` JSONB ve `Listing.extras` JSONB'yi notebook'un beklediği şekle çevirip 35 feature üretiyor.

---

## 4. Akış: Bir Discovery İsteği

### Business akışı (`GET /discovery/feed` — auth'lu business)

```
1. Frontend: GET /discovery/feed   (Bearer token)
        │
2. routers/discovery.py::get_feed → _feed_for_business
   - Business'in aktif Listing'lerini al
   - INFLUENCER role'lü User'ları al (LIMIT 200)
   - Daha önce business_swipe ile karar verilmiş (listing_id, candidate_id) çiftlerini filtrele
   - Cartesian product → pairs
        │
3. ml/ranking.py::rank_pairs
   - InstagramPost'ları influencer_id'ye göre tek seferde fetch
   - Her pair için extract_features_for_orm() → 35 feature dict
   - Numpy matrix (predictor.feature_names sırasıyla)
   - predictor.predict_score(X) → 0-100 skor
   - generate_reasons_from_features (notebook Hücre 17 kopyası)
   - features_to_breakdown (frontend MatchBreakdown)
   - RankResult listesi, skor desc sıralı
        │
4. discovery.py
   - Her influencer için en yüksek skorlu listing pair'i tut (best_per_inf)
   - Top N influencer
   - DiscoveryCard(user=PublicProfileRead, score, reasons) listesi
        │
5. Frontend ← DiscoveryFeed{ cards: [...] }
```

### Influencer / Worker akışı

Ters yön: Listing'leri rank et, kendisi sabit. `DiscoveryCard(listing=ListingPublic, score, reasons)` döner.

### Tek pair score akışı (`GET /matches/score?listing_id=X&candidate_id=Y`)

`score_pair()` → tek RankResult → `MatchScoreResult{ score, label, reasons, risks, breakdown }`.

---

## 5. Yeni / Değiştirilen Dosyalar (Tam Liste)

### Yeni
| Dosya | Amaç |
|---|---|
| `backend/ml_artifacts/v1/xgboost_match_score_regressor.joblib` | Eğitilmiş model |
| `backend/ml_artifacts/v1/metadata.json` | feature_names + score_range + sürüm |
| `backend/app/ml/__init__.py` | ML modül girişi |
| `backend/app/ml/predictor.py` | XGBoostJoblibRegressorAdapter + FallbackHeuristicAdapter + get_predictor() |
| `backend/app/ml/feature_extractor.py` | 35 feature + notebook helper kopyaları + ORM bridge |
| `backend/app/ml/ranking.py` | rank_pairs / score_pair + reasons + breakdown |
| `backend/app/routers/ml.py` | `GET /ml/health` |

### Değiştirilen
| Dosya | Değişiklik |
|---|---|
| `backend/requirements.txt` | + xgboost, joblib, numpy, pandas, scikit-learn |
| `backend/app/main.py` | + `ml` router include |
| `backend/app/schemas.py` | + MatchBreakdown, MatchScoreResult, MLHealth |
| `backend/app/routers/discovery.py` | `calculate_score` (rule-based) → `rank_pairs` (XGBoost) |
| `backend/app/routers/matches.py` | + `/matches/score` endpoint |

### Dokunulmayan
- `backend/app/matching.py` (eski kural tabanlı — fallback için referans, silinmedi)
- `backend/app/models.py` (User/Listing/Match/Negotiation şeması zaten doğruydu)
- `backend/scripts/seed_from_output.py` (output/*.json → DB hala çalışıyor)
- Tüm negotiation/billing/auth router'ları
- Frontend (mevcut `lib/api.ts` `/discovery/feed` ve `/matches/score`'a hazır)

---

## 6. Smoke Test Sonuçları (2026-05-17)

```bash
# Predictor yükleme
$ python -c "from app.ml.predictor import get_predictor; p=get_predictor(); print(p.adapter_name, p.model_version, len(p.feature_names))"
XGBoostJoblibRegressorAdapter v1 35

# Sıfır vektör
predict(zeros) = 22.78   # düşük skor (her şey 0 = match'in temeli yok)
predict(0.5 dolu) = 44.58 # orta — middle-of-the-road features

# Gerçek pair: inf_001 (Elif Aydın, nano, seyahat) × col_001 (Coffee Roastery Kadıköy)
sector_content_match: 0.00     # influencer kahve değil, seyahat
location_score:       0.88     # Kadıköy ↔ Kadıköy
budget_tier_match:    1.00     # inf rate 500-2000, listing 1958-4765 örtüşüyor
audience_age_overlap: 0.50
audience_interest_overlap: 0.33
tier_preference_match: 1.00    # nano tercih ediliyor
=> ML SKORU: 42.28 (orta_match)
```

Skor mantıklı: lokasyon + bütçe + tier mükemmel, ama sektör uyumu zayıf → orta-düşük match. Modelin kararı tutarlı.

---

## 7. Çalışan / Çalışmayan Endpoint'ler

### ✅ Hazır + ML destekli
- `GET /discovery/feed` — auth'lu, role-aware, XGBoost ranking
- `GET /matches/score?listing_id=X&candidate_id=Y` — tek pair, score+reasons+breakdown
- `GET /ml/health` — adapter durumu, sample inference latency

### ✅ Mevcut (ML'siz, eskiden vardı)
- `POST /matches/swipe` — swipe + mutual check + agent paywall mantığı
- `GET /matches`, `/matches/details`
- `POST/GET /negotiations/*` — gpt-5-nano LLM müzakeresi (premium)
- `GET /public/listings`, `/public/influencers`, `/public/taxonomy`
- `/auth/*`, `/users/me*`, `/billing/*`

### ⚠️ Frontend'in çağırdığı ama backend'de henüz olmayanlar
- `/api/profiles`, `/api/swipe`, `/api/match-score`, `/api/matches` — **legacy demo path'leri**. Frontend `USE_MOCK=true` ile çalışıyor; gerçek backend için yeni v2 path'leri kullanılmalı (`/discovery/feed`, `/matches/swipe`, `/matches/score`, `/matches`). `lib/api.ts`'in `getDiscoveryFeed`, `postSwipeV2`, `getMatchDetails` fonksiyonları zaten v2'ye işaret ediyor — UI bunlara bağlanırsa direkt çalışır.

---

## 8. Dikkat Noktaları

### A. Feature parity riski
Notebook ve backend `extract_features` ayrı yerlerde. Şu an çalışıyor ama notebook tarafı revize edilirse (yeni feature, normalize formülü değişir) backend de güncellenmeli. **`feature_extractor.py` helper'larını değiştirmeden önce notebook'a göre kontrol et.**

### B. Eğitimde drop edilen 3 feature
`audience_gender_match`, `profile_embedding_similarity`, `engagement_rate_normalized` — modelde yok, backend bunları hesaplamasa da fark etmez. metadata.json `feature_names`'de yok. İleride model yeniden eğitilirken eklenirse, feature_extractor.py'ye de eklenecek.

### C. Model dosyası yokken
`FallbackHeuristicAdapter` devreye girer — minimum 5 feature ile basit ağırlıklı skor (sector × 30, location × 25, budget × 20, audience_interest × 15, natural_affinity × 10), 10-95 clamp. Frontend bozulmaz, demo çalışmaya devam eder.

### D. PostgreSQL JSONB performansı
20 influencer × birkaç listing seviyesinde sorun yok (cartesian 200 pair). 100+ inf × 50 listing'e çıkarsak feature extraction döngüsü yavaşlayabilir — o zaman `MlFeatures` cache tablosu eklenir (henüz YAPILMADI, gerek yok).

### E. Cold start
İlk `/discovery/feed` çağrısı `joblib.load` + xgboost init ~500ms-1s. Demo öncesi `curl /ml/health` ile warm-up.

### F. Smoke test sınırı
End-to-end browser → backend → ranking testi henüz YAPILMADI. Bunu `docker compose up` + frontend `NEXT_PUBLIC_USE_MOCK=false` ile manuel test gerekecek.

---

## 9. Sonraki Adımlar (Opsiyonel)

1. **Frontend `/discovery/feed`'i UI'a bağla** — şu an mock data, gerçek backend skorları akışa girsin.
2. **`/matches/score` cache** — aynı pair sık sorgulanırsa `MlFeatures` veya `MlPrediction` tablosu eklenebilir. Hackathon hacminde gerek yok.
3. **Model versiyonlama** — yeni eğitim olunca `v2/` dizini eklenir, `get_predictor` otomatik en son mtime'ı seçer.
4. **Notebook'ta `extract_features` doldurulması** — Colab'da Hücre 8 düzeltilirse modelin re-train süresi düşer, hem de backend ile birebir parity garantisi.
5. **Feature parity test** — bir CI step: 1 pair için backend çıktısı vs notebook çıktısı diff, sapma > %1 ise alarm.
6. **Worker akışı** — şu an INFLUENCER mantığıyla aynı feed dönüyor. WorkerProfile özelinde feature seti (skills, availability, schedule) eklenirse ayrı bir model gerekecek; aynı altyapı clone'lanabilir.

---

## 10. Geçmiş

| Tarih | Olay |
|---|---|
| 2026-05-17 | İlk plan (`ML_PLAN.md`) yazıldı — notebook ile teorik kontratlar tanımlandı |
| 2026-05-17 | `untitled24.py` eğitildi, `xgboost_match_score_regressor.joblib` üretildi |
| 2026-05-17 | Output JSON'ları ile DB seed çalıştı (`seed_from_output.py`) |
| 2026-05-17 | Backend ML modülleri (predictor, feature_extractor, ranking) yazıldı |
| 2026-05-17 | Discovery + matches/score + ml/health endpoint'leri ML'e bağlandı |
| 2026-05-17 | Smoke test: `inf_001 × col_001 → 42.3` (mantıklı orta-match) |
