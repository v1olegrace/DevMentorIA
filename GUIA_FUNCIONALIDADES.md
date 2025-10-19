# Guia de Funcionalidades - DevMentor AI

## ✅ Funcionalidades Implementadas e Conectadas

Todas as funcionalidades principais foram conectadas entre o frontend (popup React) e o backend (service worker com Chrome AI).

---

## 🎯 Funcionalidades Disponíveis

### 1. **Explicar Código** (Explain)
Fornece uma explicação detalhada do código selecionado.

**Como usar:**
1. Abra uma página com código (GitHub, Stack Overflow, etc.)
2. Selecione um trecho de código
3. Clique no ícone da extensão
4. Selecione "Explicar"
5. Clique em "Analisar Código Selecionado"

**O que retorna:**
- Visão geral do código
- Conceitos e padrões usados
- Detalhes importantes
- Sugestões de aprendizado

**Atalho:** `Ctrl+Shift+E` (Windows) ou `Cmd+Shift+E` (Mac)

---

### 2. **Bugs** (Debug)
Analisa o código em busca de bugs e problemas potenciais.

**Como usar:**
1. Selecione código na página
2. Abra o popup
3. Selecione "Bugs"
4. Clique em "Analisar"

**O que retorna:**
- Bugs potenciais encontrados
- Problemas de performance
- Vulnerabilidades de segurança
- Violações de best practices
- Sugestões de correção para cada problema

**Menu de contexto:** Clique direito no código > "Debug Code"

---

### 3. **Docs** (Documentation)
Gera documentação profissional para o código.

**Como usar:**
1. Selecione uma função, classe ou módulo
2. Abra o popup
3. Selecione "Docs"
4. Clique em "Analisar"

**O que retorna:**
- Descrição da função/classe/módulo
- Documentação de parâmetros
- Documentação de retorno
- Exemplos de uso
- Notas sobre comportamento e edge cases

**Atalho:** `Ctrl+Shift+G` (Windows) ou `Cmd+Shift+G` (Mac)

---

### 4. **Otimizar** (Optimize/Refactor)
Sugere melhorias e refatorações para o código.

**Como usar:**
1. Selecione código que deseja otimizar
2. Abra o popup
3. Selecione "Otimizar"
4. Clique em "Analisar"

**O que retorna:**
- Versão refatorada do código
- Explicação das melhorias
- Benefícios da refatoração
- Abordagens alternativas
- Foco em readability, performance e manutenibilidade

**Atalho:** `Ctrl+Shift+R` (Windows) ou `Cmd+Shift+R` (Mac)

---

### 5. **Revisar** (Review)
Realiza uma revisão completa do código como um senior reviewer.

**Como usar:**
1. Selecione código para revisão
2. Abra o popup
3. Selecione "Revisar"
4. Clique em "Analisar"

**O que retorna:**
- **Code Quality**: Readability, naming, organization
- **Best Practices**: Padrões da linguagem, design patterns
- **Potential Issues**: Bugs, edge cases, security
- **Performance**: Efficiency, optimization opportunities
- **Maintainability**: Complexity, testability
- **Suggestions**: Melhorias específicas e priorizadas

**Menu de contexto:** Clique direito no código > "Refactor Code"

---

## 🔄 Fluxo de Funcionamento

```
┌─────────────────┐
│  Usuário        │
│  Seleciona      │
│  Código         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Popup React    │ ← DevMentorPopup.tsx
│  (Frontend)     │
└────────┬────────┘
         │
         │ chrome.runtime.sendMessage({ action: 'triggerAnalysis', type: '...' })
         │
         ▼
┌─────────────────┐
│ Service Worker  │ ← service-worker.js
│  (Background)   │
└────────┬────────┘
         │
         │ handleTriggerAnalysis()
         │ ├─ Verifica tab ativa
         │ ├─ Injeta content script
         │ ├─ Pega texto selecionado
         │ └─ Mapeia tipo → ação
         │
         ▼
┌─────────────────┐
│   Chrome AI     │ ← chrome-ai.js
│  (Gemini Nano)  │
└────────┬────────┘
         │
         │ Executa prompt específico
         │
         ▼
┌─────────────────┐
│  Content Script │ ← content-script.js
│  (Página)       │
└────────┬────────┘
         │
         │ show-analysis-result
         │
         ▼
┌─────────────────┐
│    Sidebar      │
│   na Página     │
└─────────────────┘
```

---

## 🧪 Como Testar Cada Funcionalidade

### Preparação:
1. Faça o build da extensão:
   ```bash
   cd devmentor-ai/frontend-custom
   npm run build:extension
   ```

2. Carregue no Chrome:
   - Vá para `chrome://extensions/`
   - Ative "Modo do desenvolvedor"
   - Clique em "Carregar sem compactação"
   - Selecione a pasta `dist-frontend`

