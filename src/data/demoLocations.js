// UrbanSafe AI - Demo Locations Adapter (Single Source of Truth)
import { ACCIDENT_DEMO_LOCATIONS } from './accidentDemoData.js';
import { calculateDemoRiskScore } from './demoPredictions.js';

export const DEMO_LOCATIONS = ACCIDENT_DEMO_LOCATIONS.map(loc => {
  const calculated = calculateDemoRiskScore({
    trafficDensity: loc.trafficDensity,
    weather: loc.weather,
    rainfall: loc.rainfall,
    visibility: loc.visibility,
    roadCondition: loc.roadCondition,
    lighting: loc.lighting,
    timeCategory: loc.timeCategory,
    historicalAccidents: loc.historicalAccidents
  });

  return {
    ...loc,
    lat: loc.latitude,
    lng: loc.longitude,
    riskScore: calculated.riskScore,
    riskLevel: calculated.riskLevel,
    accidentCount: loc.historicalAccidents,
    hotspot: loc.hotspotStatus,
    speedLimit: loc.roadType === 'Expressway' ? 80 : loc.roadType === 'Flyover' ? 60 : 40,
    avgSpeed: loc.trafficDensity === 'High' ? 22 : loc.trafficDensity === 'Medium' ? 38 : 55,
    surfaceCondition: loc.roadCondition === 'Poor' ? 'Degraded Asphalt, Wet Patches' : loc.roadCondition === 'Moderate' ? 'Moderate Friction' : 'Good Smooth Asphalt',
    predictedAccidents24h: calculated.predictedIncidents24h,
    recentIncidents: [
      { date: "2026-10-04 18:30", type: "Multi-vehicle rear-end", severity: "Major Injury", weather: loc.weather },
      { date: "2026-09-28 21:15", type: "Side-swipe collision", severity: "Property Damage", weather: "Cloudy" }
    ],
    advisory: loc.preventionRecommendation || "Maintain standard traffic surveillance cadence."
  };
});
