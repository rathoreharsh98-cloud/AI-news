import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { executeVerificationPipeline } from '../../src/engine/crossCheckEngine.js';
import { haversineDistanceKm } from '../../src/services/mapDataService.js';
import { LLMConsensusEngine } from '../../src/engine/llmConsensusEngine.js';

describe('Integration Test: v2.0 Live Cross-Checking & Optional BYO Gemini Engine', () => {
  it('LIVE-001: haversineDistanceKm accurately calculates great-circle distance and handles invalid inputs', () => {
    assert.equal(haversineDistanceKm(18.938, 72.835, 18.938, 72.835), 0);
    // Mumbai to Delhi is ~1,148 km
    const mumbaiDelhi = haversineDistanceKm(18.938, 72.835, 28.6139, 77.209);
    assert.ok(mumbaiDelhi > 1100 && mumbaiDelhi < 1200, `Expected ~1148 km, got ${mumbaiDelhi}`);
    assert.equal(haversineDistanceKm(null, 0, 10, 10), Infinity);
  });

  it('LIVE-002: executeVerificationPipeline with liveMode=true enriches Taiwan seismic claim with geospatial USGS & DPDP social matches', async () => {
    const claim = 'M6.3 shallow earthquake reported offshore Hualien Taiwan';
    const dossier = await executeVerificationPipeline(claim, 'Taiwan', { liveMode: true });

    assert.equal(dossier.status, 'CORROBORATED');
    assert.ok(dossier.corroborationScore >= 80);
    assert.ok(
      dossier.parallelVerification.osintTelemetry.some(t =>
        t.system.includes('USGS Live GeoJSON') ||
        t.system.includes('NASA EONET v3 Live') ||
        t.system.includes('OpenSky Live ADS-B') ||
        t.system.includes('Live Geospatial OSINT Sweep')
      ),
      'Live mode should attach a live geospatial OSINT sensor match or transparent sweep audit record'
    );
    assert.ok(
      dossier.parallelVerification.socialPulse.length >= 2,
      'Live mode should enrich social pulse with sanitized social status records'
    );
    assert.ok(
      dossier.parallelVerification.socialPulse.every(s => s.piiScrubbed === true),
      'Every live social pulse record must be DPDP PII scrubbed'
    );
  });

  it('LIVE-003: executeVerificationPipeline with liveMode=true strictly preserves hard physical contradiction penalties (NOAA DART)', async () => {
    const claim = 'Massive tsunami wave destroys Mumbai coastline';
    const dossier = await executeVerificationPipeline(claim, 'Mumbai', { liveMode: true });

    assert.equal(dossier.status, 'DISPUTED');
    assert.ok(dossier.corroborationScore < 40);
    assert.ok(dossier.parallelVerification.osintTelemetry.some(t => t.status === 'CONTRADICTED'));
    assert.ok(dossier.legalSafeguards.provenanceStatement.includes('Bharatiya Nyaya Sanhita (BNS) Section 356'));
  });

  it('LIVE-004: LLMConsensusEngine falls back cleanly to Safe Harbour deterministic synthesis when BYO Gemini key fails or is offline', async () => {
    const engine = new LLMConsensusEngine();
    const consensus = await engine.synthesizeConsensus({
      claimText: 'Commercial tanker diverted in Bab-el-Mandeb Strait',
      entities: { location: { name: 'Bab-el-Mandeb Strait / Red Sea', lat: 12.587, lng: 43.342 } },
      wireResult: { sources: [{ source: 'Reuters' }, { source: 'AP' }] },
      socialResult: { signals: [] },
      telemetryResult: { telemetryContradicted: false, records: [{ system: 'AIS', status: 'MATCHED', details: 'Track verified' }] },
      corroborationResult: { score: 92, status: 'CORROBORATED' },
      geminiApiKey: 'AIzaInvalidTestKey12345'
    });

    assert.equal(consensus.aiProvider, 'Deterministic Agentic Consensus');
    assert.ok(consensus.executiveSummary.length > 30);
    assert.ok(!/\b(fake news|liars|hoax)\b/i.test(consensus.executiveSummary), 'Must remain Safe Harbour non-defamatory');
  });
});
