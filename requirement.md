# Task board requirement

Build a task board application where authenticated users create, organise, and track tasks across customisable columns. Think simplified Kanban: users create boards, each board has ordered columns, and each column contains tasks with a title, description, and priority. Boards are scoped per user. Task and column ordering must persist across reloads. 

Stack: React + Vite + TypeScript with shadcn/ui, Fastify + TypeScript, PostgreSQL, Auth0, Kubernetes.

Auth: Use Auth0 with PKCE on the SPA and JWKS-based JWT validation on the API. Auto-provision a local user record on first login. Include at least one route with role or permission-based access — implement it however you see fit, but justify your choice. 

Database: Provide migrations (any tool — justify your choice). We expect foreign keys, constraints, indexes on queried columns, and at least one non-trivial query. Document what happens when a column containing tasks is deleted.

Kubernetes: Provide manifests for the API, frontend, and PostgreSQL (StatefulSet + PVC is fine). Include a management script (shell or Makefile) with deploy, teardown, status, and logs <service> commands. Use ConfigMaps/Secrets for configuration — no hardcoded credentials. Add readiness and liveness probes on the API. Multi-stage Dockerfiles preferred. Deploys should be idempotent. 

Quality expectations: Consistent API error shape with input validation. Proper frontend state management with at least one optimistic update. Handle loading, error, and empty states. Resource requests/limits on pods. No any in TypeScript. These aren’t bonuses — they factor directly into evaluation. 

Optional (pick one at most): WebSocket real-time updates, multi-replica horizontal scaling, task activity log, or ingress with TLS. We’d rather see the core done well than a bonus done poorly. 

Deliverables: Git repo with incremental commits. A README covering local setup (ideally docker-compose up), K8s deployment targeting minikube/kind, Auth0 configuration checklist, architecture decisions with trade-offs, and what you’d improve given more time. A /k8s directory with your manifests and management script. Migrations and optional seed data. 

Keep it simple: No managed DB operators, no service mesh, no GitOps, no Terraform, no CI/CD pipeline. If something in this brief is ambiguous, make a decision and document it — that’s part of the exercise. We will run your code, deploy your manifests to a local cluster, and read everything as if reviewing a PR from a teammate. The Auth0 free tier is sufficient.


# Next steps:

Refined plan

```markdown
✅ User auto-provision (done)
       ↓
1. Board CRUD (backend) ──┬─→ Board UI (list/create/rename/delete)
                          └─ extract `getOwnedBoard` service early ⚠️
       ↓
2. Column CRUD (backend) ─→ Column UI (visible inside a single board)
       ↓
3. Task CRUD (backend) ───→ Task UI (priority badge, description, etc.)
       ↓
4. Reorder ─────────────────→ drag-and-drop + optimistic update
   ├─ Column reorder within board (integer + deferrable swap)
   ├─ Task reorder within column (fractional midpoint)
   └─ Task move between columns (also fractional midpoint, just different parent)
```

Three things worth deciding upfront
1. Build small UI per phase, not "all backend then all frontend"
Doing all backend then all frontend means weeks of curl testing. Suggest vertical-slice per phase: ship a minimal UI for each entity as you finish its backend. The UI is your dogfooding harness — you'll catch API ergonomics bugs immediately, not weeks later. The backend → UI arrows in your plan already imply this; just be explicit about it.

2. Authorization helper — extract early
Every endpoint after /me needs the same check: "is this board / column / task owned by request.dbUser?" If you spread this logic across handlers, you'll have inconsistencies. Build it once in phase 1:


```ts
// services/getOwnedBoard/getOwnedBoard.ts
const getOwnedBoard = async (database, boardId, userId): Promise<Board> => {
  const board = await database.query.boards.findFirst({
    where: and(eq(boards.id, boardId), eq(boards.userId, userId)),
  })
  if (!board) {
    throw new NotFoundError('Board not found')   // 404, not 403 (don't leak existence)
  }
  return board
}
```

Then column / task handlers reuse it: "load the column, get its board via getOwnedBoard, then proceed." Single source of truth for ownership = no possible authorization bypass.

3. Reorder needs design, not just code
Save reorder for last on the implementation timeline, but decide the API shape during phase 2 (columns) so the frontend knows what to expect:


| Operation                      | API shape                                                                                   |
| ------------------------------ | ------------------------------------------------------------------------------------------- |
| Reorder columns within a board | `PATCH /boards/:id/columns/reorder` body `{ columnIds: [id1, id2, ...] }` (full ordering)   |
| Reorder task within a column   | `PATCH /tasks/:id/position` body `{ position: 2.5 }` (caller computes midpoint client-side) |
| Move task between columns      | Same endpoint as above, body `{ position: 2.5, columnId: 'new-uuid' }`                      |


These are intentionally different because the underlying mechanics differ (full-renumber vs single-row update). The "caller computes midpoint client-side" pattern is what makes optimistic updates trivial — frontend computes the new fractional position, applies it locally, sends to backend.

What I'd ship in phase 1 (board CRUD) to validate the pattern
- Backend: `POST /boards`, `GET /boards`, `GET /boards/:id`, `PATCH /boards/:id`, `DELETE /boards/:id` — all behind fastify.authenticate, all using getOwnedBoard for ownership
- Repositories: `getOwnedBoard`, `listOwnedBoards`, `createBoard`, `updateBoard`, `deleteBoard`
- Frontend: a `/boards` page with a list + "Create board" button + click-to-rename + delete confirmation. Routing via `react-router` (will need to add it)

Once that's working, we have a proven pattern: schema → repos → service → route → SWR hook → page. The remaining phases just repeat this pattern with more entity-specific details.

Ready to start?
If yes, I'd kick off phase 1, board CRUD backend — schema is already there, just need:

getOwnedBoard, listOwnedBoards, createBoard, updateBoard, deleteBoard repositories
TypeBox schemas for board responses + create/update bodies
boardsRoute plugin with the 5 endpoints
Wire in app.ts
