"""High-level ranking orchestrator.

Bir veya birden çok `(influencer, listing, business)` üçlüsünü alır,
feature extraction + model prediction + reasons + breakdown üretir. Tek
giriş noktası `rank_pairs()` — discovery/feed ve match-score endpoint'leri
buradan beslenir.

Reasons üreticisi (`generate_reasons_from_features`) `untitled24.py`
Hücre 17/18'in birebir kopyası.
"""
from __future__ import annotations

import logging
import time
from dataclasses import dataclass, field
from typing import Sequence

import numpy as np
from sqlalchemy.orm import Session

from app.models import InstagramPost, Listing, User
from app.ml.feature_extractor import extract_features_for_orm
from app.ml.predictor import Predictor, get_predictor

logger = logging.getLogger("app.ml.ranking")


@dataclass
class RankResult:
    influencer_id: int
    listing_id: int
    business_id: int
    score: float                       # 0-100
    label: str                         # "iyi_match" / "orta_match" / "kotu_match"
    reasons: list[str] = field(default_factory=list)
    risks: list[str] = field(default_factory=list)
    breakdown: dict[str, int] = field(default_factory=dict)
    features: dict[str, float] = field(default_factory=dict)


# ---------------------------------------------------------------------------
# Reasons üretici — notebook Hücre 17/18 BİREBİR KOPYA
# ---------------------------------------------------------------------------
def generate_reasons_from_features(features: dict) -> tuple[list[str], list[str]]:
    reasons: list[str] = []
    risks: list[str] = []

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


# ---------------------------------------------------------------------------
# Frontend breakdown mapping
# ---------------------------------------------------------------------------
def features_to_breakdown(f: dict) -> dict[str, int]:
    """Frontend `MatchBreakdown` schema'sına 0-100 değer üret."""
    engagement_normalized = min(float(f.get("engagement_rate", 0)) / 0.08, 1.0)
    audience_score = (
        float(f.get("audience_age_overlap", 0))
        + float(f.get("audience_interest_overlap", 0))
        + float(f.get("audience_location_match", 0))
    ) / 3.0
    return {
        "nicheMatch":         round(float(f.get("sector_content_match", 0)) * 100),
        "locationMatch":      round(float(f.get("location_score", 0)) * 100),
        "engagementFit":      round(engagement_normalized * 100),
        "audienceFit":        round(audience_score * 100),
        "budgetFit":          round(float(f.get("budget_tier_match", 0)) * 100),
        "campaignExperience": round(float(f.get("past_category_experience", 0)) * 100),
    }


def score_to_label(score: float) -> str:
    if score >= 70:
        return "iyi_match"
    if score >= 40:
        return "orta_match"
    return "kotu_match"


# ---------------------------------------------------------------------------
# Posts cache per call
# ---------------------------------------------------------------------------
def _fetch_posts_for_influencers(db: Session, influencer_ids: set[int]) -> dict[int, list[InstagramPost]]:
    if not influencer_ids:
        return {}
    rows = (
        db.query(InstagramPost)
        .filter(InstagramPost.influencer_id.in_(influencer_ids))
        .all()
    )
    by_user: dict[int, list[InstagramPost]] = {uid: [] for uid in influencer_ids}
    for r in rows:
        by_user.setdefault(r.influencer_id, []).append(r)
    return by_user


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------
def rank_pairs(
    db: Session,
    pairs: Sequence[tuple[User, Listing, User]],
    *,
    predictor: Predictor | None = None,
) -> list[RankResult]:
    """`pairs`: [(influencer_user, listing, business_user), ...]

    Returns `RankResult` listesi, skor desc sıralı.
    """
    if not pairs:
        return []

    predictor = predictor or get_predictor()
    influencer_ids = {inf.id for inf, _, _ in pairs}
    posts_by_inf = _fetch_posts_for_influencers(db, influencer_ids)

    t0 = time.perf_counter()
    feature_dicts: list[dict[str, float]] = []
    for inf, listing, biz in pairs:
        try:
            feats = extract_features_for_orm(
                influencer_user=inf,
                listing=listing,
                business_user=biz,
                posts=posts_by_inf.get(inf.id, []),
            )
        except Exception:  # noqa: BLE001
            logger.exception("[rank] feature extraction failed for inf=%s listing=%s", inf.id, listing.id)
            feats = {}
        feature_dicts.append(feats)

    # Numpy matrix — predictor.feature_names sırasıyla
    feature_names = predictor.feature_names
    X = np.array(
        [
            [_safe_float(fd.get(name, 0.0)) for name in feature_names]
            for fd in feature_dicts
        ],
        dtype=float,
    )

    scores = predictor.predict_score(X)
    t1 = time.perf_counter()
    logger.info(
        "[rank] adapter=%s pairs=%d inference_ms=%.1f",
        predictor.adapter_name, len(pairs), (t1 - t0) * 1000,
    )

    results: list[RankResult] = []
    for (inf, listing, biz), feats, score in zip(pairs, feature_dicts, scores):
        sc = float(score)
        reasons, risks = generate_reasons_from_features(feats)
        results.append(
            RankResult(
                influencer_id=inf.id,
                listing_id=listing.id,
                business_id=biz.id,
                score=sc,
                label=score_to_label(sc),
                reasons=reasons,
                risks=risks,
                breakdown=features_to_breakdown(feats),
                features=feats,
            )
        )

    results.sort(key=lambda r: r.score, reverse=True)
    return results


def score_pair(
    db: Session,
    influencer: User,
    listing: Listing,
    business: User,
    *,
    predictor: Predictor | None = None,
) -> RankResult:
    """Tek pair için skor — match-score endpoint kullanır."""
    results = rank_pairs(db, [(influencer, listing, business)], predictor=predictor)
    return results[0]


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def _safe_float(v) -> float:
    if v is None:
        return 0.0
    try:
        f = float(v)
    except (TypeError, ValueError):
        return 0.0
    if f != f or f == float("inf") or f == float("-inf"):
        return 0.0
    return f
