# Multi-stage build for Next.js frontend
FROM node:20-alpine AS base

# Install dependencies stage
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci

# Build stage
FROM base AS builder
WORKDIR /app

# Accept build argument for API URL
# Railway automatically passes environment variables as build args
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Verify the variable is set during build (for debugging)
RUN if [ -z "$NEXT_PUBLIC_API_URL" ]; then \
      echo "⚠️ WARNING: NEXT_PUBLIC_API_URL is not set during build!"; \
    else \
      echo "✓ NEXT_PUBLIC_API_URL is set: $NEXT_PUBLIC_API_URL"; \
    fi

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build Next.js app (NEXT_PUBLIC_* vars are embedded at build time)
RUN npm run build

# Production stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Copy public directory (created during build if needed)
COPY --from=builder /app/public ./public

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]

