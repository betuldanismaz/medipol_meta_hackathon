"""
test_matching.py — InfluMatch V1 Unit Testleri
Çalıştır: python -m pytest test_matching.py -v
"""

import pytest
from app.matching import calculate_v1_score, filter_discoverable_profiles, calculate_score


# ===========================================================================
# YARDIMCI FIXTURE'LAR
# ===========================================================================

def make_influencer(**kwargs):
    base = {
        "id": "inf_test",
        "type": "influencer",
        "niche": "moda",
        "followers": 28_000,          # micro tier
        "city": "İstanbul",
        "engagement_rate": 0.042,
        "last_active_at": "2026-05-16",
    }
    base.update(kwargs)
    return base


def make_business(**kwargs):
    base = {
        "id": "biz_test",
        "type": "business",
        "niche": "moda",
        "city": "İstanbul",
        "target_followers": "10k-50k",  # micro
    }
    base.update(kwargs)
    return base


def make_collab_listing(**kwargs):
    base = {
        "id": "col_test",
        "type": "collab_listing",
        "niche": "moda",
        "city": "İstanbul",
        "target_followers": "10k-50k",
    }
    base.update(kwargs)
    return base


def make_worker(**kwargs):
    base = {
        "id": "wrk_test",
        "type": "worker",
        "city": "İstanbul",
        "preferred_positions": ["pos_001"],
        "experience_years": 2,
        "rate_range": {"min": 120, "max": 180, "currency": "TRY"},
        "last_active_at": "2026-05-16",
    }
    base.update(kwargs)
    return base


def make_job_listing(**kwargs):
    base = {
        "id": "job_test",
        "type": "job_listing",
        "city": "İstanbul",
        "position_id": "pos_001",
        "required_experience_years": 1,
        "wage": {"amount": 150, "currency": "TRY", "per": "hour"},
    }
    base.update(kwargs)
    return base


# ===========================================================================
# TEST 1 — Mükemmel Influencer Eşleşmesi Yüksek Skor Vermiyor mu?
# ===========================================================================
def test_perfect_influencer_match_high_score():
    inf = make_influencer(followers=28_000, engagement_rate=0.06)
    biz = make_business(niche="moda", target_followers="10k-50k")
    result = calculate_v1_score(inf, biz)
    assert result["score"] >= 70, f"Mükemmel eşleşme düşük skor verdi: {result['score']}"
    assert "breakdown" in result
    assert "reasons" in result


# ===========================================================================
# TEST 2 — Niş Tam Uyumu 35 Puan Veriyor mu?
# ===========================================================================
def test_niche_exact_match_gives_35():
    inf = make_influencer(niche="yemek")
    biz = make_business(niche="yemek")
    result = calculate_v1_score(inf, biz)
    assert result["breakdown"]["semantic_match"] == 35


# ===========================================================================
# TEST 3 — Komşu Niş 20 Puan Veriyor mu?
# ===========================================================================
def test_adjacent_niche_gives_20():
    inf = make_influencer(niche="moda")
    biz = make_business(niche="güzellik")
    result = calculate_v1_score(inf, biz)
    assert result["breakdown"]["semantic_match"] == 20


# ===========================================================================
# TEST 4 — Uzak Niş Sadece 10 Puan Veriyor mu?
# ===========================================================================
def test_unrelated_niche_gives_10():
    inf = make_influencer(niche="teknoloji")
    biz = make_business(niche="yemek")
    result = calculate_v1_score(inf, biz)
    assert result["breakdown"]["semantic_match"] == 10


# ===========================================================================
# TEST 5 — Aynı Şehir 20 Puan, Farklı Şehir 5 Puan
# ===========================================================================
def test_location_same_city():
    inf = make_influencer(city="İstanbul")
    biz = make_business(city="İstanbul")
    result = calculate_v1_score(inf, biz)
    assert result["breakdown"]["location_match"] == 20


def test_location_different_city():
    inf = make_influencer(city="Ankara")
    biz = make_business(city="İstanbul")
    result = calculate_v1_score(inf, biz)
    assert result["breakdown"]["location_match"] == 5


# ===========================================================================
# TEST 6 — Tier Uyumu: Micro → micro ilanı 20 puan
# DÜZELTİLDİ: micro sınırı 10k–100k olmalı
# ===========================================================================
def test_tier_exact_match_micro():
    # 28k takipçi → micro tier (10k–100k)
    inf = make_influencer(followers=28_000)
    biz = make_business(target_followers="10k-50k")   # micro
    result = calculate_v1_score(inf, biz)
    assert result["breakdown"]["tier_fit"] == 20, (
        f"Tier uyumu beklenmedik: {result['breakdown']}"
    )


