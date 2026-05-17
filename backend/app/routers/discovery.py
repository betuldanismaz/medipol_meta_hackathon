"""Discovery feed — ML ranking ile kart akışı.

Frontend `getDiscoveryFeed()` bu endpoint'i çağırır. Kullanıcının role'üne göre:

- **BUSINESS**: kendi aktif listing'leri üzerinden INFLUENCER user'larını sıralar
  → her influencer için en iyi (listing × kendisi) skoru, kart olarak döner.
- **INFLUENCER / WORKER**: başka business'lerin aktif collab listing'lerini sıralar
  → kendi profil ile her listing'in pair skoru, kart olarak döner.

Skorlama: `app.ml.ranking.rank_pairs` → eğitilmiş XGBoost regressor
(`backend/ml_artifacts/v1/`). Model dosyası yoksa FallbackHeuristicAdapter
devreye girer ve demo bozulmaz.
"""
from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import Listing, Match, User, UserRole
from app.ml.ranking import RankResult, rank_pairs
from app.schemas import (
    DiscoveryCard,
    DiscoveryFeed,
    ListingPublic,
    PublicProfileRead,
)

logger = logging.getLogger("app.routers.discovery")

router = APIRouter(prefix="/discovery", tags=["discovery"])


@router.get("/feed", response_model=DiscoveryFeed)
def get_feed(
    limit: int = Query(default=20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> DiscoveryFeed:
    if current_user.role == UserRole.BUSINESS:
        cards = _feed_for_business(db, current_user, limit)
    else:
        cards = _feed_for_candidate(db, current_user, limit)
    return DiscoveryFeed(cards=cards)


# ---------------------------------------------------------------------------
# Business akışı: kendi listing'leri × influencer adayları
# ---------------------------------------------------------------------------
def _feed_for_business(db: Session, business: User, limit: int) -> list[DiscoveryCard]:
    listings: list[Listing] = (
        db.query(Listing)
        .filter(Listing.owner_id == business.id, Listing.active.is_(True))
        .all()
    )
    if not listings:
        logger.info("[discovery] business %s has no active listings", business.id)
        return []

    # Daha önce karar verilen pair'leri filtrele
    listing_ids = [l.id for l in listings]
    decided_pairs = {
        (m.listing_id, m.candidate_id)
        for m in db.query(Match)
        .filter(Match.listing_id.in_(listing_ids))
        .filter(Match.business_swipe.isnot(None))
        .all()
    }

    candidates: list[User] = (
        db.query(User)
        .filter(User.role == UserRole.INFLUENCER)
        .limit(200)
        .all()
    )
    if not candidates:
        return []

    pairs: list[tuple[User, Listing, User]] = []
    for inf in candidates:
        for listing in listings:
            if (listing.id, inf.id) in decided_pairs:
                continue
            pairs.append((inf, listing, business))

    if not pairs:
        return []

    results = rank_pairs(db, pairs)

    # Her influencer için en yüksek skorlu pair'i sakla
    best_per_inf: dict[int, RankResult] = {}
    for r in results:
        cur = best_per_inf.get(r.influencer_id)
        if cur is None or r.score > cur.score:
            best_per_inf[r.influencer_id] = r

    ranked = sorted(best_per_inf.values(), key=lambda r: r.score, reverse=True)[:limit]
    inf_lookup = {u.id: u for u in candidates}

    cards: list[DiscoveryCard] = []
    for r in ranked:
        inf = inf_lookup.get(r.influencer_id)
        if inf is None:
            continue
        cards.append(
            DiscoveryCard(
                user=PublicProfileRead.model_validate(inf),
                listing=None,
                score=int(round(r.score)),
                reasons=r.reasons,
            )
        )
    return cards


# ---------------------------------------------------------------------------
# Influencer / Worker akışı: aktif listing'ler × kendisi
# ---------------------------------------------------------------------------
def _feed_for_candidate(db: Session, candidate: User, limit: int) -> list[DiscoveryCard]:
    already_listing_ids = {
        m.listing_id
        for m in db.query(Match)
        .filter(Match.candidate_id == candidate.id)
        .filter(Match.candidate_swipe.isnot(None))
        .all()
    }

    listings: list[Listing] = (
        db.query(Listing)
        .filter(Listing.active.is_(True))
        .filter(Listing.owner_id != candidate.id)
        .filter(Listing.id.notin_(already_listing_ids or [-1]))
        .limit(200)
        .all()
    )
    if not listings:
        return []

    owner_ids = {l.owner_id for l in listings}
    owners: dict[int, User] = (
        {u.id: u for u in db.query(User).filter(User.id.in_(owner_ids)).all()}
        if owner_ids else {}
    )

    pairs: list[tuple[User, Listing, User]] = []
    listing_owner_lookup: dict[int, tuple[Listing, User]] = {}
    for listing in listings:
        owner = owners.get(listing.owner_id)
        if owner is None:
            continue
        pairs.append((candidate, listing, owner))
        listing_owner_lookup[listing.id] = (listing, owner)

    if not pairs:
        return []

    results = rank_pairs(db, pairs)
    top = results[:limit]

    cards: list[DiscoveryCard] = []
    for r in top:
        entry = listing_owner_lookup.get(r.listing_id)
        if entry is None:
            continue
        listing, owner = entry
        listing_public = ListingPublic.model_validate(listing)
        listing_public.business_name = owner.display_name
        listing_public.business_avatar_url = owner.avatar_url
        owner_profile = owner.profile or {}
        listing_public.business_sector = owner_profile.get("subcategory")
        cards.append(
            DiscoveryCard(
                user=None,
                listing=listing_public,
                score=int(round(r.score)),
                reasons=r.reasons,
            )
        )
    return cards
