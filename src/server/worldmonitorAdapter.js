/**
 * VERITAS OSINT - AGPL-3.0 Clean-Room HTTP Sidecar Adapter
 * Benchmark: Martin Fowler Anti-Corruption Layer & Clean-Room Air-Gap
 * 
 * Strict Legal Boundary:
 * - Operates as an independent daemon in an isolated Docker container/network.
 * - Zero shared memory, zero library linkage, zero code sharing with VERITAS core.
 * - Communicates strictly via standard data-only JSON over HTTP REST.
 */

import http from 'node:http';
import { parse } from 'node:url';

const PORT = process.env.PORT || 8091;

// In-memory normalized telemetry snapshot
const mockLiveTelemetry = {
  adsb: [
    { icao: 'AE6812', callsign: 'PATROL21', type: 'P-8A Poseidon', lat: 12.587, lng: 43.342, alt_baro: 24000, speed: 380, squawk: '7700', updated_at: new Date().toISOString() },
    { icao: '4B821A', callsign: 'FORTE11', type: 'RQ-4 Global Hawk', lat: 44.152, lng: 35.812, alt_baro: 52000, speed: 310, squawk: '1200', updated_at: new Date().toISOString() }
  ],
  ais: [
    { mmsi: 244780000, ship_name: 'STELLAR TIDE', imo: 9482110, type: 'Crude Oil Tanker', lat: 12.551, lng: 43.310, sog: 3.2, cog: 142.0, nav_status: 'Underway Using Engine', updated_at: new Date().toISOString() },
    { mmsi: 311000123, ship_name: 'NORDIC SKY', imo: 9812450, type: 'Container Ship', lat: 12.490, lng: 43.400, sog: 16.4, cog: 135.0, nav_status: 'Underway Using Engine', updated_at: new Date().toISOString() }
  ],
  seismic: [
    { event_id: 'us7000m98k', mag: 5.4, depth_km: 10.0, place: '42 km SSW of Bab-el-Mandeb', lat: 12.210, lng: 43.120, time: new Date(Date.now() - 3600000).toISOString() }
  ],
  thermal: [
    { id: 'MODIS-2026-918', frp: 48.2, confidence: 92, lat: 12.560, lng: 43.325, satellite: 'Terra/Aqua MODIS', acq_date: new Date().toISOString() }
  ]
};

const server = http.createServer((req, res) => {
  const { pathname, query } = parse(req.url, true);

  // Set standard clean-room JSON headers
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('X-Clean-Room-Isolation', 'AGPL-3.0-Air-Gapped-Sidecar');
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (pathname === '/healthz') {
    res.writeHead(200);
    res.end(JSON.stringify({ status: 'UP', service: 'worldmonitor-cleanroom-adapter', timestamp: new Date().toISOString() }));
    return;
  }

  if (pathname === '/api/v1/osint/feed' && req.method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({
      schema_version: '1.0.0',
      source: 'worldmonitor-sidecar-isolated',
      ingested_at: new Date().toISOString(),
      counts: {
        adsb: mockLiveTelemetry.adsb.length,
        ais: mockLiveTelemetry.ais.length,
        seismic: mockLiveTelemetry.seismic.length,
        thermal: mockLiveTelemetry.thermal.length
      },
      data: mockLiveTelemetry
    }));
    return;
  }

  if (pathname === '/api/v1/osint/query' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const { minLat, maxLat, minLng, maxLng, type } = payload;
        
        let filtered = mockLiveTelemetry;
        if (minLat !== undefined && maxLat !== undefined && minLng !== undefined && maxLng !== undefined) {
          filtered = {
            adsb: mockLiveTelemetry.adsb.filter(a => a.lat >= minLat && a.lat <= maxLat && a.lng >= minLng && a.lng <= maxLng),
            ais: mockLiveTelemetry.ais.filter(a => a.lat >= minLat && a.lat <= maxLat && a.lng >= minLng && a.lng <= maxLng),
            seismic: mockLiveTelemetry.seismic.filter(a => a.lat >= minLat && a.lat <= maxLat && a.lng >= minLng && a.lng <= maxLng),
            thermal: mockLiveTelemetry.thermal.filter(a => a.lat >= minLat && a.lat <= maxLat && a.lng >= minLng && a.lng <= maxLng)
          };
        }

        res.writeHead(200);
        res.end(JSON.stringify({
          query: payload,
          matched: true,
          data: filtered,
          timestamp: new Date().toISOString()
        }));
      } catch (e) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Malformed JSON query payload' }));
      }
    });
    return;
  }

  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Not Found' }));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[CLEAN-ROOM] WorldMonitor AGPL-3.0 Sidecar Adapter listening on port ${PORT}`);
});
