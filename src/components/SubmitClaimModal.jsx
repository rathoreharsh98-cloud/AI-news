import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  CheckCircle, 
  Clock, 
  Search, 
  Radio, 
  ShieldCheck, 
  Cpu, 
  Layers, 
  ArrowRight,
  Plane,
  Ship,
  Activity,
  Flame,
  Globe
} from 'lucide-react';
import { executeVerificationPipeline } from '../engine/index.js';

export default function SubmitClaimModal({ isOpen, onClose, onClaimVerified }) {
  const [claimText, setClaimText] = useState('');
  const [regionInput, setRegionInput] = useState('Persian Gulf');
  const [categoryInput, setCategoryInput] = useState('Defense & Maritime');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const sampleClaims = [
    { text: 'Unannounced VIP transport aircraft squawking 7700 near Geneva airspace', region: 'Geneva, Switzerland', cat: 'Aviation & Conflict' },
    { text: 'Commercial container vessel reported sudden GPS spoofing attack near Strait of Hormuz', region: 'Strait of Hormuz', cat: 'Maritime & Defense' },
    { text: 'Unconfirmed reports of M5.8 tremor felt in northern Chile coastal district', region: 'Antofagasta, Chile', cat: 'Natural Disasters' }
  ];

  const handleRunVerification = async (e) => {
    e.preventDefault();
    if (!claimText.trim()) return;

    setIsProcessing(true);
    setCurrentStep(1);

    // Progression of Step 1 -> Step 5 Autonomous Verification Agent Execution
    setTimeout(() => {
      setCurrentStep(2); // Step 2: NER Entity Extraction
    }, 400);

    setTimeout(() => {
      setCurrentStep(3); // Step 3: Dispatching 3 Layers
    }, 900);

    setTimeout(() => {
      setCurrentStep(4); // Step 4: LLM Cross-examination & Sensor Audit
    }, 1500);

    try {
      // Execute genuine 5-step autonomous verification pipeline
      const verifiedStory = await executeVerificationPipeline(claimText, regionInput);

      setTimeout(() => {
        setCurrentStep(5); // Step 5: Dossier generated

        setTimeout(() => {
          setIsProcessing(false);
          setCurrentStep(0);
          onClaimVerified(verifiedStory);
          onClose();
        }, 600);
      }, 2000);
    } catch (err) {
      console.error('Verification pipeline error:', err);
      setIsProcessing(false);
      setCurrentStep(0);
    }
  };

  const handleSelectSample = (sample) => {
    setClaimText(sample.text);
    setRegionInput(sample.region);
    setCategoryInput(sample.cat);
  };

  return (
    <div className="fixed inset-0 z-[2500] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#0f1420] border border-cyan-500/40 rounded-2xl shadow-[0_0_50px_rgba(0,240,255,0.15)] overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-900 border-b border-slate-800 p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400">
              <Cpu className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
                <span>Autonomous OSINT Verification Agent</span>
                <span className="text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-800 px-2 py-0.5 rounded font-mono">
                  AGENTIC RAG
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Cross-examine any breaking claim across Mainstream Wire, Social Pulse & OSINT Telemetry
              </p>
            </div>
          </div>
          {!isProcessing && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Body Form or Progress */}
        <div className="p-5 sm:p-6 space-y-5">
          
          {!isProcessing ? (
            <form onSubmit={handleRunVerification} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-300 font-bold mb-1.5">
                  BREAKING CLAIM / HEADLINE / URL:
                </label>
                <textarea
                  rows={3}
                  value={claimText}
                  onChange={(e) => setClaimText(e.target.value)}
                  placeholder="e.g. Tanker reports missile splash 40nm south of Yemen, or Cargo jet emergency diversion..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-slate-300 font-bold mb-1">
                    TARGET GEOGRAPHY / SECTOR:
                  </label>
                  <input
                    type="text"
                    value={regionInput}
                    onChange={(e) => setRegionInput(e.target.value)}
                    placeholder="e.g. Red Sea, Taiwan Strait, Baltic..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-300 font-bold mb-1">
                    CATEGORY CLASSIFICATION:
                  </label>
                  <select
                    value={categoryInput}
                    onChange={(e) => setCategoryInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-400 font-mono"
                  >
                    <option value="Maritime & Defense">Maritime & Defense</option>
                    <option value="Aviation & Conflict">Aviation & Conflict</option>
                    <option value="Natural Disasters">Natural Disasters</option>
                    <option value="Energy & Infrastructure">Energy & Infrastructure</option>
                    <option value="Cyber & Tech Intelligence">Cyber & Tech Intelligence</option>
                  </select>
                </div>
              </div>

              {/* Sample Claims */}
              <div className="pt-2">
                <span className="text-[11px] font-mono text-slate-400 block mb-1.5">
                  Or load simulated intelligence sample:
                </span>
                <div className="flex flex-col gap-1.5">
                  {sampleClaims.map((sample, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectSample(sample)}
                      className="text-left text-[11px] font-mono p-2 rounded-lg bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-300 transition-colors flex items-center justify-between gap-2"
                    >
                      <span className="truncate">"{sample.text}"</span>
                      <span className="text-[10px] text-cyan-400 flex-shrink-0">Load ↵</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Legal Notice Reminder */}
              <div className="p-3 rounded-lg bg-cyan-950/30 border border-cyan-800/40 text-[11px] font-mono text-slate-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <span>
                  Automatic DPDP PII sanitization will run on eyewitness reports. Corroboration is scored non-editorially.
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!claimText.trim()}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold font-mono text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-black" />
                <span>Execute 5-Step Verification Engine</span>
                <ArrowRight className="w-4 h-4 text-black" />
              </button>
            </form>
          ) : (
            /* Live Step Progress Display */
            <div className="py-6 space-y-5">
              <div className="text-center space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-400 text-xs font-mono font-bold animate-pulse">
                  <Radio className="w-3.5 h-3.5" />
                  <span>AUTONOMOUS AGENT ACTIVE</span>
                </div>
                <h4 className="text-base font-bold text-white">
                  Cross-Checking: "{claimText.slice(0, 50)}..."
                </h4>
              </div>

              {/* Progress Steps */}
              <div className="space-y-3 font-mono text-xs">
                
                <div className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
                  currentStep >= 1 ? 'bg-slate-900 border-cyan-500/50 text-cyan-300' : 'bg-slate-950 border-slate-800 text-slate-500'
                }`}>
                  <div className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-xs bg-cyan-950 border border-cyan-800">
                    1
                  </div>
                  <div className="flex-1">
                    <div className="font-bold">Step 1: Ingesting Claim & Time Window</div>
                    <div className="text-[10px] text-slate-400">Timestamp logged; regional telemetry filters armed for {regionInput}.</div>
                  </div>
                  {currentStep > 1 && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                </div>

                <div className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
                  currentStep >= 2 ? 'bg-slate-900 border-cyan-500/50 text-cyan-300' : 'bg-slate-950 border-slate-800 text-slate-500'
                }`}>
                  <div className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-xs bg-cyan-950 border border-cyan-800">
                    2
                  </div>
                  <div className="flex-1">
                    <div className="font-bold">Step 2: NER Entity Extraction (Who, What, Where, When)</div>
                    <div className="text-[10px] text-slate-400">Extracted geographic bounding box & key operational actors.</div>
                  </div>
                  {currentStep > 2 && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                </div>

                <div className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
                  currentStep >= 3 ? 'bg-slate-900 border-cyan-500/50 text-cyan-300' : 'bg-slate-950 border-slate-800 text-slate-500'
                }`}>
                  <div className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-xs bg-cyan-950 border border-cyan-800">
                    3
                  </div>
                  <div className="flex-1">
                    <div className="font-bold">Step 3: Parallel 3-Layer Cross-Check In Flight</div>
                    <div className="text-[10px] text-slate-400">Querying Mainstream Wire, DPDP-Sanitized Social Pulse & OpenSky/AIS.</div>
                  </div>
                  {currentStep > 3 && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                </div>

                <div className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
                  currentStep >= 4 ? 'bg-slate-900 border-cyan-500/50 text-cyan-300' : 'bg-slate-950 border-slate-800 text-slate-500'
                }`}>
                  <div className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-xs bg-cyan-950 border border-cyan-800">
                    4
                  </div>
                  <div className="flex-1">
                    <div className="font-bold">Step 4: AI Cross-Examination & Anomaly Audit</div>
                    <div className="text-[10px] text-slate-400">Evaluating geospatial coherence against radar transponder feeds.</div>
                  </div>
                  {currentStep > 4 && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                </div>

                <div className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
                  currentStep >= 5 ? 'bg-slate-900 border-emerald-500/50 text-emerald-300' : 'bg-slate-950 border-slate-800 text-slate-500'
                }`}>
                  <div className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-xs bg-emerald-950 border border-emerald-800">
                    5
                  </div>
                  <div className="flex-1">
                    <div className="font-bold">Step 5: Synthesizing Final Corroboration Dossier</div>
                    <div className="text-[10px] text-slate-400">Generating objective provenance statement & plotting on God's Eye Map.</div>
                  </div>
                  {currentStep === 5 && <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" />}
                </div>

              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
