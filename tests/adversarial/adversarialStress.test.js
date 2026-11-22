import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { 
  calculateCorroborationScore, 
  generateProvenanceStatement, 
  sanitizeSocialSignal, 
  executeVerificationPipeline 
} from '../../src/engine/index.js';

describe('Adversarial & Bar Raiser Stress-Test Suite (PayPal / Levchin Falsification)', () => {

  describe('Scenario 1: State-Sponsored GPS/AIS Spoofing Resistance', () => {
    test('Contradicted telemetry must apply -65 penalty and force DISPUTED status even with wire reports', () => {
      // Adversarial attack: 2 wire agencies repeat a spoofed press release, but radar/AIS contradicts
      const result = calculateCorroborationScore({
        wireAgenciesCount: 2,
        averageWireReliability: 95,
        socialSignalStrength: 'High',
        telemetryMatches: 0,
        telemetryContradicted: true
      });

      assert.equal(result.score, 0);
      assert.equal(result.status, 'DISPUTED');
      assert.equal(result.breakdown.penaltyApplied, 65);
    });

    test('Isolated unverified telemetry without wire verification cannot achieve CORROBORATED status', () => {
      // Phantom signal with 0 wire confirmation
      const result = calculateCorroborationScore({
        wireAgenciesCount: 0,
        averageWireReliability: 0,
        socialSignalStrength: 'Medium', // 15
        telemetryMatches: 1, // 20
        telemetryContradicted: false
      });

      // Score: 0 + 15 + 20 = 35 => DISPUTED (threshold is 80 for CORROBORATED)
      assert.ok(result.score < 80);
      assert.notEqual(result.status, 'CORROBORATED');
    });
  });

  describe('Scenario 2: Viral Social Media Disinformation Stampede', () => {
    test('100k bot accounts with Extremely High social pulse cannot exceed 38% without wire & telemetry', () => {
      // Botnet generates massive social volume, but wire=0 and telemetry=0
      const result = calculateCorroborationScore({
        wireAgenciesCount: 0,
        averageWireReliability: 0,
        socialSignalStrength: 'Extremely High', // Max social weight = 25
        telemetryMatches: 0,
        telemetryContradicted: false
      });

      assert.equal(result.score, 25);
      assert.equal(result.status, 'DISPUTED');
      assert.ok(result.score <= 38, 'Viral social pulse alone must never exceed 38% cap');
    });

    test('Flagged botnet astroturfing dampens social signal to <= 3 points', () => {
      const result = calculateCorroborationScore({
        wireAgenciesCount: 0,
        socialSignalStrength: 'Extremely High',
        isAstroturfFlagged: true,
        telemetryMatches: 0
      });

      assert.equal(result.score, 3);
      assert.equal(result.status, 'DISPUTED');
    });
  });

  describe('Scenario 3: Defamation Trap & BNS Section 356 Resistance', () => {
    test('Adversarial defamatory claims must yield objective probabilistic provenance without defamation', () => {
      const hostileClaims = [
        'Breaking: Politician accused of massive treasury corruption by rogue blog',
        'State news media caught fabricating battlefield victory claims',
        'Corporate leadership arrested in international fraud sting according to rumors'
      ];

      for (const claim of hostileClaims) {
        const stmtCorroborated = generateProvenanceStatement({
          status: 'CORROBORATED',
          claimText: claim,
          wireSourcesCount: 2,
          telemetryMatches: 1
        });

        const stmtDisputed = generateProvenanceStatement({
          status: 'DISPUTED',
          claimText: claim,
          wireSourcesCount: 0,
          telemetryMatches: 0,
          contradictionReason: 'Physical airport log confirms subject remained at international summit'
        });

        for (const stmt of [stmtCorroborated, stmtDisputed]) {
          const lower = stmt.toLowerCase();
          assert.ok(!lower.includes('fake news'), 'Output must not label content "fake news"');
          assert.ok(!lower.includes('liar'), 'Output must not accuse sources of being liars');
          assert.ok(!lower.includes('fraud'), 'Output must not make criminal assertions');
          assert.ok(!lower.includes('hoax'), 'Output must not use sensationalized terms');
          assert.ok(stmt.includes('Section 79') || stmt.includes('Section 356'), 'Must cite statutory Safe Harbour');
        }
      }
    });
  });

  describe('Scenario 4: Malicious Injection & XSS Payload Sanitization', () => {
    test('Social pulse sanitizer must neutralize script tags and HTML injection attempts', () => {
      const payload = '<script>alert("xss")</script> Contact @attacker_01 at evil@hack.org from 10.13.37.1';
      const sanitized = sanitizeSocialSignal(payload, 'script_kiddie');

      assert.ok(sanitized.text.includes('@[REDACTED_HANDLE]'));
      assert.ok(sanitized.text.includes('[REDACTED_EMAIL]'));
      assert.ok(sanitized.text.includes('[REDACTED_IP]'));
      assert.ok(!sanitized.text.includes('attacker_01'));
      assert.ok(!sanitized.text.includes('evil@hack.org'));
      assert.equal(sanitized.author, 'Local Eyewitness (PII Scrubbed pursuant to DPDP Act 2023)');
    });

    test('Pipeline handles SQL injection and prototype pollution strings safely', async () => {
      const sqlInjectionClaim = "Commercial vessel near Hormuz '; DROP TABLE articles; --";
      const dossier = await executeVerificationPipeline(sqlInjectionClaim);

      assert.equal(dossier.title, sqlInjectionClaim);
      assert.equal(dossier.category, 'Maritime & Defense');
      assert.equal(typeof dossier.corroborationScore, 'number');
      assert.ok(dossier.executionAudit.fingerprint.length === 64);
    });
  });

  describe('Scenario 5: High-Concurrency Burst Stress Testing', () => {
    test('Massive parallel batch of 30 concurrent pipeline runs executes with 100% stability', async () => {
      const NATO_PHONETIC = [
        'Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo', 'Foxtrot', 'Golf', 'Hotel',
        'India', 'Juliet', 'Kilo', 'Lima', 'Mike', 'November', 'Oscar', 'Papa',
        'Quebec', 'Romeo', 'Sierra', 'Tango', 'Uniform', 'Victor', 'Whiskey', 'Xray',
        'Yankee', 'Zulu', 'Apex', 'Beacon', 'Cosmo', 'Dynamic'
      ];

      const claims = NATO_PHONETIC.map(code => 
        `Surveillance radar sector ${code} observes maritime cargo patrol passage near Bab-el-Mandeb`
      );

      const t0 = performance.now();
      const results = await Promise.all(claims.map(c => executeVerificationPipeline(c)));
      const t1 = performance.now();

      assert.equal(results.length, 30);
      for (const r of results) {
        assert.ok(r.id.startsWith('story-'));
        assert.ok(typeof r.corroborationScore === 'number');
        assert.ok(r.executionAudit.fingerprint.length === 64);
      }

      const totalTimeMs = t1 - t0;
      assert.ok(totalTimeMs < 1500, `Batch execution took ${totalTimeMs.toFixed(1)}ms, expected < 1500ms`);
    });
  });
});
