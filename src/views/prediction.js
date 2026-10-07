// UrbanSafe AI - Accident Risk Prediction View
// Deterministic Demo Prediction Engine & Interactive Environmental Simulator

import { createProtectedLayout } from '../components/layout.js';
import { locationState } from '../services/locationState.js';
import { predictionService } from '../services/predictionService.js';
import { ACCIDENT_DEMO_LOCATIONS, DEMO_PREDICTION_SCENARIOS } from '../data/accidentDemoData.js';

export function renderPredictionView(router) {
  // Sync with global location state or query param (?loc=LOC001)
  const urlParams = new URLSearchParams(window.location.search);
  const paramLocId = urlParams.get('loc');
  if (paramLocId && ACCIDENT_DEMO_LOCATIONS.some(l => l.id === paramLocId)) {
    locationState.setSelectedLocationId(paramLocId);
  }

  const activeLoc = locationState.getSelectedLocation();
  const currentPrediction = locationState.getCurrentPrediction();
  const inputs = currentPrediction.inputs;
  const result = currentPrediction.result;

  const contentHtml = `
    <div class="prediction-page-container">
      <!-- TOP BANNER: DEMO PREDICTION ENGINE NOTICE -->
      <div class="demo-prediction-banner">
        <div class="banner-left">
          <span class="live-pulse-dot" style="background: var(--brand-sky);"></span>
          <div>
            <strong>DEMO PREDICTION MODE &bull; Rule-Based Risk Engine</strong>
            <p>Deterministic evaluation based on multi-parameter urban weights. Results depend strictly on selected inputs.</p>
          </div>
        </div>
        <div class="banner-actions">
          <button class="btn-scenario-quick" id="btn-scenario-safe" title="Load Safe Conditions">
            <span class="dot-indicator green"></span> Safe Scenario
          </button>
          <button class="btn-scenario-quick" id="btn-scenario-mod" title="Load Moderate Conditions">
            <span class="dot-indicator amber"></span> Moderate Scenario
          </button>
          <button class="btn-scenario-quick" id="btn-scenario-danger" title="Load Dangerous Conditions">
            <span class="dot-indicator red"></span> High-Risk Scenario
          </button>
          <button class="btn-secondary" id="btn-reset-analysis" style="padding: 6px 12px; font-size: 0.8rem;">
            Reset Analysis
          </button>
        </div>
      </div>

      <div class="prediction-grid-layout">
        <!-- LEFT COLUMN: MULTI-SECTION SIMULATION PARAMETERS -->
        <div class="dash-card prediction-form-card">
          <div class="card-header-bar">
            <div>
              <h3>Urban Road & Environmental Conditions</h3>
              <p>Configure simulation variables to infer deterministic collision risk probability.</p>
            </div>
            <button class="btn-secondary" id="btn-use-location-data" style="font-size: 0.78rem; padding: 5px 10px;" title="Reset inputs to selected location baseline">
              Use Location Data
            </button>
          </div>

          <form id="risk-prediction-form" class="prediction-form" novalidate>
            <!-- 1. LOCATION SECTION -->
            <div class="form-section-title">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <span>1. Location Parameters</span>
            </div>

            <div class="form-row">
              <div class="form-field full-width">
                <label for="pred-location">Select Demo Location</label>
                <select id="pred-location" class="form-select">
                  ${ACCIDENT_DEMO_LOCATIONS.map(l => `
                    <option value="${l.id}" ${l.id === activeLoc.id ? 'selected' : ''}>
                      ${l.id}: ${l.name} (${l.roadType})
                    </option>
                  `).join('')}
                </select>
              </div>
            </div>

            <div class="form-row two-cols">
              <div class="form-field">
                <label for="pred-lat">Latitude</label>
                <input type="text" id="pred-lat" class="form-input" value="${inputs.latitude || activeLoc.latitude}" readonly />
              </div>
              <div class="form-field">
                <label for="pred-lng">Longitude</label>
                <input type="text" id="pred-lng" class="form-input" value="${inputs.longitude || activeLoc.longitude}" readonly />
              </div>
            </div>

            <!-- 2. TIME & TRAFFIC SECTION -->
            <div class="form-section-title" style="margin-top: 14px;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span>2. Time & Traffic Density</span>
            </div>

            <div class="form-row two-cols">
              <div class="form-field">
                <label for="pred-time-category">Time Category</label>
                <select id="pred-time-category" class="form-select">
                  <option value="Day" ${inputs.timeCategory === 'Day' ? 'selected' : ''}>Day (06:00 - 17:00)</option>
                  <option value="Evening" ${inputs.timeCategory === 'Evening' ? 'selected' : ''}>Evening / Dusk (17:00 - 20:00)</option>
                  <option value="Night" ${inputs.timeCategory === 'Night' ? 'selected' : ''}>Night (20:00 - 06:00)</option>
                </select>
              </div>
              <div class="form-field">
                <label for="pred-traffic">Traffic Density</label>
                <select id="pred-traffic" class="form-select">
                  <option value="High" ${inputs.trafficDensity === 'High' || inputs.trafficDensity === 'Critical' ? 'selected' : ''}>High (+25 pts)</option>
                  <option value="Medium" ${inputs.trafficDensity === 'Medium' || inputs.trafficDensity === 'Moderate' ? 'selected' : ''}>Medium (+15 pts)</option>
                  <option value="Low" ${inputs.trafficDensity === 'Low' ? 'selected' : ''}>Low (+5 pts)</option>
                </select>
              </div>
            </div>

            <!-- 3. WEATHER & ATMOSPHERE SECTION -->
            <div class="form-section-title" style="margin-top: 14px;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"></path>
              </svg>
              <span>3. Weather & Optical Sight Visibility</span>
            </div>

            <div class="form-row two-cols">
              <div class="form-field">
                <label for="pred-weather">Weather Condition</label>
                <select id="pred-weather" class="form-select">
                  <option value="Clear" ${inputs.weather === 'Clear' ? 'selected' : ''}>Clear & Sunny (+5 pts)</option>
                  <option value="Cloudy" ${inputs.weather === 'Cloudy' ? 'selected' : ''}>Cloudy / Overcast (+8 pts)</option>
                  <option value="Rain" ${inputs.weather === 'Rain' || inputs.weather === 'Light Rain' ? 'selected' : ''}>Rain / Wet (+18 pts)</option>
                  <option value="Heavy Rain" ${inputs.weather === 'Heavy Rain' ? 'selected' : ''}>Heavy Rain & Storm (+25 pts)</option>
                  <option value="Fog" ${inputs.weather === 'Fog' || inputs.weather === 'Foggy' ? 'selected' : ''}>Dense Fog (+22 pts)</option>
                </select>
              </div>
              <div class="form-field">
                <label for="pred-visibility">Sight Visibility</label>
                <select id="pred-visibility" class="form-select">
                  <option value="10.0" ${inputs.visibility > 8 ? 'selected' : ''}>&gt; 8 km (Clear View, +2 pts)</option>
                  <option value="6.5" ${inputs.visibility >= 5 && inputs.visibility <= 8 ? 'selected' : ''}>5 - 8 km (Moderate, +5 pts)</option>
                  <option value="3.5" ${inputs.visibility >= 2 && inputs.visibility < 5 ? 'selected' : ''}>2 - 5 km (Reduced, +12 pts)</option>
                  <option value="1.5" ${inputs.visibility < 2 ? 'selected' : ''}>&lt; 2 km (Severely Impaired, +20 pts)</option>
                </select>
              </div>
            </div>

            <!-- 4. ROAD SURFACE & LIGHTING SECTION -->
            <div class="form-section-title" style="margin-top: 14px;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 19L8 5h8l4 14H4z"></path>
                <line x1="12" y1="5" x2="12" y2="19"></line>
              </svg>
              <span>4. Road Surface & Infrastructure</span>
            </div>

            <div class="form-row two-cols">
              <div class="form-field">
                <label for="pred-road-cond">Road Surface Condition</label>
                <select id="pred-road-cond" class="form-select">
                  <option value="Good" ${inputs.roadCondition === 'Good' ? 'selected' : ''}>Good / High Traction (+5 pts)</option>
                  <option value="Moderate" ${inputs.roadCondition === 'Moderate' ? 'selected' : ''}>Moderate (+12 pts)</option>
                  <option value="Poor" ${inputs.roadCondition === 'Poor' ? 'selected' : ''}>Poor / Worn / Potholes (+22 pts)</option>
                </select>
              </div>
              <div class="form-field">
                <label for="pred-lighting">Lighting Level</label>
                <select id="pred-lighting" class="form-select">
                  <option value="Good" ${inputs.lighting === 'Good' ? 'selected' : ''}>Good Streetlights (+3 pts)</option>
                  <option value="Poor" ${inputs.lighting === 'Poor' ? 'selected' : ''}>Poor / Dark (+12 pts)</option>
                </select>
              </div>
            </div>

            <!-- 5. HISTORICAL ACCIDENTS SECTION -->
            <div class="form-section-title" style="margin-top: 14px;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
              <span>5. Historical Collision Records</span>
            </div>

            <div class="form-row two-cols">
              <div class="form-field">
                <label for="pred-accidents">Historical Accident Count</label>
                <input type="number" id="pred-accidents" class="form-input" min="0" max="250" value="${inputs.historicalAccidents || activeLoc.historicalAccidents}" />
              </div>
              <div class="form-field">
                <label for="pred-hotspot">Hotspot Cluster Status</label>
                <input type="text" id="pred-hotspot" class="form-input" value="${activeLoc.hotspotStatus ? 'ACTIVE HOTSPOT (' + activeLoc.clusterId + ')' : 'REGULAR CORRIDOR'}" readonly />
              </div>
            </div>

            <!-- Processing Animation Container -->
            <div class="prediction-processing-box" id="prediction-processing-box" style="display: none;">
              <div class="processing-spinner-ring"></div>
              <div class="processing-step-text" id="processing-step-text">Analyzing location coordinates...</div>
              <div class="processing-progress-bar">
                <div class="processing-bar-fill" id="processing-bar-fill"></div>
              </div>
            </div>

            <!-- Submit Button -->
            <button type="submit" class="btn-primary" id="btn-run-prediction" style="width: 100%; margin-top: 18px; padding: 14px; font-size: 1rem; font-weight: 700;">
              <span id="btn-pred-text">ANALYZE ACCIDENT RISK</span>
            </button>
          </form>
        </div>

        <!-- RIGHT COLUMN: RESULTS, CIRCULAR GAUGE, BREAKDOWN & MAP -->
        <div class="dash-card prediction-results-card" id="pred-results-card">
          <div class="card-header-bar">
            <div>
              <h3>Calculated Risk Analysis</h3>
              <p id="pred-eval-timestamp">Evaluated at ${result.timestamp || 'just now'} &bull; Deterministic Engine</p>
            </div>
            <div style="display: flex; gap: 8px;">
              <button class="btn-secondary" id="btn-export-analysis" style="font-size: 0.8rem; padding: 6px 12px;" title="Print or save PDF report">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 4px;">
                  <polyline points="6 9 6 2 18 2 18 9"></polyline>
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                  <rect x="6" y="14" width="12" height="8"></rect>
                </svg>
                Export Analysis
              </button>
            </div>
          </div>

          <!-- Circular Score Display Banner -->
          <div class="prediction-score-banner" id="prediction-score-banner">
            <div class="circular-gauge-container">
              <svg class="circular-gauge-svg" viewBox="0 0 120 120">
                <circle class="gauge-circle-bg" cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="10"/>
                <circle
                  class="gauge-circle-val gauge-color-${result.riskLevel.toLowerCase()}"
                  id="gauge-circle-val"
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="${result.riskLevel === 'HIGH' ? '#ef4444' : result.riskLevel === 'MEDIUM' ? '#f59e0b' : '#10b981'}"
                  stroke-width="10"
                  stroke-dasharray="314.15"
                  stroke-dashoffset="${314.15 - (314.15 * result.riskScore) / 100}"
                  stroke-linecap="round"
                />
              </svg>
              <div class="gauge-center-text">
                <span class="score-val" id="pred-score-val">${result.riskScore}</span>
                <span class="score-max">/ 100</span>
              </div>
            </div>

            <div class="score-meta">
              <span class="risk-badge risk-${result.riskLevel.toLowerCase()}" id="pred-level-badge">${result.riskLevel} RISK</span>
              <h2 id="pred-location-name-display" style="font-size: 1.25rem; margin-top: 6px;">${activeLoc.name}</h2>
              <div class="meta-pills-row" style="margin-top: 6px; display: flex; gap: 8px; flex-wrap: wrap;">
                <span class="meta-pill" id="meta-pill-accidents"><strong>${inputs.historicalAccidents || activeLoc.historicalAccidents}</strong> Collisions</span>
                <span class="meta-pill" id="meta-pill-hotspot">${activeLoc.hotspotStatus ? '🔴 Active Hotspot' : '🟢 Standard Zone'}</span>
                <span class="meta-pill" id="meta-pill-pred24">Est. <strong>${result.predictedIncidents24h}</strong> incidents/24h</span>
              </div>
            </div>
          </div>

          <!-- Scenario Comparison Delta Pill -->
          <div class="scenario-delta-card" id="scenario-delta-card">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span style="font-size: 0.85rem; color: var(--text-secondary);">
                Active Scenario Risk: <strong id="delta-risk-tag" class="${result.riskLevel === 'HIGH' ? 'text-red' : result.riskLevel === 'MEDIUM' ? 'text-amber' : 'text-emerald'}">${result.riskScore}/100 (${result.riskLevel})</strong>
              </span>
              <span class="demo-tag" id="scenario-comp-note">[ DETERMINISTIC OUTPUT ]</span>
            </div>
          </div>

          <!-- Risk Breakdown Progress Bars -->
          <div class="contributors-section">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <h4 style="font-size: 0.95rem;">Exact Risk Breakdown (+Points)</h4>
              <span class="demo-tag">[ FORMULA BREAKDOWN ]</span>
            </div>
            <div class="breakdown-bars-list" id="breakdown-bars-list">
              ${result.breakdown.map(b => `
                <div class="breakdown-row-item">
                  <div class="breakdown-header">
                    <span class="b-feat"><strong>${b.feature}</strong> (${b.value})</span>
                    <strong class="b-score text-${b.score >= 18 ? 'red' : b.score >= 10 ? 'amber' : 'emerald'}">+${b.score} pts</strong>
                  </div>
                  <div class="progress-bar-track">
                    <div class="progress-bar-fill fill-${b.score >= 18 ? 'red' : b.score >= 10 ? 'amber' : 'emerald'}" style="width: ${(b.score / b.maxScore) * 100}%;"></div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Dynamic "Why This Risk?" Explanation -->
          <div class="meta-card why-risk-card" style="margin-top: 16px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
              <span class="live-pulse-dot" style="background: var(--brand-sky);"></span>
              <h4 style="font-size: 0.9rem;">Why this Risk Score? (Dynamic XAI)</h4>
            </div>
            <p id="why-risk-text" style="font-size: 0.88rem; line-height: 1.5; color: var(--text-secondary);">
              ${result.explanation}
            </p>
          </div>

          <!-- Leaflet Map Embedded in Prediction Page -->
          <div class="prediction-embedded-map-card" style="margin-top: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <h4 style="font-size: 0.9rem;">Spatial Location & Nearby Clusters</h4>
              <button class="btn-secondary" id="btn-goto-full-map" style="font-size: 0.75rem; padding: 4px 8px;">
                View on Full Risk Map &rarr;
              </button>
            </div>
            <div id="prediction-leaflet-map" style="height: 220px; width: 100%; border-radius: var(--radius-md); overflow: hidden;"></div>
          </div>

          <!-- Action Buttons -->
          <div class="prediction-actions-row" style="margin-top: 18px;">
            <button class="btn-primary" id="btn-goto-explainable">
              <span>View Explainable AI & SHAP &rarr;</span>
            </button>
            <button class="btn-secondary" id="btn-goto-prevention">
              <span>View Prevention Protocols &rarr;</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  return createProtectedLayout({
    router,
    currentPath: '/prediction',
    pageTitle: 'Accident Risk Prediction',
    pageSubtitle: 'Analyze urban road and environmental conditions to estimate accident risk.',
    contentHtml,
    onMounted: (layout) => {
      let predMap = null;
      let predMarker = null;

      const locSelect = layout.querySelector('#pred-location');
      const latInput = layout.querySelector('#pred-lat');
      const lngInput = layout.querySelector('#pred-lng');
      const trafficSelect = layout.querySelector('#pred-traffic');
      const weatherSelect = layout.querySelector('#pred-weather');
      const visSelect = layout.querySelector('#pred-visibility');
      const roadSelect = layout.querySelector('#pred-road-cond');
      const lightingSelect = layout.querySelector('#pred-lighting');
      const timeSelect = layout.querySelector('#pred-time-category');
      const accidentsInput = layout.querySelector('#pred-accidents');
      const hotspotInput = layout.querySelector('#pred-hotspot');
      const form = layout.querySelector('#risk-prediction-form');
      const submitBtn = layout.querySelector('#btn-run-prediction');
      const btnText = layout.querySelector('#btn-pred-text');
      const processingBox = layout.querySelector('#prediction-processing-box');
      const processingStepText = layout.querySelector('#processing-step-text');
      const processingBarFill = layout.querySelector('#processing-bar-fill');

      // Initialize Embedded Leaflet Map
      const mapEl = layout.querySelector('#prediction-leaflet-map');
      if (mapEl && window.L) {
        try {
          const loc = locationState.getSelectedLocation();
          predMap = window.L.map(mapEl, {
            center: [loc.latitude, loc.longitude],
            zoom: 13,
            attributionControl: true
          });

          window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors'
          }).addTo(predMap);

          // Render all other demo locations as small dots
          ACCIDENT_DEMO_LOCATIONS.forEach(l => {
            if (l.id !== loc.id) {
              const dotMarker = window.L.circleMarker([l.latitude, l.longitude], {
                radius: 5,
                color: l.historicalRisk >= 70 ? '#ef4444' : l.historicalRisk >= 40 ? '#f59e0b' : '#10b981',
                fillOpacity: 0.6
              }).addTo(predMap);
              dotMarker.bindTooltip(`${l.name} (${l.historicalRisk}/100)`);
            }
          });

          // Main Selected Marker
          const currentRiskLevel = locationState.getCurrentPrediction().result.riskLevel;
          const icon = window.L.divIcon({
            className: 'custom-pred-marker',
            html: `
              <div class="risk-marker-container ${currentRiskLevel.toLowerCase()}">
                <div class="map-marker-pulse"></div>
                <div class="risk-marker-core"></div>
              </div>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 16]
          });

          predMarker = window.L.marker([loc.latitude, loc.longitude], { icon }).addTo(predMap);
          predMarker.bindTooltip(`📍 Selected: ${loc.name}`, { permanent: true, direction: 'top' });
        } catch (e) {
          console.warn('Prediction map init error', e);
        }
      }

      function updateUIWithResult(newResult, selectedLoc) {
        // 1. Update Gauge & Score
        layout.querySelector('#pred-score-val').textContent = newResult.riskScore;
        const circle = layout.querySelector('#gauge-circle-val');
        if (circle) {
          const circumference = 314.15;
          const offset = circumference - (circumference * newResult.riskScore) / 100;
          circle.style.strokeDashoffset = offset;
          circle.setAttribute('stroke', newResult.riskLevel === 'HIGH' ? '#ef4444' : newResult.riskLevel === 'MEDIUM' ? '#f59e0b' : '#10b981');
        }

        // 2. Update Badges & Location Details
        const badge = layout.querySelector('#pred-level-badge');
        badge.textContent = `${newResult.riskLevel} RISK`;
        badge.className = `risk-badge risk-${newResult.riskLevel.toLowerCase()}`;

        layout.querySelector('#pred-location-name-display').textContent = selectedLoc.name;
        layout.querySelector('#meta-pill-accidents').innerHTML = `<strong>${newResult.inputSnapshot.historicalAccidents}</strong> Collisions`;
        layout.querySelector('#meta-pill-hotspot').innerHTML = selectedLoc.hotspotStatus ? '🔴 Active Hotspot' : '🟢 Standard Zone';
        layout.querySelector('#meta-pill-pred24').innerHTML = `Est. <strong>${newResult.predictedIncidents24h}</strong> incidents/24h`;

        // 3. Update Breakdown Bars
        layout.querySelector('#breakdown-bars-list').innerHTML = newResult.breakdown.map(b => `
          <div class="breakdown-row-item">
            <div class="breakdown-header">
              <span class="b-feat"><strong>${b.feature}</strong> (${b.value})</span>
              <strong class="b-score text-${b.score >= 18 ? 'red' : b.score >= 10 ? 'amber' : 'emerald'}">+${b.score} pts</strong>
            </div>
            <div class="progress-bar-track">
              <div class="progress-bar-fill fill-${b.score >= 18 ? 'red' : b.score >= 10 ? 'amber' : 'emerald'}" style="width: ${(b.score / b.maxScore) * 100}%;"></div>
            </div>
          </div>
        `).join('');

        // 4. Update "Why This Risk?" Text
        layout.querySelector('#why-risk-text').textContent = newResult.explanation;
        layout.querySelector('#delta-risk-tag').textContent = `${newResult.riskScore}/100 (${newResult.riskLevel})`;
        layout.querySelector('#delta-risk-tag').className = newResult.riskLevel === 'HIGH' ? 'text-red' : newResult.riskLevel === 'MEDIUM' ? 'text-amber' : 'text-emerald';

        // 5. Update Map Position & Marker
        if (predMap && predMarker) {
          predMap.flyTo([selectedLoc.latitude, selectedLoc.longitude], 13, { duration: 0.6 });
          predMarker.setLatLng([selectedLoc.latitude, selectedLoc.longitude]);
          predMarker.unbindTooltip();
          predMarker.bindTooltip(`📍 ${selectedLoc.name} (${newResult.riskScore}/100)`, { permanent: true, direction: 'top' });
        }
      }

      // Handle Location Dropdown Change
      locSelect.addEventListener('change', () => {
        const locId = locSelect.value;
        const loc = locationState.setSelectedLocationId(locId);

        latInput.value = loc.latitude;
        lngInput.value = loc.longitude;
        trafficSelect.value = loc.trafficDensity;
        weatherSelect.value = loc.weather;
        visSelect.value = loc.visibility > 8 ? "10.0" : loc.visibility >= 5 ? "6.5" : loc.visibility >= 2 ? "3.5" : "1.5";
        roadSelect.value = loc.roadCondition;
        lightingSelect.value = loc.lighting;
        timeSelect.value = loc.timeCategory;
        accidentsInput.value = loc.historicalAccidents;
        hotspotInput.value = loc.hotspotStatus ? `ACTIVE HOTSPOT (${loc.clusterId})` : 'REGULAR CORRIDOR';

        // Recalculate deterministic result immediately
        const newResult = predictionService.predict({
          locationId: loc.id,
          trafficDensity: loc.trafficDensity,
          weather: loc.weather,
          visibility: parseFloat(visSelect.value),
          roadCondition: loc.roadCondition,
          lighting: loc.lighting,
          timeCategory: loc.timeCategory,
          historicalAccidents: loc.historicalAccidents
        });

        updateUIWithResult(newResult, loc);
      });

      // "Use Location Data" Button
      layout.querySelector('#btn-use-location-data').addEventListener('click', () => {
        const loc = locationState.getSelectedLocation();
        trafficSelect.value = loc.trafficDensity;
        weatherSelect.value = loc.weather;
        visSelect.value = loc.visibility > 8 ? "10.0" : loc.visibility >= 5 ? "6.5" : loc.visibility >= 2 ? "3.5" : "1.5";
        roadSelect.value = loc.roadCondition;
        lightingSelect.value = loc.lighting;
        timeSelect.value = loc.timeCategory;
        accidentsInput.value = loc.historicalAccidents;

        const newResult = locationState.resetToLocationDefaults(loc.id).result;
        updateUIWithResult(newResult, loc);
      });

      // Quick Scenario Buttons
      function applyScenario(scenarioKey) {
        const scenario = DEMO_PREDICTION_SCENARIOS[scenarioKey];
        if (!scenario) return;

        trafficSelect.value = scenario.trafficDensity;
        weatherSelect.value = scenario.weather;
        visSelect.value = scenario.visibility > 8 ? "10.0" : scenario.visibility >= 5 ? "6.5" : scenario.visibility >= 2 ? "3.5" : "1.5";
        roadSelect.value = scenario.roadCondition;
        lightingSelect.value = scenario.lighting;
        timeSelect.value = scenario.timeCategory;
        accidentsInput.value = scenario.historicalAccidents;

        const activeLoc = locationState.getSelectedLocation();
        const newResult = predictionService.predict({
          locationId: activeLoc.id,
          trafficDensity: scenario.trafficDensity,
          weather: scenario.weather,
          visibility: scenario.visibility,
          roadCondition: scenario.roadCondition,
          lighting: scenario.lighting,
          timeCategory: scenario.timeCategory,
          historicalAccidents: scenario.historicalAccidents
        });

        updateUIWithResult(newResult, activeLoc);
      }

      layout.querySelector('#btn-scenario-safe').addEventListener('click', () => applyScenario('SAFE'));
      layout.querySelector('#btn-scenario-mod').addEventListener('click', () => applyScenario('MODERATE'));
      layout.querySelector('#btn-scenario-danger').addEventListener('click', () => applyScenario('DANGEROUS'));

      // "Reset Analysis" Button
      layout.querySelector('#btn-reset-analysis').addEventListener('click', () => {
        locSelect.value = ACCIDENT_DEMO_LOCATIONS[0].id;
        const loc = locationState.setSelectedLocationId(ACCIDENT_DEMO_LOCATIONS[0].id);

        latInput.value = loc.latitude;
        lngInput.value = loc.longitude;
        trafficSelect.value = loc.trafficDensity;
        weatherSelect.value = loc.weather;
        visSelect.value = "3.5";
        roadSelect.value = loc.roadCondition;
        lightingSelect.value = loc.lighting;
        timeSelect.value = loc.timeCategory;
        accidentsInput.value = loc.historicalAccidents;
        hotspotInput.value = loc.hotspotStatus ? `ACTIVE HOTSPOT (${loc.clusterId})` : 'REGULAR CORRIDOR';

        const defaultResult = locationState.resetToLocationDefaults(loc.id).result;
        updateUIWithResult(defaultResult, loc);
      });

      // Multi-Step Animated Prediction Processing on Form Submit
      form.addEventListener('submit', (e) => {
        e.preventDefault();

        submitBtn.disabled = true;
        processingBox.style.display = 'block';

        const steps = [
          { text: "Analyzing location coordinates & corridor geometry...", progress: "25%" },
          { text: "Evaluating traffic density & vehicle velocity vectors...", progress: "50%" },
          { text: "Evaluating weather precipitation & road surface friction...", progress: "75%" },
          { text: "Calculating deterministic risk breakdown & XAI weights...", progress: "95%" },
          { text: "Generating safety explanation and dispatch protocols...", progress: "100%" }
        ];

        let currentStep = 0;
        const stepInterval = setInterval(() => {
          if (currentStep < steps.length) {
            processingStepText.textContent = steps[currentStep].text;
            processingBarFill.style.width = steps[currentStep].progress;
            currentStep++;
          } else {
            clearInterval(stepInterval);
            processingBox.style.display = 'none';
            submitBtn.disabled = false;

            const selectedLoc = locationState.getLocationById(locSelect.value);
            const newResult = predictionService.predict({
              locationId: selectedLoc.id,
              trafficDensity: trafficSelect.value,
              weather: weatherSelect.value,
              visibility: parseFloat(visSelect.value),
              roadCondition: roadSelect.value,
              lighting: lightingSelect.value,
              timeCategory: timeSelect.value,
              historicalAccidents: parseInt(accidentsInput.value, 10) || 40
            });

            updateUIWithResult(newResult, selectedLoc);
          }
        }, 120);
      });

      // "Export Analysis" Print Handler
      layout.querySelector('#btn-export-analysis').addEventListener('click', () => {
        window.print();
      });

      // Navigation Link Buttons
      layout.querySelector('#btn-goto-full-map').addEventListener('click', () => {
        router.navigate(`/map?loc=${locSelect.value}`);
      });

      layout.querySelector('#btn-goto-explainable').addEventListener('click', () => {
        router.navigate(`/explainable-ai?loc=${locSelect.value}`);
      });

      layout.querySelector('#btn-goto-prevention').addEventListener('click', () => {
        router.navigate(`/prevention?loc=${locSelect.value}`);
      });
    }
  });
}
