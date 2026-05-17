# ML Ranking Sistemi — Backend Entegrasyon Planı

> **Kaynak model:** `D:\Projects\Projects\MedipolHackathon\untitled24.py` (Colab notebook).
> **Hedef:** Bu notebook'tan çıkacak XGBoost modeli (`xgboost_match_ranker.joblib` + `xgboost_match_ranker_metadata.json`) backend'e entegre edilecek. Backend retrieval → ranking → distribution akışını bu modele dayandıracak.
> **Bu plan kenarda** — ana proje planı `PLAN.md`'de özet, detay burada.

---

## 0. Notebook'un Yaptığı Şey (Tek Cümlede)

Backend'in seed ettiği 4 JSON dosyasını (`influencer_profiles.json`, `business_profiles.json`, `collab_listings.json`, `instagram_posts.json`) alır → her (influencer, listing) çifti için ~20 feature hesaplar → kural tabanlı bir formülle sentetik 3-class label üretir (kotu/orta/iyi) → XGBoost classifier eğitir → `joblib` + `metadata.json` üretir.

**Embedding YOK.** Tüm feature'lar kural tabanlı: jaccard overlap, haversine mesafe, exp decay, mentioned_brands string match. pgvector, sentence-transformers — hiçbiri kullanılmıyor.

---

## 1. Backend ↔ Notebook Sözleşmesi

İki tarafın anlaşması gereken **iki kontrat** var:

### Kontrat A: Input JSON şeması (Backend → Notebook)

Backend bu 4 dosyayı `seed_data.zip` olarak üretip Colab'a yükler. Şema notebook Hücre 5'in beklediği yapı — `data_özellikleri.md`'nin alt kümesi.

#### `influencer_profiles.json` — array of objects
```json
{
  "id": "inf_001",
  "tier": "micro",                         // nano/micro/mid/macro/mega
  "follower_count": 45200,
  "engagement_rate": 0.042,                // 0-1 scale (0.042 = %4.2)
  "verified": false,
  "past_collaboration_count": 14,
  "past_collaboration_categories": ["cat_002", "cat_001"],
  "content_categories": ["cat_002", "cat_001", "cat_008"],
  "content_styles": ["sty_011", "sty_009"],
  "primary_language": "tr",
  "location": {
    "city": "İstanbul",
    "district": "Kadıköy",
    "lat": 40.9928,
    "lng": 29.0277
  },
  "audience_demographics": {
    "age_distribution":      { "18-24": 0.35, "25-34": 0.45, "35-44": 0.15, "45+": 0.05 },
    "gender_distribution":   { "female": 0.72, "male": 0.26, "other": 0.02 },
    "location_distribution": { "İstanbul": 0.55, "Ankara": 0.12, "İzmir": 0.08, "diğer": 0.25 },
    "income_distribution":   { "bütçe": 0.10, "orta": 0.60, "premium": 0.30 },
    "interest_tags": ["yemek", "seyahat", "moda"]
  },
  "rate_range": { "min": 2500, "max": 6000, "currency": "TRY" },
  "account_created_at": "2021-03-15",
  "last_active_at": "2026-05-16"
}
```

#### `business_profiles.json`
```json
{
  "id": "biz_001",
  "sector_id": "sec_002",
  "size": "küçük",                         // küçük/orta/zincir
  "business_age_months": 24,
  "verified": true,
  "past_collaboration_count": 6,
  "past_collaboration_categories": ["cat_002", "cat_001"],
  "brand_style": ["sty_001", "sty_011"],
  "location": {
    "city": "İstanbul",
    "district": "Kadıköy",
    "lat": 40.9885,
    "lng": 29.0258
  },
  "target_audience": {
    "age_buckets": ["25-34", "35-44"],
    "gender_preference": "all",
    "income_groups": ["orta", "premium"],
    "interest_tags": ["yemek", "kahve", "lifestyle"]
  }
}
```

#### `collab_listings.json`
```json
{
  "listing_id": "col_001",
  "business_id": "biz_001",
  "title": "...",
  "description": "...",
  "budget": { "min": 2000, "max": 5000, "currency": "TRY" },
  "deliverables": ["1 reel", "3 story"],
  "preferred_tiers": ["nano", "micro"],
  "target_categories": ["cat_002", "cat_001"],
  "preferred_styles": ["sty_011", "sty_001"],
  "preferred_audience": {
    "age_buckets": ["25-34"],
    "locations": ["İstanbul"]
  },
  "status": "active",
  "created_at": "2026-05-10"
}
```

#### `instagram_posts.json`
```json
{
  "post_id": "post_00123",
  "influencer_id": "inf_001",
  "type": "post",                          // post/reel/story_archived
  "media_type": "image",
  "caption": "...",
  "hashtags": ["#brunch", "#kadıköy"],
  "mentioned_brands": ["@cafekadikoy"],
  "location_tag": { "name": "Moda Sahil", "lat": 40.9854, "lng": 29.0277 },
  "posted_at": "2026-04-12T10:30:00Z",
  "metrics": { "likes": 1820, "comments": 94, "saves": 156, "reach": 8400 },
  "content_category": "cat_002",
  "content_style": "sty_011"
}
```

**Doğal afinite sinyali için kritik:** 5-6 influencer'a, profil sektörüyle uyumlu işletme türünden organik bahseden 3-4 post (mentioned_brands veya caption içinde işletme adı). Bunlar olmadan `natural_affinity_score` her zaman 0 çıkar, ayırt edici olmaz.

### Kontrat B: Model artifact'leri (Notebook → Backend)

Notebook bunları zip içinde indirir, backend `backend/ml_artifacts/xgboost_v1/` altına çıkarır:

```
backend/ml_artifacts/xgboost_v1/
├── xgboost_match_ranker.joblib              # joblib.dump(XGBClassifier)
├── xgboost_match_ranker_metadata.json       # feature_cols + classes + sizes
└── feature_importance.csv                   # debug için
```

**`xgboost_match_ranker_metadata.json` şeması (notebook Hücre 19):**
```json
{
  "model_type": "XGBClassifier",
  "task": "influencer_collab_match_classification",
  "classes": { "0": "kotu_match", "1": "orta_match", "2": "iyi_match" },
  "feature_cols": ["follower_count_log", "engagement_rate", "..."],
  "random_state": 42,
  "train_size": 700, "val_size": 150, "test_size": 150
}
```

**`feature_cols` sırası kutsal.** Backend inference'da numpy matrix bu sırayla kurulmalı; yoksa model garbage çıktı verir.

---

## 2. Feature Listesi (Notebook'tan Türetilmiş)

Notebook'taki `extract_features` fonksiyonu eksik (Hücre 8 yanlışlıkla Hücre 7'nin kopyası). Ancak sentetik label formülü (Hücre 9) ve reason generator (Hücre 17) hangi feature'ların olması gerektiğini sızdırıyor.

