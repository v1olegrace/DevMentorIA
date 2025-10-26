# DevMentor AI - Guia de Refatoração v2.0.0

## ✅ Progresso das Correções

### Completado
1. ✅ **core-utils.js** - Todos os utilitários compartilhados criados
2. ✅ **code-rating-system.js** - Totalmente refatorado (v2.0.0)

### Pendente (Aplicar mesmo padrão)
3. ⏳ security-analyzer.js
4. ⏳ performance-advisor.js
5. ⏳ test-generator.js
6. ⏳ adaptive-learning-engine.js
7. ⏳ gamification-system.js
8. ⏳ devmentor-orchestrator.js

---

## 📋 Checklist de Refatoração (Para Cada Módulo)

Use este checklist ao refatorar cada módulo:

### 1. Imports (Início do Arquivo)
```javascript
import {
  InputValidator,
  ModuleError,
  RateLimiter,
  RegexUtils,
  AnalysisCache,    // Se precisar de cache
  HtmlSanitizer,    // Se gerar HTML/Markdown
  PromiseUtils,     // Se usar Promise.all
  VALIDATION_LIMITS
} from './utils/core-utils.js';
```

### 2. Constantes (Remover Magic Numbers)
```javascript
// ❌ ANTES
if (score > 7) { }
if (lines.length > 50) { }

// ✅ DEPOIS
const QUALITY_THRESHOLDS = {
  HIGH: 7,
  MEDIUM: 5,
  LOW: 3
};

const COMPLEXITY_LIMITS = {
  MAX_FUNCTION_LINES: 50,
  WARNING_LINES: 30
};

if (score > QUALITY_THRESHOLDS.HIGH) { }
if (lines.length > COMPLEXITY_LIMITS.MAX_FUNCTION_LINES) { }
```

### 3. Singleton Pattern (Thread-Safe)
```javascript
// ❌ ANTES (Race Condition)
class MyModule {
  static instance = null;

  constructor() {
    if (MyModule.instance) {
      return MyModule.instance;
    }
    MyModule.instance = this;
  }

  static getInstance() {
    if (!MyModule.instance) {
      MyModule.instance = new MyModule();
    }
    return MyModule.instance;
  }
}

// ✅ DEPOIS (Thread-Safe)
class MyModule {
  static #instance = null;
  static #isInternalConstruction = false;

  constructor() {
    // Prevent external instantiation
    if (!MyModule.#isInternalConstruction) {
      throw new TypeError(
        'MyModule is a singleton. Use MyModule.getInstance() instead.'
      );
    }

    // Initialize components
    this.rateLimiter = new RateLimiter(10, 60000);
    this.cache = new AnalysisCache(100, 600000);

    // Freeze to prevent modifications
    Object.freeze(this);
  }

  static getInstance() {
    if (!this.#instance) {
      this.#isInternalConstruction = true;
      this.#instance = new MyModule();
      this.#isInternalConstruction = false;
    }
    return this.#instance;
  }
}

// Export ONLY instance (not class)
export default MyModule.getInstance();
export { MyModule }; // Export class for testing only
```

### 4. Input Validation (Main Entry Point)
```javascript
// ❌ ANTES
async analyze(code, options = {}) {
  const lines = code.split('\n'); // CRASH se code = null!
}

// ✅ DEPOIS
async analyze(code, options = {}) {
  const userId = InputValidator.validateUserId(options.userId || 'anonymous');

  try {
    // Rate limiting
    this.rateLimiter.check(userId);

    // Input validation
    code = InputValidator.validateCode(code, {
      maxSize: VALIDATION_LIMITS.MAX_CODE_SIZE,
      minSize: 1,
      allowEmpty: false
    });

    // Check cache
    const cached = this.cache.get(code);
    if (cached) {
      return cached;
    }

    // Process...
    const result = await this.processCode(code);

    // Cache result
    this.cache.set(code, result);

    return result;

  } catch (error) {
    if (error instanceof ModuleError) {
      throw error;
    }

    throw new ModuleError(
      'Analysis failed',
      error,
      {
        code: 'ANALYSIS_FAILED',
        userId,
        codeLength: code?.length || 0
      }
    );
  }
}
```

### 5. Regex com ReDoS Protection
```javascript
// ❌ ANTES (Vulnerável a ReDoS)
const matches = code.match(/complex+regex+pattern/g);

// ✅ DEPOIS (Protegido)
const matches = await RegexUtils.safeMatch(code, /complex+regex+pattern/g);
// ou
const hasMatch = await RegexUtils.safeTest(code, /pattern/);
// ou
const allMatches = await RegexUtils.safeMatchAll(code, /pattern/g);
```

### 6. Promise.all com Timeout
```javascript
// ❌ ANTES (Pode travar indefinidamente)
const results = await Promise.allSettled([
  this.func1(),
  this.func2(),
  this.func3()
]);

// ✅ DEPOIS (Com timeout)
const results = await PromiseUtils.allSettledWithTimeout([
  this.func1(),
  this.func2(),
  this.func3()
], 30000); // 30s timeout
```

