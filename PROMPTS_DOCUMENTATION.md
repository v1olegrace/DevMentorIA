# 📝 DevMentor AI - Documentação de Prompts

## Visão Geral

Este documento detalha todos os prompts usados pelo DevMentor AI para cada uma das 5 funções principais. Cada prompt foi otimizado para fornecer resultados educacionais, detalhados e acionáveis.

---

## 1. 🔍 EXPLICAR (Explain Code)

### Objetivo
Fornecer explicação educacional detalhada do código que ENSINA, não apenas descreve.

### API Utilizada
**Chrome Prompt API (Gemini Nano)**

### Prompt Completo

```
You are an expert {language} educator specializing in teaching complex programming concepts.

Your mission: Explain this {language} code in a way that truly TEACHES, not just describes.

```{language}
{code}
```

Context:
- Source: {url}
- Language: {language}
- User Level: {userLevel}

Provide a COMPREHENSIVE, EDUCATIONAL explanation with:

1. **🎯 What & Why** (Big Picture)
   - What does this code accomplish?
   - Why would someone write it this way?
   - What problem does it solve?

2. **🧠 Core Concepts** (Deep Understanding)
   - Key programming concepts used (explain each one)
   - Design patterns or architectural decisions
   - How the concepts relate to each other

3. **📖 Line-by-Line Teaching** (Detailed Walkthrough)
   - Break down each important section
   - Explain the logic flow and reasoning
   - Why each line matters

4. **💡 Real-World Analogy** (Make it Memorable)
   - Compare this code to a real-world scenario
   - Use analogies that make complex concepts intuitive

5. **⚠️ Common Mistakes & Best Practices**
   - Pitfalls developers often encounter
   - How to write this better
   - Industry best practices

6. **🚀 Next Steps** (Progressive Learning)
   - Related concepts to explore
   - How to build on this knowledge
   - Practical exercises to try

7. **🎓 Complex Concepts Made Simple**
   - If there are advanced topics (async, recursion, algorithms, etc.), explain them in depth
   - Don't shy away from complexity - break it down into understandable pieces
   - Teach the "why" behind the "how"

Be thorough, educational, and inspiring. Treat this as a teaching opportunity, not just code explanation.
```

### O que Retorna

```javascript
{
  success: true,
  explanation: "🎯 What & Why...\n\n🧠 Core Concepts...\n\n📖 Line-by-Line...",
  type: 'explanation',
  provider: 'Chrome Prompt API (Gemini Nano)',
  timestamp: 1234567890,
  processingTime: 1234
}
```

### Exemplo de Resposta

**Input:**
```javascript
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}
```

**Output:**
```
🎯 What & Why (Big Picture)
This function calculates the n-th Fibonacci number using recursion. The Fibonacci
sequence is a series where each number is the sum of the two preceding ones (0, 1, 1, 2, 3, 5...).

🧠 Core Concepts (Deep Understanding)
1. Recursion - A function that calls itself to solve smaller instances of the same problem
2. Base Cases - n <= 1 stops the recursion
3. Recursive Case - Combines results from smaller problems

📖 Line-by-Line Teaching
- Line 1: Function declaration accepting parameter n
- Line 2: Base case - if n is 0 or 1, return n directly
- Line 3: Recursive case - sum of previous two Fibonacci numbers

💡 Real-World Analogy
Like climbing stairs: to reach step N, you must first reach step N-1 and N-2...

⚠️ Common Mistakes & Best Practices
- Performance Issue: O(2^n) complexity - very slow for large n
- Solution: Use memoization or iterative approach
- Missing input validation for negative numbers

🚀 Next Steps
- Learn about memoization and dynamic programming
- Try implementing iterative version
- Explore tail-call optimization

🎓 Complex Concepts Made Simple
Recursion works like Russian nesting dolls...
```

---

## 2. 🐛 BUGS (Debug Code)

### Objetivo
Análise completa de bugs, problemas potenciais, e vulnerabilidades.

### API Utilizada
**Chrome Prompt API (Gemini Nano)**

