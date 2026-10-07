// UrbanSafe AI - Registration View
import { auth } from '../auth.js';
import { CityMapVisualization } from '../map.js';

export function renderRegisterView(router) {
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

    <!-- LEFT SIDE: Smart-City Risk Visualization -->
    <div class="map-panel" id="map-panel"></div>

    <!-- RIGHT SIDE: Registration Panel -->
    <div class="auth-panel">
      <div class="auth-panel-inner">
        <!-- Header -->
        <div class="auth-header">
          <h1>Create Your Account</h1>
          <p>Access intelligent urban safety insights, automated accident forecasts, and prevention protocols.</p>
        </div>

        <!-- Registration Form -->
        <form class="auth-form" id="register-form" novalidate>
          <!-- Full Name -->
          <div class="form-group">
            <label for="reg-name">Full Name</label>
            <div class="input-wrapper">
              <span class="input-icon-left">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </span>
              <input
                type="text"
                id="reg-name"
                class="auth-input"
                placeholder="Officer Jane Doe"
                required
              />
            </div>
            <div class="field-error-msg" id="name-error"></div>
          </div>

          <!-- Email Address -->
          <div class="form-group">
            <label for="reg-email">Work Email</label>
            <div class="input-wrapper">
              <span class="input-icon-left">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
              </span>
              <input
                type="email"
                id="reg-email"
                class="auth-input"
                placeholder="jane.doe@transport.gov"
                required
              />
            </div>
            <div class="field-error-msg" id="reg-email-error"></div>
          </div>

          <!-- Role Selector -->
          <div class="form-group">
            <label>Assigned System Role</label>
            <div class="role-selector-group">
              <label class="role-card-option selected" id="role-analyst-label">
                <input type="radio" name="system-role" value="Analyst" checked />
                <span class="role-title">Analyst</span>
                <span class="role-desc">Full telemetry & models</span>
              </label>
              <label class="role-card-option" id="role-viewer-label">
                <input type="radio" name="system-role" value="Viewer" />
                <span class="role-title">Viewer</span>
                <span class="role-desc">Read-only risk maps</span>
              </label>
            </div>
          </div>

          <!-- Password -->
          <div class="form-group">
            <label for="reg-password">Password</label>
            <div class="input-wrapper">
              <span class="input-icon-left">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </span>
              <input
                type="password"
                id="reg-password"
                class="auth-input"
                placeholder="At least 6 characters"
                required
              />
            </div>
            <div class="field-error-msg" id="reg-password-error"></div>
          </div>

          <!-- Confirm Password -->
          <div class="form-group">
            <label for="reg-confirm-password">Confirm Password</label>
            <div class="input-wrapper">
              <span class="input-icon-left">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </span>
              <input
                type="password"
                id="reg-confirm-password"
                class="auth-input"
                placeholder="Re-enter password"
                required
              />
            </div>
            <div class="field-error-msg" id="reg-confirm-error"></div>
          </div>

          <!-- Submit Button -->
          <button type="submit" class="btn-primary-auth" id="btn-reg-submit">
            <span id="reg-btn-text">Create Account</span>
          </button>
        </form>

        <!-- Back to Sign In Link -->
        <div class="auth-footer-nav">
          <span>Already have an account?</span>
          <a href="/login" id="link-goto-signin">Sign In</a>
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

  // Grab form elements
  const regForm = container.querySelector('#register-form');
  const nameInput = container.querySelector('#reg-name');
  const emailInput = container.querySelector('#reg-email');
  const passwordInput = container.querySelector('#reg-password');
  const confirmInput = container.querySelector('#reg-confirm-password');

  const nameError = container.querySelector('#name-error');
  const emailError = container.querySelector('#reg-email-error');
  const passwordError = container.querySelector('#reg-password-error');
  const confirmError = container.querySelector('#reg-confirm-error');

  const submitBtn = container.querySelector('#btn-reg-submit');
  const btnText = container.querySelector('#reg-btn-text');
  const themeBtn = container.querySelector('#theme-btn');

  // Role card selection logic
  const roleRadios = container.querySelectorAll('input[name="system-role"]');
  roleRadios.forEach((radio) => {
    radio.addEventListener('change', () => {
      container.querySelectorAll('.role-card-option').forEach((el) => el.classList.remove('selected'));
      radio.closest('.role-card-option').classList.add('selected');
    });
  });

  // Map interactive states
  emailInput.addEventListener('focus', () => cityMap.setEmailFocus(true));
  emailInput.addEventListener('blur', () => cityMap.setEmailFocus(false));
  passwordInput.addEventListener('focus', () => cityMap.setPasswordFocus(true));
  passwordInput.addEventListener('blur', () => cityMap.setPasswordFocus(false));

  // Theme Toggle
  themeBtn.addEventListener('click', () => {
    const isLight = document.body.classList.toggle('theme-light');
    localStorage.setItem('urbansafe_theme', isLight ? 'light' : 'dark');
  });

  // Go to Sign In
  container.querySelector('#link-goto-signin').addEventListener('click', (e) => {
    e.preventDefault();
    cityMap.destroy();
    router.navigate('/login');
  });

  // Form Submit
  regForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Clear previous errors
    nameError.textContent = '';
    emailError.textContent = '';
    passwordError.textContent = '';
    confirmError.textContent = '';

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirmPass = confirmInput.value;
    const selectedRole = container.querySelector('input[name="system-role"]:checked')?.value || 'Analyst';

    let hasError = false;

    if (!name) {
      nameError.textContent = 'Please enter your full name.';
      hasError = true;
    }

    if (!email) {
      emailError.textContent = 'Please enter your work email.';
      hasError = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      emailError.textContent = 'Please enter a valid email format.';
      hasError = true;
    }

    if (!password) {
      passwordError.textContent = 'Password is required.';
      hasError = true;
    } else if (password.length < 6) {
      passwordError.textContent = 'Password must contain at least 6 characters.';
      hasError = true;
    }

    if (!confirmPass) {
      confirmError.textContent = 'Please confirm your password.';
      hasError = true;
    } else if (password !== confirmPass) {
      confirmError.textContent = 'Passwords do not match.';
      hasError = true;
    }

    if (hasError) return;

    submitBtn.disabled = true;
    btnText.innerHTML = `
      <div class="btn-auth-spinner"></div>
      <span>Creating Safety Account...</span>
    `;

    try {
      await auth.register(name, email, password, selectedRole);
      if (cityMap && typeof cityMap.destroy === 'function') {
        cityMap.destroy();
      }
      router.navigate('/dashboard');
    } catch (err) {
      submitBtn.disabled = false;
      btnText.innerHTML = `<span>Create Account</span>`;
      emailError.textContent = err.message || 'Registration failed.';
    } finally {
      if (!auth.isAuthenticated()) {
        submitBtn.disabled = false;
        btnText.innerHTML = `<span>Create Account</span>`;
      }
    }
  });

  return container;
}
