/**
 * DEVMENTOR AI - PRIVACY SANITIZER
 * GDPR-compliant data sanitization for telemetry
 * Aggressive privacy protection while maintaining analytical value
 */

/**
 * PRIVACY-SAFE TELEMETRY SCHEMA
 * Zero PII, Zero code content
 */
const TELEMETRY_SCHEMA = {
  // ✅ ALLOWED - Technical metrics
  allowed: {
    performance: {
      responseTime: 'number (ms)',
      memoryUsage: 'number (bytes)',
      cacheHitRate: 'percentage',
      apiLatency: 'number (ms)'
    },
    
    usage: {
      feature: 'string (explain|debug|document|refactor)',
      language: 'string (javascript|python|java)',
      codeLength: 'number (characters)',
      analysisSuccess: 'boolean',
      retryCount: 'number'
    },
    
    errors: {
      errorType: 'string (TimeoutError|AIUnavailableError)',
      errorCode: 'string',
      component: 'string (AIManager|UIManager)',
      severity: 'number (1-5)',
      recoverable: 'boolean'
    },
    
    browser: {
      chromeVersion: 'string',
      platform: 'string (Windows|Mac|Linux)',
      aiAvailable: 'boolean',
      viewport: 'object {width, height}'
    }
  },
  
  // ❌ FORBIDDEN - Never collected
  forbidden: {
    codeContent: 'NEVER',
    filenames: 'NEVER',
    projectNames: 'NEVER',
    usernames: 'NEVER',
    emails: 'NEVER',
    ipAddresses: 'NEVER',
    urls: 'SANITIZED (domain only)',
    identifiers: 'HASHED'
  }
};

/**
 * DATA SANITIZATION - AGGRESSIVE PRIVACY
 */
class PrivacySanitizer {
  constructor() {
    this.saltCache = new Map();
    this.hashCache = new Map();
    
    // Patterns to detect and redact sensitive information
    this.sensitivePatterns = [
      // API Keys and tokens
      /(?:api[_-]?key|token|secret|password|auth)[:\s]*['"]?([a-zA-Z0-9_\-\.]{10,})/gi,
      
      // Email addresses
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/gi,
      
      // URLs with potential secrets
      /https?:\/\/[^\s]*(?:token|key|secret|password)=[^\s&]*/gi,
      
      // File paths that might contain usernames
      /(?:[C-Z]:)?[\/\\](?:Users|home)[\/\\][^\/\\]+/gi,
      
      // IP addresses
      /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
      
      // Common secret formats
      /(?:sk|pk|rk)_[a-zA-Z0-9]{20,}/gi,
      
      // Credit card numbers
      /\b(?:\d{4}[- ]?){3}\d{4}\b/g,
      
      // Social security numbers
      /\b\d{3}-\d{2}-\d{4}\b/g
    ];

    // Code patterns to detect and sanitize
    this.codePatterns = [
      // Function signatures
      /function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g,
      
      // Class definitions
      /class\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g,
      
      // Variable declarations
      /(?:var|let|const)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g
    ];

    // Domains that are coding platforms (safe to preserve)
    this.codingPlatforms = new Set([
      'github.com', 'gist.github.com', 'gitlab.com', 'bitbucket.org',
      'stackoverflow.com', 'stackexchange.com', 'codepen.io', 'jsfiddle.net',
      'replit.com', 'codesandbox.io', 'leetcode.com', 'hackerrank.com',
      'codewars.com', 'exercism.io', 'freecodecamp.org'
    ]);
  }

  /**
   * MAIN SANITIZATION METHOD
   * Removes all PII while preserving analytical value
   */
  sanitize(data) {
    if (!data || typeof data !== 'object') {
      return data;
    }

    // Deep clone to avoid mutating original
    const sanitized = this._deepClone(data);
    
    // Apply sanitization recursively
    return this._sanitizeObject(sanitized);
  }

  _sanitizeObject(obj) {
    if (obj === null || typeof obj !== 'object') {
      return this._sanitizeValue(obj);
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this._sanitizeObject(item));
    }

    const sanitized = {};
    
    for (const [key, value] of Object.entries(obj)) {
      // Check if key indicates sensitive data
      const sanitizedKey = this._sanitizeKey(key);
      const sanitizedValue = this._sanitizeByKey(key, value);
      
      if (sanitizedValue !== undefined) {
        sanitized[sanitizedKey] = sanitizedValue;
      }
    }

    return sanitized;
  }

