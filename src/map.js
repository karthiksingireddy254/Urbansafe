// UrbanSafe AI - Smart City Risk Map Visualization Engine (Login & Landing)
import { ACCIDENT_DEMO_LOCATIONS } from './data/accidentDemoData.js';

export class CityMapVisualization {
  constructor(containerElement) {
    this.container = containerElement;
    this.mapInstance = null;
    this.canvas = null;
    this.ctx = null;
    this.animationFrameId = null;
    this.isReducedMotion = (typeof window !== 'undefined' && typeof window.matchMedia === 'function')
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;
  }

  render() {
    this.container.innerHTML = `
      <div id="map-container"></div>
      <canvas class="radar-canvas"></canvas>
      <div class="secure-mode-overlay"></div>
      <div class="radar-sweep-bar"></div>

      <!-- Top Branding -->
      <a href="/login" class="map-brand-overlay" id="brand-home-link">
        <div class="brand-icon-wrapper">
          <svg class="brand-icon-svg" viewBox="0 0 48 48" fill="none">
            <path d="M24 4L7 11V22C7 32.5 14.2 42.2 24 45C33.8 42.2 41 32.5 41 22V11L24 4Z" fill="#0f172a" stroke="#00f2fe" stroke-width="2.5" stroke-linejoin="round"/>
            <path d="M18 36L22 18H26L30 36H18Z" fill="#1e293b" opacity="0.8"/>
            <path d="M24 20V34" stroke="#f59e0b" stroke-width="2" stroke-dasharray="2 2" stroke-linecap="round"/>
            <circle cx="24" cy="18" r="4.5" fill="#38bdf8" />
            <circle cx="24" cy="18" r="2" fill="#ffffff" />
          </svg>
        </div>
        <div class="brand-text">
          <h1>UrbanSafe AI</h1>
          <span>ACCIDENT RISK INTELLIGENCE</span>
        </div>
      </a>

      <!-- Live Verifying Access Indicator -->
      <div class="verifying-banner" id="verifying-banner">
        <div class="verifying-spinner"></div>
        <span>Verifying access & establishing secure session...</span>
      </div>

      <!-- Bottom Information Glass Card -->
      <div class="map-glass-card">
        <div class="glass-card-header">
          <div class="glass-badge">
            <span class="live-pulse-dot"></span>
            URBAN SAFETY INTELLIGENCE
          </div>
          <span class="demo-tag">[ DEMO DATA ]</span>
        </div>

        <div class="glass-card-body">
          <h2>Predict accident risk. Identify hotspots. Understand the factors.</h2>
          <p>Multi-variable risk scoring evaluating intersection geometry, traffic congestion, weather, and historical collision factors.</p>
        </div>

        <div class="map-stats-grid">
          <div class="stat-item">
            <span class="stat-value" id="stat-records">12,486</span>
            <span class="stat-label">Accident Records</span>
          </div>
          <div class="stat-item">
            <span class="stat-value text-amber" id="stat-hotspots">16</span>
            <span class="stat-label">Risk Hotspots</span>
          </div>
          <div class="stat-item">
            <span class="stat-value text-red" id="stat-zones">38</span>
            <span class="stat-label">High-Risk Zones</span>
          </div>
        </div>
      </div>
    `;

    this.initLeaflet();
    this.initCanvasOverlay();
    this.animateCounters();
  }

