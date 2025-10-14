# ✅ Checklist Rápido de Teste - DevMentor AI

## 📋 Pré-requisitos

- [ ] Chrome versão 127 ou superior
- [ ] Extensão buildada (`npm run build:extension`)
- [ ] Extensão carregada em `chrome://extensions/`
- [ ] Modo do desenvolvedor ativado

---

## 🔧 Habilitar Gemini Nano (Chrome AI)

- [ ] Ir para `chrome://flags/#optimization-guide-on-device-model`
- [ ] Configurar para **Enabled BypassPerfRequirement**
- [ ] Ir para `chrome://flags/#prompt-api-for-gemini-nano`
- [ ] Configurar para **Enabled**
- [ ] Reiniciar o Chrome
- [ ] Verificar em `chrome://components/` se "Optimization Guide On Device Model" está presente

---

## 🎯 Teste Básico do Popup

- [ ] Clicar no ícone da extensão
- [ ] Popup abre (400x600px)
- [ ] Mostra "DevMentor AI" no header
- [ ] Mostra indicador de status da IA
- [ ] Mostra 5 botões de função:
  - [ ] Explicar (azul)
  - [ ] Bugs (vermelho)
  - [ ] Docs (verde)
  - [ ] Otimizar (amarelo)
  - [ ] Revisar (roxo)
- [ ] Mostra botão "Analisar Código Selecionado"
- [ ] Mostra botões "Histórico" e "Analytics"
- [ ] Mostra ícone de configurações
- [ ] Mostra instruções de uso
- [ ] Mostra atalho de teclado no footer

---

## 🟢 Teste de Status da IA

### Status Verde (IA Pronta)
- [ ] Indicador mostra bolinha verde
- [ ] Texto mostra "IA Pronta"
- [ ] Botão "Analisar" está habilitado

### Status Amarelo (IA Indisponível)
- [ ] Indicador mostra bolinha amarela
- [ ] Texto mostra "IA Indisponível"
- [ ] Botão "Analisar" está desabilitado

### Status Vermelho (Inicializando)
- [ ] Indicador mostra bolinha vermelha
- [ ] Texto mostra "Inicializando..."
- [ ] Botão "Analisar" está desabilitado

---

## 🧪 Teste 1: Explicar Código

### Setup:
- [ ] Ir para https://github.com/torvalds/linux/blob/master/kernel/fork.c
- [ ] Selecionar a função `copy_process`

### Execução:
- [ ] Abrir popup
- [ ] Clicar em "Explicar" (deve ficar azul)
- [ ] Clicar em "Analisar Código Selecionado"
- [ ] Popup fecha automaticamente

### Resultado Esperado:
- [ ] Sidebar aparece na página
- [ ] Mostra loading
- [ ] Após alguns segundos, mostra:
  - [ ] Título: "Explicação do Código"
  - [ ] Visão geral
  - [ ] Conceitos usados
  - [ ] Detalhes importantes
  - [ ] Sugestões de aprendizado

---

## 🐛 Teste 2: Encontrar Bugs

### Setup:
- [ ] Ir para https://stackoverflow.com/questions
- [ ] Procurar pergunta com código JavaScript
- [ ] Selecionar código bugado

### Execução:
- [ ] Abrir popup
- [ ] Clicar em "Bugs"
- [ ] Clicar em "Analisar"

### Resultado Esperado:
- [ ] Sidebar mostra:
  - [ ] Lista de bugs encontrados
  - [ ] Severidade de cada bug
  - [ ] Explicação dos problemas
  - [ ] Sugestões de correção

---

## 📚 Teste 3: Gerar Documentação

### Setup:
- [ ] Ir para https://github.com/facebook/react
- [ ] Navegar até `packages/react/src/React.js`
- [ ] Selecionar a função `createElement`

### Execução:
- [ ] Usar atalho `Ctrl+Shift+G` (Windows) ou `Cmd+Shift+G` (Mac)

