/**
 * DevMentor AI - EvalManager Conservador
 * Sistema de avaliação segura com fallback server-side
 * Impede execução arbitrária e permite apenas expressões simples
 */

class EvalManager {
  constructor() {
    this.logger = (typeof window !== 'undefined' && window.secureLogger) || {
      debug: (...args) => console.debug(...args),
      info: (...args) => console.info(...args),
      warn: (...args) => console.warn(...args),
      error: (...args) => console.error(...args)
    };
    
    this.fallbackEndpoint = '/api/sandbox-eval';
    this.fallbackEnabled = true;
    this.maxExpressionLength = 1000;
    this.maxNestingDepth = 3;
    
    // Tokens completamente proibidos
    this.forbiddenTokens = new Set([
      'eval', 'Function', 'setTimeout', 'setInterval', 'setImmediate',
      'require', 'import', 'module', 'exports', 'global', 'process',
      'window', 'document', 'location', 'history', 'navigator',
      'fetch', 'XMLHttpRequest', 'WebSocket', 'Worker',
      'constructor', 'prototype', '__proto__', '__defineGetter__', '__defineSetter__',
      'call', 'apply', 'bind', 'toString', 'valueOf',
      'delete', 'new', 'this', 'super', 'arguments',
      'with', 'debugger', 'yield', 'await', 'async'
    ]);
    
    // Operações permitidas (apenas matemáticas e acesso a propriedades)
    this.allowedOperations = new Set([
      '+', '-', '*', '/', '%', '**', '===', '!==', '==', '!=',
      '<', '>', '<=', '>=', '&&', '||', '!', '?', ':',
      '(', ')', '[', ']', '.', ',', ';'
    ]);
    
    // Funções nativas seguras permitidas
    this.safeFunctions = new Set([
      'parseInt', 'parseFloat', 'Number', 'String', 'Boolean',
      'Math.abs', 'Math.floor', 'Math.ceil', 'Math.round', 'Math.max', 'Math.min',
      'Math.sin', 'Math.cos', 'Math.tan', 'Math.sqrt', 'Math.pow',
      'Date.now', 'Date.parse', 'JSON.parse', 'JSON.stringify',
      'Array.isArray', 'Object.keys', 'Object.values', 'Object.entries'
    ]);
    
    this.initialize();
  }

  initialize() {
    // Bloquear eval global
    if (typeof window !== 'undefined') {
      this.blockGlobalEval();
    }
    
    this.logger.info('[EvalManager] Initialized with conservative security policy');
  }

  blockGlobalEval() {
    const originalEval = window.eval;
    const originalFunction = window.Function;
    
    window.eval = (code) => {
      this.logger.error('[EvalManager] Blocked direct eval() call:', code);
      throw new SecurityError('Direct eval() is blocked. Use EvalManager.safeEval() instead.');
    };
    
    window.Function = (...args) => {
      this.logger.error('[EvalManager] Blocked Function constructor:', args);
      throw new SecurityError('Function constructor is blocked. Use EvalManager.safeEval() instead.');
    };
    
    // Preservar referências originais para uso interno
    this._originalEval = originalEval;
    this._originalFunction = originalFunction;
  }

  /**
   * Avalia uma expressão de forma segura com fallback server-side
   * @param {string} expression - Expressão para avaliar
   * @param {object} context - Contexto de variáveis disponíveis
   * @param {object} options - Opções de avaliação
   * @returns {Promise<any>} Resultado da avaliação
   */
  async safeEval(expression, context = {}, options = {}) {
    try {
      // Validações básicas
      this.validateExpression(expression);
      
      // Tentar avaliação local segura primeiro
      const localResult = this.evaluateLocally(expression, context, options);
      
      this.logger.debug('[EvalManager] Local evaluation successful:', { expression, result: localResult });
      return localResult;
      
    } catch (localError) {
      this.logger.warn('[EvalManager] Local evaluation failed, trying fallback:', localError.message);
      
      // Se avaliação local falhar, tentar fallback server-side
      if (this.fallbackEnabled && options.allowFallback !== false) {
        try {
          const fallbackResult = await this.evaluateWithFallback(expression, context, options);
          this.logger.info('[EvalManager] Fallback evaluation successful');
          return fallbackResult;
        } catch (fallbackError) {
          this.logger.error('[EvalManager] Fallback evaluation failed:', fallbackError.message);
          throw new Error(`Expression evaluation failed: ${fallbackError.message}`);
        }
      } else {
        throw new Error(`Expression evaluation failed: ${localError.message}`);
      }
    }
  }

