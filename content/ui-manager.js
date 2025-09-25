/**
 * DevMentor AI - UI Manager
 * Manages sidebar UI, loading states, results and errors
 */

class UIManager {
  constructor() {
    this.sidebar = null;
    this.contentEl = null;
    this.headerEl = null;
    this.visible = false;
    this.loadingMap = new Map();
    this.fileInputEl = null;
  }

  async initialize() {
    this.createSidebar();
    this.attachGlobalStyles();
    this.handleResize();
  }

  createSidebar() {
    if (this.sidebar) return;

    const sidebar = document.createElement('div');
    sidebar.className = 'devmentor-sidebar';

    const header = document.createElement('div');
    header.className = 'devmentor-header';
    header.innerHTML = `
      <div class="devmentor-logo">
        <span class="devmentor-logo-icon">🧠</span>
        <span>DevMentor AI</span>
      </div>
      <button class="devmentor-close" aria-label="Close sidebar">✕</button>
    `;

    const content = document.createElement('div');
    content.className = 'devmentor-content';

    sidebar.appendChild(header);
    sidebar.appendChild(content);
    document.body.appendChild(sidebar);

    header.querySelector('.devmentor-close').addEventListener('click', () => this.hide());

    this.sidebar = sidebar;
    this.contentEl = content;
    this.headerEl = header;
  }

  attachGlobalStyles() {
    // Reuse main.css already loaded via content_scripts
  }

  isVisible() {
    return this.visible;
  }

  handleResize() {
    // Placeholder: could adapt sizes if needed
  }

  async show() {
    if (!this.sidebar) this.createSidebar();
    if (this.visible) return;

    this.sidebar.classList.add('visible');
    this.visible = true;
  }

  async hide() {
    if (!this.sidebar) return;
    this.sidebar.classList.remove('visible');
    this.visible = false;
  }

  async clearContent() {
    if (!this.contentEl) return;
    this.contentEl.innerHTML = '';
  }

  async showLoading(message = 'Loading...', requestId) {
    await this.show();
    await this.clearContent();

    const container = document.createElement('div');
    container.className = 'devmentor-loading';
    container.innerHTML = `
      <div class="devmentor-spinner"></div>
      <p class="devmentor-loading-text">${window.DevMentorHelpers?.escapeHtml(message) || message}</p>
      <div class="devmentor-loading-dots"><span></span><span></span><span></span></div>
    `;

    this.contentEl.appendChild(container);
    if (requestId) this.loadingMap.set(requestId, container);
  }

  async showResult(result, requestId) {
    await this.show();
    await this.clearContent();

    const wrapper = document.createElement('div');
    wrapper.className = 'devmentor-result';

    const header = document.createElement('div');
    header.className = 'devmentor-result-header';
    header.innerHTML = `
      <span class="devmentor-result-icon">${this.getTypeIcon(result.type)}</span>
      <h3 class="devmentor-result-title">${this.getTypeTitle(result.type)}</h3>
      <div class="devmentor-result-meta">
        ${result.language?.language ? `<span class="devmentor-language-badge">${result.language.language}</span>` : ''}
        <span>${new Date(result.timestamp || Date.now()).toLocaleTimeString()}</span>
      </div>
    `;

    const content = document.createElement('div');
    content.className = 'devmentor-result-content';

    const text = document.createElement('div');
    text.className = 'devmentor-result-text';
    const formatted = window.DevMentorHelpers?.formatText(result.result || '') || (result.result || '');
    text.innerHTML = formatted;

    const actions = document.createElement('div');
    actions.className = 'devmentor-result-actions';
    actions.appendChild(this.createCopyButton(text.innerText));

    content.appendChild(text);
    wrapper.appendChild(header);
    wrapper.appendChild(content);
    wrapper.appendChild(actions);

    this.contentEl.appendChild(wrapper);

    if (requestId) this.loadingMap.delete(requestId);
  }

  async showError(error, requestId) {
    await this.show();
    await this.clearContent();

    const container = document.createElement('div');
    container.className = 'devmentor-error';
    container.innerHTML = `
      <div class="devmentor-error-icon">❌</div>
      <h3 class="devmentor-error-title">Something went wrong</h3>
      <p class="devmentor-error-message">${window.DevMentorHelpers?.escapeHtml(error?.userFriendly || error?.message || 'Unknown error')}</p>
      <div class="devmentor-error-actions">
        <button class="devmentor-button" id="retryBtn">Retry</button>
        <button class="devmentor-button" id="closeBtn">Close</button>
      </div>
    `;

    container.querySelector('#closeBtn').addEventListener('click', () => this.hide());

    this.contentEl.appendChild(container);
    if (requestId) this.loadingMap.delete(requestId);
  }

  async showScreenshotCapture(requestId) {
    await this.show();
    await this.clearContent();

    const overlay = document.createElement('div');
    overlay.className = 'devmentor-screenshot-overlay';

    const modal = document.createElement('div');
    modal.className = 'devmentor-screenshot-modal';
    modal.innerHTML = `
      <h3 class="devmentor-screenshot-title">Analyze a screenshot</h3>
      <p class="devmentor-screenshot-description">Upload a PNG, JPEG ou WebP contendo c 3digo para an 1lise.</p>
      <input type="file" accept="image/png,image/jpeg,image/webp" class="devmentor-file-input" id="devmentorFileInput" />
      <label class="devmentor-file-label" for="devmentorFileInput">Choose image</label>
    `;

    overlay.appendChild(modal);
    this.contentEl.appendChild(overlay);

    const fileInput = modal.querySelector('#devmentorFileInput');
    this.fileInputEl = fileInput;
  }

  createCopyButton(textToCopy) {
    const btn = document.createElement('button');
    btn.className = 'devmentor-button';
    btn.innerHTML = 'Copy to Clipboard';
    btn.addEventListener('click', async () => {
      const ok = await window.DevMentorHelpers?.copyToClipboard(textToCopy);
      if (ok) {
        window.DevMentorHelpers?.showNotification('Copied to clipboard', 'success');
      } else {
        window.DevMentorHelpers?.showNotification('Copy failed', 'error');
      }
    });
    return btn;
  }

  getTypeIcon(type) {
    const map = { explain: '🧠', debug: '🐛', document: '📝', refactor: '⚡', multimodal: '📷' };
    return map[type] || '🔎';
  }

  getTypeTitle(type) {
    const map = {
      explain: 'Explanation',
      debug: 'Bug Analysis',
      document: 'Documentation',
      refactor: 'Refactoring',
      multimodal: 'Screenshot Analysis'
    };
    return map[type] || 'Result';
  }
}

// Expose to window
window.UIManager = UIManager;




