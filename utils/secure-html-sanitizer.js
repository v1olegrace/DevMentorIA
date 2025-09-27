/**
 * DevMentor AI - HTML Sanitizer Seguro
 * Substitui innerHTML por sanitização segura
 * Implementação baseada nas recomendações de auditoria
 */

(function(global) {
  if (!global) return;
  if (global.__DEVMENTOR_SANITIZE) return;
  
  const ALLOWED_TAGS = ['p', 'a', 'ul', 'li', 'b', 'i', 'code', 'pre', 'span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'em', 'br', 'hr'];
  const ALLOWED_ATTR = ['href', 'title', 'alt', 'target', 'rel', 'class', 'id', 'data-*'];
  
  function sanitizeHTML(html) {
    if (typeof html !== 'string') return '';
    
    let sanitized = html;
    
    // Remover tags perigosas
    sanitized = sanitized
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^>]*>.*?<\/iframe>/gi, '')
      .replace(/<object\b[^>]*>.*?<\/object>/gi, '')
      .replace(/<embed\b[^>]*>/gi, '')
      .replace(/<form\b[^>]*>.*?<\/form>/gi, '')
      .replace(/<input\b[^>]*>/gi, '')
      .replace(/<button\b[^>]*>.*?<\/button>/gi, '');
    
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
  
  function safeInnerHTML(element, html, config = {}) {
    try {
      if (!element || typeof element.innerHTML !== 'string') {
        throw new Error('Invalid element provided');
      }
      
      const sanitized = sanitizeHTML(html);
      element.innerHTML = sanitized;
      
      return true;
    } catch (error) {
      console.error('[HTMLSanitizer] Safe innerHTML failed:', error.message);
      // Fallback: usar textContent
      element.textContent = html;
      return false;
    }
  }
  
  const sanitizer = {
    sanitize: sanitizeHTML,
    safeInnerHTML,
    ALLOWED_TAGS,
    ALLOWED_ATTR
  };
  
  global.__DEVMENTOR_SANITIZE = sanitizer;
})(typeof globalThis !== 'undefined' ? globalThis : this);