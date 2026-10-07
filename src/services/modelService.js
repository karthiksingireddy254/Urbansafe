// UrbanSafe AI - Model Service
import { MODEL_REGISTRY } from '../data/demoModels.js';

export const modelService = {
  getAllModels() {
    return Object.values(MODEL_REGISTRY);
  },

  getModelById(id) {
    return MODEL_REGISTRY[id] || MODEL_REGISTRY['xgboost'];
  }
};
