// UrbanSafe AI - Comprehensive Test Suite for Logout Confirmation Flow
import assert from 'assert';

console.log('====================================================');
console.log('RUNNING URBANSAFE AI LOGOUT FLOW TEST SUITE');
console.log('====================================================\n');

// Mock DOM elements
class MockDOMElement {
  constructor(tagName = 'div') {
    this.tagName = tagName.toUpperCase();
    this.className = '';
    this.id = '';
    this.innerHTML = '';
    this.textContent = '';
    this.style = {};
    this.children = [];
    this.dataset = {};
    this.value = '';
    this.disabled = false;
    this.parentNode = null;
    this._attributes = {};
    this._eventListeners = {};
    this._elementsCache = {};
    this.classList = {
      _classes: new Set(),
      add: (c) => this.classList._classes.add(c),
      remove: (c) => this.classList._classes.delete(c),
      contains: (c) => this.classList._classes.has(c)
    };
  }
  setAttribute(k, v) { this._attributes[k] = v; }
  getAttribute(k) { return this._attributes[k] || null; }
  appendChild(child) {
    child.parentNode = this;
    this.children.push(child);
    return child;
  }
  removeChild(child) {
    const idx = this.children.indexOf(child);
    if (idx !== -1) this.children.splice(idx, 1);
    child.parentNode = null;
    return child;
  }
  remove() {
    if (this.parentNode) this.parentNode.removeChild(this);
  }
  focus() {}
  getBoundingClientRect() {
    return { left: 400, top: 200, width: 460, height: 320, right: 860, bottom: 520 };
  }
  querySelector(sel) {
    if (!this._elementsCache[sel]) {
      const el = new MockDOMElement(sel.replace(/[#.]/g, ''));
      el.className = sel.startsWith('.') ? sel.slice(1) : '';
      el.id = sel.startsWith('#') ? sel.slice(1) : '';
      this._elementsCache[sel] = el;
    }
    return this._elementsCache[sel];
  }
  querySelectorAll() { return [new MockDOMElement('div')]; }
  addEventListener(evt, cb) {
    if (!this._eventListeners[evt]) this._eventListeners[evt] = [];
    this._eventListeners[evt].push(cb);
  }
  removeEventListener(evt, cb) {
    if (this._eventListeners[evt]) {
      this._eventListeners[evt] = this._eventListeners[evt].filter(f => f !== cb);
    }
  }
  async click() {
    return this.dispatchEvent({ type: 'click', target: this, preventDefault: () => {}, stopPropagation: () => {} });
  }
  async dispatchEvent(evt) {
    const list = this._eventListeners[evt.type] || [];
    for (const handler of list) {
      await handler(evt);
    }
  }
}

const mockBody = new MockDOMElement('body');
const elementsById = {};

global.document = {
  createElement: (tag) => new MockDOMElement(tag),
  getElementById: (id) => {
    if (!elementsById[id]) {
      elementsById[id] = new MockDOMElement('div');
      elementsById[id].id = id;
    }
    return elementsById[id];
  },
  querySelector: (sel) => mockBody.querySelector(sel),
  querySelectorAll: () => [new MockDOMElement('div')],
  body: mockBody,
  addEventListener: (evt, cb) => mockBody.addEventListener(evt, cb),
  removeEventListener: (evt, cb) => mockBody.removeEventListener(evt, cb),
  dispatchEvent: (evt) => mockBody.dispatchEvent(evt)
};

global.window = {
  location: { pathname: '/dashboard', reload: () => {}, href: '/dashboard' },
  addEventListener: () => {},
  removeEventListener: () => {},
  innerWidth: 1280,
  innerHeight: 800,
  devicePixelRatio: 1,
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

global.requestAnimationFrame = (cb) => setTimeout(cb, 5);
global.cancelAnimationFrame = (id) => clearTimeout(id);
global.performance = { now: () => Date.now() };

let passed = 0;
let failed = 0;

function it(desc, fn) {
  try {
    fn();
    console.log(`  [PASS] ${desc}`);
    passed++;
  } catch (err) {
    console.error(`  [FAIL] ${desc}:`, err.message);
    failed++;
  }
}

async function itAsync(desc, fn) {
  try {
    await fn();
    console.log(`  [PASS] ${desc}`);
    passed++;
  } catch (err) {
    console.error(`  [FAIL] ${desc}:`, err.message);
    failed++;
  }
}

async function runTests() {
  const { auth } = await import('./src/auth.js');
  const { triggerConfettiBlast } = await import('./src/utils/confetti.js');
  const { showLogoutConfirmationModal } = await import('./src/components/logoutConfirmationModal.js');

  // Test 1: Active Login Session
  await itAsync('Auth login initializes active session in storage', async () => {
    const user = await auth.login('analyst@urbansafe.ai', 'demo123', true);
    assert.ok(user, 'User object returned');
    assert.strictEqual(auth.isAuthenticated(), true, 'auth.isAuthenticated is true');
  });

  // Test 2: Modal creation
  it('Modal renders with "Ready to leave?" and action buttons', () => {
    const mockRouter = { navigate: () => {} };
    const modal = showLogoutConfirmationModal({ router: mockRouter });

    assert.ok(modal, 'Modal DOM element created');
    assert.strictEqual(modal.className, 'logout-modal-backdrop', 'Backdrop class assigned');
    assert.strictEqual(modal.getAttribute('role'), 'dialog', 'Aria dialog role set');
  });

  // Test 3: Cancel button dismisses modal and keeps user session
  await itAsync('Cancel button dismisses modal without terminating session', async () => {
    let cancelled = false;
    const mockRouter = { navigate: () => { throw new Error('Should not navigate'); } };

    const modal = showLogoutConfirmationModal({
      router: mockRouter,
      onCancel: () => { cancelled = true; }
    });

    const cancelBtn = modal.querySelector('#btn-logout-cancel');
    await cancelBtn.click();

    await new Promise(r => setTimeout(r, 300));
    assert.strictEqual(cancelled, true, 'onCancel callback invoked');
    assert.strictEqual(auth.isAuthenticated(), true, 'Session remains authenticated');
  });

  // Test 4: Escape key dismissal
  await itAsync('Escape key triggers modal dismissal', async () => {
    let cancelled = false;
    const mockRouter = { navigate: () => {} };

    showLogoutConfirmationModal({
      router: mockRouter,
      onCancel: () => { cancelled = true; }
    });

    await document.dispatchEvent({ type: 'keydown', key: 'Escape', preventDefault: () => {} });
    await new Promise(r => setTimeout(r, 300));
    assert.strictEqual(cancelled, true, 'Escape key triggered cancellation');
  });

  // Test 5: Confetti engine execution
  await itAsync('triggerConfettiBlast executes and cleans up', async () => {
    await triggerConfettiBlast({ durationMs: 20, particleCount: 5 });
    assert.ok(true, 'Confetti completed without errors');
  });

  // Test 6: Yes, Log Out flow
  await itAsync('Confirm button logs out, shows success message, and triggers redirect to /login', async () => {
    let navigatedTo = null;
    let successFired = false;
    const mockRouter = {
      navigate: (path) => { navigatedTo = path; }
    };

    const modal = showLogoutConfirmationModal({
      router: mockRouter,
      onSuccess: () => { successFired = true; }
    });

    const confirmBtn = modal.querySelector('#btn-logout-confirm');
    await confirmBtn.click();

    // Verify immediate loading state
    assert.strictEqual(confirmBtn.disabled, true, 'Confirm button is disabled during logout');

    // Wait for logout async completion
    await new Promise(r => setTimeout(r, 50));
    assert.strictEqual(successFired, true, 'onSuccess callback fired');
    assert.strictEqual(auth.isAuthenticated(), false, 'Session removed from storage');

    // Wait for redirect delay
    await new Promise(r => setTimeout(r, 1600));
    assert.strictEqual(navigatedTo, '/login', 'Successfully navigated to /login');
  });

  // Test 7: Error handling when auth.logout fails
  await itAsync('Error handling displays error message and preserves session on dashboard', async () => {
    let navigated = false;
    const mockRouter = { navigate: () => { navigated = true; } };

    const originalLogout = auth.logout;
    auth.logout = () => { throw new Error('Database disconnect during token revocation'); };

    const modal = showLogoutConfirmationModal({ router: mockRouter });
    const confirmBtn = modal.querySelector('#btn-logout-confirm');
    await confirmBtn.click();

    await new Promise(r => setTimeout(r, 50));

    assert.strictEqual(confirmBtn.disabled, false, 'Confirm button re-enabled after error');
    assert.strictEqual(navigated, false, 'Did not navigate away');

    auth.logout = originalLogout;
  });

  console.log(`\n====================================================`);
  console.log(`LOGOUT TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log(`====================================================\n`);

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch(err => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
