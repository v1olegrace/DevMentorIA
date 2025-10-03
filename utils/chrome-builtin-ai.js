/**
 * DevMentor AI - Chrome Built-in AI Integration
 * Uses Chrome's Prompt API (Gemini Nano) for local AI processing
 * Based on official Chrome Prompt API documentation
 */

class ChromeBuiltInAI {
  constructor() {
    this.isAvailable = false;
    this.session = null;
    this.logger = {
      debug: (...args) => console.debug('[ChromeAI]', ...args),
      info: (...args) => console.info('[ChromeAI]', ...args),
      warn: (...args) => console.warn('[ChromeAI]', ...args),
      error: (...args) => console.error('[ChromeAI]', ...args)
    };
    
    this.init();
  }

  /**
   * Initialize Chrome Built-in AI
   */
  async init() {
    try {
      // Check if Prompt API is available
      if (typeof window !== 'undefined' && 'ai' in window) {
        this.isAvailable = await this.checkAvailability();
        this.logger.info('Chrome Built-in AI availability:', this.isAvailable);
      } else {
        this.logger.warn('Chrome Prompt API not available');
        this.isAvailable = false;
      }
    } catch (error) {
      this.logger.error('Failed to initialize Chrome AI:', error);
      this.isAvailable = false;
    }
  }

  /**
   * Check if Chrome Prompt API is available
   * @returns {Promise<boolean>} - Availability status
   */
  async checkAvailability() {
    try {
      if (typeof window === 'undefined' || !('ai' in window)) {
        return false;
      }

      const { LanguageModel } = window.ai;
      const available = await LanguageModel.availability();
      
      return available !== 'unavailable';
    } catch (error) {
      this.logger.error('Availability check failed:', error);
      return false;
    }
  }

  /**
   * Create AI session
   * @returns {Promise<boolean>} - Success status
   */
  async createSession() {
    try {
      if (!this.isAvailable) {
        throw new Error('Chrome Prompt API not available');
      }

      const { LanguageModel } = window.ai;
      this.session = await LanguageModel.create();
      
      this.logger.info('AI session created successfully');
      return true;
    } catch (error) {
      this.logger.error('Failed to create AI session:', error);
      return false;
    }
  }

  /**
   * Process code analysis using Chrome Built-in AI
   * @param {string} code - Code to analyze
   * @param {string} type - Analysis type (explain, debug, document, refactor)
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} - Analysis result
   */
  async processCode(code, type, options = {}) {
    try {
      if (!this.session) {
        const sessionCreated = await this.createSession();
        if (!sessionCreated) {
          throw new Error('Failed to create AI session');
        }
      }

      const prompt = this.buildPrompt(code, type, options);
      const result = await this.session.prompt(prompt);
      
      return {
        success: true,
        result: result,
        type: type,
        timestamp: new Date().toISOString(),
        provider: 'Chrome Built-in AI (Gemini Nano)'
      };
    } catch (error) {
      this.logger.error('Code processing failed:', error);
      return {
        success: false,
        error: error.message,
        type: type,
        timestamp: new Date().toISOString(),
        provider: 'Chrome Built-in AI (Gemini Nano)'
      };
    }
  }

  /**
   * Build prompt for code analysis
   * @param {string} code - Code to analyze
   * @param {string} type - Analysis type
   * @param {Object} options - Additional options
   * @returns {string} - Built prompt
   */
  buildPrompt(code, type, options = {}) {
    const language = options.language || 'javascript';
    const context = options.context || '';

    const prompts = {
      explain: `Explain this ${language} code in detail. Focus on:
- What the code does
- How it works
- Key concepts and patterns
- Potential improvements

Code:
\`\`\`${language}
${code}
\`\`\`

${context ? `Context: ${context}` : ''}

Provide a clear, educational explanation.`,

      debug: `Debug this ${language} code. Look for:
- Syntax errors
- Logic errors
- Potential runtime issues
- Performance problems
- Best practices violations

Code:
\`\`\`${language}
${code}
\`\`\`

${context ? `Context: ${context}` : ''}

Provide specific fixes and explanations.`,

      document: `Generate comprehensive documentation for this ${language} code:
- Function/class descriptions
- Parameter documentation
- Return value documentation
- Usage examples
- JSDoc format preferred

Code:
\`\`\`${language}
${code}
\`\`\`

${context ? `Context: ${context}` : ''}

Provide professional documentation.`,

      refactor: `Refactor this ${language} code for better:
- Readability
- Performance
- Maintainability
- Best practices
- Modern syntax

Code:
\`\`\`${language}
${code}
\`\`\`

${context ? `Context: ${context}` : ''}

Provide the refactored code with explanations.`
    };

    return prompts[type] || prompts.explain;
  }

  /**
   * Process code with streaming response
   * @param {string} code - Code to analyze
   * @param {string} type - Analysis type
   * @param {Object} options - Additional options
   * @returns {AsyncGenerator<string>} - Streaming result
   */
  async* processCodeStreaming(code, type, options = {}) {
    try {
      if (!this.session) {
        const sessionCreated = await this.createSession();
        if (!sessionCreated) {
          throw new Error('Failed to create AI session');
        }
      }

      const prompt = this.buildPrompt(code, type, options);
      const stream = this.session.promptStreaming(prompt);
      
      for await (const chunk of stream) {
        yield chunk;
      }
    } catch (error) {
      this.logger.error('Streaming processing failed:', error);
      yield `Error: ${error.message}`;
    }
  }

  /**
   * Get session usage information
   * @returns {Object} - Usage information
   */
  getSessionInfo() {
    if (!this.session) {
      return { available: false };
    }

    return {
      available: true,
      inputUsage: this.session.inputUsage || 0,
      inputQuota: this.session.inputQuota || 0,
      usagePercentage: this.session.inputQuota ? 
        (this.session.inputUsage / this.session.inputQuota) * 100 : 0
    };
  }

  /**
   * Clone session for new context
   * @returns {Promise<boolean>} - Success status
   */
  async cloneSession() {
    try {
      if (!this.session) {
        return false;
      }

      this.session = await this.session.clone();
      this.logger.info('AI session cloned successfully');
      return true;
    } catch (error) {
      this.logger.error('Failed to clone session:', error);
      return false;
    }
  }

  /**
   * Destroy current session
   */
  async destroySession() {
    try {
      if (this.session) {
        await this.session.destroy();
        this.session = null;
        this.logger.info('AI session destroyed');
      }
    } catch (error) {
      this.logger.error('Failed to destroy session:', error);
    }
  }

  /**
   * Check if Chrome Built-in AI is ready
   * @returns {boolean} - Ready status
   */
  isReady() {
    return this.isAvailable && this.session !== null;
  }

  /**
   * Get AI capabilities
   * @returns {Object} - Capabilities information
   */
  getCapabilities() {
    return {
      available: this.isAvailable,
      provider: 'Chrome Built-in AI (Gemini Nano)',
      features: [
        'Code explanation',
        'Debugging assistance',
        'Documentation generation',
        'Code refactoring',
        'Streaming responses',
        'Local processing (no external API calls)',
        'Privacy-focused (data stays on device)'
      ],
      limitations: [
        'Requires Chrome 138+',
        'Requires compatible hardware',
        'Limited context window',
        'No internet connectivity required'
      ]
    };
  }
}

// Export for use in extensions
if (typeof window !== 'undefined') {
  window.DevMentorChromeAI = ChromeBuiltInAI;
}

// Export for Node.js/CommonJS
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ChromeBuiltInAI;
}
