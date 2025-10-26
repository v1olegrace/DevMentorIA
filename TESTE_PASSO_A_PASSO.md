# 🧪 DevMentor AI - Teste Passo a Passo

## 📋 GUIA COMPLETO DE TESTES

---

## PASSO 1: Preparação Inicial

### 1.1 Verificar Chrome Built-in AI

```bash
# 1. Abrir Chrome
# 2. Ir para chrome://flags
# 3. Buscar e habilitar:
```

**Flags necessários:**
- `#optimization-guide-on-device-model` → **Enabled**
- `#prompt-api-for-gemini-nano` → **Enabled**
- `#summarization-api-for-gemini-nano` → **Enabled**
- `#writer-rewriter-api-for-gemini-nano` → **Enabled**

```bash
# 4. Clicar em "Relaunch" no Chrome
# 5. Aguardar 5-10 minutos para download do modelo Gemini Nano
```

### 1.2 Verificar Download do Modelo

```bash
# 1. Ir para chrome://components
# 2. Buscar por "Optimization Guide On Device Model"
# 3. Status deve mostrar: "Up to date" ou versão específica
```

### 1.3 Testar API no Console

```javascript
// Abrir DevTools (F12) em qualquer aba
// Executar no console:

// Teste 1: Verificar se window.ai existe
console.log('window.ai exists:', typeof window.ai !== 'undefined');

// Teste 2: Verificar Prompt API
const testPromptAPI = async () => {
  try {
    const capabilities = await window.ai.languageModel.capabilities();
    console.log('Prompt API available:', capabilities.available);

    if (capabilities.available === 'readily') {
      const session = await window.ai.languageModel.create();
      const result = await session.prompt('Say hello!');
      console.log('Prompt API test:', result);
      session.destroy();
      return true;
    }
  } catch (e) {
    console.error('Prompt API error:', e);
    return false;
  }
};

await testPromptAPI();
```

**Resultado esperado:**
```
window.ai exists: true
Prompt API available: readily
Prompt API test: Hello! How can I help you today?
```

---

## PASSO 2: Carregar a Extensão

### 2.1 Preparar arquivos

```bash
# 1. Verificar se dist-frontend/ existe
# Se não existir, executar:
cd d:\DevMentorIA\devmentor-ai\frontend-custom
npm run build

# 2. Verificar arquivos principais
# Devem existir:
# - manifest.json
# - popup.html
# - background/sw-loader-hybrid.js
# - content/content-script.js
```

### 2.2 Carregar no Chrome

```bash
# 1. Abrir chrome://extensions/
# 2. Ativar "Developer mode" (canto superior direito)
# 3. Clicar em "Load unpacked"
# 4. Selecionar pasta: d:\DevMentorIA\devmentor-ai
# 5. Verificar se aparece sem erros
```

**Verificações:**
- ✅ Ícone da extensão aparece na toolbar
- ✅ Não há erros em vermelho no card da extensão
- ✅ Status mostra "Enabled"

### 2.3 Verificar Service Worker

```bash
# 1. Em chrome://extensions/
# 2. Encontrar "DevMentor AI"
# 3. Clicar em "service worker" (link azul)
# 4. Abre DevTools do service worker
```

**Console do Service Worker deve mostrar:**
```
[SwCore] Service Worker loading...
[SwCore] Modules loading...
[HybridArchitecture] Initializing...
[ChromeBuiltInAI] ✅ All APIs initialized successfully
[SwCore] ✅ Service Worker ready
```

**Se houver erros:**
```bash
# Recarregar extensão:
# 1. Clicar no ícone de reload (🔄) na extensão
# 2. Verificar console novamente
```

---

## PASSO 3: Testar Interface do Popup

### 3.1 Abrir Popup

```bash
# 1. Clicar no ícone da extensão na toolbar
# 2. Popup deve abrir
```

**O que deve aparecer:**
```
┌─────────────────────────────────────┐
│  🌟 DevMentor AI            ⚙️      │
├─────────────────────────────────────┤
│  🔍 Faça sua pergunta...            │  ← BARRA DE PESQUISA
├─────────────────────────────────────┤
│  🟢 IA Pronta                       │  ← STATUS (verde = pronto)
├─────────────────────────────────────┤
│  Escolha o tipo de análise:         │
│                                     │
│  [🔍 Explicar]                      │
│  [🐛 Bugs    ]                      │
│  [📄 Docs    ]                      │
│  [⚡ Otimizar]                      │
│  [✅ Revisar ]                      │
├─────────────────────────────────────┤
│  [✨ Analisar Código Selecionado]  │
│                                     │
│  [📜 Histórico] [📊 Analytics]     │
└─────────────────────────────────────┘
```

