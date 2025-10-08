/**
 * DevMentor AI - Logger Central com Redaction
 * Sistema de logging seguro que evita vazamentos e controla níveis em produção
 * Suporte completo a debug/info/warn/error com redaction automática
 */

class DevMentorLogger {
  constructor() {
    this.levels = {
      DEBUG: 0,
      INFO: 1,
      WARN: 2,
      ERROR: 3,
      CRITICAL: 4
    };
    
    this.currentLevel = this.getDefaultLevel();
    this.maxLogLength = 2000;
    this.enableRedaction = true;
    
    // Padrões de redaction por padrão
    this.secretPatterns = [
      // API Keys e tokens
      /api[_-]?key["\s]*[:=]["\s]*([^"'\s,}]+)/gi,
      /secret["\s]*[:=]["\s]*([^"'\s,}]+)/gi,
      /token["\s]*[:=]["\s]*([^"'\s,}]+)/gi,
      /bearer\s+([a-zA-Z0-9\-._~+/]+=*)/gi,
      /authorization["\s]*[:=]["\s]*([^"'\s,}]+)/gi,
      
      // Chaves específicas
      /sk-[a-zA-Z0-9]{20,}/gi,
      /pk_[a-zA-Z0-9]{20,}/gi,
      /[a-zA-Z0-9]{32,}/g, // Strings longas que podem ser chaves
      
      // URLs com credenciais
      /https?:\/\/[^:]+:[^@]+@/gi,
      
      // Padrões de senha
      /password["\s]*[:=]["\s]*([^"'\s,}]+)/gi,
      /passwd["\s]*[:=]["\s]*([^"'\s,}]+)/gi,
      /pwd["\s]*[:=]["\s]*([^"'\s,}]+)/gi,
      
      // Padrões de credenciais
      /credentials["\s]*[:=]["\s]*([^"'\s,}]+)/gi,
      /auth["\s]*[:=]["\s]*([^"'\s,}]+)/gi,
      
      // Padrões de sessão
      /session[_-]?id["\s]*[:=]["\s]*([^"'\s,}]+)/gi,
      /sessionid["\s]*[:=]["\s]*([^"'\s,}]+)/gi,
      
      // Padrões de cookie
      /cookie["\s]*[:=]["\s]*([^"'\s,}]+)/gi,
      
      // Padrões de JWT
      /eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/g
    ];
    
    // Padrões customizados registrados pelo usuário
    this.customPatterns = new Set();
    
    this.initialize();
  }

  initialize() {
    // Detectar ambiente e configurar nível apropriado
    this.detectEnvironment();
    
    // Configurar redaction baseada no ambiente
    this.configureRedaction();
    
    // Log de inicialização (sem dados sensíveis)
    this.info('[DevMentorLogger] Initialized', {
      level: this.getCurrentLevelName(),
      redactionEnabled: this.enableRedaction,
      environment: this.getEnvironment()
    });
  }

  getDefaultLevel() {
    // Detectar ambiente e definir nível apropriado
    if (this.isDevelopment()) {
      return this.levels.DEBUG;
    } else if (this.isTesting()) {
      return this.levels.WARN;
    } else {
      return this.levels.INFO;
    }
  }

  detectEnvironment() {
    this.environment = 'production'; // Default
    
    if (typeof window !== 'undefined') {
      if (window.DEVMENTOR_CONFIG?.DEBUG || window.location.hostname === 'localhost') {
        this.environment = 'development';
      }
    }
    
    if (typeof process !== 'undefined' && process.env) {
      if (process.env.NODE_ENV === 'development') {
        this.environment = 'development';
      } else if (process.env.NODE_ENV === 'test') {
        this.environment = 'testing';
      }
    }
  }

  configureRedaction() {
    // Em desenvolvimento, redaction pode ser menos rigorosa
    if (this.environment === 'development') {
      this.enableRedaction = true; // Manter redaction mesmo em dev
    } else {
      this.enableRedaction = true; // Sempre habilitado em produção
    }
  }

  isDevelopment() {
    return this.environment === 'development';
  }

  isTesting() {
    return this.environment === 'testing';
  }

  getEnvironment() {
    return this.environment;
  }

  /**
   * Define o nível de log atual
   * @param {string|number} level - Nível de log (DEBUG, INFO, WARN, ERROR, CRITICAL)
   */
  setLevel(level) {
    if (typeof level === 'string') {
      const upperLevel = level.toUpperCase();
      if (this.levels[upperLevel] !== undefined) {
        this.currentLevel = this.levels[upperLevel];
        this.info(`[DevMentorLogger] Log level changed to: ${upperLevel}`);
      } else {
        this.warn(`[DevMentorLogger] Invalid log level: ${level}. Available levels: ${Object.keys(this.levels).join(', ')}`);
      }
    } else if (typeof level === 'number' && level >= 0 && level <= 4) {
      this.currentLevel = level;
      this.info(`[DevMentorLogger] Log level changed to: ${level}`);
    } else {
      this.warn(`[DevMentorLogger] Invalid log level: ${level}. Must be 0-4 or string.`);
    }
  }

  getCurrentLevelName() {
    for (const [name, value] of Object.entries(this.levels)) {
      if (value === this.currentLevel) {
        return name;
      }
    }
    return 'UNKNOWN';
  }

  /**
   * Verifica se deve fazer log para o nível especificado
   * @param {number} level - Nível a verificar
   * @returns {boolean} Se deve fazer log
   */
  shouldLog(level) {
    return level >= this.currentLevel;
  }

  /**
   * Redaction de dados sensíveis
   * @param {any} data - Dados para redaction
   * @returns {any} Dados com redaction aplicada
   */
  redact(data) {
    if (!this.enableRedaction) {
      return data;
    }

    if (typeof data === 'string') {
      return this.redactString(data);
    }

    if (typeof data === 'object' && data !== null) {
      return this.redactObject(data);
    }

    return data;
  }

  redactString(str) {
    let redacted = String(str);

    // Aplicar padrões de redaction
    this.secretPatterns.forEach(pattern => {
      redacted = redacted.replace(pattern, (match, capture) => {
        if (capture) {
          return match.replace(capture, '[REDACTED]');
        }
        return '[REDACTED]';
      });
    });

    // Aplicar padrões customizados
    this.customPatterns.forEach(pattern => {
      if (pattern instanceof RegExp) {
        redacted = redacted.replace(pattern, '[REDACTED]');
      } else if (typeof pattern === 'string') {
        const regex = new RegExp(pattern, 'gi');
        redacted = redacted.replace(regex, '[REDACTED]');
      }
    });

    // Truncar se muito longo
    if (redacted.length > this.maxLogLength) {
      redacted = redacted.substring(0, this.maxLogLength) + '...[TRUNCATED]';
    }

    return redacted;
  }

  redactObject(obj) {
    if (Array.isArray(obj)) {
      return obj.map(item => this.redact(item));
    }

    const redacted = { ...obj };
    const sensitiveKeys = [
      'apiKey', 'secret', 'password', 'token', 'credentials',
      'auth', 'authorization', 'sessionId', 'cookie',
      'privateKey', 'publicKey', 'accessToken', 'refreshToken'
    ];

    // Redaction de propriedades sensíveis
    sensitiveKeys.forEach(key => {
      if (redacted[key]) {
        redacted[key] = '[REDACTED]';
      }
    });

    // Redaction recursiva de propriedades aninhadas
    Object.keys(redacted).forEach(key => {
      if (typeof redacted[key] === 'object' && redacted[key] !== null) {
        redacted[key] = this.redact(redacted[key]);
      }
    });

    return redacted;
  }

  /**
   * Formata mensagem de log
   * @param {string} level - Nível do log
   * @param {string} message - Mensagem principal
   * @param {...any} args - Argumentos adicionais
   * @returns {Array} Array formatado para console
   */
  formatMessage(level, message, ...args) {
    const timestamp = new Date().toISOString();
    const levelName = level.toUpperCase();
    const prefix = `[${timestamp}] [${levelName}]`;
    
    const redactedArgs = args.map(arg => this.redact(arg));
    
    return [prefix, message, ...redactedArgs];
  }

  /**
   * Log de debug
   * @param {string} message - Mensagem
   * @param {...any} args - Argumentos adicionais
   */
  debug(message, ...args) {
    if (!this.shouldLog(this.levels.DEBUG)) return;
    
    const formatted = this.formatMessage('debug', message, ...args);
    console.debug(...formatted);
  }

  /**
   * Log de informação
   * @param {string} message - Mensagem
   * @param {...any} args - Argumentos adicionais
   */
  info(message, ...args) {
    if (!this.shouldLog(this.levels.INFO)) return;
    
    const formatted = this.formatMessage('info', message, ...args);
    console.info(...formatted);
  }

  /**
   * Log de aviso
   * @param {string} message - Mensagem
   * @param {...any} args - Argumentos adicionais
   */
  warn(message, ...args) {
    if (!this.shouldLog(this.levels.WARN)) return;
    
    const formatted = this.formatMessage('warn', message, ...args);
    console.warn(...formatted);
  }

  /**
   * Log de erro
   * @param {string} message - Mensagem
   * @param {...any} args - Argumentos adicionais
   */
  error(message, ...args) {
    if (!this.shouldLog(this.levels.ERROR)) return;
    
    const formatted = this.formatMessage('error', message, ...args);
    console.error(...formatted);
  }

  /**
   * Log crítico
   * @param {string} message - Mensagem
   * @param {...any} args - Argumentos adicionais
   */
  critical(message, ...args) {
    if (!this.shouldLog(this.levels.CRITICAL)) return;
    
    const formatted = this.formatMessage('critical', message, ...args);
    console.error(...formatted);
    
    // Em caso de erro crítico, tentar reportar
    this.reportCriticalError(message, args);
  }

  /**
   * Registra padrão customizado para redaction
   * @param {string|RegExp} pattern - Padrão para redaction
   */
  registerSecretPattern(pattern) {
    if (typeof pattern === 'string' || pattern instanceof RegExp) {
      this.customPatterns.add(pattern);
      this.info('[DevMentorLogger] Custom secret pattern registered');
    } else {
      this.warn('[DevMentorLogger] Invalid pattern type. Must be string or RegExp.');
    }
  }

  /**
   * Remove padrão customizado de redaction
   * @param {string|RegExp} pattern - Padrão para remover
   */
  unregisterSecretPattern(pattern) {
    this.customPatterns.delete(pattern);
    this.info('[DevMentorLogger] Custom secret pattern unregistered');
  }

  /**
   * Habilita ou desabilita redaction
   * @param {boolean} enabled - Se deve habilitar redaction
   */
  setRedactionEnabled(enabled) {
    this.enableRedaction = enabled;
    this.info(`[DevMentorLogger] Redaction ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Define tamanho máximo de log
   * @param {number} maxLength - Tamanho máximo em caracteres
   */
  setMaxLogLength(maxLength) {
    if (typeof maxLength === 'number' && maxLength > 0) {
      this.maxLogLength = maxLength;
      this.info(`[DevMentorLogger] Max log length set to: ${maxLength}`);
    } else {
      this.warn('[DevMentorLogger] Invalid max log length. Must be positive number.');
    }
  }

  /**
   * Reporta erro crítico para serviço de monitoramento
   * @param {string} message - Mensagem do erro
   * @param {Array} args - Argumentos do erro
   */
  reportCriticalError(message, args) {
    try {
      const errorReport = {
        message: this.redact(message),
        timestamp: new Date().toISOString(),
        environment: this.getEnvironment(),
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
        url: typeof window !== 'undefined' ? window.location.href : 'unknown',
        level: 'CRITICAL'
      };

      // Aqui você pode implementar envio para serviço de monitoramento
      // fetch('/api/error-report', { method: 'POST', body: JSON.stringify(errorReport) });
      
      this.info('[DevMentorLogger] Critical error reported:', errorReport);
      
    } catch (e) {
      // Falha silenciosa para não causar loops
      console.error('[DevMentorLogger] Failed to report critical error:', e);
    }
  }

  /**
   * Obtém estatísticas do logger
   * @returns {object} Estatísticas do logger
   */
  getStats() {
    return {
      currentLevel: this.getCurrentLevelName(),
      environment: this.getEnvironment(),
      redactionEnabled: this.enableRedaction,
      maxLogLength: this.maxLogLength,
      secretPatternsCount: this.secretPatterns.length,
      customPatternsCount: this.customPatterns.size
    };
  }

  /**
   * Limpa logs antigos (se implementado cache)
   */
  clearLogs() {
    // Implementar limpeza de logs se necessário
    this.info('[DevMentorLogger] Logs cleared');
  }
}

// Inicializar logger global
const devMentorLogger = new DevMentorLogger();

// Exportar para diferentes contextos
if (typeof window !== 'undefined') {
  window.__DEVMENTOR_LOGGER = devMentorLogger;
  window.DevMentorLogger = devMentorLogger;
}

if (typeof globalThis !== 'undefined') {
  globalThis.__DEVMENTOR_LOGGER = devMentorLogger;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = devMentorLogger;
}

// Exportar para uso global
window.devMentorLogger = devMentorLogger;