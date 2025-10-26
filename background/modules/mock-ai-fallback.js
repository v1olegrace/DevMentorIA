/**
 * Mock AI Fallback for Chrome Built-in AI
 *
 * IMPORTANT: This is a DEMO/FALLBACK implementation
 * - Used when Chrome Built-in AI is not available
 * - Generates educational, realistic responses
 * - Simulates the behavior of Gemini Nano
 * - Allows testing and demonstration of the extension
 *
 * For hackathon demo purposes only!
 */

class MockAIFallback {
  constructor() {
    this.sessionCounter = 0;
    this.temperature = 0.8;
    this.topK = 40;
    console.log('[MockAI] 🎭 Mock AI Fallback initialized (for demo purposes)');
  }

  /**
   * Check if real Chrome Built-in AI is available
   */
  static isRealAIAvailable() {
    return typeof window !== 'undefined' && typeof window.ai !== 'undefined';
  }

  /**
   * Get capabilities (simulated)
   */
  async getCapabilities() {
    return {
      available: 'readily',
      defaultTopK: 40,
      maxTopK: 128,
      defaultTemperature: 0.8,
      supportsStreaming: false
    };
  }

  /**
   * Create a mock session
   */
  async createSession(options = {}) {
    this.sessionCounter++;
    const sessionId = `mock-session-${this.sessionCounter}`;

    return {
      sessionId,
      prompt: async (text) => {
        return await this._generateResponse(text, options);
      },
      destroy: () => {
        console.log(`[MockAI] Session ${sessionId} destroyed`);
      }
    };
  }

  /**
   * Generate mock response based on prompt
   * @private
   */
  async _generateResponse(prompt, options = {}) {
    // Simulate AI processing delay
    await this._simulateDelay(500, 1500);

    // Detect intent from prompt
    const intent = this._detectIntent(prompt);

    // Generate contextual response
    return this._generateContextualResponse(intent, prompt, options);
  }

  /**
   * Detect user intent from prompt
   * @private
   */
  _detectIntent(prompt) {
    const lowerPrompt = prompt.toLowerCase();

    if (lowerPrompt.includes('explain') || lowerPrompt.includes('what does this code do')) {
      return 'explain';
    }
    if (lowerPrompt.includes('bug') || lowerPrompt.includes('debug') || lowerPrompt.includes('error') || lowerPrompt.includes('issue')) {
      return 'debug';
    }
    if (lowerPrompt.includes('document') || lowerPrompt.includes('jsdoc') || lowerPrompt.includes('comment')) {
      return 'document';
    }
    if (lowerPrompt.includes('optimize') || lowerPrompt.includes('refactor') || lowerPrompt.includes('improve')) {
      return 'optimize';
    }
    if (lowerPrompt.includes('review') || lowerPrompt.includes('code review')) {
      return 'review';
    }

    return 'general';
  }

  /**
   * Generate contextual response based on intent
   * @private
   */
  _generateContextualResponse(intent, prompt, options) {
    // Extract code from prompt if present
    const codeMatch = prompt.match(/```[\w]*\n([\s\S]*?)```/);
    const code = codeMatch ? codeMatch[1] : '';
    const language = this._detectLanguage(code);

    switch (intent) {
      case 'explain':
        return this._generateExplanation(code, language);
      case 'debug':
        return this._generateDebugAnalysis(code, language);
      case 'document':
        return this._generateDocumentation(code, language);
      case 'optimize':
        return this._generateOptimization(code, language);
      case 'review':
        return this._generateReview(code, language);
      default:
        return this._generateGeneral(prompt);
    }
  }

  /**
   * Detect programming language
   * @private
   */
  _detectLanguage(code) {
    if (!code) return 'javascript';

    if (code.includes('function') || code.includes('const') || code.includes('let') || code.includes('=>')) {
      return 'javascript';
    }
    if (code.includes('def ') || code.includes('import ')) {
      return 'python';
    }
    if (code.includes('public class') || code.includes('private ')) {
      return 'java';
    }
    if (code.includes('#include') || code.includes('std::')) {
      return 'cpp';
    }

    return 'javascript';
  }

  /**
   * Generate code explanation
   * @private
   */
  _generateExplanation(code, language) {
    return `## 📚 Code Explanation (${language.toUpperCase()})

**Overview:**
This code appears to be a ${language} implementation that demonstrates common programming patterns and best practices.

**Key Components:**

1. **Structure & Organization**
   - The code follows standard ${language} conventions
   - Clear variable naming and logical flow
   - Modular design for maintainability

2. **Main Functionality**
   - Processes input data and produces output
   - Implements core business logic
   - Handles edge cases appropriately

3. **Technical Details**
   - Uses modern ${language} features
   - Efficient algorithmic approach
   - Follows industry best practices

**Learning Points:**
- This code demonstrates fundamental concepts in ${language}
- Pay attention to the control flow and data structures used
- Notice how error handling and edge cases are managed

💡 **Educational Insight:** Understanding this pattern will help you write more maintainable and scalable code in ${language}.

---
*🎭 Demo Mode: This is a simulated response for demonstration purposes. Real Chrome Built-in AI will provide deeper analysis.*`;
  }

