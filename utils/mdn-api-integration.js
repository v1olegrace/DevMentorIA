/**
 * DevMentor AI - MDN Web Docs API Integration
 *
 * Integração com MDN API para:
 * - Buscar documentação oficial
 * - Buscar exemplos
 * - Buscar guias de boas práticas
 * - Contextualizar explicações
 *
 * @version 1.0.0
 * @author DevMentor AI Team
 */
/* eslint-disable no-console */

class MDNIntegration {
  constructor () {
    this.baseUrl = 'https://developer.mozilla.org';
    this.searchUrl = 'https://developer.mozilla.org/api/v1/search';
    this.apiUrl = 'https://developer.mozilla.org/api/v1';
    this.cache = new Map();
    this.cacheExpiry = 10800000; // 3 horas (documentação muda raramente)

    console.log('[MDNIntegration] Initialized');
  }

  /**
   * Get from cache
   */
  getCache (key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() < cached.expiry) {
      return cached.data;
    }
    return null;
  }

  /**
   * Set cache
   */
  setCache (key, data) {
    this.cache.set(key, {
      data,
      expiry: Date.now() + this.cacheExpiry
    });
  }

  /**
   * Make API request with error handling
   */
  async request (url, options = {}) {
    // Check cache first
    const cacheKey = `${url}-${JSON.stringify(options)}`;
    const cached = this.getCache(cacheKey);
    if (cached) {
      console.log('[MDNIntegration] Cache hit:', url);
      return cached;
    }

    try {
      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
          ...options.headers
        },
        ...options
      });

      if (!response.ok) {
        throw new Error(`MDN API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // Cache response
      this.setCache(cacheKey, data);

      return data;
    } catch (error) {
      console.error('[MDNIntegration] Request failed:', error);
      throw error;
    }
  }

  /**
   * Search MDN documentation
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Promise<Array>} Search results
   */
  async search (query, options = {}) {
    try {
      const params = new URLSearchParams({
        q: query,
        locale: options.locale || 'en-US',
        ...(options.category && { category: options.category }),
        ...(options.highlight && { highlight: 'true' })
      });

      const url = `${this.searchUrl}?${params.toString()}`;
      const data = await this.request(url);

      return data.documents?.map(doc => ({
        title: doc.title,
        url: doc.mdn_url || `${this.baseUrl}${doc.url}`,
        summary: doc.summary,
        locale: doc.locale,
        modified: doc.modified,
        popularity: doc.popularity,
        slug: doc.slug
      })) || [];
    } catch (error) {
      console.error('[MDNIntegration] Search failed:', error);
      return [];
    }
  }

  /**
   * Get documentation for an API or concept
   * @param {string} apiOrConcept - API name or concept
   * @param {Object} options - Options
   * @returns {Promise<Object>} Documentation
   */
  async getDocumentation (apiOrConcept, options = {}) {
    try {
      // First, search for the API
      const searchResults = await this.search(apiOrConcept, {
        locale: options.locale || 'en-US'
      });

      if (searchResults.length === 0) {
        return null;
      }

      // Get first result (usually most relevant)
      const doc = searchResults[0];

      // Fetch full document content
      const content = await this.getDocumentContent(doc.url);

      return {
        title: doc.title,
        url: doc.url,
        summary: doc.summary,
        content,
        locale: doc.locale,
        modified: doc.modified
      };
    } catch (error) {
      console.error('[MDNIntegration] Failed to get documentation:', error);
      return null;
    }
  }

  /**
   * Get document content by URL
   * @param {string} url - Document URL
   * @returns {Promise<string>} Document content
   */
  async getDocumentContent (url) {
    try {
      // Fetch HTML from MDN
      const fullUrl = url.startsWith('http') ? url : `${this.baseUrl}${url}`;
      const response = await fetch(fullUrl);
      const html = await response.text();

      // Parse HTML to extract main content
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // Extract main content from article
      const mainContent = doc.querySelector('article, .main-content, main');

      if (!mainContent) {
        return '';
      }

      // Remove script and style tags
      const scripts = mainContent.querySelectorAll('script, style');
      scripts.forEach(el => el.remove());

      // Return text content (first 2000 chars)
      return mainContent.textContent.substring(0, 2000);
    } catch (error) {
      console.error('[MDNIntegration] Failed to get document content:', error);
      return '';
    }
  }

  /**
   * Get examples for an API
   * @param {string} api - API name
   * @returns {Promise<Array>} Examples
   */
  async getExamples (api) {
    try {
      // Search for examples
      const results = await this.search(`${api} examples`, {
        category: 'Code example'
      });

      return results.map(result => ({
        title: result.title,
        url: result.url,
        summary: result.summary
      }));
    } catch (error) {
      console.error('[MDNIntegration] Failed to get examples:', error);
      return [];
    }
  }

  /**
   * Get best practices for an API
   * @param {string} api - API name
   * @returns {Promise<Array>} Best practices
   */
  async getBestPractices (api) {
    try {
      const searchTerm = `${api} best practices OR ${api} guide`;
      const results = await this.search(searchTerm);

      return results
        .filter(result =>
          result.title.toLowerCase().includes('guide') ||
          result.title.toLowerCase().includes('best practice') ||
          result.title.toLowerCase().includes('how to')
        )
        .map(result => ({
          title: result.title,
          url: result.url,
          summary: result.summary,
          slug: result.slug
        }));
    } catch (error) {
      console.error('[MDNIntegration] Failed to get best practices:', error);
      return [];
    }
  }

  /**
   * Enrich explanation with MDN context
   * @param {string} explanation - Current explanation
   * @param {string} topic - Topic or API name
   * @returns {Promise<Object>} Enriched explanation
   */
  async enrichWithMDN (explanation, topic) {
    try {
      // Get documentation
      const doc = await this.getDocumentation(topic);

      // Get examples
      const examples = await this.getExamples(topic);

      // Get best practices
      const bestPractices = await this.getBestPractices(topic);

      return {
        originalExplanation: explanation,
        documentation: doc,
        examples,
        bestPractices,
        enriched: true
      };
    } catch (error) {
      console.error('[MDNIntegration] Failed to enrich with MDN:', error);
      return {
        originalExplanation: explanation,
        enriched: false,
        error: error.message
      };
    }
  }

  /**
   * Search by category
   * @param {string} category - Category name
   * @param {Object} options - Options
   * @returns {Promise<Array>} Search results
   */
  async searchByCategory (category, options = {}) {
    try {
      const results = await this.search('', {
        category,
        locale: options.locale || 'en-US'
      });

      return results.map(result => ({
        title: result.title,
        url: result.url,
        summary: result.summary,
        slug: result.slug
      }));
    } catch (error) {
      console.error('[MDNIntegration] Failed to search by category:', error);
      return [];
    }
  }

  /**
   * Get related topics
   * @param {string} topic - Topic name
   * @returns {Promise<Array>} Related topics
   */
  async getRelatedTopics (topic) {
    try {
      const doc = await this.getDocumentation(topic);

      if (!doc) {
        return [];
      }

      // In a real implementation, this would use MDN's relationship API
      // For now, return empty array
      return [];
    } catch (error) {
      console.error('[MDNIntegration] Failed to get related topics:', error);
      return [];
    }
  }
}

// Export singleton instance
const mdnIntegration = new MDNIntegration();

export default mdnIntegration;
