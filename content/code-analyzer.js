/**
 * DevMentor AI - Secure Code Analyzer
 * Enterprise-grade code analysis with secure backend proxy
 * API keys are handled server-side for security
 */

class CodeAnalyzer {
  constructor() {
    // SECURITY: No API keys stored in client code
    this.backendEndpoint = '/api/proxy/analyze'; // Backend proxy endpoint
    this.cache = new Map();
    this.maxCacheSize = 100;
    this.logger = (typeof window !== 'undefined' && window.__DEVMENTOR_LOGGER) || {
      debug: (...args) => console.debug(...args),
      info: (...args) => console.info(...args),
      warn: (...args) => console.warn(...args),
      error: (...args) => console.error(...args)
    };
    
    this.initialize();
  }

  async initialize() {
    try {
      // SECURITY: No API keys stored in client
      // All AI requests go through secure backend proxy
      this.logger.info('[CodeAnalyzer] Initialized with secure backend proxy');
    } catch (error) {
      this.logger.error('[CodeAnalyzer] Initialization error:', error);
    }
  }

  async analyzeCode(code, analysisType = 'explain', options = {}) {
    try {
      // Validate input
      if (!code || code.trim().length === 0) {
        throw new Error('No code provided for analysis');
      }

      // Check cache first
      const cacheKey = this.getCacheKey(code, analysisType);
      if (this.cache.has(cacheKey)) {
        this.logger.debug('[CodeAnalyzer] Returning cached result');
        return this.cache.get(cacheKey);
      }

      // Detect language
      const language = window.LanguageDetector?.detect(code)?.language || 'javascript';
      
      // Determine analysis strategy based on availability
      const analysisStrategy = await this.determineAnalysisStrategy(options);
      
      let result;
      if (analysisStrategy === 'offline') {
        result = await this.performOfflineAnalysis(code, analysisType, language, options);
      } else {
        result = await this.performOnlineAnalysis(code, analysisType, language, options);
      }
      
      // Cache result
      this.cacheResult(cacheKey, result);
      
      return result;
      
    } catch (error) {
      this.logger.error('[CodeAnalyzer] Analysis error:', error);
      return this.getFallbackResponse(code, analysisType, error.message);
    }
  }

  /**
   * Determine analysis strategy based on availability and options
   */
  async determineAnalysisStrategy(options) {
    // Check if offline analysis is explicitly requested
    if (options.forceOffline === true) {
      return 'offline';
    }
    
    // Check if online analysis is explicitly requested
    if (options.forceOnline === true) {
      return 'online';
    }
    
    // Check network availability
    if (!navigator.onLine) {
      this.logger.info('[CodeAnalyzer] Offline mode - network unavailable');
      return 'offline';
    }
    
    // Check if backend proxy is available
    try {
      const response = await fetch('/api/proxy/health', { 
        method: 'GET',
        timeout: 5000 
      });
      if (response.ok) {
        this.logger.info('[CodeAnalyzer] Online mode - backend proxy available');
        return 'online';
      }
    } catch (error) {
      this.logger.warn('[CodeAnalyzer] Backend proxy unavailable, falling back to offline');
    }
    
    // Default to offline analysis
    return 'offline';
  }

  /**
   * Perform offline analysis using local AI capabilities
   */
  async performOfflineAnalysis(code, analysisType, language, options) {
    this.logger.info('[CodeAnalyzer] Performing offline analysis');
    
    // Use Chrome's built-in AI if available
    if (typeof ai !== 'undefined' && ai.prompt) {
      try {
        const prompt = this.generatePrompt(code, analysisType, language, options);
        const session = await ai.prompt.create({
          systemPrompt: this.getSystemPrompt(analysisType, language)
        });
        
        const response = await session.prompt(prompt);
        
        return {
          success: true,
          result: response,
          type: analysisType,
          mode: 'offline',
          timestamp: Date.now(),
          metadata: {
            language,
            codeLength: code.length,
            analysisType,
            processingTime: Date.now() - Date.now()
          }
        };
      } catch (error) {
        this.logger.warn('[CodeAnalyzer] Chrome AI unavailable:', error);
      }
    }
    
    // Fallback to local analysis engine
    return await this.performLocalAnalysis(code, analysisType, language, options);
  }

