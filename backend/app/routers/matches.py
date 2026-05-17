from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import (
    Listing,
    Match,
    MatchStatus,
    User,
    UserRole,
    UserTier,
)
from app.schemas import MatchRead, SwipePayload, SwipeResult
from app.services.negotiation_service import auto_start_negotiation_if_premium

router = APIRouter(prefix="/matches", tags=["matches"])


def _resolve_pair(payload: SwipePayload, current_user: User, db: Session) -> tuple[Listing, int]:
    listing = db.get(Listing, payload.listing_id)
    if not listing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found")
    if current_user.role == UserRole.BUSINESS:
        if listing.owner_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Bu ilan size ait değil.",
            )
        if payload.candidate_id is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Business swipe için candidate_id zorunlu.",
            )
        return listing, payload.candidate_id
    return listing, current_user.id


@router.post("/swipe", response_model=SwipeResult)
def swipe(
    payload: SwipePayload,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> SwipeResult:
    listing, candidate_id = _resolve_pair(payload, current_user, db)

    match = (
        db.query(Match)
        .filter(Match.listing_id == listing.id, Match.candidate_id == candidate_id)
        .one_or_none()
    )
    if match is None:
        match = Match(listing_id=listing.id, candidate_id=candidate_id)
        db.add(match)

    is_business = current_user.role == UserRole.BUSINESS
    swipe_bool = payload.direction == "accept"
    if is_business:
        match.business_swipe = swipe_bool
    else:
        match.candidate_swipe = swipe_bool

    if match.business_swipe is False or match.candidate_swipe is False:
        match.status = MatchStatus.REJECTED
    elif match.business_swipe and match.candidate_swipe:
        match.status = MatchStatus.MATCHED
    else:
        match.status = MatchStatus.PENDING

    db.commit()
    db.refresh(match)

    negotiation_id: int | None = None
    paywall = False
    paywall_reason: str | None = None
    if match.status == MatchStatus.MATCHED:
        business = db.get(User, listing.owner_id)
        candidate = db.get(User, candidate_id)
        if (
            business
            and candidate
            and business.tier == UserTier.PREMIUM
            and candidate.tier == UserTier.PREMIUM
        ):
            negotiation_id = auto_start_negotiation_if_premium(db, match, business, candidate)
        else:
            paywall = True
            free_side = "işletme" if business and business.tier != UserTier.PREMIUM else "diğer kullanıcı"
            paywall_reason = f"Agent açılması için iki tarafın da Premium olması gerekir ({free_side} free)."

    return SwipeResult(
        match_id=match.id,
        status=match.status,
        auto_started_negotiation_id=negotiation_id,
        paywall=paywall,
        paywall_reason=paywall_reason,
    )


@router.get("", response_model=list[MatchRead])
def list_matches(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[MatchRead]:
    query = db.query(Match)
    if current_user.role == UserRole.BUSINESS:
        owned_ids = [row.id for row in db.query(Listing.id).filter(Listing.owner_id == current_user.id).all()]
        query = query.filter(Match.listing_id.in_(owned_ids or [-1]))
    else:
        query = query.filter(Match.candidate_id == current_user.id)
    rows = query.order_by(Match.created_at.desc()).all()
    return [MatchRead.model_validate(row) for row in rows]
