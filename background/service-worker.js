/**
 * DevMentor AI - Service Worker (ES6 Modules - Official Chrome Pattern)
 * Follows official Chrome Extensions documentation for Manifest V3
 * Uses persistent storage and proper lifecycle management
 */

/* eslint-disable no-console, security/detect-object-injection */

// ES6 Module imports (compatible with "type": "module")
import { AISessionManager } from './modules/ai-session-manager.js';
import { ContextMenuManager } from './modules/context-menu.js';
import { StorageManager } from './modules/storage.js';
import { ChromeAI } from './modules/chrome-ai.js';
import GitHubAPI from '../utils/github-api-integration.js';
import StackOverflowAPI from '../utils/stackoverflow-api-integration.js';
import MDNIntegration from '../utils/mdn-api-integration.js';
import PackageManagerAPI from '../utils/package-manager-api-integration.js';
import privacyTracker from '../utils/privacy-tracker.js';
import languageDetector from './modules/language-detector-integration.js';

// Global state (ephemeral - will be lost on termination)
let isInitialized = false;
const activeRequests = new Map();
const chromeAI = new ChromeAI();

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
async function initializeExtension () {
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
    console.log('[ServiceWorker]  Extension initialized successfully');

    // Track initialization
    await trackEvent('extension_initialized', { reason: 'startup' });
  } catch (error) {
    console.error('[ServiceWorker]  Initialization failed:', error);
    await trackEvent('initialization_error', { error: error.message });
    throw error;
  }
}

// --- CONTEXT MENU SETUP ---
async function setupContextMenus (contextMenuManager) {
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

    console.log('[ServiceWorker]  Context menus created');
  } catch (error) {
    console.error('[ServiceWorker]  Context menu setup failed:', error);
    throw error;
  }
}

// --- ALARM SETUP (replaces setInterval) ---
async function setupCleanupAlarm () {
  try {
    await chrome.alarms.create('storage-cleanup', { periodInMinutes: 60 });
    console.log('[ServiceWorker]  Cleanup alarm created');
  } catch (error) {
    console.error('[ServiceWorker]  Failed to create cleanup alarm:', error);
  }
}

// --- EVENT HANDLERS ---
async function handleContextMenuClick (info, tab) {
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

async function handleCommand (command, tab) {
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
    case 'open-privacy-dashboard':
      await chrome.tabs.create({ url: chrome.runtime.getURL('popup/privacy-dashboard.html') });
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

async function handleAlarm (alarm) {
  if (alarm.name === 'storage-cleanup') {
    await performCleanup();
  }
}

async function handleMessage (message, sender, sendResponse) {
  const requestId = generateRequestId();
  activeRequests.set(requestId, { startTime: Date.now() });

  try {
    switch (message.action) {
    case 'getAIStatus':
      await handleGetAIStatus(message, sender, sendResponse);
      break;
    case 'triggerAnalysis':
      await handleTriggerAnalysis(message, sender, sendResponse);
      break;
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
    case 'keep-alive':
      sendResponse({ success: true, timestamp: Date.now() });
      break;
      // External APIs handlers
    case 'github-request':
      await handleGitHubRequest(message, sender, sendResponse);
      break;
    case 'stackoverflow-request':
      await handleStackOverflowRequest(message, sender, sendResponse);
      break;
    case 'mdn-request':
      await handleMDNRequest(message, sender, sendResponse);
      break;
    case 'packages-request':
      await handlePackageManagerRequest(message, sender, sendResponse);
      break;
    case 'privacy-stats':
      await handlePrivacyStats(message, sender, sendResponse);
      break;
    case 'detect-language':
      await handleLanguageDetection(message, sender, sendResponse);
      break;
    default:
      sendResponse({ success: false, error: `Unknown action: ${message.action}` });
    }
  } catch (error) {
    console.error('[ServiceWorker] Message handler failed:', error);
    sendResponse({ success: false, error: error.message });
  } finally {
    activeRequests.delete(requestId);
  }
}

// --- MESSAGE HANDLERS ---
async function handleGetAIStatus (request, sender, sendResponse) {
  try {
    await chromeAI.initialize();
    const status = await chromeAI.getStatus();

    sendResponse({
      initialized: isInitialized,
      aiAvailable: status.available,
      capabilities: status.capabilities || {}
    });
  } catch (error) {
    console.error('[ServiceWorker] Get AI status failed:', error);
    sendResponse({
      initialized: isInitialized,
      aiAvailable: false,
      error: error.message
    });
  }
}

async function handleTriggerAnalysis (request, sender, sendResponse) {
  try {
    const { type } = request;
    const tab = sender.tab;

    if (!tab) {
      sendResponse({ success: false, error: 'No active tab' });
      return;
    }

    // Inject content script if needed
    await injectContentScriptIfNeeded(tab.id);

    // Get selected text from the page
    const [result] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => window.getSelection().toString().trim()
    });

    const selectedText = result?.result || '';

    if (!selectedText) {
      sendResponse({ success: false, error: 'No code selected' });
      return;
    }

    // Map type to action
    const actionMap = {
      explain: 'explain',
      bugs: 'debug',
      docs: 'document',
      optimize: 'refactor',
      review: 'review'
    };

    const analysisType = actionMap[type] || type;

    // Perform analysis
    await handleCodeAnalysis(analysisType, { selectionText: selectedText }, tab);

    sendResponse({ success: true });
  } catch (error) {
    console.error('[ServiceWorker] Trigger analysis failed:', error);
    sendResponse({ success: false, error: error.message });
  }
}

