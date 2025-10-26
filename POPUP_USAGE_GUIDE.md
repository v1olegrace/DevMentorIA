# 🚀 DevMentor AI - Guia de Uso do Popup

## ✨ O que foi implementado

### 1. **Barra de Pesquisa** 🔍
- **Localização**: No topo do popup (substituindo o card "Inicializando")
- **Função**: Permite fazer perguntas específicas ou adicionar contexto à análise
- **Como usar**:
  - Digite sua pergunta (ex: "Como este código funciona?", "O que são closures?")
  - Pressione Enter ou clique no botão "Analisar"
  - A pergunta será enviada junto com o código para análise mais contextualizada

### 2. **5 Funções de Análise Conectadas ao Back-end**

#### 🔍 **EXPLICAR (Explain)**
- **Ação**: `explain-code`
- **O que faz**: Explicação educacional detalhada do código
- **Back-end**: Chrome Built-in AI (Prompt API)
- **Resultado**:
  - 🎯 What & Why (Big Picture)
  - 🧠 Core Concepts (Deep Understanding)
  - 📖 Line-by-Line Teaching
  - 💡 Real-World Analogy
  - ⚠️ Common Mistakes & Best Practices
  - 🚀 Next Steps
  - 🎓 Complex Concepts Made Simple

**Exemplo de uso**:
```
1. Selecione um código na página
2. Clique em "Explicar" no popup
3. (Opcional) Digite uma pergunta: "Por que usar const aqui?"
4. Clique em "Analisar Código Selecionado"
```

#### 🐛 **BUGS (Debug)**
- **Ação**: `debug-code`
- **O que faz**: Identifica bugs, erros potenciais e problemas de segurança
- **Back-end**: Chrome Built-in AI (Prompt API)
- **Resultado**:
  - Lista de bugs encontrados
  - Severidade (CRITICAL, WARNING, SUGGESTION)
  - Localização do problema
  - Sugestões de correção
  - Código refatorado

**Exemplo de uso**:
```
1. Selecione código com possíveis bugs
2. Clique em "Bugs" no popup
3. (Opcional) Digite: "Verificar divisão por zero"
4. Clique em "Analisar Código Selecionado"
```

#### 📄 **DOCS (Documentation)**
- **Ação**: `generate-documentation`
- **O que faz**: Gera documentação automática (JSDoc, docstrings, etc.)
- **Back-end**: Chrome Built-in AI (Write API)
- **Resultado**:
  - Documentação formatada no estilo da linguagem
  - Descrição de parâmetros
  - Tipos de retorno
  - Exemplos de uso
  - Anotações especiais (@param, @returns, etc.)

**Exemplo de uso**:
```
1. Selecione uma função sem documentação
2. Clique em "Docs" no popup
3. (Opcional) Digite: "Estilo JSDoc detalhado"
4. Clique em "Analisar Código Selecionado"
```

#### ⚡ **OTIMIZAR (Optimize/Refactor)**
- **Ação**: `refactor-code`
- **O que faz**: Sugere melhorias de performance e código
- **Back-end**: Chrome Built-in AI (Rewrite API)
- **Resultado**:
  - Código otimizado
  - Lista de melhorias aplicadas
  - Explicação das otimizações
  - Comparação antes/depois
  - Performance gains estimados

**Exemplo de uso**:
```
1. Selecione código para otimizar
2. Clique em "Otimizar" no popup
3. (Opcional) Digite: "Melhorar legibilidade e performance"
4. Clique em "Analisar Código Selecionado"
```

#### ✅ **REVISAR (Review)**
- **Ação**: `review-code`
- **O que faz**: Revisão completa de código com feedback
- **Back-end**: Chrome Built-in AI (Prompt API)
- **Resultado**:
  - Qualidade do código (score)
  - Melhores práticas
  - Problemas de segurança
  - Sugestões de melhoria
  - Feedback construtivo

**Exemplo de uso**:
```
1. Selecione código para revisar
2. Clique em "Revisar" no popup
3. (Opcional) Digite: "Revisar segurança e performance"
4. Clique em "Analisar Código Selecionado"
```

