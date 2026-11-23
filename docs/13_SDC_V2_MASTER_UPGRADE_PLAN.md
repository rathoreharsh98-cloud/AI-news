# VERITAS OSINT — SDC v2.0 Master Upgrade Plan

> **Governance:** Software Development Company (SDC) Framework — Executive Product Owner Approved  
> **Baseline:** v1.0 (120/120 tests passing) → **Target:** v2.0 Full Autonomous Live Intelligence Platform

---

## 1. Upgrade Scope & Injected Capabilities

### Module A: Zero-Key Live Telemetry & Breaking News Feeds
1. **USGS Real-Time Earthquakes (`4.5_day.geojson`):** Live M4.5+ seismic events with magnitude shockwave circles & depth telemetry.
2. **NASA EONET v3 Natural Hazards (`api/v3/events`):** Live wildfires (`🔥`), volcanic eruptions (`🌋`), severe storms (`🌀`), and floods (`🌊`) plotted on God's Eye Map.
3. **OpenSky Network Live ADS-B Radar (`api/states/all`):** Live aircraft vectors with **Levchin Anti-Spoofing Invariant** (auto-capping un-triangulated RF beacons in contested EW zones at $\le 75\%$).
4. **GDELT v2 Global News Stream (`api/v2/doc/doc`):** Live breaking international headlines merged into the Ground News–style feed with automatic 5W1H entity extraction, `LIVE GDELT` badges, and 60s client TTL caching + 4s circuit breakers.

### Module B: Live Social Media Status & Pulse Monitor (DPDP Act 2023 Compliant)
- **Service:** `src/services/socialStatusService.js`
- **Public Zero-Key Channels:**
  - **Bluesky Public AppView API** (`public.api.bsky.app/xrpc/app.bsky.feed.searchPosts`) — real-time open social status search.
  - **Reddit Public OSINT Pulse** (`r/worldnews`, `r/OSINT`, `r/geopolitics` JSON) — community situational awareness.
  - **Public Wire & Emergency Channel Health Monitor** — channel operational status (`LIVE` / `CACHED`), post velocity, and botnet/astroturf screening.
- **Mandatory Statutory Privacy Gate:** 100% of ingested social text and author handles pass through `sanitizeSocialSignal()` (`src/engine/piiSanitizer.js`) before rendering—masking emails, `@handles`, IPs, `+91`/international phone numbers, and citizen usernames.
- **UI Component:** `src/components/SocialPulsePanel.jsx` — live channel status bar + sanitized public feed + 1-click **"Cross-Check Claim"** action that opens the Verification Engine prefilled with that social report.

### Module C: Live Claim Cross-Checking & Optional BYO Gemini Key
- **Haversine Geospatial Telemetry Matching (`telemetryLayer.js`):** When `liveMode: true`, queries live USGS quakes ($\le 600$ km), NASA EONET hazards ($\le 500$ km), and OpenSky aircraft ($\le 400$ km) around extracted claim coordinates while preserving all deterministic contradiction rules (NOAA DART tsunami buoys, airspace closure, AIS vessel alive).
- **Live Wire & Social Enrichment (`wireLayer.js`, `socialLayer.js`):** Queries GDELT live articles and DPDP-sanitized social pulses matching claim keywords.
- **Optional BYO Gemini AI Boost (`llmConsensusEngine.js` + `SubmitClaimModal.jsx`):** Users can optionally toggle and enter their own Gemini API key (held locally in browser storage/state only, never sent to any third-party backend) to synthesize live Safe Harbour consensus via `gemini-2.5-flash` with automatic fallback to deterministic consensus on error.

### Module D: iPad & Mobile PWA Polish
- **Installable PWA:** `public/manifest.json`, custom vector icon (`public/icon.svg`), offline-shell Service Worker (`public/sw.js`), Apple mobile web app meta tags (`apple-mobile-web-app-capable`, `viewport-fit=cover`, `theme-color`).
- **Mobile & iPad Bottom Tab Bar (`md:hidden`):** Native-style bottom navigation for **Feed / Map / Social / Verify / Saved / Deck**.
- **Saved / Bookmarked Dossiers:** `localStorage`-persisted bookmarks on `NewsCard.jsx` and `VerificationDossier.jsx` with Saved view filter.
- **Touch-Friendly Map Overlays:** Collapsible mobile layer drawer & ergonomic touch targets on `GodsEyeMap.jsx`.

### Module E: Bar Raiser Hardening, QA & Chaos Verification
- Browser-safe `process.env` guards in engine modules, Content Security Policy hardening, unused draft script removal.
- Expanded unit & integration test suites (`liveTelemetryService.test.js`, `socialStatusService.test.js`, `liveCrossCheck.test.js`).
- Full `npm test`, `npm run test:chaos` (5/5), and `npm run build` verification prior to `origin main` push & GitHub Pages deployment.
