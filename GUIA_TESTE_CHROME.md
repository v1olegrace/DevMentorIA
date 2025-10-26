# 🚀 GUIA DE TESTE - DEVMENTOR AI EXTENSION

## 📋 **PASSO A PASSO PARA TESTAR NO CHROME**

### **1. ✅ EXTENSÃO CONSTRUÍDA**
- ✅ Build React concluído
- ✅ Arquivos copiados para diretório raiz
- ✅ Manifest.json atualizado
- ✅ Popup.html e options.html prontos

---

## 🔧 **CARREGAR EXTENSÃO NO CHROME**

### **Passo 1: Abrir Chrome Extensions**
1. Abra o Chrome
2. Digite na barra de endereços: `chrome://extensions/`
3. Ou vá em Menu → Mais ferramentas → Extensões

### **Passo 2: Ativar Modo Desenvolvedor**
1. No canto superior direito, ative o toggle **"Modo do desenvolvedor"**
2. Você verá novos botões aparecerem

### **Passo 3: Carregar Extensão**
1. Clique em **"Carregar sem compactação"**
2. Navegue até: `D:\DevMentorIA\devmentor-ai\`
3. Selecione a pasta e clique em **"Selecionar pasta"**

### **Passo 4: Verificar Carregamento**
- ✅ A extensão deve aparecer na lista
- ✅ Status deve ser "Ativo"
- ✅ Ícone deve aparecer na barra de ferramentas

---

## 🧪 **TESTES A REALIZAR**

### **TESTE 1: POPUP DA EXTENSÃO**
1. **Clique no ícone** da extensão na barra de ferramentas
2. **Verificar se abre** o popup React
3. **Verificar elementos**:
   - ✅ Header com logo DevMentor AI
   - ✅ Status da IA (deve mostrar "Inicializando...")
   - ✅ Botões de função (Explicar, Bugs, Docs, Otimizar, Revisar)
   - ✅ Botão "Analisar Código Selecionado"
   - ✅ Botões Histórico e Analytics

### **TESTE 2: PÁGINA DE OPÇÕES**
1. **Clique com botão direito** no ícone da extensão
2. **Selecione "Opções"**
3. **Verificar se abre** a página de configurações React
4. **Verificar elementos**:
   - ✅ Configurações de aparência
   - ✅ Configurações de notificações
   - ✅ Configurações de IA
   - ✅ Configurações de dados e cache
   - ✅ Estatísticas de uso

### **TESTE 3: ANÁLISE DE CÓDIGO**
1. **Abra uma página** com código (ex: GitHub, Stack Overflow)
2. **Selecione algum código** na página
3. **Clique no ícone** da extensão
4. **Escolha uma função** (Explicar, Bugs, etc.)
5. **Clique em "Analisar Código Selecionado"**
6. **Verificar**:
   - ✅ Popup fecha automaticamente
   - ✅ Sidebar aparece na página
   - ✅ Análise é exibida

### **TESTE 4: CONTEXT MENU**
1. **Selecione código** em qualquer página
2. **Clique com botão direito**
3. **Verificar se aparece** "DevMentor AI" no menu
4. **Teste as opções**:
   - ✅ Explain Code
   - ✅ Debug Code
   - ✅ Document Code
   - ✅ Refactor Code

### **TESTE 5: ATALHOS DE TECLADO**
1. **Selecione código** em uma página
2. **Teste os atalhos**:
   - ✅ `Ctrl+Shift+E` - Explain Code
   - ✅ `Ctrl+Shift+B` - Debug Code
   - ✅ `Ctrl+Shift+G` - Document Code
   - ✅ `Ctrl+Shift+R` - Refactor Code

---

## 🔍 **VERIFICAÇÕES DE SEGURANÇA**

### **Console do Popup:**
1. **Clique no ícone** da extensão
2. **Clique com botão direito** no popup
3. **Selecione "Inspecionar"**
4. **Verificar Console**:
   - ✅ Sem erros críticos
   - ✅ Logs de segurança (dados redacted)
   - ✅ Status da IA

### **Console da Página:**
1. **Abra uma página** qualquer
2. **Pressione F12** para abrir DevTools
3. **Vá para Console**
4. **Selecione código** e teste análise
5. **Verificar**:
   - ✅ Content script injetado
   - ✅ Mensagens entre componentes
   - ✅ Sem vazamento de dados sensíveis

### **Service Worker:**
1. **Vá para** `chrome://extensions/`
2. **Encontre** DevMentor AI
3. **Clique em "Detalhes"**
4. **Clique em "Service worker"**
5. **Verificar**:
   - ✅ Service worker ativo
   - ✅ Logs de inicialização
   - ✅ Mensagens processadas

---

## 🚨 **PROBLEMAS COMUNS E SOLUÇÕES**

### **❌ Popup não abre:**
- **Causa**: Arquivos não copiados corretamente
- **Solução**: Verificar se popup.html e popup.js estão na raiz

### **❌ Erro de CSP:**
- **Causa**: Content Security Policy muito restritiva
- **Solução**: Verificar manifest.json CSP

### **❌ Service Worker não responde:**
- **Causa**: Erro no código do service worker
- **Solução**: Verificar console do service worker

### **❌ Análise não funciona:**
- **Causa**: Chrome Built-in AI não disponível
- **Solução**: Verificar se Chrome AI está habilitado

---

## 📊 **CHECKLIST DE TESTE**

### **✅ FUNCIONALIDADES BÁSICAS:**
- [ ] Extensão carrega sem erros
- [ ] Popup abre e exibe interface React
- [ ] Página de opções funciona
- [ ] Context menu aparece
- [ ] Atalhos de teclado funcionam

### **✅ ANÁLISE DE CÓDIGO:**
- [ ] Seleção de código funciona
- [ ] Análise é iniciada
- [ ] Sidebar aparece na página
- [ ] Resultado é exibido
- [ ] Todas as funções (Explicar, Bugs, Docs, Otimizar, Revisar) funcionam

### **✅ SEGURANÇA:**
- [ ] Sem erros de CSP
- [ ] Logs não expõem dados sensíveis
- [ ] Service worker funciona corretamente
- [ ] Mensagens entre componentes seguras

### **✅ INTERFACE:**
- [ ] Design responsivo
- [ ] Animações funcionam
- [ ] Botões respondem
- [ ] Status da IA atualiza

---

## 🎯 **PRÓXIMOS PASSOS APÓS TESTE**

### **Se tudo funcionar:**
1. ✅ **Documentar** resultados dos testes
2. ✅ **Preparar** para deploy em produção
3. ✅ **Configurar** variáveis de ambiente
4. ✅ **Publicar** no Chrome Web Store

### **Se houver problemas:**
1. 🔧 **Identificar** causa raiz
2. 🔧 **Corrigir** problemas encontrados
3. 🔧 **Re-testar** funcionalidades
4. 🔧 **Validar** correções

---

## 📝 **RELATÓRIO DE TESTE**

**Data**: ___________  
**Versão**: 1.0.0  
**Testador**: ___________  

### **Resultados:**
- **Funcionalidades Básicas**: ✅ / ❌
- **Análise de Código**: ✅ / ❌
- **Segurança**: ✅ / ❌
- **Interface**: ✅ / ❌

### **Problemas Encontrados:**
1. ________________
2. ________________
3. ________________

### **Observações:**
________________
________________

**Status Final**: ✅ **APROVADO** / ❌ **REPROVADO**

---

**Boa sorte com os testes! 🚀**











