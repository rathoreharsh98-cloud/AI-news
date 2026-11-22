import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { extractEntities } from '../../src/engine/claimExtractor.js';

describe('Unit Test: ClaimExtractor & Deterministic NER (TSK-101)', () => {

  describe('Geographic Entity Resolution (WHERE)', () => {
    test('should resolve Bab-el-Mandeb Strait / Red Sea coordinates', () => {
      const claim = 'Commercial tanker fired upon near Bab-el-Mandeb strait in the southern Red Sea';
      const result = extractEntities(claim);

      assert.equal(result.location.name, 'Bab-el-Mandeb Strait / Red Sea');
      assert.equal(result.location.lat, 12.587);
      assert.equal(result.location.lng, 43.342);
      assert.equal(result.location.country, 'Yemen / Djibouti Waters');
      assert.ok(result.where.includes('12.587° N, 43.342° E'));
    });

    test('should resolve Western Black Sea / Constanța FIR coordinates', () => {
      const claim = 'Unidentified drone tracked over Western Black Sea off Constanța Romania';
      const result = extractEntities(claim);

      assert.equal(result.location.name, 'Western Black Sea / Constanța FIR');
      assert.equal(result.location.lat, 44.180);
      assert.equal(result.location.lng, 30.120);
      assert.equal(result.location.country, 'International Airspace');
    });

    test('should resolve Taiwan / Hualien offshore coordinates', () => {
      const claim = 'M7.2 shallow earthquake strikes offshore Hualien Taiwan';
      const result = extractEntities(claim);

      assert.equal(result.location.name, 'Offshore Hualien County');
      assert.equal(result.location.lat, 24.015);
      assert.equal(result.location.lng, 121.840);
      assert.equal(result.location.country, 'Taiwan');
    });

    test('should resolve Baltic Sea / Gotland Deep coordinates', () => {
      const claim = 'Subsea communications cable severed in the Baltic Sea near Gotland Sweden';
      const result = extractEntities(claim);

      assert.equal(result.location.name, 'Baltic Sea / Gotland Deep');
      assert.equal(result.location.lat, 57.340);
      assert.equal(result.location.lng, 18.980);
      assert.equal(result.location.country, 'Sweden');
    });

    test('should resolve Peloponnese Peninsula / Greece coordinates', () => {
      const claim = 'Rapid wildfire outbreak threatening forest regions across Peloponnese Greece';
      const result = extractEntities(claim);

      assert.equal(result.location.name, 'Peloponnese Peninsula');
      assert.equal(result.location.lat, 37.650);
      assert.equal(result.location.lng, 22.120);
      assert.equal(result.location.country, 'Greece');
    });

    test('should resolve Geneva Airspace / Switzerland coordinates', () => {
      const claim = 'VIP diplomatic charter flight holding over Geneva airspace Switzerland';
      const result = extractEntities(claim);

      assert.equal(result.location.name, 'Geneva Airspace');
      assert.equal(result.location.lat, 46.204);
      assert.equal(result.location.lng, 6.143);
      assert.equal(result.location.country, 'Switzerland');
    });

    test('should resolve Strait of Hormuz / Persian Gulf coordinates', () => {
      const claim = 'Oil carrier patrol escort approaching the Strait of Hormuz in Persian Gulf';
      const result = extractEntities(claim);

      assert.equal(result.location.name, 'Strait of Hormuz');
      assert.equal(result.location.lat, 26.566);
      assert.equal(result.location.lng, 56.250);
      assert.equal(result.location.country, 'Oman / Iran Waters');
    });

    test('should fallback to default International coordinates when no geographic keywords match', () => {
      const claim = 'Unconfirmed satellite burst anomaly detected';
      const result = extractEntities(claim);

      assert.equal(result.location.name, 'International Waters / Airspace');
      assert.equal(result.location.lat, 25.0);
      assert.equal(result.location.lng, 45.0);
      assert.equal(result.location.country, 'International');
    });

    test('should use optionalRegion parameter as location name fallback', () => {
      const claim = 'Unidentified radar blip reported';
      const result = extractEntities(claim, 'South China Sea Sector 4');

      assert.equal(result.location.name, 'South China Sea Sector 4');
      assert.equal(result.location.lat, 25.0);
      assert.equal(result.location.lng, 45.0);
    });
  });

  describe('Key Actors Extraction (WHO)', () => {
    test('should extract maritime actors for vessels, ships, and tankers', () => {
      const result = extractEntities('Container ship loses steering in shipping lane');
      assert.ok(result.who.includes('Commercial Maritime Carrier'));
      assert.ok(result.who.includes('Coastal Maritime Patrol Authority'));
    });

    test('should extract aviation actors for aircraft, flights, and corridors', () => {
      const result = extractEntities('Commercial flight declares emergency in transit corridor');
      assert.ok(result.who.includes('Aviation Control Center'));
      assert.ok(result.who.includes('Regional FIR Air Traffic'));
    });

    test('should extract seismological actors for earthquakes, tremors, and quakes', () => {
      const result = extractEntities('Magnitude 6.2 quake shakes coastal archipelago');
      assert.ok(result.who.includes('USGS Seismological Network'));
      assert.ok(result.who.includes('National Disaster Management Bureau'));
    });

    test('should combine multiple actor domains when claim spans multi-modal event', () => {
      const result = extractEntities('Maritime patrol aircraft investigates vessel distress signal');
      assert.ok(result.who.includes('Commercial Maritime Carrier'));
      assert.ok(result.who.includes('Aviation Control Center'));
    });

    test('should provide default monitored entities fallback when no domain keywords match', () => {
      const result = extractEntities('Cyber incident disrupts financial settlement gateway');
      assert.ok(result.who.includes('Regional Monitored Entities'));
      assert.ok(result.who.includes('Independent Reporting Channels'));
    });
  });

  describe('Urgency Classification', () => {
    test('should classify missile, attack, and emergency as CRITICAL', () => {
      assert.equal(extractEntities('Ballistic missile launched over ocean').urgency, 'CRITICAL');
      assert.equal(extractEntities('Drone attack reported on harbor infrastructure').urgency, 'CRITICAL');
      assert.equal(extractEntities('Major M7.5 earthquake triggers tsunami warning').urgency, 'CRITICAL');
      assert.equal(extractEntities('Vessel declares emergency after engine failure').urgency, 'CRITICAL');
    });

    test('should classify squawk 7700, diversion, and fire as HIGH', () => {
      assert.equal(extractEntities('Aircraft squawk 7700 over eastern Alps').urgency, 'HIGH');
      assert.equal(extractEntities('Commercial carrier announces course diversion').urgency, 'HIGH');
      assert.equal(extractEntities('Refinery fire observed from orbital pass').urgency, 'HIGH');
    });

    test('should classify standard observations as MEDIUM', () => {
      assert.equal(extractEntities('Scheduled naval exercises commence in sector').urgency, 'MEDIUM');
      assert.equal(extractEntities('Weather reconnaissance satellite pass scheduled').urgency, 'MEDIUM');
    });
  });

  describe('Input Validation & Edge Cases', () => {
    test('should throw an error if claim text is null or undefined', () => {
      assert.throws(() => extractEntities(null), {
        name: 'Error',
        message: 'Claim text must be a non-empty string'
      });
      assert.throws(() => extractEntities(undefined), {
        name: 'Error',
        message: 'Claim text must be a non-empty string'
      });
    });

    test('should throw an error if claim text is an empty string', () => {
      assert.throws(() => extractEntities(''), {
        name: 'Error',
        message: 'Claim text must be a non-empty string'
      });
    });

    test('should throw an error if claim text is not a string type', () => {
      assert.throws(() => extractEntities(12345), {
        name: 'Error',
        message: 'Claim text must be a non-empty string'
      });
      assert.throws(() => extractEntities({ claim: 'test' }), {
        name: 'Error',
        message: 'Claim text must be a non-empty string'
      });
      assert.throws(() => extractEntities(['test']), {
        name: 'Error',
        message: 'Claim text must be a non-empty string'
      });
    });

    test('should trim leading and trailing whitespace from claim text', () => {
      const claim = '   Vessel in distress near Bab-el-Mandeb   ';
      const result = extractEntities(claim);
      assert.equal(result.what, 'Vessel in distress near Bab-el-Mandeb');
    });

    test('should return a valid ISO-8601 when timestamp', () => {
      const result = extractEntities('Standard patrol in progress');
      assert.ok(!isNaN(Date.parse(result.when)));
    });
  });
});
