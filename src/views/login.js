// UrbanSafe AI - Login View
import { auth } from '../auth.js';
import { CityMapVisualization } from '../map.js';

export function renderLoginView(router) {
  const container = document.createElement('div');
  container.className = 'auth-page-container';

  container.innerHTML = `
    <!-- Top Theme Switcher -->
    <div class="auth-top-controls">
      <button class="theme-toggle-btn" id="theme-btn" title="Toggle Theme" aria-label="Toggle Theme">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
      </button>
    </div>

    <!-- LEFT SIDE: Animated Smart-City Risk Visualization -->
    <div class="map-panel" id="map-panel"></div>

    <!-- RIGHT SIDE: Authentication Panel -->
    <div class="auth-panel">
      <div class="auth-panel-inner">
        <!-- Auth Header -->
        <div class="auth-header">
          <h1>Welcome Back</h1>
          <p>Sign in to your urban safety intelligence dashboard and monitor real-time road risk models.</p>
        </div>

        <!-- Quick Demo Fill Banner -->
        <div class="demo-badge-banner">
          <div>
            <strong>Demo Account:</strong> demo@urbansafe.ai
          </div>
          <button type="button" class="demo-fill-btn" id="btn-autofill-demo">
            Auto-Fill Demo
          </button>
        </div>

        <!-- Login Form -->
        <form class="auth-form" id="login-form" novalidate>
          <!-- Email Field -->
          <div class="form-group">
            <label for="login-email">Email Address</label>
            <div class="input-wrapper">
              <span class="input-icon-left">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
              </span>
              <input
                type="email"
                id="login-email"
                class="auth-input"
                placeholder="name@agency.gov or demo@urbansafe.ai"
                autocomplete="email"
                required
              />
            </div>
            <div class="field-error-msg" id="email-error"></div>
          </div>

          <!-- Password Field -->
          <div class="form-group">
            <label for="login-password">
              <span>Password</span>
            </label>
            <div class="input-wrapper">
              <span class="input-icon-left">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </span>
              <input
                type="password"
                id="login-password"
                class="auth-input"
                placeholder="Enter your access password"
                autocomplete="current-password"
                required
              />
              <button type="button" class="password-toggle-btn" id="toggle-password" aria-label="Toggle password visibility">
                <svg id="eye-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </button>
            </div>
            <div class="field-error-msg" id="password-error"></div>
          </div>

          <!-- Remember me & Forgot Password -->
          <div class="form-options-row">
            <label class="checkbox-label">
              <input type="checkbox" id="remember-me" checked />
              <span>Remember me</span>
            </label>
            <a href="/forgot-password" class="forgot-link" id="link-forgot-password">Forgot password?</a>
          </div>

          <!-- Primary Submit Button -->
          <button type="submit" class="btn-primary-auth" id="btn-login-submit">
            <span id="btn-text">Sign In</span>
          </button>
        </form>

        <!-- Social Alternative Login -->
        <div class="auth-divider">
          <span>Or Continue With</span>
        </div>

        <button type="button" class="btn-social-oauth" id="btn-google-oauth">
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
            <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
          </svg>
          <span>Continue with Google</span>
        </button>

        <!-- Register Link -->
        <div class="auth-footer-nav">
          <span>Don't have an account?</span>
          <a href="/register" id="link-create-account">Create Account</a>
        </div>

        <!-- Security Visual -->
        <div class="security-status-indicator">
          <div class="security-status-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              <path d="M9 12l2 2 4-4"></path>
            </svg>
          </div>
          <div class="security-status-text">
            <strong>Secure access to Urban Safety Intelligence</strong>
            <span>Verified node handshake & active telemetry session</span>
          </div>
        </div>
      </div>
    </div>
  `;

  // Mount Map Visualization
  const mapPanel = container.querySelector('#map-panel');
  const cityMap = new CityMapVisualization(mapPanel);
  setTimeout(() => cityMap.render(), 10);

  // Grab form inputs & elements
  const loginForm = container.querySelector('#login-form');
  const emailInput = container.querySelector('#login-email');
  const passwordInput = container.querySelector('#login-password');
  const rememberCheckbox = container.querySelector('#remember-me');
  const emailError = container.querySelector('#email-error');
  const passwordError = container.querySelector('#password-error');
  const submitBtn = container.querySelector('#btn-login-submit');
  const btnText = container.querySelector('#btn-text');
  const togglePasswordBtn = container.querySelector('#toggle-password');
  const autoFillDemoBtn = container.querySelector('#btn-autofill-demo');
  const googleBtn = container.querySelector('#btn-google-oauth');
  const themeBtn = container.querySelector('#theme-btn');

  // Interactive connection: Email focus
  emailInput.addEventListener('focus', () => cityMap.setEmailFocus(true));
  emailInput.addEventListener('blur', () => cityMap.setEmailFocus(false));

  // Interactive connection: Password focus (secure mode)
  passwordInput.addEventListener('focus', () => cityMap.setPasswordFocus(true));
  passwordInput.addEventListener('blur', () => cityMap.setPasswordFocus(false));

  // Show/Hide password toggle
  let isPasswordVisible = false;
  togglePasswordBtn.addEventListener('click', () => {
    isPasswordVisible = !isPasswordVisible;
    passwordInput.type = isPasswordVisible ? 'text' : 'password';
    togglePasswordBtn.innerHTML = isPasswordVisible
      ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
          <line x1="1" y1="1" x2="23" y2="23"></line>
        </svg>`
      : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>`;
  });

  // Auto-Fill Demo Credentials
  autoFillDemoBtn.addEventListener('click', () => {
    emailInput.value = 'demo@urbansafe.ai';
    passwordInput.value = 'demo123';
    emailError.textContent = '';
    passwordError.textContent = '';
    emailInput.classList.remove('input-error');
    passwordInput.classList.remove('input-error');
  });

  // Theme Toggle
  themeBtn.addEventListener('click', () => {
    const isLight = document.body.classList.toggle('theme-light');
    localStorage.setItem('urbansafe_theme', isLight ? 'light' : 'dark');
  });

  // Google OAuth demo handler
  googleBtn.addEventListener('click', () => {
    // Fill demo account and sign in directly
    emailInput.value = 'demo@urbansafe.ai';
    passwordInput.value = 'demo123';
    loginForm.dispatchEvent(new Event('submit'));
  });

  // Navigation Links
  container.querySelector('#link-create-account').addEventListener('click', (e) => {
    e.preventDefault();
    router.navigate('/register');
  });

  container.querySelector('#link-forgot-password').addEventListener('click', (e) => {
    e.preventDefault();
    router.navigate('/forgot-password');
  });

  let isAuthenticating = false;

  // Form Validation & Submit Flow
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Prevent duplicate login clicks while authenticating
    if (isAuthenticating) return;

    // Reset errors
    emailError.textContent = '';
    passwordError.textContent = '';
    emailInput.classList.remove('input-error');
    passwordInput.classList.remove('input-error');

    const email = emailInput.value.trim();
    const password = passwordInput.value;
    let hasError = false;

    // Email validation
    if (!email) {
      emailError.textContent = 'Please enter your email address.';
      emailInput.classList.add('input-error');
      hasError = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      emailError.textContent = 'Please enter a valid email format (e.g. name@domain.com).';
      emailInput.classList.add('input-error');
      hasError = true;
    }

    // Password validation
    if (!password) {
      passwordError.textContent = 'Password is required.';
      passwordInput.classList.add('input-error');
      hasError = true;
    } else if (password.length < 6) {
      passwordError.textContent = 'Password must contain at least 6 characters.';
      passwordInput.classList.add('input-error');
      hasError = true;
    }

    if (hasError) return;

    // Initiate loading state
    isAuthenticating = true;
    submitBtn.disabled = true;
    btnText.innerHTML = `
      <div class="btn-auth-spinner"></div>
      <span>Authenticating...</span>
    `;

    try {
      if (cityMap && typeof cityMap.triggerScanningAnimation === 'function') {
        cityMap.triggerScanningAnimation();
      }

      await auth.login(email, password, rememberCheckbox.checked);

      // Clean up map resources safely
      if (cityMap && typeof cityMap.destroy === 'function') {
        cityMap.destroy();
      }

      // Navigate immediately to the existing Dashboard
      router.navigate('/dashboard');
    } catch (err) {
      isAuthenticating = false;
      submitBtn.disabled = false;
      btnText.innerHTML = `<span>Sign In</span>`;
      if (cityMap && typeof cityMap.setAuthenticating === 'function') {
        cityMap.setAuthenticating(false);
      }
      passwordError.textContent = err.message || 'Authentication failed. Please try again.';
      passwordInput.classList.add('input-error');
    } finally {
      // Ensure loading state is reset if navigation didn't occur
      if (!auth.isAuthenticated()) {
        isAuthenticating = false;
        submitBtn.disabled = false;
        btnText.innerHTML = `<span>Sign In</span>`;
        if (cityMap && typeof cityMap.setAuthenticating === 'function') {
          cityMap.setAuthenticating(false);
        }
      }
    }
  });

  return container;
}
