# Proje Planı — InfluMatch

> Güncelleme: 2026-05-17 — Ranking sistemi mimarisi eklendi.

---

## Faz 1 — Contract-First MVP (tamamlandı)

İlk hackathon çıkışı için: 4 endpoint'lik API contract, mock data, basit swipe UI.

### Hemen yapmanız gereken tek şey — API contract

Tablo gördünüz. Şu an Ömer ve Emir 15 dakika otursun, o 4 endpoint'in giriş/çıkış formatını bir kağıda yazıp fotoğraflasın. Bunu yapmadan Betül ve Emre boşa kod yazar.

Örnek format:
```json
GET /api/match-score?inf_id=1&biz_id=3
→ { "score": 78, "reasons": ["Moda nişi örtüşüyor", "10K-50K tier uygun"] }
```

Betül bu response'u alır almaz UI'ı bağlayabilir. Emir henüz gerçek algoritmasını yazmadan, Ömer `return {"score": 75, "reasons": ["test"]}` dönen mock bir endpoint yazar — Betül bloklanmaz.

Bu pattern adı: **contract-first geliştirme.** Hackathon'da çoğu ekip bunu yapmaz, senkronizasyon sorunuyla 2. saatte zaman kaybeder. Siz ilk saatte çözün.

**Durum (2026-05-17):**
- Frontend: ✅ Swipe UI, MatchfluenceApp, mock data ile çalışıyor.
- Backend: ⚠️ Sadece iskelet (health endpoint). `matching.py` (kural tabanlı skor) hazır ama endpoint'e bağlı değil.
- 4 endpoint contract'ı (`/api/profiles`, `/api/swipe`, `/api/match-score`, `/api/matches`) frontend'in beklediği şekilde tanımlı — Faz 2'de implement edilecek.

---

## Faz 2 — Ranking Sistemi (Aktif)

Dışarıdan gelecek eğitilmiş bir XGBoost ranking modelini backend'e entegre eden **retrieval + ranking + distribution** pipeline'ı kurulur. Detaylı plan ayrı tutulur (`~/.claude/plans/imdi-frontendi-ve-backendi-eager-breeze.md`); burada özet.

### Hedef

1. **İşletme akışında:** İşletmenin aktif collab listing'i için, retrieval ile aday influencer'lar bulunur → XGBoost ile rank edilir → top N influencer kartı frontend'e gönderilir.
2. **Influencer akışında:** Influencer için, retrieval ile aday collab listing'leri bulunur → aynı model ile rank → top N listing kartı.
3. **Tek model, çift yön:** Aynı `(influencer, listing)` pair skoru her iki akışta da kullanılır — sadece "neyi sıralıyoruz" değişir.

### Eğitim modeli (extern, `untitled24.py` Colab notebook'u)

