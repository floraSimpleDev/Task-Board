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

**❌ Missing (infra + docs)**

1. **Dockerfiles** — backend and frontend, multi-stage
2. **Kubernetes manifests** — API Deployment, frontend Deployment, Postgres StatefulSet + PVC, ConfigMaps/Secrets, liveness/readiness probes, resource requests/limits
3. **Management script** — `deploy`, `teardown`, `status`, `logs <service>`
4. **README** — setup, k8s deploy, Auth0 checklist, architecture notes, "what I'd improve"
5. **Seed data** (optional but useful)
6. **Optional bonus** — pick at most one: WebSocket real-time / multi-replica scaling / activity log / ingress+TLS
7. **Browser smoke-test** — the DnD is green on types/lint/build but hasn't been exercised in a real browser yet

**My recommended order:**

1. **Browser smoke-test DnD** first (cheapest risk reduction — anything broken here blocks the rest).
2. **Dockerfiles** — k8s needs them.
3. **Kubernetes manifests + management script** — big-ticket requirement.
4. **README** — ties everything together, arguably the most visible to the reviewer.
5. **Seed data** — quick win.
6. **Bonus** — only if time allows; the brief says "we'd rather see the core done well."

Want to start with the browser test, or jump straight to Dockerfiles?