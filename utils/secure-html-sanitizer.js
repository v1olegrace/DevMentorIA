/**
 * DevMentor AI - Secure HTML Sanitizer
 * OWASP-compliant HTML sanitization using DOMParser
 * Replaces unsafe innerHTML with secure DOM manipulation
 */

(function(global) {
  if (!global) return;
  if (global.__DEVMENTOR_SECURE_SANITIZER) return;
  
  /**
   * Secure HTML Sanitizer using DOMParser
   * Implements OWASP-recommended approach for HTML sanitization
   */
  class SecureHTMLSanitizer {
    constructor() {
      // Whitelist of allowed tags (OWASP recommended)
      this.allowedTags = new Set([
        'p', 'br', 'strong', 'em', 'b', 'i', 'u', 'code', 'pre', 'span', 'div',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote',
        'a', 'img', 'hr', 'table', 'thead', 'tbody', 'tr', 'th', 'td'
      ]);
      
      // Whitelist of allowed attributes
      this.allowedAttributes = new Map([
        ['a', new Set(['href', 'title', 'target', 'rel'])],
        ['img', new Set(['src', 'alt', 'title', 'width', 'height'])],
        ['table', new Set(['border', 'cellpadding', 'cellspacing'])],
        ['td', new Set(['colspan', 'rowspan'])],
        ['th', new Set(['colspan', 'rowspan'])],
        ['*', new Set(['class', 'id', 'data-*'])] // Global attributes
      ]);
      
      // Dangerous protocols to block
      this.dangerousProtocols = new Set([
        'javascript:', 'vbscript:', 'data:', 'file:', 'ftp:'
      ]);
    }

    /**
     * Sanitize HTML string using DOMParser
     * @param {string} html - HTML to sanitize
     * @returns {string} - Sanitized HTML
     */
    sanitizeHTML(html) {
      if (typeof html !== 'string') {
        return '';
      }

      try {
        // Use DOMParser for safe parsing
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Sanitize the document
        this.sanitizeNode(doc.body);
        
        // Return sanitized HTML
        return doc.body.innerHTML;
        
      } catch (error) {
        console.error('[SecureSanitizer] Sanitization failed:', error);
        // Fallback: escape all HTML
        return this.escapeHTML(html);
      }
    }

    /**
     * Sanitize DOM node recursively
     * @param {Node} node - Node to sanitize
     */
    sanitizeNode(node) {
      if (node.nodeType === Node.TEXT_NODE) {
        return; // Text nodes are safe
      }

      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node;
        const tagName = element.tagName.toLowerCase();

        // Remove dangerous tags
        if (!this.allowedTags.has(tagName)) {
          this.replaceWithText(element);
          return;
        }

        // Sanitize attributes
        this.sanitizeAttributes(element);

        // Recursively sanitize children
        const children = Array.from(element.childNodes);
        children.forEach(child => this.sanitizeNode(child));
      }
    }

    /**
     * Sanitize element attributes
     * @param {Element} element - Element to sanitize
     */
    sanitizeAttributes(element) {
      const tagName = element.tagName.toLowerCase();
      const allowedAttrs = this.getAllowedAttributes(tagName);
      
      const attributes = Array.from(element.attributes);
      
      attributes.forEach(attr => {
        const attrName = attr.name.toLowerCase();
        
        // Check if attribute is allowed
        if (!this.isAttributeAllowed(attrName, allowedAttrs)) {
          element.removeAttribute(attr.name);
          return;
        }

        // Sanitize attribute value
        const sanitizedValue = this.sanitizeAttributeValue(attrName, attr.value);
        element.setAttribute(attr.name, sanitizedValue);
      });
    }

    /**
     * Get allowed attributes for a tag
     * @param {string} tagName - Tag name
     * @returns {Set} - Allowed attributes
     */
    getAllowedAttributes(tagName) {
      const specific = this.allowedAttributes.get(tagName);
      const global = this.allowedAttributes.get('*');
      
      return new Set([...(specific || []), ...(global || [])]);
    }

    /**
     * Check if attribute is allowed
     * @param {string} attrName - Attribute name
     * @param {Set} allowedAttrs - Allowed attributes
     * @returns {boolean} - Is allowed
     */
    isAttributeAllowed(attrName, allowedAttrs) {
      // Check exact match
      if (allowedAttrs.has(attrName)) {
        return true;
      }

      // Check wildcard patterns
      for (const allowed of allowedAttrs) {
        if (allowed.includes('*') && attrName.startsWith(allowed.replace('*', ''))) {
          return true;
        }
      }

      return false;
    }

    /**
     * Sanitize attribute value
     * @param {string} attrName - Attribute name
     * @param {string} value - Attribute value
     * @returns {string} - Sanitized value
     */
    sanitizeAttributeValue(attrName, value) {
      // Sanitize href attributes
      if (attrName === 'href' || attrName === 'src') {
        return this.sanitizeURL(value);
      }

      // Sanitize style attributes (basic)
      if (attrName === 'style') {
        return this.sanitizeStyle(value);
      }

      // For other attributes, escape dangerous characters
      return this.escapeAttributeValue(value);
    }

    /**
     * Sanitize URL
     * @param {string} url - URL to sanitize
     * @returns {string} - Sanitized URL
     */
    sanitizeURL(url) {
      if (!url) return '';

      const lowerUrl = url.toLowerCase().trim();
      
      // Block dangerous protocols
      for (const protocol of this.dangerousProtocols) {
        if (lowerUrl.startsWith(protocol)) {
          return '#';
        }
      }

      // Allow relative URLs and safe protocols
      if (lowerUrl.startsWith('http://') || 
          lowerUrl.startsWith('https://') || 
          lowerUrl.startsWith('/') || 
          lowerUrl.startsWith('./') || 
          lowerUrl.startsWith('../') ||
          lowerUrl.startsWith('#')) {
        return url;
      }

      // Block everything else
      return '#';
    }

    /**
     * Sanitize CSS style
     * @param {string} style - CSS style to sanitize
     * @returns {string} - Sanitized style
     */
    sanitizeStyle(style) {
      if (!style) return '';

      // Remove dangerous CSS properties
      const dangerousProps = [
        'expression', 'javascript:', 'vbscript:', 'behavior', 'binding',
        'eval', 'script', 'import', 'url('
      ];

      let sanitized = style;
      dangerousProps.forEach(prop => {
        const regex = new RegExp(prop, 'gi');
        sanitized = sanitized.replace(regex, '');
      });

      return sanitized;
    }

    /**
     * Escape attribute value
     * @param {string} value - Value to escape
     * @returns {string} - Escaped value
     */
    escapeAttributeValue(value) {
      return value
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    }

    /**
     * Escape HTML content
     * @param {string} html - HTML to escape
     * @returns {string} - Escaped HTML
     */
    escapeHTML(html) {
      return html
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
    }

    /**
     * Replace element with text content
     * @param {Element} element - Element to replace
     */
    replaceWithText(element) {
      const textNode = document.createTextNode(element.textContent);
      element.parentNode.replaceChild(textNode, element);
    }

    /**
     * Safely set innerHTML using sanitization
     * @param {Element} element - Element to update
     * @param {string} html - HTML content
     * @returns {boolean} - Success status
     */
    safeInnerHTML(element, html) {
      try {
        if (!element || typeof element.innerHTML !== 'string') {
          throw new Error('Invalid element provided');
        }

        const sanitized = this.sanitizeHTML(html);
        element.innerHTML = sanitized;
        
        return true;
      } catch (error) {
        console.error('[SecureSanitizer] Safe innerHTML failed:', error);
        // Fallback: use textContent
        element.textContent = html;
        return false;
      }
    }

    /**
     * Create safe DOM element from HTML
     * @param {string} html - HTML to create element from
     * @returns {Element|null} - Safe element or null
     */
    createSafeElement(html) {
      try {
        const sanitized = this.sanitizeHTML(html);
        const parser = new DOMParser();
        const doc = parser.parseFromString(sanitized, 'text/html');
        
        return doc.body.firstElementChild;
      } catch (error) {
        console.error('[SecureSanitizer] Create safe element failed:', error);
        return null;
      }
    }
  }

  // Create global instance
  const sanitizer = new SecureHTMLSanitizer();
  
  // Export secure API
  const secureSanitizerAPI = {
    /**
     * Sanitize HTML string
     * @param {string} html - HTML to sanitize
     * @returns {string} - Sanitized HTML
     */
    sanitizeHTML: (html) => sanitizer.sanitizeHTML(html),
    
    /**
     * Safely set innerHTML
     * @param {Element} element - Element to update
     * @param {string} html - HTML content
     * @returns {boolean} - Success status
     */
    safeInnerHTML: (element, html) => sanitizer.safeInnerHTML(element, html),
    
    /**
     * Create safe DOM element
     * @param {string} html - HTML to create element from
     * @returns {Element|null} - Safe element
     */
    createSafeElement: (html) => sanitizer.createSafeElement(html),
    
    /**
     * Escape HTML content
     * @param {string} html - HTML to escape
     * @returns {string} - Escaped HTML
     */
    escapeHTML: (html) => sanitizer.escapeHTML(html),
    
    /**
     * Check if HTML is safe
     * @param {string} html - HTML to check
     * @returns {boolean} - Is safe
     */
    isSafeHTML: (html) => {
      try {
        const sanitized = sanitizer.sanitizeHTML(html);
        return sanitized === html;
      } catch {
        return false;
      }
    }
  };

  // Make available globally
  global.__DEVMENTOR_SECURE_SANITIZER = secureSanitizerAPI;
  
})(typeof globalThis !== 'undefined' ? globalThis : this);