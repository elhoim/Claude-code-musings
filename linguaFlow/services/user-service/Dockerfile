FROM node:20-alpine AS base
RUN corepack enable

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
COPY packages/shared/package.json ./packages/shared/
COPY services/user-service/package.json ./services/user-service/
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile --filter @linguaflow/user-service...

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules
COPY --from=deps /app/services/user-service/node_modules ./services/user-service/node_modules
COPY tsconfig.base.json ./
COPY packages/shared/ ./packages/shared/
COPY services/user-service/ ./services/user-service/
RUN pnpm --filter @linguaflow/shared build && \
    pnpm --filter @linguaflow/user-service build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 appuser
COPY --from=builder --chown=appuser:nodejs /app/services/user-service/dist ./dist
COPY --from=builder --chown=appuser:nodejs /app/services/user-service/node_modules ./node_modules
COPY --from=builder --chown=appuser:nodejs /app/services/user-service/package.json ./
COPY --from=builder --chown=appuser:nodejs /app/packages/shared/dist ./node_modules/@linguaflow/shared/dist
COPY --from=builder --chown=appuser:nodejs /app/packages/shared/package.json ./node_modules/@linguaflow/shared/
USER appuser
EXPOSE 3001
CMD ["node", "dist/server.js"]
