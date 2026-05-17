"""Seed the Postgres database from the generated JSON files under ../output.

Usage (from repo root):

    # Inside docker (recommended — runs in backend container with DATABASE_URL set):
    docker compose run --rm backend python -m scripts.seed_from_output --reset

    # Or locally (requires DATABASE_URL pointing at a reachable Postgres):
    cd backend
    python -m scripts.seed_from_output --reset

Flags:
    --reset           Drop & recreate all seed-relevant tables before insert (idempotent).
    --output-dir PATH Override path to the JSON folder (default: ../output relative to repo root).
    --skip-posts      Skip instagram_posts (faster + smaller seed).

The script maps every JSON file we have a model for. Files without a matching
table (taxonomy.json, training_pairs.json) are intentionally skipped — they are
either reference metadata or ML feature snapshots, not domain rows.
"""
from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime
from pathlib import Path
from typing import Any

from sqlalchemy import delete

# Allow running as `python -m scripts.seed_from_output` or directly.
BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.database import Base, SessionLocal, engine  # noqa: E402
from app.models import (  # noqa: E402
    Agreement,
    AgreementStatus,
    BillingEvent,
    Dealbreakers,
    InstagramPost,
    Listing,
    ListingType,
    Match,
    MatchStatus,
    Negotiation,
    NegotiationMessage,
    NegotiationStatus,
    ProfileMemory,
    TaxonomyTerm,
    User,
    UserRole,
    UserTier,
)

# Use bcrypt directly — passlib 1.7.4 misbehaves with bcrypt >= 4.x during its
# self-probe (raises "password cannot be longer than 72 bytes" on a sentinel
# hash). The on-disk app still validates these with passlib at login time,
# which works fine for genuine hashes — only passlib's probe path is broken.
import bcrypt  # noqa: E402


