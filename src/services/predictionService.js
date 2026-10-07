// UrbanSafe AI - Prediction Service
import { calculateSimulatedRisk } from '../data/demoPredictions.js';
import { locationState } from './locationState.js';

const LAST_PREDICTION_KEY = 'urbansafe_last_prediction';

export const predictionService = {
  predict(inputs) {
    const result = calculateSimulatedRisk(inputs);

    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(
          LAST_PREDICTION_KEY,
          JSON.stringify({
            inputs,
            result
          })
        );
      }
    } catch (error) {
      console.error('Unable to save prediction to localStorage:', error);
    }

    // Sync with locationState
    if (locationState) {
      locationState.predictionState = { inputs, result };
    }

    return result;
  },

  getLastPrediction() {
    try {
      if (typeof localStorage !== 'undefined') {
        const data = localStorage.getItem(LAST_PREDICTION_KEY);
        return data ? JSON.parse(data) : null;
      }
    } catch (error) {
      console.error('Unable to read last prediction:', error);
    }
    return locationState ? locationState.getCurrentPrediction() : null;
  },

  calculateScore(inputs) {
    return calculateSimulatedRisk(inputs);
  },

  getSelectedLocation() {
    return locationState ? locationState.getSelectedLocation() : null;
  },

  setSelectedLocation(id) {
    return locationState ? locationState.setSelectedLocationId(id) : null;
  },

  resetDefaults(id) {
    return locationState ? locationState.resetToLocationDefaults(id) : null;
  }
};
