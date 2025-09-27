# 🤖 DevMentor AI - Chrome Extension

> **Sistema completo de análise de código com múltiplos provedores de IA, fallback inteligente e modo offline**

## 🚀 Características Principais

### 🔒 Segurança Empresarial
- **EvalManager Seguro**: Substitui `eval()` e `new Function()` por execução segura
- **Sanitização HTML**: Previne XSS com DOMPurify integrado
- **Logger com Redaction**: Mascara dados sensíveis automaticamente
- **Monitoramento de Segurança**: Detecta atividades suspeitas em tempo real
- **Validação de Entrada**: Valida e sanitiza todas as entradas do usuário
- **Detecção de Anomalias**: Identifica comportamentos anômalos

### 🤖 Múltiplos Provedores de IA
- **OpenAI**: GPT-4, GPT-3.5-turbo
- **Claude**: Claude-3 Opus, Sonnet, Haiku
- **Gemini**: Google Gemini Pro
- **DeepSeek**: DeepSeek Chat e Coder
- **Fallback Inteligente**: Escolha automática baseada em custo/velocidade/qualidade
- **Modo Offline**: Chrome AI Gemini Nano quando sem internet

### 📊 Sistema de Cache Inteligente
- **Cache LRU**: Least Recently Used com TTL
- **Compressão**: Reduz uso de memória
- **Persistência**: Sobrevive a reinicializações
- **Cache Específico**: Para análises de código, screenshots e respostas de IA

### 🌐 Monitoramento de Rede
- **Health Check**: Verifica conectividade e qualidade
- **Detecção de Latência**: Monitora performance da rede
- **Fallback Automático**: Muda para offline quando necessário
- **Diagnóstico**: Relatórios detalhados de conectividade

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                    DevMentor AI Integration                  │
├─────────────────────────────────────────────────────────────┤
│  Security Systems    │  AI Systems      │  Infrastructure   │
│  ├─ Security Monitor │  ├─ AI Provider  │  ├─ Local Cache   │
│  ├─ Anomaly Detect  │  └─ Multi-Provider│  ├─ Network Health│
│  ├─ Input Validator │                   │  └─ Health Check  │
│  └─ Secure Logger   │                   │                   │
└─────────────────────────────────────────────────────────────┘
```

### 🔧 Componentes Principais

#### 1. **Sistemas de Segurança**
- `SecurityMonitoringSystem`: Monitora atividades suspeitas
- `AnomalyDetectionSystem`: Detecta comportamentos anômalos
- `RobustInputValidator`: Valida todas as entradas
- `SecureEvalManager`: Execução segura de código
- `SecureHtmlSanitizer`: Sanitização HTML robusta
- `SecureLogger`: Logging com redaction

#### 2. **Sistemas de IA**
- `AIProviderManager`: Gerencia múltiplos provedores
- `APIConfigManager`: Configuração de APIs
- Fallback inteligente baseado em custo/velocidade/qualidade
- Modo offline com Chrome AI Gemini Nano

#### 3. **Infraestrutura**
- `LocalCacheSystem`: Cache LRU com TTL e compressão
- `NetworkHealthChecker`: Monitoramento de rede
- `DevMentorAIIntegration`: Sistema de integração principal

## 📁 Estrutura de Arquivos

```
devmentor-ai/
├── backend/                          # Backend proxy seguro
│   ├── secure-api-proxy.js           # Servidor proxy Node.js
│   ├── package.json                  # Dependências do backend
│   └── env.example                   # Variáveis de ambiente
├── options/                          # Página de configuração
│   ├── options.html                  # Interface de configuração
│   └── options.js                    # Lógica de configuração
├── utils/                            # Utilitários de segurança
│   ├── secure-eval-manager.js        # EvalManager seguro
│   ├── secure-html-sanitizer.js      # Sanitização HTML
│   ├── secure-logger.js              # Logger com redaction
│   ├── security-monitoring-system.js # Monitoramento de segurança
│   ├── robust-input-validator.js     # Validação de entrada
│   ├── anomaly-detection-system.js   # Detecção de anomalias
│   ├── ai-provider-manager.js        # Gerenciador de IA
│   ├── local-cache-system.js         # Sistema de cache
│   ├── network-health-checker.js     # Verificação de rede
│   └── devmentor-ai-integration.js   # Sistema de integração
├── content/                          # Scripts de conteúdo
│   ├── code-analyzer.js              # Analisador de código
│   ├── screenshot-handler.js         # Manipulador de screenshots
│   ├── ui-manager.js                 # Gerenciador de UI
│   └── content-script.js             # Script principal
├── tests/                            # Testes de segurança
│   ├── penetration-test-suite.js     # Testes de penetração
│   ├── e2e-test-suite.js             # Testes end-to-end
│   ├── html-sanitization-test.js     # Testes de sanitização
│   ├── logger-redaction-test.js      # Testes de redaction
│   └── sync-conflict-integration-test.js # Testes de sincronização
├── docs/                             # Documentação
│   ├── security-validation-checklist.md # Checklist de segurança
│   ├── critical-audit-findings.md    # Achados críticos
│   ├── security-fixes-summary.md     # Resumo de correções
│   └── rollback-plan.js              # Plano de rollback
├── scripts/                          # Scripts de automação
│   └── apply-security-fixes.sh       # Aplicar correções
└── manifest.json                     # Manifesto da extensão
```

## 🚀 Instalação e Configuração

### 1. **Instalação da Extensão**
```bash
# Clonar repositório
git clone https://github.com/devmentor-ai/chrome-extension.git
cd chrome-extension

