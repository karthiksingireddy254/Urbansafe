// UrbanSafe AI - Routing & Geolocation Service
// Manages GPS location, destination search, and road routing calculations using Leaflet/OSRM

import { ACCIDENT_DEMO_LOCATIONS } from '../data/accidentDemoData.js';

export const MAJOR_HYDERABAD_LANDMARKS = [
  { id: 'LM01', name: 'Rajiv Gandhi International Airport (Shamshabad)', latitude: 17.2403, longitude: 78.4294, category: 'Airport / Transit' },
  { id: 'LM02', name: 'Secunderabad Railway Junction', latitude: 17.4334, longitude: 78.5042, category: 'Railway Station' },
  { id: 'LM03', name: 'Charminar Heritage Plaza - Old City', latitude: 17.3616, longitude: 78.4747, category: 'Historic Center' },
  { id: 'LM04', name: 'Hitec City Cyber Towers - Madhapur', latitude: 17.4504, longitude: 78.3808, category: 'Tech District' },
  { id: 'LM05', name: 'Gachibowli Financial District Junction', latitude: 17.4239, longitude: 78.3498, category: 'Business Corridor' },
  { id: 'LM06', name: 'Banjara Hills Road No. 1 / Care Hospital', latitude: 17.4156, longitude: 78.4482, category: 'Commercial Arterial' },
  { id: 'LM07', name: 'Jubilee Hills Checkpost - Road No. 36', latitude: 17.4304, longitude: 78.4074, category: 'High-Density Junction' },
  { id: 'LM08', name: 'Kukatpally Y Junction - NH 65', latitude: 17.4932, longitude: 78.3995, category: 'National Highway' },
  { id: 'LM09', name: 'LB Nagar Ring Road Interchange', latitude: 17.3457, longitude: 78.5522, category: 'Expressway Hub' },
  { id: 'LM10', name: 'Mehdipatnam Bus Depot & PVNR Expressway', latitude: 17.3916, longitude: 78.4433, category: 'Transit Hub' },
  { id: 'LM11', name: 'Uppal Ring Road - Warangal Highway', latitude: 17.4018, longitude: 78.5602, category: 'Highway Arterial' },
  { id: 'LM12', name: 'Paradise Circle - MG Road Corridor', latitude: 17.4411, longitude: 78.4877, category: 'Metro Hub' }
];