### 7. Otimização O(n²) → O(n)
```javascript
// ❌ ANTES (O(n²) - LENTO)
const duplicates = lines.filter((line, index) =>
  lines.indexOf(line) !== index // indexOf em loop!
);

// ✅ DEPOIS (O(n) - RÁPIDO)
const seen = new Set();
const duplicates = [];
for (const line of lines) {
  if (seen.has(line)) {
    duplicates.push(line);
  } else {
    seen.add(line);
  }
}
```

### 8. Memory Leak Prevention
```javascript
// ❌ ANTES (Cresce indefinidamente)
this.history = [];
this.history.push(item); // Sem limite!

// ✅ DEPOIS (Com limite)
const MAX_HISTORY = 100;

this.history.push(item);

if (this.history.length > MAX_HISTORY) {
  this.history = this.history.slice(-MAX_HISTORY);
}

// OU usar circular buffer
if (this.history.length >= MAX_HISTORY) {
  this.history.shift(); // Remove oldest
}
this.history.push(item);
```

### 9. HTML Sanitization
```javascript
// ❌ ANTES (XSS vulnerability)
return `<div>${vuln.description}</div>`; // XSS!

// ✅ DEPOIS (Sanitizado)
import { HtmlSanitizer } from './utils/core-utils.js';

return `<div>${HtmlSanitizer.escapeHtml(vuln.description)}</div>`;

// Para código com secrets
return HtmlSanitizer.sanitizeCode(codeSnippet, 200);
```

### 10. Error Handling
```javascript
// ❌ ANTES (Perde stack trace)
try {
  await doSomething();
} catch (error) {
  throw new Error(`Failed: ${error.message}`); // Stack perdido!
}

// ✅ DEPOIS (Preserva contexto)
try {
  await doSomething();
} catch (error) {
  if (error instanceof ModuleError) {
    throw error; // Re-throw ModuleError
  }

  throw new ModuleError(
    'Operation failed',
    error, // Original error preservado
    {
      code: 'OPERATION_FAILED',
      operation: 'doSomething',
      userId: this.userId
    }
  );
}
```

---

## 🎯 Exemplo Completo de Refatoração

### security-analyzer.js (ANTES vs DEPOIS)

#### ANTES ❌
```javascript
class SecurityAnalyzer {
  static instance = null;

  constructor() {
    if (SecurityAnalyzer.instance) {
      return SecurityAnalyzer.instance;
    }
    SecurityAnalyzer.instance = this;
  }

  async analyzeCode(code, context = {}) {
    // Nenhuma validação!
    const vulnerabilities = [];

    // Regex sem proteção
    const matches = code.matchAll(/pattern/g);

    for (const match of matches) {
      vulnerabilities.push({
        code: match[0] // Pode vazar secrets!
      });
    }

    // Sem cache, sem rate limit
    return { vulnerabilities };
  }
}

export { SecurityAnalyzer };
```

#### DEPOIS ✅
```javascript
import {
  InputValidator,
  ModuleError,
  RateLimiter,
  RegexUtils,
  AnalysisCache,
  HtmlSanitizer,
  VALIDATION_LIMITS
} from './utils/core-utils.js';

// Constants
const SEVERITY_LEVELS = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
};

const MAX_SCAN_HISTORY = 100;

class SecurityAnalyzer {
  static #instance = null;
  static #isInternalConstruction = false;

  constructor() {
    if (!SecurityAnalyzer.#isInternalConstruction) {
      throw new TypeError('Use getInstance()');
    }

    this.rateLimiter = new RateLimiter(10, 60000);
    this.cache = new AnalysisCache(100, 600000);
    this.scanHistory = [];

    Object.freeze(this);
  }

  static getInstance() {
    if (!this.#instance) {
      this.#isInternalConstruction = true;
      this.#instance = new SecurityAnalyzer();
      this.#isInternalConstruction = false;
    }
    return this.#instance;
  }

  async analyzeCode(code, context = {}) {
    const userId = InputValidator.validateUserId(context.userId || 'anonymous');
    const startTime = Date.now();

    try {
      // Rate limiting
      this.rateLimiter.check(userId);

      // Input validation
      code = InputValidator.validateCode(code, {
        maxSize: VALIDATION_LIMITS.MAX_CODE_SIZE,
        minSize: 1
      });

      // Check cache
      const cached = this.cache.get(code);
      if (cached) return cached;

      // Analysis with ReDoS protection
      const vulnerabilities = await this.detectVulnerabilities(code);

      const result = {
        vulnerabilities,
        securityScore: this.calculateScore(vulnerabilities),
        metadata: {
          analysisTime: Date.now() - startTime,
          timestamp: new Date().toISOString(),
          userId
        }
      };

      // Cache
      this.cache.set(code, result);

      // Update history (WITH LIMIT)
      this.scanHistory.push({
        timestamp: result.metadata.timestamp,
        score: result.securityScore
      });

      if (this.scanHistory.length > MAX_SCAN_HISTORY) {
        this.scanHistory = this.scanHistory.slice(-MAX_SCAN_HISTORY);
      }

      return result;

    } catch (error) {
      if (error instanceof ModuleError) throw error;

      throw new ModuleError(
        'Security analysis failed',
        error,
        {
          code: 'SECURITY_ANALYSIS_FAILED',
          userId,
          codeLength: code?.length || 0
        }
      );
    }
  }

  async detectVulnerabilities(code) {
    const vulnerabilities = [];

    // Safe regex
    const matches = await RegexUtils.safeMatchAll(code, /pattern/g);

    for (const match of matches) {
      vulnerabilities.push({
        // Sanitize - prevent secret leakage!
        code: HtmlSanitizer.sanitizeCode(match[0], 100),
        severity: SEVERITY_LEVELS.HIGH
      });
    }

    return vulnerabilities;
  }

  calculateScore(vulnerabilities) {
    let score = 100;

    for (const vuln of vulnerabilities) {
      if (vuln.severity === SEVERITY_LEVELS.CRITICAL) score -= 25;
      else if (vuln.severity === SEVERITY_LEVELS.HIGH) score -= 15;
      else if (vuln.severity === SEVERITY_LEVELS.MEDIUM) score -= 8;
    }

    return Math.max(0, score);
  }
}

export default SecurityAnalyzer.getInstance();
export { SecurityAnalyzer };
```

