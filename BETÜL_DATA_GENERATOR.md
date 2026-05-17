# Agent Bağlamı — Mehmet (Veri Üretimi)
## Proje: InfluMatch — Seed Data Generator

Sen bu projenin **Veri Mühendisi**sin. Görevin aşağıdaki tüm seed dataları tek bir Python scripti ile üretmek.

---

## GÖREV ÖZETİ

Tek bir `generate_all_data.py` scripti yaz. Çalıştırıldığında `output/` klasörüne aşağıdaki JSON dosyalarını üretsin:

| Dosya | Hacim |
|-------|-------|
| `taxonomy.json` | Sektörler, kategoriler, stiller, pozisyonlar, istihdam türleri, hashtag'ler, lokasyonlar |
| `influencer_profiles.json` | 20 influencer |
| `business_profiles.json` | 10 işletme |
| `instagram_posts.json` | 300–500 post |
| `collab_listings.json` | 20 işbirliği ilanı |
| `agent_preferences.json` | 30 tercih formu (20 influencer + 10 işletme) |
| `swipes.json` | 100–200 swipe |
| `matches.json` | 40 match |
| `agreements.json` | 20 agreement |
| `training_pairs.json` | 1000 training pair |

**Toplam**: ~10 JSON dosyası, tek script, tek çalıştırma.

---

## KRİTİK KURALLAR

1. **Hiçbir external API kullanma** — tüm veri Python `random` + sabit listelerden üretilir
2. **Referential integrity**: her `influencer_id`, `business_id`, `listing_id` gerçekten var olan entity'lere ait olmalı
3. **İstatistiksel tutarlılık**: engagement_rate × follower_count = gerçekçi like sayısı
4. **Deterministik**: `random.seed(42)` ile başla — her çalıştırmada aynı çıktı
5. **UTF-8 Türkçe**: tüm isimler, bio'lar, caption'lar Türkçe
6. **ISO 8601**: tüm tarihler `2026-05-17T...Z` formatında

---

## ADIM 1: TAKSONOMİ VERİLERİ

Bu listeler sabit. Scriptin başında dict olarak tanımla.

### 1.1 Sektörler (30 adet — dokümanın aynısı)

```python
SECTORS = [
    {"id": "sec_001", "name": "Kafe", "parent_category": "Yeme-İçme"},
    {"id": "sec_002", "name": "Spesiyalti Kahve", "parent_category": "Yeme-İçme"},
    {"id": "sec_003", "name": "Brunch / Kahvaltı", "parent_category": "Yeme-İçme"},
    {"id": "sec_004", "name": "Restoran", "parent_category": "Yeme-İçme"},
    {"id": "sec_005", "name": "Fast Food", "parent_category": "Yeme-İçme"},
    {"id": "sec_006", "name": "Pastane / Fırın", "parent_category": "Yeme-İçme"},
    {"id": "sec_007", "name": "Butik", "parent_category": "Moda"},
    {"id": "sec_008", "name": "Hazır Giyim", "parent_category": "Moda"},
    {"id": "sec_009", "name": "Ayakkabı", "parent_category": "Moda"},
    {"id": "sec_010", "name": "Aksesuar", "parent_category": "Moda"},
    {"id": "sec_011", "name": "Kuaför / Berber", "parent_category": "Güzellik"},
    {"id": "sec_012", "name": "Güzellik Salonu", "parent_category": "Güzellik"},
    {"id": "sec_013", "name": "Tırnak Bakım", "parent_category": "Güzellik"},
    {"id": "sec_014", "name": "Kozmetik Mağazası", "parent_category": "Güzellik"},
    {"id": "sec_015", "name": "Fitness / Spor Salonu", "parent_category": "Spor"},
    {"id": "sec_016", "name": "Pilates / Yoga", "parent_category": "Spor"},
    {"id": "sec_017", "name": "Kitabevi", "parent_category": "Kültür"},
    {"id": "sec_018", "name": "Sanat Galerisi", "parent_category": "Kültür"},
    {"id": "sec_019", "name": "Teknoloji Mağazası", "parent_category": "Perakende"},
    {"id": "sec_020", "name": "Ev Dekorasyon", "parent_category": "Perakende"},
    {"id": "sec_021", "name": "Çiçekçi", "parent_category": "Perakende"},
    {"id": "sec_022", "name": "Eczane", "parent_category": "Sağlık"},
    {"id": "sec_023", "name": "Optik", "parent_category": "Sağlık"},
    {"id": "sec_024", "name": "Oyuncakçı", "parent_category": "Perakende"},
    {"id": "sec_025", "name": "Evcil Hayvan Mağazası", "parent_category": "Perakende"},
    {"id": "sec_026", "name": "Kırtasiye", "parent_category": "Perakende"},
    {"id": "sec_027", "name": "Hediyelik", "parent_category": "Perakende"},
    {"id": "sec_028", "name": "Bar / Cocktail", "parent_category": "Yeme-İçme"},
    {"id": "sec_029", "name": "Otel / Pansiyon", "parent_category": "Konaklama"},
    {"id": "sec_030", "name": "Mücevher", "parent_category": "Moda"},
]
```

### 1.2 İçerik Kategorileri (25 adet)

```python
CONTENT_CATEGORIES = [
    {"id": "cat_001", "name": "Lifestyle"},
    {"id": "cat_002", "name": "Food & Drink"},
    {"id": "cat_003", "name": "Fashion"},
    {"id": "cat_004", "name": "Beauty"},
    {"id": "cat_005", "name": "Makeup"},
    {"id": "cat_006", "name": "Skincare"},
    {"id": "cat_007", "name": "Tech"},
    {"id": "cat_008", "name": "Travel"},
    {"id": "cat_009", "name": "Fitness"},
    {"id": "cat_010", "name": "Yoga & Wellness"},
    {"id": "cat_011", "name": "Parenting"},
    {"id": "cat_012", "name": "Gaming"},
    {"id": "cat_013", "name": "Education"},
    {"id": "cat_014", "name": "Finance"},
    {"id": "cat_015", "name": "Automotive"},
    {"id": "cat_016", "name": "Photography"},
    {"id": "cat_017", "name": "Art"},
    {"id": "cat_018", "name": "Music"},
    {"id": "cat_019", "name": "Home Decor"},
    {"id": "cat_020", "name": "Gardening"},
    {"id": "cat_021", "name": "Books"},
    {"id": "cat_022", "name": "Pets"},
    {"id": "cat_023", "name": "Sustainable Living"},
    {"id": "cat_024", "name": "Mental Health"},
    {"id": "cat_025", "name": "Comedy / Entertainment"},
]
```

### 1.3 İçerik Stilleri (15 adet)

