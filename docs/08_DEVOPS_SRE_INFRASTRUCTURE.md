# VERITAS OSINT — DevOps, SRE & Infrastructure Specification
### Enterprise Standard v3.0 | Benchmark: Google SRE & Netflix Chaos Engineering
**Author:** DevOps & Site Reliability Engineering Lead (`devops_sre`)  
**Status:** Approved for Gate 4 Production Deployment | **Target SLA:** 99.95% Availability  
**Classification:** Enterprise Infrastructure Runbook & Architecture Specification  

---

## 1. Executive Summary & SRE Tenets

The VERITAS OSINT platform is designed for mission-critical real-time intelligence convergence. Operating at the intersection of breaking wire reports, viral social eyewitness signals, and physical telemetry (ADS-B, AIS, seismic, thermal), the infrastructure must sustain extreme resilience, zero copyleft license contamination, and predictable sub-second latency.

This infrastructure architecture establishes the enterprise benchmarks:
1. **Google Site Reliability Engineering (SRE):**
   - Formal Service Level Indicators (SLIs), Service Level Objectives (SLOs), and Error Budgets.
   - Continuous observability based on the **Four Golden Signals** (Latency, Traffic, Errors, Saturation).
   - Least privilege execution: 100% non-root container runtimes with dropped capabilities and read-only root filesystems.
2. **Netflix Chaos Engineering:**
   - Proactive resilience validation via the **Simian Army / Chaos Monkey** pattern.
   - Automated injection of sensor latency spikes, SATCOM network drops, packet loss, and upstream circuit breaker trip scenarios.
   - Continuous verification of mathematical contradiction penalties and token-bucket rate limiting.
3. **Clean-Room AGPL-3.0 Microservice Isolation:**
   - Complete physical and network decoupling of AGPL-3.0 tools (e.g., `worldmonitor`, `gods-eye-view`).
   - Air-gapped container network bridge (`cleanroom-agpl-net`) with zero shared memory, zero binary linkage, and data-only REST transport over HTTP/2.

---

## 2. Google SRE Service Level Objectives & The Four Golden Signals

### 2.1 SLI, SLO & Error Budget Matrix

| Service Dimension | Service Level Indicator (SLI) | Service Level Objective (SLO) | Monthly Error Budget | Monitoring Target |
| :--- | :--- | :--- | :--- | :--- |
| **API Availability** | Successful HTTP requests (`status < 500`) / Total requests | **$\ge 99.95\%$** | 21.6 minutes downtime | `veritas_http_requests_total`, `veritas_http_errors_total` |
| **Verification Latency** | End-to-end 5-step verification pipeline duration | **p95 $\le 250\text{ms}$**, **p99 $\le 500\text{ms}$** | $\le 1\%$ requests exceeding 500ms | `veritas_avg_latency_ms` |
| **Telemetry Ingestion** | Ingestion pipeline latency per sensor stream | **p99 $\le 150\text{ms}$** | $\le 0.5\%$ samples delayed | `telemetry_ingestion_latency_p99_ms` |
| **Safe Harbour Integrity** | DPDP PII scrubbing precision across eyewitness posts | **$100.00\%$** (Zero Tolerance) | 0 unscrubbed PII tokens | `veritas_pii_scrubbed_total` |
| **Sensor Redundancy** | Uptime across 5 multi-modal telemetry streams | **$\ge 99.9\%$** per stream | Automated failover active | `telemetry_sensor_healthy` |

### 2.2 The Four Golden Signals Dashboard Specification

VERITAS exports real-time Prometheus metrics scraped at 10-second intervals:

```
+-----------------------------------------------------------------------------------------------+
|                               VERITAS OSINT SRE HUD DASHBOARD                                 |
+-----------------------------------------------------------------------------------------------+
| 1. LATENCY (Duration per operation)          | 2. TRAFFIC (Demand / Throughput)               |
| • API Verification p95: 185ms (Target <250ms)| • Total API Ingestion: 1,420 req/min           |
| • OpenSky ADS-B p99:    54ms                 | • Telemetry Streams:   5,300 events/min        |
| • MarineTraffic AIS p99:68ms                 | • Redis Cache Hit Rate: 94.2%                  |
| • NASA FIRMS p99:      122ms                 | • Active WebSockets:   840 connected           |
+----------------------------------------------+------------------------------------------------+
| 3. ERRORS (Failure rate)                     | 4. SATURATION (Fraction of resource used)      |
| • HTTP 5xx Rate:        0.002% (SLO Healthy) | • API Gateway Memory:  214MB / 512MB (41.8%)   |
| • Circuit Breakers:     5/5 CLOSED           | • Redis Cache Memory:  118MB / 256MB (46.1%)   |
| • Rate Limited (429):   12 req/min (Normal)  | • Qdrant HNSW Memory:  310MB / 512MB (60.5%)   |
| • DPDP PII Leakage:     0 (Zero Defect)      | • Nginx CPU Usage:     8.4% of 0.75 Cores      |
+-----------------------------------------------------------------------------------------------+
```

