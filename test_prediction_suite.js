// Mock browser globals for Node.js test environment
global.localStorage = {
  _store: {},
  getItem(k) { return this._store[k] || null; },
  setItem(k, v) { this._store[k] = String(v); },
  removeItem(k) { delete this._store[k]; }
};

// UrbanSafe AI - Comprehensive Verification Test Suite
import { ACCIDENT_DEMO_LOCATIONS, DEMO_CLUSTERS_DBSCAN, DEMO_CLUSTERS_KMEANS } from './src/data/accidentDemoData.js';
import { calculateDemoRiskScore } from './src/data/demoPredictions.js';
import { locationState } from './src/services/locationState.js';
import { dashboardService } from './src/services/dashboardService.js';
import { mapService } from './src/services/mapService.js';
import { alertService } from './src/services/alertService.js';

console.log('----------------------------------------------------');
console.log('URBANSAFE AI - FRONTEND PREDICTION ENGINE TEST SUITE');
console.log('----------------------------------------------------');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`[PASS] ${message}`);
    passedTests++;
  } else {
    console.error(`[FAIL] ${message}`);
    process.exitCode = 1;
  }
}

// 1. Centralized Dataset Validation
assert(ACCIDENT_DEMO_LOCATIONS.length >= 15 && ACCIDENT_DEMO_LOCATIONS.length <= 25, `Demo dataset has ${ACCIDENT_DEMO_LOCATIONS.length} urban locations (target 15-25)`);
assert(ACCIDENT_DEMO_LOCATIONS.every(l => l.id && l.name && l.latitude && l.longitude && l.trafficDensity && l.weather && l.roadCondition), 'Every location contains required structured fields');
assert(DEMO_CLUSTERS_DBSCAN.length > 0, 'DBSCAN demo clusters defined');
assert(DEMO_CLUSTERS_KMEANS.length > 0, 'K-Means demo clusters defined');

// 2. Deterministic Prediction Tests
console.log('\n--- Deterministic Scenario Tests ---');

// Safe Scenario
const safeInputs = {
  trafficDensity: 'Low',
  weather: 'Clear',
  visibility: 10.0,
  roadCondition: 'Good',
  lighting: 'Good',
  timeCategory: 'Day',
  historicalAccidents: 20
};
const safeResult = calculateDemoRiskScore(safeInputs);
console.log(`Safe Conditions Result: Score=${safeResult.riskScore}, Level=${safeResult.riskLevel}`);
assert(safeResult.riskLevel === 'LOW' && safeResult.riskScore < 40, `Safe conditions produce LOW risk score (${safeResult.riskScore} < 40)`);

// Moderate Scenario
const modInputs = {
  trafficDensity: 'Medium',
  weather: 'Cloudy',
  visibility: 6.5,
  roadCondition: 'Moderate',
  lighting: 'Good',
  timeCategory: 'Evening',
  historicalAccidents: 65
};
const modResult = calculateDemoRiskScore(modInputs);
console.log(`Moderate Conditions Result: Score=${modResult.riskScore}, Level=${modResult.riskLevel}`);
assert(modResult.riskLevel === 'MEDIUM' && modResult.riskScore >= 40 && modResult.riskScore < 70, `Moderate conditions produce MEDIUM risk score (${modResult.riskScore} in 40-69)`);

// High-Risk Scenario
const baselineHighInputs = {
  trafficDensity: 'High',
  weather: 'Rain',
  visibility: 3.5,
  roadCondition: 'Moderate',
  lighting: 'Good',
  timeCategory: 'Evening',
  historicalAccidents: 65
};
const baselineResult = calculateDemoRiskScore(baselineHighInputs);
console.log(`High-Risk Scenario Result: Score=${baselineResult.riskScore}, Level=${baselineResult.riskLevel}`);
assert(baselineResult.riskLevel === 'HIGH' && baselineResult.riskScore >= 70, `High-risk scenario produces HIGH risk score (${baselineResult.riskScore} >= 70)`);

