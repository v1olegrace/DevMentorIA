/**
 * DevMentor AI - Chrome Built-in AI Module
 * Integrates with Chrome's Prompt API (Gemini Nano) for local AI processing
 */

export class ChromeAI {
  constructor() {
    this.isAvailable = false;
    this.session = null;
    this.model = null;
  }

  async initialize() {
    try {
      // Check if Chrome Built-in AI is available
      if (!('ai' in navigator)) {
        throw new Error('Chrome Built-in AI not available');
      }

      // Initialize the language model
      this.model = await navigator.ai.createLanguageModel({
        modelId: 'gemini-nano'
      });

      // Create a session for the conversation
      this.session = await this.model.createSession();
      
      this.isAvailable = true;
      console.log('[ChromeAI] ✅ Chrome Built-in AI initialized successfully');
      
    } catch (error) {
      console.error('[ChromeAI] ❌ Initialization failed:', error);
      this.isAvailable = false;
      throw error;
    }
  }

  async explainCode(code, context = {}) {
    if (!this.isAvailable) {
      await this.initialize();
    }

    try {
      const prompt = this.buildExplainPrompt(code, context);
      
      const response = await this.session.prompt(prompt);
      
      return {
        explanation: response.text,
        type: 'explanation',
        timestamp: Date.now(),
        context: context
      };
      
    } catch (error) {
      console.error('[ChromeAI] Explain code failed:', error);
      throw new Error(`Failed to explain code: ${error.message}`);
    }
  }

  async debugCode(code, context = {}) {
    if (!this.isAvailable) {
      await this.initialize();
    }

    try {
      const prompt = this.buildDebugPrompt(code, context);
      
      const response = await this.session.prompt(prompt);
      
      return {
        debugInfo: response.text,
        type: 'debug',
        timestamp: Date.now(),
        context: context
      };
      
    } catch (error) {
      console.error('[ChromeAI] Debug code failed:', error);
      throw new Error(`Failed to debug code: ${error.message}`);
    }
  }

  async generateDocumentation(code, context = {}) {
    if (!this.isAvailable) {
      await this.initialize();
    }

    try {
      const prompt = this.buildDocumentationPrompt(code, context);
      
      const response = await this.session.prompt(prompt);
      
      return {
        documentation: response.text,
        type: 'documentation',
        timestamp: Date.now(),
        context: context
      };
      
    } catch (error) {
      console.error('[ChromeAI] Generate documentation failed:', error);
      throw new Error(`Failed to generate documentation: ${error.message}`);
    }
  }

  async refactorCode(code, context = {}) {
    if (!this.isAvailable) {
      await this.initialize();
    }

    try {
      const prompt = this.buildRefactorPrompt(code, context);
      
      const response = await this.session.prompt(prompt);
      
      return {
        refactoredCode: response.text,
        type: 'refactor',
        timestamp: Date.now(),
        context: context
      };
      
    } catch (error) {
      console.error('[ChromeAI] Refactor code failed:', error);
      throw new Error(`Failed to refactor code: ${error.message}`);
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

  // Document code method
  async documentCode(code, context = {}) {
    if (!this.isAvailable) {
      await this.initialize();
    }

    try {
      const prompt = this.buildDocumentPrompt(code, context);
      
      const response = await this.session.prompt(prompt);
      
      return {
        documentation: response.text,
        type: 'documentation',
        timestamp: Date.now(),
        context: context
      };
      
    } catch (error) {
      console.error('[ChromeAI] Generate documentation failed:', error);
      throw new Error(`Failed to generate documentation: ${error.message}`);
    }
  }

  // Review code method
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
      console.error('[ChromeAI] Code review failed:', error);
      throw new Error(`Failed to review code: ${error.message}`);
    }
  }

  buildDocumentPrompt(code, context) {
    const language = this.detectLanguage(code);
    const url = context.url || 'unknown';
    
    return `You are an expert software engineer. Generate comprehensive documentation for the following ${language} code:

Code:
\`\`\`${language}
${code}
\`\`\`

Context:
- Source: ${url}
- Language: ${language}

Please provide:
1. Function/class description
2. Parameter documentation
3. Return value documentation
4. Usage examples
5. Notes and warnings
6. Related functions/classes

Format the documentation in a clear, professional manner suitable for developers.`;
  }

  buildReviewPrompt(code, context) {
    const language = this.detectLanguage(code);
    const url = context.url || 'unknown';
    
    return `You are an expert code reviewer. Perform a comprehensive code review of the following ${language} code:

Code:
\`\`\`${language}
${code}
\`\`\`

Context:
- Source: ${url}
- Language: ${language}

Please provide:
1. Code quality assessment (1-10 scale)
2. Potential bugs or issues
3. Performance considerations
4. Security concerns
5. Best practices adherence
6. Suggestions for improvement
7. Overall recommendation

Be thorough but constructive in your review.`;
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







