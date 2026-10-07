// UrbanSafe AI - Telemetry & Data Feeds View
import { createProtectedLayout } from '../components/layout.js';
import { telemetryService } from '../services/telemetryService.js';

export function renderTelemetryView(router) {
  const sources = telemetryService.getSources();
  let logs = telemetryService.getRecentLogs();

  const contentHtml = `
    <div class="telemetry-page-container">
      <!-- Top Refresh & Status Header -->
      <div class="dash-card telemetry-header-card">
        <div class="toolbar-left">
          <div style="display:flex; align-items:center; gap:10px;">
            <span class="live-pulse-dot"></span>
            <h3>Active Ingestion Pipeline</h3>
          </div>
          <p>Continuous asynchronous Kafka streams ingesting edge telemetry from 412 municipal intersection nodes.</p>
        </div>
        <div class="toolbar-right">
          <span class="demo-tag" style="margin-right: 10px;">[ DEMO TELEMETRY ]</span>
          <button class="btn-primary" id="btn-manual-refresh-feed">
            <svg id="feed-refresh-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M23 4v6h-6"></path>
              <path d="M1 20v-6h6"></path>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
            </svg>
            <span id="refresh-feed-text">Refresh Ingestion Feeds</span>
          </button>
        </div>
      </div>

      <!-- 5 Telemetry Source Cards Grid -->
      <div class="telemetry-sources-grid">
        ${sources.map(s => `
          <div class="dash-card source-card">
            <div class="card-header-bar">
              <span class="status-indicator-tag active">${s.status}</span>
              <span class="latency-pill">${s.latency}</span>
            </div>
            <h4 style="margin-top: 8px;">${s.name}</h4>
            <p style="font-size: 0.78rem; color: var(--text-muted);">${s.type}</p>

            <div class="source-metrics-block">
              <div>
                <span class="sm-lbl">Ingestion Rate:</span>
                <strong class="text-cyan">${s.recordCount}</strong>
              </div>
              <div style="margin-top: 4px;">
                <span class="sm-lbl">Data Quality:</span>
                <strong class="text-emerald">${s.dataQuality}</strong>
              </div>
              <div style="margin-top: 4px;">
                <span class="sm-lbl">Last Synced:</span>
                <span class="sm-time" id="source-time-${s.id}">${s.lastUpdated}</span>
              </div>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Real-time Ingestion Stream Table -->
      <div class="dash-card" style="margin-top: 20px;">
        <div class="card-header-bar">
          <div>
            <h3>Live Telemetry Stream Log</h3>
            <p>Recent micro-batch sensor telemetry payload records.</p>
          </div>
          <div class="feed-filter-group">
            <button class="filter-chip active" data-filter="ALL">All Nodes</button>
            <button class="filter-chip" data-filter="CRITICAL">High Risk Alerts</button>
          </div>
        </div>

        <div class="table-responsive">
          <table class="data-table" id="telemetry-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Sensor Source Node</th>
                <th>Monitored Location</th>
                <th>Traffic Density</th>
                <th>Weather Reading</th>
                <th>Road Surface State</th>
                <th>Telemetry Status</th>
              </tr>
            </thead>
            <tbody id="telemetry-tbody">
              ${logs.map(l => `
                <tr>
                  <td><code class="text-cyan">${l.timestamp}</code></td>
                  <td><strong>${l.source}</strong></td>
                  <td>${l.location}</td>
                  <td><span class="${l.traffic.includes('Critical') ? 'text-red' : l.traffic.includes('High') ? 'text-amber' : ''}">${l.traffic}</span></td>
                  <td>${l.weather}</td>
                  <td>${l.road}</td>
                  <td>
                    <span class="status-indicator-tag ${l.status === 'HIGH_RISK' ? 'tag-danger' : l.status === 'WARNING' ? 'tag-warning' : 'active'}">
                      ${l.status}
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  return createProtectedLayout({
    router,
    currentPath: '/telemetry',
    pageTitle: 'Telemetry & Data Feeds',
    pageSubtitle: 'Live urban IoT sensor streams, meteorological feeds, and floating vehicle telemetry.',
    contentHtml,
    onMounted: (layout) => {
      const refreshBtn = layout.querySelector('#btn-manual-refresh-feed');
      const spinIcon = layout.querySelector('#feed-refresh-spin');
      const btnText = layout.querySelector('#refresh-feed-text');
      const tbody = layout.querySelector('#telemetry-tbody');

      refreshBtn.addEventListener('click', () => {
        spinIcon.style.animation = 'spin 0.7s linear infinite';
        btnText.textContent = 'Ingesting Telemetry...';
        refreshBtn.disabled = true;

        setTimeout(() => {
          logs = telemetryService.refreshTelemetry();
          tbody.innerHTML = logs.map(l => `
            <tr>
              <td><code class="text-cyan">${l.timestamp}</code></td>
              <td><strong>${l.source}</strong></td>
              <td>${l.location}</td>
              <td><span class="${l.traffic.includes('Critical') ? 'text-red' : l.traffic.includes('High') ? 'text-amber' : ''}">${l.traffic}</span></td>
              <td>${l.weather}</td>
              <td>${l.road}</td>
              <td>
                <span class="status-indicator-tag ${l.status === 'HIGH_RISK' ? 'tag-danger' : l.status === 'WARNING' ? 'tag-warning' : 'active'}">
                  ${l.status}
                </span>
              </td>
            </tr>
          `).join('');

          sources.forEach(s => {
            const timeEl = layout.querySelector(`#source-time-${s.id}`);
            if (timeEl) timeEl.textContent = 'just now';
          });

          spinIcon.style.animation = 'none';
          btnText.textContent = 'Refresh Ingestion Feeds';
          refreshBtn.disabled = false;

          const toastContainer = layout.querySelector('#toast-container');
          const toast = document.createElement('div');
          toast.className = 'toast toast-info';
          toast.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <span>Telemetry refreshed! 412 edge nodes synchronized with zero packet loss.</span>
          `;
          toastContainer.appendChild(toast);
          setTimeout(() => toast.remove(), 3500);
        }, 750);
      });
    }
  });
}
