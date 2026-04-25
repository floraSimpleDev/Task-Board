# Task-Board

Build a task board application where authenticated users create, organise, and track tasks across customisable columns.

---

## Getting started

You could start the project manually or use Makefile

### Start with Makefile (recommended)

The repo ships a [Makefile](Makefile) that wraps every common workflow. Run `make` (no args) to print the full list of targets with descriptions.

```bash
# 1. one-shot onboarding: installs deps and copies env templates
make setup

# 2. edit backend/.env and frontend/.env (DATABASE_URL, AUTH0_*, etc.)

# 3. start Postgres + both dev servers (Ctrl-C kills both)
make dev
```

`make dev` brings up Postgres via docker-compose and runs the backend (`:3000`) and frontend (`:5173`) dev servers in parallel. The first run won't have a schema yet — run `make migrate` in another terminal, then optionally `make seed` for demo data.

---

### Manual start

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


### Local development (docker-compose)

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

cd backend
npm run db:studio                # Drizzle Studio UI at https://local.drizzle.studio
```

---

### API docs (Swagger UI)

The Fastify server exposes interactive API documentation while running in dev. With `npm run dev:backend` up, open:

```
http://localhost:3000/docs
```

The page lists every endpoint, the TypeBox-derived request/response schemas, and lets you fire authenticated requests against the running API (paste a Bearer JWT into the "Authorize" dialog at the top — get one from your browser's dev tools after signing in via Auth0 in the SPA, or via Auth0's "Test" tab).

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

### High-level architecture

- Frontend is the only public entry point (NodePort)
- Backend and Postgres are internal-only (ClusterIP)
- Frontend nginx proxies API requests to backend
- Database schema is managed via Kubernetes Jobs
- Secrets are generated dynamically at deploy time

### Request flow

```txt
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
# edit k8s/.env: set POSTGRES_PASSWORD, AUTH0_DOMAIN, AUTH0_AUDIENCE,
# AUTH0_CLIENT_ID, and AUTH0_REDIRECT_URI
```

`k8s/.env` is gitignored. The script generates the `postgres-credentials` and `backend-secrets` Secrets from this file at deploy time, so no credentials are ever committed.
Secrets are generated at deploy time from a local `.env` file and never stored in Git.  
This ensures sensitive data (DB password, Auth0 config) is not exposed in version control.

---

## Data model

```
users (1) ──< boards (1) ──< board_columns (1) ──< tasks
```

| Relationship                  | FK                          | onDelete  |
| ----------------------------- | --------------------------- | --------- |
| `boards.user_id`              | → `users.id`                | `CASCADE` |
| `board_columns.board_id`      | → `boards.id`               | `CASCADE` |
| `tasks.board_column_id`       | → `board_columns.id`        | `CASCADE` |

### What happens when a column containing tasks is deleted

Deleting a column **also deletes every task in that column**. Postgres enforces this at the database level via `ON DELETE CASCADE` on `tasks.board_column_id` — there is no application-layer cleanup, no soft-delete, and no orphaned-task possibility. The same rule chains upward: deleting a board cascade-deletes its columns, which in turn cascade-delete their tasks; deleting a user cascade-deletes everything they own.

**Why cascade and not restrict / soft-delete:**

- **Simpler invariants.** No code path can leave orphaned tasks — the schema makes the bad state unrepresentable.
- **Matches user intent.** When a user clicks "delete column", they expect the tasks to go with it; surfacing a "column has tasks, refuse" error would be poor UX for a personal kanban.
- **Tradeoff:** destructive and irreversible. A real product would want soft-delete + an "Undo" toast or a 30-day recovery window. For this scope, hard cascade is the honest choice.

### Indexes & constraints worth knowing

- `boards_user_id_index` — every per-user board lookup hits an index.
- `board_columns_board_id_position_key` — `UNIQUE(board_id, position)` prevents two columns at the same position.
- `tasks_board_column_id_position_index` — composite index on `(board_column_id, position)` powers the ordered-task query in [getMyBoardWithColumns](backend/src/repositories/getMyBoardWithColumns/getMyBoardWithColumns.ts).
- Task `position` is `numeric(20, 10)` — fractional indexing, so inserting between two tasks is `O(1)` (compute midpoint) rather than rewriting every position after the insertion point.

### Non-trivial queries

Two queries that go beyond simple CRUD:

**1. Nested ordered fetch — [`getMyBoardWithColumns`](backend/src/repositories/getMyBoardWithColumns/getMyBoardWithColumns.ts)**

Loads a board, all its columns ordered by `position`, and all tasks in each column ordered by `position`, scoped to the requesting `userId` — in a **single round-trip** via Drizzle's relational `with:` API:

```ts
database.query.boards.findFirst({
  where: and(eq(boards.id, boardId), eq(boards.userId, userId)),
  with: {
    columns: {
      orderBy: asc(boardColumns.position),
      with: { tasks: { orderBy: asc(tasks.position) } },
    },
  },
})
```

Why it matters: the naive implementation is `N+1` (one query per column to fetch its tasks). The relational form lets Drizzle emit a single SQL statement that joins + aggregates, and the `tasks_board_column_id_position_index` keeps the ordered fetch cheap.

**2. Deferred-constraint position swap — [`reorderColumns`](backend/src/repositories/reorderColumns/reorderColumns.ts)**

Reordering columns has to update multiple `position` values at once. With a naive `UPDATE`, two rows would briefly share the same `position`, violating the `UNIQUE(board_id, position)` constraint. The repository uses Postgres's deferred-constraint feature inside a transaction:

```ts
await transaction.execute(sql`SET CONSTRAINTS "board_columns_board_id_position_key" DEFERRED`)
// ...UPDATEs that produce transiently-duplicate positions...
// constraint is re-checked at COMMIT — by then positions are unique again
```

Why it matters: avoids the alternatives (deleting + reinserting, or moving rows through a "parking" position), preserves the unique constraint, and keeps the operation atomic. Demonstrates a Postgres-specific feature (`SET CONSTRAINTS ... DEFERRED`) that most ORMs don't expose without escape hatches.

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

Vite embeds env vars at build time. For local dev, put them in `frontend/.env`. For the K8s deploy, [k8s/manage.sh](k8s/manage.sh) reads `AUTH0_DOMAIN`, `AUTH0_AUDIENCE`, `AUTH0_CLIENT_ID`, and `AUTH0_REDIRECT_URI` from `k8s/.env` and passes them through as `--build-arg VITE_AUTH0_*=...` when building the frontend image — same source of truth for both paths.

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
- **Auth0 callback URLs.** Currently the K8s deploy assumes `http://localhost:8080/` (port-forward target) is added to the Auth0 Application's Allowed Callback URLs. A more polished setup would either auto-detect or document a Helm-style values file per environment.
