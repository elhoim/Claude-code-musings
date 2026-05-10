#!/bin/bash
set -e

echo "🌱 Seeding LinguaFlow databases..."

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT"

# Verify PostgreSQL is running
if ! docker exec linguaflow-postgres pg_isready -U linguaflow >/dev/null 2>&1; then
  echo "Error: PostgreSQL is not running. Start it with:"
  echo "  cd infrastructure/docker && docker compose up -d"
  exit 1
fi

echo "📚 Seeding lesson content (Spanish A1)..."
pnpm --filter @linguaflow/lesson-service db:seed 2>/dev/null || echo "  ⚠️  Lesson seed skipped"

echo "🧬 Seeding grammar graph (Spanish A1/A2)..."
pnpm --filter @linguaflow/grammar-service db:seed 2>/dev/null || echo "  ⚠️  Grammar seed skipped"

echo "📖 Seeding stories (Spanish A1)..."
pnpm --filter @linguaflow/story-service db:seed 2>/dev/null || echo "  ⚠️  Story seed skipped"

echo ""
echo "✅ Database seeding complete!"
