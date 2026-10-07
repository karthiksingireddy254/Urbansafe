// UrbanSafe AI - Telemetry Service
import { TELEMETRY_SOURCES, INITIAL_STREAM_LOGS } from '../data/demoTelemetry.js';

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
