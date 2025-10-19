/**
 * DevMentor AI - Chrome Built-in AI Integration (Official API)
 *
 * CRITICAL: This module implements ALL 4 Chrome Built-in AI APIs:
 * 1. Prompt API (Gemini Nano) - Language model for code analysis
 * 2. Summarization API - Quick code summaries
 * 3. Write API - Documentation generation
 * 4. Rewrite API - Code refactoring
 *
 * Architecture:
 * - Enterprise-grade error handling with circuit breakers
 * - Graceful degradation when APIs unavailable
 * - Session management with proper cleanup
 * - Timeout protection on all operations
 *
 * @version 1.0.0
 * @hackathon Chrome Built-in AI Challenge 2024
 */

// Import Mock AI Fallback (static import for service worker compatibility)
import MockAIFallback from './mock-ai-fallback.js';

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const CONFIG = {
  // Timeout configurations (milliseconds)
  TIMEOUTS: {
    INITIALIZATION: 10000,      // 10 seconds for API initialization
    PROMPT: 30000,              // 30 seconds for prompt operations
    SUMMARIZATION: 20000,       // 20 seconds for summarization
    WRITE: 25000,               // 25 seconds for write operations
    REWRITE: 25000              // 25 seconds for rewrite operations
  },

  // Circuit breaker settings
  CIRCUIT_BREAKER: {
    MAX_FAILURES: 3,            // Max consecutive failures before opening circuit
    RESET_TIMEOUT: 60000,       // 1 minute before attempting reset
    HALF_OPEN_ATTEMPTS: 1       // Attempts allowed in half-open state
  },

  // Session management
  SESSION: {
    MAX_IDLE_TIME: 300000,      // 5 minutes idle before cleanup
    MAX_LIFETIME: 3600000,      // 1 hour max session lifetime
    CLEANUP_INTERVAL: 60000     // Check for stale sessions every minute
  },

  // API availability check intervals
  AVAILABILITY_CHECK_INTERVAL: 30000, // 30 seconds

  // Logging
  LOG_PREFIX: '[ChromeBuiltInAI]',
  ENABLE_VERBOSE_LOGGING: true
};

// ============================================================================
// CIRCUIT BREAKER IMPLEMENTATION
// ============================================================================

class CircuitBreaker {
  constructor(name, maxFailures = CONFIG.CIRCUIT_BREAKER.MAX_FAILURES) {
    this.name = name;
    this.state = 'CLOSED';  // CLOSED, OPEN, HALF_OPEN
    this.failures = 0;
    this.maxFailures = maxFailures;
    this.lastFailureTime = null;
    this.successCount = 0;
  }

  /**
   * Execute operation with circuit breaker protection
   * @param {Function} operation - Async operation to execute
   * @returns {Promise<any>} Operation result
   * @throws {Error} If circuit is open or operation fails
   */
  async execute(operation) {
    // Check circuit state before execution
    if (this.state === 'OPEN') {
      const timeSinceFailure = Date.now() - this.lastFailureTime;

      if (timeSinceFailure > CONFIG.CIRCUIT_BREAKER.RESET_TIMEOUT) {
        this.log(`Attempting to close circuit for ${this.name}`);
        this.state = 'HALF_OPEN';
        this.successCount = 0;
      } else {
        throw new Error(`Circuit breaker is OPEN for ${this.name}. Try again in ${Math.ceil((CONFIG.CIRCUIT_BREAKER.RESET_TIMEOUT - timeSinceFailure) / 1000)}s`);
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  onSuccess() {
    this.failures = 0;

    if (this.state === 'HALF_OPEN') {
      this.successCount++;
      if (this.successCount >= CONFIG.CIRCUIT_BREAKER.HALF_OPEN_ATTEMPTS) {
        this.state = 'CLOSED';
        this.log(`Circuit closed for ${this.name}`);
      }
    }
  }

  onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.maxFailures) {
      this.state = 'OPEN';
      this.log(`Circuit opened for ${this.name} after ${this.failures} failures`, 'error');
    }
  }

  reset() {
    this.state = 'CLOSED';
    this.failures = 0;
    this.lastFailureTime = null;
    this.successCount = 0;
  }

  log(message, level = 'info') {
    const logFn = level === 'error' ? console.error : console.log;
    logFn(`${CONFIG.LOG_PREFIX}[CircuitBreaker:${this.name}] ${message}`);
  }
}

// ============================================================================
// TIMEOUT WRAPPER
// ============================================================================

/**
 * Execute operation with timeout protection
 * @param {Function} operation - Async operation to execute
 * @param {number} timeoutMs - Timeout in milliseconds
 * @param {string} operationName - Name for error messages
 * @returns {Promise<any>} Operation result
 * @throws {Error} If operation times out
 */
async function withTimeout(operation, timeoutMs, operationName = 'Operation') {
  return Promise.race([
    operation(),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`${operationName} timed out after ${timeoutMs}ms`)), timeoutMs)
    )
  ]);
}

// ============================================================================
// MAIN CLASS: ChromeBuiltInAIIntegration
// ============================================================================

