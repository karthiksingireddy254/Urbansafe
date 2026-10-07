// UrbanSafe AI - AI Model Insights & Drift View
import { createProtectedLayout } from '../components/layout.js';
import { modelService } from '../services/modelService.js';
import { MODEL_REGISTRY } from '../data/demoModels.js';

export function renderModelsView(router) {
  const models = modelService.getAllModels();
  const initialModel = models[0]; // XGBoost

  const contentHtml = `
    <div class="models-page-container">
      <!-- 4 Model Architecture Cards -->
      <div class="models-top-cards-grid">
        ${models.map(m => `
          <div class="dash-card model-summary-card ${m.id === initialModel.id ? 'active' : ''}" data-model-id="${m.id}">
            <div class="card-header-bar">
              <span class="status-indicator-tag ${m.status === 'ACTIVE_PRODUCTION' ? 'active' : ''}">${m.status.replace('_', ' ')}</span>
              <span class="demo-tag">[ DEMO BENCHMARK ]</span>
            </div>
            <h3 style="margin-top: 6px;">${m.name}</h3>
            <p style="font-size: 0.8rem; color: var(--text-muted);">${m.category}</p>

            <div class="model-quick-metrics">
              <div>
                <span class="mq-val text-cyan">${(m.benchmarkMetrics.rocAuc * 100).toFixed(1)}%</span>
                <span class="mq-lbl">ROC-AUC</span>
              </div>
              <div>
                <span class="mq-val text-amber">${(m.benchmarkMetrics.f1Score * 100).toFixed(1)}%</span>
                <span class="mq-lbl">F1-Score</span>
              </div>
              <div>
                <span class="mq-val">${m.benchmarkMetrics.inferenceLatency}</span>
                <span class="mq-lbl">Latency</span>
              </div>
            </div>

            <div class="model-drift-indicator">
              <span>Drift Status:</span>
              <strong class="${m.driftStatus.includes('MODERATE') ? 'text-amber' : 'text-emerald'}">${m.driftStatus}</strong>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Selected Model Deep Dive -->
      <div class="dash-card model-detail-card">
        <div class="card-header-bar">
          <div>
            <h3 id="detail-model-name">${initialModel.name} - Deep Architecture Analysis</h3>
            <p id="detail-model-desc">${initialModel.description}</p>
          </div>
          <span class="demo-tag">[ BENCHMARK SPECIFICATION ]</span>
        </div>

        <div class="model-deepdive-grid">
          <!-- Hyperparameters & Specs -->
          <div class="deepdive-col">
            <h4>Trained Hyperparameters</h4>
            <div class="params-table" id="params-table">
              ${Object.entries(initialModel.hyperparameters).map(([k, v]) => `
                <div class="param-row">
                  <code>${k}</code>
                  <strong>${v}</strong>
                </div>
              `).join('')}
            </div>

            <h4 style="margin-top: 16px;">Validation Sample Matrix</h4>
            <div class="meta-card" style="margin-top: 6px;">
              <p><strong>Training Corpus:</strong> ${initialModel.benchmarkMetrics.trainingSamples}</p>
              <p><strong>Precision Score:</strong> ${(initialModel.benchmarkMetrics.precision * 100).toFixed(1)}%</p>
              <p><strong>Recall Sensitivity:</strong> ${(initialModel.benchmarkMetrics.recall * 100).toFixed(1)}%</p>
              <p><strong>Last Evaluated:</strong> ${initialModel.lastEvaluation}</p>
            </div>
          </div>

          <!-- Feature Importance Rankings -->
          <div class="deepdive-col">
            <h4>Trained Feature Importances (Gini Impurity / Gain)</h4>
            <div class="features-bars-list" id="features-bars-list">
              ${initialModel.topFeatures.map(f => `
                <div class="feature-bar-item">
                  <div style="display:flex; justify-content:space-between; font-size:0.84rem; margin-bottom:4px;">
                    <code>${f.name}</code>
                    <strong class="text-cyan">${(f.importance * 100).toFixed(1)}%</strong>
                  </div>
                  <div class="progress-bar-track">
                    <div class="progress-bar-fill fill-cyan" style="width: ${f.importance * 240}%;"></div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>

      <!-- Comparative Benchmark Matrix -->
      <div class="dash-card" style="margin-top: 20px;">
        <div class="card-header-bar">
          <div>
            <h3>Full Model Comparison Matrix</h3>
            <p>Evaluation results across identical 5-fold cross-validation urban test splits.</p>
          </div>
          <span class="demo-tag">[ DEMO BENCHMARK DATA ]</span>
        </div>

        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Model Architecture</th>
                <th>Category</th>
                <th>ROC-AUC</th>
                <th>F1-Score</th>
                <th>Precision</th>
                <th>Recall</th>
                <th>Inference Latency</th>
                <th>Deployment Status</th>
              </tr>
            </thead>
            <tbody>
              ${models.map(m => `
                <tr>
                  <td><strong>${m.name}</strong></td>
                  <td>${m.category}</td>
                  <td><strong style="font-family:var(--font-mono); color:var(--brand-sky);">${(m.benchmarkMetrics.rocAuc * 100).toFixed(1)}%</strong></td>
                  <td><strong style="font-family:var(--font-mono);">${(m.benchmarkMetrics.f1Score * 100).toFixed(1)}%</strong></td>
                  <td>${(m.benchmarkMetrics.precision * 100).toFixed(1)}%</td>
                  <td>${(m.benchmarkMetrics.recall * 100).toFixed(1)}%</td>
                  <td><span style="font-family:var(--font-mono);">${m.benchmarkMetrics.inferenceLatency}</span></td>
                  <td><span class="status-indicator-tag ${m.status === 'ACTIVE_PRODUCTION' ? 'active' : ''}">${m.status.replace('_', ' ')}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  return createProtectedLayout({
    router,
    currentPath: '/models',
    pageTitle: 'AI Model Insights & Drift',
    pageSubtitle: 'Comparative machine learning architecture benchmarks, feature importances, and distribution shift.',
    contentHtml,
    onMounted: (layout) => {
      const cards = layout.querySelectorAll('.model-summary-card');
      const nameEl = layout.querySelector('#detail-model-name');
      const descEl = layout.querySelector('#detail-model-desc');
      const paramsContainer = layout.querySelector('#params-table');
      const featuresContainer = layout.querySelector('#features-bars-list');

      cards.forEach(card => {
        card.addEventListener('click', () => {
          cards.forEach(c => c.classList.remove('active'));
          card.classList.add('active');
          const id = card.getAttribute('data-model-id');
          const m = MODEL_REGISTRY[id];
          if (m) {
            nameEl.textContent = `${m.name} - Deep Architecture Analysis`;
            descEl.textContent = m.description;

            paramsContainer.innerHTML = Object.entries(m.hyperparameters).map(([k, v]) => `
              <div class="param-row">
                <code>${k}</code>
                <strong>${v}</strong>
              </div>
            `).join('');

            featuresContainer.innerHTML = m.topFeatures.map(f => `
              <div class="feature-bar-item">
                <div style="display:flex; justify-content:space-between; font-size:0.84rem; margin-bottom:4px;">
                  <code>${f.name}</code>
                  <strong class="text-cyan">${(f.importance * 100).toFixed(1)}%</strong>
                </div>
                <div class="progress-bar-track">
                  <div class="progress-bar-fill fill-cyan" style="width: ${f.importance * 240}%;"></div>
                </div>
              </div>
            `).join('');
          }
        });
      });
    }
  });
}
