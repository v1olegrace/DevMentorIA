/**
 * DevMentor AI - AI Session Manager
 * Manages Chrome Built-in AI API sessions and provides abstraction layer
 */
/* eslint-disable no-console, security/detect-object-injection */

const ai = globalThis.ai;

export class AIManager {
  constructor () {
    this.sessions = new Map();
    this.isInitialized = false;
    this.initializationPromise = null;
    this.config = null;
    this.lastCleanup = Date.now();

    // Initialize secure logger
    this.logger = {
      debug: (...args) => console.debug('[AIManager]', ...args),
      info: (...args) => console.info('[AIManager]', ...args),
      warn: (...args) => console.warn('[AIManager]', ...args),
      error: (...args) => console.error('[AIManager]', ...args)
    };

    // Bind methods
    this.initialize = this.initialize.bind(this);
    this.createSession = this.createSession.bind(this);
    this.processRequest = this.processRequest.bind(this);
  }

  /**
   * Initialize AI Manager
   * @returns {Promise<boolean>} Initialization success
   */
  async initialize () {
    if (this.isInitialized) return true;

    if (this.initializationPromise) {
      return await this.initializationPromise;
    }

    this.initializationPromise = this._doInitialize();
    return await this.initializationPromise;
  }

  /**
   * Internal initialization logic
   * @returns {Promise<boolean>} Success status
   * @private
   */
  async _doInitialize () {
    try {
      this.logger.info('[AIManager] Initializing...');

      // Import configuration
      if (!this.config) {
        // Configuration should be loaded from constants
        this.config = {
          MAX_RETRIES: 3,
          RETRY_DELAY: 1000,
          SESSION_TIMEOUT: 300000, // 5 minutes
          MAX_CODE_LENGTH: 10000,
          PROMPTS: {
            EXPLAIN: `You are DevMentor AI, an expert programming mentor focused on education.
              Analyze the provided code and explain it clearly for learning purposes.
              Structure your response with:
              1. Brief overview of what the code does
              2. Step-by-step explanation of key parts
              3. Important concepts or patterns used
              4. Time/space complexity if relevant
              5. Potential improvements or alternatives
              
              Keep explanations educational, encouraging, and beginner-friendly while being technically accurate.`,

            DEBUG: `You are DevMentor AI, a debugging expert.
              Analyze the provided code for potential issues:
              1. Syntax errors or typos
              2. Logic bugs and edge cases
              3. Performance issues
              4. Security vulnerabilities
              5. Memory leaks or resource issues
              6. Best practice violations
              
              For each issue found, provide:
              - Clear description of the problem
              - Specific line references when possible
              - Suggested fixes with explanations
              - Why the fix improves the code
              
              If no issues are found, suggest potential optimizations or improvements.`,

            DOCUMENT: `You are DevMentor AI, a technical documentation expert.
              Generate comprehensive documentation for the provided code:
              1. Function/class/module descriptions
              2. Parameter details with types and purposes
              3. Return value explanations
              4. Usage examples
              5. JSDoc/docstring format when appropriate
              6. Edge cases and error handling
              
              Make documentation clear, complete, and maintainable.`,

            REFACTOR: `You are DevMentor AI, a code quality expert.
              Analyze the provided code and suggest improvements:
              1. Code structure and organization
              2. Design patterns that could be applied
              3. Performance optimizations
              4. Readability improvements
              5. Maintainability enhancements
              6. Modern language features that could be used
              
              Explain the benefits of each suggestion and provide example implementations.`
          }
        };
      }

      // Check AI availability
      const isAvailable = await this.checkAIAvailability();
      if (!isAvailable) {
        throw new Error('Chrome Built-in AI is not available');
      }

      // Create initial sessions
      await this.createInitialSessions();

      // Set up cleanup interval
      this.startCleanupInterval();

      this.isInitialized = true;
      this.logger.info('[AIManager] Initialized successfully');
      return true;
    } catch (error) {
      this.logger.error('[AIManager] Initialization failed:', error);
      this.isInitialized = false;
      return false;
    }
  }

  /**
   * Check if Chrome Built-in AI is available
   * @returns {Promise<boolean>} Availability status
   */
  async checkAIAvailability () {
    try {
      // Check if AI APIs exist
      if (typeof ai === 'undefined') {
        this.logger.warn('[AIManager] AI object not found');
        return false;
      }

      if (!ai.prompt || !ai.writer || !ai.proofreader || !ai.rewriter) {
        this.logger.warn('[AIManager] Required AI APIs not available');
        return false;
      }

      // Try creating a test session
      const testSession = await ai.prompt.create({
        systemPrompt: 'You are a test assistant.'
      });

      await testSession.destroy();
      return true;
    } catch (error) {
      this.logger.error('[AIManager] AI availability check failed:', error);
      return false;
    }
  }

