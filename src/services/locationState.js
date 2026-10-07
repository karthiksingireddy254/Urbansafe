// UrbanSafe AI - Global Location State & App Context Manager
// Preserves selected location and prediction state across all views

import { ACCIDENT_DEMO_LOCATIONS } from '../data/accidentDemoData.js';
import { calculateDemoRiskScore } from '../data/demoPredictions.js';

const STORAGE_SELECTED_LOC_KEY = 'urbansafe_selected_location_id';
const STORAGE_PREDICTION_KEY = 'urbansafe_current_prediction_state';

class LocationStateManager {
  constructor() {
    this.locations = ACCIDENT_DEMO_LOCATIONS;
    this.selectedLocationId = this.loadSavedLocationId();
    this.initPredictionState();
  }

  loadSavedLocationId() {
    try {
      if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem(STORAGE_SELECTED_LOC_KEY);
        if (saved && this.locations.some(l => l.id === saved)) {
          return saved;
        }
      }
    } catch (e) {
      // Ignore in non-browser environments
    }
    return this.locations[0].id; // Default: LOC001
  }

  initPredictionState() {
    const loc = this.getSelectedLocation();
    const defaultInputs = {
      locationId: loc.id,
      locationName: loc.name,
      latitude: loc.latitude,
      longitude: loc.longitude,
      date: new Date().toISOString().split('T')[0],
      time: '18:30',
      timeCategory: loc.timeCategory,
      trafficDensity: loc.trafficDensity,
      weather: loc.weather,
      rainfall: loc.rainfall,
      visibility: loc.visibility,
      roadCondition: loc.roadCondition,
      roadType: loc.roadType,
      lighting: loc.lighting,
      historicalAccidents: loc.historicalAccidents,
      hotspotStatus: loc.hotspotStatus
    };

    const initialResult = calculateDemoRiskScore(defaultInputs);
    this.predictionState = {
      inputs: defaultInputs,
      result: initialResult
    };

    try {
      if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem(STORAGE_PREDICTION_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.inputs && parsed.result) {
            this.predictionState = parsed;
          }
        }
      }
    } catch (e) {
      // Ignore in non-browser environments
    }
  }

  getAllLocations() {
    return this.locations;
  }

  getLocationById(id) {
    return this.locations.find(l => l.id === id) || this.locations[0];
  }

  getSelectedLocation() {
    return this.getLocationById(this.selectedLocationId);
  }

  setSelectedLocationId(id) {
    const loc = this.getLocationById(id);
    this.selectedLocationId = loc.id;
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_SELECTED_LOC_KEY, loc.id);
      }
    } catch (e) {
      // Ignore
    }

    // Auto-update prediction inputs with location defaults
    this.resetToLocationDefaults(loc.id);
    return loc;
  }

  resetToLocationDefaults(locationId) {
    const loc = this.getLocationById(locationId || this.selectedLocationId);
    const inputs = {
      locationId: loc.id,
      locationName: loc.name,
      latitude: loc.latitude,
      longitude: loc.longitude,
      date: new Date().toISOString().split('T')[0],
      time: loc.timeCategory === 'Night' ? '21:30' : loc.timeCategory === 'Evening' ? '18:30' : '11:00',
      timeCategory: loc.timeCategory,
      trafficDensity: loc.trafficDensity,
      weather: loc.weather,
      rainfall: loc.rainfall,
      visibility: loc.visibility,
      roadCondition: loc.roadCondition,
      roadType: loc.roadType,
      lighting: loc.lighting,
      historicalAccidents: loc.historicalAccidents,
      hotspotStatus: loc.hotspotStatus
    };

    const result = calculateDemoRiskScore(inputs);
    this.predictionState = { inputs, result };
    this.savePredictionState();
    return this.predictionState;
  }

  runPrediction(inputs) {
    const loc = this.getLocationById(inputs.locationId || this.selectedLocationId);
    const enrichedInputs = {
      ...inputs,
      locationId: loc.id,
      locationName: loc.name,
      latitude: inputs.latitude || loc.latitude,
      longitude: inputs.longitude || loc.longitude,
      roadType: inputs.roadType || loc.roadType,
      hotspotStatus: loc.hotspotStatus
    };

    const result = calculateDemoRiskScore(enrichedInputs);
    this.predictionState = {
      inputs: enrichedInputs,
      result: result
    };
    this.savePredictionState();
    return result;
  }

  getCurrentPrediction() {
    return this.predictionState;
  }

  savePredictionState() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_PREDICTION_KEY, JSON.stringify(this.predictionState));
      }
    } catch (e) {
      // Ignore
    }
  }
}

export const locationState = new LocationStateManager();