export class ChromeBuiltInAIIntegration {
  constructor() {
    // API availability flags
    this.availability = {
      prompt: false,
      summarization: false,
      write: false,
      rewrite: false
    };

    // API instances
    this.apis = {
      prompt: null,           // Language model session
      summarizer: null,       // Summarizer instance
      writer: null,           // Writer instance
      rewriter: null          // Rewriter instance
    };

    // Circuit breakers for each API
    this.circuitBreakers = {
      prompt: new CircuitBreaker('PromptAPI'),
      summarization: new CircuitBreaker('SummarizationAPI'),
      write: new CircuitBreaker('WriteAPI'),
      rewrite: new CircuitBreaker('RewriteAPI')
    };

    // Session management
    this.sessions = new Map();
    this.lastActivity = Date.now();
    this.sessionLifetime = Date.now();

    // Initialization state
    this.isInitialized = false;
    this.initializationPromise = null;

    // Cleanup interval
    this.cleanupInterval = null;

    // Statistics
    this.stats = {
      promptCalls: 0,
      summarizationCalls: 0,
      writeCalls: 0,
      rewriteCalls: 0,
      errors: 0,
      avgResponseTime: 0,
      totalCalls: 0
    };
  }

  // ==========================================================================
  // INITIALIZATION
  // ==========================================================================

  /**
   * Initialize all Chrome Built-in AI APIs
   * This is the ONLY public initialization method
   *
   * @returns {Promise<boolean>} True if at least one API is available
   * @throws {Error} If initialization fails completely
   */
  async initialize() {
    // Prevent multiple simultaneous initializations
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this._performInitialization();
    return this.initializationPromise;
  }

  /**
   * Internal initialization logic
   * @private
   */
  async _performInitialization() {
    try {
      this.log('Starting Chrome Built-in AI initialization...');

      // Check if window.ai exists (Chrome 127+)
      if (typeof window === 'undefined' || !window.ai) {
        this.log('⚠️ Chrome Built-in AI not available - Using MOCK fallback for demo', 'warn');
        this.log('🎭 DEMO MODE: Extension will work with simulated AI responses', 'warn');

        // Use mock fallback (already imported statically)
        this.mockAI = new MockAIFallback();

        // Mark as using mock
        this.usingMock = true;
        this.availability.prompt = true; // Enable mock prompt API
        this.availability.summarization = false;
        this.availability.write = false;
        this.availability.rewrite = false;

        this.isInitialized = true;
        this.log('✅ Mock AI initialized for demonstration', 'success');
        return true;
      }

      // Real Chrome Built-in AI is available
      this.usingMock = false;

      // Initialize each API with timeout protection
      await withTimeout(
        () => this._initializeAllAPIs(),
        CONFIG.TIMEOUTS.INITIALIZATION,
        'API Initialization'
      );

      // Check if at least one API is available
      const anyAvailable = Object.values(this.availability).some(v => v);

      if (!anyAvailable) {
        throw new Error('No Chrome Built-in AI APIs are available');
      }

      // Start cleanup interval
      this._startCleanupInterval();

      this.isInitialized = true;
      this.log('✅ Initialization complete', 'success');
      this.logAvailability();

      return true;

    } catch (error) {
      this.log(`❌ Initialization failed: ${error.message}`, 'error');
      this.isInitialized = false;
      throw error;
    } finally {
      this.initializationPromise = null;
    }
  }

  /**
   * Initialize all 4 Chrome Built-in AI APIs
   * @private
   */
  async _initializeAllAPIs() {
    const results = await Promise.allSettled([
      this._initializePromptAPI(),
      this._initializeSummarizationAPI(),
      this._initializeWriteAPI(),
      this._initializeRewriteAPI()
    ]);

    // Log results
    results.forEach((result, index) => {
      const apiNames = ['Prompt', 'Summarization', 'Write', 'Rewrite'];
      if (result.status === 'fulfilled') {
        this.log(`✅ ${apiNames[index]} API initialized`);
      } else {
        this.log(`⚠️ ${apiNames[index]} API unavailable: ${result.reason}`, 'warn');
      }
    });
  }

  /**
   * Initialize Prompt API (Gemini Nano)
   * @private
   */
  async _initializePromptAPI() {
    try {
      // Check capability
      const capabilities = await window.ai.languageModel.capabilities();

      if (capabilities.available === 'no') {
        throw new Error('Prompt API not available');
      }

      // If readily available, create session
      if (capabilities.available === 'readily') {
        this.apis.prompt = await window.ai.languageModel.create();
        this.availability.prompt = true;
        this.log('Prompt API session created');
      } else if (capabilities.available === 'after-download') {
        this.log('Prompt API requires model download', 'warn');
        // Still mark as available - will be ready after download
        this.availability.prompt = true;
      }

      return true;
    } catch (error) {
      this.availability.prompt = false;
      throw new Error(`Prompt API initialization failed: ${error.message}`);
    }
  }

  /**
   * Initialize Summarization API
   * @private
   */
  async _initializeSummarizationAPI() {
    try {
      // Check if API exists
      if (!window.ai.summarizer) {
        throw new Error('Summarization API not available in this Chrome version');
      }

      // Check capability
      const capabilities = await window.ai.summarizer.capabilities();

      if (capabilities.available === 'no') {
        throw new Error('Summarization API not available');
      }

      // Create summarizer instance
      if (capabilities.available === 'readily') {
        this.apis.summarizer = await window.ai.summarizer.create();
        this.availability.summarization = true;
        this.log('Summarization API initialized');
      } else if (capabilities.available === 'after-download') {
        this.log('Summarization API requires model download', 'warn');
        this.availability.summarization = true;
      }

      return true;
    } catch (error) {
      this.availability.summarization = false;
      throw new Error(`Summarization API initialization failed: ${error.message}`);
    }
  }

