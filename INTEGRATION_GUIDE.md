# DevMentor AI - Guia de Integração Backend-Frontend

Este guia mostra como conectar perfeitamente o backend ao frontend da extensão Chrome.

## 📋 Visão Geral da Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                    Chrome Extension                         │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Service Worker                                     │    │
│  │  ┌──────────────────────────────────────────┐     │    │
│  │  │  AI Provider Fallback System             │     │    │
│  │  │  ┌────────────┐      ┌─────────────┐    │     │    │
│  │  │  │ Chrome AI  │  →   │  Backend    │    │     │    │
│  │  │  │  (Local)   │      │   API       │    │     │    │
│  │  │  └────────────┘      └─────────────┘    │     │    │
│  │  └──────────────────────────────────────────┘     │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                           ↓
                  ┌────────────────┐
                  │  Backend API   │
                  │  (Express.js)  │
                  └────────────────┘
                           ↓
        ┌──────────────────┼──────────────────┐
        ↓                  ↓                   ↓
  ┌─────────┐        ┌─────────┐        ┌─────────┐
  │ OpenAI  │        │Anthropic│        │ Google  │
  │   API   │        │   API   │        │   API   │
  └─────────┘        └─────────┘        └─────────┘
```

## 🚀 Passo a Passo de Configuração

### 1. Configurar o Backend

#### 1.1 Instalar Dependências

```bash
cd devmentor-ai/backend
npm install
```

#### 1.2 Configurar Variáveis de Ambiente

1. Copie o arquivo `.env.example` para `.env`:
```bash
cp .env.example .env
```

2. Gere um token seguro:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

3. Edite o arquivo `.env`:
```env
# Use o token gerado acima
API_TOKEN=seu_token_seguro_aqui

# Adicione suas API keys (opcional - apenas se quiser usar APIs externas)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=...

# IMPORTANTE: Adicione o ID da sua extensão Chrome (veja passo 2)
ALLOWED_ORIGINS=chrome-extension://SEU_EXTENSION_ID,http://localhost:8080
```

#### 1.3 Iniciar o Backend

```bash
# Modo desenvolvimento (com auto-reload)
npm run dev

# Ou modo produção
npm start
```

O backend estará rodando em `http://localhost:3001`

### 2. Obter o Extension ID

1. Abra o Chrome e vá para `chrome://extensions/`
2. Ative o "Modo do desenvolvedor" (canto superior direito)
3. Clique em "Carregar sem compactação" e selecione a pasta `devmentor-ai/`
4. Copie o **ID da extensão** (ex: `abcdefghijklmnopqrstuvwxyz123456`)
5. Adicione ao `.env` do backend:

```env
ALLOWED_ORIGINS=chrome-extension://abcdefghijklmnopqrstuvwxyz123456,http://localhost:8080
```

6. Reinicie o backend para aplicar as mudanças

### 3. Configurar a Extensão Chrome

#### 3.1 Abrir Opções da Extensão

1. Vá para `chrome://extensions/`
2. Encontre "DevMentor AI"
3. Clique em "Detalhes"
4. Clique em "Opções de extensão"

#### 3.2 Configurar Backend (na página de opções)

Configure os seguintes campos:

- **Backend URL**: `http://localhost:3001`
- **API Token**: `o_token_que_você_gerou_no_passo_1.2`
- **Preferred Provider**: `openai`, `anthropic` ou `google`
- **Enable Backend**: ✅ Marque esta opção
- **Fallback to Local AI**: ✅ Marque para usar Chrome AI como backup

Clique em "Salvar Configurações"

### 4. Testar a Integração

#### 4.1 Teste de Conexão

1. Na página de opções, clique em "Test Connection"
2. Você deve ver: ✅ "Backend connection successful"

#### 4.2 Teste de Análise

1. Vá para qualquer site com código (ex: GitHub, StackOverflow)
2. Selecione um trecho de código
3. Clique com botão direito → "DevMentor AI" → "Explain Code"
4. Veja o resultado!

#### 4.3 Verificar qual Provider Foi Usado

Abra o Console do Service Worker:
1. Vá para `chrome://extensions/`
2. Encontre "DevMentor AI"
3. Clique em "service worker" (link azul)
4. Você verá logs como:
   ```
   [ServiceWorker] Using intelligent fallback system
   [AIProviderFallback] Trying provider: chrome-builtin-ai
   ```
   ou
   ```
   [AIProviderFallback] Trying provider: backend-api
   ```

## 📊 Funcionalidades da Integração

### Sistema de Fallback Inteligente

A extensão usa um sistema de fallback em cascata:

1. **Primeira tentativa**: Chrome Built-in AI (local, gratuito, privado)
2. **Fallback**: Backend API (se habilitado e se o Chrome AI falhar)

### Configurações Disponíveis

