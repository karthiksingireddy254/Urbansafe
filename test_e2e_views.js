// UrbanSafe AI - Comprehensive E2E Views and Services Validation
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mock DOM environment for Node testing
class MockDOMElement {
  constructor(tagName = 'div') {
    this.tagName = tagName.toUpperCase();
    this.className = '';
    this.id = '';
    this.innerHTML = '';
    this.style = {};
    this.children = [];
    this.dataset = {};
    this.attributes = {};
    this.value = '';
    this._eventListeners = {};
  }

  appendChild(child) {
    this.children.push(child);
    return child;
  }

  querySelector(selector) {
    // Simple mock selector support
    if (selector.startsWith('#')) {
      const id = selector.slice(1);
      return this._findById(id);
    }
    if (selector.startsWith('.')) {
      const cls = selector.slice(1);
      return this._findByClass(cls);
    }
    return new MockDOMElement('div');
  }

  querySelectorAll(selector) {
    return [new MockDOMElement('div')];
  }

  _findById(id) {
    if (this.id === id) return this;
    for (const child of this.children) {
      if (child instanceof MockDOMElement) {
        const found = child._findById(id);
        if (found) return found;
      }
    }
    return new MockDOMElement('div');
  }

  _findByClass(cls) {
    if (this.className.includes(cls)) return this;
    for (const child of this.children) {
      if (child instanceof MockDOMElement) {
        const found = child._findByClass(cls);
        if (found) return found;
      }
    }
    return new MockDOMElement('div');
  }

  addEventListener(event, callback) {
    if (!this._eventListeners[event]) this._eventListeners[event] = [];
    this._eventListeners[event].push(callback);
  }

  dispatchEvent(event) {
    const handlers = this._eventListeners[event.type] || [];
    for (const handler of handlers) {
      handler(event);
    }
  }

  setAttribute(k, v) { this.attributes[k] = v; }
  getAttribute(k) { return this.attributes[k] || null; }
  classList = {
    add: () => {},
    remove: () => {},
    contains: () => false,
    toggle: () => {}
  };
}

global.document = {
  createElement: (tag) => new MockDOMElement(tag),
  getElementById: (id) => new MockDOMElement('div'),
  querySelector: (sel) => new MockDOMElement('div'),
  querySelectorAll: (sel) => [new MockDOMElement('div')],
  body: new MockDOMElement('body'),
  title: '',
  readyState: 'complete',
  addEventListener: () => {}
};

global.window = {
  location: { pathname: '/dashboard', search: '', reload: () => {} },
  addEventListener: () => {},
  history: { pushState: () => {} },
  scrollTo: () => {},
  innerWidth: 1280,
  innerHeight: 800,
  requestAnimationFrame: (cb) => setTimeout(() => cb(Date.now()), 16),
  cancelAnimationFrame: (id) => clearTimeout(id),
  matchMedia: () => ({ matches: false, addEventListener: () => {}, removeEventListener: () => {} })
};
global.requestAnimationFrame = global.window.requestAnimationFrame;
global.cancelAnimationFrame = global.window.cancelAnimationFrame;

global.localStorage = {
  _store: {},
  getItem(k) { return this._store[k] || null; },
  setItem(k, v) { this._store[k] = String(v); },
  removeItem(k) { delete this._store[k]; },
  clear() { this._store = {}; }
};

global.sessionStorage = {
  _store: {},
  getItem(k) { return this._store[k] || null; },
  setItem(k, v) { this._store[k] = String(v); },
  removeItem(k) { delete this._store[k]; },
  clear() { this._store = {}; }
};

// Mock Leaflet
global.L = {
  map: () => ({
    setView: function() { return this; },
    addLayer: function() { return this; },
    remove: function() { return this; },
    invalidateSize: function() { return this; },
    on: function() { return this; }
  }),
  tileLayer: () => ({
    addTo: function() { return this; }
  }),
  circleMarker: () => ({
    addTo: function() { return this; },
    bindPopup: function() { return this; },
    on: function() { return this; }
  }),
  circle: () => ({
    addTo: function() { return this; },
    bindPopup: function() { return this; }
  }),
  marker: () => ({
    addTo: function() { return this; },
    bindPopup: function() { return this; }
  }),
  divIcon: () => ({})
};

