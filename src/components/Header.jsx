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
    <header className="sticky top-0 z-[1200] bg-[#0a0d14]/95 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-500/40 text-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
            <Radio className="w-5 h-5 animate-pulse" />
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-black"></div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-wider text-white font-mono flex items-center gap-1.5">
                VERITAS<span className="text-cyan-400 font-extrabold">OSINT</span>
              </h1>
              <span className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                v2.4 AUTONOMOUS
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
              <span>AI News & Open-Source Intelligence Verification Engine</span>
            </p>
          </div>
        </div>

        {/* Center: Live UTC & Telemetry Heartbeat */}
        <div className="hidden lg:flex items-center gap-4 bg-slate-950/80 border border-slate-800 px-3.5 py-1.5 rounded-xl text-xs font-mono">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>UTC: <strong className="text-cyan-300 font-bold">{utcTime || 'SYNCHRONIZING...'}</strong></span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-1.5 text-slate-400">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>Feeds: <strong className="text-emerald-400">5 LIVE</strong></span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          
          {/* Pitch Deck & Live Simulator Pill */}
          <button
            onClick={onOpenPitchDeck}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/80 text-purple-300 hover:text-purple-200 border border-purple-700/60 text-xs font-mono transition-all shadow-sm cursor-pointer"
            title="Open Investor Pitch Deck & Live Simulator"
          >
            <Presentation className="w-3.5 h-3.5 text-purple-400" />
            <span className="font-semibold">Pitch Deck & Simulator</span>
          </button>

          {/* Safe Harbour Pill */}
          <button
            onClick={onOpenLegal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-cyan-300 border border-slate-700/80 text-xs font-mono transition-all shadow-sm cursor-pointer"
            title="Inspect BNS Sec 356, IT Act Sec 79 & DPDP Compliance"
          >
            <Scale className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Legal Guardrails:</span>
            <span className="text-emerald-400 font-bold">SEC 79 SAFE HARBOUR</span>
          </button>

          {/* Run Verification Button */}
          <button
            onClick={onOpenSubmitClaim}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold font-mono text-xs shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-black" />
            <span>Verify Breaking Claim</span>
          </button>

        </div>

      </div>
    </header>
  );
}
