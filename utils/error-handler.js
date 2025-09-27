/**
 * DevMentor AI - Advanced Error Handling System
 * Designed for Google Hackathon - Enterprise-grade error management
 */

class DevMentorError extends Error {
  constructor(type, message, userFriendlyMessage, context = {}) {
    super(message);
    this.name = 'DevMentorError';
    this.type = type;
    this.userFriendlyMessage = userFriendlyMessage;
    this.context = context;
    this.timestamp = new Date().toISOString();
    this.sessionId = this.generateSessionId();
  }

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Error types for different scenarios
export const ERROR_TYPES = {
  // AI API Errors
  AI_UNAVAILABLE: 'ai_unavailable',
  AI_TIMEOUT: 'ai_timeout',
  AI_RATE_LIMIT: 'ai_rate_limit',
  AI_INVALID_RESPONSE: 'ai_invalid_response',
  
  // Chrome API Errors
  CHROME_API_ERROR: 'chrome_api_error',
  PERMISSION_DENIED: 'permission_denied',
  STORAGE_ERROR: 'storage_error',
  
  // Code Analysis Errors
  CODE_TOO_COMPLEX: 'code_too_complex',
  CODE_INVALID_SYNTAX: 'code_invalid_syntax',
  CODE_TOO_LARGE: 'code_too_large',
  
  // Network Errors
  NETWORK_ERROR: 'network_error',
  OFFLINE_MODE: 'offline_mode',
  
  // User Interface Errors
  UI_RENDER_ERROR: 'ui_render_error',
  CONTENT_SCRIPT_ERROR: 'content_script_error',
  
  // System Errors
  MEMORY_ERROR: 'memory_error',
  PERFORMANCE_ERROR: 'performance_error'
};

// Error severity levels
export const ERROR_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

class ErrorHandler {
  constructor() {
    this.errorLog = [];
    this.maxLogSize = 100;
    this.retryAttempts = new Map();
    this.fallbackStrategies = new Map();
    this.initializeFallbacks();
  }

  initializeFallbacks() {
    // AI API fallbacks
    this.fallbackStrategies.set(ERROR_TYPES.AI_UNAVAILABLE, () => {
      return this.showFallbackExplanation();
    });

    this.fallbackStrategies.set(ERROR_TYPES.AI_TIMEOUT, () => {
      return this.showTimeoutMessage();
    });

    // Code analysis fallbacks
    this.fallbackStrategies.set(ERROR_TYPES.CODE_TOO_COMPLEX, () => {
      return this.showSimplifiedAnalysis();
    });

    this.fallbackStrategies.set(ERROR_TYPES.CODE_TOO_LARGE, () => {
      return this.showChunkedAnalysis();
    });
  }

  /**
   * Main error handling method
   * @param {Error} error - The error object
   * @param {Object} context - Additional context
   * @param {string} severity - Error severity level
   */
  handleError(error, context = {}, severity = ERROR_SEVERITY.MEDIUM) {
    const devMentorError = this.wrapError(error, context, severity);
    
    // Log the error
    this.logError(devMentorError);
    
    // Attempt retry if applicable
    if (this.shouldRetry(devMentorError)) {
      return this.retryOperation(devMentorError);
    }
    
    // Execute fallback strategy
    if (this.fallbackStrategies.has(devMentorError.type)) {
      return this.fallbackStrategies.get(devMentorError.type)();
    }
    
    // Show user-friendly error message
    this.showUserError(devMentorError);
    
    // Report to analytics (privacy-preserving)
    this.reportError(devMentorError);
  }

  wrapError(error, context, severity) {
    if (error instanceof DevMentorError) {
      return error;
    }

    const errorType = this.determineErrorType(error);
    const userMessage = this.generateUserMessage(errorType, context);
    
    return new DevMentorError(
      errorType,
      error.message || 'Unknown error occurred',
      userMessage,
      { ...context, originalError: error.name, severity }
    );
  }

  determineErrorType(error) {
    if (error.name === 'ChromeRuntimeError') {
      return ERROR_TYPES.CHROME_API_ERROR;
    }
    
    if (error.message?.includes('timeout')) {
      return ERROR_TYPES.AI_TIMEOUT;
    }
    
    if (error.message?.includes('quota')) {
      return ERROR_TYPES.AI_RATE_LIMIT;
    }
    
    if (error.message?.includes('network')) {
      return ERROR_TYPES.NETWORK_ERROR;
    }
    
    if (error.message?.includes('memory')) {
      return ERROR_TYPES.MEMORY_ERROR;
    }
    
    return ERROR_TYPES.CHROME_API_ERROR;
  }

  generateUserMessage(errorType, context) {
    const messages = {
      [ERROR_TYPES.AI_UNAVAILABLE]: 'AI está temporariamente indisponível. Tentando novamente...',
      [ERROR_TYPES.AI_TIMEOUT]: 'A análise está demorando mais que o esperado. Aguarde...',
      [ERROR_TYPES.AI_RATE_LIMIT]: 'Muitas solicitações. Aguardando antes de tentar novamente.',
      [ERROR_TYPES.CODE_TOO_COMPLEX]: 'Código muito complexo. Mostrando análise simplificada.',
      [ERROR_TYPES.CODE_TOO_LARGE]: 'Código muito grande. Analisando por partes.',
      [ERROR_TYPES.NETWORK_ERROR]: 'Problema de conexão. Funcionando offline.',
      [ERROR_TYPES.MEMORY_ERROR]: 'Memória insuficiente. Otimizando recursos...',
      [ERROR_TYPES.PERMISSION_DENIED]: 'Permissão necessária para esta funcionalidade.',
      [ERROR_TYPES.STORAGE_ERROR]: 'Problema ao salvar dados. Verificando armazenamento...'
    };

    return messages[errorType] || 'Ocorreu um erro inesperado. Nossa equipe foi notificada.';
  }

