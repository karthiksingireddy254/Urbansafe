// UrbanSafe AI - GO Safe Journey Test Suite
import { routingService } from './src/services/routingService.js';
import { journeyRiskService } from './src/services/journeyRiskService.js';
import { supabaseService } from './src/services/supabaseClient.js';
import { ACCIDENT_DEMO_LOCATIONS } from './src/data/accidentDemoData.js';

console.log('----------------------------------------------------');
console.log('URBANSAFE AI - GO SAFE JOURNEY TEST SUITE');
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
  }
}

async function runTests() {
  // Test 1: Geolocation fallback & coordinates
  const currentPos = await routingService.getCurrentPosition();
  assert(currentPos && typeof currentPos.latitude === 'number' && typeof currentPos.longitude === 'number', 'Current position coordinates obtained');

  // Test 2: Destination search
  const searchResults = routingService.searchDestinations('Airport');
  assert(searchResults.length > 0 && searchResults.some(r => r.name.toLowerCase().includes('airport')), 'Destination search finds airport landmark');

  // Test 3: Journey Presets
  const presets = routingService.getJourneyPresets();
  assert(presets.length >= 3, `Journey presets available (${presets.length} presets)`);

  // Test 4: Route calculation (Hitec City to Airport)
  const origin = { name: 'Hitec City Cyber Towers', latitude: 17.4504, longitude: 78.3808 };
  const destination = { name: 'Rajiv Gandhi International Airport', latitude: 17.2403, longitude: 78.4294 };
  const route = await routingService.calculateRoute(origin, destination);

  assert(route.distanceKm > 10, `Calculated realistic route distance: ${route.distanceKm} km`);
  assert(route.durationMinutes > 15, `Calculated estimated travel time: ${route.durationMinutes} mins`);
  assert(route.coordinates.length >= 10, `Route polyline has ${route.coordinates.length} waypoints`);

  // Test 5: Distance calculations (Point to segment)
  const distSamePoint = journeyRiskService.getHaversineDistanceMeters(17.4504, 78.3808, 17.4504, 78.3808);
  assert(distSamePoint === 0, 'Haversine distance between identical points is 0 meters');

  const distToRoute = journeyRiskService.getMinDistanceToRouteMeters(17.4504, 78.3808, route.coordinates);
  assert(distToRoute < 50, `Distance from origin to route start is minimal: ${distToRoute.toFixed(1)} m`);

  // Test 6: Route Risk Analysis with 500m proximity threshold
  const analysis = await journeyRiskService.analyzeRoute(route.coordinates, 500);

  assert(analysis.corridorRiskZones.length > 0, `Detected ${analysis.corridorRiskZones.length} risk zones within 500m of the journey path`);
  assert(analysis.corridorRiskZones.length < ACCIDENT_DEMO_LOCATIONS.length, 'Faraway city hotspots outside 500m threshold were excluded correctly');
  assert(analysis.overallRouteRiskScore >= 0 && analysis.overallRouteRiskScore <= 100, `Calculated deterministic route risk score: ${analysis.overallRouteRiskScore}/100`);
  assert(['LOW', 'MEDIUM', 'HIGH'].includes(analysis.overallRiskLevel), `Overall route risk level classified: ${analysis.overallRiskLevel}`);

  // Test 7: Risk zones count consistency
  const sumCounts = analysis.highRiskCount + analysis.mediumRiskCount + analysis.lowRiskCount;
  assert(sumCounts === analysis.totalRiskZones, `Zone count breakdown (${analysis.highRiskCount}H + ${analysis.mediumRiskCount}M + ${analysis.lowRiskCount}L = ${sumCounts}) matches total (${analysis.totalRiskZones})`);

  // Test 8: Dynamic Recommendations Generation
  assert(analysis.recommendations.length > 0, `Generated ${analysis.recommendations.length} safety recommendations for route hazards`);
  const hasDuplicates = new Set(analysis.recommendations.map(r => r.id)).size !== analysis.recommendations.length;
  assert(!hasDuplicates, 'Safety recommendations are properly de-duplicated');

  // Test 9: Supabase Fallback Client
  const locationsFromDb = await supabaseService.getRiskLocations();
  assert(locationsFromDb.length === ACCIDENT_DEMO_LOCATIONS.length, 'Supabase client gracefully falls back to centralized demo locations');

  console.log('----------------------------------------------------');
  console.log(`TEST RESULTS: ${passedTests} / ${totalTests} PASSED (${Math.round(passedTests/totalTests * 100)}%)`);
  console.log('----------------------------------------------------');

  if (passedTests === totalTests) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTests();
