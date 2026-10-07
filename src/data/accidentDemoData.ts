// UrbanSafe AI - Centralized Structured Demo Dataset
// DEMO DATA — NOT LIVE ACCIDENT DATA
// TypeScript definition and exports

export interface AccidentDemoLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  trafficDensity: 'Low' | 'Medium' | 'High';
  weather: 'Clear' | 'Cloudy' | 'Rain' | 'Heavy Rain' | 'Fog';
  rainfall: number;
  visibility: number;
  roadCondition: 'Good' | 'Moderate' | 'Poor';
  roadType: 'Expressway' | 'Arterial' | 'Transit Corridor' | 'Flyover' | 'Urban Grid' | 'Intersection';
  lighting: 'Good' | 'Poor';
  timeCategory: 'Day' | 'Evening' | 'Night';
  historicalAccidents: number;
  historicalRisk: number;
  hotspotStatus: boolean;
  clusterId: string;
  kmeansClusterId?: string;
  density?: string;
  riskFactors: Array<{ factor: string; impact: string }>;
  primaryCause?: string;
  preventionRecommendation?: string;
}

export { ACCIDENT_DEMO_LOCATIONS, DEMO_CLUSTERS_DBSCAN, DEMO_CLUSTERS_KMEANS, DEMO_PREDICTION_SCENARIOS } from './accidentDemoData.js';