  /**
   * Perform online analysis using backend proxy
   */
  async performOnlineAnalysis(code, analysisType, language, options) {
    this.logger.info('[CodeAnalyzer] Performing online analysis via backend proxy');
    
    const prompt = this.generatePrompt(code, analysisType, language, options);
    
    // Call secure backend proxy
    const response = await fetch(this.backendEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        code,
        analysisType,
        language,
        options,
        prompt
      })
    });
    
    if (!response.ok) {
      throw new Error(`Backend proxy error: ${response.status}`);
    }
    
    const result = await response.json();
    
    return {
      success: true,
      result: result.result,
      type: analysisType,
      mode: 'online',
      timestamp: Date.now(),
      metadata: {
        language,
        codeLength: code.length,
        analysisType,
        processingTime: result.metadata?.processingTime || 0
      }
    };
  }

  /**
   * Perform local analysis using local analysis engine
   */
  async performLocalAnalysis(code, analysisType, language, options) {
    this.logger.info('[CodeAnalyzer] Performing local analysis');
    
    // Use local analysis engine if available
    if (typeof window !== 'undefined' && window.LocalAnalysisEngine) {
      try {
        const engine = new window.LocalAnalysisEngine();
        const result = await engine.analyze(code, analysisType, language, options);
        
        return {
          success: true,
          result: result,
          type: analysisType,
          mode: 'local',
          timestamp: Date.now(),
          metadata: {
            language,
            codeLength: code.length,
            analysisType,
            processingTime: 0
          }
        };
      } catch (error) {
        this.logger.warn('[CodeAnalyzer] Local analysis engine unavailable:', error);
      }
    }
    
    // Final fallback - basic analysis
    return this.performBasicAnalysis(code, analysisType, language, options);
  }

  generatePrompt(code, analysisType, language, options = {}) {
    const basePrompts = {
      explain: `You are DevMentor AI, an expert coding assistant. Explain this ${language} code in a clear, educational way. Focus on:
1. What the code does
2. How it works (step by step)
3. Key concepts and patterns
4. Best practices demonstrated
5. Potential improvements

Code:
\`\`\`${language}
${code}
\`\`\`

Provide a comprehensive explanation that helps developers learn.`,

      debug: `You are DevMentor AI, a debugging expert. Analyze this ${language} code for potential issues. Look for:
1. Syntax errors
2. Logic errors
3. Performance issues
4. Security vulnerabilities
5. Best practice violations
6. Edge cases not handled

Code:
\`\`\`${language}
${code}
\`\`\`

Provide specific issues found and how to fix them.`,

      optimize: `You are DevMentor AI, a performance optimization expert. Analyze this ${language} code and suggest improvements for:
1. Performance optimization
2. Memory usage
3. Code readability
4. Maintainability
5. Best practices

Code:
\`\`\`${language}
${code}
\`\`\`

Provide specific optimization suggestions with before/after examples.`,

      document: `You are DevMentor AI, a documentation expert. Generate comprehensive documentation for this ${language} code including:
1. Function/class descriptions
2. Parameter documentation
3. Return value documentation
4. Usage examples
5. Notes and warnings

Code:
\`\`\`${language}
${code}
\`\`\`

Generate professional documentation in JSDoc format.`
    };

    let prompt = basePrompts[analysisType] || basePrompts.explain;
    
    // Add detail level
    if (options.detailLevel === 'beginner') {
      prompt += '\n\nExplain in simple terms suitable for beginners.';
    } else if (options.detailLevel === 'expert') {
      prompt += '\n\nProvide detailed technical analysis suitable for experts.';
    }

    return prompt;
  }

  /**
   * Chama o backend proxy seguro para análise de código
   * @param {string} prompt - Prompt para análise
   * @param {object} options - Opções de análise
   * @returns {Promise<string>} Resposta da IA
   */
  async callBackendProxy(prompt, options = {}) {
    try {
      // SECURITY: All AI requests go through secure backend proxy
      const response = await fetch(this.backendEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({
          prompt: prompt,
          analysisType: options.analysisType || 'explain',
          language: options.language || 'javascript',
          options: {
            detailLevel: options.detailLevel || 'intermediate',
            maxTokens: options.maxTokens || 2000,
            temperature: options.temperature || 0.7
          }
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Backend proxy error: ${error.message || 'Unknown error'}`);
      }

      const data = await response.json();
      return data.analysis;
      
    } catch (error) {
      this.logger.error('[CodeAnalyzer] Backend proxy call failed:', error);
      throw error;
    }
  }

  processAIResponse(aiResponse, analysisType, originalCode) {
    return {
      type: analysisType,
      analysis: aiResponse,
      originalCode: originalCode,
      timestamp: new Date().toISOString(),
      provider: 'secure-backend-proxy',
      metadata: {
        codeLength: originalCode.length,
        lines: originalCode.split('\n').length,
        processingTime: Date.now()
      }
    };
  }

  getFallbackResponse(code, analysisType, errorMessage) {
    const fallbackResponses = {
      explain: `I apologize, but I'm unable to analyze this code right now due to: ${errorMessage}\n\nHowever, I can see this is ${code.split('\n').length} lines of code. Please check your backend configuration.`,
      debug: `I'm currently unable to debug this code due to: ${errorMessage}\n\nPlease ensure the backend service is running correctly.`,
      optimize: `I can't optimize this code at the moment due to: ${errorMessage}\n\nPlease check your backend configuration and try again.`,
      document: `I'm unable to generate documentation right now due to: ${errorMessage}\n\nPlease verify your backend service is available.`
    };

    return {
      type: analysisType,
      analysis: fallbackResponses[analysisType] || fallbackResponses.explain,
      originalCode: code,
      timestamp: new Date().toISOString(),
      provider: 'fallback',
      error: errorMessage,
      metadata: {
        codeLength: code.length,
        lines: code.split('\n').length,
        processingTime: Date.now()
      }
    };
  }

  getCacheKey(code, analysisType) {
    const hash = this.simpleHash(code + analysisType);
    return `${analysisType}_${hash}`;
  }

  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  cacheResult(key, result) {
    if (this.cache.size >= this.maxCacheSize) {
      // Remove oldest entry
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, result);
  }

  /**
   * Testa conexão com o backend proxy
   * @returns {Promise<object>} Resultado do teste
   */
  async testConnection() {
    try {
      const testPrompt = "Say 'Hello, DevMentor AI is working!'";
      const response = await this.callBackendProxy(testPrompt);
      return { success: true, response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Legacy method for compatibility
  quickAnalyze(code, filename = '') {
    const sanitized = window.DevMentorHelpers?.sanitizeCode(code) || { code: '', isValid: false };
    const looksLikeCode = !!sanitized.isValid;

    const detection = window.LanguageDetector
      ? window.LanguageDetector.detect(sanitized.code, filename)
      : { language: 'auto', confidence: 0.2 };

    const stats = this.getStats(sanitized.code);

    return {
      looksLikeCode,
      language: detection.language,
      confidence: detection.confidence,
      stats,
      reason: sanitized.reason
    };
  }

  getStats(code) {
    if (!code) return { lines: 0, chars: 0 };
    return {
      lines: code.split('\n').length,
      chars: code.length
    };
  }
}

window.CodeAnalyzer = CodeAnalyzer;




