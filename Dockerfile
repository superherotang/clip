# Build stage
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* ./
RUN corepack enable pnpm && pnpm i --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Create data directory
RUN mkdir -p /app/data

# Generate Prisma Client
ENV DATABASE_URL="file:/app/data/dev.db"
RUN corepack enable pnpm && pnpm prisma generate

# Build Next.js
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL="file:/app/data/dev.db"
RUN corepack enable pnpm && pnpm build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL="file:/app/data/dev.db"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma

# Copy entrypoint script
COPY --chown=nextjs:nodejs docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Create data and uploads directories and set permissions AS ROOT
RUN mkdir -p /app/data /app/public/uploads && \
    chown -R nextjs:nodejs /app/data /app/public/uploads && \
    chmod -R 755 /app/data /app/public/uploads

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["node", "server.js"]
