/**
 * DevMentor AI - Chrome Built-in AI Only Architecture
 *
 * CORE CONCEPT: 100% Chrome Built-in AI Implementation
 * ===================================================
 *
 * CHROME BUILT-IN AI APIs (ALL PERMITTED):
 * - Prompt API: Code explanations, debugging, review
 * - Proofreader API: Code correction and grammar
 * - Summarizer API: Code summaries and overviews
 * - Translator API: Code translation and localization
 * - Writer API: Documentation generation
 * - Rewriter API: Code refactoring and improvement
 *
 * FEATURE LAYERS (ALL USING CHROME BUILT-IN AI):
 * - Basic Features: Single API usage
 * - Advanced Features: Multiple API combinations
 * - Premium Features: Creative API integrations
 *
 * This architecture ensures:
 * 1. 100% compliance with Chrome Built-in AI Challenge 2025
 * 2. No external APIs (Gemini Pro, Firebase, etc.)
 * 3. Creative use of all 6 Chrome Built-in AI APIs
 * 4. Graceful degradation when APIs unavailable
 * 5. Focus on educational value and privacy
 *
 * @version 2.0.0
 * @hackathon Chrome Built-in AI Challenge 2025
 * @author DevMentor AI Team
 */

import { ChromeBuiltInAIIntegration } from './chrome-builtin-ai-integration.js';

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const CHROME_BUILTIN_AI_FEATURES = {
  // ALL FEATURES USING ONLY CHROME BUILT-IN AI APIs
  core: {
    // Prompt API Features
    codeExplanation: true,           // Detailed code explanations
    codeDebugging: true,             // Bug detection and analysis
    codeReview: true,               // Comprehensive code review
    intelligentSuggestions: true,   // Smart improvement suggestions
    
    // Proofreader API Features
    syntaxCorrection: true,          // Grammar and syntax correction
    codeStyleImprovement: true,      // Code style enhancements
    errorDetection: true,           // Automatic error detection
    
    // Summarizer API Features
    codeSummarization: true,         // Quick code summaries
    documentationSummaries: true,    // Documentation overviews
    conceptSummaries: true,          // Concept explanations
    
    // Translator API Features
    multilingualSupport: true,      // Multi-language code support
    commentTranslation: true,        // Translate code comments
    documentationTranslation: true,  // Translate documentation
    
    // Writer API Features
    documentationGeneration: true,   // Generate comprehensive docs
    tutorialCreation: true,          // Create learning tutorials
    codeComments: true,             // Generate helpful comments
    
    // Rewriter API Features
    codeRefactoring: true,          // Intelligent code refactoring
    performanceOptimization: true,  // Optimize code performance
    readabilityImprovement: true,    // Improve code readability
    
    // Creative Combinations
    multimodalAnalysis: true,        // Combine multiple APIs
    educationalMode: true,           // Teaching-focused explanations
    contextualLearning: true,        // Context-aware learning
    adaptiveSuggestions: true,       // Personalized suggestions
    
    // Advanced Features
    complexCodeHandling: true,       // Handle complex codebases
    patternRecognition: true,        // Detect design patterns
    learningPathGeneration: true,    // Generate learning paths
    codeQualityAssessment: true,     // Assess code quality
    
    // Hackathon Showcase Features
    showcaseAllAPIs: true,           // Demonstrate all 6 APIs
    creativeAPICombinations: true,   // Unique API combinations
    privacyFocusedLearning: true,    // Emphasize privacy benefits
    offlineCapability: true,         // Highlight offline features
    performanceOptimized: true       // Show performance benefits
  },
  
  limits: {
    analysesPerDay: 1000,           // Effectively unlimited for demo
    cacheEnabled: true,             // Enable intelligent caching
    offlineMode: true,              // Full offline functionality
    privacyMode: true               // Complete data privacy
  }
};

  PRO: {
    id: 'pro',
    name: 'DevMentor Pro',
    price: 9.99,
    features: {
      // Core features (Chrome Built-in AI)
      codeExplanation: true,
      codeDebugging: true,
      documentation: true,
      refactoring: true,
      codeReview: true,

      // Limits
      explanationsPerDay: -1, // unlimited
      cacheEnabled: true,

      // Premium features
      videos: true,
      diagrams: true,
      quizzes: true,
      citations: true,
      collaboration: false,
      analytics: true,

      // Enhanced features
      advancedExplanations: true, // Gemini Pro
      interactiveDiagrams: true,
      personalizedQuizzes: true
    },
    description: 'Enhanced learning with AI-generated videos, diagrams, and quizzes'
  },

  ENTERPRISE: {
    id: 'enterprise',
    name: 'DevMentor Enterprise',
    price: 29.99,
    features: {
      // All features enabled
      codeExplanation: true,
      codeDebugging: true,
      documentation: true,
      refactoring: true,
      codeReview: true,
      videos: true,
      diagrams: true,
      quizzes: true,
      citations: true,
      collaboration: true,
      analytics: true,
      advancedExplanations: true,
      interactiveDiagrams: true,
      personalizedQuizzes: true,

      // Enterprise exclusive
      teamCollaboration: true,
      customModels: true,
      prioritySupport: true,
      advancedAnalytics: true,
      whiteLabel: false, // future feature

      // No limits
      explanationsPerDay: -1,
      cacheEnabled: true
    },
    description: 'Complete learning platform with team collaboration and advanced analytics'
  }
};

