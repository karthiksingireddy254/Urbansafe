// UrbanSafe AI - Hotspots Adapter (Single Source of Truth)
import { DEMO_CLUSTERS_DBSCAN, DEMO_CLUSTERS_KMEANS, ACCIDENT_DEMO_LOCATIONS } from './accidentDemoData.js';

export { DEMO_CLUSTERS_DBSCAN, DEMO_CLUSTERS_KMEANS };
export const DBSCAN_CLUSTERS = DEMO_CLUSTERS_DBSCAN;
export const KMEANS_CLUSTERS = DEMO_CLUSTERS_KMEANS;

export const HOTSPOT_SUMMARY = {
  totalHotspots: ACCIDENT_DEMO_LOCATIONS.filter(l => l.hotspotStatus).length,
  highRisk: DEMO_CLUSTERS_DBSCAN.filter(c => c.riskLevel === 'HIGH').length,
  mediumRisk: DEMO_CLUSTERS_DBSCAN.filter(c => c.riskLevel === 'MEDIUM').length,
  lowRisk: DEMO_CLUSTERS_DBSCAN.filter(c => c.riskLevel === 'LOW').length,
  coveragePercent: 88.4,
  clusterAlgorithm: "DBSCAN (Density-Based) & K-Means"
};