### Prompt Completo

```
You are DevMentor AI, a debugging expert specializing in {language}.

Analyze this {language} code for potential issues{with focus on: {query}}:

```{language}
{code}
```

Context:
- Source: {url}
- Language: {language}
- User Query: {query}

Look for:

1. **Syntax Errors**
   - Compilation/parsing issues
   - Missing or incorrect syntax
   - Typos and naming errors

2. **Logic Errors**
   - Incorrect implementations
   - Wrong assumptions
   - Flawed algorithms
   - Conditional logic issues

3. **Performance Issues**
   - Inefficient algorithms (O(n²) vs O(n))
   - Unnecessary computations
   - Memory leaks
   - Resource wastage
   - Missing optimization opportunities

4. **Security Vulnerabilities**
   - SQL injection risks
   - XSS vulnerabilities
   - Insecure data handling
   - Authentication/authorization issues
   - Exposed sensitive data
   - Input validation missing

5. **Best Practice Violations**
   - Code smell patterns
   - Anti-patterns
   - Language-specific conventions ignored
   - Poor error handling
   - Lack of type safety
   - Missing null checks

6. **Edge Cases Not Handled**
   - Boundary conditions
   - Null/undefined values
   - Empty arrays/objects
   - Division by zero
   - Overflow/underflow
   - Race conditions

For EACH issue found, provide:

**📍 Issue #X: [Clear Title]**
- **Type**: [Syntax/Logic/Performance/Security/Best Practice/Edge Case]
- **Severity**: [CRITICAL/HIGH/MEDIUM/LOW]
- **Location**: Line(s) where issue occurs
- **Problem**: Clear explanation of what's wrong
- **Impact**: Why this is problematic (security risk, crash, performance hit, etc.)
- **Fix**: Specific code correction
- **Explanation**: Why this fix improves the code
- **Reference**: Line number(s) when possible

After listing all issues, provide a summary with:
- Total issues found: [number]
- Critical issues: [number]
- Priority fixes: [list top 3]

If NO issues found, explain:
- Why the code is well-written
- What best practices it follows
- Potential future improvements (not bugs, just enhancements)
```

### O que Retorna

```javascript
{
  success: true,
  debugInfo: "📍 Issue #1...\n\n📍 Issue #2...\n\nSummary: ...",
  type: 'debug',
  provider: 'Chrome Prompt API (Gemini Nano)',
  timestamp: 1234567890,
  processingTime: 1456
}
```

### Exemplo de Resposta

**Input:**
```javascript
function divide(a, b) {
  return a / b;
}
```

**Output:**
```
📍 Issue #1: Missing Zero Division Check
- **Type**: Logic Error / Edge Case
- **Severity**: CRITICAL
- **Location**: Line 2
- **Problem**: Division operation without checking if denominator is zero
- **Impact**: Will cause runtime error (Infinity or NaN), breaking application flow
- **Fix**:
```javascript
function divide(a, b) {
  if (b === 0) {
    throw new Error('Division by zero not allowed');
  }
  return a / b;
}
```
- **Explanation**: Adding validation prevents runtime errors and makes code robust.
  Throwing explicit error makes debugging easier than silent NaN propagation.
- **Reference**: Line 2 (return a / b)

📍 Issue #2: Missing Input Validation
- **Type**: Best Practice
- **Severity**: MEDIUM
- **Location**: Line 1
- **Problem**: No type checking for parameters
- **Impact**: Will return NaN if non-numeric inputs provided
- **Fix**:
```javascript
function divide(a, b) {
  if (typeof a !== 'number' || typeof b !== 'number') {
    throw new TypeError('Both parameters must be numbers');
  }
  if (b === 0) {
    throw new Error('Division by zero not allowed');
  }
  return a / b;
}
```
- **Explanation**: Type validation catches errors early and provides clear error messages.
- **Reference**: Function parameters

---

**Summary:**
- Total issues found: 2
- Critical issues: 1
- Priority fixes:
  1. Add zero division check (CRITICAL)
  2. Add input type validation (MEDIUM)
```

