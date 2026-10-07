// UrbanSafe AI - SPA Client Router & Route Guard
import { auth } from './auth.js';
import { renderLoginView } from './views/login.js';
import { renderRegisterView } from './views/register.js';
import { renderForgotPasswordView } from './views/forgotPassword.js';

// Dedicated Page View Renderers
import { renderDashboardView } from './views/dashboard.js';
import { renderPredictionView } from './views/prediction.js';
import { renderMapView } from './views/map.js';
import { renderHotspotsView } from './views/hotspots.js';
import { renderAnalyticsView } from './views/analytics.js';
import { renderExplainableAiView } from './views/explainableAi.js';
import { renderPreventionView } from './views/prevention.js';
import { renderModelsView } from './views/models.js';
import { renderTelemetryView } from './views/telemetry.js';
import { renderAlertsView } from './views/alerts.js';
import { renderSettingsView } from './views/settings.js';
import { renderGoView } from './views/go.js';

export const PROTECTED_ROUTES = [
  '/dashboard',
  '/go',
  '/prediction',
  '/map',
  '/hotspots',
  '/analytics',
  '/explainable-ai',
  '/prevention',
  '/models',
  '/telemetry',
  '/alerts',
  '/settings'
];

export class Router {
  constructor(appElement) {
    this.app = appElement;

    // Browser navigation back/forward support
    window.addEventListener('popstate', () => {
      this.handleRoute(window.location.pathname + window.location.search);
    });
  }

  init() {
    // Restore theme preference safely
    try {
      const savedTheme = localStorage.getItem('urbansafe_theme');
      if (savedTheme === 'light') {
        document.body.classList.add('theme-light');
      } else {
        document.body.classList.remove('theme-light');
      }
    } catch (e) {
      console.warn('Theme restore warning:', e);
    }

    let initialPath = window.location.pathname;
    if (!initialPath || initialPath === '/' || initialPath === '/index.html') {
      initialPath = auth.isAuthenticated() ? '/dashboard' : '/login';
    }

    this.navigate(initialPath + window.location.search, false);
  }

  navigate(path, pushState = true) {
    let targetPath = path || '/';

    // Parse base route path without query params for guard validation
    const cleanPath = targetPath.split('?')[0].split('#')[0] || '/';

    // Route Guard
    const isAuthed = auth.isAuthenticated();
    const isProtected = PROTECTED_ROUTES.includes(cleanPath);

    if (isProtected && !isAuthed) {
      targetPath = '/login';
    } else if (isAuthed && (cleanPath === '/login' || cleanPath === '/register' || cleanPath === '/forgot-password')) {
      targetPath = '/dashboard';
    }

    if (pushState && (window.location.pathname + window.location.search) !== targetPath) {
      window.history.pushState({}, '', targetPath);
    }

    this.handleRoute(targetPath);
  }