console.log('----------------------------------------------------');
console.log('URBANSAFE AI - FULL E2E VIEW RENDER AUDIT');
console.log('----------------------------------------------------');

// Dynamically import all views and test execution
async function runAudit() {
  const { auth } = await import('./src/auth.js');
  // Log in demo user for view rendering
  auth.login('demo@urbansafe.ai', 'demo123');

  const mockRouter = {
    navigate: (path) => console.log(`  [Router] Navigate called: ${path}`)
  };

  const viewsToTest = [
    { name: 'Login View', path: './src/views/login.js', fn: 'renderLoginView' },
    { name: 'Register View', path: './src/views/register.js', fn: 'renderRegisterView' },
    { name: 'Forgot Password View', path: './src/views/forgotPassword.js', fn: 'renderForgotPasswordView' },
    { name: 'Dashboard View', path: './src/views/dashboard.js', fn: 'renderDashboardView' },
    { name: 'GO Safe Journey View', path: './src/views/go.js', fn: 'renderGoView' },
    { name: 'Prediction View', path: './src/views/prediction.js', fn: 'renderPredictionView' },
    { name: 'Map View', path: './src/views/map.js', fn: 'renderMapView' },
    { name: 'Hotspots View', path: './src/views/hotspots.js', fn: 'renderHotspotsView' },
    { name: 'Analytics View', path: './src/views/analytics.js', fn: 'renderAnalyticsView' },
    { name: 'Explainable AI View', path: './src/views/explainableAi.js', fn: 'renderExplainableAiView' },
    { name: 'Prevention View', path: './src/views/prevention.js', fn: 'renderPreventionView' },
    { name: 'Models View', path: './src/views/models.js', fn: 'renderModelsView' },
    { name: 'Telemetry View', path: './src/views/telemetry.js', fn: 'renderTelemetryView' },
    { name: 'Alerts View', path: './src/views/alerts.js', fn: 'renderAlertsView' },
    { name: 'Settings View', path: './src/views/settings.js', fn: 'renderSettingsView' }
  ];

  let passed = 0;
  for (const v of viewsToTest) {
    try {
      const module = await import(v.path);
      const renderFn = module[v.fn];
      if (typeof renderFn !== 'function') {
        throw new Error(`Export ${v.fn} is not a function in ${v.path}`);
      }
      const element = renderFn(mockRouter);
      if (!element) {
        throw new Error(`Render function ${v.fn} returned falsy value`);
      }
      console.log(`[PASS] ${v.name} (${v.fn}) rendered successfully`);
      passed++;
    } catch (err) {
      console.error(`[FAIL] ${v.name} error:`, err);
    }
  }

  // Test Server HTTP Endpoints
  console.log('\n--- Testing Server HTTP 200 Responses ---');
  const serverUrls = [
    '/',
    '/login',
    '/dashboard',
    '/go',
    '/prediction',
    '/map',
    '/hotspots',
    '/analytics',
    '/explainable-ai',
    '/prevention',
    '/models',
    '/alerts',
    '/settings',
    '/src/main.js',
    '/src/services/predictionService.js',
    '/src/data/demoPredictions.js',
    '/src/styles/dashboard.css'
  ];

  let httpPassed = 0;
  for (const urlPath of serverUrls) {
    await new Promise((resolve) => {
      http.get(`http://localhost:3000${urlPath}`, (res) => {
        if (res.statusCode === 200) {
          console.log(`[HTTP 200] GET ${urlPath}`);
          httpPassed++;
        } else {
          console.error(`[HTTP ${res.statusCode}] GET ${urlPath}`);
        }
        resolve();
      }).on('error', (err) => {
        console.error(`[HTTP ERROR] GET ${urlPath}:`, err.message);
        resolve();
      });
    });
  }

  console.log('\n----------------------------------------------------');
  console.log(`TOTAL AUDIT RESULT: ${passed}/${viewsToTest.length} Views Passed | ${httpPassed}/${serverUrls.length} HTTP 200 OK`);
  console.log('----------------------------------------------------');

  if (passed === viewsToTest.length && httpPassed === serverUrls.length) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runAudit();
