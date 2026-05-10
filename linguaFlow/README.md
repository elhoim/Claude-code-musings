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
│   └── offline-sync/    # Offline-first sync engine (Phase 3 stub)
├── services/
│   ├── api-gateway/         # Express reverse proxy + auth + rate limiting
│   ├── user-service/        # Auth (JWT), profiles, preferences
│   ├── lesson-service/      # Units, lessons, exercises, placement test
│   ├── srs-service/         # Flashcard decks, cards, review scheduling
│   ├── grammar-service/     # Grammar knowledge graph + user mastery
│   ├── story-service/       # Interactive graded readers with branching
│   ├── practice-service/    # Speaking/writing drills + AI feedback
│   ├── ai-service/          # LLM integration (Claude) for feedback
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
| SRS | FSRS algorithm |
| AI | Anthropic Claude API |
| Monorepo | pnpm workspaces + Turborepo |
| Tests | Vitest |

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

# Seed databases with all language content
pnpm db:seed

# Start all services in development
pnpm dev
```

### Environment Variables

Copy `.env.example` to `.env` and update values. Key variables:

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

## Language Coverage

The platform currently supports A1 content for **4 languages**:

| Language | Code | Lessons | Grammar Nodes | Stories | Placement |
|----------|------|---------|---------------|---------|-----------|
| Spanish | `es` | 4 units, 20 lessons, ~80 exercises | 16 nodes, 15 edges | 3 stories | 15 questions |
| French | `fr` | 4 units, 20 lessons, ~80 exercises | 16 nodes, 15 edges | 3 stories | 15 questions |
| Flemish/Dutch | `nl-BE` | 4 units, 20 lessons, ~80 exercises | 16 nodes, 15 edges | 3 stories | 15 questions |
| English | `en` | 4 units, 20 lessons, ~80 exercises | 16 nodes, 14 edges | 3 stories | 15 questions |

Each placement test contains 5 questions per CEFR level (A1, A2, B1).

### Seed Data Layout

Per language, content lives in three files:

- `services/lesson-service/src/db/seeds/{language}-a1-content.ts` — units, lessons, exercises, placement questions
- `services/grammar-service/src/db/seeds/{language}-a1-grammar.ts` — grammar nodes (uses shared `GrammarNodeSeed` from `grammar-seed-types.ts`)
- `services/story-service/src/db/seeds/{language}-a1-stories.ts` — interactive stories (uses shared `StorySeed` from `story-seed-types.ts`)

### Running Seeds

```bash
# All languages, all services
pnpm db:seed

# Per service
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

### Test Coverage

| Service | Test Files | Tests |
|---------|-----------|-------|
| Grammar | 4 (one per language) | 600 |
| Story | 4 (one per language) | 489 |
| Lesson seeds | 4 (one per language) | 836 |
| Lesson placement | 1 | 12 |
| Practice (prompt generator) | 1 | 45 |
| SRS engine (FSRS) | 1 | 18 |

Test files for seed data use parameterized factories in `__tests__/helpers/` to avoid duplication. Adding a new language requires only a 3-line test file.

## Phase Roadmap

- **Phase 1** (current): Foundation — monorepo scaffold, core services, mobile app, 4 languages of A1 seed data
- **Phase 2**: Polish — comprehensive service tests, error handling, CI/CD pipeline
- **Phase 3**: Scale — offline sync, notifications, analytics, media service, realtime events