  handleRoute(path) {
    this.app.innerHTML = '';

    // Extract clean path (without query params)
    const cleanPath = (path || '').split('?')[0].split('#')[0] || '/';

    try {
      // Auth Routes
      if (cleanPath === '/login') {
        const loginView = renderLoginView(this);
        this.app.appendChild(loginView);
        document.title = 'Sign In | UrbanSafe AI Command Center';
        return;
      }
      if (cleanPath === '/register') {
        const registerView = renderRegisterView(this);
        this.app.appendChild(registerView);
        document.title = 'Create Account | UrbanSafe AI';
        return;
      }
      if (cleanPath === '/forgot-password') {
        const forgotView = renderForgotPasswordView(this);
        this.app.appendChild(forgotView);
        document.title = 'Reset Password | UrbanSafe AI';
        return;
      }

      // Protected Routes Guard
      if (PROTECTED_ROUTES.includes(cleanPath)) {
        if (!auth.isAuthenticated()) {
          this.navigate('/login');
          return;
        }

        let pageComponent = null;

        switch (cleanPath) {
          case '/dashboard':
            pageComponent = renderDashboardView(this);
            document.title = 'Urban Safety Dashboard | UrbanSafe AI';
            break;
          case '/go':
            pageComponent = renderGoView(this);
            document.title = 'GO — Safe Journey | UrbanSafe AI';
            break;
          case '/prediction':
            pageComponent = renderPredictionView(this);
            document.title = 'Accident Risk Prediction | UrbanSafe AI';
            break;
          case '/map':
            pageComponent = renderMapView(this);
            document.title = 'Urban Risk Map | UrbanSafe AI';
            break;
          case '/hotspots':
            pageComponent = renderHotspotsView(this);
            document.title = 'Hotspot Clusters | UrbanSafe AI';
            break;
          case '/analytics':
            pageComponent = renderAnalyticsView(this);
            document.title = 'Accident Analytics | UrbanSafe AI';
            break;
          case '/explainable-ai':
            pageComponent = renderExplainableAiView(this);
            document.title = 'Explainable AI & SHAP | UrbanSafe AI';
            break;
          case '/prevention':
            pageComponent = renderPreventionView(this);
            document.title = 'Prevention & Dispatch | UrbanSafe AI';
            break;
          case '/models':
            pageComponent = renderModelsView(this);
            document.title = 'AI Model Insights | UrbanSafe AI';
            break;
          case '/telemetry':
            pageComponent = renderTelemetryView(this);
            document.title = 'Telemetry Feeds | UrbanSafe AI';
            break;
          case '/alerts':
            pageComponent = renderAlertsView(this);
            document.title = 'Active Risk Alerts | UrbanSafe AI';
            break;
          case '/settings':
            pageComponent = renderSettingsView(this);
            document.title = 'System Settings | UrbanSafe AI';
            break;
          default:
            pageComponent = renderDashboardView(this);
            document.title = 'Urban Safety Dashboard | UrbanSafe AI';
        }

        if (pageComponent) {
          this.app.appendChild(pageComponent);
          window.scrollTo(0, 0);
        }
        return;
      }

      // Fallback 404 handler
      this.navigate(auth.isAuthenticated() ? '/dashboard' : '/login');

    } catch (renderError) {
      console.error(`Error rendering route [${cleanPath}]:`, renderError);
      this.renderErrorBoundary(renderError, cleanPath);
    }
  }

  renderErrorBoundary(error, routePath) {
    this.app.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #070b14; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="max-width: 540px; width: 100%; background: #0f172a; border: 1px solid rgba(239, 68, 68, 0.4); border-radius: 12px; padding: 28px; box-shadow: 0 20px 40px rgba(0,0,0,0.6); text-align: center; color: #ffffff;">
          <div style="width: 50px; height: 50px; background: rgba(239, 68, 68, 0.15); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; color: #ef4444; font-size: 1.5rem; font-weight: bold;">!</div>
          <h2 style="font-size: 1.3rem; margin-bottom: 8px; color: #f87171;">UrbanSafe AI could not load this section.</h2>
          <p style="font-size: 0.88rem; color: #94a3b8; margin-bottom: 16px;">Failed to render view for route: <code style="color: #38bdf8; background: rgba(255,255,255,0.06); padding: 2px 6px; border-radius: 4px;">${routePath}</code></p>
          <div style="background: rgba(0,0,0,0.4); padding: 12px; border-radius: 6px; text-align: left; font-family: monospace; font-size: 0.78rem; color: #fca5a5; overflow-x: auto; margin-bottom: 20px; max-height: 120px;">
            ${error?.message || error || 'Unknown runtime error'}
          </div>
          <div style="display: flex; gap: 12px; justify-content: center;">
            <button onclick="window.location.href='/dashboard'" style="padding: 10px 20px; background: #0284c7; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer;">
              Return to Dashboard
            </button>
            <button onclick="window.location.reload()" style="padding: 10px 20px; background: rgba(255,255,255,0.08); color: white; border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; font-weight: 600; cursor: pointer;">
              Reload Application
            </button>
          </div>
        </div>
      </div>
    `;
  }
}