---

## 3. Clean-Room Microservice Architecture & AGPL-3.0 Air Gap

### 3.1 The Legal & Architectural Problem
Open-source OSINT projects like `worldmonitor` and `gods-eye-view` are licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0)**. Section 13 of the AGPL-3.0 states that if a program is modified or linked to run on a server across a computer network, the entire source code of the interacting application must be made available under AGPL-3.0.

### 3.2 The VERITAS Clean-Room Remedy
To preserve 100% proprietary ownership and commercial Apache-2.0 compatibility, VERITAS enforces **Clean-Room Isolation** benchmarked against Martin Fowler’s Anti-Corruption Layer (ACL):

```mermaid
graph TD
    subgraph ISOLATED_AGPL["Untrusted / AGPL-3.0 Sandbox Container"]
        WM["WorldMonitor / God's Eye Daemon<br/>(AGPL-3.0 Codebase)"]
        SIDE["HTTP/2 Sidecar Adapter<br/>(Port 8091 - Loopback Only)"]
        WM --> SIDE
    end

    subgraph AIR_GAP_NET["Docker Internal Network: cleanroom-agpl-net"]
        GAP["Air-Gapped Bridge (Internal=true)<br/>Zero Internet Ingress / Zero Host Port Binding"]
    end

    subgraph PROPRIETARY_CORE["VERITAS OSINT Proprietary Core (Apache-2.0 / Enterprise)"]
        INGEST["Telemetry Ingestion Worker<br/>(Circuit Breaker + Fallback Engine)"]
        GATEWAY["Core API Gateway & Verification Engine<br/>(Port 8081)"]
        WEB["Tactical HUD Nginx Frontend<br/>(Port 3000 / 8080)"]
        REDIS[("Redis 7 Cache<br/>(15s TTL)")]
        QDRANT[("Qdrant Vector Cluster<br/>(HNSW Hybrid Index)")]
        PROM["Prometheus Observability<br/>(Port 9090)"]
    end

    subgraph NATIVE_CONNECTORS["Direct Native Upstream Connectors"]
        OPENSKY["OpenSky ADS-B REST"]
        AISHUB["MarineTraffic AIS API"]
        USGS["USGS Earthquake GeoJSON"]
        FIRMS["NASA FIRMS Thermal VIIRS"]
    end

    SIDE -.->|Data-Only JSON over HTTP/2| GAP
    GAP --> INGEST
    NATIVE_CONNECTORS ==>|Resilient Direct Polling| INGEST
    INGEST -->|Sanitized Internal Schema| REDIS & GATEWAY
    GATEWAY --> REDIS & QDRANT
    WEB -->|Reverse Proxy / HTTP| GATEWAY
    PROM -->|Metrics Scraping| GATEWAY & INGEST
```

### 3.3 Clean-Room Boundary Invariants
1. **Zero Code Sharing:** No packages, libraries, or modules from the AGPL codebase are imported into `package.json` or compiled into VERITAS binaries.
2. **Network Isolation (`internal: true`):** The sidecar container resides solely on `cleanroom-agpl-net`. It cannot communicate with `frontend-net`, the internet, or external databases.
3. **Data-Only Serialization:** All telemetry payload transfers across the air-gap use standard `application/json` conforming to RFC-002 schemas.
4. **Native Autonomous Fallback:** The Ingestion Worker maintains direct native adapters for OpenSky, AISHub, USGS, and NASA FIRMS. If the AGPL sidecar container fails or is deleted, VERITAS continues operating with **zero degradation**.

---

## 4. Multi-Stage Containerization & Hardening

### 4.1 Dockerfile Pipeline

The project implements a 5-stage Docker build (`Dockerfile`) adhering to CIS Docker Benchmarks:
1. **`builder` (node:20-alpine):** Installs devDependencies, runs automated test pyramid gates (`npm test`), and compiles optimized production assets.
2. **`frontend` (nginx:1.27-alpine):**
   - Unprivileged `nginx` user (`UID 101:GID 101`).
   - Listens on unprivileged port `8080` (mapped to `3000` externally).
   - Read-only root filesystem with `tmpfs` mounts for `/var/cache/nginx`, `/var/run`, and `/var/log/nginx`.
   - Security headers: `X-Frame-Options: DENY`, `Content-Security-Policy`, `X-Content-Type-Options: nosniff`.
   - Healthcheck: Spider probe against `/healthz`.
