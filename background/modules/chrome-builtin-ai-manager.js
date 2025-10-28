/**
 * Chrome Built-in AI Manager - Complete Implementation
 * Based on official Google Chrome AI documentation
 *
 * Implements all 6 Chrome Built-in AI APIs + Language Detector:
 * 1. Prompt API (LanguageModel)
 * 2. Writer API
 * 3. Rewriter API
 * 4. Proofreader API
 * 5. Translator API
 * 6. Summarizer API
 * 7. Language Detector API
 *
 * @see https://developer.chrome.com/docs/ai/
 */

/* global self, chrome */
/* eslint-disable no-console */

// =============================================================================
// SUPPORTED LANGUAGES (BCP 47 codes)
// =============================================================================

export const SUPPORTED_LANGUAGES = {
  en: 'English',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  it: 'Italian',
  pt: 'Portuguese',
  ru: 'Russian',
  ja: 'Japanese',
  ko: 'Korean',
  zh: 'Chinese',
  ar: 'Arabic',
  hi: 'Hindi'
};

const AI_AVAILABLE_STATUSES = new Set([
  'available',
  'downloadable',
  'downloading',
  'ready',
  'readily',
  'after-download',
  'after_download',
  'on-device',
  'on_device',
  'supported'
]);

function resolveAIContext () {
  if (typeof self !== 'undefined' && self.ai) {
    return self.ai;
  }
  if (typeof chrome !== 'undefined' && chrome.ai) {
    return chrome.ai;
  }
  return null;
}

function normalizeAvailabilityValue (value) {
  if (typeof value === 'string') {
    return value.toLowerCase();
  }
  if (typeof value === 'boolean') {
    return value ? 'available' : 'unavailable';
  }
  if (typeof value === 'number') {
    return value > 0 ? 'available' : 'unavailable';
  }
  return value;
}

function extractAvailabilityStatus (capabilities) {
  if (capabilities == null) {
    return undefined;
  }
  if (typeof capabilities === 'string' || typeof capabilities === 'boolean') {
    return capabilities;
  }
  if (typeof capabilities.available !== 'undefined') {
    return capabilities.available;
  }
  if (typeof capabilities.status !== 'undefined') {
    return capabilities.status;
  }
  if (typeof capabilities.availability !== 'undefined') {
    return capabilities.availability;
  }
  if (typeof capabilities.state !== 'undefined') {
    return capabilities.state;
  }
  return undefined;
}

async function queryAvailability (api, options) {
  if (!api) {
    return undefined;
  }

  if (typeof api.capabilities === 'function') {
    try {
      const result = await api.capabilities(options);
      const status = extractAvailabilityStatus(result);
      if (typeof status !== 'undefined') {
        return status;
      }
      if (typeof result !== 'undefined') {
        return result;
      }
    } catch (error) {
      console.warn('[ChromeBuiltinAI] capabilities() check failed:', error);
    }
  }

  if (typeof api.availability === 'function') {
    try {
      const result = await api.availability(options);
      const status = extractAvailabilityStatus(result);
      if (typeof status !== 'undefined') {
        return status;
      }
      return result;
    } catch (error) {
      console.warn('[ChromeBuiltinAI] availability() check failed:', error);
    }
  }

  return undefined;
}

function isAvailabilityPositive (status) {
  if (status == null) {
    return false;
  }

  const normalized = normalizeAvailabilityValue(status);

  if (typeof normalized === 'string') {
    return AI_AVAILABLE_STATUSES.has(normalized) || normalized === 'yes' || normalized === 'true';
  }

  if (typeof normalized === 'boolean') {
    return normalized;
  }

  return false;
}

// =============================================================================
// CHROME BUILT-IN AI MANAGER
// =============================================================================

export class ChromeBuiltinAIManager {
  constructor () {
    this.sessions = {
      languageModel: null,
      writer: null,
      rewriter: null,
      proofreader: null,
      translators: new Map(), // sourceLanguage-targetLanguage -> session
      summarizer: null,
      languageDetector: null
    };

    this.capabilities = {
      languageModel: false,
      writer: false,
      rewriter: false,
      proofreader: false,
      translator: false,
      summarizer: false,
      languageDetector: false
    };

    this.initialized = false;
  }

  // ===========================================================================
  // INITIALIZATION
  // ===========================================================================