### Resultado Esperado:
- [ ] Sidebar mostra:
  - [ ] Descrição da função
  - [ ] Parâmetros documentados
  - [ ] Valor de retorno
  - [ ] Exemplos de uso
  - [ ] Notas importantes

---

## ⚡ Teste 4: Otimizar Código

### Setup:
- [ ] Ir para https://codepen.io/pen/
- [ ] Colar este código:
```javascript
function sum(arr) {
  var total = 0;
  for (var i = 0; i < arr.length; i++) {
    total = total + arr[i];
  }
  return total;
}
```
- [ ] Selecionar todo o código

### Execução:
- [ ] Clicar direito → "Refactor Code"

### Resultado Esperado:
- [ ] Sidebar mostra:
  - [ ] Versão refatorada (ex: usando reduce)
  - [ ] Explicação das melhorias
  - [ ] Benefícios da refatoração
  - [ ] Comparação de performance

---

## 🔍 Teste 5: Revisar Código

### Setup:
- [ ] Selecionar qualquer código de 20-50 linhas

### Execução:
- [ ] Abrir popup
- [ ] Clicar em "Revisar"
- [ ] Clicar em "Analisar"

### Resultado Esperado:
- [ ] Sidebar mostra revisão completa:
  - [ ] **Code Quality**: Readability, naming
  - [ ] **Best Practices**: Padrões seguidos
  - [ ] **Potential Issues**: Bugs, edge cases
  - [ ] **Performance**: Otimizações possíveis
  - [ ] **Maintainability**: Complexidade, testes
  - [ ] **Suggestions**: Melhorias priorizadas

---

## ⌨️ Teste de Atalhos de Teclado

- [ ] `Ctrl+Shift+E` - Explicar código
- [ ] `Ctrl+Shift+B` - Debug código
- [ ] `Ctrl+Shift+G` - Gerar documentação
- [ ] `Ctrl+Shift+R` - Refatorar código

Cada atalho deve:
- [ ] Funcionar quando código está selecionado
- [ ] Mostrar sidebar com análise
- [ ] Funcionar em todos os sites permitidos

---

## 🖱️ Teste de Menu de Contexto

Em qualquer site permitido:
- [ ] Selecionar código
- [ ] Clicar direito
- [ ] Menu mostra:
  - [ ] "Explain Code"
  - [ ] "Debug Code"
  - [ ] "Generate Documentation"
  - [ ] "Refactor Code"
  - [ ] --- (separador)

Ao clicar em cada opção:
- [ ] Sidebar aparece
- [ ] Análise é executada
- [ ] Resultado é exibido

---

## ⚙️ Teste de Configurações

- [ ] Clicar no ícone de engrenagem no popup
- [ ] Página de opções abre
- [ ] Mostra configurações da extensão
- [ ] Todas as seções são visíveis:
  - [ ] Configurações gerais
  - [ ] Preferências de IA
  - [ ] Atalhos
  - [ ] Sobre

---

## 📊 Teste de Páginas Extras

### Histórico:
- [ ] Clicar em "Histórico" no popup
- [ ] Nova aba abre com `chrome-extension://.../history.html`
- [ ] Mostra análises anteriores (se houver)

### Analytics:
- [ ] Clicar em "Analytics" no popup
- [ ] Nova aba abre com `chrome-extension://.../analytics.html`
- [ ] Mostra estatísticas de uso

---

## 🔍 Teste de Console/Debugging

### Service Worker:
- [ ] `chrome://extensions/` → DevMentor AI → "Service worker" → Inspect
- [ ] Console mostra:
  ```
  [ServiceWorker] ✅ Extension initialized successfully
  [ServiceWorker] ✅ Context menus created
  [ChromeAI] ✅ Chrome Built-in AI initialized successfully
  ```
- [ ] Sem erros vermelhos

### Popup:
- [ ] Clicar direito no ícone → "Inspecionar popup"
- [ ] Console sem erros
- [ ] Network: todos os arquivos carregam (200 OK)

