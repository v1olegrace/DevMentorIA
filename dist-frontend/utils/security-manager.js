/**
 * DevMentor AI - Security Manager
 * Gerenciador de segurança que bloqueia eval e fornece alternativas seguras
 */

class SecurityManager {
  constructor() {
    this.evalBlocked = true; // Bloquear eval por padrão
    this.functionBlocked = true; // Bloquear Function constructor por padrão
    this.allowedOperations = new Set(['parseInt', 'parseFloat', 'Number', 'String', 'Boolean', 'Math', 'Date', 'JSON']);
    this.blockedOperations = new Set(['eval', 'Function', 'setTimeout', 'setInterval', 'require', 'import', 'window', 'document']);
    this.init();
  }

  init() {
    // Override global eval para prevenir uso acidental
    const originalEval = window.eval;
    window.eval = (code) => {
      if (this.evalBlocked) {
        const logger = window.secureLogger || console;
        logger.error('[SecurityManager] Attempted to use eval() while blocked. Code:', code);
        throw new SecurityError('eval() is blocked for security reasons. Use safeEvalExpression instead.');
      }
      return originalEval(code);
    };

    // Override Function constructor
    const originalFunction = window.Function;
    window.Function = (...args) => {
      if (this.functionBlocked) {
        const logger = window.secureLogger || console;
        logger.error('[SecurityManager] Attempted to use Function() constructor while blocked. Args:', args);
        throw new SecurityError('Function() constructor is blocked for security reasons. Use safeEvalExpression instead.');
      }
      return originalFunction(...args);
    };

    // Bloquear setTimeout/setInterval com strings
    const originalSetTimeout = window.setTimeout;
    window.setTimeout = (handler, timeout, ...args) => {
      if (typeof handler === 'string') {
        const logger = window.secureLogger || console;
        logger.error('[SecurityManager] Attempted to use setTimeout with string handler:', handler);
        throw new SecurityError('setTimeout with string handler is blocked for security reasons.');
      }
      return originalSetTimeout(handler, timeout, ...args);
    };

    const originalSetInterval = window.setInterval;
    window.setInterval = (handler, timeout, ...args) => {
      if (typeof handler === 'string') {
        const logger = window.secureLogger || console;
        logger.error('[SecurityManager] Attempted to use setInterval with string handler:', handler);
        throw new SecurityError('setInterval with string handler is blocked for security reasons.');
      }
      return originalSetInterval(handler, timeout, ...args);
    };
  }

  blockEval(shouldBlock = true) {
    this.evalBlocked = shouldBlock;
    const logger = window.secureLogger || console;
    logger.warn(`[SecurityManager] eval() and Function() constructor are now ${shouldBlock ? 'BLOCKED' : 'UNBLOCKED'}.`);
  }

  blockFunction(shouldBlock = true) {
    this.functionBlocked = shouldBlock;
    const logger = window.secureLogger || console;
    logger.warn(`[SecurityManager] Function() constructor is now ${shouldBlock ? 'BLOCKED' : 'UNBLOCKED'}.`);
  }

  safeEvalExpression(expression, context = {}) {
    try {
      // Validar entrada
      if (typeof expression !== 'string') {
        throw new Error('Expression must be a string');
      }

      // Sanitizar expressão
      const sanitized = this.sanitizeExpression(expression);
      
      // Verificar se é seguro
      if (!this.isExpressionSafe(sanitized)) {
        throw new SecurityError('Expression contains unsafe operations');
      }

      // Criar contexto seguro
      const safeContext = this.createSafeContext(context);
      
      // Avaliar de forma segura usando EvalManager
      if (typeof __DEVMENTOR_EVAL_MANAGER !== 'undefined') {
        return __DEVMENTOR_EVAL_MANAGER.safeEval(sanitized, safeContext);
      } else {
        throw new SecurityError('EvalManager not available. Cannot safely evaluate expression.');
      }
      
    } catch (error) {
      const logger = window.secureLogger || console;
      logger.error('[SecurityManager] safeEvalExpression failed:', error);
      throw new Error(`Failed to safely evaluate expression: ${error.message}`);
    }
  }

  sanitizeExpression(expr) {
    return expr
      .replace(/[;{}]/g, '')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*$/gm, '')
      .trim();
  }

  isExpressionSafe(expr) {
    for (const blocked of this.blockedOperations) {
      if (expr.includes(blocked)) return false;
    }
    
    const dangerousPatterns = [
      /\.prototype\./,
      /__proto__/,
      /constructor/,
      /\.call\(/,
      /\.apply\(/,
      /new\s+\w+\(/,
      /import\s*\(/,
      /require\s*\(/,
      /window\./,
      /document\./,
      /global\./,
      /process\./
    ];
    
    return !dangerousPatterns.some(pattern => pattern.test(expr));
  }

  createSafeContext(userContext = {}) {
    const safeContext = {
      Math: Math,
      parseInt: parseInt,
      parseFloat: parseFloat,
      Number: Number,
      String: String,
      Boolean: Boolean,
      Date: Date,
      JSON: JSON,
      Array: Array,
      Object: Object,
      NaN: NaN,
      Infinity: Infinity,
      undefined: undefined,
      null: null,
      true: true,
      false: false
    };

    // Adicionar contexto do usuário (sanitizado)
    Object.keys(userContext).forEach(key => {
      if (this.isValueSafe(userContext[key])) {
        safeContext[key] = userContext[key];
      }
    });

    return safeContext;
  }

  isValueSafe(value) {
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' || 
        value === null || value === undefined) {
      return true;
    }
    
    if (Array.isArray(value)) {
      return value.every(item => this.isValueSafe(item));
    }
    
    if (typeof value === 'object') {
      return Object.values(value).every(val => this.isValueSafe(val));
    }
    
    return false;
  }

  // Método para permitir eval temporariamente (apenas para desenvolvimento)
  allowEvalTemporarily(duration = 5000) {
    if (typeof window !== 'undefined' && window.DEVMENTOR_CONFIG?.DEBUG) {
      this.blockEval(false);
      setTimeout(() => {
        this.blockEval(true);
        const logger = window.secureLogger || console;
        logger.warn('[SecurityManager] eval() blocked again after temporary allowance.');
      }, duration);
    }
  }
}

// Classe de erro personalizada para erros de segurança
class SecurityError extends Error {
  constructor(message) {
    super(message);
    this.name = 'SecurityError';
    this.isSecurityError = true;
  }
}

// Inicializar SecurityManager global
const securityManager = new SecurityManager();

// Exportar para diferentes contextos
if (typeof window !== 'undefined') {
  window.SecurityManager = securityManager;
  window.SecurityError = SecurityError;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SecurityManager, SecurityError };
}

// Exportar para uso global
window.securityManager = securityManager;