  async initialize () {
    if (this.initialized) {
      return this.capabilities;
    }

    console.log('[ChromeBuiltinAI] Initializing all Chrome AI APIs...');

    // Check each API availability
    await Promise.all([
      this.checkLanguageModelCapability(),
      this.checkWriterCapability(),
      this.checkRewriterCapability(),
      this.checkProofreaderCapability(),
      this.checkTranslatorCapability(),
      this.checkSummarizerCapability(),
      this.checkLanguageDetectorCapability()
    ]);

    this.initialized = true;

    console.log('[ChromeBuiltinAI] Initialization complete:', this.capabilities);
    return this.capabilities;
  }

  // ===========================================================================
  // CAPABILITY CHECKS
  // ===========================================================================

  async checkLanguageModelCapability () {
    try {
      const ai = resolveAIContext();
      if (!ai?.languageModel) {
        this.capabilities.languageModel = false;
        return;
      }

      const availability = await queryAvailability(ai.languageModel);
      this.capabilities.languageModel = isAvailabilityPositive(availability);
      console.log('[ChromeBuiltinAI] Prompt API availability:', availability);
    } catch (error) {
      console.warn('[ChromeBuiltinAI] Prompt API not available:', error);
      this.capabilities.languageModel = false;
    }
  }

  async checkWriterCapability () {
    try {
      const ai = resolveAIContext();
      if (!ai?.writer) {
        this.capabilities.writer = false;
        return;
      }

      const availability = await queryAvailability(ai.writer);
      this.capabilities.writer = isAvailabilityPositive(availability);
      console.log('[ChromeBuiltinAI] Writer API availability:', availability);
    } catch (error) {
      console.warn('[ChromeBuiltinAI] Writer API not available:', error);
      this.capabilities.writer = false;
    }
  }

  async checkRewriterCapability () {
    try {
      const ai = resolveAIContext();
      if (!ai?.rewriter) {
        this.capabilities.rewriter = false;
        return;
      }

      const availability = await queryAvailability(ai.rewriter);
      this.capabilities.rewriter = isAvailabilityPositive(availability);
      console.log('[ChromeBuiltinAI] Rewriter API availability:', availability);
    } catch (error) {
      console.warn('[ChromeBuiltinAI] Rewriter API not available:', error);
      this.capabilities.rewriter = false;
    }
  }

  async checkProofreaderCapability () {
    try {
      const ai = resolveAIContext();
      if (!ai?.proofreader) {
        this.capabilities.proofreader = false;
        return;
      }

      const availability = await queryAvailability(ai.proofreader, { expectedInputLanguages: ['en'] });
      this.capabilities.proofreader = isAvailabilityPositive(availability);
      console.log('[ChromeBuiltinAI] Proofreader API availability:', availability ?? 'OK');
    } catch (error) {
      console.warn('[ChromeBuiltinAI] Proofreader API not available:', error);
      this.capabilities.proofreader = false;
    }
  }

  async checkTranslatorCapability () {
    try {
      const ai = resolveAIContext();
      if (!ai?.translator) {
        this.capabilities.translator = false;
        return;
      }

      const availability = await queryAvailability(ai.translator, {
        sourceLanguage: 'en',
        targetLanguage: 'es'
      });
      this.capabilities.translator = isAvailabilityPositive(availability);
      console.log('[ChromeBuiltinAI] Translator API availability:', availability);
    } catch (error) {
      console.warn('[ChromeBuiltinAI] Translator API not available:', error);
      this.capabilities.translator = false;
    }
  }

  async checkSummarizerCapability () {
    try {
      const ai = resolveAIContext();
      if (!ai?.summarizer) {
        this.capabilities.summarizer = false;
        return;
      }

      const availability = await queryAvailability(ai.summarizer);
      this.capabilities.summarizer = isAvailabilityPositive(availability);
      console.log('[ChromeBuiltinAI] Summarizer API availability:', availability);
    } catch (error) {
      console.warn('[ChromeBuiltinAI] Summarizer API not available:', error);
      this.capabilities.summarizer = false;
    }
  }

