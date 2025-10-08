/**
 * DevMentor AI - Service Worker (ES6 Modules - Official Chrome Pattern)
 * Follows official Chrome Extensions documentation for Manifest V3
 * Uses persistent storage and proper lifecycle management
 */

// ES6 Module imports (compatible with "type": "module")
import { AISessionManager } from './modules/ai-session-manager.js';
import { ContextMenuManager } from './modules/context-menu.js';
import { StorageManager } from './modules/storage.js';
import { ChromeAI } from './modules/chrome-ai.js';

// Global state (ephemeral - will be lost on termination)
let isInitialized = false;
let activeRequests = new Map();
let chromeAIInstance = null;
const REQUEST_TIMEOUT = 30000; // 30 seconds

// Persistent state keys
const STORAGE_KEYS = {
  CONTEXT_MENUS_CREATED: 'contextMenusCreated',
  LAST_CLEANUP: 'lastCleanup',
  SESSION_ID: 'sessionId',
  AI_SESSIONS: 'aiSessions'
};

// --- TOP-LEVEL EVENT LISTENER REGISTRATION ---
// These MUST be registered synchronously at the top level

chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('[ServiceWorker] Extension installed/updated:', details.reason);
  
  try {
    // Initialize only once on install/update
    if (details.reason === 'install' || details.reason === 'update') {
      await initializeExtension();
    }
  } catch (error) {
    console.error('[ServiceWorker] Installation failed:', error);
  }
});

chrome.runtime.onStartup.addListener(async () => {
  console.log('[ServiceWorker] Browser startup');
  await initializeExtension();
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  try {
    await handleContextMenuClick(info, tab);
  } catch (error) {
    console.error('[ServiceWorker] Context menu click failed:', error);
  }
});

chrome.commands.onCommand.addListener(async (command, tab) => {
  try {
    await handleCommand(command, tab);
  } catch (error) {
    console.error('[ServiceWorker] Command failed:', error);
  }
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  try {
    await handleAlarm(alarm);
  } catch (error) {
    console.error('[ServiceWorker] Alarm failed:', error);
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Return true to keep message channel open for async response
  handleMessage(message, sender, sendResponse);
  return true;
});

// --- INITIALIZATION ---
async function initializeExtension() {
  if (isInitialized) {
    return;
  }

  try {
    console.log('[ServiceWorker] Initializing extension...');
    
    // Initialize storage manager
    const storageManager = new StorageManager();
    await storageManager.initialize();
    
    // Initialize AI session manager
    const aiSessionManager = new AISessionManager();
    await aiSessionManager.initialize();
    
    // Initialize Chrome AI
    chromeAIInstance = new ChromeAI();
    await chromeAIInstance.initialize();
    
    // Initialize context menu manager
    const contextMenuManager = new ContextMenuManager();
    
    // Check if context menus already exist
    const contextMenusCreated = await storageManager.getData(STORAGE_KEYS.CONTEXT_MENUS_CREATED);
    
    if (!contextMenusCreated) {
      await setupContextMenus(contextMenuManager);
      await storageManager.setData(STORAGE_KEYS.CONTEXT_MENUS_CREATED, true);
    }
    
    // Set up cleanup alarm (replaces setInterval)
    await setupCleanupAlarm();
    
    isInitialized = true;
    console.log('[ServiceWorker] ✅ Extension initialized successfully');
    
    // Track initialization
    await trackEvent('extension_initialized', { reason: 'startup' });
    
  } catch (error) {
    console.error('[ServiceWorker] ❌ Initialization failed:', error);
    await trackEvent('initialization_error', { error: error.message });
    throw error;
  }
}

// --- CONTEXT MENU SETUP ---
async function setupContextMenus(contextMenuManager) {
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
    
    console.log('[ServiceWorker] ✅ Context menus created');
    
  } catch (error) {
    console.error('[ServiceWorker] ❌ Context menu setup failed:', error);
    throw error;
  }
}

// --- ALARM SETUP (replaces setInterval) ---
async function setupCleanupAlarm() {
  try {
    await chrome.alarms.create('storage-cleanup', { periodInMinutes: 60 });
    console.log('[ServiceWorker] ✅ Cleanup alarm created');
  } catch (error) {
    console.error('[ServiceWorker] ❌ Failed to create cleanup alarm:', error);
  }
}

