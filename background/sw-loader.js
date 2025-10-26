/**
 * DevMentor AI - Service Worker Loader (Enterprise Architecture)
 * Modular service worker with proper error handling and cleanup
 */

import { MessageHandler } from './modules/message-handler.js';
import { ContextMenuManager } from './modules/context-menu.js';
import { StorageManager } from './modules/storage.js';
import { ChromeAI } from './modules/chrome-ai.js';

class ServiceWorkerCore {
  constructor() {
    this.modules = new Map();
    this.isInitialized = false;
    this.activeRequests = new Map();
    this.cleanupInterval = null;
  }

  async initialize() {
    try {
      console.log('[ServiceWorker] Initializing enterprise architecture...');
      
      // Initialize core modules with dependency injection
      this.modules.set('storage', new StorageManager());
      this.modules.set('messages', new MessageHandler());
      this.modules.set('contextMenus', new ContextMenuManager());
      this.modules.set('chromeAI', new ChromeAI());
      
      // Set up context menus with proper error handling
      await this.setupContextMenus();
      
      // Set up message handlers with timeout protection
      this.setupMessageHandlers();
      
      // Set up command handlers
      this.setupCommandHandlers();
      
      // Set up cleanup alarm for memory management
      await this.setupCleanupAlarm();
      
      // Set up periodic cleanup
      this.startPeriodicCleanup();
      
      this.isInitialized = true;
      console.log('[ServiceWorker] ✅ Enterprise architecture initialized successfully');
      
      // Track initialization
      await this.trackEvent('service_worker_initialized');
      
    } catch (error) {
      console.error('[ServiceWorker] ❌ Initialization failed:', error);
      await this.handleInitializationError(error);
      throw error;
    }
  }