def test_tier_one_step_off_gives_10():
    # 5k takipçi → nano, listing micro istiyor → 1 kademe sapma → 10 puan
    inf = make_influencer(followers=5_000)
    biz = make_business(target_followers="10k-50k")
    result = calculate_v1_score(inf, biz)
    assert result["breakdown"]["tier_fit"] == 10


def test_tier_two_steps_off_gives_0():
    # 1_200 takipçi → nano, listing mid istiyor → 2 kademe sapma → 0 puan
    inf = make_influencer(followers=1_200)
    biz = make_business(target_followers="50k-500k")
    result = calculate_v1_score(inf, biz)
    assert result["breakdown"]["tier_fit"] == 0


# ===========================================================================
# TEST 7 — Engagement Rate Puanlaması
# ===========================================================================
def test_engagement_high():
    inf = make_influencer(engagement_rate=0.06)
    biz = make_business()
    result = calculate_v1_score(inf, biz)
    assert result["breakdown"]["engagement"] == 15


def test_engagement_medium():
    inf = make_influencer(engagement_rate=0.04)
    biz = make_business()
    result = calculate_v1_score(inf, biz)
    assert result["breakdown"]["engagement"] == 10


def test_engagement_low():
    inf = make_influencer(engagement_rate=0.005)
    biz = make_business()
    result = calculate_v1_score(inf, biz)
    assert result["breakdown"]["engagement"] == 0


# ===========================================================================
# TEST 8 — Aktiflik Puanı: Son 7 gün → 10, eski → 0
# ===========================================================================
def test_activity_recent():
    inf = make_influencer(last_active_at="2026-05-16")  # bugün
    biz = make_business()
    result = calculate_v1_score(inf, biz)
    assert result["breakdown"]["activity"] == 10


def test_activity_old():
    inf = make_influencer(last_active_at="2025-01-01")  # çok eski
    biz = make_business()
    result = calculate_v1_score(inf, biz)
    assert result["breakdown"]["activity"] == 0


# ===========================================================================
# TEST 9 — Skor Clamp: 10–92 arasında kalmalı
# ===========================================================================
def test_score_never_below_10():
    inf = make_influencer(niche="xyz", followers=0, engagement_rate=0, city="Nowhere")
    biz = make_business(niche="abc", city="Somewhere", target_followers="1m+")
    result = calculate_v1_score(inf, biz)
    assert result["score"] >= 10


def test_score_never_above_92():
    inf = make_influencer(followers=28_000, engagement_rate=0.99, last_active_at="2026-05-16")
    biz = make_business()
    result = calculate_v1_score(inf, biz)
    assert result["score"] <= 92


# ===========================================================================
# TEST 10 — İşletme entity olarak gelirse roller yer değiştirmeli
# ===========================================================================
def test_business_as_entity_swaps_roles():
    biz = make_business(niche="moda", city="İstanbul", target_followers="10k-50k")
    inf = make_influencer(niche="moda", followers=28_000, city="İstanbul", engagement_rate=0.05)
    result_normal  = calculate_v1_score(inf, biz)
    result_swapped = calculate_v1_score(biz, inf)
    assert result_normal["score"] == result_swapped["score"], (
        "Rol yer değiştirme simetrik sonuç vermedi."
    )


# ===========================================================================
# TEST 11 — Çalışan Eşleşmesi: Pozisyon + Deneyim + Maaş
# ===========================================================================
def test_worker_perfect_match():
    wrk = make_worker(preferred_positions=["pos_001"], experience_years=3)
    job = make_job_listing(position_id="pos_001", required_experience_years=2,
                            wage={"amount": 150, "currency": "TRY", "per": "hour"})
    result = calculate_v1_score(wrk, job)
    assert result["breakdown"]["position_match"]   == 35
    assert result["breakdown"]["experience_match"] == 20
    assert result["breakdown"]["wage_match"]       == 15
    assert result["score"] >= 70


def test_worker_wrong_position():
    wrk = make_worker(preferred_positions=["pos_002"])
    job = make_job_listing(position_id="pos_001")
    result = calculate_v1_score(wrk, job)
    assert result["breakdown"]["position_match"] == 10


def test_worker_insufficient_experience():
    wrk = make_worker(experience_years=0.5)
    job = make_job_listing(required_experience_years=2)
    result = calculate_v1_score(wrk, job)
    assert result["breakdown"]["experience_match"] < 20


