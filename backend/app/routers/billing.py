from __future__ import annotations

from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.dependencies import get_current_user
from app.models import BillingEvent, User, UserRole, UserTier
from app.schemas import (
    BillingEventRead,
    PricingResponse,
    UpgradeRequest,
    UserRead,
)

router = APIRouter(prefix="/billing", tags=["billing"])


def _price_for_plan(plan: str) -> int:
    if plan == "premium_individual":
        return settings.price_premium_individual_try
    if plan == "premium_business":
        return settings.price_premium_business_try
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Bilinmeyen plan")


@router.get("/pricing", response_model=PricingResponse)
def get_pricing() -> PricingResponse:
    return PricingResponse(
        premium_individual_try=settings.price_premium_individual_try,
        premium_business_try=settings.price_premium_business_try,
        extra_rounds_try=settings.price_extra_rounds_try,
        extra_rounds_per_pack=settings.extra_rounds_per_pack,
        max_rounds_default=settings.max_negotiation_rounds,
    )


@router.post("/mock/upgrade", response_model=UserRead)
def mock_upgrade(
    payload: UpgradeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UserRead:
    if payload.plan == "premium_business" and current_user.role != UserRole.BUSINESS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Business planı yalnızca işletme hesapları içindir.",
        )
    if payload.plan == "premium_individual" and current_user.role == UserRole.BUSINESS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="İşletmeler bireysel planı kullanamaz.",
        )

    months = payload.months
    price_per_month = _price_for_plan(payload.plan)
    total = price_per_month * months

    base = current_user.premium_until or datetime.now(timezone.utc)
    if base < datetime.now(timezone.utc):
        base = datetime.now(timezone.utc)

    current_user.tier = UserTier.PREMIUM
    current_user.premium_until = base + timedelta(days=30 * months)

    db.add(
        BillingEvent(
            user_id=current_user.id,
            kind="subscription",
            amount_try=total,
            metadata_json={"plan": payload.plan, "months": months},
        )
    )
    db.commit()
    db.refresh(current_user)
    return UserRead.model_validate(current_user)


@router.get("/events", response_model=list[BillingEventRead])
def list_events(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[BillingEventRead]:
    rows = (
        db.query(BillingEvent)
        .filter(BillingEvent.user_id == current_user.id)
        .order_by(BillingEvent.created_at.desc())
        .all()
    )
    return [BillingEventRead.model_validate(r) for r in rows]
