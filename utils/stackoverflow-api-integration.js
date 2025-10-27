/**
 * DevMentor AI - StackOverflow API Integration
 *
 * Integração com StackOverflow API para:
 * - Encontrar perguntas similares
 * - Buscar melhores práticas
 * - Encontrar anti-patterns
 * - Contexto educativo adicional
 *
 * @version 1.0.0
 * @author DevMentor AI Team
 */
/* eslint-disable no-console */

class StackOverflowAPI {
  constructor () {
    this.baseUrl = 'https://api.stackexchange.com/2.3';
    this.site = 'stackoverflow';
    this.key = null; // Optional API key
    this.cache = new Map();
    this.cacheExpiry = 7200000; // 2 horas (StackOverflow tem cache longo)
    this.rateLimit = {
      remaining: 300,
      resetAt: null,
      backoff: 0
    };

    console.log('[StackOverflowAPI] Initialized');
  }

  /**
   * Set optional API key
   * @param {string} key - StackOverflow API key
   */
  setKey (key) {
    this.key = key;
    console.log('[StackOverflowAPI] Key configured');
  }

  /**
   * Get query parameters for API requests
   */
  getParams (params = {}) {
    const defaultParams = {
      site: this.site,
      filter: 'default' // or 'withbody' para incluir conteúdo completo
    };

    if (this.key) {
      defaultParams.key = this.key;
    }

    return { ...defaultParams, ...params };
  }

  /**
   * Build query string
   */
  buildQueryString (params) {
    const allParams = this.getParams(params);
    return Object.entries(allParams)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');
  }

