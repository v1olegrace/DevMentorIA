/**
 * DevMentor AI - Minimal Content Script (Dynamic Injection)
 * Injected only when needed via chrome.scripting.executeScript
 * Optimized for performance and security
 */

// Mark as injected to prevent duplicate injection
window.__DEVMENTOR_CONTENT_SCRIPT_INJECTED__ = true;

class MinimalContentScript {
  constructor() {
    this.isInitialized = false;
    this.messageHandlers = new Map();
    this.init();
  }

  async init() {
    if (this.isInitialized) {
      return;
    }

    try {
      console.log('[ContentScript] Minimal content script initialized');
      
      // Set up message handlers
      this.setupMessageHandlers();
      
      // Set up keyboard shortcuts
      this.setupKeyboardHandlers();
      
      this.isInitialized = true;
      console.log('[ContentScript] ✅ Setup completed');
      
    } catch (error) {
      console.error('[ContentScript] Initialization failed:', error);
    }
  }

  setupMessageHandlers() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      const handler = this.messageHandlers.get(request.action);
      
      if (handler) {
        handler(request, sender, sendResponse);
        return true; // Keep message channel open for async response
      }
      
      console.warn('[ContentScript] Unknown message action:', request.action);
      sendResponse({ success: false, error: `Unknown action: ${request.action}` });
      return false;
    });

    // Register message handlers
    this.messageHandlers.set('explain-selection', this.handleExplainSelection.bind(this));
    this.messageHandlers.set('debug-selection', this.handleDebugSelection.bind(this));
    this.messageHandlers.set('document-selection', this.handleDocumentSelection.bind(this));
    this.messageHandlers.set('refactor-selection', this.handleRefactorSelection.bind(this));
    this.messageHandlers.set('show-analysis-result', this.showAnalysisResult.bind(this));
    this.messageHandlers.set('show-analysis-error', this.showAnalysisError.bind(this));
  }

  async handleExplainSelection(request, sender, sendResponse) {
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'explain-code',
        code: request.code,
        context: { url: window.location.href }
      });

      sendResponse(response);
    } catch (error) {
      console.error('[ContentScript] Explain selection failed:', error);
      sendResponse({ success: false, error: error.message });
    }
  }

  async handleDebugSelection(request, sender, sendResponse) {
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'debug-code',
        code: request.code,
        context: { url: window.location.href }
      });

      sendResponse(response);
    } catch (error) {
      console.error('[ContentScript] Debug selection failed:', error);
      sendResponse({ success: false, error: error.message });
    }
  }

  async handleDocumentSelection(request, sender, sendResponse) {
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'document-code',
        code: request.code,
        context: { url: window.location.href }
      });

      sendResponse(response);
    } catch (error) {
      console.error('[ContentScript] Document selection failed:', error);
      sendResponse({ success: false, error: error.message });
    }
  }

  async handleRefactorSelection(request, sender, sendResponse) {
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'refactor-code',
        code: request.code,
        context: { url: window.location.href }
      });

      sendResponse(response);
    } catch (error) {
      console.error('[ContentScript] Refactor selection failed:', error);
      sendResponse({ success: false, error: error.message });
    }
  }

  setupKeyboardHandlers() {
    document.addEventListener('keydown', (event) => {
      // Handle extension shortcuts
      if (event.ctrlKey && event.shiftKey) {
        switch (event.key) {
          case 'E':
            event.preventDefault();
            this.handleExplainShortcut();
            break;
          case 'B':
            event.preventDefault();
            this.handleDebugShortcut();
            break;
          case 'G':
            event.preventDefault();
            this.handleDocumentShortcut();
            break;
          case 'R':
            event.preventDefault();
            this.handleRefactorShortcut();
            break;
        }
      }
    });
  }

  async handleExplainShortcut() {
    const selectedCode = window.getSelection().toString().trim();
    if (!selectedCode) {
      this.showNotification('Please select some code first', 'warning');
      return;
    }

    try {
      const response = await chrome.runtime.sendMessage({
        action: 'explain-code',
        code: selectedCode,
        context: { url: window.location.href }
      });

      if (response.success) {
        this.showAnalysisResult({
          type: 'explanation',
          result: response.data,
          code: selectedCode
        });
      } else {
        this.showAnalysisError({
          type: 'explanation',
          error: response.error
        });
      }
    } catch (error) {
      console.error('[ContentScript] Explain shortcut failed:', error);
      this.showNotification('Failed to explain code', 'error');
    }
  }

  async handleDebugShortcut() {
    const selectedCode = window.getSelection().toString().trim();
    if (!selectedCode) {
      this.showNotification('Please select some code first', 'warning');
      return;
    }

    try {
      const response = await chrome.runtime.sendMessage({
        action: 'debug-code',
        code: selectedCode,
        context: { url: window.location.href }
      });

      if (response.success) {
        this.showAnalysisResult({
          type: 'debug',
          result: response.data,
          code: selectedCode
        });
      } else {
        this.showAnalysisError({
          type: 'debug',
          error: response.error
        });
      }
    } catch (error) {
      console.error('[ContentScript] Debug shortcut failed:', error);
      this.showNotification('Failed to debug code', 'error');
    }
  }

  async handleDocumentShortcut() {
    const selectedCode = window.getSelection().toString().trim();
    if (!selectedCode) {
      this.showNotification('Please select some code first', 'warning');
      return;
    }

    try {
      const response = await chrome.runtime.sendMessage({
        action: 'document-code',
        code: selectedCode,
        context: { url: window.location.href }
      });

      if (response.success) {
        this.showAnalysisResult({
          type: 'documentation',
          result: response.data,
          code: selectedCode
        });
      } else {
        this.showAnalysisError({
          type: 'documentation',
          error: response.error
        });
      }
    } catch (error) {
      console.error('[ContentScript] Document shortcut failed:', error);
      this.showNotification('Failed to generate documentation', 'error');
    }
  }

  async handleRefactorShortcut() {
    const selectedCode = window.getSelection().toString().trim();
    if (!selectedCode) {
      this.showNotification('Please select some code first', 'warning');
      return;
    }

    try {
      const response = await chrome.runtime.sendMessage({
        action: 'refactor-code',
        code: selectedCode,
        context: { url: window.location.href }
      });

      if (response.success) {
        this.showAnalysisResult({
          type: 'refactor',
          result: response.data,
          code: selectedCode
        });
      } else {
        this.showAnalysisError({
          type: 'refactor',
          error: response.error
        });
      }
    } catch (error) {
      console.error('[ContentScript] Refactor shortcut failed:', error);
      this.showNotification('Failed to refactor code', 'error');
    }
  }

  showAnalysisResult(request) {
    const tooltip = this.createAnalysisTooltip(request);
    document.body.appendChild(tooltip);
    
    // Auto-remove after 30 seconds
    setTimeout(() => {
      if (tooltip.parentNode) {
        tooltip.remove();
      }
    }, 30000);
  }

  showAnalysisError(request) {
    const errorTooltip = this.createErrorTooltip(request);
    document.body.appendChild(errorTooltip);
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (errorTooltip.parentNode) {
        errorTooltip.remove();
      }
    }, 10000);
  }

  createAnalysisTooltip(request) {
    const tooltip = document.createElement('div');
    tooltip.className = 'devmentor-analysis-tooltip';
    tooltip.innerHTML = `
      <div class="tooltip-header">
        <span class="tooltip-title">${this.getTooltipTitle(request.type)}</span>
        <button class="close-btn" aria-label="Close">&times;</button>
      </div>
      <div class="tooltip-content">
        <div class="analysis-result">${this.formatAnalysisResult(request.result)}</div>
        <div class="tooltip-footer">
          <button class="copy-btn">Copy</button>
          <button class="expand-btn">Expand</button>
        </div>
      </div>
    `;
    
    // Add event listeners
    tooltip.querySelector('.close-btn').onclick = () => tooltip.remove();
    tooltip.querySelector('.copy-btn').onclick = () => this.copyToClipboard(request.result);
    tooltip.querySelector('.expand-btn').onclick = () => this.expandTooltip(tooltip);
    
    return tooltip;
  }

  createErrorTooltip(request) {
    const tooltip = document.createElement('div');
    tooltip.className = 'devmentor-error-tooltip';
    tooltip.innerHTML = `
      <div class="error-header">
        <span class="error-title">Error: ${this.getTooltipTitle(request.type)}</span>
        <button class="close-btn" aria-label="Close">&times;</button>
      </div>
      <div class="error-content">
        <div class="error-message">${request.error}</div>
      </div>
    `;
    
    tooltip.querySelector('.close-btn').onclick = () => tooltip.remove();
    
    return tooltip;
  }

  getTooltipTitle(type) {
    const titles = {
      'explanation': 'Code Explanation',
      'debug': 'Debug Analysis',
      'documentation': 'Documentation',
      'refactor': 'Code Refactoring'
    };
    return titles[type] || 'Analysis';
  }

  formatAnalysisResult(result) {
    if (typeof result === 'string') {
      return result;
    }
    
    if (result.explanation) {
      return result.explanation;
    }
    
    if (result.debugInfo) {
      return result.debugInfo;
    }
    
    if (result.documentation) {
      return result.documentation;
    }
    
    if (result.refactoredCode) {
      return result.refactoredCode;
    }
    
    return JSON.stringify(result, null, 2);
  }

  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      this.showNotification('Copied to clipboard', 'success');
    } catch (error) {
      console.error('[ContentScript] Copy failed:', error);
      this.showNotification('Failed to copy', 'error');
    }
  }

  expandTooltip(tooltip) {
    tooltip.classList.toggle('expanded');
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `devmentor-notification devmentor-notification-${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 3000);
  }
}

// Initialize minimal content script
const minimalContentScript = new MinimalContentScript();

console.log('[ContentScript] ✅ Minimal content script loaded');