---

## 📊 Resumo das Melhorias

| Aspecto | ANTES | DEPOIS | Melhoria |
|---------|-------|--------|----------|
| **Input Validation** | ❌ Nenhuma | ✅ Completa | Previne crashes |
| **Singleton Pattern** | ⚠️ Race condition | ✅ Thread-safe | Corrige bug |
| **Rate Limiting** | ❌ Nenhum | ✅ 10 req/min | Previne DoS |
| **ReDoS Protection** | ❌ Vulnerável | ✅ Timeout 1s | Previne hang |
| **Error Handling** | ⚠️ Básico | ✅ Enterprise | Stack trace preservado |
| **Memory Leaks** | ⚠️ 3 locais | ✅ Corrigido | Previne crash |
| **Performance** | ⚠️ O(n²) | ✅ O(n) | 100x mais rápido |
| **Magic Numbers** | ⚠️ Muitos | ✅ Zero | Maintainability |
| **Caching** | ❌ Nenhum | ✅ LRU+TTL | Performance |
| **HTML Sanitization** | ❌ XSS vuln | ✅ Sanitizado | Segurança |

---

## 🚀 Próximos Passos

1. ✅ **code-rating-system.js** - COMPLETO
2. ⏳ **security-analyzer.js** - Aplicar padrão acima
3. ⏳ **performance-advisor.js** - Aplicar padrão acima
4. ⏳ **test-generator.js** - Aplicar padrão acima
5. ⏳ **adaptive-learning-engine.js** - Aplicar padrão acima
6. ⏳ **gamification-system.js** - Aplicar padrão acima
7. ⏳ **devmentor-orchestrator.js** - Aplicar padrão acima + PromiseUtils

---

## 🧪 Testing Checklist

Após refatorar cada módulo, testar:

```javascript
// 1. Input validation
✅ Deve lançar TypeError para código não-string
✅ Deve lançar Error para código vazio
✅ Deve lançar Error para código muito grande (DoS)

// 2. Rate limiting
✅ Deve permitir 10 requests
✅ Deve bloquear 11ª request
✅ Deve resetar após 1 minuto

// 3. Caching
✅ Deve retornar resultado cacheado na 2ª chamada
✅ Cache deve expirar após TTL
✅ Cache deve respeitar max size (LRU)

// 4. Error handling
✅ Deve preservar stack trace original
✅ Deve incluir contexto útil
✅ Deve logar para telemetria

// 5. Memory leaks
✅ History array não deve crescer infinitamente
✅ Rate limiter deve fazer cleanup
✅ Cache deve respeitar max size

// 6. ReDoS
✅ Regex não deve travar com input malicioso
✅ Deve timeout após 1 segundo
✅ Deve retornar erro útil
```

---

## 📝 Notas Finais

- **SEMPRE** use os utilitários de `core-utils.js`
- **NUNCA** faça validação manual - use `InputValidator`
- **SEMPRE** use `RegexUtils` para regex complexas
- **SEMPRE** sanitize HTML/Markdown antes de exportar
- **SEMPRE** limite arrays históricos
- **SEMPRE** use `ModuleError` para exceções

**Resultado esperado**: Código production-ready, seguro, performático e maintainável! 🎉
