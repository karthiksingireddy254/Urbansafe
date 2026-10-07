// UrbanSafe AI - Alerts Adapter (Single Source of Truth)
import { ACCIDENT_DEMO_LOCATIONS } from './accidentDemoData.js';
import { calculateDemoRiskScore } from './demoPredictions.js';

export const INITIAL_DEMO_ALERTS = ACCIDENT_DEMO_LOCATIONS
  .filter(loc => loc.hotspotStatus || loc.historicalRisk >= 75)
  .slice(0, 6)
  .map((loc, index) => {
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
      id: `ALT-00${index + 1}`,
      locationId: loc.id,
      location: loc.name,
      type: loc.weather === 'Heavy Rain' || loc.weather === 'Rain'
        ? 'METEOROLOGICAL_COLLISION_RISK'
        : loc.trafficDensity === 'High'
        ? 'TRAFFIC_SHOCKWAVE_SPIKE'
        : 'CORRIDOR_SAFETY_SURGE',
      severity: calculated.riskLevel,
      riskScore: calculated.riskScore,
      reason: `${loc.trafficDensity} traffic density + ${loc.roadCondition.toLowerCase()} road condition + ${loc.weather.toLowerCase()} conditions`,
      timestamp: index === 0 ? "2 mins ago" : index === 1 ? "14 mins ago" : `${index * 15} mins ago`,
      status: "ACTIVE",
      suggestedAction: loc.preventionRecommendation || "Dispatch traffic police unit and activate variable speed message boards."
    };
  });
