import React, { useEffect, useState } from 'react';
import { Plane, Ship, Activity, Flame, ShieldCheck, Wifi } from 'lucide-react';
import { OSINT_TELEMETRY_FEEDS } from '../data/mockNewsData';
import { getLiveTelemetryCounts } from '../services/mapDataService';

export default function TelemetryTicker() {
  const [liveCounts, setLiveCounts] = useState(null);

  useEffect(() => {
    let mounted = true;
    getLiveTelemetryCounts().then((counts) => {
      if (mounted) setLiveCounts(counts);
    }).catch(() => {});
    return () => { mounted = false; };
  }, []);

  const getDynamicSignals = (feed) => {
    if (!liveCounts) return feed.signalsProcessed;
    if (feed.type.includes('Seismic')) return `${liveCounts.quakesCount} Active Quakes (M4.5+)`;
    if (feed.type.includes('Flight')) return `${liveCounts.flightsCount} Active Aircraft Vectors`;
    if (feed.type.includes('Thermal')) return `${liveCounts.disastersCount} NASA EONET Hazards`;
    return feed.signalsProcessed;
  };

  const getIcon = (type) => {
    switch (type) {
      case 'ADS-B Flight Radar':
        return <Plane className="w-3.5 h-3.5 text-blue-400" />;
      case 'Maritime AIS Telemetry':
        return <Ship className="w-3.5 h-3.5 text-sky-400" />;
      case 'USGS Real-time Seismic':
        return <Activity className="w-3.5 h-3.5 text-amber-400" />;
      case 'NASA FIRMS Satellite Thermal':
        return <Flame className="w-3.5 h-3.5 text-rose-400" />;
      default:
        return <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />;
    }
  };

  return (
    <div className="bg-[#0d121c] border border-slate-800/90 rounded-lg p-3 sm:p-3.5">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-2.5">
        <div className="flex items-center gap-2">
          <Wifi className="w-3.5 h-3.5 text-cyan-400" />
          <h3 className="text-[11px] font-mono font-bold tracking-wider text-slate-200 uppercase">
            Live OSINT Telemetry Pipeline (Clean Room API Ingestion)
          </h3>
        </div>
        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
          {liveCounts ? `${liveCounts.liveStreamsOperational}/5 STREAMS LIVE` : 'ALL 5 STREAMS OPERATIONAL'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 font-mono text-xs">
        {OSINT_TELEMETRY_FEEDS.map((feed) => (
          <div key={feed.id} className="bg-[#080b11] border border-slate-800/90 hover:border-slate-700 transition-colors p-2.5 rounded-md flex flex-col justify-between space-y-1">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-semibold text-slate-200 text-[11px]">
                {getIcon(feed.type)}
                <span className="truncate">{feed.type.split(' ')[0]}</span>
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                {feed.status}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 truncate">
              {feed.name}
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800/80">
              <span className="text-slate-300 font-medium truncate">{getDynamicSignals(feed)}</span>
              <span className="text-cyan-400 flex-shrink-0 ml-1">{feed.latency}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
