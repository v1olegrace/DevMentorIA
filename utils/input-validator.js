/**
 * DevMentor AI - Input Validator
 * Validador robusto de entradas com sanitização e validação de segurança
 */

class InputValidator {
  constructor() {
    this.config = this.getDefaultConfig();
    this.sensitivePatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /<iframe\b[^>]*>.*?<\/iframe>/gi,
      /<object\b[^>]*>.*?<\/object>/gi,
      /<embed\b[^>]*>/gi,
      /<form\b[^>]*>.*?<\/form>/gi,
      /<input\b[^>]*>/gi,
      /<button\b[^>]*>.*?<\/button>/gi,
      /javascript:/gi,
      /vbscript:/gi,
      /data:text\/html/gi,
      /on\w+\s*=/gi
    ];
    this.dangerousFunctions = [
      'eval', 'Function', 'setTimeout', 'setInterval', 
      'import', 'require', 'exec', 'system', 'shell'
    ];
  }

  getDefaultConfig() {
    return {
      MAX_CODE_LENGTH: 100000, // 100KB
      MAX_SCREENSHOT_SIZE: 10 * 1024 * 1024, // 10MB
      MAX_FILENAME_LENGTH: 255,
      ALLOWED_FILE_TYPES: ['image/png', 'image/jpeg', 'image/webp', 'image/gif'],
      ALLOWED_CODE_EXTENSIONS: ['.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.cpp', '.c', '.cs', '.php', '.rb', '.go', '.rs'],
      MAX_ANALYSIS_DEPTH: 10,
      MAX_FUNCTION_COUNT: 1000,
      MAX_CLASS_COUNT: 100
    };
  }

  validateCode(code) {
    const result = { isValid: true, errors: [], warnings: [] };

    // Verificações básicas
    if (typeof code !== 'string') {
      result.isValid = false;
      result.errors.push('Code must be a string');
      return result;
    }

    if (code.trim().length === 0) {
      result.isValid = false;
      result.errors.push('Code cannot be empty');
      return result;
    }

    if (code.length > this.config.MAX_CODE_LENGTH) {
      result.isValid = false;
      result.errors.push(`Code is too long (max ${this.config.MAX_CODE_LENGTH} characters)`);
      return result;
    }

    // Verificações de segurança
    const securityIssues = this.checkSecurityIssues(code);
    if (securityIssues.length > 0) {
      result.isValid = false;
      result.errors.push(...securityIssues);
    }

    // Verificações de qualidade
    const qualityIssues = this.checkQualityIssues(code);
    result.warnings.push(...qualityIssues);

    return result;
  }

  validateImage(file) {
    const result = { isValid: true, errors: [], warnings: [] };

    if (!file) {
      result.isValid = false;
      result.errors.push('No image file provided');
      return result;
    }

    if (!file.type || !this.config.ALLOWED_FILE_TYPES.includes(file.type)) {
      result.isValid = false;
      result.errors.push(`Unsupported image format. Allowed: ${this.config.ALLOWED_FILE_TYPES.join(', ')}`);
      return result;
    }

    if (file.size > this.config.MAX_SCREENSHOT_SIZE) {
      result.isValid = false;
      result.errors.push(`Image is too large (max ${this.config.MAX_SCREENSHOT_SIZE / (1024 * 1024)}MB)`);
      return result;
    }

    // Verificar se é realmente uma imagem
    if (!file.type.startsWith('image/')) {
      result.isValid = false;
      result.errors.push('File is not an image');
      return result;
    }

    return result;
  }

  validateFilename(filename) {
    const result = { isValid: true, errors: [], warnings: [] };

    if (typeof filename !== 'string') {
      result.isValid = false;
      result.errors.push('Filename must be a string');
      return result;
    }

    if (filename.length === 0) {
      result.isValid = false;
      result.errors.push('Filename cannot be empty');
      return result;
    }

    if (filename.length > this.config.MAX_FILENAME_LENGTH) {
      result.isValid = false;
      result.errors.push(`Filename is too long (max ${this.config.MAX_FILENAME_LENGTH} characters)`);
      return result;
    }

    // Verificar caracteres perigosos
    const dangerousChars = /[<>:"|?*\x00-\x1f]/;
    if (dangerousChars.test(filename)) {
      result.isValid = false;
      result.errors.push('Filename contains dangerous characters');
      return result;
    }

    // Verificar extensão
    const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    if (!this.config.ALLOWED_CODE_EXTENSIONS.includes(extension)) {
      result.warnings.push(`File extension ${extension} may not be supported`);
    }

    return result;
  }

  checkSecurityIssues(code) {
    const issues = [];

    // Verificar padrões perigosos
    this.sensitivePatterns.forEach(pattern => {
      if (pattern.test(code)) {
        issues.push('Potential XSS or malicious code detected');
      }
    });

    // Verificar funções perigosas
    this.dangerousFunctions.forEach(func => {
      const regex = new RegExp(`\\b${func}\\s*\\(`, 'gi');
      if (regex.test(code)) {
        issues.push(`Dangerous function '${func}' detected`);
      }
    });

    // Verificar eval dinâmico
    if (/eval\s*\(/gi.test(code)) {
      issues.push('Dynamic eval() usage detected');
    }

    // Verificar Function constructor
    if (/new\s+Function\s*\(/gi.test(code)) {
      issues.push('Function constructor usage detected');
    }

    // Verificar import dinâmico
    if (/import\s*\(/gi.test(code)) {
      issues.push('Dynamic import() usage detected');
    }

    return issues;
  }

  checkQualityIssues(code) {
    const warnings = [];

    // Verificar tamanho
    if (code.length > 50000) {
      warnings.push('Code is very large, analysis may be slow');
    }

    // Verificar complexidade básica
    const lines = code.split('\n').length;
    if (lines > 1000) {
      warnings.push('Code has many lines, consider breaking into smaller functions');
    }

    // Verificar funções aninhadas
    const nestedFunctions = (code.match(/function\s+\w+\s*\(/g) || []).length;
    if (nestedFunctions > this.config.MAX_FUNCTION_COUNT) {
      warnings.push(`Code has many functions (${nestedFunctions}), consider refactoring`);
    }

    // Verificar classes
    const classes = (code.match(/class\s+\w+/g) || []).length;
    if (classes > this.config.MAX_CLASS_COUNT) {
      warnings.push(`Code has many classes (${classes}), consider refactoring`);
    }

    // Verificar comentários
    const commentRatio = (code.match(/\/\/|\/\*|\*\//g) || []).length / lines;
    if (commentRatio < 0.1) {
      warnings.push('Code has few comments, consider adding documentation');
    }

    return warnings;
  }

  sanitizeHtml(html) {
    if (typeof html !== 'string') {
      return '';
    }

    let sanitized = html;

    // Remover tags perigosas
    this.sensitivePatterns.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });

    // Remover atributos perigosos
    sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
    sanitized = sanitized.replace(/\s*javascript:\s*[^"'\s>]*/gi, '');
    sanitized = sanitized.replace(/\s*vbscript:\s*[^"'\s>]*/gi, '');

    // Escapar caracteres especiais
    sanitized = sanitized
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');

    return sanitized;
  }

  sanitizeCode(code) {
    if (typeof code !== 'string') {
      return '';
    }

    // Remover comentários que podem conter código malicioso
    let sanitized = code
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*$/gm, '');

    // Remover strings que podem conter código
    sanitized = sanitized.replace(/['"`][^'"`]*['"`]/g, '');

    // Remover funções perigosas
    this.dangerousFunctions.forEach(func => {
      const regex = new RegExp(`\\b${func}\\s*\\([^)]*\\)`, 'gi');
      sanitized = sanitized.replace(regex, '');
    });

    return sanitized;
  }

  validateApiKey(key) {
    const result = { isValid: true, errors: [], warnings: [] };

    if (!key || typeof key !== 'string') {
      result.isValid = false;
      result.errors.push('API key must be a non-empty string');
      return result;
    }

    if (key.length < 10) {
      result.isValid = false;
      result.errors.push('API key is too short');
      return result;
    }

    if (key.length > 1000) {
      result.isValid = false;
      result.errors.push('API key is too long');
      return result;
    }

    // Verificar se contém caracteres válidos
    if (!/^[a-zA-Z0-9\-._~+/=]+$/.test(key)) {
      result.isValid = false;
      result.errors.push('API key contains invalid characters');
      return result;
    }

    return result;
  }

  // Método para validar configurações
  validateConfig(config) {
    const result = { isValid: true, errors: [], warnings: [] };

    if (typeof config !== 'object' || config === null) {
      result.isValid = false;
      result.errors.push('Config must be an object');
      return result;
    }

    // Verificar limites razoáveis
    if (config.MAX_CODE_LENGTH && config.MAX_CODE_LENGTH > 1000000) {
      result.warnings.push('MAX_CODE_LENGTH is very large, may cause performance issues');
    }

    if (config.MAX_SCREENSHOT_SIZE && config.MAX_SCREENSHOT_SIZE > 50 * 1024 * 1024) {
      result.warnings.push('MAX_SCREENSHOT_SIZE is very large, may cause memory issues');
    }

    return result;
  }

  // Método para obter estatísticas de validação
  getValidationStats() {
    return {
      totalValidations: this.totalValidations || 0,
      successfulValidations: this.successfulValidations || 0,
      failedValidations: this.failedValidations || 0,
      securityIssuesDetected: this.securityIssuesDetected || 0,
      qualityWarningsIssued: this.qualityWarningsIssued || 0
    };
  }
}

// Inicializar validador global
const inputValidator = new InputValidator();

// Exportar para diferentes contextos
if (typeof window !== 'undefined') {
  window.InputValidator = inputValidator;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = inputValidator;
}

// Exportar para uso global
window.inputValidator = inputValidator;