### 3.2 Verificar Elementos

**Checklist visual:**
- [ ] Barra de pesquisa está visível no topo
- [ ] Placeholder diz "Faça sua pergunta..."
- [ ] Badge de status mostra "IA Pronta" (verde)
- [ ] 5 botões de função estão visíveis
- [ ] Botão "Analisar Código Selecionado" está visível
- [ ] Botões "Histórico" e "Analytics" estão visíveis

### 3.3 Abrir DevTools do Popup

```bash
# 1. Com popup aberto
# 2. Clicar direito no popup
# 3. "Inspecionar" ou "Inspect"
# 4. DevTools do popup abre
```

**Console deve estar limpo (sem erros vermelhos)**

---

## PASSO 4: Testar Função EXPLICAR 🔍

### 4.1 Preparar Página de Teste

```bash
# 1. Ir para: https://github.com/
# 2. Ou abrir arquivo HTML local com código
```

**Criar página de teste (opcional):**
```html
<!DOCTYPE html>
<html>
<head><title>Teste DevMentor AI</title></head>
<body>
<h1>Código para Testar</h1>
<pre><code>
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(10));
</code></pre>
</body>
</html>
```

### 4.2 Executar Teste EXPLICAR

```bash
# PASSO 1: Selecionar código
# - Selecionar o código fibonacci na página

# PASSO 2: Abrir popup
# - Clicar no ícone da extensão

# PASSO 3: Configurar
# - Garantir que "Explicar" está selecionado (azul)
# - (Opcional) Digitar na barra: "Como funciona a recursão?"

# PASSO 4: Analisar
# - Clicar em "Analisar Código Selecionado"

# PASSO 5: Aguardar
# - Popup deve fechar automaticamente
# - Aguardar 1-3 segundos
```

### 4.3 Verificar Resultado

**O que deve acontecer:**

1. **Toast de sucesso** aparece (canto da tela):
   ```
   ✅ Análise concluída! Verifique o resultado na página.
   ```

2. **Tooltip aparece na página** com explicação:
   ```
   ┌─────────────────────────────────────────┐
   │ 🔍 Explicação do Código                 │
   ├─────────────────────────────────────────┤
   │ 📊 Análise (Chrome Built-in AI)         │
   │                                         │
   │ 🎯 What & Why (Big Picture)            │
   │ Esta função implementa o algoritmo...   │
   │                                         │
   │ 🧠 Core Concepts                        │
   │ 1. Recursão - função que chama...      │
   │ ...                                     │
   │                                         │
   │ ⚡ 1234ms | Chrome Prompt API          │
   └─────────────────────────────────────────┘
   ```

### 4.4 Troubleshooting EXPLICAR

**Problema: "Nenhum código selecionado"**
```
Solução:
1. Verificar se o código está realmente selecionado
2. Tentar selecionar novamente
3. Verificar se está em site permitido (manifest.json)
```

**Problema: "IA Indisponível"**
```
Solução:
1. Verificar chrome://flags
2. Aguardar download do modelo (chrome://components)
3. Recarregar extensão
4. Reiniciar Chrome
```

**Problema: Nenhum resultado aparece**
```
Solução:
1. Abrir DevTools (F12) na página
2. Ver console para erros
3. Verificar network tab para requisições
4. Abrir service worker console
```

---

## PASSO 5: Testar Função BUGS 🐛

### 5.1 Preparar Código com Bug

```javascript
// Código de teste (tem vários bugs):
function divide(a, b) {
  return a / b;
}

function processArray(arr) {
  for (var i = 0; i < arr.length; i++) {
    console.log(arr[i]);
  }
}

var result = divide(10, 0);
processArray(null);
```

### 5.2 Executar Teste BUGS

```bash
# 1. Selecionar o código bugado
# 2. Abrir popup
# 3. Clicar em "Bugs" (botão vermelho)
# 4. (Opcional) Digitar: "Verificar divisão por zero"
# 5. Clicar "Analisar Código Selecionado"
```

### 5.3 Verificar Resultado

