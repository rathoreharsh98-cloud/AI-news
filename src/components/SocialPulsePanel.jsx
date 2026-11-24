import React, { useEffect, useState } from 'react';
import {
  Radio,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  AlertTriangle,
  MessageSquare,
  Heart,
  Repeat2,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { fetchLiveSocialStatus } from '../services/socialStatusService';

export default function SocialPulsePanel({ onVerifySocialPost, defaultExpanded = false }) {
  const [socialData, setSocialData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [platformFilter, setPlatformFilter] = useState('ALL'); // 'ALL' | 'Bluesky' | 'Reddit'

  const loadSocialStatus = async () => {
    setIsLoading(true);
    try {
      const data = await fetchLiveSocialStatus();
      setSocialData(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSocialStatus();
  }, []);

  const filteredPosts = (socialData?.posts || []).filter((p) =>
    platformFilter === 'ALL' ? true : p.platform === platformFilter
  );

  return (
    <section
      aria-label="Live Social Media Status and DPDP-Sanitized Pulse"
      className="bg-[#0d121c] border border-slate-800/90 rounded-lg p-3 sm:p-3.5"
    >
      {/* Top Status Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-2 flex-wrap">
          <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
          <h3 className="text-[11px] font-mono font-bold tracking-wider text-slate-200 uppercase">
            Social Media Status &amp; Public OSINT Pulse
          </h3>
          <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <ShieldCheck className="w-3 h-3" />
            DPDP-2023 PII SCRUBBED
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadSocialStatus}
            disabled={isLoading}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#080b11] hover:bg-[#131a29] border border-slate-700/80 text-[11px] font-mono text-cyan-300 transition-colors cursor-pointer"
            title="Refresh social media channels"
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#080b11] hover:bg-[#131a29] border border-slate-700/80 text-[11px] font-mono text-slate-200 hover:text-cyan-300 transition-colors cursor-pointer"
            aria-expanded={isExpanded}
          >
            <span>{isExpanded ? 'Hide Pulse Feed' : `Inspect Pulse (${socialData?.posts?.length || 0})`}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Live Channel Status Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2.5 font-mono text-xs">
        {(socialData?.channels || [
          { id: 'l1', name: 'Bluesky AT-Protocol', status: 'SYNCING', count: 0, latency: '...' },
          { id: 'l2', name: 'Reddit OSINT / Worldnews', status: 'SYNCING', count: 0, latency: '...' },
          { id: 'l3', name: 'Sybil / Botnet Guard', status: 'CLEAR', count: 0, latency: '<5ms' }
        ]).map((ch) => {
          const isLive = ch.status === 'LIVE' || ch.status === 'CLEAR';
          return (
            <div
              key={ch.id}
              className="bg-[#080b11] border border-slate-800/90 hover:border-slate-700 transition-colors rounded-md px-3 py-2 flex items-center justify-between gap-2"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      ch.status === 'LIVE'
                        ? 'bg-emerald-400'
                        : ch.status === 'CLEAR'
                        ? 'bg-cyan-400'
                        : ch.status === 'FILTERING'
                        ? 'bg-amber-400'
                        : 'bg-slate-500'
                    }`}
                  />
                  <span className="text-[11px] font-semibold text-slate-200 truncate">{ch.name}</span>
                </div>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {ch.id === 'ch-botguard'
                    ? `${ch.count} astroturf bursts damped`
                    : `${ch.count} sanitized signals • ${ch.latency}`}
                </span>
              </div>
              <span
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded border flex-shrink-0 ${
                  isLive
                    ? 'bg-emerald-950/70 text-emerald-400 border-emerald-800'
                    : ch.status === 'FILTERING'
                    ? 'bg-amber-950/70 text-amber-300 border-amber-800'
                    : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}
              >
                {ch.status}
              </span>
            </div>
          );
        })}
      </div>

      {/* Expandable Sanitized Social Stream */}
      {isExpanded && (
        <div className="mt-4 pt-3 border-t border-slate-800 space-y-3">
          {/* Platform Filter Pills */}
          <div className="flex items-center justify-between gap-2 flex-wrap font-mono text-[11px]">
            <div className="flex items-center gap-1.5">
              {['ALL', 'Bluesky', 'Reddit'].map((plat) => (
                <button
                  key={plat}
                  type="button"
                  onClick={() => setPlatformFilter(plat)}
                  className={`px-2.5 py-1 rounded-md border transition-colors cursor-pointer ${
                    platformFilter === plat
                      ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40 font-bold'
                      : 'bg-[#080b11] text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {plat}
                </button>
              ))}
            </div>
            <span className="text-[10px] text-slate-500">
              All @handles, emails, phones &amp; IPs masked before display
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {filteredPosts.map((post) => (
              <div
                key={post.id}
                className="bg-[#080b11] border border-slate-800/90 hover:border-cyan-500/40 rounded-lg p-3 flex flex-col justify-between gap-2.5 transition-colors"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2 text-[10px] font-mono">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span
                        className={`px-1.5 py-0.5 rounded font-bold ${
                          post.platform === 'Bluesky'
                            ? 'bg-sky-950 text-sky-300 border border-sky-800'
                            : 'bg-orange-950 text-orange-300 border border-orange-800'
                        }`}
                      >
                        {post.platform}
                      </span>
                      <span className="text-slate-400 truncate">{post.channel}</span>
                      {post.isLive && (
                        <span className="text-emerald-400 font-bold">● LIVE</span>
                      )}
                    </div>
                    <span className="text-slate-500 flex-shrink-0">{post.time}</span>
                  </div>

                  <p className="text-xs text-slate-200 leading-relaxed line-clamp-3">
                    {post.content}
                  </p>

                  {post.botnetAnomalyDetected && (
                    <div className="flex items-center gap-1 text-[10px] font-mono text-amber-400 bg-amber-950/40 border border-amber-800/50 px-2 py-0.5 rounded">
                      <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                      <span>High-velocity burst flagged (social weight damped ≤ 3%)</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-400">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3 text-rose-400" />
                      {post.engagement?.likes ?? 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <Repeat2 className="w-3 h-3 text-cyan-400" />
                      {post.engagement?.reposts ?? 0}
                    </span>
                    <a
                      href={post.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-slate-400 hover:text-cyan-300 flex items-center gap-0.5"
                    >
                      <span>Source</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>

                  {onVerifySocialPost && (
                    <button
                      type="button"
                      onClick={() => onVerifySocialPost(post)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/40 font-bold transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Cross-Check</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
