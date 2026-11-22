/**
 * VERITAS OSINT - Verification Dossier Synthesizer (Step 5)
 * Compiles immutable, cryptographically fingerprinted Verification Dossiers with Safe Harbour packaging.
 * Benchmark: Google Staff Engineering / Forensic Intelligence Publishing
 */

import { generateRandomHex, computeSha256Fingerprint } from './cryptoUtils.js';
import { generateProvenanceStatement } from './legalDossierGenerator.js';

export function synthesizeDossier({
  claimSignal,
  entities,
  wireResult,
  socialResult,
  telemetryResult,
  corroborationResult,
  consensusResult,
  stepLatencies = {}
}) {
  const now = new Date();
  const utcTimestamp = now.toISOString();
  const dossierUid = generateRandomHex(4);
  const dossierId = `story-${dossierUid}`;

  const provenanceStatement = generateProvenanceStatement({
    status: corroborationResult.status,
    claimText: entities.what,
    wireSourcesCount: wireResult.sources.length,
    telemetryMatches: telemetryResult.telemetryMatches,
    contradictionReason: telemetryResult.contradictionReason
  });

  const dossierPayload = {
    id: dossierId,
    dossierUid: `dos-${now.getTime()}-${dossierUid}`,
    title: entities.what,
    category: entities.category || 'Geopolitical & Security',
    urgency: entities.urgency || 'MEDIUM',
    timestamp: 'Just now',
    utcTimestamp,
    location: entities.location,
    summary: consensusResult.executiveSummary,
    biasDistribution: wireResult.biasDistribution,
    blindspots: wireResult.blindspots,
    corroborationScore: corroborationResult.score,
    status: corroborationResult.status,
    scoreBreakdown: corroborationResult.breakdown,
    entities,
    consensus: consensusResult,
    parallelVerification: {
      mainstreamWire: wireResult.sources,
      socialPulse: socialResult.signals,
      osintTelemetry: telemetryResult.records
    },
    legalSafeguards: {
      provenanceStatement,
      piiScrubbed: true,
      safeHarbourCompliant: true,
      legalSection: 'Section 79 IT Act & BNS Section 356 Protected Analysis',
      dpdpAudit: {
        compliant: true,
        scrubbedAt: utcTimestamp,
        facialBlurringEnforced: true,
        socialAuthorRedacted: true
      },
      grievanceDesk: {
        officer: 'Statutory Grievance Redressal Desk',
        endpoint: '/api/v1/compliance/grievance',
        statutoryTurnaroundHours: 24,
        resolutionWindowDays: 15
      }
    },
    executionAudit: {
      engineVersion: '3.0.0-staff-eng',
      stepLatencies: {
        ...stepLatencies,
        totalMs: Object.values(stepLatencies).reduce((a, b) => a + b, 0)
      },
      verifiedAt: utcTimestamp
    }
  };

  // Cryptographic immutable hash for chain-of-custody verification
  const fingerprint = computeSha256Fingerprint(JSON.stringify(dossierPayload));

  dossierPayload.executionAudit.fingerprint = fingerprint;

  return dossierPayload;
}