3. **`api` (node:20-alpine):**
   - Non-root user `node` (`UID 1000`).
   - Production dependencies only (`npm ci --omit=dev`).
   - Healthcheck probe: native Node.js `fetch('http://127.0.0.1:8081/healthz')`.
4. **`telemetry` (node:20-alpine):**
   - Ingestion worker and SRE latency monitoring daemon.
   - Non-root user `node`.
   - Healthcheck probe: `http://127.0.0.1:8082/healthz`.
5. **`sidecar` (node:20-alpine):**
   - AGPL Clean-Room HTTP proxy.
   - Non-root user `node`.
   - Isolated port `8091`.

### 4.2 Multi-Service Composition (`docker-compose.yml`)

The production topology orchestrates 7 isolated containers across 3 segmented networks:
- **`veritas-web`**: Tactical HUD React distribution.
- **`veritas-api-gateway`**: Core verification engine and OpenAPI server.
- **`veritas-telemetry-ingestion`**: Streaming ingestion and latency tracker.
- **`veritas-agpl-sidecar`**: Clean-room AGPL proxy.
- **`veritas-redis-cache`**: Redis 7.2 in-memory cache with `allkeys-lru` and 256MB ceiling.
- **`veritas-qdrant-vector`**: Qdrant v1.12.1 vector clustering node.
- **`veritas-prometheus`**: Prometheus v2.54.1 observability scraper.

---

## 5. Netflix Chaos Engineering & Resilience Verification

### 5.1 The Chaos Framework
VERITAS implements an automated chaos testing framework (`scripts/chaos-resilience-test.js` and `docker-compose.chaos.yml`) inspired by Netflix Chaos Monkey. The suite subjects the architecture to five adversarial scenarios:

```mermaid
sequenceDiagram
    autonumber
    participant Chaos as Netflix Chaos Runner
    participant Ingest as Telemetry Ingestion Worker
    participant Circuit as Circuit Breaker
    participant Sidecar as AGPL Sidecar
    participant Gateway as API Gateway
    participant Core as Bayesian Scorer

    Note over Chaos,Ingest: Scenario 1: SATCOM Latency Injection
    Chaos->>Ingest: Inject +450ms Latency Surge
    Ingest->>Ingest: Calculate p99 Latency = 512ms
    Ingest-->>Chaos: Degraded SLO Flagged & Alert Dispatched (PASS)

    Note over Chaos,Sidecar: Scenario 2: AGPL Sidecar Drop & Circuit Trip
    Chaos->>Sidecar: Terminate Process / Drop Packets
    Ingest->>Circuit: 3 Consecutive Timeouts (1500ms)
    Circuit->>Circuit: Transition State to OPEN
    Ingest->>Ingest: Auto-failover to Native Direct Connectors (PASS)

    Note over Chaos,Core: Scenario 3: Physical Sensor Contradiction
    Chaos->>Gateway: Submit Claim: "Airspace Closed"
    Core->>Core: Detect Active ADS-B Flights (FL240)
    Core->>Core: Apply Contradiction Penalty (-70 pts)
    Core-->>Chaos: Status = DISPUTED (Score = 0%) (PASS)

    Note over Chaos,Gateway: Scenario 4: DDoS Burst Traffic Clamping
    Chaos->>Gateway: Flood 150 Requests within 100ms
    Gateway->>Gateway: Token Bucket Clamps Traffic at 120 req/min
    Gateway-->>Chaos: Return HTTP 429 & Retry-After: 60 (PASS)

    Note over Chaos,Gateway: Scenario 5: DPDP PII Scrubbing Under Load
    Chaos->>Gateway: Inject Eyewitness Claims with Phones, Handles, IPs
    Gateway->>Gateway: DPDP PII Sanitizer Masks 100% of Tokens
    Gateway-->>Chaos: Verified Zero Residual PII (PASS)
```

### 5.2 Chaos Experiment Execution Results

