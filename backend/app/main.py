from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine
from app.routers import health


@asynccontextmanager
async def lifespan(app: FastAPI):
    # TODO: replace with Alembic migrations before production
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title="Medipol Meta Hackathon API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)


@app.get("/")
def root() -> dict[str, str]:
    return {"service": "medipol-meta-hackathon-api"}