---

## 🎨 Interface do Popup

### Layout Atualizado:

```
┌─────────────────────────────────────┐
│  🌟 DevMentor AI            ⚙️      │
├─────────────────────────────────────┤
│  🔍 Faça sua pergunta...            │  <- NOVA BARRA DE PESQUISA
├─────────────────────────────────────┤
│  🟢 IA Pronta                       │  <- STATUS BADGE
├─────────────────────────────────────┤
│  Escolha o tipo de análise:         │
│                                     │
│  [🔍 Explicar]                      │  <- AZUL quando selecionado
│  [ 🐛 Bugs    ]                     │
│  [ 📄 Docs    ]                     │
│  [ ⚡ Otimizar]                     │
│  [ ✅ Revisar ]                     │
├─────────────────────────────────────┤
│  [✨ Analisar Código Selecionado]  │  <- BOTÃO PRINCIPAL
│                                     │
│  [📜 Histórico] [📊 Analytics]     │
├─────────────────────────────────────┤
│  Como usar:                         │
│  1. Selecione código na página     │
│  2. Escolha o tipo de análise      │
│  3. Clique em "Analisar"           │
│  4. Veja o resultado na sidebar    │
├─────────────────────────────────────┤
│  ⌨️ Ctrl+Shift+A para atalho       │
└─────────────────────────────────────┘
```

---

## 🔗 Fluxo de Funcionamento

### 1. **Usuário seleciona código na página**
```javascript
const code = "function hello() { console.log('world'); }";
```

### 2. **Usuário abre popup e escolhe função**
- Clica no ícone da extensão
- Seleciona tipo de análise (ex: "Explicar")
- (Opcional) Digita pergunta: "O que são funções?"

### 3. **Frontend → Content Script**
```javascript
// popup.tsx envia mensagem
chrome.tabs.sendMessage(tabId, {
  action: 'getSelectedCode'
});

// content-script.js responde
{
  success: true,
  code: "function hello() {...}",
  language: "javascript"
}
```

### 4. **Frontend → Service Worker (Back-end)**
```javascript
// popup.tsx envia para back-end
chrome.runtime.sendMessage({
  action: 'explain-code',
  code: selectedCode,
  context: {
    language: 'javascript',
    query: 'O que são funções?'
  }
});
```

### 5. **Service Worker processa com Chrome Built-in AI**
```javascript
// sw-loader-hybrid.js
const result = await this.aiArchitecture.explainCode(code, context);

// chrome-builtin-ai-integration.js
const session = await window.ai.languageModel.create();
const explanation = await session.prompt(educationalPrompt);
```

### 6. **Back-end → Frontend → Content Script → Página**
```javascript
// Resultado retorna para popup
{
  success: true,
  data: {
    core: {
      explanation: "🎯 What & Why...",
      provider: "Chrome Prompt API (Gemini Nano)",
      processingTime: 1234
    },
    tier: "free"
  }
}

// popup.tsx envia para content script exibir
chrome.tabs.sendMessage(tabId, {
  action: 'showResult',
  type: 'explain',
  data: result.data
});

// content-script.js exibe tooltip na página
```

---

## 📋 Como Testar

### Teste Rápido:

1. **Abra uma página com código** (GitHub, StackOverflow, etc.)

2. **Selecione algum código**:
```javascript
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}
```

3. **Abra o popup** (clique no ícone da extensão)

4. **Teste cada função**:

**Teste 1 - Explicar**:
- Selecione função "Explicar"
- Digite: "Como funciona a recursão?"
- Clique "Analisar"
- ✅ Deve aparecer tooltip com explicação detalhada

**Teste 2 - Bugs**:
- Selecione função "Bugs"
- Digite: "Verificar problemas de performance"
- Clique "Analisar"
- ✅ Deve identificar: problema de performance (exponencial), falta memoization

**Teste 3 - Docs**:
- Selecione função "Docs"
- Clique "Analisar"
- ✅ Deve gerar JSDoc completo

**Teste 4 - Otimizar**:
- Selecione função "Otimizar"
- Digite: "Melhorar performance"
- Clique "Analisar"
- ✅ Deve sugerir versão com memoization

