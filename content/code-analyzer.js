/**
 * DevMentor AI - REAL Code Analyzer
 * Enterprise-grade code analysis with real AI integration
 */

class CodeAnalyzer {
  constructor() {
    this.aiProviders = {
      openai: 'https://api.openai.com/v1/chat/completions',
      gemini: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
      claude: 'https://api.anthropic.com/v1/messages'
    };
    
    this.currentProvider = 'openai'; // Default provider
    this.apiKey = null;
    this.cache = new Map();
    this.maxCacheSize = 100;
    
    this.initialize();
  }

  async initialize() {
    try {
      // Load API key from storage
      const result = await chrome.storage.sync.get(['aiApiKey', 'aiProvider']);
      this.apiKey = result.aiApiKey;
      this.currentProvider = result.aiProvider || 'openai';
      
      console.log('[CodeAnalyzer] Initialized with provider:', this.currentProvider);
    } catch (error) {
      console.error('[CodeAnalyzer] Initialization error:', error);
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
        console.log('[CodeAnalyzer] Returning cached result');
        return this.cache.get(cacheKey);
      }

      // Detect language
      const language = window.LanguageDetector?.detect(code)?.language || 'javascript';
      
      // Generate prompt
      const prompt = this.generatePrompt(code, analysisType, language, options);
      
      // Call AI API
      const aiResponse = await this.callAI(prompt, options);
      
      // Process response
      const result = this.processAIResponse(aiResponse, analysisType, code);
      
      // Cache result
      this.cacheResult(cacheKey, result);
      
      return result;
      
    } catch (error) {
      console.error('[CodeAnalyzer] Analysis error:', error);
      return this.getFallbackResponse(code, analysisType, error.message);
    }
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

  async callAI(prompt, options = {}) {
    if (!this.apiKey) {
      throw new Error('AI API key not configured. Please set your API key in settings.');
    }

    switch (this.currentProvider) {
      case 'openai':
        return await this.callOpenAI(prompt, options);
      case 'gemini':
        return await this.callGemini(prompt, options);
      case 'claude':
        return await this.callClaude(prompt, options);
      default:
        throw new Error(`Unsupported AI provider: ${this.currentProvider}`);
    }
  }

  async callOpenAI(prompt, options = {}) {
    const response = await fetch(this.aiProviders.openai, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: options.model || 'gpt-4',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: options.maxTokens || 2000,
        temperature: options.temperature || 0.7
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  async callGemini(prompt, options = {}) {
    const response = await fetch(`${this.aiProviders.gemini}?key=${this.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          maxOutputTokens: options.maxTokens || 2000,
          temperature: options.temperature || 0.7
        }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Gemini API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }

  async callClaude(prompt, options = {}) {
    const response = await fetch(this.aiProviders.claude, {
      method: 'POST',
      headers: {
        'x-api-key': this.apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: options.model || 'claude-3-sonnet-20240229',
        max_tokens: options.maxTokens || 2000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Claude API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.content[0].text;
  }

  processAIResponse(aiResponse, analysisType, originalCode) {
    return {
      type: analysisType,
      analysis: aiResponse,
      originalCode: originalCode,
      timestamp: new Date().toISOString(),
      provider: this.currentProvider,
      metadata: {
        codeLength: originalCode.length,
        lines: originalCode.split('\n').length,
        processingTime: Date.now()
      }
    };
  }

  getFallbackResponse(code, analysisType, errorMessage) {
    const fallbackResponses = {
      explain: `I apologize, but I'm unable to analyze this code right now due to: ${errorMessage}\n\nHowever, I can see this is ${code.split('\n').length} lines of code. Please check your AI API configuration in the extension settings.`,
      debug: `I'm currently unable to debug this code due to: ${errorMessage}\n\nPlease ensure your AI API key is configured correctly in the extension settings.`,
      optimize: `I can't optimize this code at the moment due to: ${errorMessage}\n\nPlease check your AI API configuration and try again.`,
      document: `I'm unable to generate documentation right now due to: ${errorMessage}\n\nPlease verify your AI API settings in the extension options.`
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

  async setApiKey(apiKey, provider = 'openai') {
    this.apiKey = apiKey;
    this.currentProvider = provider;
    
    // Save to storage
    await chrome.storage.sync.set({
      aiApiKey: apiKey,
      aiProvider: provider
    });
    
    console.log('[CodeAnalyzer] API key updated for provider:', provider);
  }

  async testConnection() {
    try {
      const testPrompt = "Say 'Hello, DevMentor AI is working!'";
      const response = await this.callAI(testPrompt);
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