def test_worker_low_wage():
    wrk = make_worker(rate_range={"min": 200, "max": 300, "currency": "TRY"})
    job = make_job_listing(wage={"amount": 100, "currency": "TRY", "per": "hour"})
    result = calculate_v1_score(wrk, job)
    assert result["breakdown"]["wage_match"] == 0


# ===========================================================================
# TEST 12 — Uyumsuz Listing Tipi Düşük Skor ve Uyarı Vermeli
# ===========================================================================
def test_influencer_gets_job_listing_returns_low():
    inf = make_influencer()
    job = make_job_listing()
    result = calculate_v1_score(inf, job)
    assert result["score"] == 10
    assert result["breakdown"].get("type_mismatch") is True


def test_worker_gets_collab_listing_returns_low():
    wrk = make_worker()
    col = make_collab_listing()
    result = calculate_v1_score(wrk, col)
    assert result["score"] == 10
    assert result["breakdown"].get("type_mismatch") is True


# ===========================================================================
# TEST 13 — filter_discoverable_profiles: 3'lü Rol Filtresi
# ===========================================================================
SAMPLE_PROFILES = [
    {"id": "i1",  "type": "influencer"},
    {"id": "i2",  "type": "influencer"},
    {"id": "b1",  "type": "business"},
    {"id": "w1",  "type": "worker"},
    {"id": "w2",  "type": "employee"},
    {"id": "cl1", "type": "collab_listing"},
    {"id": "jl1", "type": "job_listing"},
]


def test_influencer_sees_business_and_collab():
    result = filter_discoverable_profiles("influencer", SAMPLE_PROFILES)
    types = {p["type"] for p in result}
    assert "business"       in types
    assert "collab_listing" in types
    assert "influencer"     not in types
    assert "job_listing"    not in types
    assert "worker"         not in types


def test_worker_sees_business_and_job():
    result = filter_discoverable_profiles("worker", SAMPLE_PROFILES)
    types = {p["type"] for p in result}
    assert "business"        in types
    assert "job_listing"     in types
    assert "collab_listing"  not in types
    assert "influencer"      not in types


def test_employee_alias_same_as_worker():
    r_worker   = filter_discoverable_profiles("worker",   SAMPLE_PROFILES)
    r_employee = filter_discoverable_profiles("employee", SAMPLE_PROFILES)
    assert {p["id"] for p in r_worker} == {p["id"] for p in r_employee}


def test_business_sees_influencer_and_worker():
    result = filter_discoverable_profiles("business", SAMPLE_PROFILES)
    types = {p["type"] for p in result}
    assert "influencer" in types
    assert "worker"     in types
    assert "employee"   in types
    assert "business"   not in types
    assert "collab_listing" not in types


def test_unknown_role_returns_empty():
    result = filter_discoverable_profiles("alien", SAMPLE_PROFILES)
    assert result == []


# ===========================================================================
# TEST 14 — Hatalı / Eksik Veriyle Sistem Çökmemeli
# ===========================================================================
def test_missing_fields_no_exception():
    result = calculate_v1_score({}, {})
    assert "score" in result
    assert isinstance(result["score"], int)


def test_none_values_no_exception():
    inf = {"type": None, "niche": None, "followers": None, "city": None}
    biz = {"type": "business", "niche": None, "city": None}
    result = calculate_v1_score(inf, biz)
    assert "score" in result


# ===========================================================================
# TEST 15 — Geriye Dönük Uyumluluk: calculate_score alias çalışıyor mu?
# ===========================================================================
def test_calculate_score_alias():
    inf = make_influencer()
    biz = make_business()
    r1 = calculate_v1_score(inf, biz)
    r2 = calculate_score(inf, biz)
    assert r1["score"] == r2["score"]


# ===========================================================================
# TEST 16 — Mega Tier Doğru Sınıflandırılıyor mu?
# DÜZELTİLDİ: micro 10k–100k olduğu için 75k artık micro tier
# ===========================================================================
def test_micro_tier_boundary_corrected():
    # 75k → micro (10k–100k), 10k-50k hedef = micro → tam uyum
    inf = make_influencer(followers=75_000)
    biz = make_business(target_followers="10k-50k")
    result = calculate_v1_score(inf, biz)
    assert result["breakdown"]["tier_fit"] == 20, (
        f"75k takipçi micro tier'da olmalı, tam uyum bekleniyor: {result['breakdown']}"
    )


def test_mega_tier_correct():
    inf = make_influencer(followers=2_000_000)
    biz = make_business(target_followers="1m+")
    result = calculate_v1_score(inf, biz)
    assert result["breakdown"]["tier_fit"] == 20