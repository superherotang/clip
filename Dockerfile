# Build stage
FROM node:24-alpine AS base
WORKDIR /app

# Install dependencies
COPY package.json pnpm-lock.yaml* ./
RUN corepack enable pnpm && pnpm i --frozen-lockfile

# Copy source files
COPY . .

# Fix Prisma 7 schema - remove url from datasource block
RUN awk '/datasource db/{p=1} p&&/}/{p=0; print "datasource db {\n  provider = \"sqlite\"\n}"; next} !p{print}' prisma/schema.prisma > prisma/schema.prisma.tmp && \
    mv prisma/schema.prisma.tmp prisma/schema.prisma

# Generate Prisma Client
RUN corepack enable pnpm && pnpm prisma generate

# Build Next.js
ENV NEXT_TELEMETRY_DISABLED=1
RUN corepack enable pnpm && pnpm build

# Production stage
FROM node:24-alpine
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=base --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=base --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=base --chown=nextjs:nodejs /app/public ./public
COPY --from=base --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=base /app/package.json ./package.json

# Create data directory
RUN mkdir -p /app/data && chown -R nextjs:nodejs /app/data

USER nextjs
EXPOSE 3000

ENTRYPOINT ["node", "server.js"]
