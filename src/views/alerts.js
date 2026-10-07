// UrbanSafe AI - Active Risk Alerts View
// High-Risk Location Alerts with Interactive Dismissal & Prediction Bridge

import { createProtectedLayout } from '../components/layout.js';
import { alertService } from '../services/alertService.js';
import { locationState } from '../services/locationState.js';

export function renderAlertsView(router) {
  let currentFilter = 'ALL';

  const contentHtml = `
    <div class="alerts-page-container">
      <!-- Filter Bar -->
      <div class="dash-card filter-toolbar-card">
        <div class="toolbar-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
          <strong>Alert Severity Filter:</strong>
        </div>

        <div class="filter-group" id="alert-filter-group">
          <button class="filter-chip active" data-filter="ALL">All Alerts</button>
          <button class="filter-chip" data-filter="HIGH">High Severity</button>
          <button class="filter-chip" data-filter="MEDIUM">Medium Severity</button>
          <button class="filter-chip" data-filter="RESOLVED">Resolved / Dismissed</button>
        </div>

        <button class="btn-secondary" id="btn-reset-demo-alerts" style="margin-left: auto; font-size: 0.8rem; padding: 6px 12px;">
          Reset Demo Alerts
        </button>
      </div>

      <!-- Alerts List Container -->
      <div class="alerts-cards-list" id="alerts-cards-list"></div>
    </div>
  `;

  return createProtectedLayout({
    router,
    currentPath: '/alerts',
    pageTitle: 'Active Risk Alerts',
    pageSubtitle: 'Real-time automated incident and hazard notifications requiring operator intervention.',
    contentHtml,
    onMounted: (layout) => {
      const listContainer = layout.querySelector('#alerts-cards-list');

      function renderAlerts(filter) {
        const alertsList = alertService.getAlerts(filter);

        if (alertsList.length === 0) {
          listContainer.innerHTML = `
            <div class="dash-card empty-state-box">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M9 12l2 2 4-4"></path>
              </svg>
              <h3>No Active Alerts Found</h3>
              <p>All emergency notifications under filter "${filter}" have been resolved or addressed.</p>
            </div>
          `;
          return;
        }

        listContainer.innerHTML = alertsList.map(a => `
          <div class="dash-card alert-item-card ${a.status === 'RESOLVED' ? 'resolved' : ''}" id="alert-card-${a.id}">
            <div class="alert-item-header">
              <div style="display:flex; align-items:center; gap:10px;">
                <span class="alert-type-tag type-${a.severity.toLowerCase()}">${a.type}</span>
                <span class="status-indicator-tag ${a.status === 'RESOLVED' ? '' : 'active'}">${a.status}</span>
                <code style="font-size:0.75rem; color:var(--text-muted);">${a.id}</code>
              </div>
              <span class="alert-timestamp">${a.timestamp}</span>
            </div>

            <div class="alert-item-body">
              <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                <div>
                  <h3 style="margin-bottom: 4px;">${a.location}</h3>
                  <p style="font-size: 0.9rem; color: var(--text-secondary);">${a.reason}</p>
                </div>
                <div style="text-align:right;">
                  <span style="font-size:0.75rem; color:var(--text-muted);">Risk Score:</span>
                  <div style="font-size:1.4rem; font-weight:800; font-family:var(--font-mono);" class="${a.severity === 'HIGH' ? 'text-red' : 'text-amber'}">${a.riskScore}/100</div>
                </div>
              </div>
            </div>

            <div class="alert-item-footer">
              <button class="btn-primary btn-analyze-alert" data-loc-id="${a.locationId}">
                <span>Analyze in Prediction &rarr;</span>
              </button>
              <button class="btn-secondary btn-view-loc" data-loc-id="${a.locationId}">
                <span>View on Map</span>
              </button>
              ${a.status !== 'RESOLVED' ? `
                <button class="btn-secondary btn-dismiss-alert" data-alert-id="${a.id}">
                  <span>Dismiss / Resolve</span>
                </button>
              ` : `
                <span style="font-size:0.8rem; color:var(--risk-low); font-weight:600; padding:6px 12px;">Resolved &#10003;</span>
              `}
            </div>
          </div>
        `).join('');

        // Attach buttons
        listContainer.querySelectorAll('.btn-analyze-alert').forEach(btn => {
          btn.addEventListener('click', () => {
            const locId = btn.getAttribute('data-loc-id');
            locationState.setSelectedLocationId(locId);
            router.navigate(`/prediction?loc=${locId}`);
          });
        });

        listContainer.querySelectorAll('.btn-view-loc').forEach(btn => {
          btn.addEventListener('click', () => {
            const locId = btn.getAttribute('data-loc-id');
            locationState.setSelectedLocationId(locId);
            router.navigate(`/map?loc=${locId}`);
          });
        });

        listContainer.querySelectorAll('.btn-dismiss-alert').forEach(btn => {
          btn.addEventListener('click', () => {
            const alertId = btn.getAttribute('data-alert-id');
            alertService.dismissAlert(alertId);
            renderAlerts(currentFilter);

            const toastContainer = layout.querySelector('#toast-container');
            const toast = document.createElement('div');
            toast.className = 'toast toast-success';
            toast.innerHTML = `
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>Alert ${alertId} marked as resolved and dismissed from active alerts.</span>
            `;
            toastContainer.appendChild(toast);
            setTimeout(() => toast.remove(), 3500);
          });
        });
      }

      renderAlerts('ALL');

      // Filters
      layout.querySelectorAll('#alert-filter-group .filter-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          layout.querySelectorAll('#alert-filter-group .filter-chip').forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
          currentFilter = chip.getAttribute('data-filter');
          renderAlerts(currentFilter);
        });
      });

      // Reset Demo Alerts
      layout.querySelector('#btn-reset-demo-alerts').addEventListener('click', () => {
        alertService.resetAlerts();
        renderAlerts(currentFilter);
      });
    }
  });
}