  /**
   * Initialize Write API
   * @private
   */
  async _initializeWriteAPI() {
    try {
      // Check if API exists
      if (!window.ai.writer) {
        throw new Error('Write API not available in this Chrome version');
      }

      // Check capability
      const capabilities = await window.ai.writer.capabilities();

      if (capabilities.available === 'no') {
        throw new Error('Write API not available');
      }

      // Create writer instance
      if (capabilities.available === 'readily') {
        this.apis.writer = await window.ai.writer.create();
        this.availability.write = true;
        this.log('Write API initialized');
      } else if (capabilities.available === 'after-download') {
        this.log('Write API requires model download', 'warn');
        this.availability.write = true;
      }

      return true;
    } catch (error) {
      this.availability.write = false;
      throw new Error(`Write API initialization failed: ${error.message}`);
    }
  }

  /**
   * Initialize Rewrite API
   * @private
   */
  async _initializeRewriteAPI() {
    try {
      // Check if API exists
      if (!window.ai.rewriter) {
        throw new Error('Rewrite API not available in this Chrome version');
      }

      // Check capability
      const capabilities = await window.ai.rewriter.capabilities();

      if (capabilities.available === 'no') {
        throw new Error('Rewrite API not available');
      }

      // Create rewriter instance
      if (capabilities.available === 'readily') {
        this.apis.rewriter = await window.ai.rewriter.create();
        this.availability.rewrite = true;
        this.log('Rewrite API initialized');
      } else if (capabilities.available === 'after-download') {
        this.log('Rewrite API requires model download', 'warn');
        this.availability.rewrite = true;
      }

      return true;
    } catch (error) {
      this.availability.rewrite = false;
      throw new Error(`Rewrite API initialization failed: ${error.message}`);
    }
  }

  // ==========================================================================
  // PUBLIC API METHODS
  // ==========================================================================

  /**
   * Explain code using Prompt API
   *
   * @param {string} code - Code to explain
   * @param {Object} context - Additional context (url, language, userLevel)
   * @returns {Promise<Object>} Explanation result
   */
  async explainCode(code, context = {}) {
    await this._ensureInitialized();
    this._checkAPIAvailability('prompt');

    const startTime = Date.now();

    try {
      let result;

      // Use mock if Chrome Built-in AI not available
      if (this.usingMock) {
        const session = await this.mockAI.createSession();
        const prompt = this._buildExplainPrompt(code, context);
        result = await session.prompt(prompt);
        session.destroy();
      } else {
        // Use real Chrome Built-in AI
        result = await this.circuitBreakers.prompt.execute(async () => {
          const prompt = this._buildExplainPrompt(code, context);

          // Ensure session exists
          if (!this.apis.prompt) {
            this.apis.prompt = await window.ai.languageModel.create();
          }

          const response = await withTimeout(
            () => this.apis.prompt.prompt(prompt),
            CONFIG.TIMEOUTS.PROMPT,
            'Explain Code'
          );

          return response;
        });
      }

      this._updateStats('prompt', Date.now() - startTime);

      return {
        success: true,
        explanation: result,
        type: 'explanation',
        provider: this.usingMock ? 'Mock AI (Demo Mode)' : 'Chrome Prompt API (Gemini Nano)',
        timestamp: Date.now(),
        context: context,
        processingTime: Date.now() - startTime
      };

    } catch (error) {
      this._handleError('explainCode', error);
      throw error;
    }
  }

  /**
   * Debug code using Prompt API
   *
   * @param {string} code - Code to debug
   * @param {Object} context - Additional context
   * @returns {Promise<Object>} Debug analysis result
   */
  async debugCode(code, context = {}) {
    await this._ensureInitialized();
    this._checkAPIAvailability('prompt');

    const startTime = Date.now();

    try {
      let result;

      if (this.usingMock) {
        const session = await this.mockAI.createSession();
        const prompt = this._buildDebugPrompt(code, context);
        result = await session.prompt(prompt);
        session.destroy();
      } else {
        result = await this.circuitBreakers.prompt.execute(async () => {
          const prompt = this._buildDebugPrompt(code, context);

          if (!this.apis.prompt) {
            this.apis.prompt = await window.ai.languageModel.create();
          }

          const response = await withTimeout(
            () => this.apis.prompt.prompt(prompt),
            CONFIG.TIMEOUTS.PROMPT,
            'Debug Code'
          );

          return response;
        });
      }

      this._updateStats('prompt', Date.now() - startTime);

      return {
        success: true,
        debugInfo: result,
        type: 'debug',
        provider: this.usingMock ? 'Mock AI (Demo Mode)' : 'Chrome Prompt API (Gemini Nano)',
        timestamp: Date.now(),
        context: context,
        processingTime: Date.now() - startTime
      };

    } catch (error) {
      this._handleError('debugCode', error);
      throw error;
    }
  }