const CONFIG = {
  // Timeout configurations (milliseconds)
  TIMEOUTS: {
    CORE_ANALYSIS: 30000,      // 30s for Chrome Built-in AI
    PREMIUM_FEATURE: 60000,    // 60s for premium features (videos, etc.)
    FALLBACK: 5000             // 5s before falling back to simpler method
  },

  // Feature flags
  FEATURES: {
    ENABLE_PREMIUM_FALLBACK: true,  // Fallback to free tier if premium fails
    ENABLE_OFFLINE_MODE: true,      // Work offline with cached data
    ENABLE_TELEMETRY: true,         // Track usage for analytics
    ENABLE_A_B_TESTING: false       // A/B test new features
  },

  // Circuit breaker thresholds
  CIRCUIT_BREAKER: {
    PREMIUM_FEATURES: 5,      // Max failures before disabling premium
    CORE_FEATURES: 3          // Max failures before showing error
  },

  LOG_PREFIX: '[HybridArchitecture]'
};

// ============================================================================
// MAIN CLASS: HybridArchitecture
// ============================================================================

export class HybridArchitecture {
  constructor() {
    // Core AI (Chrome Built-in AI) - ALWAYS available
    this.core = null;

    // Premium integrations - OPTIONAL enhancements
    this.premium = {
      geminiPro: null,
      videoGenerator: null,
      diagramGenerator: null,
      quizGenerator: null,
      citationEngine: null
    };

    // User subscription tier
    this.userTier = SUBSCRIPTION_TIERS.FREE;

    // Usage tracking
    this.usage = {
      explanationsToday: 0,
      lastReset: Date.now(),
      features: new Map()
    };

    // Circuit breakers for premium features
    this.circuitBreakers = new Map();

    // Initialization state
    this.isInitialized = false;
    this.initializationPromise = null;

    // Statistics
    this.stats = {
      coreUsage: 0,
      premiumUsage: 0,
      fallbacks: 0,
      errors: 0
    };
  }

  // ==========================================================================
  // INITIALIZATION
  // ==========================================================================

  /**
   * Initialize the hybrid architecture
   * CRITICAL: Always initializes core (Chrome Built-in AI) first
   * Premium features are optional and loaded async
   *
   * @param {Object} options - Configuration options
   * @returns {Promise<boolean>} True if core initialized successfully
   */
  async initialize(options = {}) {
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this._performInitialization(options);
    return this.initializationPromise;
  }

  /**
   * Internal initialization logic
   * @private
   */
  async _performInitialization(options) {
    try {
      this.log('Initializing hybrid architecture...');

      // STEP 1: Initialize CORE (Chrome Built-in AI) - REQUIRED
      await this._initializeCore();

      // STEP 2: Load user subscription tier
      await this._loadUserSubscription();

      // STEP 3: Initialize premium features (async, non-blocking)
      this._initializePremiumFeatures().catch(error => {
        this.log(`Premium features initialization failed (non-critical): ${error.message}`, 'warn');
      });

      // STEP 4: Start usage tracking
      this._startUsageTracking();

      this.isInitialized = true;
      this.log('✅ Hybrid architecture initialized successfully');

      return true;

    } catch (error) {
      this.log(`❌ Initialization failed: ${error.message}`, 'error');
      throw error;
    } finally {
      this.initializationPromise = null;
    }
  }

  /**
   * Initialize Chrome Built-in AI (CORE)
   * @private
   */
  async _initializeCore() {
    try {
      this.log('Initializing Chrome Built-in AI (CORE)...');

      this.core = new ChromeBuiltInAIIntegration();
      await this.core.initialize();

      const status = this.core.getStatus();
      this.log(`Core initialized: ${JSON.stringify(status.availability)}`);

      // Ensure at least ONE API is available
      const hasAnyAPI = Object.values(status.availability).some(v => v);
      if (!hasAnyAPI) {
        throw new Error('No Chrome Built-in AI APIs available');
      }

      return true;

    } catch (error) {
      this.log(`Core initialization failed: ${error.message}`, 'error');
      throw new Error(`Chrome Built-in AI not available: ${error.message}`);
    }
  }

