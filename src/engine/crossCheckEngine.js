/**
 * VERITAS OSINT - Autonomous Verification Pipeline Orchestrator
 * Coordinates the full 5-Step Autonomous Verification Loop:
 *   Step 1: Continuous Ingestion Trigger & Deduplication
 *   Step 2: Named Entity Recognition (NER) & 5W1H Extraction
 *   Step 3: Parallel 3-Layer Cross-Check (Wire, Social Pulse, OSINT Telemetry)
 *   Step 4: Bayesian Corroboration & LLM Consensus Engine
 *   Step 5: Verification Dossier Synthesizer & Safe Harbour Packaging
 * Benchmark: Google Staff Engineering / Low-Latency Resilient Intelligence Pipeline
 */

import { defaultIngestionTrigger, SignalSourceType } from './ingestionTrigger.js';
import { extractEntities } from './claimExtractor.js';
import { queryWireLayer } from './layers/wireLayer.js';
import { querySocialLayer } from './layers/socialLayer.js';
import { queryTelemetryLayer } from './layers/telemetryLayer.js';
import { calculateCorroborationScore } from './corroborationScorer.js';
import { defaultConsensusEngine } from './llmConsensusEngine.js';
import { synthesizeDossier } from './dossierSynthesizer.js';

export async function executeVerificationPipeline(claimText, optionalRegion = null, options = {}) {
  const stepLatencies = {};

  // ----------------------------------------------------
  // STEP 1: Continuous Ingestion Trigger & Deduplication
  // ----------------------------------------------------
  const t0 = performance.now();
  const ingestionResult = await defaultIngestionTrigger.ingestClaim({
    claimText,
    sourceType: options.sourceType || SignalSourceType.USER_CLAIM,
    spatialHint: optionalRegion ? { name: optionalRegion } : null
  });
  stepLatencies.ingestionMs = Math.round(performance.now() - t0);

  // ----------------------------------------------------
  // STEP 2: Named Entity Recognition & 5W1H Extraction
  // ----------------------------------------------------
  const t1 = performance.now();
  const entities = extractEntities(claimText, optionalRegion);
  stepLatencies.nerMs = Math.round(performance.now() - t1);

  // ----------------------------------------------------
  // STEP 3: Parallel 3-Layer Cross-Check
  // ----------------------------------------------------
  const t2 = performance.now();
  const [wireSettled, socialSettled, telemetrySettled] = await Promise.allSettled([
    queryWireLayer(entities, claimText),
    querySocialLayer(entities, claimText),
    queryTelemetryLayer(entities, claimText)
  ]);

  const wireResult = wireSettled.status === 'fulfilled' ? wireSettled.value : {
    sources: [],
    biasDistribution: { left: 33, center: 34, right: 33 },
    blindspots: 'Wire query unavailable',
    metrics: { wireAgenciesCount: 0, averageWireReliability: 50, gamma1: 0.5 }
  };

  const socialResult = socialSettled.status === 'fulfilled' ? socialSettled.value : {
    signals: [],
    signalStrength: 'Low',
    metrics: { socialSignalStrength: 'Low', authenticityFactorGamma2: 0.5 }
  };

  const telemetryResult = telemetrySettled.status === 'fulfilled' ? telemetrySettled.value : {
    records: [],
    telemetryMatches: 0,
    telemetryContradicted: false,
    contradictionReason: null
  };
  stepLatencies.parallelCrossCheckMs = Math.round(performance.now() - t2);

  // ----------------------------------------------------
  // STEP 4: Bayesian Corroboration & LLM Consensus
  // ----------------------------------------------------
  const t3 = performance.now();
  const corroborationResult = calculateCorroborationScore({
    wireAgenciesCount: wireResult.metrics.wireAgenciesCount,
    averageWireReliability: wireResult.metrics.averageWireReliability,
    socialSignalStrength: socialResult.signalStrength,
    telemetryMatches: telemetryResult.telemetryMatches,
    telemetryContradicted: telemetryResult.telemetryContradicted
  });

  const consensusResult = await defaultConsensusEngine.synthesizeConsensus({
    claimText,
    entities,
    wireResult,
    socialResult,
    telemetryResult,
    corroborationResult
  });
  stepLatencies.consensusMs = Math.round(performance.now() - t3);

  // ----------------------------------------------------
  // STEP 5: Verification Dossier Synthesizer & Safe Harbour Packaging
  // ----------------------------------------------------
  const t4 = performance.now();
  const dossier = synthesizeDossier({
    claimSignal: ingestionResult.signal,
    entities,
    wireResult,
    socialResult,
    telemetryResult,
    corroborationResult,
    consensusResult,
    stepLatencies
  });
  stepLatencies.synthesisMs = Math.round(performance.now() - t4);

  return dossier;
}
