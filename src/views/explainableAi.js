// UrbanSafe AI - Explainable AI (XAI) & Feature Contribution View
// DEMO FEATURE CONTRIBUTION — NOT LIVE SHAP VALUES
// Scientifically honest transparent attribution derived from the deterministic prediction engine

import { createProtectedLayout } from '../components/layout.js';
import { locationState } from '../services/locationState.js';
import { ACCIDENT_DEMO_LOCATIONS } from '../data/accidentDemoData.js';

export function renderExplainableAiView(router) {
  const urlParams = new URLSearchParams(window.location.search);
  const paramLocId = urlParams.get('loc');
  if (paramLocId && ACCIDENT_DEMO_LOCATIONS.some(l => l.id === paramLocId)) {
    locationState.setSelectedLocationId(paramLocId);
  }

  const currentPred = locationState.getCurrentPrediction();
  const loc = locationState.getSelectedLocation();
  const result = currentPred.result;
  const breakdown = result.breakdown;

  const contentHtml = `
    <div class="xai-page-container">
      <!-- Top Disclaimer & Methodology Banner -->
      <div class="dash-card">
        <div class="card-header-bar">
          <div>
            <h3>Demo Feature Contribution (Explainable AI)</h3>
            <p>Decomposition of risk factors explaining how the prediction engine inferred the collision probability score.</p>
          </div>
          <span class="demo-tag">[ DEMO FEATURE CONTRIBUTION ]</span>
        </div>

        <div class="xai-kpi-row">
          <div class="xai-kpi-item">
            <span class="xai-lbl">Evaluated Location</span>
            <strong class="xai-val" id="xai-loc-name">${loc.name}</strong>
          </div>
          <div class="xai-kpi-item">
            <span class="xai-lbl">Calculated Risk Score</span>
            <strong class="xai-val ${result.riskLevel === 'HIGH' ? 'text-red' : result.riskLevel === 'MEDIUM' ? 'text-amber' : 'text-emerald'}">
              ${result.riskScore} / 100 (${result.riskLevel})
            </strong>
          </div>
          <div class="xai-kpi-item">
            <span class="xai-lbl">Base City Average</span>
            <strong class="xai-val text-cyan">30 Base Points</strong>
          </div>
          <div class="xai-kpi-item">
            <span class="xai-lbl">Primary Factor Driver</span>
            <strong class="xai-val text-amber">${breakdown[0]?.feature || 'Traffic Density'} (+${breakdown[0]?.score || 25} pts)</strong>
          </div>
        </div>

        <div class="scientific-honesty-notice" style="margin-top: 14px; padding: 10px 14px; background: rgba(56, 189, 248, 0.08); border-left: 3px solid var(--brand-sky); border-radius: 4px; font-size: 0.82rem; color: var(--text-secondary);">
          <strong>Scientific Project Notice:</strong> This is a frontend demonstration explanation based on the project's proposed SHAP (SHapley Additive exPlanations) & XAI architecture. Actual trained TreeSHAP values will be streamed when the XGBoost/Random Forest model pipeline is connected.
        </div>
      </div>

      <!-- SHAP Waterfall & Feature Inspector Grid -->
      <div class="xai-inspector-grid" style="margin-top: 20px;">
        <!-- Feature Contribution List -->
        <div class="dash-card">
          <div class="card-header-bar">
            <div>
              <h3>Why this location received this risk score</h3>
              <p>Click any feature contribution bar below to inspect the mathematical attribution.</p>
            </div>
            <span class="demo-tag">[ INTERACTIVE ]</span>
          </div>

          <div class="shap-features-list" id="shap-features-list">
            ${breakdown.map((b, idx) => `
              <div class="shap-feature-row ${idx === 0 ? 'selected' : ''}" data-index="${idx}">
                <div class="shap-feat-header">
                  <strong>${b.feature}</strong>
                  <span class="shap-score text-${b.score >= 18 ? 'red' : b.score >= 10 ? 'amber' : 'emerald'}">+${b.score} pts (${b.value})</span>
                </div>
                <div class="progress-bar-track">
                  <div class="progress-bar-fill fill-${b.score >= 18 ? 'red' : b.score >= 10 ? 'amber' : 'emerald'}" style="width: ${(b.score / b.maxScore) * 100}%;"></div>
                </div>
                <div class="shap-feat-meta">
                  <span>Impact: <strong>${b.impact}</strong></span>
                  <span class="link-inline">Inspect reasoning &rarr;</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Detail Explanation Panel -->
        <div class="dash-card xai-detail-card" id="xai-detail-card">
          <div class="card-header-bar">
            <div>
              <h3 id="feat-panel-title">${breakdown[0].feature}</h3>
              <p id="feat-panel-impact">Impact: ${breakdown[0].impact} (+${breakdown[0].score} pts)</p>
            </div>
            <span class="risk-badge risk-high" id="feat-panel-badge">ATTRIBUTION</span>
          </div>

          <div class="xai-detail-body">
            <div class="detail-quote-box">
              <p id="feat-panel-desc">${breakdown[0].description}</p>
            </div>

            <div class="meta-card" style="margin-top: 16px;">
              <h4>Counterfactual Scenario Analysis</h4>
              <p id="feat-panel-counterfact" style="font-size: 0.88rem; color: var(--text-secondary); margin-top: 6px;">
                If <strong>${breakdown[0].feature}</strong> is mitigated to optimal standard (e.g. via dynamic speed ceiling or pavement resurfacing), the calculated risk would decline from <strong>${result.riskScore}/100</strong> to <strong>${Math.max(15, result.riskScore - breakdown[0].score + 5)}/100</strong>.
              </p>
            </div>

            <div class="meta-card advisory-card" style="margin-top: 16px;">
              <h4>Automated Dispatch Protocol</h4>
              <p id="feat-panel-dispatch" style="font-size: 0.88rem;">
                ${result.recommendations[0]?.action || 'Deploy variable speed signs and alert regional traffic management center.'}
              </p>
            </div>

            <div style="display: flex; gap: 10px; margin-top: 20px;">
              <button class="btn-primary" id="btn-xai-to-prediction" style="font-size: 0.85rem;">
                <span>Test in Prediction Engine &rarr;</span>
              </button>
              <button class="btn-secondary" id="btn-xai-to-prevention" style="font-size: 0.85rem;">
                <span>Open Prevention Protocols</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  return createProtectedLayout({
    router,
    currentPath: '/explainable-ai',
    pageTitle: 'Explainable AI & Feature Contribution',
    pageSubtitle: 'Transparent feature contributions explaining predictive collision risk models.',
    contentHtml,
    onMounted: (layout) => {
      const rows = layout.querySelectorAll('.shap-feature-row');
      const titleEl = layout.querySelector('#feat-panel-title');
      const impactEl = layout.querySelector('#feat-panel-impact');
      const descEl = layout.querySelector('#feat-panel-desc');
      const counterfactEl = layout.querySelector('#feat-panel-counterfact');
      const dispatchEl = layout.querySelector('#feat-panel-dispatch');

      rows.forEach(row => {
        row.addEventListener('click', () => {
          rows.forEach(r => r.classList.remove('selected'));
          row.classList.add('selected');
          const idx = parseInt(row.getAttribute('data-index'), 10);
          const feat = breakdown[idx];

          titleEl.textContent = feat.feature;
          impactEl.textContent = `Impact: ${feat.impact} (+${feat.score} pts for ${feat.value})`;
          descEl.textContent = feat.description;
          counterfactEl.innerHTML = `
            If <strong>${feat.feature}</strong> is mitigated to optimal standard, the calculated risk score would decline from <strong>${result.riskScore}/100</strong> to <strong>${Math.max(15, result.riskScore - feat.score + 5)}/100</strong>.
          `;
          dispatchEl.textContent = result.recommendations[0]?.action || 'Deploy variable speed signs and alert regional traffic management center.';
        });
      });

      layout.querySelector('#btn-xai-to-prediction').addEventListener('click', () => {
        router.navigate(`/prediction?loc=${loc.id}`);
      });

      layout.querySelector('#btn-xai-to-prevention').addEventListener('click', () => {
        router.navigate(`/prevention?loc=${loc.id}`);
      });
    }
  });
}