  async checkLanguageDetectorCapability () {
    try {
      const ai = resolveAIContext();
      if (!ai?.languageDetector) {
        this.capabilities.languageDetector = false;
        return;
      }

      const availability = await queryAvailability(ai.languageDetector);
      this.capabilities.languageDetector = isAvailabilityPositive(availability);
      console.log('[ChromeBuiltinAI] Language Detector API availability:', availability);
    } catch (error) {
      console.warn('[ChromeBuiltinAI] Language Detector API not available:', error);
      this.capabilities.languageDetector = false;
    }
  }

  // ===========================================================================
  // 1. PROMPT API (LanguageModel)
  // ===========================================================================

  async createLanguageModelSession (options = {}) {
    if (!this.capabilities.languageModel) {
      throw new Error('Prompt API not available');
    }

    try {
      const ai = resolveAIContext();
      if (!ai?.languageModel?.create) {
        throw new Error('Prompt API not available');
      }

      const defaultOptions = {
        temperature: 0.8,
        topK: 3
      };

      this.sessions.languageModel = await ai.languageModel.create({
        ...defaultOptions,
        ...options
      });

      console.log('[ChromeBuiltinAI] Language Model session created');
      return this.sessions.languageModel;
    } catch (error) {
      console.error('[ChromeBuiltinAI] Failed to create Language Model session:', error);
      throw error;
    }
  }

  async prompt (text, options = {}) {
    // Input validation
    if (!text || typeof text !== 'string' || !text.trim()) {
      throw new Error('Prompt text must be a non-empty string');
    }

    if (!this.sessions.languageModel) {
      await this.createLanguageModelSession();
    }

    try {
      const result = await this.sessions.languageModel.prompt(text, options);
      return result;
    } catch (error) {
      console.error('[ChromeBuiltinAI] Prompt failed:', error);
      throw error;
    }
  }

  async promptStreaming (text, options = {}) {
    if (!this.sessions.languageModel) {
      await this.createLanguageModelSession();
    }

    try {
      return this.sessions.languageModel.promptStreaming(text, options);
    } catch (error) {
      console.error('[ChromeBuiltinAI] Streaming prompt failed:', error);
      throw error;
    }
  }

  // ===========================================================================
  // 2. WRITER API
  // ===========================================================================

  async createWriterSession (options = {}) {
    if (!this.capabilities.writer) {
      throw new Error('Writer API not available');
    }

    try {
      const ai = resolveAIContext();
      if (!ai?.writer?.create) {
        throw new Error('Writer API not available');
      }

      const defaultOptions = {
        tone: 'neutral', // 'formal' | 'neutral' | 'casual'
        format: 'markdown', // 'markdown' | 'plain-text'
        length: 'medium' // 'short' | 'medium' | 'long'
      };

      this.sessions.writer = await ai.writer.create({
        ...defaultOptions,
        ...options
      });

      console.log('[ChromeBuiltinAI] Writer session created');
      return this.sessions.writer;
    } catch (error) {
      console.error('[ChromeBuiltinAI] Failed to create Writer session:', error);
      throw error;
    }
  }

  async write (prompt, options = {}) {
    // Input validation
    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      throw new Error('Write prompt must be a non-empty string');
    }

    if (!this.sessions.writer) {
      await this.createWriterSession();
    }

