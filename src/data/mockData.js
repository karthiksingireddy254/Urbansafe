// Demo Data & Simulation Assets for UrbanSafe AI

export const DEMO_STATS = {
  accidentRecords: 12486,
  riskHotspots: 16,
  highRiskZones: 38,
  activeSensors: 412,
  safetyScore: 84.7,
  predictionAccuracy: 93.4
};

export const DEMO_HOTSPOTS = [
  { id: 'hs-1', name: 'Downtown Central Expressway', lat: 37.7749, lng: -122.4194, severity: 'high', riskScore: 92, predictedAccidents: 14 },
  { id: 'hs-2', name: 'Riverfront Boulevard & 4th Ave', lat: 37.7833, lng: -122.4167, severity: 'high', riskScore: 88, predictedAccidents: 11 },
  { id: 'hs-3', name: 'Westside Transit Junction', lat: 37.7690, lng: -122.4467, severity: 'high', riskScore: 85, predictedAccidents: 9 },
  { id: 'hs-4', name: 'Metro Harbor Causeway', lat: 37.7955, lng: -122.3937, severity: 'med', riskScore: 68, predictedAccidents: 6 },
  { id: 'hs-5', name: 'North Tech Corridor', lat: 37.7600, lng: -122.4200, severity: 'med', riskScore: 64, predictedAccidents: 5 },
  { id: 'hs-6', name: 'Midtown Commercial Ring', lat: 37.7850, lng: -122.4350, severity: 'med', riskScore: 59, predictedAccidents: 4 },
  { id: 'hs-7', name: 'Civic Center Plaza Bypass', lat: 37.7790, lng: -122.4180, severity: 'low', riskScore: 32, predictedAccidents: 1 },
  { id: 'hs-8', name: 'Outer Sunset Parkway', lat: 37.7550, lng: -122.4800, severity: 'low', riskScore: 24, predictedAccidents: 1 },
  { id: 'hs-9', name: 'South Silicon Gateway', lat: 37.7400, lng: -122.4050, severity: 'low', riskScore: 19, predictedAccidents: 0 }
];

export const DEMO_USERS = [
  {
    name: 'Dr. Sarah Lin',
    email: 'demo@urbansafe.ai',
    password: 'demo123',
    role: 'Analyst'
  },
  {
    name: 'Marcus Vance',
    email: 'viewer@urbansafe.ai',
    password: 'demo123',
    role: 'Viewer'
  }
];

export const ROUTE_METADATA = {
  '/dashboard': { title: 'Command Center Overview', description: 'Real-time citywide risk monitoring and alert telemetry.' },
  '/prediction': { title: 'Accident Risk Prediction Engine', description: 'Neural network forecast models for next 6, 12 and 24 hours.' },
  '/map': { title: 'Interactive Urban Risk Map', description: 'Multi-layer GIS map with live traffic and hazard overlays.' },
  '/hotspots': { title: 'High-Risk Hotspot Analysis', description: 'Identified clusters with recurring collision probabilities.' },
  '/analytics': { title: 'Accident Trends & Spatial Analytics', description: 'Longitudinal safety records and environmental factor correlation.' },
  '/explainable-ai': { title: 'Explainable AI & SHAP Reasoning', description: 'Feature attribution and driver factor explanations for risk scores.' },
  '/prevention': { title: 'Preventative Interventions & Dispatch', description: 'Automated patrol dispatch and dynamic speed ceiling recommendations.' },
  '/models': { title: 'AI Model Performance & Drift', description: 'XGBoost, Random Forest, and Graph Neural Net inference metrics.' },
  '/data': { title: 'Urban Telemetry & Data Sources', description: 'IoT loop detectors, weather radar, and historical collision logs.' },
  '/alerts': { title: 'Emergency Alerts & Notifications', description: 'Automated dispatch triggers and real-time hazard broadcasts.' },
  '/settings': { title: 'System & Security Settings', description: 'API keys, sensor ingestion intervals, and credential policies.' }
};
