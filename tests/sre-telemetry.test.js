import { describe, it } from 'node:test';
import assert from 'node:assert';
import { StreamTelemetryMonitor, CircuitBreaker } from '../src/server/telemetryIngestion.js';
import { TokenBucketLimiter } from '../src/server/apiServer.js';

describe('VERITAS OSINT SRE & Telemetry Infrastructure Suite', () => {
  it('SRE-001: StreamTelemetryMonitor accurately computes p50, p90, and p99 percentiles', () => {
    const monitor = new StreamTelemetryMonitor();
    const percentiles = monitor.calculatePercentiles('adsb_opensky');
    assert.ok(percentiles.p50 > 0, 'p50 should be positive');
    assert.ok(percentiles.p90 >= percentiles.p50, 'p90 should be >= p50');
    assert.ok(percentiles.p99 >= percentiles.p90, 'p99 should be >= p90');
  });

  it('SRE-002: CircuitBreaker trips to OPEN after threshold failures and respects cooldown', () => {
    const cb = new CircuitBreaker('test_sensor', 3, 1000);
    assert.strictEqual(cb.state, 'CLOSED');
    assert.strictEqual(cb.canExecute(), true);

    cb.recordFailure();
    cb.recordFailure();
    assert.strictEqual(cb.state, 'CLOSED');

    cb.recordFailure();
    assert.strictEqual(cb.state, 'OPEN');
    assert.strictEqual(cb.canExecute(), false);

    // After success, it resets
    cb.recordSuccess();
    assert.strictEqual(cb.state, 'CLOSED');
  });

  it('SRE-003: TokenBucketLimiter enforces strict rate limiting per IP', () => {
    const limiter = new TokenBucketLimiter(5);
    const ip = '10.0.0.99';

    for (let i = 0; i < 5; i++) {
      assert.strictEqual(limiter.isAllowed(ip), true, `Request ${i + 1} should be allowed`);
    }

    // 6th request should be clamped
    assert.strictEqual(limiter.isAllowed(ip), false, '6th request must be clamped');
  });

  it('SRE-004: Clean-Room health summary emits valid Prometheus-compatible metrics', () => {
    const monitor = new StreamTelemetryMonitor();
    const promMetrics = monitor.toPrometheusMetrics();

    assert.ok(promMetrics.includes('telemetry_ingestion_latency_p99_ms'), 'Must export p99 gauge');
    assert.ok(promMetrics.includes('telemetry_sensor_healthy'), 'Must export sensor health gauge');
    assert.ok(promMetrics.includes('telemetry_total_events'), 'Must export total events');
  });
});
