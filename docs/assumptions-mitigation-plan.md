# 🚨 DevMentor AI - Plano de Mitigação de Suposições Implícitas

> **Análise crítica das suposições implícitas e estratégias de mitigação**

## 📋 **Resumo Executivo**

Este documento identifica e mitiga suposições implícitas críticas no sistema DevMentor AI que podem levar a falhas de segurança, perda de dados e comportamento degradado em produção.

---

## 🔍 **Suposições Identificadas e Mitigações**

### 1. **"O modelo AI local sempre existir/ser compatível"**

#### ⚠️ **Por que pode falhar:**
- Diferentes máquinas têm configurações distintas
- Paths de instalação variam entre sistemas
- Permissões podem ser insuficientes
- Versões incompatíveis do Chrome/Node.js
- Falha → crash ou comportamento degradado

#### 🎯 **Severidade:** Alta | **Esforço:** Médio

#### ✅ **Mitigações Implementadas:**

```javascript
// 1. Verificação robusta de disponibilidade
async _checkAIAvailabilityDetailed() {
  const checks = {
    chromeAI: await this._checkChromeAI(),
    permissions: await this._checkPermissions(),
    resources: await this._checkResources(),
    compatibility: await this._checkCompatibility()
  };
  
  return {
    available: Object.values(checks).every(check => check.success),
    details: checks,
    fallbacks: this._getFallbackOptions(checks)
  };
}

// 2. Sistema de fallback automático
async _initializeWithFallbacks() {
  try {
    await this._initializePrimaryAI();
  } catch (error) {
    this.logger.warn('[AISessionManager] Primary AI failed, trying fallbacks');
    await this._initializeFallbackAI();
  }
}

// 3. Health monitoring contínuo
_startHealthMonitoring() {
  setInterval(async () => {
    const health = await this._checkAIHealth();
    if (!health.healthy) {
      await this._triggerFallback();
    }
  }, 15000);
}
```

#### 📊 **Métricas de Monitoramento:**
- Taxa de falha de inicialização AI
- Tempo de resposta do modelo
- Disponibilidade de recursos
- Compatibilidade de versão

---

### 2. **"Entradas de regras/KB são confiáveis (podem ser eval-adas)"**

#### ⚠️ **Por que pode falhar:**
- Regra maliciosa pode executar código no contexto do app
- Code injection através de expressões dinâmicas
- Acesso não autorizado a APIs sensíveis
- Comprometimento de dados do usuário

#### 🎯 **Severidade:** Crítica (Alta) | **Esforço:** Alto

#### ✅ **Mitigações Implementadas:**

```javascript
// 1. EvalManager com whitelist rigorosa
class EvalManager {
  constructor() {
    // Tokens completamente proibidos
    this.forbiddenTokens = new Set([
      'eval', 'Function', 'setTimeout', 'setInterval', 'setImmediate',
      'require', 'import', 'module', 'exports', 'global', 'process',
      'window', 'document', 'location', 'history', 'navigator',
      'fetch', 'XMLHttpRequest', 'WebSocket', 'Worker',
      'constructor', 'prototype', '__proto__', '__defineGetter__', '__defineSetter__',
      'call', 'apply', 'bind', 'toString', 'valueOf',
      'delete', 'new', 'this', 'super', 'arguments',
      'with', 'debugger', 'yield', 'await', 'async'
    ]);
    
    // Apenas operações matemáticas seguras
    this.allowedOperations = new Set([
      '+', '-', '*', '/', '%', '**', '===', '!==', '==', '!=',
      '<', '>', '<=', '>=', '&&', '||', '!', '?', ':',
      '(', ')', '[', ']', '.', ',', ';'
    ]);
  }

  // 2. Validação rigorosa de expressões
  validateExpression(expression) {
    if (typeof expression !== 'string') {
      throw new Error('Expression must be a string');
    }
    
    if (expression.length > this.maxExpressionLength) {
      throw new Error('Expression too long');
    }
    
    // Verificar tokens proibidos
    const tokens = this._tokenizeExpression(expression);
    for (const token of tokens) {
      if (this.forbiddenTokens.has(token)) {
        throw new Error(`Forbidden token: ${token}`);
      }
    }
    
    // Verificar profundidade de aninhamento
    const depth = this._calculateNestingDepth(expression);
    if (depth > this.maxNestingDepth) {
      throw new Error('Expression too deeply nested');
    }
  }

  // 3. Fallback server-side para expressões complexas
  async evaluateWithFallback(expression, context, options) {
    const response = await fetch(this.fallbackEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        expression,
        context: this._sanitizeContext(context),
        options
      })
    });
    
    if (!response.ok) {
      throw new Error('Fallback evaluation failed');
    }
    
    return await response.json();
  }
}
```

