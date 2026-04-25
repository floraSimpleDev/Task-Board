#!/usr/bin/env bash
#
# Task-Board Kubernetes management script.
#
# Commands:
#   deploy            Build images, load into local cluster, apply manifests, run migrations.
#   teardown          Delete the entire taskboard namespace (PVCs included).
#   status            Show pods, services, PVCs, and recent jobs in the namespace.
#   logs <service>    Tail logs. service ∈ {backend, frontend, postgres, migrate, seed}.
#   migrate           Re-run the Drizzle migration Job.
#   seed              Run the (opt-in) seed Job.
#   port-forward-db   Forward Postgres 5432 to localhost for psql/Drizzle Studio.
#
# Auto-detects kind vs minikube for image loading. Idempotent: re-running
# `deploy` is safe — `kubectl apply` reconciles, Jobs are recreated.

set -euo pipefail

readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
readonly NAMESPACE="taskboard"
readonly BACKEND_IMAGE="task-board-backend:latest"
readonly BACKEND_MIGRATE_IMAGE="task-board-backend-migrate:latest"
readonly FRONTEND_IMAGE="task-board-frontend:latest"
readonly ENV_FILE="$SCRIPT_DIR/.env"

log()  { printf '\033[1;34m==> %s\033[0m\n' "$*"; }
warn() { printf '\033[1;33m!! %s\033[0m\n' "$*" >&2; }
die()  { printf '\033[1;31mxx %s\033[0m\n' "$*" >&2; exit 1; }

require() {
  command -v "$1" >/dev/null 2>&1 || die "Missing required command: $1"
}

detect_cluster() {
  if command -v kind >/dev/null 2>&1 && kind get clusters 2>/dev/null | grep -q .; then
    echo "kind"
  elif command -v minikube >/dev/null 2>&1 && minikube status --format='{{.Host}}' >/dev/null 2>&1; then
    echo "minikube"
  else
    echo "none"
  fi
}

load_image() {
  local image="$1"
  local cluster
  cluster="$(detect_cluster)"
  case "$cluster" in
    kind)
      local kind_cluster
      kind_cluster="$(kind get clusters | head -n 1)"
      log "Loading $image into kind cluster '$kind_cluster'"
      kind load docker-image "$image" --name "$kind_cluster"
      ;;
    minikube)
      log "Loading $image into minikube"
      minikube image load "$image"
      ;;
    none)
      die "No running kind or minikube cluster detected. Start one first (e.g. 'kind create cluster')."
      ;;
  esac
}

require_env_file() {
  if [[ ! -f "$ENV_FILE" ]]; then
    die "Missing $ENV_FILE — copy k8s/.env.example to k8s/.env and fill in values."
  fi
}

# Reads $ENV_FILE and exports its key=value pairs into the current shell.
load_env() {
  require_env_file
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
  : "${POSTGRES_USER:?POSTGRES_USER not set in $ENV_FILE}"
  : "${POSTGRES_PASSWORD:?POSTGRES_PASSWORD not set in $ENV_FILE}"
  : "${POSTGRES_DB:?POSTGRES_DB not set in $ENV_FILE}"
  : "${AUTH0_DOMAIN:?AUTH0_DOMAIN not set in $ENV_FILE}"
  : "${AUTH0_AUDIENCE:?AUTH0_AUDIENCE not set in $ENV_FILE}"
  : "${AUTH0_CLIENT_ID:?AUTH0_CLIENT_ID not set in $ENV_FILE}"
  : "${AUTH0_REDIRECT_URI:?AUTH0_REDIRECT_URI not set in $ENV_FILE}"
}

