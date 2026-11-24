import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import LegalBanner from './components/LegalBanner';
import TelemetryTicker from './components/TelemetryTicker';
import SocialPulsePanel from './components/SocialPulsePanel';
import GodsEyeMap from './components/GodsEyeMap';
import ErrorBoundary from './components/ErrorBoundary';
import NewsCard from './components/NewsCard';
import VerificationDossier from './components/VerificationDossier';
import SubmitClaimModal from './components/SubmitClaimModal';
import LegalGuardrailsModal from './components/LegalGuardrailsModal';
import PitchDeckModal from './components/PitchDeckModal';
import { INITIAL_STORIES } from './data/mockNewsData';
import { fetchLiveBreakingNews } from './services/mapDataService';
import { extractEntities } from './engine/claimExtractor';
import { filterStories } from './engine/dossierExporter';
import {
  Search,
  ShieldCheck,
  AlertTriangle,
  Compass,
  Radio,
  Sparkles,
  Bookmark,
  RefreshCw,
  Newspaper,
  Map as MapIcon,
  Presentation,
  Scale,
  Cpu,
  X
} from 'lucide-react';

function convertGdeltArticleToStory(art) {
  const entities = extractEntities(art.title, art.sourceCountry || 'International');
  return {
    id: art.id,
    title: art.title,
    category: entities.category === 'Geopolitical & Security' ? 'Maritime & Defense' : entities.category,
    urgency: entities.urgency,
    timestamp: art.timestamp || 'Live GDELT',
    utcTimestamp: new Date().toISOString(),
    location: entities.location,
    summary: `Live international dispatch ingested via GDELT Project from ${art.domain} (${art.sourceCountry}). Open dossier or run 5-Step Live Cross-Check to triangulate against physical OSINT sensors.`,
    biasDistribution: { left: 30, center: 46, right: 24 },
    blindspots: `Ingested live from ${art.domain} (${art.language}); click Verify Claim to cross-check global wire balance.`,
    corroborationScore: 68,
    status: 'DEVELOPING',
    isLiveGdelt: true,
    entities,
    parallelVerification: {
      mainstreamWire: [
        {
          source: `${art.domain} (via GDELT v2 Live)`,
          bias: 'Center',
          reliability: 88,
          verdict: 'Corroborates',
          quote: art.title,
          link: art.url
        }
      ],
      socialPulse: [
        {
          source: 'DPDP-Sanitized Social Monitor',
          authorType: 'Public Stream (PII Scrubbed)',
          piiScrubbed: true,
          faceBlurApplied: true,
          signalStrength: 'Medium',
          time: 'Live',
          content: 'Monitoring Bluesky & Reddit OSINT corridors for corroborating ground reports.'
        }
      ],
      osintTelemetry: [
        {
          system: 'Multi-Sensor Live Watch (USGS / NASA EONET / OpenSky)',
          status: 'NORMAL',
          details: `Georeferenced to ${entities.location.name} (${entities.location.lat.toFixed(2)}°N, ${entities.location.lng.toFixed(2)}°E).`
        }
      ]
    },
    legalSafeguards: {
      provenanceStatement: `Developing: Live headline ingested from ${art.domain} via GDELT v2 public API pursuant to IT Act 2000 Section 79. Probabilistic telemetry cross-check available on demand.`,
      piiScrubbed: true,
      safeHarbourCompliant: true,
      legalSection: 'Section 79 IT Act & BNS Section 356 Provisional Index'
    }
  };
}

const BIAS_FILTERS = [
  { id: 'ALL', label: 'All Bias' },
  { id: 'LEFT', label: 'Left-Leaning' },
  { id: 'CENTER', label: 'Center / Balanced' },
  { id: 'RIGHT', label: 'Right-Leaning' },
  { id: 'BLINDSPOT', label: 'Blindspots' }
];

const SENSOR_FILTERS = [
  { id: 'ALL', label: 'All Sensors' },
  { id: 'SEISMIC', label: 'Seismic (USGS)' },
  { id: 'THERMAL', label: 'Thermal (NASA)' },
  { id: 'AVIATION', label: 'Aviation (ADS-B)' },
  { id: 'MARITIME', label: 'Maritime (AIS)' }
];