  /**
   * Generate debug analysis
   * @private
   */
  _generateDebugAnalysis(code, language) {
    return `## 🐛 Debug Analysis (${language.toUpperCase()})

I've analyzed this ${language} code for potential issues. Here's what I found:

**📍 Issue #1: Potential Logic Error**
- **Type**: Logic
- **Severity**: MEDIUM
- **Location**: Throughout the function
- **Problem**: Variable scope and initialization could cause unexpected behavior
- **Impact**: May produce incorrect results in edge cases
- **Fix**: Ensure all variables are properly initialized before use
- **Explanation**: Always initialize variables to prevent undefined behavior

**📍 Issue #2: Missing Error Handling**
- **Type**: Best Practice
- **Severity**: MEDIUM
- **Location**: Main execution path
- **Problem**: No try-catch blocks for error handling
- **Impact**: Unhandled errors could crash the application
- **Fix**: Wrap critical code sections in try-catch blocks
- **Explanation**: Proper error handling improves robustness

**📍 Issue #3: Performance Consideration**
- **Type**: Performance
- **Severity**: LOW
- **Location**: Loop structures
- **Problem**: Could be optimized for better performance
- **Impact**: May be slow with large datasets
- **Fix**: Consider using more efficient algorithms or data structures
- **Explanation**: Algorithm optimization improves scalability

**✅ Positive Points:**
- Code structure is generally clear
- Variable naming is descriptive
- Logic flow is easy to follow

**🎯 Recommendations:**
1. Add comprehensive error handling
2. Validate all input data
3. Add unit tests for edge cases
4. Consider performance optimization for large inputs

---
*🎭 Demo Mode: This is a simulated analysis. Real Chrome Built-in AI will provide more specific, context-aware bug detection.*`;
  }

  /**
   * Generate documentation
   * @private
   */
  _generateDocumentation(code, language) {
    const docStyle = language === 'python' ? 'Python docstring' : 'JSDoc';

    return `## 📝 Generated Documentation (${language.toUpperCase()})

\`\`\`${language}
/**
 * Function Name: processData
 *
 * @description
 * Processes input data and returns transformed output.
 * This function demonstrates core ${language} concepts and best practices.
 *
 * @param {*} input - The input data to process
 * @param {Object} options - Configuration options
 * @param {boolean} options.strict - Enable strict mode validation
 * @param {number} options.timeout - Processing timeout in milliseconds
 *
 * @returns {*} Processed output data
 *
 * @throws {Error} Throws error if input validation fails
 * @throws {TypeError} Throws if input type is incorrect
 *
 * @example
 * // Basic usage
 * const result = processData({ value: 42 });
 * console.log(result); // { value: 42, processed: true }
 *
 * @example
 * // With options
 * const result = processData({ value: 42 }, { strict: true });
 * console.log(result);
 *
 * @notes
 * - Always validate input before processing
 * - This function is pure (no side effects)
 * - Handles edge cases gracefully
 *
 * @see https://developer.mozilla.org/${language}/Reference
 *
 * @since 1.0.0
 * @version 1.2.0
 */
\`\`\`

**Documentation Style:** ${docStyle}

**Additional Information:**
- **Complexity**: O(n) time, O(1) space
- **Side Effects**: None (pure function)
- **Thread Safety**: Yes (if applicable)
- **Tested**: Should include unit tests

---
*🎭 Demo Mode: Real Chrome Built-in AI will generate language-specific documentation with deeper context.*`;
  }

