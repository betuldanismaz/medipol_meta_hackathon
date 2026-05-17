from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import Listing, User, UserRole
from app.schemas import ListingCreate, ListingRead

router = APIRouter(prefix="/listings", tags=["listings"])


def _ensure_business(user: User) -> None:
    if user.role != UserRole.BUSINESS:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sadece işletme hesapları ilan oluşturabilir.",
        )


@router.post("", response_model=ListingRead, status_code=status.HTTP_201_CREATED)
def create_listing(
    payload: ListingCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ListingRead:
    _ensure_business(current_user)
    listing = Listing(owner_id=current_user.id, **payload.model_dump())
    db.add(listing)
    db.commit()
    db.refresh(listing)
    return ListingRead.model_validate(listing)


@router.get("", response_model=list[ListingRead])
def list_listings(
    active_only: bool = True,
    db: Session = Depends(get_db),
) -> list[ListingRead]:
    query = db.query(Listing)
    if active_only:
        query = query.filter(Listing.active.is_(True))
    return [ListingRead.model_validate(item) for item in query.order_by(Listing.created_at.desc()).all()]


@router.get("/mine", response_model=list[ListingRead])
def list_my_listings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[ListingRead]:
    rows = (
        db.query(Listing)
        .filter(Listing.owner_id == current_user.id)
        .order_by(Listing.created_at.desc())
        .all()
    )
    return [ListingRead.model_validate(item) for item in rows]


@router.get("/{listing_id}", response_model=ListingRead)
def get_listing(listing_id: int, db: Session = Depends(get_db)) -> ListingRead:
    listing = db.get(Listing, listing_id)
    if not listing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found")
    return ListingRead.model_validate(listing)


@router.delete("/{listing_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_listing(
    listing_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    listing = db.get(Listing, listing_id)
    if not listing or listing.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found")
    db.delete(listing)
    db.commit()
