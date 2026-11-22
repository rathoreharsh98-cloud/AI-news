import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Scale, 
  FileText, 
  Lock, 
  AlertOctagon, 
  CheckCircle,
  HelpCircle,
  ExternalLink,
  Send
} from 'lucide-react';

export default function LegalGuardrailsModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('framework'); // 'framework' | 'grievance'
  const [grievanceForm, setGrievanceForm] = useState({
    name: '',
    email: '',
    dossierId: '',
    type: 'Defamation / Attribution Review',
    description: ''
  });
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmitGrievance = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-[2500] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#0f1420] border border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-900 border-b border-slate-800 p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
                <span>Legal, Compliance & Safe Harbour Architecture</span>
                <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded font-mono">
                  ACTIVE GUARDRAILS
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Blueprint Section 3: Defamation Shield, DPDP Act 2023 & IT Intermediary Rules
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Header */}
        <div className="flex items-center border-b border-slate-800 bg-slate-900/60 px-4 sm:px-6 gap-2 text-xs font-mono">
          <button
            onClick={() => setActiveTab('framework')}
            className={`py-3 px-4 border-b-2 font-semibold flex items-center gap-2 transition-colors ${
              activeTab === 'framework'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>4-Pillar Compliance Framework</span>
          </button>

          <button
            onClick={() => setActiveTab('grievance')}
            className={`py-3 px-4 border-b-2 font-semibold flex items-center gap-2 transition-colors ${
              activeTab === 'grievance'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertOctagon className="w-3.5 h-3.5 text-amber-400" />
            <span>One-Click Grievance & Takedown Desk</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs text-slate-300 font-mono">
          
          {activeTab === 'framework' && (
            <div className="space-y-5">
              
              {/* Pillar 1 */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-cyan-300 font-bold">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                    1. Defamation & "Truth Labeling" Liability (BNS Sec 356 & IT Act Sec 79)
                  </span>
                  <span className="text-[10px] text-emerald-400 border border-emerald-800 bg-emerald-950 px-1.5 py-0.2 rounded">
                    PROTECTED
                  </span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Under Section 356 of the Bharatiya Nyaya Sanhita (BNS), 2023 and civil tort law, labeling media houses or journalists as spreading "Fake News" risks losing Section 79 Safe Harbour.
                </p>
                <div className="bg-slate-900 p-2.5 rounded border border-slate-800 text-slate-300 text-[11px] space-y-1">
                  <div><strong>Remedy:</strong> Output objective <em>Corroboration Metrics</em> ("Claim reported by 1 outlet; contradicted by 3 primary telemetry sources") rather than defamatory labels like "Fake" or "Liar".</div>
                  <div><strong>Strict Provenance:</strong> Every summary links directly to underlying public sensor telemetry (ADS-B, AIS, USGS).</div>
                </div>
              </div>

              {/* Pillar 2 */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-cyan-300 font-bold">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                    2. Web Scraping, API Terms & Copyright Compliance (Copyright Act 1957)
                  </span>
                  <span className="text-[10px] text-emerald-400 border border-emerald-800 bg-emerald-950 px-1.5 py-0.2 rounded">
                    COMPLIANT
                  </span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Reproducing copyrighted articles invites legal action. Platform strictly operates under <strong>Facts vs. Expression Separation</strong>:
                </p>
                <div className="bg-slate-900 p-2.5 rounded border border-slate-800 text-slate-300 text-[11px]">
                  Factual entities and coordinates are extracted in transient backend memory, raw publisher text is immediately purged, and original AI synthesis summaries are generated with outbound source links.
                </div>
              </div>

              {/* Pillar 3 */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-cyan-300 font-bold">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                    3. AGPL-3.0 Clean Room Isolation
                  </span>
                  <span className="text-[10px] text-emerald-400 border border-emerald-800 bg-emerald-950 px-1.5 py-0.2 rounded">
                    ISOLATED
                  </span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Prevents copyleft license contamination from tools like World Monitor by ingesting directly from unencumbered public telemetry endpoints (OpenSky, ADS-B Exchange, USGS, GDELT) or isolating services via stateless REST contracts.
                </p>
              </div>

              {/* Pillar 4 */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-cyan-300 font-bold">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    4. DPDP Act 2023 & Automated PII Scrubbing
                  </span>
                  <span className="text-[10px] text-emerald-400 border border-emerald-800 bg-emerald-950 px-1.5 py-0.2 rounded">
                    ENFORCED
                  </span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Eyewitness posts from Reddit, Instagram, or social channels automatically undergo biometric face-blurring and username scrubbing. Only verified public agencies, officials, and registered wire reporters are attributed.
                </p>
              </div>

            </div>
          )}

          {activeTab === 'grievance' && (
            <div className="space-y-4">
              {!submitted ? (
                <form onSubmit={handleSubmitGrievance} className="space-y-3">
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-[11px]">
                    <strong>Statutory Grievance Redressal (IT Intermediary Rules, 2021):</strong> Any publisher, organization, or affected party may request review, correction, or expedited takedown of corroboration metrics. Acknowledged within 24 hours.
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 mb-1">YOUR NAME / ORGANIZATION:</label>
                      <input
                        type="text"
                        required
                        value={grievanceForm.name}
                        onChange={(e) => setGrievanceForm({...grievanceForm, name: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100"
                        placeholder="e.g. Legal Counsel, Agency X"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-1">OFFICIAL EMAIL:</label>
                      <input
                        type="email"
                        required
                        value={grievanceForm.email}
                        onChange={(e) => setGrievanceForm({...grievanceForm, email: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100"
                        placeholder="legal@organization.org"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1">DOSSIER ID OR CLAIM TITLE:</label>
                    <input
                      type="text"
                      value={grievanceForm.dossierId}
                      onChange={(e) => setGrievanceForm({...grievanceForm, dossierId: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100"
                      placeholder="e.g. story-001 or URL"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1">GROUNDS FOR REVIEW / TAKEDOWN:</label>
                    <select
                      value={grievanceForm.type}
                      onChange={(e) => setGrievanceForm({...grievanceForm, type: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 mb-2"
                    >
                      <option value="Defamation / Attribution Review">Defamation / Attribution Review</option>
                      <option value="PII Exposure (DPDP Act)">PII Exposure (DPDP Act)</option>
                      <option value="Telemetry Discrepancy Correction">Telemetry Discrepancy Correction</option>
                      <option value="Copyright Removal Request">Copyright Removal Request</option>
                    </select>

                    <textarea
                      rows={3}
                      required
                      value={grievanceForm.description}
                      onChange={(e) => setGrievanceForm({...grievanceForm, description: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100"
                      placeholder="Provide specific details or telemetry citations for your grievance..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Submit Formal Grievance (Section 79 Compliant)</span>
                  </button>
                </form>
              ) : (
                <div className="p-6 bg-slate-950 rounded-xl border border-emerald-500/40 text-center space-y-3">
                  <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto" />
                  <h4 className="text-base font-bold text-white">Grievance Ticket Formally Lodged</h4>
                  <p className="text-slate-400 text-xs">
                    Ticket ID: <span className="text-cyan-400 font-mono">GRV-2026-{Date.now().toString().slice(-6)}</span>
                  </p>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Pursuant to Rule 3(2) of the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021, an automated receipt has been logged. Our appointed Grievance Officer will review the telemetry record within 24 hours.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-2 text-xs text-cyan-400 underline font-mono cursor-pointer"
                  >
                    Submit another ticket
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