export const routingService = {
  /**
   * Request user's current GPS position via browser Geolocation API
   */
  async getCurrentPosition() {
    return new Promise((resolve) => {
      if (typeof navigator === 'undefined' || !navigator.geolocation) {
        resolve({
          latitude: 17.4421,
          longitude: 78.3912,
          name: 'Current Location (Hitec City)',
          isFallback: true
        });
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            name: 'Current GPS Location',
            isFallback: false
          });
        },
        (err) => {
          console.warn('Geolocation denied or unavailable, using Hyderabad center default:', err.message);
          resolve({
            latitude: 17.4421,
            longitude: 78.3912,
            name: 'Current Location (Hitec City Hub)',
            isFallback: true
          });
        },
        { timeout: 4000, enableHighAccuracy: true }
      );
    });
  },

  /**
   * Search destinations across demo dataset and major landmarks
   */
  searchDestinations(query) {
    if (!query || typeof query !== 'string') return [];
    const q = query.trim().toLowerCase();

    const pool = [
      ...ACCIDENT_DEMO_LOCATIONS.map(l => ({
        id: l.id,
        name: l.name,
        latitude: l.latitude,
        longitude: l.longitude,
        category: `Risk Zone (${l.historicalRisk}/100)`,
        riskLevel: l.historicalRisk >= 70 ? 'HIGH' : l.historicalRisk >= 40 ? 'MEDIUM' : 'LOW',
        riskScore: l.historicalRisk
      })),
      ...MAJOR_HYDERABAD_LANDMARKS
    ];

    return pool.filter(item =>
      item.name.toLowerCase().includes(q) ||
      item.id.toLowerCase().includes(q)
    ).slice(0, 8);
  },

  /**
   * Predefined Journey Presets for quick demonstration
   */
  getJourneyPresets() {
    return [
      {
        id: 'PRESET_01',
        title: 'Hitec City → Airport (ORR Highway)',
        origin: { name: 'Hitec City Cyber Towers', latitude: 17.4504, longitude: 78.3808 },
        destination: { name: 'Rajiv Gandhi International Airport', latitude: 17.2403, longitude: 78.4294 },
        description: 'Transits through Gachibowli & Outer Ring Road South.'
      },
      {
        id: 'PRESET_02',
        title: 'Gachibowli → Secunderabad Junction',
        origin: { name: 'Gachibowli Junction', latitude: 17.4239, longitude: 78.3498 },
        destination: { name: 'Secunderabad Railway Station', latitude: 17.4334, longitude: 78.5042 },
        description: 'Crosses Banjara Hills, Panjagutta, and Begumpet corridors.'
      },
      {
        id: 'PRESET_03',
        title: 'Madhapur → Charminar Heritage',
        origin: { name: 'Madhapur Metro Corridor', latitude: 17.4485, longitude: 78.3908 },
        destination: { name: 'Charminar Old City', latitude: 17.3616, longitude: 78.4747 },
        description: 'Passes Mehdipatnam and Musi Riverfront high-risk zones.'
      },
      {
        id: 'PRESET_04',
        title: 'Kukatpally NH 65 → LB Nagar Ring Road',
        origin: { name: 'Kukatpally Y Junction', latitude: 17.4932, longitude: 78.3995 },
        destination: { name: 'LB Nagar Interchange', latitude: 17.3457, longitude: 78.5522 },
        description: 'Long diagonal cross-city transit covering multiple arterial bottlenecks.'
      }
    ];
  },

  /**
   * Calculate Driving Route between Origin and Destination
   */
  async calculateRoute(origin, destination) {
    const startLat = Number(origin.latitude);
    const startLng = Number(origin.longitude);
    const endLat = Number(destination.latitude);
    const endLng = Number(destination.longitude);

    // Attempt OSRM Public Routing API with short timeout
    try {
      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson&steps=true`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const response = await fetch(osrmUrl, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (response.ok) {
        const json = await response.json();
        if (json.code === 'Ok' && json.routes && json.routes.length > 0) {
          const route = json.routes[0];
          const rawCoords = route.geometry.coordinates; // [lng, lat]
          const latLngs = rawCoords.map(([lng, lat]) => [lat, lng]);

          const distanceKm = +(route.distance / 1000).toFixed(1);
          const durationMins = Math.round(route.duration / 60);

          const steps = (route.legs && route.legs[0]?.steps)
            ? route.legs[0].steps.map(s => ({
                instruction: s.maneuver?.type === 'depart' ? 'Depart on route' : (s.name ? `Turn onto ${s.name}` : s.maneuver?.type || 'Continue'),
                distance: `${Math.round(s.distance)} m`,
                location: [s.maneuver.location[1], s.maneuver.location[0]]
              }))
            : [];

          return {
            distanceKm,
            durationMinutes: durationMins,
            coordinates: latLngs,
            steps: steps.slice(0, 10),
            provider: 'OSRM OpenStreetMap Engine'
          };
        }
      }
    } catch (err) {
      console.warn('OSRM online routing fallback triggered:', err.message);
    }

    // Deterministic Multi-Waypoint Road Path Interpolation Fallback
    return this.generateDeterministicPath(startLat, startLng, endLat, endLng);
  },

  /**
   * Deterministic Grid Route Interpolation
   */
  generateDeterministicPath(lat1, lng1, lat2, lng2) {
    const waypoints = [];
    const stepsCount = 24;

    // Great circle / straight distance approximation
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const straightKm = +(6371 * c).toFixed(1);
    const distanceKm = +(straightKm * 1.28).toFixed(1); // Road winding factor
    const durationMinutes = Math.max(8, Math.round((distanceKm / 32) * 60)); // Avg 32 km/h urban speed

    // Create realistic road curvature points
    for (let i = 0; i <= stepsCount; i++) {
      const t = i / stepsCount;
      const baseLat = lat1 + (lat2 - lat1) * t;
      const baseLng = lng1 + (lng2 - lng1) * t;

      // Realistic sine lateral displacement simulating arterial corridor grid
      const lateralDeviation = Math.sin(t * Math.PI * 2) * 0.0035;
      const lat = baseLat + lateralDeviation;
      const lng = baseLng + lateralDeviation * 0.5;
      waypoints.push([lat, lng]);
    }

    return {
      distanceKm,
      durationMinutes,
      coordinates: waypoints,
      steps: [
        { instruction: 'Head toward main urban arterial', distance: '500 m' },
        { instruction: 'Merge onto primary safety corridor', distance: `${(distanceKm * 0.6).toFixed(1)} km` },
        { instruction: 'Approach destination approach ramp', distance: '800 m' },
        { instruction: 'Arrive at destination', distance: '100 m' }
      ],
      provider: 'UrbanSafe Geometric Road Grid Fallback'
    };
  }
};