**Teste 5 - Revisar**:
- Selecione função "Revisar"
- Clique "Analisar"
- ✅ Deve dar feedback completo sobre qualidade

---

## 🎯 Atalhos de Teclado

| Atalho | Função | Ação |
|--------|--------|------|
| `Ctrl+Shift+E` | Explicar | Explica código selecionado |
| `Ctrl+Shift+B` | Bugs | Analisa bugs |
| `Ctrl+Shift+G` | Docs | Gera documentação |
| `Ctrl+Shift+R` | Otimizar | Refatora código |
| `Ctrl+Shift+A` | Popup | Abre popup rápido |
| `Enter` (no input) | Analisar | Executa análise |

---

## 🐛 Troubleshooting

### Problema: "Nenhum código selecionado"
**Solução**: Certifique-se de ter selecionado texto na página antes de clicar em "Analisar"

### Problema: "IA Indisponível"
**Solução**:
1. Verifique se Chrome Built-in AI está habilitado (`chrome://flags`)
2. Aguarde download do modelo Gemini Nano (5-10 min)
3. Recarregue a extensão

### Problema: Análise demora muito
**Solução**:
- Códigos complexos podem levar até 2 segundos
- Verifique se o modelo está baixado (`chrome://components`)
- Tente código menor primeiro

### Problema: Popup não abre
**Solução**:
1. Verifique se a extensão está ativa em `chrome://extensions`
2. Recarregue a página onde está tentando usar
3. Verifique console para erros

---

## 📊 Formato das Respostas

### Resposta EXPLICAR:
```markdown
🎯 What & Why (Big Picture)
Esta função implementa o algoritmo de Fibonacci usando recursão...

🧠 Core Concepts (Deep Understanding)
1. Recursão - Função que chama a si mesma
2. Casos base - Condições de parada (n <= 1)
3. Chamadas recursivas - fibonacci(n-1) + fibonacci(n-2)

📖 Line-by-Line Teaching
- if (n <= 1) return n: Casos base para n=0 e n=1
- return fibonacci(n-1) + fibonacci(n-2): Soma dos dois anteriores

💡 Real-World Analogy
Como subir uma escada: para chegar ao degrau N, você precisa...

⚠️ Common Mistakes
- Problema de performance: O(2^n) - muito lento para n > 40
- Sem memoization - recalcula valores repetidamente

🚀 Next Steps
- Implementar com memoization
- Estudar programação dinâmica
- Comparar versão iterativa
```

### Resposta BUGS:
```markdown
🐛 Issues Found:

1. CRITICAL: Performance Issue
   Severity: High
   Line: return fibonacci(n-1) + fibonacci(n-2)
   Issue: Exponential time complexity O(2^n)
   Fix: Implementar memoization ou abordagem iterativa

2. WARNING: Stack Overflow Risk
   Severity: Medium
   Issue: Recursão profunda pode causar stack overflow
   Fix: Adicionar limite máximo ou usar iteração
```

### Resposta DOCS:
```javascript
/**
 * Calcula o n-ésimo número da sequência de Fibonacci usando recursão.
 *
 * A sequência de Fibonacci: 0, 1, 1, 2, 3, 5, 8, 13, 21, ...
 * Onde cada número é a soma dos dois anteriores.
 *
 * @param {number} n - O índice do número de Fibonacci desejado (n >= 0)
 * @returns {number} O n-ésimo número de Fibonacci
 *
 * @example
 * fibonacci(0)  // retorna 0
 * fibonacci(1)  // retorna 1
 * fibonacci(6)  // retorna 8
 *
 * @warning Esta implementação tem complexidade exponencial O(2^n)
 * Para valores grandes de n, considere usar memoization ou iteração
 */
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}
```

