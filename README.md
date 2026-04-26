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
users (1) ──< boards (1) ──< board_columns (1) ──< tasks (1) ──< task_activities
                                                                       │
                                                       users (1) ──────┘  (actor, nullable)
```

| Relationship                  | FK                          | onDelete   |
| ----------------------------- | --------------------------- | ---------- |
| `boards.user_id`              | → `users.id`                | `CASCADE`  |
| `board_columns.board_id`      | → `boards.id`               | `CASCADE`  |
| `tasks.board_column_id`       | → `board_columns.id`        | `CASCADE`  |
| `task_activities.task_id`     | → `tasks.id`                | `CASCADE`  |
| `task_activities.actor_id`    | → `users.id`                | `SET NULL` |

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
- `task_activities_task_id_created_at_index` — composite index on `(task_id, created_at)` powers the timeline query (filter by task, order by time).
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

## Admin dashboard (permission-gated)

The brief asks for "at least one route with role or permission-based access." This grew into a full admin surface — stats overview plus drill-down tables for users, boards, tasks, and activities — all gated by a single Auth0 permission.

### Surface

| Route                 | Page                                                                    | Backend endpoint        | Pagination | Notes                                                                          |
| --------------------- | ----------------------------------------------------------------------- | ----------------------- | ---------- | ------------------------------------------------------------------------------ |
| `/admin`              | [AdminStatsPage](frontend/src/pages/AdminStatsPage/AdminStatsPage.tsx)              | `GET /admin/stats`       | n/a        | Four count cards (users, boards, tasks, activities); cards link to drill-downs |
| `/admin/users`        | [AdminUsersPage](frontend/src/pages/AdminUsersPage/AdminUsersPage.tsx)              | `GET /admin/users`       | none       | Flat list: name, email, joined                                                 |
| `/admin/boards`       | [AdminBoardsPage](frontend/src/pages/AdminBoardsPage/AdminBoardsPage.tsx)            | `GET /admin/boards`      | none       | Flat list with denormalized owner (name + email)                               |
| `/admin/tasks`        | [AdminTasksPage](frontend/src/pages/AdminTasksPage/AdminTasksPage.tsx)              | `GET /admin/tasks`       | cursor     | Title, board, owner, priority, created                                         |
| `/admin/activities`   | [AdminActivitiesPage](frontend/src/pages/AdminActivitiesPage/AdminActivitiesPage.tsx) | `GET /admin/activities`  | cursor     | Action, task + board, actor, summary, when                                     |

All five endpoints share the same gate: [`requirePermission('read:admin-stats')`](backend/src/middlewares/requirePermission/requirePermission.ts) — a Fastify `preHandler` that reads the `permissions` array from the verified access-token claims and returns `403 Forbidden` if missing.

### Why permission-based, not role-based

Auth0 RBAC normalizes roles into a flat permissions array on the token. Checking `permissions.includes('read:admin-stats')` is one line and works whether the user got the permission via a role assignment or a direct grant — the API doesn't care which.

### Cursor pagination (tasks + activities)

The two high-cardinality lists (tasks, activities) use **opaque cursor pagination** instead of offset/page numbers:

- **Cursor format:** base64-encoded `{ createdAt, id }`. Generated and validated at the API boundary via [cursorPagination.ts](backend/src/lib/cursorPagination/cursorPagination.ts) using a TypeBox schema for runtime validation.
- **Stable ordering:** rows are ordered by `(createdAt DESC, id DESC)`. The `id` tie-breaker matters when two rows share a `createdAt` (e.g. a batch insert).
- **Cursor predicate:** `WHERE (createdAt < c.createdAt) OR (createdAt = c.createdAt AND id < c.id)` — keyset pagination, index-friendly, no `OFFSET` scan.
- **"Has next" detection:** the route fetches `limit + 1` rows; if the slice is over-full, the last item is dropped from the response and its `(createdAt, id)` becomes the next cursor.
- **Query params:** `?cursor=<opaque>&limit=<n>` validated by the shared [adminCursorQuerySchema](backend/src/types/admin/adminCursorQuerySchema/adminCursorQuerySchema.ts) (limit 1–100, default 25).
- **Frontend:** [`useSWRInfinite`](https://swr.vercel.app/docs/pagination) wraps each page; the page exposes `tasks`/`activities`, `hasMore`, `loadMore`, and `isLoadingMore`. A page-level "Load more" button below the table appends results in place — no full-page refetch on next-page.
- **Why opaque base64 over `?createdAtBefore=&idBefore=`:** the client never constructs cursors; the API alone defines what a cursor *means* and can change the encoding (add fields, switch ordering) without breaking clients. Internally documented as `{ createdAt, id }` for debugging.

### Shared infrastructure

To keep the four list pages consistent and avoid drift:

- **[`DataTable`](frontend/src/pages/components/DataTable/DataTable.tsx)** — wrapper + table + thead shell shared by all four admin lists. Each page passes `headers` and renders its own `<tr>` rows, which keeps cell formatting (multi-line owner, plain priority, relative timestamps) decoupled from the table chrome.
- **[`renderActivitySummary`](frontend/src/utils/renderActivitySummary/renderActivitySummary.ts)** — formats `created` / `updated` / `moved` activity events into human-readable strings. Shared between the per-task timeline ([TaskActivityList](frontend/src/pages/BoardDetailPage/components/ColumnCard/components/EditTaskDialog/components/TaskActivityList/TaskActivityList.tsx)) and the admin activities table. The column-titles map is optional: per-task view passes one (so `moved` reads "from To Do to In Progress"); admin view omits it (falls back to "moved this task between columns") to avoid fetching every column.
- **[`formatRelativeTime`](frontend/src/utils/formatRelativeTime/formatRelativeTime.ts)** — `Xm ago` / `Xh ago` / `Xd ago` formatter, also shared between the two surfaces.
- **[`adminCursorQuerySchema`](backend/src/types/admin/adminCursorQuerySchema/adminCursorQuerySchema.ts)** — single TypeBox query schema reused by `/admin/tasks` and `/admin/activities`.

### Frontend wiring

- All admin pages render inside the same [`AuthenticatedGuard`](frontend/src/pages/AuthenticatedGuard/AuthenticatedGuard.tsx) as the rest of the app — auth gate first, permission gate via 403.
- Header shows a conditional `Admin` link that renders only if `useAdminStats` succeeds — see [Header.tsx](frontend/src/pages/AuthenticatedGuard/Layout/Header/Header.tsx). SWR dedupes the request by key.
- Each page distinguishes 403 ("you don't have permission to view X") from generic load failures via `error instanceof ApiError && error.status === 403`, so non-admins hitting a deep link get a clear message instead of a blank screen.
- `useAdminStats`, `useAdminUsers`, `useAdminBoards` use `useSWR` with `shouldRetryOnError: false` (single 403, not SWR's default 5-retry storm). `useAdminTasks` and `useAdminActivities` use `useSWRInfinite` with the same option.

### Why the API is the source of truth (not a decoded token in the browser)

The `permissions` claim lives on the **access token**, which the Auth0 React SDK doesn't expose by default. We deliberately don't decode it client-side:

- **No drift.** The backend already validates the token and reads `permissions` — the frontend just calls the endpoint and treats 403 as "hide this." One source of truth, no parallel client-side check that could disagree.
- **No token parsing in the browser.** Decoding JWTs in the SPA invites bugs (signature verification skipped, alg confusion, etc.). The backend's JWKS-validated check is the only one that matters for security; the frontend's hide-on-403 is a UX optimization, not an authorization decision.
- **Trade-off:** every authenticated user makes one extra request per session to discover whether they're admin. Acceptable: the response is tiny, SWR caches it, and the alternative (decoded token) is worse on every dimension.

### Auth0 RBAC setup (one-time per tenant)

To actually grant a user `read:admin-stats`:

1. **APIs** → your API → **Settings**: enable both **Enable RBAC** and **Add Permissions in the Access Token**.
2. **APIs** → your API → **Permissions**: add `read:admin-stats` with any description.
3. **User Management → Users** → pick the user → **Permissions** tab → **Assign Permissions** → select your API → check `read:admin-stats`.
4. Log out and back in — Auth0 caches tokens, and the new permission won't appear until a fresh token is issued.

After step 4, the `Admin` link will appear in the header and `/admin` will load the stats card with drill-down links.

---

## Optional bonus: task activity log

Picked the **task activity log** from the optional list. Each task has a per-task timeline visible in the edit dialog.

### What gets logged

| Action      | When                                                          | Payload (`changes` jsonb)                                  |
| ----------- | ------------------------------------------------------------- | ---------------------------------------------------------- |
| `created`   | A task is created                                             | `{ title, boardColumnId }`                                 |
| `updated`   | `title`, `description`, or `priority` changes (same column)   | Per-field `{ from, to }` deltas                            |
| `moved`     | `boardColumnId` changes                                       | `{ fromBoardColumnId, toBoardColumnId }`                   |

Pure position-only changes within the same column are **not** logged — they're noisy reorders, not user-meaningful events.

### Atomicity

Activity inserts run **in the same transaction** as the underlying task mutation ([tasksRoute.ts](backend/src/routes/tasksRoute/tasksRoute.ts)). The activity row can never disagree with task state.

### Why deletion is not logged

`task_activities.task_id` is `ON DELETE CASCADE`. Logging a `'deleted'` row would vanish in the same transaction the task does. Keeping deletion history would require denormalizing task title onto the activity row and severing the FK, which is more than this scope warrants. The honest trade-off is: the timeline exists for the lifetime of the task it describes.

### Why `actor_id` is `SET NULL`, not `CASCADE`

When a user is deleted (cascading away their boards / columns / tasks), the tasks vanish and their activities go with them — `actor_id` cascade-from-user wouldn't see those rows anyway. But for the case where a future feature lets two users collaborate on the same board, `SET NULL` preserves the timeline entries authored by a removed collaborator (rendered as "Someone" on the frontend).

### Surface

- `GET /tasks/:id/activities` — per-task timeline; gated by the same ownership check as the rest of the task routes; joins `users` for the actor's display name.
- `GET /admin/activities` — cross-task feed for admins (cursor-paginated, gated by `read:admin-stats`); same data joined further to surface task title + board context. See [Admin dashboard](#admin-dashboard-permission-gated).
- Frontend per-task timeline lives inside [EditTaskDialog](frontend/src/pages/BoardDetailPage/components/ColumnCard/components/EditTaskDialog/), fetched lazily when the dialog opens. Frontend admin feed lives at [/admin/activities](frontend/src/pages/AdminActivitiesPage/AdminActivitiesPage.tsx) — both consume the shared [renderActivitySummary](frontend/src/utils/renderActivitySummary/renderActivitySummary.ts) helper.

---

## Error handling across the stack

A single contract: every failure produces a `{ error, message }` body with a meaningful HTTP status, and the frontend reads both as typed data — no string parsing.

### Backend: typed errors → central handler

- **[`HttpError` hierarchy](backend/src/lib/httpErrors/httpErrors.ts)** — base class plus `BadRequestError`, `UnauthorizedError`, `ForbiddenError`, `NotFoundError`, `ConflictError`. Each sets `statusCode` so any error caught by Fastify's error hook can be mapped uniformly.
- **Routes throw, never `reply.code(N).send(...)`** — the route layer expresses intent (`throw new NotFoundError('Task not found')`) and the handler does the HTTP work. `requirePermission` middleware does the same with `ForbiddenError`.
- **[`resolveErrorStatus`](backend/src/lib/resolveErrorStatus/resolveErrorStatus.ts)** — pure function decoupled from the Fastify hook. Returns `{ statusCode, trustMessage }` based on three checks, in order:
  1. Does the error carry an explicit `statusCode`? (our typed errors + Fastify validation errors) → use it, message is safe to surface.
  2. Is it a Postgres error? → look up `code` in the table below, message is **not** safe (raw constraint detail leaks internals).
  3. Otherwise → 500, message is not safe.
- **[Central handler](backend/src/plugins/errorHandler/errorHandler.ts)** — logs at warn (4xx) or error (5xx), then renders `{ error: <statusName>, message: <safe message> }`. The `trustMessage` flag controls whether the client sees `error.message` or a sanitised `STATUS_CODES[statusCode]` fallback.

#### Postgres error → HTTP status mapping

| PG code | Meaning                       | HTTP |
| ------- | ----------------------------- | ---- |
| `23505` | unique_violation              | 409  |
| `23503` | foreign_key_violation         | 409  |
| `23502` | not_null_violation            | 400  |
| `23514` | check_violation               | 400  |
| `22P02` | invalid_text_representation   | 400  |

Adding a new code is one line in `PG_CODE_TO_STATUS`.

### Frontend: typed transport → typed consumers

- **[`ApiError`](frontend/src/utils/ApiError/ApiError.ts)** — extends `Error`, carries `status`, `statusText` (the backend's `error` field), and `message`.
- **[`createBaseFetcher`](frontend/src/utils/createBaseFetcher/createBaseFetcher.ts)** — on non-OK response, parses the JSON body and throws `ApiError(status, body.error, body.message)`. Falls back to `response.statusText` if the body isn't JSON.
- **Consumers** — anywhere we display `error.message` automatically renders the backend's user-friendly text (e.g. *"Task not found"*, *"Missing required permission: read:admin-stats"*). Pages that branch on status do `error instanceof ApiError && error.status === 403` — typed and correct, no string parsing.

### Why this matters

- **One source of truth per concern.** Status decisions live in one Fastify hook, not scattered across routes. PG → HTTP mapping lives in one table. Client-side error semantics live in one class.
- **Information leak is opt-in, not accidental.** A typed error declares its message safe; everything else gets a sanitised status name. The full error still hits the server log via Pino.
- **No fabricated strings.** The previous frontend threw `new Error("403 Forbidden")` and pages parsed that with `startsWith('403')`. That's gone — `error.status === 403` works against typed data.
- **PG concurrency edge cases stop being 500s.** A unique-constraint race on `board_columns_board_id_position_key` now surfaces as `409 Conflict` instead of an opaque server error.

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

### Infra & deployment

- **Split health endpoints.** Backend `/health/ready` should check the DB connection so the readiness probe drains pods that have lost their DB connection. Liveness should stay process-only.
- **Ingress over NodePort.** Add `ingress-nginx` install to `manage.sh deploy` (or document a pre-step), expose the app at a single hostname with TLS via cert-manager.
- **External secrets.** Replace the `kubectl create secret` shell pattern with SealedSecrets or the External Secrets Operator backed by Vault / Doppler / 1Password.
- **HA for the API.** Bump backend `replicas` to 2+, add a `PodDisruptionBudget`, set `topologySpreadConstraints` to spread across nodes.
- **Observability.** OpenTelemetry SDK in the backend, Prometheus + Grafana via Helm, structured-log shipping. Right now we have `kubectl logs` and that's it.
- **Backups.** WAL archiving for Postgres + a CronJob doing logical dumps to object storage.
- **CI.** A GitHub Actions pipeline running `lint`, `type-check`, `build`, plus `kind`-in-CI doing a smoke deploy on every PR. The brief excluded CI from scope, but it's the obvious next step.
- **Auth0 callback URLs.** Currently the K8s deploy assumes `http://localhost:8080/` (port-forward target) is added to the Auth0 Application's Allowed Callback URLs. A more polished setup would either auto-detect or document a Helm-style values file per environment.