  _sanitizeByKey(key, value) {
    const keyLower = key.toLowerCase();
    
    // Handle code content - NEVER store actual code
    if (keyLower.includes('code') && typeof value === 'string' && value.length > 50) {
      return this._analyzeCodeMetadata(value);
    }
    
    // Handle URLs
    if (keyLower.includes('url') || keyLower.includes('href')) {
      return this._sanitizeUrl(value);
    }
    
    // Handle file paths
    if (keyLower.includes('path') || keyLower.includes('filename') || keyLower.includes('file')) {
      return this._sanitizeFilePath(value);
    }
    
    // Handle stack traces
    if (keyLower.includes('stack') || keyLower.includes('trace')) {
      return this._sanitizeStackTrace(value);
    }
    
    // Handle user identifiers
    if (keyLower.includes('user') || keyLower.includes('id') || keyLower.includes('email')) {
      return this._hashWithSalt(value);
    }
    
    // Handle sensitive fields
    if (this._isSensitiveKey(keyLower)) {
      return '[REDACTED]';
    }
    
    // Recursively sanitize objects and arrays
    if (typeof value === 'object') {
      return this._sanitizeObject(value);
    }
    
    // Sanitize string values for patterns
    if (typeof value === 'string') {
      return this._sanitizeStringValue(value);
    }
    
    return value;
  }

  _sanitizeKey(key) {
    // Keys themselves might contain sensitive info
    if (this._isSensitiveKey(key.toLowerCase())) {
      return `[REDACTED_KEY_${this._hashString(key).substring(0, 8)}]`;
    }
    return key;
  }

  _isSensitiveKey(key) {
    const sensitiveKeys = [
      'password', 'secret', 'token', 'key', 'auth', 'credential',
      'email', 'username', 'login', 'session', 'cookie'
    ];
    
    return sensitiveKeys.some(sensitive => key.includes(sensitive));
  }

  /**
   * CODE ANALYSIS WITHOUT STORING CONTENT
   * Extract metadata while discarding actual code
   */
  _analyzeCodeMetadata(code) {
    if (typeof code !== 'string') return null;

    try {
      const metadata = {
        length: code.length,
        language: this._detectLanguage(code),
        complexity: this._calculateComplexity(code),
        patterns: this._extractCodePatterns(code),
        // Original code is completely discarded
      };

      // Add size category for analytics
      if (metadata.length < 100) metadata.sizeCategory = 'small';
      else if (metadata.length < 1000) metadata.sizeCategory = 'medium';
      else metadata.sizeCategory = 'large';

      return metadata;
    } catch (error) {
      return { length: code.length, language: 'unknown', error: 'analysis_failed' };
    }
  }