async function handleExplainCode (request, sender, sendResponse) {
  try {
    const result = await chromeAI.explainCode(request.code, request.context);

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

async function handleDebugCode (request, sender, sendResponse) {
  try {
    const result = await chromeAI.debugCode(request.code, request.context);

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

async function handleDocumentCode (request, sender, sendResponse) {
  try {
    const result = await chromeAI.generateDocumentation(request.code, request.context);

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

async function handleRefactorCode (request, sender, sendResponse) {
  try {
    const result = await chromeAI.refactorCode(request.code, request.context);

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

async function handleInjectSidebar (request, sender, sendResponse) {
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

// --- EXTERNAL APIs HANDLERS ---
async function handleGitHubRequest (request, sender, sendResponse) {
  try {
    const { method, params } = request;
    let result;

    switch (method) {
    case 'getRepositoryInfo':
      result = await GitHubAPI.getRepositoryInfo(params.repoUrl);
      break;
    case 'findSimilarCode':
      result = await GitHubAPI.findSimilarCode(params.codeSnippet, params.language);
      break;
    case 'getPopularPatterns':
      result = await GitHubAPI.getPopularPatterns(params.language, params.options);
      break;
    case 'analyzeTrendingProjects':
      result = await GitHubAPI.analyzeTrendingProjects(params.options);
      break;
    case 'getLanguages':
      result = await GitHubAPI.getLanguages(params.repoUrl);
      break;
    case 'checkCodeExistence':
      result = await GitHubAPI.checkCodeExistence(params.codeSnippet, params.language);
      break;
    case 'getFileContent':
      result = await GitHubAPI.getFileContent(params.repoUrl, params.filePath);
      break;
    default:
      throw new Error(`Unknown GitHub method: ${method}`);
    }

    await trackEvent('github_api_used', { method });
    sendResponse({ success: true, data: result });
  } catch (error) {
    console.error('[ServiceWorker] GitHub API request failed:', error);
    await trackEvent('github_api_failed', { method: request.method, error: error.message });
    sendResponse({ success: false, error: error.message });
  }
}

async function handleStackOverflowRequest (request, sender, sendResponse) {
  try {
    const { method, params } = request;
    let result;

    switch (method) {
    case 'findSimilarQuestions':
      result = await StackOverflowAPI.findSimilarQuestions(params.codeSnippet, params.options);
      break;
    case 'getBestPractices':
      result = await StackOverflowAPI.getBestPractices(params.technology, params.options);
      break;
    case 'findAntiPatterns':
      result = await StackOverflowAPI.findAntiPatterns(params.codeSnippet, params.language);
      break;
    case 'getEducationalContext':
      result = await StackOverflowAPI.getEducationalContext(params.topic, params.options);
      break;
    case 'getQuestionDetails':
      result = await StackOverflowAPI.getQuestionDetails(params.questionId);
      break;
    case 'searchByTag':
      result = await StackOverflowAPI.searchByTag(params.tag, params.options);
      break;
    default:
      throw new Error(`Unknown StackOverflow method: ${method}`);
    }

    await trackEvent('stackoverflow_api_used', { method });
    sendResponse({ success: true, data: result });
  } catch (error) {
    console.error('[ServiceWorker] StackOverflow API request failed:', error);
    await trackEvent('stackoverflow_api_failed', { method: request.method, error: error.message });
    sendResponse({ success: false, error: error.message });
  }
}

async function handleMDNRequest (request, sender, sendResponse) {
  try {
    const { method, params } = request;
    let result;

    switch (method) {
    case 'search':
      result = await MDNIntegration.search(params.query, params.options);
      break;
    case 'getDocumentation':
      result = await MDNIntegration.getDocumentation(params.apiOrConcept, params.options);
      break;
    case 'getExamples':
      result = await MDNIntegration.getExamples(params.api);
      break;
    case 'getBestPractices':
      result = await MDNIntegration.getBestPractices(params.api);
      break;
    case 'enrichWithMDN':
      result = await MDNIntegration.enrichWithMDN(params.explanation, params.topic);
      break;
    case 'getDocumentContent':
      result = await MDNIntegration.getDocumentContent(params.url);
      break;
    case 'searchByCategory':
      result = await MDNIntegration.searchByCategory(params.category, params.options);
      break;
    case 'getRelatedTopics':
      result = await MDNIntegration.getRelatedTopics(params.topic);
      break;
    default:
      throw new Error(`Unknown MDN method: ${method}`);
    }

    await trackEvent('mdn_api_used', { method });
    sendResponse({ success: true, data: result });
  } catch (error) {
    console.error('[ServiceWorker] MDN API request failed:', error);
    await trackEvent('mdn_api_failed', { method: request.method, error: error.message });
    sendResponse({ success: false, error: error.message });
  }
}

async function handlePackageManagerRequest (request, sender, sendResponse) {
  try {
    const { method, params } = request;
    let result;

    switch (method) {
    case 'analyzeDependencies':
      result = await PackageManagerAPI.analyzeDependencies(params.code, params.packageManager);
      break;
    case 'checkSecurity':
      result = await PackageManagerAPI.checkSecurity(params.packageName, params.packageManager);
      break;
    case 'suggestAlternatives':
      result = await PackageManagerAPI.suggestAlternatives(params.packageName, params.packageManager);
      break;
    case 'checkMaintenance':
      result = await PackageManagerAPI.checkMaintenance(params.packageName, params.packageManager);
      break;
    case 'getPackageStats':
      result = await PackageManagerAPI.getPackageStats(params.packageName, params.packageManager);
      break;
    case 'comparePackages':
      result = await PackageManagerAPI.comparePackages(params.packageNames, params.packageManager);
      break;
    case 'extractDependencies':
      result = await PackageManagerAPI.extractDependencies(params.code, params.packageManager);
      break;
    case 'detectPackageManager':
      result = await PackageManagerAPI.detectPackageManager(params.code);
      break;
    default:
      throw new Error(`Unknown PackageManager method: ${method}`);
    }

    await trackEvent('package_manager_api_used', { method });
    sendResponse({ success: true, data: result });
  } catch (error) {
    console.error('[ServiceWorker] PackageManager API request failed:', error);
    await trackEvent('package_manager_api_failed', { method: request.method, error: error.message });
    sendResponse({ success: false, error: error.message });
  }
}

// --- UTILITY FUNCTIONS ---
async function injectContentScriptIfNeeded (tabId) {
  try {
    const isInjected = await isContentScriptInjected(tabId);

    if (!isInjected) {
      console.log('[ServiceWorker] Injecting content script dynamically');

      // Inject minimal content script (ISOLATED world)
      await chrome.scripting.executeScript({
        target: { tabId },
        files: ['content/content-script.js']
      });

      // Inject page bridge for site-specific integrations (MAIN world)
      await chrome.scripting.executeScript({
        target: { tabId },
        files: ['content/inject-page-bridge.js'],
        world: 'MAIN'
      });

      console.log('[ServiceWorker]  Content script and page bridge injected successfully');
    }
  } catch (error) {
    console.error('[ServiceWorker]  Failed to inject content script:', error);
    throw error;
  }
}

async function isContentScriptInjected (tabId) {
  try {
    const [result] = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        return window.__DEVMENTOR_CONTENT_SCRIPT_INJECTED__ || false;
      }
    });

    return result?.result || false;
  } catch (error) {
    return false;
  }
}

async function injectSidebar (tabId) {
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ['content/components/sidebar-injector.js']
    });

    await chrome.scripting.insertCSS({
      target: { tabId },
      files: ['assets/styles/sidebar.css']
    });

    console.log('[ServiceWorker]  Sidebar injected successfully');
  } catch (error) {
    console.warn('[ServiceWorker]  Sidebar injection failed:', error);
    throw new Error(`Cannot inject sidebar on this page: ${error.message}`);
  }
}

async function handleCodeAnalysis (type, data, tab) {
  try {
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
    case 'review':
      result = await chromeAI.reviewCode(data.selectionText, { url: tab.url });
      break;
    default:
      throw new Error(`Unknown analysis type: ${type}`);
    }

    // Send result to content script
    await chrome.tabs.sendMessage(tab.id, {
      action: 'show-analysis-result',
      type,
      result,
      code: data.selectionText
    });
  } catch (error) {
    console.error(`[ServiceWorker] Code analysis (${type}) failed:`, error);

    // Send error to content script
    await chrome.tabs.sendMessage(tab.id, {
      action: 'show-analysis-error',
      type,
      error: error.message
    });
  }
}

async function performCleanup () {
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

    console.log('[ServiceWorker]  Cleanup completed');
  } catch (error) {
    console.error('[ServiceWorker]  Cleanup failed:', error);
  }
}

async function trackEvent (eventName, data = {}) {
  try {
    const storageManager = new StorageManager();
    await storageManager.trackEvent(eventName, data);
  } catch (error) {
    console.error('[ServiceWorker] Failed to track event:', error);
  }
}

async function handlePrivacyStats (message, sender, sendResponse) {
  try {
    const stats = privacyTracker.getStats();
    const report = privacyTracker.generateReport();

    sendResponse({
      success: true,
      data: {
        stats,
        report
      }
    });
  } catch (error) {
    console.error('[ServiceWorker] Privacy stats failed:', error);
    sendResponse({
      success: false,
      error: error.message
    });
  }
}

async function handleLanguageDetection (message, sender, sendResponse) {
  try {
    const { code, options } = message;

    if (!code) {
      sendResponse({
        success: false,
        error: 'No code provided'
      });
      return;
    }

    const result = await languageDetector.detectLanguage(code, options || {});

    await trackEvent('language_detected', {
      language: result.language,
      method: result.method,
      confidence: result.confidence
    });

    sendResponse({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('[ServiceWorker] Language detection failed:', error);
    sendResponse({
      success: false,
      error: error.message
    });
  }
}

function generateRequestId () {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Initialize extension on service worker startup
initializeExtension().catch(console.error);

console.log('[ServiceWorker]  ES6 Module service worker loaded');
