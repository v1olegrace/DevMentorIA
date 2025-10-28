/* global chrome, document */
/**
 * DevMentor AI - Persistent Sidebar Panel
 * A persistent panel that can be minimized/maximized and doesn't close on blur
 */

class SidebarPanel {
  constructor () {
    this.isOpen = false;
    this.isMinimized = false;
    this.panel = null;
    this.init();
  }

  init () {
    // Check if panel already exists
    if (document.getElementById('devmentor-sidebar-panel')) {
      console.log('[SidebarPanel] Panel already exists');
      return;
    }

    this.createPanel();
    this.setupListeners();
    console.log('[SidebarPanel] Initialized');
  }

  createPanel () {
    // Create container
    this.panel = document.createElement('div');
    this.panel.id = 'devmentor-sidebar-panel';
    this.panel.className = 'devmentor-panel-closed';

    // Get extension URL for assets
    const extensionURL = chrome.runtime.getURL('');

    // Create panel HTML
    this.panel.innerHTML = `
      <div class="devmentor-panel-header">
        <div class="devmentor-panel-title">
          <img src="${extensionURL}assets/icons/icon32.svg" alt="DevMentor AI" class="devmentor-panel-icon" />
          <span>DevMentor AI</span>
        </div>
        <div class="devmentor-panel-controls">
          <button id="devmentor-minimize-btn" class="devmentor-panel-btn" title="Minimizar">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <rect x="3" y="7" width="10" height="2" rx="1"/>
            </svg>
          </button>
          <button id="devmentor-close-btn" class="devmentor-panel-btn" title="Fechar">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
            </svg>
          </button>
        </div>
      </div>
      <div class="devmentor-panel-content">
        <iframe id="devmentor-panel-iframe" src="${extensionURL}popup.html"></iframe>
      </div>
      <div class="devmentor-panel-minimized">
        <button id="devmentor-maximize-btn" class="devmentor-panel-maximize-btn" title="DevMentor AI - Clique para expandir">
          <img src="${extensionURL}assets/icons/icon32.svg" alt="DevMentor AI" />
        </button>
      </div>
    `;

    // Add styles
    this.addStyles();

    // Append to body
    document.body.appendChild(this.panel);
  }

  addStyles () {
    if (document.getElementById('devmentor-sidebar-styles')) {
      return;
    }

    const style = document.createElement('style');
    style.id = 'devmentor-sidebar-styles';
    style.textContent = `
      #devmentor-sidebar-panel {
        position: fixed;
        top: 0;
        right: 0;
        width: 420px;
        height: 100vh;
        background: white;
        box-shadow: -2px 0 12px rgba(0, 0, 0, 0.15);
        z-index: 2147483647;
        display: flex;
        flex-direction: column;
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      }

      #devmentor-sidebar-panel.devmentor-panel-closed {
        transform: translateX(100%);
      }

      #devmentor-sidebar-panel.devmentor-panel-open {
        transform: translateX(0);
      }

      #devmentor-sidebar-panel.devmentor-panel-minimized {
        width: 56px;
        box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
      }

      #devmentor-sidebar-panel.devmentor-panel-minimized .devmentor-panel-header,
      #devmentor-sidebar-panel.devmentor-panel-minimized .devmentor-panel-content {
        display: none;
      }

      #devmentor-sidebar-panel:not(.devmentor-panel-minimized) .devmentor-panel-minimized {
        display: none;
      }

      .devmentor-panel-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 16px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      .devmentor-panel-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 600;
        font-size: 14px;
      }

      .devmentor-panel-icon {
        width: 24px;
        height: 24px;
        filter: brightness(0) invert(1);
      }

      .devmentor-panel-controls {
        display: flex;
        gap: 4px;
      }

      .devmentor-panel-btn {
        background: rgba(255, 255, 255, 0.1);
        border: none;
        color: white;
        width: 28px;
        height: 28px;
        border-radius: 4px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s;
      }

      .devmentor-panel-btn:hover {
        background: rgba(255, 255, 255, 0.2);
      }

      .devmentor-panel-content {
        flex: 1;
        overflow: hidden;
        position: relative;
      }

      #devmentor-panel-iframe {
        width: 100%;
        height: 100%;
        border: none;
        display: block;
      }

      .devmentor-panel-minimized {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
      }

      .devmentor-panel-maximize-btn {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border: none;
        width: 48px;
        height: 48px;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s, box-shadow 0.2s;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      }

      .devmentor-panel-maximize-btn:hover {
        transform: scale(1.1);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      }

      .devmentor-panel-maximize-btn img {
        width: 28px;
        height: 28px;
        filter: brightness(0) invert(1);
      }

      /* Dark mode support */
      @media (prefers-color-scheme: dark) {
        #devmentor-sidebar-panel {
          background: #1a1a1a;
          box-shadow: -2px 0 12px rgba(0, 0, 0, 0.4);
        }

        .devmentor-panel-header {
          border-bottom-color: rgba(255, 255, 255, 0.05);
        }
      }

      /* Mobile responsiveness */
      @media (max-width: 768px) {
        #devmentor-sidebar-panel {
          width: 100%;
        }
      }
    `;

    document.head.appendChild(style);
  }