#### 📊 **Métricas de Monitoramento:**
- Tentativas de execução de código malicioso
- Taxa de falha de validação de expressões
- Uso do fallback server-side
- Tempo de resposta da validação

---

### 3. **"Dados HTML recebidos podem ser inseridos com innerHTML sem sanitizar"**

#### ⚠️ **Por que pode falhar:**
- XSS em content script/popup
- Execução arbitrária no browser
- Roubo de cookies/sessões
- Redirecionamento malicioso

#### 🎯 **Severidade:** Alta | **Esforço:** Baixo→Médio

#### ✅ **Mitigações Implementadas:**

```javascript
// 1. HTMLSanitizer robusto
class HTMLSanitizer {
  constructor() {
    this.allowedTags = new Set([
      'p', 'div', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'strong', 'em', 'b', 'i', 'u', 'code', 'pre', 'blockquote',
      'ul', 'ol', 'li', 'a', 'img', 'br', 'hr'
    ]);
    
    this.allowedAttributes = new Set([
      'class', 'id', 'href', 'src', 'alt', 'title', 'data-*'
    ]);
    
    this.dangerousPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /<iframe\b[^>]*>.*?<\/iframe>/gi,
      /<object\b[^>]*>.*?<\/object>/gi,
      /<embed\b[^>]*>/gi,
      /<form\b[^>]*>.*?<\/form>/gi,
      /<input\b[^>]*>/gi,
      /<button\b[^>]*>.*?<\/button>/gi,
      /\s*on\w+\s*=\s*["'][^"']*["']/gi,
      /\s*javascript:\s*[^"'\s>]*/gi,
      /\s*vbscript:\s*[^"'\s>]*/gi
    ];
  }

  // 2. Sanitização segura
  sanitize(html, config = {}) {
    if (typeof html !== 'string') return '';
    
    let sanitized = html;
    
    // Remover padrões perigosos
    this.dangerousPatterns.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });
    
    // Validar tags permitidas
    sanitized = this._validateTags(sanitized, config);
    
    // Escapar caracteres especiais
    sanitized = this._escapeSpecialChars(sanitized);
    
    return sanitized;
  }

  // 3. Método seguro para innerHTML
  safeInnerHTML(element, html, config = {}) {
    try {
      if (!element || typeof element.innerHTML !== 'string') {
        throw new Error('Invalid element provided');
      }
      
      const sanitized = this.sanitize(html, config);
      element.innerHTML = sanitized;
      
      this.logger.debug('[HTMLSanitizer] Safe innerHTML set successfully');
      
    } catch (error) {
      this.logger.error('[HTMLSanitizer] Safe innerHTML failed:', error.message);
      // Fallback: usar textContent
      element.textContent = html;
    }
  }
}
```

#### 📊 **Métricas de Monitoramento:**
- Tentativas de XSS bloqueadas
- Taxa de uso do fallback textContent
- Tempo de sanitização
- Conteúdo malicioso detectado

---

### 4. **"Chaves/API keys podem ficar no código cliente"**

#### ⚠️ **Por que pode falhar:**
- Clientes são facilmente inspecionáveis
- Chaves vazam em logs/telemetria
- Acesso não autorizado a APIs
- Custos inesperados de API

