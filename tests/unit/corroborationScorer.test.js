import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { calculateCorroborationScore } from '../../src/engine/corroborationScorer.js';

describe('Unit Test: Mathematical Corroboration Scorer (TSK-104)', () => {

  describe('Layer 1: Mainstream Wire Scaling (Max 35% Weight)', () => {
    test('should return 0 wire score when wireAgenciesCount is 0', () => {
      const res = calculateCorroborationScore({
        wireAgenciesCount: 0,
        averageWireReliability: 100,
        socialSignalStrength: 'False Alarm',
        telemetryMatches: 0
      });
      assert.equal(res.breakdown.wireContribution, 0);
    });

    test('should scale proportionally for 1 wire agency (40% of layer weight)', () => {
      // 1 / 2.5 = 0.4; 35 * 0.4 * 1.0 = 14
      const res = calculateCorroborationScore({
        wireAgenciesCount: 1,
        averageWireReliability: 100,
        socialSignalStrength: 'False Alarm',
        telemetryMatches: 0
      });
      assert.equal(res.breakdown.wireContribution, 14);
    });

    test('should cap wire score at 35 when effective wire count >= 2.5', () => {
      const res3 = calculateCorroborationScore({
        wireAgenciesCount: 3,
        averageWireReliability: 100,
        socialSignalStrength: 'False Alarm',
        telemetryMatches: 0
      });
      assert.equal(res3.breakdown.wireContribution, 35);

      const res10 = calculateCorroborationScore({
        wireAgenciesCount: 10,
        averageWireReliability: 100,
        socialSignalStrength: 'False Alarm',
        telemetryMatches: 0
      });
      assert.equal(res10.breakdown.wireContribution, 35);
    });

    test('should scale wire score by wire reliability percentage', () => {
      // 3 agencies (capped at 1.0), reliability 80% => 35 * 0.8 = 28
      const res = calculateCorroborationScore({
        wireAgenciesCount: 3,
        averageWireReliability: 80,
        socialSignalStrength: 'False Alarm',
        telemetryMatches: 0
      });
      assert.equal(res.breakdown.wireContribution, 28);
    });

    test('should discount syndicated / collinear wires using wireIndependenceFactor', () => {
      // 4 wire agencies with heavy syndication (independence = 0.25) => effective count = 1.0
      // 1.0 / 2.5 = 0.4 => wireScore = 35 * 0.4 = 14
      const res = calculateCorroborationScore({
        wireAgenciesCount: 4,
        averageWireReliability: 100,
        wireIndependenceFactor: 0.25,
        socialSignalStrength: 'False Alarm',
        telemetryMatches: 0
      });
      assert.equal(res.breakdown.wireContribution, 14);
      assert.equal(res.breakdown.effectiveWireCount, 1.0);
    });

    test('should allow alpha1 explicit override for Bayesian continuous belief update', () => {
      const res = calculateCorroborationScore({
        alpha1: 0.5,
        averageWireReliability: 100,
        socialSignalStrength: 'False Alarm',
        telemetryMatches: 0
      });
      assert.equal(res.breakdown.wireContribution, 18); // 35 * 0.5 = 17.5 => 18
    });
  });

  describe('Layer 2: Social Pulse Scaling (Max 25% Weight)', () => {
    test('should award full 25 points for Extremely High social signal', () => {
      const res = calculateCorroborationScore({
        wireAgenciesCount: 0,
        socialSignalStrength: 'Extremely High',
        telemetryMatches: 0
      });
      assert.equal(res.breakdown.socialContribution, 25);
    });

    test('should award full 25 points for Very High social signal', () => {
      const res = calculateCorroborationScore({
        wireAgenciesCount: 0,
        socialSignalStrength: 'Very High',
        telemetryMatches: 0
      });
      assert.equal(res.breakdown.socialContribution, 25);
    });

    test('should award 21 points for High social signal (0.85 multiplier)', () => {
      const res = calculateCorroborationScore({
        wireAgenciesCount: 0,
        socialSignalStrength: 'High',
        telemetryMatches: 0
      });
      assert.equal(res.breakdown.socialContribution, 21);
    });

    test('should award 15 points for Medium social signal (0.6 multiplier)', () => {
      const res = calculateCorroborationScore({
        wireAgenciesCount: 0,
        socialSignalStrength: 'Medium',
        telemetryMatches: 0
      });
      assert.equal(res.breakdown.socialContribution, 15);
    });

    test('should award 8 points for Low social signal (0.3 multiplier)', () => {
      // 25 * 0.3 = 7.5 => round(7.5) = 8
      const res = calculateCorroborationScore({
        wireAgenciesCount: 0,
        socialSignalStrength: 'Low',
        telemetryMatches: 0
      });
      assert.equal(res.breakdown.socialContribution, 8);
    });

    test('should award 0 points for False Alarm social signal', () => {
      const res = calculateCorroborationScore({
        wireAgenciesCount: 0,
        socialSignalStrength: 'False Alarm',
        telemetryMatches: 0
      });
      assert.equal(res.breakdown.socialContribution, 0);
    });

    test('should award 13 points (0.5 default) for unrecognized social signal string', () => {
      const resUnknown = calculateCorroborationScore({
        wireAgenciesCount: 0,
        socialSignalStrength: 'Unrecognized_Signal',
        telemetryMatches: 0
      });
      assert.equal(resUnknown.breakdown.socialContribution, 13);
    });

    test('should suppress social signal to 2.5 points when isAstroturfFlagged is true', () => {
      // 25 * 0.1 = 2.5
      const res = calculateCorroborationScore({
        wireAgenciesCount: 0,
        socialSignalStrength: 'Extremely High',
        isAstroturfFlagged: true,
        telemetryMatches: 0
      });
      assert.equal(res.breakdown.socialContribution, 2.5);
    });

    test('should accept alpha2 explicit factor override', () => {
      const res = calculateCorroborationScore({
        alpha2: 0.4,
        telemetryMatches: 0
      });
      assert.equal(res.breakdown.socialContribution, 10); // 25 * 0.4 = 10
    });
  });

  describe('Layer 3: Hard OSINT Telemetry Scaling (Max 40% Weight)', () => {
    test('should award 0 points when telemetryMatches is 0', () => {
      const res = calculateCorroborationScore({
        wireAgenciesCount: 0,
        socialSignalStrength: 'False Alarm',
        telemetryMatches: 0
      });
      assert.equal(res.breakdown.telemetryContribution, 0);
    });

    test('should award 20 points for 1 telemetry match in non-contested zone', () => {
      // 1 / 2.0 = 0.5; 40 * 0.5 = 20
      const res = calculateCorroborationScore({
        wireAgenciesCount: 0,
        socialSignalStrength: 'False Alarm',
        telemetryMatches: 1,
        isContestedZone: false
      });
      assert.equal(res.breakdown.telemetryContribution, 20);
    });

    test('should cap at 40 points when telemetryMatches >= 2', () => {
      const res2 = calculateCorroborationScore({
        wireAgenciesCount: 0,
        socialSignalStrength: 'False Alarm',
        telemetryMatches: 2
      });
      assert.equal(res2.breakdown.telemetryContribution, 40);

      const res5 = calculateCorroborationScore({
        wireAgenciesCount: 0,
        socialSignalStrength: 'False Alarm',
        telemetryMatches: 5
      });
      assert.equal(res5.breakdown.telemetryContribution, 40);
    });

    test('should apply Levchin spoofing discount in contested zone without orthogonal sensors', () => {
      // 1 telemetry match in contested zone without orthogonal sensor:
      // effectiveTelemetryMatches = 1 * 0.35 = 0.35
      // telemetryScore = 40 * (0.35 / 2.0) = 7
      const res = calculateCorroborationScore({
        wireAgenciesCount: 3,
        averageWireReliability: 96,
        socialSignalStrength: 'High',
        telemetryMatches: 1,
        isContestedZone: true,
        hasOrthogonalSensors: false
      });
      assert.equal(res.breakdown.spoofDiscountApplied, true);
      assert.ok(res.breakdown.telemetryContribution <= 10);
      assert.ok(res.score <= 75, `Expected score capped at <= 75, got ${res.score}`);
      assert.equal(res.status, 'DEVELOPING');
    });

    test('should restore full telemetry weight in contested zone when orthogonal sensors present', () => {
      const res = calculateCorroborationScore({
        wireAgenciesCount: 3,
        averageWireReliability: 96,
        socialSignalStrength: 'High',
        telemetryMatches: 2,
        isContestedZone: true,
        hasOrthogonalSensors: true
      });
      assert.equal(res.breakdown.spoofDiscountApplied, false);
      assert.ok(res.breakdown.telemetryContribution >= 35);
      assert.equal(res.status, 'CORROBORATED');
    });

    test('should accept alpha3 explicit factor override', () => {
      const res = calculateCorroborationScore({
        alpha3: 0.75,
        socialSignalStrength: 'False Alarm'
      });
      assert.equal(res.breakdown.telemetryContribution, 30); // 40 * 0.75 = 30
    });
  });

  describe('Consensus Bonus & Status Transitions', () => {
    test('should award consensus bonus (+8) when all 3 layers concordantly corroborate', () => {
      const res = calculateCorroborationScore({
        wireAgenciesCount: 2,
        averageWireReliability: 95,
        socialSignalStrength: 'High', // multiplier 0.85 >= 0.8
        telemetryMatches: 1,
        telemetryContradicted: false
      });
      assert.equal(res.breakdown.consensusBonus, 8);
    });

    test('should not award consensus bonus if any layer fails threshold or is astroturfed', () => {
      const resAstroturf = calculateCorroborationScore({
        wireAgenciesCount: 2,
        averageWireReliability: 95,
        socialSignalStrength: 'High',
        telemetryMatches: 1,
        isAstroturfFlagged: true
      });
      assert.equal(resAstroturf.breakdown.consensusBonus, 0);

      const resFewWires = calculateCorroborationScore({
        wireAgenciesCount: 1, // < 2
        averageWireReliability: 95,
        socialSignalStrength: 'High',
        telemetryMatches: 1
      });
      assert.equal(resFewWires.breakdown.consensusBonus, 0);
    });

    test('should classify as CORROBORATED when score >= 80 and not contradicted or spoof-capped', () => {
      const res = calculateCorroborationScore({
        wireAgenciesCount: 3,
        averageWireReliability: 98,
        socialSignalStrength: 'High',
        telemetryMatches: 2,
        telemetryContradicted: false
      });
      assert.ok(res.score >= 80, `Expected >= 80, got ${res.score}`);
      assert.equal(res.status, 'CORROBORATED');
      assert.equal(res.breakdown.penaltyApplied, 0);
    });

    test('should classify as DEVELOPING when score is between 38 and 79 without contradiction', () => {
      const res = calculateCorroborationScore({
        wireAgenciesCount: 1,
        averageWireReliability: 90,
        socialSignalStrength: 'Medium',
        telemetryMatches: 1,
        telemetryContradicted: false
      });
      assert.ok(res.score >= 38 && res.score < 80, `Expected 38-79, got ${res.score}`);
      assert.equal(res.status, 'DEVELOPING');
      assert.equal(res.breakdown.penaltyApplied, 0);
    });

    test('should classify as DISPUTED when telemetry is contradicted regardless of gross score', () => {
      const res = calculateCorroborationScore({
        wireAgenciesCount: 4,
        averageWireReliability: 100,
        socialSignalStrength: 'Extremely High',
        telemetryMatches: 2,
        telemetryContradicted: true
      });
      assert.equal(res.status, 'DISPUTED');
      assert.equal(res.breakdown.penaltyApplied, 65);
    });

    test('should clamp score to 0 floor when penalty exceeds gross score', () => {
      const res = calculateCorroborationScore({
        wireAgenciesCount: 0,
        socialSignalStrength: 'False Alarm',
        telemetryMatches: 0,
        telemetryContradicted: true
      });
      assert.equal(res.score, 0);
      assert.equal(res.status, 'DISPUTED');
      assert.equal(res.breakdown.penaltyApplied, 65);
    });

    test('should classify as DISPUTED when score is below 38 even without contradiction', () => {
      const res = calculateCorroborationScore({
        wireAgenciesCount: 0,
        socialSignalStrength: 'Medium', // 15 points
        telemetryMatches: 0,
        telemetryContradicted: false
      });
      assert.ok(res.score < 38);
      assert.equal(res.status, 'DISPUTED');
    });
  });

  describe('Default Parameters & Boundary Clamping', () => {
    test('should handle empty parameter object with standard defaults', () => {
      const res = calculateCorroborationScore({});
      assert.equal(typeof res.score, 'number');
      assert.ok(res.score >= 0 && res.score <= 100);
      assert.equal(res.breakdown.penaltyApplied, 0);
      // Default: wire 0, social 'Medium' (15), telemetry 0 => 15 => DISPUTED (< 38)
      assert.equal(res.score, 15);
      assert.equal(res.status, 'DISPUTED');
    });

    test('should never return a score greater than 100 or less than 0', () => {
      const maxRes = calculateCorroborationScore({
        wireAgenciesCount: 100,
        averageWireReliability: 100,
        socialSignalStrength: 'Extremely High',
        telemetryMatches: 50
      });
      assert.equal(maxRes.score, 100);

      const minRes = calculateCorroborationScore({
        wireAgenciesCount: 0,
        averageWireReliability: 0,
        socialSignalStrength: 'False Alarm',
        telemetryMatches: 0,
        telemetryContradicted: true
      });
      assert.equal(minRes.score, 0);
    });
  });
});