  setupListeners () {
    // Minimize button
    const minimizeBtn = document.getElementById('devmentor-minimize-btn');
    minimizeBtn?.addEventListener('click', () => this.minimize());

    // Close button
    const closeBtn = document.getElementById('devmentor-close-btn');
    closeBtn?.addEventListener('click', () => this.close());

    // Maximize button
    const maximizeBtn = document.getElementById('devmentor-maximize-btn');
    maximizeBtn?.addEventListener('click', () => this.maximize());

    // Listen for toggle messages from service worker
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'toggle-sidebar-panel') {
        this.toggle();
        sendResponse({ success: true });
        return true;
      }

      if (request.action === 'minimize-sidebar-panel') {
        if (this.isOpen && !this.isMinimized) {
          this.minimize();
        }
        sendResponse({ success: true, wasMinimized: true });
        return true;
      }
    });

    // Listen for keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Alt+Shift+D to toggle panel
      if (e.altKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        this.toggle();
      }
    });
  }

  toggle () {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open () {
    this.panel.classList.remove('devmentor-panel-closed', 'devmentor-panel-minimized');
    this.panel.classList.add('devmentor-panel-open');
    this.isOpen = true;
    this.isMinimized = false;

    // Reload iframe to refresh content
    const iframe = document.getElementById('devmentor-panel-iframe');
    if (iframe) {
      iframe.src = iframe.src;
    }

    console.log('[SidebarPanel] Opened');
  }

  close () {
    this.panel.classList.remove('devmentor-panel-open', 'devmentor-panel-minimized');
    this.panel.classList.add('devmentor-panel-closed');
    this.isOpen = false;
    this.isMinimized = false;
    console.log('[SidebarPanel] Closed');
  }

  minimize () {
    this.panel.classList.add('devmentor-panel-minimized');
    this.isMinimized = true;
    console.log('[SidebarPanel] Minimized');
  }

  maximize () {
    this.panel.classList.remove('devmentor-panel-minimized');
    this.isMinimized = false;

    // Reload iframe to refresh content
    const iframe = document.getElementById('devmentor-panel-iframe');
    if (iframe) {
      iframe.src = iframe.src;
    }

    console.log('[SidebarPanel] Maximized');
  }
}

// Initialize sidebar panel when script loads
if (!window.__DEVMENTOR_SIDEBAR_INITIALIZED__) {
  window.__DEVMENTOR_SIDEBAR_INITIALIZED__ = true;
  const sidebarPanel = new SidebarPanel();
  window.__DEVMENTOR_SIDEBAR_PANEL__ = sidebarPanel;
}