**Resultado esperado:**
```
🐛 Análise de Bugs

📍 Issue #1: Missing Zero Division Check
- Type: Logic Error / Edge Case
- Severity: CRITICAL
- Location: Line 2
- Problem: Division without zero check
- Impact: Returns Infinity/NaN
- Fix: Add if (b === 0) check
- Explanation: Prevents runtime errors

📍 Issue #2: No Null Check on Array
- Type: Edge Case
- Severity: CRITICAL
- Location: Line 6
- Problem: No validation for null/undefined
- Impact: Will crash with "Cannot read length of null"
- Fix: Add if (!arr) check

📍 Issue #3: Using 'var' instead of 'const/let'
- Type: Best Practice
- Severity: LOW
- Location: Line 11
- Problem: Using outdated var declaration
- Fix: Use const or let

Summary:
- Total issues: 3
- Critical: 2
- Priority fixes: Zero check, null check
```

---

## PASSO 6: Testar Função DOCS 📄

### 6.1 Preparar Código sem Documentação

```javascript
// Código sem docs:
function calculateTax(income, rate, deductions) {
  const taxableIncome = income - deductions;
  return taxableIncome * rate;
}
```

### 6.2 Executar Teste DOCS

```bash
# 1. Selecionar código
# 2. Abrir popup
# 3. Clicar em "Docs" (botão verde)
# 4. (Opcional) Digitar: "Estilo JSDoc completo"
# 5. Clicar "Analisar"
```

### 6.3 Verificar Resultado

**Resultado esperado:**
```javascript
/**
 * Calculates tax based on income, rate and deductions.
 *
 * This function computes the total tax owed by first subtracting
 * deductions from gross income to get taxable income, then
 * multiplying by the tax rate.
 *
 * @param {number} income - Gross income before deductions (>= 0)
 * @param {number} rate - Tax rate as decimal (0-1, e.g. 0.25 for 25%)
 * @param {number} deductions - Total deductions (>= 0)
 * @returns {number} Calculated tax amount
 *
 * @throws {TypeError} If parameters are not numbers
 * @throws {RangeError} If values are negative or rate > 1
 *
 * @example
 * // Calculate tax for $50k income with 25% rate
 * const tax = calculateTax(50000, 0.25, 10000);
 * console.log(tax); // 10000
 *
 * @example
 * // Edge case: deductions exceed income
 * const noTax = calculateTax(30000, 0.25, 35000);
 * console.log(noTax); // -1250
 *
 * @note Simplified calculation - real tax uses brackets
 * @note Performance: O(1) constant time
 *
 * @see calculateProgressiveTax
 */
```

---

## PASSO 7: Testar Função OTIMIZAR ⚡

### 7.1 Preparar Código Antigo

```javascript
// Código desatualizado:
var numbers = [1, 2, 3, 4, 5];
var doubled = [];
for (var i = 0; i < numbers.length; i++) {
  doubled.push(numbers[i] * 2);
}
console.log(doubled);
```

### 7.2 Executar Teste OTIMIZAR

```bash
# 1. Selecionar código
# 2. Abrir popup
# 3. Clicar em "Otimizar" (botão amarelo)
# 4. (Opcional) Digitar: "Modernizar para ES6+"
# 5. Clicar "Analisar"
```

### 7.3 Verificar Resultado

**Resultado esperado:**
```javascript
// ✅ REFACTORED CODE
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(num => num * 2);
console.log(doubled);

// 📊 IMPROVEMENTS APPLIED:
// 1. var → const (immutability)
// 2. for loop → map() (functional approach)
// 3. Modern ES6+ arrow function syntax

// ⚡ PERFORMANCE GAINS:
// - Native map() optimization
// - Cleaner, more readable code
// - O(n) complexity maintained

// 💡 EXPLANATION:
// Array.map() is the modern, functional way to transform arrays.
// It's more declarative (what vs how) and easier to maintain.
```

---

## PASSO 8: Testar Função REVISAR ✅

### 8.1 Preparar Código Completo

```javascript
// Código para revisar:
class UserManager {
  constructor() {
    this.users = [];
  }

  addUser(name, email) {
    this.users.push({ name, email });
  }

  findUser(email) {
    return this.users.find(u => u.email === email);
  }
}
```

### 8.2 Executar Teste REVISAR

```bash
# 1. Selecionar código
# 2. Abrir popup
# 3. Clicar em "Revisar" (botão roxo)
# 4. (Opcional) Digitar: "Review completo"
# 5. Clicar "Analisar"
```

### 8.3 Verificar Resultado

