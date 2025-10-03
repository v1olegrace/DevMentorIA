/**
 * DevMentor AI - Content Script (Demo Version)
 * Minimal implementation for hackathon demonstration
 */

class DevMentorContentScript {
  constructor() {
    this.isInitialized = false;
    this.logger = {
      debug: (...args) => console.debug('[ContentScript]', ...args),
      info: (...args) => console.info('[ContentScript]', ...args),
      warn: (...args) => console.warn('[ContentScript]', ...args),
      error: (...args) => console.error('[ContentScript]', ...args)
    };
    
    this.init();
  }

  /**
   * Initialize content script (Demo Mode)
   */
  async init() {
    try {
      this.logger.info('DevMentor AI Content Script - Demo Mode');
      
      // Setup basic event listeners
      this.setupEventListeners();
      
      this.isInitialized = true;
      this.logger.info('Content script initialized successfully');
      
    } catch (error) {
      this.logger.error('Content script initialization failed:', error);
    }
  }

  /**
   * Setup event listeners (Demo)
   */
  setupEventListeners() {
    // Listen for messages from popup/background
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      this.handleMessage(request, sender, sendResponse);
      return true; // Keep message channel open
    });

    // Handle keyboard shortcuts
    document.addEventListener('keydown', (event) => {
      this.handleKeyboardShortcuts(event);
    });
  }

  /**
   * Handle messages (Demo)
   */
  handleMessage(request, sender, sendResponse) {
    this.logger.debug('Received message:', request);
    
    switch (request.action) {
      case 'ping':
        // Respond to ping for injection detection
        sendResponse({ success: true, injected: true });
        break;
        
      case 'getSelectedCode':
        sendResponse({ 
          success: true, 
          code: this.getSelectedText(),
          language: this.detectLanguage()
        });
        break;
        
      case 'analyzeCode':
        this.analyzeCodeDemo(request.code, request.type)
          .then(result => sendResponse(result))
          .catch(error => sendResponse({ success: false, error: error.message }));
        break;
        
      default:
        sendResponse({ success: false, error: 'Unknown action' });
    }
  }

  /**
   * Get selected text (Demo)
   */
  getSelectedText() {
    const selection = window.getSelection();
    return selection.toString().trim();
  }

  /**
   * Detect programming language (Demo)
   */
  detectLanguage() {
    const url = window.location.href;
    if (url.includes('github.com')) return 'javascript';
    if (url.includes('python')) return 'python';
    if (url.includes('java')) return 'java';
    return 'javascript'; // Default
  }

  /**
   * Analyze code (Demo)
   */
  async analyzeCodeDemo(code, type) {
    this.logger.info(`Demo analysis: ${type} for code`);
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      result: `Demo ${type} result: Code analyzed successfully!`,
      timestamp: new Date().toISOString(),
      language: this.detectLanguage()
    };
  }

  /**
   * Handle keyboard shortcuts (Demo)
   */
  handleKeyboardShortcuts(event) {
    // Ctrl+Shift+E: Explain code
    if (event.ctrlKey && event.shiftKey && event.key === 'E') {
      event.preventDefault();
      this.triggerAnalysis('explain');
    }
    
    // Ctrl+Shift+D: Debug code
    if (event.ctrlKey && event.shiftKey && event.key === 'D') {
      event.preventDefault();
      this.triggerAnalysis('debug');
    }
  }

  /**
   * Trigger analysis (Demo)
   */
  async triggerAnalysis(type) {
    const code = this.getSelectedText();
    if (!code) {
      this.logger.warn('No code selected');
      return;
    }

    try {
      const result = await this.analyzeCodeDemo(code, type);
      this.logger.info('Analysis completed:', result);
      
      // Show demo notification
      this.showDemoNotification(type, result.result);
      
    } catch (error) {
      this.logger.error('Analysis failed:', error);
    }
  }

  /**
   * Show demo notification
   */
  showDemoNotification(type, result) {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #4285f4;
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      z-index: 10000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      max-width: 300px;
    `;
    
    notification.innerHTML = `
      <div style="font-weight: 600; margin-bottom: 4px;">DevMentor AI Demo</div>
      <div>${type.charAt(0).toUpperCase() + type.slice(1)}: ${result}</div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);
  }
}

// Initialize content script
if (typeof window !== 'undefined') {
  new DevMentorContentScript();
}

