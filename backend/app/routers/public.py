"""Public read-only endpoints (no auth required).

UI'da landing/listings/influencers sayfaları için. Token zorunlu değil; kullanıcı
giriş yapmamışsa da kart galerisini görebilir.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_, func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import (
    InstagramPost,
    Listing,
    TaxonomyTerm,
    User,
    UserRole,
)
from app.schemas import (
    InstagramPostRead,
    ListingPublic,
    PublicProfileRead,
    TaxonomyResponse,
    TaxonomyTermRead,
)

router = APIRouter(prefix="/public", tags=["public"])


def _enrich_listing(listing: Listing, owner: User | None) -> ListingPublic:
    payload = ListingPublic.model_validate(listing)
    if owner:
        payload.business_name = owner.display_name
        payload.business_avatar_url = owner.avatar_url
        payload.business_sector = (owner.profile or {}).get("subcategory") if owner.profile else None
    return payload


# ---------------------------------------------------------------------------
# Listings
# ---------------------------------------------------------------------------
@router.get("/listings", response_model=list[ListingPublic])
def list_public_listings(
    city: str | None = Query(default=None),
    category: str | None = Query(default=None),
    q: str | None = Query(default=None),
    limit: int = Query(default=50, ge=1, le=200),
    db: Session = Depends(get_db),
) -> list[ListingPublic]:
    query = db.query(Listing).filter(Listing.active.is_(True))
    if city:
        query = query.filter(func.lower(Listing.city) == city.lower())
    if category:
        query = query.filter(Listing.category == category)
    if q:
        like = f"%{q.lower()}%"
        query = query.filter(
            or_(
                func.lower(Listing.title).like(like),
                func.lower(Listing.description).like(like),
                func.lower(Listing.city).like(like),
            )
        )
    rows = query.order_by(Listing.created_at.desc()).limit(limit).all()
    owner_ids = {l.owner_id for l in rows}
    owners = {u.id: u for u in db.query(User).filter(User.id.in_(owner_ids)).all()} if owner_ids else {}
    return [_enrich_listing(l, owners.get(l.owner_id)) for l in rows]


@router.get("/listings/{listing_id}", response_model=ListingPublic)
def get_public_listing(listing_id: int, db: Session = Depends(get_db)) -> ListingPublic:
    listing = db.get(Listing, listing_id)
    if not listing or not listing.active:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found")
    return _enrich_listing(listing, db.get(User, listing.owner_id))


# ---------------------------------------------------------------------------
# Influencers
# ---------------------------------------------------------------------------
@router.get("/influencers", response_model=list[PublicProfileRead])
def list_public_influencers(
    tier: str | None = Query(default=None, description="nano/micro/mid/macro"),
    city: str | None = Query(default=None),
    niche: str | None = Query(default=None),
    q: str | None = Query(default=None),
    limit: int = Query(default=50, ge=1, le=200),
    db: Session = Depends(get_db),
) -> list[PublicProfileRead]:
    query = db.query(User).filter(User.role == UserRole.INFLUENCER)
    if city:
        query = query.filter(func.lower(User.city) == city.lower())
    if q:
        like = f"%{q.lower()}%"
        query = query.filter(
            or_(
                func.lower(User.display_name).like(like),
                func.lower(User.username).like(like),
                func.lower(User.city).like(like),
            )
        )
    rows = query.order_by(User.created_at.desc()).limit(limit * 2).all()
    # tier ve niche profile JSON içinde — Python tarafında filtrele
    out: list[PublicProfileRead] = []
    for u in rows:
        profile = u.profile or {}
        if tier and profile.get("tier") != tier:
            continue
        if niche:
            cats = profile.get("content_categories") or []
            if niche not in cats and niche.lower() not in [c.lower() for c in cats if isinstance(c, str)]:
                continue
        out.append(PublicProfileRead.model_validate(u))
        if len(out) >= limit:
            break
    return out


@router.get("/influencers/{user_id}", response_model=PublicProfileRead)
def get_public_influencer(user_id: int, db: Session = Depends(get_db)) -> PublicProfileRead:
    user = db.get(User, user_id)
    if not user or user.role != UserRole.INFLUENCER:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")
    return PublicProfileRead.model_validate(user)


@router.get("/influencers/{user_id}/posts", response_model=list[InstagramPostRead])
def list_influencer_posts(
    user_id: int,
    limit: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
) -> list[InstagramPostRead]:
    user = db.get(User, user_id)
    if not user or user.role != UserRole.INFLUENCER:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")
    rows = (
        db.query(InstagramPost)
        .filter(InstagramPost.influencer_id == user_id)
        .order_by(InstagramPost.posted_at.desc().nullslast())
        .limit(limit)
        .all()
    )
    return [InstagramPostRead.model_validate(p) for p in rows]


# ---------------------------------------------------------------------------
# Taxonomy
# ---------------------------------------------------------------------------
@router.get("/taxonomy", response_model=TaxonomyResponse)
def get_taxonomy(db: Session = Depends(get_db)) -> TaxonomyResponse:
    rows = db.query(TaxonomyTerm).order_by(TaxonomyTerm.kind, TaxonomyTerm.label).all()
    buckets: dict[str, list[TaxonomyTerm]] = {
        "sector": [],
        "category": [],
        "style": [],
        "position": [],
    }
    for r in rows:
        buckets.setdefault(r.kind, []).append(r)
    return TaxonomyResponse(
        sectors=[TaxonomyTermRead.model_validate(r) for r in buckets.get("sector", [])],
        categories=[TaxonomyTermRead.model_validate(r) for r in buckets.get("category", [])],
        content_styles=[TaxonomyTermRead.model_validate(r) for r in buckets.get("style", [])],
        positions=[TaxonomyTermRead.model_validate(r) for r in buckets.get("position", [])],
    )
