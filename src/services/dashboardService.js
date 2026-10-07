// UrbanSafe AI - Dashboard Service (Single Source of Truth)
import { ACCIDENT_DEMO_LOCATIONS } from '../data/accidentDemoData.js';
import { DEMO_LOCATIONS } from '../data/demoLocations.js';
import { INITIAL_DEMO_ALERTS } from '../data/demoAlerts.js';
import { ANALYTICS_DATA } from '../data/demoAnalytics.js';

export const dashboardService = {
  getKpis() {
    const totalRecords = ACCIDENT_DEMO_LOCATIONS.reduce((sum, l) => sum + l.historicalAccidents, 0);
    const highRiskCount = DEMO_LOCATIONS.filter(l => l.riskLevel === 'HIGH').length;
    const hotspotCount = ACCIDENT_DEMO_LOCATIONS.filter(l => l.hotspotStatus).length;
    const avgScore = Math.round(
      DEMO_LOCATIONS.reduce((sum, l) => sum + l.riskScore, 0) / DEMO_LOCATIONS.length
    );

    return {
      accidentRecords: totalRecords,
      highRiskZones: highRiskCount,
      activeHotspots: hotspotCount,
      averageRiskScore: avgScore,
      benchmarkTag: "Demo Prediction Engine"
    };
  },

  getPriorityHotspots() {
    return DEMO_LOCATIONS
      .filter(l => l.hotspot)
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 6);
  },

  getRecentAlerts() {
    return INITIAL_DEMO_ALERTS.slice(0, 4);
  },

  getRiskTrend(timeframe = '7D') {
    return ANALYTICS_DATA.timeSeries[timeframe] || ANALYTICS_DATA.timeSeries['7D'];
  },

  getRiskDistribution() {
    return ANALYTICS_DATA.distribution;
  }
};
