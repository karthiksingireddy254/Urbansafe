// UrbanSafe AI - Journey Risk Analysis & Proximity Engine
// Evaluates route polyline against accident hotspots using mathematical point-to-segment distance

import { supabaseService } from './supabaseClient.js';

export const journeyRiskService = {
  /**
   * Distance between two lat/lng coordinates in meters (Haversine formula)
   */
  getHaversineDistanceMeters(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Earth radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  },

  /**
   * Shortest distance from a point (P) to a line segment (AB) in meters
   */
  getDistancePointToSegmentMeters(pLat, pLng, aLat, aLng, bLat, bLng) {
    // Project point onto segment in spherical Cartesian approximation
    const ax = aLng;
    const ay = aLat;
    const bx = bLng;
    const by = bLat;
    const px = pLng;
    const py = pLat;

    const dx = bx - ax;
    const dy = by - ay;
    const lenSq = dx * dx + dy * dy;

    if (lenSq === 0) {
      return this.getHaversineDistanceMeters(pLat, pLng, aLat, aLng);
    }

    // Projection scalar t clamped to [0, 1]
    let t = ((px - ax) * dx + (py - ay) * dy) / lenSq;
    t = Math.max(0, Math.min(1, t));

    const projLng = ax + t * dx;
    const projLat = ay + t * dy;

    return this.getHaversineDistanceMeters(pLat, pLng, projLat, projLng);
  },

  /**
   * Minimum distance from a point to an entire route polyline (array of [lat, lng])
   */
  getMinDistanceToRouteMeters(pointLat, pointLng, polylineCoords) {
    if (!polylineCoords || polylineCoords.length === 0) return Infinity;
    if (polylineCoords.length === 1) {
      return this.getHaversineDistanceMeters(pointLat, pointLng, polylineCoords[0][0], polylineCoords[0][1]);
    }

    let minDistance = Infinity;
    for (let i = 0; i < polylineCoords.length - 1; i++) {
      const segStart = polylineCoords[i];
      const segEnd = polylineCoords[i + 1];
      const dist = this.getDistancePointToSegmentMeters(
        pointLat, pointLng,
        segStart[0], segStart[1],
        segEnd[0], segEnd[1]
      );
      if (dist < minDistance) {
        minDistance = dist;
      }
    }
    return minDistance;
  },

  /**
   * Analyze Journey Route Against UrbanSafe Accident & Risk Hotspot Data
   * @param {Array<[number, number]>} polylineCoordinates - Route lat/lng array
   * @param {number} proximityThresholdMeters - Max distance to consider (default 500m)
   */
  async analyzeRoute(polylineCoordinates, proximityThresholdMeters = 500) {
    const allLocations = await supabaseService.getRiskLocations();

    const corridorRiskZones = [];

    // Filter locations within proximity threshold
    for (const loc of allLocations) {
      const distanceMeters = this.getMinDistanceToRouteMeters(loc.latitude, loc.longitude, polylineCoordinates);
      if (distanceMeters <= proximityThresholdMeters) {
        corridorRiskZones.push({
          ...loc,
          distanceFromRouteMeters: Math.round(distanceMeters),
          proximityTag: distanceMeters < 150 ? 'Direct Corridor' : `${Math.round(distanceMeters)}m Adjacent`
        });
      }
    }

    // Sort locations along the route order (by distance from start coordinate)
    const startCoord = polylineCoordinates[0] || [17.4421, 78.3912];
    corridorRiskZones.sort((a, b) => {
      const distA = this.getHaversineDistanceMeters(startCoord[0], startCoord[1], a.latitude, a.longitude);
      const distB = this.getHaversineDistanceMeters(startCoord[0], startCoord[1], b.latitude, b.longitude);
      return distA - distB;
    });

    // Counts by severity
    const highRiskZones = corridorRiskZones.filter(z => z.historicalRisk >= 70);
    const mediumRiskZones = corridorRiskZones.filter(z => z.historicalRisk >= 40 && z.historicalRisk < 70);
    const lowRiskZones = corridorRiskZones.filter(z => z.historicalRisk < 40);

    const highCount = highRiskZones.length;
    const medCount = mediumRiskZones.length;
    const lowCount = lowRiskZones.length;
    const totalZones = corridorRiskZones.length;

    // Deterministic Route Risk Score Calculation
    let overallRouteRiskScore = 20; // baseline safe city transit
    if (totalZones > 0) {
      const weightedSum = (highCount * 28) + (medCount * 14) + (lowCount * 4);
      const avgLocationRisk = corridorRiskZones.reduce((sum, z) => sum + z.historicalRisk, 0) / totalZones;
      overallRouteRiskScore = Math.min(100, Math.max(15, Math.round((avgLocationRisk * 0.65) + (weightedSum * 0.35))));
    }

    // Overall Risk Level
    let overallRiskLevel = 'LOW';
    if (overallRouteRiskScore >= 70 || highCount >= 2) {
      overallRiskLevel = 'HIGH';
    } else if (overallRouteRiskScore >= 40 || highCount >= 1 || medCount >= 2) {
      overallRiskLevel = 'MEDIUM';
    }

    // Generate Dynamic De-duplicated Recommendations
    const recommendations = this.generateJourneyRecommendations(corridorRiskZones, overallRiskLevel);

    return {
      overallRouteRiskScore,
      overallRiskLevel,
      highRiskCount: highCount,
      mediumRiskCount: medCount,
      lowRiskCount: lowCount,
      totalRiskZones: totalZones,
      corridorRiskZones,
      highRiskZones,
      recommendations,
      analysisTimestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  },

  /**
   * Synthesize De-duplicated Dynamic Safety Recommendations
   */
  generateJourneyRecommendations(riskZones, overallLevel) {
    const recs = [];
    const addedCategories = new Set();

    const hasHighTraffic = riskZones.some(z => z.trafficDensity === 'High' || z.trafficDensity === 'Critical');
    const hasPoorRoad = riskZones.some(z => z.roadCondition === 'Poor' || (z.roadCondition && z.roadCondition.includes('Worn')));
    const hasRainOrWeather = riskZones.some(z => z.weather === 'Rain' || z.weather === 'Heavy Rain' || z.weather === 'Fog');
    const hasLowVisibility = riskZones.some(z => z.visibility < 5.0 || z.lighting === 'Poor');
    const hasHotspots = riskZones.some(z => z.hotspotStatus);
    const hasHighCollisions = riskZones.some(z => z.historicalAccidents > 90);

    if (hasHighTraffic && !addedCategories.has('traffic')) {
      recs.push({
        id: 'REC_TRAFFIC',
        icon: '🚗',
        hazard: 'Heavy Traffic Congestion Detected',
        action: 'Reduce speed and maintain at least 3-second vehicle headway margin near merge corridors.'
      });
      addedCategories.add('traffic');
    }

    if (hasPoorRoad && !addedCategories.has('road')) {
      recs.push({
        id: 'REC_ROAD',
        icon: '⚠️',
        hazard: 'Degraded Pavement & Surface Irregularities',
        action: 'Slow down and watch for potholes, uneven road joints, and reduced tire grip.'
      });
      addedCategories.add('road');
    }

    if (hasRainOrWeather && !addedCategories.has('weather')) {
      recs.push({
        id: 'REC_WEATHER',
        icon: '🌧️',
        hazard: 'Wet Roadway / Precipitation Friction Loss',
        action: 'Increase braking distance by 50%, avoid abrupt lane changes, and activate low-beam headlights.'
      });
      addedCategories.add('weather');
    }

    if (hasLowVisibility && !addedCategories.has('visibility')) {
      recs.push({
        id: 'REC_VISIBILITY',
        icon: '💡',
        hazard: 'Low Luminaire Illumination & Sight Distance',
        action: 'Use appropriate auxiliary lights, reduce speed at unlit junctions, and yield to pedestrians.'
      });
      addedCategories.add('visibility');
    }

    if ((hasHotspots || hasHighCollisions) && !addedCategories.has('hotspot')) {
      recs.push({
        id: 'REC_HOTSPOT',
        icon: '📍',
        hazard: 'Historical Collision Hotspot Corridor',
        action: 'Exercise heightened alertness at intersections with documented recurring multi-vehicle collisions.'
      });
      addedCategories.add('hotspot');
    }

    if (recs.length === 0) {
      recs.push({
        id: 'REC_DEFAULT',
        icon: '🛡️',
        hazard: 'Optimal Safe Corridor',
        action: 'Maintain posted urban speed limits and practice defensive driving.'
      });
    }

    return recs;
  }
};
