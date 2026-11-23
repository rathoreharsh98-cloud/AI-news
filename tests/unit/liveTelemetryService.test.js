import { describe, it } from 'node:test';
import assert from 'node:assert';
import { 
  fetchLiveEarthquakes, 
  fetchLiveDisasters, 
  fetchLiveFlights, 
  getLiveTelemetryCounts, 
  isContestedZone, 
  formatTimeAgo,
  CONTESTED_ZONES
} from '../../src/services/mapDataService.js';

describe('Unit Test: Live OSINT Telemetry Pipeline (v2.0 Phase 1)', () => {
  it('TEL-001: fetchLiveEarthquakes returns valid USGS seismic records or deterministic fallbacks', async () => {
    const quakes = await fetchLiveEarthquakes();
    assert.ok(Array.isArray(quakes), 'Must return an array of seismic events');
    assert.ok(quakes.length >= 1, 'Should return at least 1 seismic event');

    const first = quakes[0];
    assert.strictEqual(first.type, 'seismic');
    assert.ok(typeof first.lat === 'number', 'Latitude must be a number');
    assert.ok(typeof first.lng === 'number', 'Longitude must be a number');
    assert.ok(typeof first.magnitude === 'number', 'Magnitude must be a number');
    assert.ok(first.label.includes('USGS'), 'Label must cite USGS source');
    assert.ok(first.apiSource.includes('USGS'), 'API source must identify USGS stream');
  });

  it('TEL-002: fetchLiveDisasters returns valid NASA EONET hazards with category classification', async () => {
    const disasters = await fetchLiveDisasters();
    assert.ok(Array.isArray(disasters), 'Must return an array of hazards');
    assert.ok(disasters.length >= 1, 'Should return at least 1 hazard event');

    const first = disasters[0];
    assert.strictEqual(first.type, 'disaster');
    assert.ok(typeof first.lat === 'number', 'Latitude must be a number');
    assert.ok(typeof first.lng === 'number', 'Longitude must be a number');
    assert.ok(typeof first.disasterType === 'string', 'Disaster category must be a string');
    assert.ok(first.label.includes('NASA EONET'), 'Label must cite NASA EONET');
    assert.ok(first.apiSource.includes('NASA'), 'Source must identify NASA');
  });

  it('TEL-003: fetchLiveFlights returns ADS-B tracks and enforces Levchin Anti-Spoofing Invariant in contested zones', async () => {
    const flights = await fetchLiveFlights();
    assert.ok(Array.isArray(flights), 'Must return an array of flights');
    assert.ok(flights.length >= 1, 'Should return at least 1 flight vector');

    // Find contested flight (e.g. Bab-el-Mandeb / Black Sea)
    const contestedFlight = flights.find(f => f.contestedZone === true);
    if (contestedFlight) {
      assert.ok(contestedFlight.confidenceCap <= 75, 'Contested zone flight must cap confidence <= 75% pursuant to Levchin Invariant');
      assert.ok(contestedFlight.antiSpoofingNote.includes('Levchin Invariant'), 'Must detail Levchin anti-spoofing note');
    }

    // Standard flight format validation
    const first = flights[0];
    assert.strictEqual(first.type, 'flight');
    assert.ok(typeof first.lat === 'number');
    assert.ok(typeof first.lng === 'number');
    assert.ok(typeof first.speed === 'string');
    assert.ok(typeof first.alt === 'string');
  });

  it('TEL-004: isContestedZone correctly identifies high-risk electronic warfare corridors', () => {
    // Red Sea / Bab-el-Mandeb coordinates (12.587, 43.342)
    assert.strictEqual(isContestedZone(12.587, 43.342), true, 'Bab-el-Mandeb must be marked contested');

    // Taiwan Strait coordinates (24.0, 120.5)
    assert.strictEqual(isContestedZone(24.0, 120.5), true, 'Taiwan Strait must be marked contested');

    // Black Sea coordinates (44.0, 32.0)
    assert.strictEqual(isContestedZone(44.0, 32.0), true, 'Black Sea must be marked contested');

    // Non-contested location (Mumbai central: 18.938, 72.835)
    assert.strictEqual(isContestedZone(18.938, 72.835), false, 'Mumbai must not be marked contested');

    // Non-contested location (Kansas USA: 39.0, -98.0)
    assert.strictEqual(isContestedZone(39.0, -98.0), false, 'Kansas must not be marked contested');

    // Edge case: invalid coordinates
    assert.strictEqual(isContestedZone(null, undefined), false, 'Null coordinates must return false safely');
  });

  it('TEL-005: getLiveTelemetryCounts returns unified active pipeline metrics for telemetry ticker', async () => {
    const counts = await getLiveTelemetryCounts();
    assert.ok(typeof counts.quakesCount === 'number');
    assert.ok(typeof counts.disastersCount === 'number');
    assert.ok(typeof counts.flightsCount === 'number');
    assert.strictEqual(counts.liveStreamsOperational, 5);
    assert.ok(counts.totalSensorsActive > 0);
  });

  it('TEL-006: formatTimeAgo formats epoch timestamps accurately into readable strings', () => {
    const now = Date.now();
    assert.strictEqual(formatTimeAgo(now - 10000), '10s ago');
    assert.strictEqual(formatTimeAgo(now - 120000), '2m ago');
    assert.strictEqual(formatTimeAgo(now - 7200000), '2h ago');
    assert.strictEqual(formatTimeAgo(now - 172800000), '2d ago');
    assert.strictEqual(formatTimeAgo(null), 'Recently');
  });
});
