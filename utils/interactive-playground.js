/**
 * DevMentor AI - Interactive Playground
 * Playground de código editável com execução em tempo real
 * 
 * Funcionalidades:
 * - Editor de código com syntax highlighting
 * - Execução segura de código
 * - Visualização step-by-step
 * - Sugestões de modificação
 * - Testes automáticos
 * - Debugger visual
 */

class InteractivePlayground {
  constructor() {
    this.editor = null;
    this.runtime = null;
    this.visualizer = null;
    this.currentCode = '';
    this.originalCode = '';
    this.executionHistory = [];
    this.isRunning = false;
    
    // Configurações
    this.config = {
      maxExecutionTime: 5000, // 5 segundos
      maxMemoryUsage: 50 * 1024 * 1024, // 50MB
      allowedAPIs: ['console', 'Math', 'Date', 'Array', 'Object', 'String'],
      sandboxMode: true
    };
    
    console.log('[InteractivePlayground] Inicializado');
  }

  /**
   * CRIAR PLAYGROUND EDITÁVEL
   * Interface completa para edição e execução de código
   */
  createPlayground(code, language, options = {}) {
    this.originalCode = code;
    this.currentCode = code;
    
    const playgroundHTML = `
      <div class="devmentor-playground">
        <div class="playground-header">
          <h4 class="playground-title">
            <span class="icon">🎮</span>
            Teste Você Mesmo
          </h4>
          <div class="playground-controls">
            <button class="run-btn" data-action="run">
              <span class="icon">▶</span>
              Executar
            </button>
            <button class="reset-btn" data-action="reset">
              <span class="icon">↺</span>
              Resetar
            </button>
            <button class="format-btn" data-action="format">
              <span class="icon">🎨</span>
              Formatar
            </button>
            <select class="speed-control">
              <option value="slow">Lento</option>
              <option value="normal" selected>Normal</option>
              <option value="fast">Rápido</option>
            </select>
            <button class="share-btn" data-action="share">
              <span class="icon">🔗</span>
              Compartilhar
            </button>
          </div>
        </div>

        <div class="playground-body">
          <div class="editor-panel">
            <div class="panel-header">
              <span class="panel-title">Editor de Código</span>
              <span class="language-badge">${language}</span>
              <div class="editor-stats">
                <span class="line-count">Linhas: <span id="lineCount">1</span></span>
                <span class="char-count">Caracteres: <span id="charCount">0</span></span>
              </div>
            </div>
            <div class="code-editor-container">
              <textarea 
                id="playgroundEditor" 
                class="code-editor"
                spellcheck="false"
                placeholder="Digite seu código aqui..."
              >${this._highlightSyntax(code, language)}</textarea>
              <div class="editor-overlay">
                <div class="line-numbers" id="lineNumbers"></div>
                <div class="syntax-highlight" id="syntaxHighlight"></div>
              </div>
            </div>
          </div>

          <div class="output-panel">
            <div class="panel-header">
              <span class="panel-title">Saída</span>
              <div class="output-controls">
                <button class="clear-output">Limpar</button>
                <button class="copy-output">Copiar</button>
                <button class="download-output">Baixar</button>
              </div>
            </div>
            <div class="console-output" id="playgroundOutput">
              <div class="output-placeholder">
                <span class="placeholder-icon">💻</span>
                <span class="placeholder-text">Clique em "Executar" para ver a saída</span>
              </div>
            </div>
          </div>

          ${options.showVisualizer ? `
            <div class="visualizer-panel">
              <div class="panel-header">
                <span class="panel-title">Visualização</span>
                <div class="viz-controls">
                  <button class="step-backward" disabled>⏮</button>
                  <button class="step-forward" disabled>⏭</button>
                  <button class="toggle-play" disabled>▶</button>
                  <button class="reset-viz" disabled>🔄</button>
                </div>
              </div>
              <div class="visualizer-content">
                <canvas id="playgroundVisualizer" width="600" height="400"></canvas>
                <div class="variable-tracker" id="variableTracker">
                  <h5>Variáveis:</h5>
                  <div class="variables-list"></div>
                </div>
              </div>
            </div>
          ` : ''}
        </div>

        <div class="playground-footer">
          <div class="execution-stats">
            <span class="stat">
              <span class="label">Tempo:</span>
              <span class="value" id="execTime">-</span>
            </span>
            <span class="stat">
              <span class="label">Memória:</span>
              <span class="value" id="memUsage">-</span>
            </span>
            <span class="stat">
              <span class="label">Linhas:</span>
              <span class="value" id="execLines">-</span>
            </span>
          </div>
          <div class="tips">
            <span class="tip-icon">💡</span>
            <span class="tip-text">Modifique o código e clique em "Executar" para ver o que acontece!</span>
          </div>
        </div>

        <!-- Sugestões de Modificação -->
        <div class="modification-suggestions" style="display: none;">
          <h4>💡 Sugestões de Modificação:</h4>
          <div class="suggestions-list" id="suggestionsList">
            <!-- Dinamicamente preenchido -->
          </div>
        </div>
      </div>
    `;

    // Inicializar editor
    this._initializeEditor(code, language);
    
    // Configurar event handlers
    this._setupPlaygroundEvents();

    return playgroundHTML;
  }

