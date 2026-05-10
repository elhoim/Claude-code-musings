# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Location

All code lives under `linguaFlow/`, not at the repository root. `cd linguaFlow` (or use `--filter` from the root) when running pnpm/turbo commands.

## Commands

All commands are run from `linguaFlow/`.

### Development

```bash
pnpm install                    # Install workspace dependencies
pnpm docker:up                  # Start Postgres + Redis (infrastructure/docker/docker-compose.yml)
pnpm docker:down                # Stop infrastructure
pnpm dev                        # Run all services + apps in dev mode (turbo)
pnpm --filter @linguaflow/<name> dev   # Run a single workspace, e.g. @linguaflow/grammar-service
```

### Database

```bash
pnpm turbo db:generate          # Drizzle Kit: generate migrations from schema.ts
pnpm turbo db:migrate           # Apply migrations (per-service DBs)
pnpm db:seed                    # Seed all 4 languages across lesson, grammar, story services
pnpm --filter @linguaflow/grammar-service db:seed   # Per-service seed
```

### Tests

Vitest is used everywhere. Run from a service directory or via filter:

```bash
cd linguaFlow/services/grammar-service && npx vitest run        # All tests in a service
npx vitest run __tests__/spanish-a1-grammar.test.ts             # Single file
npx vitest                                                       # Watch mode
pnpm --filter @linguaflow/grammar-service test                   # Via pnpm
```

**Known: `lesson-service/__tests__/placement.test.ts` requires a live Postgres connection** (it imports the Drizzle client at module load). It fails when run without `pnpm docker:up`. The 4 seed-data tests in the same service are pure data validation and pass without a DB.

### Build / Lint / Typecheck

```bash
pnpm build      # turbo build (depends on ^build)
pnpm lint       # turbo lint
pnpm typecheck  # turbo typecheck
pnpm format     # prettier write
```

## Architecture

### Monorepo layout

pnpm workspaces + Turborepo. Three workspace categories:

- `apps/` — `mobile` (Expo Router), `desktop` (RN Windows/macOS), `admin` (Next.js, stub)
- `packages/` — shared libraries: `shared` (types/Zod), `srs-engine` (FSRS), `ui`, `api-client`, `eslint-config`, `offline-sync` (stub)
- `services/` — 12 Express+Drizzle microservices, each owns its own Postgres database

### Service pattern

Every service follows the same layout:

```
src/
├── server.ts           # Express app entry; mounts routes, error handler
├── routes/             # Express routers with Zod validation
├── services/           # Business logic
├── db/
│   ├── client.ts       # Drizzle + postgres-js connection
│   ├── schema.ts       # Drizzle table definitions
│   └── seeds/          # Seed data + run-seed.ts
├── middleware/         # extract-user (reads X-User-Id from gateway), validate, error-handler
└── config/env.ts       # Loads + validates env vars
```

The **API gateway** (`services/api-gateway`) is a `http-proxy-middleware` reverse proxy. It validates JWTs, then forwards to backends with `X-User-Id` and `X-User-Email` headers. Downstream services trust those headers — they do not re-validate JWTs. **Do not expose downstream services to the internet directly.**

Service ports are documented in `linguaFlow/README.md`. Stub services (notification, analytics, media, realtime) only expose `/health`.

### Seed data structure

The 3 content services (lesson, grammar, story) seed 4 languages: `es`, `fr`, `nl-BE`, `en`.

**Shared types live in dedicated files** to avoid duplication:
- `services/grammar-service/src/db/seeds/grammar-seed-types.ts` — `GrammarNodeSeed` interface and `buildGrammarEdges` function
- `services/story-service/src/db/seeds/story-seed-types.ts` — `StorySegmentSeed`, `StorySeed` interfaces

Each language seed file imports from these shared modules. **Do not redefine these types locally** — the original duplication was removed in the simplify pass.

**Test factories** in `__tests__/helpers/`:
- `validate-grammar-seed.ts` — `describeGrammarSeedData(label, nodes)`
- `validate-story-seed.ts` — `describeStorySeedData(label, stories)`
- `validate-lesson-seed.ts` — `describeLessonSeedData(label, units, placement)`

Adding a new language to the platform = 3 seed files + 3 three-line test files + update the 3 `run-seed.ts` files. Always also add the language code to `packages/shared/src/constants/languages.ts` (`SUPPORTED_LANGUAGES` and `PHASE1_LANGUAGES`).

### Story seed: two-pass insert

`story-service/src/db/seeds/run-seed.ts` does a two-pass insert because segment choices reference other segments by `nextSegmentOrder`, which must be resolved to actual UUIDs. Pass 1 inserts segments with `choices: null` and builds an `orderToId` map. Pass 2 updates each segment's choices with resolved UUIDs. **Don't try to insert choices in pass 1** — the target segment IDs don't exist yet.

### SRS engine

`packages/srs-engine` implements FSRS (Free Spaced Repetition Scheduler). Pure-logic package, no I/O. Used by `srs-service` for scheduling. Has 18 tests covering scheduling, intervals, and difficulty/stability calculations.

### Mobile app

Expo Router with file-based routing under `apps/mobile/src/app/`:
- `(auth)/` — login/register
- `(onboarding)/` — language select, goal setting, placement
- `(tabs)/` — home, learn, review, practice, profile
- `lesson/[id].tsx`, `story/[id].tsx`, `grammar/[id].tsx` — detail screens

State is in Zustand stores under `src/stores/` (auth, learning, srs, practice). The `services/api.ts` is currently a placeholder — it does not yet call `@linguaflow/api-client`.

## Branch Policy

Development happens on the feature branch `claude/linguaflow-app-plan-JFmIc`. Push to that branch with `git push -u origin claude/linguaflow-app-plan-JFmIc`. Do **not** push to `main` or `master`.

## Repository scope

The GitHub MCP tools are restricted to `elhoim/claude-code-musings`. Do not attempt to interact with other repositories.
