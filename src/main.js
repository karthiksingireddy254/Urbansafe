// UrbanSafe AI - Main Application Entrypoint
import { Router } from './router.js';

function initApp() {
  const appElement = document.getElementById('app') || document.getElementById('root');
  if (!appElement) {
    console.error('Fatal: #app or #root DOM mounting element not found in index.html');
    return;
  }

  try {
    const router = new Router(appElement);
    router.init();
  } catch (err) {
    console.error('Fatal router initialization error:', err);
    appElement.innerHTML = `
      <div style="padding: 40px; color: #ffffff; font-family: sans-serif; text-align: center; max-width: 600px; margin: 60px auto; background: #0f172a; border: 1px solid #ef4444; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
        <h2 style="color: #ef4444; margin-bottom: 12px;">UrbanSafe AI Initialization Error</h2>
        <p style="color: #94a3b8; font-size: 0.95rem; margin-bottom: 20px;">${err.message || 'An unexpected error occurred while starting the application.'}</p>
        <button onclick="localStorage.clear(); sessionStorage.clear(); location.reload();" style="padding: 10px 24px; background: #0284c7; color: #ffffff; font-weight: 700; border: none; border-radius: 6px; cursor: pointer;">
          Reset Session &amp; Reload Application
        </button>
      </div>
    `;
  }
}

// Ensure execution whether DOM is already loaded or still loading
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
