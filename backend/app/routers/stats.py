"""Dashboard özet istatistikleri + analytics."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import (
    Agreement,
    AgreementStatus,
    Listing,
    Match,
    MatchStatus,
    Negotiation,
    NegotiationStatus,
    User,
    UserRole,
)
from app.schemas import AnalyticsMonthly, AnalyticsResponse, UserStats

router = APIRouter(tags=["stats"])


@router.get("/users/me/stats", response_model=UserStats)
def my_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UserStats:
    week_ago = datetime.now(timezone.utc) - timedelta(days=7)
    if current_user.role == UserRole.BUSINESS:
        listing_ids = [
            row.id for row in db.query(Listing.id).filter(Listing.owner_id == current_user.id).all()
        ]
        match_query = db.query(Match).filter(Match.listing_id.in_(listing_ids or [-1]))
    else:
        match_query = db.query(Match).filter(Match.candidate_id == current_user.id)

    active_matches = match_query.filter(Match.status == MatchStatus.MATCHED).count()
    weekly_swipes = match_query.filter(Match.created_at >= week_ago).count()
    pending_negotiations = (
        db.query(Negotiation)
        .filter(
            (Negotiation.user_a_id == current_user.id)
            | (Negotiation.user_b_id == current_user.id),
            Negotiation.status == NegotiationStatus.ACTIVE,
        )
        .count()
    )
    confirmed_agreements = (
        db.query(Agreement)
        .join(Negotiation, Negotiation.id == Agreement.negotiation_id)
        .filter(
            (Negotiation.user_a_id == current_user.id)
            | (Negotiation.user_b_id == current_user.id),
            Agreement.status == AgreementStatus.CONFIRMED,
        )
        .count()
    )
    total_listings = (
        db.query(Listing).filter(Listing.owner_id == current_user.id).count()
        if current_user.role == UserRole.BUSINESS
        else 0
    )
    return UserStats(
        active_matches=active_matches,
        weekly_swipes=weekly_swipes,
        pending_negotiations=pending_negotiations,
        confirmed_agreements=confirmed_agreements,
        total_listings=total_listings,
    )


@router.get("/analytics/me", response_model=AnalyticsResponse)
def my_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> AnalyticsResponse:
    """6 aylık trend. Influencer: instagram_posts metrics aggregated.
    İşletme: kendi listing'lerine gelen match sayısı + agreement değer toplamı."""
    monthly: list[AnalyticsMonthly] = []
    total_views = 0
    engagement_sum = 0.0
    engagement_n = 0

    if current_user.role == UserRole.INFLUENCER:
        posts = current_user.posts
        bucket: dict[str, dict[str, float]] = {}
        for p in posts:
            if not p.posted_at:
                continue
            key = p.posted_at.strftime("%Y-%m")
            metrics = p.metrics or {}
            views = float(metrics.get("reach") or metrics.get("views") or 0)
            engagement = float(metrics.get("engagement_rate") or 0)
            slot = bucket.setdefault(key, {"views": 0.0, "engagement_total": 0.0, "n": 0.0})
            slot["views"] += views
            if engagement:
                slot["engagement_total"] += engagement
                slot["n"] += 1
            total_views += int(views)
            if engagement:
                engagement_sum += engagement
                engagement_n += 1
        for key in sorted(bucket.keys())[-6:]:
            slot = bucket[key]
            avg = (slot["engagement_total"] / slot["n"]) if slot["n"] else 0.0
            monthly.append(
                AnalyticsMonthly(
                    month=_month_label(key),
                    views=int(slot["views"]),
                    engagement=round(avg, 2),
                )
            )
    else:
        # Business: aylık match sayısı (proxy)
        listing_ids = [
            row.id for row in db.query(Listing.id).filter(Listing.owner_id == current_user.id).all()
        ]
        matches = (
            db.query(Match).filter(Match.listing_id.in_(listing_ids or [-1])).all()
            if listing_ids
            else []
        )
        bucket: dict[str, int] = {}
        for m in matches:
            key = m.created_at.strftime("%Y-%m") if m.created_at else "—"
            bucket[key] = bucket.get(key, 0) + 1
        for key in sorted(bucket.keys())[-6:]:
            count = bucket[key]
            views = count * 1500  # mock: her match ≈ 1500 erişim
            total_views += views
            monthly.append(
                AnalyticsMonthly(month=_month_label(key), views=views, engagement=5.5)
            )

    avg_eng = round(engagement_sum / engagement_n, 2) if engagement_n else 5.5
    sales_lift = round(min(35.0, total_views / 5000.0), 1) if total_views else 0.0
    return AnalyticsResponse(
        total_views=total_views,
        average_engagement=avg_eng,
        estimated_sales_lift_pct=sales_lift,
        monthly=monthly,
    )


_TR_MONTHS = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"]


def _month_label(key: str) -> str:
    try:
        year, month = key.split("-")
        return _TR_MONTHS[int(month) - 1]
    except (ValueError, IndexError):
        return key
