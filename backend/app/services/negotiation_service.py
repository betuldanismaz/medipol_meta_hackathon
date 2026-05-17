"""Negotiation orchestration: start, loop, finalize, memory."""

from __future__ import annotations

import asyncio
import logging
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import settings
from app.database import SessionLocal
from app.models import (
    Agreement,
    AgreementStatus,
    Listing,
    Match,
    MessageRole,
    Negotiation,
    NegotiationMessage,
    NegotiationStatus,
    ProfileMemory,
    User,
    UserRole,
    UserTier,
)
from app.services.agent import (
    AgentContext,
    run_agent_turn,
    summarize_for_memory,
)
from app.services.ws_hub import hub

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def _listing_summary(listing: Listing) -> str:
    parts = [listing.title]
    if listing.budget_min or listing.budget_max:
        parts.append(
            f"bütçe {int(listing.budget_min or 0)}-{int(listing.budget_max or 0)} TRY"
        )
    if listing.city:
        parts.append(listing.city)
    return " | ".join(parts)


def _memory_summaries(db: Session, user_id: int, limit: int = 3) -> list[str]:
    rows = (
        db.execute(
            select(ProfileMemory)
            .where(ProfileMemory.user_id == user_id)
            .order_by(ProfileMemory.created_at.desc())
            .limit(limit)
        )
        .scalars()
        .all()
    )
    return [r.summary for r in rows]


def _build_context(
    db: Session,
    negotiation: Negotiation,
    speaker: User,
    counterpart_role: UserRole,
    listing: Listing,
    user_guidance: str | None = None,
) -> AgentContext:
    own_role = (
        MessageRole.AGENT_A if speaker.id == negotiation.user_a_id else MessageRole.AGENT_B
    )
    counterpart_role_msg = (
        MessageRole.AGENT_B if own_role == MessageRole.AGENT_A else MessageRole.AGENT_A
    )

    counterpart_message: NegotiationMessage | None = next(
        (
            msg
            for msg in reversed(negotiation.messages)
            if msg.role == counterpart_role_msg
        ),
        None,
    )
    own_message: NegotiationMessage | None = next(
        (msg for msg in reversed(negotiation.messages) if msg.role == own_role),
        None,
    )

    return AgentContext(
        user=speaker,
        counterpart_role=counterpart_role,
        listing_summary=_listing_summary(listing),
        last_proposed_terms=own_message.proposed_terms if own_message else None,
        counterpart_last_message=counterpart_message.content if counterpart_message else None,
        counterpart_last_terms=counterpart_message.proposed_terms if counterpart_message else None,
        current_round=negotiation.current_round + 1,
        max_rounds=negotiation.max_rounds,
        memory_summaries=_memory_summaries(db, speaker.id),
        user_guidance=user_guidance,
    )


def _serialize_message(msg: NegotiationMessage) -> dict:
    return {
        "id": msg.id,
        "negotiation_id": msg.negotiation_id,
        "round": msg.round,
        "role": msg.role.value,
        "content": msg.content,
        "reasoning": msg.reasoning,
        "proposed_terms": msg.proposed_terms,
        "status_signal": msg.status_signal,
        "created_at": msg.created_at.isoformat() if msg.created_at else None,
    }


async def _broadcast_message(negotiation_id: int, msg: NegotiationMessage) -> None:
    await hub.broadcast(negotiation_id, {"type": "message", "data": _serialize_message(msg)})


async def _broadcast_state(negotiation: Negotiation) -> None:
    await hub.broadcast(
        negotiation.id,
        {
            "type": "state",
            "data": {
                "id": negotiation.id,
                "status": negotiation.status.value,
                "current_round": negotiation.current_round,
                "max_rounds": negotiation.max_rounds,
                "last_proposed_terms": negotiation.last_proposed_terms,
            },
        },
    )


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------
def start_negotiation(db: Session, match: Match, user_a: User, user_b: User) -> Negotiation:
    existing = (
        db.query(Negotiation)
        .filter(Negotiation.match_id == match.id)
        .order_by(Negotiation.id.desc())
        .first()
    )
    if existing and existing.status == NegotiationStatus.ACTIVE:
        return existing

    negotiation = Negotiation(
        match_id=match.id,
        user_a_id=user_a.id,
        user_b_id=user_b.id,
        status=NegotiationStatus.ACTIVE,
        current_round=0,
        max_rounds=settings.max_negotiation_rounds,
    )
    db.add(negotiation)
    db.commit()
    db.refresh(negotiation)

    # Async loop'u arka planda başlat
    asyncio.create_task(_run_loop(negotiation.id))
    return negotiation


def auto_start_negotiation_if_premium(
    db: Session, match: Match, business: User, candidate: User
) -> int | None:
    if business.tier != UserTier.PREMIUM or candidate.tier != UserTier.PREMIUM:
        return None
    # user_a = business, user_b = candidate (sıralama deterministik kalsın diye)
    negotiation = start_negotiation(db, match, business, candidate)
    return negotiation.id


