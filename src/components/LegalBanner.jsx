import React from 'react';
import { ShieldCheck, Scale, ArrowRight, Lock } from 'lucide-react';

export default function LegalBanner({ onOpenLegal }) {
  return (
    <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-y border-slate-800/80 px-4 py-2">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono text-slate-400">
        
        <div className="flex items-center gap-2 text-center sm:text-left">
          <div className="p-1 rounded bg-cyan-950/60 border border-cyan-800/60 text-cyan-400 flex-shrink-0">
            <Lock className="w-3.5 h-3.5" />
          </div>
          <div>
            <strong className="text-cyan-300 font-bold">STATUTORY DISCLOSURE:</strong> Under IT Act 2000 Section 79 & BNS 2023 Section 356, our engine computes objective corroboration metrics against publicly recorded telemetry. PII scrubbing is active under DPDP Act 2023.
          </div>
        </div>

        <button
          onClick={onOpenLegal}
          className="flex-shrink-0 flex items-center gap-1 text-cyan-400 hover:text-cyan-300 underline font-semibold transition-colors cursor-pointer"
        >
          <span>Compliance Framework & Grievance Desk</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

      </div>
    </div>
  );
}