  /**
   * Generate optimization suggestions
   * @private
   */
  _generateOptimization(code, language) {
    return `## ⚡ Code Optimization Analysis (${language.toUpperCase()})

I've analyzed your code and found several optimization opportunities:

### 1. **Performance Optimization**

**Before:**
\`\`\`${language}
// Current implementation (less efficient)
for (let i = 0; i < array.length; i++) {
  // Processing logic
}
\`\`\`

**After:**
\`\`\`${language}
// Optimized implementation
const length = array.length;
for (let i = 0; i < length; i++) {
  // Processing logic
}
\`\`\`

**Impact:** Reduces array property lookups on each iteration

---

### 2. **Memory Optimization**

**Suggestion:** Use more efficient data structures
- Replace arrays with Sets for unique values
- Use Maps instead of objects for key-value pairs
- Avoid creating unnecessary intermediate variables

**Expected Improvement:** ~30% memory reduction

---

### 3. **Readability Enhancement**

**Before:**
\`\`\`${language}
const x = data.filter(y => y.z > 5).map(y => y.w);
\`\`\`

**After:**
\`\`\`${language}
const validItems = data.filter(item => item.value > 5);
const results = validItems.map(item => item.property);
\`\`\`

**Impact:** Code is self-documenting and easier to maintain

---

### 4. **Best Practices**

✅ **Apply These Improvements:**
- Add input validation
- Use const instead of let where possible
- Extract magic numbers to named constants
- Add error handling with try-catch
- Use async/await for asynchronous operations

---

### 5. **Maintainability**

**Recommendations:**
- Break large functions into smaller, focused functions
- Add comprehensive comments for complex logic
- Follow ${language} style guide conventions
- Add unit tests for critical paths

**Overall Score:** 7/10
**With Optimizations:** 9/10

---
*🎭 Demo Mode: Real Chrome Built-in AI will provide code-specific optimization with performance metrics.*`;
  }

  /**
   * Generate code review
   * @private
   */
  _generateReview(code, language) {
    return `## 👀 Code Review (${language.toUpperCase()})

### 📊 Overall Assessment

**Quality Score: 7.5/10**

| Category | Score | Status |
|----------|-------|--------|
| Correctness | 8/10 | ✅ Good |
| Performance | 7/10 | ⚠️ Could improve |
| Readability | 8/10 | ✅ Good |
| Maintainability | 7/10 | ⚠️ Could improve |
| Security | 6/10 | ⚠️ Needs attention |

---

### ✅ Strengths

1. **Clear Structure**
   - Code is well-organized and easy to follow
   - Good separation of concerns
   - Logical function naming

2. **Good Practices**
   - Follows ${language} conventions
   - Consistent code style
   - Reasonable variable names

3. **Functionality**
   - Core logic appears sound
   - Handles basic use cases well

---

### ⚠️ Areas for Improvement

1. **Error Handling** (Priority: HIGH)
   - Add try-catch blocks for error-prone operations
   - Validate all inputs
   - Provide meaningful error messages

2. **Security** (Priority: HIGH)
   - Sanitize user inputs
   - Avoid eval() or similar dangerous functions
   - Validate all external data

3. **Performance** (Priority: MEDIUM)
   - Optimize loops and iterations
   - Reduce unnecessary calculations
   - Consider memoization for expensive operations

4. **Testing** (Priority: MEDIUM)
   - Add unit tests
   - Test edge cases
   - Add integration tests

---

### 🎯 Specific Recommendations

**Immediate Actions:**
1. Add input validation (takes 10 min)
2. Add basic error handling (takes 15 min)
3. Extract magic numbers to constants (takes 5 min)

**Future Enhancements:**
1. Write comprehensive tests
2. Add performance monitoring
3. Create detailed documentation
4. Consider refactoring for better modularity

---

### 💡 Learning Opportunities

This code demonstrates several important ${language} concepts:
- Functional programming patterns
- Data transformation techniques
- Modern ${language} syntax

Keep up the good work! With the suggested improvements, this code will be production-ready.

---
*🎭 Demo Mode: Real Chrome Built-in AI will provide deeper, context-specific review with security analysis.*`;
  }

  /**
   * Generate general response
   * @private
   */
  _generateGeneral(prompt) {
    return `I'm DevMentor AI, your coding assistant powered by Chrome Built-in AI.

**I can help you with:**
- 🧠 Explaining code in detail
- 🐛 Finding and fixing bugs
- 📝 Generating documentation
- ⚡ Optimizing performance
- 👀 Reviewing code quality

**How to use me:**
1. Select code on the page
2. Right-click and choose a DevMentor option
3. Or use keyboard shortcuts (Ctrl+Shift+E/B/G/R)

**Your question:** "${prompt.substring(0, 100)}..."

I'm currently in demo mode. For best results, enable Chrome Built-in AI in chrome://flags!

---
*🎭 Demo Mode: This is a simulated response for demonstration purposes.*`;
  }

  /**
   * Simulate AI processing delay
   * @private
   */
  async _simulateDelay(min, max) {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    return new Promise(resolve => setTimeout(resolve, delay));
  }
}

// Export for both ES6 and CommonJS
export default MockAIFallback;

// Also attach to window for non-module contexts
if (typeof window !== 'undefined') {
  window.MockAIFallback = MockAIFallback;
}
