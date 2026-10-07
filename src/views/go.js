// UrbanSafe AI - GO Safe Journey View
// Safety-focused route analysis showing accident-prone areas along the journey, risk scores, and live warnings

import { createProtectedLayout } from '../components/layout.js';
import { routingService } from '../services/routingService.js';
import { journeyRiskService } from '../services/journeyRiskService.js';
import { locationState } from '../services/locationState.js';

export function renderGoView(router) {
  const presets = routingService.getJourneyPresets();

  const contentHtml = `
    <div class="go-page-container">
      <!-- Top Route Planning Card -->
      <div class="go-planning-card">
        <div class="go-header-row">
          <div class="go-title-badge">
            <span class="badge-go-pill">GO</span>
            <div>
              <h3 style="margin:0; font-size: 1.15rem; color: var(--text-primary);">Safe Journey Navigator</h3>
              <p style="margin:2px 0 0 0; font-size: 0.8rem; color: var(--text-secondary);">
                Safety-optimized corridor analysis mapping accident hotspots within 500m of your route.
              </p>
            </div>
          </div>
          <span class="demo-tag">[ URBANSAFE AI &bull; LIVE ROUTE SAFETY ENGINE ]</span>
        </div>

        <!-- Route Inputs Grid -->
        <div class="go-inputs-grid">
          <!-- Origin Box -->
          <div class="go-input-box">
            <label>Origin / Starting Point</label>
            <div class="go-input-wrapper">
              <span class="go-input-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <circle cx="12" cy="12" r="4" fill="currentColor"></circle>
                </svg>
              </span>
              <input
                type="text"
                id="go-origin-input"
                class="go-text-input"
                placeholder="Detecting current location..."
                value="Current Location (Hitec City Hub)"
              />
              <button type="button" class="btn-gps-locate" id="btn-gps-locate" title="Use Live GPS">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2v4M12 18v4M2 12h4M18 12h4"></path>
                  <circle cx="12" cy="12" r="7"></circle>
                </svg>
                <span>GPS</span>
              </button>
            </div>
            <div class="go-autocomplete-dropdown" id="origin-autocomplete" style="display: none;"></div>
          </div>

          <!-- Swap Button -->
          <button type="button" class="btn-swap-locations" id="btn-swap-locations" title="Swap Origin & Destination">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M7 16V4M7 4L3 8M7 4L11 8M17 8V20M17 20L21 16M17 20L13 16"></path>
            </svg>
          </button>

          <!-- Destination Box -->
          <div class="go-input-box">
            <label>Destination</label>
            <div class="go-input-wrapper">
              <span class="go-input-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </span>
              <input
                type="text"
                id="go-dest-input"
                class="go-text-input"
                placeholder="Search destination, landmark or corridor (e.g. Airport, Charminar)..."
                value="Rajiv Gandhi International Airport (Shamshabad)"
              />
            </div>
            <div class="go-autocomplete-dropdown" id="dest-autocomplete" style="display: none;"></div>
          </div>

          <!-- Analyze Route Button -->
          <button type="button" class="btn-analyze-route" id="btn-analyze-route">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
            </svg>
            <span>Analyze Safe Route</span>
          </button>
        </div>

        <!-- Preset Chips Row -->
        <div class="go-presets-row">
          <strong style="font-size: 0.78rem; color: var(--text-muted);">Quick Routes:</strong>
          ${presets.map(p => `
            <button type="button" class="preset-chip-btn" data-preset-id="${p.id}">
              ${p.title}
            </button>
          `).join('')}
        </div>
      </div>

      <!-- Main Split View (Map + Analysis) -->
      <div class="go-main-grid">
        <!-- Interactive Route Map Card -->
        <div class="go-map-card">
          <!-- Live Warning Banner (Shown during simulation / proximity alert) -->
          <div class="live-risk-warning-banner" id="live-risk-warning-banner" style="display: none;">
            <div class="warning-banner-left">
              <div class="warning-icon-box">⚠️</div>
              <div class="warning-text">
                <h4 id="warning-title">HIGH-RISK AREA AHEAD</h4>
                <p id="warning-desc">Approaching critical collision zone in 450 m. Slow down to 35 km/h.</p>
              </div>
            </div>
            <button type="button" class="panel-close-btn" id="btn-dismiss-warning" style="color:#ffffff;">&times;</button>
          </div>

          <!-- Leaflet Map Container -->
          <div id="go-leaflet-map"></div>

          <!-- Floating Map Legend -->
          <div class="dash-map-legend-bar" style="margin-top: 12px; padding: 8px 14px; background: rgba(15,23,42,0.75); border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; font-size: 0.78rem;">
            <div style="display: flex; gap: 14px; align-items: center; flex-wrap: wrap;">
              <strong style="color: var(--text-primary);">Route Legend:</strong>
              <span style="display:inline-flex; align-items:center; gap:4px; color:var(--text-secondary);">
                <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:#10b981;"></span> Low Risk (&lt;40)
              </span>
              <span style="display:inline-flex; align-items:center; gap:4px; color:var(--text-secondary);">
                <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:#f59e0b;"></span> Medium Risk (40-69)
              </span>
              <span style="display:inline-flex; align-items:center; gap:4px; color:var(--text-secondary);">
                <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:#ef4444;"></span> High Risk (&ge;70)
              </span>
              <span style="display:inline-flex; align-items:center; gap:4px; color:var(--text-secondary);">
                <span style="color:#f59e0b; font-size:1rem; line-height:1;">★</span> Hotspot (&le;500m)
              </span>
            </div>
            <span style="color:var(--text-muted); font-size:0.72rem;">Only corridor hotspots near route are displayed.</span>
          </div>
        </div>

        <!-- Safe Journey Analysis Summary Panel -->
        <div class="go-analysis-card" id="go-analysis-panel">
          <div class="analysis-header">
            <div>
              <h3 style="margin:0; font-size:1.1rem; color:var(--text-primary);">Safe Journey Analysis</h3>
              <p style="margin:2px 0 0 0; font-size:0.78rem; color:var(--text-secondary);">Safety scoring and proactive hazard advisory</p>
            </div>
            <span class="risk-badge" id="route-level-badge">CALCULATING</span>
          </div>

          <!-- Route Risk Score & Travel Distance Metrics -->
          <div class="route-kpi-block" id="route-kpi-block">
            <div class="route-score-gauge risk-high" id="route-score-gauge">
              <span class="gauge-num" id="route-risk-score-num">--</span>
              <span class="gauge-lbl">/ 100</span>
            </div>
            <div class="route-stat-item">
              <span class="route-stat-val" id="route-distance-val">-- km</span>
              <span class="route-stat-lbl">Route Distance</span>
            </div>
            <div class="route-stat-item">
              <span class="route-stat-val" id="route-duration-val">-- mins</span>
              <span class="route-stat-lbl">Est. Travel Time</span>
            </div>
          </div>

          <!-- Risk Zones Count Breakdown -->
          <div>
            <span style="font-size:0.76rem; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.04em; display:block; margin-bottom:8px;">
              Detected Corridor Hazards (&le; 500m threshold):
            </span>
            <div class="risk-pills-row">
              <span class="risk-count-pill pill-high" id="pill-high-count">🔴 0 High Risk</span>
              <span class="risk-count-pill pill-med" id="pill-med-count">🟠 0 Medium Risk</span>
              <span class="risk-count-pill pill-low" id="pill-low-count">🟢 0 Low Risk</span>
            </div>
          </div>

          <!-- Safety Recommendations -->
          <div>
            <span style="font-size:0.76rem; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.04em; display:block; margin-bottom:8px;">
              Proactive Safety Recommendations:
            </span>
            <div class="recommendations-box" id="recommendations-box">
              <div class="recommendation-item">
                <span class="rec-icon">🛡️</span>
                <div class="rec-content">
                  <strong>Standard Defensive Navigation</strong>
                  <p>Analyzing route coordinates against urban risk layers...</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Corridor Hotspots List -->
          <div>
            <span style="font-size:0.76rem; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.04em; display:block; margin-bottom:8px;">
              Accident Zones Along Path:
            </span>
            <div class="corridor-zones-list" id="corridor-zones-list">
              <!-- Populated dynamically -->
            </div>
          </div>

          <!-- Live Journey Actions -->
          <div class="journey-action-footer">
            <button type="button" class="btn-start-journey" id="btn-start-journey">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
              <span>Start Safe Journey Mode</span>
            </button>
            <button type="button" class="btn-stop-journey" id="btn-stop-journey" style="display: none;">
              <span>End Journey</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  return createProtectedLayout({
    router,
    currentPath: '/go',
    pageTitle: 'GO — Safe Journey',
    pageSubtitle: 'Safety-focused route intelligence mapping accident hotspots and proactive driving recommendations.',
    contentHtml,
    onMounted: async (layout) => {
      let map = null;
      let routePolyline = null;
      let markersLayer = null;
      let userVehicleMarker = null;
      let activeRouteData = null;
      let activeRiskAnalysis = null;
      let simulationIntervalId = null;
      let simulationStep = 0;
      let alertedZonesSet = new Set();

      let originPoint = { name: 'Hitec City Cyber Towers', latitude: 17.4504, longitude: 78.3808 };
      let destPoint = { name: 'Rajiv Gandhi International Airport (Shamshabad)', latitude: 17.2403, longitude: 78.4294 };

      const originInput = layout.querySelector('#go-origin-input');
      const destInput = layout.querySelector('#go-dest-input');
      const originDropdown = layout.querySelector('#origin-autocomplete');
      const destDropdown = layout.querySelector('#dest-autocomplete');
      const analyzeBtn = layout.querySelector('#btn-analyze-route');
      const gpsBtn = layout.querySelector('#btn-gps-locate');
      const swapBtn = layout.querySelector('#btn-swap-locations');
      const startJourneyBtn = layout.querySelector('#btn-start-journey');
      const stopJourneyBtn = layout.querySelector('#btn-stop-journey');
      const warningBanner = layout.querySelector('#live-risk-warning-banner');
      const warningTitle = layout.querySelector('#warning-title');
      const warningDesc = layout.querySelector('#warning-desc');
      const dismissWarningBtn = layout.querySelector('#btn-dismiss-warning');

      // 1. Initialize Map
      const mapContainer = layout.querySelector('#go-leaflet-map');
      if (mapContainer && window.L) {
        try {
          map = window.L.map(mapContainer, {
            center: [17.3850, 78.4400],
            zoom: 12,
            attributionControl: true
          });

          window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors'
          }).addTo(map);

          markersLayer = window.L.layerGroup().addTo(map);
        } catch (e) {
          console.warn('GO Map init warning:', e);
        }
      }

      // 2. Perform Geolocation Detection on Page Load
      try {
        const detectedPos = await routingService.getCurrentPosition();
        if (detectedPos) {
          originPoint = {
            name: detectedPos.name,
            latitude: detectedPos.latitude,
            longitude: detectedPos.longitude
          };
          originInput.value = detectedPos.name;
        }
      } catch (err) {
        console.warn('Geolocation init warning:', err);
      }

      // 3. Core Route & Risk Analysis Executor
      async function runSafeJourneyAnalysis() {
        if (!originPoint || !destPoint) return;

        analyzeBtn.disabled = true;
        analyzeBtn.innerHTML = `
          <div class="btn-auth-spinner" style="width:14px; height:14px; border:2px solid #ffffff; border-top-color:transparent; border-radius:50%; animation:spin 0.8s linear infinite;"></div>
          <span>Analyzing Route Safety...</span>
        `;

        try {
          // Calculate Driving Route Path
          activeRouteData = await routingService.calculateRoute(originPoint, destPoint);

          // Evaluate Route Against Accident & Risk Hotspot Dataset
          activeRiskAnalysis = await journeyRiskService.analyzeRoute(activeRouteData.coordinates, 500);

          // Update UI & Leaflet Map
          renderMapLayers(activeRouteData, activeRiskAnalysis);
          renderSummaryPanel(activeRouteData, activeRiskAnalysis);

        } catch (err) {
          console.error('Safe Journey calculation error:', err);
        } finally {
          analyzeBtn.disabled = false;
          analyzeBtn.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
            </svg>
            <span>Analyze Safe Route</span>
          `;
        }
      }

      // 4. Render Map Visuals (Route polyline, Origin/Destination, and ONLY corridor risk markers within 500m)
      function renderMapLayers(routeData, riskData) {
        if (!map || !markersLayer) return;

        markersLayer.clearLayers();
        if (routePolyline) {
          map.removeLayer(routePolyline);
          routePolyline = null;
        }

        const coords = routeData.coordinates;
        if (!coords || coords.length === 0) return;

        // Choose route line color based on overall risk
        const routeColor = riskData.overallRiskLevel === 'HIGH' ? '#ef4444' : riskData.overallRiskLevel === 'MEDIUM' ? '#f59e0b' : '#10b981';

        // Outer Glow Polyline
        window.L.polyline(coords, {
          color: routeColor,
          weight: 9,
          opacity: 0.28,
          lineCap: 'round',
          lineJoin: 'round'
        }).addTo(markersLayer);

        // Main Polyline
        routePolyline = window.L.polyline(coords, {
          color: routeColor,
          weight: 5,
          opacity: 0.95,
          lineCap: 'round',
          lineJoin: 'round'
        }).addTo(map);

        // Fit Bounds
        map.fitBounds(routePolyline.getBounds(), { padding: [40, 40] });

        // Origin Marker (Blue Pulsating Beacon)
        const startIcon = window.L.divIcon({
          className: 'custom-start-marker',
          html: `
            <div style="position:relative; width:28px; height:28px; display:flex; align-items:center; justify-content:center;">
              <div style="position:absolute; width:100%; height:100%; border-radius:50%; background:rgba(14,165,233,0.5); animation:pulseDot 1.8s infinite;"></div>
              <div style="width:14px; height:14px; border-radius:50%; background:#0284c7; border:2.5px solid #ffffff; box-shadow:0 0 10px #0284c7; z-index:2;"></div>
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });

        const startMarker = window.L.marker(coords[0], { icon: startIcon }).addTo(markersLayer);
        startMarker.bindPopup(`<strong>Origin:</strong> ${originPoint.name}`);

        // Destination Marker (Target / Flag Pin)
        const destIcon = window.L.divIcon({
          className: 'custom-dest-marker',
          html: `
            <div style="position:relative; width:32px; height:32px; display:flex; align-items:center; justify-content:center;">
              <div style="width:24px; height:24px; border-radius:50%; background:#ef4444; border:2px solid #ffffff; display:flex; align-items:center; justify-content:center; color:#ffffff; font-size:12px; font-weight:bold; box-shadow:0 0 12px rgba(239,68,68,0.6);">🏁</div>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        const endMarker = window.L.marker(coords[coords.length - 1], { icon: destIcon }).addTo(markersLayer);
        endMarker.bindPopup(`<strong>Destination:</strong> ${destPoint.name}`);

        // Risk & Hotspot Markers ALONG THE ROUTE ONLY
        riskData.corridorRiskZones.forEach((spot) => {
          const riskLevel = spot.riskLevel || (spot.historicalRisk >= 70 ? 'HIGH' : spot.historicalRisk >= 40 ? 'MEDIUM' : 'LOW');
          const riskClass = riskLevel.toLowerCase();

          // Zone buffer circle
          window.L.circle([spot.latitude, spot.longitude], {
            radius: 350,
            color: riskLevel === 'HIGH' ? '#ef4444' : '#f59e0b',
            fillColor: riskLevel === 'HIGH' ? '#ef4444' : '#f59e0b',
            fillOpacity: 0.18,
            weight: 1.5,
            dashArray: '3, 3'
          }).addTo(markersLayer);

          // Marker Pin with Star Badge if Hotspot
          const spotIcon = window.L.divIcon({
            className: 'custom-route-risk-pin',
            html: `
              <div class="risk-marker-container ${riskClass}">
                <div class="map-marker-pulse"></div>
                <div class="risk-marker-core"></div>
                ${spot.hotspotStatus ? '<div class="hotspot-star-badge">★</div>' : ''}
              </div>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
            popupAnchor: [0, -14]
          });

          const spotMarker = window.L.marker([spot.latitude, spot.longitude], { icon: spotIcon }).addTo(markersLayer);

          const popupContent = `
            <div class="dash-map-popup">
              <h4>${spot.name}</h4>
              <div class="popup-badge-row">
                <span class="popup-risk-tag ${riskClass}">
                  ${riskLevel} RISK (${spot.historicalRisk}/100)
                </span>
                <span style="font-size: 0.72rem; color: #64748b; font-weight: 600;">
                  ${spot.distanceFromRouteMeters}m from route
                </span>
              </div>
              <div class="popup-grid">
                <div><strong>Accidents:</strong> ${spot.historicalAccidents}</div>
                <div><strong>Traffic:</strong> ${spot.trafficDensity}</div>
                <div><strong>Weather:</strong> ${spot.weather}</div>
                <div><strong>Road:</strong> ${spot.roadCondition}</div>
                <div style="grid-column: span 2;">
                  <strong>Primary Factor:</strong> ${spot.primaryCause || 'Corridor bottleneck conflict'}
                </div>
              </div>
              <div style="margin-top: 6px; padding: 6px 8px; background: rgba(2,132,199,0.08); border-left: 2px solid #0284c7; font-size: 0.74rem; color: #334155; border-radius: 4px;">
                <strong>Recommended Action:</strong> ${spot.preventionRecommendation}
              </div>
            </div>
          `;

          spotMarker.bindPopup(popupContent, { maxWidth: 290 });
        });
      }

      // 5. Render Analysis Summary Panel
      function renderSummaryPanel(routeData, riskData) {
        // Route score & badges
        const scoreNum = layout.querySelector('#route-risk-score-num');
        const scoreGauge = layout.querySelector('#route-score-gauge');
        const levelBadge = layout.querySelector('#route-level-badge');
        const distVal = layout.querySelector('#route-distance-val');
        const durVal = layout.querySelector('#route-duration-val');

        scoreNum.textContent = riskData.overallRouteRiskScore;
        scoreGauge.className = `route-score-gauge risk-${riskData.overallRiskLevel.toLowerCase()}`;
        levelBadge.textContent = `${riskData.overallRiskLevel} ROUTE RISK`;
        levelBadge.className = `risk-badge risk-${riskData.overallRiskLevel.toLowerCase()}`;

        distVal.textContent = `${routeData.distanceKm} km`;
        durVal.textContent = `${routeData.durationMinutes} mins`;

        // Risk Zone Counts
        layout.querySelector('#pill-high-count').textContent = `🔴 ${riskData.highRiskCount} High Risk`;
        layout.querySelector('#pill-med-count').textContent = `🟠 ${riskData.mediumRiskCount} Medium Risk`;
        layout.querySelector('#pill-low-count').textContent = `🟢 ${riskData.lowRiskCount} Low Risk`;

        // Safety Recommendations Box
        const recsBox = layout.querySelector('#recommendations-box');
        recsBox.innerHTML = riskData.recommendations.map(r => `
          <div class="recommendation-item">
            <span class="rec-icon">${r.icon}</span>
            <div class="rec-content">
              <strong>${r.hazard}</strong>
              <p>${r.action}</p>
            </div>
          </div>
        `).join('');

        // Corridor Hotspots Along Route List
        const zonesList = layout.querySelector('#corridor-zones-list');
        if (riskData.corridorRiskZones.length === 0) {
          zonesList.innerHTML = `
            <div style="padding: 10px; text-align: center; color: var(--text-muted); font-size: 0.8rem;">
              🟢 No critical accident hotspots within 500m of this route path.
            </div>
          `;
        } else {
          zonesList.innerHTML = riskData.corridorRiskZones.map((z, idx) => `
            <div class="corridor-zone-item">
              <div>
                <strong style="color: var(--text-primary);">${idx + 1}. ${z.name}</strong>
                <div style="font-size: 0.72rem; color: var(--text-muted);">${z.proximityTag} &bull; ${z.historicalAccidents} collisions</div>
              </div>
              <span class="popup-risk-tag ${z.historicalRisk >= 70 ? 'high' : z.historicalRisk >= 40 ? 'medium' : 'low'}">
                ${z.historicalRisk}/100
              </span>
            </div>
          `).join('');
        }
      }

      // 6. Live Safe Journey Navigation Simulation Mode
      function startLiveJourneyMode() {
        if (!activeRouteData || !activeRiskAnalysis) return;

        simulationStep = 0;
        alertedZonesSet.clear();

        startJourneyBtn.style.display = 'none';
        stopJourneyBtn.style.display = 'inline-block';

        const coords = activeRouteData.coordinates;

        // Create Vehicle Marker
        if (!userVehicleMarker && map) {
          const vehicleIcon = window.L.divIcon({
            className: 'user-vehicle-marker',
            html: `
              <div style="width:28px; height:28px; background:#00f2fe; border:2.5px solid #ffffff; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 0 16px #00f2fe; font-size:14px;">
                🚗
              </div>
            `,
            iconSize: [28, 28],
            iconAnchor: [14, 14]
          });
          userVehicleMarker = window.L.marker(coords[0], { icon: vehicleIcon, zIndexOffset: 2000 }).addTo(map);
        }

        // Live Simulation Loop (Advances every 1.2 seconds)
        simulationIntervalId = setInterval(() => {
          if (simulationStep >= coords.length) {
            endLiveJourneyMode();
            showWarning('🎉 Destination Reached', 'You have arrived safely at your destination.', 'success');
            return;
          }

          const curPos = coords[simulationStep];
          if (userVehicleMarker) {
            userVehicleMarker.setLatLng(curPos);
          }

          // Check proximity to upcoming risk zones along the route
          activeRiskAnalysis.corridorRiskZones.forEach(zone => {
            const dist = journeyRiskService.getHaversineDistanceMeters(curPos[0], curPos[1], zone.latitude, zone.longitude);
            if (dist <= 600 && !alertedZonesSet.has(zone.id)) {
              alertedZonesSet.add(zone.id);
              showWarning(
                `⚠️ ${zone.riskLevel} RISK ZONE AHEAD (${Math.round(dist)}m)`,
                `Approaching ${zone.name} (Risk ${zone.historicalRisk}/100). ${zone.preventionRecommendation || 'Reduce speed and maintain following distance.'}`,
                'danger'
              );
            }
          });

          simulationStep++;
        }, 1200);
      }

      function endLiveJourneyMode() {
        if (simulationIntervalId) {
          clearInterval(simulationIntervalId);
          simulationIntervalId = null;
        }
        if (userVehicleMarker && map) {
          map.removeLayer(userVehicleMarker);
          userVehicleMarker = null;
        }
        startJourneyBtn.style.display = 'inline-flex';
        stopJourneyBtn.style.display = 'none';
        warningBanner.style.display = 'none';
      }

      function showWarning(title, desc, type = 'danger') {
        warningTitle.textContent = title;
        warningDesc.textContent = desc;
        warningBanner.style.display = 'flex';
      }

      dismissWarningBtn.addEventListener('click', () => {
        warningBanner.style.display = 'none';
      });

      startJourneyBtn.addEventListener('click', startLiveJourneyMode);
      stopJourneyBtn.addEventListener('click', endLiveJourneyMode);

      // 7. Autocomplete Search Handlers
      function setupAutocomplete(inputEl, dropdownEl, onSelect) {
        inputEl.addEventListener('input', (e) => {
          const val = e.target.value.trim();
          if (val.length < 2) {
            dropdownEl.style.display = 'none';
            return;
          }
          const matches = routingService.searchDestinations(val);
          if (matches.length === 0) {
            dropdownEl.innerHTML = `<div class="autocomplete-item" style="color:var(--text-muted);">No locations found</div>`;
          } else {
            dropdownEl.innerHTML = matches.map(m => `
              <div class="autocomplete-item" data-id="${m.id}" data-lat="${m.latitude}" data-lng="${m.longitude}" data-name="${m.name}">
                <div>
                  <strong>${m.name}</strong>
                  <div class="autocomplete-category">${m.category || 'Corridor'}</div>
                </div>
                ${m.riskScore ? `<span class="popup-risk-tag ${m.riskLevel.toLowerCase()}">${m.riskScore}/100</span>` : ''}
              </div>
            `).join('');

            dropdownEl.querySelectorAll('.autocomplete-item').forEach(item => {
              item.addEventListener('click', () => {
                const name = item.getAttribute('data-name');
                const lat = Number(item.getAttribute('data-lat'));
                const lng = Number(item.getAttribute('data-lng'));
                inputEl.value = name;
                dropdownEl.style.display = 'none';
                onSelect({ name, latitude: lat, longitude: lng });
              });
            });
          }
          dropdownEl.style.display = 'block';
        });
      }

      setupAutocomplete(originInput, originDropdown, (point) => { originPoint = point; });
      setupAutocomplete(destInput, destDropdown, (point) => { destPoint = point; });

      // Close dropdowns on click outside
      document.addEventListener('click', (e) => {
        if (!originInput.contains(e.target) && !originDropdown.contains(e.target)) originDropdown.style.display = 'none';
        if (!destInput.contains(e.target) && !destDropdown.contains(e.target)) destDropdown.style.display = 'none';
      });

      // Swap button
      swapBtn.addEventListener('click', () => {
        const temp = originPoint;
        originPoint = destPoint;
        destPoint = temp;

        const tempVal = originInput.value;
        originInput.value = destInput.value;
        destInput.value = tempVal;

        runSafeJourneyAnalysis();
      });

      // GPS Locate Button
      gpsBtn.addEventListener('click', async () => {
        originInput.value = 'Locating GPS...';
        const detected = await routingService.getCurrentPosition();
        originPoint = {
          name: detected.name,
          latitude: detected.latitude,
          longitude: detected.longitude
        };
        originInput.value = detected.name;
        runSafeJourneyAnalysis();
      });

      // Analyze Button
      analyzeBtn.addEventListener('click', runSafeJourneyAnalysis);

      // Preset Chips Click Handlers
      layout.querySelectorAll('.preset-chip-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const presetId = btn.getAttribute('data-preset-id');
          const p = presets.find(item => item.id === presetId);
          if (p) {
            originPoint = { ...p.origin };
            destPoint = { ...p.destination };
            originInput.value = p.origin.name;
            destInput.value = p.destination.name;
            runSafeJourneyAnalysis();
          }
        });
      });

      // Initial execution on load
      setTimeout(() => {
        runSafeJourneyAnalysis();
      }, 100);
    }
  });
}
