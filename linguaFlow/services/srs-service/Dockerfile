FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json ./
RUN npm install --production=false

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY package.json tsconfig.json ./
COPY src ./src
RUN npx tsc

FROM base AS production
ENV NODE_ENV=production
COPY package.json ./
RUN npm install --production
COPY --from=build /app/dist ./dist

EXPOSE 3003

USER node

CMD ["node", "dist/server.js"]