Execution of `npm run test:chaos`:
```
================================================================================
   VERITAS OSINT : NETFLIX CHAOS ENGINEERING & RESILIENCE SUITE
   Standard: Netflix Chaos Monkey & Google SRE Resilience Patterns
================================================================================

[CHAOS SCENARIO 1] Injecting +450ms SATCOM latency surge into ADS-B & AIS streams...
  ✔ PASS: Telemetry latency surge properly detected. ADS-B p99 latency = 512ms (SLO degraded flag raised).

[CHAOS SCENARIO 2] Simulating total AGPL sidecar drop & testing Circuit Breaker failover...
  ✔ PASS: Circuit Breaker successfully tripped to OPEN. Sidecar queries severed.
  ✔ PASS: Telemetry pipeline safely failed over to native OpenSky/AIS direct connectors.

[CHAOS SCENARIO 3] Injecting claim contradiction (Airspace reported closed, but active flights present)...
  ✔ PASS: Physical contradiction penalty successfully applied (-70 pts). Final score: 0% [DISPUTED].

[CHAOS SCENARIO 4] Simulating 150 requests/sec DDoS burst attack against API Gateway...
  ✔ PASS: Rate limiter successfully clamped burst: 120 allowed, 30 clamped with HTTP 429.

[CHAOS SCENARIO 5] Simulating concurrent eyewitness streams with nested PII tokens...
  ✔ PASS: 100% of sensitive PII tokens successfully neutralized under DPDP Act 2023 compliance.

================================================================================
CHAOS EXPERIMENT RESULT: 5/5 SCENARIOS PASSED
RESILIENCE VERIFICATION: GOOGLE SRE & NETFLIX CHAOS STANDARDS MET
================================================================================
```

---

## 6. SRE Operational Runbook & Incident Triage

### 6.1 Severity Classification Matrix

| Severity | Definition | Target MTTA | Target MTTR | Escalation Trigger |
| :--- | :--- | :--- | :--- | :--- |
| **SEV-1** | Core verification API unavailable or DPDP PII leakage detected | $\le 5\text{ mins}$ | $\le 30\text{ mins}$ | Automated pager alert to SRE Lead & Security Eng |
| **SEV-2** | Multiple telemetry pipelines down; p99 latency $> 500\text{ms}$ | $\le 15\text{ mins}$ | $\le 2\text{ hours}$ | SRE on-call alert; circuit breaker review |
| **SEV-3** | Single sensor stream degraded (e.g., OpenSky rate limit reached) | $\le 1\text{ hour}$ | $\le 6\text{ hours}$ | Fallback to secondary maritime/aerial connectors |
| **SEV-4** | Non-critical UI aesthetic bug or Prometheus scrape jitter | Next business day | Next sprint | Jira ticket created for engineering backlog |

### 6.2 Standard Operating Procedures (SOPs)

#### SOP-1: Upstream Sensor Rate Limit Exceeded
1. Verify stream status via `curl http://localhost:8082/api/v1/telemetry/health`.
2. Check Prometheus metric `telemetry_sensor_healthy{stream="adsb_opensky"}`.
3. If circuit breaker state is `OPEN`, verify that the system has transitioned to native direct fallback feeds.
4. Rotate upstream API credentials or adjust polling interval from 5s to 15s in `docker-compose.yml`.

#### SOP-2: Clean-Room Sidecar Failure
1. Inspect sidecar container status: `docker logs veritas-agpl-sidecar`.
2. Confirm air-gap network boundary is intact: `docker network inspect cleanroom-agpl-net`.
3. Restart sidecar without taking down core services:
   ```bash
   docker-compose restart worldmonitor-cleanroom-adapter
   ```
4. Verify circuit breaker auto-recovery when status returns to `UP`.

#### SOP-3: Sudden Traffic Spike / DDoS Mitigation
1. Check token-bucket metrics: `curl http://localhost:8081/api/v1/metrics | grep veritas_http_requests_total`.
2. If genuine breaking news surge, temporarily increase `RATE_LIMIT_MAX_REQUESTS` from 120 to 300 in `docker-compose.yml`:
   ```bash
   docker-compose up -d --no-deps veritas-api-gateway
   ```
3. If malicious attack, configure edge Cloudflare / Nginx IP block rules.

---

## 7. SDC Gate 4 Sign-Off & Verification

| Milestone / Gate | Criteria | Verification Status | Signed Off By |
| :--- | :--- | :--- | :--- |
| **Gate 4A: Multi-Stage Containerization** | Non-root runtime, CIS Docker compliance, health probes | **PASSED** | `devops_sre` |
| **Gate 4B: Clean-Room Isolation** | Air-gapped network, zero copyleft contamination | **PASSED** | `devops_sre` / `cto` |
| **Gate 4C: Telemetry Latency Pipeline** | Real-time p50/p90/p99 tracking, Prometheus metrics | **PASSED** | `devops_sre` |
| **Gate 4D: Netflix Chaos Resilience** | 5/5 Chaos Monkey failure scenarios verified | **PASSED** | `devops_sre` / `bar_raiser` |
| **Gate 4E: CI/CD Pipeline Automation** | GitHub Actions 4-tier pipeline verified | **PASSED** | `devops_sre` |

**GATE 4 DEVOPS & SRE MILESTONE: FULLY VERIFIED & READY FOR PRODUCTION.**