```python
CONTENT_STYLES = [
    {"id": "sty_001", "name": "Minimalist"},
    {"id": "sty_002", "name": "Renkli / Canlı"},
    {"id": "sty_003", "name": "Vintage"},
    {"id": "sty_004", "name": "Lüks / Premium"},
    {"id": "sty_005", "name": "Casual"},
    {"id": "sty_006", "name": "Profesyonel"},
    {"id": "sty_007", "name": "Eğlenceli / Komik"},
    {"id": "sty_008", "name": "Ciddi / Bilgilendirici"},
    {"id": "sty_009", "name": "Samimi"},
    {"id": "sty_010", "name": "İlham Verici"},
    {"id": "sty_011", "name": "Aesthetic"},
    {"id": "sty_012", "name": "Doğal / Organik"},
    {"id": "sty_013", "name": "Şık / Glamour"},
    {"id": "sty_014", "name": "Sokak Tarzı"},
    {"id": "sty_015", "name": "Sade / Sakin"},
]
```

### 1.4 Hashtag Havuzu

```python
HASHTAG_GROUPS = {
    "kahve": ["#kahve", "#coffee", "#filtrekahve", "#espresso", "#latte", "#thirdwave", "#spesiyaltikahve", "#barista", "#coffeelover", "#cafe"],
    "yemek": ["#food", "#foodie", "#yemek", "#lezzet", "#delicious", "#instafood", "#foodporn", "#brunch", "#breakfast", "#dinner", "#gastronomy", "#lezzetli"],
    "moda": ["#fashion", "#moda", "#ootd", "#style", "#outfit", "#fashionblogger", "#stylish", "#streetstyle", "#tarz", "#kombins"],
    "guzellik": ["#beauty", "#makeup", "#skincare", "#makyaj", "#cilt", "#guzellik", "#mua", "#beautyblogger", "#ciltbakimi", "#kozmetik"],
    "fitness": ["#fitness", "#workout", "#gym", "#health", "#fit", "#bodybuilding", "#training", "#cardio", "#spor", "#antrenman"],
    "seyahat": ["#travel", "#wanderlust", "#explore", "#seyahat", "#gezi", "#travelphotography", "#vacation", "#kesfet", "#tatil"],
    "teknoloji": ["#tech", "#technology", "#gadget", "#teknoloji", "#inceleme", "#review", "#apple", "#samsung", "#setup"],
    "lifestyle": ["#lifestyle", "#daily", "#morning", "#weekend", "#sundayfunday", "#enjoy", "#happy", "#günlük", "#huzur"],
    "lokasyon_istanbul": ["#istanbul", "#kadikoy", "#besiktas", "#karakoy", "#moda", "#galata", "#bosphorus", "#eminonu", "#nisantasi", "#bebek"],
    "dekorasyon": ["#homedecor", "#evdekorasyon", "#interior", "#decor", "#tasarim", "#minimal", "#dekorasyon"],
    "evcilhayvan": ["#pet", "#kedi", "#köpek", "#cat", "#dog", "#evcilhayvan", "#petsofinstagram"],
}
```

### 1.5 Lokasyonlar (İstanbul ilçeleri + birkaç şehir)

```python
LOCATIONS = [
    {"id": "loc_001", "name": "Kadıköy", "type": "district", "city": "İstanbul", "lat": 40.9928, "lng": 29.0277},
    {"id": "loc_002", "name": "Beşiktaş", "type": "district", "city": "İstanbul", "lat": 41.0429, "lng": 29.0079},
    {"id": "loc_003", "name": "Şişli", "type": "district", "city": "İstanbul", "lat": 41.0602, "lng": 28.9877},
    {"id": "loc_004", "name": "Beyoğlu", "type": "district", "city": "İstanbul", "lat": 41.0370, "lng": 28.9770},
    {"id": "loc_005", "name": "Üsküdar", "type": "district", "city": "İstanbul", "lat": 41.0234, "lng": 29.0157},
    {"id": "loc_006", "name": "Bakırköy", "type": "district", "city": "İstanbul", "lat": 40.9800, "lng": 28.8770},
    {"id": "loc_007", "name": "Sarıyer", "type": "district", "city": "İstanbul", "lat": 41.1670, "lng": 29.0500},
    {"id": "loc_008", "name": "Fatih", "type": "district", "city": "İstanbul", "lat": 41.0186, "lng": 28.9400},
    {"id": "loc_009", "name": "Ataşehir", "type": "district", "city": "İstanbul", "lat": 40.9833, "lng": 29.1167},
    {"id": "loc_010", "name": "Maltepe", "type": "district", "city": "İstanbul", "lat": 40.9337, "lng": 29.1300},
    {"id": "loc_011", "name": "Kartal", "type": "district", "city": "İstanbul", "lat": 40.8900, "lng": 29.1900},
    {"id": "loc_012", "name": "Pendik", "type": "district", "city": "İstanbul", "lat": 40.8756, "lng": 29.2339},
    {"id": "loc_013", "name": "Karaköy", "type": "neighborhood", "city": "İstanbul", "lat": 41.0220, "lng": 28.9740},
    {"id": "loc_014", "name": "Nişantaşı", "type": "neighborhood", "city": "İstanbul", "lat": 41.0490, "lng": 28.9930},
    {"id": "loc_015", "name": "Cihangir", "type": "neighborhood", "city": "İstanbul", "lat": 41.0320, "lng": 28.9830},
    {"id": "loc_016", "name": "Bebek", "type": "neighborhood", "city": "İstanbul", "lat": 41.0770, "lng": 29.0430},
    {"id": "loc_017", "name": "Moda", "type": "neighborhood", "city": "İstanbul", "lat": 40.9854, "lng": 29.0258},
    {"id": "loc_018", "name": "Bağdat Caddesi", "type": "neighborhood", "city": "İstanbul", "lat": 40.9600, "lng": 29.0900},
    {"id": "loc_019", "name": "Ankara Merkez", "type": "city", "city": "Ankara", "lat": 39.9334, "lng": 32.8597},
    {"id": "loc_020", "name": "İzmir Merkez", "type": "city", "city": "İzmir", "lat": 38.4237, "lng": 27.1428},
    {"id": "loc_021", "name": "Bursa Merkez", "type": "city", "city": "Bursa", "lat": 40.1885, "lng": 29.0610},
    {"id": "loc_022", "name": "Antalya Merkez", "type": "city", "city": "Antalya", "lat": 36.8969, "lng": 30.7133},
]
```

---

## ADIM 2: INFLUENCER PROFİLLERİ (20 adet)

### Tier Dağılımı

| Tier | Adet | Follower Aralığı | Engagement Rate |
|------|------|-------------------|-----------------|
| Nano | 5 | 1K–10K | %4–%8 |
| Micro | 7 | 10K–100K | %2–%5 |
| Mid | 5 | 100K–500K | %1.5–%3 |
| Macro | 2 | 500K–1M | %1–%2 |
| Mega | 1 | 1M+ | %0.5–%1.5 |

### İsim Havuzu (hazır kullan, rastgele seçme)