### Teste 1: Explicar Código
1. Vá para https://github.com/torvalds/linux
2. Navegue até algum arquivo `.c`
3. Selecione uma função
4. Clique no ícone da extensão
5. Verifique se "Explicar" está selecionado
6. Clique em "Analisar Código Selecionado"
7. Aguarde a sidebar aparecer com a explicação

**Sucesso esperado:** Sidebar mostra explicação detalhada do código

### Teste 2: Bugs
1. Vá para https://stackoverflow.com/questions
2. Encontre uma pergunta com código
3. Selecione o código da pergunta
4. Abra o popup da extensão
5. Selecione "Bugs"
6. Clique em "Analisar"
7. Veja os bugs encontrados na sidebar

**Sucesso esperado:** Lista de potenciais bugs e problemas

### Teste 3: Documentação
1. Vá para https://github.com
2. Navegue até algum repositório JavaScript
3. Selecione uma função
4. Use o atalho `Ctrl+Shift+G`
5. Veja a documentação gerada

**Sucesso esperado:** Documentação estilo JSDoc/API docs

### Teste 4: Otimizar
1. Copie este código e cole em CodePen:
   ```javascript
   function sum(a, b) {
     var result = 0;
     result = a + b;
     return result;
   }
   ```
2. Selecione o código
3. Clique direito > "Refactor Code"
4. Veja as sugestões de otimização

**Sucesso esperado:** Código refatorado e melhorias explicadas

### Teste 5: Revisar
1. Selecione qualquer código
2. Abra o popup
3. Selecione "Revisar"
4. Clique em "Analisar"
5. Leia a revisão completa

**Sucesso esperado:** Revisão detalhada em 6 categorias

---

## 🔍 Verificação de Status da IA

O popup mostra o status da IA em tempo real:

- 🟢 **Verde** = IA Pronta (Gemini Nano disponível)
- 🟡 **Amarelo** = IA Indisponível (Inicializado mas sem modelo)
- 🔴 **Vermelho** = Inicializando...

Para verificar manualmente:
```javascript
chrome.runtime.sendMessage({ action: 'getAIStatus' }, (response) => {
  console.log('Status:', response);
});
```

---

## 🐛 Troubleshooting

### Problema: "No code selected"
**Solução:** Certifique-se de que você selecionou texto na página antes de clicar em "Analisar"

### Problema: "IA Indisponível"
**Soluções:**
1. Verifique se está usando Chrome 127+
2. Habilite o Gemini Nano:
   - `chrome://flags/#optimization-guide-on-device-model`
   - `chrome://flags/#prompt-api-for-gemini-nano`
3. Reinicie o Chrome

### Problema: Sidebar não aparece
**Soluções:**
1. Abra DevTools (F12)
2. Vá para a aba Console
3. Procure por erros
4. Verifique se o content script foi injetado:
   ```javascript
   console.log(window.__DEVMENTOR_CONTENT_SCRIPT_INJECTED__);
   ```

### Problema: Service Worker não responde
**Soluções:**
1. Vá para `chrome://extensions/`
2. Encontre DevMentor AI
3. Clique em "Service worker" > "Inspect"
4. Verifique erros no console
5. Recarregue a extensão

---

## 📊 Logs e Debugging

### Ver logs do Service Worker:
1. `chrome://extensions/`
2. DevMentor AI > "Service worker" > "Inspect"
3. Console mostrará todos os logs

### Ver logs do Content Script:
1. Abra a página com código
2. F12 (DevTools)
3. Console mostrará logs do content script

### Ver logs do Popup:
1. Clique direito no ícone da extensão
2. "Inspecionar popup"
3. Console mostrará logs do popup React

---

## 📝 Mapeamento de Tipos

O popup usa nomes em português, mas internamente são mapeados:

```javascript
const actionMap = {
  'explain': 'explain',  // Explicar
  'bugs': 'debug',       // Bugs → Debug
  'docs': 'document',    // Docs → Document
  'optimize': 'refactor', // Otimizar → Refactor
  'review': 'review'     // Revisar
};
```

---

## ✅ Checklist de Funcionalidades

- [x] Explicar código (explain)
- [x] Encontrar bugs (debug)
- [x] Gerar documentação (document)
- [x] Otimizar código (refactor)
- [x] Revisar código (review)
- [x] Status da IA em tempo real
- [x] Atalhos de teclado
- [x] Menu de contexto
- [x] Injeção de sidebar
- [x] Detecção automática de linguagem
- [x] Tratamento de erros
- [x] Analytics e tracking

---

## 🚀 Próximos Passos Sugeridos

1. **Melhorar a UI da Sidebar**: Design mais bonito e responsivo
2. **Histórico de Análises**: Salvar análises anteriores
3. **Exportar Resultados**: Permitir copiar/exportar análises
4. **Suporte a Mais Sites**: Adicionar mais plataformas
5. **Configurações Personalizadas**: Permitir customizar prompts
6. **Modo Offline**: Cache de análises
7. **Compartilhamento**: Compartilhar análises com equipe

---

**Status**: ✅ Todas as 5 funcionalidades principais estão implementadas e funcionais!
