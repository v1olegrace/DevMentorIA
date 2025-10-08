/**
 * DevMentor AI - HTML Sanitizer
 * Sistema de sanitização HTML seguro com DOMPurify e fallback local
 * Evita XSS preservando a necessidade de HTML seguro
 */

class HTMLSanitizer {
  constructor() {
    this.logger = (typeof window !== 'undefined' && window.secureLogger) || {
      debug: (...args) => console.debug(...args),
      info: (...args) => console.info(...args),
      warn: (...args) => console.warn(...args),
      error: (...args) => console.error(...args)
    };
    
    this.domPurifyAvailable = false;
    this.customSanitizer = null;
    this.defaultConfig = this.getDefaultConfig();
    
    this.initialize();
  }

  initialize() {
    // Verificar se DOMPurify está disponível
    this.checkDOMPurifyAvailability();
    
    // Verificar se há sanitizador customizado global
    this.checkCustomSanitizer();
    
    this.logger.info('[HTMLSanitizer] Initialized with sanitization strategy:', this.getSanitizationStrategy());
  }

  getDefaultConfig() {
    return {
      // Tags permitidas por padrão
      ALLOWED_TAGS: [
        'p', 'div', 'span', 'br', 'hr',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'a', 'ul', 'ol', 'li', 'dl', 'dt', 'dd',
        'b', 'i', 'strong', 'em', 'u', 's', 'strike',
        'code', 'pre', 'blockquote', 'q', 'cite',
        'table', 'thead', 'tbody', 'tr', 'th', 'td',
        'img', 'figure', 'figcaption',
        'mark', 'small', 'sub', 'sup', 'time'
      ],
      
      // Atributos permitidos por padrão
      ALLOWED_ATTR: [
        'href', 'title', 'alt', 'target', 'rel',
        'class', 'id', 'data-*', 'aria-*',
        'src', 'width', 'height', 'loading',
        'datetime', 'cite', 'lang', 'dir'
      ],
      
      // Esquemas de URL permitidos
      ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
      
      // Configurações adicionais
      ALLOW_DATA_ATTR: true,
      ALLOW_UNKNOWN_PROTOCOLS: false,
      SANITIZE_DOM: true,
      KEEP_CONTENT: true,
      RETURN_DOM: false,
      RETURN_DOM_FRAGMENT: false,
      RETURN_DOM_IMPORT: false
    };
  }

  checkDOMPurifyAvailability() {
    try {
      if (typeof window !== 'undefined' && window.DOMPurify) {
        this.domPurifyAvailable = true;
        this.logger.info('[HTMLSanitizer] DOMPurify detected and available');
      } else if (typeof globalThis !== 'undefined' && globalThis.DOMPurify) {
        this.domPurifyAvailable = true;
        this.logger.info('[HTMLSanitizer] DOMPurify detected in globalThis');
      } else {
        this.domPurifyAvailable = false;
        this.logger.warn('[HTMLSanitizer] DOMPurify not available, using fallback sanitizer');
      }
    } catch (error) {
      this.domPurifyAvailable = false;
      this.logger.error('[HTMLSanitizer] Error checking DOMPurify availability:', error.message);
    }
  }

  checkCustomSanitizer() {
    try {
      if (typeof globalThis !== 'undefined' && typeof globalThis.__DEVMENTOR_SANITIZE === 'function') {
        this.customSanitizer = globalThis.__DEVMENTOR_SANITIZE;
        this.logger.info('[HTMLSanitizer] Custom sanitizer detected');
      }
    } catch (error) {
      this.logger.warn('[HTMLSanitizer] Error checking custom sanitizer:', error.message);
    }
  }

  getSanitizationStrategy() {
    if (this.domPurifyAvailable) {
      return 'DOMPurify';
    } else if (this.customSanitizer) {
      return 'Custom';
    } else {
      return 'Fallback';
    }
  }

  /**
   * Sanitiza HTML usando a melhor estratégia disponível
   * @param {string} html - HTML para sanitizar
   * @param {object} config - Configuração personalizada
   * @returns {string} HTML sanitizado
   */
  sanitize(html, config = {}) {
    try {
      if (typeof html !== 'string') {
        this.logger.warn('[HTMLSanitizer] Non-string input provided, converting to string');
        html = String(html);
      }

      if (html.trim().length === 0) {
        return '';
      }

      // Usar DOMPurify se disponível
      if (this.domPurifyAvailable) {
        return this.sanitizeWithDOMPurify(html, config);
      }
      
      // Usar sanitizador customizado se disponível
      if (this.customSanitizer) {
        return this.sanitizeWithCustom(html, config);
      }
      
      // Usar fallback local
      return this.sanitizeWithFallback(html, config);
      
    } catch (error) {
      this.logger.error('[HTMLSanitizer] Sanitization failed:', error.message);
      // Em caso de erro, retornar HTML completamente escapado
      return this.escapeHtml(html);
    }
  }

