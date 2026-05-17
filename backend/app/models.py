from __future__ import annotations

from datetime import datetime
from enum import Enum as PyEnum

from sqlalchemy import (
    JSON,
    Boolean,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class UserRole(str, PyEnum):
    INFLUENCER = "influencer"
    WORKER = "worker"
    BUSINESS = "business"


class UserTier(str, PyEnum):
    FREE = "free"
    PREMIUM = "premium"


class AgentStyle(str, PyEnum):
    AGGRESSIVE = "aggressive"
    BALANCED = "balanced"
    FLEXIBLE = "flexible"
    QUICK_CLOSER = "quick_closer"


class ListingType(str, PyEnum):
    COLLAB = "collab"
    JOB = "job"


class MatchStatus(str, PyEnum):
    PENDING = "pending"
    MATCHED = "matched"
    REJECTED = "rejected"


class NegotiationStatus(str, PyEnum):
    ACTIVE = "active"
    AGREED = "agreed"
    REJECTED = "rejected"
    EXPIRED = "expired"
    HUMAN_TAKEOVER = "human_takeover"


class AgreementStatus(str, PyEnum):
    PROPOSED = "proposed"
    CONFIRMED = "confirmed"
    REJECTED = "rejected"
    RENEGOTIATING = "renegotiating"


class MessageRole(str, PyEnum):
    AGENT_A = "agent_a"
    AGENT_B = "agent_b"
    USER_A = "user_a"
    USER_B = "user_b"
    SYSTEM = "system"


class HealthLog(Base):
    __tablename__ = "health_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    message: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    external_id: Mapped[str | None] = mapped_column(String(64), unique=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    display_name: Mapped[str] = mapped_column(String(120), nullable=False)
    username: Mapped[str | None] = mapped_column(String(80), unique=True, index=True)
    avatar_url: Mapped[str | None] = mapped_column(String(500))
    role: Mapped[UserRole] = mapped_column(Enum(UserRole), nullable=False)
    tier: Mapped[UserTier] = mapped_column(
        Enum(UserTier), nullable=False, default=UserTier.FREE
    )
    premium_until: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    agent_persona: Mapped[dict | None] = mapped_column(JSON)
    profile: Mapped[dict | None] = mapped_column(JSON)
    city: Mapped[str | None] = mapped_column(String(80))
    district: Mapped[str | None] = mapped_column(String(80))
    latitude: Mapped[float | None] = mapped_column(Float)
    longitude: Mapped[float | None] = mapped_column(Float)
    bio: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    dealbreakers: Mapped["Dealbreakers | None"] = relationship(
        back_populates="user", uselist=False, cascade="all, delete-orphan"
    )
    listings: Mapped[list["Listing"]] = relationship(
        back_populates="owner", cascade="all, delete-orphan"
    )
    memories: Mapped[list["ProfileMemory"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    posts: Mapped[list["InstagramPost"]] = relationship(
        back_populates="influencer", cascade="all, delete-orphan"
    )


class Dealbreakers(Base):
    __tablename__ = "dealbreakers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    min_price: Mapped[float | None] = mapped_column(Float)
    max_price: Mapped[float | None] = mapped_column(Float)
    max_hours_per_week: Mapped[int | None] = mapped_column(Integer)
    forbidden_days: Mapped[list | None] = mapped_column(JSON)
    required_days: Mapped[list | None] = mapped_column(JSON)
    forbidden_categories: Mapped[list | None] = mapped_column(JSON)
    require_in_person: Mapped[bool] = mapped_column(Boolean, default=False)
    free_notes: Mapped[str | None] = mapped_column(Text)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    user: Mapped["User"] = relationship(back_populates="dealbreakers")


class Listing(Base):
    __tablename__ = "listings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    external_id: Mapped[str | None] = mapped_column(String(64), unique=True, index=True)
    owner_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    type: Mapped[ListingType] = mapped_column(Enum(ListingType), nullable=False)
    title: Mapped[str] = mapped_column(String(160), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str | None] = mapped_column(String(80))
    cover_url: Mapped[str | None] = mapped_column(String(500))
    budget_min: Mapped[float | None] = mapped_column(Float)
    budget_max: Mapped[float | None] = mapped_column(Float)
    city: Mapped[str | None] = mapped_column(String(80))
    district: Mapped[str | None] = mapped_column(String(80))
    latitude: Mapped[float | None] = mapped_column(Float)
    longitude: Mapped[float | None] = mapped_column(Float)
    extras: Mapped[dict | None] = mapped_column(JSON)
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    owner: Mapped["User"] = relationship(back_populates="listings")


class Match(Base):
    __tablename__ = "matches"
    __table_args__ = (UniqueConstraint("listing_id", "candidate_id", name="uq_match_pair"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    listing_id: Mapped[int] = mapped_column(
        ForeignKey("listings.id", ondelete="CASCADE"), nullable=False
    )
    candidate_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    business_swipe: Mapped[bool | None] = mapped_column(Boolean)
    candidate_swipe: Mapped[bool | None] = mapped_column(Boolean)
    status: Mapped[MatchStatus] = mapped_column(
        Enum(MatchStatus), nullable=False, default=MatchStatus.PENDING
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )


class Negotiation(Base):
    __tablename__ = "negotiations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    match_id: Mapped[int] = mapped_column(
        ForeignKey("matches.id", ondelete="CASCADE"), nullable=False, index=True
    )
    user_a_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    user_b_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    status: Mapped[NegotiationStatus] = mapped_column(
        Enum(NegotiationStatus), nullable=False, default=NegotiationStatus.ACTIVE
    )
    current_round: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    max_rounds: Mapped[int] = mapped_column(Integer, default=10, nullable=False)
    last_proposed_terms: Mapped[dict | None] = mapped_column(JSON)
    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    ended_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    messages: Mapped[list["NegotiationMessage"]] = relationship(
        back_populates="negotiation",
        cascade="all, delete-orphan",
        order_by="NegotiationMessage.id",
    )
    agreement: Mapped["Agreement | None"] = relationship(
        back_populates="negotiation", uselist=False, cascade="all, delete-orphan"
    )


class NegotiationMessage(Base):
    __tablename__ = "negotiation_messages"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    negotiation_id: Mapped[int] = mapped_column(
        ForeignKey("negotiations.id", ondelete="CASCADE"), nullable=False, index=True
    )
    round: Mapped[int] = mapped_column(Integer, nullable=False)
    role: Mapped[MessageRole] = mapped_column(Enum(MessageRole), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    reasoning: Mapped[str | None] = mapped_column(Text)
    proposed_terms: Mapped[dict | None] = mapped_column(JSON)
    status_signal: Mapped[str | None] = mapped_column(String(32))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    negotiation: Mapped["Negotiation"] = relationship(back_populates="messages")


class Agreement(Base):
    __tablename__ = "agreements"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    negotiation_id: Mapped[int] = mapped_column(
        ForeignKey("negotiations.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    final_terms: Mapped[dict] = mapped_column(JSON, nullable=False)
    status: Mapped[AgreementStatus] = mapped_column(
        Enum(AgreementStatus), nullable=False, default=AgreementStatus.PROPOSED
    )
    accepted_by_a: Mapped[bool] = mapped_column(Boolean, default=False)
    accepted_by_b: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    negotiation: Mapped["Negotiation"] = relationship(back_populates="agreement")


class ProfileMemory(Base):
    __tablename__ = "profile_memory"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    related_negotiation_id: Mapped[int | None] = mapped_column(
        ForeignKey("negotiations.id", ondelete="SET NULL")
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    user: Mapped["User"] = relationship(back_populates="memories")


class BillingEvent(Base):
    __tablename__ = "billing_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    kind: Mapped[str] = mapped_column(String(32), nullable=False)
    amount_try: Mapped[float] = mapped_column(Float, nullable=False)
    metadata_json: Mapped[dict | None] = mapped_column("metadata", JSON)
    status: Mapped[str] = mapped_column(String(32), default="mock_paid", nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )


class InstagramPost(Base):
    __tablename__ = "instagram_posts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    external_id: Mapped[str | None] = mapped_column(String(64), unique=True, index=True)
    influencer_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    type: Mapped[str] = mapped_column(String(20), nullable=False, default="post")
    caption: Mapped[str | None] = mapped_column(Text)
    hashtags: Mapped[list | None] = mapped_column(JSON)
    mentioned_brands: Mapped[list | None] = mapped_column(JSON)
    location_tag: Mapped[str | None] = mapped_column(String(160))
    posted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    metrics: Mapped[dict | None] = mapped_column(JSON)

    influencer: Mapped["User"] = relationship(back_populates="posts")


class TaxonomyTerm(Base):
    __tablename__ = "taxonomy_terms"
    __table_args__ = (UniqueConstraint("kind", "code", name="uq_taxonomy_kind_code"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    kind: Mapped[str] = mapped_column(String(32), nullable=False, index=True)
    code: Mapped[str] = mapped_column(String(64), nullable=False)
    label: Mapped[str] = mapped_column(String(160), nullable=False)
    parent_code: Mapped[str | None] = mapped_column(String(64))


class Message(Base):
    __tablename__ = "messages"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    match_id: Mapped[int] = mapped_column(
        ForeignKey("matches.id", ondelete="CASCADE"), nullable=False, index=True
    )
    sender_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    content: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
