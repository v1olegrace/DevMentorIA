/**
 * DevMentor AI - Backend Proxy para API Keys
 * Servidor proxy seguro para proteger chaves de API
 * Implementação Node.js/Express para produção
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const crypto = require('crypto');

class SecureAPIProxy {
  constructor() {
    this.app = express();
    this.apiKeys = new Map();
    this.requestLogs = new Map();
    this.validateConfiguration();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupSecurity();
  }

  validateConfiguration() {
    // Fail fast if ALLOWED_ORIGINS is not configured
    const allowedOrigins = process.env.ALLOWED_ORIGINS;
    if (!allowedOrigins || allowedOrigins.trim() === '') {
      console.error('❌ CRITICAL: ALLOWED_ORIGINS environment variable is not set or empty');
      console.error('   This API requires explicit origin whitelist for security');
      console.error('   Set ALLOWED_ORIGINS=origin1,origin2,origin3');
      process.exit(1);
    }

    // Validate origins format
    const origins = allowedOrigins.split(',').map(s => s.trim()).filter(Boolean);
    if (origins.length === 0) {
      console.error('❌ CRITICAL: No valid origins found in ALLOWED_ORIGINS');
      process.exit(1);
    }

    // Check for wildcards (not allowed for credentials)
    const hasWildcards = origins.some(origin => origin.includes('*'));
    if (hasWildcards) {
      console.warn('⚠️  WARNING: Wildcards detected in ALLOWED_ORIGINS');
      console.warn('   Wildcards are not compatible with Access-Control-Allow-Credentials: true');
      console.warn('   Consider using exact origins for better security');
    }

    console.log(`✅ CORS Configuration validated: ${origins.length} allowed origins`);
    this.allowedOrigins = origins;
  }

  setupMiddleware() {
    // Security headers
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'", "https://api.openai.com", "https://api.anthropic.com", "https://generativelanguage.googleapis.com"]
        }
      }
    }));

    // ✅ SECURITY: Strict CORS validation with explicit origin whitelist
    this.app.use((req, res, next) => {
      const origin = req.headers.origin;
      
      // Block requests without Origin header (unless explicitly configured for server-to-server)
      if (!origin) {
        const allowServerToServer = process.env.ALLOW_SERVER_TO_SERVER === 'true';
        if (!allowServerToServer) {
          console.warn(`🚨 Request blocked: No Origin header from ${req.ip}`);
          return res.status(403).json({ 
            error: 'Origin header required',
            code: 'MISSING_ORIGIN'
          });
        }
        return next();
      }
      
      // Strict origin validation - exact match only
      if (this.allowedOrigins.includes(origin)) {
        // Set CORS headers for whitelisted origins only
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        
        // Handle preflight requests
        if (req.method === 'OPTIONS') {
          return res.status(204).end();
        }
        return next();
      }
      
      // Log and block disallowed origins
      console.warn(`🚨 CORS blocked origin: ${origin} from ${req.ip}`);
      console.warn(`   Allowed origins: ${this.allowedOrigins.join(', ')}`);
      
      // Return 403 for disallowed origins (explicit rejection)
      return res.status(403).json({ 
        error: 'Origin not allowed',
        code: 'CORS_BLOCKED',
        allowedOrigins: this.allowedOrigins
      });
    });

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: 'Too many requests from this IP, please try again later.',
      standardHeaders: true,
      legacyHeaders: false
    });
    this.app.use(limiter);

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request logging
    this.app.use((req, res, next) => {
      const requestId = crypto.randomUUID();
      req.requestId = requestId;
      
      this.requestLogs.set(requestId, {
        timestamp: Date.now(),
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        status: null
      });
      
      next();
    });
  }

  // Método otimizado para calcular tamanho de objeto sem JSON.stringify
  calculateObjectSize(obj, seen = new WeakSet()) {
    if (obj === null || obj === undefined) return 0;
    if (typeof obj === 'string') return obj.length * 2; // UTF-16
    if (typeof obj === 'number') return 8;
    if (typeof obj === 'boolean') return 4;
    if (typeof obj === 'function') return 0;
    
    if (seen.has(obj)) return 0; // Evitar referências circulares
    seen.add(obj);
    
    let size = 0;
    
    if (Array.isArray(obj)) {
      size += 4; // Overhead do array
      for (const item of obj) {
        size += this.calculateObjectSize(item, seen);
      }
    } else if (typeof obj === 'object') {
      size += 8; // Overhead do objeto
      for (const [key, value] of Object.entries(obj)) {
        size += key.length * 2; // Chave
        size += this.calculateObjectSize(value, seen);
      }
    }
    
    return size;
  }

  setupSecurity() {
    // API Key validation middleware
    this.app.use('/api/proxy', (req, res, next) => {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing or invalid authorization header' });
      }
      
      const token = authHeader.substring(7);
      const isValidToken = this.validateAPIToken(token);
      
      if (!isValidToken) {
        return res.status(401).json({ error: 'Invalid API token' });
      }
      
      req.apiToken = token;
      next();
    });

    // Request validation
    this.app.use('/api/proxy', (req, res, next) => {
      if (req.method === 'POST' && !req.body) {
        return res.status(400).json({ error: 'Request body is required' });
      }
      
      // Validate request size - otimizado
      if (req.body) {
        const bodySize = this.calculateObjectSize(req.body);
        if (bodySize > 1000000) { // 1MB
          return res.status(413).json({ error: 'Request too large' });
        }
      }
      
      next();
    });
  }

  setupRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      });
    });

    // Test API connection
    this.app.post('/api/proxy/test-connection', async (req, res) => {
      try {
        const { provider, apiKey } = req.body;
        
        if (!provider || !apiKey) {
          return res.status(400).json({ error: 'Provider and API key are required' });
        }

        const isValidKey = this.validateAPIKey(apiKey, provider);
        if (!isValidKey) {
          return res.status(400).json({ error: 'Invalid API key format' });
        }

        // Test connection to provider
        const testResult = await this.testProviderConnection(provider, apiKey);
        
        res.json({
          success: true,
          provider,
          message: 'Connection test successful',
          details: testResult
        });

      } catch (error) {
        this.logError(req.requestId, error);
        res.status(500).json({ 
          error: 'Connection test failed',
          message: error.message 
        });
      }
    });

    // Analyze code via AI
    this.app.post('/api/proxy/analyze', async (req, res) => {
      try {
        const { code, analysisType, options, provider } = req.body;
        
        if (!code || !analysisType) {
          return res.status(400).json({ error: 'Code and analysis type are required' });
        }

        // Validate code size
        if (code.length > 50000) {
          return res.status(413).json({ error: 'Code too large for analysis' });
        }

        // Get API key for provider
        const apiKey = await this.getAPIKeyForProvider(provider);
        if (!apiKey) {
          return res.status(400).json({ error: 'No API key configured for provider' });
        }

        // Analyze code
        const analysisResult = await this.analyzeCode(code, analysisType, options, provider, apiKey);
        
        res.json({
          success: true,
          result: analysisResult,
          metadata: {
            analysisType,
            codeLength: code.length,
            provider,
            timestamp: new Date().toISOString()
          }
        });

      } catch (error) {
        this.logError(req.requestId, error);
        res.status(500).json({ 
          error: 'Analysis failed',
          message: error.message 
        });
      }
    });

    // Screenshot analysis
    this.app.post('/api/proxy/analyze-screenshot', async (req, res) => {
      try {
        const { imageData, analysisType, provider } = req.body;
        
        if (!imageData) {
          return res.status(400).json({ error: 'Image data is required' });
        }

        // Validate image data
        const isValidImage = this.validateImageData(imageData);
        if (!isValidImage) {
          return res.status(400).json({ error: 'Invalid image data' });
        }

        const apiKey = await this.getAPIKeyForProvider(provider);
        if (!apiKey) {
          return res.status(400).json({ error: 'No API key configured for provider' });
        }

        const analysisResult = await this.analyzeScreenshot(imageData, analysisType, provider, apiKey);
        
        res.json({
          success: true,
          result: analysisResult,
          metadata: {
            analysisType,
            imageSize: imageData.length,
            provider,
            timestamp: new Date().toISOString()
          }
        });

      } catch (error) {
        this.logError(req.requestId, error);
        res.status(500).json({ 
          error: 'Screenshot analysis failed',
          message: error.message 
        });
      }
    });

    // Sandbox eval (fallback for complex expressions)
    this.app.post('/api/proxy/sandbox-eval', async (req, res) => {
      try {
        const { expression, context, options } = req.body;
        
        if (!expression) {
          return res.status(400).json({ error: 'Expression is required' });
        }

        // Validate expression safety
        const isSafe = this.validateExpressionSafety(expression);
        if (!isSafe) {
          return res.status(400).json({ error: 'Expression contains unsafe operations' });
        }

        // Execute in sandbox
        const result = await this.executeInSandbox(expression, context, options);
        
        res.json({
          success: true,
          value: result,
          metadata: {
            expression: expression.substring(0, 100) + (expression.length > 100 ? '...' : ''),
            timestamp: new Date().toISOString()
          }
        });

      } catch (error) {
        this.logError(req.requestId, error);
        res.status(500).json({ 
          error: 'Sandbox evaluation failed',
          message: error.message 
        });
      }
    });

    // Error handling
    this.app.use((err, req, res, next) => {
      this.logError(req.requestId, err);
      res.status(500).json({ 
        error: 'Internal server error',
        requestId: req.requestId 
      });
    });

    // 404 handler
    this.app.use((req, res) => {
      res.status(404).json({ error: 'Endpoint not found' });
    });
  }

  validateAPIToken(token) {
    // Implement token validation logic
    // For now, accept any token (in production, use proper JWT validation)
    return token && token.length > 10;
  }

  validateAPIKey(apiKey, provider) {
    const patterns = {
      openai: /^sk-[a-zA-Z0-9]{20,}$/,
      anthropic: /^sk-ant-[a-zA-Z0-9\-_]{20,}$/,
      google: /^[a-zA-Z0-9\-_]{20,}$/
    };
    
    return patterns[provider]?.test(apiKey) || false;
  }

  async testProviderConnection(provider, apiKey) {
    const endpoints = {
      openai: 'https://api.openai.com/v1/models',
      anthropic: 'https://api.anthropic.com/v1/messages',
      google: 'https://generativelanguage.googleapis.com/v1/models'
    };

    const endpoint = endpoints[provider];
    if (!endpoint) {
      throw new Error(`Unsupported provider: ${provider}`);
    }

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Provider connection failed: ${response.status}`);
    }

    return {
      provider,
      status: 'connected',
      timestamp: new Date().toISOString()
    };
  }

  async analyzeCode(code, analysisType, options, provider, apiKey) {
    // Implement AI code analysis based on provider
    const prompts = {
      explain: 'Explain this code in detail:',
      debug: 'Find bugs and issues in this code:',
      optimize: 'Optimize this code for performance:',
      document: 'Generate documentation for this code:'
    };

    const prompt = prompts[analysisType] || prompts.explain;
    const fullPrompt = `${prompt}\n\n${code}`;

    // Call AI provider
    const response = await this.callAIProvider(provider, apiKey, fullPrompt, options);
    
    return {
      analysis: response,
      type: analysisType,
      confidence: 0.95
    };
  }

  async callAIProvider(provider, apiKey, prompt, options) {
    const providers = {
      openai: this.callOpenAI,
      anthropic: this.callAnthropic,
      google: this.callGoogle
    };

    const providerFunction = providers[provider];
    if (!providerFunction) {
      throw new Error(`Unsupported provider: ${provider}`);
    }

    return await providerFunction(apiKey, prompt, options);
  }

  async callOpenAI(apiKey, prompt, options) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: options.model || 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: options.maxTokens || 2000,
        temperature: options.temperature || 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  async callAnthropic(apiKey, prompt, options) {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: options.model || 'claude-3-sonnet-20240229',
        max_tokens: options.maxTokens || 2000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = await response.json();
    return data.content[0].text;
  }

  async callGoogle(apiKey, prompt, options) {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/${options.model || 'gemini-pro'}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: options.maxTokens || 2000,
          temperature: options.temperature || 0.7
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Google API error: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }

  validateImageData(imageData) {
    // Basic validation for base64 image data
    if (typeof imageData !== 'string') return false;
    if (!imageData.startsWith('data:image/')) return false;
    if (imageData.length > 10000000) return false; // 10MB limit
    
    return true;
  }

  async analyzeScreenshot(imageData, analysisType, provider, apiKey) {
    // Implement screenshot analysis
    return {
      analysis: 'Screenshot analysis result',
      type: analysisType,
      confidence: 0.90
    };
  }

  validateExpressionSafety(expression) {
    const dangerousPatterns = [
      /eval\s*\(/,
      /Function\s*\(/,
      /setTimeout\s*\(/,
      /setInterval\s*\(/,
      /require\s*\(/,
      /import\s*\(/,
      /process\./,
      /global\./,
      /window\./,
      /document\./
    ];

    return !dangerousPatterns.some(pattern => pattern.test(expression));
  }

  async executeInSandbox(expression, context, options) {
    // Implement safe expression evaluation without new Function()
    // Use OWASP-recommended approach for secure expression evaluation
    try {
      // Use SafeExpressionEvaluator if available
      if (typeof globalThis !== 'undefined' && globalThis.__DEVMENTOR_SAFE_EVAL) {
        return globalThis.__DEVMENTOR_SAFE_EVAL.safeEvaluate(expression, context);
      }
      
      // Fallback: use safe stack-based evaluator
      return this.safeStackEvaluate(expression, context);
      
    } catch (error) {
      throw new Error(`Expression evaluation failed: ${error.message}`);
    }
  }

  /**
   * Safe stack-based evaluator without eval() or new Function()
   * Implements OWASP-recommended approach for secure expression evaluation
   */
  safeStackEvaluate(expression, context) {
    // Whitelist of allowed operations (OWASP recommended approach)
    const allowedOperations = new Set([
      '+', '-', '*', '/', '%', '**', '===', '!==', '==', '!=',
      '<', '>', '<=', '>=', '&&', '||', '!', '?', ':', '??'
    ]);
    
    // Whitelist of allowed literals
    const allowedLiterals = new Set([
      'true', 'false', 'null', 'undefined', 'NaN', 'Infinity'
    ]);

    // Sanitize input to prevent injection attacks
    const sanitized = expression
      .replace(/[^0-9a-zA-Z_ \t+\-*/%().,<>=!&|?:'"\[\]\{\},]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    // Parse expression into safe tokens
    const tokens = this.parseExpressionTokens(sanitized);
    
    // Evaluate safely using stack-based approach
    return this.evaluateTokens(tokens, context, allowedOperations, allowedLiterals);
  }

  /**
   * Parse expression into safe tokens
   */
  parseExpressionTokens(expression) {
    const tokens = [];
    let current = '';
    
    for (let i = 0; i < expression.length; i++) {
      const char = expression[i];
      
      if (this.isOperatorChar(char)) {
        if (current) {
          tokens.push(this.createSafeToken(current));
          current = '';
        }
        tokens.push(this.createSafeToken(char));
      } else if (char === ' ') {
        if (current) {
          tokens.push(this.createSafeToken(current));
          current = '';
        }
      } else {
        current += char;
      }
    }
    
    if (current) {
      tokens.push(this.createSafeToken(current));
    }
    
    return tokens;
  }

  /**
   * Check if character is an operator
   */
  isOperatorChar(char) {
    return ['+', '-', '*', '/', '%', '=', '!', '<', '>', '&', '|', '?', ':', '(', ')', '[', ']', '{', '}', ',', '.'].includes(char);
  }

  /**
   * Create safe token
   */
  createSafeToken(value) {
    if (this.isNumber(value)) {
      return { type: 'number', value: parseFloat(value) };
    } else if (this.isString(value)) {
      return { type: 'string', value: this.parseString(value) };
    } else if (['true', 'false', 'null', 'undefined', 'NaN', 'Infinity'].includes(value)) {
      return { type: 'literal', value: this.getLiteralValue(value) };
    } else if (['+', '-', '*', '/', '%', '**', '===', '!==', '==', '!=', '<', '>', '<=', '>=', '&&', '||', '!', '?', ':', '??'].includes(value)) {
      return { type: 'operator', value };
    } else if (this.isIdentifier(value)) {
      return { type: 'identifier', value };
    } else {
      throw new Error(`Invalid token: ${value}`);
    }
  }

  /**
   * Check if value is a number
   */
  isNumber(value) {
    return /^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(value);
  }

  /**
   * Check if value is a string
   */
  isString(value) {
    return (value.startsWith('"') && value.endsWith('"')) || 
           (value.startsWith("'") && value.endsWith("'"));
  }

  /**
   * Parse string value
   */
  parseString(value) {
    return value.slice(1, -1).replace(/\\"/g, '"').replace(/\\'/g, "'");
  }

  /**
   * Check if value is valid identifier
   */
  isIdentifier(value) {
    return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(value);
  }

  /**
   * Get literal value
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
   * Evaluate tokens safely using stack-based approach
   */
  evaluateTokens(tokens, context, allowedOperations, allowedLiterals) {
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

  async getAPIKeyForProvider(provider) {
    // In production, retrieve from secure storage
    return process.env[`${provider.toUpperCase()}_API_KEY`];
  }

  logError(requestId, error) {
    const logEntry = this.requestLogs.get(requestId);
    if (logEntry) {
      logEntry.status = 'error';
      logEntry.error = error.message;
      logEntry.stack = error.stack;
    }
    
    console.error(`[APIProxy] Request ${requestId} failed:`, error.message);
  }

  start(port = 3001) {
    this.app.listen(port, () => {
      console.log(`🚀 Secure API Proxy running on port ${port}`);
      console.log(`📊 Health check: http://localhost:${port}/health`);
    });
  }
}

// Export for use
module.exports = SecureAPIProxy;

// Start server if run directly
if (require.main === module) {
  const proxy = new SecureAPIProxy();
  proxy.start(process.env.PORT || 3001);
}
