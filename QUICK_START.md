# DevMentor AI - Quick Start Guide

Guia rápido para iniciar a integração backend-frontend em 5 minutos.

## 🚀 Setup em 5 Passos

### 1. Backend Setup (2 min)

```bash
# Entrar na pasta do backend
cd devmentor-ai/backend

# Instalar dependências
npm install

# Gerar token seguro
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Copiar e editar .env
# Windows: copy .env.example .env
# Linux/Mac: cp .env.example .env

# Editar .env com seu editor favorito
# - Adicionar o token gerado em API_TOKEN
# - (Opcional) Adicionar API keys do OpenAI, Anthropic ou Google

# Iniciar backend
npm run dev
```

✅ Backend rodando em `http://localhost:3001`

### 2. Instalar Extensão Chrome (1 min)

1. Abra `chrome://extensions/`
2. Ative "Modo do desenvolvedor" (canto superior direito)
3. Clique "Carregar sem compactação"
4. Selecione a pasta `devmentor-ai/`

✅ Extensão instalada

### 3. Obter Extension ID (30 seg)

1. Em `chrome://extensions/`, copie o ID da extensão
2. Exemplo: `abcdefghijklmnopqrstuvwxyz123456`

### 4. Configurar CORS (30 seg)

Edite `devmentor-ai/backend/.env`:

```env
ALLOWED_ORIGINS=chrome-extension://SEU_EXTENSION_ID_AQUI,http://localhost:8080
```

Reinicie o backend (Ctrl+C e `npm run dev`)

### 5. Configurar Extensão (1 min)

1. Abra `chrome-extension://SEU_EXTENSION_ID/backend-settings.html`
2. Configure:
   - **Backend URL**: `http://localhost:3001`
   - **API Token**: O token que você gerou
   - **Preferred Provider**: `openai` (ou outro)
   - **Enable Backend**: ✅
   - **Fallback to Local AI**: ✅
3. Clique "💾 Salvar Configurações"
4. Clique "🔌 Testar Conexão"

✅ Deve aparecer: "Conexão bem-sucedida!"

## 🎉 Pronto!

Agora você pode:

1. Ir para qualquer site com código (GitHub, StackOverflow, etc)
2. Selecionar um trecho de código
3. Clicar com botão direito → "DevMentor AI" → "Explain Code"
4. Ver a análise aparecer!

## 🔧 Configuração Mínima (.env)

```env
# Essencial
PORT=3001
NODE_ENV=development
API_TOKEN=seu_token_de_32_caracteres_aqui
ALLOWED_ORIGINS=chrome-extension://seu_extension_id,http://localhost:8080

# Opcional (se quiser usar APIs externas)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=...
```

## 📚 Documentação Completa

- [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) - Guia completo de integração
- [TESTING_GUIDE.md](./TESTING_GUIDE.md) - Testes end-to-end
- [ARCHITECTURE.md](./devmentor-ai/ARCHITECTURE.md) - Arquitetura do sistema

## 🆘 Problemas?

### Backend não inicia

```bash
# Verifique se a porta 3001 está livre
netstat -ano | findstr :3001  # Windows
lsof -i :3001                  # Linux/Mac
```

### Extensão não carrega

1. Verifique erros em `chrome://extensions/`
2. Recarregue a extensão (botão de reload)

### Teste de conexão falha

1. Verifique se o backend está rodando
2. Verifique se o token está correto
3. Verifique se o Extension ID está no CORS

---

**Tempo total**: ~5 minutos
**Dificuldade**: Fácil
**Status**: Production-Ready
