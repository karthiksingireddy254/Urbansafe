// UrbanSafe AI - Common Dashboard Layout & Interactive Header Component
import { auth } from '../auth.js';
import { alertService } from '../services/alertService.js';
import { locationState } from '../services/locationState.js';
import { ACCIDENT_DEMO_LOCATIONS } from '../data/accidentDemoData.js';
import { showLogoutConfirmationModal } from './logoutConfirmationModal.js';

export function createProtectedLayout({ router, currentPath, pageTitle, pageSubtitle, contentHtml, onMounted }) {
  const user = auth.getCurrentUser() || { name: 'Urban Analyst', email: 'demo@urbansafe.ai', role: 'Analyst' };
  const alerts = alertService.getAlerts('HIGH');

  const navItems = [
    { section: 'SAFETY INTELLIGENCE' },
    { path: '/dashboard', label: 'Overview', icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' },
    { path: '/go', label: 'GO — Safe Journey', icon: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z', badge: 'GO' },
    { path: '/prediction', label: 'Risk Prediction', icon: 'M22 12h-4l-3 9L9 3l-3 9H2' },
    { path: '/map', label: 'Urban Map', icon: 'M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z' },
    { path: '/hotspots', label: 'Hotspot Clusters', icon: 'M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z' },
    { path: '/analytics', label: 'Accident Analytics', icon: 'M18 20V10M12 20V4M6 20v-6' },
    { path: '/explainable-ai', label: 'Explainable AI', icon: 'M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' },
    { section: 'OPERATIONS' },
    { path: '/prevention', label: 'Prevention & Safety', icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
    { path: '/alerts', label: 'Active Alerts', icon: 'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9', badge: alerts.length },
    { path: '/settings', label: 'System Settings', icon: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z' }
  ];

  const layout = document.createElement('div');
  layout.className = 'dashboard-container';

  layout.innerHTML = `
    <!-- Sidebar Navigation -->
    <aside class="dashboard-sidebar">
      <div class="sidebar-header">
        <a href="/dashboard" class="sidebar-brand-link" id="brand-link" style="display: flex; align-items: center; gap: 12px; text-decoration: none;">
          <div class="brand-icon-wrapper" style="width: 38px; height: 38px;">
            <svg class="brand-icon-svg" style="width: 22px; height: 22px;" viewBox="0 0 48 48" fill="none">
              <path d="M24 4L7 11V22C7 32.5 14.2 42.2 24 45C33.8 42.2 41 32.5 41 22V11L24 4Z" fill="#0f172a" stroke="#00f2fe" stroke-width="2.5"/>
              <path d="M18 36L22 18H26L30 36H18Z" fill="#1e293b"/>
              <path d="M24 20V34" stroke="#f59e0b" stroke-width="2" stroke-dasharray="2 2"/>
              <circle cx="24" cy="18" r="4.5" fill="#38bdf8" />
            </svg>
          </div>
          <div class="brand-text">
            <h1 style="font-size: 1.1rem; line-height: 1.1;">UrbanSafe AI</h1>
            <span style="font-size: 0.68rem; color: var(--brand-sky);">Accident Intelligence</span>
          </div>
        </a>
      </div>

      <nav class="sidebar-nav">
        ${navItems.map(item => {
          if (item.section) {
            return `<div class="nav-section-title">${item.section}</div>`;
          }
          const isActive = currentPath === item.path;
          return `
            <a href="${item.path}" class="nav-item ${isActive ? 'active' : ''}" data-route="${item.path}">
              <span class="nav-item-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="${item.icon}"></path>
                </svg>
              </span>
              <span style="flex: 1;">${item.label}</span>
              ${item.badge ? `<span class="nav-badge-alert">${item.badge}</span>` : ''}
            </a>
          `;
        }).join('')}
      </nav>

      <div class="sidebar-footer">
        <div class="user-profile-badge">
          <div class="user-avatar">${(user.name || 'U').charAt(0).toUpperCase()}</div>
          <div class="user-details">
            <span class="user-name">${user.name || 'Urban Analyst'}</span>
            <span class="user-role-tag">${user.role || 'Analyst'} Role</span>
          </div>
        </div>

        <button type="button" class="btn-logout" id="btn-logout" title="Sign out of UrbanSafe AI">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>

    <!-- Main Content Area -->
    <main class="dashboard-main">
      <!-- Universal Topbar -->
      <header class="dashboard-topbar">
        <div class="topbar-left">
          <div class="topbar-titles">
            <h1 class="page-main-title">${pageTitle}</h1>
            <p class="page-sub-title">${pageSubtitle}</p>
          </div>
        </div>

        <div class="topbar-center">
          <!-- Global Search Input -->
          <div class="global-search-container">
            <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              id="global-search-input"
              class="global-search-input"
              placeholder="Search Hyderabad corridors, hotspots (e.g. Hitec City, Musi)..."
            />
            <div class="search-results-dropdown" id="search-results-dropdown" style="display: none;"></div>
          </div>
        </div>

        <div class="topbar-actions">
          <!-- Prominent GO Safe Journey Button -->
          <button class="btn-topbar-go" id="btn-topbar-go" title="Launch Safe Journey Navigation">
            <span class="go-badge-icon">GO</span>
            <span>Safe Journey</span>
          </button>

          <!-- Live Telemetry Status Tag -->
          <span class="system-status-indicator" title="Connected to urban sensors">
            <span class="live-pulse-dot"></span>
            <span id="telemetry-status-text">DEMO PREDICTION ENGINE</span>
          </span>

          <!-- Refresh Data Button -->
          <button class="topbar-btn" id="btn-refresh-telemetry" title="Refresh Telemetry">
            <svg id="refresh-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M23 4v6h-6"></path>
              <path d="M1 20v-6h6"></path>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
            </svg>
          </button>

          <!-- Notifications Bell -->
          <div style="position: relative;">
            <button class="topbar-btn" id="btn-notifications" title="Notifications">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              ${alerts.length > 0 ? `<span class="bell-badge">${alerts.length}</span>` : ''}
            </button>
            <div class="notifications-dropdown" id="notifications-dropdown" style="display: none;">
              <div class="notif-header">
                <strong>Active System Alerts (${alerts.length})</strong>
                <a href="/alerts" class="view-all-alerts-link">View All</a>
              </div>
              <div class="notif-list">
                ${alerts.map(a => `
                  <div class="notif-item" data-location-id="${a.locationId}">
                    <div class="notif-dot notif-${a.severity.toLowerCase()}"></div>
                    <div class="notif-info">
                      <div class="notif-title">${a.location}</div>
                      <div class="notif-desc">${a.reason}</div>
                      <div class="notif-time">${a.timestamp}</div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>

          <!-- Theme Toggle Button -->
          <button class="topbar-btn theme-toggle-btn" id="btn-theme-toggle" title="Toggle Theme">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
            </svg>
          </button>
        </div>
      </header>

      <!-- Page Specific Content Body -->
      <div class="dashboard-content-scroll" id="page-content-wrapper">
        ${contentHtml}
      </div>
    </main>

    <!-- Global Location Detail Modal Placeholder -->
    <div class="modal-backdrop" id="location-detail-modal" style="display: none;">
      <div class="modal-card">
        <div class="modal-header">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div class="risk-badge" id="modal-risk-badge">HIGH RISK</div>
            <h2 id="modal-location-title" style="font-size: 1.25rem;">Location Details</h2>
          </div>
          <button class="modal-close-btn" id="modal-close-btn">&times;</button>
        </div>
        <div class="modal-body" id="modal-location-body"></div>
        <div class="modal-footer" id="modal-location-footer"></div>
      </div>
    </div>

    <!-- Toast Container -->
    <div class="toast-container" id="toast-container"></div>
  `;

  // Attach Navigation Listeners
  layout.querySelectorAll('.nav-item').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = link.getAttribute('data-route');
      router.navigate(target);
    });
  });

  layout.querySelector('#brand-link').addEventListener('click', (e) => {
    e.preventDefault();
    router.navigate('/dashboard');
  });

  const topbarGoBtn = layout.querySelector('#btn-topbar-go');
  if (topbarGoBtn) {
    topbarGoBtn.addEventListener('click', (e) => {
      e.preventDefault();
      router.navigate('/go');
    });
  }

  // Interactive Logout Confirmation
  layout.querySelector('#btn-logout').addEventListener('click', (e) => {
    e.preventDefault();
    showLogoutConfirmationModal({ router });
  });

  // Theme Switcher
  layout.querySelector('#btn-theme-toggle').addEventListener('click', () => {
    const isLight = document.body.classList.toggle('theme-light');
    localStorage.setItem('urbansafe_theme', isLight ? 'light' : 'dark');
  });

  // Notifications Dropdown Toggle
  const notifBtn = layout.querySelector('#btn-notifications');
  const notifDropdown = layout.querySelector('#notifications-dropdown');
  notifBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isShown = notifDropdown.style.display === 'block';
    notifDropdown.style.display = isShown ? 'none' : 'block';
  });

  layout.querySelectorAll('.view-all-alerts-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      notifDropdown.style.display = 'none';
      router.navigate('/alerts');
    });
  });

  layout.querySelectorAll('.notif-item').forEach(item => {
    item.addEventListener('click', () => {
      const locId = item.getAttribute('data-location-id');
      if (locId) {
        locationState.setSelectedLocationId(locId);
        notifDropdown.style.display = 'none';
        router.navigate(`/prediction?loc=${locId}`);
      }
    });
  });

  // Refresh Demo Data
  const refreshBtn = layout.querySelector('#btn-refresh-telemetry');
  const refreshIcon = layout.querySelector('#refresh-icon');
  refreshBtn.addEventListener('click', () => {
    refreshIcon.style.animation = 'spin 0.8s linear infinite';
    setTimeout(() => {
      refreshIcon.style.animation = 'none';
      showToast('Demo dataset refreshed and synchronized across all safety modules.');
    }, 600);
  });

  // Global Search Implementation
  const searchInput = layout.querySelector('#global-search-input');
  const searchDropdown = layout.querySelector('#search-results-dropdown');

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim().toLowerCase();
    if (!query) {
      searchDropdown.style.display = 'none';
      return;
    }

    const matches = ACCIDENT_DEMO_LOCATIONS.filter(l =>
      l.name.toLowerCase().includes(query) ||
      l.id.toLowerCase().includes(query) ||
      l.roadType.toLowerCase().includes(query)
    );

    if (matches.length === 0) {
      searchDropdown.innerHTML = `<div class="search-item empty">No urban corridors found matching "${query}"</div>`;
    } else {
      searchDropdown.innerHTML = matches.map(m => `
        <div class="search-item" data-location-id="${m.id}">
          <div class="search-item-left">
            <strong>${m.name}</strong>
            <span>${m.roadType} &bull; ${m.historicalAccidents} collisions</span>
          </div>
          <span class="search-risk-badge badge-${m.historicalRisk >= 70 ? 'high' : m.historicalRisk >= 40 ? 'med' : 'low'}">
            ${m.historicalRisk >= 70 ? 'HIGH' : m.historicalRisk >= 40 ? 'MEDIUM' : 'LOW'} (${m.historicalRisk}/100)
          </span>
        </div>
      `).join('');

      searchDropdown.querySelectorAll('.search-item').forEach(item => {
        item.addEventListener('click', () => {
          const locId = item.getAttribute('data-location-id');
          searchDropdown.style.display = 'none';
          searchInput.value = '';
          openLocationModal(locId);
        });
      });
    }
    searchDropdown.style.display = 'block';
  });

  // Close dropdowns on outside click
  document.addEventListener('click', () => {
    if (notifDropdown) notifDropdown.style.display = 'none';
    if (searchDropdown) searchDropdown.style.display = 'none';
  });

  // Modal Close
  const modal = layout.querySelector('#location-detail-modal');
  layout.querySelector('#modal-close-btn').addEventListener('click', () => {
    modal.style.display = 'none';
  });
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
  });

  // Expose global openLocationModal
  window.openLocationModal = function(locationId) {
    const loc = locationState.getLocationById(locationId);
    if (!loc) return;

    locationState.setSelectedLocationId(loc.id);

    layout.querySelector('#modal-location-title').textContent = loc.name;
    const badge = layout.querySelector('#modal-risk-badge');
    badge.textContent = `${loc.historicalRisk >= 70 ? 'HIGH' : loc.historicalRisk >= 40 ? 'MEDIUM' : 'LOW'} RISK (${loc.historicalRisk}/100)`;
    badge.className = `risk-badge risk-${loc.historicalRisk >= 70 ? 'high' : loc.historicalRisk >= 40 ? 'medium' : 'low'}`;

    layout.querySelector('#modal-location-body').innerHTML = `
      <div class="modal-grid">
        <div class="modal-col">
          <div class="meta-card">
            <h4>Location Telemetry</h4>
            <p><strong>Corridor Type:</strong> ${loc.roadType}</p>
            <p><strong>Traffic Density:</strong> ${loc.trafficDensity}</p>
            <p><strong>Weather:</strong> ${loc.weather} (${loc.visibility} km vis)</p>
            <p><strong>Road Condition:</strong> ${loc.roadCondition} Surface</p>
            <p><strong>Lighting:</strong> ${loc.lighting} Illumination</p>
          </div>
          <div class="meta-card" style="margin-top: 12px;">
            <h4>Risk Factors (Feature Contributions)</h4>
            ${(loc.riskFactors || []).map(f => `
              <div style="display: flex; justify-content: space-between; font-size: 0.84rem; margin-top: 4px;">
                <span>${f.factor}</span>
                <strong class="text-amber">${f.impact}</strong>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="modal-col">
          <div class="meta-card">
            <h4>Accident Statistics</h4>
            <div style="display: flex; gap: 20px; margin: 8px 0;">
              <div>
                <span style="font-size: 1.5rem; font-weight: 800;" class="text-red">${loc.historicalAccidents}</span>
                <div style="font-size: 0.72rem; color: var(--text-muted);">Historical Collisions</div>
              </div>
              <div>
                <span style="font-size: 1.5rem; font-weight: 800;" class="text-amber">${loc.hotspotStatus ? 'ACTIVE' : 'NONE'}</span>
                <div style="font-size: 0.72rem; color: var(--text-muted);">Hotspot Cluster</div>
              </div>
            </div>
            <p style="font-size: 0.84rem; color: var(--text-secondary); margin-top: 8px;">
              <strong>Primary Cause:</strong> ${loc.primaryCause}
            </p>
          </div>

          <div class="meta-card advisory-card" style="margin-top: 12px;">
            <h4>Automated Prevention Advisory</h4>
            <p>${loc.preventionRecommendation}</p>
          </div>
        </div>
      </div>
    `;

    layout.querySelector('#modal-location-footer').innerHTML = `
      <button class="btn-primary" id="modal-btn-predict">Analyze in Prediction &rarr;</button>
      <button class="btn-secondary" id="modal-btn-view-map">View on Urban Map</button>
      <button class="btn-secondary" id="modal-btn-view-explain">View Explainable AI</button>
    `;

    layout.querySelector('#modal-btn-predict').addEventListener('click', () => {
      modal.style.display = 'none';
      router.navigate(`/prediction?loc=${loc.id}`);
    });

    layout.querySelector('#modal-btn-view-map').addEventListener('click', () => {
      modal.style.display = 'none';
      router.navigate(`/map?loc=${loc.id}`);
    });

    layout.querySelector('#modal-btn-view-explain').addEventListener('click', () => {
      modal.style.display = 'none';
      router.navigate(`/explainable-ai?loc=${loc.id}`);
    });

    modal.style.display = 'flex';
  };

  function showToast(message) {
    const toastContainer = layout.querySelector('#toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast toast-info';
    toast.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
      </svg>
      <span>${message}</span>
    `;
    toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.remove();
    }, 3500);
  }

  if (onMounted) {
    setTimeout(() => onMounted(layout), 20);
  }

  return layout;
}
