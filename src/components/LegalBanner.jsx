import React from 'react';
import { ShieldCheck, Scale, ArrowRight, Lock } from 'lucide-react';

export default function LegalBanner({ onOpenLegal }) {
  return (
    <div className="bg-[#0b0f17] border-b border-slate-800/80 px-4 py-1.5">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] font-mono text-slate-400">
        
        <div className="flex items-center gap-2 text-center sm:text-left">
          <Lock className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
          <p className="truncate sm:whitespace-normal">
            <strong className="text-slate-200 font-semibold">STATUTORY DISCLOSURE:</strong>{' '}
            IT Act 2000 Sec 79 &amp; BNS 2023 Sec 356 objective telemetry verification. DPDP Act 2023 PII scrubbing active.
          </p>
        </div>

        <button
          onClick={onOpenLegal}
          className="flex-shrink-0 flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-semibold transition-colors cursor-pointer"
        >
          <span>Compliance &amp; Grievance Desk</span>
          <ArrowRight className="w-3 h-3" />
        </button>

      </div>
    </div>
  );
}
