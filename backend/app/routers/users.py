from __future__ import annotations

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import Dealbreakers, User
from app.schemas import (
    DealbreakersPayload,
    DealbreakersRead,
    UserRead,
    UserUpdate,
)

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserRead)
def read_me(current_user: User = Depends(get_current_user)) -> UserRead:
    return UserRead.model_validate(current_user)


@router.patch("/me", response_model=UserRead)
def update_me(
    payload: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UserRead:
    data = payload.model_dump(exclude_unset=True)
    if "agent_persona" in data and data["agent_persona"] is not None:
        data["agent_persona"] = payload.agent_persona.model_dump() if payload.agent_persona else None
    for key, value in data.items():
        setattr(current_user, key, value)
    db.commit()
    db.refresh(current_user)
    return UserRead.model_validate(current_user)


@router.get("/me/dealbreakers", response_model=DealbreakersRead | None)
def read_dealbreakers(
    current_user: User = Depends(get_current_user),
) -> DealbreakersRead | None:
    if not current_user.dealbreakers:
        return None
    return DealbreakersRead.model_validate(current_user.dealbreakers)


@router.put("/me/dealbreakers", response_model=DealbreakersRead, status_code=status.HTTP_200_OK)
def upsert_dealbreakers(
    payload: DealbreakersPayload,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> DealbreakersRead:
    record = current_user.dealbreakers
    if record is None:
        record = Dealbreakers(user_id=current_user.id)
        db.add(record)
    for key, value in payload.model_dump().items():
        setattr(record, key, value)
    db.commit()
    db.refresh(record)
    return DealbreakersRead.model_validate(record)
