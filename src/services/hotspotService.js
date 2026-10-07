// UrbanSafe AI - Hotspot Service
import { DBSCAN_CLUSTERS, KMEANS_CLUSTERS, HOTSPOT_SUMMARY } from '../data/demoHotspots.js';

export const hotspotService = {
  getSummary() {
    return HOTSPOT_SUMMARY;
  },

  getDbscanClusters() {
    return DBSCAN_CLUSTERS;
  },

  getKmeansClusters() {
    return KMEANS_CLUSTERS;
  },

  getClusterById(clusterId) {
    return (
      DBSCAN_CLUSTERS.find(c => c.clusterId === clusterId) ||
      KMEANS_CLUSTERS.find(c => c.clusterId === clusterId) ||
      DBSCAN_CLUSTERS[0]
    );
  }
};