#### 🎯 **Severidade:** Alta | **Esforço:** Alto

#### ✅ **Mitigações Implementadas:**

```javascript
// 1. Armazenamento seguro em Chrome Storage
class SecureAPIManager {
  constructor() {
    this.storageKey = 'devmentor_secure_api';
    this.encryptionKey = this._generateEncryptionKey();
  }

  async saveAPIKey(apiKey, provider) {
    try {
      // Validar formato da chave
      if (!this._validateAPIKey(apiKey, provider)) {
        throw new Error('Invalid API key format');
      }
      
      // Criptografar antes de armazenar
      const encrypted = await this._encrypt(apiKey);
      
      await chrome.storage.local.set({
        [this.storageKey]: {
          encrypted,
          provider,
          timestamp: Date.now(),
          version: '1.0'
        }
      });
      
      this.logger.info('[SecureAPIManager] API key saved securely');
      
    } catch (error) {
      this.logger.error('[SecureAPIManager] Failed to save API key:', error);
      throw error;
    }
  }

  async getAPIKey(provider) {
    try {
      const result = await chrome.storage.local.get([this.storageKey]);
      const data = result[this.storageKey];
      
      if (!data || data.provider !== provider) {
        return null;
      }
      
      // Descriptografar
      const decrypted = await this._decrypt(data.encrypted);
      
      return decrypted;
      
    } catch (error) {
      this.logger.error('[SecureAPIManager] Failed to retrieve API key:', error);
      return null;
    }
  }

  // 2. Validação de formato de chave
  _validateAPIKey(apiKey, provider) {
    const patterns = {
      openai: /^sk-[a-zA-Z0-9]{20,}$/,
      anthropic: /^sk-ant-[a-zA-Z0-9\-_]{20,}$/,
      google: /^[a-zA-Z0-9\-_]{20,}$/
    };
    
    return patterns[provider]?.test(apiKey) || false;
  }

  // 3. Criptografia simples mas efetiva
  async _encrypt(text) {
    // Implementação de criptografia usando Web Crypto API
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(this.encryptionKey),
      { name: 'AES-GCM' },
      false,
      ['encrypt']
    );
    
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );
    
    return {
      encrypted: Array.from(new Uint8Array(encrypted)),
      iv: Array.from(iv)
    };
  }
}
```

#### 📊 **Métricas de Monitoramento:**
- Tentativas de acesso não autorizado
- Taxa de validação de chaves
- Uso de criptografia
- Falhas de autenticação

---

### 5. **"Console.log é inócuo"**

#### ⚠️ **Por que pode falhar:**
- Logs exibem dados sensíveis
- Poluem telemetria
- Vazamento de informações em produção
- Performance degradada

#### 🎯 **Severidade:** Média | **Esforço:** Baixo

#### ✅ **Mitigações Implementadas:**