  /**
   * Summarize code using Summarization API
   *
   * @param {string} code - Code to summarize
   * @param {Object} options - Summarization options (length, format)
   * @returns {Promise<Object>} Summary result
   */
  async summarizeCode(code, options = {}) {
    await this._ensureInitialized();
    this._checkAPIAvailability('summarization');

    const startTime = Date.now();

    try {
      const result = await this.circuitBreakers.summarization.execute(async () => {
        if (!this.apis.summarizer) {
          this.apis.summarizer = await window.ai.summarizer.create({
            length: options.length || 'short',
            format: options.format || 'plain-text'
          });
        }

        const response = await withTimeout(
          () => this.apis.summarizer.summarize(code),
          CONFIG.TIMEOUTS.SUMMARIZATION,
          'Summarize Code'
        );

        return response;
      });

      this._updateStats('summarization', Date.now() - startTime);

      return {
        success: true,
        summary: result,
        type: 'summarization',
        provider: 'Chrome Summarization API',
        timestamp: Date.now(),
        options: options,
        processingTime: Date.now() - startTime
      };

    } catch (error) {
      this._handleError('summarizeCode', error);
      throw error;
    }
  }

  /**
   * Generate documentation using Write API
   *
   * @param {string} code - Code to document
   * @param {Object} options - Documentation options (style, format)
   * @returns {Promise<Object>} Documentation result
   */
  async generateDocumentation(code, options = {}) {
    await this._ensureInitialized();

    const startTime = Date.now();

    try {
      let result;

      if (this.usingMock) {
        const session = await this.mockAI.createSession();
        const prompt = this._buildDocumentationPrompt(code, options);
        result = await session.prompt(prompt);
        session.destroy();
      } else {
        this._checkAPIAvailability('write');
        result = await this.circuitBreakers.write.execute(async () => {
          const prompt = this._buildDocumentationPrompt(code, options);

          if (!this.apis.writer) {
            this.apis.writer = await window.ai.writer.create({
              tone: 'formal',
              format: options.format || 'markdown',
              length: options.length || 'medium'
            });
          }

          const response = await withTimeout(
            () => this.apis.writer.write(prompt),
            CONFIG.TIMEOUTS.WRITE,
            'Generate Documentation'
          );

          return response;
        });
      }

      this._updateStats('write', Date.now() - startTime);

      return {
        success: true,
        documentation: result,
        type: 'documentation',
        provider: this.usingMock ? 'Mock AI (Demo Mode)' : 'Chrome Write API',
        timestamp: Date.now(),
        options: options,
        processingTime: Date.now() - startTime
      };

    } catch (error) {
      this._handleError('generateDocumentation', error);
      throw error;
    }
  }

  /**
   * Refactor code using Rewrite API
   *
   * @param {string} code - Code to refactor
   * @param {Object} options - Refactoring options (goals, style)
   * @returns {Promise<Object>} Refactored code result
   */
  async refactorCode(code, options = {}) {
    await this._ensureInitialized();

    const startTime = Date.now();

    try {
      let result;

      if (this.usingMock) {
        const session = await this.mockAI.createSession();
        const context = this._buildRefactorContext(options);
        result = await session.prompt(context + '\n\n```\n' + code + '\n```');
        session.destroy();
      } else {
        this._checkAPIAvailability('rewrite');
        result = await this.circuitBreakers.rewrite.execute(async () => {
          if (!this.apis.rewriter) {
            this.apis.rewriter = await window.ai.rewriter.create({
              tone: 'more-formal',
              length: 'as-is'
            });
          }

          const context = this._buildRefactorContext(options);

          const response = await withTimeout(
            () => this.apis.rewriter.rewrite(code, { context }),
            CONFIG.TIMEOUTS.REWRITE,
            'Refactor Code'
          );

          return response;
        });
      }

      this._updateStats('rewrite', Date.now() - startTime);

      return {
        success: true,
        refactoredCode: result,
        type: 'refactor',
        provider: this.usingMock ? 'Mock AI (Demo Mode)' : 'Chrome Rewrite API',
        timestamp: Date.now(),
        options: options,
        processingTime: Date.now() - startTime
      };

    } catch (error) {
      this._handleError('refactorCode', error);
      throw error;
    }
  }

  /**
   * Review code using Prompt API
   *
   * @param {string} code - Code to review
   * @param {Object} context - Review context
   * @returns {Promise<Object>} Code review result
   */
  async reviewCode(code, context = {}) {
    await this._ensureInitialized();
    this._checkAPIAvailability('prompt');

    const startTime = Date.now();

    try {
      let result;

      if (this.usingMock) {
        const session = await this.mockAI.createSession();
        const prompt = this._buildReviewPrompt(code, context);
        result = await session.prompt(prompt);
        session.destroy();
      } else {
        result = await this.circuitBreakers.prompt.execute(async () => {
          const prompt = this._buildReviewPrompt(code, context);

          if (!this.apis.prompt) {
            this.apis.prompt = await window.ai.languageModel.create();
          }

          const response = await withTimeout(
            () => this.apis.prompt.prompt(prompt),
            CONFIG.TIMEOUTS.PROMPT,
            'Review Code'
          );

          return response;
        });
      }

      this._updateStats('prompt', Date.now() - startTime);

      return {
        success: true,
        review: result,
        type: 'review',
        provider: this.usingMock ? 'Mock AI (Demo Mode)' : 'Chrome Prompt API (Gemini Nano)',
        timestamp: Date.now(),
        context: context,
        processingTime: Date.now() - startTime
      };

    } catch (error) {
      this._handleError('reviewCode', error);
      throw error;
    }
  }

