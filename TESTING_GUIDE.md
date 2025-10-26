# DevMentor AI - Guia de Testes End-to-End

Este guia fornece testes completos para verificar a integração backend-frontend.

## ✅ Pré-requisitos

Antes de começar os testes, certifique-se de que:

- [ ] Node.js 18+ está instalado
- [ ] Chrome 130+ está instalado
- [ ] Backend está configurado (`.env` preenchido)
- [ ] Extensão Chrome está instalada

## 🧪 Testes de Backend

### Teste 1: Instalação de Dependências

```bash
cd devmentor-ai/backend
npm install
```

**Resultado esperado**: Todas as dependências instaladas sem erros.

### Teste 2: Validação do .env

```bash
cat .env
```

**Verifique**:
- [ ] `PORT=3001`
- [ ] `API_TOKEN` tem pelo menos 32 caracteres
- [ ] `ALLOWED_ORIGINS` contém o Extension ID
- [ ] Pelo menos uma API key está configurada (opcional)

### Teste 3: Iniciar Backend

```bash
npm run dev
```

**Resultado esperado**:
```
✅ CORS Configuration validated: 2 allowed origins
DevMentor AI Backend running on port 3001
```

### Teste 4: Health Check

Em outro terminal:

```bash
curl http://localhost:3001/health
```

**Resultado esperado**:
```json
{
  "status": "ok",
  "timestamp": "2025-01-19T12:00:00.000Z",
  "uptime": 123.456
}
```

### Teste 5: Test Connection (sem autenticação)

```bash
curl -X POST http://localhost:3001/api/proxy/test-connection
```

**Resultado esperado**:
```json
{
  "error": "Missing or invalid authorization header"
}
```

✅ CORS e autenticação estão funcionando!

### Teste 6: Test Connection (com autenticação)

```bash
curl -X POST http://localhost:3001/api/proxy/test-connection \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{"provider":"openai"}'
```

**Resultado esperado** (se API key configurada):
```json
{
  "success": true,
  "provider": "openai",
  "status": "connected"
}
```

## 🎯 Testes de Extensão Chrome

### Teste 7: Instalar Extensão

1. Abra `chrome://extensions/`
2. Ative "Modo do desenvolvedor"
3. Clique em "Carregar sem compactação"
4. Selecione a pasta `devmentor-ai/`

**Resultado esperado**:
- [ ] Extensão aparece na lista
- [ ] Nenhum erro de carregamento
- [ ] Ícone aparece na barra de ferramentas

### Teste 8: Obter Extension ID

1. Em `chrome://extensions/`, copie o ID da extensão DevMentor AI
2. Exemplo: `abcdefghijklmnopqrstuvwxyz123456`

### Teste 9: Atualizar CORS no Backend

Edite `devmentor-ai/backend/.env`:

```env
ALLOWED_ORIGINS=chrome-extension://SEU_EXTENSION_ID_AQUI,http://localhost:8080
```

Reinicie o backend:

```bash
# Ctrl+C para parar
npm run dev
```

### Teste 10: Service Worker Console

1. Vá para `chrome://extensions/`
2. Encontre DevMentor AI
3. Clique em "service worker"
4. Console deve abrir

**Resultado esperado**:
```
[ServiceWorker] Extension initialized successfully
[BackendConfig] Configuration loaded
[APIClient] Configuration loaded
```

### Teste 11: Abrir Configurações de Backend

1. Vá para `chrome://extensions/`
2. Encontre DevMentor AI
3. Clique em "Detalhes"
4. Clique em "Opções de extensão"
5. Navegue para a aba/seção de Backend

**Ou abra diretamente**:
```
chrome-extension://SEU_EXTENSION_ID/backend-settings.html
```

**Resultado esperado**:
- [ ] Página de configurações carrega
- [ ] Status mostra "Backend desabilitado"

### Teste 12: Configurar Backend

Na página de configurações:

1. **Backend URL**: `http://localhost:3001`
2. **API Token**: O token do `.env`
3. **Preferred Provider**: `openai` (ou outro)
4. **Enable Backend**: ✅ Marcar
5. **Fallback to Local AI**: ✅ Marcar
6. Clique em "💾 Salvar Configurações"

**Resultado esperado**:
```
✅ Configurações salvas com sucesso!
```

### Teste 13: Testar Conexão

Na página de configurações:

1. Clique em "🔌 Testar Conexão"

**Resultado esperado**:
```
✅ Conexão bem-sucedida! Provider: openai
```

**No console do Service Worker**:
```
[APIClient] Request attempt 1/3: http://localhost:3001/api/proxy/test-connection
[APIClient] Request successful: /api/proxy/test-connection
```

**No terminal do backend**:
```
[2025-01-19 12:00:00] POST /api/proxy/test-connection - 200 (123ms)
```

### Teste 14: Análise de Código (Local AI)

1. Vá para https://github.com/
2. Encontre qualquer código
3. Selecione um trecho de código
4. Clique com botão direito → "DevMentor AI" → "Explain Code"

**Resultado esperado no Service Worker console**:
```
[ServiceWorker] Using intelligent fallback system
[AIProviderFallback] Trying provider: chrome-builtin-ai
[AIProviderFallback] Provider chrome-builtin-ai succeeded
```

