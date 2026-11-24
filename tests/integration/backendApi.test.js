import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import http from 'node:http';
import {
  handleApiRequest,
  VeritasDataStore,
  TTLCache
} from '../../src/server/apiServer.js';
import {
  filterStories,
  generateMarkdownBrief,
  generateShareCardData,
  matchesBiasFilter,
  matchesSensorFilter
} from '../../src/engine/dossierExporter.js';
import { INITIAL_STORIES } from '../../src/data/mockNewsData.js';

describe('Phase 3 & 4: Backend API, Caching Topology, Multi-Filter & Dossier Export Suite', () => {
  let testServer;
  let baseUrl;
  let testStore;

  before(async () => {
    testStore = new VeritasDataStore(INITIAL_STORIES);
    testServer = http.createServer((req, res) => handleApiRequest(req, res, testStore));
    await new Promise((resolve) => {
      testServer.listen(0, '127.0.0.1', () => {
        const addr = testServer.address();
        baseUrl = `http://127.0.0.1:${addr.port}`;
        resolve();
      });
    });
  });

  after(async () => {
    if (testServer) {
      await new Promise((resolve) => testServer.close(resolve));
    }
  });

  it('API-001: TTLCache supports set, get, prefix invalidation, and hit/miss tracking', () => {
    const cache = new TTLCache(5000);
    assert.strictEqual(cache.get('feed:query:1'), null);
    cache.set('feed:query:1', ['a']);
    cache.set('feed:query:2', ['b']);
    cache.set('dossier:story-001', { id: 'story-001' });

    assert.deepStrictEqual(cache.get('feed:query:1'), ['a']);
    assert.strictEqual(cache.invalidatePrefix('feed:'), 2);
    assert.strictEqual(cache.get('feed:query:1'), null);
    assert.deepStrictEqual(cache.get('dossier:story-001'), { id: 'story-001' });
  });

  it('API-002: Multi-dimension filterStories filters by keyword, bias, status, and sensor layer (Journey 3)', () => {
    // Filter by SEISMIC sensor
    const seismicStories = filterStories(INITIAL_STORIES, { sensor: 'SEISMIC' });
    assert.ok(seismicStories.length >= 1, 'Should match seismic stories');
    assert.ok(seismicStories.some((s) => s.id === 'story-003'), 'Taiwan M6.3 quake should match SEISMIC');

    // Filter by THERMAL sensor
    const thermalStories = filterStories(INITIAL_STORIES, { sensor: 'THERMAL' });
    assert.ok(thermalStories.some((s) => s.id === 'story-005'), 'Peloponnese wildfire should match THERMAL');

    // Filter by AVIATION sensor & DISPUTED status
    const disputedAviation = filterStories(INITIAL_STORIES, {
      sensor: 'AVIATION',
      status: 'DISPUTED'
    });
    assert.ok(disputedAviation.some((s) => s.id === 'story-002'), 'Black Sea airspace claim should match');

    // Filter by RIGHT bias
    const rightBias = filterStories(INITIAL_STORIES, { bias: 'RIGHT' });
    assert.ok(rightBias.some((s) => s.id === 'story-002'), 'Story-002 has 50% right coverage');

    // Filter by BLINDSPOT
    const blindspots = filterStories(INITIAL_STORIES, { bias: 'BLINDSPOT' });
    assert.ok(blindspots.length >= 1, 'Should detect media blindspots');
  });

  it('API-003: generateMarkdownBrief and generateShareCardData produce complete forensic artifacts (Journey 2)', () => {
    const sampleStory = INITIAL_STORIES[0];
    const md = generateMarkdownBrief(sampleStory);
    assert.ok(md.includes(`# VERITAS OSINT — Forensic Verification Dossier #${sampleStory.id}`));
    assert.ok(md.includes('Ground News Multi-Angle Media Bias Footprint'));
    assert.ok(md.includes('Parallel 3-Layer Cross-Check Evidence Matrix'));
    assert.ok(md.includes('Section 79 IT Act'));

    const card = generateShareCardData(sampleStory);
    assert.strictEqual(card.dossierId, sampleStory.id);
    assert.strictEqual(card.corroborationScore, sampleStory.corroborationScore);
    assert.ok(card.shareText.includes('VERITAS OSINT VERIFICATION BRIEF'));
    assert.ok(card.shareText.includes(sampleStory.title));
  });

  it('API-004: GET /healthz and GET /readyz return liveness, readiness, and X-Request-Id headers', async () => {
    const healthRes = await fetch(`${baseUrl}/healthz`);
    assert.strictEqual(healthRes.status, 200);
    assert.ok(healthRes.headers.get('x-request-id'), 'Must include X-Request-Id header');
    const healthBody = await healthRes.json();
    assert.strictEqual(healthBody.status, 'UP');

    const readyRes = await fetch(`${baseUrl}/readyz`);
    assert.strictEqual(readyRes.status, 200);
    const readyBody = await readyRes.json();
    assert.strictEqual(readyBody.status, 'READY');
    assert.ok(readyBody.stories_indexed >= INITIAL_STORIES.length);
  });

  it('API-005: GET /api/v1/feed returns filtered stories and populates cache (MISS -> HIT)', async () => {
    const firstRes = await fetch(`${baseUrl}/api/v1/feed?sensor=SEISMIC&status=CORROBORATED`);
    assert.strictEqual(firstRes.status, 200);
    assert.strictEqual(firstRes.headers.get('x-cache'), 'MISS');
    const firstData = await firstRes.json();
    assert.strictEqual(firstData.cached, false);
    assert.ok(firstData.count >= 1);

    const secondRes = await fetch(`${baseUrl}/api/v1/feed?sensor=SEISMIC&status=CORROBORATED`);
    assert.strictEqual(secondRes.status, 200);
    assert.strictEqual(secondRes.headers.get('x-cache'), 'HIT');
    const secondData = await secondRes.json();
    assert.strictEqual(secondData.cached, true);
    assert.strictEqual(secondData.count, firstData.count);
  });

  it('API-006: POST /api/v1/verify persists dossier, invalidates feed cache, and supports GET /api/v1/dossier/:id export', async () => {
    const verifyRes = await fetch(`${baseUrl}/api/v1/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        claim: 'Commercial cargo ship reports emergency engine fire near Bab-el-Mandeb Strait',
        region: 'Middle East'
      })
    });
    assert.strictEqual(verifyRes.status, 200);
    const verifyData = await verifyRes.json();
    assert.ok(verifyData.dossierId, 'Must return a dossierId');

    // Feed cache must be invalidated (next GET is MISS)
    const feedRes = await fetch(`${baseUrl}/api/v1/feed`);
    assert.strictEqual(feedRes.headers.get('x-cache'), 'MISS');

    // Export Dossier as Markdown (.md)
    const mdRes = await fetch(`${baseUrl}/api/v1/dossier/${verifyData.dossierId}?format=markdown`);
    assert.strictEqual(mdRes.status, 200);
    assert.ok(mdRes.headers.get('content-type').includes('text/markdown'));
    const mdText = await mdRes.text();
    assert.ok(mdText.includes(verifyData.dossierId));

    // Export Dossier as Share Card JSON
    const shareRes = await fetch(`${baseUrl}/api/v1/dossier/${verifyData.dossierId}?format=share`);
    assert.strictEqual(shareRes.status, 200);
    const shareJson = await shareRes.json();
    assert.strictEqual(shareJson.dossierId, verifyData.dossierId);
    assert.ok(shareJson.shareText.includes('VERITAS OSINT VERIFICATION BRIEF'));
  });
});