```python
INFLUENCER_TEMPLATES = [
    # Nano tier (5)
    {"name": "Elif Aydın", "username": "elifgezgin", "niche": ["cat_008", "cat_001"], "styles": ["sty_009", "sty_012"], "city": "İstanbul", "district": "Kadıköy", "bio": "Keşfedilmemiş sokaklar ve sakin köşeler 📍"},
    {"name": "Kaan Polat", "username": "kaanfit", "niche": ["cat_009", "cat_010"], "styles": ["sty_008", "sty_006"], "city": "Ankara", "district": "Çankaya", "bio": "Doğal beslenme ve outdoor antrenman 🏋️"},
    {"name": "İrem Koç", "username": "iremscraftlab", "niche": ["cat_019", "cat_001"], "styles": ["sty_001", "sty_011"], "city": "İstanbul", "district": "Beşiktaş", "bio": "El yapımı dekor ve minimalist yaşam 🏠"},
    {"name": "Burak Şen", "username": "burakpetworld", "niche": ["cat_022"], "styles": ["sty_007", "sty_009"], "city": "İstanbul", "district": "Üsküdar", "bio": "Kedi babası × köpek dayısı 🐾"},
    {"name": "Melis Tan", "username": "melisnaturel", "niche": ["cat_006", "cat_004"], "styles": ["sty_012", "sty_015"], "city": "İzmir", "district": "Bornova", "bio": "Doğal cilt bakım rutinleri 🌿"},

    # Micro tier (7)
    {"name": "Zeynep Karagöz", "username": "zeynepfoodie", "niche": ["cat_002", "cat_001"], "styles": ["sty_011", "sty_009"], "city": "İstanbul", "district": "Kadıköy", "bio": "İstanbul'da brunch avcısı 🥐 | Reklam: DM"},
    {"name": "Can Demir", "username": "canstreetbites", "niche": ["cat_002", "cat_008"], "styles": ["sty_005", "sty_014"], "city": "İstanbul", "district": "Beyoğlu", "bio": "Sokak lezzetleri ve yeni mekanlar 🍜"},
    {"name": "Selin Çelik", "username": "selintechtips", "niche": ["cat_007", "cat_001"], "styles": ["sty_006", "sty_001"], "city": "İstanbul", "district": "Ataşehir", "bio": "Gadget incelemeleri × üretkenlik ipuçları 📱"},
    {"name": "Arda Kılıç", "username": "ardastreetstyle", "niche": ["cat_003", "cat_001"], "styles": ["sty_014", "sty_005"], "city": "İstanbul", "district": "Şişli", "bio": "Erkek sokak stili ve moda trendleri 🧥"},
    {"name": "Defne Şahin", "username": "defneminimal", "niche": ["cat_001", "cat_019"], "styles": ["sty_001", "sty_015"], "city": "Antalya", "district": "Muratpaşa", "bio": "Minimalist yaşam, sade güzellik ✨"},
    {"name": "Berk Doğan", "username": "berkmixology", "niche": ["cat_002", "cat_001"], "styles": ["sty_004", "sty_013"], "city": "İstanbul", "district": "Beyoğlu", "bio": "Fine dining ve kokteyl kültürü 🍸"},
    {"name": "Naz Yılmaz", "username": "nazmakeup", "niche": ["cat_005", "cat_004"], "styles": ["sty_002", "sty_013"], "city": "Bursa", "district": "Nilüfer", "bio": "Günlük makyaj ve saç bakımı 💄"},

    # Mid tier (5)
    {"name": "Ayşe Kaya", "username": "aysekstyle", "niche": ["cat_003", "cat_004"], "styles": ["sty_013", "sty_004"], "city": "İstanbul", "district": "Nişantaşı", "bio": "Moda ve güzellik | PR: hello@ayse.com"},
    {"name": "Murat Özkan", "username": "muratgurme", "niche": ["cat_002", "cat_008"], "styles": ["sty_006", "sty_009"], "city": "İstanbul", "district": "Beşiktaş", "bio": "Gastronomi yazarı & restoran keşifçisi 🍽️"},
    {"name": "Pınar Aksu", "username": "pinarwellness", "niche": ["cat_010", "cat_009"], "styles": ["sty_010", "sty_012"], "city": "İstanbul", "district": "Sarıyer", "bio": "Yoga eğitmeni × wellness içerik üreticisi 🧘‍♀️"},
    {"name": "Emre Tuncer", "username": "emrereviews", "niche": ["cat_007", "cat_012"], "styles": ["sty_008", "sty_005"], "city": "Ankara", "district": "Çankaya", "bio": "Teknoloji ve oyun dünyası 🎮"},
    {"name": "Dilan Arslan", "username": "dilanbeauty", "niche": ["cat_004", "cat_006"], "styles": ["sty_011", "sty_004"], "city": "İstanbul", "district": "Kadıköy", "bio": "Dermatolog onaylı cilt bakım protokolleri 🧴"},

    # Macro tier (2)
    {"name": "Yasemin Erdoğan", "username": "yaseminlifestyle", "niche": ["cat_001", "cat_003", "cat_008"], "styles": ["sty_004", "sty_013"], "city": "İstanbul", "district": "Bebek", "bio": "Lifestyle | Moda | Seyahat ✈️ İş birliği: mgmt@yasemin.com"},
    {"name": "Ozan Acar", "username": "ozanfitcoach", "niche": ["cat_009", "cat_001"], "styles": ["sty_010", "sty_006"], "city": "İstanbul", "district": "Beşiktaş", "bio": "Online PT | 500K+ kişiye ilham 💪"},

    # Mega tier (1)
    {"name": "Deniz Soylu", "username": "denizsoylu", "niche": ["cat_001", "cat_003", "cat_008"], "styles": ["sty_004", "sty_002"], "city": "İstanbul", "district": "Nişantaşı", "bio": "1M+ takipçi | Marka elçisi | PR: @mgmt"},
]
```

### Profil Üretim Fonksiyonu

