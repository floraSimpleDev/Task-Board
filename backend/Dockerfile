# syntax=docker/dockerfile:1

# ---------- builder: install all deps + compile TS ----------
FROM node:24-alpine AS builder
WORKDIR /app
ENV HUSKY=0

COPY package.json package-lock.json ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

RUN npm ci --workspace=backend --include-workspace-root

COPY backend/ ./backend/
RUN npm run build --workspace=backend


# ---------- prod-deps: only runtime deps ----------
FROM node:24-alpine AS prod-deps
WORKDIR /app
ENV HUSKY=0

COPY package.json package-lock.json ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

RUN npm ci --workspace=backend --include-workspace-root --omit=dev \
  && npm cache clean --force


# ---------- runtime ----------
FROM node:24-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app/backend

COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=builder /app/backend/dist ./dist
COPY backend/package.json ./

RUN addgroup -S nodejs && adduser -S nodejs -G nodejs && chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["node", "dist/server.js"]
