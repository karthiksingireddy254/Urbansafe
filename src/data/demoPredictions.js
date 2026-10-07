// UrbanSafe AI - Deterministic Rule-Based Demo Prediction Engine
// DEMO PREDICTION ENGINE — NOT LIVE ML MODEL
// Deterministic risk scoring function based on weighted urban parameters

export function calculateDemoRiskScore(inputs) {
  // 1. Traffic Density Factor (5 - 25)
  let trafficScore = 5;
  const traffic = inputs.trafficDensity || 'Medium';
  if (traffic === 'High' || traffic === 'Critical') {
    trafficScore = 25;
  } else if (traffic === 'Medium' || traffic === 'Moderate') {
    trafficScore = 15;
  } else {
    trafficScore = 5;
  }

  // 2. Weather Condition Factor (5 - 25)
  let weatherScore = 5;
  const weather = inputs.weather || 'Clear';
  if (weather === 'Heavy Rain' || weather === 'Storm') {
    weatherScore = 25;
  } else if (weather === 'Fog' || weather === 'Foggy') {
    weatherScore = 22;
  } else if (weather === 'Rain' || weather === 'Light Rain') {
    weatherScore = 18;
  } else if (weather === 'Cloudy' || weather === 'Overcast') {
    weatherScore = 8;
  } else {
    weatherScore = 5;
  }

  // 3. Sight Visibility Factor (2 - 20)
  // Can be parsed from numeric km or categorical string
  let visibilityVal = typeof inputs.visibility === 'number' ? inputs.visibility : parseFloat(inputs.visibility);
  if (isNaN(visibilityVal)) {
    if (typeof inputs.visibility === 'string' && inputs.visibility.includes('<2')) visibilityVal = 1.5;
    else if (typeof inputs.visibility === 'string' && inputs.visibility.includes('2-5')) visibilityVal = 3.5;
    else if (typeof inputs.visibility === 'string' && inputs.visibility.includes('5-8')) visibilityVal = 6.5;
    else visibilityVal = 9.0;
  }

  let visibilityScore = 2;
  if (visibilityVal < 2.0) {
    visibilityScore = 20;
  } else if (visibilityVal >= 2.0 && visibilityVal < 5.0) {
    visibilityScore = 12;
  } else if (visibilityVal >= 5.0 && visibilityVal <= 8.0) {
    visibilityScore = 5;
  } else {
    visibilityScore = 2;
  }

  // 4. Road Surface Condition Factor (5 - 22)
  let roadScore = 5;
  const roadCondition = inputs.roadCondition || 'Moderate';
  if (roadCondition === 'Poor' || roadCondition.includes('Worn') || roadCondition.includes('Damaged')) {
    roadScore = 22;
  } else if (roadCondition === 'Moderate' || roadCondition.includes('Patches')) {
    roadScore = 12;
  } else {
    roadScore = 5;
  }

  // 5. Ambient Lighting Factor (3 - 12)
  let lightingScore = 3;
  const lighting = inputs.lighting || 'Good';
  if (lighting === 'Poor' || lighting.includes('Dark') || lighting.includes('Low')) {
    lightingScore = 12;
  } else {
    lightingScore = 3;
  }

  // 6. Time of Day Factor (5 - 15)
  let timeScore = 5;
  const timeCategory = inputs.timeCategory || (inputs.time ? getTimeCategory(inputs.time) : 'Day');
  if (timeCategory === 'Night' || timeCategory.includes('Night')) {
    timeScore = 15;
  } else if (timeCategory === 'Evening' || timeCategory.includes('Evening') || timeCategory.includes('Dusk')) {
    timeScore = 10;
  } else {
    timeScore = 5;
  }

  // 7. Historical Accident Factor (0 - 20)
  const historicalAccidents = typeof inputs.historicalAccidents === 'number'
    ? inputs.historicalAccidents
    : parseInt(inputs.historicalAccidents, 10) || 45;
  const historicalScore = Math.min(20, Math.max(0, Math.round((historicalAccidents / 160) * 20)));

  // Calculate Total Raw Score
  const rawScore = trafficScore + weatherScore + visibilityScore + roadScore + lightingScore + timeScore + historicalScore;
  const riskScore = Math.min(100, Math.max(0, rawScore));

  // Risk Classification
  let riskLevel = 'LOW';
  if (riskScore >= 70) {
    riskLevel = 'HIGH';
  } else if (riskScore >= 40) {
    riskLevel = 'MEDIUM';
  } else {
    riskLevel = 'LOW';
  }

  // Exact Breakdown Components for Visual UI & XAI
  const breakdown = [
    {
      feature: 'Traffic Density',
      category: 'TRAFFIC',
      value: traffic,
      score: trafficScore,
      maxScore: 25,
      weightPercent: +(trafficScore / riskScore * 100).toFixed(1),
      impact: trafficScore >= 20 ? 'High' : trafficScore >= 12 ? 'Moderate' : 'Low',
      description: trafficScore >= 20
        ? 'High traffic volume generates intense deceleration shockwaves and lane-change friction.'
        : trafficScore >= 12
        ? 'Moderate traffic flow with balanced vehicle headways.'
        : 'Free-flowing traffic with minimal vehicle interaction.'
    },
    {
      feature: 'Road Condition',
      category: 'ROAD',
      value: roadCondition,
      score: roadScore,
      maxScore: 22,
      weightPercent: +(roadScore / riskScore * 100).toFixed(1),
      impact: roadScore >= 20 ? 'High' : roadScore >= 10 ? 'Moderate' : 'Low',
      description: roadScore >= 20
        ? 'Degraded pavement, potholes, or wet surface significantly lengthen required stopping distance.'
        : roadScore >= 10
        ? 'Fair pavement surface with localized micro-roughness.'
        : 'High-traction, well-maintained smooth road surface.'
    },
    {
      feature: 'Weather Condition',
      category: 'WEATHER',
      value: weather,
      score: weatherScore,
      maxScore: 25,
      weightPercent: +(weatherScore / riskScore * 100).toFixed(1),
      impact: weatherScore >= 18 ? 'High' : weatherScore >= 8 ? 'Moderate' : 'Low',
      description: weatherScore >= 18
        ? 'Precipitation or dense fog impairs braking friction and causes potential hydroplaning.'
        : weatherScore >= 8
        ? 'Overcast skies slightly dampen solar ambient contrast.'
        : 'Clear atmospheric conditions with optimal road tire grip.'
    },
    {
      feature: 'Sight Visibility',
      category: 'WEATHER',
      value: `${visibilityVal} km`,
      score: visibilityScore,
      maxScore: 20,
      weightPercent: +(visibilityScore / riskScore * 100).toFixed(1),
      impact: visibilityScore >= 12 ? 'High' : visibilityScore >= 5 ? 'Moderate' : 'Low',
      description: visibilityScore >= 12
        ? 'Severely reduced visual sight distance cuts driver reaction time margin below safety threshold.'
        : visibilityScore >= 5
        ? 'Moderate sight distance suitable for medium urban speeds.'
        : 'Unobstructed line-of-sight exceeding 8 kilometers.'
    },
    {
      feature: 'Time of Day',
      category: 'TIME',
      value: timeCategory,
      score: timeScore,
      maxScore: 15,
      weightPercent: +(timeScore / riskScore * 100).toFixed(1),
      impact: timeScore >= 12 ? 'High' : timeScore >= 8 ? 'Moderate' : 'Low',
      description: timeScore >= 12
        ? 'Nighttime hours match historical peaks for high-speed reckless merging and driver fatigue.'
        : timeScore >= 8
        ? 'Evening twilight creates glare and transition lighting fatigue.'
        : 'Full daylight hours provide maximum natural ambient visibility.'
    },
    {
      feature: 'Ambient Lighting',
      category: 'ROAD',
      value: lighting,
      score: lightingScore,
      maxScore: 12,
      weightPercent: +(lightingScore / riskScore * 100).toFixed(1),
      impact: lightingScore >= 10 ? 'High' : 'Low',
      description: lightingScore >= 10
        ? 'Inadequate streetlight illumination limits night obstacle detection.'
        : 'Uniform luminaire coverage provides crisp road definition.'
    },
    {
      feature: 'Historical Accidents',
      category: 'HISTORICAL',
      value: `${historicalAccidents} collisions`,
      score: historicalScore,
      maxScore: 20,
      weightPercent: +(historicalScore / riskScore * 100).toFixed(1),
      impact: historicalScore >= 15 ? 'High' : historicalScore >= 8 ? 'Moderate' : 'Low',
      description: historicalScore >= 15
        ? 'Corridor has recurring historical accident clusters due to geometric or junction design.'
        : historicalScore >= 8
        ? 'Moderate historical incident frequency.'
        : 'Low baseline historical collision incidence.'
    }
  ];

  // Dynamic Human-Readable Explanation
  const explanation = generateRiskExplanation({
    riskLevel,
    riskScore,
    traffic,
    weather,
    roadCondition,
    visibilityVal,
    lighting,
    timeCategory,
    historicalAccidents
  });

  // Dynamic Prevention Recommendations
  const recommendations = generateDynamicRecommendations({
    riskLevel,
    traffic,
    weather,
    roadCondition,
    visibilityVal,
    lighting,
    timeCategory,
    locationName: inputs.locationName || 'Selected Urban Location'
  });

  return {
    score: riskScore,
    riskScore,
    riskLevel,
    factors: breakdown,
    predictedIncidents24h: Math.max(1, Math.round((riskScore / 100) * 16)),
    breakdown,
    explanation,
    recommendations,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    inputSnapshot: {
      ...inputs,
      trafficDensity: traffic,
      weather,
      roadCondition,
      visibility: visibilityVal,
      lighting,
      timeCategory,
      historicalAccidents
    }
  };
}

