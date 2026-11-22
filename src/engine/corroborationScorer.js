/**
 * VERITAS OSINT - Bayesian Corroboration Scoring Engine
 * Computes objective mathematical corroboration score (0-100%) and classification.
 * Strictly adheres to RFC-002 Section 6 (Levchin Debates / PayPal Mafia Mathematical Rigor).
 * Benchmark: Google Staff Engineering / Bayesian Evidential Triangulation
 */

export function calculateCorroborationScore({
  wireAgenciesCount = 0,
  averageWireReliability = 95,
  socialSignalStrength = 'Medium', // 'Extremely High' | 'Very High' | 'High' | 'Medium' | 'Low' | 'False Alarm'
  telemetryMatches = 0,
  telemetryContradicted = false,
  alpha1 = null, // Wire alignment factor [0, 1]
  alpha2 = null, // Social agreement factor [0, 1]
  alpha3 = null, // Sensor union factor [0, 1]
  isContestedZone = false,
  hasOrthogonalSensors = false,
  isAstroturfFlagged = false,
  wireIndependenceFactor = 1.0
}) {
  // Layer 1: Mainstream Wire Alignment (w1 = 35%)
  const effectiveWireCount = wireAgenciesCount * wireIndependenceFactor;
  const wireBase = alpha1 != null ? alpha1 : Math.min(1.0, effectiveWireCount / 2.5);
  const wireScore = 35 * wireBase * (averageWireReliability / 100);

  // Layer 2: Social Pulse & Eyewitness Signal (w2 = 25%)
  let socialMultiplier = 0.5;
  if (isAstroturfFlagged) {
    // Coordinated Inauthentic Behavior / Sybil bot swarm throttles social contribution to <= 3%
    socialMultiplier = 0.1;
  } else if (alpha2 != null) {
    socialMultiplier = Math.max(0, Math.min(1.0, alpha2));
  } else if (socialSignalStrength === 'Extremely High' || socialSignalStrength === 'Very High') {
    socialMultiplier = 1.0;
  } else if (socialSignalStrength === 'High') {
    socialMultiplier = 0.85;
  } else if (socialSignalStrength === 'Medium') {
    socialMultiplier = 0.6;
  } else if (socialSignalStrength === 'Low') {
    socialMultiplier = 0.3;
  } else if (socialSignalStrength === 'False Alarm') {
    socialMultiplier = 0.0;
  }
  let socialScore = 25 * socialMultiplier;
  if (isAstroturfFlagged) {
    socialScore = Math.min(3, socialScore);
  }

  // Layer 3: Physical OSINT Sensor Corroboration (w3 = 40%)
  let spoofDiscountApplied = false;
  let telemetryBase = alpha3 != null ? alpha3 : Math.min(1.0, telemetryMatches / 2.0);
  let telemetryScore = 40 * telemetryBase;

  // Adversarial resilience: Contested electronic warfare (EW) / GPS/AIS spoofing check
  if (isContestedZone) {
    if (!hasOrthogonalSensors) {
      // Single un-triangulated RF beacon subject to spoof discount
      spoofDiscountApplied = true;
      telemetryScore = Math.min(10, telemetryScore * 0.25);
    } else {
      spoofDiscountApplied = false;
    }
  }

  // Consensus Bonus (Omega_consensus in [0, 15]):
  // Awarded when all three independent layers provide concordant spatial and temporal verification
  let consensusBonus = 0;
  if (
    !telemetryContradicted &&
    !spoofDiscountApplied &&
    effectiveWireCount >= 2 &&
    telemetryMatches >= 1 &&
    socialMultiplier >= 0.8
  ) {
    consensusBonus = 8;
  }

  // Calculate gross score
  let total = wireScore + socialScore + telemetryScore + consensusBonus;

  // Contradiction Penalty (Delta_contradiction in [0, 75]):
  // Triggered when physical sensor observations directly refute textual claims.
  let penaltyApplied = 0;
  if (telemetryContradicted) {
    penaltyApplied = 65;
    total = Math.max(0, total - penaltyApplied);
  }

  // If in contested zone without orthogonal sensor triangulation, cap score at 75 (DEVELOPING)
  if (isContestedZone && !hasOrthogonalSensors) {
    total = Math.min(75, total);
  }

  const finalScore = Math.min(100, Math.max(0, Math.round(total)));

  // Deterministic Status Classification (RFC-002 Section 6.2)
  let status = 'DEVELOPING';
  if (telemetryContradicted || finalScore < 40) {
    status = 'DISPUTED';
  } else if (finalScore >= 80 && (!isContestedZone || hasOrthogonalSensors)) {
    status = 'CORROBORATED';
  }

  return {
    score: finalScore,
    status,
    breakdown: {
      wireContribution: Math.round(wireScore),
      effectiveWireCount,
      socialContribution: isAstroturfFlagged ? Math.round(socialScore * 10) / 10 : Math.round(socialScore),
      telemetryContribution: Math.round(telemetryScore),
      consensusBonus: Math.round(consensusBonus),
      penaltyApplied,
      spoofDiscountApplied
    }
  };
}
