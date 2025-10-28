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
import { chromeBuiltinAI } from './modules/chrome-builtin-ai-manager.js';
import githubAPI from '../utils/github-api-integration.js';
import StackOverflowAPI from '../utils/stackoverflow-api-integration.js';
import MDNIntegration from '../utils/mdn-api-integration.js';
import PackageManagerAPI from '../utils/package-manager-api-integration.js';
import privacyTracker from '../utils/privacy-tracker.js';
import languageDetector from './modules/language-detector-integration.js';

// Global state (ephemeral - will be lost on termination)
let isInitialized = false;
let initializationPromise = null;
const activeRequests = new Map();
let githubIntegrationEnabled = false;

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

  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = (async () => {
    console.log('[ServiceWorker] Initializing extension...');

    // Initialize storage manager
    const storageManager = new StorageManager();
    await storageManager.initialize();

    try {
      const storedGithubPref = await storageManager.getData('devmentor_github_enabled');
      if (typeof storedGithubPref === 'boolean') {
        githubIntegrationEnabled = storedGithubPref;
      }
    } catch (prefError) {
      console.warn('[ServiceWorker] Could not restore GitHub integration preference:', prefError);
    }

    // Initialize AI session manager
    const aiSessionManager = new AISessionManager();
    await aiSessionManager.initialize();

    // Initialize Chrome Built-in AI Manager (ALL 7 APIs)
    console.log('[ServiceWorker] Initializing Chrome Built-in AI Manager...');
    const capabilities = await chromeBuiltinAI.initialize();
    console.log('[ServiceWorker] Chrome Built-in AI capabilities:', capabilities);
    console.log(`[ServiceWorker] Available APIs: ${chromeBuiltinAI.getAPICount()}/7`);

    // Initialize context menu manager
    const contextMenuManager = new ContextMenuManager();

    // Always recreate context menus on initialization to avoid duplicates
    // First, remove all existing menus
    await contextMenuManager.clearAll();

    // Now create fresh menus
    await setupContextMenus(contextMenuManager);

    // Set up cleanup alarm (replaces setInterval)
    await setupCleanupAlarm();

    console.log('[ServiceWorker]  Extension initialized successfully');

    // Track initialization
    trackEvent('extension_initialized', { reason: 'startup' });

    isInitialized = true;
  })().catch(async (error) => {
    console.error('[ServiceWorker]  Initialization failed:', error);
    trackEvent('initialization_error', { error: error.message });
    isInitialized = false;
    throw error;
  }).finally(() => {
    initializationPromise = null;
  });

  return initializationPromise;
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

    trackEvent('context_menu_used', {
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

    // Handle commands that don't require selection first
    if (command === 'toggle-panel') {
      // Toggle sidebar panel via content script
      try {
        await chrome.tabs.sendMessage(tab.id, { action: 'toggle-sidebar-panel' });
        trackEvent('command_executed', { command });
      } catch (error) {
        // If content script not loaded, try to inject it first
        try {
          await injectContentScriptIfNeeded(tab.id);
          await chrome.tabs.sendMessage(tab.id, { action: 'toggle-sidebar-panel' });
          trackEvent('command_executed', { command });
        } catch (injectionError) {
          console.error('[ServiceWorker] Failed to toggle sidebar panel:', injectionError);
        }
      }
      return;
    }

    if (command === 'take-screenshot') {
      // Capture screenshot
      try {
        // Minimize the sidebar panel before capturing screenshot
        try {
          await chrome.tabs.sendMessage(tab.id, { action: 'minimize-sidebar-panel' });
          // Wait for minimize animation to complete (300ms transition)
          await new Promise(resolve => setTimeout(resolve, 350));
        } catch (minimizeError) {
          // Panel might not be injected, continue anyway
          console.log('[ServiceWorker] Sidebar panel not found, continuing with screenshot');
        }

        const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, {
          format: 'png'
        });

        // Download the screenshot
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        await chrome.downloads.download({
          url: dataUrl,
          filename: `devmentor-screenshot-${timestamp}.png`,
          saveAs: false
        });

        trackEvent('screenshot_captured', { method: 'keyboard_shortcut' });
      } catch (error) {
        console.error('[ServiceWorker] Screenshot capture failed:', error);
      }
      return;
    }

    // Inject content script if needed for code analysis commands
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

    trackEvent('command_executed', { command, hasSelection: !!selectedText });
  } catch (error) {
    console.error(`[ServiceWorker] Command ${command} failed:`, error);
    trackEvent('command_failed', { command, error: error.message });
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
    case 'review-code':
      await handleReviewCode(message, sender, sendResponse);
      break;
    case 'generate-story':
      await handleGenerateStory(message, sender, sendResponse);
      break;
    case 'inject-sidebar':
      await handleInjectSidebar(message, sender, sendResponse);
      break;

    // Frontend Popup Integration
    case 'analyzeCode':
      await handleAnalyzeCode(message, sender, sendResponse);
      break;
    case 'generateRichExplanation':
      await handleGenerateRichExplanation(message, sender, sendResponse);
      break;

    // Gamification System
    case 'get-gamification-summary':
      await handleGetGamificationSummary(message, sender, sendResponse);
      break;
    case 'award-xp':
      await handleAwardXP(message, sender, sendResponse);
      break;

    // Chrome Built-in AI APIs (All 7 APIs)
    case 'ai-write':
      await handleAIWrite(message, sender, sendResponse);
      break;
    case 'ai-rewrite':
      await handleAIRewrite(message, sender, sendResponse);
      break;
    case 'ai-proofread':
      await handleAIProofread(message, sender, sendResponse);
      break;
    case 'ai-translate':
      await handleAITranslate(message, sender, sendResponse);
      break;
    case 'ai-summarize':
      await handleAISummarize(message, sender, sendResponse);
      break;
    case 'ai-detect-language':
      await handleAIDetectLanguage(message, sender, sendResponse);
      break;
    case 'ai-get-capabilities':
      await handleAIGetCapabilities(message, sender, sendResponse);
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
    case 'set-github-enabled':
      await handleSetGitHubEnabled(message, sender, sendResponse);
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
async function handleGetAIStatus (_request, _sender, sendResponse) {
  try {
    if (!isInitialized) {
      await initializeExtension();
    }

    // Use chromeBuiltinAI instead of legacy chromeAI
    const capabilities = chromeBuiltinAI.capabilities;
    const aiAvailable = Object.values(capabilities).some(val => val === true);

    sendResponse({
      initialized: isInitialized,
      aiAvailable: aiAvailable,
      capabilities: capabilities
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

async function handleExplainCode (request, _sender, sendResponse) {
  try {
    // Validação de parâmetros
    if (!request.code || typeof request.code !== 'string') {
      sendResponse({ success: false, error: 'Invalid or missing code parameter' });
      return;
    }

    const result = await chromeBuiltinAI.analyzeCode(request.code, {
      type: 'explain',
      language: request.context?.language || 'javascript'
    });

    trackEvent('code_explained', {
      codeLength: request.code.length
    });

    sendResponse({
      success: true,
      data: buildAnalysisResponse(request, result, 'explain')
    });
  } catch (error) {
    console.error('[ServiceWorker] Explain code failed:', error);
    trackEvent('code_explain_failed', { error: error.message });
    sendResponse({ success: false, error: error.message });
  }
}

async function handleDebugCode (request, _sender, sendResponse) {
  try {
    // Validação de parâmetros
    if (!request.code || typeof request.code !== 'string') {
      sendResponse({ success: false, error: 'Invalid or missing code parameter' });
      return;
    }

    const result = await chromeBuiltinAI.analyzeCode(request.code, {
      type: 'debug',
      language: request.context?.language || 'javascript'
    });

    trackEvent('code_debugged', {
      codeLength: request.code.length
    });

    sendResponse({
      success: true,
      data: buildAnalysisResponse(request, result, 'debug')
    });
  } catch (error) {
    console.error('[ServiceWorker] Debug code failed:', error);
    trackEvent('code_debug_failed', { error: error.message });
    sendResponse({ success: false, error: error.message });
  }
}

async function handleDocumentCode (request, _sender, sendResponse) {
  try {
    // Validação de parâmetros
    if (!request.code || typeof request.code !== 'string') {
      sendResponse({ success: false, error: 'Invalid or missing code parameter' });
      return;
    }

    const result = await chromeBuiltinAI.analyzeCode(request.code, {
      type: 'document',
      language: request.context?.language || 'javascript'
    });

    trackEvent('documentation_generated', {
      codeLength: request.code.length
    });

    sendResponse({
      success: true,
      data: buildAnalysisResponse(request, result, 'document')
    });
  } catch (error) {
    console.error('[ServiceWorker] Document code failed:', error);
    trackEvent('documentation_failed', { error: error.message });
    sendResponse({ success: false, error: error.message });
  }
}

async function handleRefactorCode (request, _sender, sendResponse) {
  try {
    // Validação de parâmetros
    if (!request.code || typeof request.code !== 'string') {
      sendResponse({ success: false, error: 'Invalid or missing code parameter' });
      return;
    }

    const result = await chromeBuiltinAI.analyzeCode(request.code, {
      type: 'refactor',
      language: request.context?.language || 'javascript'
    });

    trackEvent('code_refactored', {
      codeLength: request.code.length
    });

    sendResponse({
      success: true,
      data: buildAnalysisResponse(request, result, 'refactor')
    });
  } catch (error) {
    console.error('[ServiceWorker] Refactor code failed:', error);
    trackEvent('refactor_failed', { error: error.message });
    sendResponse({ success: false, error: error.message });
  }
}

async function handleReviewCode (request, _sender, sendResponse) {
  try {
    // Validação de parâmetros
    if (!request.code || typeof request.code !== 'string') {
      sendResponse({ success: false, error: 'Invalid or missing code parameter' });
      return;
    }

    const result = await chromeBuiltinAI.analyzeCode(request.code, {
      type: 'review',
      language: request.context?.language || 'javascript'
    });

    trackEvent('code_reviewed', {
      codeLength: request.code.length
    });

    sendResponse({
      success: true,
      data: buildAnalysisResponse(request, result, 'review')
    });
  } catch (error) {
    console.error('[ServiceWorker] Review code failed:', error);
    trackEvent('review_failed', { error: error.message });
    sendResponse({ success: false, error: error.message });
  }
}

function buildAnalysisResponse (request, aiResult, type) {
  const language = request.context?.language || 'javascript';
  const analysisValue = typeof aiResult === 'string' ? aiResult : aiResult?.analysis;
  const resolvedAnalysis = analysisValue ?? (aiResult
    ? (typeof aiResult === 'string' ? aiResult : JSON.stringify(aiResult, null, 2))
    : '');

  return {
    type,
    code: request.code ?? '',
    language,
    analysis: resolvedAnalysis,
    source: aiResult?.source ?? 'chrome-builtin-ai',
    timestamp: aiResult?.timestamp ?? Date.now(),
    raw: aiResult,
    meta: {
      language,
      provider: aiResult?.source ?? 'chrome-builtin-ai',
      requestedType: aiResult?.type ?? type
    }
  };
}

async function handleGenerateStory (request, sender, sendResponse) {
  try {
    const { code, language = 'javascript' } = request;

    // Create storytelling prompt
    const storyPrompt = `You are DevMentor AI, a creative programming teacher. Transform this ${language} code into an engaging educational story with 3 scenes.

For each scene, provide:
1. A creative title
2. Engaging narration that explains the code concept
3. Technical explanation
4. A dialogue from DevMentor character

Format your response as JSON with this structure:
{
  "scenes": [
    {
      "id": "1",
      "chapter": 1,
      "scene": 1,
      "title": "Scene Title",
      "narration": "Story narration...",
      "code": "code snippet",
      "explanation": "Technical explanation...",
      "character": {
        "name": "DevMentor",
        "avatar": "mentor",
        "dialogue": "Character dialogue..."
      }
    }
  ]
}

Code to transform into story:
\`\`\`${language}
${code}
\`\`\``;

    const result = await chromeBuiltinAI.prompt(storyPrompt);

    // Try to parse JSON response
    let scenes;
    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        scenes = parsed.scenes;
      }
    } catch (parseError) {
      // Fallback: create basic scenes
      scenes = [
        {
          id: '1',
          chapter: 1,
          scene: 1,
          title: 'The Journey Begins',
          narration: 'A developer encountered mysterious code...',
          code,
          explanation: result.substring(0, 200),
          character: {
            name: 'DevMentor',
            avatar: 'mentor',
            dialogue: 'Let\'s explore this code together!'
          }
        }
      ];
    }

    trackEvent('story_generated', {
      codeLength: code.length,
      scenesCount: scenes.length
    });

    sendResponse({ success: true, data: { scenes } });
  } catch (error) {
    console.error('[ServiceWorker] Generate story failed:', error);
    trackEvent('story_generation_failed', { error: error.message });
    sendResponse({ success: false, error: error.message });
  }
}

async function handleInjectSidebar (request, sender, sendResponse) {
  try {
    await injectSidebar(sender.tab.id);
    trackEvent('sidebar_injected', { tabId: sender.tab.id });
    sendResponse({ success: true });
  } catch (error) {
    console.error('[ServiceWorker] Sidebar injection failed:', error);
    trackEvent('sidebar_injection_failed', { error: error.message });
    sendResponse({ success: false, error: error.message });
  }
}

// --- EXTERNAL APIs HANDLERS ---
async function handleGitHubRequest (request, _sender, sendResponse) {
  try {
    if (!githubIntegrationEnabled) {
      sendResponse({
        success: false,
        error: 'GitHub integration is disabled by the user.'
      });
      return;
    }

    // Validação de parâmetros
    if (!request.method || !request.params) {
      sendResponse({ success: false, error: 'Missing method or params' });
      return;
    }

    const { method, params } = request;
    let result;

    switch (method) {
    case 'getRepositoryInfo':
      result = await githubAPI.getRepositoryInfo(params.repoUrl);
      break;
    case 'findSimilarCode':
      result = await githubAPI.findSimilarCode(params.codeSnippet, params.language);
      break;
    case 'getPopularPatterns':
      result = await githubAPI.getPopularPatterns(params.language, params.options);
      break;
    case 'analyzeTrendingProjects':
      result = await githubAPI.analyzeTrendingProjects(params.options);
      break;
    case 'getLanguages':
      result = await githubAPI.getLanguages(params.repoUrl);
      break;
    case 'checkCodeExistence':
      result = await githubAPI.checkCodeExistence(params.codeSnippet, params.language);
      break;
    case 'getFileContent':
      result = await githubAPI.getFileContent(params.repoUrl, params.filePath);
      break;
    default:
      throw new Error(`Unknown GitHub method: ${method}`);
    }

    trackEvent('github_api_used', { method });
    sendResponse({ success: true, data: result });
  } catch (error) {
    console.error('[ServiceWorker] GitHub API request failed:', error);
    trackEvent('github_api_failed', { method: request.method, error: error.message });
    sendResponse({ success: false, error: error.message });
  }
}

async function handleStackOverflowRequest (request, _sender, sendResponse) {
  try {
    // Validação de parâmetros
    if (!request.method || !request.params) {
      sendResponse({ success: false, error: 'Missing method or params' });
      return;
    }

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

    trackEvent('stackoverflow_api_used', { method });
    sendResponse({ success: true, data: result });
  } catch (error) {
    console.error('[ServiceWorker] StackOverflow API request failed:', error);
    trackEvent('stackoverflow_api_failed', { method: request.method, error: error.message });
    sendResponse({ success: false, error: error.message });
  }
}

async function handleMDNRequest (request, _sender, sendResponse) {
  try {
    // Validação de parâmetros
    if (!request.method || !request.params) {
      sendResponse({ success: false, error: 'Missing method or params' });
      return;
    }

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

    trackEvent('mdn_api_used', { method });
    sendResponse({ success: true, data: result });
  } catch (error) {
    console.error('[ServiceWorker] MDN API request failed:', error);
    trackEvent('mdn_api_failed', { method: request.method, error: error.message });
    sendResponse({ success: false, error: error.message });
  }
}

async function handlePackageManagerRequest (request, _sender, sendResponse) {
  try {
    // Validação de parâmetros
    if (!request.method || !request.params) {
      sendResponse({ success: false, error: 'Missing method or params' });
      return;
    }

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

    trackEvent('package_manager_api_used', { method });
    sendResponse({ success: true, data: result });
  } catch (error) {
    console.error('[ServiceWorker] PackageManager API request failed:', error);
    trackEvent('package_manager_api_failed', { method: request.method, error: error.message });
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

      // Inject sidebar panel (ISOLATED world)
      await chrome.scripting.executeScript({
        target: { tabId },
        files: ['content/sidebar-panel.js']
      });

      // Inject page bridge for site-specific integrations (MAIN world)
      await chrome.scripting.executeScript({
        target: { tabId },
        files: ['content/inject-page-bridge.js'],
        world: 'MAIN'
      });

      console.log('[ServiceWorker] Content script, sidebar panel and page bridge injected successfully');
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
    // Use chromeBuiltinAI.analyzeCode for all types
    const resultText = await chromeBuiltinAI.analyzeCode(data.selectionText, {
      type: type,
      language: data.language || 'javascript'
    });

    const result = {
      type,
      source: 'chrome-builtin-ai',
      text: resultText,
      timestamp: Date.now()
    };

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

// Track event de forma não-bloqueante para não atrasar respostas
function trackEvent (eventName, data = {}) {
  // Execute de forma assíncrona sem bloquear
  Promise.resolve().then(async () => {
    try {
      const storageManager = new StorageManager();
      await storageManager.trackEvent(eventName, data);
    } catch (error) {
      console.error('[ServiceWorker] Failed to track event:', error);
    }
  });
}

async function handlePrivacyStats (_message, _sender, sendResponse) {
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

    trackEvent('language_detected', {
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

async function handleSetGitHubEnabled (message, _sender, sendResponse) {
  try {
    githubIntegrationEnabled = message?.enabled !== false;
    await chrome.storage.local.set({
      devmentor_github_enabled: githubIntegrationEnabled
    });
    trackEvent('github_integration_toggled', {
      enabled: githubIntegrationEnabled
    });

    sendResponse({ success: true, enabled: githubIntegrationEnabled });
  } catch (error) {
    console.error('[ServiceWorker] Failed to update GitHub integration preference:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// --- FRONTEND POPUP MESSAGE HANDLERS ---
async function handleAnalyzeCode (request, sender, sendResponse) {
  try {
    const { payload } = request;
    const { code, analysisType, language, options } = payload;

    if (!code || !code.trim()) {
      sendResponse({ success: false, error: 'No code provided' });
      return;
    }

    console.log(`[ServiceWorker] Analyzing code (type: ${analysisType}, language: ${language})`);

    // Perform analysis using Chrome Built-in AI Manager
    const result = await chromeBuiltinAI.analyzeCode(code, {
      type: analysisType || 'explain',
      language: language || 'javascript',
      skillLevel: options?.skillLevel || 'intermediate',
      ...options
    });

    sendResponse({
      success: true,
      analysis: result.analysis || result,
      result: result.analysis || result,
      metadata: {
        processingTime: Date.now() - (payload.timestamp || Date.now()),
        language: language || 'javascript',
        type: analysisType,
        source: result.source || 'chrome-builtin-ai'
      }
    });

    // Track analytics
    trackEvent('popup_code_analysis', {
      type: analysisType,
      language: language || 'javascript',
      codeLength: code.length
    });
  } catch (error) {
    console.error('[ServiceWorker] Code analysis failed:', error);
    sendResponse({
      success: false,
      error: error.message || 'Analysis failed'
    });
  }
}

async function handleGenerateRichExplanation (request, sender, sendResponse) {
  try {
    const { payload } = request;
    const { code, analysisType, language, userLevel } = payload;

    if (!code || !code.trim()) {
      sendResponse({ success: false, error: 'No code provided' });
      return;
    }

    console.log(`[ServiceWorker] Generating rich explanation (type: ${analysisType}, level: ${userLevel})`);

    // Generate comprehensive explanation using Chrome Built-in AI Manager
    const richContent = await chromeBuiltinAI.generateRichExplanation(code, {
      language: language || 'javascript',
      skillLevel: userLevel || 'intermediate',
      includeTranslation: false
    });

    sendResponse({
      success: true,
      richContent: {
        explanation: richContent.explanation,
        summary: richContent.summary || richContent.explanation.substring(0, 200) + '...',
        translation: richContent.translation,
        metadata: {
          skillLevel: userLevel || 'intermediate',
          language: language || 'javascript',
          confidence: 0.95,
          timestamp: richContent.timestamp
        }
      }
    });

    // Track analytics
    trackEvent('popup_rich_explanation', {
      type: analysisType,
      language: language || 'javascript',
      userLevel: userLevel || 'intermediate'
    });
  } catch (error) {
    console.error('[ServiceWorker] Rich explanation failed:', error);
    sendResponse({
      success: false,
      error: error.message || 'Rich explanation failed'
    });
  }
}

// --- GAMIFICATION SYSTEM HANDLERS ---
async function handleGetGamificationSummary (request, sender, sendResponse) {
  try {
    const { userId = 'default' } = request;

    // Get gamification data from storage
    const result = await chrome.storage.local.get(['gamificationData']);
    const gamificationData = result.gamificationData || {};

    // Initialize user data if doesn't exist
    if (!gamificationData[userId]) {
      gamificationData[userId] = {
        level: 1,
        xp: 0,
        totalXp: 0,
        badges: 0,
        streak: 0,
        longestStreak: 0,
        activeChallenges: 0,
        stats: {
          tutorialsCompleted: 0,
          exercisesSolved: 0,
          perfectScores: 0,
          codesAnalyzed: 0,
          helpfulActions: 0
        },
        recentBadges: []
      };
    }

    const userData = gamificationData[userId];

    // Calculate XP needed for next level (100 * level)
    const { level, xp, totalXp, badges, streak, longestStreak, activeChallenges, stats, recentBadges } = userData;
    const xpToNextLevel = 100 * level;
    const title = getTitleForLevel(level);

    sendResponse({
      success: true,
      data: {
        level,
        xp,
        xpToNextLevel,
        totalXp,
        title,
        badges,
        streak,
        longestStreak,
        activeChallenges,
        stats,
        recentBadges
      }
    });
  } catch (error) {
    console.error('[ServiceWorker] Get gamification summary failed:', error);
    sendResponse({
      success: false,
      error: error.message || 'Failed to get gamification data'
    });
  }
}

async function handleAwardXP (request, sender, sendResponse) {
  try {
    const { userId = 'default', amount, reason } = request;

    if (!amount || amount <= 0) {
      sendResponse({ success: false, error: 'Invalid XP amount' });
      return;
    }

    // Get current gamification data
    const result = await chrome.storage.local.get(['gamificationData']);
    const gamificationData = result.gamificationData || {};

    // Initialize user if doesn't exist
    if (!gamificationData[userId]) {
      gamificationData[userId] = {
        level: 1,
        xp: 0,
        totalXp: 0,
        badges: 0,
        streak: 0,
        longestStreak: 0,
        activeChallenges: 0,
        stats: {
          tutorialsCompleted: 0,
          exercisesSolved: 0,
          perfectScores: 0,
          codesAnalyzed: 0,
          helpfulActions: 0
        },
        recentBadges: []
      };
    }

    const userData = gamificationData[userId];

    // Award XP
    userData.xp += amount;
    userData.totalXp += amount;

    // Check for level up
    const xpToNextLevel = 100 * userData.level;
    let leveledUp = false;

    if (userData.xp >= xpToNextLevel) {
      userData.level++;
      userData.xp -= xpToNextLevel;
      leveledUp = true;
      console.log(`[Gamification] User ${userId} leveled up to ${userData.level}!`);
    }

    // Update stats based on reason
    if (reason === 'code_analyzed') {
      userData.stats.codesAnalyzed++;
    }

    // Save updated data
    gamificationData[userId] = userData;
    await chrome.storage.local.set({ gamificationData });

    // Track event
    trackEvent('xp_awarded', {
      userId,
      amount,
      reason,
      newLevel: userData.level,
      leveledUp
    });

    sendResponse({
      success: true,
      data: {
        xpAwarded: amount,
        newXp: userData.xp,
        newTotalXp: userData.totalXp,
        level: userData.level,
        leveledUp
      }
    });
  } catch (error) {
    console.error('[ServiceWorker] Award XP failed:', error);
    sendResponse({
      success: false,
      error: error.message || 'Failed to award XP'
    });
  }
}

// Helper function for gamification
function getTitleForLevel (level) {
  if (level < 5) return 'Novice Coder';
  if (level < 10) return 'Junior Developer';
  if (level < 20) return 'Mid-Level Developer';
  if (level < 35) return 'Senior Developer';
  if (level < 50) return 'Tech Lead';
  return 'Master Engineer';
}

// =============================================================================
// CHROME BUILT-IN AI API HANDLERS (ALL 7 APIS)
// =============================================================================

/**
 * Handle AI Write request (Writer API)
 */
async function handleAIWrite (request, _sender, sendResponse) {
  try {
    const { prompt, context, tone, format, length } = request;

    if (!prompt || !prompt.trim()) {
      sendResponse({ success: false, error: 'No prompt provided' });
      return;
    }

    console.log('[ServiceWorker] AI Write request:', { tone, format, length });

    const result = await chromeBuiltinAI.write(prompt, { context, tone, format, length });

    sendResponse({
      success: true,
      result,
      metadata: {
        tone,
        format,
        length,
        timestamp: Date.now()
      }
    });

    trackEvent('ai_write_used', {
      promptLength: prompt.length,
      tone,
      format,
      length
    });
  } catch (error) {
    console.error('[ServiceWorker] AI Write failed:', error);
    sendResponse({
      success: false,
      error: error.message || 'Write operation failed'
    });
  }
}

/**
 * Handle AI Rewrite request (Rewriter API)
 */
async function handleAIRewrite (request, _sender, sendResponse) {
  try {
    const { text, context, tone, format, length } = request;

    if (!text || !text.trim()) {
      sendResponse({ success: false, error: 'No text provided' });
      return;
    }

    console.log('[ServiceWorker] AI Rewrite request:', { tone, format, length });

    const result = await chromeBuiltinAI.rewrite(text, { context, tone, format, length });

    sendResponse({
      success: true,
      result,
      metadata: {
        tone,
        format,
        length,
        originalLength: text.length,
        timestamp: Date.now()
      }
    });

    trackEvent('ai_rewrite_used', {
      textLength: text.length,
      tone,
      format,
      length
    });
  } catch (error) {
    console.error('[ServiceWorker] AI Rewrite failed:', error);
    sendResponse({
      success: false,
      error: error.message || 'Rewrite operation failed'
    });
  }
}

/**
 * Handle AI Proofread request (Proofreader API)
 */
async function handleAIProofread (request, _sender, sendResponse) {
  try {
    const { text, language = 'en' } = request;

    if (!text || !text.trim()) {
      sendResponse({ success: false, error: 'No text provided' });
      return;
    }

    console.log('[ServiceWorker] AI Proofread request:', { language, textLength: text.length });

    const result = await chromeBuiltinAI.proofread(text, language);

    sendResponse({
      success: true,
      corrected: result.corrected,
      corrections: result.corrections,
      hasErrors: result.hasErrors,
      metadata: {
        language,
        originalLength: text.length,
        correctedLength: result.corrected.length,
        errorCount: result.corrections.length,
        timestamp: Date.now()
      }
    });

    trackEvent('ai_proofread_used', {
      language,
      textLength: text.length,
      errorCount: result.corrections.length
    });
  } catch (error) {
    console.error('[ServiceWorker] AI Proofread failed:', error);
    sendResponse({
      success: false,
      error: error.message || 'Proofread operation failed'
    });
  }
}

/**
 * Handle AI Translate request (Translator API)
 */
async function handleAITranslate (request, _sender, sendResponse) {
  try {
    const { text, sourceLanguage, targetLanguage } = request;

    if (!text || !text.trim()) {
      sendResponse({ success: false, error: 'No text provided' });
      return;
    }

    if (!sourceLanguage || !targetLanguage) {
      sendResponse({ success: false, error: 'Source and target languages required' });
      return;
    }

    console.log('[ServiceWorker] AI Translate request:', { sourceLanguage, targetLanguage });

    const result = await chromeBuiltinAI.translate(text, sourceLanguage, targetLanguage);

    sendResponse({
      success: true,
      translation: result,
      metadata: {
        sourceLanguage,
        targetLanguage,
        originalLength: text.length,
        translatedLength: result.length,
        timestamp: Date.now()
      }
    });

    trackEvent('ai_translate_used', {
      sourceLanguage,
      targetLanguage,
      textLength: text.length
    });
  } catch (error) {
    console.error('[ServiceWorker] AI Translate failed:', error);
    sendResponse({
      success: false,
      error: error.message || 'Translation failed'
    });
  }
}

/**
 * Handle AI Summarize request (Summarizer API)
 */
async function handleAISummarize (request, _sender, sendResponse) {
  try {
    const { text, type = 'key-points', format = 'markdown', length = 'medium', context } = request;

    if (!text || !text.trim()) {
      sendResponse({ success: false, error: 'No text provided' });
      return;
    }

    console.log('[ServiceWorker] AI Summarize request:', { type, format, length });

    const result = await chromeBuiltinAI.summarize(text, { type, format, length, context });

    sendResponse({
      success: true,
      summary: result,
      metadata: {
        type,
        format,
        length,
        originalLength: text.length,
        summaryLength: result.length,
        timestamp: Date.now()
      }
    });

    trackEvent('ai_summarize_used', {
      type,
      format,
      length,
      textLength: text.length
    });
  } catch (error) {
    console.error('[ServiceWorker] AI Summarize failed:', error);
    sendResponse({
      success: false,
      error: error.message || 'Summarization failed'
    });
  }
}

/**
 * Handle AI Detect Language request (Language Detector API)
 */
async function handleAIDetectLanguage (request, _sender, sendResponse) {
  try {
    const { text } = request;

    if (!text || !text.trim()) {
      sendResponse({ success: false, error: 'No text provided' });
      return;
    }

    console.log('[ServiceWorker] AI Detect Language request');

    const results = await chromeBuiltinAI.detectLanguage(text);

    sendResponse({
      success: true,
      results, // Array of {detectedLanguage, confidence}
      primaryLanguage: results[0]?.detectedLanguage || 'unknown',
      confidence: results[0]?.confidence || 0,
      metadata: {
        textLength: text.length,
        alternativesCount: results.length,
        timestamp: Date.now()
      }
    });

    trackEvent('ai_detect_language_used', {
      textLength: text.length,
      detectedLanguage: results[0]?.detectedLanguage,
      confidence: results[0]?.confidence
    });
  } catch (error) {
    console.error('[ServiceWorker] AI Detect Language failed:', error);
    sendResponse({
      success: false,
      error: error.message || 'Language detection failed'
    });
  }
}

/**
 * Handle AI Get Capabilities request
 */
async function handleAIGetCapabilities (request, sender, sendResponse) {
  try {
    const capabilities = chromeBuiltinAI.getCapabilities();
    const availableAPIs = chromeBuiltinAI.getAvailableAPIs();
    const apiCount = chromeBuiltinAI.getAPICount();

    sendResponse({
      success: true,
      capabilities,
      availableAPIs,
      apiCount,
      totalAPIs: 7,
      percentageAvailable: Math.round((apiCount / 7) * 100),
      timestamp: Date.now()
    });

    console.log(`[ServiceWorker] AI Capabilities: ${apiCount}/7 APIs available`);
  } catch (error) {
    console.error('[ServiceWorker] Get AI Capabilities failed:', error);
    sendResponse({
      success: false,
      error: error.message || 'Failed to get capabilities'
    });
  }
}

function generateRequestId () {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

// Initialize extension on service worker startup
initializeExtension().catch(console.error);

console.log('[ServiceWorker]  ES6 Module service worker loaded');
