// UrbanSafe AI - Hotspot Clusters View
// Unsupervised Machine Learning Cluster Discovery & Concentration Analysis

import { createProtectedLayout } from '../components/layout.js';
import { DEMO_CLUSTERS_DBSCAN, DEMO_CLUSTERS_KMEANS, HOTSPOT_SUMMARY } from '../data/demoHotspots.js';
import { ACCIDENT_DEMO_LOCATIONS } from '../data/accidentDemoData.js';
import { locationState } from '../services/locationState.js';

export function renderHotspotsView(router) {
  const contentHtml = `
    <div class="hotspots-page-container">
      <!-- Top Metrics Summary Row -->
      <div class="kpi-cards-grid">
        <div class="kpi-card">
          <span class="kpi-title">Identified Hotspots</span>
          <span class="kpi-number text-cyan">${HOTSPOT_SUMMARY.totalHotspots}</span>
          <span class="kpi-desc">Spatial accident concentration zones</span>
        </div>
        <div class="kpi-card danger">
          <span class="kpi-title">High-Risk Clusters</span>
          <span class="kpi-number text-red">${HOTSPOT_SUMMARY.highRisk}</span>
          <span class="kpi-desc">Critical multi-collision corridors</span>
        </div>
        <div class="kpi-card warning">
          <span class="kpi-title">Medium-Risk Clusters</span>
          <span class="kpi-number text-amber">${HOTSPOT_SUMMARY.mediumRisk}</span>
          <span class="kpi-desc">Transit friction & intersection nodes</span>
        </div>
        <div class="kpi-card success">
          <span class="kpi-title">Low-Risk Clusters</span>
          <span class="kpi-number text-emerald">${HOTSPOT_SUMMARY.lowRisk}</span>
          <span class="kpi-desc">Calmed arterial corridors</span>
        </div>
      </div>

      <!-- Clustering Method Tabs & Interactive Map Grid -->
      <div class="dash-card">
        <div class="card-header-bar">
          <div>
            <h3>Hotspot Cluster Analysis Engine</h3>
            <p>Precomputed spatial cluster assignments comparing Density-Based (DBSCAN) with Centroid Partitioning (K-Means).</p>
          </div>
          <div class="clustering-tabs" id="clustering-tabs">
            <button class="clustering-tab-btn active" data-algo="DBSCAN">DBSCAN (Density-Based)</button>
            <button class="clustering-tab-btn" data-algo="KMEANS">K-Means (k=4 Centroids)</button>
          </div>
        </div>

        <!-- Algorithm Description Banner -->
        <div class="algo-info-banner" id="algo-info-banner">
          <div style="display:flex; align-items:center; gap:8px;">
            <span class="live-pulse-dot" style="background:#00f2fe;"></span>
            <strong id="algo-banner-title">DBSCAN Algorithm Active</strong>
          </div>
          <span id="algo-banner-desc">Parameters: eps = 400 meters, min_samples = 4. Isolates arbitrary spatial geometries and groups correlated accident nodes into high-density hazard zones.</span>
        </div>

        <!-- Clusters Table -->
        <div class="table-responsive" style="margin-top: 16px;">
          <table class="data-table" id="clusters-table">
            <thead>
              <tr>
                <th>Cluster ID</th>
                <th>Cluster Corridor Title</th>
                <th>Density Metric</th>
                <th>Total Collisions</th>
                <th>Risk Level</th>
                <th>Primary Root Cause</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody id="clusters-tbody">
              <!-- Dynamically populated -->
            </tbody>
          </table>
        </div>
      </div>

      <!-- Cluster Map & Selected Detail Drawer -->
      <div class="hotspots-detail-grid-layout" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px;">
        <!-- Leaflet Map of Selected Cluster -->
        <div class="dash-card">
          <div class="card-header-bar">
            <div>
              <h3>Cluster Spatial Overlay</h3>
              <p>Geographic corridor locations within selected cluster</p>
            </div>
            <span class="demo-tag">[ HYDERABAD URBAN GRID ]</span>
          </div>
          <div id="hotspot-leaflet-map" style="height: 320px; width: 100%; border-radius: var(--radius-md); overflow: hidden;"></div>
        </div>

        <!-- Selected Cluster Detail Card -->
        <div class="dash-card" id="selected-cluster-detail">
          <div class="card-header-bar">
            <div>
              <h3 id="cdetail-name">${DEMO_CLUSTERS_DBSCAN[0].name}</h3>
              <p id="cdetail-algo">${DEMO_CLUSTERS_DBSCAN[0].algorithm}</p>
            </div>
            <span class="risk-badge risk-high" id="cdetail-badge">${DEMO_CLUSTERS_DBSCAN[0].riskLevel} RISK</span>
          </div>

          <div class="cluster-detail-grid">
            <div class="detail-box">
              <h4>Corridor Members</h4>
              <ul id="cdetail-locations" style="padding-left: 18px; margin-top: 6px; font-size: 0.88rem; color: var(--text-secondary); max-height: 120px; overflow-y: auto;">
                ${DEMO_CLUSTERS_DBSCAN[0].locations.map(l => `<li>${l}</li>`).join('')}
              </ul>
            </div>
            <div class="detail-box">
              <h4>Spatial Density & Statistics</h4>
              <p><strong>Density:</strong> <span id="cdetail-density">${DEMO_CLUSTERS_DBSCAN[0].density}</span></p>
              <p><strong>Total Accidents:</strong> <strong id="cdetail-accidents" class="text-red">${DEMO_CLUSTERS_DBSCAN[0].accidentCount} collisions</strong></p>
              <p><strong>Primary Hazard:</strong> <span id="cdetail-cause" style="font-size: 0.82rem; color: var(--text-secondary);">${DEMO_CLUSTERS_DBSCAN[0].primaryCause}</span></p>
            </div>
            <div class="detail-box advisory-card" style="grid-column: span 2;">
              <h4>Recommended Preventive Intervention</h4>
              <p id="cdetail-intervention">${DEMO_CLUSTERS_DBSCAN[0].recommendedIntervention}</p>
              <div style="display:flex; gap:10px; margin-top:12px;">
                <button class="btn-primary" id="btn-predict-first-location" style="font-size: 0.82rem; padding: 6px 14px;">
                  Predict Risk for Corridor &rarr;
                </button>
                <button class="btn-secondary" id="btn-goto-prevention-page" style="font-size: 0.82rem; padding: 6px 14px;">
                  View Prevention Protocols
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  return createProtectedLayout({
    router,
    currentPath: '/hotspots',
    pageTitle: 'Accident Hotspot Intelligence',
    pageSubtitle: 'Unsupervised machine learning cluster discovery and collision concentration analysis.',
    contentHtml,
    onMounted: (layout) => {
      let currentAlgo = 'DBSCAN';
      let selectedCluster = DEMO_CLUSTERS_DBSCAN[0];
      let map = null;
      let markersGroup = null;

      // Initialize Leaflet Map
      const mapEl = layout.querySelector('#hotspot-leaflet-map');
      if (mapEl && window.L) {
        try {
          map = window.L.map(mapEl, {
            center: [17.4421, 78.3912],
            zoom: 12,
            attributionControl: true
          });

          window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors'
          }).addTo(map);

          markersGroup = window.L.layerGroup().addTo(map);
        } catch (e) {
          console.warn('Hotspot map init error', e);
        }
      }

      function updateMapForCluster(cluster) {
        if (!map || !markersGroup) return;
        markersGroup.clearLayers();

        const matchingLocs = ACCIDENT_DEMO_LOCATIONS.filter(l =>
          cluster.locations.some(locName => l.name.includes(locName) || locName.includes(l.name))
        );

        if (matchingLocs.length > 0) {
          matchingLocs.forEach(loc => {
            const icon = window.L.divIcon({
              className: 'custom-pred-marker',
              html: `
                <div class="risk-marker-container ${loc.historicalRisk >= 70 ? 'high' : loc.historicalRisk >= 40 ? 'medium' : 'low'}">
                  <div class="map-marker-pulse"></div>
                  <div class="risk-marker-core"></div>
                </div>
              `,
              iconSize: [28, 28],
              iconAnchor: [14, 14]
            });

            const marker = window.L.marker([loc.latitude, loc.longitude], { icon }).addTo(markersGroup);
            marker.bindPopup(`<strong>${loc.name}</strong><br/>Risk Score: ${loc.historicalRisk}/100<br/>Collisions: ${loc.historicalAccidents}`);
          });

          const first = matchingLocs[0];
          map.flyTo([first.latitude, first.longitude], 13, { duration: 0.6 });
        }
      }

      function renderClusterTable(algo) {
        const clusters = algo === 'DBSCAN' ? DEMO_CLUSTERS_DBSCAN : DEMO_CLUSTERS_KMEANS;
        const bannerTitle = layout.querySelector('#algo-banner-title');
        const bannerDesc = layout.querySelector('#algo-banner-desc');

        if (algo === 'DBSCAN') {
          bannerTitle.textContent = 'DBSCAN Algorithm Active';
          bannerDesc.textContent = 'Parameters: eps = 400 meters, min_samples = 4. Isolates high-density accident clusters of arbitrary spatial shapes and excludes noise.';
        } else {
          bannerTitle.textContent = 'K-Means Algorithm Active';
          bannerDesc.textContent = 'Parameters: k = 4 centroids, silhouette score = 0.71. Optimizes squared euclidean distances to cluster centroids across the urban grid.';
        }

        const tbody = layout.querySelector('#clusters-tbody');
        tbody.innerHTML = clusters.map(c => `
          <tr class="clickable-cluster-row ${c.clusterId === selectedCluster.clusterId ? 'selected-row' : ''}" data-cluster-id="${c.clusterId}">
            <td><strong style="font-family: var(--font-mono); color: var(--brand-sky);">${c.clusterId}</strong></td>
            <td>
              <strong>${c.name}</strong>
              <div style="font-size: 0.75rem; color: var(--text-muted);">${c.locations.slice(0, 3).join(' &bull; ')}${c.locations.length > 3 ? '...' : ''}</div>
            </td>
            <td><span style="font-size: 0.82rem;">${c.density}</span></td>
            <td><strong style="font-family: var(--font-mono);">${c.accidentCount}</strong></td>
            <td><span class="risk-badge risk-${c.riskLevel.toLowerCase()}">${c.riskLevel}</span></td>
            <td><span style="font-size: 0.82rem; color: var(--text-secondary);">${c.primaryCause.substring(0, 60)}...</span></td>
            <td><button class="btn-table-action">Inspect &rarr;</button></td>
          </tr>
        `).join('');

        tbody.querySelectorAll('.clickable-cluster-row').forEach(row => {
          row.addEventListener('click', () => {
            tbody.querySelectorAll('.clickable-cluster-row').forEach(r => r.classList.remove('selected-row'));
            row.classList.add('selected-row');

            const id = row.getAttribute('data-cluster-id');
            const cl = clusters.find(c => c.clusterId === id) || clusters[0];
            selectedCluster = cl;

            layout.querySelector('#cdetail-name').textContent = cl.name;
            layout.querySelector('#cdetail-algo').textContent = cl.algorithm;
            const badge = layout.querySelector('#cdetail-badge');
            badge.textContent = `${cl.riskLevel} RISK`;
            badge.className = `risk-badge risk-${cl.riskLevel.toLowerCase()}`;
            layout.querySelector('#cdetail-locations').innerHTML = cl.locations.map(l => `<li>${l}</li>`).join('');
            layout.querySelector('#cdetail-density').textContent = cl.density;
            layout.querySelector('#cdetail-accidents').textContent = `${cl.accidentCount} collisions`;
            layout.querySelector('#cdetail-cause').textContent = cl.primaryCause;
            layout.querySelector('#cdetail-intervention').textContent = cl.recommendedIntervention;

            updateMapForCluster(cl);
          });
        });
      }

      renderClusterTable('DBSCAN');
      updateMapForCluster(DEMO_CLUSTERS_DBSCAN[0]);

      // Tabs click
      layout.querySelectorAll('.clustering-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          layout.querySelectorAll('.clustering-tab-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          currentAlgo = btn.getAttribute('data-algo');
          selectedCluster = currentAlgo === 'DBSCAN' ? DEMO_CLUSTERS_DBSCAN[0] : DEMO_CLUSTERS_KMEANS[0];
          renderClusterTable(currentAlgo);
          updateMapForCluster(selectedCluster);
        });
      });

      // "Predict Risk for Corridor" Button
      layout.querySelector('#btn-predict-first-location').addEventListener('click', () => {
        const matchingLoc = ACCIDENT_DEMO_LOCATIONS.find(l =>
          selectedCluster.locations.some(locName => l.name.includes(locName) || locName.includes(l.name))
        ) || ACCIDENT_DEMO_LOCATIONS[0];

        locationState.setSelectedLocationId(matchingLoc.id);
        router.navigate(`/prediction?loc=${matchingLoc.id}`);
      });

      layout.querySelector('#btn-goto-prevention-page').addEventListener('click', () => {
        router.navigate('/prevention');
      });
    }
  });
}
