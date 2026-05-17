from __future__ import annotations

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    WebSocket,
    WebSocketDisconnect,
    status,
)
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user, get_ws_user, require_premium
from app.models import (
    BillingEvent,
    Listing,
    Match,
    Negotiation,
    NegotiationStatus,
    User,
    UserRole,
    UserTier,
)
from app.config import settings
from app.schemas import (
    AgreementRead,
    ExtendRequest,
    FinalizeRequest,
    InboxItem,
    InterveneRequest,
    NegotiationDetail,
    NegotiationMessageRead,
    NegotiationRead,
    StartNegotiationRequest,
)
from app.services.negotiation_service import (
    extend_rounds,
    finalize_negotiation,
    record_user_intervention,
    start_negotiation,
)
from app.services.ws_hub import hub

router = APIRouter(prefix="/negotiations", tags=["negotiations"])


def _ensure_participant(negotiation: Negotiation, user: User) -> None:
    if user.id not in {negotiation.user_a_id, negotiation.user_b_id}:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Bu müzakereye erişiminiz yok.")


@router.post("/start", response_model=NegotiationRead, status_code=status.HTTP_201_CREATED)
def start(
    payload: StartNegotiationRequest,
    current_user: User = Depends(require_premium),
    db: Session = Depends(get_db),
) -> NegotiationRead:
    match = db.get(Match, payload.match_id)
    if not match:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Match not found")
    listing = db.get(Listing, match.listing_id)
    if not listing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found")
    business = db.get(User, listing.owner_id)
    candidate = db.get(User, match.candidate_id)
    if not business or not candidate:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Counterpart not found")
    if business.tier != UserTier.PREMIUM or candidate.tier != UserTier.PREMIUM:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail={
                "code": "premium_required_both_sides",
                "message": "Agent müzakeresi için iki tarafın da Premium olması gerekir.",
            },
        )
    if current_user.id not in {business.id, candidate.id}:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Bu match size ait değil.")
    negotiation = start_negotiation(db, match, business, candidate)
    return NegotiationRead.model_validate(negotiation)


@router.get("/inbox", response_model=list[InboxItem])
def inbox(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[InboxItem]:
    rows = (
        db.query(Negotiation)
        .filter(
            (Negotiation.user_a_id == current_user.id)
            | (Negotiation.user_b_id == current_user.id)
        )
        .order_by(Negotiation.started_at.desc())
        .all()
    )
    items: list[InboxItem] = []
    for neg in rows:
        counterpart_id = (
            neg.user_b_id if neg.user_a_id == current_user.id else neg.user_a_id
        )
        counterpart = db.get(User, counterpart_id)
        last_msg = neg.messages[-1] if neg.messages else None
        items.append(
            InboxItem(
                negotiation=NegotiationRead.model_validate(neg),
                counterpart_display_name=counterpart.display_name if counterpart else "—",
                last_round_summary=(last_msg.content if last_msg else None),
            )
        )
    return items


@router.get("/{negotiation_id}", response_model=NegotiationDetail)
def get_detail(
    negotiation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> NegotiationDetail:
    neg = db.get(Negotiation, negotiation_id)
    if not neg:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    _ensure_participant(neg, current_user)
    detail = NegotiationDetail.model_validate(neg)
    detail.messages = [NegotiationMessageRead.model_validate(m) for m in neg.messages]
    detail.agreement = AgreementRead.model_validate(neg.agreement) if neg.agreement else None
    return detail


@router.post("/{negotiation_id}/intervene", response_model=NegotiationMessageRead)
async def intervene(
    negotiation_id: int,
    payload: InterveneRequest,
    current_user: User = Depends(require_premium),
    db: Session = Depends(get_db),
) -> NegotiationMessageRead:
    neg = db.get(Negotiation, negotiation_id)
    if not neg:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    _ensure_participant(neg, current_user)
    if neg.status != NegotiationStatus.ACTIVE and not payload.halt:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Müzakere aktif değil.")
    msg = record_user_intervention(db, neg, current_user, payload.content, payload.halt)
    await hub.broadcast(neg.id, {"type": "message", "data": NegotiationMessageRead.model_validate(msg).model_dump(mode="json")})
    return NegotiationMessageRead.model_validate(msg)


@router.post("/{negotiation_id}/finalize", response_model=NegotiationDetail)
def finalize(
    negotiation_id: int,
    payload: FinalizeRequest,
    current_user: User = Depends(require_premium),
    db: Session = Depends(get_db),
) -> NegotiationDetail:
    neg = db.get(Negotiation, negotiation_id)
    if not neg:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    _ensure_participant(neg, current_user)
    finalize_negotiation(db, neg, current_user, payload.decision)
    db.refresh(neg)
    detail = NegotiationDetail.model_validate(neg)
    detail.messages = [NegotiationMessageRead.model_validate(m) for m in neg.messages]
    detail.agreement = AgreementRead.model_validate(neg.agreement) if neg.agreement else None
    return detail


@router.post("/{negotiation_id}/extend", response_model=NegotiationRead)
def extend(
    negotiation_id: int,
    payload: ExtendRequest,
    current_user: User = Depends(require_premium),
    db: Session = Depends(get_db),
) -> NegotiationRead:
    neg = db.get(Negotiation, negotiation_id)
    if not neg:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    _ensure_participant(neg, current_user)
    # Mock ödeme: BillingEvent
    db.add(
        BillingEvent(
            user_id=current_user.id,
            kind="extra_rounds",
            amount_try=settings.price_extra_rounds_try * payload.pack,
            metadata_json={"negotiation_id": neg.id, "packs": payload.pack},
        )
    )
    extend_rounds(db, neg, payload.pack)
    return NegotiationRead.model_validate(neg)


@router.websocket("/{negotiation_id}/stream")
async def stream(
    websocket: WebSocket,
    negotiation_id: int,
    current_user: User = Depends(get_ws_user),
    db: Session = Depends(get_db),
) -> None:
    neg = db.get(Negotiation, negotiation_id)
    if not neg:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Not found")
        return
    if current_user.id not in {neg.user_a_id, neg.user_b_id}:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="forbidden")
        return

    await hub.connect(negotiation_id, websocket)
    try:
        # ilk snapshot
        await websocket.send_json(
            {
                "type": "snapshot",
                "data": {
                    "negotiation": NegotiationRead.model_validate(neg).model_dump(mode="json"),
                    "messages": [
                        NegotiationMessageRead.model_validate(m).model_dump(mode="json")
                        for m in neg.messages
                    ],
                    "agreement": AgreementRead.model_validate(neg.agreement).model_dump(mode="json")
                    if neg.agreement
                    else None,
                },
            }
        )
        while True:
            # client-side ping/keepalive
            await websocket.receive_text()
    except WebSocketDisconnect:
        pass
    finally:
        await hub.disconnect(negotiation_id, websocket)
