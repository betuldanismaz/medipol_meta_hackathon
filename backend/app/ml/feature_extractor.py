"""Pair feature extraction — `untitled24.py` Colab notebook ile birebir uyumlu.

Modelin beklediği 35 feature'ı bir `(influencer User, listing, business User)`
üçlüsünden hesaplar. Helper fonksiyonlar (jaccard, haversine_km, …) notebook'tan
**birebir kopyadır** — değer farkları modelin garbage skor vermesine yol açar.

Bridge fonksiyonlar:
    influencer_to_features_dict(user)    — User.profile JSONB → notebook dict
    business_to_features_dict(user)      — User.profile JSONB → notebook dict
    listing_to_features_dict(listing)    — Listing + extras → notebook dict
    summarize_posts(posts)               — InstagramPost listesi → aggregate

Ana giriş noktası:
    extract_features(influencer, listing, business, posts) → dict[str, float]
"""
from __future__ import annotations

import math
from collections.abc import Iterable
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any

# ---------------------------------------------------------------------------
# Notebook helper'ları — BİREBİR KOPYA (Hücre 6 & 9)
# ---------------------------------------------------------------------------
def safe_get(d: dict | None, path: str, default: Any = None) -> Any:
    """Nested dict güvenli okuma. path örn: 'location.city'."""
    cur: Any = d
    for part in path.split("."):
        if isinstance(cur, dict) and part in cur:
            cur = cur[part]
        else:
            return default
    return cur


def to_list(x: Any) -> list:
    if x is None:
        return []
    if isinstance(x, list):
        return x
    return [x]


def normalize_text(x: Any) -> str:
    if x is None:
        return ""
    return str(x).strip().lower()


def jaccard(a: Iterable, b: Iterable) -> float:
    sa = {normalize_text(x) for x in to_list(a) if normalize_text(x)}
    sb = {normalize_text(x) for x in to_list(b) if normalize_text(x)}
    if not sa and not sb:
        return 0.0
    return len(sa & sb) / max(1, len(sa | sb))


