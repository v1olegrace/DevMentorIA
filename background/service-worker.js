/**
 * DevMentor AI - Service Worker (Background Script)
 * Handles context menus, message passing, and AI coordination
 */

class DevMentorServiceWorker {
  constructor() {
    this.isInitialized = false;
    this.contextMenus = new Map();
    this.activeRequests = new Map();
    
    // Initialize secure logger
    this.logger = {
      debug: (...args) => console.debug('[ServiceWorker]', ...args),
      info: (...args) => console.info('[ServiceWorker]', ...args),
      warn: (...args) => console.warn('[ServiceWorker]', ...args),
      error: (...args) => console.error('[ServiceWorker]', ...args)
    };
    
    this.init();
  }

  /**
   * Initialize service worker
   */
  async init() {
    this.logger.info('Starting DevMentor AI...');

    try {
      // Set up event listeners
      this.setupEventListeners();
      
      // Create context menus
      await this.createContextMenus();
      
      // Initialize AI Session Manager (mock for demo)
      this.initializeAISession();
      
      this.isInitialized = true;
      this.logger.info('DevMentor AI initialized successfully');
      
    } catch (error) {
      this.logger.error('Initialization failed:', error);
    }
  }

  /**
   * Initialize AI Session (Mock for Demo)
   */
  initializeAISession() {
    this.logger.info('Initializing AI Session Manager (Demo Mode)');
    // Mock AI session for hackathon demo
    this.aiSessionManager = {
      initialized: true,
      available: true,
      processCode: async (code, type) => {
        return {
          success: true,
          result: `Demo ${type} result for: ${code.substring(0, 50)}...`,
          timestamp: new Date().toISOString()
        };
      }
    };
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Extension installation/startup
    chrome.runtime.onInstalled.addListener(this.handleInstall.bind(this));
    chrome.runtime.onStartup.addListener(this.handleStartup.bind(this));

    // Context menu clicks
    chrome.contextMenus.onClicked.addListener(this.handleContextMenuClick.bind(this));

    // Message handling
    chrome.runtime.onMessage.addListener(this.handleMessage.bind(this));

    // Tab updates (for cleanup)
    chrome.tabs.onRemoved.addListener(this.handleTabRemoved.bind(this));
    chrome.tabs.onUpdated.addListener(this.handleTabUpdated.bind(this));

    // Extension suspend/resume
    chrome.runtime.onSuspend.addListener(this.handleSuspend.bind(this));
  }

  /**
   * Handle extension installation
   * @param {Object} details - Installation details
   */
  async handleInstall(details) {
    this.logger.info('Extension installed:', details.reason);

    if (details.reason === 'install') {
      // First installation
      await this.showWelcomeNotification();
      await this.trackInstallation();
    } else if (details.reason === 'update') {
      // Extension updated
      await this.handleUpdate(details.previousVersion);
    }
  }

  /**
   * Handle extension startup
   */
  async handleStartup() {
    this.logger.info('Extension startup');
    await this.trackUsage('startup');
  }

  /**
   * Create context menus
   */
  async createContextMenus() {
    try {
      // Remove existing menus
      await chrome.contextMenus.removeAll();
      this.contextMenus.clear();

      // Define menu items
      const menuItems = [
        {
          id: 'devmentor-explain',
          title: 'Explain Code',
          contexts: ['selection'],
          documentUrlPatterns: ['<all_urls>']
        },
        {
          id: 'devmentor-debug', 
          title: '🐛 Find Bugs & Issues',
          contexts: ['selection'],
          documentUrlPatterns: ['<all_urls>']
        },
        {
          id: 'devmentor-document',
          title: 'Generate Documentation',
          contexts: ['selection'], 
          documentUrlPatterns: ['<all_urls>']
        },
        {
          id: 'devmentor-refactor',
          title: 'Suggest Refactoring',
          contexts: ['selection'],
          documentUrlPatterns: ['<all_urls>']
        },
        {
          id: 'devmentor-separator',
          type: 'separator',
          contexts: ['selection'],
          documentUrlPatterns: ['<all_urls>']
        },
        {
          id: 'devmentor-screenshot',
          title: '📷 Analyze Screenshot',
          contexts: ['page'],
          documentUrlPatterns: ['<all_urls>']
        }
      ];

      // Create menu items
      for (const item of menuItems) {
        await new Promise((resolve, reject) => {
          chrome.contextMenus.create(item, () => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
            } else {
              this.contextMenus.set(item.id, item);
              resolve();
            }
          });
        });
      }