async def _run_loop(negotiation_id: int) -> None:
    """Background loop: A.agent ↔ B.agent, max N tur."""
    while True:
        db: Session = SessionLocal()
        try:
            negotiation = db.get(Negotiation, negotiation_id)
            if not negotiation or negotiation.status != NegotiationStatus.ACTIVE:
                return
            if negotiation.current_round >= negotiation.max_rounds:
                negotiation.status = NegotiationStatus.EXPIRED
                negotiation.ended_at = datetime.now(timezone.utc)
                db.commit()
                await _broadcast_state(negotiation)
                return

            speaker_id = (
                negotiation.user_a_id
                if negotiation.current_round % 2 == 0
                else negotiation.user_b_id
            )
            counterpart_id = (
                negotiation.user_b_id if speaker_id == negotiation.user_a_id else negotiation.user_a_id
            )
            speaker = db.get(User, speaker_id)
            counterpart = db.get(User, counterpart_id)
            match = db.get(Match, negotiation.match_id)
            listing = db.get(Listing, match.listing_id) if match else None
            if not speaker or not counterpart or not listing:
                negotiation.status = NegotiationStatus.EXPIRED
                db.commit()
                await _broadcast_state(negotiation)
                return

            ctx = _build_context(
                db=db,
                negotiation=negotiation,
                speaker=speaker,
                counterpart_role=counterpart.role,
                listing=listing,
            )
            # blocking OpenAI call → thread pool
            turn = await asyncio.to_thread(run_agent_turn, ctx)

            next_round = negotiation.current_round + 1
            role = (
                MessageRole.AGENT_A if speaker.id == negotiation.user_a_id else MessageRole.AGENT_B
            )
            terms = turn.get("proposed_terms") or {}
            msg = NegotiationMessage(
                negotiation_id=negotiation.id,
                round=next_round,
                role=role,
                content=turn.get("message", ""),
                reasoning=turn.get("reasoning"),
                proposed_terms=terms,
                status_signal=turn.get("status", "continue"),
            )
            db.add(msg)
            negotiation.current_round = next_round
            negotiation.last_proposed_terms = terms

            status_signal = turn.get("status", "continue")
            if status_signal == "agree":
                # Karşı taraf da en son turda agree dediyse anlaşma proposed.
                opposite_role = (
                    MessageRole.AGENT_B if role == MessageRole.AGENT_A else MessageRole.AGENT_A
                )
                last_opposite = next(
                    (m for m in reversed(negotiation.messages) if m.role == opposite_role),
                    None,
                )
                if last_opposite and last_opposite.status_signal == "agree":
                    negotiation.status = NegotiationStatus.AGREED
                    negotiation.ended_at = datetime.now(timezone.utc)
                    agreement = Agreement(
                        negotiation_id=negotiation.id,
                        final_terms=terms,
                        status=AgreementStatus.PROPOSED,
                    )
                    db.add(agreement)
            elif status_signal == "reject":
                negotiation.status = NegotiationStatus.HUMAN_TAKEOVER
                negotiation.ended_at = datetime.now(timezone.utc)

            db.commit()
            db.refresh(msg)
            db.refresh(negotiation)

            await _broadcast_message(negotiation.id, msg)
            await _broadcast_state(negotiation)

            if negotiation.status != NegotiationStatus.ACTIVE:
                return
        except Exception:  # noqa: BLE001
            logger.exception("Negotiation loop error on negotiation_id=%s", negotiation_id)
            return
        finally:
            db.close()
        # Tane tane çalış, ağ üzerinden gözlenebilsin
        await asyncio.sleep(0.6)


# ---------------------------------------------------------------------------
# Intervene / finalize / extend
# ---------------------------------------------------------------------------
def record_user_intervention(
    db: Session,
    negotiation: Negotiation,
    user: User,
    content: str,
    halt: bool,
) -> NegotiationMessage:
    role = MessageRole.USER_A if user.id == negotiation.user_a_id else MessageRole.USER_B
    msg = NegotiationMessage(
        negotiation_id=negotiation.id,
        round=negotiation.current_round,
        role=role,
        content=content,
        reasoning=None,
        proposed_terms=None,
        status_signal="user_intervention",
    )
    db.add(msg)
    if halt:
        negotiation.status = NegotiationStatus.HUMAN_TAKEOVER
        negotiation.ended_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(msg)
    return msg


def finalize_negotiation(
    db: Session, negotiation: Negotiation, user: User, decision: str
) -> Agreement | None:
    agreement = negotiation.agreement
    if not agreement and decision != "reject":
        return None

    if decision == "accept":
        if user.id == negotiation.user_a_id:
            agreement.accepted_by_a = True
        else:
            agreement.accepted_by_b = True
        if agreement.accepted_by_a and agreement.accepted_by_b:
            agreement.status = AgreementStatus.CONFIRMED
            negotiation.status = NegotiationStatus.AGREED
            negotiation.ended_at = datetime.now(timezone.utc)
            # Memory'ye yaz
            for u in (
                db.get(User, negotiation.user_a_id),
                db.get(User, negotiation.user_b_id),
            ):
                if u is None:
                    continue
                db.add(
                    ProfileMemory(
                        user_id=u.id,
                        summary=summarize_for_memory(negotiation, agreement, u),
                        related_negotiation_id=negotiation.id,
                    )
                )
    elif decision == "renegotiate":
        agreement.status = AgreementStatus.RENEGOTIATING
        negotiation.status = NegotiationStatus.ACTIVE
        negotiation.max_rounds = negotiation.max_rounds + 2
        asyncio.create_task(_run_loop(negotiation.id))
    elif decision == "reject":
        if agreement:
            agreement.status = AgreementStatus.REJECTED
        negotiation.status = NegotiationStatus.HUMAN_TAKEOVER
        negotiation.ended_at = datetime.now(timezone.utc)

    db.commit()
    if agreement:
        db.refresh(agreement)
    db.refresh(negotiation)
    return agreement


def extend_rounds(db: Session, negotiation: Negotiation, packs: int) -> Negotiation:
    additional = settings.extra_rounds_per_pack * packs
    negotiation.max_rounds += additional
    if negotiation.status in {NegotiationStatus.EXPIRED, NegotiationStatus.HUMAN_TAKEOVER}:
        negotiation.status = NegotiationStatus.ACTIVE
        negotiation.ended_at = None
        asyncio.create_task(_run_loop(negotiation.id))
    db.commit()
    db.refresh(negotiation)
    return negotiation
