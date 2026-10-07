// UrbanSafe AI - AI Model Insights & Drift Demo Data

export const MODEL_REGISTRY = {
  "xgboost": {
    id: "xgboost",
    name: "XGBoost Classifier",
    category: "Gradient Boosted Decision Trees",
    status: "ACTIVE_PRODUCTION",
    lastEvaluation: "2026-09-24 03:00 UTC",
    driftStatus: "STABLE (<1.2% PSI)",
    benchmarkMetrics: {
      rocAuc: 0.934,
      f1Score: 0.891,
      precision: 0.912,
      recall: 0.872,
      inferenceLatency: "14ms",
      trainingSamples: "12,486 records"
    },
    hyperparameters: {
      n_estimators: 350,
      max_depth: 6,
      learning_rate: 0.04,
      subsample: 0.85,
      colsample_bytree: 0.8
    },
    topFeatures: [
      { name: "traffic_density_normalized", importance: 0.31 },
      { name: "road_surface_friction_index", importance: 0.24 },
      { name: "precipitation_rate_mm_hr", importance: 0.18 },
      { name: "visibility_meters", importance: 0.13 },
      { name: "hour_of_day_cyclical", importance: 0.09 },
      { name: "intersection_conflict_angle", importance: 0.05 }
    ],
    description: "Primary ensemble architecture delivering highest discriminative capability for low-latency urban accident probability estimation."
  },
  "random-forest": {
    id: "random-forest",
    name: "Random Forest Ensemble",
    category: "Bagged Decision Trees",
    status: "SHADOW_VALIDATION",
    lastEvaluation: "2026-09-24 03:00 UTC",
    driftStatus: "STABLE (<1.8% PSI)",
    benchmarkMetrics: {
      rocAuc: 0.908,
      f1Score: 0.864,
      precision: 0.885,
      recall: 0.844,
      inferenceLatency: "22ms",
      trainingSamples: "12,486 records"
    },
    hyperparameters: {
      n_estimators: 200,
      max_depth: 12,
      min_samples_split: 5,
      bootstrap: true
    },
    topFeatures: [
      { name: "traffic_density_normalized", importance: 0.29 },
      { name: "road_surface_friction_index", importance: 0.22 },
      { name: "precipitation_rate_mm_hr", importance: 0.19 },
      { name: "visibility_meters", importance: 0.15 },
      { name: "day_of_week", importance: 0.08 },
      { name: "speed_differential", importance: 0.07 }
    ],
    description: "Robust non-linear baseline less prone to individual sensor noise; operates concurrently for ensemble cross-validation."
  },
  "decision-tree": {
    id: "decision-tree",
    name: "Decision Tree (CART)",
    category: "Interpretable Tree",
    status: "STANDBY_BACKUP",
    lastEvaluation: "2026-09-20 03:00 UTC",
    driftStatus: "MODERATE DRIFT (3.4% PSI)",
    benchmarkMetrics: {
      rocAuc: 0.832,
      f1Score: 0.795,
      precision: 0.810,
      recall: 0.781,
      inferenceLatency: "4ms",
      trainingSamples: "12,486 records"
    },
    hyperparameters: {
      criterion: "gini",
      max_depth: 8,
      min_samples_leaf: 10
    },
    topFeatures: [
      { name: "traffic_density_normalized", importance: 0.38 },
      { name: "precipitation_rate_mm_hr", importance: 0.27 },
      { name: "road_surface_friction_index", importance: 0.21 },
      { name: "visibility_meters", importance: 0.14 }
    ],
    description: "Fast rule-based interpreter used primarily for human-verifiable emergency rule generation."
  },
  "logistic-regression": {
    id: "logistic-regression",
    name: "Regularized Logistic Regression",
    category: "Linear Baseline",
    status: "BASELINE_REFERENCE",
    lastEvaluation: "2026-09-18 03:00 UTC",
    driftStatus: "BENCHMARK CONSTANT",
    benchmarkMetrics: {
      rocAuc: 0.784,
      f1Score: 0.742,
      precision: 0.761,
      recall: 0.725,
      inferenceLatency: "2ms",
      trainingSamples: "12,486 records"
    },
    hyperparameters: {
      penalty: "l2",
      C: 1.0,
      solver: "lbfgs"
    },
    topFeatures: [
      { name: "traffic_density_normalized", importance: 0.42 },
      { name: "precipitation_rate_mm_hr", importance: 0.31 },
      { name: "hour_of_day", importance: 0.15 },
      { name: "lighting_level", importance: 0.12 }
    ],
    description: "Standard statistical reference model used to benchmark performance gain of non-linear tree ensembles."
  }
};