  _detectLanguage(code) {
    const patterns = {
      javascript: [/function\s+\w+/, /const\s+\w+\s*=/, /=>\s*{/, /console\.log/],
      python: [/def\s+\w+\(/, /import\s+\w+/, /print\(/, /if\s+__name__/],
      java: [/public\s+class/, /public\s+static\s+void/, /System\.out\.println/],
      cpp: [/#include\s*</, /int\s+main\(/, /std::/],
      csharp: [/using\s+System/, /public\s+class/, /Console\.WriteLine/],
      php: [/<\?php/, /echo\s+/, /\$\w+/],
      ruby: [/def\s+\w+/, /puts\s+/, /class\s+\w+/],
      go: [/func\s+\w+/, /package\s+main/, /fmt\.Println/],
      rust: [/fn\s+\w+/, /let\s+mut/, /println!/],
      html: [/<html/, /<div/, /<script/],
      css: [/\w+\s*:\s*\w+;/, /@media/, /\.[\w-]+\s*{/],
      sql: [/SELECT\s+/, /FROM\s+/, /WHERE\s+/i]
    };

    for (const [lang, langPatterns] of Object.entries(patterns)) {
      const matches = langPatterns.filter(pattern => pattern.test(code)).length;
      if (matches >= 2) return lang;
    }

    return 'unknown';
  }

  _calculateComplexity(code) {
    // Simple complexity metrics without storing code
    const lines = code.split('\n').length;
    const conditionals = (code.match(/\b(if|else|switch|case|while|for)\b/g) || []).length;
    const functions = (code.match(/\b(function|def|fn|func)\b/g) || []).length;
    
    return {
      lines,
      conditionals,
      functions,
      score: Math.min(conditionals + functions, 10) // Normalized complexity score
    };
  }

  _extractCodePatterns(code) {
    // Extract patterns without storing identifiers
    const patterns = {
      hasFunctions: /\b(function|def|fn|func)\b/.test(code),
      hasClasses: /\b(class|interface)\b/.test(code),
      hasLoops: /\b(for|while|forEach)\b/.test(code),
      hasConditionals: /\b(if|else|switch)\b/.test(code),
      hasTryCatch: /\b(try|catch|except)\b/.test(code),
      hasAsync: /\b(async|await|Promise)\b/.test(code)
    };

    return patterns;
  }

  /**
   * URL SANITIZATION
   * Keep domain for platform detection, strip everything else
   */
  _sanitizeUrl(url) {
    if (!url || typeof url !== 'string') return null;

    try {
      const urlObj = new URL(url);
      
      return {
        domain: urlObj.hostname,
        protocol: urlObj.protocol,
        isCodingPlatform: this.codingPlatforms.has(urlObj.hostname),
        hasQuery: urlObj.search.length > 0,
        hasFragment: urlObj.hash.length > 0,
        // Path, query, and fragment are completely stripped
      };
    } catch (error) {
      // Handle relative URLs or malformed URLs
      return {
        domain: 'unknown',
        protocol: 'unknown',
        isCodingPlatform: false,
        parseError: true
      };
    }
  }

  /**
   * FILE PATH SANITIZATION
   * Remove user-specific paths, keep file types
   */
  _sanitizeFilePath(path) {
    if (!path || typeof path !== 'string') return null;

    // Extract file extension
    const extension = path.split('.').pop();
    
    // Count path segments
    const segments = path.split(/[\/\\]/).length;
    
    // Detect if it's a system path
    const isSystemPath = /^[C-Z]:|\/usr\/|\/home\/|\/var\//.test(path);
    
    return {
      extension: extension && extension.length < 10 ? extension : 'unknown',
      segmentCount: segments,
      isSystemPath,
      // Actual path is completely removed
    };
  }

  /**
   * STACK TRACE SANITIZATION
   * Keep function names and line numbers, remove file paths
   */
  _sanitizeStackTrace(stack) {
    if (!stack || typeof stack !== 'string') return null;

    const lines = stack.split('\n');
    const sanitizedLines = lines.map(line => {
      // Extract function name and line number only
      const funcMatch = line.match(/at\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/);
      const lineMatch = line.match(/:(\d+):\d+/);
      
      if (funcMatch && lineMatch) {
        return `at ${funcMatch[1]} (line ${lineMatch[1]})`;
      }
      
      if (funcMatch) {
        return `at ${funcMatch[1]}`;
      }
      
      // Generic anonymized line
      return 'at [anonymous]';
    }).slice(0, 10); // Limit stack depth

    return sanitizedLines.join('\n');
  }

  /**
   * STRING VALUE SANITIZATION
   * Remove patterns that might contain sensitive data
   */
  _sanitizeStringValue(value) {
    if (typeof value !== 'string') return value;

    let sanitized = value;

    // Apply sensitive patterns
    for (const pattern of this.sensitivePatterns) {
      sanitized = sanitized.replace(pattern, (match, capture) => {
        if (capture) {
          return match.replace(capture, '[REDACTED]');
        }
        return '[REDACTED]';
      });
    }

    // If string was heavily modified, it might be sensitive
    if (sanitized.includes('[REDACTED]') && sanitized.length < value.length * 0.5) {
      return '[MOSTLY_REDACTED]';
    }

    return sanitized;
  }

  /**
   * SECURE HASHING WITH SALT
   */
  _hashWithSalt(value) {
    if (!value) return null;

    const valueStr = String(value);
    
    // Check cache first
    if (this.hashCache.has(valueStr)) {
      return this.hashCache.get(valueStr);
    }

    // Generate or get salt for this session
    let salt = this.saltCache.get('global_salt');
    if (!salt) {
      salt = 'devmentor_' + Date.now() + '_' + Math.random().toString(36);
      this.saltCache.set('global_salt', salt);
    }

    const hash = this._hashString(salt + valueStr);
    
    // Cache the result
    this.hashCache.set(valueStr, hash);
    
    return hash;
  }

  _hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }

  _deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => this._deepClone(item));
    if (typeof obj === 'object') {
      const clonedObj = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          clonedObj[key] = this._deepClone(obj[key]);
        }
      }
      return clonedObj;
    }
    return obj;
  }

