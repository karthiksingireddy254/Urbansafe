// UrbanSafe AI - Full Featured Urban Risk Map View
// GIS Risk Map with Shared Centralized Data & Global Location Navigation

import { createProtectedLayout } from '../components/layout.js';
import { DEMO_LOCATIONS } from '../data/demoLocations.js';
import { locationState } from '../services/locationState.js';

export function renderMapView(router) {
  const urlParams = new URLSearchParams(window.location.search);
  const paramLocId = urlParams.get('loc');
  if (paramLocId && DEMO_LOCATIONS.some(l => l.id === paramLocId)) {
    locationState.setSelectedLocationId(paramLocId);
  }

  const initialLoc = locationState.getSelectedLocation();

  const contentHtml = `
    <div class="map-page-layout">
      <!-- Top Map Filter & Action Bar -->
      <div class="dash-card map-toolbar-card">
        <div class="map-toolbar-left">
          <div class="filter-group">
            <span class="filter-label">Filter Severity:</span>
            <button class="filter-chip active" data-filter="ALL">All (${DEMO_LOCATIONS.length})</button>
            <button class="filter-chip" data-filter="HIGH">High Risk (${DEMO_LOCATIONS.filter(l => l.riskLevel === 'HIGH').length})</button>
            <button class="filter-chip" data-filter="MEDIUM">Medium Risk (${DEMO_LOCATIONS.filter(l => l.riskLevel === 'MEDIUM').length})</button>
            <button class="filter-chip" data-filter="LOW">Low Risk (${DEMO_LOCATIONS.filter(l => l.riskLevel === 'LOW').length})</button>
            <button class="filter-chip" data-filter="HOTSPOT">Hotspots (${DEMO_LOCATIONS.filter(l => l.hotspot).length})</button>
          </div>
        </div>

        <div class="map-toolbar-right">
          <button class="map-layer-btn active" id="btn-layer-pins">Accident Markers</button>
          <button class="map-layer-btn active" id="btn-layer-hotspots">Hotspot Zones</button>
          <button class="map-action-btn" id="btn-recenter-map" title="Recenter to City Center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="2" y1="12" x2="6" y2="12"></line>
              <line x1="18" y1="12" x2="22" y2="12"></line>
              <line x1="12" y1="2" x2="12" y2="6"></line>
              <line x1="12" y1="18" x2="12" y2="22"></line>
            </svg>
            <span>City Core</span>
          </button>
        </div>
      </div>

      <!-- Main Map & Detail Panel Split Container -->
      <div class="map-viewport-wrapper">
        <div id="full-gis-map" class="full-gis-map"></div>

        <!-- Floating Legend -->
        <div class="map-legend-box">
          <div class="legend-header"><strong>Risk Legend</strong></div>
          <div class="legend-row"><span class="legend-dot red"></span> High Risk (70-100)</div>
          <div class="legend-row"><span class="legend-dot amber"></span> Medium Risk (40-69)</div>
          <div class="legend-row"><span class="legend-dot green"></span> Low Risk (0-39)</div>
          <div class="legend-row"><span style="color:#f59e0b; font-size: 1rem; line-height: 1;">★</span> Active Hotspot</div>
        </div>

        <!-- Selected Location Floating Sidebar Detail Panel -->
        <div class="map-detail-sidepanel open" id="map-detail-sidepanel">
          <div class="sidepanel-header">
            <div>
              <span class="risk-badge risk-${initialLoc.historicalRisk >= 70 ? 'high' : initialLoc.historicalRisk >= 40 ? 'medium' : 'low'}" id="panel-risk-badge">
                ${initialLoc.historicalRisk >= 70 ? 'HIGH' : initialLoc.historicalRisk >= 40 ? 'MEDIUM' : 'LOW'} RISK
              </span>
              <h3 id="panel-location-name" style="margin-top: 4px;">${initialLoc.name}</h3>
            </div>
            <button class="panel-close-btn" id="panel-close-btn">&times;</button>
          </div>

          <div class="sidepanel-body" id="panel-location-body">
            <div class="panel-stat-row">
              <div class="panel-stat-box">
                <span class="pstat-val text-red" id="panel-risk-score">${initialLoc.historicalRisk}/100</span>
                <span class="pstat-lbl">Demo Risk Score</span>
              </div>
              <div class="panel-stat-box">
                <span class="pstat-val" id="panel-accidents">${initialLoc.historicalAccidents}</span>
                <span class="pstat-lbl">Collisions</span>
              </div>
              <div class="panel-stat-box">
                <span class="pstat-val text-amber" id="panel-hotspot-status">${initialLoc.hotspotStatus ? 'ACTIVE' : 'NONE'}</span>
                <span class="pstat-lbl">Hotspot Status</span>
              </div>
            </div>

            <div class="panel-section">
              <h4>Corridor Telemetry</h4>
              <p id="panel-road-type"><strong>Type:</strong> ${initialLoc.roadType}</p>
              <p id="panel-traffic"><strong>Traffic Density:</strong> ${initialLoc.trafficDensity}</p>
              <p id="panel-weather"><strong>Atmosphere:</strong> ${initialLoc.weather} (${initialLoc.visibility} km vis)</p>
              <p id="panel-surface"><strong>Surface:</strong> ${initialLoc.roadCondition} Condition</p>
            </div>

            <div class="panel-section">
              <h4>Primary Hazard Contributors</h4>
              <div id="panel-risk-factors" class="factors-mini-list">
                ${(initialLoc.riskFactors || []).map(f => `
                  <div style="display:flex; justify-content:space-between; margin-top:4px; font-size:0.8rem;">
                    <span>${f.factor}</span>
                    <strong class="text-amber">${f.impact}</strong>
                  </div>
                `).join('')}
              </div>
            </div>

            <div class="panel-section">
              <h4>Automated Preventive Recommendation</h4>
              <div class="advisory-box" id="panel-advisory">
                ${initialLoc.preventionRecommendation || 'Deploy dynamic speed limit signs and increase traffic monitoring.'}
              </div>
            </div>
          </div>

          <div class="sidepanel-footer">
            <button class="btn-primary" id="btn-analyze-location">
              <span>Analyze in Prediction &rarr;</span>
            </button>
            <button class="btn-secondary" id="btn-view-explanation">
              <span>View Explainable AI</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  return createProtectedLayout({
    router,
    currentPath: '/map',
    pageTitle: 'Urban Risk Map',
    pageSubtitle: 'Citywide GIS spatial accident risk visualization and real-time hazard layers.',
    contentHtml,
    onMounted: (layout) => {
      let activeLocation = locationState.getSelectedLocation();
      let map = null;
      let markersGroup = null;
      let hotspotsGroup = null;
      let currentFilter = 'ALL';

      const mapContainer = layout.querySelector('#full-gis-map');
      const sidepanel = layout.querySelector('#map-detail-sidepanel');

      function updatePanel(loc) {
        activeLocation = loc;
        locationState.setSelectedLocationId(loc.id);

        layout.querySelector('#panel-location-name').textContent = loc.name;
        const badge = layout.querySelector('#panel-risk-badge');
        badge.textContent = `${loc.riskLevel} RISK`;
        badge.className = `risk-badge risk-${loc.riskLevel.toLowerCase()}`;

        layout.querySelector('#panel-risk-score').textContent = `${loc.riskScore}/100`;
        layout.querySelector('#panel-accidents').textContent = loc.accidentCount;
        layout.querySelector('#panel-hotspot-status').textContent = loc.hotspot ? `YES (${loc.clusterId || 'H01'})` : 'NO';

        layout.querySelector('#panel-road-type').innerHTML = `<strong>Type:</strong> ${loc.roadType}`;
        layout.querySelector('#panel-traffic').innerHTML = `<strong>Traffic Density:</strong> ${loc.trafficDensity}`;
        layout.querySelector('#panel-weather').innerHTML = `<strong>Atmosphere:</strong> ${loc.weather} (${loc.visibility} km vis)`;
        layout.querySelector('#panel-surface').innerHTML = `<strong>Surface:</strong> ${loc.roadCondition} Condition`;

        layout.querySelector('#panel-risk-factors').innerHTML = (loc.riskFactors || []).map(f => `
          <div style="display:flex; justify-content:space-between; margin-top:4px; font-size:0.8rem;">
            <span>${f.factor}</span>
            <strong class="text-amber">${f.impact}</strong>
          </div>
        `).join('');

        layout.querySelector('#panel-advisory').textContent = loc.preventionRecommendation || loc.advisory;
        sidepanel.classList.add('open');
      }

      if (mapContainer && window.L) {
        try {
          map = window.L.map(mapContainer, {
            center: [activeLocation.lat || 17.4421, activeLocation.lng || 78.3912],
            zoom: 13,
            attributionControl: true
          });

          window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors'
          }).addTo(map);

          markersGroup = window.L.layerGroup().addTo(map);
          hotspotsGroup = window.L.layerGroup().addTo(map);

          function renderMapLayers(filter) {
            markersGroup.clearLayers();
            hotspotsGroup.clearLayers();

            let list = DEMO_LOCATIONS;
            if (filter === 'HIGH') list = DEMO_LOCATIONS.filter(l => l.riskLevel === 'HIGH');
            else if (filter === 'MEDIUM') list = DEMO_LOCATIONS.filter(l => l.riskLevel === 'MEDIUM');
            else if (filter === 'LOW') list = DEMO_LOCATIONS.filter(l => l.riskLevel === 'LOW');
            else if (filter === 'HOTSPOT') list = DEMO_LOCATIONS.filter(l => l.hotspot);

            list.forEach(loc => {
              // Hotspot zone ring
              if (loc.hotspot) {
                window.L.circle([loc.lat, loc.lng], {
                  radius: 450,
                  color: loc.riskLevel === 'HIGH' ? '#ef4444' : '#f59e0b',
                  fillColor: loc.riskLevel === 'HIGH' ? '#ef4444' : '#f59e0b',
                  fillOpacity: 0.15,
                  weight: 1.5,
                  dashArray: '4, 4'
                }).addTo(hotspotsGroup);
              }

              // Marker Icon with Hotspot star badge
              const icon = window.L.divIcon({
                className: 'custom-gis-pin',
                html: `
                  <div class="risk-marker-container ${loc.riskLevel.toLowerCase()}">
                    <div class="map-marker-pulse"></div>
                    <div class="risk-marker-core"></div>
                    ${loc.hotspot ? '<div class="hotspot-star-badge">★</div>' : ''}
                  </div>
                `,
                iconSize: [34, 34],
                iconAnchor: [17, 17]
              });

              const marker = window.L.marker([loc.lat, loc.lng], { icon: icon }).addTo(markersGroup);

              marker.on('click', () => {
                updatePanel(loc);
                map.flyTo([loc.lat, loc.lng], 14, { duration: 0.8 });
              });

              marker.bindTooltip(`<strong>${loc.name}</strong><br/>Risk: ${loc.riskScore}/100 (${loc.riskLevel})`, {
                direction: 'top',
                className: 'gis-tooltip'
              });
            });
          }

          renderMapLayers('ALL');
          updatePanel(initialLoc);

          // Recenter
          layout.querySelector('#btn-recenter-map').addEventListener('click', () => {
            map.flyTo([17.4421, 78.3912], 12);
          });

          // Filter chips
          layout.querySelectorAll('.filter-group .filter-chip').forEach(chip => {
            chip.addEventListener('click', () => {
              layout.querySelectorAll('.filter-group .filter-chip').forEach(c => c.classList.remove('active'));
              chip.classList.add('active');
              currentFilter = chip.getAttribute('data-filter');
              renderMapLayers(currentFilter);
            });
          });

          // Layer toggles
          layout.querySelector('#btn-layer-pins').addEventListener('click', (e) => {
            const btn = e.currentTarget;
            btn.classList.toggle('active');
            if (btn.classList.contains('active')) map.addLayer(markersGroup);
            else map.removeLayer(markersGroup);
          });

          layout.querySelector('#btn-layer-hotspots').addEventListener('click', (e) => {
            const btn = e.currentTarget;
            btn.classList.toggle('active');
            if (btn.classList.contains('active')) map.addLayer(hotspotsGroup);
            else map.removeLayer(hotspotsGroup);
          });

        } catch (e) {
          console.warn('Map initialization failed', e);
        }
      }

      // Close panel
      layout.querySelector('#panel-close-btn').addEventListener('click', () => {
        sidepanel.classList.remove('open');
      });

      // Panel Action Buttons (Preserve Location)
      layout.querySelector('#btn-analyze-location').addEventListener('click', () => {
        locationState.setSelectedLocationId(activeLocation.id);
        router.navigate(`/prediction?loc=${activeLocation.id}`);
      });

      layout.querySelector('#btn-view-explanation').addEventListener('click', () => {
        locationState.setSelectedLocationId(activeLocation.id);
        router.navigate(`/explainable-ai?loc=${activeLocation.id}`);
      });
    }
  });
}