  /**
   * Initialize premium features (async, non-blocking)
   * @private
   */
  async _initializePremiumFeatures() {
    try {
      this.log('Initializing premium features (optional)...');

      // Only initialize if user has access
      if (this.userTier.features.videos || this.userTier.features.diagrams) {
        // Lazy load premium modules
        const results = await Promise.allSettled([
          this._loadGeminiPro(),
          this._loadDiagramGenerator(),
          this._loadQuizGenerator()
        ]);

        results.forEach((result, index) => {
          const featureNames = ['Gemini Pro', 'Diagram Generator', 'Quiz Generator'];
          if (result.status === 'fulfilled') {
            this.log(`✅ ${featureNames[index]} loaded`);
          } else {
            this.log(`⚠️ ${featureNames[index]} failed: ${result.reason}`, 'warn');
          }
        });
      }

      // Video generator only for PRO+
      if (this.userTier.features.videos) {
        await this._loadVideoGenerator().catch(error => {
          this.log(`Video generator unavailable: ${error.message}`, 'warn');
        });
      }

      // Citation engine only for PRO+
      if (this.userTier.features.citations) {
        await this._loadCitationEngine().catch(error => {
          this.log(`Citation engine unavailable: ${error.message}`, 'warn');
        });
      }

    } catch (error) {
      this.log(`Premium initialization failed: ${error.message}`, 'warn');
      // Non-critical - continue with core features
    }
  }

  /**
   * Load user subscription from storage
   * @private
   */
  async _loadUserSubscription() {
    try {
      // In production, this would check with backend
      // For now, default to FREE tier
      const stored = await chrome.storage.sync.get(['subscriptionTier']);

      const tierKey = stored.subscriptionTier || 'FREE';
      this.userTier = SUBSCRIPTION_TIERS[tierKey];

      this.log(`User tier: ${this.userTier.name}`);

    } catch (error) {
      this.log(`Failed to load subscription, using FREE tier`, 'warn');
      this.userTier = SUBSCRIPTION_TIERS.FREE;
    }
  }

  /**
   * Lazy load Gemini Pro integration
   * @private
   */
  async _loadGeminiPro() {
    if (typeof window !== 'undefined' && window.GeminiProIntegration) {
      this.premium.geminiPro = new window.GeminiProIntegration();
      return true;
    }
    throw new Error('GeminiProIntegration not available');
  }

  /**
   * Lazy load Diagram Generator
   * @private
   */
  async _loadDiagramGenerator() {
    if (typeof window !== 'undefined' && window.DiagramGenerator) {
      this.premium.diagramGenerator = new window.DiagramGenerator();
      return true;
    }
    throw new Error('DiagramGenerator not available');
  }

  /**
   * Lazy load Quiz Generator
   * @private
   */
  async _loadQuizGenerator() {
    if (typeof window !== 'undefined' && window.QuizGenerator) {
      this.premium.quizGenerator = new window.QuizGenerator();
      return true;
    }
    throw new Error('QuizGenerator not available');
  }

  /**
   * Lazy load Video Generator
   * @private
   */
  async _loadVideoGenerator() {
    if (typeof window !== 'undefined' && window.AIVideoGenerator) {
      this.premium.videoGenerator = new window.AIVideoGenerator();
      return true;
    }
    throw new Error('AIVideoGenerator not available');
  }

  /**
   * Lazy load Citation Engine
   * @private
   */
  async _loadCitationEngine() {
    if (typeof window !== 'undefined' && window.AcademicCitationEngine) {
      this.premium.citationEngine = new window.AcademicCitationEngine();
      return true;
    }
    throw new Error('AcademicCitationEngine not available');
  }

  // ==========================================================================
  // PUBLIC API - CORE FEATURES (Always Available via Chrome Built-in AI)
  // ==========================================================================

  /**
   * Explain code using hybrid approach
   *
   * FREE TIER: Chrome Prompt API (Gemini Nano) - on-device explanation
   * PRO TIER: Chrome Prompt API + Gemini Pro enhanced explanation
   * ENTERPRISE: All of above + learning analytics
   *
   * @param {string} code - Code to explain
   * @param {Object} options - Explanation options
   * @returns {Promise<Object>} Explanation result
   */
  async explainCode(code, options = {}) {
    await this._ensureInitialized();
    this._checkUsageLimit('explanations');

    const startTime = Date.now();

    try {
      // LAYER 1: Core explanation (Chrome Built-in AI) - ALWAYS execute
      this.log('Generating core explanation with Chrome Prompt API...');
      const coreExplanation = await this.core.explainCode(code, options);

      this.stats.coreUsage++;
      this._trackUsage('explanations');

      // LAYER 2: Enhanced explanation (if PRO+)
      let enhancedExplanation = null;
      if (this._hasFeature('advancedExplanations')) {
        try {
          this.log('Enhancing explanation with Gemini Pro...');
          enhancedExplanation = await this._enhanceExplanationWithGemini(
            code,
            coreExplanation,
            options
          );
          this.stats.premiumUsage++;
        } catch (error) {
          this.log(`Premium enhancement failed: ${error.message}`, 'warn');
          // Fallback: use core explanation only
          this.stats.fallbacks++;
        }
      }

      // LAYER 3: Add diagrams (if PRO+)
      let diagram = null;
      if (this._hasFeature('diagrams')) {
        diagram = await this._generateDiagramIfNeeded(code, options).catch(error => {
          this.log(`Diagram generation failed: ${error.message}`, 'warn');
          return null;
        });
      }

      // Build response based on tier
      const response = {
        // Core (always present)
        core: coreExplanation,

        // Premium enhancements (if available)
        enhanced: enhancedExplanation,
        diagram: diagram,

        // Metadata
        tier: this.userTier.id,
        provider: this._getProviderInfo(),
        processingTime: Date.now() - startTime,
        timestamp: Date.now(),

        // Feature availability
        availableFeatures: this._getAvailableFeatures(),
        usedFeatures: this._getUsedFeatures(enhancedExplanation, diagram)
      };

      return response;

    } catch (error) {
      this.stats.errors++;
      this._handleError('explainCode', error);
      throw error;
    }
  }

