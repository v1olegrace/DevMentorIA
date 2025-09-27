/**
 * DevMentor AI - Logger Seguro
 * Substitui console.log por logging seguro com redaction automática
 * Implementação baseada nas recomendações de auditoria
 */

(function(global) {
  if (!global) return;
  if (global.__DEVMENTOR_LOGGER) return;
  
  const DEFAULT = (typeof process !== 'undefined' && process.env.NODE_ENV === 'production') ? 'warn' : 'debug';
  let level = global.__DEVMENTOR_LOG_LEVEL || DEFAULT;
  const levels = { debug: 0, info: 1, warn: 2, error: 3 };
  
  const secrets = [
    /bearer\s+[A-Za-z0-9\-\._~\+\/]+=*/i,
    /sk_[A-Za-z0-9\-_]{8,}/i,
    /api[_-]?key\s*[:=]\s*['"]?[A-Za-z0-9\-_:.]{8,}['"]?/i,
    /password\s*[:=]\s*['"]?[^'"]+['"]?/i,
    /secret\s*[:=]\s*['"]?[^'"]+['"]?/i,
    /token\s*[:=]\s*['"]?[^'"]+['"]?/i,
    /eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/g
  ];
  
  function redact(str) {
    if (typeof str !== 'string') return str;
    
    let redacted = str;
    secrets.forEach(pattern => {
      redacted = redacted.replace(pattern, '[REDACTED]');
    });
    
    return redacted;
  }
  
  function toArgs(args) {
    return Array.from(args).map(arg => {
      if (typeof arg === 'string') {
        return redact(arg);
      } else if (typeof arg === 'object' && arg !== null) {
        return redactObject(arg);
      }
      return arg;
    });
  }
  
  function redactObject(obj) {
    if (Array.isArray(obj)) {
      return obj.map(item => redact(item));
    }
    
    const redacted = { ...obj };
    const sensitiveKeys = [
      'apiKey', 'secret', 'password', 'token', 'credentials',
      'auth', 'authorization', 'sessionId', 'cookie',
      'privateKey', 'publicKey', 'accessToken', 'refreshToken'
    ];
    
    sensitiveKeys.forEach(key => {
      if (redacted[key]) {
        redacted[key] = '[REDACTED]';
      }
    });
    
    return redacted;
  }
  
  const logger = {
    debug: function() {
      if (levels.debug >= levels[level]) {
        console.debug.apply(console, toArgs(arguments));
      }
    },
    info: function() {
      if (levels.info >= levels[level]) {
        console.info.apply(console, toArgs(arguments));
      }
    },
    warn: function() {
      if (levels.warn >= levels[level]) {
        console.warn.apply(console, toArgs(arguments));
      }
    },
    error: function() {
      if (levels.error >= levels[level]) {
        console.error.apply(console, toArgs(arguments));
      }
    },
    setLevel: function(l) {
      if (levels[l] !== undefined) level = l;
    },
    registerSecretPattern: function(r) {
      secrets.push(r);
    }
  };
  
  global.__DEVMENTOR_LOGGER = logger;
})(typeof globalThis !== 'undefined' ? globalThis : this);