**Resultado esperado:**
```
✅ CODE REVIEW

📊 Overall Score: 6/10

1. Code Quality: 7/10
   ✅ Strengths:
   - Clean class structure
   - Use of ES6 features
   - Descriptive method names

   ⚠️ Weaknesses:
   - No input validation
   - No error handling
   - Direct array mutation

2. Best Practices: 5/10
   ⚠️ Issues:
   - No data validation
   - Missing JSDoc
   - No duplicate email check

3. Potential Issues:
   - Can add duplicate emails
   - No validation for empty strings
   - Direct array access (encapsulation)

4. Performance: 8/10
   ✅ Good:
   - find() is efficient for small arrays
   ⚠️ Could improve:
   - Use Map for O(1) lookups

5. Maintainability: 6/10
   - Add input validation
   - Add error handling
   - Add documentation

Suggestions:
1. Add email validation
2. Prevent duplicate emails
3. Add JSDoc comments
4. Consider using Map instead of array
```

---

## PASSO 9: Testar Barra de Pesquisa

### 9.1 Teste com Pergunta Específica

```bash
# 1. Selecionar código (fibonacci)
# 2. Abrir popup
# 3. Clicar em "Explicar"
# 4. Digitar na barra: "Por que recursão é lenta aqui?"
# 5. Clicar "Analisar"
```

**Resultado deve mencionar:**
- Complexidade exponencial O(2^n)
- Recálculo de valores
- Sugestão de memoization

### 9.2 Teste Enter na Barra

```bash
# 1. Selecionar código
# 2. Abrir popup
# 3. Clicar na barra de pesquisa
# 4. Digitar pergunta
# 5. Pressionar ENTER (não clicar no botão)
```

**Deve funcionar igual ao clicar no botão**

---

## PASSO 10: Verificação Final

### 10.1 Checklist Completo

**Funcionalidades:**
- [ ] Barra de pesquisa aparece
- [ ] Status badge mostra "IA Pronta"
- [ ] Função EXPLICAR funciona
- [ ] Função BUGS funciona
- [ ] Função DOCS funciona
- [ ] Função OTIMIZAR funciona
- [ ] Função REVISAR funciona
- [ ] Enter na barra de pesquisa funciona
- [ ] Toast notifications aparecem
- [ ] Tooltips aparecem na página
- [ ] Sem erros no console

**Performance:**
- [ ] Respostas em < 3 segundos
- [ ] Popup abre rapidamente
- [ ] Sem travamentos
- [ ] Memória não aumenta muito

**Qualidade:**
- [ ] Respostas são educacionais
- [ ] Formato estruturado
- [ ] Linguagem detectada corretamente
- [ ] Prompts contextuais funcionam

---

## 📊 RESULTADO ESPERADO

Se tudo estiver funcionando:

✅ **5/5 funções** operacionais
✅ **Barra de pesquisa** funcionando
✅ **Chrome Built-in AI** integrado
✅ **Sem erros** no console
✅ **Performance** aceitável (< 3s)
✅ **UI** responsiva e bonita

---

## 🐛 TROUBLESHOOTING GERAL

### Erro Comum 1: "Cannot read property 'prompt' of undefined"

**Causa:** Chrome Built-in AI não disponível

**Solução:**
```bash
1. Verificar chrome://flags
2. Verificar chrome://components (modelo baixado?)
3. Aguardar 10 minutos após habilitar flags
4. Reiniciar Chrome
```

### Erro Comum 2: "Service Worker registration failed"

**Causa:** Erro no service worker

**Solução:**
```bash
1. Abrir chrome://extensions/
2. Verificar erros na extensão
3. Clicar em "service worker" link
4. Ver console para erro específico
5. Recarregar extensão
```

### Erro Comum 3: Content Script não injeta

**Causa:** Permissões ou site não permitido

**Solução:**
```bash
1. Verificar manifest.json - host_permissions
2. Adicionar site atual se necessário
3. Recarregar extensão
4. Recarregar página
```

### Erro Comum 4: Popup não abre

**Causa:** Build do frontend desatualizado

**Solução:**
```bash
cd d:\DevMentorIA\devmentor-ai\frontend-custom
npm run build
# Recarregar extensão
```

---

## 📝 LOG DE TESTES

Use esta tabela para marcar os testes:

| Teste | Status | Tempo | Notas |
|-------|--------|-------|-------|
| Chrome AI habilitado | ⬜ | | |
| Extensão carregada | ⬜ | | |
| Popup abre | ⬜ | | |
| Barra de pesquisa | ⬜ | | |
| EXPLICAR | ⬜ | | |
| BUGS | ⬜ | | |
| DOCS | ⬜ | | |
| OTIMIZAR | ⬜ | | |
| REVISAR | ⬜ | | |
| Enter funciona | ⬜ | | |

Legenda:
- ⬜ Não testado
- ✅ Passou
- ❌ Falhou
- ⚠️ Parcial

---

**Boa sorte nos testes! 🚀**