  sanitizeWithDOMPurify(html, config) {
    try {
      const sanitizeConfig = { ...this.defaultConfig, ...config };
      
      // Usar DOMPurify global
      const domPurify = (typeof window !== 'undefined' && window.DOMPurify) || 
                       (typeof globalThis !== 'undefined' && globalThis.DOMPurify);
      
      const sanitized = domPurify.sanitize(html, sanitizeConfig);
      
      this.logger.debug('[HTMLSanitizer] DOMPurify sanitization completed');
      return sanitized;
      
    } catch (error) {
      this.logger.error('[HTMLSanitizer] DOMPurify sanitization failed:', error.message);
      throw error;
    }
  }

  sanitizeWithCustom(html, config) {
    try {
      const sanitized = this.customSanitizer(html, config);
      
      this.logger.debug('[HTMLSanitizer] Custom sanitization completed');
      return sanitized;
      
    } catch (error) {
      this.logger.error('[HTMLSanitizer] Custom sanitization failed:', error.message);
      throw error;
    }
  }

  sanitizeWithFallback(html, config) {
    try {
      let sanitized = html;
      
      // Remover tags perigosas
      sanitized = this.removeDangerousTags(sanitized);
      
      // Remover atributos perigosos
      sanitized = this.removeDangerousAttributes(sanitized);
      
      // Escapar caracteres especiais
      sanitized = this.escapeSpecialCharacters(sanitized);
      
      // Validar URLs
      sanitized = this.validateUrls(sanitized);
      
      this.logger.debug('[HTMLSanitizer] Fallback sanitization completed');
      return sanitized;
      
    } catch (error) {
      this.logger.error('[HTMLSanitizer] Fallback sanitization failed:', error.message);
      throw error;
    }
  }

  removeDangerousTags(html) {
    // Tags completamente perigosas
    const dangerousTags = [
      'script', 'iframe', 'object', 'embed', 'applet',
      'form', 'input', 'button', 'select', 'textarea',
      'link', 'meta', 'style', 'base', 'frame', 'frameset'
    ];
    
    let sanitized = html;
    
    dangerousTags.forEach(tag => {
      const regex = new RegExp(`<${tag}\\b[^>]*>.*?</${tag}>`, 'gi');
      sanitized = sanitized.replace(regex, '');
      
      const selfClosingRegex = new RegExp(`<${tag}\\b[^>]*/?>`, 'gi');
      sanitized = sanitized.replace(selfClosingRegex, '');
    });
    
    return sanitized;
  }

  removeDangerousAttributes(html) {
    let sanitized = html;
    
    // Remover atributos de evento
    const eventAttributes = [
      'onclick', 'onload', 'onerror', 'onmouseover', 'onmouseout',
      'onfocus', 'onblur', 'onchange', 'onsubmit', 'onreset',
      'onkeydown', 'onkeyup', 'onkeypress', 'onmousedown', 'onmouseup'
    ];
    
    eventAttributes.forEach(attr => {
      const regex = new RegExp(`\\s*${attr}\\s*=\\s*["'][^"']*["']`, 'gi');
      sanitized = sanitized.replace(regex, '');
    });
    
    // Remover javascript: e vbscript: URLs
    sanitized = sanitized.replace(/javascript\s*:/gi, '');
    sanitized = sanitized.replace(/vbscript\s*:/gi, '');
    sanitized = sanitized.replace(/data\s*:\s*text\/html/gi, '');
    
    return sanitized;
  }

  escapeSpecialCharacters(html) {
    // Escapar caracteres especiais que podem ser perigosos
    return html
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  validateUrls(html) {
    // Validar URLs em atributos href e src
    let sanitized = html;
    
    // Validar href
    sanitized = sanitized.replace(/href\s*=\s*["']([^"']*)["']/gi, (match, url) => {
      if (this.isValidUrl(url)) {
        return match;
      } else {
        this.logger.warn('[HTMLSanitizer] Invalid URL detected:', url);
        return 'href="#"';
      }
    });
    
    // Validar src
    sanitized = sanitized.replace(/src\s*=\s*["']([^"']*)["']/gi, (match, url) => {
      if (this.isValidUrl(url)) {
        return match;
      } else {
        this.logger.warn('[HTMLSanitizer] Invalid URL detected:', url);
        return 'src=""';
      }
    });
    
    return sanitized;
  }

  isValidUrl(url) {
    try {
      // URLs relativas são válidas
      if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) {
        return true;
      }
      
      // URLs absolutas devem usar protocolos seguros
      if (url.startsWith('http://') || url.startsWith('https://') || 
          url.startsWith('mailto:') || url.startsWith('tel:')) {
        return true;
      }
      
      // URLs de dados são permitidas apenas para imagens
      if (url.startsWith('data:image/')) {
        return true;
      }
      
      return false;
    } catch (error) {
      return false;
    }
  }

