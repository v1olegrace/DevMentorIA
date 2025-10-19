# Guia de Teste - DevMentor AI Extension

## ✅ Integração Concluída

O front-end do Loveable foi integrado com sucesso à extensão Chrome!

## 📁 Estrutura de Arquivos

```
devmentor-ai/
├── frontend-custom/          # Código fonte React do Loveable
│   ├── src/
│   │   ├── components/      # Componentes React
│   │   ├── pages/           # Páginas da aplicação
│   │   └── popup.tsx        # Entry point do popup
│   ├── package.json
│   └── vite.config.ts       # Configuração de build
│
├── dist-frontend/           # Build da extensão (gerado)
│   ├── popup.html          # Popup da extensão
│   ├── popup.js            # Bundle do popup
│   ├── options.html        # Página de opções
│   ├── options.js          # Bundle das opções
│   ├── card.js             # Componentes compartilhados
│   ├── manifest.json       # Manifest da extensão
│   └── background/         # Service workers
│
└── scripts/
    └── fix-html-paths.js   # Script para corrigir paths após build
```

## 🔧 Como Fazer Build

### Opção 1: Build Completo (Recomendado)
```bash
cd devmentor-ai/frontend-custom
npm run build:extension
```

Este comando:
1. Executa o build do Vite
2. Gera os arquivos em `dist-frontend/`
3. Corrige automaticamente os paths nos HTMLs

### Opção 2: Build Manual
```bash
cd devmentor-ai/frontend-custom
npm run build
cd ..
node scripts/fix-html-paths.js
```

## 🧪 Como Testar no Chrome

### Passo 1: Carregar a Extensão
1. Abra o Chrome
2. Digite `chrome://extensions/` na barra de endereços
3. Ative o **Modo do desenvolvedor** (canto superior direito)
4. Clique em **Carregar sem compactação**
5. Selecione a pasta: `devmentor-ai/dist-frontend`

### Passo 2: Verificar Instalação
- A extensão deve aparecer na lista com o nome **DevMentor AI - Enterprise Ready**
- Verifique se não há erros na página de extensões
- O ícone deve aparecer na barra de ferramentas do Chrome

### Passo 3: Testar o Popup
1. Clique no ícone da extensão na barra de ferramentas
2. O popup deve abrir com a interface React do Loveable
3. Verifique se todos os componentes aparecem corretamente
4. Teste as interações (botões, menus, etc.)

### Passo 4: Testar as Opções
1. Clique com botão direito no ícone da extensão
2. Selecione **Opções**
3. A página de configurações deve abrir em uma nova aba
4. Verifique todos os painéis e configurações

### Passo 5: Verificar Console
1. Abra o popup
2. Clique com botão direito > **Inspecionar**
3. Verifique o **Console** - não deve ter erros
4. Verifique a aba **Network** - todos os arquivos devem carregar (200 OK)

## 🐛 Troubleshooting

### Problema: "Failed to load resource"
**Solução**: Execute o script de correção de paths
```bash
node scripts/fix-html-paths.js
```

### Problema: Componentes não aparecem
**Solução**:
1. Verifique se o build foi feito corretamente
2. Recarregue a extensão no Chrome (botão de reload)
3. Limpe o cache do Chrome: `chrome://settings/clearBrowserData`

### Problema: Erros de CSP (Content Security Policy)
**Solução**: O manifest já está configurado corretamente, mas se houver erros:
- Verifique `manifest.json` em `dist-frontend/`
- CSP atual: `script-src 'self' 'wasm-unsafe-eval'`

### Problema: Service Worker não funciona
**Solução**:
1. Vá para `chrome://extensions/`
2. Clique em **Errors** na extensão
3. Clique em **Service worker** > **Inspect**
4. Verifique o console por erros

## 🔄 Workflow de Desenvolvimento

### Durante o Desenvolvimento
```bash
cd frontend-custom
npm run dev
```
- Abre em `http://localhost:8080`
- Hot reload automático
- Perfeito para desenvolver componentes

### Para Testar na Extensão
```bash
cd frontend-custom
npm run build:extension
```
- Depois recarregue a extensão no Chrome

### Build de Produção
```bash
cd frontend-custom
npm run build:integration
```
- Faz build otimizado
- Copia arquivos necessários
- Pronto para distribuição

## 📋 Checklist de Teste

- [ ] Build completa sem erros
- [ ] Extensão carrega no Chrome
- [ ] Popup abre corretamente
- [ ] Interface do Loveable aparece
- [ ] Todos os componentes visíveis
- [ ] Botões e interações funcionam
- [ ] Página de opções abre
- [ ] Configurações são salvas
- [ ] Service worker está ativo
- [ ] Sem erros no console
- [ ] Todos os recursos carregam (Network 200 OK)

## 🎯 Recursos Integrados

### Do Loveable:
- ✅ Interface React moderna
- ✅ Componentes Shadcn/UI
- ✅ Tailwind CSS
- ✅ Configuração Supabase
- ✅ Mascote (cat-mascot-orange.png)
- ✅ Sistema de roteamento
- ✅ Gerenciamento de estado

### Da Extensão:
- ✅ Service Worker (Chrome Built-in AI)
- ✅ Content Scripts
- ✅ Context Menu
- ✅ Keyboard Shortcuts
- ✅ Storage API
- ✅ Integração com sites de código

## 🚀 Próximos Passos

1. **Testar todas as funcionalidades** do popup e options
2. **Integrar a API do Chrome Built-in AI** com os componentes React
3. **Conectar o Supabase** para persistência de dados
4. **Adicionar testes automatizados**
5. **Otimizar bundle size** (atualmente ~325KB)

## 📝 Notas Importantes

- Os arquivos em `dist-frontend/` são **gerados automaticamente**
- **Nunca edite** diretamente arquivos em `dist-frontend/`
- Sempre edite em `frontend-custom/src/` e faça rebuild
- O script `fix-html-paths.js` é executado automaticamente no build
- Mantenha `node_modules/` atualizado: `npm install`

## 🆘 Suporte

Se encontrar problemas:
1. Verifique o console do navegador
2. Verifique o console do service worker
3. Revise este guia de troubleshooting
4. Verifique os logs do build

---

**Status**: ✅ Integração Completa e Testável
**Versão**: 1.0.0
**Data**: 2025-10-11