  initLeaflet() {
    const mapElement = this.container.querySelector('#map-container');
    if (!mapElement) return;

    // Hyderabad City Center
    const center = [17.4421, 78.3912];

    if (typeof window !== 'undefined' && window.L) {
      try {
        this.mapInstance = window.L.map(mapElement, {
          center: center,
          zoom: 12,
          zoomControl: true,
          attributionControl: true,
          dragging: true,
          scrollWheelZoom: false,
          doubleClickZoom: true,
          touchZoom: true
        });

        // OpenStreetMap base map layer
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors'
        }).addTo(this.mapInstance);

        const markersLayer = window.L.layerGroup().addTo(this.mapInstance);
        const zonesLayer = window.L.layerGroup().addTo(this.mapInstance);

        // Add Risk Markers and Hotspot Zones from Centralized Demo Dataset
        ACCIDENT_DEMO_LOCATIONS.forEach((spot) => {
          const riskLevel = spot.historicalRisk >= 70 ? 'HIGH' : spot.historicalRisk >= 40 ? 'MEDIUM' : 'LOW';
          const severity = riskLevel.toLowerCase();

          // Zone circles for hotspots
          if (spot.hotspotStatus) {
            window.L.circle([spot.latitude, spot.longitude], {
              radius: 450,
              color: riskLevel === 'HIGH' ? '#ef4444' : '#f59e0b',
              fillColor: riskLevel === 'HIGH' ? '#ef4444' : '#f59e0b',
              fillOpacity: 0.18,
              weight: 1.5,
              dashArray: '3, 3'
            }).addTo(zonesLayer);
          }

          const markerIcon = window.L.divIcon({
            className: 'custom-risk-icon',
            html: `
              <div class="risk-marker-container ${severity}">
                <div class="map-marker-pulse"></div>
                <div class="risk-marker-core"></div>
                ${spot.hotspotStatus ? '<div class="hotspot-star-badge">★</div>' : ''}
              </div>
            `,
            iconSize: [30, 30],
            iconAnchor: [15, 15],
            popupAnchor: [0, -12]
          });

          const marker = window.L.marker([spot.latitude, spot.longitude], { icon: markerIcon }).addTo(markersLayer);

          // Click popup showing Location, Risk Level, Risk Score
          const popupHtml = `
            <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 0.82rem; color: #0f172a; padding: 4px; min-width: 170px;">
              <strong style="font-size: 0.88rem; display: block; margin-bottom: 4px;">${spot.name}</strong>
              <div style="margin: 2px 0;"><strong>Risk Level:</strong> <span style="font-weight: 700; color: ${riskLevel === 'HIGH' ? '#ef4444' : riskLevel === 'MEDIUM' ? '#f59e0b' : '#10b981'};">${riskLevel}</span></div>
              <div style="margin: 2px 0;"><strong>Risk Score:</strong> <strong>${spot.historicalRisk}/100</strong></div>
              <div style="margin: 2px 0; color: #64748b; font-size: 0.74rem;">${spot.roadType} &bull; ${spot.trafficDensity} traffic</div>
            </div>
          `;

          marker.bindPopup(popupHtml);
          marker.bindTooltip(
            `<strong>${spot.name}</strong> &bull; ${riskLevel} (${spot.historicalRisk}/100)`,
            { direction: 'top', className: 'risk-tooltip' }
          );
        });
      } catch (err) {
        console.warn('Leaflet tile fallback to canvas rendering', err);
      }
    }
  }

  initCanvasOverlay() {
    this.canvas = this.container.querySelector('.radar-canvas');
    if (!this.canvas || typeof this.canvas.getContext !== 'function') return;

    this.ctx = this.canvas.getContext('2d');
    if (!this.ctx) return;

    this.resizeCanvas();
    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      window.addEventListener('resize', () => this.resizeCanvas());
    }

    this.generateMockRoads();
    if (!this.isReducedMotion) {
      this.startTrafficAnimation();
    }
  }

  resizeCanvas() {
    if (!this.canvas) return;
    this.canvas.width = this.container.clientWidth;
    this.canvas.height = this.container.clientHeight;
  }

  generateMockRoads() {
    const w = this.canvas.width || 800;
    const h = this.canvas.height || 800;

    this.roadSegments = [
      { x1: 0, y1: h * 0.35, x2: w, y2: h * 0.4 },
      { x1: 0, y1: h * 0.65, x2: w, y2: h * 0.6 },
      { x1: w * 0.3, y1: 0, x2: w * 0.35, y2: h },
      { x1: w * 0.7, y1: 0, x2: w * 0.65, y2: h },
      { x1: 0, y1: h * 0.2, x2: w * 0.8, y2: h },
      { x1: w * 0.2, y1: 0, x2: w, y2: h * 0.8 }
    ];

    this.trafficParticles = [];
    for (let i = 0; i < 28; i++) {
      const road = this.roadSegments[Math.floor(Math.random() * this.roadSegments.length)];
      this.trafficParticles.push({
        road: road,
        progress: Math.random(),
        speed: 0.0015 + Math.random() * 0.0025,
        color: i % 4 === 0 ? '#ef4444' : i % 3 === 0 ? '#f59e0b' : '#00f2fe',
        size: 2.5 + Math.random() * 2
      });
    }
  }

  startTrafficAnimation() {
    const loop = () => {
      if (!this.ctx || !this.canvas) return;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      this.ctx.lineWidth = 1.2;
      this.roadSegments.forEach((seg) => {
        this.ctx.beginPath();
        this.ctx.moveTo(seg.x1, seg.y1);
        this.ctx.lineTo(seg.x2, seg.y2);
        this.ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
        this.ctx.stroke();
      });

      this.trafficParticles.forEach((p) => {
        p.progress += p.speed;
        if (p.progress > 1) p.progress = 0;

        const curX = p.road.x1 + (p.road.x2 - p.road.x1) * p.progress;
        const curY = p.road.y1 + (p.road.y2 - p.road.y1) * p.progress;

        this.ctx.beginPath();
        this.ctx.arc(curX, curY, p.size, 0, Math.PI * 2);
        this.ctx.fillStyle = p.color;
        this.ctx.shadowBlur = 8;
        this.ctx.shadowColor = p.color;
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
      });

      if (typeof requestAnimationFrame !== 'undefined') {
        this.animationFrameId = requestAnimationFrame(loop);
      }
    };

    if (typeof requestAnimationFrame !== 'undefined') {
      loop();
    }
  }

  animateCounters() {
    const recEl = this.container.querySelector('#stat-records');
    const hsEl = this.container.querySelector('#stat-hotspots');
    const zEl = this.container.querySelector('#stat-zones');

    const targetAccidents = 12486;
    const targetHotspots = 16;
    const targetHighRisk = 38;

    const duration = 1400;
    const start = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();

    const frame = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);

      if (recEl) recEl.textContent = Math.floor(ease * targetAccidents).toLocaleString();
      if (hsEl) hsEl.textContent = Math.floor(ease * targetHotspots);
      if (zEl) zEl.textContent = Math.floor(ease * targetHighRisk);

      if (progress < 1) {
        if (typeof requestAnimationFrame !== 'undefined') {
          requestAnimationFrame(frame);
        }
      }
    };

    if (typeof requestAnimationFrame !== 'undefined') {
      requestAnimationFrame(frame);
    } else {
      frame(start + duration);
    }
  }

  setEmailFocus(isFocused) {
    if (isFocused) {
      this.container.classList.add('state-email-focused');
    } else {
      this.container.classList.remove('state-email-focused');
    }
  }

  setPasswordFocus(isFocused) {
    if (isFocused) {
      this.container.classList.add('state-password-focused');
    } else {
      this.container.classList.remove('state-password-focused');
    }
  }

  setAuthenticating(isAuth) {
    if (isAuth) {
      this.container.classList.add('state-authenticating');
    } else {
      this.container.classList.remove('state-authenticating');
    }
  }

  triggerScanningAnimation() {
    this.setAuthenticating(true);
  }

  destroy() {
    if (this.animationFrameId && typeof cancelAnimationFrame !== 'undefined') {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.mapInstance && typeof this.mapInstance.remove === 'function') {
      try {
        this.mapInstance.remove();
      } catch (e) {}
      this.mapInstance = null;
    }
  }
}
