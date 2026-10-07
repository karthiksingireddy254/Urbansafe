// Test script for login flow verification
import { auth } from './src/auth.js';
import { renderLoginView } from './src/views/login.js';

// Setup DOM globals
class MockDOMElement {
  constructor(tagName = 'div') {
    this.tagName = tagName.toUpperCase();
    this.className = '';
    this.id = '';
    this.innerHTML = '';
    this.style = {};
    this.children = [];
    this.dataset = {};
    this.value = '';
    this.disabled = false;
    this._eventListeners = {};
    this._elementsCache = {};
  }
  appendChild(child) { this.children.push(child); return child; }
  querySelector(sel) {
    if (!this._elementsCache[sel]) {
      this._elementsCache[sel] = new MockDOMElement(sel);
    }
    return this._elementsCache[sel];
  }
  querySelectorAll() { return [new MockDOMElement('div')]; }
  addEventListener(evt, cb) {
    if (!this._eventListeners[evt]) this._eventListeners[evt] = [];
    this._eventListeners[evt].push(cb);
  }
  async dispatchEvent(evt) {
    const list = this._eventListeners[evt.type] || [];
    for (const handler of list) {
      await handler(evt);
    }
  }
  classList = { add: () => {}, remove: () => {}, contains: () => false };
}

global.document = {
  createElement: (tag) => new MockDOMElement(tag),
  getElementById: () => new MockDOMElement('div'),
  querySelector: () => new MockDOMElement('div'),
  querySelectorAll: () => [new MockDOMElement('div')],
  body: new MockDOMElement('body')
};

global.window = {
  location: { pathname: '/login', reload: () => {} },
  addEventListener: () => {},
  innerWidth: 1280,
  innerHeight: 800,
  matchMedia: () => ({ matches: false })
};

global.localStorage = {
  _s: {},
  getItem(k) { return this._s[k] || null; },
  setItem(k, v) { this._s[k] = String(v); },
  removeItem(k) { delete this._s[k]; }
};

global.sessionStorage = {
  _s: {},
  getItem(k) { return this._s[k] || null; },
  setItem(k, v) { this._s[k] = String(v); },
  removeItem(k) { delete this._s[k]; }
};

console.log('Testing Login Flow Execution...');

let navigatedTo = null;
const mockRouter = {
  navigate(path) {
    navigatedTo = path;
    console.log(`[PASS] Navigated immediately to: ${path}`);
  }
};

const loginView = renderLoginView(mockRouter);

// Test 1: Auto-fill demo
const autoFillBtn = loginView.querySelector('#btn-autofill-demo');
const emailInput = loginView.querySelector('#login-email');
const passwordInput = loginView.querySelector('#login-password');
const form = loginView.querySelector('#login-form');
const submitBtn = loginView.querySelector('#btn-login-submit');

emailInput.value = 'demo@urbansafe.ai';
passwordInput.value = 'demo123';

console.log('Dispatching submit event on login form...');
const start = Date.now();
await form.dispatchEvent({ type: 'submit', preventDefault: () => {} });
const elapsed = Date.now() - start;

console.log(`Login completed in ${elapsed} ms`);
if (navigatedTo === '/dashboard' && elapsed < 200) {
  console.log('[SUCCESS] Immediate login flow verified!');
  process.exit(0);
} else {
  console.error('[FAIL] Login did not navigate immediately to /dashboard. Target:', navigatedTo);
  process.exit(1);
}