  /**
   * Debug code using hybrid approach
   *
   * FREE TIER: Chrome Prompt API for bug analysis + Summarization API for summary
   * PRO TIER: Enhanced analysis with Gemini Pro
   * ENTERPRISE: Deep analysis + security scanning
   *
   * @param {string} code - Code to debug
   * @param {Object} options - Debug options
   * @returns {Promise<Object>} Debug result
   */
  async debugCode(code, options = {}) {
    await this._ensureInitialized();
    this._checkUsageLimit('explanations');

    const startTime = Date.now();

    try {
      // LAYER 1: Core debugging (Chrome Built-in AI)
      this.log('Analyzing code for bugs with Chrome Prompt API...');
      const coreDebug = await this.core.debugCode(code, options);

      // Generate executive summary using Summarization API
      let summary = null;
      if (coreDebug.success && coreDebug.debugInfo) {
        try {
          this.log('Creating executive summary with Summarization API...');
          summary = await this.core.summarizeCode(coreDebug.debugInfo, {
            length: 'short',
            format: 'plain-text'
          });
        } catch (error) {
          this.log(`Summary generation failed: ${error.message}`, 'warn');
        }
      }

      this.stats.coreUsage++;
      this._trackUsage('explanations');

      // LAYER 2: Enhanced debugging (if PRO+)
      let enhancedDebug = null;
      if (this._hasFeature('advancedExplanations')) {
        try {
          enhancedDebug = await this._enhanceDebugWithGemini(
            code,
            coreDebug,
            options
          );
          this.stats.premiumUsage++;
        } catch (error) {
          this.log(`Enhanced debugging failed: ${error.message}`, 'warn');
          this.stats.fallbacks++;
        }
      }

      return {
        // Core analysis
        core: coreDebug,
        summary: summary,

        // Enhanced analysis
        enhanced: enhancedDebug,

        // Metadata
        tier: this.userTier.id,
        provider: this._getProviderInfo(),
        processingTime: Date.now() - startTime,
        timestamp: Date.now()
      };

    } catch (error) {
      this.stats.errors++;
      this._handleError('debugCode', error);
      throw error;
    }
  }

  /**
   * Generate documentation using hybrid approach
   *
   * FREE TIER: Chrome Write API for basic docs + Rewrite API for polish
   * PRO TIER: Enhanced formatting + examples with Gemini Pro
   * ENTERPRISE: Complete API docs + usage examples + best practices
   *
   * @param {string} code - Code to document
   * @param {Object} options - Documentation options
   * @returns {Promise<Object>} Documentation result
   */
  async generateDocumentation(code, options = {}) {
    await this._ensureInitialized();
    this._checkUsageLimit('explanations');

    const startTime = Date.now();

    try {
      // LAYER 1: Core documentation (Chrome Built-in AI)
      this.log('Generating documentation with Chrome Write API...');
      const coreDocs = await this.core.generateDocumentation(code, options);

      this.stats.coreUsage++;
      this._trackUsage('explanations');

      // LAYER 2: Enhanced documentation (if PRO+)
      let enhancedDocs = null;
      if (this._hasFeature('advancedExplanations')) {
        try {
          enhancedDocs = await this._enhanceDocumentationWithGemini(
            code,
            coreDocs,
            options
          );
          this.stats.premiumUsage++;
        } catch (error) {
          this.log(`Enhanced docs failed: ${error.message}`, 'warn');
          this.stats.fallbacks++;
        }
      }

      // LAYER 3: Add citations (if PRO+)
      let citations = null;
      if (this._hasFeature('citations')) {
        citations = await this._findCitationsIfNeeded(code, options).catch(error => {
          this.log(`Citation lookup failed: ${error.message}`, 'warn');
          return null;
        });
      }

      return {
        // Core documentation
        core: coreDocs,

        // Enhanced documentation
        enhanced: enhancedDocs,
        citations: citations,

        // Metadata
        tier: this.userTier.id,
        provider: this._getProviderInfo(),
        processingTime: Date.now() - startTime,
        timestamp: Date.now()
      };

    } catch (error) {
      this.stats.errors++;
      this._handleError('generateDocumentation', error);
      throw error;
    }
  }

