#!/bin/bash
set -e

echo "🔧 Setting up LinguaFlow development environment..."

# Check prerequisites
command -v node >/dev/null 2>&1 || { echo "Node.js is required. Install from https://nodejs.org"; exit 1; }
command -v pnpm >/dev/null 2>&1 || { echo "pnpm is required. Run: npm install -g pnpm"; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "Docker is required. Install from https://docker.com"; exit 1; }

# Get script directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT"

echo "📦 Installing dependencies..."
pnpm install

echo "🐳 Starting databases..."
cd infrastructure/docker
docker compose up -d
cd "$PROJECT_ROOT"

echo "⏳ Waiting for PostgreSQL to be ready..."
until docker exec linguaflow-postgres pg_isready -U linguaflow >/dev/null 2>&1; do
  sleep 1
done

echo "📊 Running database migrations..."
pnpm --filter @linguaflow/user-service db:migrate 2>/dev/null || true
pnpm --filter @linguaflow/lesson-service db:migrate 2>/dev/null || true
pnpm --filter @linguaflow/srs-service db:migrate 2>/dev/null || true
pnpm --filter @linguaflow/grammar-service db:migrate 2>/dev/null || true
pnpm --filter @linguaflow/story-service db:migrate 2>/dev/null || true
pnpm --filter @linguaflow/practice-service db:migrate 2>/dev/null || true

echo "🌱 Seeding databases..."
pnpm --filter @linguaflow/lesson-service db:seed 2>/dev/null || true
pnpm --filter @linguaflow/grammar-service db:seed 2>/dev/null || true
pnpm --filter @linguaflow/story-service db:seed 2>/dev/null || true

# Copy .env if not exists
if [ ! -f .env ]; then
  cp .env.example .env
  echo "📝 Created .env from .env.example — please update with your API keys"
fi

echo ""
echo "✅ Setup complete! To start development:"
echo "   pnpm dev          — Start all services"
echo "   pnpm dev --filter @linguaflow/mobile  — Start mobile app only"
echo "   pnpm dev --filter @linguaflow/api-gateway  — Start API gateway only"