### Teste 15: Análise de Código (Backend Fallback)

**Cenário**: Forçar uso do backend desabilitando Chrome AI temporariamente.

No console do Service Worker:

```javascript
// Forçar uso do backend
await aiProviderFallback.forceProvider('backend-api');
```

Agora repita o Teste 14.

**Resultado esperado no Service Worker console**:
```
[ServiceWorker] Using intelligent fallback system
[AIProviderFallback] Trying provider: backend-api
[APIClient] Request attempt 1/3: http://localhost:3001/api/proxy/analyze
[APIClient] Request successful: /api/proxy/analyze
```

**No terminal do backend**:
```
[2025-01-19 12:00:00] POST /api/proxy/analyze - 200 (2345ms)
```

### Teste 16: Verificar Estatísticas

No console do Service Worker:

```javascript
aiProviderFallback.getStats()
```

**Resultado esperado**:
```json
{
  "localSuccess": 5,
  "localFailure": 0,
  "backendSuccess": 2,
  "backendFailure": 0,
  "totalRequests": 7,
  "currentProvider": "backend-api",
  "localSuccessRate": 1,
  "backendSuccessRate": 1
}
```

### Teste 17: Erro de Autenticação

1. Na página de configurações, mude o token para um valor inválido
2. Salve
3. Tente "Testar Conexão"

**Resultado esperado**:
```
❌ Falha na conexão: Invalid API token
```

**No Service Worker console**:
```
[APIClient] Request failed: HTTP 401: Unauthorized
```

**No terminal do backend**:
```
🚨 Invalid API token from 127.0.0.1
```

### Teste 18: CORS Bloqueado

1. No backend `.env`, remova o Extension ID de `ALLOWED_ORIGINS`
2. Reinicie o backend
3. Tente "Testar Conexão"

**Resultado esperado**:
```
❌ Falha na conexão: Origin not allowed
```

**No terminal do backend**:
```
🚨 CORS blocked origin: chrome-extension://xxx from 127.0.0.1
```

### Teste 19: Backend Offline

1. Pare o backend (Ctrl+C)
2. Tente "Testar Conexão"

**Resultado esperado**:
```
❌ Falha na conexão: fetch failed
```

3. Tente analisar código com a extensão

**Resultado esperado no Service Worker console**:
```
[AIProviderFallback] Provider backend-api failed
[AIProviderFallback] Trying provider: chrome-builtin-ai
[AIProviderFallback] Provider chrome-builtin-ai succeeded
```

✅ **Fallback funcionando!** Chrome AI assumiu quando backend falhou.

### Teste 20: Restaurar Padrões

1. Na página de configurações, clique em "🔄 Restaurar Padrões"
2. Confirme

**Resultado esperado**:
- [ ] Todas as configurações voltam ao padrão
- [ ] Backend desabilitado
- [ ] Status mostra "Backend desabilitado"

## 📊 Checklist Final

### Backend

- [ ] Backend inicia sem erros
- [ ] Health check responde
- [ ] CORS funciona corretamente
- [ ] Autenticação funciona
- [ ] Rate limiting está ativo
- [ ] Logs aparecem no terminal

### Extensão

- [ ] Extensão carrega sem erros
- [ ] Service Worker inicia corretamente
- [ ] Página de configurações abre
- [ ] Configurações salvam corretamente
- [ ] Teste de conexão funciona
- [ ] Análise de código funciona (local)
- [ ] Análise de código funciona (backend)
- [ ] Fallback funciona quando backend falha
- [ ] Estatísticas são atualizadas

### Integração

- [ ] Extension ID no CORS do backend
- [ ] Token de autenticação configurado
- [ ] Ambos os modos funcionam (local e backend)
- [ ] Fallback inteligente ativo
- [ ] Sem erros no console

## 🐛 Solução de Problemas Comuns

### Erro: "Extension ID not found in CORS"

**Solução**: Verifique se o Extension ID está correto no `.env` do backend.

### Erro: "Failed to fetch"

**Possíveis causas**:
1. Backend não está rodando
2. URL incorreta na configuração
3. Firewall bloqueando porta 3001

### Erro: "Chrome AI not available"

**Solução**:
- Verifique Chrome versão (deve ser 130+)
- Habilite backend como fallback
- Chrome AI pode não estar disponível em todos os dispositivos

### Extensão não carrega

**Solução**:
1. Verifique erros em `chrome://extensions/`
2. Recarregue a extensão
3. Verifique permissões no `manifest.json`

## 📈 Métricas de Sucesso

Após todos os testes:

✅ **100% dos testes passaram**: Integração perfeita!
⚠️ **> 80% dos testes passaram**: Integração funcional, mas com problemas menores
❌ **< 80% dos testes passaram**: Revise a configuração

## 🎯 Próximos Passos

Com todos os testes passando:

1. ✅ Sistema está production-ready
2. ✅ Backend e frontend integrados
3. ✅ Fallback inteligente ativo
4. ✅ Pronto para uso

Você pode:
- Usar a extensão normalmente
- Configurar preferências conforme necessário
- Monitorar estatísticas de uso
- Deploy em produção (com HTTPS)

---

**Versão**: 1.0.0
**Data**: 2025-01-19
**Status**: Completo