```python
import random
import math
from datetime import datetime, timedelta

TIER_CONFIG = {
    "nano":  {"min_f": 1000,    "max_f": 10000,   "eng_min": 0.04, "eng_max": 0.08, "collab_range": (0, 5)},
    "micro": {"min_f": 10000,   "max_f": 100000,  "eng_min": 0.02, "eng_max": 0.05, "collab_range": (3, 20)},
    "mid":   {"min_f": 100000,  "max_f": 500000,  "eng_min": 0.015,"eng_max": 0.03, "collab_range": (10, 40)},
    "macro": {"min_f": 500000,  "max_f": 1000000, "eng_min": 0.01, "eng_max": 0.02, "collab_range": (20, 80)},
    "mega":  {"min_f": 1000000, "max_f": 3000000, "eng_min": 0.005,"eng_max": 0.015,"collab_range": (50, 150)},
}

def get_tier_for_index(i):
    if i < 5: return "nano"
    if i < 12: return "micro"
    if i < 17: return "mid"
    if i < 19: return "macro"
    return "mega"

def generate_influencer(template, index):
    tier = get_tier_for_index(index)
    cfg = TIER_CONFIG[tier]
    followers = random.randint(cfg["min_f"], cfg["max_f"])
    engagement = round(random.uniform(cfg["eng_min"], cfg["eng_max"]), 4)
    following = random.randint(int(followers * 0.01), int(followers * 0.05))
    post_count = random.randint(80, 600)
    
    # Audience demographics
    age_dist = {}
    remaining = 1.0
    for bucket in ["18-24", "25-34", "35-44", "45+"]:
        if bucket == "45+":
            age_dist[bucket] = round(remaining, 2)
        else:
            val = round(random.uniform(0.1, 0.5), 2)
            val = min(val, remaining - 0.05)
            age_dist[bucket] = val
            remaining -= val
    
    loc = next((l for l in LOCATIONS if l["name"] == template.get("district", "Kadıköy")), LOCATIONS[0])
    
    rate_base = {
        "nano": (500, 2000),
        "micro": (2000, 8000),
        "mid": (8000, 25000),
        "macro": (25000, 60000),
        "mega": (60000, 200000),
    }[tier]

    return {
        "id": f"inf_{index+1:03d}",
        "display_name": template["name"],
        "username": f"@{template['username']}",
        "bio": template["bio"],
        "tier": tier,
        "follower_count": followers,
        "following_count": following,
        "post_count": post_count,
        "account_created_at": (datetime(2026, 5, 17) - timedelta(days=random.randint(365, 2000))).strftime("%Y-%m-%d"),
        "verified": tier in ("macro", "mega"),
        "location": {
            "city": template["city"],
            "district": template.get("district", ""),
            "lat": loc["lat"] + random.uniform(-0.01, 0.01),
            "lng": loc["lng"] + random.uniform(-0.01, 0.01),
        },
        "content_categories": template["niche"],
        "content_styles": template["styles"],
        "primary_language": "tr",
        "audience_demographics": {
            "age_distribution": age_dist,
            "gender_distribution": {
                "female": round(random.uniform(0.4, 0.75), 2),
                "male": 0,  # filled below
                "other": round(random.uniform(0.01, 0.03), 2),
            },
            "location_distribution": {
                "İstanbul": round(random.uniform(0.35, 0.65), 2),
                "Ankara": round(random.uniform(0.05, 0.15), 2),
                "İzmir": round(random.uniform(0.03, 0.10), 2),
                "diğer": 0,  # filled below
            },
        },
        "rate_range": {
            "min": rate_base[0],
            "max": rate_base[1],
            "currency": "TRY",
        },
        "engagement_rate": engagement,
        "profile_completion": round(random.uniform(0.75, 0.98), 2),
        "past_collaboration_count": random.randint(*cfg["collab_range"]),
        "last_active_at": (datetime(2026, 5, 17) - timedelta(days=random.randint(0, 14))).strftime("%Y-%m-%d"),
    }
    # Not: gender male = 1 - female - other, location diğer = 1 - sum
    # Bu hesaplamaları fonksiyon sonunda yap
```

---

## ADIM 3: İŞLETME PROFİLLERİ (10 adet)

### İşletme Şablonları

```python
BUSINESS_TEMPLATES = [
    {"name": "Coffee Roastery Kadıköy", "sector": "sec_002", "district": "Kadıköy", "styles": ["sty_001", "sty_011"], "size": "küçük", "desc": "El yapımı filtre kahve ve özel demlemeler", "target_cats": ["cat_002", "cat_001"]},
    {"name": "Yeşil Tabak", "sector": "sec_004", "district": "Beşiktaş", "styles": ["sty_012", "sty_009"], "size": "küçük", "desc": "Vegan ve organik restoran", "target_cats": ["cat_002", "cat_023"]},
    {"name": "Urban Threads", "sector": "sec_007", "district": "Nişantaşı", "styles": ["sty_014", "sty_005"], "size": "orta", "desc": "Erkek sokak giyim butik markası", "target_cats": ["cat_003", "cat_001"]},
    {"name": "Glow Cilt Bakım", "sector": "sec_012", "district": "Şişli", "styles": ["sty_001", "sty_006"], "size": "orta", "desc": "Klinik cilt bakım merkezi ve ürün satışı", "target_cats": ["cat_006", "cat_004"]},
    {"name": "FitZone Studio", "sector": "sec_015", "district": "Beşiktaş", "styles": ["sty_010", "sty_006"], "size": "küçük", "desc": "Fonksiyonel antrenman ve CrossFit merkezi", "target_cats": ["cat_009", "cat_010"]},
    {"name": "Botanik Kafe", "sector": "sec_001", "district": "Cihangir", "styles": ["sty_012", "sty_015"], "size": "küçük", "desc": "Doğal malzeme, bitki çayları, huzurlu ortam", "target_cats": ["cat_001", "cat_002"]},
    {"name": "Teknosan", "sector": "sec_019", "district": "Ataşehir", "styles": ["sty_006", "sty_001"], "size": "orta", "desc": "Aksesuarlar ve gadget mağazası", "target_cats": ["cat_007"]},
    {"name": "Kahve & Stil", "sector": "sec_001", "district": "Karaköy", "styles": ["sty_011", "sty_013"], "size": "küçük", "desc": "Moda odaklı konsept kafe", "target_cats": ["cat_003", "cat_002"]},
    {"name": "Patili Dünya", "sector": "sec_025", "district": "Kadıköy", "styles": ["sty_007", "sty_009"], "size": "küçük", "desc": "Doğal mama ve evcil hayvan aksesuarları", "target_cats": ["cat_022", "cat_001"]},
    {"name": "Çevik Mutfak", "sector": "sec_004", "district": "Kadıköy", "styles": ["sty_005", "sty_002"], "size": "küçük", "desc": "Fast-casual, yerel malzeme odaklı restoran", "target_cats": ["cat_002"]},
]
```

### İşletme Üretim Fonksiyonu

```python
def generate_business(template, index):
    loc = next((l for l in LOCATIONS if l["name"] == template["district"]), LOCATIONS[0])
    
    budget_by_size = {"küçük": (1000, 5000), "orta": (5000, 20000), "zincir": (20000, 100000)}
    
    return {
        "id": f"biz_{index+1:03d}",
        "name": template["name"],
        "sector_id": template["sector"],
        "description": template["desc"],
        "location": {
            "city": "İstanbul",
            "district": template["district"],
            "lat": loc["lat"] + random.uniform(-0.005, 0.005),
            "lng": loc["lng"] + random.uniform(-0.005, 0.005),
        },
        "brand_style": template["styles"],
        "size": template["size"],
        "business_age_months": random.randint(6, 72),
        "target_audience": {
            "age_buckets": random.sample(["18-24", "25-34", "35-44"], k=random.randint(1, 2)),
            "gender_preference": "all",
            "income_groups": random.sample(["bütçe", "orta", "premium"], k=2),
            "interest_tags": [CONTENT_CATEGORIES[int(c.split("_")[1])-1]["name"].lower() for c in template["target_cats"]],
        },
        "verified": random.random() > 0.3,
        "profile_completion": round(random.uniform(0.70, 0.95), 2),
        "past_collaboration_count": random.randint(0, 15),
        "past_collaboration_categories": template["target_cats"],
        "created_at": (datetime(2026, 5, 17) - timedelta(days=random.randint(30, 500))).strftime("%Y-%m-%d"),
    }
```

