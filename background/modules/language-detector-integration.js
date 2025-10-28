/**
 * Lightweight language detector with optional Chrome AI integration.
 */

/* global self, chrome */
/* eslint-disable no-console */

const FALLBACK_PATTERNS = [
  { language: 'javascript', regex: /function\s+\w+|\bconst\s+\w+\s*=/ },
  { language: 'typescript', regex: /\binterface\s+\w+|:\s*\w+\s*[=;]/ },
  { language: 'python', regex: /\bdef\s+\w+\s*\(|print\(/ },
  { language: 'java', regex: /public\s+class|System\.out\.print/ },
  { language: 'cpp', regex: /#include\s*<|std::\w+/ },
  { language: 'go', regex: /package\s+\w+|func\s+\w+\s*\(/ },
  { language: 'rust', regex: /\bfn\s+\w+\s*\(|let\s+mut\s+\w+/ },
  { language: 'php', regex: /<\?php|\$\w+\s*=/ },
  { language: 'html', regex: /<html|<body|<\/\w+>/i },
  { language: 'css', regex: /\w+\s*\{[^}]+\}/ }
];

export class LanguageDetectorIntegration {
  constructor () {
    this.cache = new Map();
    this.cacheTTL = 1000 * 60 * 30; // 30 minutes
  }

  #resolveAIContext () {
    if (typeof self !== 'undefined' && self.ai) {
      return self.ai;
    }
    if (typeof chrome !== 'undefined' && chrome.ai) {
      return chrome.ai;
    }
    return null;
  }

  async detectLanguage (code, { useCache = true } = {}) {
    const cacheKey = code.slice(0, 200);
    const now = Date.now();

    if (useCache && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (now - cached.timestamp < this.cacheTTL) {
        return cached.result;
      }
    }

    const result = await this.#detectWithChromeAI(code) ??
      this.#detectWithPatterns(code) ??
      { language: 'unknown', confidence: 0.1, method: 'fallback' };

    this.cache.set(cacheKey, { timestamp: now, result });
    return result;
  }

  async #detectWithChromeAI (code) {
    try {
      const aiContext = this.#resolveAIContext();
      if (!aiContext?.languageDetector) {
        return null;
      }

      if (typeof aiContext.languageDetector.capabilities === 'function') {
        const capabilities = await aiContext.languageDetector.capabilities();
        const available = typeof capabilities?.available !== 'undefined'
          ? capabilities.available
          : capabilities;

        if (available === false || `${available}`.toLowerCase() === 'no') {
          return null;
        }
      }

      let languages;
      if (typeof aiContext.languageDetector.detect === 'function') {
        const response = await aiContext.languageDetector.detect(code);
        languages = response?.languages ?? response ?? [];
      } else if (typeof aiContext.languageDetector.create === 'function') {
        const detector = await aiContext.languageDetector.create();
        const response = await detector.detect(code);
        languages = response?.languages ?? response ?? [];
      } else {
        return null;
      }

      const [best] = languages;
      if (!best) {
        return null;
      }

      return {
        language: best.language,
        confidence: best.confidence ?? 0.8,
        method: 'chrome-ai'
      };
    } catch (error) {
      console.warn('[LanguageDetector] Chrome AI unavailable:', error);
      return null;
    }
  }

  #detectWithPatterns (code) {
    for (const { language, regex } of FALLBACK_PATTERNS) {
      if (regex.test(code)) {
        return { language, confidence: 0.6, method: 'pattern' };
      }
    }
    return null;
  }
}

export default new LanguageDetectorIntegration();


