/**
 * VERITAS OSINT - Engine Public API Entrypoint
 * Benchmark: Google Staff Engineering / Modular Clean-Room Architecture
 */

export { IngestionTrigger, defaultIngestionTrigger, SignalSourceType, IngestionPriority } from './ingestionTrigger.js';
export { extractEntities } from './claimExtractor.js';
export { queryWireLayer, WIRE_REGISTRY } from './layers/wireLayer.js';
export { querySocialLayer } from './layers/socialLayer.js';
export { queryTelemetryLayer } from './layers/telemetryLayer.js';
export { sanitizeSocialSignal } from './piiSanitizer.js';
export { calculateCorroborationScore } from './corroborationScorer.js';
export { LLMConsensusEngine, defaultConsensusEngine } from './llmConsensusEngine.js';
export { generateProvenanceStatement } from './legalDossierGenerator.js';
export { synthesizeDossier } from './dossierSynthesizer.js';
export { executeVerificationPipeline } from './crossCheckEngine.js';