---

## ADIM 4: INSTAGRAM POSTLARI (300–500 adet)

Her influencer için 15–25 post üret (20 influencer × ortalama 20 = ~400 post).

### Caption Şablonları (kategoriye göre)

```python
CAPTION_TEMPLATES = {
    "cat_002": [  # Food & Drink
        "Pazar sabahları için en sevdiğim brunch mekanlarından biri 🥐 {location} fırından çıkmış simitli kruvasanı şart bilin ☕",
        "{location}'da yeni keşfettiğim bu mekanın kahvesi harika 🤌 Filtre kahve sevenler buraya gelsin",
        "Bu tabağı bitirmek için yarım saat bile yetmedi 😍 {location} favorilerimden",
        "Bugünün enerjisi: çift shot espresso ☕ #mondaymotivation",
        "Yeni menüyü denedim ve söyleyecek çok şeyim var 🍽️ Kaydet sonra bak!",
        "{location}'nin gizli cenneti bu yer 🌿 Story'de detaylar",
        "Arkadaşlarla brunch = mutluluk formülü 🥂",
    ],
    "cat_003": [  # Fashion
        "Bugünün kombini: minimal ama etkili ✨ Parçaların hepsi yerli markalardan",
        "Sokak stili ama şık — ikisi bir arada olabilir 🧥 #ootd",
        "Bu ceketle kışa hazırım ❄️ Link bio'da",
        "Vintage parçaları modern kombine etmeyi seviyorum 🎩",
        "Gardırobumda 5 temel parça: swipe ile gör →",
        "{location}'da sokak modası gözlemi 📸",
    ],
    "cat_004": [  # Beauty
        "Sabah rutinimde olmazsa olmazım: SPF! ☀️ Cildimi korumak önceliğim",
        "Bu serum sayesinde cildim 2 haftada fark yarattı 🧴 Detaylar story'de",
        "Doğal malzemelerle evde maske tarifi 🌿 Kaydet!",
        "Akşam bakım rutinim: 5 adımda parlak cilt ✨",
        "Bu ürünleri 3 aydır test ediyorum, sonuçlar şaşırtıcı",
    ],
    "cat_007": [  # Tech
        "Yeni setup tamamlandı 🖥️ Detaylar story'de",
        "Bu kulaklığı 2 haftadır kullanıyorum — dürüst inceleme geliyor 🎧",
        "Üretkenlik araçlarım: günde 3 saat kazanıyorum ⏱️",
        "Bu tablet çizim için mükemmel mi? Test ettim 📱",
        "Ev ofis kurulum maliyeti: sürpriz derecede düşük 💰",
    ],
    "cat_009": [  # Fitness
        "Bugünkü antrenman: üst vücut 💪 3×12 formatta — detaylar kaydırmalı",
        "Doğru form her şeyden önemli — video kaydırmalıda 🎥",
        "Sabah koşusu {location} sahilinde 🏃‍♂️ #morningrun",
        "30 günlük challenge sonuçları: swipe ile gör →",
        "Protein alımınız yeterli mi? Kontrol listesi story'de 🥩",
    ],
    "cat_001": [  # Lifestyle (fallback)
        "Günaydın! Bugün güzel bir gün olacak ☀️",
        "{location}'da keyifli bir öğleden sonra 🌸",
        "Hafta sonu huzuru — kitap, kahve, sessizlik 📚",
        "Bu anlar için yaşıyoruz ✨ #weekend",
        "Yeni haftaya motivasyonla başlıyoruz 💫",
        "Bahar geldi ve her yer çiçek açtı 🌷 {location}",
    ],
    "cat_022": [  # Pets
        "Patili dostum bugün ekstra sevimli 🐾",
        "Yeni mama denemesi: sonuçlar story'de 🐶",
        "Kedi sahipleri anlayacak: koltuk artık onun 😸",
        "Park günü! {location}'da patili piknik 🌳",
    ],
    "cat_019": [  # Home Decor
        "Minimal salon düzenim: az parça, çok etki ✨",
        "Bu rafı kendin yap! DIY detayları story'de 🔨",
        "Ev dekoru için ilham: Japandi tarzı 🎋",
        "Küçük alanlar için 5 depolama çözümü",
    ],
    "cat_008": [  # Travel
        "{location} keşif günlüğü 🗺️ Bilmediğiniz 3 mekan",
        "Bu şehirde kaybolmak en güzel aktivite 📍",
        "Seyahat çantamda olmazsa olmazlarım ✈️",
    ],
    "cat_005": [  # Makeup
        "Günlük makyaj rutinim: 5 dakikada doğal görünüm 💄",
        "Bu fondöten tam aradığım kapama gücüne sahip 👌",
        "Dudak renkleri karşılaştırması — favoriniz hangisi?",
    ],
    "cat_006": [  # Skincare
        "Cilt tipi testi: sen hangi gruptasın? Swipe ile öğren →",
        "Niacinamide vs Vitamin C: hangisi daha etkili? 🧪",
        "3 adımlı sabah rutini: temizle, nemlendir, koru ☀️",
    ],
    "cat_010": [  # Yoga & Wellness
        "Sabah meditasyonu: 10 dakikada zihin temizliği 🧘‍♀️",
        "Bu poz esnekliğinizi test eder — hazır mısınız?",
        "Wellness günlüğüm: nefes, hareket, farkındalık 🌅",
    ],
    "cat_012": [  # Gaming
        "Yeni oyun incelemesi: beklentilerin altında mı? 🎮",
        "Setup tour'um güncellenmiş hali — RGB her yerde ✨",
    ],
}
```

### Post Üretim Fonksiyonu

