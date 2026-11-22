# VERITAS OSINT | AI News & Telemetry Verification Engine

An autonomous, AI-driven News Aggregation and Open-Source Intelligence (OSINT) verification platform built strictly according to the **News + OSINT Verification App Blueprint**. Inspired by **Ground News**, **God's Eye View**, and **World Monitor**, with real-time multi-source cross-checking and automated legal guardrails.

---

## 🌟 Key Capabilities

### 1. Ground News-Style Multi-Angle Feed
- **Media Bias Footprint**: Visual breakdown of Left, Center, and Right coverage percentages for every breaking news event.
- **Blindspot Detection**: Highlights underreported stories and media echo chambers.
- **Fact vs. Expression Separation**: Transient extraction of entities with outbound source citations, adhering strictly to Section 52 fair dealing principles under the Copyright Act, 1957.

### 2. God's Eye View Geospatial Telemetry (World Monitor)
- **Interactive Dark Matter Map**: Global tactical visualization powered by Leaflet.
- **Live OSINT Layers**:
  - ✈️ **OpenSky ADS-B Radar**: Aircraft altitude drops, emergency squawks (7700), military reconnaissance loitering.
  - 🚢 **Maritime AIS**: Real-time vessel coordinates, sudden speed drops, anchor deployments in subsea cable corridors.
  - 🌍 **USGS Real-Time Seismic Stream**: Earthquakes M4.0+ with P-wave arrival radii and sensor stations.
  - 🔥 **NASA FIRMS Satellite Thermal Anomaly**: VIIRS / MODIS 375m fire radiative power detection.

### 3. Autonomous 5-Step Verification Engine
1. **Step 1: Signal Ingestion**: Continuous polling across mainstream wire APIs and social pulse monitors.
2. **Step 2: Claim & NER Entity Extraction**: Structured parsing of **Who**, **What**, **Where**, and **When**.
3. **Step 3: Parallel 3-Layer Cross-Check**:
   - **Layer 1: Mainstream Wire** (Reuters, AP News, AFP, regional bureaus).
   - **Layer 2: Social Pulse** (Official API Reddit feeds with DPDP PII sanitization).
   - **Layer 3: OSINT Telemetry** (ADS-B radar, AIS transponders, seismometers, satellites).
4. **Step 4: AI Cross-Examination & Consensus**: Agentic cross-referencing of spatial coordinates and timestamp metadata.
5. **Step 5: Corroboration Dossier & Provenance Statement**: Assigns an objective **Corroboration Score** (0–100%) and categorizes as `CORROBORATED`, `DEVELOPING / UNVERIFIED`, or `DISPUTED / CONTRADICTED`.

### 4. Interactive "Ask AI Dossier Copilot"
- Integrated LLM copilot on every story allowing analysts to probe sensor telemetry, check contradictions, and inspect source citations in real-time.

### 5. Legal, Compliance & Safe Harbour Architecture (Blueprint Section 3)
- **Section 356 Bharatiya Nyaya Sanhita (BNS), 2023 & Section 79 IT Act 2000**:
  - Evaluates probabilistic *Corroboration Metrics* rather than defamatory subjective labels ("Fake News", "Liar").
  - Publishes formal, objective provenance statements with inline citations.
- **DPDP Act 2023 & Anti-Doxxing Guardrails**:
  - Automated PII scrubbing on eyewitness posts (usernames removed, biometric faces blurred).
- **AGPL-3.0 Clean Room Isolation**:
  - Ingestion directly from public telemetry REST APIs (OpenSky, USGS, GDELT) to avoid copyleft contamination.
- **IT Intermediary Rules, 2021 Grievance Redressal Desk**:
  - Built-in one-click takedown request and correction desk with 24-hour statutory acknowledgment tracking.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Installation & Run
```bash
# 1. Install dependencies (already installed in workspace)
npm install

# 2. Start the Vite development server
npm run dev

# 3. Build for production
npm run build
```

### CLI Verification Demonstration
You can also run the verification engine directly from the command line:
```bash
node scripts/verify-claim.js "Cargo ship engine fire near Gibraltar"
```

---

## 📁 Project Architecture

```
d:/Google/AI news feed/
├── index.html                   # HTML entry point with Leaflet & typography
├── package.json                 # Dependencies & scripts
├── vite.config.js               # Vite bundler config
├── tailwind.config.js           # Tactical OSINT palette & typography
├── postcss.config.js            # PostCSS configuration
├── scripts/
│   └── verify-claim.js          # CLI Verification Pipeline runner
├── src/
│   ├── main.jsx                 # React root mount
│   ├── App.jsx                  # Main application orchestrator
│   ├── index.css                # Tailwind directives & tactical CSS
│   ├── data/
│   │   └── mockNewsData.js      # OSINT event feeds, telemetry fixtures & bias data
│   └── components/
│       ├── Header.jsx           # Top HUD with live UTC clock & action triggers
│       ├── LegalBanner.jsx      # Safe Harbour & DPDP statutory disclosure banner
│       ├── TelemetryTicker.jsx  # Live stream status for all 5 telemetry pipelines
│       ├── GodsEyeMap.jsx       # Leaflet-powered geospatial tactical map with layers
│       ├── NewsCard.jsx         # Ground News bias bar, blindspots & status badges
│       ├── VerificationDossier.jsx # 5-step breakdown, 3-layer matrix & Ask AI copilot
│       ├── SubmitClaimModal.jsx # Live 5-step agent execution modal for custom claims
│       └── LegalGuardrailsModal.jsx # 4-pillar legal framework & Grievance Desk
```