  validateExpression(expression) {
    if (typeof expression !== 'string') {
      throw new Error('Expression must be a string');
    }
    
    if (expression.trim().length === 0) {
      throw new Error('Expression cannot be empty');
    }
    
    if (expression.length > this.maxExpressionLength) {
      throw new Error(`Expression too long (max ${this.maxExpressionLength} characters)`);
    }
    
    // Verificar tokens proibidos
    const tokens = this.tokenize(expression);
    for (const token of tokens) {
      if (this.forbiddenTokens.has(token.toLowerCase())) {
        throw new SecurityError(`Forbidden token detected: ${token}`);
      }
    }
    
    // Verificar profundidade de aninhamento
    const nestingDepth = this.calculateNestingDepth(expression);
    if (nestingDepth > this.maxNestingDepth) {
      throw new Error(`Expression too complex (max nesting depth: ${this.maxNestingDepth})`);
    }
    
    // Verificar se contém apenas operações permitidas
    if (!this.containsOnlyAllowedOperations(expression)) {
      throw new SecurityError('Expression contains forbidden operations');
    }
  }

  tokenize(expression) {
    // Tokenização simples para verificação de segurança
    return expression
      .replace(/[^\w\s]/g, ' $& ')
      .split(/\s+/)
      .filter(token => token.length > 0);
  }

  calculateNestingDepth(expression) {
    let maxDepth = 0;
    let currentDepth = 0;
    
    for (const char of expression) {
      if (char === '(' || char === '[' || char === '{') {
        currentDepth++;
        maxDepth = Math.max(maxDepth, currentDepth);
      } else if (char === ')' || char === ']' || char === '}') {
        currentDepth--;
      }
    }
    
    return maxDepth;
  }