  /**
   * Create initial AI sessions
   * @returns {Promise<void>}
   */
  async createInitialSessions () {
    const sessionTypes = ['prompt', 'writer', 'proofreader', 'rewriter'];

    for (const type of sessionTypes) {
      try {
        await this.createSession(type);
      } catch (error) {
        this.logger.warn(`[AIManager] Failed to create initial ${type} session:`, error);
      }
    }
  }

  /**
   * Create or get existing AI session
   * @param {string} type - Session type (prompt, writer, proofreader, rewriter)
   * @param {Object} options - Session options
   * @returns {Promise<Object>} AI session
   */
  async createSession (type, options = {}) {
    const sessionKey = `${type}_${JSON.stringify(options)}`;

    // Check if session already exists and is valid
    if (this.sessions.has(sessionKey)) {
      const session = this.sessions.get(sessionKey);
      if (this.isSessionValid(session)) {
        return session.instance;
      } else {
        await this.destroySession(sessionKey);
      }
    }

    try {
      let sessionInstance;
      const sessionOptions = this.getSessionOptions(type, options);

      switch (type) {
      case 'prompt':
        sessionInstance = await ai.prompt.create(sessionOptions);
        break;
      case 'writer':
        sessionInstance = await ai.writer.create(sessionOptions);
        break;
      case 'proofreader':
        sessionInstance = await ai.proofreader.create(sessionOptions);
        break;
      case 'rewriter':
        sessionInstance = await ai.rewriter.create(sessionOptions);
        break;
      default:
        throw new Error(`Unknown session type: ${type}`);
      }

      // Store session with metadata
      const sessionData = {
        instance: sessionInstance,
        type,
        options,
        created: Date.now(),
        lastUsed: Date.now(),
        usageCount: 0
      };

      this.sessions.set(sessionKey, sessionData);
      this.logger.info(`[AIManager] Created ${type} session:`, sessionKey);

      return sessionInstance;
    } catch (error) {
      this.logger.error(`[AIManager] Failed to create ${type} session:`, error);
      throw error;
    }
  }

  /**
   * Get session options for specific type
   * @param {string} type - Session type
   * @param {Object} customOptions - Custom options
   * @returns {Object} Complete session options
   */
  getSessionOptions (type, customOptions = {}) {
    const defaultOptions = {
      prompt: {
        systemPrompt: this.config.PROMPTS.EXPLAIN,
        temperature: 0.7,
        topK: 40
      },
      writer: {
        tone: 'professional',
        format: 'markdown',
        length: 'medium'
      },
      proofreader: {
        context: 'technical'
      },
      rewriter: {
        tone: 'professional',
        format: 'markdown'
      }
    };

    return { ...defaultOptions[type], ...customOptions };
  }

  /**
   * Process AI request with retry logic
   * @param {string} type - Request type (explain, debug, document, refactor)
   * @param {string} code - Code to process
   * @param {Object} options - Processing options
   * @returns {Promise<Object>} Processing result
   */
  async processRequest (type, code, options = {}) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    // Validate input
    const validation = this.validateInput(code, options);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // Create processing context
    const context = this.createProcessingContext(type, code, options);

