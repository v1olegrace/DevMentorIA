/**
 * DevMentor AI - Main Content Script
 * Orchestrates all content script functionality and UI management
 */

class DevMentorContentScript {
  constructor() {
    this.isInitialized = false;
    this.uiManager = null;
    this.codeAnalyzer = null;
    this.screenshotHandler = null;
    this.activeRequests = new Map();
    
    // Initialize logger
    this.logger = {
      debug: (...args) => console.debug('[ContentScript]', ...args),
      info: (...args) => console.info('[ContentScript]', ...args),
      warn: (...args) => console.warn('[ContentScript]', ...args),
      error: (...args) => console.error('[ContentScript]', ...args)
    };
    
    this.init();
  }

  /**
   * Initialize content script
   */
  async init() {
    try {
      this.logger.info('Initializing DevMentor AI content script...');
      
      // Setup event listeners
      this.setupEventListeners();
      
      // Setup message handlers
      this.setupMessageHandlers();
      
      this.isInitialized = true;
      this.logger.info('DevMentor AI content script initialized successfully');
      
    } catch (error) {
      this.logger.error('Content script initialization failed:', error);
    }
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Text selection handling
    document.addEventListener('mouseup', this.handleTextSelection.bind(this));
    
    // Keyboard shortcuts
    document.addEventListener('keydown', this.handleKeyboardShortcuts.bind(this));
  }

  /**
   * Setup message handlers
   */
  setupMessageHandlers() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
      return true;
    });
  }

  /**
   * Handle messages from background script
   */
  async handleMessage(message, sender, sendResponse) {
    try {
      const { action, data } = message;
      
      switch (action) {
        case 'explainCode':
          await this.handleExplainCode(data);
          break;
        case 'getSelectedText':
          sendResponse({ text: this.getSelectedText() });
          break;
        default:
          this.logger.warn('Unknown action:', action);
      }
      
    } catch (error) {
      this.logger.error('Message handling failed:', error);
      sendResponse({ error: error.message });
    }
  }

  /**
   * Handle text selection
   */
  handleTextSelection(event) {
    const selectedText = this.getSelectedText();
    if (selectedText && selectedText.length > 10) {
      this.logger.debug('Code selected:', selectedText.substring(0, 50));
    }
  }

  /**
   * Handle keyboard shortcuts
   */
  handleKeyboardShortcuts(event) {
    const isMac = navigator.platform.indexOf('Mac') > -1;
    const ctrlKey = isMac ? event.metaKey : event.ctrlKey;
    
    if (ctrlKey && event.shiftKey) {
      switch (event.code) {
        case 'KeyE':
          event.preventDefault();
          this.handleExplainCode();
          break;
      }
    }
  }

  /**
   * Get currently selected text
   */
  getSelectedText() {
    const selection = window.getSelection();
    return selection.toString().trim();
  }

  /**
   * Handle explain code action
   */
  async handleExplainCode(data = null) {
    try {
      const selectedText = data?.text || this.getSelectedText();
      if (!selectedText) {
        this.showNotification('Please select some code to explain');
        return;
      }
      
      this.logger.info('Explaining code:', selectedText.substring(0, 100));
      this.showNotification('DevMentor AI is analyzing your code...');
      
    } catch (error) {
      this.logger.error('Explain code failed:', error);
      this.showError('Failed to explain code');
    }
  }

  /**
   * Show notification
   */
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #333;
      color: white;
      padding: 12px 20px;
      border-radius: 6px;
      z-index: 999999;
      font-family: Arial, sans-serif;
      font-size: 14px;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);
  }

  /**
   * Show error message
   */
  showError(message) {
    this.showNotification(message, 'error');
  }
}

// Initialize content script
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.devMentorContentScript = new DevMentorContentScript();
  });
} else {
  window.devMentorContentScript = new DevMentorContentScript();
}

