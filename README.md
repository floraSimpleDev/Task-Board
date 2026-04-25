# Task-Board

Build a task board application where authenticated users create, organise, and track tasks across customisable columns.

---

## Tech stack

### Frontend

| Layer            | Choice                                               |
| ---------------- | ---------------------------------------------------- |
| Framework        | React 19                                             |
| Build / dev      | Vite 8                                               |
| Language         | TypeScript                                           |
| Styling          | Tailwind CSS 4 (`@tailwindcss/vite`)                 |
| UI primitives    | shadcn + Radix UI, `class-variance-authority`, `clsx`, `tailwind-merge` |
| Routing          | React Router 7                                       |
| Data fetching    | SWR                                                  |
| Validation       | Zod                                                  |
| Drag and drop    | `@dnd-kit/core`, `@dnd-kit/sortable`                 |
| Auth             | `@auth0/auth0-react` (SPA SDK)                       |
| Icons / fonts    | `lucide-react`, `@fontsource-variable/geist`         |
| Lint / format    | ESLint, Prettier (+ `prettier-plugin-tailwindcss`)   |

### Backend

| Layer            | Choice                                               |
| ---------------- | ---------------------------------------------------- |
| Runtime          | Node.js 24                                           |
| Framework        | Fastify 5                                            |
| Language         | TypeScript                                           |
| Schema / types   | TypeBox (`@sinclair/typebox`)                        |
| ORM / migrations | Drizzle ORM + `drizzle-kit`                          |
| Database driver  | `pg` (node-postgres)                                 |
| Database         | PostgreSQL 16                                        |
| Auth             | `@auth0/auth0-fastify-api` (JWT verification via JWKS) |
| CORS             | `@fastify/cors`                                      |
| API docs         | `@fastify/swagger`, `@fastify/swagger-ui`            |
| Dev runner       | `tsx` (`tsx watch --env-file-if-exists=.env`)        |
| Lint / format    | ESLint, Prettier                                     |

### Infra & tooling

| Layer            | Choice                                               |
| ---------------- | ---------------------------------------------------- |
| Containers       | Multi-stage Docker (Alpine bases)                    |
| Local DB         | docker-compose (`postgres:16-alpine`)                |
| Orchestration    | Kubernetes (kind primary, minikube supported)        |
| Static serving   | nginx (with envsubst-templated reverse proxy)        |
| Workspaces       | npm workspaces (frontend + backend)                  |
| Git hooks        | husky + lint-staged + commitlint (Conventional Commits) |

---

## Prerequisites

| Tool       | Version    | Purpose                                                |
| ---------- | ---------- | ------------------------------------------------------ |
| Node.js    | `>= 24`    | Enforced via `engines` + `engine-strict=true`          |
| npm        | `>= 10`    | Bundled with Node 24; the repo uses npm workspaces     |
| Docker     | latest     | Local Postgres (compose) and image builds for K8s      |
| `kubectl`  | latest     | K8s deploy path only                                   |
| `kind`     | latest     | K8s deploy path only — primary local cluster target    |
| `minikube` | optional   | Alternative local cluster                              |
| Auth0      | free tier  | One SPA Application + one API (see checklist below)    |

---

## Getting started

```bash
# 1. clone
git clone https://github.com/floraSimpleDev/Task-Board.git
cd Task-Board

# 2. install workspace deps (frontend + backend)
npm install

# 3. copy env templates
cp backend/.env.example backend/.env       # fill in DATABASE_URL + AUTH0_*
cp frontend/.env.example frontend/.env     # fill in VITE_AUTH0_* if present
```

`npm install` at the repo root installs both workspaces in one pass — there is no need to `cd backend && npm install` separately.

---

## Local development (docker-compose)

Run Postgres in Docker, run the dev servers on the host. Vite + Fastify hot-reload locally; only the database is containerized for dev.

```bash
# 1. start Postgres (matches DATABASE_URL in backend/.env.example)
docker compose up -d postgres

# 2. apply schema
npm run db:migrate -w backend

# 3. (optional) seed demo data
npm run db:seed -w backend

# 4. run dev servers in two terminals
npm run dev:backend     # http://localhost:3000
npm run dev:frontend    # http://localhost:5173
```

### Database tooling (Drizzle)

```bash
npm run db:generate -w backend   # generate SQL migration from schema changes
npm run db:migrate  -w backend   # apply pending migrations
npm run db:push     -w backend   # push schema directly (dev only — skips migration files)
npm run db:seed     -w backend   # idempotent demo data; only touches the seed user
npm run db:studio   -w backend   # Drizzle Studio UI at https://local.drizzle.studio
```

### Quality checks

The repo runs lint / type-check / format, you can run these in either frontend or backend:

```bash
npm run format           # prettier --write .
npm run lint:fix         # eslint . --fix
npm run type-check       # tsc -b --noEmit
```