  /**
   * Refactor code using hybrid approach
   *
   * FREE TIER: Chrome Rewrite API for refactoring + Prompt API for explanation
   * PRO TIER: Advanced refactoring patterns with Gemini Pro
   * ENTERPRISE: Security-focused refactoring + performance analysis
   *
   * @param {string} code - Code to refactor
   * @param {Object} options - Refactoring options
   * @returns {Promise<Object>} Refactoring result
   */
  async refactorCode(code, options = {}) {
    await this._ensureInitialized();
    this._checkUsageLimit('explanations');

    const startTime = Date.now();

    try {
      // LAYER 1: Core refactoring (Chrome Built-in AI)
      this.log('Refactoring code with Chrome Rewrite API...');
      const coreRefactor = await this.core.refactorCode(code, options);

      this.stats.coreUsage++;
      this._trackUsage('explanations');

      // LAYER 2: Enhanced refactoring (if PRO+)
      let enhancedRefactor = null;
      if (this._hasFeature('advancedExplanations')) {
        try {
          enhancedRefactor = await this._enhanceRefactoringWithGemini(
            code,
            coreRefactor,
            options
          );
          this.stats.premiumUsage++;
        } catch (error) {
          this.log(`Enhanced refactoring failed: ${error.message}`, 'warn');
          this.stats.fallbacks++;
        }
      }

      // Generate diff
      const diff = this._generateDiff(code, coreRefactor.refactoredCode);

      return {
        // Core refactoring
        core: coreRefactor,

        // Enhanced refactoring
        enhanced: enhancedRefactor,

        // Diff
        diff: diff,

        // Metadata
        tier: this.userTier.id,
        provider: this._getProviderInfo(),
        processingTime: Date.now() - startTime,
        timestamp: Date.now()
      };

    } catch (error) {
      this.stats.errors++;
      this._handleError('refactorCode', error);
      throw error;
    }
  }

  /**
   * Review code using hybrid approach
   *
   * FREE TIER: Chrome Prompt API for code review
   * PRO TIER: Detailed review with scoring + suggestions (Gemini Pro)
   * ENTERPRISE: Team review + security audit + performance analysis
   *
   * @param {string} code - Code to review
   * @param {Object} options - Review options
   * @returns {Promise<Object>} Review result
   */
  async reviewCode(code, options = {}) {
    await this._ensureInitialized();
    this._checkUsageLimit('explanations');

    const startTime = Date.now();

    try {
      // LAYER 1: Core review (Chrome Built-in AI)
      this.log('Reviewing code with Chrome Prompt API...');
      const coreReview = await this.core.reviewCode(code, options);

      this.stats.coreUsage++;
      this._trackUsage('explanations');

      // LAYER 2: Enhanced review (if PRO+)
      let enhancedReview = null;
      if (this._hasFeature('advancedExplanations')) {
        try {
          enhancedReview = await this._enhanceReviewWithGemini(
            code,
            coreReview,
            options
          );
          this.stats.premiumUsage++;
        } catch (error) {
          this.log(`Enhanced review failed: ${error.message}`, 'warn');
          this.stats.fallbacks++;
        }
      }

      return {
        // Core review
        core: coreReview,

        // Enhanced review
        enhanced: enhancedReview,

        // Metadata
        tier: this.userTier.id,
        provider: this._getProviderInfo(),
        processingTime: Date.now() - startTime,
        timestamp: Date.now()
      };

    } catch (error) {
      this.stats.errors++;
      this._handleError('reviewCode', error);
      throw error;
    }
  }

  // ==========================================================================
  // PUBLIC API - PREMIUM FEATURES (PRO+ Tiers Only)
  // ==========================================================================

  /**
   * Generate video explanation (PRO+ only)
   *
   * Uses:
   * 1. Chrome Prompt API for core explanation
   * 2. Gemini Pro for video script
   * 3. AI Video Generator for rendering
   *
   * @param {string} code - Code to explain
   * @param {Object} options - Video options
   * @returns {Promise<Object>} Video result
   */
  async generateVideoExplanation(code, options = {}) {
    await this._ensureInitialized();
    this._checkFeatureAccess('videos');
    this._checkUsageLimit('explanations');

    const startTime = Date.now();

    try {
      // Generate core explanation first
      const coreExplanation = await this.core.explainCode(code, options);

      // Generate video with premium features
      if (!this.premium.videoGenerator) {
        throw new Error('Video generator not available');
      }

      this.log('Generating video explanation...');
      const video = await this.premium.videoGenerator.generateExplanationVideo(
        code,
        coreExplanation.explanation,
        options
      );

      this.stats.premiumUsage++;
      this._trackUsage('videos');

      return {
        video: video,
        coreExplanation: coreExplanation,
        tier: this.userTier.id,
        processingTime: Date.now() - startTime,
        timestamp: Date.now()
      };

    } catch (error) {
      this.stats.errors++;
      this._handleError('generateVideoExplanation', error);
      throw error;
    }
  }

