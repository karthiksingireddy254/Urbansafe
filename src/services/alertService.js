// UrbanSafe AI - Alert, Analytics, Telemetry & Model Services
import { INITIAL_DEMO_ALERTS } from '../data/demoAlerts.js';
import { ANALYTICS_DATA } from '../data/demoAnalytics.js';
import { TELEMETRY_SOURCES, INITIAL_STREAM_LOGS } from '../data/demoTelemetry.js';
import { MODEL_REGISTRY } from '../data/demoModels.js';

const ALERTS_STORAGE_KEY = 'urbansafe_active_alerts';

export const alertService = {
  getAlerts(filter = 'ALL') {
    let alerts;
    try {
      const stored = localStorage.getItem(ALERTS_STORAGE_KEY);
      alerts = stored ? JSON.parse(stored) : [...INITIAL_DEMO_ALERTS];
    } catch {
      alerts = [...INITIAL_DEMO_ALERTS];
    }

    if (filter === 'ALL') return alerts;
    if (filter === 'RESOLVED') return alerts.filter(a => a.status === 'RESOLVED');
    return alerts.filter(a => a.severity === filter.toUpperCase() && a.status === 'ACTIVE');
  },

  dismissAlert(alertId) {
    let alerts;
    try {
      const stored = localStorage.getItem(ALERTS_STORAGE_KEY);
      alerts = stored ? JSON.parse(stored) : [...INITIAL_DEMO_ALERTS];
    } catch {
      alerts = [...INITIAL_DEMO_ALERTS];
    }

    alerts = alerts.map(a => {
      if (a.id === alertId) {
        return { ...a, status: 'RESOLVED' };
      }
      return a;
    });

    localStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(alerts));
    return alerts;
  },

  resetAlerts() {
    localStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(INITIAL_DEMO_ALERTS));
    return [...INITIAL_DEMO_ALERTS];
  }
};

export const analyticsService = {
  getAnalyticsData(filters = {}) {
    // In a real app, filters would query the API. Here we return structured datasets
    return {
      ...ANALYTICS_DATA,
      activeFilters: filters
    };
  }
};

export const telemetryService = {
  getSources() {
    return TELEMETRY_SOURCES;
  },

  getRecentLogs() {
    return INITIAL_STREAM_LOGS;
  },

  refreshTelemetry() {
    const updated = INITIAL_STREAM_LOGS.map(log => ({
      ...log,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    }));
    return updated;
  }
};

export const modelService = {
  getAllModels() {
    return Object.values(MODEL_REGISTRY);
  },

  getModelById(id) {
    return MODEL_REGISTRY[id] || MODEL_REGISTRY['xgboost'];
  }
};
