# ── Stage 1: Build ─────────────────────────────────────────────
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@9 --activate

WORKDIR /app

# Copy workspace root files
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY shared/package.json shared/
COPY backend/package.json backend/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source
COPY shared/ shared/
COPY backend/ backend/

# Generate Prisma client + build
RUN pnpm --filter backend db:generate
RUN pnpm --filter shared build
RUN pnpm --filter backend build

# ── Stage 2: Production ───────────────────────────────────────
FROM node:20-alpine AS runner

RUN corepack enable && corepack prepare pnpm@9 --activate

WORKDIR /app

ENV NODE_ENV=production

# Copy built artifacts + node_modules
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/node_modules ./backend/node_modules
COPY --from=builder /app/backend/package.json ./backend/package.json
COPY --from=builder /app/backend/prisma ./backend/prisma
COPY --from=builder /app/shared ./shared

# Non-root user for security
RUN addgroup -g 1001 -S appgroup && adduser -S appuser -u 1001
USER appuser

EXPOSE 3001

WORKDIR /app/backend

CMD ["node", "dist/index.js"]
