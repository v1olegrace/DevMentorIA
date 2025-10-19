/**
 * DevMentor AI - Service Worker with Hybrid Architecture
 *
 * CRITICAL ARCHITECTURE CHANGE:
 * ============================
 * This service worker now uses the HybridArchitecture module, which:
 *
 * 1. CORE (FREE): Chrome Built-in AI APIs
 *    - Prompt API for explanations/debugging/review
 *    - Summarization API for quick summaries
 *    - Write API for documentation
 *    - Rewrite API for refactoring
 *
 * 2. PREMIUM (PRO): Enhanced features
 *    - Gemini Pro for advanced analysis
 *    - Diagram Generator for visualizations
 *    - Quiz Generator for learning
 *
 * 3. ENTERPRISE: Full platform
 *    - Video Generator for lessons
 *    - Citation Engine for research
 *    - Collaboration features
 *    - Advanced analytics
 *
 * The architecture ensures:
 * - Chrome Built-in AI is ALWAYS used (hackathon requirement)
 * - Premium features ENHANCE but never REPLACE core
 * - Graceful degradation on all levels
 * - Clear monetization path
 *
 * @version 2.0.0
 * @hackathon Chrome Built-in AI Challenge 2024
 */

import { MessageHandler } from './modules/message-handler.js';
import { ContextMenuManager } from './modules/context-menu.js';
import { StorageManager } from './modules/storage.js';
import { HybridArchitecture } from './modules/hybrid-architecture.js';

// ============================================================================
// SERVICE WORKER CORE WITH HYBRID ARCHITECTURE
// ============================================================================

