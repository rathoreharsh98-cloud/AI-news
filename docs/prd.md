# VERITAS OSINT — Product Requirements Document (PRD)

**Version:** 1.0.0  
**Status:** In Review (Phase 1 PM Sign-off)  
**Target Milestone:** Time-Sensitive Fullstack Delivery  
**Deployment Target:** Existing React Frontend + Node.js API Backend via Docker / Docker Compose  

---

## 1. Problem Statement & Strategic Goals

In breaking geopolitical, conflict, and disaster scenarios, public news feeds and social media are inundated with partisan bias, unverified rumors, and coordinated disinformation. Mainstream fact-checkers respond hours or days late. 

**VERITAS OSINT** solves this by providing a frictionless, zero-barrier intelligence platform for readers. It combines **Ground News-style multi-angle bias breakdown** with **real-time physical sensor telemetry** (USGS seismic sensors, NASA satellite thermal anomalies, and OpenSky ADS-B flight transponders) and an **autonomous 5-step verification pipeline**.

### Primary Success Metrics:
- **Instant Situational Awareness:** Feed and telemetry load latency under 200ms from cached endpoints.
- **Verification Velocity:** End-to-end claim cross-check and dossier synthesis completed in under 2.5 seconds.
- **Provenance Transparency:** 100% of claims output an objective mathematical Corroboration Score (0–100%) and Safe Harbour provenance statement without defamatory editorializing (BNS Section 356 / IT Act Section 79 compliant).

---

## 2. User Personas & Permissions Matrix

The platform operates on a **frictionless, zero-auth public model** to prioritize immediate speed and broad public access.

| Persona | Authentication | Permissions & Capabilities | Boundaries / Limitations |
| :--- | :--- | :--- | :--- |
| **Public Reader** | None (Anonymous) | - View breaking news feeds & bias footprints<br>- Inspect interactive God's Eye telemetry map<br>- View complete 5-step verification dossiers<br>- Search & filter feeds by bias, state, and sensor<br>- Export dossiers (JSON/Markdown) & shareable cards<br>- Save stories to browser session (`localStorage`) | Cannot bypass rate limits; cannot modify system configurations or published wire baselines. |
| **Claim Submitter** | None (Anonymous) | - Submit custom breaking news claims or URLs for live 5-step AI cross-examination | Subject to IP-based rate limiting (5 requests/minute) to prevent abuse and API exhaustion. |

---

## 3. Prioritized Core User Journeys

### Journey 1: Live Tactical News & Telemetry HUD (Read & Observe)
*As a Reader, I want to view breaking news paired with real-time physical sensor telemetry so that I can immediately detect media blindspots and ground-truth anomalies.*

- **User Story 1.1: Multi-Angle Bias Footprint**
  - **Given** the Reader opens the VERITAS dashboard,
  - **When** the breaking news feed renders,
  - **Then** each story displays Left, Center, and Right coverage percentages, a blindspot indicator, and outbound source citations.
- **User Story 1.2: God's Eye Geospatial Telemetry Overlay**
  - **Given** the interactive map view is active,
  - **When** the Reader inspects the global tactical map,
  - **Then** live telemetry layers (USGS M4.5+ earthquakes, NASA FIRMS/EONET thermal & disaster alerts, and OpenSky ADS-B flights) are rendered as interactive geospatial markers with hover telemetry tooltips.

---

### Journey 2: 5-Step Claim Verification with Shareable Cards & Export (Option C)
*As a Reader, I want to inspect a transparent 5-step verification dossier and export a clean intelligence brief or shareable card so that I can share verified facts across messaging and social networks.*

- **User Story 2.1: 5-Step Autonomous Cross-Checking**
  - **Given** the Reader clicks any news item or submits a breaking claim,
  - **When** the verification pipeline executes,
  - **Then** the backend queries Wire feeds, DPDP-sanitized Social Pulse, and physical sensor telemetry in parallel, returning a Corroboration Score (0–100%), status badge (`CORROBORATED`, `DEVELOPING`, or `DISPUTED`), and a statutory Safe Harbour provenance statement.
- **User Story 2.2: Shareable Dossier Card Generation**
  - **Given** a generated verification dossier,
  - **When** the Reader clicks "Share Dossier",
  - **Then** the system presents a high-contrast tactical summary card formatted for social/chat previews, with a direct copyable link and quick clipboard action.
- **User Story 2.3: Intelligence Dossier Export**
  - **Given** an open verification dossier,
  - **When** the Reader clicks "Export Dossier",
  - **Then** the complete 5W1H entity breakdown, sensor citations, and cross-check matrix download instantly as a formatted Markdown (`.md`) or JSON file.

---

### Journey 3: Smart Search, Multi-Filter & Sensor Drilldown (Option B)
*As a Reader, I want to search and filter stories by bias spectrum, verification state, and telemetry source so that I can zero in on specific emerging crises.*

- **User Story 3.1: Full-Text Keyword Search**
  - **Given** a library of ingested and verified stories,
  - **When** the Reader types keywords in the search bar,
  - **Then** matching events update dynamically across both the feed list and the geospatial map.
- **User Story 3.2: Multi-Dimension Filtering**
  - **Given** the active feed,
  - **When** the Reader toggles filter pills (Bias: Left/Center/Right; Status: Corroborated/Developing/Disputed; Sensor: Seismic/Aviation/Thermal),
  - **Then** the feed instantly filters to only show matching stories with zero reload latency.

---

## 4. Legal & Regulatory Guardrails

1. **BNS Section 356 & IT Act Section 79 Safe Harbour:**
   - Evaluates probabilistic corroboration metrics rather than subjective defamatory terms ("Fake News", "Liar").
   - Publishes objective provenance statements with explicit sensor and wire citations.
2. **DPDP Act 2023 Anti-Doxxing Invariants:**
   - 100% of social signals must pass through `piiSanitizer.js` to scrub `@handles`, emails, IPs, and telephone numbers before entering the client or dossier.
3. **Levchin Anti-Spoofing Invariant:**
   - Un-triangulated single-beacon RF transponders in contested electronic warfare corridors are capped at $\le 75\%$ confidence.

---

## 5. Explicit Non-Goals (Out of Scope for this Milestone)

To guarantee rapid, time-sensitive delivery without scope creep:
- ❌ **No Paid Subscriptions / Billing:** No Stripe, payment gateways, or gated paywalls.
- ❌ **No Native App Store Binaries:** No React Native, Swift, or Kotlin builds; platform will be served as a responsive Web App / PWA.
- ❌ **No Complex Enterprise RBAC / Multi-Tenancy:** No organizational team hierarchies, invite links, or role-based user management.
- ❌ **No Automated Bot Publishing:** No automated autonomous posting of dossiers to external Twitter/X, Bluesky, or Telegram channels.

---

## 6. Technical Architecture & Non-Functional Constraints

- **Frontend:** Existing React 18 + Vite + Tailwind CSS + Leaflet map components.
- **Backend API:** Lightweight, production-grade Node.js/Express REST server providing:
  - `GET /api/feed` (breaking news with cached Ground News bias data)
  - `GET /api/telemetry` (live unified USGS, NASA, and OpenSky streams)
  - `POST /api/verify` (5-step verification pipeline runner with rate limiting)
  - `GET /api/dossier/:id` (dossier retrieval for export and share card rendering)
- **Caching Layer:** In-memory TTL cache with 60s freshness to respect upstream telemetry quotas and maintain < 200ms latency.
- **Containerization & Deployment:**
  - Multi-stage `Dockerfile` building frontend assets and running the Node.js production server.
  - `docker-compose.yml` for single-command reproducible local/production startup (`docker compose up --build`).
