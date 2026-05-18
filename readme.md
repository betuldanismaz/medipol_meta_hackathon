# InfluMatch

**AI-Powered Influencer-Business Collaboration Platform**

InfluMatch is an intelligent matching platform designed to connect local businesses and content creators through an intuitive, data-driven discovery experience. Leveraging machine learning and conversational AI, the platform automates influencer discovery, match scoring, and contract negotiation—solving a fundamental inefficiency in the creator economy.

## The Innovation

### 1. Intelligent Matching Engine

- **XGBoost-based ranking system** with 35 engineered features capturing influencer engagement patterns, audience demographics, business characteristics, and niche alignment
- **Bidirectional discovery** serving both businesses (finding ideal influencers for campaigns) and creators (discovering brand partnerships aligned with their profile)
- **Explainable match scores** providing transparent reasoning for each recommendation (audience overlap, engagement quality, location relevance, budget tier compatibility)

### 2. Swipe-Based Discovery Interface

- Intuitive card-based UI inspired by modern consumer experiences
- Async mutual-consent workflow: both parties must accept to create a match
- Real-time match feedback enabling rapid exploration of partnership opportunities

### 3. Autonomous AI Negotiation Agent

- **Optional AI-assisted negotiation** for premium users utilizing OpenAI's language models
- Structured agent-to-agent dialogue for contract terms discussion
- Fallback deterministic negotiation engine for graceful degradation
- WebSocket-enabled live negotiation UI for transparent AI-mediated collaboration discussions
- Agreement proposal generation with human takeover capabilities at any stage

## Technology Stack

### Frontend

- **Next.js** + **React** with **TypeScript** for type-safe, performant UI
- **Tailwind CSS** for responsive, accessible design system
- **Custom hooks** (`useNegotiationStream`) for real-time WebSocket integration
- Mock API layer enabling offline development and rapid prototyping

### Backend

- **FastAPI** with async/await for high-concurrency API endpoints
- **SQLAlchemy ORM** with automatic table generation for rapid MVP iteration
- **Pydantic** for request/response validation and OpenAPI documentation
- Modular router architecture (auth, users, listings, matches, negotiations, billing, discovery)

### Machine Learning & Ranking

- **XGBoost Regressor** (`objective='reg:squarederror'`) trained on synthetic-labeled collaboration pairs
- 35 feature extraction pipeline including:
  - Influencer metrics: follower count (log scale), engagement rate, post frequency, tier classification, verification status
  - Creator content: reel ratio, hashtag overlap, past collaboration count, language compatibility
  - Business data: company age, verified status, listing budget parameters, sector/niche alignment
  - Contextual signals: location distance, audience demographic alignment, budget tier matching, natural affinity scoring
- Feature-engineering pipeline in [backend/app/ml/](backend/app/ml/) with consistent training-to-inference semantics

### Data & Persistence

- **PostgreSQL** relational database with Docker Compose deployment
- Normalized schema supporting:
  - Multi-tier influencer profiles with engagement analytics
  - Business listings with campaign parameters and budget tiers
  - Swipe state and match history
  - Negotiation message threading with structured turn-based dialogue
  - Agreement records with signature/timestamp tracking

### Infrastructure

- **Docker & Docker Compose** for reproducible development and deployment environments
- Service containerization: frontend (Node.js), backend (Python/FastAPI), database (PostgreSQL)
- Railway deployment configuration for cloud scalability

## Repository Structure

```text
.
+-- backend/                 FastAPI application
│   +-- app/
│   │   +-- ml/             Feature extraction, ranking, model predictor
│   │   +-- routers/        API endpoint handlers
│   │   +-- services/       Business logic and domain operations
│   │   +-- models.py       SQLAlchemy ORM schemas
│   │   +-- schemas.py      Pydantic request/response models
│   +-- ml_artifacts/v1/   Trained XGBoost model and metadata
+-- frontend/               Next.js application
│   +-- app/               Pages and layouts
│   +-- components/        Reusable React components
│   +-- hooks/             Custom React hooks
│   +-- lib/              API client, utilities, authentication
+-- agents_team/           Role-specific team coordination guides
+-- output/               Synthetic training data and annotations
+-- docker-compose.yml    Multi-container orchestration
```

## Core Features

- **Discovery Flow:** Swipe-based card interface for browsing curated matches
- **Match Scoring:** ML-powered compatibility assessment with interpretable factors
- **Negotiation System:** AI-mediated or manual contract discussion workflow
- **Business Profiles:** Customizable business representation with budget, deliverables, and niche targeting
- **Creator Profiles:** Engagement analytics, audience demographics, past collaboration tracking
- **Agreement Management:** Structured contract proposal and acceptance tracking

## Problem Solved

The creator economy currently lacks systematic infrastructure for **small-to-medium businesses** seeking influencer partnerships. Existing solutions (Grin, Upfluence, AspireIQ) target only large-scale enterprises with significant budgets—creating a market gap for SMEs and local brands.

**InfluMatch** addresses this by:

1. **Automated Discovery:** Eliminating hours of manual Instagram research through intelligent ranking
2. **Transparent Matching:** Explainable scores build trust between both parties pre-negotiation
3. **Negotiation Efficiency:** AI agents reduce friction in contract discussion, accelerating deal closure
4. **Market Accessibility:** Democratizing influencer collaboration tools for businesses of all sizes

## Market Opportunity

The global influencer platform market is projected to grow from **$25.4B (2024)** to **$97.5B (2030)** at a **23.3% CAGR**. The emerging AI-powered negotiation segment is already a **$6.95B+ market** as of 2025. Turkey's influencer advertising market alone is expected to reach **$165M+ by 2030**, with significant capture opportunity in the underserved SME segment.

## Architecture Highlights

- **End-to-end ML pipeline:** Training infrastructure in Jupyter/Colab with model versioning and metadata tracking
- **Dual-direction ranking:** Single XGBoost model serves both business→influencer and influencer→business discovery
- **Real-time negotiation:** WebSocket-based agent dialogue with structured turn management
- **Production-ready patterns:** Pydantic validation, SQLAlchemy relationships, async API handlers, Docker containerization