### Admin surface

The admin dashboard is intentionally read-only, single-permission, no filters. Concrete next steps when needs grow:

- **Paginate users and boards.** Currently unpaginated — fine while volume is small (Auth0-provisioned users grow slowly, boards scale with users). Infrastructure is already in place: when boards cross ~500 rows or page render exceeds ~200ms, retrofit by adding a cursor variant of the repository, swapping the route to `Querystring: AdminCursorQuery`, and replacing `useSWR` with `useSWRInfinite` plus a "Load more" button. ~30 minutes per table.
- **Search and filter UI.** Action-type filter on activities (created / updated / moved), priority filter on tasks, owner filter on boards/tasks, date-range filter across all lists. Backend would extend `adminCursorQuerySchema` with optional filter fields; cursor stays opaque so it implicitly carries the active filter set.
- **Granular admin permissions.** Currently a single `read:admin-stats` gates everything. Real product would split: `read:admin-users`, `read:admin-activities`, etc., and keep `read:admin-stats` only for the overview cards. The `requirePermission` middleware already supports this — just thread the right string per route.
- **Admin mutations.** Deactivate user, force-delete board, redact activity row. Each would need a new permission (`write:admin-*`) plus an audit log of admin actions themselves (admin who did it, timestamp, target, reason). Currently the surface is read-only by design — adding writes is non-trivial because cascade rules mean "delete board" is destructive.
- **CSV export.** Stream a paginated query into a CSV response for offline analysis. Trivial extension to the existing repos; would benefit from a `?format=csv` query param sharing the cursor schema.
- **Richer cell rendering.** Priority as coloured badges instead of `P0`/`P1`/`P2` text. Status indicators for users (last active). For `moved` activities in the admin view, fetch column titles on demand (per-board or via a cached endpoint) so the summary reads "from To Do to In Progress" instead of the generic fallback.
- **Rate limiting on admin endpoints.** A misbehaving admin client (or a compromised token) could fetch all activities by paginating end-to-end. A token-bucket limiter at the Fastify hook level would cap throughput without breaking legitimate use.
- **Server-side aggregation views.** "Top 10 most active users this week," "boards with no recent activity" — these are aggregate questions, not filtered list views. They want their own purpose-built endpoints + dashboard widgets, not generic table filters.
