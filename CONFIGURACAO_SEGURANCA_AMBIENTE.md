# 🔒 CONFIGURAÇÃO DE SEGURANÇA - VARIÁVEIS DE AMBIENTE

## 📋 **VARIÁVEIS NECESSÁRIAS**

### **Backend (secure-api-proxy.js)**
```bash
# CORS - Origens permitidas (separadas por vírgula)
ALLOWED_ORIGINS=https://app.yourdomain.com,chrome-extension://your_extension_id,http://localhost:3000

# API Keys (apenas no servidor)
OPENAI_API_KEY=sk-your-openai-key-here
GEMINI_API_KEY=your-gemini-key-here
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key-here

# Configurações de segurança
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### **Frontend (React App)**
```bash
# Supabase (chaves publishable são seguras no frontend)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Configurações de desenvolvimento
VITE_APP_ENV=production
VITE_API_BASE_URL=https://your-api-domain.com
```

---

## 🚨 **IMPORTANTE - SEGURANÇA**

### **✅ CHAVES SEGURAS (apenas no servidor):**
- `OPENAI_API_KEY`
- `GEMINI_API_KEY` 
- `ANTHROPIC_API_KEY`

### **✅ CHAVES PUBLISHABLE (ok no frontend):**
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_URL`

### **❌ NUNCA NO FRONTEND:**
- Chaves secretas de API
- Tokens de autenticação
- Senhas ou credenciais

---

## 🔧 **CONFIGURAÇÃO PARA DESENVOLVIMENTO**

### **1. Backend Local:**
```bash
# .env (no diretório backend/)
ALLOWED_ORIGINS=http://localhost:3000,chrome-extension://abcd1234
OPENAI_API_KEY=sk-your-key-here
GEMINI_API_KEY=your-gemini-key-here
```

### **2. Frontend Local:**
```bash
# .env.local (no diretório frontend-custom/)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_API_BASE_URL=http://localhost:8000
```

---

## 🌐 **CONFIGURAÇÃO PARA PRODUÇÃO**

### **1. Servidor de Produção:**
```bash
# Variáveis de ambiente do servidor
ALLOWED_ORIGINS=https://app.yourdomain.com,chrome-extension://published_extension_id
OPENAI_API_KEY=sk-prod-key-here
GEMINI_API_KEY=prod-gemini-key-here
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=50
```

### **2. Build de Produção:**
```bash
# .env.production (no diretório frontend-custom/)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_API_BASE_URL=https://api.yourdomain.com
```

---

## 🔍 **COMO OBTER O ID DA EXTENSÃO**

### **Desenvolvimento:**
1. Carregue a extensão via `chrome://extensions` → "Load unpacked"
2. Copie o ID da extensão (ex: `abcd1234efgh5678`)
3. Adicione `chrome-extension://abcd1234efgh5678` ao `ALLOWED_ORIGINS`

### **Produção:**
1. Publique no Chrome Web Store
2. Copie o ID final da extensão
3. Atualize `ALLOWED_ORIGINS` com o ID final

---

## 🧪 **TESTE DE CORS**

### **Teste com curl:**
```bash
# Deve falhar (origem não permitida)
curl -i -X OPTIONS https://your-api.com/api/analyze -H "Origin: https://evil.com"

# Deve funcionar (origem permitida)
curl -i -X OPTIONS https://your-api.com/api/analyze -H "Origin: https://app.yourdomain.com"

# Deve funcionar (extensão Chrome)
curl -i -X OPTIONS https://your-api.com/api/analyze -H "Origin: chrome-extension://your_extension_id"
```

---

## 📝 **CHECKLIST DE SEGURANÇA**

### **✅ ANTES DO DEPLOY:**
- [ ] Todas as chaves secretas estão apenas no servidor
- [ ] `ALLOWED_ORIGINS` contém apenas origens necessárias
- [ ] Rate limiting configurado adequadamente
- [ ] Logs não expõem dados sensíveis
- [ ] CSP configurado sem `unsafe-inline` ou `unsafe-eval`

### **✅ APÓS O DEPLOY:**
- [ ] Testar CORS com origens permitidas
- [ ] Testar CORS com origens não permitidas
- [ ] Verificar logs de segurança
- [ ] Monitorar tentativas de acesso
- [ ] Validar rate limiting

---

## 🚀 **COMANDOS ÚTEIS**

### **Verificar variáveis de ambiente:**
```bash
# Backend
node -e "console.log(process.env.ALLOWED_ORIGINS)"

# Frontend
npm run build && grep -r "VITE_" dist/
```

### **Testar CORS:**
```bash
# Instalar node-fetch se necessário
npm install node-fetch

# Teste de CORS
node -e "
const fetch = require('node-fetch');
(async () => {
  const res = await fetch('https://your-api.com/api/analyze', {
    method: 'OPTIONS',
    headers: { Origin: 'chrome-extension://your_extension_id' }
  });
  console.log(res.status, await res.text());
})();
"
```

**Sua extensão está configurada com segurança máxima!** 🛡️