// --- EVENT HANDLERS ---
async function handleContextMenuClick(info, tab) {
  if (!info.menuItemId.startsWith('devmentor-')) {
    return;
  }

  try {
    const action = info.menuItemId.replace('devmentor-', '');
    
    // Inject content script if needed
    await injectContentScriptIfNeeded(tab.id);
    
    // Send message to content script
    await chrome.tabs.sendMessage(tab.id, {
      action: `${action}-selection`,
      code: info.selectionText,
      context: { url: tab.url }
    });
    
    await trackEvent('context_menu_used', { 
      action, 
      hasSelection: !!info.selectionText 
    });
    
  } catch (error) {
    console.error('[ServiceWorker] Context menu handler failed:', error);
  }
}

async function handleCommand(command, tab) {
  try {
    console.log(`[ServiceWorker] Command received: ${command}`);
    
    // Inject content script if needed
    await injectContentScriptIfNeeded(tab.id);
    
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
        await handleCodeAnalysis('explain', { selectionText: selectedText }, tab);
        break;
      case 'debug-code':
        await handleCodeAnalysis('debug', { selectionText: selectedText }, tab);
        break;
      case 'document-code':
        await handleCodeAnalysis('document', { selectionText: selectedText }, tab);
        break;
      case 'refactor-code':
        await handleCodeAnalysis('refactor', { selectionText: selectedText }, tab);
        break;
      default:
        console.warn(`[ServiceWorker] Unknown command: ${command}`);
    }
    
    await trackEvent('command_executed', { command, hasSelection: !!selectedText });
    
  } catch (error) {
    console.error(`[ServiceWorker] Command ${command} failed:`, error);
    await trackEvent('command_failed', { command, error: error.message });
  }
}

async function handleAlarm(alarm) {
  if (alarm.name === 'storage-cleanup') {
    await performCleanup();
  }
}

async function handleMessage(message, sender, sendResponse) {
  const requestId = generateRequestId();
  activeRequests.set(requestId, { startTime: Date.now() });
  
  // Set timeout for request
  const timeoutId = setTimeout(() => {
    if (activeRequests.has(requestId)) {
      activeRequests.delete(requestId);
      sendResponse({ 
        success: false, 
        error: 'Request timeout',
        requestId 
      });
    }
  }, REQUEST_TIMEOUT);
  
  try {
    // Validate message structure
    if (!message || typeof message.action !== 'string') {
      throw new Error('Invalid message format');
    }

    // Check if Chrome AI is available
    if (!chromeAIInstance && message.action !== 'getAIStatus' && message.action !== 'keep-alive') {
      throw new Error('Chrome AI not initialized');
    }

    switch (message.action) {
      case 'explain-code':
        await handleExplainCode(message, sender, sendResponse);
        break;
      case 'debug-code':
        await handleDebugCode(message, sender, sendResponse);
        break;
      case 'document-code':
        await handleDocumentCode(message, sender, sendResponse);
        break;
      case 'refactor-code':
        await handleRefactorCode(message, sender, sendResponse);
        break;
      case 'inject-sidebar':
        await handleInjectSidebar(message, sender, sendResponse);
        break;
      case 'triggerAnalysis':
        await handleTriggerAnalysis(message, sender, sendResponse);
        break;
      case 'getAIStatus':
        await handleGetAIStatus(message, sender, sendResponse);
        break;
      case 'analyzeCode':
        await handleAnalyzeCode(message, sender, sendResponse);
        break;
      case 'keep-alive':
        sendResponse({ success: true, timestamp: Date.now() });
        break;
      default:
        sendResponse({ success: false, error: `Unknown action: ${message.action}` });
    }
  } catch (error) {
    console.error(`[ServiceWorker] Message handler failed:`, error);
    sendResponse({ 
      success: false, 
      error: error.message || 'Unknown error occurred',
      requestId 
    });
  } finally {
    clearTimeout(timeoutId);
    activeRequests.delete(requestId);
  }
}

// --- MESSAGE HANDLERS ---
async function handleExplainCode(request, sender, sendResponse) {
  try {
    if (!chromeAIInstance) {
      throw new Error('Chrome AI not initialized');
    }
    
    if (!request.code || typeof request.code !== 'string') {
      throw new Error('Valid code is required');
    }
    
    const result = await chromeAIInstance.explainCode(request.code, request.context);
    
    await trackEvent('code_explained', { 
      codeLength: request.code.length
    });
    
    sendResponse({ success: true, data: result });
  } catch (error) {
    console.error('[ServiceWorker] Explain code failed:', error);
    await trackEvent('code_explain_failed', { error: error.message });
    sendResponse({ success: false, error: error.message });
  }
}

async function handleDebugCode(request, sender, sendResponse) {
  try {
    if (!chromeAIInstance) {
      throw new Error('Chrome AI not initialized');
    }
    
    const result = await chromeAIInstance.debugCode(request.code, request.context);
    
    await trackEvent('code_debugged', { 
      codeLength: request.code.length
    });
    
    sendResponse({ success: true, data: result });
  } catch (error) {
    console.error('[ServiceWorker] Debug code failed:', error);
    await trackEvent('code_debug_failed', { error: error.message });
    sendResponse({ success: false, error: error.message });
  }
}