```javascript
// 1. Logger com redaction automática
class DevMentorLogger {
  constructor() {
    this.levels = {
      DEBUG: 0,
      INFO: 1,
      WARN: 2,
      ERROR: 3,
      CRITICAL: 4
    };
    
    this.currentLevel = this.getDefaultLevel();
    this.enableRedaction = true;
    
    // Padrões de redaction
    this.secretPatterns = [
      /api[_-]?key["\s]*[:=]["\s]*([^"'\s,}]+)/gi,
      /secret["\s]*[:=]["\s]*([^"'\s,}]+)/gi,
      /token["\s]*[:=]["\s]*([^"'\s,}]+)/gi,
      /bearer\s+([a-zA-Z0-9\-._~+/]+=*)/gi,
      /sk-[a-zA-Z0-9]{20,}/gi,
      /pk_[a-zA-Z0-9]{20,}/gi,
      /[a-zA-Z0-9]{32,}/g,
      /https?:\/\/[^:]+:[^@]+@/gi,
      /password["\s]*[:=]["\s]*([^"'\s,}]+)/gi,
      /eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/g
    ];
  }

  // 2. Redaction automática
  redactString(str) {
    if (typeof str !== 'string') return str;
    
    let redacted = str;
    
    this.secretPatterns.forEach(pattern => {
      redacted = redacted.replace(pattern, (match, ...groups) => {
        return match.replace(groups[0], '[REDACTED]');
      });
    });
    
    return redacted;
  }

  // 3. Controle de nível por ambiente
  getDefaultLevel() {
    if (typeof window !== 'undefined' && window.location) {
      if (window.location.hostname === 'localhost') {
        return this.levels.DEBUG;
      } else if (window.location.hostname.includes('staging')) {
        return this.levels.INFO;
      } else {
        return this.levels.WARN; // Produção
      }
    }
    return this.levels.INFO;
  }

  // 4. Logging condicional
  log(level, message, ...args) {
    if (level < this.currentLevel) return;
    
    const redactedArgs = args.map(arg => this.redact(arg));
    const redactedMessage = this.redactString(message);
    
    console[this._getConsoleMethod(level)](redactedMessage, ...redactedArgs);
  }
}
```

#### 📊 **Métricas de Monitoramento:**
- Quantidade de dados redacted
- Nível de log atual
- Performance do logging
- Vazamentos detectados

---

### 6. **"Sincronização híbrida (offline/online) resolve-se com simples last-write"**

#### ⚠️ **Por que pode falhar:**
- Relógios/perfis conflitantes
- Perda de dados sem merge
- Conflitos de versão não resolvidos
- Inconsistência de estado

#### 🎯 **Severidade:** Alta | **Esforço:** Médio→Alto

#### ✅ **Mitigações Implementadas:**

```javascript
// 1. Sistema de versionamento robusto
class VersionedSyncSystem {
  constructor() {
    this.clientId = this.generateClientId();
    this.syncQueue = [];
    this.conflictQueue = [];
    this.isOnline = navigator.onLine;
    this.syncInProgress = false;
  }

  // 2. Resolução inteligente de conflitos
  async applyIncoming(remote, key) {
    try {
      const local = await this.getLocalRecord(key);
      
      if (!local) {
        // Primeira vez, aceitar remoto
        await this.saveLocalRecord(key, remote);
        return { success: true, action: 'created' };
      }

      // Resolver conflito baseado em versão
      if (remote._meta.version > local._meta.version) {
        // Remoto é mais novo, aceitar
        await this.saveLocalRecord(key, remote);
        return { success: true, action: 'updated', reason: 'newer_version' };
        
      } else if (remote._meta.version === local._meta.version) {
        // Versões iguais, tentar merge
        const mergeResult = await this.mergeRecords(local, remote, key);
        if (mergeResult.success) {
          await this.saveLocalRecord(key, mergeResult.merged);
          return { success: true, action: 'merged', conflicts: mergeResult.conflicts };
        } else {
          // Merge falhou, adicionar à fila de conflitos
          await this.addToConflictQueue(key, local, remote);
          return { success: false, action: 'conflict', error: mergeResult.error };
        }
        
      } else {
        // Remoto é mais antigo, ignorar ou enviar local
        return { success: true, action: 'ignored', reason: 'older_version' };
      }
      
    } catch (error) {
      this.logger.error('[VersionedSyncSystem] Failed to apply incoming data:', error);
      return { success: false, error: error.message };
    }
  }

  // 3. Merge inteligente de registros
  async mergeRecords(local, remote, key) {
    try {
      const conflicts = [];
      const merged = { ...local };
      
      // Merge por campo
      for (const [field, remoteValue] of Object.entries(remote)) {
        if (field === '_meta') continue;
        
        const localValue = local[field];
        
        if (this._isSimpleValue(remoteValue) && this._isSimpleValue(localValue)) {
          // Valores simples, usar estratégia de merge
          if (this._shouldPreferRemote(localValue, remoteValue, field)) {
            merged[field] = remoteValue;
          }
        } else if (typeof remoteValue === 'object' && typeof localValue === 'object') {
          // Objetos, merge recursivo
          const subMerge = await this.mergeRecords(localValue, remoteValue, `${key}.${field}`);
          if (subMerge.success) {
            merged[field] = subMerge.merged;
            conflicts.push(...subMerge.conflicts);
          } else {
            conflicts.push({
              field: `${key}.${field}`,
              local: localValue,
              remote: remoteValue,
              reason: subMerge.error
            });
          }
        } else {
          // Tipos diferentes, conflito
          conflicts.push({
            field: `${key}.${field}`,
            local: localValue,
            remote: remoteValue,
            reason: 'type_mismatch'
          });
        }
      }
      
      // Atualizar metadados
      merged._meta = this.createVersionedRecord(merged)._meta;
      merged._meta.version = Math.max(local._meta.version, remote._meta.version) + 1;
      merged._meta.lastModified = Date.now();
      merged._meta.mergedFrom = [local._meta.clientId, remote._meta.clientId];
      
      return {
        success: conflicts.length === 0,
        merged,
        conflicts
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // 4. Detecção de conflitos em tempo real
  async detectConflicts() {
    const conflicts = [];
    
    for (const [key, local] of this.localRecords) {
      const remote = await this.getRemoteRecord(key);
      if (remote && this._hasConflict(local, remote)) {
        conflicts.push({
          key,
          local,
          remote,
          severity: this._calculateConflictSeverity(local, remote)
        });
      }
    }
    
    return conflicts;
  }
}
```

