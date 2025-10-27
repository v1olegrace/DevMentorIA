/**
 * GitHub Integration Service for Frontend
 * Communicates with background script GitHub Integration module
 */

export interface GitHubRepository {
  fullName: string;
  name: string;
  owner: string;
  description: string;
  stars: number;
  forks: number;
  watchers: number;
  openIssues: number;
  language: string;
  license: string | null;
  topics: string[];
  createdAt: string;
  updatedAt: string;
  htmlUrl: string;
}

export interface CodeSimilarityResult {
  repository: string;
  path: string;
  htmlUrl: string;
  stars: number;
  language: string;
  similarity: number;
  snippet: string;
}

export interface PopularPatternsResult {
  totalRepositories: number;
  commonTopics: Array<{ topic: string; count: number }>;
  popularLicenses: Array<{ license: string; count: number }>;
  averageStars: number;
  topRepositories: Array<{
    fullName: string;
    stars: number;
    description: string;
  }>;
}

export interface RateLimitStatus {
  limit: number;
  remaining: number;
  reset: Date;
  resetIn: string;
}

/**
 * GitHub Service - Frontend wrapper for background GitHub Integration
 */
class GitHubService {
  /**
   * Send message to background script
   */
  private async sendMessage<T>(action: string, params: Record<string, unknown> = {}): Promise<T> {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        { action, ...params },
        (response) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }

          if (!response) {
            reject(new Error('No response from background script'));
            return;
          }

          if (response.success) {
            resolve(response.data);
          } else {
            reject(new Error(response.error || 'Unknown error'));
          }
        }
      );
    });
  }

  /**
   * Get repository information
   */
  async getRepositoryInfo(repository: string): Promise<GitHubRepository> {
    return this.sendMessage<GitHubRepository>('github-get-repo', { repository });
  }

  /**
   * Find similar code in GitHub
   */
  async findSimilarCode(
    code: string,
    options?: {
      language?: string;
      maxResults?: number;
      minStars?: number;
    }
  ): Promise<CodeSimilarityResult[]> {
    return this.sendMessage<CodeSimilarityResult[]>('github-find-similar', {
      code,
      options
    });
  }

  /**
   * Get popular patterns for a language
   */
  async getPopularPatterns(
    language: string,
    options?: {
      minStars?: number;
      topic?: string;
      maxRepos?: number;
    }
  ): Promise<PopularPatternsResult> {
    return this.sendMessage<PopularPatternsResult>('github-patterns', {
      language,
      options
    });
  }

  /**
   * Set GitHub token
   */
  async setToken(token: string): Promise<void> {
    await this.sendMessage('github-set-token', { token });
  }

  /**
   * Remove GitHub token
   */
  async removeToken(): Promise<void> {
    await this.sendMessage('github-remove-token');
  }

  /**
   * Get rate limit status
   */
  async getRateLimitStatus(): Promise<RateLimitStatus> {
    return this.sendMessage<RateLimitStatus>('github-rate-limit');
  }

  /**
   * Get metrics
   */
  async getMetrics(): Promise<{
    totalRequests: number;
    cacheHits: number;
    cacheMisses: number;
    cacheHitRate: string;
    errors: number;
    errorRate: string;
    avgResponseTime: number;
  }> {
    return this.sendMessage('github-metrics');
  }

  /**
   * Clear cache
   */
  async clearCache(): Promise<void> {
    await this.sendMessage('github-clear-cache');
  }
}

// Export singleton
export const githubService = new GitHubService();
export default githubService;