# Generates Secrets via `kubectl create secret --dry-run=client | kubectl apply`.
# This is the official idempotent pattern: the first run creates, every
# subsequent run patches without erroring.
apply_secrets() {
  load_env
  log "Applying postgres-credentials Secret"
  kubectl create secret generic postgres-credentials \
    --namespace "$NAMESPACE" \
    --from-literal="POSTGRES_USER=$POSTGRES_USER" \
    --from-literal="POSTGRES_PASSWORD=$POSTGRES_PASSWORD" \
    --from-literal="POSTGRES_DB=$POSTGRES_DB" \
    --dry-run=client -o yaml | kubectl apply -f -

  local database_url="postgresql://$POSTGRES_USER:$POSTGRES_PASSWORD@postgres:5432/$POSTGRES_DB"

  log "Applying backend-secrets Secret"
  kubectl create secret generic backend-secrets \
    --namespace "$NAMESPACE" \
    --from-literal="DATABASE_URL=$database_url" \
    --from-literal="AUTH0_DOMAIN=$AUTH0_DOMAIN" \
    --from-literal="AUTH0_AUDIENCE=$AUTH0_AUDIENCE" \
    --dry-run=client -o yaml | kubectl apply -f -
}

build_images() {
  load_env

  log "Building $BACKEND_IMAGE"
  docker build -t "$BACKEND_IMAGE" -f "$REPO_ROOT/backend/Dockerfile" "$REPO_ROOT"

  log "Building $BACKEND_MIGRATE_IMAGE (builder stage, has drizzle-kit + migrations)"
  docker build --target builder -t "$BACKEND_MIGRATE_IMAGE" \
    -f "$REPO_ROOT/backend/Dockerfile" "$REPO_ROOT"

  log "Building $FRONTEND_IMAGE (Vite bakes VITE_AUTH0_* in at build time)"
  docker build -t "$FRONTEND_IMAGE" -f "$REPO_ROOT/frontend/Dockerfile" "$REPO_ROOT" \
    --build-arg "VITE_AUTH0_DOMAIN=$AUTH0_DOMAIN" \
    --build-arg "VITE_AUTH0_AUDIENCE=$AUTH0_AUDIENCE" \
    --build-arg "VITE_AUTH0_CLIENT_ID=$AUTH0_CLIENT_ID" \
    --build-arg "VITE_AUTH0_REDIRECT_URI=$AUTH0_REDIRECT_URI"
}

load_images() {
  load_image "$BACKEND_IMAGE"
  load_image "$BACKEND_MIGRATE_IMAGE"
  load_image "$FRONTEND_IMAGE"
}

apply_job() {
  local manifest="$1"
  local job_name="$2"
  # Jobs are immutable; delete then re-apply for idempotent re-runs.
  kubectl delete job "$job_name" --namespace "$NAMESPACE" --ignore-not-found
  kubectl apply -f "$manifest"
  log "Waiting for Job $job_name to complete (timeout 5m)"
  kubectl wait --for=condition=complete --timeout=5m \
    --namespace "$NAMESPACE" "job/$job_name" || {
    warn "Job $job_name did not complete; recent logs:"
    kubectl logs --namespace "$NAMESPACE" "job/$job_name" --tail=100 || true
    return 1
  }
}

cmd_deploy() {
  require docker
  require kubectl

  build_images
  load_images

  log "Applying namespace"
  kubectl apply -f "$SCRIPT_DIR/00-namespace.yaml"

  apply_secrets

  log "Applying Postgres manifests"
  kubectl apply -f "$SCRIPT_DIR/postgres/service.yaml"
  kubectl apply -f "$SCRIPT_DIR/postgres/statefulset.yaml"

  log "Waiting for Postgres to be ready"
  kubectl rollout status statefulset/postgres --namespace "$NAMESPACE" --timeout=3m

  log "Running database migrations"
  apply_job "$SCRIPT_DIR/backend/migrate-job.yaml" "backend-migrate"

  log "Applying backend manifests"
  kubectl apply -f "$SCRIPT_DIR/backend/configmap.yaml"
  kubectl apply -f "$SCRIPT_DIR/backend/service.yaml"
  kubectl apply -f "$SCRIPT_DIR/backend/deployment.yaml"

  log "Applying frontend manifests"
  kubectl apply -f "$SCRIPT_DIR/frontend/service.yaml"
  kubectl apply -f "$SCRIPT_DIR/frontend/deployment.yaml"

  log "Waiting for backend and frontend rollouts"
  kubectl rollout status deployment/backend --namespace "$NAMESPACE" --timeout=3m
  kubectl rollout status deployment/frontend --namespace "$NAMESPACE" --timeout=3m

  log "Deploy complete."
  log "Frontend: http://localhost:30080  (kind: needs extraPortMappings; minikube: use \`minikube service -n $NAMESPACE frontend\`)"
  log "Run \`./k8s/manage.sh seed\` to load demo data."
}

