/**
 * DevMentor AI - Service Worker (ES6 Module Compatible)
 * Handles context menus, message passing, and AI coordination
 * Optimized for service worker lifecycle management
 */

// Import ES6 modules (compatible with "type": "module")
import { MessageHandler } from './modules/message-handler.js';
import { ContextMenuManager } from './modules/context-menu.js';
import { StorageManager } from './modules/storage.js';
import { ChromeAI } from './modules/chrome-ai.js';

class DevMentorServiceWorker {
  constructor() {
    // Service worker lifecycle state
    this.isInitialized = false;
    this.isShuttingDown = false;
    
    // Modules (will be initialized)
    this.modules = null;
    
    // Ephemeral state (will be lost on termination)
    this.activeRequests = new Map();
    this.cleanupTasks = new Set();
    
    // Persistent state (stored in chrome.storage)
    this.persistentState = {
      contextMenusCreated: false,
      lastCleanup: 0,
      sessionId: null
    };
  }

  async initialize() {
    if (this.isInitialized) {
      return;
    }

    try {
      console.log('[ServiceWorker] Initializing with ES6 modules...');
      
      // Load persistent state
      await this.loadPersistentState();
      
      // Initialize modules
      this.modules = {
        storage: new StorageManager(),
        messages: new MessageHandler(),
        contextMenus: new ContextMenuManager(),
        chromeAI: new ChromeAI()
      };
      
      // Initialize modules
      await this.modules.storage.initialize();
      await this.modules.chromeAI.initialize();
      
      // Set up event handlers
      await this.setupEventHandlers();
      
      // Set up context menus (only if not already created)
      if (!this.persistentState.contextMenusCreated) {
        await this.setupContextMenus();
        this.persistentState.contextMenusCreated = true;
        await this.savePersistentState();
      }
      
      // Set up cleanup alarm
      await this.setupCleanupAlarm();
      
      this.isInitialized = true;
      console.log('[ServiceWorker] ✅ Initialized successfully');
      
      // Track initialization
      await this.trackEvent('service_worker_initialized');
      
    } catch (error) {
      console.error('[ServiceWorker] ❌ Initialization failed:', error);
      await this.handleInitializationError(error);
      throw error;
    }
  }

  async loadPersistentState() {
    try {
      const result = await chrome.storage.local.get(['persistentState']);
      if (result.persistentState) {
        this.persistentState = { ...this.persistentState, ...result.persistentState };
      }
      
      // Generate session ID if not exists
      if (!this.persistentState.sessionId) {
        this.persistentState.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await this.savePersistentState();
      }
    } catch (error) {
      console.error('[ServiceWorker] Failed to load persistent state:', error);
    }
  }

  async savePersistentState() {
    try {
      await chrome.storage.local.set({ persistentState: this.persistentState });
    } catch (error) {
      console.error('[ServiceWorker] Failed to save persistent state:', error);
    }
  }

  async setupEventHandlers() {
    // Message handlers
    this.modules.messages.on('explain-code', this.handleExplainCode.bind(this));
    this.modules.messages.on('debug-code', this.handleDebugCode.bind(this));
    this.modules.messages.on('document-code', this.handleDocumentCode.bind(this));
    this.modules.messages.on('refactor-code', this.handleRefactorCode.bind(this));
    this.modules.messages.on('inject-sidebar', this.handleInjectSidebar.bind(this));
    this.modules.messages.on('keep-alive', this.handleKeepAlive.bind(this));
    
    // Command handlers
    chrome.commands.onCommand.addListener(this.handleCommand.bind(this));
    
    // Context menu handlers
    chrome.contextMenus.onClicked.addListener(this.handleContextMenuClick.bind(this));
    
    // Alarm handlers
    chrome.alarms.onAlarm.addListener(this.handleAlarm.bind(this));
    
    // Runtime handlers
    chrome.runtime.onMessage.addListener(this.handleRuntimeMessage.bind(this));
    chrome.runtime.onSuspend.addListener(this.handleSuspend.bind(this));
  }

