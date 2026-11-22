import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { 
  sanitizeSocialSignal, 
  sanitizeMediaMetadata, 
  obfuscatePrivateCoordinates 
} from '../../src/engine/piiSanitizer.js';

describe('Unit Test: DPDP Act 2023 Automated PII Sanitizer (TSK-102)', () => {

  describe('Email Masking Regex', () => {
    test('should mask standard email addresses', () => {
      const input = 'Witness report received from eyewitness@example.com for verification';
      const result = sanitizeSocialSignal(input);
      assert.ok(!result.text.includes('eyewitness@example.com'));
      assert.ok(result.text.includes('[REDACTED_EMAIL]'));
      assert.equal(result.text, 'Witness report received from [REDACTED_EMAIL] for verification');
    });

    test('should mask complex emails with dots, subdomains, and plus tags', () => {
      const input = 'Contact john.doe+osint@defense.mil.gov or alert.desk@sub.organization.org';
      const result = sanitizeSocialSignal(input);
      assert.ok(!result.text.includes('john.doe+osint@defense.mil.gov'));
      assert.ok(!result.text.includes('alert.desk@sub.organization.org'));
      assert.equal(result.text, 'Contact [REDACTED_EMAIL] or [REDACTED_EMAIL]');
    });

    test('should sanitize email before handle masking without corrupting domain part', () => {
      const input = 'Forward to @analyst at test.user@gmail.com immediately';
      const result = sanitizeSocialSignal(input);
      assert.ok(!result.text.includes('@gmail.com'));
      assert.ok(result.text.includes('@[REDACTED_HANDLE]'));
      assert.ok(result.text.includes('[REDACTED_EMAIL]'));
      assert.equal(result.text, 'Forward to @[REDACTED_HANDLE] at [REDACTED_EMAIL] immediately');
    });
  });

  describe('Social Handle Masking Regex', () => {
    test('should mask standard twitter/instagram/telegram @handles', () => {
      const input = 'Check footage from @war_watcher99 and @intel_desk';
      const result = sanitizeSocialSignal(input);
      assert.ok(!result.text.includes('@war_watcher99'));
      assert.ok(!result.text.includes('@intel_desk'));
      assert.equal(result.text, 'Check footage from @[REDACTED_HANDLE] and @[REDACTED_HANDLE]');
    });

    test('should handle handles at the very beginning and end of strings', () => {
      const input = '@first_user reports explosion confirmed by @last_user';
      const result = sanitizeSocialSignal(input);
      assert.ok(result.text.startsWith('@[REDACTED_HANDLE]'));
      assert.ok(result.text.endsWith('@[REDACTED_HANDLE]'));
    });
  });

  describe('IPv4 and IPv6 Address Masking Regex', () => {
    test('should mask private and public IPv4 addresses', () => {
      const input = 'Packet origin logged at 192.168.1.104 and relay server 104.244.42.1';
      const result = sanitizeSocialSignal(input);
      assert.ok(!result.text.includes('192.168.1.104'));
      assert.ok(!result.text.includes('104.244.42.1'));
      assert.equal(result.text, 'Packet origin logged at [REDACTED_IP] and relay server [REDACTED_IP]');
    });

    test('should mask IPv6 addresses', () => {
      const input = 'Originating node 2001:0db8:85a3:0000:0000:8a2e:0370:7334 detected';
      const result = sanitizeSocialSignal(input);
      assert.ok(!result.text.includes('2001:0db8:85a3:0000:0000:8a2e:0370:7334'));
      assert.ok(result.text.includes('[REDACTED_IP]'));
    });
  });

  describe('Phone Number Masking Regex (International & Indian +91 formats)', () => {
    test('should mask standard 10-digit dashed phone numbers', () => {
      const input = 'Call the emergency hotline at 555-019-2834 or 202-555-0143';
      const result = sanitizeSocialSignal(input);
      assert.ok(!result.text.includes('555-019-2834'));
      assert.ok(!result.text.includes('202-555-0143'));
      assert.equal(result.text, 'Call the emergency hotline at [REDACTED_PHONE] or [REDACTED_PHONE]');
    });

    test('should mask Indian +91 phone numbers pursuant to DPDP Act 2023', () => {
      const input = 'Eyewitness hotline +91 98765 43210 or +91-9123456789 active';
      const result = sanitizeSocialSignal(input);
      assert.ok(!result.text.includes('98765'));
      assert.ok(!result.text.includes('9123456789'));
      assert.ok(result.text.includes('[REDACTED_PHONE]'));
    });
  });

  describe('Author Attribution & Whitelist', () => {
    test('should preserve official wire agencies and meteorological authorities verbatim', () => {
      const reuters = sanitizeSocialSignal('Breaking wire update', 'Reuters International Wire');
      assert.equal(reuters.author, 'Reuters International Wire');

      const ap = sanitizeSocialSignal('Breaking wire update', 'Associated Press (AP)');
      assert.equal(ap.author, 'Associated Press (AP)');

      const afp = sanitizeSocialSignal('Breaking wire update', 'Agence France-Presse (AFP)');
      assert.equal(afp.author, 'Agence France-Presse (AFP)');

      const usgs = sanitizeSocialSignal('M5.4 seismic alert', 'USGS Seismological Network');
      assert.equal(usgs.author, 'USGS Seismological Network');

      const coastguard = sanitizeSocialSignal('Distress relay', 'Hellenic Coastguard SAR');
      assert.equal(coastguard.author, 'Hellenic Coastguard SAR');

      const navy = sanitizeSocialSignal('Naval advisory', 'Regional Navy Operations');
      assert.equal(navy.author, 'Regional Navy Operations');

      const cwa = sanitizeSocialSignal('Weather advisory', 'Taiwan CWA Seismology');
      assert.equal(cwa.author, 'Taiwan CWA Seismology');

      const jma = sanitizeSocialSignal('Tsunami watch', 'Japan JMA Oceanography');
      assert.equal(jma.author, 'Japan JMA Oceanography');
    });

    test('should mask non-whitelisted authors to protect citizen identity (DPDP Act 2023)', () => {
      const citizen = sanitizeSocialSignal('Explosion heard', 'citizen_reporter_44');
      assert.equal(citizen.author, 'Local Eyewitness (PII Scrubbed pursuant to DPDP Act 2023)');

      const anonymous = sanitizeSocialSignal('Sirens sounding', 'anonymous');
      assert.equal(anonymous.author, 'Local Eyewitness (PII Scrubbed pursuant to DPDP Act 2023)');

      const defaultAuthor = sanitizeSocialSignal('Radar observation');
      assert.equal(defaultAuthor.author, 'Local Eyewitness (PII Scrubbed pursuant to DPDP Act 2023)');
    });
  });

  describe('Media & Metadata Sanitization', () => {
    test('should sanitize media metadata by stripping EXIF GPS, device make, and serial numbers', () => {
      const rawMedia = {
        GPSLatitude: 25.12345,
        GPSLongitude: 55.98765,
        Make: 'Sony Alpha',
        Model: 'ILCE-7M4',
        SerialNumber: 'SN-98765432',
        OwnerName: 'John Doe',
        timestampUtc: '2026-11-21T21:00:00Z',
        contentType: 'image/jpeg',
        perceptualHash: 'a1b2c3d4e5f6'
      };

      const result = sanitizeMediaMetadata(rawMedia);
      assert.equal(result.mediaScrubbed, true);
      assert.equal(result.faceBlurringApplied, true);
      assert.equal(result.exifPurged, true);
      assert.ok(result.strippedFields.includes('GPSLatitude'));
      assert.ok(result.strippedFields.includes('SerialNumber'));
      assert.ok(result.retainedFields.includes('perceptualHash'));
    });

    test('should handle null media metadata safely', () => {
      const result = sanitizeMediaMetadata(null);
      assert.equal(result.mediaScrubbed, true);
      assert.equal(result.faceBlurringApplied, true);
      assert.equal(result.exifPurged, true);
    });
  });

  describe('Anti-Doxxing Coordinate Obfuscator', () => {
    test('should fuzz residential/private coordinates to ~1.1km resolution', () => {
      const preciseLat = 12.587421;
      const preciseLng = 43.342198;
      const fuzzed = obfuscatePrivateCoordinates(preciseLat, preciseLng, false);

      assert.equal(fuzzed.lat, 12.59);
      assert.equal(fuzzed.lng, 43.34);
      assert.equal(fuzzed.precision, 'FUZZED_1KM_DPDP_COMPLIANT');
    });

    test('should preserve exact precision for verified public landmarks', () => {
      const lat = 12.587421;
      const lng = 43.342198;
      const exact = obfuscatePrivateCoordinates(lat, lng, true);

      assert.equal(exact.lat, 12.587421);
      assert.equal(exact.lng, 43.342198);
      assert.equal(exact.precision, 'EXACT_PUBLIC');
    });
  });

  describe('Edge Cases & Boundary Conditions', () => {
    test('should handle null, undefined, or empty rawText gracefully', () => {
      const nullResult = sanitizeSocialSignal(null);
      assert.equal(nullResult.text, '');
      assert.equal(nullResult.author, 'Local Eyewitness (PII Scrubbed pursuant to DPDP Act 2023)');
      assert.equal(nullResult.piiScrubbed, true);

      const undefinedResult = sanitizeSocialSignal(undefined);
      assert.equal(undefinedResult.text, '');
      assert.equal(undefinedResult.author, 'Local Eyewitness (PII Scrubbed pursuant to DPDP Act 2023)');
      assert.equal(undefinedResult.piiScrubbed, true);

      const emptyResult = sanitizeSocialSignal('');
      assert.equal(emptyResult.text, '');
      assert.equal(emptyResult.author, 'Local Eyewitness (PII Scrubbed pursuant to DPDP Act 2023)');
      assert.equal(emptyResult.piiScrubbed, true);
    });

    test('should sanitize composite text containing all PII types simultaneously', () => {
      const composite = 'Citizen @alex_intel reached via alex@osint.io from IP 198.51.100.25 tel +1-555-839-2019 near harbor';
      const result = sanitizeSocialSignal(composite, 'alex_intel');

      assert.ok(!result.text.includes('@alex_intel'));
      assert.ok(!result.text.includes('alex@osint.io'));
      assert.ok(!result.text.includes('198.51.100.25'));
      assert.ok(!result.text.includes('555-839-2019'));
      assert.ok(result.text.includes('@[REDACTED_HANDLE]'));
      assert.ok(result.text.includes('[REDACTED_EMAIL]'));
      assert.ok(result.text.includes('[REDACTED_IP]'));
      assert.ok(result.text.includes('[REDACTED_PHONE]'));
      assert.equal(result.author, 'Local Eyewitness (PII Scrubbed pursuant to DPDP Act 2023)');
      assert.equal(result.piiScrubbed, true);
      assert.equal(result.mediaScrubbed, true);
      assert.equal(result.faceBlurringApplied, true);
      assert.equal(result.complianceStatute, 'DPDP Act 2023 Sec 4 & IT Rules 2021');
      assert.ok(!isNaN(Date.parse(result.sanitizedAt)));
    });
  });
});