cmd_teardown() {
  require kubectl
  log "Deleting namespace $NAMESPACE (this removes PVCs and stored data)"
  kubectl delete namespace "$NAMESPACE" --ignore-not-found
}

cmd_status() {
  require kubectl
  log "Pods"
  kubectl get pods --namespace "$NAMESPACE" -o wide || true
  log "Services"
  kubectl get svc --namespace "$NAMESPACE" || true
  log "PVCs"
  kubectl get pvc --namespace "$NAMESPACE" || true
  log "Jobs"
  kubectl get jobs --namespace "$NAMESPACE" || true
}

cmd_logs() {
  require kubectl
  local service="${1:-}"
  [[ -n "$service" ]] || die "Usage: manage.sh logs <backend|frontend|postgres|migrate|seed>"
  case "$service" in
    backend)  kubectl logs --namespace "$NAMESPACE" -l app.kubernetes.io/name=backend --tail=200 -f ;;
    frontend) kubectl logs --namespace "$NAMESPACE" -l app.kubernetes.io/name=frontend --tail=200 -f ;;
    postgres) kubectl logs --namespace "$NAMESPACE" -l app.kubernetes.io/name=postgres --tail=200 -f ;;
    migrate)  kubectl logs --namespace "$NAMESPACE" -l app.kubernetes.io/name=backend-migrate --tail=200 ;;
    seed)     kubectl logs --namespace "$NAMESPACE" -l app.kubernetes.io/name=backend-seed --tail=200 ;;
    *)        die "Unknown service '$service'. Expected: backend | frontend | postgres | migrate | seed" ;;
  esac
}

cmd_migrate() {
  require kubectl
  apply_job "$SCRIPT_DIR/backend/migrate-job.yaml" "backend-migrate"
}

cmd_seed() {
  require kubectl
  apply_job "$SCRIPT_DIR/backend/seed-job.yaml" "backend-seed"
  log "Seed complete. Sign in as the demo user via Auth0 to see the data — or query Postgres directly."
}

cmd_port_forward_db() {
  require kubectl
  log "Forwarding postgres 5432 -> localhost:5432 (Ctrl-C to stop)"
  kubectl port-forward --namespace "$NAMESPACE" service/postgres 5432:5432
}

usage() {
  cat <<EOF
Usage: $0 <command> [args]

Commands:
  deploy            Build images, load into local cluster, apply manifests, run migrations.
  teardown          Delete the entire $NAMESPACE namespace (PVCs included).
  status            Show pods, services, PVCs, jobs.
  logs <service>    Tail logs. service ∈ {backend, frontend, postgres, migrate, seed}.
  migrate           Re-run the Drizzle migration Job.
  seed              Run the (opt-in) seed Job.
  port-forward-db   Forward Postgres 5432 to localhost.
EOF
}

main() {
  local command="${1:-}"
  shift || true
  case "$command" in
    deploy)          cmd_deploy "$@" ;;
    teardown)        cmd_teardown "$@" ;;
    status)          cmd_status "$@" ;;
    logs)            cmd_logs "$@" ;;
    migrate)         cmd_migrate "$@" ;;
    seed)            cmd_seed "$@" ;;
    port-forward-db) cmd_port_forward_db "$@" ;;
    ''|-h|--help|help) usage ;;
    *) usage; exit 1 ;;
  esac
}

main "$@"
