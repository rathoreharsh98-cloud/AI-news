import React, { useState, useEffect } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  RotateCcw, 
  ShieldCheck, 
  TrendingUp, 
  DollarSign, 
  Cpu, 
  Layers, 
  Activity, 
  Plane, 
  Ship, 
  Flame, 
  Radio, 
  Globe, 
  Award, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  ExternalLink,
  Presentation,
  Users,
  Target,
  Sparkles
} from 'lucide-react';

export default function PitchDeckModal({ isOpen, onClose }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Live Simulator State for Slide 4
  const [simScenario, setSimScenario] = useState('redsea'); // 'redsea' | 'blacksea' | 'taiwan' | 'wildfire'
  const [simStep, setSimStep] = useState(0);
  const [isSimRunning, setIsSimRunning] = useState(false);

  if (!isOpen) return null;

  const totalSlides = 8;

  const handleNextSlide = () => {
    setCurrentSlide(prev => (prev < totalSlides - 1 ? prev + 1 : prev));
  };

  const handlePrevSlide = () => {
    setCurrentSlide(prev => (prev > 0 ? prev - 1 : prev));
  };

  // Live Simulator Scenarios
  const scenarios = {
    redsea: {
      title: 'Naval Drone Encounter: Crude Tanker "Stellar Tide"',
      region: 'Bab-el-Mandeb Strait / Red Sea',
      claim: 'Commercial crude tanker reports drone circling at 2,000 ft and conducts emergency 90° evasive turn.',
      steps: [
        { title: 'Step 1: Signal Ingestion', detail: 'UKMTO maritime advisory & Reuters bulletin ingested at 21:15 UTC.', layer: 'Wire', status: 'ALERT' },
        { title: 'Step 2: NER Extraction', detail: 'Actors: Stellar Tide IMO 9482110; Location: 12.587°N, 43.342°E; Urgency: CRITICAL.', layer: 'NER', status: 'PARSED' },
        { title: 'Step 3: Multi-Layer Telemetry', detail: 'MarineTraffic AIS verifies speed drop (14.8 -> 3.2 kts); OpenSky tracks USN P-8A Poseidon at FL240.', layer: 'Telemetry', status: 'MATCHED' },
        { title: 'Step 4: AI Cross-Examination', detail: 'Spatial and timestamp parameters align within 120s without contradiction.', layer: 'Consensus', status: 'CORROBORATED' },
        { title: 'Step 5: Dossier Verdict', detail: 'Corroboration Score: 94% [CORROBORATED]. Safe Harbour provenance statement formulated.', layer: 'Verdict', status: 'FINAL' }
      ],
      finalScore: 94,
      finalStatus: 'CORROBORATED',
      sensorLogs: ['AIS MMSI 636019283: Yaw rate -42°/min', 'ADS-B Hex AE6812: P-8A loiter 24,000 ft', 'UKMTO Advisory 042/2026 verified']
    },
    blacksea: {
      title: 'Viral Airspace Hoax: "Total Black Sea Airspace Shutdown"',
      region: 'Western Black Sea / Constanța FIR',
      claim: 'Viral Telegram/X rumor claims Eurocontrol issued emergency ban on all civilian aviation.',
      steps: [
        { title: 'Step 1: Signal Ingestion', detail: 'Viral social media spike (45,000 posts in 15 mins) alleging empty skies.', layer: 'Social', status: 'VIRAL_SPIKE' },
        { title: 'Step 2: NER Extraction', detail: 'Claim: Total civilian aviation ban; Location: Western Black Sea FIR.', layer: 'NER', status: 'PARSED' },
        { title: 'Step 3: Multi-Layer Telemetry', detail: 'ADS-B radar detects 14 commercial airliners (Tarom, Turkish, Wizz) actively cruising at FL370.', layer: 'Telemetry', status: 'CONTRADICTION' },
        { title: 'Step 4: AI Cross-Examination', detail: 'Physical transponder logs directly refute closure claim. Contradiction penalty (-65 pts) applied.', layer: 'Consensus', status: 'PENALIZED' },
        { title: 'Step 5: Dossier Verdict', detail: 'Corroboration Score: 18% [DISPUTED]. Objective provenance statement prevents defamation suit.', layer: 'Verdict', status: 'DEBUNKED' }
      ],
      finalScore: 18,
      finalStatus: 'DISPUTED',
      sensorLogs: ['ADS-B Exchange: 14 flights active in sector', 'Eurocontrol NOTAM: Standard naval drill TRA-12 only', 'Zero wire agency corroboration']
    },
    taiwan: {
      title: 'Disaster Verification: Offshore M6.3 Earthquake',
      region: 'Offshore Hualien County, Taiwan',
      claim: 'Strong undersea earthquake strikes eastern Taiwan; high-speed rail automatic slowdown protocols engage.',
      steps: [
        { title: 'Step 1: Signal Ingestion', detail: 'Central Weather Administration (CWA) automated smartphone alert logged.', layer: 'Wire', status: 'ALERT' },
        { title: 'Step 2: NER Extraction', detail: 'Magnitude: 6.3; Depth: 16.4 km; Epicenter: 24.015°N, 121.840°E.', layer: 'NER', status: 'PARSED' },
        { title: 'Step 3: Multi-Layer Telemetry', detail: 'USGS broadband station TATO confirms 0.14g peak acceleration; DART Buoy 21418 confirms normal sea level.', layer: 'Telemetry', status: 'MATCHED' },
        { title: 'Step 4: AI Cross-Examination', detail: 'Independent seismic networks (USGS, CWA, JMA) show 99.8% harmonic alignment.', layer: 'Consensus', status: 'CORROBORATED' },
        { title: 'Step 5: Dossier Verdict', detail: 'Corroboration Score: 99% [CORROBORATED]. Rail safety protocols confirmed.', layer: 'Verdict', status: 'FINAL' }
      ],
      finalScore: 99,
      finalStatus: 'CORROBORATED',
      sensorLogs: ['USGS Moment Tensor: Shallow thrust fault', 'CWA Intensity: Level 4 in Taipei', '450+ citizen seismometer pings verified']
    }
  };

  const currentSimData = scenarios[simScenario];

  const handleRunSimulation = () => {
    setIsSimRunning(true);
    setSimStep(0);

    let step = 0;
    const interval = setInterval(() => {
      step++;
      setSimStep(step);
      if (step >= 4) {
        clearInterval(interval);
        setIsSimRunning(false);
      }
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-[3000] bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto font-sans">
      <div className="relative w-full max-w-5xl bg-[#0a0e17] border border-cyan-500/40 rounded-3xl shadow-[0_0_60px_rgba(0,240,255,0.2)] overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Top Pitch Header */}
        <div className="bg-[#0f1422] border-b border-slate-800 px-5 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-500/50 text-cyan-400">
              <Presentation className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-cyan-400 font-bold uppercase tracking-wider">
                  VERITAS OSINT • Executive Pitch Deck & Live Operations Simulator
                </span>
                <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded-full font-mono">
                  SEED ROUND
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                The World's First Autonomous News & Physical Telemetry Verification Engine
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400 hidden sm:inline">
              Slide {currentSlide + 1} of {totalSlides}
            </span>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Slide Navigation Progress Tabs */}
        <div className="flex items-center border-b border-slate-800/80 bg-slate-950/80 px-4 sm:px-6 overflow-x-auto text-xs font-mono scrollbar-none">
          {[
            '1. Executive Summary',
            '2. The Trust Crisis',
            '3. The 3-Layer Solution',
            '4. LIVE SIMULATOR ⚡',
            '5. Market & TAM',
            '6. Moat & Legal Defensibility',
            '7. 4-Phase Roadmap',
            '8. Financials & Ask'
          ].map((title, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`py-3 px-3 sm:px-4 border-b-2 font-semibold whitespace-nowrap transition-all cursor-pointer ${
                currentSlide === idx
                  ? 'border-cyan-400 text-cyan-300 bg-cyan-500/10'
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              {title}
            </button>
          ))}
        </div>

        {/* SLIDE CONTENT AREA */}
        <div className="p-5 sm:p-8 overflow-y-auto flex-1 space-y-6">
          
          {/* SLIDE 1: EXECUTIVE OVERVIEW */}
          {currentSlide === 0 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/80 text-cyan-400 text-xs font-mono font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>THE BLOOMBERG OF VERIFIED TRUTH</span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight">
                From a 1-Sentence Idea to a Defense-Grade Intelligence Platform
              </h1>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl">
                Breaking news is plagued by algorithmic echo chambers, coordinated viral botnets, and unverified rumors. Traditional fact-checking takes hours; media bias trackers (like Ground News) map opinions but cannot verify physical reality.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl space-y-2">
                  <div className="text-cyan-400 font-bold font-mono text-sm flex items-center gap-1.5">
                    <Scale className="w-4 h-4" /> Ground News DNA
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Transparent 3-part media bias footprints (Left, Center, Right) and automated blindspot detection.
                  </p>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl space-y-2">
                  <div className="text-sky-400 font-bold font-mono text-sm flex items-center gap-1.5">
                    <Radio className="w-4 h-4" /> World Monitor DNA
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Geospatial "God's Eye View" telemetry: live ADS-B flight radar, maritime AIS transponders, USGS seismographs, and NASA satellite thermals.
                  </p>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl space-y-2">
                  <div className="text-emerald-400 font-bold font-mono text-sm flex items-center gap-1.5">
                    <Cpu className="w-4 h-4" /> Autonomous Agent
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Sub-4-second Agentic RAG cross-examination producing objective Corroboration Scores with strict legal Safe Harbour protections.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 2: THE PROBLEM */}
          {currentSlide === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <span className="text-xs font-mono font-bold text-rose-400 uppercase tracking-wider block">
                The Core Problem • The Digital Trust Collapse
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Humanity Has More Information Than Ever, Yet Nobody Knows What Physically Happened
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-rose-950/20 border border-rose-900/40 p-5 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-rose-400 font-bold text-sm font-mono">
                    <AlertTriangle className="w-4 h-4" /> 1. Viral Rumors & Disinformation
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Coordinated botnets can manufacture 100,000 synthetic posts in 15 minutes (e.g. fake airspace closures, fabricated naval attacks). Social algorithms reward panic over physical truth.
                  </p>
                </div>

                <div className="bg-rose-950/20 border border-rose-900/40 p-5 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-rose-400 font-bold text-sm font-mono">
                    <Clock className="w-4 h-4" /> 2. Fact-Checking is Too Slow
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Human fact-checkers take 24–48 hours to publish a debunk. By then, the market has moved, ships have rerouted, and billions in economic damage have occurred.
                  </p>
                </div>

                <div className="bg-rose-950/20 border border-rose-900/40 p-5 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-rose-400 font-bold text-sm font-mono">
                    <Scale className="w-4 h-4" /> 3. Defamation & Legal Traps
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Labeling media houses as "Fake News" risks catastrophic criminal defamation suits under Section 356 BNS 2023 and loss of Section 79 IT Act Safe Harbour intermediary protection.
                  </p>
                </div>

                <div className="bg-rose-950/20 border border-rose-900/40 p-5 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-rose-400 font-bold text-sm font-mono">
                    <Layers className="w-4 h-4" /> 4. Siloed Sensor Data
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    FlightRadar24, MarineTraffic, USGS, and satellite feeds operate in isolated technical silos. Nobody cross-references news text against physical sensor arrays in real time.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 3: THE 3-LAYER SOLUTION */}
          {currentSlide === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider block">
                The VERITAS Breakthrough • Parallel Triangulation
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Replacing Subjective Opinions With Physical Sensor Triangulation
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-900/90 border border-blue-500/40 p-5 rounded-2xl space-y-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-950 text-blue-400 border border-blue-800 flex items-center justify-center font-bold font-mono">
                    L1
                  </div>
                  <h3 className="font-bold text-white text-sm">Layer 1: Mainstream Wire</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Continuous polling of Reuters, AP, AFP, and regional bureaus. Automated de-duplication of syndicated wire echo chambers.
                  </p>
                  <span className="text-[10px] font-mono text-blue-400 block pt-1">Weight: 35% of Corroboration Metric</span>
                </div>

                <div className="bg-slate-900/90 border border-purple-500/40 p-5 rounded-2xl space-y-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-950 text-purple-400 border border-purple-800 flex items-center justify-center font-bold font-mono">
                    L2
                  </div>
                  <h3 className="font-bold text-white text-sm">Layer 2: Social Pulse & Eyewitnesses</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Official Reddit Data API & compliant media. Automated DPDP Act 2023 PII scrubbing (faces blurred, handles stripped, coordinates fuzzed).
                  </p>
                  <span className="text-[10px] font-mono text-purple-400 block pt-1">Weight: 25% (Throttled to 3% if Astroturfed)</span>
                </div>

                <div className="bg-slate-900/90 border border-cyan-500/40 p-5 rounded-2xl space-y-3">
                  <div className="w-8 h-8 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center font-bold font-mono">
                    L3
                  </div>
                  <h3 className="font-bold text-white text-sm">Layer 3: Hard OSINT Telemetry</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Physical sensor grounding: OpenSky ADS-B flight transponders, MarineTraffic AIS, USGS seismic arrays, and NASA FIRMS 375m thermal infrared.
                  </p>
                  <span className="text-[10px] font-mono text-cyan-400 block pt-1">Weight: 40% (Contradiction Penalty: -65 pts)</span>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 4: INTERACTIVE LIVE OPERATIONS SIMULATOR */}
          {currentSlide === 3 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider block">
                    Interactive Live Operations Simulator ⚡
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-white">
                    Test Real-World Autonomous Verification Scenarios
                  </h3>
                </div>

                {/* Scenario Selector */}
                <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-mono">
                  <button
                    onClick={() => { setSimScenario('redsea'); setSimStep(0); }}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      simScenario === 'redsea' ? 'bg-cyan-500 text-black font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Red Sea Incident
                  </button>
                  <button
                    onClick={() => { setSimScenario('blacksea'); setSimStep(0); }}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      simScenario === 'blacksea' ? 'bg-cyan-500 text-black font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Black Sea Hoax
                  </button>
                  <button
                    onClick={() => { setSimScenario('taiwan'); setSimStep(0); }}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      simScenario === 'taiwan' ? 'bg-cyan-500 text-black font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Taiwan Earthquake
                  </button>
                </div>
              </div>

              {/* Scenario Context Banner */}
              <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Simulated Claim:</span>
                  <div className="text-xs sm:text-sm font-bold text-white">"{currentSimData.claim}"</div>
                  <div className="text-[11px] font-mono text-cyan-400">Sector: {currentSimData.region}</div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={handleRunSimulation}
                    disabled={isSimRunning}
                    className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-black font-bold font-mono text-xs rounded-xl flex items-center gap-2 shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 text-black" />
                    <span>{isSimRunning ? 'Executing Pipeline...' : 'Run Simulation'}</span>
                  </button>
                  <button
                    onClick={() => setSimStep(0)}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl text-xs transition-colors cursor-pointer"
                    title="Reset Simulation"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 5-Step Animated Pipeline Progress */}
              <div className="space-y-2.5 font-mono text-xs">
                {currentSimData.steps.map((st, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                      simStep >= idx
                        ? 'bg-slate-900/90 border-cyan-500/50 text-slate-100 shadow-md'
                        : 'bg-slate-950/60 border-slate-850 text-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                        simStep >= idx ? 'bg-cyan-500 text-black font-black' : 'bg-slate-800 text-slate-500'
                      }`}>
                        {idx + 1}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-white">{st.title}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{st.detail}</div>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      simStep >= idx ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'text-slate-600'
                    }`}>
                      {st.layer}
                    </span>
                  </div>
                ))}
              </div>

              {/* Simulation Result HUD */}
              {simStep >= 4 && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-cyan-500/50 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fadeIn">
                  <div className="flex items-center gap-3">
                    <div className={`text-2xl font-black font-mono ${
                      currentSimData.finalScore > 80 ? 'text-emerald-400' : currentSimData.finalScore > 40 ? 'text-amber-400' : 'text-rose-400'
                    }`}>
                      {currentSimData.finalScore}%
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 uppercase">Algorithm Classification</span>
                      <div className="font-bold text-white text-sm">{currentSimData.finalStatus}</div>
                    </div>
                  </div>

                  <div className="text-right text-[11px] font-mono text-slate-400 space-y-0.5">
                    {currentSimData.sensorLogs.map((log, i) => (
                      <div key={i} className="text-cyan-300">✔ {log}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SLIDE 5: MARKET OPPORTUNITY & TAM */}
          {currentSlide === 4 && (
            <div className="space-y-6 animate-fadeIn">
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider block">
                Market Size & Commercial Landscape
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                A Massive $34.8 Billion Global Intelligence & Risk Market
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl text-center space-y-2">
                  <span className="text-xs font-mono text-slate-400 uppercase">Total Addressable Market (TAM)</span>
                  <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono">$34.8B</div>
                  <p className="text-xs text-slate-400">
                    Global Open-Source Intelligence (OSINT), Geospatial Analytics & Risk Management by 2030 (CAGR 24.7%).
                  </p>
                </div>

                <div className="bg-slate-900/90 border border-cyan-500/40 p-5 rounded-2xl text-center space-y-2 shadow-[0_0_20px_rgba(0,240,255,0.1)]">
                  <span className="text-xs font-mono text-cyan-400 uppercase">Serviceable Addressable Market (SAM)</span>
                  <div className="text-3xl sm:text-4xl font-extrabold text-cyan-300 font-mono">$8.4B</div>
                  <p className="text-xs text-slate-400">
                    Corporate supply chain intelligence, defense risk consulting, newsroom fact-checking, and commodity traders.
                  </p>
                </div>

                <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl text-center space-y-2">
                  <span className="text-xs font-mono text-slate-400 uppercase">Serviceable Obtainable Market (SOM)</span>
                  <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400 font-mono">$320M</div>
                  <p className="text-xs text-slate-400">
                    Initial beachhead: 15,000 enterprise risk analysts + 500,000 paying consumer subscribers across 3 years.
                  </p>
                </div>
              </div>

              {/* Target Customers */}
              <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl space-y-2">
                <span className="text-xs font-mono font-bold text-slate-300 uppercase">Beachhead Customer Segments:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono text-slate-300">
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <strong className="text-cyan-400 block mb-0.5">Maritime & Logistics</strong>
                    Track vessel choke points (Hormuz, Suez, Malacca) and subsea cable breaks.
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <strong className="text-blue-400 block mb-0.5">Newsrooms & Media</strong>
                    Instant cited verification dossiers preventing catastrophic retractions.
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <strong className="text-amber-400 block mb-0.5">Commodities & Trading</strong>
                    Refinery flare monitoring and early disaster impact signals before cable news.
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <strong className="text-emerald-400 block mb-0.5">Prosumer Citizens</strong>
                    Ground News subscribers demanding physical proof over clickbait.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 6: MOAT & LEGAL DEFENSIBILITY */}
          {currentSlide === 5 && (
            <div className="space-y-6 animate-fadeIn">
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider block">
                Technical Moat & Regulatory Defensibility
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Architectural Immunity: Clean-Room Isolation & Defamation Shields
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold font-mono text-sm">
                    <ShieldCheck className="w-4 h-4" /> 1. Section 79 IT Act & BNS Section 356 Safe Harbour
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    By emitting objective <em>Corroboration Metrics</em> rather than defamatory labels (*"Fake News"*, *"Liar"*), VERITAS maintains ironclad intermediary Safe Harbour protections, eliminating SLAPP litigation risk.
                  </p>
                </div>

                <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-cyan-400 font-bold font-mono text-sm">
                    <Cpu className="w-4 h-4" /> 2. AGPL-3.0 Clean-Room Microservice Boundary
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    OSINT dashboards (`worldmonitor`, `gods-eye-view`) are isolated behind stateless HTTP/2 network sidecars with zero code/memory linking. Proprietary core assets are 100% legally insulated.
                  </p>
                </div>

                <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-purple-400 font-bold font-mono text-sm">
                    <Lock className="w-4 h-4" /> 3. India DPDP Act 2023 Automated PII Sanitizer
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Automated scrubbing of citizen usernames, mobile numbers (+91), and biometric faces before storage. Built-in statutory IT Rules 2021 Grievance Redressal Desk.
                  </p>
                </div>

                <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 font-bold font-mono text-sm">
                    <Award className="w-4 h-4" /> 4. Levchin Multi-Sensor Anti-Spoofing Invariants
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    In electronic warfare zones, single RF transponders are discounted and capped at $\le 75\%$ (`DEVELOPING`) until corroborated by satellite optical/SAR passes, defeating state-sponsored GPS spoofing.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 7: 4-PHASE DELIVERY ROADMAP */}
          {currentSlide === 6 && (
            <div className="space-y-6 animate-fadeIn">
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider block">
                Execution Timeline • Founder's Phased Build Plan
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                From Web MVP (Months 4–6) to Full Autonomous Production (Months 9–14)
              </h2>

              <div className="space-y-3 font-mono text-xs">
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-cyan-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold text-[10px]">
                        PHASE 1 (M1–3)
                      </span>
                      <strong className="text-white text-sm">Streaming Ingestion & Clean-Room Telemetry</strong>
                    </div>
                    <p className="text-slate-400 text-[11px]">
                      Wire APIs (GDELT, NewsAPI), Reddit Data API, OpenSky ADS-B, Marine AIS, and AGPL-3.0 sidecar isolation.
                    </p>
                  </div>
                  <span className="text-emerald-400 font-bold text-xs">DELIVERED IN PROTOTYPE ✅</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/90 border border-cyan-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 font-bold text-[10px]">
                        PHASE 2 (M4–6)
                      </span>
                      <strong className="text-white text-sm">Entity Resolution & Functional Web MVP</strong>
                    </div>
                    <p className="text-slate-400 text-[11px]">
                      Qdrant vector clustering, 5W1H entity extraction, Ground News 3-part bias bar, and God's Eye Leaflet HUD.
                    </p>
                  </div>
                  <span className="text-emerald-400 font-bold text-xs">ACTIVE ON PORT 3000 ✅</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 font-bold text-[10px]">
                        PHASE 3 (M7–9)
                      </span>
                      <strong className="text-white text-sm">Autonomous Verification Agent & Agentic RAG</strong>
                    </div>
                    <p className="text-slate-400 text-[11px]">
                      Bayesian multi-signal scorer, DPDP automated facial blurring, and statutory IT Rules Grievance Desk.
                    </p>
                  </div>
                  <span className="text-cyan-400 font-bold text-xs">CORE TESTED (119/119) 🚀</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold text-[10px]">
                        PHASE 4 (M9–14)
                      </span>
                      <strong className="text-white text-sm">Full Production & Cross-Platform Mobile (Flutter)</strong>
                    </div>
                    <p className="text-slate-400 text-[11px]">
                      Flutter/React Native app, enterprise risk feeds, offline sensor synchronization, and multi-region deployment.
                    </p>
                  </div>
                  <span className="text-slate-400 font-bold text-xs">COMMERCIAL EXPANSION 🎯</span>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 8: FINANCIALS & THE ASK */}
          {currentSlide === 7 && (
            <div className="space-y-6 animate-fadeIn">
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider block">
                The Investment Opportunity • Seed Round
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Raising $1.8M Seed to Scale the Autonomous Truth Infrastructure
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-900/90 border border-emerald-500/40 p-5 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-400 uppercase">The Financing Ask</span>
                    <span className="text-xs font-mono text-emerald-400 font-bold">18 MONTHS RUNWAY</span>
                  </div>
                  <div className="text-4xl font-extrabold text-white font-mono">$1,800,000</div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Seed funding will accelerate engineering hiring, expand direct commercial telemetry satellite APIs (Spire, Planet Labs, ADS-B Exchange), and scale enterprise pilot agreements.
                  </p>

                  <div className="space-y-1.5 pt-2 text-xs font-mono text-slate-300 border-t border-slate-800">
                    <div className="flex justify-between"><span>Core Engineering & ML (4 Staff):</span><strong>45% ($810k)</strong></div>
                    <div className="flex justify-between"><span>Commercial Telemetry & Satellite APIs:</span><strong>25% ($450k)</strong></div>
                    <div className="flex justify-between"><span>Enterprise Sales & Growth:</span><strong>15% ($270k)</strong></div>
                    <div className="flex justify-between"><span>Legal, DPDP Compliance & Safe Harbour:</span><strong>15% ($270k)</strong></div>
                  </div>
                </div>

                <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-400 uppercase">Revenue Model & Economics</span>
                    <span className="text-xs font-mono text-cyan-400 font-bold">3-TIER MONETIZATION</span>
                  </div>

                  <div className="space-y-2.5 text-xs font-mono text-slate-300">
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                      <div className="flex justify-between font-bold text-white mb-0.5">
                        <span className="text-cyan-400">1. Consumer Pro Subscription</span>
                        <span>$9.99 / mo</span>
                      </div>
                      <p className="text-[11px] text-slate-400">Media bias breakdown, blindspot alerts, custom watchlist & audio digest.</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                      <div className="flex justify-between font-bold text-white mb-0.5">
                        <span className="text-blue-400">2. Professional Analyst & Newsroom</span>
                        <span>$99 / mo</span>
                      </div>
                      <p className="text-[11px] text-slate-400">Downloadable forensic dossiers, historical verification audit trails, API access.</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                      <div className="flex justify-between font-bold text-white mb-0.5">
                        <span className="text-emerald-400">3. Enterprise Risk & Supply Chain</span>
                        <span>$2,500 - $10,000 / mo</span>
                      </div>
                      <p className="text-[11px] text-slate-400">Subsea cable disruption alerts, custom geographic bounding boxes, zero-retention private cloud.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Call to Action */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/60 to-blue-950/60 border border-cyan-500/40 text-center space-y-2">
                <h4 className="text-sm font-bold text-white">Ready to Back the Future of Verified Digital Intelligence?</h4>
                <p className="text-xs text-slate-300 font-mono">
                  Full working prototype live on port 3000 • 119 automated tests passing • Zero AGPL copyleft contamination
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Footer Navigation Bar */}
        <div className="bg-[#0f1422] border-t border-slate-800 px-6 py-4 flex items-center justify-between gap-4 font-mono text-xs">
          <button
            onClick={handlePrevSlide}
            disabled={currentSlide === 0}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalSlides }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                  currentSlide === idx ? 'bg-cyan-400 w-6' : 'bg-slate-700 hover:bg-slate-500'
                }`}
                title={`Jump to Slide ${idx + 1}`}
              />
            ))}
          </div>

          <button
            onClick={handleNextSlide}
            disabled={currentSlide === totalSlides - 1}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-black font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
