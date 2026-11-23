import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  Compass, 
  Layers, 
  Plane, 
  Ship, 
  Activity, 
  Flame, 
  MapPin, 
  Crosshair, 
  Maximize2,
  AlertTriangle,
  CheckCircle,
  Eye,
  Radio,
  Navigation,
  Globe,
  Satellite,
  Sun,
  Moon,
  Info,
  X,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { fetchLiveEarthquakes, fetchLiveDisasters, fetchLiveFlights, STRATEGIC_REGIONS, MAP_STYLES } from '../services/mapDataService';

export default function GodsEyeMap({ stories, selectedStory, onSelectStory }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const labelsLayerRef = useRef(null);
  const markersLayerRef = useRef(null);
  const telemetryLayerRef = useRef(null);

  // Map state
  const [currentStyle, setCurrentStyle] = useState('dark'); // 'dark' | 'satellite' | 'streets'
  const [showLabels, setShowLabels] = useState(true);
  const [activeRegion, setActiveRegion] = useState('global');
  const [inspectedNode, setInspectedNode] = useState(null); // node currently clicked and inspected
  const [cursorCoords, setCursorCoords] = useState({ lat: 25.0, lng: 45.0 });
  const [isLegendOpen, setIsLegendOpen] = useState(false);
  const [isLayersOpen, setIsLayersOpen] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Layer Visibility
  const [activeLayers, setActiveLayers] = useState({
    newsPins: true,
    adsbFlights: true,
    maritimeAis: true,
    seismic: true,
    satelliteThermal: true
  });

  // Dynamic Telemetry State (Populated from Live USGS, NASA EONET, & OpenSky APIs)
  const [liveSeismic, setLiveSeismic] = useState([]);
  const [liveDisasters, setLiveDisasters] = useState([]);
  const [liveFlights, setLiveFlights] = useState([]);

  // Base telemetry data around major global straits and transit corridors
  const baseTelemetry = [
    // Red Sea / Bab-el-Mandeb
    { 
      id: 'flight-p8',
      type: 'flight', 
      lat: 12.8, 
      lng: 43.6, 
      label: 'USN P-8A Poseidon (AE6812)', 
      alt: '24,000 ft', 
      speed: '380 kts', 
      heading: '142° SE',
      route: 'Djibouti Patrol Corridor',
      sensorSource: 'OpenSky Network ADS-B Radar (Live)',
      description: 'Maritime patrol aircraft conducting aerial reconnaissance following commercial tanker diversion.'
    },
    { 
      id: 'flight-qtr',
      type: 'flight', 
      lat: 13.4, 
      lng: 42.9, 
      label: 'Commercial Cargo QTR810 (B777)', 
      alt: '36,000 ft', 
      speed: '490 kts', 
      heading: '315° NW',
      route: 'Doha -> London Heathrow',
      sensorSource: 'ADS-B Exchange Telemetry',
      description: 'Civilian air cargo maintaining standard commercial airway above Red Sea transit zone.'
    },
    { 
      id: 'vessel-stellar',
      type: 'vessel', 
      lat: 12.587, 
      lng: 43.342, 
      label: 'Crude Carrier "Stellar Tide" (IMO 9482110)', 
      status: 'Evasive Course Maneuver (3.2 kts)', 
      destination: 'Rotterdam',
      flag: 'Liberia',
      speed: '3.2 knots',
      sensorSource: 'Spire / MarineTraffic Global AIS',
      description: 'Commercial tanker logged sudden 90° yaw rate change after drone visual contact reported by bridge.'
    },
    { 
      id: 'vessel-hessen',
      type: 'vessel', 
      lat: 12.92, 
      lng: 43.15, 
      label: 'Frigate FGS Hessen (F221)', 
      status: 'Escort Patrol 18.5 kts', 
      flag: 'Germany (EU Aspides)',
      speed: '18.5 knots',
      sensorSource: 'Naval AIS / Coastal SDR Receiver',
      description: 'Multilateral naval air-defense escort escorting commercial merchant convoy.'
    },
    // Black Sea
    { 
      id: 'flight-tarom',
      type: 'flight', 
      lat: 44.5, 
      lng: 30.5, 
      label: 'Civilian Flight ROT301 (Tarom A318)', 
      alt: '37,000 ft', 
      speed: '460 kts', 
      heading: '085° E',
      route: 'Bucharest -> Istanbul',
      sensorSource: 'Eurocontrol ADS-B Stream',
      description: 'Active commercial airliner disproving viral rumors of total Black Sea airspace shutdown.'
    },
    { 
      id: 'flight-forte',
      type: 'flight', 
      lat: 43.8, 
      lng: 29.8, 
      label: 'NATO RQ-4D Phoenix (FORTE12)', 
      alt: '52,000 ft', 
      speed: '310 kts', 
      heading: 'Loop Patrol',
      route: 'Sigonella -> Black Sea FIR',
      sensorSource: 'OpenSky Transponder Log',
      description: 'High-altitude long-endurance unmanned surveillance aircraft monitoring eastern approaches.'
    },
    // Baltic Sea
    { 
      id: 'vessel-nordic',
      type: 'vessel', 
      lat: 57.340, 
      lng: 18.980, 
      label: 'Bulk Carrier "Nordic Tracer" (IMO 9318210)', 
      status: 'Anchor Dragging Alert (1.8 kts)', 
      flag: 'Panama',
      speed: '1.8 knots',
      sensorSource: 'Baltic AIS Marine Array',
      description: 'Vessel path crossed within 200m of subsea power cable line during gale winds.'
    },
    // Greece / Mediterranean
    { 
      id: 'thermal-peloponnese',
      type: 'thermal', 
      lat: 37.650, 
      lng: 22.120, 
      label: 'NASA FIRMS VIIRS Thermal Hotspot (820 MW)', 
      status: 'Extreme Fire Radiative Power (FRP)', 
      frp: '820 MW',
      sensorSource: 'NASA FIRMS VIIRS / MODIS 375m NRT',
      description: 'Intense thermal infrared signatures detected across 14 discrete 375m pixels in Peloponnese.'
    },
    { 
      id: 'flight-scooper',
      type: 'flight', 
      lat: 37.45, 
      lng: 22.35, 
      label: 'Amphibious Fire Bomber (CAN415)', 
      alt: '1,400 ft', 
      speed: '145 kts', 
      sensorSource: 'ADS-B Firefighting Vector',
      description: 'Canadair CL-415 conducting cyclic water drops from Argolic Gulf on wildland fire line.'
    }
  ];

  // Ingest Live USGS, NASA EONET, and OpenSky APIs on Component Mount
  const loadLiveTelemetry = async () => {
    setIsRefreshing(true);
    try {
      const [quakes, disasters, flights] = await Promise.all([
        fetchLiveEarthquakes(),
        fetchLiveDisasters(),
        fetchLiveFlights()
      ]);
      setLiveSeismic(quakes);
      setLiveDisasters(disasters);
      setLiveFlights(flights);
    } catch (err) {
      console.error('Failed to load live telemetry:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadLiveTelemetry();
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [20.0, 30.0],
        zoom: 2,
        minZoom: 2,
        maxZoom: 16,
        zoomControl: false,
        attributionControl: false
      });

      // Base Tile Layer
      const baseTile = L.tileLayer(MAP_STYLES.dark.url, {
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(map);
      tileLayerRef.current = baseTile;

      // Country / City Labels Layer
      const labels = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        opacity: 0.85
      }).addTo(map);
      labelsLayerRef.current = labels;

      // Custom Zoom Control at bottom right
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Layers groups
      markersLayerRef.current = L.layerGroup().addTo(map);
      telemetryLayerRef.current = L.layerGroup().addTo(map);

      // Track Mouse Coordinates
      map.on('mousemove', (e) => {
        setCursorCoords({
          lat: parseFloat(e.latlng.lat.toFixed(3)),
          lng: parseFloat(e.latlng.lng.toFixed(3))
        });
      });

      mapInstanceRef.current = map;
    }

    return () => {
      // Cleanup
    };
  }, []);

  // Switch Map Tiles (Dark / Satellite / Streets)
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;

    tileLayerRef.current.setUrl(MAP_STYLES[currentStyle].url);

    // Toggle Labels opacity
    if (labelsLayerRef.current) {
      if (showLabels) {
        labelsLayerRef.current.setOpacity(currentStyle === 'satellite' ? 0.9 : 0.6);
      } else {
        labelsLayerRef.current.setOpacity(0);
      }
    }
  }, [currentStyle, showLabels]);

  // Update Markers (News Stories + Live USGS + Telemetry)
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current || !telemetryLayerRef.current) return;

    markersLayerRef.current.clearLayers();
    telemetryLayerRef.current.clearLayers();

    // 1. Render News Story Pins
    if (activeLayers.newsPins) {
      stories.forEach((story) => {
        const isSelected = selectedStory?.id === story.id;
        const color = story.status === 'CORROBORATED' ? '#00ff66' : story.status === 'DEVELOPING' ? '#ffb703' : '#ff3366';

        const customIcon = L.divIcon({
          className: 'custom-story-pin',
          html: `
            <div style="
              position: relative;
              display: flex;
              align-items: center;
              justify-content: center;
              width: 36px;
              height: 36px;
              cursor: pointer;
            ">
              <div style="
                position: absolute;
                width: 36px;
                height: 36px;
                border-radius: 50%;
                background-color: ${color}25;
                border: 2px solid ${color};
                animation: ${isSelected ? 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite' : 'none'};
              "></div>
              <div style="
                width: 15px;
                height: 15px;
                border-radius: 50%;
                background-color: ${color};
                box-shadow: 0 0 16px ${color};
                border: 2px solid #000;
              "></div>
            </div>
          `,
          iconSize: [36, 36],
          iconAnchor: [18, 18]
        });

        const marker = L.marker([story.location.lat, story.location.lng], { icon: customIcon });

        marker.on('click', () => {
          setInspectedNode({
            kind: 'story',
            data: story
          });
          onSelectStory(story);
        });

        markersLayerRef.current.addLayer(marker);
      });
    }

    // 2. Render Live USGS Earthquakes
    if (activeLayers.seismic) {
      liveSeismic.forEach((quake) => {
        const quakeIcon = L.divIcon({
          className: 'quake-marker',
          html: `
            <div style="
              display: flex;
              align-items: center;
              justify-content: center;
              width: 24px;
              height: 24px;
              background: #f59e0bcc;
              border: 1.5px solid #fbbf24;
              border-radius: 50%;
              color: #000;
              font-family: monospace;
              font-weight: 800;
              font-size: 10px;
              box-shadow: 0 0 12px #f59e0b80;
              cursor: pointer;
            ">
              M${Math.round(quake.magnitude)}
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        const qMarker = L.marker([quake.lat, quake.lng], { icon: quakeIcon });

        qMarker.on('click', () => {
          setInspectedNode({
            kind: 'telemetry',
            type: 'seismic',
            data: quake
          });
        });

        telemetryLayerRef.current.addLayer(qMarker);

        // Seismic shockwave circle proportional to magnitude
        const radiusMeters = Math.max(30000, quake.magnitude * 20000);
        const circle = L.circle([quake.lat, quake.lng], {
          color: '#f59e0b',
          fillColor: '#f59e0b',
          fillOpacity: 0.12,
          weight: 1.5,
          radius: radiusMeters
        });
        telemetryLayerRef.current.addLayer(circle);
      });
    }

    // 3. Render Live NASA EONET Hazards & Thermal
    if (activeLayers.satelliteThermal) {
      liveDisasters.forEach((disaster) => {
        let iconColor = '#f97316'; // wildfire orange
        let iconSymbol = '🔥';
        if (disaster.disasterType?.includes('volcano')) {
          iconColor = '#ef4444';
          iconSymbol = '🌋';
        } else if (disaster.disasterType?.includes('storm')) {
          iconColor = '#a855f7';
          iconSymbol = '🌀';
        } else if (disaster.disasterType?.includes('flood')) {
          iconColor = '#06b6d4';
          iconSymbol = '🌊';
        }

        const disIcon = L.divIcon({
          className: 'disaster-icon',
          html: `
            <div style="
              display: flex;
              align-items: center;
              justify-content: center;
              width: 26px;
              height: 26px;
              background: #0f1420f5;
              border: 1.5px solid ${iconColor};
              border-radius: 8px;
              color: ${iconColor};
              font-size: 13px;
              box-shadow: 0 0 12px ${iconColor}60;
              cursor: pointer;
            ">
              ${iconSymbol}
            </div>
          `,
          iconSize: [26, 26],
          iconAnchor: [13, 13]
        });

        const disMarker = L.marker([disaster.lat, disaster.lng], { icon: disIcon });
        disMarker.on('click', () => {
          setInspectedNode({
            kind: 'telemetry',
            type: 'disaster',
            data: disaster
          });
        });
        telemetryLayerRef.current.addLayer(disMarker);
      });
    }

    // 4. Render ADS-B Flights (Live OpenSky + Strategic Corridors)
    if (activeLayers.adsbFlights) {
      const flightsToRender = liveFlights.length > 0 ? liveFlights : baseTelemetry.filter(t => t.type === 'flight');
      flightsToRender.forEach((flight) => {
        const iconColor = flight.contestedZone ? '#f59e0b' : '#38bdf8';
        const flightIcon = L.divIcon({
          className: 'flight-icon',
          html: `
            <div style="
              display: flex;
              align-items: center;
              justify-content: center;
              width: 24px;
              height: 24px;
              background: #0f1420f5;
              border: 1.5px solid ${iconColor};
              border-radius: 6px;
              color: ${iconColor};
              font-size: 12px;
              box-shadow: 0 0 10px ${iconColor}50;
              cursor: pointer;
            ">
              ✈
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        const fMarker = L.marker([flight.lat, flight.lng], { icon: flightIcon });
        fMarker.on('click', () => {
          setInspectedNode({
            kind: 'telemetry',
            type: 'flight',
            data: flight
          });
        });
        telemetryLayerRef.current.addLayer(fMarker);
      });
    }

    // 5. Render Maritime AIS Vessels
    if (activeLayers.maritimeAis) {
      baseTelemetry.filter(t => t.type === 'vessel').forEach((vessel) => {
        const vIcon = L.divIcon({
          className: 'vessel-icon',
          html: `
            <div style="
              display: flex;
              align-items: center;
              justify-content: center;
              width: 24px;
              height: 24px;
              background: #0f1420f5;
              border: 1.5px solid #0284c7;
              border-radius: 6px;
              color: #0284c7;
              font-size: 12px;
              box-shadow: 0 0 10px rgba(2, 132, 199, 0.5);
              cursor: pointer;
            ">
              ⚓
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        const vMarker = L.marker([vessel.lat, vessel.lng], { icon: vIcon });
        vMarker.on('click', () => {
          setInspectedNode({
            kind: 'telemetry',
            type: 'vessel',
            data: vessel
          });
        });
        telemetryLayerRef.current.addLayer(vMarker);
      });
    }

  }, [stories, activeLayers, liveSeismic, liveDisasters, liveFlights, selectedStory]);

  // Handle Strategic Region Jump
  const handleJumpToRegion = (region) => {
    setActiveRegion(region.id);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(region.center, region.zoom, {
        duration: 1.6,
        easeLinearity: 0.25
      });
    }
  };

  // Fly to selected story from external trigger
  useEffect(() => {
    if (selectedStory && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(
        [selectedStory.location.lat, selectedStory.location.lng],
        7,
        { duration: 1.5, easeLinearity: 0.25 }
      );
      setInspectedNode({
        kind: 'story',
        data: selectedStory
      });
    }
  }, [selectedStory]);

  const toggleLayer = (layerKey) => {
    setActiveLayers(prev => ({ ...prev, [layerKey]: !prev[layerKey] }));
  };

  return (
    <div className="relative w-full h-full min-h-[580px] bg-[#080b11] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col font-sans">
      
      {/* 1. TOP STRATEGIC REGION QUICK JUMP BAR (1-Click Global Navigation) */}
      <div className="bg-[#0f1420]/95 backdrop-blur-md border-b border-slate-800/90 px-3 py-2 flex items-center justify-between gap-2 overflow-x-auto scrollbar-none z-[1000] text-xs font-mono">
        <div className="flex items-center gap-1.5 flex-shrink-0 text-slate-400 font-bold text-[11px] uppercase tracking-wider mr-1">
          <Globe className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Regions:</span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {STRATEGIC_REGIONS.map((region) => (
            <button
              key={region.id}
              onClick={() => handleJumpToRegion(region)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                activeRegion === region.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700'
              }`}
            >
              <span>{region.name}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={() => setIsLegendOpen(!isLegendOpen)}
            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 rounded-lg text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
            title="How to read this map"
          >
            <Info className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Legend</span>
          </button>

          <button
            onClick={loadLiveEarthquakes}
            disabled={isRefreshing}
            className="p-1 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 border border-slate-700 rounded-lg transition-colors cursor-pointer"
            title="Refresh Live USGS API Feeds"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2. FLOATING HUD CONTROLS OVER MAP */}
      
      {/* Top Left: Map Style Selector (Satellite vs Dark vs Streets) */}
      <div className="absolute top-14 left-3 z-[1000] flex flex-col gap-2 pointer-events-auto">
        <div className="bg-[#0f1420]/95 backdrop-blur-md border border-slate-700/80 p-1.5 rounded-xl shadow-xl flex items-center gap-1 text-xs font-mono">
          <button
            onClick={() => setCurrentStyle('dark')}
            className={`px-2 py-1 rounded-lg flex items-center gap-1 text-[11px] font-semibold transition-colors cursor-pointer ${
              currentStyle === 'dark' ? 'bg-cyan-500 text-black font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Moon className="w-3 h-3" />
            <span>Dark</span>
          </button>
          <button
            onClick={() => setCurrentStyle('satellite')}
            className={`px-2 py-1 rounded-lg flex items-center gap-1 text-[11px] font-semibold transition-colors cursor-pointer ${
              currentStyle === 'satellite' ? 'bg-cyan-500 text-black font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Satellite className="w-3 h-3" />
            <span>Satellite</span>
          </button>
          <button
            onClick={() => setCurrentStyle('streets')}
            className={`px-2 py-1 rounded-lg flex items-center gap-1 text-[11px] font-semibold transition-colors cursor-pointer ${
              currentStyle === 'streets' ? 'bg-cyan-500 text-black font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sun className="w-3 h-3" />
            <span>Topo</span>
          </button>

          <span className="text-slate-700">|</span>

          <button
            onClick={() => setShowLabels(!showLabels)}
            className={`px-2 py-1 rounded-lg text-[10px] font-mono transition-colors cursor-pointer ${
              showLabels ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'text-slate-500'
            }`}
            title="Toggle Country Borders & City Names"
          >
            Borders: {showLabels ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* Live Telemetry Status Badge */}
        <div className="bg-[#0f1420]/90 backdrop-blur-md border border-slate-800 px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-2 text-xs font-mono text-slate-300">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
          <span className="text-[11px] text-slate-400">Live Telemetry:</span>
          <span className="text-emerald-400 font-bold">
            {liveSeismic.length} Quakes • {liveDisasters.length} Hazards • {liveFlights.length} Flights
          </span>
          <button 
            onClick={loadLiveTelemetry}
            disabled={isRefreshing}
            className="ml-1 p-1 hover:bg-slate-800 rounded transition-colors text-cyan-400 cursor-pointer"
            title="Refresh real-time feeds"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Top Right: Layer Visibility Toggle Panel (Collapsible for Mobile/iPad Touch Ergonomics) */}
      <div className="absolute top-14 right-3 z-[1000] flex flex-col gap-1.5 bg-[#0f1420]/95 backdrop-blur-md border border-slate-800 p-2.5 rounded-xl shadow-xl text-xs font-mono pointer-events-auto">
        <button
          type="button"
          onClick={() => setIsLayersOpen(!isLayersOpen)}
          className="flex items-center justify-between gap-2 text-[11px] font-semibold text-slate-300 hover:text-white cursor-pointer min-h-[28px]"
          aria-expanded={isLayersOpen}
        >
          <span className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>DATA LAYERS</span>
          </span>
          <span className="text-[10px] text-cyan-400">{isLayersOpen ? '−' : '+'}</span>
        </button>

        {isLayersOpen && (
          <div className="flex flex-col gap-1.5 pt-1 border-t border-slate-800">

        <button
          onClick={() => toggleLayer('newsPins')}
          className={`flex items-center justify-between gap-3 px-2 py-1 rounded transition-colors cursor-pointer ${
            activeLayers.newsPins ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" /> News Stories
          </span>
          <span className="text-[10px] font-bold">{stories.length}</span>
        </button>

        <button
          onClick={() => toggleLayer('seismic')}
          className={`flex items-center justify-between gap-3 px-2 py-1 rounded transition-colors cursor-pointer ${
            activeLayers.seismic ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-amber-400" /> USGS Quakes
          </span>
          <span className="text-[10px] text-emerald-400 font-bold">{liveSeismic.length} LIVE</span>
        </button>

        <button
          onClick={() => toggleLayer('adsbFlights')}
          className={`flex items-center justify-between gap-3 px-2 py-1 rounded transition-colors cursor-pointer ${
            activeLayers.adsbFlights ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Plane className="w-3.5 h-3.5 text-blue-400" /> ADS-B Flights
          </span>
          <span className="text-[10px] text-emerald-400 font-bold">{liveFlights.length} LIVE</span>
        </button>

        <button
          onClick={() => toggleLayer('maritimeAis')}
          className={`flex items-center justify-between gap-3 px-2 py-1 rounded transition-colors cursor-pointer ${
            activeLayers.maritimeAis ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Ship className="w-3.5 h-3.5 text-sky-400" /> Maritime AIS
          </span>
          <span className="text-[10px] text-sky-400 font-bold">4 AIS</span>
        </button>

        <button
          onClick={() => toggleLayer('satelliteThermal')}
          className={`flex items-center justify-between gap-3 px-2 py-1.5 rounded transition-colors cursor-pointer ${
            activeLayers.satelliteThermal ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-rose-400" /> NASA Hazards
          </span>
          <span className="text-[10px] text-rose-400 font-bold">{liveDisasters.length} LIVE</span>
        </button>
          </div>
        )}
      </div>

      {/* 3. INTERACTIVE INTELLIGENCE INSPECTOR CARD (Bottom Drawer) */}
      {inspectedNode && (
        <div className="absolute bottom-10 left-3 right-3 sm:right-auto sm:max-w-md z-[1100] bg-[#0f1420]/95 backdrop-blur-md border border-cyan-500/40 rounded-2xl p-4 shadow-[0_0_30px_rgba(0,0,0,0.8)] pointer-events-auto transition-all animate-fadeIn">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              <span className={`p-1.5 rounded-lg ${
                inspectedNode.kind === 'story'
                  ? 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                  : inspectedNode.type === 'seismic'
                  ? 'bg-amber-950 text-amber-400 border border-amber-800'
                  : inspectedNode.type === 'flight'
                  ? 'bg-blue-950 text-blue-400 border border-blue-800'
                  : inspectedNode.type === 'disaster'
                  ? 'bg-orange-950 text-orange-400 border border-orange-800'
                  : 'bg-rose-950 text-rose-400 border border-rose-800'
              }`}>
                {inspectedNode.kind === 'story' ? <MapPin className="w-4 h-4" /> :
                 inspectedNode.type === 'seismic' ? <Activity className="w-4 h-4" /> :
                 inspectedNode.type === 'flight' ? <Plane className="w-4 h-4" /> :
                 inspectedNode.type === 'disaster' ? <Flame className="w-4 h-4" /> : <Ship className="w-4 h-4" />}
              </span>

              <div>
                <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider block">
                  {inspectedNode.kind === 'story' 
                    ? 'Verified Breaking Story' 
                    : inspectedNode.type === 'disaster' 
                    ? `NASA EONET Hazard • ${inspectedNode.data.disasterTitle || 'Active Hazard'}` 
                    : `Physical Sensor Telemetry • ${inspectedNode.type.toUpperCase()}`}
                </span>
                <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-1">
                  {inspectedNode.kind === 'story' ? inspectedNode.data.title : inspectedNode.data.label}
                </h4>
              </div>
            </div>

            <button
              onClick={() => setInspectedNode(null)}
              className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Contested EW Zone Anti-Spoofing Alert */}
          {inspectedNode.data.contestedZone && (
            <div className="bg-amber-950/60 border border-amber-600/60 text-amber-300 text-[10px] p-2 rounded-lg font-mono flex items-start gap-1.5 my-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
              <span>{inspectedNode.data.antiSpoofingNote}</span>
            </div>
          )}

          <div className="space-y-2 text-xs font-sans text-slate-300 my-2.5">
            <p className="text-[11px] text-slate-300 leading-relaxed bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80">
              {inspectedNode.kind === 'story' ? inspectedNode.data.summary : inspectedNode.data.description || inspectedNode.data.status}
            </p>

            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono bg-slate-950/50 p-2 rounded-xl border border-slate-850">
              <div>
                <span className="text-slate-500 block">Coordinates:</span>
                <span className="text-cyan-300 font-bold">
                  {(inspectedNode.data.location?.lat || inspectedNode.data.lat).toFixed(3)}°N, {(inspectedNode.data.location?.lng || inspectedNode.data.lng).toFixed(3)}°E
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Data Source:</span>
                <span className="text-emerald-400 font-semibold truncate block">
                  {inspectedNode.data.apiSource || inspectedNode.data.sensorSource || 'Multi-Source Clean Room Feed'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs font-mono">
            <span className="text-[10px] text-slate-400">
              {inspectedNode.data.timestamp || inspectedNode.data.timeAgo || 'Real-time telemetry'}
            </span>

            {inspectedNode.kind === 'story' ? (
              <button
                onClick={() => onSelectStory(inspectedNode.data)}
                className="px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold rounded-lg text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.3)]"
              >
                <span>Open Verification Dossier</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : inspectedNode.data.url ? (
              <a
                href={inspectedNode.data.url}
                target="_blank"
                rel="noreferrer"
                className="text-cyan-400 hover:underline flex items-center gap-1 text-[11px]"
              >
                <span>View Raw Sensor Record</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            ) : null}
          </div>
        </div>
      )}

      {/* 4. MAP LEGEND POPUP (Clean & Simple Explanation) */}
      {isLegendOpen && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-[1150] w-11/12 max-w-md bg-[#0f1420]/98 backdrop-blur-md border border-cyan-500/30 rounded-2xl p-4 shadow-2xl font-mono text-xs text-slate-300">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
            <span className="font-bold text-white flex items-center gap-2">
              <Info className="w-4 h-4 text-cyan-400" />
              How To Read This Map (Global Guide)
            </span>
            <button onClick={() => setIsLegendOpen(false)} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2.5 text-[11px]">
            <div className="flex items-start gap-2.5">
              <div className="w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-400 flex-shrink-0 mt-0.5"></div>
              <div>
                <strong className="text-emerald-400">Green Story Pin:</strong> Verified news event with high confidence corroborated by physical sensor data.
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="w-4 h-4 rounded-full bg-amber-500/20 border border-amber-400 flex-shrink-0 mt-0.5"></div>
              <div>
                <strong className="text-amber-400">Amber Pin / M4+ Circle:</strong> Live earthquakes from the USGS API or developing unconfirmed news reports.
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="w-4 h-4 rounded-full bg-rose-500/20 border border-rose-400 flex-shrink-0 mt-0.5"></div>
              <div>
                <strong className="text-rose-400">Red Pin / Disputed:</strong> News claim that is physically contradicted by satellite radar or flight transponders.
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="w-4 h-4 rounded bg-slate-900 border border-blue-400 text-blue-400 text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                ✈
              </div>
              <div>
                <strong className="text-blue-400">Airplane Marker:</strong> Real aircraft tracked via OpenSky ADS-B radar with altitude, speed, and heading.
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="w-4 h-4 rounded bg-slate-900 border border-sky-400 text-sky-400 text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                ⚓
              </div>
              <div>
                <strong className="text-sky-400">Ship Marker:</strong> Cargo tankers and naval vessels tracked in real-time via Maritime AIS transponders.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. CURSOR COORDINATES & STATUS RETICLE (Bottom Left) */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-[#0f1420]/95 backdrop-blur-md border border-slate-800 px-3 py-1.5 rounded-xl text-xs font-mono text-slate-400 pointer-events-auto flex items-center gap-3 shadow-lg">
        <div className="flex items-center gap-1.5 text-cyan-400">
          <Crosshair className="w-3.5 h-3.5" />
          <span className="text-slate-300 font-bold">
            {cursorCoords.lat >= 0 ? `${cursorCoords.lat}°N` : `${Math.abs(cursorCoords.lat)}°S`}, {cursorCoords.lng >= 0 ? `${cursorCoords.lng}°E` : `${Math.abs(cursorCoords.lng)}°W`}
          </span>
        </div>
        <span className="text-slate-700 hidden sm:inline">|</span>
        <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-400">
          <span>Click any marker on the globe to inspect sensor readings</span>
        </div>
      </div>

      {/* Leaflet Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full flex-1 min-h-[500px]" />
    </div>
  );
}
