// UrbanSafe AI - Real Dashboard Overview View
// Aggregated System Status from Centralized Demo Dataset

import { createProtectedLayout } from '../components/layout.js';
import { dashboardService } from '../services/dashboardService.js';
import { ACCIDENT_DEMO_LOCATIONS } from '../data/accidentDemoData.js';
import { locationState } from '../services/locationState.js';

export function renderDashboardView(router) {
  const kpis = dashboardService.getKpis();
  const priorityHotspots = dashboardService.getPriorityHotspots();
  const recentAlerts = dashboardService.getRecentAlerts();
  const dist = dashboardService.getRiskDistribution();

  const contentHtml = `
    <div class="dashboard-page-container">
      <!-- TOP KPI CARDS -->
      <div class="kpi-cards-grid">
        <div class="kpi-card">
          <div class="kpi-header">
            <span class="kpi-title">Total Accident Records</span>
            <span class="demo-tag">[ DEMO DATA ]</span>
          </div>
          <span class="kpi-number text-cyan">${kpis.accidentRecords.toLocaleString()}</span>
          <span class="kpi-desc">Aggregated historical accident records</span>
        </div>

        <div class="kpi-card danger">
          <div class="kpi-header">
            <span class="kpi-title">High-Risk Locations</span>
            <span class="demo-tag">[ DEMO DATA ]</span>
          </div>
          <span class="kpi-number text-red">${kpis.highRiskZones}</span>
          <span class="kpi-desc">Corridors with calculated risk &ge; 70</span>
        </div>

        <div class="kpi-card warning">
          <div class="kpi-header">
            <span class="kpi-title">Active Hotspots</span>
            <span class="demo-tag">[ DEMO DATA ]</span>
          </div>
          <span class="kpi-number text-amber">${kpis.activeHotspots}</span>
          <span class="kpi-desc">Clustered accident concentration nodes</span>
        </div>

        <div class="kpi-card success">
          <div class="kpi-header">
            <span class="kpi-title">Average Demo Risk</span>
            <span class="demo-tag">[ ${kpis.benchmarkTag} ]</span>
          </div>
          <span class="kpi-number text-emerald">${kpis.averageRiskScore} / 100</span>
          <span class="kpi-desc">Citywide simulated baseline risk</span>
        </div>
      </div>

      <!-- PROPER DASHBOARD URBAN RISK MAP -->
      <div class="dash-card map-overview-card" style="margin-bottom: 24px;">
        <div class="card-header-bar" style="flex-wrap: wrap; gap: 12px;">
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <h3 style="margin: 0;">Urban Risk Map</h3>
              <span class="demo-tag">[ DEMO DATA ]</span>
            </div>
            <p style="margin: 4px 0 0 0;">Spatial accident risk distribution and monitor nodes across the urban metropolitan grid.</p>
          </div>
          <div class="map-controls-group" style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
            <div class="filter-group" id="dash-map-filter-group" style="display: flex; gap: 4px;">
              <button class="filter-chip active" data-filter="ALL">All (${ACCIDENT_DEMO_LOCATIONS.length})</button>
              <button class="filter-chip" data-filter="LOW">Low</button>
              <button class="filter-chip" data-filter="MEDIUM">Medium</button>
              <button class="filter-chip" data-filter="HIGH">High</button>
              <button class="filter-chip" data-filter="HOTSPOT">Hotspots</button>
            </div>
            <button class="btn-primary" id="btn-open-full-map" style="padding: 6px 14px; font-size: 0.8rem; display: inline-flex; align-items: center; gap: 6px;">
              <span>Open Full Map &rarr;</span>
            </button>
          </div>
        </div>

        <!-- Leaflet Map Container (Explicit Height: 460px) -->
        <div id="dashboard-map-container" class="dashboard-leaflet-map" style="height: 460px; width: 100%; border-radius: var(--radius-md); overflow: hidden; position: relative; border: 1px solid var(--border-subtle);"></div>

        <!-- Map Legend Bar -->
        <div class="dash-map-legend-bar" style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin-top: 12px; padding: 10px 16px; background: rgba(15, 23, 42, 0.6); border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); font-size: 0.82rem;">
          <div style="display: flex; align-items: center; gap: 18px; flex-wrap: wrap;">
            <strong style="color: var(--text-primary);">Legend:</strong>
            <span style="display: inline-flex; align-items: center; gap: 6px; color: var(--text-secondary);">
              <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #10b981;"></span> Low Risk (&lt;40)
            </span>
            <span style="display: inline-flex; align-items: center; gap: 6px; color: var(--text-secondary);">
              <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #f59e0b;"></span> Medium Risk (40-69)
            </span>
            <span style="display: inline-flex; align-items: center; gap: 6px; color: var(--text-secondary);">
              <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #ef4444;"></span> High Risk (&ge;70)
            </span>
            <span style="display: inline-flex; align-items: center; gap: 6px; color: var(--text-secondary);">
              <span style="display: inline-block; color: #f59e0b; font-size: 1.1rem; line-height: 1;">★</span> Active Hotspot
            </span>
          </div>
          <div style="font-size: 0.74rem; color: var(--text-muted);">
            Click any marker to inspect corridor telemetry or run instant risk prediction.
          </div>
        </div>
      </div>

      <!-- CHARTS ROW (Risk Trend & Risk Distribution) -->
      <div class="charts-row-grid">
        <!-- Risk Trend Bar Chart -->
        <div class="dash-card">
          <div class="card-header-bar">
            <div>
              <h3>Accident Risk Trend</h3>
              <p>Temporal collision probabilities across monitored periods</p>
            </div>
            <div class="timeframe-filter-group" id="timeframe-filters">
              <button class="filter-chip active" data-tf="7D">7D</button>
              <button class="filter-chip" data-tf="30D">30D</button>
              <button class="filter-chip" data-tf="90D">90D</button>
              <button class="filter-chip" data-tf="1Y">1Y</button>
            </div>
          </div>
          <div class="trend-chart-wrapper" id="trend-chart-wrapper"></div>
        </div>

        <!-- Risk Distribution Donut Chart -->
        <div class="dash-card">
          <div class="card-header-bar">
            <div>
              <h3>Risk Distribution</h3>
              <p>Proportion of monitored urban locations by severity</p>
            </div>
            <span class="demo-tag">[ DEMO DATA ]</span>
          </div>
          <div class="distribution-chart-wrapper">
            <div class="donut-visual-container">
              <div class="donut-svg-box">
                <svg viewBox="0 0 36 36" class="donut-svg">
                  <path class="donut-ring" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="3.8"/>
                  <path class="donut-segment segment-high" stroke-dasharray="${dist.highRiskPercent}, 100" stroke-dashoffset="0" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#ef4444" stroke-width="3.8"/>
                  <path class="donut-segment segment-med" stroke-dasharray="${dist.mediumRiskPercent}, 100" stroke-dashoffset="-${dist.highRiskPercent}" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f59e0b" stroke-width="3.8"/>
                  <path class="donut-segment segment-low" stroke-dasharray="${dist.lowRiskPercent}, 100" stroke-dashoffset="-${dist.highRiskPercent + dist.mediumRiskPercent}" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#10b981" stroke-width="3.8"/>
                </svg>
                <div class="donut-center-text">
                  <span class="donut-center-num">100%</span>
                  <span class="donut-center-sub">${ACCIDENT_DEMO_LOCATIONS.length} Zones</span>
                </div>
              </div>
            </div>

            <div class="distribution-legend">
              <div class="dist-legend-item active" data-segment="HIGH">
                <span class="legend-color-dot" style="background: #ef4444;"></span>
                <span class="legend-title">High Risk</span>
                <strong class="text-red">${dist.highRiskPercent}%</strong>
                <span class="legend-hint">${dist.highCount} zones</span>
              </div>
              <div class="dist-legend-item" data-segment="MEDIUM">
                <span class="legend-color-dot" style="background: #f59e0b;"></span>
                <span class="legend-title">Medium Risk</span>
                <strong class="text-amber">${dist.mediumRiskPercent}%</strong>
                <span class="legend-hint">${dist.medCount} zones</span>
              </div>
              <div class="dist-legend-item" data-segment="LOW">
                <span class="legend-color-dot" style="background: #10b981;"></span>
                <span class="legend-title">Low Risk</span>
                <strong class="text-emerald">${dist.lowRiskPercent}%</strong>
                <span class="legend-hint">${dist.lowCount} zones</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- TOP RISK LOCATIONS TABLE -->
      <div class="dash-card">
        <div class="card-header-bar">
          <div>
            <h3>Top Risk Urban Corridors</h3>
            <p>Click any corridor below to immediately load it into the Risk Prediction engine.</p>
          </div>
          <a href="/prediction" class="card-header-link" id="link-prediction-page">Open Prediction Engine &rarr;</a>
        </div>

        <div class="table-responsive">
          <table class="data-table" id="priority-hotspots-table">
            <thead>
              <tr>
                <th>Location</th>
                <th>Risk Level</th>
                <th>Calculated Risk</th>
                <th>Recorded Collisions</th>
                <th>Hotspot Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${priorityHotspots.map(h => `
                <tr class="clickable-row" data-location-id="${h.id}">
                  <td>
                    <strong>${h.name}</strong>
                    <div style="font-size: 0.74rem; color: var(--text-muted);">${h.roadType} &bull; ${h.trafficDensity} traffic</div>
                  </td>
                  <td>
                    <span class="risk-badge risk-${h.riskLevel.toLowerCase()}">${h.riskLevel}</span>
                  </td>
                  <td><strong style="font-family: var(--font-mono);">${h.riskScore} / 100</strong></td>
                  <td><span style="font-family: var(--font-mono);">${h.accidentCount}</span> collisions</td>
                  <td>
                    <span class="status-indicator-tag ${h.hotspot ? 'active' : ''}">${h.hotspot ? 'ACTIVE HOTSPOT' : 'STANDARD'}</span>
                  </td>
                  <td>
                    <button class="btn-table-action" data-location-id="${h.id}">Analyze &rarr;</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- RECENT RISK ALERTS -->
      <div class="dash-card">
        <div class="card-header-bar">
          <div>
            <h3>Recent Automated Risk Alerts</h3>
            <p>Immediate sensor and weather triggers requiring operator review.</p>
          </div>
          <a href="/alerts" class="card-header-link" id="link-all-alerts">Go to Alerts Center &rarr;</a>
        </div>

        <div class="alerts-feed-grid">
          ${recentAlerts.map(a => `
            <div class="alert-feed-card clickable-alert" data-location-id="${a.locationId}">
              <div class="alert-feed-header">
                <span class="alert-type-tag type-${a.severity.toLowerCase()}">${a.type}</span>
                <span class="alert-time">${a.timestamp}</span>
              </div>
              <h4>${a.location}</h4>
              <p>${a.reason}</p>
              <div class="alert-feed-footer">
                <span class="risk-score-pill">Risk Score: <strong>${a.riskScore}/100</strong></span>
                <span class="link-inline">Analyze in Prediction &rarr;</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  return createProtectedLayout({
    router,
    currentPath: '/dashboard',
    pageTitle: 'Urban Safety Dashboard',
    pageSubtitle: 'Citywide accident risk intelligence and predictive safety overview.',
    contentHtml,
    onMounted: (layout) => {
      // 1. Dashboard Leaflet + OpenStreetMap Map Implementation
      const mapContainer = layout.querySelector('#dashboard-map-container');
      if (mapContainer && window.L) {
        try {
          const map = window.L.map(mapContainer, {
            center: [17.4421, 78.3912],
            zoom: 12,
            zoomControl: true,
            attributionControl: true
          });

          // OpenStreetMap Tile Layer with Attribution
          window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors'
          }).addTo(map);

          const markersLayer = window.L.layerGroup().addTo(map);
          const zonesLayer = window.L.layerGroup().addTo(map);

          function renderDashboardMarkers(filter = 'ALL') {
            markersLayer.clearLayers();
            zonesLayer.clearLayers();

            let filteredLocations = ACCIDENT_DEMO_LOCATIONS;
            if (filter === 'HIGH') filteredLocations = ACCIDENT_DEMO_LOCATIONS.filter(l => l.historicalRisk >= 70);
            else if (filter === 'MEDIUM') filteredLocations = ACCIDENT_DEMO_LOCATIONS.filter(l => l.historicalRisk >= 40 && l.historicalRisk < 70);
            else if (filter === 'LOW') filteredLocations = ACCIDENT_DEMO_LOCATIONS.filter(l => l.historicalRisk < 40);
            else if (filter === 'HOTSPOT') filteredLocations = ACCIDENT_DEMO_LOCATIONS.filter(l => l.hotspotStatus);

            filteredLocations.forEach(loc => {
              const riskLevel = loc.historicalRisk >= 70 ? 'HIGH' : loc.historicalRisk >= 40 ? 'MEDIUM' : 'LOW';
              const riskClass = riskLevel.toLowerCase();

              // Add hotspot radius zone
              if (loc.hotspotStatus) {
                window.L.circle([loc.latitude, loc.longitude], {
                  radius: 400,
                  color: riskLevel === 'HIGH' ? '#ef4444' : '#f59e0b',
                  fillColor: riskLevel === 'HIGH' ? '#ef4444' : '#f59e0b',
                  fillOpacity: 0.16,
                  weight: 1.5,
                  dashArray: '4, 4'
                }).addTo(zonesLayer);
              }

              // Marker Icon with Star badge for Hotspots
              const iconHtml = `
                <div class="risk-marker-container ${riskClass}">
                  <div class="map-marker-pulse"></div>
                  <div class="risk-marker-core"></div>
                  ${loc.hotspotStatus ? '<div class="hotspot-star-badge">★</div>' : ''}
                </div>
              `;

              const customIcon = window.L.divIcon({
                className: 'custom-dash-map-marker',
                html: iconHtml,
                iconSize: [32, 32],
                iconAnchor: [16, 16],
                popupAnchor: [0, -14]
              });

              const marker = window.L.marker([loc.latitude, loc.longitude], { icon: customIcon }).addTo(markersLayer);

              const popupContent = `
                <div class="dash-map-popup">
                  <h4>${loc.name}</h4>
                  <div class="popup-badge-row">
                    <span class="popup-risk-tag ${riskClass}">
                      ${riskLevel} RISK (${loc.historicalRisk}/100)
                    </span>
                    <span style="font-size: 0.72rem; color: #64748b; font-weight: 600;">
                      ${loc.hotspotStatus ? '★ ACTIVE HOTSPOT' : 'STANDARD'}
                    </span>
                  </div>
                  <div class="popup-grid">
                    <div><strong>Risk Score:</strong> ${loc.historicalRisk}/100</div>
                    <div><strong>Risk Level:</strong> ${riskLevel}</div>
                    <div><strong>Accidents:</strong> ${loc.historicalAccidents}</div>
                    <div><strong>Hotspot:</strong> ${loc.hotspotStatus ? 'YES' : 'NO'}</div>
                    <div><strong>Traffic:</strong> ${loc.trafficDensity}</div>
                    <div><strong>Weather:</strong> ${loc.weather}</div>
                    <div style="grid-column: span 2;"><strong>Road:</strong> ${loc.roadCondition} Surface</div>
                  </div>
                  <div class="popup-actions">
                    <button class="btn-popup-predict" onclick="window.dashAnalyzeRisk('${loc.id}')">Analyze Risk &rarr;</button>
                    <button class="btn-popup-hotspot" onclick="window.dashViewHotspot('${loc.id}')">View Hotspot</button>
                  </div>
                </div>
              `;

              marker.bindPopup(popupContent, { maxWidth: 280 });
            });
          }

          // Initial Render
          renderDashboardMarkers('ALL');

          // Filter Button Handlers
          layout.querySelectorAll('#dash-map-filter-group .filter-chip').forEach(btn => {
            btn.addEventListener('click', () => {
              layout.querySelectorAll('#dash-map-filter-group .filter-chip').forEach(b => b.classList.remove('active'));
              btn.classList.add('active');
              const filterVal = btn.getAttribute('data-filter');
              renderDashboardMarkers(filterVal);
            });
          });

          // Open Full Map Button
          layout.querySelector('#btn-open-full-map').addEventListener('click', () => {
            router.navigate('/map');
          });

        } catch (e) {
          console.warn('Dashboard map init error:', e);
        }
      }

      // Global Navigation Helpers for Popups
      window.dashAnalyzeRisk = (locId) => {
        locationState.setSelectedLocationId(locId);
        router.navigate(`/prediction?loc=${locId}`);
      };

      window.dashViewHotspot = (locId) => {
        locationState.setSelectedLocationId(locId);
        router.navigate('/hotspots');
      };

      // 2. Risk Trend Chart
      const trendWrapper = layout.querySelector('#trend-chart-wrapper');
      function renderTrendChart(tf) {
        const data = dashboardService.getRiskTrend(tf);
        trendWrapper.innerHTML = `
          <div class="trend-bars-container">
            ${data.map(item => {
              const heightPercent = Math.max(15, (item.riskIndex / 100) * 100);
              return `
                <div class="trend-bar-col" title="${item.label}: Risk ${item.riskIndex}, Accidents: ${item.accidents}">
                  <div class="trend-bar-val">${item.riskIndex}</div>
                  <div class="trend-bar-fill" style="height: ${heightPercent}%;"></div>
                  <div class="trend-bar-label">${item.label}</div>
                </div>
              `;
            }).join('')}
          </div>
        `;
      }
      renderTrendChart('7D');

      layout.querySelectorAll('#timeframe-filters .filter-chip').forEach(btn => {
        btn.addEventListener('click', () => {
          layout.querySelectorAll('#timeframe-filters .filter-chip').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          renderTrendChart(btn.getAttribute('data-tf'));
        });
      });

      // 3. Table Rows click -> opens prediction
      layout.querySelectorAll('.clickable-row').forEach(row => {
        row.addEventListener('click', () => {
          const locId = row.getAttribute('data-location-id');
          locationState.setSelectedLocationId(locId);
          router.navigate(`/prediction?loc=${locId}`);
        });
      });

      // 4. Alert cards click -> opens prediction
      layout.querySelectorAll('.clickable-alert').forEach(card => {
        card.addEventListener('click', () => {
          const locId = card.getAttribute('data-location-id');
          if (locId) {
            locationState.setSelectedLocationId(locId);
            router.navigate(`/prediction?loc=${locId}`);
          } else {
            router.navigate('/alerts');
          }
        });
      });

      layout.querySelector('#link-prediction-page').addEventListener('click', (e) => {
        e.preventDefault();
        router.navigate('/prediction');
      });

      layout.querySelector('#link-all-alerts').addEventListener('click', (e) => {
        e.preventDefault();
        router.navigate('/alerts');
      });
    }
  });
}
