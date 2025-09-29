/**
 * DevMentor AI - Sistema de Validação de Entrada Robusto
 * Valida e sanitiza todas as entradas do usuário
 * Implementação baseada nas recomendações de auditoria
 */

class RobustInputValidator {
  constructor() {
    this.logger = (typeof __DEVMENTOR_LOGGER !== 'undefined') ? __DEVMENTOR_LOGGER : console;
    this.limits = this.getDefaultLimits();
    this.patterns = this.getValidationPatterns();
    this.cache = new Map();
    this.validationStats = {
      totalValidations: 0,
      passedValidations: 0,
      failedValidations: 0,
      blockedAttempts: 0
    };
    
    this.initialize();
  }

  getDefaultLimits() {
    return {
      // Limites de tamanho
      maxCodeLength: 50000,
      maxPromptLength: 10000,
      maxImageSize: 10000000, // 10MB
      maxFileNameLength: 255,
      maxUrlLength: 2048,
      
      // Limites de quantidade
      maxArrayLength: 1000,
      maxObjectKeys: 100,
      maxNestingDepth: 10,
      
      // Limites de tempo
      maxProcessingTime: 30000, // 30 segundos
      maxRequestTimeout: 10000, // 10 segundos
      
      // Limites de recursos
      maxMemoryUsage: 100 * 1024 * 1024, // 100MB
      maxCpuUsage: 0.8, // 80%
      
      // Limites de taxa
      maxRequestsPerMinute: 60,
      maxRequestsPerHour: 1000
    };
  }