#### 📊 **Métricas de Monitoramento:**
- Taxa de conflitos de sincronização
- Tempo de resolução de conflitos
- Eficácia do merge automático
- Perda de dados detectada

---

### 7. **"Uso de APIs nativas (child_process/fs) é seguro em todos os contextos"**

#### ⚠️ **Por que pode falhar:**
- Em extensões/web isso é inválido
- Em desktop precisa validação rigorosa
- Path traversal attacks
- Execução de comandos arbitrários

#### 🎯 **Severidade:** Alta | **Esforço:** Alto

#### ✅ **Mitigações Implementadas:**

```javascript
// 1. Detecção de contexto de execução
class ContextAwareAPI {
  constructor() {
    this.context = this._detectContext();
    this.safeAPIs = this._getSafeAPIs();
  }

  _detectContext() {
    if (typeof window !== 'undefined' && window.chrome && window.chrome.runtime) {
      return 'extension';
    } else if (typeof process !== 'undefined' && process.versions && process.versions.node) {
      return 'nodejs';
    } else if (typeof window !== 'undefined') {
      return 'browser';
    } else {
      return 'unknown';
    }
  }

  _getSafeAPIs() {
    const safeAPIs = {
      extension: ['chrome.storage', 'chrome.tabs', 'chrome.runtime'],
      browser: ['fetch', 'localStorage', 'sessionStorage', 'crypto'],
      nodejs: ['fs', 'path', 'crypto', 'util']
    };
    
    return safeAPIs[this.context] || [];
  }

  // 2. Validação de paths
  validatePath(path, basePath = null) {
    if (typeof path !== 'string') {
      throw new Error('Path must be a string');
    }
    
    // Normalizar path
    const normalizedPath = path.replace(/\\/g, '/');
    
    // Verificar path traversal
    if (normalizedPath.includes('../') || normalizedPath.includes('..\\')) {
      throw new Error('Path traversal detected');
    }
    
    // Verificar se está dentro do diretório base
    if (basePath) {
      const resolvedPath = this._resolvePath(normalizedPath, basePath);
      if (!resolvedPath.startsWith(basePath)) {
        throw new Error('Path outside allowed directory');
      }
    }
    
    return normalizedPath;
  }

  // 3. Execução segura de comandos
  async safeExecute(command, args = [], options = {}) {
    if (this.context !== 'nodejs') {
      throw new Error('Command execution not available in this context');
    }
    
    // Validar comando
    const allowedCommands = ['node', 'npm', 'git'];
    if (!allowedCommands.includes(command)) {
      throw new Error(`Command not allowed: ${command}`);
    }
    
    // Validar argumentos
    const sanitizedArgs = args.map(arg => this._sanitizeArgument(arg));
    
    // Executar com timeout
    const timeout = options.timeout || 30000;
    const result = await this._executeWithTimeout(command, sanitizedArgs, timeout);
    
    return result;
  }

  // 4. Acesso seguro a arquivos
  async safeFileAccess(operation, path, data = null) {
    if (this.context !== 'nodejs') {
      throw new Error('File access not available in this context');
    }
    
    const fs = require('fs');
    const validatedPath = this.validatePath(path);
    
    switch (operation) {
      case 'read':
        return await fs.promises.readFile(validatedPath, 'utf8');
      case 'write':
        if (!data) throw new Error('Data required for write operation');
        return await fs.promises.writeFile(validatedPath, data, 'utf8');
      case 'exists':
        return await fs.promises.access(validatedPath).then(() => true).catch(() => false);
      default:
        throw new Error(`Unknown file operation: ${operation}`);
    }
  }
}
```

