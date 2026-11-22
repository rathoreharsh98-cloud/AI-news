export const INITIAL_STORIES = [
  {
    id: 'story-001',
    title: 'Cargo Tanker "Stellar Tide" Diverts Course in Bab-el-Mandeb After Drone Sighting',
    category: 'Maritime & Defense',
    urgency: 'CRITICAL',
    timestamp: '18 minutes ago',
    utcTimestamp: '2026-11-21T21:42:00Z',
    location: {
      name: 'Bab-el-Mandeb Strait / Red Sea',
      lat: 12.587,
      lng: 43.342,
      country: 'Yemen / Djibouti Waters'
    },
    summary: 'Commercial crude carrier Stellar Tide made an abrupt 90-degree evasive turn after crew reported an unmanned aerial vehicle circling at 2,000 feet. Vessel AIS confirms speed reduction from 14.8 to 3.2 knots.',
    biasDistribution: {
      left: 32,
      center: 48,
      right: 20
    },
    blindspots: 'High Middle East & European Maritime press interest; underreported on North American domestic news cable.',
    corroborationScore: 94,
    status: 'CORROBORATED',
    entities: {
      who: ['Stellar Tide (IMO 9482110)', 'UK Maritime Trade Operations (UKMTO)', 'US 5th Fleet Patrol'],
      what: 'Evasive maritime diversion following hostile drone reconnaissance',
      where: 'Bab-el-Mandeb Strait (12.587° N, 43.342° E)',
      when: '2026-11-21 21:15 UTC'
    },
    parallelVerification: {
      mainstreamWire: [
        {
          source: 'Reuters Maritime Dispatch',
          bias: 'Center',
          reliability: 98,
          verdict: 'Corroborates',
          quote: 'UKMTO reports incident 48nm southwest of Mokha; master reported near-miss splash.',
          link: 'https://reuters.com'
        },
        {
          source: 'Associated Press (AP)',
          bias: 'Center',
          reliability: 97,
          verdict: 'Corroborates',
          quote: 'Shipping authority confirms commercial tanker steered into international transit corridor safety zone.',
          link: 'https://apnews.com'
        },
        {
          source: 'Al Jazeera English',
          bias: 'Left-Center',
          reliability: 88,
          verdict: 'Corroborates',
          quote: 'Local regional sources claim visual confirmation of defensive electronic countermeasure flares.',
          link: 'https://aljazeera.com'
        }
      ],
      socialPulse: [
        {
          source: 'Reddit r/OSINT & r/Maritime',
          authorType: 'Community Intelligence (PII Scrubbed)',
          piiScrubbed: true,
          signalStrength: 'High',
          time: '24m ago',
          content: 'AIS squawk 7700 equivalent broadcast on VHF Ch 16 picked up by coastal SDR receiver in Djibouti.'
        },
        {
          source: 'Eyewitness Geolocation Metadata',
          authorType: 'Merchant Marine Crew (Faces/Handles Masked)',
          piiScrubbed: true,
          signalStrength: 'Medium',
          time: '15m ago',
          content: 'Night-vision short clip showing illuminated flare trajectory; EXIF coordinates verify within 1.8km of tanker waypoint.'
        }
      ],
      osintTelemetry: [
        {
          system: 'Maritime AIS (Automatic Identification System)',
          status: 'MATCHED',
          icon: 'Ship',
          details: 'MMSI 636019283 logged sudden yaw rate change (-42 deg/min) at 21:12 UTC. Current speed 3.2 knots.'
        },
        {
          system: 'OpenSky ADS-B Radar Network',
          status: 'MATCHED',
          icon: 'Plane',
          details: 'US Navy Boeing P-8A Poseidon (Hex: AE6812) detected loitering at 24,000 ft 60km SE of incident zone.'
        },
        {
          system: 'Sentinel-2 & VIIRS Thermal Telemetry',
          status: 'PENDING NEXT ORBIT',
          icon: 'Satellite',
          details: 'Next thermal satellite pass scheduled at 04:15 UTC. Cloud cover over strait currently 12%.'
        }
      ]
    },
    legalSafeguards: {
      provenanceStatement: 'Corroborated: Claim independently verified by 3 international maritime registries, live AIS telemetry data, and aerial ADS-B patrol logs. No absolute editorial truth claim asserted.',
      piiScrubbed: true,
      safeHarbourCompliant: true,
      legalSection: 'Section 79 IT Act & BNS Section 356 Protected Verification Analysis'
    }
  },
  {
    id: 'story-002',
    title: 'Disputed Claim: "Complete Commercial Airspace Shutdown" Declared Over Black Sea',
    category: 'Aviation & Conflict',
    urgency: 'HIGH',
    timestamp: '42 minutes ago',
    utcTimestamp: '2026-11-21T21:18:00Z',
    location: {
      name: 'Black Sea / Constanța FIR',
      lat: 44.180,
      lng: 30.120,
      country: 'International Airspace'
    },
    summary: 'Viral social media accounts claim that Eurocontrol enacted an emergency total ban on all civilian aviation across the Western Black Sea following an unidentified missile launch rumor.',
    biasDistribution: {
      left: 15,
      center: 35,
      right: 50
    },
    blindspots: 'Heavy social media echo-chamber amplification; 0 mainstream wire confirmation.',
    corroborationScore: 18,
    status: 'DISPUTED',
    entities: {
      who: ['Eurocontrol', 'Viral OSINT X/Telegram Channels', 'Civilian Airlines'],
      what: 'Alleged emergency commercial airspace closure',
      where: 'Western Black Sea Romanian & Bulgarian Flight Information Regions',
      when: '2026-11-21 20:45 UTC'
    },
    parallelVerification: {
      mainstreamWire: [
        {
          source: 'Reuters Aviation Desk',
          bias: 'Center',
          reliability: 98,
          verdict: 'Contradicts',
          quote: 'Eurocontrol and Romanian Civil Aviation Authority confirm all scheduled air corridors remain open under normal safety procedures.',
          link: 'https://reuters.com'
        },
        {
          source: 'Deutsche Welle (DW)',
          bias: 'Center-Left',
          reliability: 92,
          verdict: 'Contradicts',
          quote: 'Romanian Ministry of Defense clarifies military exercise was pre-notified under standard NOTAM issued 3 days prior.',
          link: 'https://dw.com'
        }
      ],
      socialPulse: [
        {
          source: 'Telegram OSINT Channels',
          authorType: 'Unverified Anonymous Aggregators',
          piiScrubbed: true,
          signalStrength: 'False Alarm',
          time: '45m ago',
          content: 'Sensationalized claims claiming "Empty skies over Black Sea" based on delayed radar feed screenshot.'
        }
      ],
      osintTelemetry: [
        {
          system: 'ADS-B Exchange / FlightRadar Telemetry',
          status: 'CONTRADICTED',
          icon: 'Plane',
          details: 'Direct telemetry confirms 14 civilian flights (Tarom, Turkish Airlines, Pegasus, Wizz) actively cruising at FL360-FL380 through Constanța FIR without disruption.'
        },
        {
          system: 'FAA / Eurocontrol Official NOTAM Database',
          status: 'CONTRADICTED',
          icon: 'FileText',
          details: 'Official NOTAM query returns only routine temporary restricted area (TRA-12) active up to 3,000m AGL for scheduled naval artillery drills. No civilian corridor shutdown.'
        }
      ]
    },
    legalSafeguards: {
      provenanceStatement: 'Contradicted: Public claim is directly contradicted by 14 real-time civilian aircraft ADS-B transponder logs and official Eurocontrol NOTAM filings. Categorized as Disputed telemetry anomaly.',
      piiScrubbed: true,
      safeHarbourCompliant: true,
      legalSection: 'Section 79 IT Act & BNS Section 356 Corroboration Statement'
    }
  },
  {
    id: 'story-003',
    title: 'M6.3 Offshore Earthquake Detected Near Hualien; High-Speed Rail Safety Protocols Engaged',
    category: 'Natural Disasters',
    urgency: 'CRITICAL',
    timestamp: '1 hour ago',
    utcTimestamp: '2026-11-21T20:55:00Z',
    location: {
      name: 'Offshore Hualien County',
      lat: 24.015,
      lng: 121.840,
      country: 'Taiwan'
    },
    summary: 'A magnitude 6.3 seismic rupture occurred at a depth of 16.4 km off Taiwan eastern coast. Shaking registered Intensity 4 in Taipei. Automatic sensor triggers halted high-speed rail lines for line track inspection.',
    biasDistribution: {
      left: 33,
      center: 34,
      right: 33
    },
    blindspots: 'Globally corroborated across all scientific and news wires with zero political bias variance.',
    corroborationScore: 99,
    status: 'CORROBORATED',
    entities: {
      who: ['US Geological Survey (USGS)', 'Taiwan Central Weather Administration (CWA)', 'Taiwan High Speed Rail'],
      what: 'M6.3 shallow offshore tectonic subduction quake',
      where: '22 km ESE of Hualien City (24.015° N, 121.840° E)',
      when: '2026-11-21 20:48 UTC'
    },
    parallelVerification: {
      mainstreamWire: [
        {
          source: 'Central News Agency (CNA Taiwan)',
          bias: 'Center',
          reliability: 96,
          verdict: 'Corroborates',
          quote: 'CWA issued nationwide P-wave smartphone alert 8.2 seconds prior to secondary shear wave arrival.',
          link: 'https://focustaiwan.tw'
        },
        {
          source: 'NHK World Japan',
          bias: 'Center',
          reliability: 97,
          verdict: 'Corroborates',
          quote: 'Japan Meteorological Agency (JMA) issued tsunami advisory check; concluded no Pacific basin tsunami threat.',
          link: 'https://nhk.or.jp'
        }
      ],
      socialPulse: [
        {
          source: 'Reddit r/taiwan Megathread',
          authorType: 'Eyewitness Residents (PII Scrubbed)',
          piiScrubbed: true,
          signalStrength: 'Extremely High',
          time: '58m ago',
          content: 'Widespread reports of sustained 30-second horizontal rolling in Nangang and Xinyi districts. No structural collapse.'
        }
      ],
      osintTelemetry: [
        {
          system: 'USGS Real-Time Seismic Stream',
          status: 'MATCHED',
          icon: 'Activity',
          details: 'Station TATO (Taipei) recorded peak ground acceleration 0.14g. Moment tensor solution indicates thrust faulting.'
        },
        {
          system: 'NOAA DART Tsunami Buoy Network',
          status: 'NORMAL',
          icon: 'Waves',
          details: 'Buoy 21418 recorded normal sea level oscillation (< 4 cm variance).'
        }
      ]
    },
    legalSafeguards: {
      provenanceStatement: 'Corroborated: Authenticated by 3 independent seismic sensor networks (USGS, CWA, JMA) and 450+ geolocated citizen seismometer pings.',
      piiScrubbed: true,
      safeHarbourCompliant: true,
      legalSection: 'Section 79 IT Act Scientific Dissemination'
    }
  },
  {
    id: 'story-004',
    title: 'Developing: Subsea Power Interconnector Telemetry Drop Between Gotland & Mainland Sweden',
    category: 'Energy & Infrastructure',
    urgency: 'MEDIUM',
    timestamp: '2 hours ago',
    utcTimestamp: '2026-11-21T19:40:00Z',
    location: {
      name: 'Baltic Sea / Gotland Deep',
      lat: 57.340,
      lng: 18.980,
      country: 'Sweden'
    },
    summary: 'Grid operator Svenska kraftnät registered an unexpected 350MW power transfer cutoff on the Baltic HVDC interconnector line. Acoustic hydrophone arrays alerted to anomalous pressure gradient.',
    biasDistribution: {
      left: 30,
      center: 55,
      right: 15
    },
    blindspots: 'Developing story; Swedish public media reporting heavily, international wire awaiting official inspection ship dispatch.',
    corroborationScore: 61,
    status: 'DEVELOPING',
    entities: {
      who: ['Svenska kraftnät', 'Swedish Coast Guard', 'Commercial Bulk Carrier "Nordic Tracer"'],
      what: 'Subsea high-voltage DC interconnector outage and anchor drag investigation',
      where: 'Baltic Sea subsea cable corridor (57.340° N, 18.980° E)',
      when: '2026-11-21 19:15 UTC'
    },
    parallelVerification: {
      mainstreamWire: [
        {
          source: 'SVT Nyheter (Sweden)',
          bias: 'Center-Left',
          reliability: 94,
          verdict: 'Corroborates Outage',
          quote: 'Grid officials confirm island switched to local reserve turbine generation. Investigation launched into physical damage.',
          link: 'https://svt.se'
        }
      ],
      socialPulse: [
        {
          source: 'Maritime & Energy Telegram',
          authorType: 'Energy Analysts (PII Scrubbed)',
          piiScrubbed: true,
          signalStrength: 'Medium',
          time: '1h 30m ago',
          content: 'AIS logs reveal a Panama-flagged bulk carrier was drifting at 1.8 knots with anchor gear deployed during gale force winds.'
        }
      ],
      osintTelemetry: [
        {
          system: 'Maritime AIS Vessel Track',
          status: 'INVESTIGATING',
          icon: 'Ship',
          details: 'Cargo vessel MMSI 352001923 track crossed within 200m of cable coordinates exactly at 19:12 UTC during anchor deployment.'
        },
        {
          system: 'Geological Acoustic Hydrophone Network',
          status: 'PARTIAL MATCH',
          icon: 'Radio',
          details: 'Low-frequency acoustic impulse detected by Uppsala University seafloor sensor at 19:14:02 UTC.'
        }
      ]
    },
    legalSafeguards: {
      provenanceStatement: 'Developing: Physical electrical outage corroborated by grid telemetry; attribution to vessel dragging anchor remains unverified pending Coast Guard patrol inspection.',
      piiScrubbed: true,
      safeHarbourCompliant: true,
      legalSection: 'Section 79 IT Act Provisional Status'
    }
  },
  {
    id: 'story-005',
    title: 'Extreme Wildfire Outbreak in Peloponnese Triggers Satellite Thermal Emergency Alerts',
    category: 'Natural Disasters',
    urgency: 'HIGH',
    timestamp: '3 hours ago',
    utcTimestamp: '2026-11-21T18:30:00Z',
    location: {
      name: 'Peloponnese Peninsula',
      lat: 37.650,
      lng: 22.120,
      country: 'Greece'
    },
    summary: 'High gale winds of 65 km/h ignited multiple scrubland brush fires spreading over 8,500 hectares. Satellite infrared instruments detected intense thermal radiation spikes prompting civil protection evacuation orders.',
    biasDistribution: {
      left: 35,
      center: 45,
      right: 20
    },
    blindspots: 'Widespread coverage across Mediterranean media.',
    corroborationScore: 96,
    status: 'CORROBORATED',
    entities: {
      who: ['Hellenic Fire Service', 'Copernicus Emergency Management Service', 'NASA FIRMS'],
      what: 'Rapidly spreading brush fire with residential evacuation perimeter',
      where: 'Arcadia, Peloponnese (37.650° N, 22.120° E)',
      when: '2026-11-21 17:45 UTC'
    },
    parallelVerification: {
      mainstreamWire: [
        {
          source: 'Kathimerini English',
          bias: 'Center-Right',
          reliability: 93,
          verdict: 'Corroborates',
          quote: 'Civil protection emergency sms 112 dispatched to 7 villages ordering evacuation towards Tripoli.',
          link: 'https://ekathimerini.com'
        },
        {
          source: 'Agence France-Presse (AFP)',
          bias: 'Center',
          reliability: 96,
          verdict: 'Corroborates',
          quote: 'Canadair water bombers deployed as winds fan fire line across 12-kilometer front.',
          link: 'https://afp.com'
        }
      ],
      socialPulse: [
        {
          source: 'Reddit r/greece & Local Eyewitnesses',
          authorType: 'Local Residents (PII Masked)',
          piiScrubbed: true,
          signalStrength: 'Very High',
          time: '2h ago',
          content: 'Dense smoke plumes visible from Nafplio coastline; air quality sensors in Tripoli exceed 280 AQI PM2.5.'
        }
      ],
      osintTelemetry: [
        {
          system: 'NASA FIRMS VIIRS & MODIS Thermal Anomaly',
          status: 'MATCHED',
          icon: 'Flame',
          details: 'Fire Radiative Power (FRP) exceeded 820 MW over 14 discrete 375m pixels centered around Mount Mainalo.'
        },
        {
          system: 'ADS-B Firefighting Aerial Assets Track',
          status: 'MATCHED',
          icon: 'Plane',
          details: 'Two Canadair CL-415 amphibious scooper aircraft (Callsign: CAN415) tracked conducting cyclic water drops from Argolic Gulf.'
        }
      ]
    },
    legalSafeguards: {
      provenanceStatement: 'Corroborated: Thermal heat flux verified by 2 orbital satellites (NASA Terra & NOAA-20) and ADS-B firefighting flight vectors.',
      piiScrubbed: true,
      safeHarbourCompliant: true,
      legalSection: 'Section 79 IT Act Disaster Telemetry Broadcast'
    }
  }
];

