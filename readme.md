# InfluMatch

InfluMatch is a Medipol Meta Hackathon MVP for matching local businesses with influencers. The product idea is a swipe-based discovery flow: businesses and influencers review profile cards, swipe right to apply, and receive an explainable match score for each potential collaboration.

## Project Status

This repository currently contains the project scaffold and health-check integration:

- Frontend: Next.js, React, TypeScript, Tailwind CSS
- Backend: FastAPI, SQLAlchemy, Pydantic
- Database: PostgreSQL through Docker Compose
- Current backend endpoints: `/` and `/health`
- Target MVP endpoints are documented below and in the team prompt files

## Repository Structure

```text
.
+-- backend/          FastAPI app, database setup, API routers
+-- frontend/         Next.js app
+-- agents_team/      Role-specific team instructions
+-- prompts/          Implementation prompts and coordination notes
+-- files/            Shared files/assets area
+-- docker-compose.yml
+-- .env.example
+-- GIT_REHBERI.md
```

## Requirements

- Docker and Docker Compose
- Node.js 20+ if running the frontend outside Docker
- Python 3.12+ if running the backend outside Docker

## Quick Start

Run the full stack with Docker:

```bash
docker compose up --build
```

Then open:

- Frontend: `http://localhost:3000`
- Backend root: `http://localhost:8000`
- Backend health: `http://localhost:8000/health`
- FastAPI docs: `http://localhost:8000/docs`
- PostgreSQL: `localhost:5432`

Stop the stack:

```bash
docker compose down
```

To also remove the local database volume:

```bash
docker compose down -v
```

## Environment

The Docker setup already provides default development environment values. To override them, copy `.env.example` to `.env` and add local values there.

Default service configuration:

```text
DATABASE_URL=postgresql://app:app@db:5432/app
CORS_ORIGINS=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8000
API_URL_INTERNAL=http://backend:8000
```

## Local Development Without Docker

Backend:

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

If the backend is not running inside Docker, set a reachable `DATABASE_URL` before starting FastAPI.

## Current API

### `GET /`

Returns the backend service identifier.

```json
{
  "service": "medipol-meta-hackathon-api"
}
```

### `GET /health`

Checks API and database connectivity.

```json
{
  "status": "ok",
  "db": "ok"
}
```

## Target MVP API Contract

The hackathon MVP is expected to grow toward this contract:

```text
GET  /api/profiles
POST /api/swipe
GET  /api/match-score?inf_id=inf_1&biz_id=biz_1
GET  /api/matches
```

Expected response shapes:

```json
[
  {
    "id": "inf_1",
    "name": "Ayse Kaya",
    "type": "influencer",
    "niche": "moda",
    "followers": 28000,
    "city": "Istanbul",
    "bio": "Sustainable fashion content",
    "avatar_url": null
  }
]
```

```json
{
  "match": true,
  "match_id": "match_abc123"
}
```

```json
{
  "score": 78,
  "reasons": [
    "Niche overlap is strong",
    "Follower tier is compatible",
    "Same city"
  ]
}
```

## Team Areas

- Backend lead: FastAPI routes, mock data service, swipe logic, match persistence
- Frontend infrastructure: Next.js setup, shared API helpers, types, routing
- Frontend UI: profile cards, swipe controls, match banner, matches page
- Matching logic: 0-100 compatibility score and explainable reasons
- Data and demo: mock profile data, pitch deck, demo scenario

Role-specific notes are in `agents_team/`. Implementation prompts are in `prompts/`.

## Useful Commands

```bash
# Check Git state
git status --short

# Start all services
docker compose up --build

# Rebuild only the frontend image
docker compose build frontend

# Rebuild only the backend image
docker compose build backend

# Follow backend logs
docker compose logs -f backend

# Follow frontend logs
docker compose logs -f frontend
```

## Notes

- The backend currently creates SQLAlchemy tables at startup for development convenience.
- Replace startup table creation with Alembic migrations before production.
- Keep secrets in `.env` or `.env.local`; do not commit API keys.
