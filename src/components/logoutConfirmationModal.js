// UrbanSafe AI - Modern Interactive Logout Confirmation Modal Component
// Provides a sleek confirmation experience, safe session termination, celebratory paper blast, and seamless redirect.

import { auth } from '../auth.js';
import { triggerConfettiBlast } from '../utils/confetti.js';

/**
 * Renders and manages the Logout Confirmation Modal
 * @param {Object} options
 * @param {Object} options.router - Application router instance
 * @param {Function} [options.onCancel] - Optional callback when cancelled
 * @param {Function} [options.onSuccess] - Optional callback when logged out
 */
export function showLogoutConfirmationModal({ router, onCancel, onSuccess } = {}) {
  // Remove any pre-existing logout modal in DOM
  const existingModal = document.getElementById('urbansafe-logout-modal-root');
  if (existingModal) {
    existingModal.remove();
  }

  const modalRoot = document.createElement('div');
  modalRoot.id = 'urbansafe-logout-modal-root';
  modalRoot.className = 'logout-modal-backdrop';
  modalRoot.setAttribute('role', 'dialog');
  modalRoot.setAttribute('aria-modal', 'true');
  modalRoot.setAttribute('aria-labelledby', 'logout-modal-title');

  modalRoot.innerHTML = `
    <div class="logout-modal-card" id="logout-modal-card">
      <button type="button" class="logout-modal-close-btn" id="logout-modal-close-btn" aria-label="Close modal" title="Close (Esc)">&times;</button>
      
      <div id="logout-modal-content-container">
        <!-- Safety Shield & Exit Visual -->
        <div class="logout-shield-wrapper">
          <div class="logout-shield-halo"></div>
          <div class="logout-shield-circle">
            <svg class="logout-shield-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              <path d="M9 12h6"></path>
              <path d="M12 9l3 3-3 3"></path>
            </svg>
          </div>
        </div>

        <!-- Heading & Copy -->
        <h2 class="logout-modal-title" id="logout-modal-title">Ready to leave?</h2>
        <p class="logout-modal-subtitle">Are you sure you want to log out of UrbanSafe AI?</p>
        
        <div class="logout-security-note">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          </svg>
          <span>All telemetry sessions and prediction caches remain securely saved</span>
        </div>

        <div id="logout-modal-error-container"></div>

        <!-- Action Buttons -->
        <div class="logout-modal-actions">
          <button type="button" class="btn-logout-cancel" id="btn-logout-cancel" autofocus>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
            <span>Cancel</span>
          </button>

          <button type="button" class="btn-logout-confirm" id="btn-logout-confirm">
            <svg class="logout-btn-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            <span class="logout-btn-text">Yes, Log Out</span>
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modalRoot);

  // Trigger smooth enter animation
  requestAnimationFrame(() => {
    modalRoot.classList.add('is-active');
  });

  const closeBtn = modalRoot.querySelector('#logout-modal-close-btn');
  const cancelBtn = modalRoot.querySelector('#btn-logout-cancel');
  const confirmBtn = modalRoot.querySelector('#btn-logout-confirm');
  const errorContainer = modalRoot.querySelector('#logout-modal-error-container');
  const contentContainer = modalRoot.querySelector('#logout-modal-content-container');

  let isLoggingOut = false;

  // Dismiss modal handler
  function closeModal() {
    if (isLoggingOut) return;
    modalRoot.classList.remove('is-active');
    setTimeout(() => {
      if (modalRoot.parentNode) {
        modalRoot.parentNode.removeChild(modalRoot);
      }
      document.removeEventListener('keydown', handleKeydown);
      if (onCancel) onCancel();
    }, 250);
  }

  // Keyboard navigation & Escape key listener
  function handleKeydown(e) {
    if (e.key === 'Escape' && !isLoggingOut) {
      e.preventDefault();
      closeModal();
    }
  }
  document.addEventListener('keydown', handleKeydown);

  // Backdrop click listener
  modalRoot.addEventListener('click', (e) => {
    if (e.target === modalRoot && !isLoggingOut) {
      closeModal();
    }
  });

  closeBtn.addEventListener('click', closeModal);
  cancelBtn.addEventListener('click', closeModal);

  // Yes, Log Out Click Handler
  confirmBtn.addEventListener('click', async () => {
    if (isLoggingOut) return;
    isLoggingOut = true;

    // Set reactive loading state & prevent duplicate clicks
    confirmBtn.disabled = true;
    cancelBtn.disabled = true;
    closeBtn.disabled = true;
    errorContainer.innerHTML = '';

    const originalBtnText = confirmBtn.querySelector('.logout-btn-text');
    const originalBtnIcon = confirmBtn.querySelector('.logout-btn-icon');
    if (originalBtnText) originalBtnText.textContent = 'Securing Session...';
    if (originalBtnIcon) {
      originalBtnIcon.outerHTML = '<span class="logout-btn-spinner"></span>';
    }

    try {
      // Execute the existing authentication logout handler
      await Promise.resolve(auth.logout());

      if (onSuccess) onSuccess();

      // Successful logout: Render celebratory confirmation view
      contentContainer.innerHTML = `
        <div class="logout-success-view">
          <div class="logout-success-badge">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <h2 class="logout-success-title">
            <span>✓</span> Successfully Logged Out
          </h2>
          <p class="logout-success-message">
            Your UrbanSafe AI session has been securely ended.
          </p>
          <div class="logout-redirecting-tag">
            <span class="logout-btn-spinner" style="border-color: rgba(56, 189, 248, 0.3); border-top-color: #38bdf8;"></span>
            <span>Returning to Secure Command Portal...</span>
          </div>
        </div>
      `;

      // Trigger celebratory paper confetti / paper blast burst!
      const rect = modalRoot.querySelector('.logout-modal-card')?.getBoundingClientRect();
      const originX = rect ? (rect.left + rect.width / 2) / window.innerWidth : 0.5;
      const originY = rect ? (rect.top + rect.height / 3) / window.innerHeight : 0.45;

      triggerConfettiBlast({
        originX,
        originY,
        particleCount: 120,
        durationMs: 1800
      });

      // Short delay (~1.2s) for user feedback and confetti visualization, then navigate to existing login
      setTimeout(() => {
        modalRoot.classList.remove('is-active');
        setTimeout(() => {
          if (modalRoot.parentNode) {
            modalRoot.parentNode.removeChild(modalRoot);
          }
          document.removeEventListener('keydown', handleKeydown);
          if (router) {
            router.navigate('/login');
          } else {
            window.location.href = '/login';
          }
        }, 200);
      }, 1250);

    } catch (err) {
      // Error Edge Case Handling: Keep user on dashboard, show error, clear loading state
      console.error('Logout error:', err);
      isLoggingOut = false;
      confirmBtn.disabled = false;
      cancelBtn.disabled = false;
      closeBtn.disabled = false;

      // Restore button UI
      confirmBtn.innerHTML = `
        <svg class="logout-btn-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
          <polyline points="16 17 21 12 16 7"></polyline>
          <line x1="21" y1="12" x2="9" y2="12"></line>
        </svg>
        <span class="logout-btn-text">Yes, Log Out</span>
      `;

      errorContainer.innerHTML = `
        <div class="logout-error-banner">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span>${err.message || 'Logout encountered an issue. Please try again.'}</span>
        </div>
      `;
    }
  });

  // Focus Cancel button for safe immediate keyboard navigation
  setTimeout(() => {
    cancelBtn.focus();
  }, 50);

  return modalRoot;
}