export const OSINT_TELEMETRY_FEEDS = [
  {
    id: 'tel-1',
    type: 'ADS-B Flight Radar',
    name: 'OpenSky Network Live Ingestion',
    status: 'ACTIVE',
    signalsProcessed: '142,890 /hr',
    latency: '820ms',
    coverage: 'Global Flight Corridors'
  },
  {
    id: 'tel-2',
    type: 'Maritime AIS Telemetry',
    name: 'Spire / MarineTraffic Global Transponders',
    status: 'ACTIVE',
    signalsProcessed: '89,400 /hr',
    latency: '1.2s',
    coverage: 'Chokepoints (Bab-el-Mandeb, Hormuz, Malacca, Dover)'
  },
  {
    id: 'tel-3',
    type: 'USGS Real-time Seismic',
    name: 'Global Seismographic Network (GSN)',
    status: 'ACTIVE',
    signalsProcessed: '3,200 stations',
    latency: '410ms',
    coverage: 'Global Tectonic Boundaries'
  },
  {
    id: 'tel-4',
    type: 'NASA FIRMS Satellite Thermal',
    name: 'VIIRS / MODIS 375m Near Real-Time',
    status: 'SYNCED',
    signalsProcessed: 'Orbital Passes',
    latency: '34 min delay',
    coverage: 'Earth Observation Constellations'
  },
  {
    id: 'tel-5',
    type: 'Social Pulse & PII Sanitizer',
    name: 'DPDP-2023 Compliant Reddit & Media Pipeline',
    status: 'ACTIVE',
    signalsProcessed: 'Official API Only',
    latency: '2.5s',
    coverage: 'Public Eyewitness Signals (Faces & Handles Masked)'
  }
];