  // ==========================================================================
  // PROMPT BUILDERS
  // ==========================================================================

  /**
   * Build explain prompt for Prompt API
   * @private
   */
  _buildExplainPrompt(code, context) {
    const language = context.language || this._detectLanguage(code);
    const userLevel = context.userLevel || 'intermediate';
    const url = context.url || 'unknown';

    return `You are an expert ${language} educator specializing in teaching complex programming concepts.

Your mission: Explain this ${language} code in a way that truly TEACHES, not just describes.

\`\`\`${language}
${code}
\`\`\`

Context:
- Source: ${url}
- Language: ${language}
- User Level: ${userLevel}

Provide a COMPREHENSIVE, EDUCATIONAL explanation with:

1. **🎯 What & Why** (Big Picture)
   - What does this code accomplish?
   - Why would someone write it this way?
   - What problem does it solve?

2. **🧠 Core Concepts** (Deep Understanding)
   - Key programming concepts used (explain each one)
   - Design patterns or architectural decisions
   - How the concepts relate to each other

3. **📖 Line-by-Line Teaching** (Detailed Walkthrough)
   - Break down each important section
   - Explain the logic flow and reasoning
   - Why each line matters

4. **💡 Real-World Analogy** (Make it Memorable)
   - Compare this code to a real-world scenario
   - Use analogies that make complex concepts intuitive

5. **⚠️ Common Mistakes & Best Practices**
   - Pitfalls developers often encounter
   - How to write this better
   - Industry best practices

6. **🚀 Next Steps** (Progressive Learning)
   - Related concepts to explore
   - How to build on this knowledge
   - Practical exercises to try

7. **🎓 Complex Concepts Made Simple**
   - If there are advanced topics (async, recursion, algorithms, etc.), explain them in depth
   - Don't shy away from complexity - break it down into understandable pieces
   - Teach the "why" behind the "how"

Be thorough, educational, and inspiring. Treat this as a teaching opportunity, not just code explanation.`;
  }

  /**
   * Build debug prompt for Prompt API
   * @private
   */
  _buildDebugPrompt(code, context) {
    const language = context.language || this._detectLanguage(code);
    const url = context.url || 'unknown';
    const query = context.query || '';

    return `You are DevMentor AI, a debugging expert specializing in ${language}.

Analyze this ${language} code for potential issues${query ? ` with focus on: ${query}` : ''}:

\`\`\`${language}
${code}
\`\`\`

Context:
- Source: ${url}
- Language: ${language}
${query ? `- User Query: ${query}` : ''}

Look for:

1. **Syntax Errors**
   - Compilation/parsing issues
   - Missing or incorrect syntax
   - Typos and naming errors

2. **Logic Errors**
   - Incorrect implementations
   - Wrong assumptions
   - Flawed algorithms
   - Conditional logic issues

3. **Performance Issues**
   - Inefficient algorithms (O(n²) vs O(n))
   - Unnecessary computations
   - Memory leaks
   - Resource wastage
   - Missing optimization opportunities

4. **Security Vulnerabilities**
   - SQL injection risks
   - XSS vulnerabilities
   - Insecure data handling
   - Authentication/authorization issues
   - Exposed sensitive data
   - Input validation missing

5. **Best Practice Violations**
   - Code smell patterns
   - Anti-patterns
   - Language-specific conventions ignored
   - Poor error handling
   - Lack of type safety
   - Missing null checks

6. **Edge Cases Not Handled**
   - Boundary conditions
   - Null/undefined values
   - Empty arrays/objects
   - Division by zero
   - Overflow/underflow
   - Race conditions

For EACH issue found, provide:

**📍 Issue #X: [Clear Title]**
- **Type**: [Syntax/Logic/Performance/Security/Best Practice/Edge Case]
- **Severity**: [CRITICAL/HIGH/MEDIUM/LOW]
- **Location**: Line(s) where issue occurs
- **Problem**: Clear explanation of what's wrong
- **Impact**: Why this is problematic (security risk, crash, performance hit, etc.)
- **Fix**: Specific code correction
- **Explanation**: Why this fix improves the code
- **Reference**: Line number(s) when possible

**Example Format:**

📍 Issue #1: Missing Zero Division Check
- **Type**: Logic Error / Edge Case
- **Severity**: CRITICAL
- **Location**: Line 5
- **Problem**: Division operation without checking if denominator is zero
- **Impact**: Will cause runtime error (Infinity or NaN), breaking application
- **Fix**:
\`\`\`${language}
if (denominator === 0) {
  throw new Error('Division by zero not allowed');
}
return numerator / denominator;
\`\`\`
- **Explanation**: Adding validation prevents runtime errors and makes code more robust. Throwing explicit error makes debugging easier than silent NaN propagation.
- **Reference**: Line 5 (return a / b)

After listing all issues, provide a summary with:
- Total issues found: [number]
- Critical issues: [number]
- Priority fixes: [list top 3]

If NO issues found, explain:
- Why the code is well-written
- What best practices it follows
- Potential future improvements (not bugs, just enhancements)`;
  }