### Content Script:
- [ ] Em qualquer página permitida, F12
- [ ] Console mostra (após análise):
  ```
  [DevMentor] Content script injected
  [DevMentor] Analysis result received
  ```

---

## 🌐 Teste em Múltiplos Sites

Testar pelo menos uma função em cada site:

- [ ] **GitHub**: https://github.com/torvalds/linux
- [ ] **Stack Overflow**: https://stackoverflow.com/questions
- [ ] **MDN**: https://developer.mozilla.org/
- [ ] **GitLab**: https://gitlab.com/
- [ ] **CodePen**: https://codepen.io/
- [ ] **JSFiddle**: https://jsfiddle.net/
- [ ] **CodeSandbox**: https://codesandbox.io/

Em cada site:
- [ ] Selecionar código
- [ ] Análise funciona
- [ ] Sidebar aparece
- [ ] Resultado é exibido

---

## ❌ Teste de Erros

### Sem código selecionado:
- [ ] Abrir popup
- [ ] Clicar "Analisar" sem selecionar código
- [ ] Toast mostra: "Erro ao iniciar análise. Verifique se há código selecionado."

### IA indisponível:
- [ ] Desabilitar Gemini Nano nos flags
- [ ] Reiniciar Chrome
- [ ] Status mostra "IA Indisponível"
- [ ] Botão "Analisar" está desabilitado
- [ ] Tooltip explica como habilitar

### Site não permitido:
- [ ] Tentar usar em site não listado (ex: google.com)
- [ ] Context menu não aparece
- [ ] Content script não injeta

---

## 📱 Teste de Responsividade

### Popup:
- [ ] Largura fixa 400px
- [ ] Altura fixa 600px
- [ ] Scroll funciona se necessário
- [ ] Botões visíveis
- [ ] Texto legível

### Sidebar:
- [ ] Aparece na lateral direita
- [ ] Não sobrepõe conteúdo importante
- [ ] Scroll funciona
- [ ] Fecha com botão X
- [ ] Redimensionável (se implementado)

---

## 🎨 Teste Visual

- [ ] Popup usa Tailwind CSS
- [ ] Componentes Shadcn/UI visíveis
- [ ] Gradientes no header
- [ ] Ícones Lucide aparecem
- [ ] Cores corretas:
  - Azul para Explicar
  - Vermelho para Bugs
  - Verde para Docs
  - Amarelo para Otimizar
  - Roxo para Revisar
- [ ] Hover states funcionam
- [ ] Transições suaves

---

## 🚀 Checklist de Performance

- [ ] Popup abre em < 500ms
- [ ] Análise inicia em < 1s
- [ ] Resultado aparece em < 10s (depende do Gemini Nano)
- [ ] Sidebar não trava a página
- [ ] Service worker não consome > 50MB RAM
- [ ] Sem memory leaks após 10 análises

---

## ✅ Checklist Final de Produção

Antes de considerar pronta para produção:

- [ ] Todas as 5 funções testadas ✅
- [ ] Atalhos testados ✅
- [ ] Menu de contexto testado ✅
- [ ] Múltiplos sites testados ✅
- [ ] Errors handled gracefully ✅
- [ ] Logs limpos (sem erros no console) ✅
- [ ] UI/UX responsiva ✅
- [ ] Documentação completa ✅
- [ ] README atualizado
- [ ] Screenshots/GIFs para demo
- [ ] Licença adicionada
- [ ] Changelog mantido

---

## 📝 Notas de Teste

Use esta seção para anotar problemas encontrados:

```
Data: ___/___/___
Testador: __________

Problemas encontrados:
1.
2.
3.

Funcionalidades OK:
- [x]
- [x]
- [x]

Próximos passos:
- [ ]
- [ ]
```

---

**Status Geral**: 🟢 Pronto para testes / 🟡 Alguns problemas / 🔴 Não testado

---

## 🎯 Meta Final

✅ **TODAS as funcionalidades devem estar 100% operacionais antes de marcar como completo!**

Bons testes! 🚀
