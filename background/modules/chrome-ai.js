/**
 * Wrapper around the Chrome Built-in AI Prompt API with graceful fallbacks.
 */

/* global navigator */
/* eslint-disable no-console, security/detect-object-injection */

const MODEL_ID = 'gemini-nano';
const INIT_TIMEOUT = 1000 * 10;

const FALLBACK_RESPONSES = {
  explain: () => 'Chrome AI is unavailable, but here is a high-level explanation based on heuristics.',
  debug: () => 'Chrome AI is unavailable. Review input validation, edge cases, and asynchronous flows.',
  document: () => 'Chrome AI is unavailable. Document parameters, return values, and side effects manually.',
  refactor: () => 'Chrome AI is unavailable. Consider extracting helper functions and adding tests.',
  review: () => 'Chrome AI is unavailable. Ensure code readability, error handling, and performance.'
};

export class ChromeAI {
  constructor () {
    this.initialized = false;
    this.initializationPromise = null;
    this.model = null;
    this.session = null;
  }

  async initialize () {
    if (this.initialized) return true;
    if (this.initializationPromise) return this.initializationPromise;

    this.initializationPromise = this.#initializeInternal();
    return this.initializationPromise;
  }

  async #initializeInternal () {
    try {
      if (!navigator?.ai?.createLanguageModel) {
        console.warn('[ChromeAI] Prompt API not available');
        return false;
      }

      const timeout = new Promise((resolve, reject) => {
        setTimeout(() => reject(new Error('Initialization timeout')), INIT_TIMEOUT);
      });

      this.model = await Promise.race([
        navigator.ai.createLanguageModel({ modelId: MODEL_ID }),
        timeout
      ]);

      this.session = await this.model.createSession();
      this.initialized = true;
      console.info('[ChromeAI] Ready');
      return true;
    } catch (error) {
      console.warn('[ChromeAI] Initialization failed:', error);
      this.initialized = false;
      this.initializationPromise = null;
      return false;
    }
  }

  async getStatus () {
    return {
      available: this.initialized,
      model: MODEL_ID
    };
  }

  async explainCode (code, context) {
    return this.#runPrompt('explain', this.#buildExplainPrompt(code, context));
  }

  async debugCode (code, context) {
    return this.#runPrompt('debug', this.#buildDebugPrompt(code, context));
  }

  async generateDocumentation (code, context) {
    return this.#runPrompt('document', this.#buildDocumentationPrompt(code, context));
  }

  async refactorCode (code, context) {
    return this.#runPrompt('refactor', this.#buildRefactorPrompt(code, context));
  }

  async reviewCode (code, context) {
    return this.#runPrompt('review', this.#buildReviewPrompt(code, context));
  }

  async #runPrompt (type, prompt) {
    const ready = await this.initialize();
    if (ready && this.session) {
      try {
        const response = await this.session.prompt(prompt);
        return {
          type,
          source: 'chrome-ai',
          text: response.text,
          timestamp: Date.now()
        };
      } catch (error) {
        console.warn(`[ChromeAI] ${type} failed, using fallback:`, error);
      }
    }

    return {
      type,
      source: 'fallback',
      text: FALLBACK_RESPONSES[type]?.() ?? FALLBACK_RESPONSES.explain(),
      timestamp: Date.now()
    };
  }

  #buildExplainPrompt (code, context = {}) {
    return `Explain the following code to a mid-level developer.\n\nContext: ${context.url ?? 'unknown'}\n\n\`\`\`\n${code}\n\`\`\``;
  }

  #buildDebugPrompt (code, context = {}) {
    return `Find potential bugs or risky areas in the following code. Provide concrete recommendations.\n\nContext: ${context.url ?? 'unknown'}\n\n\`\`\`\n${code}\n\`\`\``;
  }

  #buildDocumentationPrompt (code, context = {}) {
    return `Generate documentation with sections for overview, parameters, return value, and examples.\n\nContext: ${context.url ?? 'unknown'}\n\n\`\`\`\n${code}\n\`\`\``;
  }

  #buildRefactorPrompt (code, context = {}) {
    return `Suggest improvements to readability and maintainability for the following code.\n\nContext: ${context.url ?? 'unknown'}\n\n\`\`\`\n${code}\n\`\`\``;
  }

  #buildReviewPrompt (code, context = {}) {
    return `Perform a concise code review highlighting strengths, risks, and recommended changes.\n\nContext: ${context.url ?? 'unknown'}\n\n\`\`\`\n${code}\n\`\`\``;
  }
}

export default ChromeAI;