  shouldRetry(error) {
    const retryableErrors = [
      ERROR_TYPES.AI_UNAVAILABLE,
      ERROR_TYPES.AI_TIMEOUT,
      ERROR_TYPES.NETWORK_ERROR,
      ERROR_TYPES.CHROME_API_ERROR
    ];

    if (!retryableErrors.includes(error.type)) {
      return false;
    }

    const attempts = this.retryAttempts.get(error.sessionId) || 0;
    return attempts < 3;
  }

  async retryOperation(error) {
    const attempts = this.retryAttempts.get(error.sessionId) || 0;
    this.retryAttempts.set(error.sessionId, attempts + 1);

    // Exponential backoff
    const delay = Math.pow(2, attempts) * 1000;
    
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // Show retry message to user
    this.showRetryMessage(error, attempts + 1);
    
    throw error; // Re-throw to trigger retry
  }

  logError(error) {
    this.errorLog.push({
      ...error,
      userAgent: navigator.userAgent,
      url: window.location?.href,
      timestamp: new Date().toISOString()
    });

    // Keep only recent errors
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(-this.maxLogSize);
    }

    // Console logging for development
    if (process.env.NODE_ENV === 'development') {
      console.error('DevMentor Error:', error);
    }
  }

  showUserError(error) {
    // Send message to UI to display error
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.sendMessage({
        type: 'SHOW_ERROR',
        error: {
          message: error.userFriendlyMessage,
          type: error.type,
          severity: error.context.severity
        }
      });
    }
  }

  showRetryMessage(error, attempt) {
    const message = `Tentativa ${attempt}/3: ${error.userFriendlyMessage}`;
    
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.sendMessage({
        type: 'SHOW_RETRY',
        message: message,
        attempt: attempt
      });
    }
  }

  showFallbackExplanation() {
    return {
      type: 'fallback',
      explanation: 'Análise básica disponível. Para análise completa, tente novamente em alguns momentos.',
      features: ['syntax_highlighting', 'basic_structure']
    };
  }

  showTimeoutMessage() {
    return {
      type: 'timeout',
      message: 'A análise está demorando mais que o esperado. Você pode tentar com um código menor ou aguardar.',
      suggestion: 'Tente selecionar uma função específica para análise mais rápida.'
    };
  }

  showSimplifiedAnalysis() {
    return {
      type: 'simplified',
      message: 'Código muito complexo detectado. Mostrando análise simplificada.',
      explanation: 'Para análise completa, considere dividir o código em funções menores.'
    };
  }

  showChunkedAnalysis() {
    return {
      type: 'chunked',
      message: 'Código muito grande. Analisando por seções.',
      suggestion: 'A análise será dividida em partes menores para melhor compreensão.'
    };
  }

  reportError(error) {
    // Privacy-preserving error reporting
    const reportData = {
      errorType: error.type,
      severity: error.context.severity,
      timestamp: error.timestamp,
      userAgent: navigator.userAgent,
      chromeVersion: this.getChromeVersion(),
      extensionVersion: chrome.runtime.getManifest().version,
      // NO CODE CONTENT OR PERSONAL DATA
    };

    // Send to analytics (if enabled)
    if (this.isAnalyticsEnabled()) {
      this.sendAnalyticsReport(reportData);
    }
  }

  getChromeVersion() {
    const match = navigator.userAgent.match(/Chrome\/(\d+)/);
    return match ? match[1] : 'unknown';
  }

  isAnalyticsEnabled() {
    // Check user preferences for analytics
    return localStorage.getItem('devmentor_analytics_enabled') === 'true';
  }

  sendAnalyticsReport(data) {
    // Send to your analytics endpoint
    fetch('https://analytics.devmentor.ai/errors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    }).catch(() => {
      // Silently fail - analytics should never break the app
    });
  }

  // Utility methods for common error scenarios
  static createAIError(message, context = {}) {
    return new DevMentorError(
      ERROR_TYPES.AI_UNAVAILABLE,
      message,
      'Problema com o sistema de IA. Tentando novamente...',
      context
    );
  }

  static createCodeError(message, context = {}) {
    return new DevMentorError(
      ERROR_TYPES.CODE_TOO_COMPLEX,
      message,
      'Código muito complexo para análise completa.',
      context
    );
  }

  static createNetworkError(message, context = {}) {
    return new DevMentorError(
      ERROR_TYPES.NETWORK_ERROR,
      message,
      'Problema de conexão. Funcionando em modo offline.',
      context
    );
  }

  // Cleanup method
  cleanup() {
    this.errorLog = [];
    this.retryAttempts.clear();
  }
}

// Global error handler instance
export const errorHandler = new ErrorHandler();

// Global error handler for unhandled errors
window.addEventListener('error', (event) => {
  errorHandler.handleError(event.error, {
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno
  });
});

// Global handler for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  errorHandler.handleError(event.reason, {
    type: 'unhandled_promise_rejection'
  });
});

export default errorHandler;


<<<<<<< HEAD







=======
>>>>>>> b285e24 ( HOTFIX: Aplicar correções críticas de segurança)