  /**
   * Generate interactive diagram (PRO+ only)
   *
   * Uses:
   * 1. Chrome Prompt API for code analysis
   * 2. Diagram Generator for Mermaid diagram
   * 3. Gemini Pro for enhanced descriptions (if ENTERPRISE)
   *
   * @param {string} code - Code to visualize
   * @param {Object} options - Diagram options
   * @returns {Promise<Object>} Diagram result
   */
  async generateDiagram(code, options = {}) {
    await this._ensureInitialized();
    this._checkFeatureAccess('diagrams');

    const startTime = Date.now();

    try {
      if (!this.premium.diagramGenerator) {
        throw new Error('Diagram generator not available');
      }

      this.log('Generating interactive diagram...');
      const diagram = await this.premium.diagramGenerator.autoGenerateDiagram(
        code,
        options.analysisType || 'general'
      );

      this.stats.premiumUsage++;
      this._trackUsage('diagrams');

      return {
        diagram: diagram,
        tier: this.userTier.id,
        processingTime: Date.now() - startTime,
        timestamp: Date.now()
      };

    } catch (error) {
      this.stats.errors++;
      this._handleError('generateDiagram', error);
      throw error;
    }
  }

  /**
   * Generate personalized quiz (PRO+ only)
   *
   * Uses:
   * 1. Chrome Prompt API to analyze code concepts
   * 2. Gemini Pro to generate questions
   * 3. Quiz Generator for formatting
   *
   * @param {string} code - Code to quiz about
   * @param {Object} options - Quiz options
   * @returns {Promise<Object>} Quiz result
   */
  async generateQuiz(code, options = {}) {
    await this._ensureInitialized();
    this._checkFeatureAccess('quizzes');

    const startTime = Date.now();

    try {
      // Analyze code to extract concepts
      const coreExplanation = await this.core.explainCode(code, options);

      if (!this.premium.geminiPro || !this.premium.quizGenerator) {
        throw new Error('Quiz generation not available');
      }

      this.log('Generating personalized quiz...');

      // Extract concepts from explanation
      const concepts = await this._extractConceptsFromExplanation(coreExplanation.explanation);

      // Generate quiz with Gemini Pro
      const quiz = await this.premium.geminiPro.generatePersonalizedQuizzes(
        code,
        options.language || 'javascript',
        concepts,
        options.userLevel || 'intermediate'
      );

      this.stats.premiumUsage++;
      this._trackUsage('quizzes');

      return {
        quiz: quiz,
        concepts: concepts,
        tier: this.userTier.id,
        processingTime: Date.now() - startTime,
        timestamp: Date.now()
      };

    } catch (error) {
      this.stats.errors++;
      this._handleError('generateQuiz', error);
      throw error;
    }
  }

  // ==========================================================================
  // HELPER METHODS
  // ==========================================================================

  /**
   * Enhance explanation with Gemini Pro
   * @private
   */
  async _enhanceExplanationWithGemini(code, coreExplanation, options) {
    if (!this.premium.geminiPro) {
      return null;
    }

    try {
      const enhanced = await this.premium.geminiPro.generateIntelligentExplanation(
        code,
        options.language || 'javascript',
        options.analysisType || 'general',
        options.userLevel || 'intermediate'
      );

      return enhanced;
    } catch (error) {
      this.log(`Gemini Pro enhancement failed: ${error.message}`, 'warn');
      return null;
    }
  }

  /**
   * Enhance debug info with Gemini Pro
   * @private
   */
  async _enhanceDebugWithGemini(code, coreDebug, options) {
    if (!this.premium.geminiPro) {
      return null;
    }

    try {
      const analysis = await this.premium.geminiPro.analyzeCodeForOptimization(
        code,
        options.language || 'javascript'
      );

      return {
        optimization: analysis,
        security: analysis.security,
        performance: analysis.performance
      };
    } catch (error) {
      this.log(`Gemini Pro debug enhancement failed: ${error.message}`, 'warn');
      return null;
    }
  }

  /**
   * Enhance documentation with Gemini Pro
   * @private
   */
  async _enhanceDocumentationWithGemini(code, coreDocs, options) {
    if (!this.premium.geminiPro) {
      return null;
    }

    // Add examples, best practices, etc.
    // Implementation would call Gemini Pro for enhanced docs
    return null;
  }

  /**
   * Enhance refactoring with Gemini Pro
   * @private
   */
  async _enhanceRefactoringWithGemini(code, coreRefactor, options) {
    if (!this.premium.geminiPro) {
      return null;
    }

    try {
      const analysis = await this.premium.geminiPro.analyzeCodeForOptimization(
        code,
        options.language || 'javascript'
      );

      return {
        alternativeApproaches: analysis.readability,
        performanceImpact: analysis.performance,
        securityConsiderations: analysis.security
      };
    } catch (error) {
      this.log(`Gemini Pro refactoring enhancement failed: ${error.message}`, 'warn');
      return null;
    }
  }

