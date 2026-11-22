import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { executeVerificationPipeline } from '../../src/engine/crossCheckEngine.js';

describe('Integration Test: Parallel 3-Layer Cross-Check Engine (TSK-103)', () => {

  describe('Sensor Modality Routing & Category Classification', () => {
    test('should route Aviation claims to OpenSky ADS-B Radar and Aviation & Conflict category', async () => {
      const claim = 'Commercial flight squawk 7700 reported in European transit corridor';
      const dossier = await executeVerificationPipeline(claim, 'Geneva');

      assert.equal(dossier.category, 'Aviation & Conflict');
      assert.equal(dossier.urgency, 'HIGH');
      assert.ok(dossier.parallelVerification.osintTelemetry.some(t => t.system.includes('OpenSky')));
      assert.equal(dossier.parallelVerification.osintTelemetry[0].status, 'MATCHED');
      assert.ok(dossier.parallelVerification.osintTelemetry[0].details.includes('squawk 7700'));
    });

    test('should route Maritime claims to Spire/MarineTraffic AIS and Maritime & Defense category', async () => {
      const claim = 'Crude oil tanker diversion reported near Bab-el-Mandeb strait';
      const dossier = await executeVerificationPipeline(claim);

      assert.equal(dossier.category, 'Maritime & Defense');
      assert.equal(dossier.location.name, 'Bab-el-Mandeb Strait / Red Sea');
      assert.ok(dossier.parallelVerification.osintTelemetry.some(t => t.system.includes('MarineTraffic')));
      assert.equal(dossier.parallelVerification.osintTelemetry[0].status, 'MATCHED');
      assert.ok(dossier.parallelVerification.osintTelemetry[0].details.includes('MMSI transponder'));
    });

    test('should route Seismic claims to USGS Global Seismographic Network and Natural Disasters category', async () => {
      const claim = 'M7.1 major earthquake tremor detected off the coast of Hualien Taiwan';
      const dossier = await executeVerificationPipeline(claim);

      assert.equal(dossier.category, 'Natural Disasters');
      assert.equal(dossier.urgency, 'CRITICAL');
      assert.equal(dossier.location.country, 'Taiwan');
      assert.ok(dossier.parallelVerification.osintTelemetry.some(t => t.system.includes('USGS')));
      assert.equal(dossier.parallelVerification.osintTelemetry[0].status, 'MATCHED');
      assert.equal(dossier.status, 'CORROBORATED');
      assert.ok(dossier.legalSafeguards.provenanceStatement.includes('IT Act 2000 Section 79'));
    });

    test('should route Fire/Thermal claims to NASA FIRMS Thermal Sensor', async () => {
      const claim = 'Intense wildfire thermal infrared anomaly expanding across Peloponnese';
      const dossier = await executeVerificationPipeline(claim, 'Greece');

      assert.equal(dossier.category, 'Natural Disasters');
      assert.equal(dossier.urgency, 'HIGH');
      assert.ok(dossier.parallelVerification.osintTelemetry.some(t => t.system.includes('NASA FIRMS')));
      assert.equal(dossier.parallelVerification.osintTelemetry[0].status, 'MATCHED');
      assert.ok(dossier.parallelVerification.osintTelemetry[0].details.includes('Fire Radiative Power'));
    });

    test('should route General/Geopolitical claims to Copernicus Sentinel Radiometry', async () => {
      const claim = 'Diplomatic summit scheduled between delegates';
      const dossier = await executeVerificationPipeline(claim);

      assert.equal(dossier.category, 'Geopolitical & Security');
      assert.equal(dossier.urgency, 'MEDIUM');
      assert.ok(dossier.parallelVerification.osintTelemetry.some(t => t.system.includes('Copernicus Sentinel')));
      assert.equal(dossier.parallelVerification.osintTelemetry[0].status, 'NORMAL');
    });

    test('should route Contradicted claims to DISPUTED status with BNS Section 356 provenance', async () => {
      const claim = 'Regional airspace completely shut down and no flights permitted';
      const dossier = await executeVerificationPipeline(claim);

      assert.equal(dossier.status, 'DISPUTED');
      assert.ok(dossier.parallelVerification.osintTelemetry.some(t => t.status === 'CONTRADICTED'));
      assert.ok(dossier.legalSafeguards.provenanceStatement.includes('Bharatiya Nyaya Sanhita (BNS) Section 356'));
      assert.ok(dossier.legalSafeguards.provenanceStatement.includes('Disputed:'));
    });

    test('should route Tsunami hoax claims to NOAA DART Buoy contradiction and DISPUTED status (Module 4)', async () => {
      const claim = 'Massive tsunami wave destroys coastal harbor in Mumbai';
      const dossier = await executeVerificationPipeline(claim, 'Mumbai');

      assert.equal(dossier.status, 'DISPUTED');
      assert.ok(dossier.corroborationScore < 40, `Expected score < 40, got ${dossier.corroborationScore}`);
      assert.equal(dossier.location.country, 'India');
      assert.ok(dossier.parallelVerification.osintTelemetry.some(t => t.system.includes('NOAA DART Tsunami Buoy')));
      assert.equal(dossier.parallelVerification.osintTelemetry[0].status, 'CONTRADICTED');
    });
  });

  describe('Parallel 3-Layer Schema & Contract Conformance', () => {
    test('should return complete structured dossier conforming to OpenAPI specifications', async () => {
      const claim = 'Reconnaissance drone loiter in Western Black Sea off Constanța';
      const dossier = await executeVerificationPipeline(claim);

      // Verify root fields
      assert.equal(typeof dossier.id, 'string');
      assert.ok(dossier.id.startsWith('story-'));
      assert.equal(dossier.title, claim);
      assert.ok(!isNaN(Date.parse(dossier.utcTimestamp)));

      // Verify Bias Distribution (sums to 100)
      const { left, center, right } = dossier.biasDistribution;
      assert.equal(left + center + right, 100);

      // Verify Layer 1 (Mainstream Wire)
      assert.ok(Array.isArray(dossier.parallelVerification.mainstreamWire));
      assert.ok(dossier.parallelVerification.mainstreamWire.length >= 2);
      for (const wire of dossier.parallelVerification.mainstreamWire) {
        assert.ok(wire.source);
        assert.ok(wire.reliability >= 85);
        assert.ok(wire.verdict);
        assert.ok(wire.link.startsWith('http'));
      }

      // Verify Layer 2 (Social Pulse DPDP Scrubbed)
      assert.ok(Array.isArray(dossier.parallelVerification.socialPulse));
      assert.ok(dossier.parallelVerification.socialPulse.length >= 1);
      const social = dossier.parallelVerification.socialPulse[0];
      assert.equal(social.piiScrubbed, true);
      assert.ok(social.content.includes('@[REDACTED_HANDLE]'));

      // Verify Layer 3 (OSINT Telemetry)
      assert.ok(Array.isArray(dossier.parallelVerification.osintTelemetry));
      assert.ok(dossier.parallelVerification.osintTelemetry.length >= 1);

      // Verify Consensus Synthesis
      assert.ok(dossier.consensus.executiveSummary);
      assert.ok(dossier.consensus.analystRecommendation);
      assert.ok(Array.isArray(dossier.consensus.pointsOfAgreement));

      // Verify Legal Safeguards & Safe Harbour
      assert.equal(dossier.legalSafeguards.piiScrubbed, true);
      assert.equal(dossier.legalSafeguards.safeHarbourCompliant, true);
      assert.ok(dossier.legalSafeguards.provenanceStatement.length > 20);
      assert.ok(
        dossier.legalSafeguards.provenanceStatement.startsWith('Corroborated:') ||
        dossier.legalSafeguards.provenanceStatement.startsWith('Disputed:') ||
        dossier.legalSafeguards.provenanceStatement.startsWith('Developing:')
      );
      assert.ok(dossier.legalSafeguards.legalSection.includes('Section 79'));

      // Verify Cryptographic SHA-256 Fingerprint
      assert.equal(typeof dossier.executionAudit.fingerprint, 'string');
      assert.equal(dossier.executionAudit.fingerprint.length, 64, 'Must be valid SHA-256 hex digest');
    });
  });
});