  /**
   * Check and handle rate limits
   */
  async checkRateLimit () {
    // StackOverflow rate limit é por IP
    // 300 requests/day sem key, 10,000 com key
    if (this.key) {
      this.rateLimit.remaining = 10000;
    } else {
      this.rateLimit.remaining = 300;
    }
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
  async request (endpoint, params = {}) {
    // Check cache first
    const cacheKey = `${endpoint}-${JSON.stringify(params)}`;
    const cached = this.getCache(cacheKey);
    if (cached) {
      console.log('[StackOverflowAPI] Cache hit:', endpoint);
      return cached;
    }

    // Check rate limit
    if (this.rateLimit.remaining <= 0) {
      console.warn('[StackOverflowAPI] Rate limit exceeded');
      throw new Error('Rate limit exceeded');
    }

    try {
      const queryString = this.buildQueryString(params);
      const url = `${this.baseUrl}${endpoint}?${queryString}`;

      const response = await fetch(url);

      // Handle backoff directive
      const backoff = response.headers.get('X-Backoff');
      if (backoff) {
        this.rateLimit.backoff = parseInt(backoff);
        console.warn(`[StackOverflowAPI] Backoff for ${backoff} seconds`);
      }

      if (!response.ok) {
        throw new Error(`StackOverflow API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // Update rate limit
      const remaining = parseInt(response.headers.get('X-RateLimit-Remaining')) || this.rateLimit.remaining - 1;
      this.rateLimit.remaining = remaining;

      // Handle quota exceeded
      if (data.error_id === 502) {
        throw new Error('StackOverflow API quota exceeded. Please add API key.');
      }

      // Cache response (only if successful)
      if (!data.error_id) {
        this.setCache(cacheKey, data);
      }

      return data;
    } catch (error) {
      console.error('[StackOverflowAPI] Request failed:', error);
      throw error;
    }
  }

  /**
   * Extract concepts from code using Chrome AI
   */
  async extractCodeConcepts (codeSnippet) {
    // TODO: Integrate with Chrome AI to extract concepts
    // For now, use simple extraction
    const lines = codeSnippet.split('\n')
      .filter(line => line.trim())
      .slice(0, 10)
      .join(' ');

    return lines.substring(0, 200);
  }

  /**
   * Find similar questions
   * @param {string} codeSnippet - Code snippet
   * @param {Object} options - Search options
   * @returns {Promise<Object>} Search results
   */
  async findSimilarQuestions (codeSnippet, options = {}) {
    try {
      const concepts = await this.extractCodeConcepts(codeSnippet);

      // Build query from code concepts
      const query = concepts.split(' ').slice(0, 10).join(' ');

      const data = await this.request('/search/advanced', {
        q: query,
        answers: options.hasAccepted ? '1' : undefined,
        sort: 'relevance',
        order: 'desc',
        pagesize: options.pageSize || 5
      });

      return {
        totalResults: data.total,
        questions: data.items.map(item => ({
          id: item.question_id,
          title: item.title,
          body: item.body ? item.body.substring(0, 500) : '',
          score: item.score,
          answerCount: item.answer_count,
          hasAccepted: item.accepted_answer_id,
          tags: item.tags,
          link: item.link,
          viewCount: item.view_count,
          creationDate: new Date(item.creation_date * 1000)
        }))
      };
    } catch (error) {
      console.error('[StackOverflowAPI] Failed to find similar questions:', error);
      return { totalResults: 0, questions: [] };
    }
  }

  /**
   * Get best practices for a technology
   * @param {string} technology - Technology/language name
   * @param {Object} options - Search options
   * @returns {Promise<Array>} Best practice questions
   */
  async getBestPractices (technology, options = {}) {
    try {
      const data = await this.request('/search/advanced', {
        tagged: technology,
        q: 'best practices OR best practice OR good practices',
        accepted: 'True', // Only accepted answers
        sort: 'votes',
        order: 'desc',
        pagesize: options.pageSize || 10
      });

      return data.items.map(item => ({
        id: item.question_id,
        title: item.title,
        body: item.body ? item.body.substring(0, 500) : '',
        score: item.score,
        acceptedAnswerId: item.accepted_answer_id,
        tags: item.tags,
        link: item.link,
        votes: item.score
      }));
    } catch (error) {
      console.error('[StackOverflowAPI] Failed to get best practices:', error);
      return [];
    }
  }

  /**
   * Find anti-patterns
   * @param {string} codeSnippet - Code to check
   * @param {string} language - Programming language
   * @returns {Promise<Array>} Anti-pattern results
   */
  async findAntiPatterns (codeSnippet, language = 'javascript') {
    try {
      const concepts = await this.extractCodeConcepts(codeSnippet);

      const data = await this.request('/search/advanced', {
        tagged: language,
        q: `anti-pattern OR antipattern OR bad practice ${concepts}`,
        sort: 'relevance',
        order: 'desc',
        pagesize: 5
      });

      return data.items.map(item => ({
        id: item.question_id,
        title: item.title,
        body: item.body ? item.body.substring(0, 300) : '',
        tags: item.tags,
        link: item.link,
        relevanceScore: item.score
      }));
    } catch (error) {
      console.error('[StackOverflowAPI] Failed to find anti-patterns:', error);
      return [];
    }
  }

  /**
   * Get educational context for a topic
   * @param {string} topic - Topic or technology
   * @param {Object} options - Options
   * @returns {Promise<Array>} Educational resources
   */
  async getEducationalContext (topic, options = {}) {
    try {
      const data = await this.request('/search', {
        intitle: topic,
        tagged: options.tagged,
        wiki: 'True', // Include wiki entries
        closed: 'False', // Not closed
        sort: 'votes',
        order: 'desc',
        pagesize: options.pageSize || 10
      });

      return data.items.map(item => ({
        id: item.question_id,
        title: item.title,
        body: item.body ? item.body.substring(0, 400) : '',
        tags: item.tags,
        score: item.score,
        answerCount: item.answer_count,
        link: item.link,
        isWiki: item.wiki
      }));
    } catch (error) {
      console.error('[StackOverflowAPI] Failed to get educational context:', error);
      return [];
    }
  }

  /**
   * Get question details and answers
   * @param {number} questionId - Question ID
   * @returns {Promise<Object>} Question with answers
   */
  async getQuestionDetails (questionId) {
    try {
      const data = await this.request(`/questions/${questionId}`, {
        filter: 'withbody' // Include full body
      });

      if (data.items.length === 0) {
        return null;
      }

      const question = data.items[0];

      // Get answers
      const answersData = await this.request(`/questions/${questionId}/answers`, {
        filter: 'withbody',
        sort: 'votes',
        order: 'desc'
      });

      return {
        question: {
          id: question.question_id,
          title: question.title,
          body: question.body,
          score: question.score,
          tags: question.tags,
          acceptedAnswerId: question.accepted_answer_id,
          viewCount: question.view_count,
          creationDate: new Date(question.creation_date * 1000),
          link: question.link
        },
        answers: answersData.items.map(answer => ({
          id: answer.answer_id,
          body: answer.body,
          score: answer.score,
          isAccepted: answer.is_accepted,
          creationDate: new Date(answer.creation_date * 1000),
          link: answer.link
        }))
      };
    } catch (error) {
      console.error('[StackOverflowAPI] Failed to get question details:', error);
      return null;
    }
  }

  /**
   * Search for questions by tag
   * @param {string} tag - Tag to search
   * @param {Object} options - Options
   * @returns {Promise<Array>} Questions
   */
  async searchByTag (tag, options = {}) {
    try {
      const data = await this.request('/search/advanced', {
        tagged: tag,
        sort: options.sort || 'votes',
        order: options.order || 'desc',
        pagesize: options.pageSize || 10
      });

      return data.items.map(item => ({
        id: item.question_id,
        title: item.title,
        score: item.score,
        tags: item.tags,
        link: item.link,
        answerCount: item.answer_count
      }));
    } catch (error) {
      console.error('[StackOverflowAPI] Failed to search by tag:', error);
      return [];
    }
  }
}

// Export singleton instance
const stackOverflowAPI = new StackOverflowAPI();

// Initialize
stackOverflowAPI.checkRateLimit().catch(() => {
  console.warn('[StackOverflowAPI] Initial rate limit check failed');
});

export default stackOverflowAPI;