```python
def generate_posts_for_influencer(influencer):
    posts = []
    num_posts = random.randint(15, 25)
    primary_cat = influencer["content_categories"][0]
    secondary_cats = influencer["content_categories"][1:] if len(influencer["content_categories"]) > 1 else []
    
    now = datetime(2026, 5, 17)
    
    for j in range(num_posts):
        # %70 ana kategori, %30 yan kategori
        if random.random() < 0.7 or not secondary_cats:
            cat = primary_cat
        else:
            cat = random.choice(secondary_cats)
        
        # Caption seç
        templates = CAPTION_TEMPLATES.get(cat, CAPTION_TEMPLATES["cat_001"])
        caption = random.choice(templates).replace("{location}", influencer["location"]["district"])
        
        # Tarih: son 180 gün
        days_ago = random.randint(0, 180)
        posted_at = now - timedelta(days=days_ago, hours=random.randint(7, 22), minutes=random.randint(0, 59))
        
        # Post tipi
        post_type = random.choices(["post", "reel", "story_archived"], weights=[0.6, 0.3, 0.1])[0]
        
        # Metrikleri hesapla (tutarlı)
        base_likes = int(influencer["follower_count"] * influencer["engagement_rate"] * random.uniform(0.7, 1.3))
        if post_type == "reel":
            base_likes = int(base_likes * random.uniform(1.2, 2.0))  # reeller daha çok etkileşim alır
        
        # Hashtag'ler seç
        cat_name_map = {"cat_002": "yemek", "cat_003": "moda", "cat_004": "guzellik", "cat_005": "guzellik",
                        "cat_006": "guzellik", "cat_007": "teknoloji", "cat_008": "seyahat",
                        "cat_009": "fitness", "cat_010": "fitness", "cat_001": "lifestyle",
                        "cat_019": "dekorasyon", "cat_022": "evcilhayvan", "cat_012": "teknoloji"}
        hashtag_group = cat_name_map.get(cat, "lifestyle")
        available_hashtags = HASHTAG_GROUPS.get(hashtag_group, HASHTAG_GROUPS["lifestyle"])
        hashtags = random.sample(available_hashtags, k=min(random.randint(3, 7), len(available_hashtags)))
        
        # Lokasyon
        if influencer["location"]["city"] == "İstanbul":
            hashtags += random.sample(HASHTAG_GROUPS["lokasyon_istanbul"], k=random.randint(1, 3))
        
        # Mentioned brands (%15 ihtimalle organik marka bahsi)
        mentioned_brands = []
        if random.random() < 0.15:
            mentioned_brands = [f"@{random.choice(['cafekadikoy', 'urbanstyleco', 'fitzonestudio', 'botanikkafe', 'glowskincare'])}"]
        
        # Lokasyon tagi (%60 postta)
        location_tag = None
        if random.random() < 0.6:
            loc = next((l for l in LOCATIONS if l["name"] == influencer["location"]["district"]), LOCATIONS[0])
            location_tag = {
                "name": loc["name"],
                "lat": loc["lat"] + random.uniform(-0.01, 0.01),
                "lng": loc["lng"] + random.uniform(-0.01, 0.01),
            }
        
        posts.append({
            "post_id": f"post_{len(posts)+1:05d}",
            "influencer_id": influencer["id"],
            "type": post_type,
            "caption": caption,
            "hashtags": hashtags,
            "mentioned_brands": mentioned_brands,
            "location_tag": location_tag,
            "posted_at": posted_at.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "metrics": {
                "likes": base_likes,
                "comments": int(base_likes * random.uniform(0.03, 0.08)),
                "shares": int(base_likes * random.uniform(0.01, 0.04)),
                "saves": int(base_likes * random.uniform(0.05, 0.15)),
                "reach": int(base_likes * random.uniform(2.5, 5.0)),
            },
            "content_category": cat,
            "content_style": random.choice(influencer["content_styles"]),
            "media_count": random.randint(1, 5) if post_type == "post" else 1,
            "media_type": "video" if post_type == "reel" else "image",
        })
    
    return posts
```

---

## ADIM 5: İŞBİRLİĞİ İLANLARI (20 adet)

```python
COLLAB_LISTING_TEMPLATES = [
    "Yeni menümüz için 1 Reel içerik aranıyor",
    "Bahar koleksiyonu tanıtımı — 3 post + story serisi",
    "Mağaza açılışı için sosyal medya desteği",
    "Ürün inceleme videosu (1 Reel)",
    "Hafta sonu etkinliğimize influencer davet",
    "Yeni ürünümüzü test edecek içerik üreticisi",
    "Instagram story serisi — mekan tanıtımı",
    "Sezonluk kampanya yüzü aranıyor",
    "Organik marka elçisi — uzun vadeli işbirliği",
    "Açılış günü canlı yayın desteği",
]

def generate_collab_listing(business, index):
    budget_base = {"küçük": (1000, 5000), "orta": (3000, 15000), "zincir": (10000, 50000)}
    b_range = budget_base[business["size"]]
    b_min = random.randint(b_range[0], b_range[0] + 2000)
    b_max = random.randint(b_min + 1000, b_range[1])
    
    tier_by_budget = []
    if b_max <= 5000: tier_by_budget = ["nano", "micro"]
    elif b_max <= 15000: tier_by_budget = ["micro", "mid"]
    elif b_max <= 40000: tier_by_budget = ["mid", "macro"]
    else: tier_by_budget = ["macro", "mega"]
    
    return {
        "listing_id": f"col_{index+1:03d}",
        "business_id": business["id"],
        "type": "collaboration",
        "title": random.choice(COLLAB_LISTING_TEMPLATES),
        "description": f"{business['name']} için içerik üretecek influencer arıyoruz. {business['description']}.",
        "budget": {"min": b_min, "max": b_max, "currency": "TRY"},
        "deliverables": random.choice([["1 reel", "3 story"], ["2 post", "1 reel"], ["1 reel"], ["3 post", "5 story"]]),
        "preferred_tiers": tier_by_budget,
        "target_categories": business["past_collaboration_categories"],
        "preferred_styles": business["brand_style"],
        "deadline": (datetime(2026, 5, 17) + timedelta(days=random.randint(14, 60))).strftime("%Y-%m-%d"),
        "status": random.choices(["active", "closed", "expired"], weights=[0.75, 0.15, 0.10])[0],
        "created_at": (datetime(2026, 5, 17) - timedelta(days=random.randint(1, 30))).strftime("%Y-%m-%d"),
    }
```

---

## ADIM 6: AGENT TERCİH FORMLARI (30 adet)

