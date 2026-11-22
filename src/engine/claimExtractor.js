/**
 * VERITAS OSINT - Named Entity Recognition (NER) & Claim Extractor (Step 2)
 * Extracts 5W1H (Who, What, Where, When, Why/How) + Geospatial Resolution
 * Benchmark: Google Staff Engineering / Production Information Extraction System
 */

/**
 * Standard spatial gazetteer for geopolitical and tactical hotspot georeferencing
 */
const GAZETTEER = [
  {
    keywords: ['bab-el-mandeb', 'red sea', 'yemen', 'houthi', 'hodeidah', 'gulf of aden'],
    location: {
      name: 'Bab-el-Mandeb Strait / Red Sea',
      lat: 12.587,
      lng: 43.342,
      country: 'Yemen / Djibouti Waters',
      sector: 'Southern Red Sea Maritime Chokepoint',
      boundingBox: [12.0, 42.5, 13.5, 44.0],
      geohash: 'sf0w'
    },
    defaultCategory: 'Maritime & Defense'
  },
  {
    keywords: ['black sea', 'romania', 'constanta', 'crimea', 'odessa', 'sevastopol'],
    location: {
      name: 'Western Black Sea / Constanța FIR',
      lat: 44.180,
      lng: 30.120,
      country: 'International Airspace',
      sector: 'Black Sea Maritime & Flight Information Region',
      boundingBox: [43.5, 29.0, 45.0, 31.5],
      geohash: 'sxb9'
    },
    defaultCategory: 'Aviation & Conflict'
  },
  {
    keywords: ['taiwan', 'hualien', 'taipei', 'taiwan strait', 'formosa'],
    location: {
      name: 'Offshore Hualien County',
      lat: 24.015,
      lng: 121.840,
      country: 'Taiwan',
      sector: 'Western Pacific Subduction Zone',
      boundingBox: [23.5, 121.0, 24.8, 122.5],
      geohash: 'wsm2'
    },
    defaultCategory: 'Natural Disasters'
  },
  {
    keywords: ['baltic', 'gotland', 'sweden', 'bornholm', 'gulf of finland'],
    location: {
      name: 'Baltic Sea / Gotland Deep',
      lat: 57.340,
      lng: 18.980,
      country: 'Sweden',
      sector: 'Nordic Undersea Infrastructure Corridor',
      boundingBox: [56.5, 18.0, 58.0, 20.0],
      geohash: 'u6m7'
    },
    defaultCategory: 'Energy & Infrastructure'
  },
  {
    keywords: ['greece', 'peloponnese', 'athens', 'aegean', 'mediterranean'],
    location: {
      name: 'Peloponnese Peninsula',
      lat: 37.650,
      lng: 22.120,
      country: 'Greece',
      sector: 'Southern Mediterranean Forest Basin',
      boundingBox: [36.8, 21.3, 38.2, 23.0],
      geohash: 'sw8p'
    },
    defaultCategory: 'Natural Disasters'
  },
  {
    keywords: ['geneva', 'switzerland', 'alps', 'zurich', 'cointrin'],
    location: {
      name: 'Geneva Airspace',
      lat: 46.204,
      lng: 6.143,
      country: 'Switzerland',
      sector: 'Central European Alpine Flight Corridor',
      boundingBox: [45.8, 5.8, 46.5, 6.5],
      geohash: 'u0k9'
    },
    defaultCategory: 'Aviation & Conflict'
  },
  {
    keywords: ['hormuz', 'persian gulf', 'oman', 'bandar abbas', 'uae', 'fujairah'],
    location: {
      name: 'Strait of Hormuz',
      lat: 26.566,
      lng: 56.250,
      country: 'Oman / Iran Waters',
      sector: 'Persian Gulf Hydrocarbon Arterial Route',
      boundingBox: [25.8, 55.5, 27.2, 57.0],
      geohash: 'tk4y'
    },
    defaultCategory: 'Maritime & Defense'
  },
  {
    keywords: ['chile', 'antofagasta', 'santiago', 'atacama'],
    location: {
      name: 'Antofagasta Coastal Sector',
      lat: -23.650,
      lng: -70.400,
      country: 'Chile',
      sector: 'Nazca Plate Trench Boundary',
      boundingBox: [-24.5, -71.0, -22.5, -69.5],
      geohash: '6s5x'
    },
    defaultCategory: 'Natural Disasters'
  },
  {
    keywords: ['mumbai', 'arabian sea', 'nhava sheva', 'india', 'bgp'],
    location: {
      name: 'Mumbai / Arabian Sea Port Sector',
      lat: 18.938,
      lng: 72.835,
      country: 'India',
      sector: 'Western Indian Ocean Subsea & Maritime Gateway',
      boundingBox: [18.0, 71.5, 19.8, 73.5],
      geohash: 'te7u'
    },
    defaultCategory: 'Cyber & AI Security'
  }
];

/**
 * Resolves location entities from claim text or falls back to an international coordinate
 */
