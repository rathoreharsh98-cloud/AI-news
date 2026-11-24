/**
 * VERITAS OSINT - Intelligence Dossier Exporter, Share Card Synthesizer & Multi-Filter Engine
 * Shared across Backend API (`src/server/apiServer.js`) and Frontend HUD (`src/App.jsx`, `VerificationDossier.jsx`).
 */

/**
 * Evaluates whether a story matches a specific political bias filter dimension.
 * @param {object} story
 * @param {string} biasFilter - 'ALL' | 'LEFT' | 'CENTER' | 'RIGHT' | 'BLINDSPOT'
 * @returns {boolean}
 */
export function matchesBiasFilter(story, biasFilter = 'ALL') {
  if (!biasFilter || biasFilter === 'ALL') return true;
  const dist = story?.biasDistribution || { left: 33, center: 34, right: 33 };
  const left = Number(dist.left ?? 33);
  const center = Number(dist.center ?? 34);
  const right = Number(dist.right ?? 33);
  const blindspotText = String(story?.blindspots || '').toLowerCase();

  switch (biasFilter.toUpperCase()) {
    case 'LEFT':
      return left >= 34 || (left > right + 10);
    case 'CENTER':
      return center >= 45 || (Math.abs(left - right) <= 5 && center >= 33);
    case 'RIGHT':
      return right >= 34 || (right > left + 10);
    case 'BLINDSPOT':
      return (
        left <= 20 ||
        right <= 20 ||
        blindspotText.includes('underreported') ||
        blindspotText.includes('echo-chamber') ||
        blindspotText.includes('blindspot')
      );
    default:
      return true;
  }
}

/**
 * Evaluates whether a story's telemetry layers match a specific physical sensor filter.
 * @param {object} story
 * @param {string} sensorFilter - 'ALL' | 'SEISMIC' | 'THERMAL' | 'AVIATION' | 'MARITIME'
 * @returns {boolean}
 */
export function matchesSensorFilter(story, sensorFilter = 'ALL') {
  if (!sensorFilter || sensorFilter === 'ALL') return true;
  const telemetryList = story?.parallelVerification?.osintTelemetry || [];
  const combinedTelemetryText = [
    story?.title || '',
    story?.category || '',
    ...telemetryList.map((t) => `${t.system || ''} ${t.details || ''} ${t.icon || ''}`)
  ]
    .join(' ')
    .toLowerCase();

  switch (sensorFilter.toUpperCase()) {
    case 'SEISMIC':
      return /usgs|seismic|earthquake|quake|tectonic|hydrophone|p-wave|dart/.test(combinedTelemetryText);
    case 'THERMAL':
      return /firms|thermal|viirs|modis|sentinel|wildfire|fire|eonet|infrared|satellite/.test(combinedTelemetryText);
    case 'AVIATION':
      return /ads-b|opensky|flight|aviation|airspace|notam|poseidon|radar|aircraft|plane/.test(combinedTelemetryText);
    case 'MARITIME':
      return /ais|maritime|vessel|ship|tanker|mmsi|subsea|buoy|strait|carrier/.test(combinedTelemetryText);
    default:
      return true;
  }
}

/**
 * Multi-dimension story filter engine (Journey 3 - Option B).
 * Supports keyword search, category, verification status, bias footprint, sensor layer, and saved bookmarks.
 * @param {Array<object>} stories
 * @param {object} filters
 * @returns {Array<object>}
 */