```python
INFLUENCER_DEALBREAKERS = [
    "Alkol markası reklamı yapmam",
    "Haftada 2'den fazla post istemeyin",
    "Gece çekim yapamam",
    "Rakip marka ile aynı dönemde çalışmam",
    "Ücretsiz ürün karşılığı çalışmam",
    "Siyasi içerik üretmem",
    "Script zorlaması istemem, doğal olmalı",
    "Reels dışında içerik üretmem",
]

BUSINESS_DEALBREAKERS = [
    "Rakip markayı aynı dönemde tanıtmasın",
    "Negatif tonlu içerik istemiyoruz",
    "Minimum 10K takipçi bekliyoruz",
    "İçerik onayı zorunlu",
    "Stüdyoda çekim zorunlu",
    "7 gün içinde teslim şart",
    "Kendi logomuzun görünmesi zorunlu",
]

def generate_agent_prefs_influencer(influencer):
    rate = influencer["rate_range"]
    return {
        "id": f"agp_{influencer['id']}",
        "user_id": influencer["id"],
        "role": "influencer",
        "preferences": {
            "min_acceptable_budget": rate["min"],
            "ideal_budget": int((rate["min"] + rate["max"]) / 2),
            "dealbreakers": random.sample(INFLUENCER_DEALBREAKERS, k=random.randint(2, 4)),
            "preferred_deliverables": random.sample(["reel", "story", "post", "canlı yayın"], k=2),
            "max_revisions": random.randint(1, 3),
            "payment_terms": random.choice(["post öncesi %50", "tamamı peşin", "teslimde ödeme"]),
            "deadline_flexibility": random.choice(["esnek", "esnek değil", "görüşülebilir"]),
            "non_negotiable_items": ["payment_terms"],
            "negotiable_items": ["budget", "deliverables", "deadline"],
        },
    }

def generate_agent_prefs_business(business):
    return {
        "id": f"agp_{business['id']}",
        "user_id": business["id"],
        "role": "business",
        "preferences": {
            "max_budget": random.randint(3000, 20000),
            "ideal_budget": random.randint(2000, 10000),
            "dealbreakers": random.sample(BUSINESS_DEALBREAKERS, k=random.randint(2, 3)),
            "required_deliverables": random.choice([["1 reel"], ["2 post"], ["1 reel", "3 story"]]),
            "exclusivity_required": random.choice([True, False]),
            "exclusivity_days": random.choice([0, 14, 30, 60]),
            "non_negotiable_items": ["required_deliverables"],
            "negotiable_items": ["budget", "timeline", "optional_deliverables"],
        },
    }
```

---

## ADIM 7: DAVRANIŞSAL VERİLER

### Swipe, Match, Agreement üretimi

```python
def generate_behavioral_data(influencers, businesses, listings):
    swipes = []
    matches = []
    agreements = []
    
    swipe_id = 0
    match_id = 0
    agreement_id = 0
    
    now = datetime(2026, 5, 17)
    
    for inf in influencers:
        # Her influencer 5-10 ilana swipe yapar
        available_listings = [l for l in listings if l["status"] == "active"]
        num_swipes = min(random.randint(5, 10), len(available_listings))
        chosen = random.sample(available_listings, k=num_swipes)
        
        for listing in chosen:
            swipe_id += 1
            biz = next(b for b in businesses if b["id"] == listing["business_id"])
            
            # Uyumlu çiftlerde %75 sağa, uyumsuzlarda %20
            is_compatible = any(
                cat in inf["content_categories"]
                for cat in listing.get("target_categories", [])
            ) and inf["tier"] in listing.get("preferred_tiers", [])
            
            direction = "right" if random.random() < (0.75 if is_compatible else 0.20) else "left"
            
            swiped_at = now - timedelta(days=random.randint(0, 30), hours=random.randint(8, 22))
            
            swipes.append({
                "id": f"swp_{swipe_id:05d}",
                "user_id": inf["id"],
                "listing_id": listing["listing_id"],
                "direction": direction,
                "swiped_at": swiped_at.strftime("%Y-%m-%dT%H:%M:%SZ"),
            })
            
            # Match kontrolü: sağa kaydırdıysa + işletme de onayladıysa
            if direction == "right":
                biz_approves = random.random() < (0.60 if is_compatible else 0.15)
                
                if biz_approves:
                    match_id += 1
                    matched_at = swiped_at + timedelta(hours=random.randint(1, 48))
                    
                    matches.append({
                        "match_id": f"mch_{match_id:03d}",
                        "influencer_id": inf["id"],
                        "business_id": biz["id"],
                        "listing_id": listing["listing_id"],
                        "matched_at": matched_at.strftime("%Y-%m-%dT%H:%M:%SZ"),
                        "status": "completed",
                    })
                    
                    # Agreement: uyumlu match'lerin %70'i, uyumsuzların %25'i anlaşır
                    if random.random() < (0.70 if is_compatible else 0.25):
                        agreement_id += 1
                        budget = listing["budget"]
                        final_b = random.randint(budget["min"], budget["max"])
                        turns = random.randint(3, 10)
                        
                        agreed_at = matched_at + timedelta(hours=random.randint(1, 24))
                        
                        agreements.append({
                            "agreement_id": f"agr_{agreement_id:03d}",
                            "match_id": f"mch_{match_id:03d}",
                            "status": random.choices(["completed", "in_progress", "cancelled"], weights=[0.7, 0.2, 0.1])[0],
                            "final_budget": final_b,
                            "final_deliverables": listing.get("deliverables", ["1 reel"]),
                            "agent_negotiation_turns": turns,
                            "agreed_at": agreed_at.strftime("%Y-%m-%dT%H:%M:%SZ"),
                        })
    
    return swipes, matches, agreements
```

---

## ADIM 8: TRAINING PAIRS (1000 adet)

```python
def generate_training_pairs(influencers, businesses, listings, num_pairs=1000):
    pairs = []
    pair_id = 0
    
    for _ in range(num_pairs):
        inf = random.choice(influencers)
        listing = random.choice([l for l in listings if l["status"] == "active"])
        biz = next(b for b in businesses if b["id"] == listing["business_id"])
        
        pair_id += 1
        
        # Feature hesaplama
        # Sector-content match
        sector_match = 1.0 if any(c in inf["content_categories"] for c in listing.get("target_categories", [])) else 0.0
        if sector_match == 0:
            # Kısmi eşleşme kontrolü (yakın kategoriler)
            sector_match = random.uniform(0.1, 0.4)
        
        # Location distance (basitleştirilmiş)
        dist_km = math.sqrt(
            (inf["location"]["lat"] - biz["location"]["lat"])**2 +
            (inf["location"]["lng"] - biz["location"]["lng"])**2
        ) * 111  # yaklaşık km dönüşümü
        location_score = math.exp(-dist_km / 10)
        
        # Budget-tier match
        budget_mid = (listing["budget"]["min"] + listing["budget"]["max"]) / 2
        rate_mid = (inf["rate_range"]["min"] + inf["rate_range"]["max"]) / 2
        budget_match = 1.0 if listing["budget"]["min"] <= rate_mid <= listing["budget"]["max"] else 0.3
        
        # Tier preference match
        tier_pref = 1.0 if inf["tier"] in listing.get("preferred_tiers", []) else 0.0
        
        # Style match (Jaccard)
        inf_styles = set(inf["content_styles"])
        biz_styles = set(listing.get("preferred_styles", []))
        style_match = len(inf_styles & biz_styles) / max(len(inf_styles | biz_styles), 1)
        
        # Diğer feature'lar
        engagement_norm = min(inf["engagement_rate"] / 0.08, 1.0)
        
        features = {
            "follower_count_log": round(math.log10(inf["follower_count"]), 3),
            "engagement_rate": inf["engagement_rate"],
            "influencer_tier_numeric": {"nano": 1, "micro": 2, "mid": 3, "macro": 4, "mega": 5}[inf["tier"]],
            "profile_completion": inf["profile_completion"],
            "verified": 1 if inf["verified"] else 0,
            "past_collaboration_count": inf["past_collaboration_count"],
            "business_age_months": biz["business_age_months"],
            "business_size_numeric": {"küçük": 1, "orta": 2, "zincir": 3}[biz["size"]],
            "listing_budget_min": listing["budget"]["min"],
            "listing_budget_max": listing["budget"]["max"],
            "listing_budget_mid": int(budget_mid),
            "business_verified": 1 if biz["verified"] else 0,
            "deliverable_count": len(listing.get("deliverables", [])),
            "sector_content_match": round(sector_match, 3),
            "location_distance_km": round(dist_km, 1),
            "location_score": round(location_score, 3),
            "budget_tier_match": budget_match,
            "style_match": round(style_match, 2),
            "tier_preference_match": tier_pref,
            "engagement_rate_normalized": round(engagement_norm, 3),
        }
        
        # Synthetic label
        score = (
            0.25 * features["sector_content_match"] +
            0.15 * features["location_score"] +
            0.10 * budget_match +
            0.10 * random.uniform(0.3, 0.8) +  # natural_affinity proxy
            0.08 * engagement_norm +
            0.08 * random.uniform(0.3, 0.9) +  # audience overlap proxy
            0.05 * tier_pref +
            0.05 * style_match +
            0.04 * min(inf["past_collaboration_count"] / 30, 1.0) +
            0.03 * inf["profile_completion"] +
            0.07 * random.uniform(0.2, 0.8)     # diğer audience featurelar
        )
        score += random.gauss(0, 0.05)
        score = max(0.0, min(1.0, score))
        
        if score > 0.70:
            label = 2
        elif score > 0.40:
            label = 1
        else:
            label = 0
        
        # Split
        split = random.choices(["train", "validation", "test"], weights=[0.70, 0.15, 0.15])[0]
        
        pairs.append({
            "pair_id": f"pair_{pair_id:05d}",
            "influencer_id": inf["id"],
            "listing_id": listing["listing_id"],
            "features": features,
            "label": label,
            "split": split,
        })
    
    return pairs
```

