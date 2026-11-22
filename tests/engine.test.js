import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { 
  extractEntities, 
  sanitizeSocialSignal, 
  calculateCorroborationScore, 
  generateProvenanceStatement,
  executeVerificationPipeline
} from '../src/engine/index.js';

describe('VERITAS OSINT Engine - QA Test Suite (SDC Gate 2 Verification)', () => {

  test('TSK-101: extractEntities should accurately extract spatial coordinates and urgency', () => {
    const claim = 'Commercial cargo vessel drone attack near Bab-el-Mandeb strait';
    const result = extractEntities(claim);

    assert.equal(typeof result, 'object');
    assert.ok(result.who.length > 0);
    assert.equal(result.what, claim);
    assert.ok(result.location.name.includes('Bab-el-Mandeb'));
    assert.equal(result.location.lat, 12.587);
    assert.equal(result.location.lng, 43.342);
    assert.equal(result.urgency, 'CRITICAL');
  });

  test('TSK-102: sanitizeSocialSignal should mask handles, emails, IPs and phones (DPDP Act 2023)', () => {
    const rawContent = 'Check with @citizen_john at user@example.com from 192.168.1.1 or call 555-019-2834 for footage';
    const sanitized = sanitizeSocialSignal(rawContent, 'anonymous_user_44');

    assert.ok(!sanitized.text.includes('@citizen_john'));
    assert.ok(sanitized.text.includes('@[REDACTED_HANDLE]'));
    assert.ok(!sanitized.text.includes('user@example.com'));
    assert.ok(sanitized.text.includes('[REDACTED_EMAIL]'));
    assert.ok(!sanitized.text.includes('192.168.1.1'));
    assert.ok(sanitized.text.includes('[REDACTED_IP]'));
    assert.ok(sanitized.author.includes('DPDP Act 2023'));
    assert.equal(sanitized.piiScrubbed, true);
  });

  test('TSK-103: calculateCorroborationScore should return CORROBORATED for multi-source matches', () => {
    const result = calculateCorroborationScore({
      wireAgenciesCount: 3,
      averageWireReliability: 96,
      socialSignalStrength: 'High',
      telemetryMatches: 2,
      telemetryContradicted: false
    });

    assert.ok(result.score >= 80, `Expected score >= 80, got ${result.score}`);
    assert.equal(result.status, 'CORROBORATED');
    assert.equal(result.breakdown.penaltyApplied, 0);
  });

  test('TSK-104: calculateCorroborationScore should apply heavy penalty and flag DISPUTED on contradiction', () => {
    const result = calculateCorroborationScore({
      wireAgenciesCount: 1,
      averageWireReliability: 85,
      socialSignalStrength: 'False Alarm',
      telemetryMatches: 0,
      telemetryContradicted: true
    });

    assert.ok(result.score < 40, `Expected score < 40, got ${result.score}`);
    assert.equal(result.status, 'DISPUTED');
    assert.equal(result.breakdown.penaltyApplied, 65);
  });

  test('TSK-105: generateProvenanceStatement should maintain Safe Harbour compliance', () => {
    const stmt = generateProvenanceStatement({
      status: 'CORROBORATED',
      claimText: 'Tanker diversion',
      wireSourcesCount: 2,
      telemetryMatches: 3
    });

    assert.ok(stmt.includes('Corroborated:'));
    assert.ok(stmt.includes('IT Act 2000 Section 79'));
    assert.ok(!stmt.includes('Fake News'));
    assert.ok(!stmt.includes('Liar'));
  });

  test('TSK-106: executeVerificationPipeline should successfully execute the full 5-step flow', async () => {
    const result = await executeVerificationPipeline('M6.5 earthquake off the coast of Hualien Taiwan', 'Taiwan');

    assert.equal(typeof result.id, 'string');
    assert.equal(result.status, 'CORROBORATED');
    assert.ok(result.corroborationScore >= 80);
    assert.equal(result.category, 'Natural Disasters');
    assert.equal(result.parallelVerification.mainstreamWire.length, 2);
    assert.equal(result.parallelVerification.socialPulse.length, 1);
    assert.ok(result.parallelVerification.osintTelemetry.length >= 1);
    assert.equal(result.legalSafeguards.piiScrubbed, true);
    assert.equal(result.legalSafeguards.safeHarbourCompliant, true);
  });

});