function getTimeCategory(timeStr) {
  if (!timeStr) return 'Day';
  const hour = parseInt(timeStr.split(':')[0], 10);
  if (hour >= 6 && hour < 17) return 'Day';
  if (hour >= 17 && hour < 20) return 'Evening';
  return 'Night';
}

function generateRiskExplanation(p) {
  const highFactors = [];
  const goodFactors = [];

  if (p.traffic === 'High' || p.traffic === 'Critical') highFactors.push('high traffic density');
  else if (p.traffic === 'Low') goodFactors.push('light traffic volume');

  if (p.roadCondition === 'Poor' || p.roadCondition.includes('Worn')) highFactors.push('poor road surface condition');
  else if (p.roadCondition === 'Good') goodFactors.push('good pavement traction');

  if (p.weather === 'Heavy Rain' || p.weather === 'Rain') highFactors.push('active rainfall');
  else if (p.weather === 'Fog') highFactors.push('dense fog cover');
  else if (p.weather === 'Clear') goodFactors.push('clear weather');

  if (p.visibilityVal < 5.0) highFactors.push('reduced optical visibility');
  else if (p.visibilityVal >= 8.0) goodFactors.push('excellent sight visibility');

  if (p.lighting === 'Poor') highFactors.push('substandard ambient lighting');
  else if (p.lighting === 'Good') goodFactors.push('adequate streetlight illumination');

  if (p.timeCategory === 'Night') highFactors.push('late night driving hazards');
  else if (p.timeCategory === 'Day') goodFactors.push('daytime lighting');

  if (p.historicalAccidents > 100) highFactors.push('a high historical collision rate');

  if (p.riskLevel === 'HIGH') {
    return `The selected location exhibits ${highFactors.join(', ')}. These compounding environmental and traffic hazards significantly increase the calculated accident probability score to ${p.riskScore}/100. Immediate preventive caution and traffic intervention are strongly advised.`;
  } else if (p.riskLevel === 'MEDIUM') {
    return `The selected location presents a moderate collision risk of ${p.riskScore}/100. While benefiting from ${goodFactors.length ? goodFactors.join(' and ') : 'moderate road metrics'}, it is elevated by ${highFactors.length ? highFactors.join(' and ') : 'transient traffic peaks'}. Continuous monitoring and advisory speed limits are recommended.`;
  } else {
    return `The selected location exhibits a low accident risk of ${p.riskScore}/100. Favorable factors including ${goodFactors.join(', ')} provide adequate safety margins with minimal vehicular conflict under current parameters.`;
  }
}