    // Process with retry logic
    return await this.executeWithRetry(async () => {
      return await this.processWithAI(context);
    });
  }

  /**
   * Validate processing input
   * @param {string} code - Code to validate
   * @param {Object} options - Options to validate
   * @returns {Object} Validation result
   */
  validateInput (code, options) {
    if (!code || typeof code !== 'string') {
      return { isValid: false, error: 'Code input is required' };
    }

    if (code.length > this.config.MAX_CODE_LENGTH) {
      return { isValid: false, error: 'Code is too long' };
    }

    if (code.trim().length === 0) {
      return { isValid: false, error: 'Code cannot be empty' };
    }

    return { isValid: true };
  }

  /**
   * Create processing context
   * @param {string} type - Processing type
   * @param {string} code - Code to process
   * @param {Object} options - Processing options
   * @returns {Object} Processing context
   */
  createProcessingContext (type, code, options) {
    const language = options.language || 'auto';
    const systemPrompt = this.getSystemPrompt(type, language);

    return {
      type,
      code,
      language,
      systemPrompt,
      options,
      timestamp: Date.now(),
      requestId: this.generateRequestId()
    };
  }

  /**
   * Get appropriate system prompt for request type
   * @param {string} type - Request type
   * @param {string} language - Programming language
   * @returns {string} System prompt
   */
  getSystemPrompt (type, language) {
    const basePrompts = this.config.PROMPTS;
    const languageContext = language !== 'auto'
      ? `\n\nNote: The code is written in ${language}.`
      : '';

    switch (type) {
    case 'explain':
      return basePrompts.EXPLAIN + languageContext;
    case 'debug':
      return basePrompts.DEBUG + languageContext;
    case 'document':
      return basePrompts.DOCUMENT + languageContext;
    case 'refactor':
      return basePrompts.REFACTOR + languageContext;
    default:
      return basePrompts.EXPLAIN + languageContext;
    }
  }

  /**
   * Process request with AI
   * @param {Object} context - Processing context
   * @returns {Promise<Object>} Processing result
   */
  async processWithAI (context) {
    const { type, code, systemPrompt, options } = context;

    try {
      // Get or create prompt session
      const promptSession = await this.createSession('prompt', {
        systemPrompt
      });

      // Update session usage
      this.updateSessionUsage(promptSession);

      // Create user prompt
      const userPrompt = this.createUserPrompt(type, code, options);

      // Get AI response
      const response = await promptSession.prompt(userPrompt);

      // Post-process response if needed
      let processedResponse = response;

      if (type === 'document') {
        // Use proofreader for documentation
        const proofreaderSession = await this.createSession('proofreader');
        processedResponse = await proofreaderSession.proofread(response);
      }

      return {
        success: true,
        result: processedResponse,
        type,
        timestamp: Date.now(),
        requestId: context.requestId
      };
    } catch (error) {
      this.logger.error('[AIManager] Processing failed:', error);
      throw error;
    }
  }

  /**
   * Create user prompt for specific request type
   * @param {string} type - Request type
   * @param {string} code - Code to analyze
   * @param {Object} options - Additional options
   * @returns {string} Formatted user prompt
   */
  createUserPrompt (type, code, options) {
    const basePrompt = `Here is the code to analyze:\n\n\`\`\`\n${code}\n\`\`\`\n\n`;

    const typeInstructions = {
      explain: 'Please explain this code in detail.',
      debug: 'Please analyze this code for bugs and potential issues.',
      document: 'Please generate comprehensive documentation for this code.',
      refactor: 'Please suggest improvements and refactoring opportunities for this code.'
    };

    let prompt = basePrompt + typeInstructions[type];

    // Add language hint if available
    if (options.language && options.language !== 'auto') {
      prompt += `\n\nLanguage: ${options.language}`;
    }

    // Add additional context if provided
    if (options.context) {
      prompt += `\n\nContext: ${options.context}`;
    }

    return prompt;
  }

  /**
   * Execute function with retry logic
   * @param {Function} fn - Function to execute
   * @param {number} maxRetries - Maximum retry attempts
   * @returns {Promise<*>} Function result
   */
  async executeWithRetry (fn, maxRetries = null) {
    const retries = maxRetries || this.config.MAX_RETRIES;
    let lastError;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;

        if (attempt === retries) {
          break;
        }

        // Check if error is retryable
        if (!this.isRetryableError(error)) {
          throw error;
        }

        // Wait before retry with exponential backoff
        const delay = this.config.RETRY_DELAY * Math.pow(2, attempt);
        await this.sleep(delay);

        this.logger.info(`[AIManager] Retrying... Attempt ${attempt + 2}/${retries + 1}`);
      }
    }

    throw lastError;
  }

  /**
   * Check if error is retryable
   * @param {Error} error - Error to check
   * @returns {boolean} Whether error is retryable
   */
  isRetryableError (error) {
    const retryableMessages = [
      'session expired',
      'timeout',
      'temporarily unavailable',
      'rate limit',
      'quota exceeded'
    ];

    const message = error.message?.toLowerCase() || '';
    return retryableMessages.some(msg => message.includes(msg));
  }

  /**
   * Check if session is valid and not expired
   * @param {Object} sessionData - Session data
   * @returns {boolean} Session validity
   */
  isSessionValid (sessionData) {
    if (!sessionData || !sessionData.instance) {
      return false;
    }

    const now = Date.now();
    const age = now - sessionData.created;

    // Check if session is expired
    if (age > this.config.SESSION_TIMEOUT) {
      return false;
    }

    // Check if session instance is still valid
    try {
      // Some basic validation - this might vary based on actual API
      return typeof sessionData.instance.prompt === 'function' ||
             typeof sessionData.instance.write === 'function' ||
             typeof sessionData.instance.proofread === 'function' ||
             typeof sessionData.instance.rewrite === 'function';
    } catch (error) {
      return false;
    }
  }

  /**
   * Update session usage statistics
   * @param {Object} sessionInstance - AI session instance
   */
  updateSessionUsage (sessionInstance) {
    for (const sessionData of this.sessions.values()) {
      if (sessionData.instance === sessionInstance) {
        sessionData.lastUsed = Date.now();
        sessionData.usageCount += 1;
        break;
      }
    }
  }

  /**
   * Destroy specific session
   * @param {string} sessionKey - Session key to destroy
   * @returns {Promise<void>}
   */
  async destroySession (sessionKey) {
    if (!this.sessions.has(sessionKey)) {
      return;
    }

    try {
      const sessionData = this.sessions.get(sessionKey);
      if (sessionData.instance && sessionData.instance.destroy) {
        await sessionData.instance.destroy();
      }
    } catch (error) {
      this.logger.warn(`[AIManager] Error destroying session ${sessionKey}:`, error);
    } finally {
      this.sessions.delete(sessionKey);
    }
  }

  /**
   * Clean up expired sessions
   * @returns {Promise<void>}
   */
  async cleanupSessions () {
    const now = Date.now();
    const expiredSessions = [];

    for (const [key, sessionData] of this.sessions.entries()) {
      const age = now - sessionData.created;
      const timeSinceLastUse = now - sessionData.lastUsed;

      // Mark for cleanup if expired or unused for too long
      if (age > this.config.SESSION_TIMEOUT ||
          timeSinceLastUse > this.config.SESSION_TIMEOUT) {
        expiredSessions.push(key);
      }
    }

    // Clean up expired sessions
    for (const key of expiredSessions) {
      await this.destroySession(key);
    }

    if (expiredSessions.length > 0) {
      this.logger.info(`[AIManager] Cleaned up ${expiredSessions.length} expired sessions`);
    }

    this.lastCleanup = now;
  }

  /**
   * Start automatic cleanup interval
   */
  startCleanupInterval () {
    // Clean up every 5 minutes
    setInterval(() => {
      this.cleanupSessions();
    }, 5 * 60 * 1000);
  }

  /**
   * Get session statistics
   * @returns {Object} Session statistics
   */
  getSessionStats () {
    const stats = {
      total: this.sessions.size,
      byType: {},
      totalUsage: 0,
      averageAge: 0,
      oldestSession: null,
      newestSession: null
    };

    let totalAge = 0;
    let oldest = Infinity;
    let newest = 0;

    for (const [key, sessionData] of this.sessions.entries()) {
      // Count by type
      stats.byType[sessionData.type] = (stats.byType[sessionData.type] || 0) + 1;

      // Sum usage
      stats.totalUsage += sessionData.usageCount;

      // Calculate age statistics
      const age = Date.now() - sessionData.created;
      totalAge += age;

      if (age < oldest) {
        oldest = age;
        stats.newestSession = key;
      }

      if (age > newest) {
        newest = age;
        stats.oldestSession = key;
      }
    }

    if (this.sessions.size > 0) {
      stats.averageAge = Math.round(totalAge / this.sessions.size);
    }

    return stats;
  }

  /**
   * Generate unique request ID
   * @returns {string} Unique request identifier
   */
  generateRequestId () {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Sleep for specified duration
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise<void>}
   */
  sleep (ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Destroy all sessions and cleanup
   * @returns {Promise<void>}
   */
  async destroy () {
    this.logger.info('[AIManager] Destroying all sessions...');

    const destroyPromises = Array.from(this.sessions.keys()).map(key =>
      this.destroySession(key)
    );

    await Promise.all(destroyPromises);

    this.sessions.clear();
    this.isInitialized = false;
    this.initializationPromise = null;

    this.logger.info('[AIManager] All sessions destroyed');
  }

  /**
   * Process multimodal request (screenshot analysis)
   * @param {string} base64Image - Base64 encoded image
   * @param {Object} options - Processing options
   * @returns {Promise<Object>} Processing result
   */
  async processMultimodalRequest (base64Image, options = {}) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Create multimodal prompt session
      const promptSession = await this.createSession('prompt', {
        systemPrompt: `You are DevMentor AI analyzing a code image/screenshot.
          Extract and explain the visible code:
          1. Transcribe the code if readable
          2. Identify the programming language
          3. Explain what the code does
          4. Point out any visible issues
          5. Suggest improvements if appropriate
          
          If the image is unclear or contains non-code content, explain what you can see and ask for clarification.`
      });

      // Create multimodal input
      const userPrompt = [
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type: options.mediaType || 'image/png',
            data: base64Image
          }
        },
        {
          type: 'text',
          text: 'Please analyze the code in this image and provide a detailed explanation.'
        }
      ];

      // Process with AI
      const response = await promptSession.prompt(userPrompt);

      return {
        success: true,
        result: response,
        type: 'multimodal',
        timestamp: Date.now(),
        requestId: this.generateRequestId()
      };
    } catch (error) {
      this.logger.error('[AIManager] Multimodal processing failed:', error);
      throw error;
    }
  }

  /**
   * Get AI Manager health status
   * @returns {Object} Health status
   */
  async getHealthStatus () {
    return {
      initialized: this.isInitialized,
      aiAvailable: await this.checkAIAvailability(),
      sessionCount: this.sessions.size,
      lastCleanup: this.lastCleanup,
      stats: this.getSessionStats(),
      timestamp: Date.now()
    };
  }
}

// Export singleton instance
export const aiManager = new AIManager();
