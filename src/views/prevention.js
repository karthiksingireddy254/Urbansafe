// UrbanSafe AI - Prevention & Safety Recommendations View
// Dynamically tailored preventive protocols matching prediction inputs & active location

import { createProtectedLayout } from '../components/layout.js';
import { locationState } from '../services/locationState.js';
import { ACCIDENT_DEMO_LOCATIONS } from '../data/accidentDemoData.js';

export function renderPreventionView(router) {
  const urlParams = new URLSearchParams(window.location.search);
  const paramLocId = urlParams.get('loc');
  if (paramLocId && ACCIDENT_DEMO_LOCATIONS.some(l => l.id === paramLocId)) {
    locationState.setSelectedLocationId(paramLocId);
  }

  const activeLoc = locationState.getSelectedLocation();
  const currentPred = locationState.getCurrentPrediction();
  const inputs = currentPred.inputs;
  const result = currentPred.result;

  // Build list of all recommendations across active inputs + top city hotspots
  const activeRecs = [...result.recommendations].map((r, i) => ({
    id: `REC-ACT-${i + 1}`,
    locationId: activeLoc.id,
    location: activeLoc.name,
    priority: r.priority,
    hazard: r.hazard,
    suggestedAction: r.action,
    agency: r.agency,
    status: "READY"
  }));

  // Append other top city locations
  const otherHighLocs = ACCIDENT_DEMO_LOCATIONS.filter(l => l.id !== activeLoc.id && l.hotspotStatus).slice(0, 4);
  otherHighLocs.forEach((loc, idx) => {
    activeRecs.push({
      id: `REC-CITY-${idx + 1}`,
      locationId: loc.id,
      location: loc.name,
      priority: loc.historicalRisk >= 85 ? "HIGH" : "MEDIUM",
      hazard: loc.primaryCause.toUpperCase(),
      suggestedAction: loc.preventionRecommendation,
      agency: "Traffic Police & Urban Roads Authority",
      status: "READY"
    });
  });

  const contentHtml = `
    <div class="prevention-page-container">
      <!-- Top Active Location Context Card -->
      <div class="dash-card">
        <div class="card-header-bar">
          <div>
            <h3>Active Corridor Safety Protocols</h3>
            <p>Targeted preventive interventions for <strong>${activeLoc.name}</strong> (Risk: ${result.riskScore}/100, ${result.riskLevel}).</p>
          </div>
          <button class="btn-primary" id="btn-retest-prediction" style="font-size: 0.8rem; padding: 6px 12px;">
            Modify Inputs in Prediction &rarr;
          </button>
        </div>
      </div>

      <!-- Filter Bar -->
      <div class="dash-card filter-toolbar-card" style="margin-top: 16px;">
        <div class="toolbar-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          </svg>
          <strong>Intervention Priority Filter:</strong>
        </div>

        <div class="filter-group" id="priority-filter-group">
          <button class="filter-chip active" data-priority="ALL">All Protocols (${activeRecs.length})</button>
          <button class="filter-chip" data-priority="HIGH">High Priority (${activeRecs.filter(r => r.priority === 'HIGH').length})</button>
          <button class="filter-chip" data-priority="MEDIUM">Medium Priority (${activeRecs.filter(r => r.priority === 'MEDIUM').length})</button>
          <button class="filter-chip" data-priority="LOW">Low Priority (${activeRecs.filter(r => r.priority === 'LOW').length})</button>
        </div>
      </div>

      <!-- Recommendation Cards Grid -->
      <div class="recommendations-grid" id="recommendations-grid" style="margin-top: 16px;">
        ${activeRecs.map(r => `
          <div class="dash-card rec-card" data-priority="${r.priority}" id="card-${r.id}">
            <div class="card-header-bar">
              <div>
                <span class="risk-badge risk-${r.priority.toLowerCase()}">${r.priority} PRIORITY</span>
                <h3 style="margin-top: 6px; font-size: 1rem;">${r.hazard}</h3>
              </div>
              <span class="status-indicator-tag" id="status-${r.id}">READY</span>
            </div>

            <div class="rec-body">
              <div class="rec-location-line">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <strong>${r.location}</strong>
              </div>

              <div class="rec-action-box">
                <strong>Suggested Preventive Attention:</strong>
                <p>${r.suggestedAction}</p>
              </div>

              <div class="rec-agency-line">
                <span>Coordinating Authority:</span>
                <strong>${r.agency}</strong>
              </div>
            </div>

            <div class="rec-card-footer">
              <button class="btn-primary btn-dispatch-unit" data-id="${r.id}" data-hazard="${r.hazard}">
                <span>Dispatch / Transmit Advisory</span>
              </button>
              <button class="btn-secondary btn-view-on-map" data-loc-id="${r.locationId}">
                <span>View on Map</span>
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  return createProtectedLayout({
    router,
    currentPath: '/prevention',
    pageTitle: 'Prevention & Safety Recommendations',
    pageSubtitle: 'Automated intervention protocols, patrol dispatch triggers, and municipal traffic calming.',
    contentHtml,
    onMounted: (layout) => {
      layout.querySelector('#btn-retest-prediction').addEventListener('click', () => {
        router.navigate(`/prediction?loc=${activeLoc.id}`);
      });

      // Priority Filtering
      layout.querySelectorAll('#priority-filter-group .filter-chip').forEach(btn => {
        btn.addEventListener('click', () => {
          layout.querySelectorAll('#priority-filter-group .filter-chip').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const prio = btn.getAttribute('data-priority');

          layout.querySelectorAll('.rec-card').forEach(card => {
            if (prio === 'ALL' || card.getAttribute('data-priority') === prio) {
              card.style.display = 'flex';
            } else {
              card.style.display = 'none';
            }
          });
        });
      });

      // View Location on Map
      layout.querySelectorAll('.btn-view-on-map').forEach(btn => {
        btn.addEventListener('click', () => {
          const locId = btn.getAttribute('data-loc-id');
          locationState.setSelectedLocationId(locId);
          router.navigate(`/map?loc=${locId}`);
        });
      });

      // Dispatch Unit Interaction
      layout.querySelectorAll('.btn-dispatch-unit').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          const hazard = btn.getAttribute('data-hazard');
          btn.disabled = true;
          btn.innerHTML = `<span>Dispatched &#10003;</span>`;
          btn.classList.add('dispatched');

          const statusTag = layout.querySelector(`#status-${id}`);
          statusTag.textContent = 'DISPATCHED';
          statusTag.classList.add('active');

          const toastContainer = layout.querySelector('#toast-container');
          const toast = document.createElement('div');
          toast.className = 'toast toast-success';
          toast.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <span>Preventive advisory dispatched for ${hazard}! Transmitted to operational command unit.</span>
          `;
          toastContainer.appendChild(toast);
          setTimeout(() => toast.remove(), 4000);
        });
      });
    }
  });
}
