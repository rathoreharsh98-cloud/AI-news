import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { 
  sanitizeSocialSignal, 
  sanitizeMediaMetadata,
  obfuscatePrivateCoordinates 
} from '../src/engine/piiSanitizer.js';
import { generateProvenanceStatement } from '../src/engine/legalDossierGenerator.js';

describe('VERITAS OSINT - Security & Legal Compliance Suite (SDC Gate 3)', () => {

  test('SEC-01: DPDP Act 2023 - Rigorous PII Scrubbing (Indian Mobiles, IPv6, Handles, Emails)', () => {
    const raw = 'Eyewitness tip from @rahul_v at rahul@proton.me or call +91 98765 43210. IP: 2001:0db8:85a3:0000:0000:8a2e:0370:7334';
    const sanitized = sanitizeSocialSignal(raw, 'citizen_scout_99');

    assert.ok(!sanitized.text.includes('@rahul_v'), 'Handle must be scrubbed');
    assert.ok(sanitized.text.includes('@[REDACTED_HANDLE]'), 'Handle redacted marker present');
    assert.ok(!sanitized.text.includes('rahul@proton.me'), 'Email must be scrubbed');
    assert.ok(sanitized.text.includes('[REDACTED_EMAIL]'), 'Email redacted marker present');
    assert.ok(!sanitized.text.includes('98765 43210'), 'Phone must be scrubbed');
    assert.ok(sanitized.text.includes('[REDACTED_PHONE]'), 'Phone redacted marker present');
    assert.ok(!sanitized.text.includes('2001:0db8'), 'IPv6 must be scrubbed');
    assert.ok(sanitized.text.includes('[REDACTED_IP]'), 'IP redacted marker present');
    assert.ok(sanitized.author.includes('DPDP Act 2023'), 'Author must reflect statutory scrubbing');
    assert.equal(sanitized.piiScrubbed, true);
  });

  test('SEC-02: DPDP Act 2023 - Eyewitness Media EXIF Purging & Biometric Facial Blurring Flag', () => {
    const rawMedia = {
      filename: 'eyewitness_blast_footage.mp4',
      exif: {
        GPSLatitude: 25.123456,
        GPSLongitude: 55.987654,
        Make: 'Apple',
        Model: 'iPhone 15 Pro',
        SerialNumber: 'DNQX1234XYZ'
      }
    };

    const mediaResult = sanitizeMediaMetadata(rawMedia);
    assert.equal(mediaResult.mediaScrubbed, true);
    assert.equal(mediaResult.faceBlurringApplied, true);
    assert.equal(mediaResult.exifPurged, true);
    assert.ok(mediaResult.strippedFields.includes('GPSLatitude'));
    assert.ok(mediaResult.strippedFields.includes('SerialNumber'));
  });

  test('SEC-03: DPDP Act 2023 - Anti-Doxxing Coordinate Obfuscation for Private Zones', () => {
    const privateCoords = obfuscatePrivateCoordinates(28.613939, 77.209021, false);
    assert.equal(privateCoords.precision, 'FUZZED_1KM_DPDP_COMPLIANT');
    assert.equal(privateCoords.lat, 28.61);
    assert.equal(privateCoords.lng, 77.21);

    const publicCoords = obfuscatePrivateCoordinates(28.613939, 77.209021, true);
    assert.equal(publicCoords.precision, 'EXACT_PUBLIC');
    assert.equal(publicCoords.lat, 28.613939);
  });

  test('SEC-04: Section 79 IT Act & BNS Section 356 - Safe Harbour Intermediary Provenance Formulations', () => {
    const bannedDefamatoryWords = ['fake news', 'liar', 'fraud', 'hoaxer', 'disinformation agent', 'conspiracy monger'];

    const corroboratedStmt = generateProvenanceStatement({
      status: 'CORROBORATED',
      claimText: 'Missile interception over Bab-el-Mandeb',
      wireSourcesCount: 3,
      telemetryMatches: 2
    });

    const disputedStmt = generateProvenanceStatement({
      status: 'DISPUTED',
      claimText: 'Fighter jet crash in international waters',
      wireSourcesCount: 1,
      telemetryMatches: 0,
      contradictionReason: 'Radar track confirmed active squawk at cruising FL380'
    });

    const developingStmt = generateProvenanceStatement({
      status: 'DEVELOPING',
      claimText: 'Subsea cable rupture in Baltic Sea',
      wireSourcesCount: 1,
      telemetryMatches: 0
    });

    for (const word of bannedDefamatoryWords) {
      assert.ok(!corroboratedStmt.toLowerCase().includes(word), `Corroborated statement must not contain '${word}'`);
      assert.ok(!disputedStmt.toLowerCase().includes(word), `Disputed statement must not contain '${word}'`);
      assert.ok(!developingStmt.toLowerCase().includes(word), `Developing statement must not contain '${word}'`);
    }

    assert.ok(corroboratedStmt.includes('IT Act 2000 Section 79'), 'Corroborated must cite Section 79');
    assert.ok(disputedStmt.includes('Bharatiya Nyaya Sanhita (BNS) Section 356'), 'Disputed must cite BNS Section 356');
    assert.ok(developingStmt.includes('No definitive truth determination asserted'), 'Developing must assert neutrality');
  });

});
