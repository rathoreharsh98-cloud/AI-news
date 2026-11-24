import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Radio, 
  Cpu, 
  PlusCircle, 
  Scale, 
  Activity, 
  Globe, 
  Lock,
  ChevronDown,
  Layers,
  Sparkles,
  Presentation
} from 'lucide-react';

export default function Header({ onOpenSubmitClaim, onOpenLegal, onOpenPitchDeck, storiesCount }) {
  const [utcTime, setUtcTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTime(now.toUTCString().replace('GMT', 'UTC'));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-[1200] bg-[#080b11]/95 backdrop-blur-md border-b border-slate-800/90 px-4 sm:px-6 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-md bg-[#0d121c] border border-cyan-500/40 text-cyan-400">
            <Radio className="w-4 h-4" />
            <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 border border-[#080b11]"></div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold tracking-wider text-white font-mono flex items-center gap-1.5">
                VERITAS<span className="text-cyan-400">OSINT</span>
              </h1>
              <span className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                v2.4 AUTONOMOUS
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              AI News &amp; Open-Source Intelligence Verification Engine
            </p>
          </div>
        </div>

        {/* Center: Live UTC & Telemetry Heartbeat */}
        <div className="hidden lg:flex items-center gap-3.5 bg-[#0d121c] border border-slate-800 px-3 py-1.5 rounded-md text-xs font-mono">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>UTC <strong className="text-slate-100 font-semibold">{utcTime || 'SYNCHRONIZING...'}</strong></span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-1.5 text-slate-400">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>Feeds <strong className="text-emerald-400">5 LIVE</strong></span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          
          {/* Pitch Deck & Live Simulator Pill */}
          <button
            onClick={onOpenPitchDeck}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#0d121c] hover:bg-[#131a29] text-slate-200 border border-slate-700/80 hover:border-slate-600 text-xs font-mono transition-colors cursor-pointer"
            title="Open Investor Pitch Deck & Live Simulator"
          >
            <Presentation className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-medium">Pitch Deck</span>
          </button>

          {/* Safe Harbour Pill */}
          <button
            onClick={onOpenLegal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#0d121c] hover:bg-[#131a29] text-slate-300 hover:text-cyan-300 border border-slate-700/80 hover:border-slate-600 text-xs font-mono transition-colors cursor-pointer"
            title="Inspect BNS Sec 356, IT Act Sec 79 & DPDP Compliance"
          >
            <Scale className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Guardrails:</span>
            <span className="text-emerald-400 font-semibold">SEC 79</span>
          </button>

          {/* Run Verification Button */}
          <button
            onClick={onOpenSubmitClaim}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-cyan-400 hover:bg-cyan-300 active:translate-y-px text-[#080b11] font-bold font-mono text-xs transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Verify Breaking Claim</span>
          </button>

        </div>

      </div>
    </header>
  );
}