  escapeHtml(html) {
    // Escape completo para casos de emergência
    return String(html)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  /**
   * Sanitiza HTML e define como innerHTML de forma segura
   * @param {HTMLElement} element - Elemento DOM
   * @param {string} html - HTML para definir
   * @param {object} config - Configuração de sanitização
   */
  safeInnerHTML(element, html, config = {}) {
    try {
      if (!element || typeof element.innerHTML !== 'string') {
        throw new Error('Invalid element provided');
      }
      
      // Usar sanitizador seguro global se disponível
      if (typeof __DEVMENTOR_SANITIZE !== 'undefined') {
        return __DEVMENTOR_SANITIZE.safeInnerHTML(element, html, config);
      }
      
      const sanitized = this.sanitize(html, config);
      element.innerHTML = sanitized;
      
      this.logger.debug('[HTMLSanitizer] Safe innerHTML set successfully');
      
    } catch (error) {
      this.logger.error('[HTMLSanitizer] Safe innerHTML failed:', error.message);
      // Fallback: usar textContent
      element.textContent = html;
    }
  }

  /**
   * Sanitiza HTML e define como textContent de forma segura
   * @param {HTMLElement} element - Elemento DOM
   * @param {string} text - Texto para definir
   */
  safeTextContent(element, text) {
    try {
      if (!element || typeof element.textContent !== 'string') {
        throw new Error('Invalid element provided');
      }
      
      element.textContent = String(text);
      
      this.logger.debug('[HTMLSanitizer] Safe textContent set successfully');
      
    } catch (error) {
      this.logger.error('[HTMLSanitizer] Safe textContent failed:', error.message);
    }
  }

  /**
   * Cria elemento DOM de forma segura
   * @param {string} tagName - Nome da tag
   * @param {object} attributes - Atributos do elemento
   * @param {string} content - Conteúdo do elemento
   * @returns {HTMLElement} Elemento criado
   */
  createSafeElement(tagName, attributes = {}, content = '') {
    try {
      const element = document.createElement(tagName);
      
      // Definir atributos seguros
      Object.keys(attributes).forEach(key => {
        if (this.isSafeAttribute(key, attributes[key])) {
          element.setAttribute(key, attributes[key]);
        }
      });
      
      // Definir conteúdo seguro
      if (content) {
        this.safeInnerHTML(element, content);
      }
      
      return element;
      
    } catch (error) {
      this.logger.error('[HTMLSanitizer] Safe element creation failed:', error.message);
      throw error;
    }
  }

  isSafeAttribute(name, value) {
    // Verificar se o atributo é seguro
    const safeAttributes = this.defaultConfig.ALLOWED_ATTR;
    
    // Permitir atributos data-* e aria-*
    if (name.startsWith('data-') || name.startsWith('aria-')) {
      return true;
    }
    
    // Verificar se está na lista de atributos permitidos
    return safeAttributes.includes(name);
  }

  // Método para configurar DOMPurify se disponível
  configureDOMPurify(config) {
    if (this.domPurifyAvailable) {
      try {
        const domPurify = (typeof window !== 'undefined' && window.DOMPurify) || 
                         (typeof globalThis !== 'undefined' && globalThis.DOMPurify);
        
        // Configurar DOMPurify com configurações personalizadas
        domPurify.setConfig({ ...this.defaultConfig, ...config });
        
        this.logger.info('[HTMLSanitizer] DOMPurify configured successfully');
        
      } catch (error) {
        this.logger.error('[HTMLSanitizer] DOMPurify configuration failed:', error.message);
      }
    }
  }

  // Método para registrar sanitizador customizado
  registerCustomSanitizer(sanitizerFunction) {
    if (typeof sanitizerFunction !== 'function') {
      throw new Error('Custom sanitizer must be a function');
    }
    
    this.customSanitizer = sanitizerFunction;
    this.logger.info('[HTMLSanitizer] Custom sanitizer registered');
  }

  // Método para obter estatísticas
  getStats() {
    return {
      sanitizationStrategy: this.getSanitizationStrategy(),
      domPurifyAvailable: this.domPurifyAvailable,
      customSanitizerAvailable: !!this.customSanitizer,
      allowedTagsCount: this.defaultConfig.ALLOWED_TAGS.length,
      allowedAttributesCount: this.defaultConfig.ALLOWED_ATTR.length
    };
  }
}

// Inicializar HTMLSanitizer global
const htmlSanitizer = new HTMLSanitizer();

// Exportar para diferentes contextos
if (typeof window !== 'undefined') {
  window.HTMLSanitizer = htmlSanitizer;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = htmlSanitizer;
}

// Exportar para uso global
window.htmlSanitizer = htmlSanitizer;

