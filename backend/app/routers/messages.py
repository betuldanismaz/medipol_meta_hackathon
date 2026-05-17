"""Free fallback in-app chat."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import desc, func
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import Listing, Match, Message, User, UserRole
from app.schemas import ConversationItem, MessageCreate, MessageRead

router = APIRouter(prefix="/messages", tags=["messages"])


def _match_counterpart(match: Match, current_user: User, db: Session) -> User | None:
    if current_user.role == UserRole.BUSINESS:
        return db.get(User, match.candidate_id)
    listing = db.get(Listing, match.listing_id)
    return db.get(User, listing.owner_id) if listing else None


def _ensure_match_access(match: Match, current_user: User, db: Session) -> User:
    counterpart = _match_counterpart(match, current_user, db)
    if not counterpart:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")
    if current_user.role == UserRole.BUSINESS:
        listing = db.get(Listing, match.listing_id)
        if not listing or listing.owner_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Erişim yok.")
    else:
        if match.candidate_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Erişim yok.")
    return counterpart


@router.get("/conversations", response_model=list[ConversationItem])
def list_conversations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[ConversationItem]:
    if current_user.role == UserRole.BUSINESS:
        listing_ids = [
            row.id for row in db.query(Listing.id).filter(Listing.owner_id == current_user.id).all()
        ]
        matches = (
            db.query(Match).filter(Match.listing_id.in_(listing_ids or [-1])).all()
            if listing_ids
            else []
        )
    else:
        matches = db.query(Match).filter(Match.candidate_id == current_user.id).all()

    items: list[ConversationItem] = []
    for match in matches:
        counterpart = _match_counterpart(match, current_user, db)
        if not counterpart:
            continue
        last = (
            db.query(Message)
            .filter(Message.match_id == match.id)
            .order_by(desc(Message.created_at))
            .first()
        )
        items.append(
            ConversationItem(
                match_id=match.id,
                counterpart_id=counterpart.id,
                counterpart_display_name=counterpart.display_name,
                counterpart_avatar_url=counterpart.avatar_url,
                last_message=last.content if last else None,
                last_message_at=last.created_at if last else None,
            )
        )
    items.sort(
        key=lambda i: i.last_message_at or i.match_id,  # type: ignore[arg-type]
        reverse=True,
    )
    return items


@router.get("/{match_id}", response_model=list[MessageRead])
def list_messages(
    match_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[MessageRead]:
    match = db.get(Match, match_id)
    if not match:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Match not found")
    _ensure_match_access(match, current_user, db)
    rows = (
        db.query(Message)
        .filter(Message.match_id == match_id)
        .order_by(Message.created_at.asc())
        .all()
    )
    return [MessageRead.model_validate(r) for r in rows]


@router.post("", response_model=MessageRead, status_code=status.HTTP_201_CREATED)
def post_message(
    payload: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> MessageRead:
    match = db.get(Match, payload.match_id)
    if not match:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Match not found")
    _ensure_match_access(match, current_user, db)
    msg = Message(
        match_id=match.id,
        sender_id=current_user.id,
        content=payload.content.strip(),
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)
    _ = func  # silence unused import
    return MessageRead.model_validate(msg)
