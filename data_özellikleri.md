# Seed Data & AI Model Eğitim Verisi Spesifikasyonu

> **Doküman Amacı**: Bu doküman projede üretilecek tüm **seed data**'ları ve AI modellerinin **eğitim verisi** spesifikasyonunu tanımlar. AI kod asistanları bu dokümanı okuyarak mock data üretim scriptlerini ve model eğitim pipeline'ını oluşturmalıdır.
>
> **Kapsam**: Influencer ↔ İşletme eşleşme platformu için seed data + ranking model eğitim verisi.

---

## İçindekiler

1. [Üretilecek Seed Datalar](#1-üretilecek-seed-datalar)
   - 1.1 Taksonomi / Referans Verileri
   - 1.2 Entity Verileri (Influencer / İşletme / Çalışan)
   - 1.3 Activity Verileri (Instagram Postları, İlanlar)
   - 1.4 Agent Tercih Formları
   - 1.5 Davranışsal Mock Veriler
2. [AI Model Eğitim Verisi](#2-ai-model-eğitim-verisi)
   - 2.1 Eğitilecek Model
   - 2.2 Feature Spesifikasyonu
   - 2.3 Etiketleme (Synthetic Labeling)
   - 2.4 Eğitim Veri Şeması
   - 2.5 Eğitim Pipeline
3. [Eğitim Gerektirmeyen AI Bileşenleri](#3-eğitim-gerektirmeyen-ai-bileşenleri)
4. [Üretim Sırası ve Hacim Özeti](#4-üretim-sırası-ve-hacim-özeti)

---

## 1. Üretilecek Seed Datalar

### 1.1 Taksonomi / Referans Verileri

Bu listeler **sabit lookup table'lardır**. Entity ve activity üretimi sırasında bu listelerden seçim yapılır. **İlk üretilmesi gerekenler**.

---

#### 1.1.1 `sectors` — Sektörler

İşletmeler bu listeden sektör seçer.

| id | name | parent_category |
|----|------|-----------------|
| sec_001 | Kafe | Yeme-İçme |
| sec_002 | Spesiyalti Kahve | Yeme-İçme |
| sec_003 | Brunch / Kahvaltı | Yeme-İçme |
| sec_004 | Restoran | Yeme-İçme |
| sec_005 | Fast Food | Yeme-İçme |
| sec_006 | Pastane / Fırın | Yeme-İçme |
| sec_007 | Butik | Moda |
| sec_008 | Hazır Giyim | Moda |
| sec_009 | Ayakkabı | Moda |
| sec_010 | Aksesuar | Moda |
| sec_011 | Kuaför / Berber | Güzellik |
| sec_012 | Güzellik Salonu | Güzellik |
| sec_013 | Tırnak Bakım | Güzellik |
| sec_014 | Kozmetik Mağazası | Güzellik |
| sec_015 | Fitness / Spor Salonu | Spor |
| sec_016 | Pilates / Yoga | Spor |
| sec_017 | Kitabevi | Kültür |
| sec_018 | Sanat Galerisi | Kültür |
| sec_019 | Teknoloji Mağazası | Perakende |
| sec_020 | Ev Dekorasyon | Perakende |
| sec_021 | Çiçekçi | Perakende |
| sec_022 | Eczane | Sağlık |
| sec_023 | Optik | Sağlık |
| sec_024 | Oyuncakçı | Perakende |
| sec_025 | Evcil Hayvan Mağazası | Perakende |
| sec_026 | Kırtasiye | Perakende |
| sec_027 | Hediyelik | Perakende |
| sec_028 | Bar / Cocktail | Yeme-İçme |
| sec_029 | Otel / Pansiyon | Konaklama |
| sec_030 | Mücevher | Moda |

**Toplam**: ~30 sektör.

---

#### 1.1.2 `content_categories` — İçerik Kategorileri

Influencer'lar ve postlar bu kategorilerle etiketlenir.

| id | name |
|----|------|
| cat_001 | Lifestyle |
| cat_002 | Food & Drink |
| cat_003 | Fashion |
| cat_004 | Beauty |
| cat_005 | Makeup |
| cat_006 | Skincare |
| cat_007 | Tech |
| cat_008 | Travel |
| cat_009 | Fitness |
| cat_010 | Yoga & Wellness |
| cat_011 | Parenting |
| cat_012 | Gaming |
| cat_013 | Education |
| cat_014 | Finance |
| cat_015 | Automotive |
| cat_016 | Photography |
| cat_017 | Art |
| cat_018 | Music |
| cat_019 | Home Decor |
| cat_020 | Gardening |
| cat_021 | Books |
| cat_022 | Pets |
| cat_023 | Sustainable Living |
| cat_024 | Mental Health |
| cat_025 | Comedy / Entertainment |

**Toplam**: ~25 kategori.

---

#### 1.1.3 `content_styles` — İçerik Stil Etiketleri

Görsel/anlatımsal tarz. Estetik uyum için kullanılır.

| id | name |
|----|------|
| sty_001 | Minimalist |
| sty_002 | Renkli / Canlı |
| sty_003 | Vintage |
| sty_004 | Lüks / Premium |
| sty_005 | Casual |
| sty_006 | Profesyonel |
| sty_007 | Eğlenceli / Komik |
| sty_008 | Ciddi / Bilgilendirici |
| sty_009 | Samimi |
| sty_010 | İlham Verici |
| sty_011 | Aesthetic |
| sty_012 | Doğal / Organik |
| sty_013 | Şık / Glamour |
| sty_014 | Sokak Tarzı |
| sty_015 | Sade / Sakin |

**Toplam**: ~15 stil.

---

#### 1.1.4 `job_positions` — İş Pozisyonları

Çalışan ilanları için.

| id | name | typical_sectors |
|----|------|-----------------|
| pos_001 | Barista | Kafe, Spesiyalti Kahve |
| pos_002 | Garson | Restoran, Kafe, Bar |
| pos_003 | Kasiyer | Perakende, Yeme-İçme |
| pos_004 | Mutfak Yardımcısı | Restoran, Pastane |
| pos_005 | Aşçı | Restoran |
| pos_006 | Pasta Şefi | Pastane |
| pos_007 | Satış Danışmanı | Moda, Perakende |
| pos_008 | Mağaza Yöneticisi | Perakende |
| pos_009 | Kurye / Moto Kurye | Yeme-İçme, Perakende |
| pos_010 | Temizlik Personeli | Tüm |
| pos_011 | Güvenlik | Tüm |
| pos_012 | Depo Elemanı | Perakende |
| pos_013 | Vale | Restoran, Otel |
| pos_014 | Paketleme Elemanı | Perakende |
| pos_015 | Host / Hostes | Restoran, Otel |
| pos_016 | Resepsiyonist | Otel, Güzellik |
| pos_017 | Kuaför Yardımcısı | Güzellik |
| pos_018 | Manikürist | Güzellik |
| pos_019 | Personal Trainer | Spor |
| pos_020 | Pilates Eğitmeni | Spor |
| pos_021 | Yoga Eğitmeni | Spor |
| pos_022 | Bar Tender | Bar |
| pos_023 | Stajyer | Tüm |
| pos_024 | Promosyon Personeli | Etkinlik |
| pos_025 | Etkinlik Düzenleme | Etkinlik |

**Toplam**: ~25 pozisyon.

---

#### 1.1.5 `employment_types` — İstihdam Türleri

| id | name | description |
|----|------|-------------|
| emp_001 | Full-time | Tam zamanlı |
| emp_002 | Part-time | Yarı zamanlı |
| emp_003 | Tek seferlik | Tek günlük / olay bazlı |
| emp_004 | Sezonluk | Yaz / kış sezonu |
| emp_005 | Proje bazlı | Belirli süreli proje |
| emp_006 | Vardiyalı | Düzensiz vardiya |
| emp_007 | Stajyer | Staj |

---

#### 1.1.6 `hashtags` — Hashtag Havuzu

Postlarda kullanılacak gerçekçi hashtag listesi. Sektör/kategori bazlı gruplandırılmış.

```json
{
  "hashtag_groups": {
    "kahve": ["#kahve", "#coffee", "#filtrekahve", "#espresso", "#latte", "#thirdwave", "#spesiyaltikahve", "#barista", "#coffeelover", "#cafe"],
    "yemek": ["#food", "#foodie", "#yemek", "#lezzet", "#delicious", "#instafood", "#foodporn", "#brunch", "#breakfast", "#dinner"],
    "moda": ["#fashion", "#moda", "#ootd", "#style", "#outfit", "#fashionblogger", "#stylish", "#streetstyle"],
    "guzellik": ["#beauty", "#makeup", "#skincare", "#makyaj", "#cilt", "#guzellik", "#mua", "#beautyblogger"],
    "fitness": ["#fitness", "#workout", "#gym", "#health", "#fit", "#bodybuilding", "#training", "#cardio"],
    "seyahat": ["#travel", "#wanderlust", "#explore", "#seyahat", "#gezi", "#travelphotography", "#vacation"],
    "lokasyon_istanbul": ["#istanbul", "#kadikoy", "#besiktas", "#karakoy", "#moda", "#galata", "#bosphorus"],
    "lifestyle": ["#lifestyle", "#daily", "#morning", "#weekend", "#sundayfunday", "#enjoy", "#happy"]
  }
}
```

**Toplam**: ~300-500 hashtag, gruplara dağıtılmış.

---

#### 1.1.7 `locations` — Şehir / İlçe / Semt

PostGIS için lat/lng koordinatları zorunlu.

```json
{
  "id": "loc_001",
  "name": "Kadıköy",
  "type": "district",
  "city": "İstanbul",
  "country": "TR",
  "lat": 40.9928,
  "lng": 29.0277,
  "popularity_score": 0.85
}
```

**Kapsam**:
- İstanbul'un 39 ilçesi (zorunlu)
- İstanbul içi ~50-80 popüler semt (Moda, Karaköy, Cihangir, Bebek, Nişantaşı, Bağdat Caddesi, vb.)
- Ankara, İzmir, Bursa, Antalya merkez koordinatları (test için)

**Toplam**: ~120 lokasyon kaydı.

---

#### 1.1.8 `audience_demographics_tags` — Hedef Kitle Etiketleri

Influencer kitle profili ve işletme hedef kitle eşleşmesi için.

```json
{
  "age_buckets": ["13-17", "18-24", "25-34", "35-44", "45-54", "55+"],
  "genders": ["female", "male", "other"],
  "income_groups": ["bütçe", "orta", "premium", "lüks"],
  "interest_tags": [
    "spor", "moda", "teknoloji", "yemek", "seyahat", "sanat", "müzik",
    "okuma", "sinema", "doğa", "fitness", "yoga", "lüks tüketim",
    "sürdürülebilirlik", "evcil hayvan", "anne-bebek", "araba",
    "girişimcilik", "finans", "oyun", "fotoğraf"
  ]
}
```

---

### 1.2 Entity Verileri

#### 1.2.1 `influencer_profiles` — Influencer Profilleri

**Hacim hedefi**: 80 influencer, tier'lara dengeli dağıtılmış.

| Tier | Adet | Takipçi Aralığı | Beklenen Etkileşim Oranı |
|------|------|-----------------|--------------------------|
| Nano | 20 | 1.000 – 10.000 | %4 – %8 |
| Micro | 25 | 10.000 – 100.000 | %2 – %5 |
| Mid | 20 | 100.000 – 500.000 | %1.5 – %3 |
| Macro | 10 | 500.000 – 1.000.000 | %1 – %2 |
| Mega | 5 | 1.000.000+ | %0.5 – %1.5 |

**Şema (JSON örneği)**:

```json
{
  "id": "inf_001",
  "display_name": "Zeynep K.",
  "username": "@zeynepfoodie",
  "bio": "İstanbul'da brunch avcısı 🥐 | Reklam: DM",
  "tier": "micro",
  "follower_count": 45200,
  "following_count": 890,
  "post_count": 312,
  "account_created_at": "2021-03-15",
  "verified": false,
  "location": {
    "city": "İstanbul",
    "district": "Kadıköy",
    "lat": 40.9928,
    "lng": 29.0277
  },
  "content_categories": ["cat_002", "cat_001", "cat_008"],
  "content_styles": ["sty_011", "sty_009"],
  "primary_language": "tr",
  "audience_demographics": {
    "age_distribution": {
      "18-24": 0.35,
      "25-34": 0.45,
      "35-44": 0.15,
      "45+": 0.05
    },
    "gender_distribution": {
      "female": 0.72,
      "male": 0.26,
      "other": 0.02
    },
    "location_distribution": {
      "İstanbul": 0.55,
      "Ankara": 0.12,
      "İzmir": 0.08,
      "diğer": 0.25
    },
    "income_distribution": {
      "bütçe": 0.10,
      "orta": 0.60,
      "premium": 0.30
    },
    "interest_tags": ["yemek", "seyahat", "moda"]
  },
  "rate_range": {
    "min": 2500,
    "max": 6000,
    "currency": "TRY"
  },
  "agent_preferences_id": "agp_001",
  "verification_status": "verified_bio_code",
  "profile_completion": 0.92,
  "past_collaboration_count": 14,
  "last_active_at": "2026-05-16"
}
```

**Üretim kuralları**:
- Her tier için takipçi sayısı uniform dağılımdan örneklenir
- Etkileşim oranı tier'a uygun aralıkta seçilir; takipçi/yorum/like ilişkisi tutarlı olmalı
- `content_categories` 1-3 arası kategori, profil bio'suyla tutarlı
- `audience_demographics.location_distribution`'da İstanbul ağırlığı en az %30 (lokasyon eşleşmesi test edilebilsin)
- Konum: İstanbul ağırlıklı ama %20 başka şehir
- `last_active_at` son 30 güne dağıtılır (recency feature için)
- `past_collaboration_count` tier ile pozitif korelasyonlu

---

#### 1.2.2 `business_profiles` — İşletme Profilleri

**Hacim hedefi**: 50 işletme, sektörlere dengeli dağıtılmış (her sektörden 1-3).

**Şema**:

```json
{
  "id": "biz_001",
  "name": "Coffee Roastery Kadıköy",
  "sector_id": "sec_002",
  "subcategory": "third wave",
  "description": "El yapımı filtre kahve ve özel demlemeler.",
  "location": {
    "city": "İstanbul",
    "district": "Kadıköy",
    "neighborhood": "Moda",
    "lat": 40.9885,
    "lng": 29.0258,
    "address": "Moda Cad. No: 42"
  },
  "brand_style": ["sty_001", "sty_011"],
  "brand_voice": "samimi",
  "size": "küçük",
  "business_age_months": 24,
  "target_audience": {
    "age_buckets": ["25-34", "35-44"],
    "gender_preference": "all",
    "income_groups": ["orta", "premium"],
    "interest_tags": ["yemek", "kahve", "lifestyle"]
  },
  "verified": true,
  "profile_completion": 0.88,
  "past_collaboration_count": 6,
  "past_collaboration_categories": ["cat_002", "cat_001"],
  "agent_preferences_id": "agp_b001",
  "created_at": "2024-05-10"
}
```

**Üretim kuralları**:
- `size` dağılımı: %70 küçük, %25 orta, %5 zincir
- `business_age_months`: 6-120 ay arası
- `location` İstanbul ağırlıklı (%80)
- `target_audience.interest_tags` sektörle tutarlı (kahve dükkanı → "kahve", "yemek")
- `past_collaboration_categories` profil sektörü ile uyumlu

---

#### 1.2.3 `worker_profiles` — Çalışan Profilleri

**Hacim hedefi**: 60 çalışan.

**Şema**:

```json
{
  "id": "wrk_001",
  "display_name": "Ahmet Y.",
  "age": 24,
  "gender": "male",
  "location": {
    "city": "İstanbul",
    "district": "Beşiktaş",
    "lat": 41.0429,
    "lng": 29.0079
  },
  "preferred_positions": ["pos_001", "pos_002"],
  "preferred_employment_types": ["emp_002", "emp_003"],
  "experience_years": 2,
  "past_experience": [
    {
      "position_id": "pos_001",
      "duration_months": 14,
      "sector_id": "sec_001"
    }
  ],
  "skills": ["latte art", "sıcak içecek hazırlama", "ingilizce orta seviye"],
  "languages": ["tr", "en"],
  "availability": {
    "monday": ["08:00-14:00"],
    "tuesday": ["08:00-14:00"],
    "wednesday": null,
    "thursday": ["14:00-22:00"],
    "friday": ["14:00-22:00"],
    "saturday": ["08:00-22:00"],
    "sunday": null
  },
  "rate_range": {
    "min": 120,
    "max": 180,
    "currency": "TRY",
    "per": "hour"
  },
  "agent_preferences_id": "agp_w001",
  "profile_completion": 0.85,
  "last_active_at": "2026-05-15"
}
```

**Üretim kuralları**:
- `age` dağılımı: 18-45 arası, ortalama 27
- `preferred_positions`: 1-3 pozisyon
- `experience_years`: 0-15 arası, yaşa bağlı
- `availability` gerçekçi (her gün dolu olmamalı)
- `rate_range` pozisyon ortalamasına yakın

---

### 1.3 Activity Verileri

#### 1.3.1 `instagram_posts` — Mock Instagram Postları

**Hacim hedefi**: ~2400 post (her influencer için ortalama 30 post)

**Şema**:

```json
{
  "post_id": "post_00123",
  "influencer_id": "inf_001",
  "type": "post",
  "caption": "Pazar sabahları için en sevdiğim brunch mekanlarından biri 🥐 Kadıköy'de fırından çıkmış simitli kruvasanı şart bilin ☕",
  "hashtags": ["#brunch", "#kadıköy", "#kahve", "#sundayfunday", "#istanbulfood"],
  "mentioned_brands": ["@cafekadikoy"],
  "location_tag": {
    "name": "Moda Sahil",
    "lat": 40.9854,
    "lng": 29.0277
  },
  "posted_at": "2026-04-12T10:30:00Z",
  "metrics": {
    "likes": 1820,
    "comments": 94,
    "shares": 23,
    "saves": 156,
    "reach": 8400
  },
  "content_category": "cat_002",
  "content_style": "sty_011",
  "media_count": 3,
  "media_type": "image"
}
```

**Tip dağılımı**:
- `post`: %60
- `reel`: %30
- `story_archived`: %10

**Üretim kuralları**:
- **Tarih dağılımı**: Son 6 ay (180 gün) içine dağıtılmış. Son 7 gün için en az 2 post (recency feature)
- **Kategori tutarlılığı**: Influencer'ın `content_categories` listesindeki kategorilerden seçilir. %70 ana kategori, %30 yan kategori
- **Hashtag tutarlılığı**: Kategori ile uyumlu hashtag gruplarından seçilir
- **Etkileşim tutarlılığı**:
  - `likes` ≈ `follower_count * engagement_rate * U(0.7, 1.3)`
  - `comments` ≈ `likes * U(0.03, 0.08)`
  - `saves` ≈ `likes * U(0.05, 0.15)`
- **Doğal afinite sinyali**: ~30% influencer için belirli bir sektör/markaya yönelik organik post serisi oluşturulmalı (örnek: 5 farklı influencer'ın her birinde 3-5 post belirli markalardan organik bahsediyor). Bu, **doğal afinite feature'ı** için kritik
- **Location tag**: %60 postta lokasyon var, influencer ana konumu ile %70 örtüşür

---

#### 1.3.2 `collab_listings` — İşbirliği İlanları

**Hacim hedefi**: ~80 işbirliği ilanı.

**Şema**:

```json
{
  "listing_id": "col_001",
  "business_id": "biz_001",
  "type": "collaboration",
  "title": "Yeni menümüz için 1 Reel içerik aranıyor",
  "description": "Kadıköy'deki yeni filtre kahve menümüzü tanıtacak, sabah ışığında çekim yapabilecek micro influencer arıyoruz.",
  "budget": {
    "min": 2000,
    "max": 5000,
    "currency": "TRY"
  },
  "deliverables": ["1 reel", "3 story"],
  "preferred_tiers": ["nano", "micro"],
  "target_categories": ["cat_002", "cat_001"],
  "preferred_audience": {
    "age_buckets": ["25-34"],
    "locations": ["İstanbul"]
  },
  "preferred_styles": ["sty_011", "sty_001"],
  "deadline": "2026-06-15",
  "status": "active",
  "created_at": "2026-05-10",
  "embedding": "[VECTOR(384)]"
}
```

**Üretim kuralları**:
- `business_id` mevcut işletmelerden
- `budget` aralığı işletme `size` ile orantılı
- `preferred_tiers` budget ile uyumlu olmalı (mega tier için budget 50k+)
- `target_categories` işletme sektörü ile uyumlu
- `status`: %75 active, %15 closed, %10 expired

---

#### 1.3.3 `job_listings` — İş İlanları

**Hacim hedefi**: ~70 iş ilanı.

**Şema**:

```json
{
  "listing_id": "job_001",
  "business_id": "biz_001",
  "type": "job",
  "title": "Hafta sonu baristası",
  "position_id": "pos_001",
  "employment_type_id": "emp_002",
  "schedule": {
    "saturday": "08:00-16:00",
    "sunday": "08:00-16:00"
  },
  "wage": {
    "amount": 150,
    "currency": "TRY",
    "per": "hour"
  },
  "required_experience_years": 1,
  "required_skills": ["latte art opsiyonel", "müşteri ilişkileri"],
  "preferred_languages": ["tr"],
  "status": "active",
  "created_at": "2026-05-12",
  "embedding": "[VECTOR(384)]"
}
```

**Üretim kuralları**:
- `position_id` işletme sektörüne uygun seçilir
- `wage.amount` pozisyon ortalamasına yakın
- `schedule` pozisyon ile uyumlu (kafe sabah, restoran akşam)

---

### 1.4 Agent Tercih Formları

Her kullanıcı için bir tercih formu kaydı.

#### 1.4.1 `agent_preferences` (Influencer örneği)

```json
{
  "id": "agp_001",
  "user_id": "inf_001",
  "role": "influencer",
  "preferences": {
    "min_acceptable_budget": 2000,
    "ideal_budget": 4000,
    "dealbreakers": [
      "alkol markası reklamı yapmam",
      "haftada 2'den fazla post istemeyin",
      "gece çekim yapamam"
    ],
    "preferred_deliverables": ["reel", "story"],
    "max_revisions": 2,
    "payment_terms": "post öncesi %50",
    "communication_tone": "samimi",
    "deadline_flexibility": "esnek değil",
    "exclusive_collab_acceptable": false,
    "exclusivity_max_days": 0,
    "non_negotiable_items": ["payment_terms"],
    "negotiable_items": ["budget", "deliverables", "deadline"]
  }
}
```

#### 1.4.2 `agent_preferences` (İşletme örneği)

```json
{
  "id": "agp_b001",
  "user_id": "biz_001",
  "role": "business",
  "preferences": {
    "max_budget": 5000,
    "ideal_budget": 3500,
    "dealbreakers": [
      "rakip markayı aynı dönemde tanıtmasın",
      "negatif tonlu içerik istemiyoruz"
    ],
    "required_deliverables": ["1 reel"],
    "optional_deliverables": ["3 story", "1 post"],
    "exclusivity_required": true,
    "exclusivity_days": 30,
    "communication_tone": "profesyonel",
    "non_negotiable_items": ["exclusivity_days", "required_deliverables"],
    "negotiable_items": ["budget", "optional_deliverables", "timeline"]
  }
}
```

#### 1.4.3 `agent_preferences` (Çalışan örneği)

```json
{
  "id": "agp_w001",
  "user_id": "wrk_001",
  "role": "worker",
  "preferences": {
    "min_hourly_wage": 130,
    "ideal_hourly_wage": 165,
    "dealbreakers": [
      "gece vardiyası kabul etmem",
      "sigarasız ortam zorunlu"
    ],
    "max_weekly_hours": 24,
    "transport_expectation": "akşam saatleri için ulaşım yardımı",
    "non_negotiable_items": ["min_hourly_wage", "no_night_shift"],
    "negotiable_items": ["hourly_wage", "shift_hours"]
  }
}
```

**Hacim hedefi**: 80 + 50 + 60 = **190 tercih formu** (her entity için bir tane).

---

### 1.5 Davranışsal Mock Veriler

Behavioral feature'lar ve "geçmiş benzer eşleşme başarısı" sinyali için. Sentetik üretilir.

#### 1.5.1 `swipes` — Kaydırma Eylemleri

**Hacim hedefi**: ~800 swipe.

```json
{
  "id": "swp_00001",
  "user_id": "inf_001",
  "listing_id": "col_023",
  "direction": "right",
  "swiped_at": "2026-05-10T14:23:11Z"
}
```

#### 1.5.2 `matches` — Eşleşmeler

**Hacim hedefi**: ~150 match.

```json
{
  "match_id": "mch_001",
  "influencer_id": "inf_001",
  "business_id": "biz_001",
  "listing_id": "col_023",
  "matched_at": "2026-05-10T15:00:00Z",
  "status": "agent_negotiating"
}
```

#### 1.5.3 `agreements` — Anlaşmalar

**Hacim hedefi**: ~80 anlaşma.

```json
{
  "agreement_id": "agr_001",
  "match_id": "mch_001",
  "status": "completed",
  "final_budget": 3500,
  "final_deliverables": ["1 reel", "3 story"],
  "agent_negotiation_turns": 7,
  "agreed_at": "2026-05-10T15:42:18Z",
  "completed_at": "2026-05-22T18:00:00Z"
}
```

**Üretim kuralları (sentetik mantık)**:
- Uyumlu çiftlerde (sektör + tier + konum match'li) **yüksek anlaşma oranı**:
  - swipe right: %75
  - swipe right → match: %60
  - match → agreement: %70
- Uyumsuz çiftlerde **düşük anlaşma**:
  - swipe right: %20
  - match → agreement: %25
- `agent_negotiation_turns`: uniform 3-10 arası, başarılı anlaşmalarda ortalama düşük

---

## 2. AI Model Eğitim Verisi

### 2.1 Eğitilecek Model: Ranking Modeli

**Görev**: Bir `(influencer, collab_listing)` çifti verildiğinde **match olasılığını veya eşleşme skorunu** üretmek.

**Model tipi**: 3-class classification (kötü/orta/iyi match) **veya** regression (0-1 arası skor).

**Algoritma**: LightGBM (öncelikli), XGBoost (alternatif).

---

### 2.2 Feature Spesifikasyonu

Modele girdi olarak verilecek tüm featurelar. Her feature için **kaynak**, **hesaplama** ve **tip** belirtilmiştir.

#### A. Tek-taraflı Features (Influencer)

| Feature | Tip | Kaynak | Hesaplama |
|---------|-----|--------|-----------|
| `follower_count_log` | Numeric | `influencer_profiles` | `log10(follower_count)` |
| `following_ratio` | Numeric | `influencer_profiles` | `following_count / follower_count` |
| `engagement_rate` | Numeric | `instagram_posts` | `(avg_likes + avg_comments) / follower_count` |
| `comment_like_ratio` | Numeric | `instagram_posts` | Sahte takipçi tespiti proxy |
| `account_age_days` | Numeric | `influencer_profiles` | Şimdi - `account_created_at` |
| `post_frequency_weekly` | Numeric | `instagram_posts` | Son 30 gün post sayısı / 4 |
| `last_post_recency_days` | Numeric | `instagram_posts` | Şimdi - en yeni post tarihi |
| `influencer_tier_numeric` | Categorical (1-5) | `influencer_profiles` | Nano=1, Micro=2, Mid=3, Macro=4, Mega=5 |
| `profile_completion` | Numeric | `influencer_profiles` | Direkt alan |
| `verified` | Boolean | `influencer_profiles` | Direkt alan |
| `past_collaboration_count` | Numeric | `influencer_profiles` | Direkt alan |
| `reel_post_ratio` | Numeric | `instagram_posts` | reel sayısı / toplam post |

#### B. Tek-taraflı Features (İşletme/İlan)

| Feature | Tip | Kaynak | Hesaplama |
|---------|-----|--------|-----------|
| `business_age_months` | Numeric | `business_profiles` | Direkt alan |
| `business_size_numeric` | Categorical | `business_profiles` | küçük=1, orta=2, zincir=3 |
| `listing_budget_min` | Numeric | `collab_listings` | `budget.min` |
| `listing_budget_max` | Numeric | `collab_listings` | `budget.max` |
| `listing_budget_mid` | Numeric | `collab_listings` | `(min+max)/2` |
| `business_verified` | Boolean | `business_profiles` | Direkt alan |
| `business_past_collab_count` | Numeric | `business_profiles` | Direkt alan |
| `deliverable_count` | Numeric | `collab_listings` | `len(deliverables)` |

#### C. Pair / Etkileşim Features (en kritik)

Modelin gerçek gücü burada.

| Feature | Tip | Hesaplama |
|---------|-----|-----------|
| `sector_content_match` | Numeric [0-1] | Influencer `content_categories` vektörü ile işletme `sector` arasında cosine similarity (embedding üzerinden) |
| `location_distance_km` | Numeric | PostGIS `ST_Distance(influencer_geom, business_geom)` km cinsinden |
| `location_score` | Numeric [0-1] | `exp(-distance_km / 10)` — 10km'de %37, 20km'de %14 |
| `audience_location_match` | Numeric [0-1] | İşletme şehri, influencer kitlesi yoğunlaştığı şehir mi? `audience.location_distribution[business_city]` |
| `audience_age_overlap` | Numeric [0-1] | İşletme `target_audience.age_buckets` ile influencer kitle yaş dağılımı kesişimi |
| `audience_gender_match` | Numeric [0-1] | İşletme `gender_preference` ile influencer kitle cinsiyet dağılımı uyumu |
| `audience_income_match` | Numeric [0-1] | İşletme `income_groups` ile influencer kitle gelir dağılımı kesişimi |
| `audience_interest_overlap` | Numeric [0-1] | Jaccard similarity: işletme `interest_tags` ∩ influencer `audience.interest_tags` |
| `budget_tier_match` | Numeric [0-1] | İşletme bütçesi influencer rate aralığında mı? `1.0` tam içinde, `0.5` kısmi, `0.0` dışında |
| `natural_affinity_score` | Numeric [0-1] | Influencer geçmiş postlarında işletme sektörü/kategorisinden organik bahsediyor mu? Caption ve mentioned_brands taraması + embedding similarity |
| `style_match` | Numeric [0-1] | Influencer `content_styles` ile işletme `brand_style` overlap (Jaccard) |
| `language_match` | Boolean | Influencer `primary_language` == işletme dili |
| `past_category_experience` | Numeric [0-1] | İşletme sektörü, influencer'ın `past_collaboration_categories` içinde mi? |
| `hashtag_overlap` | Numeric [0-1] | Influencer son N post hashtag'leri ile işletme sektörü hashtag grubu Jaccard |
| `profile_embedding_similarity` | Numeric [0-1] | Influencer profile embedding ↔ Listing embedding cosine |
| `tier_preference_match` | Boolean | İşletme `preferred_tiers` listesi influencer tier'ını içeriyor mu? |

#### D. Davranışsal Features (zamanla biriken)

| Feature | Hesaplama |
|---------|-----------|
| `similar_listings_swipe_rate` | Influencer'ın benzer sektördeki ilanları sağa kaydırma oranı |
| `similar_influencers_match_rate` | İşletmenin benzer tier influencer'larla match oranı |
| `historical_pair_success_rate` | Bu tier × sektör kombinasyonunda geçmiş anlaşma başarı oranı |

---

### 2.3 Etiketleme (Synthetic Labeling)

Mock data ile gerçek match verisi olmadığı için **kural tabanlı sentetik etiket** üretilir.

#### Etiketleme Formülü

```python
def compute_synthetic_label(features: dict) -> int:
    """
    3-class label üretir: 0=kötü, 1=orta, 2=iyi
    """
    score = (
        0.25 * features["sector_content_match"] +
        0.15 * features["location_score"] +
        0.10 * features["audience_location_match"] +
        0.08 * features["audience_age_overlap"] +
        0.08 * features["audience_interest_overlap"] +
        0.10 * features["budget_tier_match"] +
        0.10 * features["natural_affinity_score"] +
        0.05 * features["engagement_rate_normalized"] +
        0.04 * features["tier_preference_match"] +
        0.03 * features["style_match"] +
        0.02 * features["recency_score"]
    )
    
    # Gerçekçi gürültü ekle
    score += random.gauss(0, 0.05)
    score = max(0.0, min(1.0, score))
    
    if score > 0.70:
        return 2  # iyi match
    elif score > 0.40:
        return 1  # orta match
    else:
        return 0  # kötü match
```

#### Etiket Dağılımı Hedefi

| Etiket | Sınıf | Hedef Oran |
|--------|-------|------------|
| 2 | İyi match | %25-30 |
| 1 | Orta match | %40-45 |
| 0 | Kötü match | %30-35 |

Dengesizlik olursa class weighting veya undersampling uygulanır.

---

### 2.4 Eğitim Veri Şeması

Her satır bir `(influencer, listing)` çiftidir.

```json
{
  "pair_id": "pair_00001",
  "influencer_id": "inf_001",
  "listing_id": "col_023",
  "features": {
    "follower_count_log": 4.655,
    "following_ratio": 0.0197,
    "engagement_rate": 0.0421,
    "comment_like_ratio": 0.052,
    "account_age_days": 1890,
    "post_frequency_weekly": 4.2,
    "last_post_recency_days": 3,
    "influencer_tier_numeric": 2,
    "profile_completion": 0.92,
    "verified": 0,
    "past_collaboration_count": 14,
    "reel_post_ratio": 0.35,
    "business_age_months": 24,
    "business_size_numeric": 1,
    "listing_budget_min": 2000,
    "listing_budget_max": 5000,
    "listing_budget_mid": 3500,
    "business_verified": 1,
    "deliverable_count": 4,
    "sector_content_match": 0.87,
    "location_distance_km": 2.4,
    "location_score": 0.787,
    "audience_location_match": 0.55,
    "audience_age_overlap": 0.75,
    "audience_gender_match": 0.82,
    "audience_income_match": 0.65,
    "audience_interest_overlap": 0.6,
    "budget_tier_match": 1.0,
    "natural_affinity_score": 0.6,
    "style_match": 0.8,
    "language_match": 1,
    "past_category_experience": 0.4,
    "hashtag_overlap": 0.35,
    "profile_embedding_similarity": 0.78,
    "tier_preference_match": 1
  },
  "label": 2,
  "split": "train"
}
```

#### Veri Hacmi

| Split | Hedef Çift Sayısı | Oran |
|-------|-------------------|------|
| train | 3500 | %70 |
| validation | 750 | %15 |
| test | 750 | %15 |
| **Toplam** | **5000** | **%100** |

#### Pair Generation Stratejisi

```
80 influencer × 80 ilan = 6400 olası çift
→ 5000 çift sample (random sampling, ama her sınıfta yeterli temsil için)
→ Her influencer ortalama 60-70 çift, her ilan ortalama 60-70 çift
```

**Önemli**: Train/val/test split'lerinde **influencer veya ilan leak olmamalı**. Yani bir influencer hem train'de hem test'te olabilir, ama aynı `(influencer, listing)` çifti tek split'te olmalı.

---

### 2.5 Eğitim Pipeline

```
1. Seed data DB'ye yüklenir
   ↓
2. Pair generation script
   - 80 influencer × 80 ilan kombinasyonlarından 5000 çift seç
   - pair_id ata, split ata (random %70/15/15)
   ↓
3. Feature extraction script
   - Her çift için tüm featureları hesapla
   - Embedding'leri hesapla (sentence-transformers veya OpenAI)
   - PostGIS ile mesafe hesapla
   - JSON / Parquet dosyasına yaz
   ↓
4. Synthetic labeling
   - Yukarıdaki formülle her çifte label üret
   - Etiket dağılımını kontrol et
   ↓
5. LightGBM training
   - sklearn-uyumlu API ile train
   - Hyperparameter tuning (GridSearch veya Optuna)
   - Cross-validation
   ↓
6. Evaluation
   - Test set üzerinde accuracy, precision/recall, F1
   - Feature importance grafiği
   - Confusion matrix
   ↓
7. Model serialization
   - joblib veya pickle ile kaydet
   - FastAPI servisinden lazy-load
   ↓
8. Inference endpoint
   - POST /api/ml/rank
   - Input: influencer_id, [listing_ids]
   - Output: scored ve ranked list
```

#### Hyperparameter Önerileri (Başlangıç)

```python
params = {
    "objective": "multiclass",
    "num_class": 3,
    "metric": "multi_logloss",
    "learning_rate": 0.05,
    "num_leaves": 31,
    "max_depth": -1,
    "min_data_in_leaf": 20,
    "feature_fraction": 0.8,
    "bagging_fraction": 0.8,
    "bagging_freq": 5,
    "n_estimators": 500,
    "early_stopping_round": 50
}
```

---

## 3. Eğitim Gerektirmeyen AI Bileşenleri

Bunlar mock data kullanır ama **eğitim gerektirmez**.

### 3.1 Embedding Pipeline
- **Model**: `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2` (384-dim, lokal)
- **Alternatif**: OpenAI `text-embedding-3-small` (1536-dim)
- **Kullanım**:
  - Influencer profili (bio + son N post caption) → vektör
  - İşletme ilanı (description + sector) → vektör
- **Depolama**: `pgvector` ile PostgreSQL'de
- **Eğitim**: Yok, pre-trained kullanılır

### 3.2 Tier Sınıflandırma (Rule-Based)

```python
def classify_tier(follower_count, engagement_rate):
    if follower_count < 10_000:
        return "nano"
    elif follower_count < 100_000:
        return "micro"
    elif follower_count < 500_000:
        return "mid"
    elif follower_count < 1_000_000:
        return "macro"
    else:
        return "mega"
```

### 3.3 Doğal Afinite Skoru (Rule-Based + Embedding)

```
score = 0.4 * (mentioned_brands matching) +
        0.4 * (caption embedding similarity to sector) +
        0.2 * (hashtag overlap with sector hashtag group)
```

### 3.4 Agent (LLM, OpenAI gpt-5-nano)

Eğitim yok. Sadece:
- System prompt template (kullanıcı tercih formunu içerir)
- Structured output (JSON schema)
- Max 10 tur döngü kontrolü
- Anlaşma özeti üretimi

---

## 4. Üretim Sırası ve Hacim Özeti

### Tablo Hacimleri

| Veri Tipi | Tablo | Hedef Hacim |
|-----------|-------|-------------|
| Taksonomi | sectors | 30 |
| Taksonomi | content_categories | 25 |
| Taksonomi | content_styles | 15 |
| Taksonomi | job_positions | 25 |
| Taksonomi | employment_types | 7 |
| Taksonomi | hashtags | ~400 |
| Taksonomi | locations | ~120 |
| Entity | influencer_profiles | **80** |
| Entity | business_profiles | **50** |
| Entity | worker_profiles | **60** |
| Activity | instagram_posts | **~2400** |
| Activity | collab_listings | **80** |
| Activity | job_listings | **70** |
| Preferences | agent_preferences | **190** |
| Behavioral | swipes | ~800 |
| Behavioral | matches | ~150 |
| Behavioral | agreements | ~80 |
| Training | training_pairs (feature + label) | **5000** |

### Önerilen Üretim Sırası

1. **Taksonomi tabloları** (1 gün)
   - sectors, content_categories, styles, positions, employment_types, hashtags, locations, audience tags
2. **Entity profilleri** (2-3 gün)
   - influencer_profiles → business_profiles → worker_profiles
3. **Activity verileri** (2-3 gün)
   - instagram_posts (script ile) → collab_listings → job_listings
4. **Agent tercih formları** (entity'lerle birlikte, 1 gün)
5. **Davranışsal mock veri** (1 gün)
   - swipes → matches → agreements
6. **Pair generation + feature extraction + synthetic labeling** (1-2 gün)
7. **Model training + evaluation** (1-2 gün)

**Toplam tahmini süre**: ~10-12 iş günü (paralelleştirilebilir).

### Önemli Tavsiye

İlk turda **minimum hacimde** üret (örn: 10 influencer, 5 işletme, 200 post), end-to-end pipeline'ı çalıştır, **sonra ölçeklendir**. Aksi takdirde veriyi üretip pipeline'da bug bulunca her seferinde tüm veriyi regenerate etmek zaman kaybı olur.

---

## Ek: Doğal Afinite Sinyali için Özel Üretim Notu

`natural_affinity_score` feature'ının anlamlı olması için, **mock data üretimi sırasında bilinçli olarak** şu eklemeler yapılmalı:

- ~20 influencer'a, belirli bir sektör/marka türünden **organik** (anlaşmasız) bahseden 3-5 post ekle
- Örnek: `inf_005` (foodie influencer) → "Coffee Roastery Kadıköy" benzeri 4 farklı yerden bahseden postlar
- Bu postlarda `mentioned_brands` veya caption'da işletme adı geçsin
- Bu sayede ranking model, "bu influencer bu sektörü zaten organik seviyor" sinyalini öğrenebilir

Bu olmadan `natural_affinity_score` her zaman düşük çıkar ve ayırt edici bir feature olmaz.

---

**Doküman Sonu**