export function filterStories(stories = [], filters = {}) {
  if (!Array.isArray(stories)) return [];
  const {
    q = '',
    category = 'ALL',
    status = 'ALL',
    bias = 'ALL',
    sensor = 'ALL',
    savedOnly = false,
    savedIds = []
  } = filters;

  const query = String(q || '').trim().toLowerCase();

  return stories.filter((story) => {
    if (!story) return false;
    if (savedOnly && Array.isArray(savedIds) && !savedIds.includes(story.id)) {
      return false;
    }

    if (query) {
      const whoList = Array.isArray(story.entities?.who) ? story.entities.who : [];
      const searchable = [
        story.id,
        story.title,
        story.summary,
        story.category,
        story.location?.name,
        story.location?.country,
        story.entities?.what,
        story.entities?.where,
        ...whoList
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      if (!searchable.includes(query)) {
        return false;
      }
    }

    if (category && category !== 'ALL' && story.category !== category) {
      return false;
    }

    if (status && status !== 'ALL' && story.status !== status) {
      return false;
    }

    if (!matchesBiasFilter(story, bias)) {
      return false;
    }

    if (!matchesSensorFilter(story, sensor)) {
      return false;
    }

    return true;
  });
}

/**
 * Generates a structured Shareable Dossier Card summary & plain-text social brief (Journey 2 - Option C).
 * @param {object} story
 * @returns {object}
 */
export function generateShareCardData(story) {
  if (!story) return null;
  const dist = story.biasDistribution || { left: 33, center: 34, right: 33 };
  const lat = typeof story.location?.lat === 'number' ? story.location.lat.toFixed(3) : '0.000';
  const lng = typeof story.location?.lng === 'number' ? story.location.lng.toFixed(3) : '0.000';
  const wireCount = story.parallelVerification?.mainstreamWire?.length || 0;
  const socialCount = story.parallelVerification?.socialPulse?.length || 0;
  const telemetryCount = story.parallelVerification?.osintTelemetry?.length || 0;
  const provenance =
    story.legalSafeguards?.provenanceStatement ||
    'Evaluated under IT Act 2000 Section 79 & BNS Section 356 Safe Harbour parameters.';

  const shareText = [
    `🛡️ VERITAS OSINT VERIFICATION BRIEF [#${story.id}]`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `📌 CLAIM: ${story.title}`,
    `📊 VERDICT: ${story.status} (${story.corroborationScore}% Multi-Sensor Corroboration)`,
    `📍 GEOLOCATION: ${story.location?.name || 'Global'} (${lat}°N, ${lng}°E)`,
    `⚖️ MEDIA BIAS FOOTPRINT: Left ${dist.left}% | Center ${dist.center}% | Right ${dist.right}%`,
    `🛰️ 3-LAYER CROSS-CHECK: ${wireCount} Wire Agencies • ${socialCount} DPDP-Scrubbed Social Streams • ${telemetryCount} Physical OSINT Sensors`,
    `📜 SAFE HARBOUR PROVENANCE: ${provenance}`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `Verified via VERITAS OSINT Autonomous Telemetry Engine`
  ].join('\n');

  return {
    dossierId: story.id,
    title: story.title,
    status: story.status,
    corroborationScore: story.corroborationScore,
    category: story.category,
    locationName: story.location?.name || 'Global',
    coordinates: `${lat}°N, ${lng}°E`,
    biasDistribution: dist,
    layerCounts: {
      wire: wireCount,
      social: socialCount,
      telemetry: telemetryCount
    },
    provenanceStatement: provenance,
    utcTimestamp: story.utcTimestamp || new Date().toISOString(),
    shareText
  };
}

/**
 * Generates a formatted Markdown (.md) Intelligence Dossier for 1-click export (Journey 2 - Option C).
 * @param {object} story
 * @returns {string}
 */
export function generateMarkdownBrief(story) {
  if (!story) return '';
  const dist = story.biasDistribution || { left: 33, center: 34, right: 33 };
  const lat = typeof story.location?.lat === 'number' ? story.location.lat.toFixed(4) : '0.0000';
  const lng = typeof story.location?.lng === 'number' ? story.location.lng.toFixed(4) : '0.0000';
  const who = Array.isArray(story.entities?.who) ? story.entities.who.join(', ') : 'N/A';
  const wires = story.parallelVerification?.mainstreamWire || [];
  const socials = story.parallelVerification?.socialPulse || [];
  const telemetry = story.parallelVerification?.osintTelemetry || [];

  const wireLines = wires.length
    ? wires
        .map(
          (w) =>
            `- **${w.source}** (Bias: \`${w.bias}\` | Reliability: \`${w.reliability}%\` | Verdict: **${w.verdict}**)\n  > "${w.quote}"`
        )
        .join('\n')
    : '- No mainstream wire dispatches indexed.';

  const socialLines = socials.length
    ? socials
        .map(
          (s) =>
            `- **${s.source}** (${s.authorType || 'DPDP Scrubbed'} | Signal: \`${s.signalStrength}\` | PII Scrubbed: \`${Boolean(s.piiScrubbed)}\`)\n  > "${s.content}"`
        )
        .join('\n')
    : '- No social pulse signals indexed.';

  const telemetryLines = telemetry.length
    ? telemetry
        .map((t) => `- **${t.system}** — Status: \`[${t.status}]\`\n  - Details: ${t.details}`)
        .join('\n')
    : '- No physical telemetry anomalies indexed.';

  return `# VERITAS OSINT — Forensic Verification Dossier #${story.id}

**Headline:** ${story.title}  
**Verification Status:** \`${story.status}\`  
**Corroboration Score:** **${story.corroborationScore}%**  
**Domain Category:** ${story.category}  
**Urgency Level:** \`${story.urgency || 'HIGH'}\`  
**Geolocation Fix:** ${story.location?.name || 'Global'} (\`${lat}° N, ${lng}° E\`)  
**UTC Timestamp:** \`${story.utcTimestamp || new Date().toISOString()}\`  

---

## 1. Executive Summary & 5W1H Entity Extraction

${story.summary}

| Entity Dimension | Extracted Value |
| :--- | :--- |
| **WHO (Actors)** | ${who} |
| **WHAT (Event)** | ${story.entities?.what || story.title} |
| **WHERE (Location)** | ${story.entities?.where || story.location?.name || 'Global'} |
| **WHEN (Timestamp)** | ${story.entities?.when || story.utcTimestamp || 'Live'} |

---

## 2. Ground News Multi-Angle Media Bias Footprint

- **Left-Leaning Coverage:** \`${dist.left}%\`
- **Center / Balanced Coverage:** \`${dist.center}%\`
- **Right-Leaning Coverage:** \`${dist.right}%\`
- **Blindspot Analysis:** ${story.blindspots || 'Balanced multi-spectrum coverage.'}

---

## 3. Parallel 3-Layer Cross-Check Evidence Matrix

### Layer 1: Mainstream Wire Agencies (${wires.length})
${wireLines}

### Layer 2: DPDP-Sanitized Social Pulse (${socials.length})
${socialLines}

### Layer 3: Physical OSINT Sensor Telemetry (${telemetry.length})
${telemetryLines}

---

## 4. Statutory Safe Harbour & Legal Provenance Statement

- **Statutory Framework:** ${story.legalSafeguards?.legalSection || 'Section 79 IT Act 2000 & BNS Section 356'}
- **DPDP Act 2023 PII Scrubbed:** \`${Boolean(story.legalSafeguards?.piiScrubbed ?? true)}\`
- **Safe Harbour Compliant:** \`${Boolean(story.legalSafeguards?.safeHarbourCompliant ?? true)}\`

> **Official Provenance Statement:**  
> ${story.legalSafeguards?.provenanceStatement || 'Probabilistic multi-sensor corroboration output.'}
`;
}
