from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine
from app.routers import (
    auth,
    billing,
    health,
    listings,
    matches,
    negotiations,
    users,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # MVP için: tabloları otomatik oluştur (Alembic v2'de eklenecek)
    Base.metadata.create_all(bind=engine)
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


@app.get("/")
def root() -> dict[str, str]:
    return {"service": "medipol-meta-hackathon-api", "version": "2.0"}