    try {
      const { context, tone, format, length, ...additionalOptions } = options || {};
      const requestOptions = { ...additionalOptions };
      if (typeof context !== 'undefined' && context !== null) {
        requestOptions.context = context;
      }
      if (typeof tone !== 'undefined') {
        requestOptions.tone = tone;
      }
      if (typeof format !== 'undefined') {
        requestOptions.format = format;
      }
      if (typeof length !== 'undefined') {
        requestOptions.length = length;
      }

      const result = await this.sessions.writer.write(prompt, requestOptions);
      return result;
    } catch (error) {
      console.error('[ChromeBuiltinAI] Write failed:', error);
      throw error;
    }
  }

  async writeStreaming (prompt, options = {}) {
    if (!this.sessions.writer) {
      await this.createWriterSession();
    }

    try {
      const { context, tone, format, length, ...additionalOptions } = options || {};
      const requestOptions = { ...additionalOptions };
      if (typeof context !== 'undefined' && context !== null) {
        requestOptions.context = context;
      }
      if (typeof tone !== 'undefined') {
        requestOptions.tone = tone;
      }
      if (typeof format !== 'undefined') {
        requestOptions.format = format;
      }
      if (typeof length !== 'undefined') {
        requestOptions.length = length;
      }
      return this.sessions.writer.writeStreaming(prompt, requestOptions);
    } catch (error) {
      console.error('[ChromeBuiltinAI] Streaming write failed:', error);
      throw error;
    }
  }

  // ===========================================================================
  // 3. REWRITER API
  // ===========================================================================

  async createRewriterSession (options = {}) {
    if (!this.capabilities.rewriter) {
      throw new Error('Rewriter API not available');
    }

    try {
      const ai = resolveAIContext();
      if (!ai?.rewriter?.create) {
        throw new Error('Rewriter API not available');
      }

      const defaultOptions = {
        tone: 'as-is', // 'more-formal' | 'as-is' | 'more-casual'
        format: 'as-is', // 'as-is' | 'markdown' | 'plain-text'
        length: 'as-is' // 'shorter' | 'as-is' | 'longer'
      };

      this.sessions.rewriter = await ai.rewriter.create({
        ...defaultOptions,
        ...options
      });

      console.log('[ChromeBuiltinAI] Rewriter session created');
      return this.sessions.rewriter;
    } catch (error) {
      console.error('[ChromeBuiltinAI] Failed to create Rewriter session:', error);
      throw error;
    }
  }

  async rewrite (text, options = {}) {
    // Input validation
    if (!text || typeof text !== 'string' || !text.trim()) {
      throw new Error('Rewrite text must be a non-empty string');
    }

    if (!this.sessions.rewriter) {
      await this.createRewriterSession();
    }

    try {
      const result = await this.sessions.rewriter.rewrite(text, options);
      return result;
    } catch (error) {
      console.error('[ChromeBuiltinAI] Rewrite failed:', error);
      throw error;
    }
  }

  async rewriteStreaming (text, options = {}) {
    if (!this.sessions.rewriter) {
      await this.createRewriterSession();
    }

    try {
      return this.sessions.rewriter.rewriteStreaming(text, options);
    } catch (error) {
      console.error('[ChromeBuiltinAI] Streaming rewrite failed:', error);
      throw error;
    }
  }

  // ===========================================================================
  // 4. PROOFREADER API
  // ===========================================================================

  async createProofreaderSession (options = {}) {
    if (!this.capabilities.proofreader) {
      throw new Error('Proofreader API not available');
    }

    try {
      const ai = resolveAIContext();
      if (!ai?.proofreader?.create) {
        throw new Error('Proofreader API not available');
      }

      const defaultOptions = {
        expectedInputLanguages: ['en']
      };

      this.sessions.proofreader = await ai.proofreader.create({
        ...defaultOptions,
        ...options
      });

      console.log('[ChromeBuiltinAI] Proofreader session created');
      return this.sessions.proofreader;
    } catch (error) {
      console.error('[ChromeBuiltinAI] Failed to create Proofreader session:', error);
      throw error;
    }
  }

  async proofread (text, language = 'en') {
    // IMPORTANT: Create new session for each language
    // Proofreader API is language-specific, can't reuse across languages
    // Always recreate session to ensure correct language
    try {
      // Destroy existing session if exists
      if (this.sessions.proofreader) {
        this.sessions.proofreader = null;
      }

      // Create fresh session with correct language
      await this.createProofreaderSession({ expectedInputLanguages: [language] });

      const result = await this.sessions.proofreader.proofread(text);
      return {
        corrected: result.corrected,
        corrections: result.corrections || [],
        hasErrors: result.corrections && result.corrections.length > 0
      };
    } catch (error) {
      console.error('[ChromeBuiltinAI] Proofread failed:', error);
      throw error;
    }
  }

  // ===========================================================================
  // 5. TRANSLATOR API
  // ===========================================================================

  async createTranslatorSession (sourceLanguage, targetLanguage) {
    if (!this.capabilities.translator) {
      throw new Error('Translator API not available');
    }

    const ai = resolveAIContext();
    if (!ai?.translator?.create) {
      throw new Error('Translator API not available');
    }

    const source = typeof sourceLanguage === 'string' ? sourceLanguage.trim() : sourceLanguage;
    const target = typeof targetLanguage === 'string' ? targetLanguage.trim() : targetLanguage;
    const normalizedSource = (source || '').toLowerCase();
    const normalizedTarget = (target || '').toLowerCase();
    const sessionKey = `${normalizedSource}-${normalizedTarget}`;

    // Check if session already exists
    if (this.sessions.translators.has(sessionKey)) {
      return this.sessions.translators.get(sessionKey);
    }

    try {
      // Check availability for this language pair
      const availability = await queryAvailability(ai.translator, {
        sourceLanguage: source,
        targetLanguage: target
      });

      if (availability && `${availability}`.toLowerCase() === 'unsupported') {
        throw new Error(`Translation from ${sourceLanguage} to ${targetLanguage} is not supported`);
      }

      const translator = await ai.translator.create({
        sourceLanguage: source,
        targetLanguage: target
      });

      this.sessions.translators.set(sessionKey, translator);
      console.log(`[ChromeBuiltinAI] Translator session created: ${sessionKey}`);

      return translator;
    } catch (error) {
      console.error('[ChromeBuiltinAI] Failed to create Translator session:', error);
      throw error;
    }
  }

  async translate (text, sourceLanguage, targetLanguage) {
    // Input validation
    if (!text || typeof text !== 'string' || !text.trim()) {
      throw new Error('Translation text must be a non-empty string');
    }
    if (!sourceLanguage || !targetLanguage) {
      throw new Error('Source and target languages are required');
    }
    if (sourceLanguage === targetLanguage) {
      console.warn('[ChromeBuiltinAI] Source and target languages are the same');
      return text; // Return original text
    }

    const translator = await this.createTranslatorSession(sourceLanguage, targetLanguage);

    try {
      const result = await translator.translate(text);
      return result;
    } catch (error) {
      console.error('[ChromeBuiltinAI] Translation failed:', error);
      throw error;
    }
  }

  async translateStreaming (text, sourceLanguage, targetLanguage) {
    const translator = await this.createTranslatorSession(sourceLanguage, targetLanguage);

    try {
      return translator.translateStreaming(text);
    } catch (error) {
      console.error('[ChromeBuiltinAI] Streaming translation failed:', error);
      throw error;
    }
  }

  // ===========================================================================
  // 6. SUMMARIZER API
  // ===========================================================================

  async createSummarizerSession (options = {}) {
    if (!this.capabilities.summarizer) {
      throw new Error('Summarizer API not available');
    }

    try {
      const ai = resolveAIContext();
      if (!ai?.summarizer?.create) {
        throw new Error('Summarizer API not available');
      }

      const defaultOptions = {
        type: 'key-points', // 'key-points' | 'tldr' | 'teaser' | 'headline'
        format: 'markdown', // 'markdown' | 'plain-text'
        length: 'medium' // 'short' | 'medium' | 'long'
      };

      this.sessions.summarizer = await ai.summarizer.create({
        ...defaultOptions,
        ...options
      });

      console.log('[ChromeBuiltinAI] Summarizer session created');
      return this.sessions.summarizer;
    } catch (error) {
      console.error('[ChromeBuiltinAI] Failed to create Summarizer session:', error);
      throw error;
    }
  }

  async summarize (text, options = {}) {
    // Input validation
    if (!text || typeof text !== 'string' || !text.trim()) {
      throw new Error('Summarize text must be a non-empty string');
    }

    if (!this.sessions.summarizer) {
      await this.createSummarizerSession();
    }

    try {
      const result = await this.sessions.summarizer.summarize(text, options);
      return result;
    } catch (error) {
      console.error('[ChromeBuiltinAI] Summarize failed:', error);
      throw error;
    }
  }

  async summarizeStreaming (text, options = {}) {
    if (!this.sessions.summarizer) {
      await this.createSummarizerSession();
    }

    try {
      return this.sessions.summarizer.summarizeStreaming(text, options);
    } catch (error) {
      console.error('[ChromeBuiltinAI] Streaming summarize failed:', error);
      throw error;
    }
  }

  // ===========================================================================
  // 7. LANGUAGE DETECTOR API
  // ===========================================================================

  async createLanguageDetectorSession () {
    if (!this.capabilities.languageDetector) {
      throw new Error('Language Detector API not available');
    }

    try {
      const ai = resolveAIContext();
      if (!ai?.languageDetector?.create) {
        throw new Error('Language Detector API not available');
      }

      this.sessions.languageDetector = await ai.languageDetector.create();
      console.log('[ChromeBuiltinAI] Language Detector session created');
      return this.sessions.languageDetector;
    } catch (error) {
      console.error('[ChromeBuiltinAI] Failed to create Language Detector session:', error);
      throw error;
    }
  }

  async detectLanguage (text) {
    // Input validation
    if (!text || typeof text !== 'string' || !text.trim()) {
      throw new Error('Language detection text must be a non-empty string');
    }

    if (!this.sessions.languageDetector) {
      await this.createLanguageDetectorSession();
    }

    try {
      const results = await this.sessions.languageDetector.detect(text);
      // Returns array of {detectedLanguage: string, confidence: number}
      // Sort by confidence descending
      results.sort((a, b) => b.confidence - a.confidence);
      return results;
    } catch (error) {
      console.error('[ChromeBuiltinAI] Language detection failed:', error);
      throw error;
    }
  }

  // ===========================================================================
  // HIGH-LEVEL HELPER METHODS
  // ===========================================================================

  /**
   * Analyze code using the Prompt API
   */
  async analyzeCode (code, options = {}) {
    // Input validation
    if (!code || typeof code !== 'string' || !code.trim()) {
      throw new Error('Code to analyze must be a non-empty string');
    }

    const {
      type = 'explain',
      language = 'javascript',
      skillLevel = 'intermediate'
    } = options;

    const prompts = {
      explain: `You are DevMentor AI, an expert programming mentor. Explain the following ${language} code clearly for a ${skillLevel} developer. Focus on:
1. What the code does (overview)
2. How it works (step-by-step)
3. Key concepts and patterns
4. Potential improvements

Code to explain:
\`\`\`${language}
${code}
\`\`\``,

      debug: `You are DevMentor AI, a debugging expert. Analyze this ${language} code for potential issues:
1. Syntax errors or typos
2. Logic bugs and edge cases
3. Performance issues
4. Security vulnerabilities
5. Best practice violations

Code to debug:
\`\`\`${language}
${code}
\`\`\``,

      document: `You are DevMentor AI, a documentation expert. Generate comprehensive documentation for this ${language} code:
1. Brief description
2. Parameters (if any)
3. Return value
4. Usage examples
5. Edge cases and notes

Code to document:
\`\`\`${language}
${code}
\`\`\``,

      refactor: `You are DevMentor AI, a refactoring expert. Suggest improvements for this ${language} code:
1. Code clarity and readability
2. Performance optimizations
3. Modern best practices
4. Design patterns
5. Testability improvements

Code to refactor:
\`\`\`${language}
${code}
\`\`\``,

      review: `You are DevMentor AI, a code review expert. Perform a comprehensive code review of this ${language} code:
1. Strengths (what's done well)
2. Issues (what needs improvement)
3. Security concerns
4. Performance considerations
5. Overall rating and recommendations

Code to review:
\`\`\`${language}
${code}
\`\`\``
    };

    // Map analysis types to available prompts
    const aliasMapping = new Map([
      ['security', 'debug'], // Security issues -> debug
      ['performance', 'refactor'], // Performance -> refactor
      ['architecture', 'review'], // Architecture -> review
      ['docs', 'document'], // Docs -> document
      ['bugs', 'debug'], // Bugs -> debug
      ['optimize', 'refactor'] // Optimize -> refactor
    ]);

    const baseType = aliasMapping.get(type) ?? type;
    const promptKey = Object.prototype.hasOwnProperty.call(prompts, baseType) ? baseType : 'explain';

    let promptText;
    switch (promptKey) {
    case 'debug':
      promptText = prompts.debug;
      break;
    case 'document':
      promptText = prompts.document;
      break;
    case 'refactor':
      promptText = prompts.refactor;
      break;
    case 'review':
      promptText = prompts.review;
      break;
    case 'explain':
    default:
      promptText = prompts.explain;
      break;
    }

    try {
      const result = await this.prompt(promptText);
      return {
        type,
        language,
        analysis: result,
        source: 'chrome-builtin-ai',
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('[ChromeBuiltinAI] Code analysis failed:', error);
      throw error;
    }
  }

  /**
   * Generate rich explanation with multiple AI APIs
   */
  async generateRichExplanation (code, options = {}) {
    const {
      language = 'javascript',
      skillLevel = 'intermediate',
      includeTranslation = false,
      targetLanguage = 'en'
    } = options;

    try {
      // 1. Explain the code
      const explanation = await this.analyzeCode(code, {
        type: 'explain',
        language,
        skillLevel
      });

      // 2. Generate a summary
      let summary = null;
      if (this.capabilities.summarizer) {
        try {
          summary = await this.summarize(explanation.analysis, {
            type: 'tldr',
            length: 'short'
          });
        } catch (error) {
          console.warn('[ChromeBuiltinAI] Summary generation failed:', error);
        }
      }

      // 3. Translate if requested
      let translation = null;
      if (includeTranslation && targetLanguage !== 'en' && this.capabilities.translator) {
        try {
          translation = await this.translate(explanation.analysis, 'en', targetLanguage);
        } catch (error) {
          console.warn('[ChromeBuiltinAI] Translation failed:', error);
        }
      }

      return {
        explanation: explanation.analysis,
        summary,
        translation,
        language,
        skillLevel,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('[ChromeBuiltinAI] Rich explanation failed:', error);
      throw error;
    }
  }

  // ===========================================================================
  // SESSION MANAGEMENT
  // ===========================================================================

  async destroySession (type) {
    try {
      if (type === 'languageModel' && this.sessions.languageModel) {
        // Check if destroy method exists and is async
        if (typeof this.sessions.languageModel.destroy === 'function') {
          await this.sessions.languageModel.destroy();
        }
        this.sessions.languageModel = null;
      } else if (type === 'writer' && this.sessions.writer) {
        if (typeof this.sessions.writer.destroy === 'function') {
          await this.sessions.writer.destroy();
        }
        this.sessions.writer = null;
      } else if (type === 'rewriter' && this.sessions.rewriter) {
        if (typeof this.sessions.rewriter.destroy === 'function') {
          await this.sessions.rewriter.destroy();
        }
        this.sessions.rewriter = null;
      } else if (type === 'proofreader' && this.sessions.proofreader) {
        // Proofreader may not have destroy method
        if (typeof this.sessions.proofreader.destroy === 'function') {
          await this.sessions.proofreader.destroy();
        }
        this.sessions.proofreader = null;
      } else if (type === 'summarizer' && this.sessions.summarizer) {
        if (typeof this.sessions.summarizer.destroy === 'function') {
          await this.sessions.summarizer.destroy();
        }
        this.sessions.summarizer = null;
      } else if (type === 'languageDetector' && this.sessions.languageDetector) {
        // Language Detector may not have destroy method
        if (typeof this.sessions.languageDetector.destroy === 'function') {
          await this.sessions.languageDetector.destroy();
        }
        this.sessions.languageDetector = null;
      } else if (type === 'translators') {
        // Destroy all translator sessions
        const destroyPromises = [];
        this.sessions.translators.forEach(translator => {
          if (typeof translator.destroy === 'function') {
            destroyPromises.push(
              translator.destroy().catch(e => {
                console.warn('[ChromeBuiltinAI] Translator destroy failed:', e);
              })
            );
          }
        });
        await Promise.all(destroyPromises);
        this.sessions.translators.clear();
      }

      console.log(`[ChromeBuiltinAI] ${type} session destroyed`);
    } catch (error) {
      console.warn(`[ChromeBuiltinAI] Failed to destroy ${type} session:`, error);
    }
  }

  async destroyAllSessions () {
    console.log('[ChromeBuiltinAI] Destroying all sessions...');

    await Promise.all([
      this.destroySession('languageModel'),
      this.destroySession('writer'),
      this.destroySession('rewriter'),
      this.destroySession('proofreader'),
      this.destroySession('summarizer'),
      this.destroySession('languageDetector'),
      this.destroySession('translators')
    ]);

    console.log('[ChromeBuiltinAI] All sessions destroyed');
  }

  // ===========================================================================
  // UTILITY METHODS
  // ===========================================================================

  getCapabilities () {
    return { ...this.capabilities };
  }

  getAvailableAPIs () {
    return Object.entries(this.capabilities)
      .filter(([, available]) => available)
      .map(([api]) => api);
  }

  getAPICount () {
    return Object.values(this.capabilities).filter(Boolean).length;
  }
}

// =============================================================================
// EXPORT SINGLETON INSTANCE
// =============================================================================

export const chromeBuiltinAI = new ChromeBuiltinAIManager();
export default chromeBuiltinAI;
