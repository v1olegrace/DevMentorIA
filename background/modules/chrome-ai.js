/**
 * DevMentor AI - Chrome Built-in AI Module
 * Integrates with Chrome's Prompt API (Gemini Nano) for local AI processing
 */

export class ChromeAI {
  constructor() {
    this.isAvailable = false;
    this.session = null;
    this.model = null;
    this.fallbackMode = false;
    this.initializationAttempted = false;
  }

  async initialize() {
    if (this.initializationAttempted) {
      return this.isAvailable;
    }
    
    this.initializationAttempted = true;

    try {
      // Check if Chrome Built-in AI is available
      if (typeof navigator === 'undefined' || !('ai' in navigator)) {
        console.warn('[ChromeAI] Chrome Built-in AI not available, enabling fallback mode');
        this.fallbackMode = true;
        return false;
      }

      // Initialize the language model with timeout
      const initTimeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Initialization timeout')), 10000)
      );

      this.model = await Promise.race([
        navigator.ai.createLanguageModel({ modelId: 'gemini-nano' }),
        initTimeout
      ]);

      // Create a session for the conversation
      this.session = await this.model.createSession();
      
      this.isAvailable = true;
      this.fallbackMode = false;
      console.log('[ChromeAI] ✅ Chrome Built-in AI initialized successfully');
      
      return true;
      
    } catch (error) {
      console.warn('[ChromeAI] ⚠️ Initialization failed, enabling fallback mode:', error.message);
      this.isAvailable = false;
      this.fallbackMode = true;
      return false;
    }
  }

  async explainCode(code, context = {}) {
    // Try to initialize if not already attempted
    if (!this.initializationAttempted) {
      await this.initialize();
    }

    // If Chrome AI is available, use it
    if (this.isAvailable && this.session) {
      try {
        const prompt = this.buildExplainPrompt(code, context);
        const response = await this.session.prompt(prompt);
        
        return {
          explanation: response.text,
          type: 'explanation',
          timestamp: Date.now(),
          context: context,
          source: 'chrome-ai'
        };
      } catch (error) {
        console.warn('[ChromeAI] Chrome AI failed, falling back to mock response:', error.message);
        return this.getFallbackExplanation(code, context);
      }
    }

    // Use fallback response
    return this.getFallbackExplanation(code, context);
  }

  async debugCode(code, context = {}) {
    // Try to initialize if not already attempted
    if (!this.initializationAttempted) {
      await this.initialize();
    }

    // If Chrome AI is available, use it
    if (this.isAvailable && this.session) {
      try {
        const prompt = this.buildDebugPrompt(code, context);
        const response = await this.session.prompt(prompt);
        
        return {
          debugInfo: response.text,
          type: 'debug',
          timestamp: Date.now(),
          context: context,
          source: 'chrome-ai'
        };
      } catch (error) {
        console.warn('[ChromeAI] Chrome AI failed, falling back to mock response:', error.message);
        return this.getFallbackDebug(code, context);
      }
    }

    // Use fallback response
    return this.getFallbackDebug(code, context);
  }

  async generateDocumentation(code, context = {}) {
    // Try to initialize if not already attempted
    if (!this.initializationAttempted) {
      await this.initialize();
    }

    // If Chrome AI is available, use it
    if (this.isAvailable && this.session) {
      try {
        const prompt = this.buildDocumentationPrompt(code, context);
        const response = await this.session.prompt(prompt);
        
        return {
          documentation: response.text,
          type: 'documentation',
          timestamp: Date.now(),
          context: context,
          source: 'chrome-ai'
        };
      } catch (error) {
        console.warn('[ChromeAI] Chrome AI failed, falling back to mock response:', error.message);
        return this.getFallbackDocumentation(code, context);
      }
    }

    // Use fallback response
    return this.getFallbackDocumentation(code, context);
  }

  async refactorCode(code, context = {}) {
    // Try to initialize if not already attempted
    if (!this.initializationAttempted) {
      await this.initialize();
    }

    // If Chrome AI is available, use it
    if (this.isAvailable && this.session) {
      try {
        const prompt = this.buildRefactorPrompt(code, context);
        const response = await this.session.prompt(prompt);
        
        return {
          refactoredCode: response.text,
          improvements: 'Code refactored using Chrome AI',
          type: 'refactor',
          timestamp: Date.now(),
          context: context,
          source: 'chrome-ai'
        };
      } catch (error) {
        console.warn('[ChromeAI] Chrome AI failed, falling back to mock response:', error.message);
        return this.getFallbackRefactor(code, context);
      }
    }

    // Use fallback response
    return this.getFallbackRefactor(code, context);
  }

  async reviewCode(code, context = {}) {
    if (!this.isAvailable) {
      await this.initialize();
    }

    try {
      const prompt = this.buildReviewPrompt(code, context);

      const response = await this.session.prompt(prompt);

      return {
        review: response.text,
        type: 'review',
        timestamp: Date.now(),
        context: context
      };

    } catch (error) {
      console.error('[ChromeAI] Review code failed:', error);
      throw new Error(`Failed to review code: ${error.message}`);
    }
  }

  buildExplainPrompt(code, context) {
    const language = this.detectLanguage(code);
    const url = context.url || 'unknown';
    
    return `You are an expert software engineer. Explain the following ${language} code in a clear, educational way:

Code:
\`\`\`${language}
${code}
\`\`\`

Context:
- Source: ${url}
- Language: ${language}

Please provide:
1. A brief overview of what this code does
2. Key concepts and patterns used
3. Any important details or edge cases
4. Suggestions for learning more about related topics

Keep the explanation concise but comprehensive, suitable for developers of all levels.`;
  }

  buildDebugPrompt(code, context) {
    const language = this.detectLanguage(code);
    const url = context.url || 'unknown';
    
    return `You are a senior debugging expert. Analyze the following ${language} code for potential issues:

Code:
\`\`\`${language}
${code}
\`\`\`

Context:
- Source: ${url}
- Language: ${language}

Please identify:
1. Potential bugs or issues
2. Performance problems
3. Security vulnerabilities
4. Code quality issues
5. Best practices violations

For each issue found, provide:
- Issue type and severity
- Explanation of the problem
- Suggested fix or improvement

If no issues are found, explain why the code is well-written.`;
  }

  buildDocumentationPrompt(code, context) {
    const language = this.detectLanguage(code);
    const url = context.url || 'unknown';
    
    return `You are a technical documentation expert. Generate comprehensive documentation for the following ${language} code:

Code:
\`\`\`${language}
${code}
\`\`\`

Context:
- Source: ${url}
- Language: ${language}

Please provide:
1. Function/class/module description
2. Parameter documentation (if applicable)
3. Return value documentation (if applicable)
4. Usage examples
5. Notes about behavior, edge cases, or important considerations

Format the documentation in a clear, professional style suitable for API documentation or code comments.`;
  }

  buildRefactorPrompt(code, context) {
    const language = this.detectLanguage(code);
    const url = context.url || 'unknown';

    return `You are a code refactoring expert. Suggest improvements for the following ${language} code:

Code:
\`\`\`${language}
${code}
\`\`\`

Context:
- Source: ${url}
- Language: ${language}

Please provide:
1. Refactored version of the code
2. Explanation of improvements made
3. Benefits of the refactoring
4. Alternative approaches (if applicable)

Focus on:
- Readability and maintainability
- Performance optimization
- Code reusability
- Following language best practices
- Reducing complexity

Provide the refactored code in the same language with clear explanations.`;
  }

  buildReviewPrompt(code, context) {
    const language = this.detectLanguage(code);
    const url = context.url || 'unknown';

    return `You are a senior code reviewer. Perform a comprehensive code review of the following ${language} code:

Code:
\`\`\`${language}
${code}
\`\`\`

Context:
- Source: ${url}
- Language: ${language}

Please provide a detailed code review covering:

1. **Code Quality**:
   - Readability and clarity
   - Naming conventions
   - Code organization

2. **Best Practices**:
   - Language-specific best practices
   - Design patterns usage
   - Code structure

3. **Potential Issues**:
   - Bugs or logical errors
   - Edge cases not handled
   - Security concerns

4. **Performance**:
   - Efficiency considerations
   - Optimization opportunities
   - Resource usage

5. **Maintainability**:
   - Code complexity
   - Testability
   - Documentation needs

6. **Suggestions**:
   - Specific improvements
   - Priority of changes
   - Alternative approaches

Provide constructive feedback with specific examples and actionable recommendations.`;
  }

  detectLanguage(code) {
    // Simple language detection based on common patterns
    if (code.includes('function') && code.includes('var') || code.includes('let') || code.includes('const')) {
      return 'javascript';
    }
    if (code.includes('def ') && code.includes('import ')) {
      return 'python';
    }
    if (code.includes('public class') || code.includes('private ') || code.includes('public ')) {
      return 'java';
    }
    if (code.includes('#include') || code.includes('int main')) {
      return 'cpp';
    }
    if (code.includes('<?php') || code.includes('$')) {
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

  async isModelAvailable() {
    try {
      if (!('ai' in navigator)) {
        return false;
      }
      
      const models = await navigator.ai.getAvailableModels();
      return models.some(model => model.modelId === 'gemini-nano');
    } catch (error) {
      console.error('[ChromeAI] Failed to check model availability:', error);
      return false;
    }
  }

  async getModelInfo() {
    try {
      if (!this.isAvailable) {
        await this.initialize();
      }

      return {
        modelId: 'gemini-nano',
        available: this.isAvailable,
        sessionActive: !!this.session
      };
    } catch (error) {
      console.error('[ChromeAI] Failed to get model info:', error);
      return {
        modelId: 'gemini-nano',
        available: false,
        sessionActive: false
      };
    }
  }

  // ============================================================================
  // FALLBACK METHODS FOR HACKATHON DEMO
  // ============================================================================

  getFallbackExplanation(code, context = {}) {
    const language = this.detectLanguage(code);
    const lines = code.split('\n').length;
    
    return {
      explanation: `This ${language} code appears to be ${lines} lines long. In a real implementation, this would be analyzed by Chrome's built-in AI (Gemini Nano) to provide detailed explanations, but for demo purposes, we're showing a fallback response. The actual Chrome AI integration would provide comprehensive code analysis including concepts, patterns, and best practices.`,
      type: 'explanation',
      timestamp: Date.now(),
      context: context,
      source: 'fallback',
      language: language,
      lines: lines,
      note: 'Chrome AI not available - showing demo response'
    };
  }

  getFallbackDebug(code, context = {}) {
    const language = this.detectLanguage(code);
    
    return {
      debugInfo: `Debug analysis for ${language} code: This is a fallback response for demonstration purposes. In production, Chrome's built-in AI would analyze the code for potential bugs, performance issues, and security vulnerabilities. The analysis would include specific line-by-line feedback and suggestions for improvement.`,
      type: 'debug',
      timestamp: Date.now(),
      context: context,
      source: 'fallback',
      language: language,
      note: 'Chrome AI not available - showing demo response'
    };
  }

  getFallbackDocumentation(code, context = {}) {
    const language = this.detectLanguage(code);
    
    return {
      documentation: `Documentation for ${language} code: This is a fallback response for demonstration purposes. In production, Chrome's built-in AI would generate comprehensive documentation including function descriptions, parameter details, return values, examples, and usage notes following industry standards.`,
      type: 'documentation',
      timestamp: Date.now(),
      context: context,
      source: 'fallback',
      language: language,
      note: 'Chrome AI not available - showing demo response'
    };
  }

  getFallbackRefactor(code, context = {}) {
    const language = this.detectLanguage(code);
    
    return {
      refactoredCode: code, // Return original code for demo
      improvements: `Refactoring suggestions for ${language} code: This is a fallback response for demonstration purposes. In production, Chrome's built-in AI would provide optimized versions of the code with improved readability, performance, and maintainability, along with detailed explanations of the changes made.`,
      type: 'refactor',
      timestamp: Date.now(),
      context: context,
      source: 'fallback',
      language: language,
      note: 'Chrome AI not available - showing demo response'
    };
  }

  async getStatus() {
    try {
      const available = await this.isModelAvailable();

      return {
        available: available && this.isAvailable,
        initialized: this.isAvailable,
        sessionActive: !!this.session,
        capabilities: {
          explain: true,
          debug: true,
          document: true,
          refactor: true,
          review: true
        }
      };
    } catch (error) {
      console.error('[ChromeAI] Failed to get status:', error);
      return {
        available: false,
        initialized: false,
        sessionActive: false,
        capabilities: {}
      };
    }
  }

  // Cleanup method
  async destroy() {
    try {
      if (this.session) {
        await this.session.destroy();
        this.session = null;
      }
      
      this.model = null;
      this.isAvailable = false;
      
      console.log('[ChromeAI] ✅ Chrome AI destroyed');
    } catch (error) {
      console.error('[ChromeAI] Failed to destroy:', error);
    }
  }
}