export default function App() {
  const [stories, setStories] = useState(INITIAL_STORIES);
  const [selectedStory, setSelectedStory] = useState(INITIAL_STORIES[0]);
  const [activeDossierStory, setActiveDossierStory] = useState(null);
  const [initialDossierTab, setInitialDossierTab] = useState('dossier');
  const [liveGdeltCount, setLiveGdeltCount] = useState(0);
  const [isSyncingNews, setIsSyncingNews] = useState(false);

  // Saved / Bookmarked Dossier IDs (localStorage persisted)
  const [savedIds, setSavedIds] = useState(() => {
    try {
      const raw = typeof localStorage !== 'undefined' ? localStorage.getItem('veritas_saved_dossiers') : null;
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [savedOnly, setSavedOnly] = useState(false);

  // Modals
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [prefillClaimText, setPrefillClaimText] = useState('');
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [isPitchModalOpen, setIsPitchModalOpen] = useState(false);

  // Multi-Dimension Filters & Layout (Journey 3 - Option B)
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [biasFilter, setBiasFilter] = useState('ALL');
  const [sensorFilter, setSensorFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState('split'); // 'split' | 'map' | 'feed'

  useEffect(() => {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('veritas_saved_dossiers', JSON.stringify(savedIds));
      }
    } catch {
      // Ignore storage quota errors
    }
  }, [savedIds]);

  const syncLiveGdeltNews = async () => {
    setIsSyncingNews(true);
    try {
      const liveArticles = await fetchLiveBreakingNews();
      if (Array.isArray(liveArticles) && liveArticles.length > 0) {
        const liveStories = liveArticles.slice(0, 4).map(convertGdeltArticleToStory);
        setLiveGdeltCount(liveStories.length);
        setStories((prev) => {
          const nonGdelt = prev.filter((s) => !s.isLiveGdelt);
          return [...nonGdelt, ...liveStories];
        });
      }
    } finally {
      setIsSyncingNews(false);
    }
  };

  useEffect(() => {
    syncLiveGdeltNews();
  }, []);

  const categories = [
    'ALL',
    'Maritime & Defense',
    'Aviation & Conflict',
    'Natural Disasters',
    'Energy & Infrastructure',
    'Cyber & AI Security'
  ];

  const handleToggleSave = (storyId) => {
    setSavedIds((prev) =>
      prev.includes(storyId) ? prev.filter((id) => id !== storyId) : [...prev, storyId]
    );
  };

  const hasActiveFilters =
    Boolean(searchQuery.trim()) ||
    categoryFilter !== 'ALL' ||
    statusFilter !== 'ALL' ||
    biasFilter !== 'ALL' ||
    sensorFilter !== 'ALL' ||
    savedOnly;

  const resetAllFilters = () => {
    setSearchQuery('');
    setCategoryFilter('ALL');
    setStatusFilter('ALL');
    setBiasFilter('ALL');
    setSensorFilter('ALL');
    setSavedOnly(false);
  };

  const filteredStories = filterStories(stories, {
    q: searchQuery,
    category: categoryFilter,
    status: statusFilter,
    bias: biasFilter,
    sensor: sensorFilter,
    savedOnly,
    savedIds
  });

  const handleClaimVerified = (newStory) => {
    setStories((prev) => [newStory, ...prev]);
    setSelectedStory(newStory);
    setInitialDossierTab('dossier');
    setActiveDossierStory(newStory);
    setPrefillClaimText('');
  };

  const handleOpenDossier = (story, tab = 'dossier') => {
    setSelectedStory(story);
    setInitialDossierTab(tab);
    setActiveDossierStory(story);
  };

  const handleVerifySocialPost = (post) => {
    setPrefillClaimText(post.content || '');
    setIsSubmitModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#080b11] text-slate-100 flex flex-col font-sans pb-20 md:pb-0">
      {/* Top Navigation */}
      <Header
        onOpenSubmitClaim={() => {
          setPrefillClaimText('');
          setIsSubmitModalOpen(true);
        }}
        onOpenLegal={() => setIsLegalModalOpen(true)}
        onOpenPitchDeck={() => setIsPitchModalOpen(true)}
        storiesCount={stories.length}
      />

      {/* Statutory Safe Harbour & DPDP Banner */}
      <LegalBanner onOpenLegal={() => setIsLegalModalOpen(true)} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 space-y-4 sm:space-y-5">
        {/* Telemetry Sensor Pipeline Ticker */}
        <TelemetryTicker />

        {/* Live Social Media Status & DPDP-Sanitized Pulse */}
        <SocialPulsePanel onVerifySocialPost={handleVerifySocialPost} />

        {/* View Mode & Multi-Dimension Filter Console (Journey 3 - Option B) */}
        <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 space-y-3">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search claims, entities, vessels, flight codes..."
                aria-label="Search breaking news claims and telemetry entities"
                className="w-full bg-slate-900 border border-slate-700/80 rounded-lg pl-9 pr-8 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search query"
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Status, Saved & Layout Mode Controls */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
              {/* Status Quick Filter */}
              <div className="flex items-center bg-slate-900 p-1 rounded-lg border border-slate-800 overflow-x-auto">
                <button
                  onClick={() => setStatusFilter('ALL')}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                    statusFilter === 'ALL' ? 'bg-cyan-500 text-black' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setStatusFilter('CORROBORATED')}
                  className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                    statusFilter === 'CORROBORATED'
                      ? 'bg-emerald-500 text-black'
                      : 'text-emerald-400 hover:text-emerald-300'
                  }`}
                >
                  Corroborated
                </button>
                <button
                  onClick={() => setStatusFilter('DEVELOPING')}
                  className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                    statusFilter === 'DEVELOPING' ? 'bg-amber-500 text-black' : 'text-amber-400 hover:text-amber-300'
                  }`}
                >
                  Developing
                </button>
                <button
                  onClick={() => setStatusFilter('DISPUTED')}
                  className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                    statusFilter === 'DISPUTED' ? 'bg-rose-500 text-black' : 'text-rose-400 hover:text-rose-300'
                  }`}
                >
                  Disputed
                </button>
              </div>

              {/* Saved Bookmarks Toggle */}
              <button
                type="button"
                onClick={() => setSavedOnly(!savedOnly)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold transition-colors cursor-pointer ${
                  savedOnly
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${savedOnly ? 'fill-amber-400 text-amber-400' : 'text-amber-400'}`} />
                <span>Saved ({savedIds.length})</span>
              </button>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="px-2.5 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/40 text-[11px] font-semibold transition-colors cursor-pointer"
                >
                  Reset Filters
                </button>
              )}

              {/* Layout Toggle (Split / Map / Feed) */}
              <div className="hidden sm:flex items-center bg-slate-900 p-1 rounded-lg border border-slate-800">
                <button
                  onClick={() => setViewMode('split')}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                    viewMode === 'split'
                      ? 'bg-slate-750 text-cyan-300 border border-slate-700'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Split View
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                    viewMode === 'map'
                      ? 'bg-slate-750 text-cyan-300 border border-slate-700'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Map Focus
                </button>
                <button
                  onClick={() => setViewMode('feed')}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                    viewMode === 'feed'
                      ? 'bg-slate-750 text-cyan-300 border border-slate-700'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Wire Feed
                </button>
              </div>
            </div>
          </div>

          {/* Bias Spectrum & Physical Sensor Drilldown Filters (Journey 3 - Option B) */}
          <div className="pt-2 border-t border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-2.5 text-xs font-mono">
            {/* Bias Spectrum Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              <span className="flex items-center gap-1 text-slate-400 text-[11px] uppercase mr-1 whitespace-nowrap">
                <Scale className="w-3.5 h-3.5 text-purple-400" />
                Bias:
              </span>
              {BIAS_FILTERS.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setBiasFilter(b.id)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    biasFilter === b.id
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50'
                      : 'bg-slate-900/70 text-slate-400 border border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>

            {/* Physical Sensor Layer Drilldown Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              <span className="flex items-center gap-1 text-slate-400 text-[11px] uppercase mr-1 whitespace-nowrap">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                Sensor:
              </span>
              {SENSOR_FILTERS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSensorFilter(s.id)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    sensorFilter === s.id
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                      : 'bg-slate-900/70 text-slate-400 border border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-mono scrollbar-none">
          <span className="text-slate-500 text-[11px] uppercase mr-1">Domain:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
                categoryFilter === cat
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/50'
                  : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Interactive Layout Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* LEFT: Ground News Feed (Shown in 'split' or 'feed' mode) */}
          {(viewMode === 'split' || viewMode === 'feed') && (
            <div className={`${viewMode === 'split' ? 'lg:col-span-5' : 'lg:col-span-12'} space-y-4`}>
              <div className="flex items-center justify-between font-mono text-xs text-slate-400 px-1 gap-2">
                <span className="flex items-center gap-1.5 font-bold text-slate-300 uppercase">
                  <Radio className="w-3.5 h-3.5 text-cyan-400" />
                  Live Wire &amp; Corroboration Feed ({filteredStories.length})
                </span>
                <button
                  type="button"
                  onClick={syncLiveGdeltNews}
                  disabled={isSyncingNews}
                  className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 cursor-pointer"
                  title="Sync live GDELT global news"
                >
                  <RefreshCw className={`w-3 h-3 ${isSyncingNews ? 'animate-spin' : ''}`} />
                  <span>{liveGdeltCount > 0 ? `+${liveGdeltCount} GDELT Live` : 'Sync GDELT'}</span>
                </button>
              </div>

              {filteredStories.length === 0 ? (
                <div className="bg-slate-950 p-8 rounded-xl border border-slate-800 text-center space-y-3">
                  <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto" />
                  <p className="text-sm font-semibold text-slate-300">
                    {savedOnly ? 'No bookmarked dossiers yet.' : 'No events match the selected filter criteria.'}
                  </p>
                  <p className="text-xs text-slate-500 font-mono">
                    {savedOnly
                      ? 'Tap the bookmark icon on any story card or dossier to save it locally.'
                      : 'Try clearing your keyword search, bias spectrum, or sensor drilldown filters.'}
                  </p>
                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={resetAllFilters}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-semibold cursor-pointer"
                    >
                      Reset All Filters
                    </button>
                  )}
                </div>
              ) : (
                filteredStories.map((story) => (
                  <NewsCard
                    key={story.id}
                    story={story}
                    isSelected={selectedStory?.id === story.id}
                    onSelect={() => handleOpenDossier(story, 'dossier')}
                    onShare={() => handleOpenDossier(story, 'share')}
                    isSaved={savedIds.includes(story.id)}
                    onToggleSave={handleToggleSave}
                  />
                ))
              )}
            </div>
          )}

          {/* RIGHT: God's Eye Geospatial Telemetry Map (Shown in 'split' or 'map' mode) */}
          {(viewMode === 'split' || viewMode === 'map') && (
            <div className={`${viewMode === 'split' ? 'lg:col-span-7 sticky top-20' : 'lg:col-span-12'} space-y-4`}>
              <div className="flex items-center justify-between font-mono text-xs text-slate-400 px-1">
                <span className="flex items-center gap-1.5 font-bold text-slate-300 uppercase">
                  <Compass className="w-3.5 h-3.5 text-cyan-400" />
                  God's Eye View: Global Telemetry Tracking
                </span>
                <span className="text-cyan-400 text-[11px] font-mono truncate max-w-[180px] sm:max-w-none">
                  {selectedStory ? `Tracking: ${selectedStory.location.name}` : 'Click any marker to inspect'}
                </span>
              </div>

              <ErrorBoundary fallbackTitle="God's Eye Map Sensor Visualizer">
                <GodsEyeMap
                  stories={filteredStories.length > 0 ? filteredStories : stories}
                  selectedStory={selectedStory}
                  onSelectStory={(story) => handleOpenDossier(story, 'dossier')}
                />
              </ErrorBoundary>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#07090f] py-6 px-4 mt-12 text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-300 font-bold">VERITAS OSINT v2.0</span>
            <span>• Autonomous Live Telemetry &amp; Verification PWA</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400 flex-wrap justify-center">
            <button
              onClick={() => setIsLegalModalOpen(true)}
              className="hover:text-cyan-400 transition-colors cursor-pointer"
            >
              Section 79 IT Act Disclaimers
            </button>
            <span>•</span>
            <button
              onClick={() => setIsLegalModalOpen(true)}
              className="hover:text-cyan-400 transition-colors cursor-pointer"
            >
              DPDP Act 2023 Compliance
            </button>
            <span>•</span>
            <button
              onClick={() => setIsLegalModalOpen(true)}
              className="hover:text-cyan-400 transition-colors cursor-pointer"
            >
              Grievance Officer
            </button>
          </div>
        </div>
      </footer>

      {/* Mobile & iPad Fixed Bottom Tab Bar */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 inset-x-0 z-[1500] bg-[#0a0d14]/95 backdrop-blur-lg border-t border-slate-800 px-2 py-1.5"
        style={{ paddingBottom: 'max(0.45rem, env(safe-area-inset-bottom))' }}
      >
        <div className="grid grid-cols-5 gap-1 font-mono text-[10px]">
          <button
            type="button"
            onClick={() => {
              setSavedOnly(false);
              setViewMode('feed');
            }}
            className={`flex flex-col items-center justify-center py-1.5 rounded-lg transition-colors ${
              viewMode === 'feed' && !savedOnly ? 'text-cyan-400 bg-cyan-500/10 font-bold' : 'text-slate-400'
            }`}
          >
            <Newspaper className="w-4 h-4 mb-0.5" />
            <span>Feed</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSavedOnly(false);
              setViewMode('map');
            }}
            className={`flex flex-col items-center justify-center py-1.5 rounded-lg transition-colors ${
              viewMode === 'map' ? 'text-cyan-400 bg-cyan-500/10 font-bold' : 'text-slate-400'
            }`}
          >
            <MapIcon className="w-4 h-4 mb-0.5" />
            <span>Map</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setPrefillClaimText('');
              setIsSubmitModalOpen(true);
            }}
            className="flex flex-col items-center justify-center py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-bold shadow-[0_0_12px_rgba(0,240,255,0.3)]"
          >
            <Sparkles className="w-4 h-4 mb-0.5" />
            <span>Verify</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSavedOnly(true);
              setViewMode('feed');
            }}
            className={`flex flex-col items-center justify-center py-1.5 rounded-lg transition-colors ${
              savedOnly ? 'text-amber-300 bg-amber-500/10 font-bold' : 'text-slate-400'
            }`}
          >
            <Bookmark className="w-4 h-4 mb-0.5" />
            <span>Saved ({savedIds.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setIsPitchModalOpen(true)}
            className="flex flex-col items-center justify-center py-1.5 rounded-lg text-purple-300"
          >
            <Presentation className="w-4 h-4 mb-0.5" />
            <span>Deck</span>
          </button>
        </div>
      </nav>

      {/* MODAL 1: Full Verification Dossier */}
      {activeDossierStory && (
        <VerificationDossier
          story={activeDossierStory}
          initialTab={initialDossierTab}
          onClose={() => setActiveDossierStory(null)}
          onPanToLocation={(story) => {
            setSelectedStory(story);
            setViewMode((prev) => (prev === 'feed' ? 'map' : prev));
          }}
          isSaved={savedIds.includes(activeDossierStory.id)}
          onToggleSave={handleToggleSave}
        />
      )}

      {/* MODAL 2: Submit Breaking Claim */}
      <SubmitClaimModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onClaimVerified={handleClaimVerified}
        initialClaimText={prefillClaimText}
      />

      {/* MODAL 3: Legal & Grievance Redressal Modal */}
      <LegalGuardrailsModal isOpen={isLegalModalOpen} onClose={() => setIsLegalModalOpen(false)} />

      {/* MODAL 4: Investor Pitch Deck & Live Simulator */}
      <PitchDeckModal isOpen={isPitchModalOpen} onClose={() => setIsPitchModalOpen(false)} />
    </div>
  );
}