  getValidationPatterns() {
    return {
      // Padrões de código
      code: {
        allowedLanguages: ['javascript', 'python', 'java', 'cpp', 'c', 'csharp', 'php', 'ruby', 'go', 'rust', 'typescript', 'html', 'css', 'sql'],
        dangerousPatterns: [
          /eval\s*\(/gi,
          /new\s+Function\s*\(/gi,
          /setTimeout\s*\(\s*["']/gi,
          /setInterval\s*\(\s*["']/gi,
          /require\s*\(/gi,
          /import\s*\(/gi,
          /process\./gi,
          /global\./gi,
          /window\./gi,
          /document\./gi
        ]
      },
      
      // Padrões de HTML
      html: {
        allowedTags: ['p', 'div', 'span', 'br', 'hr', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'ul', 'ol', 'li', 'b', 'i', 'strong', 'em', 'code', 'pre', 'blockquote'],
        dangerousPatterns: [
          /<script[^>]*>.*?<\/script>/gi,
          /<iframe[^>]*>/gi,
          /<object[^>]*>/gi,
          /<embed[^>]*>/gi,
          /<form[^>]*>/gi,
          /<input[^>]*>/gi,
          /<button[^>]*>/gi,
          /on\w+\s*=/gi,
          /javascript:/gi,
          /vbscript:/gi
        ]
      },
      
      // Padrões de URL
      url: {
        allowedProtocols: ['http:', 'https:', 'data:'],
        dangerousPatterns: [
          /javascript:/gi,
          /vbscript:/gi,
          /data:text\/html/gi,
          /data:application\/javascript/gi
        ]
      },
      
      // Padrões de arquivo
      file: {
        allowedExtensions: ['.js', '.ts', '.py', '.java', '.cpp', '.c', '.cs', '.php', '.rb', '.go', '.rs', '.html', '.css', '.sql', '.json', '.xml', '.txt', '.md'],
        dangerousExtensions: ['.exe', '.bat', '.cmd', '.scr', '.pif', '.com', '.vbs', '.js', '.jar', '.war'],
        maxFileSize: 10000000 // 10MB
      },
      
      // Padrões de dados sensíveis
      sensitive: {
        patterns: [
          /password\s*[:=]\s*["'][^"']+["']/gi,
          /api[_-]?key\s*[:=]\s*["'][^"']+["']/gi,
          /secret\s*[:=]\s*["'][^"']+["']/gi,
          /token\s*[:=]\s*["'][^"']+["']/gi,
          /sk-[a-zA-Z0-9]{20,}/gi,
          /pk_[a-zA-Z0-9]{20,}/gi,
          /eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/g
        ]
      }
    };
  }

  initialize() {
    this.logger.info('[RobustInputValidator] Initializing robust input validation');
    
    // Iniciar monitoramento de recursos
    this.startResourceMonitoring();
    
    // Iniciar limpeza de cache
    this.startCacheCleanup();
    
    this.logger.info('[RobustInputValidator] Robust input validation initialized');
  }

  startResourceMonitoring() {
    setInterval(() => {
      this.monitorResources();
    }, 5000); // Monitorar a cada 5 segundos
  }

  startCacheCleanup() {
    setInterval(() => {
      this.cleanupCache();
    }, 300000); // Limpar cache a cada 5 minutos
  }

  /**
   * Validar entrada principal
   */
  async validateInput(input, type, options = {}) {
    this.validationStats.totalValidations++;
    
    try {
      // Validações básicas
      const basicValidation = this.validateBasic(input, type);
      if (!basicValidation.valid) {
        this.validationStats.failedValidations++;
        return basicValidation;
      }
      
      // Validações específicas por tipo
      const specificValidation = await this.validateSpecific(input, type, options);
      if (!specificValidation.valid) {
        this.validationStats.failedValidations++;
        return specificValidation;
      }
      
      // Validações de segurança
      const securityValidation = this.validateSecurity(input, type);
      if (!securityValidation.valid) {
        this.validationStats.blockedAttempts++;
        return securityValidation;
      }
      
      // Validações de recursos
      const resourceValidation = await this.validateResources(input, type);
      if (!resourceValidation.valid) {
        this.validationStats.failedValidations++;
        return resourceValidation;
      }
      
      this.validationStats.passedValidations++;
      
      return {
        valid: true,
        sanitized: this.sanitizeInput(input, type),
        metadata: {
          type,
          size: this.calculateSize(input),
          timestamp: Date.now(),
          validationTime: Date.now() - Date.now()
        }
      };
      
    } catch (error) {
      this.logger.error('[RobustInputValidator] Validation error:', error);
      this.validationStats.failedValidations++;
      
      return {
        valid: false,
        error: 'Validation failed',
        details: error.message
      };
    }
  }

  /**
   * Validações básicas
   */
  validateBasic(input, type) {
    // Verificar se input existe
    if (input === null || input === undefined) {
      return {
        valid: false,
        error: 'Input is null or undefined',
        code: 'NULL_INPUT'
      };
    }
    
    // Verificar tipo
    if (typeof input !== 'string' && typeof input !== 'object') {
      return {
        valid: false,
        error: 'Input must be string or object',
        code: 'INVALID_TYPE'
      };
    }
    
    // Verificar tamanho básico
    const size = this.calculateSize(input);
    if (size > this.limits.maxCodeLength) {
      return {
        valid: false,
        error: 'Input too large',
        code: 'SIZE_EXCEEDED',
        details: { size, limit: this.limits.maxCodeLength }
      };
    }
    
    return { valid: true };
  }

  /**
   * Validações específicas por tipo
   */
  async validateSpecific(input, type, options) {
    switch (type) {
      case 'code':
        return this.validateCode(input, options);
      case 'html':
        return this.validateHTML(input, options);
      case 'url':
        return this.validateURL(input, options);
      case 'file':
        return this.validateFile(input, options);
      case 'prompt':
        return this.validatePrompt(input, options);
      case 'image':
        return this.validateImage(input, options);
      default:
        return { valid: true };
    }
  }

  /**
   * Validar código
   */
  validateCode(code, options) {
    if (typeof code !== 'string') {
      return {
        valid: false,
        error: 'Code must be a string',
        code: 'INVALID_CODE_TYPE'
      };
    }
    
    // Verificar tamanho
    if (code.length > this.limits.maxCodeLength) {
      return {
        valid: false,
        error: 'Code too long',
        code: 'CODE_TOO_LONG',
        details: { length: code.length, limit: this.limits.maxCodeLength }
      };
    }
    
    // Verificar padrões perigosos
    const dangerousPatterns = this.patterns.code.dangerousPatterns;
    for (const pattern of dangerousPatterns) {
      if (pattern.test(code)) {
        return {
          valid: false,
          error: 'Code contains dangerous patterns',
          code: 'DANGEROUS_CODE',
          details: { pattern: pattern.toString() }
        };
      }
    }
    
    // Verificar linguagem (se especificada)
    if (options.language && !this.patterns.code.allowedLanguages.includes(options.language)) {
      return {
        valid: false,
        error: 'Unsupported language',
        code: 'UNSUPPORTED_LANGUAGE',
        details: { language: options.language }
      };
    }
    
    return { valid: true };
  }

  /**
   * Validar HTML
   */
  validateHTML(html, options) {
    if (typeof html !== 'string') {
      return {
        valid: false,
        error: 'HTML must be a string',
        code: 'INVALID_HTML_TYPE'
      };
    }
    
    // Verificar tamanho
    if (html.length > this.limits.maxCodeLength) {
      return {
        valid: false,
        error: 'HTML too long',
        code: 'HTML_TOO_LONG',
        details: { length: html.length, limit: this.limits.maxCodeLength }
      };
    }
    
    // Verificar padrões perigosos
    const dangerousPatterns = this.patterns.html.dangerousPatterns;
    for (const pattern of dangerousPatterns) {
      if (pattern.test(html)) {
        return {
          valid: false,
          error: 'HTML contains dangerous patterns',
          code: 'DANGEROUS_HTML',
          details: { pattern: pattern.toString() }
        };
      }
    }
    
    return { valid: true };
  }

  /**
   * Validar URL
   */
  validateURL(url, options) {
    if (typeof url !== 'string') {
      return {
        valid: false,
        error: 'URL must be a string',
        code: 'INVALID_URL_TYPE'
      };
    }
    
    // Verificar tamanho
    if (url.length > this.limits.maxUrlLength) {
      return {
        valid: false,
        error: 'URL too long',
        code: 'URL_TOO_LONG',
        details: { length: url.length, limit: this.limits.maxUrlLength }
      };
    }
    
    try {
      const urlObj = new URL(url);
      
      // Verificar protocolo
      if (!this.patterns.url.allowedProtocols.includes(urlObj.protocol)) {
        return {
          valid: false,
          error: 'Unsupported protocol',
          code: 'UNSUPPORTED_PROTOCOL',
          details: { protocol: urlObj.protocol }
        };
      }
      
      // Verificar padrões perigosos
      const dangerousPatterns = this.patterns.url.dangerousPatterns;
      for (const pattern of dangerousPatterns) {
        if (pattern.test(url)) {
          return {
            valid: false,
            error: 'URL contains dangerous patterns',
            code: 'DANGEROUS_URL',
            details: { pattern: pattern.toString() }
          };
        }
      }
      
    } catch (error) {
      return {
        valid: false,
        error: 'Invalid URL format',
        code: 'INVALID_URL_FORMAT',
        details: { error: error.message }
      };
    }
    
    return { valid: true };
  }

  /**
   * Validar arquivo
   */
  validateFile(file, options) {
    if (typeof file !== 'object' || !file.name || !file.size) {
      return {
        valid: false,
        error: 'Invalid file object',
        code: 'INVALID_FILE_OBJECT'
      };
    }
    
    // Verificar tamanho
    if (file.size > this.limits.maxImageSize) {
      return {
        valid: false,
        error: 'File too large',
        code: 'FILE_TOO_LARGE',
        details: { size: file.size, limit: this.limits.maxImageSize }
      };
    }
    
    // Verificar nome do arquivo
    if (file.name.length > this.limits.maxFileNameLength) {
      return {
        valid: false,
        error: 'Filename too long',
        code: 'FILENAME_TOO_LONG',
        details: { length: file.name.length, limit: this.limits.maxFileNameLength }
      };
    }
    
    // Verificar extensão
    const extension = this.getFileExtension(file.name);
    if (this.patterns.file.dangerousExtensions.includes(extension)) {
      return {
        valid: false,
        error: 'Dangerous file extension',
        code: 'DANGEROUS_EXTENSION',
        details: { extension }
      };
    }
    
    return { valid: true };
  }

  /**
   * Validar prompt
   */
  validatePrompt(prompt, options) {
    if (typeof prompt !== 'string') {
      return {
        valid: false,
        error: 'Prompt must be a string',
        code: 'INVALID_PROMPT_TYPE'
      };
    }
    
    // Verificar tamanho
    if (prompt.length > this.limits.maxPromptLength) {
      return {
        valid: false,
        error: 'Prompt too long',
        code: 'PROMPT_TOO_LONG',
        details: { length: prompt.length, limit: this.limits.maxPromptLength }
      };
    }
    
    return { valid: true };
  }

  /**
   * Validar imagem
   */
  validateImage(image, options) {
    if (typeof image !== 'string' && typeof image !== 'object') {
      return {
        valid: false,
        error: 'Image must be string or object',
        code: 'INVALID_IMAGE_TYPE'
      };
    }
    
    // Verificar tamanho
    const size = this.calculateSize(image);
    if (size > this.limits.maxImageSize) {
      return {
        valid: false,
        error: 'Image too large',
        code: 'IMAGE_TOO_LARGE',
        details: { size, limit: this.limits.maxImageSize }
      };
    }
    
    return { valid: true };
  }

  /**
   * Validações de segurança
   */
  validateSecurity(input, type) {
    const text = typeof input === 'string' ? input : JSON.stringify(input);
    
    // Verificar dados sensíveis
    const sensitivePatterns = this.patterns.sensitive.patterns;
    for (const pattern of sensitivePatterns) {
      if (pattern.test(text)) {
        return {
          valid: false,
          error: 'Input contains sensitive data',
          code: 'SENSITIVE_DATA_DETECTED',
          details: { pattern: pattern.toString() }
        };
      }
    }
    
    return { valid: true };
  }

  /**
   * Validações de recursos
   */
  async validateResources(input, type) {
    // Verificar uso de memória
    const memoryUsage = this.getMemoryUsage();
    if (memoryUsage > this.limits.maxMemoryUsage) {
      return {
        valid: false,
        error: 'Memory usage too high',
        code: 'MEMORY_EXCEEDED',
        details: { usage: memoryUsage, limit: this.limits.maxMemoryUsage }
      };
    }
    
    // Verificar uso de CPU
    const cpuUsage = this.getCPUUsage();
    if (cpuUsage > this.limits.maxCpuUsage) {
      return {
        valid: false,
        error: 'CPU usage too high',
        code: 'CPU_EXCEEDED',
        details: { usage: cpuUsage, limit: this.limits.maxCpuUsage }
      };
    }
    
    return { valid: true };
  }

  /**
   * Sanitizar entrada
   */
  sanitizeInput(input, type) {
    if (typeof input !== 'string') {
      return input;
    }
    
    let sanitized = input;
    
    switch (type) {
      case 'html':
        sanitized = this.sanitizeHTML(sanitized);
        break;
      case 'code':
        sanitized = this.sanitizeCode(sanitized);
        break;
      case 'url':
        sanitized = this.sanitizeURL(sanitized);
        break;
      default:
        sanitized = this.sanitizeGeneric(sanitized);
    }
    
    return sanitized;
  }

  sanitizeHTML(html) {
    // Usar sanitizador seguro se disponível
    if (typeof __DEVMENTOR_SANITIZE !== 'undefined') {
      return __DEVMENTOR_SANITIZE.sanitize(html);
    }
    
    // Fallback básico
    return html
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<iframe[^>]*>/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/javascript:/gi, '');
  }

  sanitizeCode(code) {
    // Remover padrões perigosos
    return code
      .replace(/eval\s*\(/gi, '/* eval blocked */')
      .replace(/new\s+Function\s*\(/gi, '/* Function blocked */')
      .replace(/setTimeout\s*\(\s*["']/gi, 'setTimeout(/* string blocked */')
      .replace(/setInterval\s*\(\s*["']/gi, 'setInterval(/* string blocked */');
  }

  sanitizeURL(url) {
    // Remover protocolos perigosos
    return url
      .replace(/javascript:/gi, '')
      .replace(/vbscript:/gi, '')
      .replace(/data:text\/html/gi, 'data:text/plain');
  }

  sanitizeGeneric(text) {
    // Sanitização genérica
    return text
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/vbscript:/gi, '');
  }

  /**
   * Métodos utilitários
   */
  calculateSize(input) {
    if (typeof input === 'string') {
      return input.length;
    } else if (typeof input === 'object') {
      return JSON.stringify(input).length;
    }
    return 0;
  }

  getFileExtension(filename) {
    const lastDot = filename.lastIndexOf('.');
    return lastDot !== -1 ? filename.substring(lastDot).toLowerCase() : '';
  }

  getMemoryUsage() {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      return process.memoryUsage().heapUsed;
    }
    return 0;
  }

  getCPUUsage() {
    // Implementação simplificada
    return Math.random() * 0.5;
  }

  monitorResources() {
    const memoryUsage = this.getMemoryUsage();
    const cpuUsage = this.getCPUUsage();
    
    if (memoryUsage > this.limits.maxMemoryUsage * 0.8) {
      this.logger.warn('[RobustInputValidator] High memory usage:', memoryUsage);
    }
    
    if (cpuUsage > this.limits.maxCpuUsage * 0.8) {
      this.logger.warn('[RobustInputValidator] High CPU usage:', cpuUsage);
    }
  }

  cleanupCache() {
    const now = Date.now();
    const maxAge = 300000; // 5 minutos
    
    for (const [key, value] of this.cache) {
      if (now - value.timestamp > maxAge) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Métodos de relatório
   */
  getValidationStats() {
    return {
      ...this.validationStats,
      successRate: this.validationStats.totalValidations > 0 
        ? this.validationStats.passedValidations / this.validationStats.totalValidations 
        : 0,
      blockRate: this.validationStats.totalValidations > 0 
        ? this.validationStats.blockedAttempts / this.validationStats.totalValidations 
        : 0
    };
  }

  generateReport() {
    return {
      timestamp: Date.now(),
      stats: this.getValidationStats(),
      limits: this.limits,
      patterns: Object.keys(this.patterns),
      recommendations: this.generateRecommendations()
    };
  }

  generateRecommendations() {
    const recommendations = [];
    const stats = this.getValidationStats();
    
    if (stats.blockRate > 0.1) {
      recommendations.push({
        type: 'security',
        priority: 'high',
        message: 'High block rate detected. Review input validation patterns.'
      });
    }
    
    if (stats.successRate < 0.8) {
      recommendations.push({
        type: 'usability',
        priority: 'medium',
        message: 'Low success rate. Consider adjusting validation rules.'
      });
    }
    
    return recommendations;
  }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
  window.RobustInputValidator = RobustInputValidator;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = RobustInputValidator;
}


