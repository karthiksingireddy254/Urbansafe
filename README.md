# UrbanSafe AI — Smart Urban Accident Risk Prediction & Prevention System

An intelligent, real-time predictive safety command center designed to forecast urban accident risks, detect spatial hotspot clusters, and recommend automated preventive actions.

---

## 🌟 Key Features

### 1. **Predictive Risk Engine & Explainable AI (XAI)**
- **Deterministic Multi-Factor Scoring**: Evaluates speed, corridor density, road conditions, weather, visibility, and lighting to generate risk scores (0–100) and severity levels (**LOW**, **MEDIUM**, **HIGH**).
- **Dynamic Feature Contribution Breakdown**: Transparent impact breakdown for each contributing environmental factor.

### 2. **GO — Safe Journey (`/go`)**
- **Corridor Hazard Detection**: Real-time routing analysis that detects accident-prone zones within a **500m proximity threshold**.
- **Deterministic Route Scoring**: Computes overall route risk and travel time without non-deterministic randomness.
- **Approaching Hazard Alerts & Live Simulation**: Dynamic proximity warnings for high-risk zones ahead.

### 3. **Urban Risk GIS Mapping (Leaflet + OpenStreetMap)**
- Interactive 460px high-performance spatial map with risk category filtering (**All**, **High Risk**, **Hotspots**, **Corridors**).
- Rich popup cards with telemetry, historical collision stats, and preventive advisories.

### 4. **Hotspot Clustering & Accident Analytics**
- **DBSCAN / K-Means Clusters**: Spatial clustering analysis of high-density collision corridors.
- **Trend Charts & Distribution**: Temporal accident frequency and category distribution metrics.

### 5. **Interactive Logout Confirmation & Celebratory Confetti**
- Dark glassmorphic confirmation modal with safety visual badge.
- Reactive loading states and instant error protection.
- Celebratory paper confetti blast upon successful sign out.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+ recommended)

### Quick Start

1. **Clone the repository:**
   ```bash
   git clone https://github.com/karthiksingireddy254/Urbansafe.git
   cd Urbansafe
   ```

2. **Start the application:**
   ```bash
   npm start
   # or
   node server.js
   ```

3. **Open in Browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

4. **Demo Credentials:**
   - **Email:** `demo@urbansafe.ai`
   - **Password:** `demo123`
   *(or click the **"Auto-Fill Demo Credentials"** button on the login screen)*

---

## 🧪 Test Suites

Run the built-in automated test suites:

```bash
# E2E View & Route Audit
node test_e2e_views.js

# Prediction Engine & Deterministic Scoring Suite
node test_prediction_suite.js

# GO Safe Journey Route & 500m Hazard Corridor Suite
node test_go_journey_suite.js

# Logout Confirmation Flow & Confetti Suite
node test_logout_flow.js

# Codebase Syntax & Conflict Validator
node validate_all_files.js
```

---

## 📂 Project Structure

```
├── index.html                  # HTML5 Entrypoint
├── server.js                   # Lightweight static HTTP server
├── package.json                # Project configuration & scripts
├── src/
│   ├── main.js                 # Application bootstrapper
│   ├── auth.js                 # Authentication manager
│   ├── router.js               # Client-side SPA hash router
│   ├── components/
│   │   ├── layout.js           # Universal sidebar & topbar layout
│   │   └── logoutConfirmationModal.js # Interactive logout modal
│   ├── data/
│   │   ├── accidentDemoData.js # Centralized Hyderabad accident & corridor dataset
│   │   ├── demoAlerts.js       # Active safety alerts
│   │   └── mockData.js         # Demo users & presets
│   ├── services/
│   │   ├── predictionService.js# Deterministic ML risk scoring engine
│   │   ├── journeyRiskService.js# 500m proximity & route risk evaluator
│   │   ├── routingService.js   # Geolocation & route coordinates generator
│   │   ├── supabaseClient.js   # Supabase client with graceful demo fallback
│   │   └── locationState.js    # Global location state manager
│   ├── styles/                 # Cyber dark theme & glassmorphism stylesheets
│   ├── utils/
│   │   └── confetti.js         # Canvas-based paper blast confetti engine
│   └── views/                  # Modular SPA view renderers
└── test_*.js                   # Comprehensive automated test suites
```

---

## 📄 License
This project is part of the final-year research on **Smart Urban Accident Risk Prediction & Prevention System**.