| Configuração | Descrição | Padrão |
|--------------|-----------|--------|
| `backendEnabled` | Habilitar integração com backend | `false` |
| `backendURL` | URL do backend | `http://localhost:3001` |
| `backendToken` | Token de autenticação | `null` |
| `preferredProvider` | Provider de IA preferido | `openai` |
| `fallbackToLocal` | Usar Chrome AI como backup | `true` |
| `timeout` | Timeout de requisições (ms) | `30000` |
| `maxRetries` | Tentativas máximas | `3` |

### APIs Disponíveis no Backend

#### 1. Test Connection
```http
POST /api/proxy/test-connection
Authorization: Bearer your_token
Content-Type: application/json

{
  "provider": "openai"
}
```

#### 2. Analyze Code
```http
POST /api/proxy/analyze
Authorization: Bearer your_token
Content-Type: application/json

{
  "code": "function hello() { console.log('world'); }",
  "analysisType": "explain",
  "language": "javascript",
  "provider": "openai"
}
```

#### 3. Analyze Screenshot
```http
POST /api/proxy/analyze-screenshot
Authorization: Bearer your_token
Content-Type: application/json

{
  "imageData": "data:image/png;base64,...",
  "prompt": "Explain this code screenshot",
  "provider": "google"
}
```

#### 4. Health Check
```http
GET /health
```

## 🔧 Solução de Problemas

### Erro: "Origin not allowed"

**Problema**: O backend está bloqueando requisições da extensão.

**Solução**:
1. Verifique se adicionou o Extension ID correto em `ALLOWED_ORIGINS` no `.env`
2. Reinicie o backend
3. O formato correto é: `chrome-extension://seu_extension_id_aqui`

### Erro: "Invalid API token"

**Problema**: Token de autenticação inválido.

**Solução**:
1. Verifique se o token na extensão é igual ao `API_TOKEN` no `.env`
2. Certifique-se de que o token tem pelo menos 10 caracteres
3. Gere um novo token se necessário

### Erro: "Backend connection failed"

**Problema**: Backend não está acessível.

**Solução**:
1. Verifique se o backend está rodando: `curl http://localhost:3001/health`
2. Verifique se a porta 3001 não está bloqueada
3. Tente reiniciar o backend

### Chrome AI não funciona

**Problema**: Chrome Built-in AI não está disponível.

**Solução**:
1. Verifique se está usando Chrome 130+ (`chrome://version/`)
2. Habilite o backend como fallback
3. Chrome AI pode não estar disponível em todos os dispositivos

## 📈 Monitoramento

### Ver Estatísticas de Uso

No console da extensão, execute:
```javascript
aiProviderFallback.getStats()
```

Resultado:
```json
{
  "localSuccess": 45,
  "localFailure": 2,
  "backendSuccess": 10,
  "backendFailure": 1,
  "totalRequests": 58,
  "currentProvider": "chrome-builtin-ai",
  "localSuccessRate": 0.96,
  "backendSuccessRate": 0.91
}
```

### Ver Logs do Backend

```bash
# No terminal onde o backend está rodando
# Você verá logs como:
✅ CORS Configuration validated: 2 allowed origins
[2025-01-19 10:30:45] POST /api/proxy/analyze - 200 (1234ms)
[2025-01-19 10:31:12] POST /api/proxy/test-connection - 200 (89ms)
```

## 🔐 Segurança

### Boas Práticas

1. **Nunca compartilhe** seu arquivo `.env`
2. **Use tokens fortes**: Mínimo 32 caracteres aleatórios
3. **HTTPS em produção**: Use HTTPS para o backend em produção
4. **Revise origins**: Adicione apenas origins confiáveis
5. **Rate limiting**: O backend tem rate limiting habilitado (100 req/15min)

### Como Gerar Token Seguro

```bash
# Linux/Mac
openssl rand -hex 32

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# PowerShell (Windows)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

## 🎯 Próximos Passos

Agora que a integração está configurada:

1. ✅ Backend rodando e conectado
2. ✅ Extensão configurada com backend
3. ✅ Sistema de fallback ativo
4. ✅ Testes de conexão bem-sucedidos

Você pode:
- Usar a extensão normalmente - ela escolherá o melhor provider automaticamente
- Configurar preferências na página de opções
- Monitorar estatísticas de uso
- Adicionar mais providers de IA conforme necessário

## 📚 Arquivos Criados

```
devmentor-ai/
├── backend/
│   ├── .env                        # Configuração do backend
│   ├── .env.example                # Template de configuração
│   └── secure-api-proxy.js         # Servidor backend
├── utils/
│   ├── api-client.js              # Cliente HTTP para backend
│   ├── backend-config.js          # Gerenciador de configuração
│   ├── auth-manager.js            # Gerenciador de autenticação
│   └── ai-provider-fallback.js    # Sistema de fallback
└── background/
    └── service-worker.js          # Service Worker atualizado
```

## 🆘 Suporte

Se encontrar problemas:

1. Verifique os logs do Service Worker: `chrome://extensions/` → DevMentor AI → service worker
2. Verifique os logs do backend no terminal
3. Abra uma issue no GitHub com logs relevantes

---

**Versão**: 1.0.0
**Data**: 2025-01-19
**Status**: Production-Ready
