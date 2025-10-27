/**
 * DevMentor AI - GitHub API Integration
 *
 * Integração com GitHub API para:
 * - Buscar informações de repositórios
 * - Encontrar código similar
 * - Analisar padrões populares
 * - Enriquecer contexto educacional
 *
 * @version 1.0.0
 * @author DevMentor AI Team
 */
/* eslint-disable no-console */

class GitHubAPI {
  constructor () {
    this.baseUrl = 'https://api.github.com';
    this.token = null; // Optional GitHub token para rate limit
    this.cache = new Map();
    this.cacheExpiry = 3600000; // 1 hora
    this.rateLimit = {
      remaining: 60,
      resetAt: null
    };

    console.log('[GitHubAPI] Initialized');
  }

  /**
   * Set optional GitHub token
   * @param {string} token - GitHub personal access token
   */
  setToken (token) {
    this.token = token;
    this.rateLimit.remaining = 5000; // Com token: 5000 requests/hour
    console.log('[GitHubAPI] Token configured');
  }

  /**
   * Get headers for API requests
   */
  getHeaders () {
    const headers = {
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    };

    if (this.token) {
      headers.Authorization = `token ${this.token}`;
    }

    return headers;
  }

  /**
   * Check and handle rate limits
   */
  async checkRateLimit () {
    try {
      const response = await fetch(`${this.baseUrl}/rate_limit`, {
        headers: this.getHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        this.rateLimit = {
          remaining: data.rate.remaining,
          resetAt: data.rate.reset * 1000
        };
      }
    } catch (error) {
      console.warn('[GitHubAPI] Rate limit check failed:', error);
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
  async request (endpoint, options = {}) {
    // Check cache first
    const cacheKey = `${endpoint}-${JSON.stringify(options)}`;
    const cached = this.getCache(cacheKey);
    if (cached) {
      console.log('[GitHubAPI] Cache hit:', endpoint);
      return cached;
    }

    // Check rate limit
    if (this.rateLimit.remaining <= 0) {
      const waitTime = this.rateLimit.resetAt - Date.now();
      console.warn(`[GitHubAPI] Rate limit exceeded. Wait ${Math.ceil(waitTime / 1000)}s`);
      throw new Error('Rate limit exceeded');
    }

    try {
      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        ...options,
        headers: this.getHeaders()
      });

      // Update rate limit
      const remaining = parseInt(response.headers.get('X-RateLimit-Remaining')) || this.rateLimit.remaining - 1;
      this.rateLimit.remaining = remaining;

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // Cache response
      this.setCache(cacheKey, data);

      return data;
    } catch (error) {
      console.error('[GitHubAPI] Request failed:', error);
      throw error;
    }
  }

  /**
   * Parse repository URL to owner/name
   */
  parseRepoUrl (repoUrl) {
    const match = repoUrl.match(/github\.com\/([\w-]+)\/([\w-.]+)/);
    if (!match) {
      throw new Error('Invalid GitHub repository URL');
    }
    return {
      owner: match[1],
      name: match[2].replace(/\.git$/, '')
    };
  }

  /**
   * Get repository information
   * @param {string} repoUrl - GitHub repository URL
   * @returns {Promise<Object>} Repository information
   */
  async getRepositoryInfo (repoUrl) {
    try {
      const repo = this.parseRepoUrl(repoUrl);
      const data = await this.request(`/repos/${repo.owner}/${repo.name}`);

      return {
        name: data.name,
        fullName: data.full_name,
        description: data.description,
        stars: data.stargazers_count,
        forks: data.forks_count,
        language: data.language,
        languages: data.languages_url,
        topics: data.topics || [],
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        license: data.license?.name,
        hasIssues: data.has_issues,
        openIssues: data.open_issues_count
      };
    } catch (error) {
      console.error('[GitHubAPI] Failed to get repo info:', error);
      return null;
    }
  }

  /**
   * Find similar code on GitHub
   * @param {string} codeSnippet - Code to search for
   * @param {string} language - Programming language (optional)
   * @returns {Promise<Array>} Similar code results
   */
  async findSimilarCode (codeSnippet, language = null) {
    try {
      // Extract key concepts from code (first/last lines)
      const lines = codeSnippet.split('\n').filter(line => line.trim());
      const firstLine = lines[0]?.substring(0, 80) ?? '';
      const lastLine = lines.length > 1 ? lines[lines.length - 1]?.substring(0, 80) : '';

      // Build search query
      let query = firstLine || codeSnippet.substring(0, 120);
      if (lastLine && lastLine !== firstLine) {
        query += ` ${lastLine}`;
      }
      if (language) {
        query += ` language:${language}`;
      }

      const data = await this.request(`/search/code?q=${encodeURIComponent(query)}&per_page=5`);

      return {
        totalResults: data.total_count,
        results: data.items.map(item => ({
          name: item.name,
          path: item.path,
          repository: item.repository.full_name,
          url: item.html_url,
          score: item.score
        }))
      };
    } catch (error) {
      console.error('[GitHubAPI] Failed to find similar code:', error);
      return { totalResults: 0, results: [] };
    }
  }

  /**
   * Get popular patterns for a language
   * @param {string} language - Programming language
   * @returns {Promise<Array>} Trending repositories
   */
  async getPopularPatterns (language) {
    try {
      const data = await this.request(
        `/search/repositories?q=language:${language}&sort=stars&order=desc&per_page=10`
      );

      return data.items.map(repo => ({
        name: repo.full_name,
        description: repo.description,
        stars: repo.stargazers_count,
        language: repo.language,
        url: repo.html_url,
        createdAt: repo.created_at
      }));
    } catch (error) {
      console.error('[GitHubAPI] Failed to get popular patterns:', error);
      return [];
    }
  }

  /**
   * Analyze trending projects
   * @param {Object} options - Filter options
   * @returns {Promise<Array>} Trending repositories
   */
  async analyzeTrendingProjects (options = {}) {
    try {
      const { language, since = 'daily' } = options;
      let query = `created:>${this.getSinceDate(since)}`;

      if (language) {
        query += ` language:${language}`;
      }

      const data = await this.request(
        `/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=10`
      );

      return data.items.map(repo => ({
        name: repo.full_name,
        description: repo.description,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        language: repo.language,
        topics: repo.topics,
        url: repo.html_url,
        createdAt: repo.created_at
      }));
    } catch (error) {
      console.error('[GitHubAPI] Failed to analyze trending:', error);
      return [];
    }
  }

  /**
   * Get since date for trending
   */
  getSinceDate (since) {
    const now = new Date();
    switch (since) {
    case 'daily':
      now.setDate(now.getDate() - 1);
      break;
    case 'weekly':
      now.setDate(now.getDate() - 7);
      break;
    case 'monthly':
      now.setMonth(now.getMonth() - 1);
      break;
    }
    return now.toISOString().split('T')[0];
  }

  /**
   * Get file content from repository
   * @param {string} repoUrl - Repository URL
   * @param {string} filePath - File path in repository
   * @returns {Promise<string>} File content
   */
  async getFileContent (repoUrl, filePath) {
    try {
      const repo = this.parseRepoUrl(repoUrl);
      const data = await this.request(`/repos/${repo.owner}/${repo.name}/contents/${filePath}`);

      // Decode base64 content
      if (data.encoding === 'base64' && data.content) {
        return atob(data.content.replace(/\n/g, ''));
      }

      return data.content;
    } catch (error) {
      console.error('[GitHubAPI] Failed to get file content:', error);
      return null;
    }
  }

  /**
   * Get repository languages breakdown
   * @param {string} repoUrl - Repository URL
   * @returns {Promise<Object>} Languages with percentages
   */
  async getLanguages (repoUrl) {
    try {
      const repo = this.parseRepoUrl(repoUrl);
      const data = await this.request(`/repos/${repo.owner}/${repo.name}/languages`);
      const entries = Object.entries(data);
      const total = entries.reduce((sum, [, value]) => sum + value, 0) || 1;

      return Object.fromEntries(
        entries.map(([lang, bytes]) => [
          lang,
          {
            bytes,
            percentage: ((bytes / total) * 100).toFixed(2)
          }
        ])
      );
    } catch (error) {
      console.error('[GitHubAPI] Failed to get languages:', error);
      return {};
    }
  }

  /**
   * Check if code exists on GitHub
   * @param {string} codeSnippet - Code to check
   * @param {string} language - Programming language
   * @returns {Promise<Object>} Search results
   */
  async checkCodeExistence (codeSnippet, language = null) {
    try {
      // Use first few lines to search
      const searchText = codeSnippet.split('\n').slice(0, 3).join(' ').substring(0, 100);
      let query = `"${searchText}"`;

      if (language) {
        query += ` language:${language}`;
      }

      const data = await this.request(`/search/code?q=${encodeURIComponent(query)}&per_page=1`);

      return {
        exists: data.total_count > 0,
        matchCount: data.total_count,
        firstMatch: data.items[0] || null
      };
    } catch (error) {
      console.error('[GitHubAPI] Failed to check code existence:', error);
      return { exists: false, matchCount: 0, firstMatch: null };
    }
  }
}

// Export singleton instance
const githubAPI = new GitHubAPI();

// Initialize rate limit check on creation
githubAPI.checkRateLimit().catch(() => {
  console.warn('[GitHubAPI] Initial rate limit check failed');
});

export default githubAPI;
