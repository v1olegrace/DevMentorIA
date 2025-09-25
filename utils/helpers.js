/**
 * DevMentor AI - Utility Helpers
 * Common utility functions used throughout the extension
 */

window.DevMentorHelpers = {
  
  /**
   * Debounce function to limit rapid function calls
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in milliseconds
   * @param {boolean} immediate - Execute immediately
   * @returns {Function} Debounced function
   */
  debounce(func, wait, immediate = false) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        timeout = null;
        if (!immediate) func(...args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func(...args);
    };
  },

  /**
   * Throttle function to limit function calls per time period
   * @param {Function} func - Function to throttle
   * @param {number} limit - Time limit in milliseconds
   * @returns {Function} Throttled function
   */
  throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  /**
   * Generate unique ID for elements and sessions
   * @returns {string} Unique identifier
   */
  generateId() {
    return `devmentor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * Safely parse JSON with error handling
   * @param {string} jsonString - JSON string to parse
   * @param {*} defaultValue - Default value if parsing fails
   * @returns {*} Parsed object or default value
   */
  safeJsonParse(jsonString, defaultValue = null) {
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      console.warn('JSON parsing failed:', error);
      return defaultValue;
    }
  },

  /**
   * Safely stringify object with error handling
   * @param {*} obj - Object to stringify
   * @param {string} defaultValue - Default value if stringifying fails
   * @returns {string} JSON string or default value
   */
  safeJsonStringify(obj, defaultValue = '{}') {
    try {
      return JSON.stringify(obj);
    } catch (error) {
      console.warn('JSON stringifying failed:', error);
      return defaultValue;
    }
  },

  /**
   * Clean and validate code input
   * @param {string} code - Raw code input
   * @returns {Object} Cleaned code and metadata
   */
  sanitizeCode(code) {
    if (!code || typeof code !== 'string') {
      return { code: '', isValid: false, reason: 'Empty or invalid input' };
    }

    // Remove excessive whitespace but preserve formatting
    const cleaned = code.trim();
    
    // Check length limits
    if (cleaned.length > window.DEVMENTOR_CONFIG.AI.MAX_CODE_LENGTH) {
      return {
        code: cleaned.substring(0, window.DEVMENTOR_CONFIG.AI.MAX_CODE_LENGTH),
        isValid: false,
        reason: 'Code too long, truncated'
      };
    }

    // Basic validation - should contain some code-like patterns
    const codePatterns = [
      /[{}();]/,  // Common programming symbols
      /\b(function|class|def|var|let|const|if|for|while|import|include)\b/i,  // Keywords
      /[=<>!&|]/,  // Operators
    ];

    const hasCodePatterns = codePatterns.some(pattern => pattern.test(cleaned));
    
    return {
      code: cleaned,
      isValid: hasCodePatterns,
      reason: hasCodePatterns ? 'Valid' : 'Does not appear to be code'
    };
  },

  /**
   * Format text for display (handle markdown-like formatting)
   * @param {string} text - Text to format
   * @returns {string} Formatted HTML
   */
  formatText(text) {
    if (!text) return '';
    
    return text
      // Bold text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Italic text  
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Inline code
      .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
      // Code blocks
      .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="code-block"><code class="language-$1">$2</code></pre>')
      // Line breaks
      .replace(/\n/g, '<br>')
      // Links (simple detection)
      .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
  },

  /**
   * Escape HTML to prevent XSS
   * @param {string} unsafe - Unsafe HTML string
   * @returns {string} Safe HTML string
   */
  escapeHtml(unsafe) {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  },

  /**
   * Copy text to clipboard
   * @param {string} text - Text to copy
   * @returns {Promise<boolean>} Success status
   */
  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      // Fallback for older browsers
      try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        return true;
      } catch (fallbackError) {
        console.error('Copy to clipboard failed:', fallbackError);
        return false;
      }
    }
  },

  /**
   * Show temporary notification
   * @param {string} message - Notification message
   * @param {string} type - Notification type (success, error, warning)
   * @param {number} duration - Display duration in ms
   */
  showNotification(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = `devmentor-notification devmentor-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      background: ${this.getNotificationColor(type)};
      color: white;
      border-radius: 6px;
      z-index: ${window.DEVMENTOR_CONFIG.UI.SIDEBAR_Z_INDEX + 1};
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 14px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      animation: slideInRight 0.3s ease;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, duration);
  },

  /**
   * Get notification color based on type
   * @param {string} type - Notification type
   * @returns {string} CSS color
   */
  getNotificationColor(type) {
    const colors = {
      success: window.DEVMENTOR_CONFIG.UI.COLORS.SUCCESS,
      error: window.DEVMENTOR_CONFIG.UI.COLORS.ERROR,
      warning: window.DEVMENTOR_CONFIG.UI.COLORS.WARNING,
      info: window.DEVMENTOR_CONFIG.UI.COLORS.PRIMARY
    };
    return colors[type] || colors.info;
  },

  /**
   * Check if element is visible in viewport
   * @param {HTMLElement} element - Element to check
   * @returns {boolean} Visibility status
   */
  isElementVisible(element) {
    if (!element) return false;
    
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  },

  /**
   * Get selected text and its context
   * @returns {Object} Selection information
   */
  getSelection() {
    const selection = window.getSelection();
    if (selection.rangeCount === 0) {
      return { text: '', element: null, range: null };
    }

    const range = selection.getRangeAt(0);
    const selectedText = selection.toString().trim();
    
    // Get the container element
    let container = range.commonAncestorContainer;
    if (container.nodeType === Node.TEXT_NODE) {
      container = container.parentElement;
    }

    return {
      text: selectedText,
      element: container,
      range: range,
      boundingRect: range.getBoundingClientRect()
    };
  },

  /**
   * Wait for element to be available in DOM
   * @param {string} selector - CSS selector
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise<HTMLElement|null>} Found element or null
   */
  waitForElement(selector, timeout = 5000) {
    return new Promise((resolve) => {
      const element = document.querySelector(selector);
      if (element) {
        resolve(element);
        return;
      }

      const observer = new MutationObserver(() => {
        const element = document.querySelector(selector);
        if (element) {
          observer.disconnect();
          resolve(element);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      setTimeout(() => {
        observer.disconnect();
        resolve(null);
      }, timeout);
    });
  },

  /**
   * Create and inject CSS styles
   * @param {string} css - CSS string
   * @param {string} id - Style element ID
   */
  injectCSS(css, id) {
    // Remove existing style if present
    const existingStyle = document.getElementById(id);
    if (existingStyle) {
      existingStyle.remove();
    }

    const style = document.createElement('style');
    style.id = id;
    style.textContent = css;
    document.head.appendChild(style);
  },

  /**
   * Check if Chrome Built-in AI is available
   * @returns {Promise<boolean>} Availability status
   */
  async checkAIAvailability() {
    try {
      return 'ai' in window && 
             'prompt' in window.ai && 
             'writer' in window.ai &&
             'proofreader' in window.ai &&
             'rewriter' in window.ai;
    } catch (error) {
      console.error('AI availability check failed:', error);
      return false;
    }
  },

  /**
   * Format file size in human readable format
   * @param {number} bytes - File size in bytes
   * @returns {string} Formatted file size
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  /**
   * Validate image file
   * @param {File} file - Image file to validate
   * @returns {Object} Validation result
   */
  validateImageFile(file) {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    const maxSize = window.DEVMENTOR_CONFIG.AI.MAX_SCREENSHOT_SIZE;

    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: window.DEVMENTOR_CONFIG.ERRORS.UNSUPPORTED_FORMAT
      };
    }

    if (file.size > maxSize) {
      return {
        isValid: false,
        error: window.DEVMENTOR_CONFIG.ERRORS.SCREENSHOT_TOO_LARGE
      };
    }

    return { isValid: true };
  },

  /**
   * Convert file to base64
   * @param {File} file - File to convert
   * @returns {Promise<string>} Base64 string
   */
  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        // Remove data URL prefix (data:image/png;base64,)
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  },

  /**
   * Retry async function with exponential backoff
   * @param {Function} fn - Async function to retry
   * @param {number} maxRetries - Maximum number of retries
   * @param {number} baseDelay - Base delay in milliseconds
   * @returns {Promise<*>>} Function result
   */
  async retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
    let lastError;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        
        if (attempt === maxRetries) {
          break;
        }
        
        // Exponential backoff: baseDelay * 2^attempt
        const delay = baseDelay * Math.pow(2, attempt);
        await this.sleep(delay);
      }
    }
    
    throw lastError;
  },

  /**
   * Sleep for specified duration
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise<void>}
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  /**
   * Get current timestamp
   * @returns {number} Current timestamp
   */
  now() {
    return Date.now();
  },

  /**
   * Format timestamp to readable string
   * @param {number} timestamp - Timestamp to format
   * @returns {string} Formatted date string
   */
  formatTimestamp(timestamp) {
    return new Date(timestamp).toLocaleString();
  },

  /**
   * Check if current page is a coding platform
   * @returns {Object} Platform detection result
   */
  detectCodingPlatform() {
    const hostname = window.location.hostname.toLowerCase();
    const pathname = window.location.pathname.toLowerCase();
    
    const platforms = {
      github: {
        domains: ['github.com', 'gist.github.com'],
        indicators: ['.blob-code', '.highlight', 'code', 'pre']
      },
      codepen: {
        domains: ['codepen.io'],
        indicators: ['.CodeMirror', '.cm-editor', '#code-area']
      },
      jsfiddle: {
        domains: ['jsfiddle.net'],
        indicators: ['.CodeMirror', '#panel-js', '#panel-html', '#panel-css']
      },
      stackoverf2: {
        domains: ['stackoverflow.com', 'stackexchange.com'],
        indicators: ['code', 'pre', '.highlight', '.lang-js', '.lang-python']
      },
      replit: {
        domains: ['replit.com'],
        indicators: ['.monaco-editor', '.view-lines']
      },
      codesandbox: {
        domains: ['codesandbox.io'],
        indicators: ['.monaco-editor', '.cm-editor']
      },
      leetcode: {
        domains: ['leetcode.com'],
        indicators: ['.monaco-editor', '.CodeMirror']
      },
      hackerrank: {
        domains: ['hackerrank.com'],
        indicators: ['.monaco-editor', '.CodeMirror']
      }
    };

    for (const [name, platform] of Object.entries(platforms)) {
      if (platform.domains.some(domain => hostname.includes(domain))) {
        const hasCodeIndicators = platform.indicators.some(selector => 
          document.querySelector(selector) !== null
        );
        
        return {
          platform: name,
          detected: true,
          hasCodeElements: hasCodeIndicators,
          confidence: hasCodeIndicators ? 0.9 : 0.6
        };
      }
    }

    // Generic code detection
    const genericCodeSelectors = [
      'code', 'pre', '.highlight', '.syntax', '.language-',
      '[class*="lang-"]', '[class*="language-"]', '.CodeMirror', '.monaco-editor'
    ];
    
    const hasGenericCode = genericCodeSelectors.some(selector =>
      document.querySelector(selector) !== null
    );

    return {
      platform: 'generic',
      detected: hasGenericCode,
      hasCodeElements: hasGenericCode,
      confidence: hasGenericCode ? 0.4 : 0.1
    };
  },

  /**
   * Extract metadata from current page
   * @returns {Object} Page metadata
   */
  getPageMetadata() {
    return {
      url: window.location.href,
      hostname: window.location.hostname,
      title: document.title,
      platform: this.detectCodingPlatform(),
      timestamp: this.now(),
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    };
  },

  /**
   * Initialize Media-Rich Explanation System
   * Carrega e inicializa todas as funcionalidades de explicação rica
   */
  async initializeMediaRichSystem() {
    try {
      console.log('[DevMentorHelpers] Inicializando sistema de explicações ricas...');
      
      // Carregar scripts necessários
      await this._loadMediaRichScripts();
      
      // Inicializar componentes
      if (window.MediaRichExplanationEngine) {
        window.mediaRichEngine = new window.MediaRichExplanationEngine();
        console.log('[DevMentorHelpers] MediaRichExplanationEngine inicializado');
      }
      
      if (window.CitationEngine) {
        window.citationEngine = new window.CitationEngine();
        console.log('[DevMentorHelpers] CitationEngine inicializado');
      }
      
      if (window.InteractivePlayground) {
        window.interactivePlayground = new window.InteractivePlayground();
        console.log('[DevMentorHelpers] InteractivePlayground inicializado');
      }
      
      if (window.VisualMetaphorEngine) {
        window.visualMetaphorEngine = new window.VisualMetaphorEngine();
        window.visualMetaphorEngine.initializeAnimations();
        console.log('[DevMentorHelpers] VisualMetaphorEngine inicializado');
      }
      
      if (window.DiagramGenerator) {
        window.diagramGenerator = new window.DiagramGenerator();
        console.log('[DevMentorHelpers] DiagramGenerator inicializado');
      }
      
      if (window.AIVideoGenerator) {
        window.aiVideoGenerator = new window.AIVideoGenerator();
        console.log('[DevMentorHelpers] AIVideoGenerator inicializado');
      }
      
      if (window.QuizGenerator) {
        window.quizGenerator = new window.QuizGenerator();
        console.log('[DevMentorHelpers] QuizGenerator inicializado');
      }
      
      if (window.GeminiProIntegration) {
        window.geminiProIntegration = new window.GeminiProIntegration();
        console.log('[DevMentorHelpers] GeminiProIntegration inicializado');
      }
      
      if (window.AdvancedCitationEngine) {
        window.advancedCitationEngine = new window.AdvancedCitationEngine();
        console.log('[DevMentorHelpers] AdvancedCitationEngine inicializado');
      }
      
      if (window.AdvancedVideoLessonGenerator) {
        window.advancedVideoLessonGenerator = new window.AdvancedVideoLessonGenerator();
        console.log('[DevMentorHelpers] AdvancedVideoLessonGenerator inicializado');
      }
      
      if (window.CompleteMediaRichDemo) {
        window.completeMediaRichDemo = new window.CompleteMediaRichDemo();
        console.log('[DevMentorHelpers] CompleteMediaRichDemo inicializado');
      }
      
      if (window.DevMentorIndex) {
        console.log('[DevMentorHelpers] DevMentorIndex carregado');
        console.log(`[DevMentorHelpers] Sistema completo com ${window.DevMentorIndex.info.totalComponents} componentes`);
        console.log(`[DevMentorHelpers] ${window.DevMentorIndex.info.totalFeatures} funcionalidades implementadas`);
      }
      
      // Injetar estilos CSS
      if (window.injectMediaRichStyles) {
        window.injectMediaRichStyles();
        console.log('[DevMentorHelpers] Estilos CSS injetados');
      }
      
      console.log('[DevMentorHelpers] Sistema de explicações ricas inicializado com sucesso!');
      return true;
      
    } catch (error) {
      console.error('[DevMentorHelpers] Erro ao inicializar sistema de explicações ricas:', error);
      return false;
    }
  },

  /**
   * Generate Rich Explanation
   * Gera explicação completa com todas as funcionalidades de mídia
   */
  async generateRichExplanation(code, analysisType, language, userLevel = 'intermediate') {
    try {
      if (!window.mediaRichEngine) {
        console.warn('[DevMentorHelpers] MediaRichEngine não inicializado');
        return this._generateFallbackExplanation(code, analysisType, language);
      }
      
      console.log(`[DevMentorHelpers] Gerando explicação rica para ${analysisType} em ${language}`);
      
      const richExplanation = await window.mediaRichEngine.generateRichExplanation(
        code, 
        analysisType, 
        language, 
        userLevel
      );
      
      return richExplanation;
      
    } catch (error) {
      console.error('[DevMentorHelpers] Erro ao gerar explicação rica:', error);
      return this._generateFallbackExplanation(code, analysisType, language);
    }
  },

  /**
   * Load Media-Rich Scripts
   * Carrega dinamicamente os scripts necessários
   */
  async _loadMediaRichScripts() {
    const scripts = [
      'utils/media-rich-engine.js',
      'utils/citation-engine.js', 
      'utils/interactive-playground.js',
      'utils/visual-metaphor-engine.js',
      'utils/diagram-generator.js',
      'utils/ai-video-generator.js',
      'utils/quiz-generator.js',
      'utils/gemini-pro-integration.js',
      'utils/advanced-citation-engine.js',
      'utils/advanced-video-lesson-generator.js',
      'utils/complete-media-rich-demo.js',
      'utils/devmentor-config.js',
      'utils/devmentor-examples.js',
      'utils/devmentor-index.js',
      'utils/devmentor-tests.js',
      'utils/gemini-config.js',
      'utils/gemini-tests.js',
      'utils/gemini-demo.js',
      'assets/styles/media-rich-styles.js'
    ];
    
    for (const script of scripts) {
      try {
        await this._loadScript(script);
      } catch (error) {
        console.warn(`[DevMentorHelpers] Falha ao carregar ${script}:`, error);
      }
    }
  },

  /**
   * Load Script Dynamically
   * Carrega script dinamicamente
   */
  _loadScript(src) {
    return new Promise((resolve, reject) => {
      // Verificar se já foi carregado
      if (document.querySelector(`script[src*="${src}"]`)) {
        resolve();
        return;
      }
      
      const script = document.createElement('script');
      script.src = chrome.runtime.getURL(src);
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  },

  /**
   * Generate Fallback Explanation
   * Explicação básica quando o sistema rico não está disponível
   */
  _generateFallbackExplanation(code, analysisType, language) {
    return `
      <div class="devmentor-fallback-explanation">
        <div class="fallback-header">
          <h3>Análise de Código</h3>
          <div class="fallback-meta">
            <span class="analysis-type">${analysisType}</span>
            <span class="language">${language}</span>
          </div>
        </div>
        <div class="fallback-content">
          <pre class="code-block"><code>${this.escapeHtml(code)}</code></pre>
          <div class="fallback-explanation">
            <p>Análise: <strong>${analysisType}</strong></p>
            <p>Linguagem: <strong>${language}</strong></p>
            <p>Status: Sistema de explicação rica não disponível</p>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * Check Media-Rich System Status
   * Verifica se o sistema está funcionando
   */
  getMediaRichSystemStatus() {
    return {
      mediaRichEngine: !!window.mediaRichEngine,
      citationEngine: !!window.citationEngine,
      interactivePlayground: !!window.interactivePlayground,
      visualMetaphorEngine: !!window.visualMetaphorEngine,
      diagramGenerator: !!window.diagramGenerator,
      aiVideoGenerator: !!window.aiVideoGenerator,
      quizGenerator: !!window.quizGenerator,
      geminiProIntegration: !!window.geminiProIntegration,
      advancedCitationEngine: !!window.advancedCitationEngine,
      advancedVideoLessonGenerator: !!window.advancedVideoLessonGenerator,
      completeMediaRichDemo: !!window.completeMediaRichDemo,
      devMentorIndex: !!window.DevMentorIndex,
      stylesLoaded: !!document.getElementById('devmentor-media-rich-styles'),
      allComponentsLoaded: !!(
        window.mediaRichEngine && 
        window.citationEngine && 
        window.interactivePlayground && 
        window.visualMetaphorEngine &&
        window.diagramGenerator &&
        window.aiVideoGenerator &&
        window.quizGenerator &&
        window.geminiProIntegration &&
        window.completeMediaRichDemo &&
        window.DevMentorIndex
      )
    };
  }
};

// Add CSS animations for notifications
const notificationCSS = `
  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOutRight {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
  
  .devmentor-notification {
    transition: all 0.3s ease;
  }
`;

// Inject notification styles
window.DevMentorHelpers.injectCSS(notificationCSS, 'devmentor-notification-styles');

// Initialize observability system if available
if (typeof ObservabilityManager !== 'undefined') {
  window.DevMentorHelpers.initializeObservability = async function() {
    try {
      if (!window.observabilityManager) {
        window.observabilityManager = new ObservabilityManager();
        await window.observabilityManager.initialize();
        
        // Initialize alerting system
        window.alertingSystem = new AlertingSystem();
        window.alertingSystem.startMonitoring();
        
        console.log('[DevMentorHelpers] Observability system initialized');
      }
    } catch (error) {
      console.error('[DevMentorHelpers] Failed to initialize observability:', error);
    }
  };

  // Enhanced error logging with observability
  window.DevMentorHelpers.logError = function(error, context = {}) {
    console.error('[DevMentorHelpers] Error:', error);
    
    if (window.observabilityManager) {
      window.observabilityManager.logError(error, {
        component: 'DevMentorHelpers',
        ...context
      });
    }
  };

  // Enhanced performance tracking
  window.DevMentorHelpers.trackPerformance = function(operation, duration, metadata = {}) {
    if (window.observabilityManager) {
      window.observabilityManager.recordMetric(
        `performance.${operation}`,
        duration,
        {
          component: 'DevMentorHelpers',
          operation
        },
        {
          type: 'histogram',
          unit: 'ms',
          ...metadata
        }
      );
    }
  };

  // Open telemetry dashboard
  window.DevMentorHelpers.openTelemetryDashboard = function() {
    if (typeof TelemetryDashboard !== 'undefined') {
      if (!window.telemetryDashboard) {
        window.telemetryDashboard = new TelemetryDashboard();
      }
      window.telemetryDashboard.show();
    } else {
      console.error('TelemetryDashboard not loaded');
    }
  };

  // Run observability demo
  window.DevMentorHelpers.runObservabilityDemo = async function() {
    if (typeof ObservabilityDemo !== 'undefined') {
      const demo = new ObservabilityDemo();
      await demo.runQuickDemo();
    } else {
      console.error('ObservabilityDemo not loaded');
    }
  };
}

