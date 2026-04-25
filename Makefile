# Task-Board — onboarding and dev orchestration.
#
# Run `make` (no args) to see the full list of targets. Each target is
# annotated with `## description` so the help target picks it up automatically.

.DEFAULT_GOAL := help
.PHONY: help install env setup db-up db-down db-logs migrate seed studio \
        dev dev-backend dev-frontend swagger build clean \
        k8s-deploy k8s-teardown k8s-status k8s-logs k8s-seed k8s-migrate \
        k8s-port-forward

# ---------- self-documentation ----------

help: ## Show this help
	@printf "\nTask-Board — useful targets:\n\n"
	@grep -E '^[a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
	  | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'
	@printf "\n"

# ---------- first-time onboarding ----------

setup: install env ## Install deps + copy env templates (one-shot first run)
	@printf "\n\033[1;32m✓ Setup complete.\033[0m Next: edit backend/.env and frontend/.env, then \`make dev\`\n"

install: ## Install all workspace dependencies
	npm install

env: ## Copy .env templates if they don't exist yet
	@[ -f backend/.env ]  || cp backend/.env.example  backend/.env  && echo "→ backend/.env created"  || true
	@[ -f frontend/.env ] || cp frontend/.env.example frontend/.env && echo "→ frontend/.env created" || true
	@[ -f k8s/.env ]      || cp k8s/.env.example      k8s/.env      && echo "→ k8s/.env created (only needed for K8s deploy)" || true

# ---------- database (docker compose) ----------

db-up: ## Start Postgres in docker-compose
	docker compose up -d postgres
	@printf "→ Postgres listening on localhost:5432\n"

db-down: ## Stop Postgres
	docker compose down

db-logs: ## Tail Postgres logs
	docker compose logs -f postgres

migrate: ## Apply Drizzle migrations
	npm run db:migrate -w backend

seed: ## Load idempotent demo data (only touches the seed user)
	npm run db:seed -w backend

studio: ## Open Drizzle Studio (browse the DB at https://local.drizzle.studio)
	npm run db:studio -w backend

# ---------- dev servers ----------

dev: db-up ## Run backend + frontend dev servers (Ctrl-C kills both)
	@printf "→ Starting both dev servers. Backend: :3000 — Frontend: :5173\n"
	@trap 'kill 0' INT TERM; \
	  npm run dev:backend & \
	  npm run dev:frontend & \
	  wait

dev-backend: ## Run only the backend dev server (Fastify + tsx watch)
	npm run dev:backend

dev-frontend: ## Run only the frontend dev server (Vite)
	npm run dev:frontend

swagger: ## Print the Swagger UI URL (backend must be running)
	@printf "Swagger UI: http://localhost:3000/docs\n"
	@printf "OpenAPI doc: http://localhost:3000/docs/json\n"

# ---------- build ----------

build: ## Build both workspaces (frontend + backend)
	npm run build:backend
	npm run build:frontend

# ---------- cleanup ----------

clean: ## Stop docker, remove node_modules + dist + build caches
	-docker compose down -v
	rm -rf node_modules backend/node_modules frontend/node_modules
	rm -rf backend/dist frontend/dist
	rm -f backend/tsconfig.tsbuildinfo frontend/tsconfig.tsbuildinfo

# ---------- Kubernetes (delegates to k8s/manage.sh) ----------

k8s-deploy: ## Build images, load into kind/minikube, apply manifests, run migrations
	./k8s/manage.sh deploy

k8s-teardown: ## Delete the entire taskboard namespace (drops all data)
	./k8s/manage.sh teardown

k8s-status: ## Show pods, services, PVCs, jobs in the taskboard namespace
	./k8s/manage.sh status

k8s-seed: ## Run the opt-in seed Job in the cluster
	./k8s/manage.sh seed

k8s-migrate: ## Re-run the Drizzle migration Job in the cluster
	./k8s/manage.sh migrate

k8s-logs: ## Tail logs for a service. Usage: make k8s-logs SERVICE=backend
	@if [ -z "$(SERVICE)" ]; then \
	  echo "Usage: make k8s-logs SERVICE=<backend|frontend|postgres|migrate|seed>"; \
	  exit 1; \
	fi
	./k8s/manage.sh logs $(SERVICE)

k8s-port-forward: ## Port-forward the cluster frontend to localhost:8080
	kubectl port-forward -n taskboard service/frontend 8080:80