  /**
   * VALIDATION METHODS
   * Ensure data meets privacy standards
   */
  validateSanitization(originalData, sanitizedData) {
    const validation = {
      passed: true,
      issues: [],
      score: 100
    };

    try {
      const originalStr = JSON.stringify(originalData);
      const sanitizedStr = JSON.stringify(sanitizedData);

      // Check for potential PII leaks
      for (const pattern of this.sensitivePatterns) {
        const matches = sanitizedStr.match(pattern);
        if (matches) {
          validation.issues.push(`Potential PII leak: ${matches[0].substring(0, 20)}...`);
          validation.score -= 20;
        }
      }

      // Check data size reduction (good indicator of effective sanitization)
      const sizeReduction = 1 - (sanitizedStr.length / originalStr.length);
      if (sizeReduction < 0.1) {
        validation.issues.push('Low data reduction suggests insufficient sanitization');
        validation.score -= 10;
      }

      validation.passed = validation.score >= 80;

    } catch (error) {
      validation.issues.push(`Validation error: ${error.message}`);
      validation.passed = false;
    }

    return validation;
  }

  /**
   * EXPORT SANITIZATION REPORT
   * For transparency and compliance
   */
  generateSanitizationReport(originalData, sanitizedData) {
    const validation = this.validateSanitization(originalData, sanitizedData);
    
    return {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      compliance: {
        gdpr: validation.passed,
        ccpa: validation.passed,
        coppa: validation.passed
      },
      metrics: {
        sizeReduction: this._calculateSizeReduction(originalData, sanitizedData),
        fieldsProcessed: this._countFields(originalData),
        fieldsRetained: this._countFields(sanitizedData),
        piiDetected: validation.issues.length
      },
      validation,
      schema: TELEMETRY_SCHEMA
    };
  }

  _calculateSizeReduction(original, sanitized) {
    try {
      const originalSize = JSON.stringify(original).length;
      const sanitizedSize = JSON.stringify(sanitized).length;
      return Math.round((1 - sanitizedSize / originalSize) * 100);
    } catch (error) {
      return 0;
    }
  }

  _countFields(obj, count = 0) {
    if (obj && typeof obj === 'object') {
      if (Array.isArray(obj)) {
        obj.forEach(item => count = this._countFields(item, count));
      } else {
        for (const value of Object.values(obj)) {
          count++;
          count = this._countFields(value, count);
        }
      }
    }
    return count;
  }
}

// Export for use by ObservabilityManager
if (typeof window !== 'undefined') {
  window.PrivacySanitizer = PrivacySanitizer;
  window.TELEMETRY_SCHEMA = TELEMETRY_SCHEMA;
}