  containsOnlyAllowedOperations(expression) {
    // Verificar se a expressão contém apenas operações matemáticas básicas
    // e acesso a propriedades seguras
    
    // Permitir apenas números, operadores matemáticos, parênteses e pontos
    const allowedPattern = /^[0-9+\-*/().\s,;:?!=<>&|\[\]a-zA-Z_$]+$/;
    
    if (!allowedPattern.test(expression)) {
      return false;
    }
    
    // Verificar se não contém chamadas de função suspeitas
    const functionCallPattern = /\w+\s*\(/g;
    const matches = expression.match(functionCallPattern);
    
    if (matches) {
      for (const match of matches) {
        const functionName = match.replace(/\s*\(/, '');
        if (!this.safeFunctions.has(functionName)) {
          return false;
        }
      }
    }
    
    return true;
  }

  evaluateLocally(expression, context, options) {
    try {
      // Criar contexto seguro
      const safeContext = this.createSafeContext(context);
      
      // Usar Function constructor de forma controlada
      const keys = Object.keys(safeContext);
      const values = Object.values(safeContext);
      
      // Criar função com contexto limitado
      const func = this._originalFunction(...keys, `return ${expression};`);
      
      // Executar com contexto seguro
      const result = func(...values);
      
      // Validar resultado
      this.validateResult(result);
      
      return result;
      
    } catch (error) {
      throw new Error(`Local evaluation failed: ${error.message}`);
    }
  }

  createSafeContext(userContext = {}) {
    const safeContext = {
      // Constantes matemáticas
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
      
      // Constantes
      NaN: NaN,
      Infinity: Infinity,
      undefined: undefined,
      null: null,
      true: true,
      false: false,
      
      // Constantes matemáticas específicas
      PI: Math.PI,
      E: Math.E,
      LN2: Math.LN2,
      LN10: Math.LN10,
      LOG2E: Math.LOG2E,
      LOG10E: Math.LOG10E,
      SQRT2: Math.SQRT2,
      SQRT1_2: Math.SQRT1_2
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
    // Verificar se o valor é seguro para incluir no contexto
    if (value === null || value === undefined) {
      return true;
    }
    
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return true;
    }
    
    if (Array.isArray(value)) {
      return value.every(item => this.isValueSafe(item));
    }
    
    if (typeof value === 'object') {
      // Permitir apenas objetos simples sem métodos
      const hasMethods = Object.values(value).some(val => typeof val === 'function');
      if (hasMethods) {
        return false;
      }
      
      return Object.values(value).every(val => this.isValueSafe(val));
    }
    
    return false;
  }

  validateResult(result) {
    // Verificar se o resultado é seguro
    if (typeof result === 'function') {
      throw new SecurityError('Result cannot be a function');
    }
    
    if (result && typeof result === 'object' && result.constructor && result.constructor.name !== 'Object') {
      throw new SecurityError('Result cannot be a complex object');
    }
    
    // Verificar tamanho do resultado
    const resultString = JSON.stringify(result);
    if (resultString.length > 10000) {
      throw new Error('Result too large');
    }
  }

  async evaluateWithFallback(expression, context, options) {
    try {
      const response = await fetch(this.fallbackEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({
          expression: expression,
          context: this.sanitizeContextForFallback(context),
          options: {
            timeout: options.timeout || 5000,
            maxMemory: options.maxMemory || '10MB'
          }
        })
      });
      
      if (!response.ok) {
        throw new Error(`Fallback server responded with status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.error) {
        throw new Error(`Fallback server error: ${result.error}`);
      }
      
      // Validar resultado do servidor
      this.validateResult(result.value);
      
      return result.value;
      
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Fallback server unavailable');
      }
      throw error;
    }
  }

  sanitizeContextForFallback(context) {
    // Sanitizar contexto antes de enviar para o servidor
    const sanitized = {};
    
    Object.keys(context).forEach(key => {
      if (this.isValueSafe(context[key])) {
        sanitized[key] = context[key];
      }
    });
    
    return sanitized;
  }

  // Método para registrar função de fallback personalizada
  registerFallback(fallbackFunction) {
    if (typeof fallbackFunction !== 'function') {
      throw new Error('Fallback must be a function');
    }
    
    this.customFallback = fallbackFunction;
    this.logger.info('[EvalManager] Custom fallback registered');
  }

  // Método para configurar endpoint de fallback
  setFallbackEndpoint(endpoint) {
    this.fallbackEndpoint = endpoint;
    this.logger.info('[EvalManager] Fallback endpoint set to:', endpoint);
  }

  // Método para habilitar/desabilitar fallback
  setFallbackEnabled(enabled) {
    this.fallbackEnabled = enabled;
    this.logger.info('[EvalManager] Fallback enabled:', enabled);
  }

  // Método para obter estatísticas
  getStats() {
    return {
      fallbackEnabled: this.fallbackEnabled,
      fallbackEndpoint: this.fallbackEndpoint,
      maxExpressionLength: this.maxExpressionLength,
      maxNestingDepth: this.maxNestingDepth,
      forbiddenTokensCount: this.forbiddenTokens.size,
      safeFunctionsCount: this.safeFunctions.size
    };
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

// Inicializar EvalManager global
const evalManager = new EvalManager();

// Exportar para diferentes contextos
if (typeof window !== 'undefined') {
  window.EvalManager = evalManager;
  window.SecurityError = SecurityError;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { EvalManager, SecurityError };
}

// Exportar para uso global
window.evalManager = evalManager;