  /**
   * Build documentation prompt for Write API
   * @private
   */
  _buildDocumentationPrompt(code, options) {
    const language = options.language || this._detectLanguage(code);
    const style = options.style || 'jsdoc';
    const query = options.query || '';

    return `You are DevMentor AI, a documentation expert${query ? ` with focus on: ${query}` : ''}.

Generate comprehensive professional documentation for this ${language} code:

\`\`\`${language}
${code}
\`\`\`

Generate documentation including:

1. **Function/Class Descriptions**
   - Clear, concise overview of purpose
   - What problem it solves
   - How it fits in the larger system
   - When to use vs when not to use

2. **Parameter Documentation**
   - Name and type of each parameter
   - Purpose and expected values
   - Default values (if any)
   - Valid ranges or constraints
   - Whether optional or required
   - Related parameters

3. **Return Value Documentation**
   - Return type
   - Possible return values
   - What each return value means
   - Conditions for different returns
   - Return value examples

4. **Usage Examples**
   - At least 2-3 practical examples
   - Cover common use cases
   - Show different parameter combinations
   - Include edge cases
   - Real-world scenarios

5. **Notes and Warnings**
   - Important behavior details
   - Edge cases to be aware of
   - Performance considerations
   - Thread-safety concerns
   - Side effects
   - Gotchas and common mistakes
   - Dependencies or requirements

6. **Error Handling**
   - What errors can be thrown
   - When errors occur
   - How to handle them
   - Error codes or types

7. **Additional Information**
   - Related functions/classes
   - See also references
   - Version information (if applicable)
   - Deprecation warnings (if applicable)
   - Best practices for usage

**Format**: Generate in ${style} format suitable for ${language}

**Style Guidelines**:
- Professional and clear
- Suitable for production code
- Follow language-specific conventions
- Use proper markdown/formatting
- Include code blocks with syntax highlighting
- Be thorough but concise

**Example ${style} Format**:

${this._getDocumentationExample(language, style)}

Generate complete, production-ready documentation following these guidelines.`;
  }

  /**
   * Get documentation example based on language and style
   * @private
   */
  _getDocumentationExample(language, style) {
    if (language === 'javascript' || language === 'typescript') {
      return `/**
 * Calculates the factorial of a number using recursion.
 *
 * This function computes n! (n factorial) which is the product of all positive
 * integers less than or equal to n. Uses recursive approach with memoization
 * for improved performance.
 *
 * @param {number} n - The number to calculate factorial for (must be >= 0)
 * @returns {number} The factorial of n (n!)
 *
 * @throws {TypeError} If n is not a number
 * @throws {RangeError} If n is negative or larger than Number.MAX_SAFE_INTEGER
 *
 * @example
 * // Calculate factorial of 5
 * const result = factorial(5);
 * console.log(result); // 120
 *
 * @example
 * // Edge case: factorial of 0
 * const zero = factorial(0);
 * console.log(zero); // 1
 *
 * @note This function uses recursion. For large values of n (> 1000),
 * consider using an iterative approach to avoid stack overflow.
 *
 * @note Performance: O(n) time complexity, O(n) space complexity
 *
 * @see {@link https://en.wikipedia.org/wiki/Factorial|Factorial on Wikipedia}
 */`;
    }

    if (language === 'python') {
      return `"""
Calculate the factorial of a number using recursion.

This function computes n! (n factorial) which is the product of all positive
integers less than or equal to n.

Args:
    n (int): The number to calculate factorial for (must be >= 0)

Returns:
    int: The factorial of n (n!)

Raises:
    TypeError: If n is not an integer
    ValueError: If n is negative

Examples:
    >>> factorial(5)
    120

    >>> factorial(0)
    1

Note:
    This function uses recursion. For large values of n (> 1000),
    consider using an iterative approach to avoid stack overflow.

    Performance: O(n) time complexity, O(n) space complexity

See Also:
    iterative_factorial: Non-recursive version
"""`;
    }

    // Default example
    return `Comprehensive documentation with:
- Description
- Parameters with types
- Return value with type
- Usage examples
- Notes and warnings`;
  }