function resolveGeospatial(textLower, optionalRegion) {
  for (const entry of GAZETTEER) {
    if (entry.keywords.some(kw => textLower.includes(kw))) {
      return { location: entry.location, defaultCategory: entry.defaultCategory };
    }
  }

  // Handle optionalRegion text matches
  if (optionalRegion) {
    const regionLower = optionalRegion.toLowerCase();
    for (const entry of GAZETTEER) {
      if (entry.keywords.some(kw => regionLower.includes(kw))) {
        return { location: entry.location, defaultCategory: entry.defaultCategory };
      }
    }
  }

  return {
    location: {
      name: optionalRegion || 'International Waters / Airspace',
      lat: 25.0,
      lng: 45.0,
      country: 'International',
      sector: 'Global Coordinates Grid',
      boundingBox: [24.0, 44.0, 26.0, 46.0],
      geohash: 'the0'
    },
    defaultCategory: 'Geopolitical & Security'
  };
}

/**
 * Extracts key domain actors (WHO)
 */
function extractActors(textLower) {
  const who = [];

  if (textLower.includes('tanker') || textLower.includes('ship') || textLower.includes('vessel') || textLower.includes('cargo')) {
    who.push('Commercial Maritime Carrier', 'Coastal Maritime Patrol Authority');
  }
  if (textLower.includes('flight') || textLower.includes('aircraft') || textLower.includes('corridor') || textLower.includes('jet') || textLower.includes('squawk')) {
    who.push('Aviation Control Center', 'Regional FIR Air Traffic');
  }
  if (textLower.includes('quake') || textLower.includes('earthquake') || textLower.includes('tremor') || textLower.includes('seismic')) {
    who.push('USGS Seismological Network', 'National Disaster Management Bureau');
  }
  if (textLower.includes('fire') || textLower.includes('wildfire') || textLower.includes('thermal')) {
    who.push('NASA FIRMS Satellite Constellation', 'Civil Protection & Fire Brigade');
  }
  if (textLower.includes('pipeline') || textLower.includes('cable') || textLower.includes('infrastructure')) {
    who.push('Critical Undersea Infrastructure Operators', 'Maritime Coast Guard');
  }

  if (who.length === 0) {
    who.push('Regional Monitored Entities', 'Independent Reporting Channels');
  }

  return [...new Set(who)];
}

/**
 * Extracts tactical indicators & modality (WHY / HOW)
 */
function extractTacticalIndicators(textLower) {
  const indicators = [];
  if (textLower.includes('squawk 7700')) indicators.push('General Emergency Squawk 7700 Broadcast');
  if (textLower.includes('squawk 7600')) indicators.push('Radio Communications Failure Squawk 7600');
  if (textLower.includes('squawk 7500')) indicators.push('Unlawful Interference / Hijacking Squawk 7500');
  if (textLower.includes('spoofing') || textLower.includes('gps')) indicators.push('GNSS / GPS Signal Disruption Anomaly');
  if (textLower.includes('drone') || textLower.includes('uav')) indicators.push('Unmanned Aerial Vehicle Activity');
  if (textLower.includes('missile') || textLower.includes('strike')) indicators.push('Kinetic Anti-Ship / Surface Missile Trajectory');
  if (textLower.includes('diversion') || textLower.includes('divert')) indicators.push('Abrupt Trajectory Course Deviation');
  if (textLower.includes('m6.') || textLower.includes('m7.')) indicators.push('High-Energy Tectonic Wave Propagation');

  return indicators.length > 0 ? indicators : ['Routine Monitoring Parameters'];
}

/**
 * Computes deterministic urgency level
 */
function evaluateUrgency(textLower) {
  if (
    textLower.includes('missile') ||
    textLower.includes('attack') ||
    textLower.includes('m6.') ||
    textLower.includes('m7.') ||
    textLower.includes('emergency') ||
    textLower.includes('hijack')
  ) {
    return 'CRITICAL';
  }

  if (
    textLower.includes('squawk 7700') ||
    textLower.includes('diversion') ||
    textLower.includes('fire') ||
    textLower.includes('wildfire') ||
    textLower.includes('spoofing')
  ) {
    return 'HIGH';
  }

  if (textLower.includes('drill') || textLower.includes('routine') || textLower.includes('transit')) {
    return 'LOW';
  }

  return 'MEDIUM';
}

/**
 * Main 5W1H Entity Extraction entrypoint
 */
export function extractEntities(claimText, optionalRegion = null) {
  if (!claimText || typeof claimText !== 'string' || claimText.trim().length === 0) {
    throw new Error('Claim text must be a non-empty string');
  }

  const textLower = claimText.toLowerCase();
  const { location, defaultCategory } = resolveGeospatial(textLower, optionalRegion);
  const who = extractActors(textLower);
  const tacticalIndicators = extractTacticalIndicators(textLower);
  const urgency = evaluateUrgency(textLower);

  const now = new Date();
  const validUntil = new Date(now.getTime() + 6 * 60 * 60 * 1000); // 6 hour tactical validity window

  return {
    who,
    what: claimText.trim(),
    where: `${location.name} (${location.lat.toFixed(3)}° N, ${location.lng.toFixed(3)}° E)`,
    when: now.toISOString(),
    temporalValidity: {
      validFrom: now.toISOString(),
      validTo: validUntil.toISOString()
    },
    location,
    urgency,
    category: defaultCategory,
    tacticalIndicators
  };
}
