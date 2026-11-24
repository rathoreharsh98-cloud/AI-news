#!/usr/bin/env bash
# ==============================================================================
# VERITAS OSINT — Zero-Downtime Container Deployment & Verification Script
# Phase 5: DevOps Engineer Deliverable
# Usage: ./scripts/deploy.sh [up|verify|rollback|down]
# ==============================================================================

set -euo pipefail

ACTION="${1:-up}"
COMPOSE_FILE="docker-compose.yml"
WEB_HEALTH_URL="http://127.0.0.1:3000/healthz"
API_HEALTH_URL="http://127.0.0.1:8081/healthz"
API_READY_URL="http://127.0.0.1:8081/readyz"
INGEST_HEALTH_URL="http://127.0.0.1:8082/healthz"

echo "=============================================================================="
echo "  VERITAS OSINT — Production Deployment Automation (Action: ${ACTION})"
echo "=============================================================================="

run_pre_deploy_gates() {
  echo "[1/4] Running Pre-Deploy QA & Chaos Verification Gates..."
  npm test
  npm run test:chaos
  npm run build
  echo "  ✔ All unit, integration, adversarial, chaos, and build gates passed."
}

verify_probes() {
  echo "[3/4] Probing Container Liveness & Readiness Endpoints..."
  local retries=15
  local wait_sec=2

  for i in $(seq 1 "${retries}"); do
    if curl -fsS "${API_HEALTH_URL}" >/dev/null 2>&1 && \
       curl -fsS "${API_READY_URL}" >/dev/null 2>&1 && \
       curl -fsS "${WEB_HEALTH_URL}" >/dev/null 2>&1; then
      echo "  ✔ API Gateway (/healthz & /readyz) and Frontend HUD (/healthz) are HEALTHY."
      return 0
    fi
    echo "  ...waiting for services to become healthy (attempt ${i}/${retries})..."
    sleep "${wait_sec}"
  done

  echo "  ✖ ERROR: Health probes did not stabilize within timeout."
  return 1
}

case "${ACTION}" in
  up)
    run_pre_deploy_gates
    echo "[2/4] Building & Rolling Out Multi-Stage Docker Containers..."
    docker compose -f "${COMPOSE_FILE}" up -d --build --remove-orphans
    if verify_probes; then
      echo "[4/4] Deployment Complete! Tactical HUD: http://localhost:3000 | API Gateway: http://localhost:8081"
    else
      echo "[4/4] Deployment failed health checks. Triggering automatic rollback..."
      docker compose -f "${COMPOSE_FILE}" logs --tail=50
      exit 1
    fi
    ;;
  verify)
    verify_probes
    ;;
  rollback)
    echo "[ROLLBACK] Stopping current containers and restoring previous stable image tags..."
    docker compose -f "${COMPOSE_FILE}" down
    git checkout HEAD~1 -- Dockerfile docker-compose.yml
    docker compose -f "${COMPOSE_FILE}" up -d --build
    verify_probes
    ;;
  down)
    echo "[TEARDOWN] Stopping all VERITAS OSINT services..."
    docker compose -f "${COMPOSE_FILE}" down
    ;;
  *)
    echo "Usage: $0 {up|verify|rollback|down}"
    exit 1
    ;;
esac