function generateDynamicRecommendations(p) {
  const recs = [];

  if (p.traffic === 'High' || p.traffic === 'Critical') {
    recs.push({
      priority: 'HIGH',
      hazard: 'HIGH TRAFFIC CONGESTION',
      action: 'Deploy variable speed ceiling signs (reduce to 30 km/h) and increase traffic police presence during peak hours.',
      agency: 'City Traffic Police & Highway Patrol'
    });
  }

  if (p.roadCondition === 'Poor' || p.roadCondition.includes('Worn')) {
    recs.push({
      priority: 'HIGH',
      hazard: 'DEGRADED ROAD SURFACE',
      action: 'Prioritize urgent municipal road inspection, pothole patching, and high-friction anti-skid overlay.',
      agency: 'Municipal Corporation Roads Division'
    });
  }

  if (p.weather === 'Rain' || p.weather === 'Heavy Rain' || p.weather === 'Fog') {
    recs.push({
      priority: p.weather === 'Heavy Rain' ? 'HIGH' : 'MEDIUM',
      hazard: 'ADVERSE WEATHER IMPACT',
      action: 'Increase caution advisory on electronic VMS boards, activate fog flashers, and clear stormwater drains.',
      agency: 'Disaster Management & Smart City Command Center'
    });
  }

  if (p.visibilityVal < 5.0 || p.lighting === 'Poor') {
    recs.push({
      priority: 'MEDIUM',
      hazard: 'REDUCED SIGHT VISIBILITY & LIGHTING',
      action: 'Inspect luminaire coverage, replace burnt sodium vapor lamps with high-lumen LEDs, and install reflective cat-eye markers.',
      agency: 'Street Lighting & Urban Infrastructure Dept'
    });
  }

  if (recs.length === 0) {
    recs.push({
      priority: 'LOW',
      hazard: 'STANDARD MONITORING CADENCE',
      action: 'Maintain automated sensor telemetry and standard CCTV corridor surveillance.',
      agency: 'Metropolitan Traffic Command Center'
    });
  }

  return recs;
}

// Export calculateSimulatedRisk for full compatibility
export const calculateSimulatedRisk = calculateDemoRiskScore;