  /**
   * Build refactor context for Rewrite API
   * @private
   */
  _buildRefactorContext(options) {
    const goals = options.goals || ['readability', 'performance', 'maintainability'];
    const language = options.language || 'javascript';
    const query = options.query || '';

    return `You are DevMentor AI, a code optimization expert${query ? ` with focus on: ${query}` : ''}.

Refactor and optimize this ${language} code with focus on:
${goals.map(g => `- ${g}`).join('\n')}

**IMPORTANT**: Maintain 100% functionality while improving code quality.

**Analysis & Improvements:**

1. **Performance Optimizations**
   - Identify inefficient algorithms (O(n²) → O(n))
   - Remove unnecessary computations
   - Optimize loops and iterations
   - Reduce memory allocations
   - Cache repeated calculations
   - Use appropriate data structures

2. **Code Readability**
   - Use descriptive variable names
   - Extract complex logic into functions
   - Add clear comments for complex parts
   - Follow ${language} naming conventions
   - Improve code structure and organization

3. **Modern ${language} Syntax**
   - Use latest language features
   - Replace outdated patterns
   - Apply functional programming where appropriate
   - Use proper type annotations (if TypeScript)
   - Modernize syntax (var → const/let, etc.)

4. **Best Practices**
   - Follow ${language} style guide
   - Apply SOLID principles
   - Use design patterns appropriately
   - Improve error handling
   - Add input validation
   - Remove code smells

5. **Maintainability**
   - Reduce code complexity
   - Improve modularity
   - Make code more testable
   - Reduce coupling
   - Increase cohesion

**Output Format:**

Provide the refactored code followed by:

\`\`\`${language}
// REFACTORED CODE HERE
\`\`\`

**📊 IMPROVEMENTS APPLIED:**
List each improvement with:
- What was changed
- Why it's better
- Impact (performance/readability/maintainability)

**⚡ PERFORMANCE GAINS:**
- Estimated performance improvement
- Complexity analysis (before → after)
- Memory usage optimization

**💡 EXPLANATION:**
- Explain key refactoring decisions
- Why each change improves the code
- Trade-offs considered

**🎯 BEFORE vs AFTER:**
- Quick comparison of key metrics
- What problems were solved

Preserve all original logic and behavior. Never break existing functionality.`;
  }

  /**
   * Build review prompt for Prompt API
   * @private
   */
  _buildReviewPrompt(code, context) {
    const language = context.language || this._detectLanguage(code);
    const url = context.url || 'unknown';

    return `You are a senior code reviewer. Perform a comprehensive code review of this ${language} code:

\`\`\`${language}
${code}
\`\`\`

Context:
- Source: ${url}
- Language: ${language}

Please provide a detailed review covering:

1. **Code Quality** (0-10):
   - Readability and clarity
   - Naming conventions
   - Code organization

2. **Best Practices** (0-10):
   - Language-specific best practices
   - Design patterns usage
   - Code structure

3. **Potential Issues**:
   - Bugs or logical errors
   - Edge cases not handled
   - Security concerns

4. **Performance** (0-10):
   - Efficiency considerations
   - Optimization opportunities
   - Resource usage

5. **Maintainability** (0-10):
   - Code complexity
   - Testability
   - Documentation needs

6. **Specific Suggestions**:
   - Priority improvements (high/medium/low)
   - Alternative approaches
   - Refactoring recommendations

Provide constructive feedback with specific examples and actionable recommendations. End with an overall score (0-10) and summary.`;
  }

  /**
   * Detect programming language from code
   * @private
   */
  _detectLanguage(code) {
    // Simple heuristic detection
    if (code.includes('function') && (code.includes('var') || code.includes('let') || code.includes('const'))) {
      return 'javascript';
    }
    if (code.includes('def ') && code.includes('import ')) {
      return 'python';
    }
    if (code.includes('public class') || code.includes('private ')) {
      return 'java';
    }
    if (code.includes('#include') || code.includes('int main')) {
      return 'cpp';
    }
    if (code.includes('<?php') || (code.includes('$') && code.includes('function'))) {
      return 'php';
    }
    if (code.includes('package ') && code.includes('import ')) {
      return 'go';
    }
    if (code.includes('fn ') && code.includes('let ')) {
      return 'rust';
    }
    if (code.includes('def ') && code.includes('end')) {
      return 'ruby';
    }

    return 'javascript'; // Default fallback
  }

  // ==========================================================================
  // UTILITY METHODS
  // ==========================================================================

  /**
   * Ensure the integration is initialized
   * @private
   */
  async _ensureInitialized() {
    if (!this.isInitialized) {
      await this.initialize();
    }
    this._updateLastActivity();
  }

  /**
   * Check if specific API is available
   * @private
   */
  _checkAPIAvailability(apiName) {
    if (!this.availability[apiName]) {
      throw new Error(`${apiName} API is not available. Please check Chrome version and settings.`);
    }
  }

  /**
   * Update last activity timestamp
   * @private
   */
  _updateLastActivity() {
    this.lastActivity = Date.now();
  }

  /**
   * Update statistics
   * @private
   */
  _updateStats(apiType, processingTime) {
    this.stats[`${apiType}Calls`]++;
    this.stats.totalCalls++;

    // Update average response time
    const prevAvg = this.stats.avgResponseTime;
    const totalCalls = this.stats.totalCalls;
    this.stats.avgResponseTime = ((prevAvg * (totalCalls - 1)) + processingTime) / totalCalls;
  }

  /**
   * Handle errors with logging and stats
   * @private
   */
  _handleError(operation, error) {
    this.stats.errors++;
    this.log(`❌ ${operation} failed: ${error.message}`, 'error');

    // Log full error in verbose mode
    if (CONFIG.ENABLE_VERBOSE_LOGGING) {
      console.error(`${CONFIG.LOG_PREFIX}[${operation}] Full error:`, error);
    }
  }

  /**
   * Start cleanup interval for stale sessions
   * @private
   */
  _startCleanupInterval() {
    this.cleanupInterval = setInterval(() => {
      this._performCleanup();
    }, CONFIG.SESSION.CLEANUP_INTERVAL);
  }