def hash_password_bcrypt(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

DEFAULT_OUTPUT_DIR = BACKEND_DIR.parent / "output"
DEFAULT_PASSWORD = "password123"


# ---------------------------------------------------------------------------
# IO helpers
# ---------------------------------------------------------------------------
def load_json(path: Path) -> Any:
    if not path.exists():
        print(f"  [skip] {path.name} not found")
        return None
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def parse_dt(value: str | None) -> datetime | None:
    if not value:
        return None
    if value.endswith("Z"):
        value = value[:-1] + "+00:00"
    try:
        return datetime.fromisoformat(value)
    except ValueError:
        return None


def safe_email(external_id: str) -> str:
    # ".local"/".test"/".example" are special-use TLDs that pydantic's
    # email-validator rejects. ".app" is a real public TLD and passes.
    return f"{external_id.lower()}@seed.hackathon.app"


# ---------------------------------------------------------------------------
# Reset
# ---------------------------------------------------------------------------
def reset_tables(db) -> None:
    """Wipe all seed-touched tables in FK-safe order."""
    print("[reset] truncating seed tables…")
    db.execute(delete(BillingEvent))
    db.execute(delete(ProfileMemory))
    db.execute(delete(Agreement))
    db.execute(delete(NegotiationMessage))
    db.execute(delete(Negotiation))
    db.execute(delete(Match))
    db.execute(delete(Listing))
    db.execute(delete(Dealbreakers))
    db.execute(delete(User))
    db.commit()


# ---------------------------------------------------------------------------
# Loaders
# ---------------------------------------------------------------------------
def seed_users(
    db,
    influencers: list[dict],
    businesses: list[dict],
    agent_prefs: list[dict],
    posts: list[dict] | None,
) -> dict[str, int]:
    """Insert all users and return mapping external_id -> internal id."""
    password_hash = hash_password_bcrypt(DEFAULT_PASSWORD)
    prefs_by_user = {p["user_id"]: p["preferences"] for p in agent_prefs}

    posts_by_user: dict[str, list[dict]] = {}
    if posts:
        for post in posts:
            posts_by_user.setdefault(post["influencer_id"], []).append(post)

    id_map: dict[str, int] = {}

    for inf in influencers:
        ext_id = inf["id"]
        loc = inf.get("location") or {}
        profile: dict[str, Any] = {
            "external_id": ext_id,
            "username": inf.get("username"),
            "bio": inf.get("bio"),
            "tier": inf.get("tier"),
            "follower_count": inf.get("follower_count"),
            "following_count": inf.get("following_count"),
            "post_count": inf.get("post_count"),
            "verified": inf.get("verified"),
            "content_categories": inf.get("content_categories"),
            "content_styles": inf.get("content_styles"),
            "primary_language": inf.get("primary_language"),
            "audience_demographics": inf.get("audience_demographics"),
            "rate_range": inf.get("rate_range"),
            "engagement_rate": inf.get("engagement_rate"),
            "verification_status": inf.get("verification_status"),
            "profile_completion": inf.get("profile_completion"),
            "past_collaboration_count": inf.get("past_collaboration_count"),
            "last_active_at": inf.get("last_active_at"),
            "location": loc,
            "agent_preferences": prefs_by_user.get(ext_id),
            "recent_posts": posts_by_user.get(ext_id, []),
        }
        user = User(
            external_id=ext_id,
            email=safe_email(ext_id),
            password_hash=password_hash,
            display_name=inf.get("display_name") or ext_id,
            username=inf.get("username"),
            avatar_url=inf.get("avatar_url"),
            role=UserRole.INFLUENCER,
            tier=UserTier.FREE,
            agent_persona={
                "name": (inf.get("display_name") or ext_id).split()[0] + " Agent",
                "avatar": "default",
                "style": "balanced",
            },
            profile=profile,
            bio=inf.get("bio"),
            city=loc.get("city"),
            district=loc.get("district"),
            latitude=loc.get("lat"),
            longitude=loc.get("lng"),
            created_at=parse_dt(inf.get("account_created_at")) or datetime.utcnow(),
        )
        db.add(user)
        db.flush()
        id_map[ext_id] = user.id

    for biz in businesses:
        ext_id = biz["id"]
        loc = biz.get("location") or {}
        profile = {
            "external_id": ext_id,
            "sector_id": biz.get("sector_id"),
            "subcategory": biz.get("subcategory"),
            "description": biz.get("description"),
            "brand_style": biz.get("brand_style"),
            "brand_voice": biz.get("brand_voice"),
            "size": biz.get("size"),
            "business_age_months": biz.get("business_age_months"),
            "target_audience": biz.get("target_audience"),
            "verified": biz.get("verified"),
            "profile_completion": biz.get("profile_completion"),
            "past_collaboration_count": biz.get("past_collaboration_count"),
            "past_collaboration_categories": biz.get("past_collaboration_categories"),
            "location": loc,
            "agent_preferences": prefs_by_user.get(ext_id),
        }
        user = User(
            external_id=ext_id,
            email=safe_email(ext_id),
            password_hash=password_hash,
            display_name=biz.get("name") or ext_id,
            username=None,
            avatar_url=biz.get("avatar_url") or biz.get("cover_url"),
            role=UserRole.BUSINESS,
            tier=UserTier.FREE,
            agent_persona={
                "name": (biz.get("name") or ext_id) + " Agent",
                "avatar": "default",
                "style": "balanced",
            },
            profile=profile,
            bio=biz.get("description"),
            city=loc.get("city"),
            district=loc.get("district"),
            latitude=loc.get("lat"),
            longitude=loc.get("lng"),
            created_at=parse_dt(biz.get("created_at")) or datetime.utcnow(),
        )
        db.add(user)
        db.flush()
        id_map[ext_id] = user.id

    db.commit()
    print(
        f"[users] inserted {len(influencers)} influencers, "
        f"{len(businesses)} businesses (default password: {DEFAULT_PASSWORD!r})"
    )
    return id_map


def seed_listings(
    db, listings: list[dict], user_id_map: dict[str, int]
) -> dict[str, int]:
    id_map: dict[str, int] = {}
    skipped = 0
    for raw in listings:
        ext_id = raw["listing_id"]
        biz_ext = raw["business_id"]
        owner_id = user_id_map.get(biz_ext)
        if owner_id is None:
            skipped += 1
            continue

        budget = raw.get("budget") or {}
        extras = {
            "external_id": ext_id,
            "deliverables": raw.get("deliverables"),
            "preferred_tiers": raw.get("preferred_tiers"),
            "target_categories": raw.get("target_categories"),
            "preferred_audience": raw.get("preferred_audience"),
            "preferred_styles": raw.get("preferred_styles"),
            "deadline": raw.get("deadline"),
            "raw_status": raw.get("status"),
            "currency": budget.get("currency"),
        }
        # Inherit location from owning business profile if missing in listing
        biz_loc: dict[str, Any] = {}
        owner = db.get(User, owner_id)
        if owner and owner.profile:
            biz_loc = owner.profile.get("location") or {}

        listing = Listing(
            external_id=ext_id,
            owner_id=owner_id,
            type=ListingType.COLLAB,
            title=raw.get("title") or ext_id,
            description=raw.get("description") or "",
            category=(raw.get("target_categories") or [None])[0],
            cover_url=raw.get("cover_url"),
            budget_min=budget.get("min"),
            budget_max=budget.get("max"),
            city=biz_loc.get("city"),
            district=biz_loc.get("district"),
            latitude=biz_loc.get("lat"),
            longitude=biz_loc.get("lng"),
            extras=extras,
            active=(raw.get("status") not in {"expired", "closed", "cancelled"}),
            created_at=parse_dt(raw.get("created_at")) or datetime.utcnow(),
        )
        db.add(listing)
        db.flush()
        id_map[ext_id] = listing.id
    db.commit()
    print(f"[listings] inserted {len(id_map)} (skipped {skipped} with unknown business)")
    return id_map


_MATCH_STATUS_MAP = {
    "waiting_business": MatchStatus.PENDING,
    "waiting_candidate": MatchStatus.PENDING,
    "agent_negotiating": MatchStatus.MATCHED,
    "completed": MatchStatus.MATCHED,
    "rejected": MatchStatus.REJECTED,
    "cancelled": MatchStatus.REJECTED,
    "expired": MatchStatus.REJECTED,
}


def seed_matches(
    db,
    matches: list[dict],
    user_id_map: dict[str, int],
    listing_id_map: dict[str, int],
) -> dict[str, int]:
    id_map: dict[str, int] = {}
    skipped = 0
    for raw in matches:
        ext_id = raw["match_id"]
        listing_id = listing_id_map.get(raw["listing_id"])
        candidate_id = user_id_map.get(raw["influencer_id"])
        if listing_id is None or candidate_id is None:
            skipped += 1
            continue
        status = _MATCH_STATUS_MAP.get(raw.get("status"), MatchStatus.PENDING)
        match = Match(
            listing_id=listing_id,
            candidate_id=candidate_id,
            business_swipe=True,
            candidate_swipe=True,
            status=status,
            created_at=parse_dt(raw.get("matched_at")) or datetime.utcnow(),
        )
        db.add(match)
        db.flush()
        id_map[ext_id] = match.id
    db.commit()
    print(f"[matches] inserted {len(id_map)} (skipped {skipped} unresolved)")
    return id_map


def apply_swipes(
    db,
    swipes: list[dict],
    user_id_map: dict[str, int],
    listing_id_map: dict[str, int],
) -> None:
    """Create lightweight Match rows for swipes that don't already have one.

    Existing matches (created from matches.json) are left untouched.
    """
    existing: set[tuple[int, int]] = {
        (m.listing_id, m.candidate_id) for m in db.query(Match).all()
    }
    inserted = 0
    skipped = 0
    for raw in swipes:
        listing_id = listing_id_map.get(raw["listing_id"])
        user_id = user_id_map.get(raw["user_id"])
        if listing_id is None or user_id is None:
            skipped += 1
            continue
        if (listing_id, user_id) in existing:
            continue
        direction = raw.get("direction")
        candidate_swipe = direction == "right"
        match = Match(
            listing_id=listing_id,
            candidate_id=user_id,
            business_swipe=None,
            candidate_swipe=candidate_swipe,
            status=MatchStatus.PENDING if candidate_swipe else MatchStatus.REJECTED,
            created_at=parse_dt(raw.get("swiped_at")) or datetime.utcnow(),
        )
        db.add(match)
        existing.add((listing_id, user_id))
        inserted += 1
    db.commit()
    print(f"[swipes] inserted {inserted} new Match rows (skipped {skipped} unresolved)")


_AGREEMENT_STATUS_MAP = {
    "completed": AgreementStatus.CONFIRMED,
    "cancelled": AgreementStatus.REJECTED,
    "pending": AgreementStatus.PROPOSED,
    "agreed": AgreementStatus.CONFIRMED,
}


def seed_agreements(
    db,
    agreements: list[dict],
    match_id_map: dict[str, int],
) -> None:
    """For each agreement we create a stub Negotiation (FK requirement) and
    then attach the Agreement to it."""
    inserted = 0
    skipped = 0
    for raw in agreements:
        match_id = match_id_map.get(raw["match_id"])
        if match_id is None:
            skipped += 1
            continue
        match = db.get(Match, match_id)
        if match is None:
            skipped += 1
            continue
        # Need user_a / user_b for the Negotiation row.
        # candidate = the user that swiped; the other side is the listing owner.
        listing = db.get(Listing, match.listing_id)
        if listing is None:
            skipped += 1
            continue
        negotiation = Negotiation(
            match_id=match_id,
            user_a_id=listing.owner_id,
            user_b_id=match.candidate_id,
            status=NegotiationStatus.AGREED
            if raw.get("status") in {"completed", "agreed"}
            else NegotiationStatus.EXPIRED,
            current_round=raw.get("agent_negotiation_turns") or 0,
            max_rounds=max(raw.get("agent_negotiation_turns") or 10, 10),
            last_proposed_terms={
                "budget": raw.get("final_budget"),
                "deliverables": raw.get("final_deliverables"),
            },
            started_at=parse_dt(raw.get("agreed_at")) or datetime.utcnow(),
            ended_at=parse_dt(raw.get("completed_at")),
        )
        db.add(negotiation)
        db.flush()

        agreement = Agreement(
            negotiation_id=negotiation.id,
            final_terms={
                "external_id": raw.get("agreement_id"),
                "budget": raw.get("final_budget"),
                "deliverables": raw.get("final_deliverables"),
                "agent_negotiation_turns": raw.get("agent_negotiation_turns"),
                "agreed_at": raw.get("agreed_at"),
                "completed_at": raw.get("completed_at"),
                "raw_status": raw.get("status"),
            },
            status=_AGREEMENT_STATUS_MAP.get(
                raw.get("status"), AgreementStatus.PROPOSED
            ),
            accepted_by_a=raw.get("status") in {"completed", "agreed"},
            accepted_by_b=raw.get("status") in {"completed", "agreed"},
            created_at=parse_dt(raw.get("agreed_at")) or datetime.utcnow(),
        )
        db.add(agreement)
        inserted += 1
    db.commit()
    print(f"[agreements] inserted {inserted} (+ stub negotiations, skipped {skipped})")


def seed_taxonomy(db, taxonomy: dict | None) -> None:
    if not taxonomy:
        return
    kind_map = {
        "sectors": "sector",
        "categories": "category",
        "content_styles": "style",
        "positions": "position",
        "industries": "sector",
    }
    inserted = 0
    for source_key, kind in kind_map.items():
        items = taxonomy.get(source_key, []) or []
        for item in items:
            code = item.get("id") or item.get("code")
            if not code:
                continue
            term = (
                db.query(TaxonomyTerm)
                .filter(TaxonomyTerm.kind == kind, TaxonomyTerm.code == code)
                .one_or_none()
            )
            payload = dict(
                kind=kind,
                code=code,
                label=item.get("label") or item.get("name") or code,
                parent_code=item.get("parent_category")
                or item.get("parent_code")
                or item.get("parent"),
            )
            if term is None:
                term = TaxonomyTerm(**payload)
                db.add(term)
                inserted += 1
            else:
                for k, v in payload.items():
                    setattr(term, k, v)
    db.commit()
    print(f"[taxonomy] inserted {inserted} new terms")


def seed_instagram_posts(
    db, posts: list[dict] | None, user_id_map: dict[str, int]
) -> None:
    if not posts:
        return
    # Idempotent — clear existing rows for influencers we're about to repopulate.
    influencer_internal_ids = {
        user_id_map[ext]
        for ext in {p.get("influencer_id") for p in posts}
        if ext in user_id_map
    }
    if influencer_internal_ids:
        db.execute(
            delete(InstagramPost).where(
                InstagramPost.influencer_id.in_(influencer_internal_ids)
            )
        )
    inserted = 0
    skipped = 0
    for raw in posts:
        inf_int = user_id_map.get(raw.get("influencer_id"))
        if not inf_int:
            skipped += 1
            continue
        db.add(
            InstagramPost(
                external_id=raw.get("post_id"),
                influencer_id=inf_int,
                type=raw.get("type", "post"),
                caption=raw.get("caption"),
                hashtags=raw.get("hashtags", []),
                mentioned_brands=raw.get("mentioned_brands", []),
                location_tag=raw.get("location_tag"),
                posted_at=parse_dt(raw.get("posted_at")),
                metrics=raw.get("metrics", {}),
            )
        )
        inserted += 1
    db.commit()
    print(f"[posts] inserted {inserted} instagram posts (skipped {skipped} unresolved)")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--reset", action="store_true", help="Wipe seed tables first")
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=DEFAULT_OUTPUT_DIR,
        help=f"Override output dir (default: {DEFAULT_OUTPUT_DIR})",
    )
    parser.add_argument(
        "--skip-posts",
        action="store_true",
        help="Don't embed instagram_posts in user profiles",
    )
    args = parser.parse_args()

    out = args.output_dir.resolve()
    if not out.is_dir():
        sys.exit(f"output directory not found: {out}")
    print(f"[init] using output directory: {out}")

    print("[init] ensuring tables exist…")
    Base.metadata.create_all(bind=engine)

    influencers = load_json(out / "influencer_profiles.json") or []
    businesses = load_json(out / "business_profiles.json") or []
    agent_prefs = load_json(out / "agent_preferences.json") or []
    listings = load_json(out / "collab_listings.json") or []
    matches = load_json(out / "matches.json") or []
    swipes = load_json(out / "swipes.json") or []
    agreements = load_json(out / "agreements.json") or []
    posts = None if args.skip_posts else (load_json(out / "instagram_posts.json") or [])

    taxonomy = load_json(out / "taxonomy.json")
    if (out / "training_pairs.json").exists():
        print("[skip] training_pairs.json — ML features, no domain table")

    db = SessionLocal()
    try:
        if args.reset:
            reset_tables(db)

        seed_taxonomy(db, taxonomy)
        user_id_map = seed_users(db, influencers, businesses, agent_prefs, posts)
        seed_instagram_posts(db, posts, user_id_map)
        listing_id_map = seed_listings(db, listings, user_id_map)
        match_id_map = seed_matches(db, matches, user_id_map, listing_id_map)
        apply_swipes(db, swipes, user_id_map, listing_id_map)
        seed_agreements(db, agreements, match_id_map)
        print("[done] seed completed successfully")
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