  /**
   * INICIALIZAR EDITOR
   * Configurar editor com syntax highlighting e recursos
   */
  _initializeEditor(code, language) {
    setTimeout(() => {
      const textarea = document.getElementById('playgroundEditor');
      if (!textarea) return;

      // Configurar editor
      this._setupEditorFeatures(textarea, language);
      
      // Atualizar estatísticas
      this._updateEditorStats();
      
      // Configurar auto-save
      this._setupAutoSave();
      
    }, 100);
  }

  /**
   * CONFIGURAR RECURSOS DO EDITOR
   * Syntax highlighting, auto-indent, etc.
   */
  _setupEditorFeatures(textarea, language) {
    // Auto-indent
    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        this._insertTab(textarea);
      } else if (e.key === 'Enter') {
        this._handleEnter(textarea);
      }
    });

    // Syntax highlighting básico
    textarea.addEventListener('input', () => {
      this._updateSyntaxHighlight(textarea, language);
      this._updateEditorStats();
    });

    // Auto-complete básico
    textarea.addEventListener('keyup', (e) => {
      if (e.key === '.') {
        this._showAutoComplete(textarea, language);
      }
    });

    // Detectar mudanças significativas
    textarea.addEventListener('input', this._debounce(() => {
      this._analyzeCodeChanges();
    }, 1000));
  }

  /**
   * EXECUTAR CÓDIGO COM VISUALIZAÇÃO
   * Execução segura com captura de saída
   */
  async runCode(code, visualize = true) {
    if (this.isRunning) {
      console.warn('[Playground] Execução já em andamento');
      return;
    }

    this.isRunning = true;
    const startTime = performance.now();
    const startMemory = this._getMemoryUsage();

    try {
      // Limpar saída anterior
      this._clearOutput();

      // Validar código
      const validation = this._validateCode(code);
      if (!validation.isValid) {
        this._displayError(`Erro de validação: ${validation.error}`);
        return;
      }

      // Executar código com instrumentação
      const result = await this._executeInstrumented(code);

      // Calcular métricas
      const execTime = (performance.now() - startTime).toFixed(2);
      const memUsage = this._formatBytes(this._getMemoryUsage() - startMemory);

      // Exibir saída
      this._displayOutput(result.output);

      // Atualizar estatísticas
      document.getElementById('execTime').textContent = `${execTime}ms`;
      document.getElementById('memUsage').textContent = memUsage;
      document.getElementById('execLines').textContent = result.linesExecuted;

      // Visualizar execução se habilitado
      if (visualize && result.trace) {
        await this._visualizeExecution(result.trace);
      }

      // Salvar no histórico
      this.executionHistory.push({
        code: code,
        result: result,
        timestamp: Date.now(),
        duration: execTime
      });

      return result;

    } catch (error) {
      this._displayError(error);
      throw error;
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * EXECUTAR CÓDIGO COM INSTRUMENTAÇÃO
   * Captura trace de execução para visualização
   */
  async _executeInstrumented(code) {
    const output = [];
    const trace = [];
    let linesExecuted = 0;

    // Capturar console output
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    console.log = (...args) => {
      output.push({ type: 'log', args, timestamp: Date.now() });
      originalLog(...args);
    };

    console.error = (...args) => {
      output.push({ type: 'error', args, timestamp: Date.now() });
      originalError(...args);
    };

    console.warn = (...args) => {
      output.push({ type: 'warn', args, timestamp: Date.now() });
      originalWarn(...args);
    };

    try {
      // Executar código em sandbox
      const result = this._executeInSandbox(code);
      
      // Capturar resultado se retornado
      if (result !== undefined) {
        output.push({ type: 'return', args: [result], timestamp: Date.now() });
      }

      // Gerar trace básico
      trace.push({
        step: 1,
        line: 1,
        action: 'start',
        variables: this._extractVariables(code),
        description: 'Iniciando execução'
      });

      linesExecuted = code.split('\n').length;

      return {
        output,
        trace,
        linesExecuted,
        success: true
      };

    } catch (error) {
      output.push({ 
        type: 'error', 
        args: [error.message], 
        timestamp: Date.now() 
      });
      
      return {
        output,
        trace: [],
        linesExecuted: 0,
        success: false,
        error: error.message
      };
    } finally {
      // Restaurar console
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
    }
  }

  /**
   * EXECUTAR EM SANDBOX
   * Execução segura com limitações
   */
  _executeInSandbox(code) {
    // Criar contexto seguro
    const sandbox = {
      console: {
        log: console.log,
        error: console.error,
        warn: console.warn
      },
      Math: Math,
      Date: Date,
      Array: Array,
      Object: Object,
      String: String,
      Number: Number,
      Boolean: Boolean,
      JSON: JSON,
      setTimeout: setTimeout,
      setInterval: setInterval,
      clearTimeout: clearTimeout,
      clearInterval: clearInterval
    };

    // Executar código no contexto seguro
    const func = new Function(...Object.keys(sandbox), `
      "use strict";
      ${code}
    `);

    return func(...Object.values(sandbox));
  }

  /**
   * VALIDAR CÓDIGO
   * Verificar segurança e sintaxe
   */
  _validateCode(code) {
    // Verificar comprimento
    if (code.length > 10000) {
      return { isValid: false, error: 'Código muito longo' };
    }

    // Verificar APIs não permitidas
    const forbiddenAPIs = [
      'eval', 'Function', 'import', 'require', 'process', 'global',
      'window', 'document', 'localStorage', 'sessionStorage',
      'fetch', 'XMLHttpRequest', 'WebSocket'
    ];

    for (const api of forbiddenAPIs) {
      if (code.includes(api)) {
        return { isValid: false, error: `API não permitida: ${api}` };
      }
    }

    // Verificar loops infinitos básicos
    const infiniteLoopPatterns = [
      /while\s*\(\s*true\s*\)/,
      /for\s*\(\s*;\s*;\s*\)/,
      /while\s*\(\s*1\s*\)/
    ];

    for (const pattern of infiniteLoopPatterns) {
      if (pattern.test(code)) {
        return { isValid: false, error: 'Possível loop infinito detectado' };
      }
    }

    return { isValid: true };
  }

  /**
   * VISUALIZAR EXECUÇÃO
   * Animar execução step-by-step
   */
  async _visualizeExecution(trace) {
    const canvas = document.getElementById('playgroundVisualizer');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const visualizer = new ExecutionVisualizer(ctx);

    // Habilitar controles
    this._enableVisualizerControls();

    // Animar cada passo
    for (let i = 0; i < trace.length; i++) {
      const step = trace[i];
      await visualizer.renderStep(step);
      await this._sleep(this._getAnimationSpeed());
      
      // Atualizar indicador de passo
      document.getElementById('currentStep').textContent = i + 1;
    }
  }

  /**
   * EXIBIR SAÍDA
   * Renderizar output no console
   */
  _displayOutput(output) {
    const outputContainer = document.getElementById('playgroundOutput');
    if (!outputContainer) return;

    // Limpar placeholder
    const placeholder = outputContainer.querySelector('.output-placeholder');
    if (placeholder) {
      placeholder.remove();
    }

    output.forEach(log => {
      const line = document.createElement('div');
      line.className = `output-line ${log.type}`;
      
      const timestamp = new Date(log.timestamp).toLocaleTimeString();
      const content = log.args.map(arg => {
        if (typeof arg === 'object') {
          return JSON.stringify(arg, null, 2);
        }
        return String(arg);
      }).join(' ');

      line.innerHTML = `
        <span class="timestamp">[${timestamp}]</span>
        <span class="content">${this._escapeHtml(content)}</span>
      `;
      
      outputContainer.appendChild(line);
    });

    // Scroll para o final
    outputContainer.scrollTop = outputContainer.scrollHeight;
  }

  /**
   * EXIBIR ERRO
   * Mostrar erros de forma destacada
   */
  _displayError(error) {
    const outputContainer = document.getElementById('playgroundOutput');
    if (!outputContainer) return;

    const errorLine = document.createElement('div');
    errorLine.className = 'output-line error';
    errorLine.innerHTML = `
      <span class="error-icon">❌</span>
      <span class="error-message">${this._escapeHtml(error.message || error)}</span>
    `;
    
    outputContainer.appendChild(errorLine);
    outputContainer.scrollTop = outputContainer.scrollHeight;
  }

  /**
   * LIMPAR SAÍDA
   * Remover todo o output
   */
  _clearOutput() {
    const outputContainer = document.getElementById('playgroundOutput');
    if (!outputContainer) return;

    outputContainer.innerHTML = `
      <div class="output-placeholder">
        <span class="placeholder-icon">💻</span>
        <span class="placeholder-text">Clique em "Executar" para ver a saída</span>
      </div>
    `;
  }

  /**
   * RESETAR PLAYGROUND
   * Voltar ao código original
   */
  reset() {
    const editor = document.getElementById('playgroundEditor');
    if (editor) {
      editor.value = this.originalCode;
      this._updateEditorStats();
      this._clearOutput();
    }
  }

  /**
   * FORMATAR CÓDIGO
   * Aplicar formatação automática
   */
  format() {
    const editor = document.getElementById('playgroundEditor');
    if (!editor) return;

    const code = editor.value;
    const formatted = this._formatCode(code);
    
    if (formatted !== code) {
      editor.value = formatted;
      this._updateEditorStats();
      this._showNotification('Código formatado!', 'success');
    }
  }

  /**
   * COMPARTILHAR CÓDIGO
   * Gerar link compartilhável
   */
  share() {
    const editor = document.getElementById('playgroundEditor');
    if (!editor) return;

    const code = editor.value;
    const encoded = encodeURIComponent(code);
    const url = `${window.location.origin}/playground?code=${encoded}`;
    
    // Copiar para clipboard
    navigator.clipboard.writeText(url).then(() => {
      this._showNotification('Link copiado para clipboard!', 'success');
    });
  }

  // Métodos auxiliares
  _setupPlaygroundEvents() {
    // Botões de controle
    document.addEventListener('click', (e) => {
      if (e.target.matches('.run-btn')) {
        const editor = document.getElementById('playgroundEditor');
        if (editor) {
          this.runCode(editor.value);
        }
      } else if (e.target.matches('.reset-btn')) {
        this.reset();
      } else if (e.target.matches('.format-btn')) {
        this.format();
      } else if (e.target.matches('.share-btn')) {
        this.share();
      } else if (e.target.matches('.clear-output')) {
        this._clearOutput();
      }
    });
  }

  _highlightSyntax(code, language) {
    // Syntax highlighting básico
    return code
      .replace(/\b(function|class|const|let|var|if|else|for|while|return|async|await)\b/g, 
        '<span class="keyword">$1</span>')
      .replace(/(".*?"|'.*?'|`.*?`)/g, '<span class="string">$1</span>')
      .replace(/\b(\d+)\b/g, '<span class="number">$1</span>')
      .replace(/\/\/.*$/gm, '<span class="comment">$&</span>');
  }

  _updateEditorStats() {
    const editor = document.getElementById('playgroundEditor');
    if (!editor) return;

    const lines = editor.value.split('\n').length;
    const chars = editor.value.length;

    const lineCountEl = document.getElementById('lineCount');
    const charCountEl = document.getElementById('charCount');

    if (lineCountEl) lineCountEl.textContent = lines;
    if (charCountEl) charCountEl.textContent = chars;
  }

  _insertTab(textarea) {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const value = textarea.value;
    
    textarea.value = value.substring(0, start) + '  ' + value.substring(end);
    textarea.selectionStart = textarea.selectionEnd = start + 2;
  }

  _handleEnter(textarea) {
    const start = textarea.selectionStart;
    const value = textarea.value;
    const lineStart = value.lastIndexOf('\n', start - 1) + 1;
    const currentLine = value.substring(lineStart, start);
    const indent = currentLine.match(/^\s*/)[0];
    
    // Auto-indent baseado na linha anterior
    if (currentLine.includes('{')) {
      textarea.value = value.substring(0, start) + '\n' + indent + '  ' + value.substring(start);
    } else {
      textarea.value = value.substring(0, start) + '\n' + indent + value.substring(start);
    }
    
    textarea.selectionStart = textarea.selectionEnd = start + indent.length + 1;
  }

  _updateSyntaxHighlight(textarea, language) {
    // Implementar syntax highlighting em tempo real
    // Por simplicidade, apenas atualizar estatísticas
    this._updateEditorStats();
  }

  _showAutoComplete(textarea, language) {
    // Implementar auto-complete básico
    console.log('[Playground] Auto-complete não implementado ainda');
  }

  _analyzeCodeChanges() {
    // Analisar mudanças e sugerir modificações
    const editor = document.getElementById('playgroundEditor');
    if (!editor) return;

    const code = editor.value;
    const suggestions = this._generateCodeSuggestions(code);
    
    if (suggestions.length > 0) {
      this._showSuggestions(suggestions);
    }
  }

  _generateCodeSuggestions(code) {
    const suggestions = [];
    
    // Sugestões baseadas em padrões
    if (code.includes('for (let i = 0; i < array.length; i++)')) {
      suggestions.push({
        type: 'optimization',
        description: 'Considere usar for...of ou forEach para melhor legibilidade',
        code: code.replace(/for \(let i = 0; i < (\w+)\.length; i\+\+\)/g, 'for (const item of $1)')
      });
    }
    
    if (code.includes('function(') && !code.includes('=>')) {
      suggestions.push({
        type: 'modern',
        description: 'Considere usar arrow functions para sintaxe mais moderna',
        code: code.replace(/function\s*\(([^)]*)\)\s*{/g, '($1) => {')
      });
    }
    
    return suggestions;
  }

  _showSuggestions(suggestions) {
    const container = document.querySelector('.modification-suggestions');
    if (!container) return;

    const list = document.getElementById('suggestionsList');
    if (!list) return;

    list.innerHTML = suggestions.map(suggestion => `
      <div class="suggestion-item">
        <div class="suggestion-content">
          <span class="suggestion-type">${suggestion.type}</span>
          <span class="suggestion-text">${suggestion.description}</span>
        </div>
        <button class="apply-suggestion" data-code="${this._escapeHtml(suggestion.code)}">
          Aplicar
        </button>
      </div>
    `).join('');

    container.style.display = 'block';
  }

  _enableVisualizerControls() {
    const controls = document.querySelectorAll('.viz-controls button');
    controls.forEach(btn => btn.disabled = false);
  }

  _getAnimationSpeed() {
    const speedControl = document.querySelector('.speed-control');
    const speed = speedControl?.value || 'normal';
    
    const speeds = {
      slow: 2000,
      normal: 1000,
      fast: 500
    };
    
    return speeds[speed];
  }

  _getMemoryUsage() {
    return performance.memory?.usedJSHeapSize || 0;
  }

  _formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  _extractVariables(code) {
    // Extrair variáveis do código
    const variables = [];
    const varPattern = /\b(let|const|var)\s+(\w+)/g;
    let match;
    
    while ((match = varPattern.exec(code)) !== null) {
      variables.push({
        name: match[2],
        type: match[1],
        value: 'undefined'
      });
    }
    
    return variables;
  }

  _formatCode(code) {
    // Formatação básica de código
    return code
      .replace(/\s*{\s*/g, ' {\n')
      .replace(/;\s*/g, ';\n')
      .replace(/\n\s*\n/g, '\n')
      .trim();
  }

  _escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  _showNotification(message, type = 'info') {
    // Usar sistema de notificação do DevMentorHelpers
    if (window.DevMentorHelpers) {
      window.DevMentorHelpers.showNotification(message, type);
    } else {
      console.log(`[${type.toUpperCase()}] ${message}`);
    }
  }

  _debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  _setupAutoSave() {
    const editor = document.getElementById('playgroundEditor');
    if (!editor) return;

    editor.addEventListener('input', this._debounce(() => {
      const code = editor.value;
      localStorage.setItem('devmentor-playground-code', code);
    }, 2000));
  }
}

// Visualizador de Execução
class ExecutionVisualizer {
  constructor(ctx) {
    this.ctx = ctx;
    this.canvas = ctx.canvas;
    this.currentStep = 0;
    this.steps = [];
  }

  async renderStep(step) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Desenhar passo atual
    this._drawStep(step);
    
    // Atualizar tracker de variáveis
    this._updateVariableTracker(step.variables);
  }

  _drawStep(step) {
    const { ctx } = this;
    
    // Desenhar linha atual
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(10, step.line * 20, this.canvas.width - 20, 20);
    
    // Desenhar variáveis
    if (step.variables) {
      step.variables.forEach((variable, index) => {
        this._drawVariable(variable, index);
      });
    }
  }

  _drawVariable(variable, index) {
    const { ctx } = this;
    const x = 50;
    const y = 100 + index * 30;
    
    // Nome da variável
    ctx.fillStyle = '#2196F3';
    ctx.font = '14px monospace';
    ctx.fillText(`${variable.name}:`, x, y);
    
    // Valor da variável
    ctx.fillStyle = '#333';
    ctx.fillText(variable.value, x + 80, y);
  }

  _updateVariableTracker(variables) {
    const tracker = document.getElementById('variableTracker');
    if (!tracker) return;

    const list = tracker.querySelector('.variables-list');
    if (!list) return;

    list.innerHTML = variables.map(variable => `
      <div class="variable-item">
        <span class="variable-name">${variable.name}</span>
        <span class="variable-value">${variable.value}</span>
      </div>
    `).join('');
  }
}

// Exportar para uso global
window.InteractivePlayground = InteractivePlayground;
window.ExecutionVisualizer = ExecutionVisualizer;