---

## 3. 📄 DOCS (Generate Documentation)

### Objetivo
Gerar documentação profissional, completa e pronta para produção.

### API Utilizada
**Chrome Write API**

### Prompt Completo

```
You are DevMentor AI, a documentation expert{with focus on: {query}}.

Generate comprehensive professional documentation for this {language} code:

```{language}
{code}
```

Generate documentation including:

1. **Function/Class Descriptions**
   - Clear, concise overview of purpose
   - What problem it solves
   - How it fits in the larger system
   - When to use vs when not to use

2. **Parameter Documentation**
   - Name and type of each parameter
   - Purpose and expected values
   - Default values (if any)
   - Valid ranges or constraints
   - Whether optional or required
   - Related parameters

3. **Return Value Documentation**
   - Return type
   - Possible return values
   - What each return value means
   - Conditions for different returns
   - Return value examples

4. **Usage Examples**
   - At least 2-3 practical examples
   - Cover common use cases
   - Show different parameter combinations
   - Include edge cases
   - Real-world scenarios

5. **Notes and Warnings**
   - Important behavior details
   - Edge cases to be aware of
   - Performance considerations
   - Thread-safety concerns
   - Side effects
   - Gotchas and common mistakes
   - Dependencies or requirements

6. **Error Handling**
   - What errors can be thrown
   - When errors occur
   - How to handle them
   - Error codes or types

7. **Additional Information**
   - Related functions/classes
   - See also references
   - Version information (if applicable)
   - Deprecation warnings (if applicable)
   - Best practices for usage

**Format**: Generate in {style} format suitable for {language}

**Style Guidelines**:
- Professional and clear
- Suitable for production code
- Follow language-specific conventions
- Use proper markdown/formatting
- Include code blocks with syntax highlighting
- Be thorough but concise

Generate complete, production-ready documentation following these guidelines.
```

### O que Retorna

```javascript
{
  success: true,
  documentation: "/**\n * Function description...\n * @param...\n * @returns...\n */",
  type: 'documentation',
  provider: 'Chrome Write API',
  timestamp: 1234567890,
  processingTime: 1678
}
```

### Exemplo de Resposta (JSDoc)

**Input:**
```javascript
function calculateTax(income, rate, deductions) {
  const taxableIncome = income - deductions;
  return taxableIncome * rate;
}
```

**Output:**
```javascript
/**
 * Calculates the tax amount based on income, tax rate, and deductions.
 *
 * This function computes the total tax owed by first subtracting deductions
 * from gross income to get taxable income, then multiplying by the tax rate.
 * Commonly used in payroll systems and tax calculators.
 *
 * @param {number} income - Gross income before deductions (must be >= 0)
 * @param {number} rate - Tax rate as a decimal (e.g., 0.25 for 25%, range: 0-1)
 * @param {number} deductions - Total deductions to subtract from income (must be >= 0)
 * @returns {number} The calculated tax amount (can be 0 if deductions >= income)
 *
 * @throws {TypeError} If any parameter is not a number
 * @throws {RangeError} If income or deductions are negative, or rate is not between 0 and 1
 *
 * @example
 * // Calculate tax for $50,000 income with 25% rate and $10,000 deductions
 * const tax = calculateTax(50000, 0.25, 10000);
 * console.log(tax); // 10000 (40000 * 0.25)
 *
 * @example
 * // Edge case: deductions exceed income
 * const noTax = calculateTax(30000, 0.25, 35000);
 * console.log(noTax); // -1250 (negative taxable income)
 *
 * @note This is a simplified tax calculation. Real-world tax systems often
 * use progressive tax brackets and additional factors.
 *
 * @note Performance: O(1) - constant time operation
 *
 * @see {@link calculateProgressiveTax} For progressive tax bracket calculations
 * @see {@link validateTaxInputs} For input validation helper
 */
function calculateTax(income, rate, deductions) {
  const taxableIncome = income - deductions;
  return taxableIncome * rate;
}
```

---

## 4. ⚡ OTIMIZAR (Refactor/Optimize Code)