- **Algoritma:** `XGBClassifier(objective="multi:softprob", num_class=3, n_estimators=300, max_depth=4, learning_rate=0.05, tree_method="hist")`
- **Sınıflar:** 0=kotu_match, 1=orta_match, 2=iyi_match (synthetic-labeled)
- **Çıktı:** `xgboost_match_ranker.joblib` + `xgboost_match_ranker_metadata.json` (feature_cols listesi metadata'da — runtime'da bu sırayla feature dict → numpy matrix dönüşür)
- **Reasons:** Kural tabanlı (notebook Hücre 17/18'de hazır), backend birebir kopyalar
- **Embedding YOK:** sentence-transformers, pgvector kullanılmıyor. Tüm pair feature'ları jaccard / haversine / exp decay / string match.

### Mimari (özet)

```
Frontend → /api/profiles?role=...&context_id=...
            ↓
         retrieval.py  (PostGIS DWithin + sektör + tier + active filter → top 100-200)
            ↓
         feature_extractor.py  (notebook'taki feature'larla birebir uyumlu)
            ↓
         predictor.py  (adapter pattern — XGBoostJoblibAdapter birincil, FallbackRule)
            ↓
         distribution.py  (seen filter + diversity + pagination)
            ↓
         serializers.py  (snake_case → camelCase, frontend type'a map)
            ↓
         Frontend ← RankedInfluencer[]
```

### Kritik karar noktaları

1. **Model esnek wrap:** `Predictor` Protocol + adapter pattern. Birincil: `XGBoostJoblibAdapter`. Model gelmeden `FallbackRuleAdapter` (mevcut `matching.py`) ile demo çalışır.
2. **Feature parity zorunlu:** Backend `feature_extractor.py` çıktısının feature isimleri ve hesaplama mantığı notebook'un `extract_features`'ına birebir uymalı — yoksa model.predict yanlış skor üretir. Notebook helper fonksiyonları (`jaccard`, `haversine_km`, `location_score_from_distance`, `tier_to_numeric`, `business_size_to_numeric`, `normalize_engagement_rate`, `budget_tier_match`) referans alınır.
3. **Veri hacmi (azaltılmış v1.5):** 20 influencer, 10 işletme, 20 collab listing, 300-500 post, 100-200 swipe, 40 match, 20 agreement, 1000 training pair.
4. **2-aşamalı retrieval:** Hard filter (PostGIS + sektör + tier + active) → top 100-200 → XGBoost rank → top 10.
5. **API schema:** Backend frontend'e uyar — response camelCase, mevcut `RankedInfluencer` / `CampaignInput` yapısı korunur. Backend içte snake_case kullanır, `serializers.py`'de çevirir.
6. **Seed export:** Backend seed scriptleri JSON export yapabilmeli (`scripts/export_for_training.py`) — Colab notebook'a yüklenecek zip'i üretir. data_özellikleri.md şeması zorunlu.

### Görev paylaşımı (revised)

| Kişi | Sorumluluk | Kritik dosyalar |
|------|-----------|-----------------|
| **Emir** | ML pipeline: predictor (adapter pattern), feature extractor, retrieval, ranking, embeddings, reasons üretici, training pairs scripti | `backend/app/ml/*.py`, `backend/scripts/seed/training_pairs.py` |
| **Ömer** | DB schema (models.py rewrite), Alembic migrations, seed orchestrator, 4 endpoint + ml/health, serializers (snake_case → camelCase), distribution | `backend/app/models.py`, `backend/app/routers/*.py`, `backend/app/serializers.py`, `backend/alembic/`, `backend/scripts/seed/__main__.py` |
| **Betül** | Frontend uyum: minimal düzeltmeler (engagementRate 0-1 scale, getProfiles query params), backend bağlandıktan sonra UX polish | `frontend/data/matchfluenceInfluencers.ts`, `frontend/lib/api.ts` |
| **Emre** | Docker compose'un PostGIS+pgvector image'ı, .env örnekleri, backend lokal/Docker entegrasyon testi | `docker-compose.yml`, `backend/.env.example` |
| **Mehmet** | Seed entity'lerinin gerçekçi içeriği (influencer bio, post caption, business açıklama), doğal afinite sinyali için organik post serileri | `backend/scripts/seed/influencers.py`, `posts.py`, `businesses.py` data |

### Uygulama sırası (~5-6 iş günü)

1. Foundation: `requirements.txt`, `database.py`, alembic init, docker-compose postgis image.
2. Models + Migration: `models.py` rewrite, ilk migration.
3. Seed taxonomy + entities (taksonomi, 20 inf, 10 biz).
4. Seed activity (posts, listings, embeddings pre-compute).
5. Predictor + FallbackRuleAdapter (model olmadan da çalışmalı).
6. Feature extractor (28 feature, cache).
7. Retrieval + Ranking + Distribution (wire up).
8. Serializers + Routers (4 endpoint + ml/health).
9. Frontend mini-fix + integration test.
10. Training pairs scripti + (model gelirse) load + verify.

### Out of scope (bu sprint)

- **Agent müzakere döngüsü** (gpt-5-nano LLM, max 10 tur) — match olduktan sonra `status='agent_negotiating'` set edilir, gerçek loop sonraki sprint.
- **Worker (çalışan) akışı** — aynı altyapı kullanılarak sonra eklenir.
- **Gerçek auth** — şimdilik `inf_id`/`biz_id` user_id olarak kabul.
- **Frontend influencer akışı UI'ı** (`ListingSwipeCards`) — backend hazır olduktan sonra.

### Detaylı plan

Bu fazın tam dosya yolları, schema detayları, dikkat edilmesi gerekenler ve end-to-end verification adımları:

`C:\Users\esrao\.claude\plans\imdi-frontendi-ve-backendi-eager-breeze.md`

---

## Faz 3 — Agent Müzakere + Worker Akışı (Planlanan)

- Eşleşme sonrası iki taraflı LLM agent (gpt-5-nano) müzakere döngüsü
- Max 10 tur, structured JSON anlaşma özeti (`response_format: json_schema`)
- Worker × job_listing için ayrı ranking pipeline veya aynı predictor altında yeni feature seti
- Gerçek auth (JWT)
- Frontend influencer-side UI (ListingSwipeCards komponenti)
