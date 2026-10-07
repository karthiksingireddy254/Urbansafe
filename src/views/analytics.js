// UrbanSafe AI - Accident Analytics View
// Longitudinal Trends, Meteorological Correlations & Infrastructure Metrics derived from Centralized Demo Data

import { createProtectedLayout } from '../components/layout.js';
import { ANALYTICS_DATA } from '../data/demoAnalytics.js';
import { ACCIDENT_DEMO_LOCATIONS } from '../data/accidentDemoData.js';
import { locationState } from '../services/locationState.js';

export function renderAnalyticsView(router) {
  const contentHtml = `
    <div class="analytics-page-container">
      <!-- WORKING FILTER BAR -->
      <div class="dash-card filter-toolbar-card">
        <div class="toolbar-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
          </svg>
          <strong>Analytical Filters</strong>
          <span class="demo-tag">[ INTERACTIVE FILTERS ]</span>
        </div>

        <div class="filters-wrap-grid">
          <div class="filter-item">
            <label for="filter-weather">Atmospheric Weather</label>
            <select id="filter-weather" class="form-select filter-ctrl">
              <option value="ALL" selected>All Conditions</option>
              <option value="Rain">Rain & Heavy Rain</option>
              <option value="Fog">Dense Fog</option>
              <option value="Clear">Clear & Sunny</option>
              <option value="Cloudy">Cloudy / Overcast</option>
            </select>
          </div>

          <div class="filter-item">
            <label for="filter-traffic">Traffic Volume</label>
            <select id="filter-traffic" class="form-select filter-ctrl">
              <option value="ALL" selected>All Traffic Volumes</option>
              <option value="High">High Density</option>
              <option value="Medium">Medium Density</option>
              <option value="Low">Low Density</option>
            </select>
          </div>

          <div class="filter-item">
            <label for="filter-road-surface">Road Surface Condition</label>
            <select id="filter-road-surface" class="form-select filter-ctrl">
              <option value="ALL" selected>All Conditions</option>
              <option value="Poor">Poor / Worn / Potholes</option>
              <option value="Moderate">Moderate Friction</option>
              <option value="Good">Good / High Traction</option>
            </select>
          </div>

          <div class="filter-item">
            <label for="filter-road-type">Corridor Geometry Type</label>
            <select id="filter-road-type" class="form-select filter-ctrl">
              <option value="ALL" selected>All Corridor Types</option>
              <option value="Expressway">Expressway</option>
              <option value="Arterial">Arterial</option>
              <option value="Transit Corridor">Transit Corridor</option>
              <option value="Flyover">Flyover</option>
            </select>
          </div>
        </div>
      </div>

      <!-- ANALYTICAL CHARTS 2x2 GRID -->
      <div class="analytics-charts-grid" style="margin-top: 20px;">
        <!-- Chart 1: Accident Count by Location -->
        <div class="dash-card">
          <div class="card-header-bar">
            <div>
              <h3>Accident Count by Urban Location</h3>
              <p>Ranked historical collision frequency from centralized demo dataset (${ANALYTICS_DATA.totalAccidents} total).</p>
            </div>
            <span class="demo-tag">[ LOCATION BREAKDOWN ]</span>
          </div>
          <div class="weather-bars-list" id="location-bars-container" style="max-height: 300px; overflow-y: auto;">
            ${ANALYTICS_DATA.byLocation.slice(0, 8).map(l => `
              <div class="weather-bar-row clickable-loc-row" data-loc-name="${l.name}" style="cursor: pointer;">
                <div class="wbar-header">
                  <span><strong>${l.name}</strong></span>
                  <strong class="text-${l.riskLevel === 'HIGH' ? 'red' : l.riskLevel === 'MEDIUM' ? 'amber' : 'emerald'}">${l.count} collisions (${l.riskScore}/100)</strong>
                </div>
                <div class="progress-bar-track">
                  <div class="progress-bar-fill fill-${l.riskLevel === 'HIGH' ? 'red' : l.riskLevel === 'MEDIUM' ? 'amber' : 'emerald'}" style="width: ${(l.count / 160) * 100}%;"></div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Chart 2: Accident Count by Weather Impact -->
        <div class="dash-card">
          <div class="card-header-bar">
            <div>
              <h3>Accidents by Weather Impact</h3>
              <p>Relative distribution across varying atmospheric conditions.</p>
            </div>
            <span class="demo-tag">[ METEOROLOGICAL ]</span>
          </div>
          <div class="weather-bars-list" id="weather-bars-container">
            ${ANALYTICS_DATA.byWeather.map(w => `
              <div class="weather-bar-row">
                <div class="wbar-header">
                  <span>${w.weather} Condition</span>
                  <strong>${w.percentage}% (${w.count} collisions)</strong>
                </div>
                <div class="progress-bar-track">
                  <div class="progress-bar-fill fill-cyan" style="width: ${w.percentage * 2.2}%;"></div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Chart 3: Accidents by Road Surface Condition -->
        <div class="dash-card">
          <div class="card-header-bar">
            <div>
              <h3>Accidents by Road Surface Condition</h3>
              <p>Correlation between pavement degradation and accident severity.</p>
            </div>
            <span class="demo-tag">[ INFRASTRUCTURE ]</span>
          </div>
          <div class="weather-bars-list" id="road-bars-container">
            ${ANALYTICS_DATA.byRoadCondition.map(r => `
              <div class="weather-bar-row">
                <div class="wbar-header">
                  <span>${r.condition}</span>
                  <strong class="text-amber">${r.rate} (${r.count} collisions)</strong>
                </div>
                <div class="progress-bar-track">
                  <div class="progress-bar-fill fill-amber" style="width: ${parseFloat(r.rate) * 1.8}%;"></div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Chart 4: Accidents by Traffic Volume Level -->
        <div class="dash-card">
          <div class="card-header-bar">
            <div>
              <h3>Accidents by Traffic Density</h3>
              <p>Incident volume correlated with vehicular congestion levels.</p>
            </div>
            <span class="demo-tag">[ CONGESTION ]</span>
          </div>
          <div class="weather-bars-list" id="traffic-bars-container">
            ${ANALYTICS_DATA.byTraffic.map(t => `
              <div class="weather-bar-row">
                <div class="wbar-header">
                  <span>${t.traffic}</span>
                  <strong class="text-red">${t.percentage}% (${t.count} collisions)</strong>
                </div>
                <div class="progress-bar-track">
                  <div class="progress-bar-fill fill-red" style="width: ${t.percentage * 1.8}%;"></div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;

  return createProtectedLayout({
    router,
    currentPath: '/analytics',
    pageTitle: 'Accident Analytics & Trends',
    pageSubtitle: 'Longitudinal temporal patterns, environmental correlations, and spatial collision frequencies.',
    contentHtml,
    onMounted: (layout) => {
      // Wire filters
      const weatherFilter = layout.querySelector('#filter-weather');
      const trafficFilter = layout.querySelector('#filter-traffic');
      const roadFilter = layout.querySelector('#filter-road-surface');
      const typeFilter = layout.querySelector('#filter-road-type');

      function updateFilteredData() {
        const wVal = weatherFilter.value;
        const tVal = trafficFilter.value;
        const rVal = roadFilter.value;
        const typeVal = typeFilter.value;

        let filtered = ACCIDENT_DEMO_LOCATIONS;
        if (wVal !== 'ALL') {
          if (wVal === 'Rain') filtered = filtered.filter(l => l.weather.includes('Rain'));
          else filtered = filtered.filter(l => l.weather === wVal);
        }
        if (tVal !== 'ALL') filtered = filtered.filter(l => l.trafficDensity === tVal);
        if (rVal !== 'ALL') filtered = filtered.filter(l => l.roadCondition === rVal);
        if (typeVal !== 'ALL') filtered = filtered.filter(l => l.roadType.includes(typeVal));

        const locContainer = layout.querySelector('#location-bars-container');
        if (filtered.length === 0) {
          locContainer.innerHTML = `<div style="padding:20px; text-align:center; color:var(--text-muted);">No locations match active filter combination.</div>`;
        } else {
          locContainer.innerHTML = filtered.map(l => `
            <div class="weather-bar-row clickable-loc-row" data-loc-id="${l.id}" style="cursor: pointer;">
              <div class="wbar-header">
                <span><strong>${l.name}</strong></span>
                <strong class="text-${l.historicalRisk >= 70 ? 'red' : l.historicalRisk >= 40 ? 'amber' : 'emerald'}">${l.historicalAccidents} collisions (${l.historicalRisk}/100)</strong>
              </div>
              <div class="progress-bar-track">
                <div class="progress-bar-fill fill-${l.historicalRisk >= 70 ? 'red' : l.historicalRisk >= 40 ? 'amber' : 'emerald'}" style="width: ${(l.historicalAccidents / 160) * 100}%;"></div>
              </div>
            </div>
          `).join('');

          locContainer.querySelectorAll('.clickable-loc-row').forEach(row => {
            row.addEventListener('click', () => {
              const id = row.getAttribute('data-loc-id');
              if (id) {
                locationState.setSelectedLocationId(id);
                router.navigate(`/prediction?loc=${id}`);
              }
            });
          });
        }
      }

      layout.querySelectorAll('.filter-ctrl').forEach(ctrl => {
        ctrl.addEventListener('change', updateFilteredData);
      });

      // Initial click handler on location rows
      layout.querySelectorAll('.clickable-loc-row').forEach(row => {
        row.addEventListener('click', () => {
          const locName = row.getAttribute('data-loc-name');
          const matched = ACCIDENT_DEMO_LOCATIONS.find(l => l.name === locName);
          if (matched) {
            locationState.setSelectedLocationId(matched.id);
            router.navigate(`/prediction?loc=${matched.id}`);
          }
        });
      });
    }
  });
}