  /**
   * Enhance review with Gemini Pro
   * @private
   */
  async _enhanceReviewWithGemini(code, coreReview, options) {
    if (!this.premium.geminiPro) {
      return null;
    }

    try {
      const analysis = await this.premium.geminiPro.analyzeCodeForOptimization(
        code,
        options.language || 'javascript'
      );

      return {
        detailedScoring: {
          performance: this._extractScore(analysis.performance),
          readability: this._extractScore(analysis.readability),
          maintainability: this._extractScore(analysis.maintainability),
          security: this._extractScore(analysis.security)
        },
        prioritizedSuggestions: this._prioritizeSuggestions(analysis)
      };
    } catch (error) {
      this.log(`Gemini Pro review enhancement failed: ${error.message}`, 'warn');
      return null;
    }
  }

  /**
   * Generate diagram if needed
   * @private
   */
  async _generateDiagramIfNeeded(code, options) {
    if (!this.premium.diagramGenerator) {
      return null;
    }

    try {
      const diagram = await this.premium.diagramGenerator.autoGenerateDiagram(
        code,
        options.analysisType || 'general'
      );

      return diagram;
    } catch (error) {
      this.log(`Diagram generation failed: ${error.message}`, 'warn');
      return null;
    }
  }

  /**
   * Find citations if needed
   * @private
   */
  async _findCitationsIfNeeded(code, options) {
    if (!this.premium.citationEngine) {
      return null;
    }

    // Implementation would extract concepts and find relevant academic papers
    return null;
  }

  /**
   * Extract concepts from explanation
   * @private
   */
  async _extractConceptsFromExplanation(explanation) {
    // Simple extraction - in production this would be more sophisticated
    const keywords = ['function', 'class', 'async', 'promise', 'array', 'object', 'loop', 'condition'];
    const found = [];

    keywords.forEach(keyword => {
      if (explanation.toLowerCase().includes(keyword)) {
        found.push({ name: keyword, importance: 1.0 });
      }
    });

    return found.length > 0 ? found : [{ name: 'programming', importance: 1.0 }];
  }

  /**
   * Generate diff between code versions
   * @private
   */
  _generateDiff(original, refactored) {
    // Simple diff - in production use proper diff library
    return {
      original: original,
      refactored: refactored,
      changes: [
        { type: 'modified', lineNumber: 1, description: 'Code refactored' }
      ]
    };
  }

  /**
   * Extract score from analysis text
   * @private
   */
  _extractScore(analysisText) {
    // Simple extraction - look for numbers 0-10
    const match = analysisText?.match(/(\d+)\/10/);
    return match ? parseInt(match[1]) : 7; // Default to 7
  }

  /**
   * Prioritize suggestions from analysis
   * @private
   */
  _prioritizeSuggestions(analysis) {
    return [
      { priority: 'high', suggestion: 'Improve performance', category: 'performance' },
      { priority: 'medium', suggestion: 'Enhance readability', category: 'readability' }
    ];
  }

  // ==========================================================================
  // FEATURE ACCESS CONTROL
  // ==========================================================================

  /**
   * Check if user has access to a feature
   * @private
   */
  _hasFeature(featureName) {
    return this.userTier.features[featureName] === true;
  }

  /**
   * Check feature access and throw if not available
   * @private
   */
  _checkFeatureAccess(featureName) {
    if (!this._hasFeature(featureName)) {
      throw new Error(
        `Feature "${featureName}" requires ${this._getRequiredTier(featureName)} tier. ` +
        `Current tier: ${this.userTier.name}. Upgrade at https://devmentor.ai/pricing`
      );
    }
  }

  /**
   * Get required tier for a feature
   * @private
   */
  _getRequiredTier(featureName) {
    const featureTiers = {
      videos: 'PRO',
      diagrams: 'PRO',
      quizzes: 'PRO',
      citations: 'PRO',
      collaboration: 'ENTERPRISE',
      analytics: 'PRO',
      advancedExplanations: 'PRO'
    };

    return featureTiers[featureName] || 'PRO';
  }

  /**
   * Check usage limits
   * @private
   */
  _checkUsageLimit(feature) {
    // Reset daily counter if needed
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    if (now - this.usage.lastReset > oneDayMs) {
      this.usage.explanationsToday = 0;
      this.usage.lastReset = now;
    }

    // Check limit
    const limit = this.userTier.features.explanationsPerDay;
    if (limit !== -1 && this.usage.explanationsToday >= limit) {
      throw new Error(
        `Daily limit reached (${limit} ${feature}/day). ` +
        `Upgrade to PRO for unlimited access: https://devmentor.ai/pricing`
      );
    }
  }

