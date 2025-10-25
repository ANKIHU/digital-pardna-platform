# Multi-stage Dockerfile for Keeper Service
FROM node:18-alpine AS base
WORKDIR /app
RUN npm install -g pnpm

# Dependencies stage
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/keeper/package.json ./apps/keeper/
COPY packages/shared/package.json ./packages/shared/
RUN pnpm install --frozen-lockfile

# Build stage
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build:keeper

# Production stage
FROM base AS production
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/apps/keeper/dist ./apps/keeper/dist
COPY --from=build /app/apps/keeper/package.json ./apps/keeper/
COPY --from=build /app/package.json ./

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

# Create app user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
USER nodejs

# Health check (keeper service doesn't expose HTTP, so check process)
HEALTHCHECK --interval=60s --timeout=3s --start-period=10s --retries=3 \
  CMD pgrep -f "node.*keeper" || exit 1

CMD ["node", "apps/keeper/dist/index.js"]