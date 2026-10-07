// UrbanSafe AI - Forgot Password View
import { CityMapVisualization } from '../map.js';

export function renderForgotPasswordView(router) {
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

    <!-- RIGHT SIDE: Forgot Password Card -->
    <div class="auth-panel">
      <div class="auth-panel-inner">
        <!-- Header -->
        <div class="auth-header">
          <h1>Reset Your Password</h1>
          <p>Enter your verified email address to receive password reset instructions.</p>
        </div>

        <div id="reset-success-box" style="display: none; padding: 18px; border-radius: var(--radius-md); background: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.3); color: var(--risk-low); font-size: 0.9rem; line-height: 1.5;">
          <strong>Password reset instructions sent!</strong><br/>
          Check your inbox at <span id="target-reset-email" style="font-weight: 700; color: #ffffff;"></span> for the secure password recovery link.
        </div>

        <!-- Form -->
        <form class="auth-form" id="forgot-form" novalidate>
          <div class="form-group">
            <label for="reset-email">Verified Email Address</label>
            <div class="input-wrapper">
              <span class="input-icon-left">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
              </span>
              <input
                type="email"
                id="reset-email"
                class="auth-input"
                placeholder="name@agency.gov or demo@urbansafe.ai"
                required
              />
            </div>
            <div class="field-error-msg" id="reset-email-error"></div>
          </div>

          <button type="submit" class="btn-primary-auth" id="btn-reset-submit">
            <span id="reset-btn-text">Send Reset Link</span>
          </button>
        </form>

        <!-- Back to login -->
        <div class="auth-footer-nav">
          <span>Remember your credentials?</span>
          <a href="/login" id="link-back-login">Back to Sign In</a>
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

  const form = container.querySelector('#forgot-form');
  const emailInput = container.querySelector('#reset-email');
  const emailError = container.querySelector('#reset-email-error');
  const submitBtn = container.querySelector('#btn-reset-submit');
  const btnText = container.querySelector('#reset-btn-text');
  const successBox = container.querySelector('#reset-success-box');
  const targetEmailSpan = container.querySelector('#target-reset-email');
  const themeBtn = container.querySelector('#theme-btn');

  // Map interactive states
  emailInput.addEventListener('focus', () => cityMap.setEmailFocus(true));
  emailInput.addEventListener('blur', () => cityMap.setEmailFocus(false));

  themeBtn.addEventListener('click', () => {
    const isLight = document.body.classList.toggle('theme-light');
    localStorage.setItem('urbansafe_theme', isLight ? 'light' : 'dark');
  });

  container.querySelector('#link-back-login').addEventListener('click', (e) => {
    e.preventDefault();
    cityMap.destroy();
    router.navigate('/login');
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    emailError.textContent = '';
    const email = emailInput.value.trim();

    if (!email) {
      emailError.textContent = 'Please enter your email address.';
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      emailError.textContent = 'Please enter a valid email format.';
      return;
    }

    submitBtn.disabled = true;
    btnText.innerHTML = `
      <div class="btn-auth-spinner"></div>
      <span>Sending Instructions...</span>
    `;

    setTimeout(() => {
      form.style.display = 'none';
      targetEmailSpan.textContent = email;
      successBox.style.display = 'block';
      submitBtn.disabled = false;
      btnText.textContent = 'Send Reset Link';
    }, 900);
  });

  return container;
}