  /**
   * Perform cleanup of stale sessions
   * @private
   */
  async _performCleanup() {
    const now = Date.now();

    // Check if session is idle
    const idleTime = now - this.lastActivity;
    if (idleTime > CONFIG.SESSION.MAX_IDLE_TIME) {
      this.log('Session idle, performing cleanup');
      await this.destroy();
      return;
    }

    // Check if session exceeded max lifetime
    const lifetime = now - this.sessionLifetime;
    if (lifetime > CONFIG.SESSION.MAX_LIFETIME) {
      this.log('Session lifetime exceeded, reinitializing');
      await this.destroy();
      await this.initialize();
    }
  }

  /**
   * Get current status of all APIs
   */
  getStatus() {
    return {
      initialized: this.isInitialized,
      availability: { ...this.availability },
      circuitBreakers: {
        prompt: this.circuitBreakers.prompt.state,
        summarization: this.circuitBreakers.summarization.state,
        write: this.circuitBreakers.write.state,
        rewrite: this.circuitBreakers.rewrite.state
      },
      stats: { ...this.stats },
      sessionInfo: {
        lifetime: Date.now() - this.sessionLifetime,
        idleTime: Date.now() - this.lastActivity
      }
    };
  }

  /**
   * Get capabilities of all APIs
   */
  getCapabilities() {
    return {
      provider: 'Chrome Built-in AI',
      apis: {
        prompt: {
          available: this.availability.prompt,
          description: 'Language model (Gemini Nano) for code analysis, explanation, and review',
          features: ['Code explanation', 'Bug detection', 'Code review', 'Context-aware analysis']
        },
        summarization: {
          available: this.availability.summarization,
          description: 'Quick code summaries and executive overviews',
          features: ['Code summaries', 'Key points extraction', 'Quick overview']
        },
        write: {
          available: this.availability.write,
          description: 'Documentation generation',
          features: ['JSDoc generation', 'API documentation', 'Usage examples']
        },
        rewrite: {
          available: this.availability.rewrite,
          description: 'Code refactoring and improvement',
          features: ['Code refactoring', 'Style improvements', 'Modernization']
        }
      },
      advantages: [
        '100% on-device processing',
        'Complete privacy - no data leaves your device',
        'Zero API latency',
        'Works offline',
        'No API costs',
        'Fast response times'
      ],
      limitations: [
        'Requires Chrome 127+ (Chrome 138+ for all features)',
        'Requires Gemini Nano model download',
        'Limited context window compared to cloud models',
        'Some features may vary by Chrome version'
      ]
    };
  }

  /**
   * Reset all circuit breakers
   */
  resetCircuitBreakers() {
    Object.values(this.circuitBreakers).forEach(cb => cb.reset());
    this.log('All circuit breakers reset');
  }

  /**
   * Cleanup and destroy all sessions
   */
  async destroy() {
    try {
      this.log('Destroying Chrome Built-in AI integration...');

      // Clear cleanup interval
      if (this.cleanupInterval) {
        clearInterval(this.cleanupInterval);
        this.cleanupInterval = null;
      }

      // Destroy all API instances
      if (this.apis.prompt) {
        await this.apis.prompt.destroy();
        this.apis.prompt = null;
      }

      if (this.apis.summarizer) {
        await this.apis.summarizer.destroy();
        this.apis.summarizer = null;
      }

      if (this.apis.writer) {
        await this.apis.writer.destroy();
        this.apis.writer = null;
      }

      if (this.apis.rewriter) {
        await this.apis.rewriter.destroy();
        this.apis.rewriter = null;
      }

      // Reset state
      this.isInitialized = false;
      this.availability = {
        prompt: false,
        summarization: false,
        write: false,
        rewrite: false
      };

      this.log('✅ Chrome Built-in AI integration destroyed');

    } catch (error) {
      this.log(`⚠️ Cleanup error: ${error.message}`, 'warn');
    }
  }

  /**
   * Log helper with prefix
   * @private
   */
  log(message, level = 'info') {
    const levels = {
      info: console.log,
      warn: console.warn,
      error: console.error,
      success: console.log
    };

    const logFn = levels[level] || console.log;
    const emoji = level === 'success' ? '✅' : level === 'error' ? '❌' : level === 'warn' ? '⚠️' : 'ℹ️';

    logFn(`${CONFIG.LOG_PREFIX} ${emoji} ${message}`);
  }

  /**
   * Log API availability status
   * @private
   */
  logAvailability() {
    console.log(`${CONFIG.LOG_PREFIX} API Availability:`, {
      '📝 Prompt API': this.availability.prompt ? '✅' : '❌',
      '📄 Summarization API': this.availability.summarization ? '✅' : '❌',
      '✍️ Write API': this.availability.write ? '✅' : '❌',
      '🔄 Rewrite API': this.availability.rewrite ? '✅' : '❌'
    });
  }
}

// ============================================================================
// EXPORT
// ============================================================================

// Make available as ES6 module
export default ChromeBuiltInAIIntegration;

// Also attach to window for non-module contexts
if (typeof window !== 'undefined') {
  window.ChromeBuiltInAIIntegration = ChromeBuiltInAIIntegration;
}
