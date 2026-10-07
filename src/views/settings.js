// UrbanSafe AI - Settings View
import { createProtectedLayout } from '../components/layout.js';

const SETTINGS_KEY = 'urbansafe_user_settings';

export function renderSettingsView(router) {
  let settings = {
    theme: localStorage.getItem('urbansafe_theme') || 'dark',
    defaultLanding: '/dashboard',
    autoRefresh: true,
    refreshInterval: '30s',
    defaultMapLayer: 'dark',
    showHotspots: true,
    showAccidents: true,
    alertHighRisk: true,
    alertHotspots: true,
    alertModelDrift: false,
    demoMode: true
  };

  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) settings = { ...settings, ...JSON.parse(saved) };
  } catch (e) {
    console.warn(e);
  }

  const contentHtml = `
    <div class="settings-page-container">
      <div class="settings-sections-list">
        <!-- Section 1: Appearance -->
        <div class="dash-card settings-card">
          <div class="card-header-bar">
            <div>
              <h3>Appearance & Theme</h3>
              <p>Tailor the visual interface contrast and theme mode.</p>
            </div>
          </div>
          <div class="settings-body">
            <div class="setting-row">
              <div>
                <strong>Theme Mode</strong>
                <p>Toggle between Dark Intelligence mode and Daylight mode.</p>
              </div>
              <div class="setting-control">
                <select id="setting-theme" class="form-select">
                  <option value="dark" ${settings.theme === 'dark' ? 'selected' : ''}>Dark Command Center (Default)</option>
                  <option value="light" ${settings.theme === 'light' ? 'selected' : ''}>Light Modern Dashboard</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Section 2: Dashboard Experience -->
        <div class="dash-card settings-card">
          <div class="card-header-bar">
            <div>
              <h3>Dashboard Experience</h3>
              <p>Configure the initial landing route and real-time refresh cadence.</p>
            </div>
          </div>
          <div class="settings-body">
            <div class="setting-row">
              <div>
                <strong>Default Landing Page</strong>
                <p>Route to open immediately after signing in.</p>
              </div>
              <div class="setting-control">
                <select id="setting-landing" class="form-select">
                  <option value="/dashboard" ${settings.defaultLanding === '/dashboard' ? 'selected' : ''}>Urban Safety Dashboard</option>
                  <option value="/prediction" ${settings.defaultLanding === '/prediction' ? 'selected' : ''}>Risk Prediction Engine</option>
                  <option value="/map" ${settings.defaultLanding === '/map' ? 'selected' : ''}>Urban Risk Map</option>
                  <option value="/alerts" ${settings.defaultLanding === '/alerts' ? 'selected' : ''}>Active Alerts Center</option>
                </select>
              </div>
            </div>

            <div class="setting-row">
              <div>
                <strong>Telemetry Auto-Refresh</strong>
                <p>Periodically fetch simulated sensor updates in the background.</p>
              </div>
              <div class="setting-control">
                <input type="checkbox" id="setting-autorefresh" ${settings.autoRefresh ? 'checked' : ''} class="settings-checkbox" />
              </div>
            </div>
          </div>
        </div>

        <!-- Section 3: Urban Map Settings -->
        <div class="dash-card settings-card">
          <div class="card-header-bar">
            <div>
              <h3>Urban Map Configuration</h3>
              <p>Default layer overlays and marker visibility preferences.</p>
            </div>
          </div>
          <div class="settings-body">
            <div class="setting-row">
              <div>
                <strong>Show Hotspot Clusters</strong>
                <p>Render pulsing cluster centroid rings by default.</p>
              </div>
              <div class="setting-control">
                <input type="checkbox" id="setting-show-hotspots" ${settings.showHotspots ? 'checked' : ''} class="settings-checkbox" />
              </div>
            </div>

            <div class="setting-row">
              <div>
                <strong>Show Historical Accident Pins</strong>
                <p>Display individual accident collision pins on map load.</p>
              </div>
              <div class="setting-control">
                <input type="checkbox" id="setting-show-accidents" ${settings.showAccidents ? 'checked' : ''} class="settings-checkbox" />
              </div>
            </div>
          </div>
        </div>

        <!-- Section 4: Notifications & Dispatch -->
        <div class="dash-card settings-card">
          <div class="card-header-bar">
            <div>
              <h3>Notifications & Broadcasts</h3>
              <p>Control browser toasts and emergency trigger alerts.</p>
            </div>
          </div>
          <div class="settings-body">
            <div class="setting-row">
              <div>
                <strong>High-Risk Critical Alerts</strong>
                <p>Broadcast alerts when intersection risk exceeds 80/100.</p>
              </div>
              <div class="setting-control">
                <input type="checkbox" id="setting-alert-high" ${settings.alertHighRisk ? 'checked' : ''} class="settings-checkbox" />
              </div>
            </div>

            <div class="setting-row">
              <div>
                <strong>Hotspot Formation Alerts</strong>
                <p>Trigger notification when new cluster is identified by DBSCAN.</p>
              </div>
              <div class="setting-control">
                <input type="checkbox" id="setting-alert-hotspot" ${settings.alertHotspots ? 'checked' : ''} class="settings-checkbox" />
              </div>
            </div>
          </div>
        </div>

        <!-- Section 5: Demo Mode & Storage -->
        <div class="dash-card settings-card">
          <div class="card-header-bar">
            <div>
              <h3>Demo Mode & Local Storage</h3>
              <p>Manage local cache, test accounts, and simulation presets.</p>
            </div>
          </div>
          <div class="settings-body">
            <div class="setting-row">
              <div>
                <strong>Demo Mode Active</strong>
                <p>Uses centralized demo data files in lieu of production backend APIs.</p>
              </div>
              <div class="setting-control">
                <span class="status-indicator-tag active">DEMO ACTIVE</span>
              </div>
            </div>

            <div class="setting-row">
              <div>
                <strong>Reset Demo Storage</strong>
                <p>Clear locally registered demo accounts, dismissed alerts, and cached predictions.</p>
              </div>
              <div class="setting-control">
                <button class="btn-secondary" id="btn-reset-storage" style="color:var(--risk-high); border-color:rgba(239,68,68,0.3);">
                  Clear Local State
                </button>
              </div>
            </div>
          </div>
        </div>

        <div style="margin-top: 10px; display: flex; justify-content: flex-end;">
          <button class="btn-primary" id="btn-save-settings" style="padding: 12px 28px;">
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  `;

  return createProtectedLayout({
    router,
    currentPath: '/settings',
    pageTitle: 'System & Safety Settings',
    pageSubtitle: 'Configure telemetry intervals, UI themes, alert thresholds, and operational preferences.',
    contentHtml,
    onMounted: (layout) => {
      const themeSelect = layout.querySelector('#setting-theme');
      const landingSelect = layout.querySelector('#setting-landing');
      const autoRefreshCheck = layout.querySelector('#setting-autorefresh');
      const showHotspotsCheck = layout.querySelector('#setting-show-hotspots');
      const showAccidentsCheck = layout.querySelector('#setting-show-accidents');
      const alertHighCheck = layout.querySelector('#setting-alert-high');
      const alertHotspotCheck = layout.querySelector('#setting-alert-hotspot');
      const saveBtn = layout.querySelector('#btn-save-settings');
      const resetBtn = layout.querySelector('#btn-reset-storage');

      saveBtn.addEventListener('click', () => {
        const updated = {
          theme: themeSelect.value,
          defaultLanding: landingSelect.value,
          autoRefresh: autoRefreshCheck.checked,
          showHotspots: showHotspotsCheck.checked,
          showAccidents: showAccidentsCheck.checked,
          alertHighRisk: alertHighCheck.checked,
          alertHotspots: alertHotspotCheck.checked,
          demoMode: true
        };

        localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
        localStorage.setItem('urbansafe_theme', updated.theme);

        if (updated.theme === 'light') {
          document.body.classList.add('theme-light');
        } else {
          document.body.classList.remove('theme-light');
        }

        const toastContainer = layout.querySelector('#toast-container');
        const toast = document.createElement('div');
        toast.className = 'toast toast-success';
        toast.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span>Preferences saved successfully to local storage!</span>
        `;
        toastContainer.appendChild(toast);
        setTimeout(() => toast.remove(), 3500);
      });

      resetBtn.addEventListener('click', () => {
        localStorage.removeItem('urbansafe_active_alerts');
        localStorage.removeItem('urbansafe_last_prediction');
        localStorage.removeItem(SETTINGS_KEY);

        const toastContainer = layout.querySelector('#toast-container');
        const toast = document.createElement('div');
        toast.className = 'toast toast-info';
        toast.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 16v-4M12 8h.01"></path>
          </svg>
          <span>Local demo storage reset to default factory state.</span>
        `;
        toastContainer.appendChild(toast);
        setTimeout(() => toast.remove(), 3500);
      });
    }
  });
}