# Instalar dependências do backend (opcional)
cd backend
npm install
npm start
```

### 2. **Configuração de APIs**
1. Abra a página de opções da extensão
2. Configure suas chaves de API:
   - OpenAI: `sk-...`
   - Claude: `sk-ant-...`
   - Gemini: `AIza...`
   - DeepSeek: `sk-...`
3. Escolha estratégia de fallback
4. Configure cache e outras opções

### 3. **Configuração do Backend (Opcional)**
```bash
# Copiar arquivo de ambiente
cp backend/env.example backend/.env

# Configurar variáveis
OPENAI_API_KEY=sk-your-key-here
ANTHROPIC_API_KEY=sk-ant-your-key-here
GOOGLE_API_KEY=your-google-key-here
DEEPSEEK_API_KEY=sk-your-key-here

# Iniciar servidor
npm start
```

## 🔧 Uso

### **Análise de Código**
```javascript
// Usar sistema integrado
const integration = new DevMentorAIIntegration();
await integration.initialize();

// Analisar código
const result = await integration.analyzeCode(code, 'explain', {
  language: 'javascript',
  complexity: 'medium'
});

console.log(result.result);
```

### **Análise de Screenshot**
```javascript
// Analisar screenshot
const result = await integration.analyzeScreenshot(imageData, 'explain');
console.log(result.result);
```

### **Chamada Direta de IA**
```javascript
// Chamar IA diretamente
const result = await integration.callAI(prompt, {
  complexity: 'high',
  provider: 'openai'
});
console.log(result.result);
```

## 🛡️ Segurança

### **Vulnerabilidades Corrigidas**
- ✅ **Execução Arbitrária**: EvalManager seguro substitui `eval()`
- ✅ **XSS**: Sanitização HTML com DOMPurify
- ✅ **Exposição de Dados**: Logger com redaction automática
- ✅ **Chaves de API**: Backend proxy protege chaves
- ✅ **Validação de Entrada**: Validação robusta de todas as entradas
- ✅ **Monitoramento**: Detecção de atividades suspeitas

### **Testes de Segurança**
```bash
# Executar testes de penetração
node tests/penetration-test-suite.js

# Executar testes de sanitização
node tests/html-sanitization-test.js

# Executar testes de redaction
node tests/logger-redaction-test.js
```

## 📊 Monitoramento

### **Estatísticas de Sistema**
```javascript
// Obter status do sistema
const status = integration.getSystemStatus();
console.log(status);

// Gerar relatório de diagnóstico
const report = await integration.generateDiagnosticReport();
console.log(report);
```

### **Métricas de Segurança**
- Tentativas de XSS bloqueadas
- Execuções de código perigosas detectadas
- Acessos não autorizados
- Dados sensíveis expostos

### **Métricas de Performance**
- Taxa de cache hit
- Latência de rede
- Uso de provedores de IA
- Modo offline vs online

## 🔄 Fallback Inteligente

### **Estratégias de Escolha**
- **Custo**: Prioriza provedores mais baratos
- **Velocidade**: Prioriza provedores mais rápidos
- **Qualidade**: Prioriza provedores de melhor qualidade
- **Equilibrado**: Balanceia custo, velocidade e qualidade

### **Modo Offline**
- Chrome AI Gemini Nano quando sem internet
- Cache local para respostas anteriores
- Análise básica como último recurso

## 🧪 Testes

### **Testes de Segurança**
```bash
# Testes de penetração
npm run test:penetration

# Testes de sanitização
npm run test:sanitization

# Testes de redaction
npm run test:redaction
```

### **Testes de Integração**
```bash
# Testes end-to-end
npm run test:e2e

# Testes de sincronização
npm run test:sync
```

## 📈 Performance

### **Otimizações**
- Cache LRU com TTL
- Compressão de dados
- Fallback inteligente
- Validação assíncrona
- Monitoramento de recursos

### **Limites**
- Cache: 1000 itens por padrão
- TTL: 1 hora por padrão
- Timeout: 30 segundos
- Tamanho máximo: 10MB por requisição

## 🤝 Contribuição

### **Desenvolvimento**
1. Fork o repositório
2. Crie uma branch para sua feature
3. Implemente com testes
4. Execute testes de segurança
5. Submeta um pull request

### **Segurança**
- Reporte vulnerabilidades via email
- Não divulgue vulnerabilidades publicamente
- Use testes de penetração antes de commits

## 📄 Licença

MIT License - veja [LICENSE](LICENSE) para detalhes.

## 🆘 Suporte

- **Documentação**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/devmentor-ai/chrome-extension/issues)
- **Email**: maurulycan@gmail.com

---

**Desenvolvido com ❤️ por Mauro de Oliveira Cardoso**