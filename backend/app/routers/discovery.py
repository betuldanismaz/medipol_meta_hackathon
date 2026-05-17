"""Discovery feed — ranklı swipeable kart akışı.

Influencer/Worker: kendisine uygun listingleri görür.
Business: kendi listingine başvurabilecek influencer/worker'ları görür.

Skorlama: mevcut `app/matching.py::calculate_score` (kural tabanlı, LLM enrich
opsiyonel). XGBoost predictor gelirse adapter bu dosyada değiştirilir.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.matching import calculate_score
from app.models import Listing, Match, User, UserRole
from app.schemas import (
    DiscoveryCard,
    DiscoveryFeed,
    ListingPublic,
    PublicProfileRead,
)

router = APIRouter(prefix="/discovery", tags=["discovery"])


def _user_to_score_input(user: User) -> dict:
    profile = user.profile or {}
    return {
        "id": user.external_id or str(user.id),
        "name": user.display_name,
        "niche": (profile.get("content_categories") or [None])[0],
        "followers": profile.get("follower_count") or 0,
        "engagement_rate": profile.get("engagement_rate") or 0,
        "city": user.city or "",
    }


def _listing_to_score_input(listing: Listing, owner: User | None) -> dict:
    owner_profile = (owner.profile or {}) if owner else {}
    return {
        "id": listing.external_id or str(listing.id),
        "name": owner.display_name if owner else "İşletme",
        "niche": owner_profile.get("subcategory"),
        "target_followers": (listing.extras or {}).get("preferred_tiers", [None])[0],
        "city": listing.city or "",
    }


@router.get("/feed", response_model=DiscoveryFeed)
def get_feed(
    limit: int = Query(default=20, ge=1, le=50),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> DiscoveryFeed:
    cards: list[DiscoveryCard] = []

    if current_user.role == UserRole.BUSINESS:
        # İşletme: kendi listinglerine başvurabilecek influencerlar
        my_listings = (
            db.query(Listing)
            .filter(Listing.owner_id == current_user.id, Listing.active.is_(True))
            .all()
        )
        if not my_listings:
            return DiscoveryFeed(cards=[])
        primary_listing = my_listings[0]
        already_pairs = {
            m.candidate_id
            for m in db.query(Match).filter(Match.listing_id == primary_listing.id).all()
        }
        biz_input = _listing_to_score_input(primary_listing, current_user)
        influencers = (
            db.query(User)
            .filter(User.role == UserRole.INFLUENCER, User.id.notin_(already_pairs or [-1]))
            .limit(limit * 3)
            .all()
        )
        scored = []
        for inf in influencers:
            score = calculate_score(_user_to_score_input(inf), biz_input)
            scored.append((score, inf))
        scored.sort(key=lambda x: x[0]["score"], reverse=True)
        for score, inf in scored[:limit]:
            cards.append(
                DiscoveryCard(
                    user=PublicProfileRead.model_validate(inf),
                    score=score["score"],
                    reasons=score["reasons"],
                )
            )
        return DiscoveryFeed(cards=cards)

    # Influencer/Worker: ilanları gör
    already_listing_ids = {
        m.listing_id for m in db.query(Match).filter(Match.candidate_id == current_user.id).all()
    }
    listings = (
        db.query(Listing)
        .filter(
            Listing.active.is_(True),
            Listing.id.notin_(already_listing_ids or [-1]),
        )
        .limit(limit * 3)
        .all()
    )
    inf_input = _user_to_score_input(current_user)
    owner_ids = {l.owner_id for l in listings}
    owners = {u.id: u for u in db.query(User).filter(User.id.in_(owner_ids)).all()} if owner_ids else {}
    scored_listings = []
    for listing in listings:
        owner = owners.get(listing.owner_id)
        biz_input = _listing_to_score_input(listing, owner)
        score = calculate_score(inf_input, biz_input)
        scored_listings.append((score, listing, owner))
    scored_listings.sort(key=lambda x: x[0]["score"], reverse=True)
    for score, listing, owner in scored_listings[:limit]:
        listing_public = ListingPublic.model_validate(listing)
        if owner:
            listing_public.business_name = owner.display_name
            listing_public.business_avatar_url = owner.avatar_url
            owner_profile = owner.profile or {}
            listing_public.business_sector = owner_profile.get("subcategory")
        cards.append(
            DiscoveryCard(
                listing=listing_public,
                score=score["score"],
                reasons=score["reasons"],
            )
        )
    return DiscoveryFeed(cards=cards)
