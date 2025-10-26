/**
 * DevMentor AI - Shadow DOM Overlay Manager
 * Creates isolated overlays using Shadow DOM to avoid style conflicts
 */

class ShadowDOMOverlayManager {
  constructor() {
    this.overlays = new Map();
    this.styles = `
      :host {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 2147483647;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      
      .overlay {
        position: absolute;
        pointer-events: auto;
        background: rgba(30, 30, 30, 0.95);
        backdrop-filter: blur(10px);
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: #ffffff;
        font-size: 14px;
        line-height: 1.5;
        max-width: 400px;
        word-wrap: break-word;
      }
      
      .overlay-header {
        padding: 16px 20px 12px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .overlay-title {
        font-size: 16px;
        font-weight: 600;
        color: #ffffff;
        margin: 0;
      }
      
      .overlay-close {
        background: none;
        border: none;
        color: #b0b0b0;
        cursor: pointer;
        font-size: 18px;
        padding: 4px;
        border-radius: 4px;
        transition: all 0.2s ease;
      }
      
      .overlay-close:hover {
        background: rgba(255, 255, 255, 0.1);
        color: #ffffff;
      }
      
      .overlay-content {
        padding: 20px;
        max-height: 60vh;
        overflow-y: auto;
      }
      
      .overlay-footer {
        padding: 12px 20px 16px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        justify-content: flex-end;
        gap: 8px;
      }
      
      .btn {
        padding: 8px 16px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 12px;
        font-weight: 500;
        transition: all 0.2s ease;
      }
      
      .btn-primary {
        background: #0066cc;
        color: #ffffff;
      }
      
      .btn-primary:hover {
        background: #0052a3;
      }
      
      .btn-secondary {
        background: rgba(255, 255, 255, 0.1);
        color: #ffffff;
      }
      
      .btn-secondary:hover {
        background: rgba(255, 255, 255, 0.2);
      }
      
      .code-block {
        background: rgba(0, 0, 0, 0.3);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 6px;
        padding: 12px;
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        font-size: 13px;
        overflow-x: auto;
        margin: 8px 0;
      }
      
      .loading {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #b0b0b0;
      }
      
      .loading-spinner {
        width: 16px;
        height: 16px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-top: 2px solid #0066cc;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
      
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      .fade-in {
        animation: fadeIn 0.3s ease;
      }
      
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `;
  }

  /**
   * Create a new overlay with Shadow DOM
   * @param {string} id - Overlay ID
   * @param {Object} options - Overlay options
   * @returns {HTMLElement} - Shadow DOM host element
   */
  createOverlay(id, options = {}) {
    // Remove existing overlay with same ID
    this.removeOverlay(id);

    // Create shadow DOM host
    const host = document.createElement('div');
    host.id = `devmentor-overlay-${id}`;
    host.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 2147483647;
    `;

    // Create shadow root
    const shadowRoot = host.attachShadow({ mode: 'closed' });
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = this.styles;
    shadowRoot.appendChild(style);

    // Create overlay content
    const overlay = this.createOverlayContent(options);
    shadowRoot.appendChild(overlay);

    // Add to document
    document.body.appendChild(host);

    // Store reference
    this.overlays.set(id, {
      host,
      shadowRoot,
      overlay
    });

    // Add fade-in animation
    overlay.classList.add('fade-in');

    return host;
  }

  /**
   * Create overlay content
   * @param {Object} options - Overlay options
   * @returns {HTMLElement} - Overlay element
   */
  createOverlayContent(options) {
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    
    // Position
    const position = options.position || 'center';
    this.setOverlayPosition(overlay, position);

    // Header
    if (options.title) {
      const header = document.createElement('div');
      header.className = 'overlay-header';
      
      const title = document.createElement('h3');
      title.className = 'overlay-title';
      title.textContent = options.title;
      
      const closeBtn = document.createElement('button');
      closeBtn.className = 'overlay-close';
      closeBtn.innerHTML = '×';
      closeBtn.onclick = () => this.removeOverlay(options.id);
      
      header.appendChild(title);
      header.appendChild(closeBtn);
      overlay.appendChild(header);
    }

    // Content
    const content = document.createElement('div');
    content.className = 'overlay-content';
    
    if (options.content) {
      if (typeof options.content === 'string') {
        content.innerHTML = options.content;
      } else {
        content.appendChild(options.content);
      }
    }
    
    overlay.appendChild(content);

    // Footer
    if (options.buttons && options.buttons.length > 0) {
      const footer = document.createElement('div');
      footer.className = 'overlay-footer';
      
      options.buttons.forEach(button => {
        const btn = document.createElement('button');
        btn.className = `btn ${button.type || 'btn-secondary'}`;
        btn.textContent = button.text;
        btn.onclick = button.onclick;
        footer.appendChild(btn);
      });
      
      overlay.appendChild(footer);
    }

    return overlay;
  }

  /**
   * Set overlay position
   * @param {HTMLElement} overlay - Overlay element
   * @param {string} position - Position type
   */
  setOverlayPosition(overlay, position) {
    const positions = {
      'top-left': { top: '20px', left: '20px' },
      'top-right': { top: '20px', right: '20px' },
      'bottom-left': { bottom: '20px', left: '20px' },
      'bottom-right': { bottom: '20px', right: '20px' },
      'center': { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
      'top-center': { top: '20px', left: '50%', transform: 'translateX(-50%)' },
      'bottom-center': { bottom: '20px', left: '50%', transform: 'translateX(-50%)' }
    };

    const pos = positions[position] || positions.center;
    Object.assign(overlay.style, pos);
  }

  /**
   * Update overlay content
   * @param {string} id - Overlay ID
   * @param {string|HTMLElement} content - New content
   */
  updateOverlay(id, content) {
    const overlayData = this.overlays.get(id);
    if (!overlayData) return;

    const contentElement = overlayData.overlay.querySelector('.overlay-content');
    if (!contentElement) return;

    if (typeof content === 'string') {
      contentElement.innerHTML = content;
    } else {
      contentElement.innerHTML = '';
      contentElement.appendChild(content);
    }
  }

  /**
   * Show loading state in overlay
   * @param {string} id - Overlay ID
   * @param {string} message - Loading message
   */
  showLoading(id, message = 'Processing...') {
    const loadingHTML = `
      <div class="loading">
        <div class="loading-spinner"></div>
        <span>${message}</span>
      </div>
    `;
    this.updateOverlay(id, loadingHTML);
  }

  /**
   * Remove overlay
   * @param {string} id - Overlay ID
   */
  removeOverlay(id) {
    const overlayData = this.overlays.get(id);
    if (!overlayData) return;

    overlayData.host.remove();
    this.overlays.delete(id);
  }

  /**
   * Remove all overlays
   */
  removeAllOverlays() {
    this.overlays.forEach((overlayData, id) => {
      this.removeOverlay(id);
    });
  }

  /**
   * Check if overlay exists
   * @param {string} id - Overlay ID
   * @returns {boolean} - Exists status
   */
  hasOverlay(id) {
    return this.overlays.has(id);
  }

  /**
   * Get overlay element
   * @param {string} id - Overlay ID
   * @returns {HTMLElement|null} - Overlay element
   */
  getOverlay(id) {
    const overlayData = this.overlays.get(id);
    return overlayData ? overlayData.overlay : null;
  }
}

// Create global instance
const shadowOverlayManager = new ShadowDOMOverlayManager();

// Export for use
if (typeof window !== 'undefined') {
  window.DevMentorShadowOverlay = shadowOverlayManager;
}

// Export for Node.js/CommonJS
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ShadowDOMOverlayManager;
}
