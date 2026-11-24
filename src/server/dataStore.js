/**
 * VERITAS OSINT - Normalized Data Store & TTL Cache Layer
 * Implements Phase 3 Backend Architecture (`docs/backend-arch.md`):
 * - Cache-Aside & Write-Through TTL Cache with prefix invalidation
 * - Normalized Story & Dossier Repository seeded from INITIAL_STORIES
 * - Multi-dimension hot-query filtering (Keyword, Category, Status, Bias, Sensor)
 */

import { INITIAL_STORIES } from '../data/mockNewsData.js';
import { filterStories, generateMarkdownBrief, generateShareCardData } from '../engine/dossierExporter.js';

export class TTLCache {
  constructor(defaultTtlMs = 60000) {
    this.defaultTtlMs = defaultTtlMs;
    this.store = new Map();
    this.hits = 0;
    this.misses = 0;
  }

  get(key) {
    const entry = this.store.get(key);
    if (!entry) {
      this.misses++;
      return null;
    }
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      this.misses++;
      return null;
    }
    this.hits++;
    return entry.value;
  }

  set(key, value, ttlMs = this.defaultTtlMs) {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlMs
    });
    return value;
  }

  invalidate(key) {
    return this.store.delete(key);
  }

  invalidatePrefix(prefix) {
    let count = 0;
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.store.delete(key);
        count++;
      }
    }
    return count;
  }

  clear() {
    this.store.clear();
  }

  stats() {
    return {
      entries: this.store.size,
      hits: this.hits,
      misses: this.misses
    };
  }
}

export class VeritasDataStore {
  constructor(seedStories = INITIAL_STORIES) {
    this.stories = new Map();
    this.cache = new TTLCache(60000);
    this.seed(seedStories);
  }

  seed(seedStories = INITIAL_STORIES) {
    this.stories.clear();
    for (const story of seedStories) {
      if (story && story.id) {
        this.stories.set(story.id, structuredClone(story));
      }
    }
    this.cache.clear();
  }

  getAllStories() {
    return Array.from(this.stories.values());
  }

  queryFeed(filters = {}) {
    const normalizedFilters = {
      q: String(filters.q || '').trim(),
      category: String(filters.category || 'ALL'),
      status: String(filters.status || 'ALL'),
      bias: String(filters.bias || 'ALL'),
      sensor: String(filters.sensor || 'ALL')
    };
    const cacheKey = `feed:query:${JSON.stringify(normalizedFilters)}`;
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return {
        cached: true,
        count: cached.length,
        filters: normalizedFilters,
        stories: cached
      };
    }

    const filtered = filterStories(this.getAllStories(), normalizedFilters);
    this.cache.set(cacheKey, filtered, 60000);

    return {
      cached: false,
      count: filtered.length,
      filters: normalizedFilters,
      stories: filtered
    };
  }

  getDossierById(id) {
    if (!id) return null;
    const cacheKey = `dossier:${id}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    const story = this.stories.get(id) || null;
    if (story) {
      this.cache.set(cacheKey, story, 300000);
    }
    return story;
  }

  upsertDossier(dossier) {
    if (!dossier || !dossier.id) {
      throw new Error('Valid dossier with an id is required');
    }
    // Insert new or updated dossier at the front of the Map
    const existingEntries = Array.from(this.stories.entries()).filter(([k]) => k !== dossier.id);
    this.stories.clear();
    this.stories.set(dossier.id, structuredClone(dossier));
    for (const [k, v] of existingEntries) {
      this.stories.set(k, v);
    }

    // Write-through cache for dossier:<id> (300s TTL) & invalidate feed:* keys
    this.cache.set(`dossier:${dossier.id}`, dossier, 300000);
    this.cache.invalidatePrefix('feed:');
    return dossier;
  }

  exportDossier(id, format = 'json') {
    const story = this.getDossierById(id);
    if (!story) return null;

    const fmt = String(format || 'json').toLowerCase();
    const shareCard = generateShareCardData(story);
    const markdownBrief = generateMarkdownBrief(story);

    if (fmt === 'markdown' || fmt === 'md') {
      return {
        contentType: 'text/markdown; charset=utf-8',
        filename: `VERITAS_Brief_${story.id}.md`,
        body: markdownBrief
      };
    }

    if (fmt === 'share') {
      return {
        contentType: 'application/json',
        filename: `VERITAS_ShareCard_${story.id}.json`,
        body: JSON.stringify(shareCard, null, 2)
      };
    }

    return {
      contentType: 'application/json',
      filename: `VERITAS_Dossier_${story.id}.json`,
      body: JSON.stringify(
        {
          dossier: story,
          shareCard,
          markdownBrief
        },
        null,
        2
      )
    };
  }
}

export const defaultDataStore = new VeritasDataStore();
