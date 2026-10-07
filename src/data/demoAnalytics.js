// UrbanSafe AI - Analytics Adapter (Single Source of Truth)
import { ACCIDENT_DEMO_LOCATIONS } from './accidentDemoData.js';
import { calculateDemoRiskScore } from './demoPredictions.js';

// Calculate aggregated totals directly from demo dataset
const locationsWithRisk = ACCIDENT_DEMO_LOCATIONS.map(loc => ({
  ...loc,
  calculatedRisk: calculateDemoRiskScore({
    trafficDensity: loc.trafficDensity,
    weather: loc.weather,
    rainfall: loc.rainfall,
    visibility: loc.visibility,
    roadCondition: loc.roadCondition,
    lighting: loc.lighting,
    timeCategory: loc.timeCategory,
    historicalAccidents: loc.historicalAccidents
  })
}));

const totalCollisions = locationsWithRisk.reduce((sum, l) => sum + l.historicalAccidents, 0);

// Aggregations by Weather
const weatherBuckets = {};
locationsWithRisk.forEach(l => {
  const w = l.weather;
  weatherBuckets[w] = (weatherBuckets[w] || 0) + l.historicalAccidents;
});

const byWeather = Object.keys(weatherBuckets).map(w => ({
  weather: w,
  count: weatherBuckets[w],
  percentage: +((weatherBuckets[w] / totalCollisions) * 100).toFixed(1)
}));

// Aggregations by Road Condition
const roadBuckets = {};
locationsWithRisk.forEach(l => {
  const r = l.roadCondition;
  roadBuckets[r] = (roadBuckets[r] || 0) + l.historicalAccidents;
});

const byRoadCondition = Object.keys(roadBuckets).map(r => ({
  condition: `${r} Condition`,
  count: roadBuckets[r],
  rate: `${+((roadBuckets[r] / totalCollisions) * 100).toFixed(1)}%`
}));

// Aggregations by Traffic Density
const trafficBuckets = {};
locationsWithRisk.forEach(l => {
  const t = l.trafficDensity;
  trafficBuckets[t] = (trafficBuckets[t] || 0) + l.historicalAccidents;
});

const byTraffic = Object.keys(trafficBuckets).map(t => ({
  traffic: `${t} Density`,
  count: trafficBuckets[t],
  percentage: +((trafficBuckets[t] / totalCollisions) * 100).toFixed(1)
}));

// Aggregations by Risk Level
const highRiskCount = locationsWithRisk.filter(l => l.calculatedRisk.riskLevel === 'HIGH').length;
const medRiskCount = locationsWithRisk.filter(l => l.calculatedRisk.riskLevel === 'MEDIUM').length;
const lowRiskCount = locationsWithRisk.filter(l => l.calculatedRisk.riskLevel === 'LOW').length;

export const ANALYTICS_DATA = {
  totalAccidents: totalCollisions,
  byWeather,
  byRoadCondition,
  byTraffic,
  distribution: {
    highRiskPercent: +((highRiskCount / locationsWithRisk.length) * 100).toFixed(0),
    mediumRiskPercent: +((medRiskCount / locationsWithRisk.length) * 100).toFixed(0),
    lowRiskPercent: +((lowRiskCount / locationsWithRisk.length) * 100).toFixed(0),
    highCount: highRiskCount,
    medCount: medRiskCount,
    lowCount: lowRiskCount
  },
  byLocation: locationsWithRisk
    .map(l => ({ name: l.name, count: l.historicalAccidents, riskScore: l.calculatedRisk.riskScore, riskLevel: l.calculatedRisk.riskLevel }))
    .sort((a, b) => b.count - a.count),
  byHour: [
    { hour: "00:00", count: 28 },
    { hour: "02:00", count: 18 },
    { hour: "04:00", count: 12 },
    { hour: "06:00", count: 34 },
    { hour: "08:00", count: 88 },
    { hour: "10:00", count: 62 },
    { hour: "12:00", count: 54 },
    { hour: "14:00", count: 48 },
    { hour: "16:00", count: 72 },
    { hour: "18:00", count: 96 },
    { hour: "20:00", count: 82 },
    { hour: "22:00", count: 46 }
  ],
  byDay: [
    { day: "Monday", count: 210, risk: "High" },
    { day: "Tuesday", count: 185, risk: "Medium" },
    { day: "Wednesday", count: 195, risk: "Medium" },
    { day: "Thursday", count: 220, risk: "High" },
    { day: "Friday", count: 275, risk: "High" },
    { day: "Saturday", count: 230, risk: "High" },
    { day: "Sunday", count: 145, risk: "Medium" }
  ],
  timeSeries: {
    '7D': [
      { label: "Mon", riskIndex: 78, accidents: 14 },
      { label: "Tue", riskIndex: 65, accidents: 9 },
      { label: "Wed", riskIndex: 72, accidents: 11 },
      { label: "Thu", riskIndex: 82, accidents: 16 },
      { label: "Fri", riskIndex: 91, accidents: 22 },
      { label: "Sat", riskIndex: 84, accidents: 18 },
      { label: "Sun", riskIndex: 48, accidents: 6 }
    ],
    '30D': [
      { label: "W1", riskIndex: 74, accidents: 62 },
      { label: "W2", riskIndex: 81, accidents: 78 },
      { label: "W3", riskIndex: 69, accidents: 58 },
      { label: "W4", riskIndex: 86, accidents: 89 }
    ],
    '90D': [
      { label: "Month 1", riskIndex: 76, accidents: 280 },
      { label: "Month 2", riskIndex: 82, accidents: 310 },
      { label: "Month 3", riskIndex: 79, accidents: 295 }
    ],
    '1Y': [
      { label: "Q1", riskIndex: 72, accidents: 820 },
      { label: "Q2", riskIndex: 75, accidents: 870 },
      { label: "Q3", riskIndex: 89, accidents: 1040 },
      { label: "Q4", riskIndex: 68, accidents: 790 }
    ]
  }
};