async function handleDocumentCode(request, sender, sendResponse) {
  try {
    if (!chromeAIInstance) {
      throw new Error('Chrome AI not initialized');
    }
    
    const result = await chromeAIInstance.generateDocumentation(request.code, request.context);
    
    await trackEvent('documentation_generated', { 
      codeLength: request.code.length
    });
    
    sendResponse({ success: true, data: result });
  } catch (error) {
    console.error('[ServiceWorker] Document code failed:', error);
    await trackEvent('documentation_failed', { error: error.message });
    sendResponse({ success: false, error: error.message });
  }
}

async function handleRefactorCode(request, sender, sendResponse) {
  try {
    if (!chromeAIInstance) {
      throw new Error('Chrome AI not initialized');
    }
    
    const result = await chromeAIInstance.refactorCode(request.code, request.context);
    
    await trackEvent('code_refactored', { 
      codeLength: request.code.length
    });
    
    sendResponse({ success: true, data: result });
  } catch (error) {
    console.error('[ServiceWorker] Refactor code failed:', error);
    await trackEvent('refactor_failed', { error: error.message });
    sendResponse({ success: false, error: error.message });
  }
}

async function handleInjectSidebar(request, sender, sendResponse) {
  try {
    await injectSidebar(sender.tab.id);
    await trackEvent('sidebar_injected', { tabId: sender.tab.id });
    sendResponse({ success: true });
  } catch (error) {
    console.error('[ServiceWorker] Sidebar injection failed:', error);
    await trackEvent('sidebar_injection_failed', { error: error.message });
    sendResponse({ success: false, error: error.message });
  }
}

// --- UTILITY FUNCTIONS ---
async function injectContentScriptIfNeeded(tabId) {
  try {
    const isInjected = await isContentScriptInjected(tabId);
    
    if (!isInjected) {
      console.log('[ServiceWorker] Injecting content script dynamically');
      
      // Inject minimal content script (ISOLATED world)
      await chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['content/content-script.js']
      });
      
      // Inject page bridge for site-specific integrations (MAIN world)
      await chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['content/inject-page-bridge.js'],
        world: 'MAIN'
      });
      
      console.log('[ServiceWorker] ✅ Content script and page bridge injected successfully');
    }
    
  } catch (error) {
    console.error('[ServiceWorker] ❌ Failed to inject content script:', error);
    throw error;
  }
}

async function isContentScriptInjected(tabId) {
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

async function injectSidebar(tabId) {
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ['content/content-script.js']
    });
    
    // CSS injection removed - using React frontend with Tailwind CSS
    console.log('[ServiceWorker] ✅ Sidebar injected successfully');
  } catch (error) {
    console.warn('[ServiceWorker] ⚠️ Sidebar injection failed:', error);
    throw new Error(`Cannot inject sidebar on this page: ${error.message}`);
  }
}

