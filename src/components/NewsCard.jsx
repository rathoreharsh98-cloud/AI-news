import React from 'react';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  MapPin, 
  Clock, 
  ChevronRight, 
  Scale, 
  ShieldCheck,
  Zap,
  Radio,
  Bookmark,
  Share2
} from 'lucide-react';

export default function NewsCard({ story, isSelected, onSelect, onShare, isSaved = false, onToggleSave }) {
  const getStatusBadge = () => {
    switch (story.status) {
      case 'CORROBORATED':
        return (
          <span 
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
            role="status"
            aria-label={`Status: Corroborated with ${story.corroborationScore}% confidence`}
          >
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
            CORROBORATED ({story.corroborationScore}%)
          </span>
        );
      case 'DEVELOPING':
        return (
          <span 
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30"
            role="status"
            aria-label={`Status: Developing with ${story.corroborationScore}% confidence`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
            DEVELOPING ({story.corroborationScore}%)
          </span>
        );
      case 'DISPUTED':
        return (
          <span 
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30"
            role="status"
            aria-label={`Status: Disputed with ${story.corroborationScore}% confidence`}
          >
            <XCircle className="w-3.5 h-3.5 text-rose-400" aria-hidden="true" />
            DISPUTED ({story.corroborationScore}%)
          </span>
        );
      default:
        return null;
    }
  };

  const getFactualityRating = () => {
    if (story.corroborationScore >= 80) {
      return { label: 'High Factuality', color: 'text-emerald-400 bg-emerald-950/60 border-emerald-800' };
    } else if (story.corroborationScore >= 45) {
      return { label: 'Mixed Factuality', color: 'text-amber-400 bg-amber-950/60 border-amber-800' };
    } else {
      return { label: 'Low / Disputed', color: 'text-rose-400 bg-rose-950/60 border-rose-800' };
    }
  };

  const factuality = getFactualityRating();

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(story);
    }
  };

  return (
    <article
      tabIndex={0}
      role="article"
      aria-label={`News claim: ${story.title}. Corroboration status: ${story.status}.`}
      aria-expanded={isSelected}
      onClick={() => onSelect(story)}
      onKeyDown={handleKeyDown}
      className={`group relative bg-[#0f1420]/95 backdrop-blur-md rounded-xl p-4 sm:p-5 border transition-all duration-200 cursor-pointer shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080b11] ${
        isSelected 
          ? 'border-cyan-400 shadow-[0_0_24px_rgba(0,240,255,0.22)] bg-[#141b2d]' 
          : 'border-slate-800/90 hover:border-slate-700 hover:bg-[#141b2d]/80 shadow-md'
      }`}
    >
      {/* Top Meta Header */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2 flex-wrap">
          {getStatusBadge()}
          {story.isLiveGdelt && (
            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/40">
              <Radio className="w-3 h-3 animate-pulse" aria-hidden="true" />
              LIVE GDELT
            </span>
          )}
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/80">
            {story.category}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
            <time dateTime={story.utcTimestamp || ''}>{story.timestamp}</time>
          </span>
          {onShare && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onShare(story);
              }}
              aria-label="Open shareable verification card"
              title="Share tactical verification card"
              className="p-1.5 rounded-lg border bg-slate-900 text-slate-400 border-slate-800 hover:text-cyan-300 hover:border-cyan-500/40 transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          )}
          {onToggleSave && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleSave(story.id);
              }}
              aria-label={isSaved ? 'Remove dossier from saved' : 'Bookmark dossier'}
              title={isSaved ? 'Saved dossier (click to remove)' : 'Save dossier'}
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                isSaved
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-amber-300 hover:border-slate-700'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-amber-400 text-amber-400' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Story Title */}
      <h3 className="text-base sm:text-lg font-bold text-slate-100 group-hover:text-cyan-300 transition-colors line-clamp-2 mb-2 leading-snug">
        {story.title}
      </h3>

      {/* Story Summary */}
      <p className="text-xs sm:text-sm text-slate-300 mb-4 line-clamp-2 leading-relaxed">
        {story.summary}
      </p>

      {/* Ground News Media Bias Breakdown & Factuality Footprint */}
      <div 
        className="mb-4 bg-[#080b11]/90 p-3 rounded-lg border border-slate-800"
        role="group"
        aria-label="Media Bias and Factuality Distribution"
      >
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2">
          <span className="flex items-center gap-1.5 font-semibold text-slate-300">
            <Scale className="w-3.5 h-3.5 text-cyan-400" aria-hidden="true" />
            Media Bias Footprint:
          </span>
          <span className={`px-1.5 py-0.2 rounded text-[10px] font-semibold border ${factuality.color}`}>
            {factuality.label}
          </span>
        </div>

        {/* 3-Part Segmented Bias Bar */}
        <div 
          className="w-full h-2 rounded-full overflow-hidden flex bg-slate-800"
          role="meter"
          aria-label="Media Bias Distribution"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={story.biasDistribution.center}
          aria-valuetext={`Left: ${story.biasDistribution.left}%, Center: ${story.biasDistribution.center}%, Right: ${story.biasDistribution.right}%`}
        >
          <div 
            style={{ width: `${story.biasDistribution.left}%` }} 
            className="bg-blue-500 hover:opacity-80 transition-opacity" 
            title={`Left-leaning media: ${story.biasDistribution.left}%`}
          />
          <div 
            style={{ width: `${story.biasDistribution.center}%` }} 
            className="bg-purple-500 hover:opacity-80 transition-opacity" 
            title={`Center / Wire media: ${story.biasDistribution.center}%`}
          />
          <div 
            style={{ width: `${story.biasDistribution.right}%` }} 
            className="bg-rose-500 hover:opacity-80 transition-opacity" 
            title={`Right-leaning media: ${story.biasDistribution.right}%`}
          />
        </div>

        {/* Legend / Metrics */}
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500" aria-hidden="true"></span>
              Left: <strong className="text-blue-400">{story.biasDistribution.left}%</strong>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-purple-500" aria-hidden="true"></span>
              Center: <strong className="text-purple-400">{story.biasDistribution.center}%</strong>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500" aria-hidden="true"></span>
              Right: <strong className="text-rose-400">{story.biasDistribution.right}%</strong>
            </span>
          </div>
        </div>

        {/* Blindspot Indicator */}
        {story.blindspots && (
          <div className="mt-2 pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 font-mono flex items-start gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <span className="text-slate-300">
              <strong className="text-amber-400">Blindspot:</strong> {story.blindspots}
            </span>
          </div>
        )}
      </div>

      {/* Parallel 3-Layer Cross-Check Quick Badges */}
      <div className="grid grid-cols-3 gap-1.5 text-[10px] font-mono text-center mb-3.5">
        <div className="bg-[#080b11] border border-slate-800/80 rounded px-2 py-1.5 flex items-center justify-center gap-1 text-slate-300">
          <span className="text-cyan-400 font-bold">1. Wire:</span>
          <span className="truncate font-semibold">{story.parallelVerification.mainstreamWire.length} Outlets</span>
        </div>
        <div className="bg-[#080b11] border border-slate-800/80 rounded px-2 py-1.5 flex items-center justify-center gap-1 text-slate-300">
          <span className="text-purple-400 font-bold">2. Social:</span>
          <span className="truncate font-semibold text-emerald-400">PII Scrubbed</span>
        </div>
        <div className="bg-[#080b11] border border-slate-800/80 rounded px-2 py-1.5 flex items-center justify-center gap-1 text-slate-300">
          <span className="text-emerald-400 font-bold">3. OSINT:</span>
          <span className="truncate font-semibold">{story.parallelVerification.osintTelemetry.length} Sensors</span>
        </div>
      </div>

      {/* Footer Info & Action */}
      <div className="flex items-center justify-between pt-2.5 border-t border-slate-800/90 text-xs font-mono text-slate-400">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-cyan-400" aria-hidden="true" />
          <span className="truncate max-w-[160px] sm:max-w-[200px] text-slate-300">{story.location.name}</span>
        </div>

        <button 
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(story);
          }}
          className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-semibold transition-colors group-hover:translate-x-0.5 transform duration-150 p-1 -m-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400 rounded"
          aria-label={`Open verification dossier for ${story.title}`}
        >
          <span>View Dossier</span>
          <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </div>
    </article>
  );
}