class ServiceWorkerCore {
  constructor() {
    // Core modules
    this.modules = new Map();

    // Hybrid AI architecture (Chrome Built-in + Premium)
    this.aiArchitecture = null;

    // State management
    this.isInitialized = false;
    this.activeRequests = new Map();
    this.cleanupInterval = null;

    // Statistics
    this.stats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageProcessingTime: 0
    };
  }

  /**
   * Initialize service worker with hybrid architecture
   * CRITICAL: This now initializes HybridArchitecture instead of ChromeAI
   */
  async initialize() {
    try {
      console.log('[ServiceWorker] Initializing with Hybrid Architecture...');

      // STEP 1: Initialize core modules (storage, messages, menus)
      await this._initializeCoreModules();

      // STEP 2: Initialize Hybrid AI Architecture (Chrome Built-in + Premium)
      await this._initializeAIArchitecture();

      // STEP 3: Set up handlers and cleanup
      await this._setupHandlers();

      this.isInitialized = true;
      console.log('[ServiceWorker] ✅ Hybrid architecture initialized successfully');

      // Log system status
      this._logSystemStatus();

      // Track initialization
      await this.trackEvent('service_worker_initialized', {
        architecture: 'hybrid',
        chromeBuiltInAI: true
      });

    } catch (error) {
      console.error('[ServiceWorker] ❌ Initialization failed:', error);
      await this.handleInitializationError(error);
      throw error;
    }
  }

  /**
   * Initialize core modules (non-AI)
   * @private
   */
  async _initializeCoreModules() {
    console.log('[ServiceWorker] Initializing core modules...');

    // Storage manager
    this.modules.set('storage', new StorageManager());

    // Message handler
    this.modules.set('messages', new MessageHandler());

    // Context menu manager
    this.modules.set('contextMenus', new ContextMenuManager());

    console.log('[ServiceWorker] ✅ Core modules initialized');
  }

  /**
   * Initialize Hybrid AI Architecture
   * This is the KEY change - we now use HybridArchitecture instead of ChromeAI
   * @private
   */
  async _initializeAIArchitecture() {
    try {
      console.log('[ServiceWorker] Initializing Hybrid AI Architecture...');
      console.log('[ServiceWorker] This will initialize:');
      console.log('[ServiceWorker]   - Chrome Built-in AI (CORE - always available)');
      console.log('[ServiceWorker]   - Premium features (OPTIONAL - based on user tier)');

      // Create hybrid architecture instance
      this.aiArchitecture = new HybridArchitecture();

      // Initialize (this will auto-detect Chrome Built-in AI availability)
      await this.aiArchitecture.initialize();

      // Store reference in modules for backward compatibility
      this.modules.set('aiArchitecture', this.aiArchitecture);

      // Get status for logging
      const status = this.aiArchitecture.getStatus();

      console.log('[ServiceWorker] ✅ Hybrid AI Architecture initialized');
      console.log('[ServiceWorker] User Tier:', status.tier);
      console.log('[ServiceWorker] Chrome Built-in AI:', status.core?.initialized ? '✅' : '❌');
      console.log('[ServiceWorker] Premium Features:', {
        geminiPro: status.premium.geminiPro ? '✅' : '❌',
        diagrams: status.premium.diagramGenerator ? '✅' : '❌',
        videos: status.premium.videoGenerator ? '✅' : '❌'
      });

    } catch (error) {
      console.error('[ServiceWorker] ❌ Hybrid AI initialization failed:', error);
      console.error('[ServiceWorker] This is CRITICAL - Chrome Built-in AI may not be available');
      throw new Error(`Hybrid AI initialization failed: ${error.message}`);
    }
  }

  /**
   * Setup all handlers
   * @private
   */
  async _setupHandlers() {
    // Context menus
    await this.setupContextMenus();

    // Message handlers
    this.setupMessageHandlers();

    // Command handlers (keyboard shortcuts)
    this.setupCommandHandlers();

    // Cleanup alarm
    await this.setupCleanupAlarm();

    // Periodic cleanup
    this.startPeriodicCleanup();
  }

  /**
   * Log system status for debugging
   * @private
   */
  _logSystemStatus() {
    if (!this.aiArchitecture) return;

    const status = this.aiArchitecture.getStatus();
    const capabilities = this.aiArchitecture.getCapabilities();

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  DevMentor AI - System Status');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('🎯 User Tier:', status.tier);
    console.log('');
    console.log('🤖 Chrome Built-in AI (CORE):');
    console.log('   Initialized:', status.core?.initialized ? '✅' : '❌');

    if (status.core?.availability) {
      console.log('   Prompt API:', status.core.availability.prompt ? '✅' : '❌');
      console.log('   Summarization API:', status.core.availability.summarization ? '✅' : '❌');
      console.log('   Write API:', status.core.availability.write ? '✅' : '❌');
      console.log('   Rewrite API:', status.core.availability.rewrite ? '✅' : '❌');
    }

    console.log('');
    console.log('💎 Premium Features:');
    console.log('   Gemini Pro:', status.premium.geminiPro ? '✅' : '❌');
    console.log('   Diagrams:', status.premium.diagramGenerator ? '✅' : '❌');
    console.log('   Quizzes:', status.premium.quizGenerator ? '✅' : '❌');
    console.log('   Videos:', status.premium.videoGenerator ? '✅' : '❌');
    console.log('   Citations:', status.premium.citationEngine ? '✅' : '❌');
    console.log('');
    console.log('📊 Usage:');
    console.log('   Today:', `${status.usage.explanationsToday}/${status.usage.limit === -1 ? '∞' : status.usage.limit}`);
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  }

  // ==========================================================================
  // CONTEXT MENUS
  // ==========================================================================

  async setupContextMenus() {
    const contextMenuManager = this.modules.get('contextMenus');

    try {
      // Clear existing menus
      await contextMenuManager.clearAll();

      // Create context menu items with proper documentUrlPatterns
      const menuItems = [
        {
          id: 'devmentor-explain',
          title: '🧠 Explain Code (Chrome AI)',
          contexts: ['selection'],
          documentUrlPatterns: [
            'https://github.com/*',
            'https://stackoverflow.com/*',
            'https://developer.mozilla.org/*',
            'https://gitlab.com/*',
            'https://bitbucket.org/*',
            'https://codepen.io/*',
            'https://jsfiddle.net/*',
            'https://codesandbox.io/*'
          ]
        },
        {
          id: 'devmentor-debug',
          title: '🐛 Debug Code (Chrome AI)',
          contexts: ['selection'],
          documentUrlPatterns: [
            'https://github.com/*',
            'https://stackoverflow.com/*',
            'https://developer.mozilla.org/*',
            'https://gitlab.com/*',
            'https://bitbucket.org/*',
            'https://codepen.io/*',
            'https://jsfiddle.net/*',
            'https://codesandbox.io/*'
          ]
        },
        {
          id: 'devmentor-document',
          title: '📝 Generate Documentation (Chrome AI)',
          contexts: ['selection'],
          documentUrlPatterns: [
            'https://github.com/*',
            'https://stackoverflow.com/*',
            'https://developer.mozilla.org/*',
            'https://gitlab.com/*',
            'https://bitbucket.org/*',
            'https://codepen.io/*',
            'https://jsfiddle.net/*',
            'https://codesandbox.io/*'
          ]
        },
        {
          id: 'devmentor-refactor',
          title: '🔧 Refactor Code (Chrome AI)',
          contexts: ['selection'],
          documentUrlPatterns: [
            'https://github.com/*',
            'https://stackoverflow.com/*',
            'https://developer.mozilla.org/*',
            'https://gitlab.com/*',
            'https://bitbucket.org/*',
            'https://codepen.io/*',
            'https://jsfiddle.net/*',
            'https://codesandbox.io/*'
          ]
        },
        {
          id: 'devmentor-separator',
          type: 'separator',
          contexts: ['selection'],
          documentUrlPatterns: [
            'https://github.com/*',
            'https://stackoverflow.com/*',
            'https://developer.mozilla.org/*',
            'https://gitlab.com/*',
            'https://bitbucket.org/*',
            'https://codepen.io/*',
            'https://jsfiddle.net/*',
            'https://codesandbox.io/*'
          ]
        },
        {
          id: 'devmentor-review',
          title: '👀 Code Review (Chrome AI)',
          contexts: ['selection'],
          documentUrlPatterns: [
            'https://github.com/*',
            'https://stackoverflow.com/*',
            'https://developer.mozilla.org/*',
            'https://gitlab.com/*',
            'https://bitbucket.org/*',
            'https://codepen.io/*',
            'https://jsfiddle.net/*',
            'https://codesandbox.io/*'
          ]
        }
      ];

      // Create menu items
      for (const item of menuItems) {
        await contextMenuManager.create(item);
      }

      console.log('[ServiceWorker] ✅ Context menus created successfully');

    } catch (error) {
      console.error('[ServiceWorker] ❌ Context menu setup failed:', error);
      throw error;
    }
  }

  // ==========================================================================
  // MESSAGE HANDLERS (Using Hybrid Architecture)
  // ==========================================================================

  setupMessageHandlers() {
    const messageHandler = this.modules.get('messages');

    // Explain code handler
    messageHandler.on('explain-code', async (request, sender, sendResponse) => {
      await this._handleCodeAnalysisMessage('explainCode', request, sender, sendResponse);
    });

    // Debug code handler
    messageHandler.on('debug-code', async (request, sender, sendResponse) => {
      await this._handleCodeAnalysisMessage('debugCode', request, sender, sendResponse);
    });

    // Document code handler
    messageHandler.on('document-code', async (request, sender, sendResponse) => {
      await this._handleCodeAnalysisMessage('generateDocumentation', request, sender, sendResponse);
    });

    // Refactor code handler
    messageHandler.on('refactor-code', async (request, sender, sendResponse) => {
      await this._handleCodeAnalysisMessage('refactorCode', request, sender, sendResponse);
    });

    // Review code handler
    messageHandler.on('review-code', async (request, sender, sendResponse) => {
      await this._handleCodeAnalysisMessage('reviewCode', request, sender, sendResponse);
    });

    // Premium feature: Generate video
    messageHandler.on('generate-video', async (request, sender, sendResponse) => {
      await this._handlePremiumFeature('generateVideoExplanation', request, sender, sendResponse);
    });

    // Premium feature: Generate diagram
    messageHandler.on('generate-diagram', async (request, sender, sendResponse) => {
      await this._handlePremiumFeature('generateDiagram', request, sender, sendResponse);
    });

    // Premium feature: Generate quiz
    messageHandler.on('generate-quiz', async (request, sender, sendResponse) => {
      await this._handlePremiumFeature('generateQuiz', request, sender, sendResponse);
    });

    // Get system status
    messageHandler.on('get-status', async (request, sender, sendResponse) => {
      try {
        const status = this.aiArchitecture ? this.aiArchitecture.getStatus() : null;
        sendResponse({ success: true, data: status });
      } catch (error) {
        sendResponse({ success: false, error: error.message });
      }
    });

    // Get capabilities
    messageHandler.on('get-capabilities', async (request, sender, sendResponse) => {
      try {
        const capabilities = this.aiArchitecture ? this.aiArchitecture.getCapabilities() : null;
        sendResponse({ success: true, data: capabilities });
      } catch (error) {
        sendResponse({ success: false, error: error.message });
      }
    });

    // Inject sidebar handler
    messageHandler.on('inject-sidebar', async (request, sender, sendResponse) => {
      try {
        await this.injectSidebar(sender.tab.id);
        await this.trackEvent('sidebar_injected', { tabId: sender.tab.id });
        sendResponse({ success: true });
      } catch (error) {
        console.error('[ServiceWorker] Sidebar injection failed:', error);
        await this.trackEvent('sidebar_injection_failed', { error: error.message });
        sendResponse({ success: false, error: error.message });
      }
    });

    // Keep alive handler
    messageHandler.on('keep-alive', async (request, sender, sendResponse) => {
      sendResponse({ success: true, timestamp: Date.now() });
    });
  }

  /**
   * Handle code analysis messages (core features)
   * @private
   */
  async _handleCodeAnalysisMessage(method, request, sender, sendResponse) {
    const requestId = this.generateRequestId();
    this.activeRequests.set(requestId, { startTime: Date.now(), method });

    try {
      console.log(`[ServiceWorker] Processing ${method} request...`);

      // Call hybrid architecture method
      const result = await this.aiArchitecture[method](request.code, request.context || {});

      const processingTime = Date.now() - this.activeRequests.get(requestId).startTime;

      // Track success
      await this.trackEvent(`${method}_success`, {
        codeLength: request.code.length,
        processingTime: processingTime,
        tier: result.tier,
        usedCore: !!result.core,
        usedPremium: !!result.enhanced
      });

      // Update stats
      this.stats.totalRequests++;
      this.stats.successfulRequests++;
      this._updateAverageProcessingTime(processingTime);

      console.log(`[ServiceWorker] ✅ ${method} completed in ${processingTime}ms`);

      sendResponse({ success: true, data: result });

    } catch (error) {
      console.error(`[ServiceWorker] ${method} failed:`, error);

      // Track failure
      await this.trackEvent(`${method}_failed`, { error: error.message });

      // Update stats
      this.stats.totalRequests++;
      this.stats.failedRequests++;

      sendResponse({ success: false, error: error.message });

    } finally {
      this.activeRequests.delete(requestId);
    }
  }

  /**
   * Handle premium feature messages
   * @private
   */
  async _handlePremiumFeature(method, request, sender, sendResponse) {
    const requestId = this.generateRequestId();
    this.activeRequests.set(requestId, { startTime: Date.now(), method, premium: true });

    try {
      console.log(`[ServiceWorker] Processing premium feature: ${method}...`);

      // Call hybrid architecture method
      const result = await this.aiArchitecture[method](request.code, request.options || {});

      const processingTime = Date.now() - this.activeRequests.get(requestId).startTime;

      // Track success
      await this.trackEvent(`${method}_success`, {
        processingTime: processingTime,
        tier: result.tier
      });

      console.log(`[ServiceWorker] ✅ ${method} completed in ${processingTime}ms`);

      sendResponse({ success: true, data: result });

    } catch (error) {
      console.error(`[ServiceWorker] ${method} failed:`, error);

      // Track failure
      await this.trackEvent(`${method}_failed`, { error: error.message });

      // Check if it's a permission error
      if (error.message.includes('requires')) {
        sendResponse({
          success: false,
          error: error.message,
          requiresUpgrade: true
        });
      } else {
        sendResponse({ success: false, error: error.message });
      }

    } finally {
      this.activeRequests.delete(requestId);
    }
  }

  // ==========================================================================
  // COMMAND HANDLERS (Keyboard Shortcuts)
  // ==========================================================================

  setupCommandHandlers() {
    chrome.commands.onCommand.addListener(async (command, tab) => {
      try {
        console.log(`[ServiceWorker] Command received: ${command}`);

        // Inject content script if needed
        await this.injectContentScriptIfNeeded(tab.id);

        // Get selected text
        const [result] = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => window.getSelection().toString().trim()
        });

        const selectedText = result?.result || '';

        if (!selectedText) {
          console.warn('[ServiceWorker] No text selected for command');
          return;
        }

        // Map command to method
        const methodMap = {
          'explain-code': 'explainCode',
          'debug-code': 'debugCode',
          'document-code': 'generateDocumentation',
          'refactor-code': 'refactorCode'
        };

        const method = methodMap[command];
        if (!method) {
          console.warn(`[ServiceWorker] Unknown command: ${command}`);
          return;
        }

        // Execute analysis
        await this.handleCodeAnalysis(method, { selectionText: selectedText }, tab);

        await this.trackEvent('command_executed', { command, hasSelection: true });

      } catch (error) {
        console.error(`[ServiceWorker] Command ${command} failed:`, error);
        await this.trackEvent('command_failed', { command, error: error.message });
      }
    });
  }

  /**
   * Handle code analysis from keyboard shortcut
   */
  async handleCodeAnalysis(method, data, tab) {
    try {
      console.log(`[ServiceWorker] Executing ${method} from keyboard shortcut...`);

      // Call hybrid architecture
      const result = await this.aiArchitecture[method](data.selectionText, {
        url: tab.url,
        triggeredBy: 'keyboard-shortcut'
      });

      // Send result to content script
      await chrome.tabs.sendMessage(tab.id, {
        action: 'show-analysis-result',
        method: method,
        result: result,
        code: data.selectionText
      });

      console.log(`[ServiceWorker] ✅ ${method} result sent to content script`);

    } catch (error) {
      console.error(`[ServiceWorker] Code analysis (${method}) failed:`, error);

      // Send error to content script
      await chrome.tabs.sendMessage(tab.id, {
        action: 'show-analysis-error',
        method: method,
        error: error.message
      });
    }
  }

  // ==========================================================================
  // UTILITY METHODS
  // ==========================================================================

  async injectContentScriptIfNeeded(tabId) {
    try {
      // Check if content script is already injected
      const isInjected = await this.isContentScriptInjected(tabId);

      if (!isInjected) {
        console.log('[ServiceWorker] Injecting content script dynamically');

        await chrome.scripting.executeScript({
          target: { tabId: tabId },
          files: ['content/content-script.js']
        });

        console.log('[ServiceWorker] ✅ Content script injected successfully');
      }

    } catch (error) {
      console.error('[ServiceWorker] ❌ Failed to inject content script:', error);
      throw error;
    }
  }

  async isContentScriptInjected(tabId) {
    try {
      const [result] = await chrome.scripting.executeScript({
        target: { tabId: tabId },
        func: () => {
          return window.__DEVMENTOR_CONTENT_SCRIPT_INJECTED__ || false;
        }
      });

      return result?.result || false;
    } catch (error) {
      // If we can't check, assume not injected
      return false;
    }
  }

  async injectSidebar(tabId) {
    try {
      // Programmatic injection - more controlled than declarative
      await chrome.scripting.executeScript({
        target: { tabId },
        files: ['content/components/sidebar-injector.js']
      });

      await chrome.scripting.insertCSS({
        target: { tabId },
        files: ['assets/styles/sidebar.css']
      });

      console.log('[ServiceWorker] ✅ Sidebar injected successfully');
    } catch (error) {
      console.warn('[ServiceWorker] ⚠️ Sidebar injection failed:', error);
      throw new Error(`Cannot inject sidebar on this page: ${error.message}`);
    }
  }

  async setupCleanupAlarm() {
    try {
      // Clean up old data periodically
      await chrome.alarms.create('storage-cleanup', { periodInMinutes: 60 });
      console.log('[ServiceWorker] ✅ Cleanup alarm created');
    } catch (error) {
      console.error('[ServiceWorker] ❌ Failed to create cleanup alarm:', error);
    }
  }

  startPeriodicCleanup() {
    this.cleanupInterval = setInterval(() => {
      this.performCleanup();
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  async performCleanup() {
    try {
      const storage = this.modules.get('storage');
      await storage.cleanupOldData();

      // Clean up old active requests
      const now = Date.now();
      for (const [requestId, request] of this.activeRequests) {
        if (now - request.startTime > 300000) { // 5 minutes
          this.activeRequests.delete(requestId);
        }
      }

      console.log('[ServiceWorker] ✅ Periodic cleanup completed');
    } catch (error) {
      console.error('[ServiceWorker] ❌ Cleanup failed:', error);
    }
  }

  async handleInitializationError(error) {
    try {
      await this.trackEvent('initialization_error', {
        error: error.message,
        stack: error.stack
      });
    } catch (trackingError) {
      console.error('[ServiceWorker] Failed to track initialization error:', trackingError);
    }
  }

  async trackEvent(eventName, data = {}) {
    try {
      const storage = this.modules.get('storage');
      await storage.trackEvent(eventName, data);
    } catch (error) {
      console.error('[ServiceWorker] Failed to track event:', error);
    }
  }

  generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  _updateAverageProcessingTime(processingTime) {
    const total = this.stats.averageProcessingTime * (this.stats.successfulRequests - 1) + processingTime;
    this.stats.averageProcessingTime = Math.round(total / this.stats.successfulRequests);
  }

  // Cleanup on service worker shutdown
  async destroy() {
    try {
      if (this.cleanupInterval) {
        clearInterval(this.cleanupInterval);
      }

      if (this.aiArchitecture) {
        await this.aiArchitecture.destroy();
      }

      this.activeRequests.clear();
      this.modules.clear();

      console.log('[ServiceWorker] ✅ Service worker destroyed');
    } catch (error) {
      console.error('[ServiceWorker] ❌ Destroy failed:', error);
    }
  }
}

// ============================================================================
// GLOBAL INSTANCE & EVENT LISTENERS
// ============================================================================

// Global instance
const swCore = new ServiceWorkerCore();

// Initialize when service worker starts
swCore.initialize().catch(error => {
  console.error('[ServiceWorker] CRITICAL: Initialization failed:', error);
  console.error('[ServiceWorker] Extension may not function correctly');
});

// Context menu click handler
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  try {
    console.log(`[ServiceWorker] Context menu clicked: ${info.menuItemId}`);

    if (info.menuItemId.startsWith('devmentor-')) {
      const action = info.menuItemId.replace('devmentor-', '');

      // Map action to method
      const methodMap = {
        'explain': 'explainCode',
        'debug': 'debugCode',
        'document': 'generateDocumentation',
        'refactor': 'refactorCode',
        'review': 'reviewCode'
      };

      const method = methodMap[action];
      if (!method) {
        console.warn(`[ServiceWorker] Unknown action: ${action}`);
        return;
      }

      await swCore.injectContentScriptIfNeeded(tab.id);

      // Execute analysis
      await swCore.handleCodeAnalysis(method, { selectionText: info.selectionText }, tab);

      await swCore.trackEvent('context_menu_used', {
        action,
        hasSelection: !!info.selectionText
      });
    }
  } catch (error) {
    console.error('[ServiceWorker] Context menu handler failed:', error);
  }
});

// Handle alarms for cleanup
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'storage-cleanup') {
    await swCore.performCleanup();
  }
});

// Keep service worker alive during critical operations
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'keep-alive') {
    // Return a promise to keep the service worker alive
    sendResponse({ success: true, timestamp: Date.now() });
    return true;
  }
});

// Handle service worker shutdown
chrome.runtime.onSuspend.addListener(() => {
  swCore.destroy();
});

// Extension installed/updated
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('[ServiceWorker] Extension installed/updated:', details.reason);

  if (details.reason === 'install') {
    console.log('[ServiceWorker] First time installation');
    console.log('[ServiceWorker] Welcome to DevMentor AI with Chrome Built-in AI!');
  } else if (details.reason === 'update') {
    console.log('[ServiceWorker] Extension updated to new version');
    console.log('[ServiceWorker] Now using Hybrid Architecture (Chrome Built-in AI + Premium)');
  }
});

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('  DevMentor AI - Hybrid Service Worker');
console.log('  Version: 2.0.0 (Hackathon Edition)');
console.log('  Chrome Built-in AI: ✅ ENABLED');
console.log('  Premium Features: ✅ AVAILABLE');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