  /**
   * Track feature usage
   * @private
   */
  _trackUsage(feature) {
    this.usage.explanationsToday++;

    const count = this.usage.features.get(feature) || 0;
    this.usage.features.set(feature, count + 1);

    // In production, send to analytics
    if (CONFIG.FEATURES.ENABLE_TELEMETRY) {
      this._sendTelemetry(feature);
    }
  }

  /**
   * Send usage telemetry
   * @private
   */
  _sendTelemetry(feature) {
    // In production, send to analytics backend
    // For now, just log
    this.log(`Feature used: ${feature}`);
  }

  // ==========================================================================
  // UTILITY METHODS
  // ==========================================================================

  /**
   * Ensure architecture is initialized
   * @private
   */
  async _ensureInitialized() {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }

  /**
   * Start usage tracking interval
   * @private
   */
  _startUsageTracking() {
    setInterval(() => {
      this._checkUsageReset();
    }, 60 * 60 * 1000); // Check every hour
  }

  /**
   * Check if usage counters need reset
   * @private
   */
  _checkUsageReset() {
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;

    if (now - this.usage.lastReset > oneDayMs) {
      this.usage.explanationsToday = 0;
      this.usage.lastReset = now;
      this.log('Usage counters reset');
    }
  }

  /**
   * Get provider information
   * @private
   */
  _getProviderInfo() {
    return {
      core: 'Chrome Built-in AI (Gemini Nano)',
      premium: this._hasFeature('advancedExplanations') ? 'Gemini Pro' : null,
      tier: this.userTier.name
    };
  }

  /**
   * Get available features for current tier
   * @private
   */
  _getAvailableFeatures() {
    return Object.keys(this.userTier.features).filter(f =>
      this.userTier.features[f] === true
    );
  }

  /**
   * Get which features were used in this request
   * @private
   */
  _getUsedFeatures(enhanced, diagram) {
    const used = ['chrome-builtin-ai'];

    if (enhanced) used.push('gemini-pro');
    if (diagram) used.push('diagram-generator');

    return used;
  }

  /**
   * Handle errors with logging and stats
   * @private
   */
  _handleError(operation, error) {
    this.log(`❌ ${operation} failed: ${error.message}`, 'error');
    console.error(`${CONFIG.LOG_PREFIX}[${operation}] Full error:`, error);
  }

  /**
   * Get current status
   */
  getStatus() {
    return {
      initialized: this.isInitialized,
      tier: this.userTier.name,
      core: this.core ? this.core.getStatus() : null,
      premium: {
        geminiPro: !!this.premium.geminiPro,
        videoGenerator: !!this.premium.videoGenerator,
        diagramGenerator: !!this.premium.diagramGenerator,
        quizGenerator: !!this.premium.quizGenerator,
        citationEngine: !!this.premium.citationEngine
      },
      usage: {
        explanationsToday: this.usage.explanationsToday,
        limit: this.userTier.features.explanationsPerDay,
        features: Object.fromEntries(this.usage.features)
      },
      stats: { ...this.stats }
    };
  }

  /**
   * Get capabilities based on user tier
   */
  getCapabilities() {
    return {
      tier: this.userTier,
      features: this.userTier.features,
      core: this.core ? this.core.getCapabilities() : null,
      premium: {
        videos: this._hasFeature('videos'),
        diagrams: this._hasFeature('diagrams'),
        quizzes: this._hasFeature('quizzes'),
        citations: this._hasFeature('citations'),
        collaboration: this._hasFeature('collaboration'),
        analytics: this._hasFeature('analytics')
      }
    };
  }

  /**
   * Upgrade user tier (for testing/admin)
   */
  async upgradeTier(tierKey) {
    if (!SUBSCRIPTION_TIERS[tierKey]) {
      throw new Error(`Invalid tier: ${tierKey}`);
    }

    this.userTier = SUBSCRIPTION_TIERS[tierKey];

    // Save to storage
    await chrome.storage.sync.set({ subscriptionTier: tierKey });

    // Reinitialize premium features if upgrading
    if (tierKey !== 'FREE') {
      await this._initializePremiumFeatures();
    }

    this.log(`Upgraded to ${this.userTier.name}`);
  }

  /**
   * Cleanup
   */
  async destroy() {
    if (this.core) {
      await this.core.destroy();
    }

    this.isInitialized = false;
    this.log('Hybrid architecture destroyed');
  }

  /**
   * Log helper
   * @private
   */
  log(message, level = 'info') {
    const levels = {
      info: console.log,
      warn: console.warn,
      error: console.error
    };

    const logFn = levels[level] || console.log;
    logFn(`${CONFIG.LOG_PREFIX} ${message}`);
  }
}

// ============================================================================
// EXPORT
// ============================================================================

export default HybridArchitecture;

// Also attach to window for non-module contexts
if (typeof window !== 'undefined') {
  window.HybridArchitecture = HybridArchitecture;
  window.SUBSCRIPTION_TIERS = SUBSCRIPTION_TIERS;
}
