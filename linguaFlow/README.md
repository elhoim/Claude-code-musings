# LinguaFlow

A full-stack language learning application with spaced repetition, grammar graphs, interactive stories, and AI-powered feedback.

## Architecture

```
linguaFlow/
├── apps/
│   ├── mobile/          # Expo Router (React Native) — iOS/Android
│   ├── desktop/         # React Native Windows/macOS
│   └── admin/           # Admin dashboard (Next.js)
├── packages/
│   ├── shared/          # Types, Zod schemas, constants
│   ├── srs-engine/      # FSRS spaced-repetition algorithm
│   ├── ui/              # Shared UI theme tokens
│   ├── api-client/      # Typed HTTP client for all services
│   ├── eslint-config/   # Shared ESLint configuration
│   └── offline-sync/    # Offline-first sync engine (Phase 3)
├── services/
│   ├── api-gateway/     # Express reverse proxy + auth + rate limiting
│   ├── user-service/    # Auth (JWT), profiles, preferences
│   ├── lesson-service/  # Units, lessons, exercises, placement test
│   ├── srs-service/     # Flashcard decks, cards, review scheduling
│   ├── grammar-service/ # Grammar knowledge graph + user mastery
│   ├── story-service/   # Interactive graded readers with branching
│   ├── practice-service/# Speaking/writing drills + AI feedback
│   ├── ai-service/      # LLM integration (Claude) for feedback
│   ├── notification-service/ # Push notifications (Phase 3 stub)
│   ├── analytics-service/   # Learning analytics (Phase 3 stub)
│   ├── media-service/       # Audio/image assets (Phase 3 stub)
│   └── realtime-service/    # WebSocket events (Phase 3 stub)
└── infrastructure/
    └── docker/          # Docker Compose (Postgres + Redis)
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile | Expo + React Native + Expo Router |
| Desktop | React Native Windows/macOS |
| API Gateway | Express + http-proxy-middleware |
| Services | Express + Drizzle ORM + Zod |
| Database | PostgreSQL 16 (per-service DBs) |
| Cache | Redis 7 |
| SRS | FSRS 4.5 algorithm |
| AI | Anthropic Claude API |
| Monorepo | pnpm workspaces + Turborepo |

## Getting Started

### Prerequisites

- Node.js >= 20
- pnpm >= 9
- Docker & Docker Compose

### Setup

```bash
# Clone and install
cd linguaFlow
pnpm install

# Start infrastructure (Postgres + Redis)
pnpm docker:up

# Generate and run database migrations
pnpm turbo db:generate
pnpm turbo db:migrate

# Seed databases with Spanish A1 content
pnpm db:seed

# Start all services in development
pnpm dev
```

### Environment Variables

Copy `.env.example` to `.env` and update values:

```bash
cp .env.example .env
```

Key variables:
- `DATABASE_URL` — PostgreSQL connection string
- `REDIS_URL` — Redis connection string
- `JWT_SECRET` / `JWT_REFRESH_SECRET` — Auth secrets
- `ANTHROPIC_API_KEY` — Claude API key for AI feedback

### Service Ports (Development)

| Service | Port |
|---------|------|
| API Gateway | 3000 |
| User Service | 3001 |
| Lesson Service | 3002 |
| SRS Service | 3003 |
| Grammar Service | 3004 |
| Story Service | 3005 |
| Practice Service | 3006 |
| AI Service | 3007 |

## Seed Data

The project includes comprehensive Spanish A1 seed data:

- **Lesson Service**: 4 units, 20 lessons, 80+ exercises, 15 placement test questions
- **Grammar Service**: 16 grammar nodes with prerequisite edges forming a knowledge graph
- **Story Service**: 3 interactive stories with branching paths, vocabulary annotations, and writing prompts

Run seeds individually:
```bash
pnpm --filter @linguaflow/lesson-service db:seed
pnpm --filter @linguaflow/grammar-service db:seed
pnpm --filter @linguaflow/story-service db:seed
```

## Development

```bash
# Run all tests
pnpm test

# Lint
pnpm lint

# Type-check
pnpm typecheck

# Format code
pnpm format
```

## Phase Roadmap

- **Phase 1** (current): Foundation — monorepo scaffold, core services, mobile app, seed data
- **Phase 2**: Polish — comprehensive tests, error handling, CI/CD pipeline
- **Phase 3**: Scale — offline sync, notifications, analytics, media service, realtime events
