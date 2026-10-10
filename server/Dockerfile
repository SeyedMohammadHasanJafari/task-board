# Multi-stage Dockerfile for Task Board Server (Express + Socket.io + Yjs)

# Stage 1: Build TypeScript
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package*.json tsconfig.json ./

# Install all dependencies including devDependencies for build
RUN npm ci

# Copy server source code
COPY src/ ./src/

# Compile TypeScript
RUN npm run build

# Remove development dependencies to keep production footprint minimal
RUN npm prune --production

# -------------------------------------------------------------
# Stage 2: Production Minimal Runtime
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Install dumb-init or curl for container health check
RUN apk add --no-cache curl

# Create non-root user for security
USER node

# Copy production artifacts from builder
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/dist ./dist
COPY --chown=node:node --from=builder /app/package.json ./package.json

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

CMD ["node", "dist/index.js"]
