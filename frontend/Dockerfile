# syntax=docker/dockerfile:1

# ---------- builder: Vite build (env baked in at build time) ----------
FROM node:24-alpine AS builder
WORKDIR /app
ENV HUSKY=0

# Vite env vars are embedded at build time; pass via --build-arg.
# VITE_API_URL is a relative path so nginx can proxy /api/* to the backend
# Service in any environment (docker-compose, kind, minikube, prod).
ARG VITE_API_URL=/api
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

# nginx's official entrypoint runs envsubst on every *.template file in
# /etc/nginx/templates and writes the result to /etc/nginx/conf.d at startup.
# NGINX_ENVSUBST_FILTER restricts substitution to BACKEND_URL so nginx-native
# variables like $host, $remote_addr, $scheme are left untouched.
ENV BACKEND_URL=http://backend:3000 \
    NGINX_ENVSUBST_FILTER=BACKEND_URL
COPY frontend/nginx.conf /etc/nginx/templates/default.conf.template
COPY --from=builder /app/frontend/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1