def haversine_km(lat1: float | None, lon1: float | None,
                 lat2: float | None, lon2: float | None) -> float:
    if None in (lat1, lon1, lat2, lon2):
        return 999.0
    try:
        lat1, lon1, lat2, lon2 = map(float, (lat1, lon1, lat2, lon2))
    except (TypeError, ValueError):
        return 999.0
    R = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    d_phi = math.radians(lat2 - lat1)
    d_lambda = math.radians(lon2 - lon1)
    a = (math.sin(d_phi / 2) ** 2
         + math.cos(phi1) * math.cos(phi2) * math.sin(d_lambda / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


def location_score_from_distance(distance_km: float | None) -> float:
    if distance_km is None:
        return 0.0
    return float(math.exp(-distance_km / 10.0))


_TIER_MAP = {"nano": 1, "micro": 2, "mid": 3, "macro": 4, "mega": 5}

def tier_to_numeric(tier: Any) -> int:
    return _TIER_MAP.get(normalize_text(tier), 0)


_SIZE_MAP = {
    "küçük": 1, "kucuk": 1, "small": 1,
    "orta": 2, "medium": 2,
    "zincir": 3, "chain": 3, "large": 3,
}

def business_size_to_numeric(size: Any) -> int:
    return _SIZE_MAP.get(normalize_text(size), 1)


def parse_date_days_ago(date_str: Any) -> int:
    if not date_str:
        return 999
    try:
        if isinstance(date_str, datetime):
            dt = date_str
        else:
            s = str(date_str)
            if s.endswith("Z"):
                s = s[:-1] + "+00:00"
            dt = datetime.fromisoformat(s)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        now = datetime.now(timezone.utc)
        return max(0, int((now - dt).days))
    except Exception:  # noqa: BLE001
        return 999


def budget_tier_match(listing_budget_min: float | None,
                      listing_budget_max: float | None,
                      rate_min: float | None,
                      rate_max: float | None) -> float:
    if None in (listing_budget_min, listing_budget_max, rate_min, rate_max):
        return 0.0
    try:
        lmin = float(listing_budget_min)
        lmax = float(listing_budget_max)
        rmin = float(rate_min)
        rmax = float(rate_max)
    except (TypeError, ValueError):
        return 0.0

    overlap = max(0.0, min(lmax, rmax) - max(lmin, rmin))
    if overlap > 0:
        return 1.0

    listing_mid = (lmin + lmax) / 2
    rate_mid = (rmin + rmax) / 2
    distance = abs(listing_mid - rate_mid)
    if distance <= 0.25 * max(rate_mid, 1.0):
        return 0.5
    return 0.0


# ---------------------------------------------------------------------------
# Taxonomy mapping'leri — feature hesaplama için
# Notebook'ta seed taxonomy.json'dan türeyen mapping'ler manuel. Burada gömüyoruz;
# büyürse backend/data/sector_to_categories.json'a çıkar.
# ---------------------------------------------------------------------------
SECTOR_TO_CATEGORIES: dict[str, list[str]] = {
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

SECTOR_HASHTAGS: dict[str, list[str]] = {
    "sec_001": ["kahve", "coffee", "cafe", "barista", "filtrekahve", "espresso"],
    "sec_002": ["kahve", "coffee", "espresso", "thirdwave", "spesiyaltikahve", "barista"],
    "sec_003": ["brunch", "breakfast", "kahvalti", "food", "foodie"],
    "sec_004": ["food", "foodie", "yemek", "restaurant", "dinner"],
    "sec_005": ["fastfood", "burger", "food"],
    "sec_006": ["pastry", "bakery", "kek", "tatli"],
    "sec_007": ["fashion", "moda", "butik", "ootd"],
    "sec_008": ["fashion", "moda", "ootd", "style", "outfit"],
    "sec_009": ["shoes", "ayakkabi", "sneakers", "style"],
    "sec_010": ["aksesuar", "jewelry", "style"],
    "sec_011": ["sac", "hair", "barber", "kuafor"],
    "sec_012": ["beauty", "guzellik", "spa"],
    "sec_013": ["nails", "manikur", "tirnak"],
    "sec_014": ["makeup", "skincare", "kozmetik", "mua"],
    "sec_015": ["fitness", "gym", "workout", "training"],
    "sec_016": ["yoga", "pilates", "wellness"],
    "sec_017": ["books", "kitap", "reading"],
    "sec_018": ["art", "sanat", "gallery"],
    "sec_019": ["tech", "teknoloji", "gadget"],
    "sec_020": ["homedecor", "evdekor", "interior"],
    "sec_021": ["flowers", "cicek", "flora"],
    "sec_022": ["health", "eczane", "saglik"],
    "sec_023": ["optik", "glasses", "eyewear"],
    "sec_024": ["toys", "oyuncak", "kids"],
    "sec_025": ["pets", "hayvan", "evcil"],
    "sec_026": ["kirtasiye", "stationery", "school"],
    "sec_027": ["hediye", "gift"],
    "sec_028": ["bar", "cocktail", "drinks"],
    "sec_029": ["hotel", "travel", "konaklama"],
    "sec_030": ["jewelry", "mucevher"],
}


# ---------------------------------------------------------------------------
# Post aggregate — notebook Hücre 7 `summarize_posts_for_influencer` muadili
# ---------------------------------------------------------------------------
@dataclass
class PostSummary:
    avg_likes: float = 0.0
    avg_comments: float = 0.0
    avg_saves: float = 0.0
    post_count: int = 0
    reel_ratio: float = 0.0
    post_frequency_weekly: float = 0.0
    last_post_recency_days: int = 999
    hashtags: list[str] = None
    mentioned_brands: list[str] = None
    captions: list[str] = None

    def __post_init__(self) -> None:
        if self.hashtags is None:
            self.hashtags = []
        if self.mentioned_brands is None:
            self.mentioned_brands = []
        if self.captions is None:
            self.captions = []


def summarize_posts(posts: list[Any]) -> PostSummary:
    """`posts` her bir InstagramPost ORM row'u veya dict olabilir.

    Notebook'taki summarize_posts_for_influencer ile aynı çıktıyı verir.
    """
    if not posts:
        return PostSummary()

    likes: list[float] = []
    comments: list[float] = []
    saves: list[float] = []
    hashtags: list[str] = []
    mentioned: list[str] = []
    captions: list[str] = []
    reel_count = 0
    dates: list[datetime] = []

    for p in posts:
        # ORM row mu, dict mi?
        if isinstance(p, dict):
            get = p.get
        else:
            get = lambda k, d=None: getattr(p, k, d)

        metrics = get("metrics") or {}
        if not isinstance(metrics, dict):
            metrics = {}
        likes.append(float(metrics.get("likes") or 0))
        comments.append(float(metrics.get("comments") or 0))
        saves.append(float(metrics.get("saves") or 0))

        hashtags.extend(to_list(get("hashtags")))
        mentioned.extend(to_list(get("mentioned_brands")))
        cap = get("caption")
        if cap:
            captions.append(str(cap))

        type_val = normalize_text(get("type"))
        media_type = normalize_text(get("media_type"))
        if type_val == "reel" or media_type == "reel":
            reel_count += 1

        posted_at = get("posted_at")
        if posted_at:
            try:
                if isinstance(posted_at, datetime):
                    dt = posted_at if posted_at.tzinfo else posted_at.replace(tzinfo=timezone.utc)
                else:
                    s = str(posted_at)
                    if s.endswith("Z"):
                        s = s[:-1] + "+00:00"
                    dt = datetime.fromisoformat(s)
                    if dt.tzinfo is None:
                        dt = dt.replace(tzinfo=timezone.utc)
                dates.append(dt)
            except Exception:  # noqa: BLE001
                pass

    n = len(posts)
    if dates:
        latest = max(dates)
        now = datetime.now(timezone.utc)
        last_recency = max(0, int((now - latest).days))
        oldest = min(dates)
        span_days = max(1, int((latest - oldest).days))
        freq_weekly = n / max(1.0, span_days / 7.0)
    else:
        last_recency = 999
        freq_weekly = 0.0

    return PostSummary(
        avg_likes=sum(likes) / n if n else 0.0,
        avg_comments=sum(comments) / n if n else 0.0,
        avg_saves=sum(saves) / n if n else 0.0,
        post_count=n,
        reel_ratio=reel_count / n if n else 0.0,
        post_frequency_weekly=freq_weekly,
        last_post_recency_days=last_recency,
        hashtags=hashtags,
        mentioned_brands=mentioned,
        captions=captions,
    )


# ---------------------------------------------------------------------------
# Pair-level feature helpers (notebook'tan türetilmiş)
# ---------------------------------------------------------------------------
def compute_sector_content_match(inf_categories: list[str], business_sector_id: str | None) -> float:
    sector_cats = SECTOR_TO_CATEGORIES.get(normalize_text(business_sector_id) or "", [])
    return jaccard(inf_categories or [], sector_cats)


def compute_audience_location_match(audience_demo: dict | None, business_city: str | None) -> float:
    if not audience_demo or not business_city:
        return 0.0
    loc_dist = audience_demo.get("location_distribution") or {}
    if not isinstance(loc_dist, dict):
        return 0.0
    # Exact match önce, sonra case-insensitive
    if business_city in loc_dist:
        return float(loc_dist[business_city] or 0)
    target = normalize_text(business_city)
    for k, v in loc_dist.items():
        if normalize_text(k) == target:
            return float(v or 0)
    return 0.0


def compute_audience_age_overlap(audience_demo: dict | None, target_age_buckets: list[str] | None) -> float:
    if not audience_demo or not target_age_buckets:
        return 0.0
    age_dist = audience_demo.get("age_distribution") or {}
    return jaccard(target_age_buckets, list(age_dist.keys()))


def compute_audience_interest_overlap(audience_demo: dict | None, target_interests: list[str] | None) -> float:
    if not audience_demo or not target_interests:
        return 0.0
    inf_interests = audience_demo.get("interest_tags") or []
    return jaccard(inf_interests, target_interests)


def compute_audience_income_match(audience_demo: dict | None, target_income: list[str] | None) -> float:
    if not audience_demo or not target_income:
        return 0.0
    inf_income = audience_demo.get("income_distribution") or {}
    return jaccard(target_income, list(inf_income.keys()))


def compute_style_match(inf_styles: list[str] | None, biz_styles: list[str] | None) -> float:
    return jaccard(inf_styles or [], biz_styles or [])


def compute_hashtag_overlap(post_hashtags: list[str], business_sector_id: str | None) -> float:
    sector_tags = SECTOR_HASHTAGS.get(normalize_text(business_sector_id) or "", [])
    if not sector_tags:
        return 0.0
    # # işareti varsa kaldır, normalize et
    inf_tags = [normalize_text(h.lstrip("#")) for h in (post_hashtags or [])]
    return jaccard(inf_tags, sector_tags)


def compute_natural_affinity(mentioned_brands: list[str], captions: list[str],
                              business_name: str | None,
                              business_sector_id: str | None) -> float:
    """Geçmiş postlarda işletme adı veya sektör kelimeleri geçme oranı."""
    biz_name = normalize_text(business_name)
    sector_keywords = SECTOR_HASHTAGS.get(normalize_text(business_sector_id) or "", [])
    sector_keywords = [normalize_text(k.lstrip("#")) for k in sector_keywords]

    mentions = [normalize_text(m) for m in (mentioned_brands or [])]
    captions_text = " ".join(captions or []).lower()

    brand_hit = 0.0
    if biz_name and any(biz_name in m or biz_name in captions_text for m in mentions):
        brand_hit = 1.0
    elif biz_name and biz_name in captions_text:
        brand_hit = 0.7

    sector_hits = sum(1 for kw in sector_keywords if kw and kw in captions_text)
    sector_ratio = min(sector_hits / 3.0, 1.0)

    return max(brand_hit, 0.6 * sector_ratio)


def compute_recency_score(last_post_recency_days: int) -> float:
    return float(math.exp(-last_post_recency_days / 14.0))


# ---------------------------------------------------------------------------
# Ana giriş noktası
# ---------------------------------------------------------------------------
def extract_features(
    *,
    influencer_profile: dict,
    business_profile: dict,
    business_name: str | None,
    listing: dict,
    posts: list[Any] | None = None,
) -> dict[str, float]:
    """Modelin 35 feature'ını üret.

    Parametreler tamamen dict — DB ORM modelleri `_user_to_features_dict` /
    `_listing_to_features_dict` ile dict'e çevrilir önce.

    Args:
        influencer_profile: User.profile JSONB (tier, follower_count, …).
        business_profile: Business User.profile JSONB (sector_id, target_audience, …).
        business_name: Business User.display_name.
        listing: {budget_min, budget_max, deliverables, preferred_tiers,
                  target_categories, preferred_audience, preferred_styles, …}
        posts: InstagramPost ORM row'ları veya dict'leri.
    """
    inf = influencer_profile or {}
    biz = business_profile or {}
    lst = listing or {}

    summary = summarize_posts(posts or [])

    # Lokasyon
    inf_loc = inf.get("location") or {}
    biz_loc = biz.get("location") or {}
    distance_km = haversine_km(
        inf_loc.get("lat"), inf_loc.get("lng"),
        biz_loc.get("lat"), biz_loc.get("lng"),
    )

    # Audience
    audience = inf.get("audience_demographics") or {}
    target_audience = biz.get("target_audience") or {}
    preferred_audience = lst.get("preferred_audience") or {}

    # Rate / budget
    rate_range = inf.get("rate_range") or {}
    rate_min = rate_range.get("min")
    rate_max = rate_range.get("max")
    listing_budget_min = lst.get("budget_min")
    listing_budget_max = lst.get("budget_max")
    if listing_budget_min is None or listing_budget_max is None:
        # Listing'in raw budget dict'i varsa onu da dene
        raw_budget = lst.get("budget") or {}
        if isinstance(raw_budget, dict):
            listing_budget_min = listing_budget_min if listing_budget_min is not None else raw_budget.get("min")
            listing_budget_max = listing_budget_max if listing_budget_max is not None else raw_budget.get("max")

    # Tier preference
    preferred_tiers = [normalize_text(t) for t in to_list(lst.get("preferred_tiers"))]
    inf_tier_str = normalize_text(inf.get("tier"))
    tier_pref_match = 1.0 if inf_tier_str and inf_tier_str in preferred_tiers else 0.0

    # Past category experience
    past_cats = set(inf.get("past_collaboration_categories") or [])
    target_cats = set(lst.get("target_categories") or [])
    past_category_experience = 1.0 if (past_cats & target_cats) else 0.0

    # Counts / floats
    follower_count = float(inf.get("follower_count") or 0)
    following_count = float(inf.get("following_count") or 0)
    engagement_rate = float(inf.get("engagement_rate") or 0)

    avg_likes = summary.avg_likes or 0.0
    avg_comments = summary.avg_comments or 0.0

    # Listing budget mid
    lmin_f = float(listing_budget_min or 0)
    lmax_f = float(listing_budget_max or 0)
    listing_budget_mid = (lmin_f + lmax_f) / 2.0

    features: dict[str, float] = {
        # A. Influencer-only
        "follower_count_log": math.log10(max(follower_count, 1.0)),
        "following_ratio": following_count / max(follower_count, 1.0),
        "engagement_rate": engagement_rate,
        "comment_like_ratio": avg_comments / max(avg_likes, 1.0),
        "account_age_days": float(parse_date_days_ago(inf.get("account_created_at"))),
        "post_frequency_weekly": float(summary.post_frequency_weekly),
        "last_post_recency_days": float(summary.last_post_recency_days),
        "influencer_tier_numeric": float(tier_to_numeric(inf.get("tier"))),
        "profile_completion": float(inf.get("profile_completion") or 0),
        "verified": 1.0 if inf.get("verified") else 0.0,
        "past_collaboration_count": float(inf.get("past_collaboration_count") or 0),
        "reel_post_ratio": float(summary.reel_ratio),

        # B. Listing/Business-only
        "business_age_months": float(biz.get("business_age_months") or 0),
        "business_size_numeric": float(business_size_to_numeric(biz.get("size"))),
        "listing_budget_min": lmin_f,
        "listing_budget_max": lmax_f,
        "listing_budget_mid": listing_budget_mid,
        "business_verified": 1.0 if biz.get("verified") else 0.0,
        "business_past_collab_count": float(biz.get("past_collaboration_count") or 0),
        "deliverable_count": float(len(lst.get("deliverables") or [])),

        # C. Pair (en kritik)
        "sector_content_match": compute_sector_content_match(
            inf.get("content_categories"), biz.get("sector_id"),
        ),
        "location_distance_km": float(distance_km),
        "location_score": location_score_from_distance(distance_km),
        "audience_location_match": compute_audience_location_match(
            audience, biz_loc.get("city"),
        ),
        "audience_age_overlap": compute_audience_age_overlap(
            audience, target_audience.get("age_buckets") or preferred_audience.get("age_buckets"),
        ),
        "audience_income_match": compute_audience_income_match(
            audience, target_audience.get("income_groups"),
        ),
        "audience_interest_overlap": compute_audience_interest_overlap(
            audience, target_audience.get("interest_tags"),
        ),
        "budget_tier_match": budget_tier_match(
            listing_budget_min, listing_budget_max, rate_min, rate_max,
        ),
        "natural_affinity_score": compute_natural_affinity(
            summary.mentioned_brands, summary.captions,
            business_name, biz.get("sector_id"),
        ),
        "style_match": compute_style_match(
            inf.get("content_styles"), biz.get("brand_style"),
        ),
        "language_match": 1.0 if normalize_text(inf.get("primary_language")) == "tr" else 0.0,
        "past_category_experience": past_category_experience,
        "hashtag_overlap": compute_hashtag_overlap(summary.hashtags, biz.get("sector_id")),
        "tier_preference_match": tier_pref_match,
        "recency_score": compute_recency_score(summary.last_post_recency_days),
    }
    return features


# ---------------------------------------------------------------------------
# ORM bridge — User/Listing entity'sini notebook dict şekline çevir
# ---------------------------------------------------------------------------
def _user_to_profile_dict(user: Any) -> dict[str, Any]:
    """`User.profile` JSONB zaten notebook dict şeklinde. Ama bazı alanlar
    User kolonlarında (city, district, lat, lng) — birleştirelim."""
    profile = dict(user.profile or {})
    # location alanını User kolonlarından zorla doldur (JSONB eski olabilir)
    loc = profile.get("location") or {}
    if user.latitude is not None:
        loc["lat"] = user.latitude
    if user.longitude is not None:
        loc["lng"] = user.longitude
    if user.city:
        loc["city"] = user.city
    if user.district:
        loc["district"] = user.district
    profile["location"] = loc
    if "verified" not in profile and isinstance(profile.get("verification_status"), str):
        profile["verified"] = profile["verification_status"] == "verified"
    return profile


def _listing_to_dict(listing: Any) -> dict[str, Any]:
    extras = dict(listing.extras or {})
    extras.update({
        "budget_min": listing.budget_min,
        "budget_max": listing.budget_max,
        "deliverables": extras.get("deliverables"),
        "preferred_tiers": extras.get("preferred_tiers"),
        "target_categories": extras.get("target_categories"),
        "preferred_audience": extras.get("preferred_audience"),
        "preferred_styles": extras.get("preferred_styles"),
    })
    return extras


def extract_features_for_orm(
    *,
    influencer_user: Any,
    listing: Any,
    business_user: Any,
    posts: list[Any] | None = None,
) -> dict[str, float]:
    """ORM entity'leri ile çağrılabilen tatlı wrapper.

    Kullanıcı: `ranking.rank_pairs` bu fonksiyonu çağırır.
    """
    return extract_features(
        influencer_profile=_user_to_profile_dict(influencer_user),
        business_profile=_user_to_profile_dict(business_user),
        business_name=business_user.display_name if business_user else None,
        listing=_listing_to_dict(listing),
        posts=posts,
    )