### Kesin var olan 11 feature (sentetik label formülünden)
1. `sector_content_match`        — jaccard(influencer.content_categories ↔ business.target_audience.interest_tags + sector_id mapped categories)
2. `location_score`              — `exp(-haversine_km / 10)` (notebook'un `location_score_from_distance`)
3. `audience_location_match`     — `influencer.audience_demographics.location_distribution[business.location.city]` (0-1)
4. `audience_age_overlap`        — jaccard(business.target_audience.age_buckets ↔ keys(influencer.audience.age_distribution))
5. `audience_interest_overlap`   — jaccard(influencer.audience.interest_tags ↔ business.target_audience.interest_tags)
6. `budget_tier_match`           — notebook'un `budget_tier_match(listing.budget.min/max, inf.rate_range.min/max)` — 0/0.5/1
7. `natural_affinity_score`      — geçmiş post mentioned_brands + caption metni içinde işletme adı/sektörü geçme oranı (kural tabanlı)
8. `engagement_rate`             — influencer.engagement_rate (label formülü `normalize_engagement_rate` ile 0.08'e böler)
9. `tier_preference_match`       — `1 if influencer.tier in listing.preferred_tiers else 0`
10. `style_match`                — jaccard(influencer.content_styles ↔ business.brand_style)
11. `recency_score`              — son post'tan bu yana geçen güne göre exp decay (`exp(-days/14)` gibi)

### Önerilen ek feature'lar (label formülünde yok ama yararlı, eğitim setine eklenecek)
12. `follower_count_log`         — `log10(follower_count)` (data_özellikleri.md §2.2)
13. `following_ratio`            — `following_count / follower_count` (fake follower proxy)
14. `comment_like_ratio`         — `avg_comments / max(avg_likes, 1)` (fake engagement proxy)
15. `account_age_days`           — `now - account_created_at`
16. `post_frequency_weekly`      — son N post / span (notebook'un `summarize_posts_for_influencer` zaten hesaplıyor)
17. `last_post_recency_days`     — yine summarize'dan
18. `influencer_tier_numeric`    — `tier_to_numeric` (nano=1, micro=2, mid=3, macro=4, mega=5)
19. `verified` (boolean → 0/1)
20. `past_collaboration_count`
21. `reel_post_ratio`            — summarize'dan
22. `business_age_months`
23. `business_size_numeric`      — küçük=1, orta=2, zincir=3
24. `listing_budget_min`, `listing_budget_max`, `listing_budget_mid`
25. `business_verified`
26. `business_past_collab_count`
27. `deliverable_count`          — `len(listing.deliverables)`
28. `audience_gender_match`      — listing.preferred_audience'a gender varsa, influencer kitle dağılımıyla overlap
29. `audience_income_match`      — jaccard(business.target_audience.income_groups ↔ keys(influencer.audience.income_distribution))
30. `language_match`             — `1 if influencer.primary_language == "tr" else 0`
31. `past_category_experience`   — `1 if any(c in influencer.past_collaboration_categories for c in listing.target_categories) else 0`
32. `hashtag_overlap`            — jaccard(post hashtag'leri ↔ business sektörünün hashtag grubu)

**Hedef:** 25-32 feature. Eksik olanı `0`'la doldurmak (`df.fillna(0)`) notebook'ta zaten yapılıyor — yani 11'i minimum, üstü bonus.

---

## 3. Notebook'a Eklenecek `extract_features` (Hücre 8 düzeltmesi)

Eksik fonksiyon. Aşağıdaki kod parçası notebook Hücre 8'in **doğru** içeriği. Colab'da kopyala-yapıştır.

```python
"""Hücre 8 — Pair feature extraction (DOĞRU)"""

# Sektör → kategori mapping (yaklaşık)
SECTOR_TO_CATEGORIES = {
    "sec_001": ["cat_002"], "sec_002": ["cat_002"], "sec_003": ["cat_002"],
    "sec_004": ["cat_002"], "sec_005": ["cat_002"], "sec_006": ["cat_002"],
    "sec_007": ["cat_003"], "sec_008": ["cat_003"], "sec_009": ["cat_003"], "sec_010": ["cat_003"],
    "sec_011": ["cat_004", "cat_005"], "sec_012": ["cat_004"], "sec_013": ["cat_004"], "sec_014": ["cat_004", "cat_006"],
    "sec_015": ["cat_009"], "sec_016": ["cat_010"],
    "sec_017": ["cat_021", "cat_013"], "sec_018": ["cat_017"],
    "sec_019": ["cat_007"], "sec_020": ["cat_019"], "sec_021": ["cat_019"],
    "sec_022": ["cat_006"], "sec_023": ["cat_004"],
    "sec_024": ["cat_011"], "sec_025": ["cat_022"], "sec_026": ["cat_013"], "sec_027": ["cat_001"],
    "sec_028": ["cat_002"], "sec_029": ["cat_008"], "sec_030": ["cat_003"],
}

# Hashtag grubu → sektör mapping (data_özellikleri.md §1.1.6'dan)
HASHTAG_GROUPS = {
    "sec_001": ["#kahve","#coffee","#filtrekahve","#espresso","#cafe","#barista"],
    "sec_002": ["#kahve","#coffee","#espresso","#thirdwave","#spesiyaltikahve","#barista"],
    "sec_003": ["#brunch","#breakfast","#kahvalti","#food","#foodie"],
    "sec_004": ["#food","#foodie","#yemek","#restaurant","#dinner"],
    # ... (kısalttım; full mapping data_özellikleri.md §1.1.6'da)
}

def compute_natural_affinity(inf, business, post_summary):
    """Mentioned_brands + caption metni içinde işletme adı/sektörü geçme oranı."""
    biz_name = normalize_text(business.get("name", ""))
    biz_sector_keywords = HASHTAG_GROUPS.get(business.get("sector_id"), [])
    biz_sector_keywords = [normalize_text(h.lstrip("#")) for h in biz_sector_keywords]

    mentions = [normalize_text(m) for m in post_summary.get("mentioned_brands", [])]
    captions_text = " ".join(post_summary.get("captions", [])).lower()

    brand_hit = 1.0 if any(biz_name and biz_name in m for m in mentions) else 0.0
    sector_hits = sum(1 for kw in biz_sector_keywords if kw and kw in captions_text)
    sector_ratio = min(sector_hits / 3.0, 1.0)  # 3+ hit → 1.0

    return max(brand_hit, 0.6 * sector_ratio)

def compute_recency_score(post_summary):
    days = post_summary.get("last_post_recency_days", 999)
    return float(np.exp(-days / 14.0))  # 14 günde %37, 28'de %14

def compute_audience_location_match(inf, business):
    biz_city = business.get("location", {}).get("city", "")
    loc_dist = safe_get(inf, "audience_demographics.location_distribution", {}) or {}
    return float(loc_dist.get(biz_city, 0.0))

def compute_audience_age_overlap(inf, business):
    biz_ages = set(business.get("target_audience", {}).get("age_buckets", []))
    inf_ages = set((safe_get(inf, "audience_demographics.age_distribution", {}) or {}).keys())
    return jaccard(biz_ages, inf_ages)

def compute_audience_interest_overlap(inf, business):
    inf_int = safe_get(inf, "audience_demographics.interest_tags", []) or []
    biz_int = safe_get(business, "target_audience.interest_tags", []) or []
    return jaccard(inf_int, biz_int)

def compute_sector_content_match(inf, business):
    inf_cats = set(inf.get("content_categories", []) or [])
    sector_cats = set(SECTOR_TO_CATEGORIES.get(business.get("sector_id"), []))
    return jaccard(inf_cats, sector_cats)

def compute_style_match(inf, business):
    return jaccard(inf.get("content_styles", []), business.get("brand_style", []))

def compute_hashtag_overlap(post_summary, business):
    inf_tags = set(normalize_text(h.lstrip("#")) for h in post_summary.get("hashtags", []))
    biz_tags = set(normalize_text(h.lstrip("#")) for h in HASHTAG_GROUPS.get(business.get("sector_id"), []))
    return jaccard(inf_tags, biz_tags) if inf_tags and biz_tags else 0.0

def extract_features(inf, listing):
    """Bir (influencer, listing) çifti için tüm feature'ları üretir.
    Backend feature_extractor.py BUNUN BİREBİR KOPYASI olacak."""

    biz = business_by_id.get(listing.get("business_id")) or {}
    post_summary = post_summaries.get(inf.get("id"), {})

    # Lokasyon
    inf_lat = safe_get(inf, "location.lat")
    inf_lng = safe_get(inf, "location.lng")
    biz_lat = safe_get(biz, "location.lat")
    biz_lng = safe_get(biz, "location.lng")
    distance_km = haversine_km(inf_lat, inf_lng, biz_lat, biz_lng)

    # Tier preference
    pref_tiers = [normalize_text(t) for t in (listing.get("preferred_tiers") or [])]
    inf_tier = normalize_text(inf.get("tier"))
    tier_pref_match = 1 if inf_tier in pref_tiers else 0

    # Past category
    past_cats = set(inf.get("past_collaboration_categories", []) or [])
    target_cats = set(listing.get("target_categories", []) or [])
    past_category_experience = 1 if past_cats & target_cats else 0

    # Budget
    budget = listing.get("budget", {}) or {}
    rate = inf.get("rate_range", {}) or {}
    budget_match = budget_tier_match(
        budget.get("min"), budget.get("max"), rate.get("min"), rate.get("max")
    )

    follower_count = float(inf.get("follower_count", 0) or 0)
    following_count = float(inf.get("following_count", 0) or 0)
    engagement_rate = float(inf.get("engagement_rate", 0) or 0)

    avg_likes = post_summary.get("avg_likes", 0) or 0
    avg_comments = post_summary.get("avg_comments", 0) or 0

    return {
        # Pair (label formülünde geçenler)
        "sector_content_match":      compute_sector_content_match(inf, biz),
        "location_score":            location_score_from_distance(distance_km),
        "audience_location_match":   compute_audience_location_match(inf, biz),
        "audience_age_overlap":      compute_audience_age_overlap(inf, biz),
        "audience_interest_overlap": compute_audience_interest_overlap(inf, biz),
        "budget_tier_match":         budget_match,
        "natural_affinity_score":    compute_natural_affinity(inf, biz, post_summary),
        "engagement_rate":           engagement_rate,
        "tier_preference_match":     tier_pref_match,
        "style_match":               compute_style_match(inf, biz),
        "recency_score":             compute_recency_score(post_summary),

        # Ek feature'lar (label formülünde yok ama eğitime giriyor)
        "follower_count_log":        math.log10(max(follower_count, 1)),
        "following_ratio":           following_count / max(follower_count, 1),
        "comment_like_ratio":        avg_comments / max(avg_likes, 1),
        "account_age_days":          parse_date_days_ago(inf.get("account_created_at")),
        "post_frequency_weekly":     post_summary.get("post_frequency_weekly", 0),
        "last_post_recency_days":    post_summary.get("last_post_recency_days", 999),
        "influencer_tier_numeric":   tier_to_numeric(inf.get("tier")),
        "verified":                  1 if inf.get("verified") else 0,
        "past_collaboration_count":  int(inf.get("past_collaboration_count", 0) or 0),
        "reel_post_ratio":           post_summary.get("reel_ratio", 0),
        "business_age_months":       int(biz.get("business_age_months", 0) or 0),
        "business_size_numeric":     business_size_to_numeric(biz.get("size")),
        "listing_budget_min":        float(budget.get("min", 0) or 0),
        "listing_budget_max":        float(budget.get("max", 0) or 0),
        "listing_budget_mid":        (float(budget.get("min", 0) or 0) + float(budget.get("max", 0) or 0)) / 2,
        "business_verified":         1 if biz.get("verified") else 0,
        "business_past_collab_count":int(biz.get("past_collaboration_count", 0) or 0),
        "deliverable_count":         len(listing.get("deliverables") or []),
        "audience_income_match":     jaccard(
                                        safe_get(biz, "target_audience.income_groups", []) or [],
                                        list((safe_get(inf, "audience_demographics.income_distribution", {}) or {}).keys())
                                     ),
        "language_match":            1 if normalize_text(inf.get("primary_language")) == "tr" else 0,
        "past_category_experience":  past_category_experience,
        "hashtag_overlap":           compute_hashtag_overlap(post_summary, biz),
        "distance_km":               distance_km,
    }
```

**Bu kod parçası iki yere kopyalanacak:**
1. **Notebook Hücre 8** (yukarıdaki — kullanıcı Colab'a yapıştırır)
2. **`backend/app/ml/feature_extractor.py`** (birebir aynı, Python module olarak)

İki kopyayı senkron tutmak için: backend tarafı yazıldıktan sonra `python -m backend.app.ml.feature_extractor --dump > /tmp/expected_features.json` gibi bir komut, notebook'un çıktısıyla karşılaştırılabilir. **Hackathon süresinde manuel kontrol yeterli.**

---

## 4. Backend Mimarisi

```
┌─────────────────────────────────────────────────────────────────────┐
│  COLAB (untitled24.py)                                              │
│                                                                     │
│  seed_data.zip ────────────► [Notebook eğitir] ──► xgboost.zip      │
│       ▲                                                ▼            │
└───────┼────────────────────────────────────────────────┼────────────┘
        │                                                │
        │ python -m scripts.export_for_training          │ manuel kopya
        │                                                │
┌───────┴────────────────────────────────────────────────┼────────────┐
│  BACKEND                                               ▼            │
│                                                                     │
│  ┌──────────────┐   ┌────────────────┐   ┌────────────────────────┐ │
│  │  PostgreSQL  │──►│ scripts/export │   │ ml_artifacts/xgboost_v1│ │
│  │  + PostGIS   │   │  for_training  │   │   ├ ranker.joblib      │ │
│  │              │   │ → 4 JSON + zip │   │   ├ metadata.json      │ │
│  │  20 inf      │   └────────────────┘   │   └ importance.csv     │ │
│  │  10 biz      │                        └──────────┬─────────────┘ │
│  │  20 listing  │                                   │ joblib.load   │
│  │  ~400 posts  │                                   ▼               │
│  │              │   ┌─────────────────────────────────────────────┐ │
│  │              │◄──┤  app/ml/                                    │ │
│  │              │   │   predictor.py (XGBoostJoblibAdapter)       │ │
│  │              │   │   feature_extractor.py (notebook kopya)     │ │
│  │              │   │   retrieval.py (PostGIS hard filter)        │ │
│  │              │   │   ranking.py (orchestrate)                  │ │
│  │              │   │   distribution.py (seen filter, page)       │ │
│  │              │   │   reasons.py (notebook Hücre 17 kopya)      │ │
│  └──────────────┘   └─────────────────────┬───────────────────────┘ │
│                                           │                         │
│  ┌──────────────────────────────────────┐ │                         │
│  │ app/routers/                         │ │                         │
│  │   profiles.py (orchestrate)          │◄┘                         │
│  │   swipe.py / score.py / matches.py   │                           │
│  │   ml.py (health)                     │                           │
│  └──────────────┬───────────────────────┘                           │
│                 │  app/serializers.py (snake_case → camelCase)      │
└─────────────────┼───────────────────────────────────────────────────┘
                  │
                  ▼  JSON (camelCase)
┌────────────────────────────────────────────────────────────────────┐
│  FRONTEND (Next.js — değişiklik minimum)                           │
└────────────────────────────────────────────────────────────────────┘
```

---

## 5. Akış: Bir İstek Nasıl İşlenir?

### İşletme akışı (CampaignForm → SwipeCards)

```
1. Frontend
   GET /api/profiles?role=business&context_id=biz_001
        │
2. routers/profiles.py
   │ business_id'den aktif collab_listings çek (örn 2 ilan)
   │ Her listing için ↓
   ▼
3. ml/retrieval.py — Hard filter (SQL)
   SELECT * FROM influencer_profiles
   WHERE last_active_at > now() - interval '60 days'
     AND ST_DWithin(location_geom, listing_business_geom, 50000)
     AND tier = ANY(listing.preferred_tiers)
     AND rate_range_max >= listing.budget_min  -- gevşek bütçe kapısı
   LIMIT 200
        │
        ▼
4. ml/feature_extractor.py
   Her aday için extract_features(inf, listing) → dict[str, float]
   Tüm dict'leri feature_cols sırasıyla numpy matrix'e dök
        │
        ▼
5. ml/ranking.py
   predictor.predict_score(X) → np.ndarray shape=(n,) in [0, 100]
   predictor.predict_proba(X) → reasons.py için class olasılıkları
   reasons.generate(features_dict) → ["...", "..."]
        │
        ▼
6. ml/distribution.py
   - swipes tablosundan kullanıcının son 30 günkü swipe'larını al
   - swiped olanları filtrele
   - skor desc sırala
   - Page slice (default 10)
        │
        ▼
7. serializers.py
   to_ranked_influencer(inf, rank_result) → camelCase dict
        │
        ▼
8. Frontend ← RankedInfluencer[] (mevcut tip korunmuş)
```

### Influencer akışı (gelecek)

Aynı pipeline, sadece retrieval ters: `retrieve_candidates_for_influencer(inf_id)` → aday `collab_listings`. Aynı `predictor`, aynı `feature_extractor`. Frontend tarafında `ListingSwipeCards` komponenti gerekecek (bu sprint dışı).

---

## 6. Veritabanı Şeması (Notebook JSON şemasına Uygun)

`backend/app/models.py` rewrite. Önemli alanlar notebook'un beklediği JSON'lara mapping olacak şekilde.

### Ana tablolar (Tier 1 — zorunlu)

```python
class Sector(Base):
    id: str (PK)              # "sec_001"
    name: str
    parent_category: str

class ContentCategory(Base):
    id: str (PK)              # "cat_001"
    name: str

class ContentStyle(Base):
    id: str (PK)              # "sty_001"
    name: str

class Location(Base):
    id: str (PK)
    name: str
    type: str                 # district / city / neighborhood
    city: str
    country: str
    lat: float
    lng: float
    geom: Geography(POINT)    # PostGIS, ST_DWithin için

class InfluencerProfile(Base):
    id: str (PK)
    display_name: str
    username: str             # @handle
    bio: str
    tier: str                 # nano/micro/mid/macro/mega
    follower_count: int
    following_count: int
    post_count: int
    account_created_at: date
    verified: bool
    primary_language: str
    avg_views: int            # Frontend type'da var — post agg'tan
    # Lokasyon
    city: str
    district: str
    lat: float
    lng: float
    location_geom: Geography(POINT)
    # Kategoriler (M2M kolaylığı için array kolonları — postgres ARRAY)
    content_category_ids: list[str]   # ARRAY(VARCHAR)
    content_style_ids: list[str]
    # Audience demographics (JSONB — nested)
    audience_demographics: dict       # JSONB
    # Rate
    rate_min: int
    rate_max: int
    rate_currency: str
    # Sosyal
    past_collaboration_count: int
    past_collaboration_categories: list[str]
    last_active_at: date
    avatar_emoji: str         # frontend type için
    audience_tags: list[str]  # frontend "audience" için düzleştirilmiş
    past_campaigns: list[str] # frontend "pastCampaigns" için

class BusinessProfile(Base):
    id: str (PK)
    name: str
    sector_id: str (FK)
    subcategory: str
    description: str
    size: str                 # küçük/orta/zincir
    business_age_months: int
    verified: bool
    past_collaboration_count: int
    past_collaboration_categories: list[str]
    brand_style_ids: list[str]
    brand_voice: str
    # Lokasyon
    city: str
    district: str
    neighborhood: str
    address: str
    lat: float
    lng: float
    location_geom: Geography(POINT)
    # Target audience JSONB
    target_audience: dict     # JSONB
    created_at: date

class CollabListing(Base):
    listing_id: str (PK)
    business_id: str (FK)
    title: str
    description: str
    budget_min: int
    budget_max: int
    budget_currency: str
    deliverables: list[str]
    preferred_tiers: list[str]
    target_category_ids: list[str]
    preferred_style_ids: list[str]
    preferred_audience: dict  # JSONB
    deadline: date
    status: str               # active/closed/expired
    created_at: date

class InstagramPost(Base):
    post_id: str (PK)
    influencer_id: str (FK)
    type: str                 # post/reel/story_archived
    media_type: str           # image/video
    caption: str
    hashtags: list[str]
    mentioned_brands: list[str]
    location_tag: dict        # JSONB {name, lat, lng}
    posted_at: datetime
    metrics: dict             # JSONB {likes, comments, saves, reach}
    content_category_id: str
    content_style_id: str
    media_count: int

class AgentPreference(Base):
    id: str (PK)
    user_id: str
    role: str                 # influencer/business/worker
    preferences: dict         # JSONB (dealbreakers, budget, etc.)

class Swipe(Base):
    id: str (PK)
    user_id: str
    listing_id: str (FK, nullable)
    target_influencer_id: str (nullable)
    direction: str            # accept/reject
    swiped_at: datetime

class Match(Base):
    match_id: str (PK)
    influencer_id: str (FK)
    business_id: str (FK)
    listing_id: str (FK)
    matched_at: datetime
    status: str               # agent_negotiating / human_chat / confirmed / rejected
    score: int                # cached at-match-time
    reasons: list[str]        # JSONB

class Agreement(Base):
    agreement_id: str (PK)
    match_id: str (FK)
    status: str
    final_budget: int
    final_deliverables: list[str]
    agent_negotiation_turns: int
    agreed_at: datetime
    completed_at: datetime
```

### Tier 2 (worker akışı — şimdi iskelet, sprint dışı)
- `WorkerProfile`, `JobPosition`, `EmploymentType`, `JobListing` — alan başlığı `data_özellikleri.md`'den.

### Tier 3 (ML cache)
```python
class MlFeatures(Base):
    influencer_id: str (PK)
    listing_id: str (PK)
    features: dict            # JSONB
    computed_at: datetime
    # TTL: 24 saat (manuel invalidate seed/post insert sonrası)

class MlPrediction(Base):
    influencer_id: str (PK)
    listing_id: str (PK)
    model_version: str (PK)
    score: float
    label: int                # 0/1/2
    proba: list[float]        # JSONB [3 değer]
    predicted_at: datetime
```

### Extension'lar (Alembic first migration)
```sql
CREATE EXTENSION IF NOT EXISTS postgis;
-- pgvector YOK (embedding kullanılmıyor)
```

### İndeksler
```sql
CREATE INDEX idx_inf_geom ON influencer_profiles USING GIST(location_geom);
CREATE INDEX idx_biz_geom ON business_profiles USING GIST(location_geom);
CREATE INDEX idx_inf_tier ON influencer_profiles(tier);
CREATE INDEX idx_listing_status ON collab_listings(status);
CREATE INDEX idx_listing_business ON collab_listings(business_id);
CREATE INDEX idx_posts_inf ON instagram_posts(influencer_id);
CREATE INDEX idx_swipes_user ON swipes(user_id, swiped_at);
```

---

## 7. Seed Data Pipeline

```
backend/scripts/seed/
├── __main__.py            # python -m scripts.seed [--reset]
├── taxonomy.py            # sectors (30), categories (25), styles (15), locations (50)
├── influencers.py         # 20 inf — tier dağılımı: 5 nano, 7 micro, 5 mid, 2 macro, 1 mega
├── businesses.py          # 10 biz — sektör dengeli
├── posts.py               # 300-500 post — her inf'e 15-25, doğal afinite için 5-6 inf'e 3-4 organik mention post
├── listings.py            # 20 collab listing — bütçe ve preferred_tiers business.size ile uyumlu
├── agent_prefs.py         # her entity için bir kayıt
└── behavioral.py          # 150 swipe, 40 match, 20 agreement (sentetik kural)
```

**Çalıştırma:**
```bash
docker compose up -d db
cd backend && alembic upgrade head
python -m scripts.seed --reset
```

**Hacim:** 20 inf × 10 biz × 20 listing = 4000 olası çift; notebook'ta 1000-5000 arası sample alıyor (Hücre 10'da `MAX_PAIRS = 5000`).

### Notebook'a Yükleme — `export_for_training.py`

```bash
python -m scripts.export_for_training --out /tmp/seed_data.zip
```

Üretir:
```
seed_data.zip
├── influencer_profiles.json
├── business_profiles.json
├── collab_listings.json
└── instagram_posts.json
```

Bu zip Colab'a yüklenir, notebook çalıştırılır, `matchfluence_xgboost_outputs.zip` indirilir. İçeriğinden:
- `models/xgboost_match_ranker.joblib` → `backend/ml_artifacts/xgboost_v1/`
- `models/xgboost_match_ranker_metadata.json` → `backend/ml_artifacts/xgboost_v1/`

Backend lazy load'da bu dizine bakar.

---

## 8. ML Modülleri

### `app/ml/predictor.py`

```python
from typing import Protocol, ClassVar
from pathlib import Path
from functools import lru_cache
import json
import numpy as np
import joblib

class Predictor(Protocol):
    feature_names: list[str]
    classes: dict
    model_version: str
    adapter_name: str

    def predict_proba(self, X: np.ndarray) -> np.ndarray: ...
    def predict_score(self, X: np.ndarray) -> np.ndarray: ...

class XGBoostJoblibAdapter:
    adapter_name = "XGBoostJoblibAdapter"

    def __init__(self, model_dir: Path):
        self.model = joblib.load(model_dir / "xgboost_match_ranker.joblib")
        meta_path = model_dir / "xgboost_match_ranker_metadata.json"
        meta = json.loads(meta_path.read_text(encoding="utf-8"))
        self.feature_names = meta["feature_cols"]
        self.classes = meta["classes"]
        self.model_version = meta.get("model_version", model_dir.name)

    def predict_proba(self, X):
        return self.model.predict_proba(X)

    def predict_score(self, X):
        # weighted: kotu=0, orta=50, iyi=100
        return self.predict_proba(X) @ np.array([0.0, 50.0, 100.0])

class FallbackRuleAdapter:
    adapter_name = "FallbackRuleAdapter"
    feature_names = []   # ignore — kullanılmaz
    classes = {"0": "kotu_match", "1": "orta_match", "2": "iyi_match"}
    model_version = "fallback_v1"

    def predict_proba(self, X):
        # Kural tabanlı skoru proba'ya yansıt — basit yaklaşım
        n = len(X) if hasattr(X, "__len__") else 1
        return np.tile([0.33, 0.34, 0.33], (n, 1))

    def predict_score(self, X):
        # matching.py'deki calculate_score'u sar
        # X aslında feature dict listesi olarak gelir (special path)
        ...

@lru_cache(maxsize=1)
def get_predictor(model_root: str = "backend/ml_artifacts") -> Predictor:
    root = Path(model_root)
    if not root.exists():
        return FallbackRuleAdapter()
    # En son versiyon dizinini bul
    versions = sorted([d for d in root.iterdir() if d.is_dir()], reverse=True)
    for vdir in versions:
        if (vdir / "xgboost_match_ranker.joblib").exists():
            return XGBoostJoblibAdapter(vdir)
        if (vdir / "model.txt").exists():
            from .adapters.lightgbm_text import LightGBMTextAdapter
            return LightGBMTextAdapter(vdir)
        # ... diğer adapter detection'ları
    return FallbackRuleAdapter()
```

### `app/ml/feature_extractor.py`

**Bölüm 3'teki kod parçası birebir buraya kopyalanır.** Tek fark: notebook'taki global `business_by_id`, `post_summaries` yerine fonksiyon parametresi olarak alır.

```python
def extract_features(
    inf: dict,
    listing: dict,
    *,
    business: dict,
    post_summary: dict,
) -> dict[str, float]:
    """Notebook Hücre 8 ile birebir uyumlu."""
    # ... yukarıdaki extract_features kodu, sadece global lookup yerine parametre
```

Backend SQLAlchemy entity → notebook JSON dict dönüşümü:
```python
def inf_to_notebook_dict(inf: InfluencerProfile, posts: list[InstagramPost]) -> dict:
    """Backend ORM modelini notebook'un beklediği JSON şekline çevir."""
    return {
        "id": inf.id,
        "tier": inf.tier,
        "follower_count": inf.follower_count,
        # ...
    }
```

Bu dönüşüm fonksiyonu serializers.py'de DEĞİL — ml/dto.py'da olur, ML internal kullanım. Serializers sadece API yanıtı için.

### `app/ml/retrieval.py`

```python
def retrieve_candidates_for_listing(
    db: Session, listing: CollabListing, limit: int = 200,
) -> list[InfluencerProfile]:
    business = db.get(BusinessProfile, listing.business_id)

    stmt = (
        select(InfluencerProfile)
        .where(InfluencerProfile.last_active_at > date.today() - timedelta(days=60))
        .where(InfluencerProfile.tier == any_(listing.preferred_tiers))
        .where(InfluencerProfile.rate_max >= listing.budget_min)
        .where(
            func.ST_DWithin(
                InfluencerProfile.location_geom,
                business.location_geom,
                50_000,  # 50 km
            )
        )
        .order_by(
            func.ST_Distance(
                InfluencerProfile.location_geom, business.location_geom
            )
        )
        .limit(limit)
    )
    return db.scalars(stmt).all()

def retrieve_candidates_for_influencer(
    db: Session, influencer: InfluencerProfile, limit: int = 200,
) -> list[CollabListing]: ...
```

### `app/ml/ranking.py`

```python
@dataclass
class RankResult:
    influencer_id: str
    listing_id: str
    score: float                 # 0-100
    label: int                   # 0/1/2
    proba: list[float]           # [P_kotu, P_orta, P_iyi]
    reasons: list[str]
    breakdown: dict              # frontend ScoreBreakdown
    features: dict               # debug

def rank_pairs(
    db: Session,
    pairs: list[tuple[InfluencerProfile, CollabListing]],
) -> list[RankResult]:
    predictor = get_predictor()

    # 1. Feature extraction (cache'li)
    feature_dicts = []
    for inf, listing in pairs:
        cached = db.get(MlFeatures, (inf.id, listing.listing_id))
        if cached and cached.computed_at > datetime.now() - timedelta(hours=24):
            feature_dicts.append(cached.features)
            continue

        business = db.get(BusinessProfile, listing.business_id)
        posts = posts_for_influencer(db, inf.id)
        post_summary = summarize_posts(posts)
        inf_dict = inf_to_notebook_dict(inf, posts)
        listing_dict = listing_to_notebook_dict(listing)
        biz_dict = business_to_notebook_dict(business)

        features = extract_features(
            inf_dict, listing_dict, business=biz_dict, post_summary=post_summary,
        )
        feature_dicts.append(features)
        upsert_ml_features(db, inf.id, listing.listing_id, features)

    # 2. Matrix oluştur (predictor'ın feature_names sırasıyla)
    X = np.array([
        [fd.get(name, 0.0) for name in predictor.feature_names]
        for fd in feature_dicts
    ])

    # 3. Predict
    scores = predictor.predict_score(X)
    probas = predictor.predict_proba(X)

    # 4. Reasons + breakdown
    results = []
    for (inf, listing), fd, score, proba in zip(pairs, feature_dicts, scores, probas):
        label = int(np.argmax(proba))
        reasons, risks = generate_reasons_from_features(fd)
        results.append(RankResult(
            influencer_id=inf.id,
            listing_id=listing.listing_id,
            score=float(score),
            label=label,
            proba=proba.tolist(),
            reasons=reasons,
            breakdown=features_to_breakdown(fd),
            features=fd,
        ))

    # 5. Cache prediction (opsiyonel)
    return sorted(results, key=lambda r: r.score, reverse=True)
```

### `app/ml/reasons.py`

```python
# Notebook Hücre 17/18 birebir kopyası
def generate_reasons_from_features(features):
    reasons = []
    risks = []

    if features.get("sector_content_match", 0) >= 0.70:
        reasons.append("İçerik kategorisi işletme sektörüyle güçlü uyumlu.")
    elif features.get("sector_content_match", 0) < 0.30:
        risks.append("İçerik kategorisi işletme sektörüyle zayıf uyumlu.")

    if features.get("location_score", 0) >= 0.70:
        reasons.append("Lokasyon yakınlığı güçlü.")
    elif features.get("location_score", 0) < 0.20:
        risks.append("Lokasyon uzaklığı eşleşme kalitesini düşürebilir.")

    if features.get("audience_interest_overlap", 0) >= 0.50:
        reasons.append("Influencer kitlesinin ilgi alanları kampanya hedefiyle örtüşüyor.")

    if features.get("budget_tier_match", 0) >= 1.0:
        reasons.append("Kampanya bütçesi influencer ücret aralığıyla uyumlu.")
    elif features.get("budget_tier_match", 0) == 0:
        risks.append("Bütçe influencer ücret aralığıyla uyumsuz olabilir.")

    if features.get("natural_affinity_score", 0) >= 0.50:
        reasons.append("Geçmiş içeriklerde bu sektöre doğal ilgi sinyali var.")

    if features.get("engagement_rate", 0) >= 0.04:
        reasons.append("Etkileşim oranı güçlü.")

    if features.get("tier_preference_match", 0) == 1:
        reasons.append("Influencer seviyesi kampanyanın tercih ettiği tier ile uyumlu.")

    if not reasons:
        reasons.append("Bazı temel profil sinyalleri kampanya ile kısmi uyum gösteriyor.")

    return reasons[:4], risks[:2]
```

### `app/ml/distribution.py`

```python
def distribute(
    db: Session,
    ranked: list[RankResult],
    user_id: str,
    page: int = 0,
    page_size: int = 10,
) -> list[RankResult]:
    # Son 30 gün'de swipe edilmiş listing/influencer'ı filtrele
    swiped = db.execute(
        select(Swipe.listing_id, Swipe.target_influencer_id)
        .where(Swipe.user_id == user_id)
        .where(Swipe.swiped_at > datetime.now() - timedelta(days=30))
    ).all()
    swiped_listings = {s.listing_id for s in swiped if s.listing_id}
    swiped_infs = {s.target_influencer_id for s in swiped if s.target_influencer_id}

    filtered = [
        r for r in ranked
        if r.listing_id not in swiped_listings
        and r.influencer_id not in swiped_infs
    ]

    start = page * page_size
    return filtered[start:start + page_size]
```

---

## 9. API Endpoints

Frontend `lib/api.ts`'in çağırdığı 4 endpoint + 1 health.

| Endpoint | Method | Amaç |
|---|---|---|
| `/api/profiles?role=business&context_id=biz_001` | GET | Ranked influencer listesi (örnek) |
| `/api/profiles?role=influencer&context_id=inf_001` | GET | Ranked collab listing listesi |
| `/api/swipe` | POST | `{inf_id, biz_id, direction}` → mutual check + match |
| `/api/match-score?inf_id=...&biz_id=...` | GET | Tek pair score + reasons + breakdown |
| `/api/matches` | GET | Kullanıcının match listesi |
| `/api/ml/health` | GET | `{model_loaded, adapter, model_version, feature_count, sample_inference_ms}` |

### Response serializer örneği (`serializers.py`)

Frontend `MatchBreakdown` field isimleri ile backend feature'ları arasında map:

```python
def features_to_breakdown(f: dict) -> dict:
    return {
        "nicheMatch":           round(f.get("sector_content_match", 0) * 100),
        "locationMatch":        round(f.get("location_score", 0) * 100),
        "engagementFit":        round(min(f.get("engagement_rate", 0) / 0.08, 1.0) * 100),
        "audienceFit":          round((
            f.get("audience_age_overlap", 0) +
            f.get("audience_interest_overlap", 0) +
            f.get("audience_location_match", 0)
        ) / 3 * 100),
        "budgetFit":            round(f.get("budget_tier_match", 0) * 100),
        "campaignExperience":   round(f.get("past_category_experience", 0) * 100),
    }
```

---

## 10. Frontend Düzeltmeleri (Minimal)

1. `frontend/data/matchfluenceInfluencers.ts`: `engagementRate` 0-1 scale (`6.8 → 0.068`). 15 satır.
2. `frontend/lib/api.ts`: `getProfiles` query string'e `role` + `context_id`.
3. `frontend/types/index.ts`: `engagementRate: number  // 0-1 scale (0.068 = %6.8)` yorum.

Bu kadar. Komponent kodu, swipe akışı, types dokunulmaz.

---

## 11. Önemli Dikkat Noktaları

### A. Feature Parity (en kritik risk)

Notebook ve backend `extract_features` ayrı yazılıyor. Risk: bir tarafta `jaccard` farklı normalize ediyorsa, ya da `comment_like_ratio` paydası `max(likes, 1)` yerine `max(likes, 0.0001)` ise — model garbage skor verir ama hata vermez.

**Mitigasyon:**
- Notebook'a kopyalanacak helper fonksiyonların (`jaccard`, `haversine_km`, `tier_to_numeric`, `business_size_to_numeric`, `normalize_engagement_rate`, `budget_tier_match`) backend'deki kopyası **karakteri karakterine aynı**.
- Sentinel test: backend tarafında 1 (inf, listing) çifti seç, JSON export et, notebook'ta o çifti `extract_features` ile geçir, çıkan dict ile backend'in çıktısını diff'le. Bir kez yap.
- `feature_extractor.py` modülünün üstüne `# COPIED FROM untitled24.py Cell 8 — DO NOT EDIT INDEPENDENTLY` yorumu.

### B. Eksik feature → 0 davranışı

Notebook `df.replace([np.inf, -np.inf], np.nan).fillna(0)` yapıyor (Hücre 12). Backend de aynısını yapmalı:
```python
X = np.array([
    [_safe(fd.get(name, 0.0)) for name in predictor.feature_names]
    for fd in feature_dicts
])

def _safe(v):
    return 0.0 if v is None or v == float("inf") or v != v else float(v)
```

### C. Class label → score map

Notebook 3-class classifier. Frontend tek skor bekliyor.

**Karar:** `score = 100 * (0.0 * P0 + 0.5 * P1 + 1.0 * P2)`. Bu monotonik (iyi match olasılığı arttıkça skor artar) ve clamp gerektirmez (zaten 0-100 arasında).

**Alternatif** (post-hackathon): `score = 100 * P2` — sadece "iyi match" olasılığı. Daha "agresif" sıralama, ama orta-orta vs orta-iyi ayrımı kaybolur.

### D. engagementRate format

Frontend mock'ta `6.8` (yüzde sayısı), notebook ve scoring `0.068` (oran) bekliyor. **Backend her zaman 0-1 scale döndürür.** Frontend mock_data düzeltilecek. Type yorumu eklenecek.

### E. Cold start

İlk request'te `joblib.load(xgboost.joblib)` ~500ms-1s. Lazy + `@lru_cache` ile bir kere yüklenir. Demo öncesi `curl /api/ml/health` çağırarak warm-up yapılır.

### F. Model dosyası yoksa

`FallbackRuleAdapter` devreye girer — `matching.py`'nin niche/follower/location/engagement skorlarını sarar, frontend'in beklediği response yapısını üretir. **Demo bu modda da çalışmalı.** Eğer eğitilmiş model son anda gelmezse panik yok.

### G. Notebook'a yüklenen JSON'ların minimum hacmi

Notebook `assert len(influencers) > 0` ile fail-fast. 20/10/20/300 minimum hedef — bunun altına düşersek model overfit eder, sınıf dengesizliği artar.

### H. Sentetik label dengesizliği

Notebook label dağılımını yazdırıyor (Hücre 10). Hedef: %25-30 iyi / %40-45 orta / %30-35 kötü. Eğer iyi sınıf %5'in altına düşerse: `MAX_PAIRS` artır, doğal afinite post serilerini artır, veya budget_min/max'ı influencer rate_range'leriyle daha çok kesişecek şekilde dağıt.

### I. PostGIS index zorunlu

50km DWithin sorgusu sequential scan yaparsa request 5+ saniye sürer. `CREATE INDEX ... USING GIST(location_geom)` ilk migration'da.

### J. Match-score endpoint farkı

`/api/match-score?inf_id=X&biz_id=Y` — frontend `biz_id` veriyor ama notebook (inf, listing) çifti üzerinde çalışıyor. Backend `biz_id`'den **en uygun aktif listing'i** seçer (örn. en yeni veya bütçesi inf rate_range'iyle en iyi örtüşen) ve onunla ranking yapar. Bu kararlı bir lookup, deterministik olmalı.

---

## 12. Uygulama Sırası (5-6 İş Günü)

```
Gün 1 — Foundation
  ├─ requirements.txt: xgboost, joblib, geoalchemy2, sqlalchemy 2.0, alembic, numpy, pandas
  ├─ database.py: PostGIS engine, GeoAlchemy2 wiring
  ├─ docker-compose.yml: postgis/postgis:16 image
  ├─ alembic init, env.py ayarı
  └─ İlk migration: 13+ tablo + GIST index + PostGIS extension

Gün 2 — Seed
  ├─ scripts/seed/taxonomy.py
  ├─ scripts/seed/influencers.py + businesses.py
  ├─ scripts/seed/posts.py (doğal afinite serileri dahil)
  ├─ scripts/seed/listings.py + agent_prefs.py + behavioral.py
  ├─ scripts/seed/__main__.py orkestrasyon
  └─ scripts/export_for_training.py (4 JSON + zip)

Gün 3 — Notebook Eğitimi (paralel)
  ├─ seed_data.zip Colab'a yüklenir
  ├─ Hücre 8'e bu plandaki extract_features yapıştırılır
  ├─ Notebook çalıştırılır
  ├─ xgboost_outputs.zip indirilir
  └─ backend/ml_artifacts/xgboost_v1/ altına çıkarılır

Gün 3-4 — ML modülleri (Notebook'a paralel başlar)
  ├─ ml/predictor.py + XGBoostJoblibAdapter + FallbackRuleAdapter
  ├─ ml/feature_extractor.py (notebook Hücre 8 kopyası)
  ├─ ml/dto.py (ORM → notebook JSON dict dönüştürücüler)
  ├─ ml/retrieval.py (PostGIS hard filter)
  ├─ ml/ranking.py (orchestrator)
  ├─ ml/distribution.py (seen filter)
  └─ ml/reasons.py (notebook Hücre 17 kopyası)

Gün 4 — Routers + Serializers
  ├─ routers/profiles.py
  ├─ routers/swipe.py, score.py, matches.py
  ├─ routers/ml.py (health + warmup)
  ├─ serializers.py (snake_case → camelCase + breakdown map)
  └─ schemas.py (Pydantic request/response)

Gün 5 — Frontend uyum + entegrasyon
  ├─ frontend/data/matchfluenceInfluencers.ts: engagementRate fix
  ├─ frontend/lib/api.ts: query params
  ├─ E2E test: NEXT_PUBLIC_USE_MOCK=false ile docker-compose çalıştır
  ├─ /matchfluence → CampaignForm → swipe → match
  └─ Playwright MCP ile smoke

Gün 6 — Polish + Risk azaltma
  ├─ Fallback adapter ile demo testi (model dosyası geçici sil/geri al)
  ├─ Feature parity manuel kontrol (notebook'ta 1 pair'in features dict'i vs backend çıktısı)
  ├─ Performans: 200 pair için end-to-end latency < 2s mı?
  └─ Demo runbook (model yükleme komutları, warm-up curl)
```

---

## 13. Verification Checklist

```bash
# 1. DB up ve PostGIS
docker compose up -d db
docker compose exec db psql -U app -d app -c "SELECT extname FROM pg_extension;"
# Beklenen: postgis

# 2. Migration
cd backend && alembic upgrade head
docker compose exec db psql -U app -d app -c "\dt"
# Beklenen: 13+ tablo

# 3. Seed
python -m scripts.seed --reset
python -c "from app.database import get_session; s=next(get_session()); print(s.execute('SELECT count(*) FROM influencer_profiles').scalar())"
# Beklenen: 20

# 4. Export for training
python -m scripts.export_for_training --out /tmp/seed_data.zip
unzip -l /tmp/seed_data.zip
# Beklenen: 4 JSON

# 5. (Colab tarafı) — manuel: zip yükle, Hücre 8'e extract_features yapıştır, çalıştır, çıkan zip'i indir

# 6. Model artifact yerleştir
mkdir -p backend/ml_artifacts/xgboost_v1
cp ~/Downloads/matchfluence_xgboost_outputs/models/*.joblib backend/ml_artifacts/xgboost_v1/
cp ~/Downloads/matchfluence_xgboost_outputs/models/*.json backend/ml_artifacts/xgboost_v1/

# 7. Backend up
uvicorn app.main:app --reload --port 8000
curl http://localhost:8000/api/ml/health
# Beklenen: {"model_loaded": true, "adapter": "XGBoostJoblibAdapter", ...}

# 8. Smoke test endpoints
curl "http://localhost:8000/api/profiles?role=business&context_id=biz_001"
curl "http://localhost:8000/api/match-score?inf_id=inf_001&biz_id=biz_001"
curl -X POST http://localhost:8000/api/swipe \
  -H 'Content-Type: application/json' \
  -d '{"inf_id":"inf_001","biz_id":"biz_001","direction":"accept"}'

# 9. Frontend entegrasyon
cd frontend && NEXT_PUBLIC_USE_MOCK=false npm run dev
# Browser: localhost:3000/matchfluence → form → swipe akışı

# 10. Fallback test
mv backend/ml_artifacts/xgboost_v1 /tmp/_artifacts_bak
curl http://localhost:8000/api/ml/health
# Beklenen: {"adapter": "FallbackRuleAdapter", ...}
curl "http://localhost:8000/api/match-score?inf_id=inf_001&biz_id=biz_001"
# Beklenen: yine makul skor (matching.py'den)
mv /tmp/_artifacts_bak backend/ml_artifacts/xgboost_v1
```

---

## 14. Kritik Dosya Yolları (Net)

### Yeni
```
backend/app/ml/__init__.py
backend/app/ml/predictor.py
backend/app/ml/feature_extractor.py
backend/app/ml/dto.py
backend/app/ml/retrieval.py
backend/app/ml/ranking.py
backend/app/ml/distribution.py
backend/app/ml/reasons.py
backend/app/ml/adapters/__init__.py
backend/app/ml/adapters/xgboost_joblib.py
backend/app/ml/adapters/lightgbm_text.py        # opsiyonel
backend/app/ml/adapters/fallback_rule.py
backend/app/serializers.py
backend/app/routers/profiles.py
backend/app/routers/swipe.py
backend/app/routers/score.py
backend/app/routers/matches.py
backend/app/routers/ml.py
backend/alembic/env.py + alembic.ini
backend/alembic/versions/0001_initial.py
backend/scripts/seed/__main__.py
backend/scripts/seed/{taxonomy,influencers,businesses,posts,listings,agent_prefs,behavioral}.py
backend/scripts/export_for_training.py
backend/data/hashtag_groups.json
backend/data/sector_to_categories.json
backend/ml_artifacts/.gitkeep
```

### Değişen
```
backend/requirements.txt       # xgboost, joblib, geoalchemy2, alembic, numpy, pandas, sqlalchemy 2.x
backend/app/models.py          # REWRITE — 13+ tablo
backend/app/database.py        # PostGIS engine
backend/app/schemas.py         # Pydantic genişletilir
backend/app/main.py            # router include
backend/app/matching.py        # DOKUNULMAZ — FallbackRuleAdapter içinden çağrılır
docker-compose.yml             # db image: postgis/postgis:16-alpine
frontend/data/matchfluenceInfluencers.ts   # engagementRate 0-1 scale
frontend/lib/api.ts            # query params
frontend/types/index.ts        # engagementRate yorumu (sadece comment)
```

### Dokunulmayan
```
frontend/components/matchfluence/**
frontend/lib/matchfluenceScoring.ts
backend/app/matching.py
backend/app/test_matching.py
untitled24.py                   # Notebook — Hücre 8'e MANUEL extract_features eklenecek
ister_listesi.md                # Kullanıcı v2'ye taşıdı, dokunulmuyor
```

---

## 15. Sprint Dışı (Sonraki Faz)

- **Agent müzakere döngüsü** (`ister_listesi.md` v2 §"Agent Müzakere Sistemi"): gpt-5-nano, max 10 tur, structured JSON output, +5 tur paketi, persona, dealbreaker. Bu sprintte sadece `Match.status = 'agent_negotiating'` set edilir, gerçek loop yok.
- **Worker akışı**: Aynı predictor + feature_extractor altında ayrı seed + ayrı eğitim (worker × job_listing). Şu an `models.py` iskeleti yer tutar.
- **Frontend influencer-side UI** (`ListingSwipeCards`): Backend hazır olduktan sonra.
- **Premium / ödeme**: `ister_listesi.md` v2'de detaylı, mock Stripe.
- **Auth**: Şu an `inf_id`/`biz_id` user_id olarak kabul; JWT sonraki sprint.

---

## 16. Açık Sorular

1. **Notebook ne zaman çalıştırılacak?** Seed scriptleri Gün 2 sonunda hazır olur; Colab'da eğitim Gün 3'te. Eğer notebook'a `extract_features` yapıştırılması bana bırakılacaksa: Gün 2 sonunda zip exportu birlikte paylaşalım, ben yapabilir veya Emir yapabilir.
2. **Model versiyonlama**: Her yeniden eğitimde `xgboost_v1`, `xgboost_v2` dizinleri tutulur. Backend en son `vN`'i otomatik seçer.
3. **Auth eksikliği**: `inf_id`/`biz_id` user_id olarak kabul edilince, iki influencer aynı listing'e swipe atarsa mutual check yanlış çalışabilir. Tek-tek frontend testi yeterli, multi-user demo değil.
