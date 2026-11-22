import React, { useState } from 'react';
import Header from './components/Header';
import LegalBanner from './components/LegalBanner';
import TelemetryTicker from './components/TelemetryTicker';
import GodsEyeMap from './components/GodsEyeMap';
import NewsCard from './components/NewsCard';
import VerificationDossier from './components/VerificationDossier';
import SubmitClaimModal from './components/SubmitClaimModal';
import LegalGuardrailsModal from './components/LegalGuardrailsModal';
import PitchDeckModal from './components/PitchDeckModal';
import { INITIAL_STORIES } from './data/mockNewsData';
import { 
  Search, 
  Filter, 
  MapPin, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Compass, 
  Radio, 
  Cpu, 
  Layers,
  Sparkles
} from 'lucide-react';

export default function App() {
  const [stories, setStories] = useState(INITIAL_STORIES);
  const [selectedStory, setSelectedStory] = useState(INITIAL_STORIES[0]);
  const [activeDossierStory, setActiveDossierStory] = useState(null);
  
  // Modals
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [isPitchModalOpen, setIsPitchModalOpen] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState('split'); // 'split' | 'map' | 'feed'

  const categories = [
    'ALL',
    'Maritime & Defense',
    'Aviation & Conflict',
    'Natural Disasters',
    'Energy & Infrastructure'
  ];

  const filteredStories = stories.filter((story) => {
    const matchesSearch = 
      story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.entities.who.some(w => w.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = categoryFilter === 'ALL' || story.category === categoryFilter;
    const matchesStatus = statusFilter === 'ALL' || story.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleClaimVerified = (newStory) => {
    setStories([newStory, ...stories]);
    setSelectedStory(newStory);
    setActiveDossierStory(newStory);
  };

  const handleSelectStory = (story) => {
    setSelectedStory(story);
  };

  const handleOpenDossier = (story) => {
    setSelectedStory(story);
    setActiveDossierStory(story);
  };

  return (
    <div className="min-h-screen bg-[#080b11] text-slate-100 flex flex-col font-sans">
      
      {/* Top Navigation */}
      <Header 
        onOpenSubmitClaim={() => setIsSubmitModalOpen(true)}
        onOpenLegal={() => setIsLegalModalOpen(true)}
        onOpenPitchDeck={() => setIsPitchModalOpen(true)}
        storiesCount={stories.length}
      />

      {/* Statutory Safe Harbour & DPDP Banner */}
      <LegalBanner onOpenLegal={() => setIsLegalModalOpen(true)} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-5">
        
        {/* Telemetry Sensor Pipeline Ticker */}
        <TelemetryTicker />

        {/* View Mode & Filter Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-slate-950/70 p-3 rounded-xl border border-slate-800">
          
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search claims, entities, vessels, flight codes..."
              className="w-full bg-slate-900 border border-slate-700/80 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
            />
          </div>

          {/* Category & Status Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            
            {/* Status Quick Filter */}
            <div className="flex items-center bg-slate-900 p-1 rounded-lg border border-slate-800">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                  statusFilter === 'ALL' ? 'bg-cyan-500 text-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                All Status
              </button>
              <button
                onClick={() => setStatusFilter('CORROBORATED')}
                className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
                  statusFilter === 'CORROBORATED' ? 'bg-emerald-500 text-black' : 'text-emerald-400 hover:text-emerald-300'
                }`}
              >
                Corroborated
              </button>
              <button
                onClick={() => setStatusFilter('DEVELOPING')}
                className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
                  statusFilter === 'DEVELOPING' ? 'bg-amber-500 text-black' : 'text-amber-400 hover:text-amber-300'
                }`}
              >
                Developing
              </button>
              <button
                onClick={() => setStatusFilter('DISPUTED')}
                className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
                  statusFilter === 'DISPUTED' ? 'bg-rose-500 text-black' : 'text-rose-400 hover:text-rose-300'
                }`}
              >
                Disputed
              </button>
            </div>

            {/* Layout Toggle (Split / Map / Feed) */}
            <div className="hidden sm:flex items-center bg-slate-900 p-1 rounded-lg border border-slate-800">
              <button
                onClick={() => setViewMode('split')}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                  viewMode === 'split' ? 'bg-slate-750 text-cyan-300 border border-slate-700' : 'text-slate-400 hover:text-white'
                }`}
              >
                Split View
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                  viewMode === 'map' ? 'bg-slate-750 text-cyan-300 border border-slate-700' : 'text-slate-400 hover:text-white'
                }`}
              >
                Map Focus
              </button>
              <button
                onClick={() => setViewMode('feed')}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                  viewMode === 'feed' ? 'bg-slate-750 text-cyan-300 border border-slate-700' : 'text-slate-400 hover:text-white'
                }`}
              >
                Wire Feed
              </button>
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
              className={`px-3 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all ${
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
              <div className="flex items-center justify-between font-mono text-xs text-slate-400 px-1">
                <span className="flex items-center gap-1.5 font-bold text-slate-300 uppercase">
                  <Radio className="w-3.5 h-3.5 text-cyan-400" />
                  Live Wire & Corroboration Feed ({filteredStories.length})
                </span>
                <span className="text-[11px] text-slate-500">Auto-Refreshed</span>
              </div>

              {filteredStories.length === 0 ? (
                <div className="bg-slate-950 p-8 rounded-xl border border-slate-800 text-center space-y-2">
                  <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto" />
                  <p className="text-sm font-semibold text-slate-300">No events match the selected criteria.</p>
                  <p className="text-xs text-slate-500 font-mono">Try adjusting your keyword search or category filters.</p>
                </div>
              ) : (
                filteredStories.map((story) => (
                  <NewsCard
                    key={story.id}
                    story={story}
                    isSelected={selectedStory?.id === story.id}
                    onSelect={() => handleOpenDossier(story)}
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
                <span className="text-cyan-400 text-[11px] font-mono">
                  {selectedStory ? `Tracking: ${selectedStory.location.name}` : 'Click any marker to inspect'}
                </span>
              </div>

              <GodsEyeMap
                stories={stories}
                selectedStory={selectedStory}
                onSelectStory={handleOpenDossier}
              />
            </div>
          )}

        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#07090f] py-6 px-4 mt-12 text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-300 font-bold">VERITAS OSINT Engine</span>
            <span>• Fully Autonomous Verification Architecture</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <button onClick={() => setIsLegalModalOpen(true)} className="hover:text-cyan-400 transition-colors">
              Section 79 IT Act Disclaimers
            </button>
            <span>•</span>
            <button onClick={() => setIsLegalModalOpen(true)} className="hover:text-cyan-400 transition-colors">
              DPDP Act 2023 Compliance
            </button>
            <span>•</span>
            <button onClick={() => setIsLegalModalOpen(true)} className="hover:text-cyan-400 transition-colors">
              Grievance Officer
            </button>
          </div>
        </div>
      </footer>

      {/* MODAL 1: Full Verification Dossier */}
      {activeDossierStory && (
        <VerificationDossier
          story={activeDossierStory}
          onClose={() => setActiveDossierStory(null)}
          onPanToLocation={(story) => setSelectedStory(story)}
        />
      )}

      {/* MODAL 2: Submit Breaking Claim */}
      <SubmitClaimModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onClaimVerified={handleClaimVerified}
      />

      {/* MODAL 3: Legal & Grievance Redressal Modal */}
      <LegalGuardrailsModal
        isOpen={isLegalModalOpen}
        onClose={() => setIsLegalModalOpen(false)}
      />

      {/* MODAL 4: Investor Pitch Deck & Live Simulator */}
      <PitchDeckModal
        isOpen={isPitchModalOpen}
        onClose={() => setIsPitchModalOpen(false)}
      />

    </div>
  );
}
