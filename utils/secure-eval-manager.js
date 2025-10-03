/**
 * DevMentor AI - Safe Expression Evaluator
 * OWASP-compliant secure expression evaluation without eval() or new Function()
 * Based on OWASP recommendations for preventing eval injection attacks
 */

(function(global) {
  if (!global) return;
  if (global.__DEVMENTOR_SAFE_EVAL) return;
  
  /**
   * Safe expression evaluator that completely avoids eval() and new Function()
   * Implements OWASP-recommended approach for secure code evaluation
   */
  class SafeExpressionEvaluator {
    constructor() {
      // Whitelist of allowed operations (OWASP recommended approach)
      this.allowedOperations = new Set([
        '+', '-', '*', '/', '%', '**', '===', '!==', '==', '!=',
        '<', '>', '<=', '>=', '&&', '||', '!', '?', ':', '??'
      ]);
      
      // Whitelist of allowed literals
      this.allowedLiterals = new Set([
        'true', 'false', 'null', 'undefined', 'NaN', 'Infinity'
      ]);
      
      // Safe context for evaluation
      this.safeContext = new Map();
    }

    /**
     * Safely evaluate mathematical and logical expressions
     * @param {string} expression - Expression to evaluate
     * @param {Object} context - Context variables
     * @returns {*} - Evaluation result
     */
    safeEvaluate(expression, context = {}) {
      try {
        // Input validation
        if (typeof expression !== 'string') {
          throw new Error('Expression must be a string');
        }

        // Sanitize input (OWASP recommendation)
        const sanitized = this.sanitizeInput(expression);
        
        // Parse and validate expression structure
        const parsed = this.parseExpression(sanitized);
        
        // Evaluate safely without eval() or new Function()
        return this.evaluateParsedExpression(parsed, context);
        
      } catch (error) {
        throw new Error(`Safe evaluation failed: ${error.message}`);
      }
    }

    /**
     * Sanitize input to prevent injection attacks
     * @param {string} input - Input to sanitize
     * @returns {string} - Sanitized input
     */
    sanitizeInput(input) {
      // Remove all potentially dangerous characters
      return input
        .replace(/[^0-9a-zA-Z_ \t+\-*/%().,<>=!&|?:'"\[\]\{\},]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    }

    /**
     * Parse expression into safe tokens
     * @param {string} expression - Expression to parse
     * @returns {Array} - Parsed tokens
     */
    parseExpression(expression) {
      const tokens = [];
      let current = '';
      
      for (let i = 0; i < expression.length; i++) {
        const char = expression[i];
        
        if (this.isOperator(char)) {
          if (current) {
            tokens.push(this.createToken(current));
            current = '';
          }
          tokens.push(this.createToken(char));
        } else if (char === ' ') {
          if (current) {
            tokens.push(this.createToken(current));
            current = '';
          }
        } else {
          current += char;
        }
      }
      
      if (current) {
        tokens.push(this.createToken(current));
      }
      
      return tokens;
    }

    /**
     * Check if character is an operator
     * @param {string} char - Character to check
     * @returns {boolean} - Is operator
     */
    isOperator(char) {
      return ['+', '-', '*', '/', '%', '=', '!', '<', '>', '&', '|', '?', ':', '(', ')', '[', ']', '{', '}', ',', '.'].includes(char);
    }

    /**
     * Create safe token
     * @param {string} value - Token value
     * @returns {Object} - Token object
     */
    createToken(value) {
      if (this.isNumber(value)) {
        return { type: 'number', value: parseFloat(value) };
      } else if (this.isString(value)) {
        return { type: 'string', value: this.parseString(value) };
      } else if (this.allowedLiterals.has(value)) {
        return { type: 'literal', value: this.getLiteralValue(value) };
      } else if (this.allowedOperations.has(value)) {
        return { type: 'operator', value };
      } else if (this.isIdentifier(value)) {
        return { type: 'identifier', value };
      } else {
        throw new Error(`Invalid token: ${value}`);
      }
    }

    /**
     * Check if value is a number
     * @param {string} value - Value to check
     * @returns {boolean} - Is number
     */
    isNumber(value) {
      return /^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(value);
    }

    /**
     * Check if value is a string
     * @param {string} value - Value to check
     * @returns {boolean} - Is string
     */
    isString(value) {
      return (value.startsWith('"') && value.endsWith('"')) || 
             (value.startsWith("'") && value.endsWith("'"));
    }

    /**
     * Parse string value
     * @param {string} value - String to parse
     * @returns {string} - Parsed string
     */
    parseString(value) {
      return value.slice(1, -1).replace(/\\"/g, '"').replace(/\\'/g, "'");
    }

    /**
     * Check if value is valid identifier
     * @param {string} value - Value to check
     * @returns {boolean} - Is identifier
     */
    isIdentifier(value) {
      return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(value);
    }

    /**
     * Get literal value
     * @param {string} literal - Literal name
     * @returns {*} - Literal value
     */
    getLiteralValue(literal) {
      const literals = {
        'true': true,
        'false': false,
        'null': null,
        'undefined': undefined,
        'NaN': NaN,
        'Infinity': Infinity
      };
      return literals[literal];
    }

    /**
     * Evaluate parsed expression safely
     * @param {Array} tokens - Parsed tokens
     * @param {Object} context - Context variables
     * @returns {*} - Evaluation result
     */
    evaluateParsedExpression(tokens, context) {
      // Simple stack-based evaluator for basic arithmetic and logical operations
      const stack = [];
      
      for (const token of tokens) {
        if (token.type === 'number' || token.type === 'string' || token.type === 'literal') {
          stack.push(token.value);
        } else if (token.type === 'identifier') {
          if (context.hasOwnProperty(token.value)) {
            stack.push(context[token.value]);
          } else {
            throw new Error(`Undefined variable: ${token.value}`);
          }
        } else if (token.type === 'operator') {
          this.applyOperator(token.value, stack);
        }
      }
      
      if (stack.length !== 1) {
        throw new Error('Invalid expression');
      }
      
      return stack[0];
    }

    /**
     * Apply operator to stack
     * @param {string} operator - Operator to apply
     * @param {Array} stack - Stack to operate on
     */
    applyOperator(operator, stack) {
      if (stack.length < 2) {
        throw new Error(`Insufficient operands for operator: ${operator}`);
      }
      
      const b = stack.pop();
      const a = stack.pop();
      
      let result;
      
      switch (operator) {
        case '+': result = a + b; break;
        case '-': result = a - b; break;
        case '*': result = a * b; break;
        case '/': result = b !== 0 ? a / b : NaN; break;
        case '%': result = b !== 0 ? a % b : NaN; break;
        case '**': result = Math.pow(a, b); break;
        case '==': result = a == b; break;
        case '===': result = a === b; break;
        case '!=': result = a != b; break;
        case '!==': result = a !== b; break;
        case '<': result = a < b; break;
        case '>': result = a > b; break;
        case '<=': result = a <= b; break;
        case '>=': result = a >= b; break;
        case '&&': result = a && b; break;
        case '||': result = a || b; break;
        default:
          throw new Error(`Unsupported operator: ${operator}`);
      }
      
      stack.push(result);
    }

    /**
     * Register safe context variable
     * @param {string} name - Variable name
     * @param {*} value - Variable value
     */
    registerContext(name, value) {
      if (this.isIdentifier(name)) {
        this.safeContext.set(name, value);
      } else {
        throw new Error(`Invalid context variable name: ${name}`);
      }
    }

    /**
     * Clear context
     */
    clearContext() {
      this.safeContext.clear();
    }
  }

  // Create global instance
  const evaluator = new SafeExpressionEvaluator();
  
  // Export safe API
  const safeEvalAPI = {
    /**
     * Safely evaluate expression without eval() or new Function()
     * @param {string} expression - Expression to evaluate
     * @param {Object} context - Context variables
     * @returns {*} - Evaluation result
     */
    safeEvaluate: (expression, context = {}) => {
      return evaluator.safeEvaluate(expression, context);
    },
    
    /**
     * Register context variable
     * @param {string} name - Variable name
     * @param {*} value - Variable value
     */
    registerContext: (name, value) => {
      evaluator.registerContext(name, value);
    },
    
    /**
     * Clear all context variables
     */
    clearContext: () => {
      evaluator.clearContext();
    },
    
    /**
     * Check if expression is safe to evaluate
     * @param {string} expression - Expression to check
     * @returns {boolean} - Is safe
     */
    isSafeExpression: (expression) => {
      try {
        evaluator.sanitizeInput(expression);
        evaluator.parseExpression(expression);
        return true;
      } catch {
        return false;
      }
    }
  };

  // Make available globally
  global.__DEVMENTOR_SAFE_EVAL = safeEvalAPI;
  
})(typeof globalThis !== 'undefined' ? globalThis : this);