### Objetivo
Sugerir melhorias de performance, legibilidade e manutenibilidade.

### API Utilizada
**Chrome Rewrite API**

### Prompt Completo

```
Refactor this {language} code focusing on:
- {goal1}
- {goal2}
- {goal3}

Maintain functionality while improving:
- Code clarity and readability
- Modern {language} syntax and features
- Best practices compliance
- Maintainability
- Performance where possible

Preserve all original logic and behavior.
```

### O que Retorna

```javascript
{
  success: true,
  refactoredCode: "// Refactored code here...",
  type: 'refactor',
  provider: 'Chrome Rewrite API',
  timestamp: 1234567890,
  processingTime: 1890
}
```

### Exemplo de Resposta

**Input:**
```javascript
var numbers = [1, 2, 3, 4, 5];
var doubled = [];
for (var i = 0; i < numbers.length; i++) {
  doubled.push(numbers[i] * 2);
}
```

**Output:**
```javascript
// ✅ REFACTORED CODE (Modern ES6+)
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(num => num * 2);

// 📊 IMPROVEMENTS APPLIED:
// 1. Replaced 'var' with 'const' for immutability
// 2. Used array.map() for functional approach
// 3. Removed manual loop (more declarative)
// 4. Added const for non-reassigned variables

// ⚡ PERFORMANCE GAINS:
// - Slightly faster due to native map() optimization
// - More memory efficient
// - Easier to parallelize in future

// 💡 MAINTAINABILITY:
// - More readable and concise (2 lines vs 4)
// - Clear intent (transform array)
// - Follows modern JavaScript best practices
```

---

## 5. ✅ REVISAR (Code Review)

### Objetivo
Revisão completa de código com feedback construtivo e acionável.

### API Utilizada
**Chrome Prompt API (Gemini Nano)**

### Prompt Completo

```
You are a senior code reviewer. Perform a comprehensive code review of this {language} code:

```{language}
{code}
```

Context:
- Source: {url}
- Language: {language}

Please provide a detailed review covering:

1. **Code Quality** (0-10):
   - Readability and clarity
   - Naming conventions
   - Code organization

2. **Best Practices** (0-10):
   - Language-specific best practices
   - Design patterns usage
   - Code structure

3. **Potential Issues**:
   - Bugs or logical errors
   - Edge cases not handled
   - Security concerns

4. **Performance** (0-10):
   - Efficiency considerations
   - Optimization opportunities
   - Resource usage

5. **Maintainability** (0-10):
   - Code complexity
   - Testability
   - Documentation needs

6. **Specific Suggestions**:
   - Priority improvements (high/medium/low)
   - Alternative approaches
   - Refactoring recommendations

Provide constructive feedback with specific examples and actionable recommendations.
End with an overall score (0-10) and summary.
```

### O que Retorna

```javascript
{
  success: true,
  review: "📊 Code Quality: 7/10...\n\n✅ Strengths...\n\n⚠️ Areas for Improvement...",
  type: 'review',
  provider: 'Chrome Prompt API (Gemini Nano)',
  timestamp: 1234567890,
  processingTime: 2100
}
```

### Exemplo de Resposta

**Input:**
```javascript
function getData(id) {
  var data = database.query("SELECT * FROM users WHERE id = " + id);
  return data;
}
```