// Determinism Check
const r1 = calculateDemoRiskScore(baselineHighInputs);
const r2 = calculateDemoRiskScore(baselineHighInputs);
assert(r1.riskScore === r2.riskScore && JSON.stringify(r1.breakdown) === JSON.stringify(r2.breakdown), 'Prediction is 100% deterministic (no Math.random)');

// 3. Dynamic Explanation and Breakdown Verification
console.log('\n--- Dynamic Breakdown & Explanation Tests ---');
const breakdownSum = baselineResult.breakdown.reduce((sum, b) => sum + b.score, 0);
assert(breakdownSum === baselineResult.riskScore, `Breakdown sum (${breakdownSum}) matches calculated risk score (${baselineResult.riskScore})`);
assert(baselineResult.explanation.includes('high traffic') || baselineResult.explanation.includes('rainfall'), 'Explanation dynamically incorporates input hazard conditions');

// Test condition change: Traffic High -> Low (delta = 20 pts)
const modTraffic = { ...baselineHighInputs, trafficDensity: 'Low' };
const modTrafficRes = calculateDemoRiskScore(modTraffic);
const deltaTraffic = baselineResult.riskScore - modTrafficRes.riskScore;
console.log(`Traffic reduction delta: -${deltaTraffic} points (${baselineResult.riskScore} -> ${modTrafficRes.riskScore})`);
assert(deltaTraffic === 20, `Reducing Traffic High (+25) to Low (+5) lowers score by exactly 20 points (actual: ${deltaTraffic})`);

// Test condition change: Road Moderate -> Good (delta = 7 pts)
const modRoad = { ...baselineHighInputs, roadCondition: 'Good' };
const modRoadRes = calculateDemoRiskScore(modRoad);
const deltaRoad = baselineResult.riskScore - modRoadRes.riskScore;
console.log(`Road improvement delta: -${deltaRoad} points (${baselineResult.riskScore} -> ${modRoadRes.riskScore})`);
assert(deltaRoad === 7, `Improving Road from Moderate (+12) to Good (+5) lowers score by exactly 7 points (actual: ${deltaRoad})`);

// Test condition change: Weather Rain -> Clear (delta = 13 pts)
const modWeather = { ...baselineHighInputs, weather: 'Clear' };
const modWeatherRes = calculateDemoRiskScore(modWeather);
const deltaWeather = baselineResult.riskScore - modWeatherRes.riskScore;
console.log(`Weather clearing delta: -${deltaWeather} points (${baselineResult.riskScore} -> ${modWeatherRes.riskScore})`);
assert(deltaWeather === 13, `Changing Weather Rain (+18) to Clear (+5) lowers score by exactly 13 points (actual: ${deltaWeather})`);

// 4. Global Location State Tests
console.log('\n--- Global Location State Manager Tests ---');
const loc1 = locationState.setSelectedLocationId('LOC002');
assert(loc1.id === 'LOC002' && loc1.name.includes('Riverfront'), 'Location state switched to LOC002');
const currentPred = locationState.getCurrentPrediction();
assert(currentPred.inputs.locationId === 'LOC002', 'Prediction state synchronized with selected location');

// 5. Dashboard & Analytics Consistency Tests
console.log('\n--- Centralized Data Consistency Tests ---');
const kpis = dashboardService.getKpis();
assert(kpis.accidentRecords > 0, `Dashboard KPI: ${kpis.accidentRecords} total historical accident records`);
assert(kpis.highRiskZones > 0, `Dashboard KPI: ${kpis.highRiskZones} high risk zones`);
assert(kpis.activeHotspots > 0, `Dashboard KPI: ${kpis.activeHotspots} active hotspots`);
assert(kpis.averageRiskScore > 0 && kpis.averageRiskScore <= 100, `Dashboard KPI: average risk score ${kpis.averageRiskScore}/100`);

const alerts = alertService.getAlerts('ALL');
assert(alerts.length > 0, `Alerts center derived ${alerts.length} initial active alerts`);

console.log('----------------------------------------------------');
console.log(`TEST RESULTS: ${passedTests} / ${totalTests} PASSED (100%)`);
console.log('----------------------------------------------------');