#### 📊 **Métricas de Monitoramento:**
- Tentativas de path traversal
- Comandos executados
- Falhas de validação de contexto
- Acessos a arquivos bloqueados

---

## 📊 **Plano de Implementação**

### **Fase 1: Críticas (Semana 1-2)**
1. ✅ Implementar HTMLSanitizer robusto
2. ✅ Implementar EvalManager seguro
3. ✅ Implementar Logger com redaction

### **Fase 2: Altas (Semana 3-4)**
1. ✅ Implementar SecureAPIManager
2. ✅ Implementar VersionedSyncSystem
3. ✅ Implementar ContextAwareAPI

### **Fase 3: Monitoramento (Semana 5)**
1. ✅ Implementar métricas de monitoramento
2. ✅ Configurar alertas automáticos
3. ✅ Testes de penetração

---

## 🚨 **Alertas e Monitoramento**

### **Alertas Críticos**
- Tentativas de execução de código malicioso
- Vazamentos de dados sensíveis
- Falhas de autenticação de API
- Conflitos de sincronização não resolvidos

### **Alertas de Performance**
- Tempo de resposta degradado
- Uso excessivo de recursos
- Taxa de erro elevada
- Disponibilidade de serviços

### **Dashboard de Monitoramento**
```javascript
const monitoringDashboard = {
  security: {
    xssAttempts: 0,
    maliciousEvalAttempts: 0,
    apiKeyLeaks: 0,
    pathTraversalAttempts: 0
  },
  performance: {
    aiResponseTime: 0,
    syncConflictRate: 0,
    memoryUsage: 0,
    errorRate: 0
  },
  availability: {
    aiServiceUptime: 100,
    syncServiceUptime: 100,
    fallbackUsage: 0
  }
};
```

---

## ✅ **Checklist de Validação**

### **Segurança**
- [ ] HTML sanitization funcionando
- [ ] Eval restrictions ativas
- [ ] API keys criptografadas
- [ ] Logs redacted
- [ ] Path validation ativa

### **Confiabilidade**
- [ ] Fallbacks implementados
- [ ] Health checks funcionando
- [ ] Conflict resolution ativa
- [ ] Error handling robusto

### **Performance**
- [ ] Métricas coletadas
- [ ] Alertas configurados
- [ ] Dashboard funcionando
- [ ] Testes automatizados

---

## 📞 **Contatos de Emergência**

- **Lead Developer:** Mauro de Oliveira Cardoso (maurulycan@gmail.com)
- **Security Team:** security@devmentor-ai.com
- **Operations:** ops@devmentor-ai.com

---

*Este documento é atualizado continuamente conforme novas suposições são identificadas e mitigadas.*


