// UrbanSafe AI - Analytics Service
import { ANALYTICS_DATA } from '../data/demoAnalytics.js';

export const analyticsService = {
  getAnalyticsData(filters = {}) {
    return {
      ...ANALYTICS_DATA,
      activeFilters: filters
    };
  }
};
