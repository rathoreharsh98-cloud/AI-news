import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { generateProvenanceStatement } from '../../src/engine/legalDossierGenerator.js';

describe('Unit Test: Safe Harbour Legal Provenance Synthesizer (TSK-105)', () => {

  const PROHIBITED_DEFAMATORY_TERMS = [
    'fake news',
    'liar',
    'fraud',
    'scam',
    'hoax',
    'criminal',
    'propaganda outlet',
    'disinformation agent',
    'defamatory'
  ];

  describe('CORROBORATED Status Provenance', () => {
    test('should cite wire sources, telemetry streams, and IT Act Section 79', () => {
      const stmt = generateProvenanceStatement({
        status: 'CORROBORATED',
        claimText: 'Tanker diversion in Red Sea',
        wireSourcesCount: 3,
        telemetryMatches: 2
      });

      assert.ok(stmt.startsWith('Corroborated:'));
      assert.ok(stmt.includes('3 international wire agencies'));
      assert.ok(stmt.includes('2 physical sensor telemetry streams'));
      assert.ok(stmt.includes('IT Act 2000 Section 79'));
      assert.ok(stmt.includes('Evaluated probabilistically without editorial assertion'));
    });

    test('should strictly avoid defamatory editorial characterizations in CORROBORATED output', () => {
      const stmt = generateProvenanceStatement({
        status: 'CORROBORATED',
        claimText: 'Earthquake reported off Hualien',
        wireSourcesCount: 2,
        telemetryMatches: 1
      });

      const lower = stmt.toLowerCase();
      for (const term of PROHIBITED_DEFAMATORY_TERMS) {
        assert.ok(!lower.includes(term), `Prohibited term "${term}" found in statement`);
      }
    });
  });

  describe('DISPUTED Status Provenance', () => {
    test('should formulate BNS Section 356 provenance with specific contradiction reason', () => {
      const stmt = generateProvenanceStatement({
        status: 'DISPUTED',
        claimText: 'Commercial airliner down near Constanța',
        wireSourcesCount: 1,
        telemetryMatches: 0,
        contradictionReason: '14 active commercial transponders operating at cruise altitude'
      });

      assert.ok(stmt.startsWith('Disputed:'));
      assert.ok(stmt.includes('explicitly contradicted by hard sensor telemetry (14 active commercial transponders operating at cruise altitude)'));
      assert.ok(stmt.includes('Bharatiya Nyaya Sanhita (BNS) Section 356'));
      assert.ok(stmt.includes('objective algorithmic provenance analysis'));
    });

    test('should formulate clean BNS Section 356 statement when contradictionReason is null or omitted', () => {
      const stmt = generateProvenanceStatement({
        status: 'DISPUTED',
        claimText: 'Radar station destroyed',
        wireSourcesCount: 0,
        telemetryMatches: 0
      });

      assert.ok(stmt.startsWith('Disputed:'));
      assert.ok(stmt.includes('explicitly contradicted by hard sensor telemetry.'));
      assert.ok(!stmt.includes('null'));
      assert.ok(!stmt.includes('undefined'));
      assert.ok(!stmt.includes('()'));
      assert.ok(stmt.includes('Bharatiya Nyaya Sanhita (BNS) Section 356'));
    });

    test('should maintain non-defamatory intermediary tone even when claim is disputed', () => {
      const stmt = generateProvenanceStatement({
        status: 'DISPUTED',
        claimText: 'Fabricated missile strike headline',
        wireSourcesCount: 1,
        telemetryMatches: 0,
        contradictionReason: 'Zero infrared flash detected by satellite radiometer'
      });

      const lower = stmt.toLowerCase();
      for (const term of PROHIBITED_DEFAMATORY_TERMS) {
        assert.ok(!lower.includes(term), `Prohibited term "${term}" found in statement`);
      }
    });
  });

  describe('DEVELOPING & Fallback Status Provenance', () => {
    test('should formulate non-definitive provisional statement for DEVELOPING status', () => {
      const stmt = generateProvenanceStatement({
        status: 'DEVELOPING',
        claimText: 'Unidentified sonar echo detected',
        wireSourcesCount: 1,
        telemetryMatches: 0
      });

      assert.ok(stmt.startsWith('Developing:'));
      assert.ok(stmt.includes('Physical parameters currently unconfirmed'));
      assert.ok(stmt.includes('No definitive truth determination asserted'));
    });

    test('should fallback to provisional developing statement for undefined or unknown status', () => {
      const stmtUnknown = generateProvenanceStatement({
        status: 'UNKNOWN_STATUS',
        claimText: 'Anomaly noticed',
        wireSourcesCount: 0,
        telemetryMatches: 0
      });

      assert.ok(stmtUnknown.startsWith('Developing:'));
      assert.ok(stmtUnknown.includes('No definitive truth determination asserted'));
    });
  });
});