### Resposta OTIMIZAR:
```javascript
// VERSÃO ORIGINAL (O(2^n)):
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// VERSÃO OTIMIZADA (O(n)):
function fibonacci(n) {
  const memo = {};

  function fib(n) {
    if (n <= 1) return n;
    if (memo[n]) return memo[n];

    memo[n] = fib(n - 1) + fib(n - 2);
    return memo[n];
  }

  return fib(n);
}

✅ Melhorias aplicadas:
1. Memoization implementada (O(2^n) → O(n))
2. Cache de resultados já calculados
3. Performance: ~1000x mais rápido para n=40
```

### Resposta REVISAR:
```markdown
✅ Code Review

📊 Qualidade Geral: 6/10

✅ Pontos Positivos:
- Implementação correta do algoritmo
- Código limpo e legível
- Casos base bem definidos

⚠️ Áreas de Melhoria:

1. Performance (Crítico)
   - Complexidade O(2^n) é inaceitável para valores grandes
   - Recomendação: Implementar memoization

2. Documentação (Importante)
   - Falta JSDoc
   - Sem exemplos de uso
   - Recomendação: Adicionar comentários

3. Validação (Moderado)
   - Não valida entrada negativa
   - Não valida tipo de entrada
   - Recomendação: Adicionar validações

4. Testes (Importante)
   - Sem testes unitários
   - Recomendação: Adicionar testes
```

---

## 🎓 Prompts Educacionais

Cada função usa prompts específicos otimizados para ensino:

### EXPLICAR - Prompt Educacional Completo
```
You are an expert [linguagem] educator specializing in teaching complex programming concepts.

Your mission: Explain this [linguagem] code in a way that truly TEACHES, not just describes.

Provide a COMPREHENSIVE, EDUCATIONAL explanation with:
1. 🎯 What & Why (Big Picture)
2. 🧠 Core Concepts (Deep Understanding)
3. 📖 Line-by-Line Teaching
4. 💡 Real-World Analogy
5. ⚠️ Common Mistakes & Best Practices
6. 🚀 Next Steps
7. 🎓 Complex Concepts Made Simple
```

### BUGS - Prompt de Debugging
```
You are an expert code debugger. Analyze this code and identify:
- Bugs and errors
- Potential security issues
- Performance problems
- Edge cases not handled
- Best practice violations

For each issue, provide:
- Severity (CRITICAL/WARNING/SUGGESTION)
- Location in code
- Clear explanation
- Suggested fix
```

### DOCS - Prompt de Documentação
```
Generate comprehensive documentation for this code following [language] conventions.

Include:
- Function/class description
- Parameter descriptions with types
- Return value description
- Usage examples
- Edge cases and warnings
- Related functions/classes
```

### OTIMIZAR - Prompt de Otimização
```
Analyze this code and suggest optimizations:
- Performance improvements
- Code readability
- Best practices
- Modern syntax
- Design patterns

Provide:
- Original vs optimized code
- List of improvements
- Performance impact
- Explanation of changes
```

### REVISAR - Prompt de Code Review
```
Perform a comprehensive code review covering:
- Code quality (1-10 score)
- Security issues
- Performance concerns
- Best practices adherence
- Maintainability
- Testing recommendations

Provide constructive feedback with specific examples.
```

---

## 🚀 Próximos Passos

### Para Usuário Final:
1. ✅ Teste todas as 5 funções com códigos diferentes
2. ✅ Experimente a barra de pesquisa com perguntas
3. ✅ Use os atalhos de teclado para rapidez
4. ✅ Explore histórico e analytics

### Para Desenvolvimento:
1. ⚠️ Adicionar suporte para mais linguagens
2. ⚠️ Implementar cache de respostas
3. ⚠️ Adicionar histórico local
4. ⚠️ Implementar temas (dark/light)
5. ⚠️ Adicionar exportação de análises

---

## 📞 Suporte

**Problemas ou dúvidas?**
- Veja [TESTING_GUIDE.md](./TESTING_GUIDE.md) para testes detalhados
- Consulte [ARCHITECTURE_UPGRADE.md](./ARCHITECTURE_UPGRADE.md) para detalhes técnicos
- Verifique [HACKATHON_SUBMISSION_CHECKLIST.md](./HACKATHON_SUBMISSION_CHECKLIST.md) para checklist completo

---

**🎉 Divirta-se aprendendo código com DevMentor AI!**
