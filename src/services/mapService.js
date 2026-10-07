// UrbanSafe AI - Map Service & Hotspot Service
import { DEMO_LOCATIONS } from '../data/demoLocations.js';
import { DBSCAN_CLUSTERS, KMEANS_CLUSTERS, HOTSPOT_SUMMARY } from '../data/demoHotspots.js';

export const mapService = {
  getLocations(filter = 'ALL') {
    if (filter === 'ALL') return DEMO_LOCATIONS;
    return DEMO_LOCATIONS.filter(l => l.riskLevel === filter.toUpperCase());
  },

  getLocationById(id) {
    return DEMO_LOCATIONS.find(l => l.id === id) || DEMO_LOCATIONS[0];
  },

  searchLocations(query) {
    const q = (query || '').toLowerCase().trim();
    if (!q) return [];
    return DEMO_LOCATIONS.filter(l =>
      l.name.toLowerCase().includes(q) ||
      l.shortName.toLowerCase().includes(q) ||
      l.id.toLowerCase().includes(q)
    );
  }
};

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