  async setupContextMenus() {
    const contextMenuManager = this.modules.get('contextMenus');
    
    try {
      // Clear existing menus
      await contextMenuManager.clearAll();
      
      // Create context menu items with proper documentUrlPatterns
      const menuItems = [
        {
          id: 'devmentor-explain',
          title: 'Explain Code',
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
          title: 'Debug Code',
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
          title: 'Generate Documentation',
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
          title: 'Refactor Code',
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

  setupMessageHandlers() {
    const messageHandler = this.modules.get('messages');
    
    // Explain code handler with timeout protection
    messageHandler.on('explain-code', async (request, sender, sendResponse) => {
      const requestId = this.generateRequestId();
      this.activeRequests.set(requestId, { startTime: Date.now() });
      
      try {
        const chromeAI = this.modules.get('chromeAI');
        const result = await chromeAI.explainCode(request.code, request.context);
        
        await this.trackEvent('code_explained', { 
          codeLength: request.code.length,
          processingTime: Date.now() - this.activeRequests.get(requestId).startTime
        });
        
        sendResponse({ success: true, data: result });
      } catch (error) {
        console.error('[ServiceWorker] Explain code failed:', error);
        await this.trackEvent('code_explain_failed', { error: error.message });
        sendResponse({ success: false, error: error.message });
      } finally {
        this.activeRequests.delete(requestId);
      }
    });

    // Debug code handler
    messageHandler.on('debug-code', async (request, sender, sendResponse) => {
      const requestId = this.generateRequestId();
      this.activeRequests.set(requestId, { startTime: Date.now() });
      
      try {
        const chromeAI = this.modules.get('chromeAI');
        const result = await chromeAI.debugCode(request.code, request.context);
        
        await this.trackEvent('code_debugged', { 
          codeLength: request.code.length,
          processingTime: Date.now() - this.activeRequests.get(requestId).startTime
        });
        
        sendResponse({ success: true, data: result });
      } catch (error) {
        console.error('[ServiceWorker] Debug code failed:', error);
        await this.trackEvent('code_debug_failed', { error: error.message });
        sendResponse({ success: false, error: error.message });
      } finally {
        this.activeRequests.delete(requestId);
      }
    });

    // Document code handler
    messageHandler.on('document-code', async (request, sender, sendResponse) => {
      const requestId = this.generateRequestId();
      this.activeRequests.set(requestId, { startTime: Date.now() });
      
      try {
        const chromeAI = this.modules.get('chromeAI');
        const result = await chromeAI.generateDocumentation(request.code, request.context);
        
        await this.trackEvent('documentation_generated', { 
          codeLength: request.code.length,
          processingTime: Date.now() - this.activeRequests.get(requestId).startTime
        });
        
        sendResponse({ success: true, data: result });
      } catch (error) {
        console.error('[ServiceWorker] Document code failed:', error);
        await this.trackEvent('documentation_failed', { error: error.message });
        sendResponse({ success: false, error: error.message });
      } finally {
        this.activeRequests.delete(requestId);
      }
    });

    // Refactor code handler
    messageHandler.on('refactor-code', async (request, sender, sendResponse) => {
      const requestId = this.generateRequestId();
      this.activeRequests.set(requestId, { startTime: Date.now() });
      
      try {
        const chromeAI = this.modules.get('chromeAI');
        const result = await chromeAI.refactorCode(request.code, request.context);
        
        await this.trackEvent('code_refactored', { 
          codeLength: request.code.length,
          processingTime: Date.now() - this.activeRequests.get(requestId).startTime
        });
        
        sendResponse({ success: true, data: result });
      } catch (error) {
        console.error('[ServiceWorker] Refactor code failed:', error);
        await this.trackEvent('refactor_failed', { error: error.message });
        sendResponse({ success: false, error: error.message });
      } finally {
        this.activeRequests.delete(requestId);
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

        // Handle different commands
        switch (command) {
          case 'explain-code':
            await this.handleCodeAnalysis('explain', { selectionText: selectedText }, tab);
            break;
          case 'debug-code':
            await this.handleCodeAnalysis('debug', { selectionText: selectedText }, tab);
            break;
          case 'document-code':
            await this.handleCodeAnalysis('document', { selectionText: selectedText }, tab);
            break;
          case 'refactor-code':
            await this.handleCodeAnalysis('refactor', { selectionText: selectedText }, tab);
            break;
          default:
            console.warn(`[ServiceWorker] Unknown command: ${command}`);
        }
        
        await this.trackEvent('command_executed', { command, hasSelection: !!selectedText });
        
      } catch (error) {
        console.error(`[ServiceWorker] Command ${command} failed:`, error);
        await this.trackEvent('command_failed', { command, error: error.message });
      }
    });
  }

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

  async handleCodeAnalysis(type, data, tab) {
    try {
      const chromeAI = this.modules.get('chromeAI');
      let result;
      
      switch (type) {
        case 'explain':
          result = await chromeAI.explainCode(data.selectionText, { url: tab.url });
          break;
        case 'debug':
          result = await chromeAI.debugCode(data.selectionText, { url: tab.url });
          break;
        case 'document':
          result = await chromeAI.generateDocumentation(data.selectionText, { url: tab.url });
          break;
        case 'refactor':
          result = await chromeAI.refactorCode(data.selectionText, { url: tab.url });
          break;
        default:
          throw new Error(`Unknown analysis type: ${type}`);
      }
      
      // Send result to content script
      await chrome.tabs.sendMessage(tab.id, {
        action: 'show-analysis-result',
        type: type,
        result: result,
        code: data.selectionText
      });
      
    } catch (error) {
      console.error(`[ServiceWorker] Code analysis (${type}) failed:`, error);
      
      // Send error to content script
      await chrome.tabs.sendMessage(tab.id, {
        action: 'show-analysis-error',
        type: type,
        error: error.message
      });
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

  // Cleanup on service worker shutdown
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    
    this.activeRequests.clear();
    this.modules.clear();
    
    console.log('[ServiceWorker] ✅ Service worker destroyed');
  }
}

// Global instance
const swCore = new ServiceWorkerCore();

// Initialize when service worker starts
swCore.initialize().catch(console.error);

// Context menu click handler
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  try {
    console.log(`[ServiceWorker] Context menu clicked: ${info.menuItemId}`);
    
    if (info.menuItemId.startsWith('devmentor-')) {
      const action = info.menuItemId.replace('devmentor-', '');
      
      await swCore.injectContentScriptIfNeeded(tab.id);
      
      await chrome.tabs.sendMessage(tab.id, {
        action: `${action}-selection`,
        code: info.selectionText,
        context: { url: tab.url }
      });
      
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
    return true;
  }
});

// Handle service worker shutdown
chrome.runtime.onSuspend.addListener(() => {
  swCore.destroy();
});

console.log('[ServiceWorker] ✅ Enterprise service worker loaded');







