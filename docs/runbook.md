# VERITAS OSINT — DevOps & SRE Production Operations Runbook

**Version:** 1.0.0  
**Phase:** Phase 5 — DevOps Engineer  
**Source of Truth:** [docs/prd.md](file:///d:/Google/AI%20news%20feed/docs/prd.md) & [docs/backend-arch.md](file:///d:/Google/AI%20news%20feed/docs/backend-arch.md)  

---

## 1. Quick Start & Reproducible Local Development

### 1.1 Standard Local Development
```bash
# 1. Copy environment variables template
cp .env.example .env

# 2. Install dependencies
npm ci

# 3. Start Vite React Frontend HUD (http://localhost:5173)
npm run dev

# 4. Start VERITAS Core API Gateway (http://localhost:8081)
node src/server/apiServer.js
```

### 1.2 Full Containerized Stack (Docker Compose)
```bash
# Build and start all microservices (Frontend Nginx, API Gateway, Telemetry Worker, Clean-Room Sidecar, Redis, Qdrant, Prometheus)
docker compose up -d --build

# Or run the automated zero-downtime deployment script with pre-deploy test gates:
bash scripts/deploy.sh up
```

---

## 2. Container & Service Port Matrix

| Service Container | Target Stage / Image | Internal Port | Host Port | Health Probe Endpoint |
| :--- | :--- | :--- | :--- | :--- |
| `veritas-osint-web` | `Dockerfile` (`frontend` - Nginx 1.27 non-root UID 101) | `8080` | `3000` | `GET http://localhost:3000/healthz` |
| `veritas-api-gateway` | `Dockerfile` (`api` - Node 20 Alpine non-root) | `8081` | `8081` | `GET http://localhost:8081/healthz` & `/readyz` |
| `veritas-telemetry-ingestion` | `Dockerfile` (`telemetry` - Node 20 Alpine non-root) | `8082` | `8082` | `GET http://localhost:8082/healthz` |
| `veritas-agpl-sidecar` | `Dockerfile` (`sidecar` - Air-gapped `cleanroom-agpl-net`) | `8091` | Isolated | `GET http://127.0.0.1:8091/healthz` |
| `veritas-redis-cache` | `redis:7.2-alpine` (`allkeys-lru` 256MB) | `6379` | `6379` | `redis-cli ping` |
| `veritas-prometheus` | `prom/prometheus:v2.54.1` | `9090` | `9090` | `GET http://localhost:9090/-/healthy` |

---

## 3. Verification, QA & Chaos Engineering Commands

Before every deployment or release cut, execute the full verification pyramid:

```bash
# 1. Run full Unit, Integration, E2E, and Adversarial Red-Team test suites (139+ tests)
npm test

# 2. Run Netflix Chaos Monkey & SRE Resilience Stress Suite (5/5 scenarios)
npm run test:chaos

# 3. Verify production bundle compilation
npm run build
```

---

## 4. Observability, Health Checks & Golden Signals

### 4.1 Liveness & Readiness Verification
- **Liveness (`/healthz`):** Confirms the Node.js event loop or Nginx worker is responsive.
  ```bash
  curl -i http://localhost:8081/healthz
  ```
- **Readiness (`/readyz`):** Confirms the `VeritasDataStore` is seeded and the TTL cache is operational.
  ```bash
  curl -i http://localhost:8081/readyz
  ```

### 4.2 Prometheus Metrics Exposition
- **API Gateway Golden Signals (`http://localhost:8081/api/v1/metrics`):**
  - `veritas_http_requests_total`
  - `veritas_verify_requests_total`
  - `veritas_feed_requests_total`
  - `veritas_cache_hits_total`
  - `veritas_http_errors_total`
  - `veritas_avg_latency_ms`
  - `veritas_pii_scrubbed_total`
- **Telemetry Ingestion Metrics (`http://localhost:8082/metrics`):**
  - `telemetry_ingestion_latency_p99_ms{stream="adsb_opensky|ais_maritime|seismic_usgs|thermal_firms|worldmonitor_sidecar"}`
  - `telemetry_sensor_healthy`

---

## 5. Incident Response & Rollback Procedures

### Scenario A: Upstream Public Telemetry API Outage or Quota Throttling
- **Symptoms:** Upstream GDELT, OpenSky, or USGS returns HTTP 429/503.
- **Automated Mitigation:** Circuit breaker (`CircuitBreaker` in `telemetryIngestion.js` and 4-second abort timeouts in `mapDataService.js`) trips to `OPEN` after 3 consecutive failures and fails over immediately to cached/deterministic baseline telemetry. Zero operator intervention required.

### Scenario B: DDoS or Claim Verification Abuse Burst
- **Symptoms:** Sudden spike in `POST /api/v1/verify` traffic.
- **Automated Mitigation:** `TokenBucketLimiter` clamps requests exceeding 120 req/min per IP with `HTTP 429 Too Many Requests` and `Retry-After: 60`.

### Scenario C: Emergency Container Rollback
If a deployment fails health checks or exhibits regression:
```bash
# Execute automated rollback to previous stable commit and restart containers
bash scripts/deploy.sh rollback
```
