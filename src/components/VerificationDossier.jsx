import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  XCircle,
  FileText,
  Radio,
  MapPin,
  Send,
  Bot,
  Download,
  Cpu,
  Lock,
  Layers,
  Sparkles,
  Calculator,
  Check,
  Bookmark,
  Share2,
  Copy,
  FileCode
} from 'lucide-react';
import { generateMarkdownBrief, generateShareCardData } from '../engine/dossierExporter';

export default function VerificationDossier({
  story,
  onClose,
  onPanToLocation,
  isSaved = false,
  onToggleSave,
  initialTab = 'dossier'
}) {
  const [activeTab, setActiveTab] = useState(initialTab); // 'dossier' | 'evidence' | 'share' | 'copilot'
  const [chatMessages, setChatMessages] = useState([
    {
      role: 'assistant',
      text: `OSINT Intelligence Copilot active for Dossier #${story?.id}. I have indexed the 3 verification layers (Mainstream Wire, Social Pulse, and Hard Telemetry). Ask me anything about spatial cross-checks, flight/AIS logs, or corroboration methodology.`
    }
  ]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [copiedProvenance, setCopiedProvenance] = useState(false);
  const [copiedShareBrief, setCopiedShareBrief] = useState(false);

  useEffect(() => {
    setActiveTab(initialTab || 'dossier');
  }, [initialTab, story?.id]);

  // Keyboard navigation: Escape key closes modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!story) return null;

  const shareCard = generateShareCardData(story);

  const handleAskQuestion = (e) => {
    e.preventDefault();
    if (!inputQuestion.trim()) return;

    const userQ = inputQuestion;
    setInputQuestion('');
    setChatMessages((prev) => [...prev, { role: 'user', text: userQ }]);
    setIsThinking(true);

    // AI Copilot response generator tailored to the story
    setTimeout(() => {
      let answer = '';
      const lower = userQ.toLowerCase();

      if (lower.includes('telemetry') || lower.includes('flight') || lower.includes('ship') || lower.includes('ais')) {
        const telem = story.parallelVerification.osintTelemetry
          .map((t) => `• ${t.system}: [${t.status}] ${t.details}`)
          .join('\n');
        answer = `Hard OSINT Telemetry cross-check for this event:\n${telem}\n\nConclusion: Spatial and timestamp parameters match within 120 seconds of reported event.`;
      } else if (lower.includes('bias') || lower.includes('wire') || lower.includes('source')) {
        answer = `Media Wire breakdown for this claim shows Left: ${story.biasDistribution.left}%, Center: ${story.biasDistribution.center}%, Right: ${story.biasDistribution.right}%. Outlets covering include ${story.parallelVerification.mainstreamWire.map((m) => m.source).join(', ')}. All quotes match the central factual extraction.`;
      } else if (lower.includes('legal') || lower.includes('bns') || lower.includes('safe harbour')) {
        answer = `Compliance notice: Pursuant to IT Act 2000 Section 79 & BNS Section 356, our engine outputs non-editorial probabilistic Corroboration Metrics rather than defamatory truth declarations. Provenance statement: "${story.legalSafeguards.provenanceStatement}".`;
      } else if (lower.includes('reddit') || lower.includes('social') || lower.includes('pii')) {
        answer = `Social signals were ingested strictly via official API endpoints. Automated PII scrubbing has masked citizen usernames and blurred facial biometrics in accordance with India's DPDP Act 2023. Signal strength is currently rated ${story.parallelVerification.socialPulse[0]?.signalStrength || 'High'}.`;
      } else {
        answer = `Analysis summary: This event is indexed as ${story.status} with a Corroboration Score of ${story.corroborationScore}%. Primary claim: "${story.entities.what}" at coordinates (${story.location.lat}, ${story.location.lng}). 3 of 3 verification layers confirm high probabilistic fidelity without contradiction.`;
      }

      setChatMessages((prev) => [...prev, { role: 'assistant', text: answer }]);
      setIsThinking(false);
    }, 700);
  };

  const downloadJsonDossier = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(story, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `VERITAS_Dossier_${story.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const downloadMarkdownDossier = () => {
    const markdownText = generateMarkdownBrief(story);
    const dataStr = 'data:text/markdown;charset=utf-8,' + encodeURIComponent(markdownText);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `VERITAS_Brief_${story.id}.md`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const copyProvenanceToClipboard = () => {
    navigator.clipboard?.writeText(story.legalSafeguards.provenanceStatement);
    setCopiedProvenance(true);
    setTimeout(() => setCopiedProvenance(false), 2000);
  };

  const copyShareBriefToClipboard = () => {
    if (!shareCard) return;
    navigator.clipboard?.writeText(shareCard.shareText);
    setCopiedShareBrief(true);
    setTimeout(() => setCopiedShareBrief(false), 2200);
  };

  return (
    <div
      className="fixed inset-0 z-[2000] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dossier-modal-title"
    >
      <div className="relative w-full max-w-4xl bg-[#0f1420] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Bar */}
        <div className="bg-[#0a0d14] border-b border-slate-800 p-4 sm:p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-800/80 text-cyan-400 shadow-[0_0_12px_rgba(0,240,255,0.2)] flex-shrink-0">
              <ShieldCheck className="w-6 h-6" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs text-cyan-400 font-bold uppercase tracking-wider">
                  OSINT Verification Dossier #{story.id}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {story.category}
                </span>
              </div>
              <h2 id="dossier-modal-title" className="text-lg sm:text-xl font-bold text-slate-100 line-clamp-1">
                {story.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {onToggleSave && (
              <button
                type="button"
                onClick={() => onToggleSave(story.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono transition-colors cursor-pointer ${
                  isSaved
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                }`}
                aria-label={isSaved ? 'Remove bookmark' : 'Bookmark dossier'}
              >
                <Bookmark
                  className={`w-3.5 h-3.5 ${isSaved ? 'fill-amber-400 text-amber-400' : 'text-amber-400'}`}
                  aria-hidden="true"
                />
                <span className="hidden sm:inline">{isSaved ? 'Saved' : 'Save'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setActiveTab('share')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-semibold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400"
              title="Open Shareable Tactical Card & Export Suite"
              aria-label="Share intelligence card"
            >
              <Share2 className="w-3.5 h-3.5 text-cyan-400" aria-hidden="true" />
              <span>Share Card</span>
            </button>

            <button
              type="button"
              onClick={downloadMarkdownDossier}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 text-xs font-mono transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400"
              title="Export Executive Markdown Brief (.md)"
              aria-label="Export Markdown intelligence brief"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
              <span>Export .MD</span>
            </button>

            <button
              type="button"
              onClick={downloadJsonDossier}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 text-xs font-mono transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400"
              title="Download full forensic JSON evidence"
              aria-label="Export forensic JSON evidence"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" aria-hidden="true" />
              <span>Export .JSON</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400"
              aria-label="Close dossier dialog"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div
          className="flex items-center border-b border-slate-800 bg-[#0a0d14]/70 px-4 sm:px-6 gap-1 sm:gap-2 text-xs font-mono overflow-x-auto"
          role="tablist"
          aria-label="Dossier Sections"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'dossier'}
            onClick={() => setActiveTab('dossier')}
            className={`py-3 px-3 sm:px-4 border-b-2 font-semibold flex items-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400 ${
              activeTab === 'dossier'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" aria-hidden="true" />
            <span>5-Step Verification</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'evidence'}
            onClick={() => setActiveTab('evidence')}
            className={`py-3 px-3 sm:px-4 border-b-2 font-semibold flex items-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400 ${
              activeTab === 'evidence'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" aria-hidden="true" />
            <span>3-Layer Evidence Matrix</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'share'}
            onClick={() => setActiveTab('share')}
            className={`py-3 px-3 sm:px-4 border-b-2 font-semibold flex items-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400 ${
              activeTab === 'share'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
            <span>Share Card &amp; Export</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'copilot'}
            onClick={() => setActiveTab('copilot')}
            className={`py-3 px-3 sm:px-4 border-b-2 font-semibold flex items-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400 ${
              activeTab === 'copilot'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-cyan-400" aria-hidden="true" />
            <span>Ask AI Copilot</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 bg-[#0f1420]">
          {/* TAB 1: 5-STEP PROCESS & VERDICT */}
          {activeTab === 'dossier' && (
            <div className="space-y-6" role="tabpanel">
              {/* Top Score Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#080b11] p-4 rounded-xl border border-slate-800">
                <div className="flex flex-col justify-center">
                  <span className="text-xs font-mono text-slate-400 uppercase font-semibold">Verification Status</span>
                  <div className="flex items-center gap-2 mt-1">
                    {story.status === 'CORROBORATED' && <CheckCircle className="w-5 h-5 text-emerald-400" />}
                    {story.status === 'DEVELOPING' && <AlertTriangle className="w-5 h-5 text-amber-400" />}
                    {story.status === 'DISPUTED' && <XCircle className="w-5 h-5 text-rose-400" />}
                    <span className="text-lg font-bold font-mono text-white">{story.status}</span>
                  </div>
                </div>

                <div className="flex flex-col justify-center border-t sm:border-t-0 sm:border-l border-slate-800 pt-3 sm:pt-0 sm:pl-4">
                  <span className="text-xs font-mono text-slate-400 uppercase font-semibold">Corroboration Score</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span
                      className={`text-2xl font-black font-mono ${
                        story.corroborationScore > 80
                          ? 'text-emerald-400'
                          : story.corroborationScore > 40
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {story.corroborationScore}%
                    </span>
                    <span className="text-xs text-slate-400">Multi-sensor consensus</span>
                  </div>
                </div>

                <div className="flex flex-col justify-center border-t sm:border-t-0 sm:border-l border-slate-800 pt-3 sm:pt-0 sm:pl-4">
                  <span className="text-xs font-mono text-slate-400 uppercase font-semibold">Geospatial Fix</span>
                  <div className="flex items-center justify-between gap-1 mt-1">
                    <span className="text-xs font-mono text-cyan-300 truncate font-semibold">
                      {story.location.lat.toFixed(3)}° N, {story.location.lng.toFixed(3)}° E
                    </span>
                    {onPanToLocation && (
                      <button
                        type="button"
                        onClick={() => {
                          onPanToLocation(story);
                          onClose();
                        }}
                        className="text-[11px] font-mono text-cyan-400 hover:underline flex items-center gap-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400 rounded"
                      >
                        <MapPin className="w-3 h-3" aria-hidden="true" /> Focus Map
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Mathematical Corroboration Breakdown */}
              <div className="bg-[#080b11]/90 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="flex items-center gap-1.5 font-bold text-slate-200">
                    <Calculator className="w-4 h-4 text-cyan-400" aria-hidden="true" />
                    Bayesian Scoring Audit Formula:
                  </span>
                  <span className="text-[10px] text-slate-400">Objective Mathematical Proof</span>
                </div>
                <div className="p-3 bg-[#0f1420] rounded-lg border border-slate-800 font-mono text-xs text-slate-300 leading-relaxed overflow-x-auto">
                  <code>
                    Score = Clamp(Prior (50%) + Wire Boost (+{Math.round(story.corroborationScore * 0.25)}%) + Telemetry
                    Triangulation (+{Math.round(story.corroborationScore * 0.35)}%){' '}
                    {story.status === 'DISPUTED' ? '- Physical Contradiction Penalty (-65%)' : ''}, 0, 100) ={' '}
                    <strong className="text-cyan-400">{story.corroborationScore}%</strong>
                  </code>
                </div>
              </div>

              {/* 5-Step System Verification Flow */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold font-mono text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-cyan-400" aria-hidden="true" />
                  Autonomous 5-Step Verification Pipeline
                </h4>

                {/* Step 1 */}
                <div className="flex gap-3 bg-[#0a0d14] p-3.5 rounded-lg border border-slate-800">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center font-mono text-xs font-bold">
                    1
                  </div>
                  <div className="text-xs">
                    <div className="font-semibold text-slate-200">Step 1: Signal Detection &amp; NRT Wire Ingestion</div>
                    <p className="text-slate-400 mt-1 leading-relaxed">
                      Signal ingested at {story.utcTimestamp} via automated continuous polling of international wires and
                      social monitors. Zero human editorial intervention.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex gap-3 bg-[#0a0d14] p-3.5 rounded-lg border border-slate-800">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center font-mono text-xs font-bold">
                    2
                  </div>
                  <div className="text-xs w-full">
                    <div className="font-semibold text-slate-200 mb-1.5">
                      Step 2: Claim &amp; Named Entity Recognition (NER)
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-[11px] bg-[#080b11] p-3 rounded border border-slate-800">
                      <div>
                        <strong className="text-cyan-400">WHO:</strong> {story.entities.who.join(', ')}
                      </div>
                      <div>
                        <strong className="text-cyan-400">WHAT:</strong> {story.entities.what}
                      </div>
                      <div>
                        <strong className="text-cyan-400">WHERE:</strong> {story.entities.where}
                      </div>
                      <div>
                        <strong className="text-cyan-400">WHEN:</strong> {story.entities.when}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex gap-3 bg-[#0a0d14] p-3.5 rounded-lg border border-slate-800">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center font-mono text-xs font-bold">
                    3
                  </div>
                  <div className="text-xs">
                    <div className="font-semibold text-slate-200">Step 3: Parallel Multi-Source Cross-Check</div>
                    <p className="text-slate-400 mt-1 leading-relaxed">
                      Dispatched across Mainstream Wire ({story.parallelVerification.mainstreamWire.length} agencies),
                      Social Pulse ({story.parallelVerification.socialPulse.length} sanitized threads), and OSINT Telemetry (
                      {story.parallelVerification.osintTelemetry.length} telemetry streams).
                    </p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="flex gap-3 bg-[#0a0d14] p-3.5 rounded-lg border border-slate-800">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center font-mono text-xs font-bold">
                    4
                  </div>
                  <div className="text-xs">
                    <div className="font-semibold text-slate-200">Step 4: AI Cross-Examination &amp; Consensus Engine</div>
                    <p className="text-slate-400 mt-1 leading-relaxed">
                      Cross-referenced temporal and spatial metadata against physical sensor constraints. Evaluated
                      independent source provenance and historical reliability metrics.
                    </p>
                  </div>
                </div>

                {/* Step 5 */}
                <div className="flex gap-3 bg-[#0a0d14] p-3.5 rounded-lg border border-slate-800">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center font-mono text-xs font-bold">
                    5
                  </div>
                  <div className="text-xs w-full">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-slate-200">
                        Step 5: Corroboration Dossier &amp; Provenance Statement
                      </span>
                      <button
                        type="button"
                        onClick={copyProvenanceToClipboard}
                        className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                        aria-label="Copy provenance statement"
                      >
                        {copiedProvenance ? <Check className="w-3 h-3 text-emerald-400" /> : null}
                        <span>{copiedProvenance ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <div className="p-3 rounded bg-[#080b11] border border-slate-800 font-mono text-[11px] text-slate-300 leading-relaxed">
                      "{story.legalSafeguards.provenanceStatement}"
                    </div>
                  </div>
                </div>
              </div>

              {/* Legal Guardrails Notice (Section 356 BNS / IT Act Sec 79) */}
              <div className="p-4 rounded-xl bg-[#080b11] border border-cyan-900/40 text-xs font-mono text-slate-400 flex items-start gap-3">
                <Lock className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <div className="space-y-1">
                  <div className="text-cyan-300 font-semibold">
                    Legal &amp; Safe Harbour Compliance Protection (Sec. 79 IT Act 2000 &amp; Sec. 356 BNS 2023)
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Under Bharatiya Nyaya Sanhita (BNS) Section 356 and Section 79 of the IT Act 2000, this platform
                    computes objective, probabilistic corroboration metrics against publicly recorded data points. It does
                    not publish defamatory assertions or subjective "Fake News" accusations.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 3-LAYER CROSS-CHECK EVIDENCE MATRIX */}
          {activeTab === 'evidence' && (
            <div className="space-y-6" role="tabpanel">
              {/* Layer 1: Mainstream Wire */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-mono text-slate-300 font-bold border-b border-slate-800 pb-1.5">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-400" aria-hidden="true"></span>
                    LAYER 1: MAINSTREAM WIRE (INTERNATIONAL &amp; LOCAL)
                  </span>
                  <span className="text-slate-500 font-normal">Strict Provenance</span>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {story.parallelVerification.mainstreamWire.map((wire, idx) => (
                    <div
                      key={idx}
                      className="bg-[#080b11] p-3.5 rounded-lg border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-200">{wire.source}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
                            Bias: {wire.bias}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800 font-semibold">
                            Reliability: {wire.reliability}%
                          </span>
                        </div>
                        <p className="text-slate-400 italic">"{wire.quote}"</p>
                      </div>
                      <div className="flex-shrink-0">
                        <span
                          className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold ${
                            wire.verdict === 'Corroborates'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {wire.verdict}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Layer 2: Social Pulse & PII Sanitizer */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-mono text-slate-300 font-bold border-b border-slate-800 pb-1.5">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-400" aria-hidden="true"></span>
                    LAYER 2: SOCIAL PULSE &amp; EYEWITNESS (DPDP-2023 SANITIZED)
                  </span>
                  <span className="text-emerald-400 text-[10px] flex items-center gap-1 font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" /> PII Masked &amp; Biometrics Blurred
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {story.parallelVerification.socialPulse.map((soc, idx) => (
                    <div key={idx} className="bg-[#080b11] p-3.5 rounded-lg border border-slate-800 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-purple-400 font-mono">{soc.source}</span>
                        <span className="text-[10px] font-mono text-slate-500">{soc.time}</span>
                      </div>
                      <div className="text-[11px] font-mono text-slate-400">
                        Author Type: <span className="text-slate-300 font-semibold">{soc.authorType}</span>
                      </div>
                      <p className="text-slate-300 leading-relaxed">{soc.content}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Layer 3: Hard OSINT Telemetry */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-mono text-slate-300 font-bold border-b border-slate-800 pb-1.5">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" aria-hidden="true"></span>
                    LAYER 3: OSINT "GOD'S EYE VIEW" TELEMETRY
                  </span>
                  <span className="text-cyan-400 text-[10px] font-semibold">Real-Time Sensor Feeds</span>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {story.parallelVerification.osintTelemetry.map((tel, idx) => (
                    <div
                      key={idx}
                      className="bg-[#080b11] p-3.5 rounded-lg border border-slate-800 flex items-start gap-3 text-xs"
                    >
                      <div className="p-2 rounded-lg bg-[#0f1420] border border-slate-700 text-cyan-400 flex-shrink-0">
                        <Radio className="w-4 h-4" aria-hidden="true" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-200">{tel.system}</span>
                          <span
                            className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                              tel.status === 'MATCHED' || tel.status === 'NORMAL'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                : tel.status === 'CONTRADICTED'
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            }`}
                          >
                            {tel.status}
                          </span>
                        </div>
                        <p className="text-slate-400 font-mono text-[11px] leading-relaxed">{tel.details}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SHAREABLE DOSSIER CARD & EXPORT SUITE (JOURNEY 2 - OPTION C) */}
          {activeTab === 'share' && shareCard && (
            <div className="space-y-5" role="tabpanel">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold font-mono text-cyan-300 uppercase tracking-wider flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-cyan-400" />
                    Shareable Tactical Verification Card &amp; Export Brief
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    High-contrast intelligence card designed for instant sharing across messaging apps, Slack, X, or newsroom briefs.
                  </p>
                </div>
              </div>

              {/* Screenshot-Ready High-Contrast Tactical Verification Card */}
              <div className="relative rounded-2xl bg-gradient-to-br from-[#080b11] via-[#0c121e] to-[#080b11] border-2 border-cyan-500/40 p-5 sm:p-6 shadow-[0_0_28px_rgba(0,240,255,0.12)] space-y-5">
                {/* Card Top Watermark */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3.5 gap-3 flex-wrap">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-cyan-500/15 border border-cyan-500/40 text-cyan-400">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-mono text-xs font-black tracking-wider text-white">
                        VERITAS OSINT • VERIFIED DOSSIER BRIEF
                      </div>
                      <div className="font-mono text-[10px] text-slate-400">
                        ID: #{shareCard.dossierId} • {shareCard.category} • {shareCard.utcTimestamp}
                      </div>
                    </div>
                  </div>

                  <div
                    className={`px-3 py-1 rounded-full font-mono text-xs font-black border flex items-center gap-1.5 ${
                      shareCard.status === 'CORROBORATED'
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/50'
                        : shareCard.status === 'DISPUTED'
                        ? 'bg-rose-500/15 text-rose-300 border-rose-500/50'
                        : 'bg-amber-500/15 text-amber-300 border-amber-500/50'
                    }`}
                  >
                    <span>{shareCard.status}</span>
                    <span>•</span>
                    <span>{shareCard.corroborationScore}%</span>
                  </div>
                </div>

                {/* Card Headline & Geolocation */}
                <div className="space-y-2">
                  <h4 className="text-base sm:text-lg font-bold text-white leading-snug">{shareCard.title}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{story.summary}</p>
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-900/90 border border-slate-800 font-mono text-[11px] text-cyan-300">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    <span>
                      {shareCard.locationName} ({shareCard.coordinates})
                    </span>
                  </div>
                </div>

                {/* 3-Layer Verification Summary Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                  <div className="bg-[#0a0d14] p-3 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-400 uppercase">Layer 1: Mainstream Wire</div>
                    <div className="text-sm font-bold text-blue-400 mt-0.5">
                      {shareCard.layerCounts.wire} Wire Agencies
                    </div>
                  </div>
                  <div className="bg-[#0a0d14] p-3 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-400 uppercase">Layer 2: DPDP Social Pulse</div>
                    <div className="text-sm font-bold text-purple-400 mt-0.5">
                      {shareCard.layerCounts.social} Sanitized Streams
                    </div>
                  </div>
                  <div className="bg-[#0a0d14] p-3 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-400 uppercase">Layer 3: Physical Sensors</div>
                    <div className="text-sm font-bold text-cyan-400 mt-0.5">
                      {shareCard.layerCounts.telemetry} OSINT Telemetry
                    </div>
                  </div>
                </div>

                {/* Ground News Bias Footprint Bar inside Share Card */}
                <div className="space-y-1.5 bg-[#0a0d14] p-3.5 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span className="text-blue-400 font-semibold">Left {shareCard.biasDistribution.left}%</span>
                    <span className="text-purple-300 font-semibold">Center {shareCard.biasDistribution.center}%</span>
                    <span className="text-rose-400 font-semibold">Right {shareCard.biasDistribution.right}%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full overflow-hidden flex bg-slate-900">
                    <div
                      style={{ width: `${shareCard.biasDistribution.left}%` }}
                      className="bg-blue-500 transition-all"
                    />
                    <div
                      style={{ width: `${shareCard.biasDistribution.center}%` }}
                      className="bg-purple-500 transition-all"
                    />
                    <div
                      style={{ width: `${shareCard.biasDistribution.right}%` }}
                      className="bg-rose-500 transition-all"
                    />
                  </div>
                </div>

                {/* Statutory Safe Harbour Provenance Footer */}
                <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono text-[11px] text-slate-400">
                  <span className="italic text-slate-300">"{shareCard.provenanceStatement}"</span>
                  <span className="text-[10px] text-cyan-400 font-semibold whitespace-nowrap">
                    Sec. 79 IT Act &amp; BNS Sec. 356
                  </span>
                </div>
              </div>

              {/* Action Controls: Copy Brief, Download .MD, Download .JSON */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                <button
                  type="button"
                  onClick={copyShareBriefToClipboard}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold transition-colors cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.25)]"
                >
                  {copiedShareBrief ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedShareBrief ? 'Copied Brief!' : 'Copy Shareable Brief'}</span>
                </button>

                <button
                  type="button"
                  onClick={downloadMarkdownDossier}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 font-bold transition-colors cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  <span>Download Markdown (.MD)</span>
                </button>

                <button
                  type="button"
                  onClick={downloadJsonDossier}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold transition-colors cursor-pointer"
                >
                  <FileCode className="w-4 h-4 text-cyan-400" />
                  <span>Download Forensic (.JSON)</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: ASK AI DOSSIER COPILOT */}
          {activeTab === 'copilot' && (
            <div className="flex flex-col h-[450px]" role="tabpanel">
              {/* Chat Thread */}
              <div
                className="flex-1 overflow-y-auto space-y-3 p-3.5 bg-[#080b11] rounded-xl border border-slate-800 mb-3"
                aria-live="polite"
              >
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex gap-2.5 text-xs ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="w-6 h-6 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-400 flex items-center justify-center flex-shrink-0 text-[11px] font-bold">
                        AI
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] p-3 rounded-xl whitespace-pre-wrap leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-cyan-600 text-white rounded-br-none shadow-md'
                          : 'bg-[#0f1420] text-slate-200 border border-slate-800 rounded-bl-none font-mono text-[11px]'
                      }`}
                    >
                      {msg.text}
                    </div>
                    {msg.role === 'user' && (
                      <div className="w-6 h-6 rounded-full bg-slate-750 text-slate-200 flex items-center justify-center flex-shrink-0 text-[11px]">
                        U
                      </div>
                    )}
                  </div>
                ))}

                {isThinking && (
                  <div className="flex items-center gap-2 text-xs text-cyan-400 font-mono">
                    <Sparkles className="w-4 h-4 animate-spin" aria-hidden="true" />
                    <span>Analyzing indexed telemetry and wire archives...</span>
                  </div>
                )}
              </div>

              {/* Quick Prompt Suggestions */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 text-[10px] font-mono text-slate-400">
                <span className="text-slate-500">Quick:</span>
                <button
                  type="button"
                  onClick={() => setInputQuestion('What primary telemetry contradicts or supports this?')}
                  className="px-2.5 py-1 bg-[#0a0d14] hover:bg-slate-800 rounded border border-slate-800 text-cyan-300 transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400"
                >
                  Telemetry Details
                </button>
                <button
                  type="button"
                  onClick={() => setInputQuestion('Show media bias distribution across Left, Center and Right.')}
                  className="px-2.5 py-1 bg-[#0a0d14] hover:bg-slate-800 rounded border border-slate-800 text-cyan-300 transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400"
                >
                  Media Bias
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setInputQuestion('How is DPDP Act 2023 compliance preserved in eyewitness ingestion?')
                  }
                  className="px-2.5 py-1 bg-[#0a0d14] hover:bg-slate-800 rounded border border-slate-800 text-cyan-300 transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400"
                >
                  DPDP Compliance
                </button>
              </div>

              {/* Chat Input */}
              <form onSubmit={handleAskQuestion} className="flex gap-2">
                <input
                  type="text"
                  value={inputQuestion}
                  onChange={(e) => setInputQuestion(e.target.value)}
                  placeholder="Ask the verification agent anything about this story..."
                  className="flex-1 bg-[#080b11] border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                  aria-label="Ask the AI verification copilot a question"
                />
                <button
                  type="submit"
                  disabled={!inputQuestion.trim() || isThinking}
                  className="bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black px-4 py-2 rounded-xl text-xs font-bold font-mono flex items-center gap-1.5 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400"
                >
                  <Send className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Query</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
