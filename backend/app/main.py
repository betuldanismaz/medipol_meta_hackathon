import logging
import os
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, SessionLocal, engine
from app.models import User
from app.routers import (
    auth,
    billing,
    discovery,
    health,
    listings,
    matches,
    messages,
    negotiations,
    public,
    stats,
    users,
)

logger = logging.getLogger(__name__)


def _auto_seed_if_empty() -> None:
    """If DB has zero users and output/ is mounted, run the seed script.

    Container-friendly: skipping silently if anything fails — never block startup.
    """
    db = SessionLocal()
    try:
        has_users = db.query(User).limit(1).first() is not None
        if has_users:
            return
    except Exception:
        return
    finally:
        db.close()

    candidates = [
        Path("/output"),
        Path(__file__).resolve().parents[2] / "output",
    ]
    output_dir = next((p for p in candidates if p.is_dir()), None)
    if output_dir is None:
        logger.info("Auto-seed skipped: output/ directory not found.")
        return
    import sys
    backend_dir = Path(__file__).resolve().parents[1]
    if str(backend_dir) not in sys.path:
        sys.path.insert(0, str(backend_dir))

    try:
        seed_module = __import__("scripts.seed_from_output", fromlist=["main"])
    except Exception as exc:  # noqa: BLE001
        logger.warning("Auto-seed: seed module import failed: %s", exc)
        return

    # Both signatures supported: run(output_dir) or main() with argv.
    if hasattr(seed_module, "run"):
        try:
            logger.info("Auto-seeding DB from %s (run) ...", output_dir)
            seed_module.run(output_dir)
            return
        except Exception as exc:  # noqa: BLE001
            logger.warning("Auto-seed run() failed: %s", exc)
    if hasattr(seed_module, "main"):
        try:
            logger.info("Auto-seeding DB from %s (main) ...", output_dir)
            original_argv = sys.argv
            sys.argv = ["seed", "--output-dir", str(output_dir)]
            try:
                seed_module.main()
            finally:
                sys.argv = original_argv
        except SystemExit:
            pass
        except Exception as exc:  # noqa: BLE001
            logger.warning("Auto-seed main() failed: %s", exc)


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    if os.getenv("AUTO_SEED", "1") != "0":
        _auto_seed_if_empty()
    yield


app = FastAPI(title="Medipol Meta Hackathon API", version="2.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(listings.router)
app.include_router(matches.router)
app.include_router(negotiations.router)
app.include_router(billing.router)
app.include_router(public.router)
app.include_router(discovery.router)
app.include_router(stats.router)
app.include_router(messages.router)


@app.get("/")
def root() -> dict[str, str]:
    return {"service": "medipol-meta-hackathon-api", "version": "2.0"}
