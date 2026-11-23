import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  fetchLiveSocialStatus,
  getFallbackSocialPosts
} from '../../src/services/socialStatusService.js';

describe('Unit Test: Social Media Status & DPDP-Sanitized Pulse Service (v2.0)', () => {
  it('SOC-001: getFallbackSocialPosts strictly scrubs all PII (handles, +91 phones, emails, IPs) under DPDP Act 2023', () => {
    const posts = getFallbackSocialPosts();
    assert.ok(posts.length >= 4, 'Should provide at least 4 fallback social status pulses');

    for (const post of posts) {
      assert.equal(post.piiScrubbed, true, 'Every social post must be marked piiScrubbed');
      assert.equal(post.faceBlurApplied, true, 'Biometric face blur flag must be true');
      assert.ok(!post.content.includes('@port_watch_ops'), 'Raw @handle must be redacted');
      assert.ok(!post.content.includes('98201'), 'Indian +91 phone number must be redacted');
      assert.ok(!post.content.includes('ops@osint-watch.org'), 'Email address must be redacted');
      assert.ok(!post.content.includes('192.168.10.44'), 'IPv4 address must be redacted');
      assert.ok(
        post.authorType.includes('PII Scrubbed pursuant to DPDP Act 2023'),
        'Non-whitelisted author handle must be masked under DPDP Act 2023'
      );
    }
  });

  it('SOC-002: fetchLiveSocialStatus returns unified channel health statuses and sanitized posts', async () => {
    const data = await fetchLiveSocialStatus();
    assert.ok(Array.isArray(data.posts) && data.posts.length >= 1, 'Must return at least 1 social post');
    assert.ok(Array.isArray(data.channels) && data.channels.length === 3, 'Must report all 3 social status channels');

    const channelIds = data.channels.map(c => c.id);
    assert.ok(channelIds.includes('ch-bsky'), 'Must include Bluesky channel status');
    assert.ok(channelIds.includes('ch-reddit'), 'Must include Reddit channel status');
    assert.ok(channelIds.includes('ch-botguard'), 'Must include Botnet/Sybil Guard status');

    assert.equal(data.summary.dpdpCompliant, true, 'Summary must assert DPDP Act 2023 compliance');
    assert.equal(data.summary.piiScrubbedCount, data.posts.length, '100% of returned posts must be PII scrubbed');
  });

  it('SOC-003: fetchLiveSocialStatus supports keyword filtering gracefully', async () => {
    const maritimeData = await fetchLiveSocialStatus('maritime Bab-el-Mandeb');
    assert.ok(maritimeData.posts.length >= 1);
    assert.equal(maritimeData.summary.dpdpCompliant, true);
  });
});