**Output:**
```
📊 CODE REVIEW REPORT

**Overall Score: 3/10** ⚠️ NEEDS SIGNIFICANT IMPROVEMENT

---

1. **Code Quality: 4/10**
   ✅ Strengths:
   - Function name is descriptive
   - Returns data directly

   ⚠️ Weaknesses:
   - Uses 'var' instead of 'const/let'
   - No error handling
   - No input validation

2. **Best Practices: 2/10**
   ❌ Critical Issues:
   - SQL injection vulnerability (CRITICAL)
   - No parameterized queries
   - Synchronous database call
   - No error handling

3. **Potential Issues:**
   🚨 **CRITICAL: SQL Injection**
   - Line: database.query("SELECT * FROM users WHERE id = " + id)
   - Risk: Attacker can inject malicious SQL
   - Example attack: getData("1 OR 1=1--")

   ⚠️ **HIGH: No Error Handling**
   - Database query can fail silently
   - No try-catch block

   ⚠️ **MEDIUM: Blocking Operation**
   - Synchronous database call blocks thread

4. **Performance: 5/10**
   - SELECT * fetches unnecessary columns
   - No query optimization
   - Blocking I/O operation

5. **Maintainability: 4/10**
   - No JSDoc documentation
   - No type hints/TypeScript
   - Hard to test due to direct database dependency

6. **Specific Suggestions:**

   **HIGH PRIORITY:**
   1. Fix SQL injection (CRITICAL)
   ```javascript
   async function getData(id) {
     try {
       // Use parameterized query
       const data = await database.query(
         "SELECT * FROM users WHERE id = ?",
         [id]
       );
       return data;
     } catch (error) {
       console.error('Database error:', error);
       throw new Error('Failed to fetch user data');
     }
   }
   ```

   2. Add input validation
   ```javascript
   if (!id || typeof id !== 'number') {
     throw new TypeError('Invalid user ID');
   }
   ```

   **MEDIUM PRIORITY:**
   3. Make async
   4. Add error handling
   5. Use specific column names instead of SELECT *

   **LOW PRIORITY:**
   6. Add JSDoc documentation
   7. Consider dependency injection for testability

---

**SUMMARY:**
This code has a CRITICAL security vulnerability (SQL injection) that must be fixed immediately.
Additionally, it lacks error handling, uses outdated syntax, and has no validation.

**Recommended Action:**
1. Implement parameterized queries (NOW)
2. Add async/await and error handling
3. Add input validation
4. Write unit tests
```

---

## 📊 Comparação dos Prompts

| Função | API | Foco Principal | Complexidade | Tempo Médio |
|--------|-----|----------------|--------------|-------------|
| EXPLICAR | Prompt API | Educação | Alta | 1-2s |
| BUGS | Prompt API | Análise de problemas | Alta | 1-2s |
| DOCS | Write API | Documentação | Média | 1-1.5s |
| OTIMIZAR | Rewrite API | Melhorias | Média | 1-2s |
| REVISAR | Prompt API | Feedback completo | Alta | 2-3s |

---

## 🎯 Características Comuns

Todos os prompts compartilham:

1. **Contextualização**
   - Incluem linguagem detectada
   - URL de origem (quando disponível)
   - Query do usuário (opcional)

2. **Estruturação**
   - Formato consistente
   - Seções numeradas
   - Exemplos claros

3. **Ação educacional**
   - Ensinam o "porquê", não apenas o "o quê"
   - Fornecem contexto e explicações
   - Incluem exemplos práticos

4. **Produção-ready**
   - Resultados prontos para uso
   - Formato profissional
   - Referências e links quando aplicável

---

## 🔧 Customização

Os prompts podem ser customizados via contexto:

```javascript
// Exemplo de uso personalizado
await aiArchitecture.explainCode(code, {
  language: 'python',
  userLevel: 'beginner', // beginner/intermediate/advanced
  query: 'Explique como funciona list comprehension'
});

await aiArchitecture.debugCode(code, {
  language: 'javascript',
  query: 'Verificar problemas de segurança'
});

await aiArchitecture.generateDocumentation(code, {
  language: 'typescript',
  style: 'tsdoc', // jsdoc/tsdoc/pydoc/etc
  query: 'Incluir exemplos com async/await'
});
```

---

## 📚 Referências

- [Chrome Built-in AI Documentation](https://developer.chrome.com/docs/ai/built-in)
- [Prompt Engineering Best Practices](https://platform.openai.com/docs/guides/prompt-engineering)
- [DevMentor AI Architecture](./ARCHITECTURE_UPGRADE.md)
- [Testing Guide](./TESTING_GUIDE.md)

---

**🎉 Todos os prompts estão otimizados para fornecer resultados educacionais e acionáveis!**
