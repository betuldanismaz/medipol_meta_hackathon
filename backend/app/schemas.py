from __future__ import annotations

from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models import (
    AgentStyle,
    AgreementStatus,
    ListingType,
    MatchStatus,
    MessageRole,
    NegotiationStatus,
    UserRole,
    UserTier,
)


# ---------------------------------------------------------------------------
# Health
# ---------------------------------------------------------------------------
class HealthStatus(BaseModel):
    status: str
    db: str


class HealthLogRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    message: str
    created_at: datetime


# ---------------------------------------------------------------------------
# Agent persona & dealbreakers
# ---------------------------------------------------------------------------
class AgentPersona(BaseModel):
    name: str = Field(..., min_length=1, max_length=80)
    avatar: str = Field(default="default")
    style: AgentStyle = AgentStyle.BALANCED


class DealbreakersPayload(BaseModel):
    min_price: float | None = None
    max_price: float | None = None
    max_hours_per_week: int | None = None
    forbidden_days: list[str] | None = None
    required_days: list[str] | None = None
    forbidden_categories: list[str] | None = None
    require_in_person: bool = False
    free_notes: str | None = None


class DealbreakersRead(DealbreakersPayload):
    model_config = ConfigDict(from_attributes=True)
    updated_at: datetime


# ---------------------------------------------------------------------------
# Auth & users
# ---------------------------------------------------------------------------
class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=128)
    display_name: str = Field(..., min_length=1, max_length=120)
    role: UserRole
    city: str | None = None
    latitude: float | None = None
    longitude: float | None = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: Literal["bearer"] = "bearer"
    user: "UserRead"


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    email: EmailStr
    display_name: str
    role: UserRole
    tier: UserTier
    premium_until: datetime | None = None
    agent_persona: AgentPersona | None = None
    profile: dict[str, Any] | None = None
    city: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    created_at: datetime


class UserUpdate(BaseModel):
    display_name: str | None = None
    profile: dict[str, Any] | None = None
    city: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    agent_persona: AgentPersona | None = None


# ---------------------------------------------------------------------------
# Listings
# ---------------------------------------------------------------------------
class ListingCreate(BaseModel):
    type: ListingType
    title: str = Field(..., min_length=2, max_length=160)
    description: str
    budget_min: float | None = None
    budget_max: float | None = None
    city: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    extras: dict[str, Any] | None = None


class ListingRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    owner_id: int
    type: ListingType
    title: str
    description: str
    budget_min: float | None = None
    budget_max: float | None = None
    city: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    extras: dict[str, Any] | None = None
    active: bool
    created_at: datetime


# ---------------------------------------------------------------------------
# Matches & swipe
# ---------------------------------------------------------------------------
class SwipePayload(BaseModel):
    listing_id: int
    candidate_id: int | None = None
    direction: Literal["accept", "reject"]


class SwipeResult(BaseModel):
    match_id: int | None
    status: MatchStatus
    auto_started_negotiation_id: int | None = None
    paywall: bool = False
    paywall_reason: str | None = None


class MatchRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    listing_id: int
    candidate_id: int
    status: MatchStatus
    created_at: datetime


# ---------------------------------------------------------------------------
# Agent / negotiation
# ---------------------------------------------------------------------------
class ProposedTerms(BaseModel):
    price: float | None = None
    currency: str = "TRY"
    duration_days: int | None = None
    scope: str | None = None
    extra_conditions: list[str] = Field(default_factory=list)


class AgentTurn(BaseModel):
    message: str
    reasoning: str | None = None
    proposed_terms: ProposedTerms | None = None
    status: Literal["continue", "agree", "reject"] = "continue"


class NegotiationMessageRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    negotiation_id: int
    round: int
    role: MessageRole
    content: str
    reasoning: str | None = None
    proposed_terms: dict[str, Any] | None = None
    status_signal: str | None = None
    created_at: datetime


class NegotiationRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    match_id: int
    user_a_id: int
    user_b_id: int
    status: NegotiationStatus
    current_round: int
    max_rounds: int
    last_proposed_terms: dict[str, Any] | None = None
    started_at: datetime
    ended_at: datetime | None = None


class NegotiationDetail(NegotiationRead):
    messages: list[NegotiationMessageRead] = Field(default_factory=list)
    agreement: "AgreementRead | None" = None


class StartNegotiationRequest(BaseModel):
    match_id: int


class InterveneRequest(BaseModel):
    content: str = Field(..., min_length=1, max_length=2000)
    guidance: str | None = None
    halt: bool = False


class FinalizeRequest(BaseModel):
    decision: Literal["accept", "renegotiate", "reject"]


class ExtendRequest(BaseModel):
    pack: int = Field(default=1, ge=1, le=3)


class AgreementRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    negotiation_id: int
    final_terms: dict[str, Any]
    status: AgreementStatus
    accepted_by_a: bool
    accepted_by_b: bool
    created_at: datetime


class InboxItem(BaseModel):
    negotiation: NegotiationRead
    counterpart_display_name: str
    last_round_summary: str | None = None
    unread: bool = False


# ---------------------------------------------------------------------------
# Billing
# ---------------------------------------------------------------------------
class UpgradeRequest(BaseModel):
    plan: Literal["premium_individual", "premium_business"]
    months: int = Field(default=1, ge=1, le=12)


class BillingEventRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    user_id: int
    kind: str
    amount_try: float
    status: str
    metadata_json: dict[str, Any] | None = None
    created_at: datetime


class PricingResponse(BaseModel):
    premium_individual_try: int
    premium_business_try: int
    extra_rounds_try: int
    extra_rounds_per_pack: int
    max_rounds_default: int


NegotiationDetail.model_rebuild()
TokenResponse.model_rebuild()