  async setupContextMenus() {
    try {
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
        await this.modules.contextMenus.create(item);
      }
      
      console.log('[ServiceWorker] ✅ Context menus created');
      
    } catch (error) {
      console.error('[ServiceWorker] ❌ Context menu setup failed:', error);
      throw error;
    }
  }

  async setupCleanupAlarm() {
    try {
      await chrome.alarms.create('storage-cleanup', { periodInMinutes: 60 });
      console.log('[ServiceWorker] ✅ Cleanup alarm created');
    } catch (error) {
      console.error('[ServiceWorker] ❌ Failed to create cleanup alarm:', error);
    }
  }

  // Message handlers
  async handleExplainCode(request, sender, sendResponse) {
    const requestId = this.generateRequestId();
    this.activeRequests.set(requestId, { startTime: Date.now(), type: 'explain' });
    
    try {
      const result = await this.modules.chromeAI.explainCode(request.code, request.context);
      
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
  }

  async handleDebugCode(request, sender, sendResponse) {
    const requestId = this.generateRequestId();
    this.activeRequests.set(requestId, { startTime: Date.now(), type: 'debug' });
    
    try {
      const result = await this.modules.chromeAI.debugCode(request.code, request.context);
      
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
  }

  async handleDocumentCode(request, sender, sendResponse) {
    const requestId = this.generateRequestId();
    this.activeRequests.set(requestId, { startTime: Date.now(), type: 'document' });
    
    try {
      const result = await this.modules.chromeAI.generateDocumentation(request.code, request.context);
      
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
  }

  async handleRefactorCode(request, sender, sendResponse) {
    const requestId = this.generateRequestId();
    this.activeRequests.set(requestId, { startTime: Date.now(), type: 'refactor' });
    
    try {
      const result = await this.modules.chromeAI.refactorCode(request.code, request.context);
      
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
  }

  async handleInjectSidebar(request, sender, sendResponse) {
    try {
      await this.injectSidebar(sender.tab.id);
      await this.trackEvent('sidebar_injected', { tabId: sender.tab.id });
      sendResponse({ success: true });
    } catch (error) {
      console.error('[ServiceWorker] Sidebar injection failed:', error);
      await this.trackEvent('sidebar_injection_failed', { error: error.message });
      sendResponse({ success: false, error: error.message });
    }
  }

  async handleKeepAlive(request, sender, sendResponse) {
    sendResponse({ success: true, timestamp: Date.now() });
  }

  // Command handler
  async handleCommand(command, tab) {
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
  }

  // Context menu handler
  async handleContextMenuClick(info, tab) {
    try {
      console.log(`[ServiceWorker] Context menu clicked: ${info.menuItemId}`);
      
      if (info.menuItemId.startsWith('devmentor-')) {
        const action = info.menuItemId.replace('devmentor-', '');
        
        await this.injectContentScriptIfNeeded(tab.id);
        
        await chrome.tabs.sendMessage(tab.id, {
          action: `${action}-selection`,
          code: info.selectionText,
          context: { url: tab.url }
        });
        
        await this.trackEvent('context_menu_used', { 
          action, 
          hasSelection: !!info.selectionText 
        });
      }
    } catch (error) {
      console.error('[ServiceWorker] Context menu handler failed:', error);
    }
  }

  // Alarm handler
  async handleAlarm(alarm) {
    if (alarm.name === 'storage-cleanup') {
      await this.performCleanup();
    }
  }

  // Runtime message handler
  async handleRuntimeMessage(message, sender, sendResponse) {
    if (message.action === 'keep-alive') {
      // Return a promise to keep the service worker alive
      return true;
    }
    
    // Delegate to message handler
    if (this.modules?.messages) {
      return this.modules.messages.handleMessage(message, sender, sendResponse);
    }
    
    return false;
  }

  // Suspend handler (service worker termination)
  async handleSuspend() {
    console.log('[ServiceWorker] Service worker suspending...');
    this.isShuttingDown = true;
    await this.performCleanup();
    this.destroy();
  }

  // Utility methods
  async injectContentScriptIfNeeded(tabId) {
    try {
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
      return false;
    }
  }

  async injectSidebar(tabId) {
    try {
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

  async handleCodeAnalysis(type, data, tab) {
    try {
      let result;
      
      switch (type) {
        case 'explain':
          result = await this.modules.chromeAI.explainCode(data.selectionText, { url: tab.url });
          break;
        case 'debug':
          result = await this.modules.chromeAI.debugCode(data.selectionText, { url: tab.url });
          break;
        case 'document':
          result = await this.modules.chromeAI.generateDocumentation(data.selectionText, { url: tab.url });
          break;
        case 'refactor':
          result = await this.modules.chromeAI.refactorCode(data.selectionText, { url: tab.url });
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

  async performCleanup() {
    try {
      // Clean up old active requests
      const now = Date.now();
      for (const [requestId, request] of this.activeRequests) {
        if (now - request.startTime > 300000) { // 5 minutes
          this.activeRequests.delete(requestId);
        }
      }
      
      // Clean up storage
      if (this.modules?.storage) {
        await this.modules.storage.cleanupOldData();
      }
      
      // Update last cleanup time
      this.persistentState.lastCleanup = now;
      await this.savePersistentState();
      
      console.log('[ServiceWorker] ✅ Cleanup completed');
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
      if (this.modules?.storage) {
        await this.modules.storage.trackEvent(eventName, data);
      }
    } catch (error) {
      console.error('[ServiceWorker] Failed to track event:', error);
    }
  }

  generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Cleanup method for service worker shutdown
  destroy() {
    // Clean up ephemeral state
    this.activeRequests.clear();
    this.cleanupTasks.clear();
    
    // Clean up modules
    if (this.modules) {
      for (const [name, module] of Object.entries(this.modules)) {
        if (module.destroy) {
          module.destroy();
        }
      }
      this.modules = null;
    }
    
    this.isInitialized = false;
    this.isShuttingDown = true;
    
    console.log('[ServiceWorker] ✅ Service worker destroyed');
  }
}

// Global instance
const swCore = new DevMentorServiceWorker();

// Initialize when service worker starts
swCore.initialize().catch(console.error);

console.log('[ServiceWorker] ✅ ES6 Module service worker loaded');