Or run them in the root path of the monorepo like:

```bash
# from the repo root — runs against both workspaces
npm run lint:backend       
npm run lint:frontend
npm run type-check:backend 
npm run type-check:frontend
npm run format:backend
npm run format:frontend
```

---

## Kubernetes deployment (kind / minikube)

Everything lives under [k8s/](k8s/). The [k8s/manage.sh](k8s/manage.sh) script wraps every operation a reviewer needs.

### Cluster setup

In addition to the [top-level Prerequisites](#prerequisites), you need a running local cluster — **kind is the primary target**, minikube also works:

```bash
# kind (recommended)
kind create cluster --name task-board

# OR minikube
minikube start
```

### High-level architecture

- Frontend is the only public entry point (NodePort)
- Backend and Postgres are internal-only (ClusterIP)
- Frontend nginx proxies API requests to backend
- Database schema is managed via Kubernetes Jobs
- Secrets are generated dynamically at deploy time

### Request flow

```md
Browser
  ↓
http://localhost:30080
  ↓
frontend Service NodePort
  ↓
frontend Nginx pod
  ↓
/api/* proxy
  ↓
backend Service ClusterIP
  ↓
backend pod
  ↓
Postgres Service
  ↓
postgres StatefulSet pod
```

### One-time configuration

```bash
cp k8s/.env.example k8s/.env
# edit k8s/.env: set POSTGRES_PASSWORD, AUTH0_DOMAIN, AUTH0_AUDIENCE
```

`k8s/.env` is gitignored. The script generates the `postgres-credentials` and `backend-secrets` Secrets from this file at deploy time, so no credentials are ever committed.
Secrets are generated at deploy time from a local `.env` file and never stored in Git.  
This ensures sensitive data (DB password, Auth0 config) is not exposed in version control.

### Deploy

```bash
./k8s/manage.sh deploy
```

What this does:

1. Builds three local Docker images: `task-board-backend`, `task-board-backend-migrate` (builder stage of the same Dockerfile, used by the migration Job), `task-board-frontend`.
2. Loads them into the running cluster (auto-detects kind vs minikube).
3. Applies the namespace, generates Secrets from `k8s/.env`, applies Postgres → migration Job → backend → frontend in dependency order.
4. Waits for each rollout and the migration Job before returning.

The deploy is **idempotent** — re-running reconciles via `kubectl apply` and recreates Jobs (which are immutable in Kubernetes).

### Access the app

The frontend Service is `NodePort 30080`.

```bash
# kind: requires extraPortMappings on the cluster, OR use port-forward:
kubectl port-forward -n taskboard service/frontend 8080:80
# → http://localhost:8080

# minikube:
minikube service -n taskboard frontend
```

### Other commands

```bash
./k8s/manage.sh status              # pods, services, PVCs, jobs
./k8s/manage.sh logs backend        # tail backend logs
./k8s/manage.sh logs frontend       # tail nginx logs
./k8s/manage.sh logs postgres       # tail postgres logs
./k8s/manage.sh logs migrate        # last migration Job logs
./k8s/manage.sh logs seed           # last seed Job logs
./k8s/manage.sh migrate             # re-run migrations
./k8s/manage.sh seed                # load demo data (opt-in)
./k8s/manage.sh port-forward-db     # localhost:5432 → cluster postgres
./k8s/manage.sh teardown            # delete the namespace (drops all data)
```

---

## Auth0 configuration checklist

The backend verifies JWTs via Auth0's JWKS; the frontend uses the Auth0 SPA SDK. You need a free-tier Auth0 tenant with **one Application** and **one API**.

### Application (SPA)

- **Type:** Single Page Application
- **Allowed Callback URLs:** `http://localhost:30080, http://localhost:5173`
- **Allowed Logout URLs:** `http://localhost:30080, http://localhost:5173`
- **Allowed Web Origins:** `http://localhost:30080, http://localhost:5173`
- Copy `Domain` → `AUTH0_DOMAIN` (frontend `.env` and `k8s/.env`)
- Copy `Client ID` → `VITE_AUTH0_CLIENT_ID` (frontend `.env` only — used at build time)

### API

- **Identifier (audience):** any URL-shaped string, e.g. `https://task-board.local/api`
- Copy that value → `AUTH0_AUDIENCE` (`backend/.env` and `k8s/.env`)

### Frontend build-time vars

Vite embeds env vars at build time. For the K8s image, pass them as `--build-arg` (the [frontend/Dockerfile](frontend/Dockerfile) declares `VITE_AUTH0_*` ARGs). For local dev, put them in `frontend/.env`.

---

## Architecture decisions

### Frontend nginx proxies `/api/*` to the backend Service

The browser only talks to the frontend NodePort. The frontend's nginx proxies `/api/*` → `http://backend.taskboard.svc.cluster.local:3000` via the standard envsubst template mechanism (`BACKEND_URL` env var).

**Why:** avoids installing an ingress controller in kind, avoids CORS preflight in production, and avoids baking a backend hostname into the Vite bundle at build time. The same image works in `docker-compose` (`BACKEND_URL=http://backend:3000`) and Kubernetes.

**Tradeoff:** introduces an extra hop. For a take-home this is fine; in production you'd use an ingress controller with two rules.

### Seed Job
The seed job only operates on a dedicated demo user (`auth_sub = seed|demo-user`) and does not affect real Auth0 users.

### Migration Job reuses the backend Dockerfile's builder stage

The runtime image is stripped to prod deps + compiled JS. To run `drizzle-kit migrate`, we need dev deps and the migration SQL files — both already present in the existing `builder` stage. Building with `--target builder` produces the migration image without a duplicate Dockerfile.

**Why:** one Dockerfile, two purposes. No drift between what runs migrations and what runs the app.

**Tradeoff:** the migration image is larger than necessary (full source tree + dev deps). Acceptable since it never runs in prod traffic — only as a Job. This ensures the database schema is always up-to-date before the backend starts serving traffic.

### Postgres in-cluster (StatefulSet + PVC, single replica)

Per the brief: in-cluster Postgres is fine. Single replica with a 1Gi PVC. Headless `Service` for stable DNS. StatefulSet is used instead of Deployment because Postgres requires stable storage and identity.

**Why:** simplest possible setup for a take-home. No operators, no replication.

**Tradeoff:** no HA, no automated backups, no point-in-time recovery. Fine for review; production would use a managed DB or a real operator (Zalando, CloudNativePG).

### Secrets from gitignored `k8s/.env`, generated at deploy time

`manage.sh` runs `kubectl create secret --dry-run=client -o yaml | kubectl apply -f -`. The `--dry-run=client` flag turns the imperative `create secret` into a declarative manifest that `apply` reconciles — first run creates, subsequent runs patch.

**Why:** no committed secrets, no plaintext in git, idempotent.

**Tradeoff:** secrets aren't versioned alongside manifests. For a real cluster you'd use SealedSecrets, External Secrets Operator, or SOPS — but the brief says no operators.

### NodePort instead of Ingress

Frontend is exposed via NodePort 30080. Backend stays ClusterIP.

**Why:** ingress controllers are extra moving parts and per-cluster setup (`kind` needs `extraPortMappings`; minikube has an addon). Nodeport works on both with zero install.

**Tradeoff:** NodePort is unrealistic for production. With more time: an `Ingress` resource + `ingress-nginx` install step in `manage.sh deploy`.

### Why no Ingress?

We intentionally avoid an Ingress controller to keep the local setup minimal and reproducible:

- kind requires extraPortMappings for ingress
- minikube requires enabling an addon
- both add non-trivial setup overhead

Instead, the frontend nginx acts as a reverse proxy for `/api/*`, making the frontend the single public entry point.

### Probes

- **Backend** — `GET /health` for both liveness and readiness. Single endpoint is fine for a small service; in production you'd split (`/health/live` for "process responsive", `/health/ready` for "DB reachable").
- **Postgres** — `pg_isready` exec probe. Standard.
- **Frontend** — `GET /` (nginx).
- Probes ensure Kubernetes only routes traffic to healthy pods and automatically restarts crashed containers.

### Service exposure

- frontend → exposed via NodePort (public entry)
- backend → ClusterIP (internal only)
- postgres → ClusterIP (internal only)

---

## What I'd improve given more time

- **Split health endpoints.** Backend `/health/ready` should check the DB connection so the readiness probe drains pods that have lost their DB connection. Liveness should stay process-only.
- **Ingress over NodePort.** Add `ingress-nginx` install to `manage.sh deploy` (or document a pre-step), expose the app at a single hostname with TLS via cert-manager.
- **External secrets.** Replace the `kubectl create secret` shell pattern with SealedSecrets or the External Secrets Operator backed by Vault / Doppler / 1Password.
- **HA for the API.** Bump backend `replicas` to 2+, add a `PodDisruptionBudget`, set `topologySpreadConstraints` to spread across nodes.
- **Observability.** OpenTelemetry SDK in the backend, Prometheus + Grafana via Helm, structured-log shipping. Right now we have `kubectl logs` and that's it.
- **Backups.** WAL archiving for Postgres + a CronJob doing logical dumps to object storage.
- **CI.** A GitHub Actions pipeline running `lint`, `type-check`, `build`, plus `kind`-in-CI doing a smoke deploy on every PR. The brief excluded CI from scope, but it's the obvious next step.
- **Frontend Auth0 wiring** — currently the SPA build-time vars (`VITE_AUTH0_*`) need manual `--build-arg` plumbing in the deploy script. A short `frontend/.env.k8s` with a documented build step would be cleaner.
