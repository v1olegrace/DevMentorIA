/* global window, document, chrome, alert, confirm */
/* eslint-disable no-console, security/detect-object-injection */

const state = {
  currentTab: 'analysis',
  connection: null,
  metrics: {
    totalAnalyses: 0,
    avgResponseTime: 0,
    successRate: 100,
    cacheHits: 0
  }
};

const log = message => console.log(`[DevTools Panel] ${message}`);

async function initPanel () {
  log('Initializing...');
  setupTabs();
  setupActions();
  setupRefresh();
  await Promise.all([loadSettings(), loadMetrics(), loadPrivacyStats()]);
  log('Ready');
}

function setupTabs () {
  const tabs = document.querySelectorAll('.tab');
  const contents = document.querySelectorAll('.tab-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      contents.forEach(c => c.classList.remove('active'));
      document.getElementById(`${target}-tab`)?.classList.add('active');
      state.currentTab = target;
      loadTabData(target);
    });
  });
}

function setupActions () {
  document
    .querySelectorAll('[data-action]')
    .forEach(btn => btn.addEventListener('click', () => handleAnalysisAction(btn.dataset.action)));

  document
    .querySelectorAll('#settings-tab input[type="checkbox"]')
    .forEach(input => input.addEventListener('change', saveSettings));

  document.getElementById('clear-storage')?.addEventListener('click', async () => {
    if (confirm('Clear all stored data?')) {
      await chrome.storage.local.clear();
      alert('Storage cleared!');
      await Promise.all([loadSettings(), loadMetrics()]);
    }
  });
}

function setupRefresh () {
  document.getElementById('refresh-btn')?.addEventListener('click', async () => {
    await Promise.all([loadMetrics(), loadPrivacyStats()]);
  });
}

async function handleAnalysisAction (action) {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) {
      showError('No active tab');
      return;
    }

    const [selection] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => window.getSelection().toString().trim()
    });

    const selectedText = selection?.result || '';
    if (!selectedText) {
      showError('Please select some code first');
      return;
    }

    const response = await chrome.runtime.sendMessage({ action, code: selectedText });
    if (!response?.success) {
      throw new Error(response?.error || 'Analysis failed');
    }

    updateMetricsAfterAnalysis();
    showResult(action, response.data);
  } catch (error) {
    showError(error.message);
  }
}

function showResult (action, data) {
  const container = document.getElementById('analysis-result');
  if (!container) return;
  container.textContent = JSON.stringify({ action, data }, null, 2);
}

function showError (message) {
  const container = document.getElementById('analysis-error');
  if (container) {
    container.textContent = message;
  }
  console.error('[DevTools Panel] Error:', message);
}

async function loadSettings () {
  const settings = await chrome.storage.local.get([
    'enable-cache',
    'enable-external-apis',
    'enable-language-detection',
    'show-privacy-badge'
  ]);

  document.getElementById('enable-cache').checked = settings['enable-cache'] !== false;
  document.getElementById('enable-external-apis').checked = settings['enable-external-apis'] !== false;
  document.getElementById('enable-language-detection').checked = settings['enable-language-detection'] !== false;
  document.getElementById('show-privacy-badge').checked = settings['show-privacy-badge'] === true;
}

async function saveSettings () {
  const payload = {
    'enable-cache': document.getElementById('enable-cache').checked,
    'enable-external-apis': document.getElementById('enable-external-apis').checked,
    'enable-language-detection': document.getElementById('enable-language-detection').checked,
    'show-privacy-badge': document.getElementById('show-privacy-badge').checked
  };
  await chrome.storage.local.set(payload);
}

async function loadMetrics () {
  const stored = await chrome.storage.local.get('devtools-metrics');
  if (stored['devtools-metrics']) {
    state.metrics = { ...state.metrics, ...stored['devtools-metrics'] };
  }

  document.getElementById('total-analyses').textContent = state.metrics.totalAnalyses;
  document.getElementById('avg-time').textContent = `${Math.round(state.metrics.avgResponseTime)}ms`;
  document.getElementById('success-rate').textContent = `${state.metrics.successRate}%`;
  document.getElementById('cache-hits').textContent = state.metrics.cacheHits;

  await loadActivity();
}

async function saveMetrics () {
  await chrome.storage.local.set({ 'devtools-metrics': state.metrics });
}

async function loadActivity () {
  const stored = await chrome.storage.local.get('devtools-activity');
  const list = document.getElementById('activity-list');
  if (!list) return;

  const items = stored['devtools-activity'] ?? [];
  list.innerHTML = items
    .slice(-10)
    .reverse()
    .map(item => `
      <div class="activity-item">
        <span class="activity-icon">${item.icon || '-'} </span>
        <span class="activity-text">${item.text}</span>
        <span class="activity-time">${item.time}</span>
      </div>
    `)
    .join('');
}

async function loadPrivacyStats () {
  try {
    const response = await chrome.runtime.sendMessage({ action: 'privacy-stats' });
    if (response?.success && response.data?.stats) {
      const stats = response.data.stats;
      document.getElementById('privacy-network').textContent = stats.networkRequests || 0;
      document.getElementById('privacy-data').textContent = `${stats.dataSent || 0} bytes`;
      document.getElementById('privacy-processing').textContent = '100%';
      document.getElementById('privacy-analyses').textContent = stats.analysesPerformed || 0;
    }
  } catch (error) {
    console.error('[DevTools Panel] Failed to load privacy stats:', error);
  }
}

function loadTabData (tab) {
  switch (tab) {
  case 'privacy':
    loadPrivacyStats();
    break;
  case 'metrics':
    loadMetrics();
    break;
  case 'settings':
    loadSettings();
    break;
  default:
    break;
  }
}

function updateMetricsAfterAnalysis () {
  state.metrics.totalAnalyses += 1;
  state.metrics.cacheHits = Math.max(0, state.metrics.cacheHits - 1);
  saveMetrics();
  loadMetrics();
}

async function checkStorageSize () {
  const storage = await chrome.storage.local.get(null);
  const sizeKb = (JSON.stringify(storage).length / 1024).toFixed(2);
  document.getElementById('storage-used').textContent = `${sizeKb} KB`;
}

window.addEventListener('load', () => {
  initPanel();
  checkStorageSize();
  setInterval(checkStorageSize, 5000);
});