async function handleCodeAnalysis(type, data, tab) {
  try {
    const chromeAI = new ChromeAI();
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

async function performCleanup() {
  try {
    // Clean up old active requests
    const now = Date.now();
    for (const [requestId, request] of activeRequests) {
      if (now - request.startTime > 300000) { // 5 minutes
        activeRequests.delete(requestId);
      }
    }
    
    // Clean up storage
    const storageManager = new StorageManager();
    await storageManager.cleanupOldData();
    
    // Update last cleanup time
    await storageManager.setData(STORAGE_KEYS.LAST_CLEANUP, now);
    
    console.log('[ServiceWorker] ✅ Cleanup completed');
  } catch (error) {
    console.error('[ServiceWorker] ❌ Cleanup failed:', error);
  }
}

// --- REACT FRONTEND HANDLERS ---
async function handleTriggerAnalysis(request, sender, sendResponse) {
  try {
    console.log('[ServiceWorker] Triggering analysis:', request);
    
    const { type } = request;
    
    if (!type) {
      throw new Error('Analysis type is required');
    }

    // Obter código selecionado da aba ativa
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tabs[0]?.id) {
      throw new Error('No active tab found');
    }

    // Injetar content script para obter código selecionado
    await chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      files: ['content/content-script.js']
    });

    // Enviar mensagem para content script obter código selecionado
    const response = await chrome.tabs.sendMessage(tabs[0].id, {
      action: 'getSelectedCode'
    });

    if (!response.success || !response.code) {
      throw new Error('No code selected. Please select some code first.');
    }

    // Analisar código usando Chrome AI
    if (!chromeAIInstance) {
      throw new Error('Chrome AI not initialized');
    }
    
    let result;

    switch (type) {
      case 'explain':
        result = await chromeAIInstance.explainCode(response.code, { url: tabs[0].url });
        break;
      case 'bugs':
        result = await chromeAIInstance.debugCode(response.code, { url: tabs[0].url });
        break;
      case 'docs':
        result = await chromeAIInstance.generateDocumentation(response.code, { url: tabs[0].url });
        break;
      case 'optimize':
        result = await chromeAIInstance.refactorCode(response.code, { url: tabs[0].url });
        break;
      case 'review':
        result = await chromeAIInstance.reviewCode(response.code, { url: tabs[0].url });
        break;
      default:
        throw new Error(`Unknown analysis type: ${type}`);
    }

    // Enviar resultado para content script para exibir na sidebar
    await chrome.tabs.sendMessage(tabs[0].id, {
      action: 'inject-sidebar',
      analysis: result.explanation || result.refactoredCode || result.documentation || result.review,
      type,
      metadata: {
        processingTime: Date.now() - request.timestamp,
        language: 'javascript',
        confidence: 0.95
      }
    });

    // Track the analysis
    await trackEvent('code_analyzed', { 
      analysisType: type,
      codeLength: response.code.length,
      url: tabs[0].url
    });

    sendResponse({
      success: true,
      message: 'Analysis completed successfully'
    });

  } catch (error) {
    console.error('[ServiceWorker] Trigger analysis failed:', error);
    await trackEvent('code_analysis_failed', { 
      error: error.message,
      analysisType: request.type 
    });
    sendResponse({ 
      success: false, 
      error: error.message
    });
  }
}

async function handleGetAIStatus(request, sender, sendResponse) {
  try {
    if (!chromeAIInstance) {
      // Try to initialize if not available
      try {
        chromeAIInstance = new ChromeAI();
        await chromeAIInstance.initialize();
      } catch (initError) {
        console.warn('[ServiceWorker] Failed to initialize Chrome AI:', initError);
      }
    }
    
    sendResponse({
      initialized: !!chromeAIInstance,
      aiAvailable: chromeAIInstance?.isAvailable || false
    });
  } catch (error) {
    console.error('[ServiceWorker] Get AI status failed:', error);
    sendResponse({
      initialized: false,
      aiAvailable: false
    });
  }
}

// --- REACT FRONTEND HANDLER ---
async function handleAnalyzeCode(request, sender, sendResponse) {
  try {
    console.log('[ServiceWorker] Analyzing code:', request.payload);
    
    const { code, analysisType, options } = request.payload;
    
    if (!code || !analysisType) {
      throw new Error('Code and analysis type are required');
    }

    // Use Chrome AI for analysis
    if (!chromeAIInstance) {
      throw new Error('Chrome AI not initialized');
    }
    
    let result;

    switch (analysisType) {
      case 'explain':
        result = await chromeAIInstance.explainCode(code, options);
        break;
      case 'bugs':
        result = await chromeAIInstance.debugCode(code, options);
        break;
      case 'docs':
        result = await chromeAIInstance.generateDocumentation(code, options);
        break;
      case 'optimize':
        result = await chromeAIInstance.refactorCode(code, options);
        break;
      case 'review':
        result = await chromeAIInstance.reviewCode(code, options);
        break;
      default:
        throw new Error(`Unknown analysis type: ${analysisType}`);
    }

    // Track the analysis
    await trackEvent('code_analyzed', { 
      analysisType,
      codeLength: code.length,
      language: options?.language || 'unknown'
    });

    // Return result in format expected by React frontend
    sendResponse({
      success: true,
      analysis: result,
      type: analysisType,
      processingTime: Date.now() - request.payload.timestamp,
      metadata: {
        language: options?.language || 'javascript',
        confidence: 0.95,
        tokensUsed: code.length * 0.1 // Estimate
      }
    });

  } catch (error) {
    console.error('[ServiceWorker] Analyze code failed:', error);
    await trackEvent('code_analysis_failed', { 
      error: error.message,
      analysisType: request.payload?.analysisType 
    });
    sendResponse({ 
      success: false, 
      error: error.message,
      analysis: `Erro na análise: ${error.message}`
    });
  }
}

async function trackEvent(eventName, data = {}) {
  try {
    const storageManager = new StorageManager();
    await storageManager.trackEvent(eventName, data);
  } catch (error) {
    console.error('[ServiceWorker] Failed to track event:', error);
  }
}

function generateRequestId() {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Initialize extension on service worker startup
initializeExtension().catch(console.error);

console.log('[ServiceWorker] ✅ ES6 Module service worker loaded');