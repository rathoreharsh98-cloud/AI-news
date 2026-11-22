import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { executeVerificationPipeline } from '../../src/engine/crossCheckEngine.js';

describe('End-to-End (E2E) System Verification: Autonomous Verification Pipeline', () => {

  test('E2E-001: Autonomous verification flow for breaking maritime incident (Bab-el-Mandeb)', async () => {
    const claim = 'Commercial tanker fired upon near Bab-el-Mandeb strait in the Red Sea';
    const dossier = await executeVerificationPipeline(claim);

    // 1. Ingestion & Entity Resolution
    assert.equal(dossier.title, claim);
    assert.equal(dossier.category, 'Maritime & Defense');
    assert.equal(dossier.location.country, 'Yemen / Djibouti Waters');
    assert.equal(dossier.location.lat, 12.587);
    assert.equal(dossier.location.lng, 43.342);

    // 2. Parallel 3-Layer Cross-Check
    assert.ok(dossier.parallelVerification.mainstreamWire.length >= 2);
    assert.equal(dossier.parallelVerification.socialPulse.length, 1);
    assert.ok(dossier.parallelVerification.osintTelemetry.length >= 1);
    assert.ok(dossier.parallelVerification.osintTelemetry.some(t => t.system.includes('MarineTraffic')));

    // 3. Multi-Sensor Triangulation (AIS + FIRMS Thermal) yields CORROBORATED
    assert.ok(dossier.corroborationScore >= 80, `Expected score >= 80, got ${dossier.corroborationScore}`);
    assert.equal(dossier.status, 'CORROBORATED');
    assert.ok(dossier.legalSafeguards.provenanceStatement.includes('IT Act 2000 Section 79'));
    assert.equal(dossier.legalSafeguards.piiScrubbed, true);
    assert.equal(dossier.legalSafeguards.safeHarbourCompliant, true);
  });

  test('E2E-002: Autonomous verification flow for seismic disaster (Taiwan offshore)', async () => {
    const claim = 'Major M7.2 shallow earthquake strikes offshore Hualien Taiwan';
    const dossier = await executeVerificationPipeline(claim);

    assert.equal(dossier.category, 'Natural Disasters');
    assert.equal(dossier.urgency, 'CRITICAL');
    assert.equal(dossier.location.country, 'Taiwan');
    assert.ok(dossier.corroborationScore >= 80, `Expected score >= 80, got ${dossier.corroborationScore}`);
    assert.equal(dossier.status, 'CORROBORATED');
    assert.ok(dossier.parallelVerification.osintTelemetry[0].system.includes('USGS'));
    assert.ok(dossier.legalSafeguards.provenanceStatement.includes('IT Act 2000 Section 79'));
  });

  test('E2E-003: Performance SLA & Execution Latency Benchmark', async () => {
    const claim = 'Surveillance flight detected over Western Black Sea off Constanța';
    const iterations = 50;
    const start = performance.now();

    for (let i = 0; i < iterations; i++) {
      await executeVerificationPipeline(claim);
    }

    const elapsed = performance.now() - start;
    const avgLatency = elapsed / iterations;

    // SLA requirement from Product Roadmap: <= 3500ms
    // Google Test Engineering benchmark: execution < 50ms average
    assert.ok(avgLatency < 50, `Average execution latency ${avgLatency.toFixed(2)}ms exceeds 50ms benchmark threshold`);
  });

  test('E2E-004: Stateless Re-entrancy & Hermetic Isolation', async () => {
    const claims = [
      'Oil tanker diverted near Bab-el-Mandeb in Red Sea',
      'Commercial airliner squawk 7700 over Geneva airspace',
      'Major earthquake tremor strikes offshore Hualien Taiwan',
      'Intense wildfire burns through Peloponnese forest basin',
      'Undersea telecommunication cable severed in Baltic Gotland Deep'
    ];

    const results = await Promise.all(claims.map(c => executeVerificationPipeline(c)));

    assert.equal(results.length, 5);
    // Ensure distinct IDs and fingerprints
    const ids = new Set(results.map(r => r.id));
    assert.equal(ids.size, 5, 'Every verification dossier must possess a unique identifier');

    const fingerprints = new Set(results.map(r => r.executionAudit.fingerprint));
    assert.equal(fingerprints.size, 5, 'Every dossier must possess an immutable unique cryptographic fingerprint');

    assert.equal(results[0].category, 'Maritime & Defense');
    assert.equal(results[1].category, 'Aviation & Conflict');
    assert.equal(results[2].category, 'Natural Disasters');
    assert.equal(results[3].category, 'Natural Disasters');
    assert.equal(results[4].category, 'Energy & Infrastructure');
  });
});