---

## ADIM 9: ANA SCRIPT

```python
import json
import os

def main():
    random.seed(42)
    os.makedirs("output", exist_ok=True)
    
    # 1. Taksonomi
    taxonomy = {
        "sectors": SECTORS,
        "content_categories": CONTENT_CATEGORIES,
        "content_styles": CONTENT_STYLES,
        "hashtag_groups": HASHTAG_GROUPS,
        "locations": LOCATIONS,
    }
    save("taxonomy.json", taxonomy)
    
    # 2. Influencer'lar
    influencers = [generate_influencer(t, i) for i, t in enumerate(INFLUENCER_TEMPLATES)]
    fix_distributions(influencers)  # gender, location toplamlarını 1.0'a tamamla
    save("influencer_profiles.json", influencers)
    
    # 3. İşletmeler
    businesses = [generate_business(t, i) for i, t in enumerate(BUSINESS_TEMPLATES)]
    save("business_profiles.json", businesses)
    
    # 4. Instagram postları
    all_posts = []
    for inf in influencers:
        all_posts.extend(generate_posts_for_influencer(inf))
    # Post ID'leri global yap
    for i, p in enumerate(all_posts):
        p["post_id"] = f"post_{i+1:05d}"
    save("instagram_posts.json", all_posts)
    
    # 5. İşbirliği ilanları
    listings = []
    for i in range(20):
        biz = businesses[i % len(businesses)]
        listings.append(generate_collab_listing(biz, i))
    save("collab_listings.json", listings)
    
    # 6. Agent tercihleri
    agent_prefs = []
    for inf in influencers:
        agent_prefs.append(generate_agent_prefs_influencer(inf))
    for biz in businesses:
        agent_prefs.append(generate_agent_prefs_business(biz))
    save("agent_preferences.json", agent_prefs)
    
    # 7. Davranışsal veriler
    swipes, matches, agreements = generate_behavioral_data(influencers, businesses, listings)
    save("swipes.json", swipes)
    save("matches.json", matches)
    save("agreements.json", agreements)
    
    # 8. Training pairs
    pairs = generate_training_pairs(influencers, businesses, listings, num_pairs=1000)
    save("training_pairs.json", pairs)
    
    # Özet
    print(f"Influencers:  {len(influencers)}")
    print(f"Businesses:   {len(businesses)}")
    print(f"Posts:         {len(all_posts)}")
    print(f"Listings:     {len(listings)}")
    print(f"Agent Prefs:  {len(agent_prefs)}")
    print(f"Swipes:       {len(swipes)}")
    print(f"Matches:      {len(matches)}")
    print(f"Agreements:   {len(agreements)}")
    print(f"Training:     {len(pairs)}")
    
    # Label dağılımı
    from collections import Counter
    labels = Counter(p["label"] for p in pairs)
    print(f"Label dağılımı: {dict(labels)}")

def save(filename, data):
    path = os.path.join("output", filename)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"✓ {filename} ({len(data) if isinstance(data, list) else 'dict'})")

def fix_distributions(influencers):
    for inf in influencers:
        demo = inf["audience_demographics"]
        # Gender: male = 1 - female - other
        demo["gender_distribution"]["male"] = round(
            1.0 - demo["gender_distribution"]["female"] - demo["gender_distribution"]["other"], 2
        )
        # Location: diğer = 1 - sum
        loc_sum = sum(v for k, v in demo["location_distribution"].items() if k != "diğer")
        demo["location_distribution"]["diğer"] = round(max(0, 1.0 - loc_sum), 2)

if __name__ == "__main__":
    main()
```

---

## ÇALIŞTIRMA

```bash
python generate_all_data.py
```

Çıktı:
```
✓ taxonomy.json (dict)
✓ influencer_profiles.json (20)
✓ business_profiles.json (10)
✓ instagram_posts.json (~400)
✓ collab_listings.json (20)
✓ agent_preferences.json (30)
✓ swipes.json (~150)
✓ matches.json (~40)
✓ agreements.json (~20)
✓ training_pairs.json (1000)
```

**Toplam çalışma süresi: <1 saniye.** Tüm veri tek seferde, deterministik olarak üretilir.

---

## DOĞRULAMA KONTROL LİSTESİ

Script çalıştıktan sonra kontrol et:

- [ ] Her influencer'ın en az 15 postu var mı?
- [ ] Her post'un like sayısı = follower × engagement × noise mantıklı mı?
- [ ] Her listing'in business_id'si gerçek bir işletmeye mi işaret ediyor?
- [ ] Swipe'ların user_id'si gerçek influencer mı?
- [ ] Match'lerdeki listing_id gerçek ilan mı?
- [ ] Agreement'ların match_id'si gerçek match mi?
- [ ] Training pair label dağılımı: ~%25-30 iyi, ~%40-45 orta, ~%30-35 kötü?
- [ ] JSON dosyaları valid mi? (`python -m json.tool output/file.json`)
