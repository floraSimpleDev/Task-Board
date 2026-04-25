# syntax=docker/dockerfile:1

# ---------- builder: Vite build (env baked in at build time) ----------
FROM node:24-alpine AS builder
WORKDIR /app
ENV HUSKY=0

# Vite env vars are embedded at build time; pass via --build-arg
ARG VITE_API_URL=http://localhost:3000
ARG VITE_AUTH0_DOMAIN=""
ARG VITE_AUTH0_CLIENT_ID=""
ARG VITE_AUTH0_AUDIENCE=""
ARG VITE_AUTH0_REDIRECT_URI=http://localhost/

ENV VITE_API_URL=$VITE_API_URL \
    VITE_AUTH0_DOMAIN=$VITE_AUTH0_DOMAIN \
    VITE_AUTH0_CLIENT_ID=$VITE_AUTH0_CLIENT_ID \
    VITE_AUTH0_AUDIENCE=$VITE_AUTH0_AUDIENCE \
    VITE_AUTH0_REDIRECT_URI=$VITE_AUTH0_REDIRECT_URI

COPY package.json package-lock.json ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

RUN npm ci --workspace=frontend --include-workspace-root

COPY frontend/ ./frontend/
RUN npm run build --workspace=frontend


# ---------- runtime: nginx serving static bundle ----------
FROM nginx:1.27-alpine AS runtime

COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/frontend/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1