      this.logger.info('Context menus created successfully');

    } catch (error) {
      this.logger.error('Failed to create context menus:', error);
    }
  }

  /**
   * Handle context menu clicks
   * @param {Object} info - Click info
   * @param {Object} tab - Tab info
   */
  async handleContextMenuClick(info, tab) {
    this.logger.info('Context menu clicked:', info.menuItemId);

    try {
      // Track usage
      await this.trackUsage('context_menu', { action: info.menuItemId });

      // Handle different menu actions
      switch (info.menuItemId) {
        case 'devmentor-explain':
          await this.handleCodeAnalysis('explain', info, tab);
          break;
        case 'devmentor-debug':
          await this.handleCodeAnalysis('debug', info, tab);
          break;
        case 'devmentor-document':
          await this.handleCodeAnalysis('document', info, tab);
          break;
        case 'devmentor-refactor':
          await this.handleCodeAnalysis('refactor', info, tab);
          break;
        case 'devmentor-screenshot':
          await this.handleScreenshotAnalysis(info, tab);
          break;
      }

    } catch (error) {
      this.logger.error('Context menu handling failed:', error);
      await this.sendErrorToTab(tab.id, error);
    }
  }

  /**
   * Handle code analysis requests
   * @param {string} type - Analysis type
   * @param {Object} info - Context menu info
   * @param {Object} tab - Tab info
   */
  async handleCodeAnalysis(type, info, tab) {
    if (!info.selectionText) {
      throw new Error('No code selected');
    }

    const requestId = this.generateRequestId();
    this.activeRequests.set(requestId, {
      type,
      tabId: tab.id,
      startTime: Date.now()
    });

    try {
      // Send loading state to content script
      await this.sendToTab(tab.id, {
        action: 'showLoading',
        requestId,
        type,
        message: this.getLoadingMessage(type)
      });

      // Detect programming language
      const language = await this.detectLanguage(info.selectionText, info.pageUrl);

      // Process with AI
      const result = await self.aiSessionManager.processCodeWithChaining(info.selectionText, type, {
        language: language.language,
        context: `URL: ${info.pageUrl}`,
        pageTitle: tab.title
      });

      // Send result to content script
      await this.sendToTab(tab.id, {
        action: 'showResult',
        requestId,
        result: {
          ...result,
          language,
          originalCode: info.selectionText
        }
      });

      // Track successful processing
      await this.trackUsage('analysis_success', { 
        type, 
        language: language.language,
        codeLength: info.selectionText.length
      });

    } catch (error) {
      this.logger.error(`${type} analysis failed:`, error);
      
      // Send error to content script
      await this.sendToTab(tab.id, {
        action: 'showError',
        requestId,
        error: {
          type: error.name,
          message: error.message,
          userFriendly: this.getUserFriendlyError(error)
        }
      });

      // Track error
      await this.trackUsage('analysis_error', { 
        type, 
        error: error.message 
      });

    } finally {
      this.activeRequests.delete(requestId);
    }
  }

  /**
   * Handle screenshot analysis requests
   * @param {Object} info - Context menu info
   * @param {Object} tab - Tab info
   */
  async handleScreenshotAnalysis(info, tab) {
    const requestId = this.generateRequestId();

    try {
      // Send screenshot request to content script
      await this.sendToTab(tab.id, {
        action: 'requestScreenshot',
        requestId
      });

    } catch (error) {
      this.logger.error('Screenshot analysis failed:', error);
      await this.sendErrorToTab(tab.id, error);
    }
  }

  /**
   * Handle messages from content scripts
   * @param {Object} message - Message object
   * @param {Object} sender - Sender info
   * @param {Function} sendResponse - Response callback
   */
  async handleMessage(message, sender, sendResponse) {
    this.logger.info('Received message:', message.action);

    try {
      switch (message.action) {
        case 'processScreenshot':
          await this.processScreenshot(message, sender);
          break;
          
        case 'getAIStatus':
          sendResponse(await this.getAIStatus());
          break;
          
        case 'getStats':
          sendResponse(await this.getStats());
          break;
          
        case 'clearData':
          await this.clearUserData();
          sendResponse({ success: true });
          break;
          
        default:
          this.logger.warn('Unknown message action:', message.action);
      }

    } catch (error) {
      this.logger.error('Message handling failed:', error);
      sendResponse({ error: error.message });
    }

    return true; // Keep message channel open for async responses
  }

  /**
   * Process screenshot data
   * @param {Object} message - Message with screenshot data
   * @param {Object} sender - Sender info
   */
  async processScreenshot(message, sender) {
    const { base64Image, requestId, mediaType } = message;

    try {
      // Send loading state
      await this.sendToTab(sender.tab.id, {
        action: 'showLoading',
        requestId,
        type: 'screenshot',
        message: 'Analyzing screenshot...'
      });

      // Process with AI (multimodal - screenshot analysis)
      const result = await self.aiSessionManager.processCodeWithChaining('', 'screenshot', {
        imageData: base64Image,
        mediaType: mediaType
      });

      // Send result
      await this.sendToTab(sender.tab.id, {
        action: 'showResult',
        requestId,
        result
      });

      // Track usage
      await this.trackUsage('screenshot_analysis', {
        imageSize: base64Image.length,
        mediaType
      });

    } catch (error) {
      this.logger.error('Screenshot processing failed:', error);
      
      await this.sendToTab(sender.tab.id, {
        action: 'showError',
        requestId,
        error: {
          type: error.name,
          message: error.message,
          userFriendly: this.getUserFriendlyError(error)
        }
      });
    }
  }

  /**
   * Detect programming language
   * @param {string} code - Code snippet
   * @param {string} url - Page URL
   * @returns {Object} Language detection result
   */
  async detectLanguage(code, url) {
    try {
      // Try to get filename from URL
      const filename = this.extractFilenameFromUrl(url);
      
      // Use language detector (would need to import this)
      // For now, simple detection
      return this.simpleLanguageDetection(code, filename);
      
    } catch (error) {
      this.logger.warn('Language detection failed:', error);
      return { language: 'auto', confidence: 0 };
    }
  }

  /**
   * Simple language detection fallback
   * @param {string} code - Code to analyze
   * @param {string} filename - Optional filename
   * @returns {Object} Detection result
   */
  simpleLanguageDetection(code, filename) {
    // Basic patterns for common languages
    if (code.includes('function') && code.includes('{')) {
      return { language: 'javascript', confidence: 0.7 };
    }
    if (code.includes('def ') && code.includes(':')) {
      return { language: 'python', confidence: 0.8 };
    }
    if (code.includes('public class')) {
      return { language: 'java', confidence: 0.8 };
    }
    if (code.includes('#include')) {
      return { language: 'cpp', confidence: 0.8 };
    }

    return { language: 'auto', confidence: 0.2 };
  }

  /**
   * Extract filename from URL
   * @param {string} url - URL to analyze
   * @returns {string} Filename or empty string
   */
  extractFilenameFromUrl(url) {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const filename = pathname.split('/').pop();
      return filename || '';
    } catch (error) {
      return '';
    }
  }

  /**
   * Get loading message for analysis type
   * @param {string} type - Analysis type
   * @returns {string} Loading message
   */
  getLoadingMessage(type) {
    const messages = {
      explain: 'Analyzing your code...',
      debug: 'Scanning for bugs and issues...',
      document: 'Generating documentation...',
      refactor: 'Analyzing for improvements...',
      screenshot: 'Processing screenshot...'
    };

    return messages[type] || 'Processing...';
  }

  /**
   * Get user-friendly error message
   * @param {Error} error - Error object
   * @returns {string} User-friendly message
   */
  getUserFriendlyError(error) {
    const message = error.message?.toLowerCase() || '';
    
    if (message.includes('not available') || message.includes('not supported')) {
      return 'Chrome Built-in AI is not available. Please ensure you have Chrome Canary with AI features enabled.';
    }
    if (message.includes('quota') || message.includes('limit')) {
      return 'AI processing limit reached. Please try again in a few minutes.';
    }
    if (message.includes('timeout')) {
      return 'Request timed out. Please try with a shorter code snippet.';
    }
    if (message.includes('session') || message.includes('expired')) {
      return 'AI session expired. Starting a new session...';
    }
    
    return 'Something went wrong. Please try again.';
  }

  /**
   * Send message to tab
   * @param {number} tabId - Tab ID
   * @param {Object} message - Message to send
   */
  async sendToTab(tabId, message) {
    try {
      await chrome.tabs.sendMessage(tabId, message);
    } catch (error) {
      this.logger.error('Failed to send message to tab:', error);
    }
  }

  /**
   * Send error to tab
   * @param {number} tabId - Tab ID
   * @param {Error} error - Error to send
   */
  async sendErrorToTab(tabId, error) {
    await this.sendToTab(tabId, {
      action: 'showError',
      error: {
        type: error.name,
        message: error.message,
        userFriendly: this.getUserFriendlyError(error)
      }
    });
  }

  /**
   * Generate unique request ID
   * @returns {string} Request ID
   */
  generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Handle tab removal
   * @param {number} tabId - Removed tab ID
   */
  async handleTabRemoved(tabId) {
    // Clean up any active requests for this tab
    for (const [requestId, request] of this.activeRequests.entries()) {
      if (request.tabId === tabId) {
        this.activeRequests.delete(requestId);
      }
    }
  }

  /**
   * Handle tab updates
   * @param {number} tabId - Tab ID
   * @param {Object} changeInfo - Change information
   * @param {Object} tab - Tab object
   */
  async handleTabUpdated(tabId, changeInfo, tab) {
    // Clean up requests if page navigated
    if (changeInfo.status === 'loading' && changeInfo.url) {
      for (const [requestId, request] of this.activeRequests.entries()) {
        if (request.tabId === tabId) {
          this.activeRequests.delete(requestId);
        }
      }
    }
  }

  /**
   * Handle extension suspend
   */
  async handleSuspend() {
    this.logger.info('Extension suspending...');
    
    // Clean up resources
    await self.aiSessionManager.shutdown();
    this.activeRequests.clear();
  }

  /**
   * Track usage analytics
   * @param {string} event - Event name
   * @param {Object} data - Additional data
   */
  async trackUsage(event, data = {}) {
    try {
      const usage = {
        event,
        data,
        timestamp: Date.now(),
        version: chrome.runtime.getManifest().version
      };

      // Store in local storage
      const storageKey = 'devmentor_usage_stats';
      const result = await chrome.storage.local.get(storageKey);
      const stats = result[storageKey] || [];
      
      stats.unshift(usage);
      
      // Keep only last 1000 events
      const trimmedStats = stats.slice(0, 1000);
      
      await chrome.storage.local.set({ [storageKey]: trimmedStats });

    } catch (error) {
      this.logger.warn('Usage tracking failed:', error);
    }
  }

  /**
   * Show welcome notification
   */
  async showWelcomeNotification() {
    // Could show chrome notification or track welcome event
    await this.trackUsage('welcome', {
      installTime: Date.now()
    });
  }

  /**
   * Handle extension update
   * @param {string} previousVersion - Previous version
   */
  async handleUpdate(previousVersion) {
    await this.trackUsage('update', {
      previousVersion,
      currentVersion: chrome.runtime.getManifest().version
    });
  }

  /**
   * Track installation
   */
  async trackInstallation() {
    await this.trackUsage('install', {
      installTime: Date.now(),
      version: chrome.runtime.getManifest().version
    });
  }

  /**
   * Get AI status
   * @returns {Object} AI status information
   */
  async getAIStatus() {
    return await self.aiSessionManager.getMetrics();
  }

  /**
   * Get usage statistics
   * @returns {Object} Usage statistics
   */
  async getStats() {
    const storageKey = 'devmentor_usage_stats';
    const result = await chrome.storage.local.get(storageKey);
    const usage = result[storageKey] || [];
    
    const stats = {
      totalEvents: usage.length,
      byEvent: {},
      recent: usage.slice(0, 10),
      aiStatus: await this.getAIStatus()
    };

    // Group by event type
    usage.forEach(event => {
      stats.byEvent[event.event] = (stats.byEvent[event.event] || 0) + 1;
    });

    return stats;
  }

  /**
   * Clear user data
   */
  async clearUserData() {
    await chrome.storage.local.clear();
    await this.trackUsage('data_cleared');
  }
}

// Initialize service worker
const serviceWorker = new DevMentorServiceWorker();

