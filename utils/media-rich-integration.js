/**
 * DevMentor AI - Media-Rich Integration
 * Arquivo de integração final que conecta todas as funcionalidades
 */

// Auto-inicialização quando o script carrega
(function() {
  'use strict';
  
  console.log('🎬 DevMentor AI Media-Rich System - Carregando...');
  
  // Aguardar DevMentorHelpers estar disponível
  const waitForHelpers = () => {
    return new Promise((resolve) => {
      if (window.DevMentorHelpers) {
        resolve();
      } else {
        setTimeout(() => waitForHelpers().then(resolve), 100);
      }
    });
  };
  
  // Inicializar sistema quando pronto
  waitForHelpers().then(async () => {
    try {
      console.log('🚀 Inicializando DevMentor AI Media-Rich System...');
      
      // Inicializar sistema de explicações ricas
      const initialized = await window.DevMentorHelpers.initializeMediaRichSystem();
      
      if (initialized) {
        console.log('✅ DevMentor AI Media-Rich System inicializado com sucesso!');
        
        // Adicionar botão de demo se não existir
        addDemoButton();
        
        // Configurar event listeners globais
        setupGlobalEventListeners();
        
        // Mostrar notificação de sucesso
        window.DevMentorHelpers.showNotification(
          '🎬 Sistema de explicações ricas carregado!',
          'success',
          5000
        );
        
      } else {
        console.warn('⚠️ Sistema de explicações ricas não pôde ser inicializado');
      }
      
    } catch (error) {
      console.error('❌ Erro ao inicializar sistema de explicações ricas:', error);
    }
  });
  
  /**
   * ADICIONAR BOTÃO DE DEMO
   * Adiciona botão flutuante para demo
   */
  function addDemoButton() {
    // Verificar se já existe
    if (document.getElementById('devmentor-demo-btn')) return;
    
    const demoBtn = document.createElement('button');
    demoBtn.id = 'devmentor-demo-btn';
    demoBtn.innerHTML = '🎬 Demo';
    demoBtn.title = 'Executar demo do sistema de explicações ricas';
    demoBtn.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 20px;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, #1976d2, #26a69a);
      color: white;
      border: none;
      cursor: pointer;
      font-size: 16px;
      font-weight: bold;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 10000;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    
    demoBtn.addEventListener('mouseenter', () => {
      demoBtn.style.transform = 'scale(1.1)';
      demoBtn.style.boxShadow = '0 6px 20px rgba(0,0,0,0.4)';
    });
    
    demoBtn.addEventListener('mouseleave', () => {
      demoBtn.style.transform = 'scale(1)';
      demoBtn.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
    });
    
    demoBtn.addEventListener('click', async () => {
      try {
        demoBtn.disabled = true;
        demoBtn.innerHTML = '⏳';
        
        // Executar demo
        if (window.MediaRichDemo) {
          const demo = new window.MediaRichDemo();
          await demo.runInteractiveDemo();
        } else {
          window.DevMentorHelpers.showNotification(
            'Sistema de demo não disponível',
            'warning'
          );
        }
        
      } catch (error) {
        console.error('Erro na demo:', error);
        window.DevMentorHelpers.showNotification(
          'Erro ao executar demo',
          'error'
        );
      } finally {
        demoBtn.disabled = false;
        demoBtn.innerHTML = '🎬 Demo';
      }
    });
    
    document.body.appendChild(demoBtn);
  }
  
  /**
   * CONFIGURAR EVENT LISTENERS GLOBAIS
   * Configura listeners para funcionalidades globais
   */
  function setupGlobalEventListeners() {
    // Listener para tecla de atalho (Ctrl+Shift+D)
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        toggleMediaRichPanel();
      }
    });
    
    // Listener para cliques em código
    document.addEventListener('click', (e) => {
      if (e.target.matches('code, pre, .code, .highlight')) {
        handleCodeClick(e);
      }
    });
  }
  
  /**
   * ALTERNAR PAINEL DE EXPLICAÇÕES RICAS
   * Mostra/esconde painel principal
   */
  function toggleMediaRichPanel() {
    const existingPanel = document.getElementById('devmentor-media-rich-panel');
    
    if (existingPanel) {
      existingPanel.remove();
    } else {
      createMediaRichPanel();
    }
  }
  
  /**
   * CRIAR PAINEL PRINCIPAL
   * Cria painel principal de explicações ricas
   */
  function createMediaRichPanel() {
    const panel = document.createElement('div');
    panel.id = 'devmentor-media-rich-panel';
    panel.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 90vw;
      max-width: 1200px;
      height: 80vh;
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      z-index: 10001;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    `;
    
    panel.innerHTML = `
      <div style="
        background: linear-gradient(135deg, #1976d2, #26a69a);
        color: white;
        padding: 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      ">
        <h2 style="margin: 0; font-size: 24px;">🎬 DevMentor AI Media-Rich</h2>
        <button id="close-panel" style="
          background: rgba(255,255,255,0.2);
          border: none;
          color: white;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 20px;
        ">×</button>
      </div>
      
      <div style="flex: 1; padding: 20px; overflow-y: auto;">
        <div id="panel-content">
          <div style="text-align: center; padding: 40px;">
            <h3>🚀 Sistema de Explicações Ricas</h3>
            <p>Selecione um código na página e clique em "Analisar" para gerar uma explicação rica!</p>
            
            <div style="margin: 30px 0;">
              <button id="analyze-selected" style="
                background: #1976d2;
                color: white;
                border: none;
                padding: 15px 30px;
                border-radius: 8px;
                font-size: 16px;
                cursor: pointer;
                margin: 10px;
              ">🔍 Analisar Código Selecionado</button>
              
              <button id="run-demo" style="
                background: #26a69a;
                color: white;
                border: none;
                padding: 15px 30px;
                border-radius: 8px;
                font-size: 16px;
                cursor: pointer;
                margin: 10px;
              ">🎬 Executar Demo</button>
            </div>
            
            <div id="system-status" style="
              background: #f5f5f5;
              padding: 20px;
              border-radius: 8px;
              margin-top: 20px;
            ">
              <h4>📊 Status do Sistema</h4>
              <div id="status-details"></div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Configurar event listeners do painel
    panel.querySelector('#close-panel').addEventListener('click', () => {
      panel.remove();
    });
    
    panel.querySelector('#analyze-selected').addEventListener('click', async () => {
      await analyzeSelectedCode(panel);
    });
    
    panel.querySelector('#run-demo').addEventListener('click', async () => {
      await runDemo(panel);
    });
    
    // Atualizar status do sistema
    updateSystemStatus(panel);
    
    document.body.appendChild(panel);
  }
  
  /**
   * ANALISAR CÓDIGO SELECIONADO
   */
  async function analyzeSelectedCode(panel) {
    const selection = window.DevMentorHelpers.getSelection();
    
    if (!selection.text) {
      window.DevMentorHelpers.showNotification(
        'Selecione um código primeiro!',
        'warning'
      );
      return;
    }
    
    const contentDiv = panel.querySelector('#panel-content');
    contentDiv.innerHTML = `
      <div style="text-align: center; padding: 40px;">
        <h3>🔄 Analisando código...</h3>
        <div style="margin: 20px 0;">
          <div style="background: #f0f0f0; padding: 15px; border-radius: 8px; text-align: left;">
            <strong>Código selecionado:</strong><br>
            <pre style="margin: 10px 0; font-size: 14px;">${selection.text}</pre>
          </div>
        </div>
      </div>
    `;
    
    try {
      // Detectar linguagem
      const language = detectLanguage(selection.text);
      
      // Gerar explicação rica
      const explanation = await window.DevMentorHelpers.generateRichExplanation(
        selection.text,
        'complexity',
        language,
        'intermediate'
      );
      
      contentDiv.innerHTML = explanation;
      
    } catch (error) {
      console.error('Erro ao analisar código:', error);
      contentDiv.innerHTML = `
        <div style="text-align: center; padding: 40px;">
          <h3>❌ Erro na Análise</h3>
          <p>Erro: ${error.message}</p>
          <button onclick="location.reload()" style="
            background: #f44336;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 6px;
            cursor: pointer;
          ">🔄 Recarregar</button>
        </div>
      `;
    }
  }
  
  /**
   * EXECUTAR DEMO
   */
  async function runDemo(panel) {
    const contentDiv = panel.querySelector('#panel-content');
    contentDiv.innerHTML = `
      <div style="text-align: center; padding: 40px;">
        <h3>🎬 Executando Demo...</h3>
        <p>Aguarde enquanto carregamos a demonstração...</p>
      </div>
    `;
    
    try {
      if (window.MediaRichDemo) {
        const demo = new window.MediaRichDemo();
        await demo.runInteractiveDemo();
        
        contentDiv.innerHTML = `
          <div style="text-align: center; padding: 40px;">
            <h3>✅ Demo Executada!</h3>
            <p>A interface de demo foi aberta. Use-a para testar diferentes cenários.</p>
            <p>Feche este painel e use a interface de demo que apareceu.</p>
          </div>
        `;
      } else {
        throw new Error('Sistema de demo não disponível');
      }
    } catch (error) {
      console.error('Erro na demo:', error);
      contentDiv.innerHTML = `
        <div style="text-align: center; padding: 40px;">
          <h3>❌ Erro na Demo</h3>
          <p>Erro: ${error.message}</p>
        </div>
      `;
    }
  }
  
  /**
   * ATUALIZAR STATUS DO SISTEMA
   */
  function updateSystemStatus(panel) {
    const statusDiv = panel.querySelector('#status-details');
    const status = window.DevMentorHelpers.getMediaRichSystemStatus();
    
    statusDiv.innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px;">
        <div style="padding: 10px; background: ${status.mediaRichEngine ? '#4caf50' : '#f44336'}; color: white; border-radius: 4px;">
          ${status.mediaRichEngine ? '✅' : '❌'} MediaRichEngine
        </div>
        <div style="padding: 10px; background: ${status.citationEngine ? '#4caf50' : '#f44336'}; color: white; border-radius: 4px;">
          ${status.citationEngine ? '✅' : '❌'} CitationEngine
        </div>
        <div style="padding: 10px; background: ${status.interactivePlayground ? '#4caf50' : '#f44336'}; color: white; border-radius: 4px;">
          ${status.interactivePlayground ? '✅' : '❌'} InteractivePlayground
        </div>
        <div style="padding: 10px; background: ${status.visualMetaphorEngine ? '#4caf50' : '#f44336'}; color: white; border-radius: 4px;">
          ${status.visualMetaphorEngine ? '✅' : '❌'} VisualMetaphorEngine
        </div>
        <div style="padding: 10px; background: ${status.stylesLoaded ? '#4caf50' : '#f44336'}; color: white; border-radius: 4px;">
          ${status.stylesLoaded ? '✅' : '❌'} Estilos CSS
        </div>
        <div style="padding: 10px; background: ${status.allComponentsLoaded ? '#4caf50' : '#f44336'}; color: white; border-radius: 4px;">
          ${status.allComponentsLoaded ? '✅' : '❌'} Sistema Completo
        </div>
      </div>
    `;
  }
  
  /**
   * DETECTAR LINGUAGEM DO CÓDIGO
   */
  function detectLanguage(code) {
    const patterns = {
      javascript: [/\b(function|const|let|var|async|await|=>)\b/, /console\.log/, /\$\{/],
      python: [/\bdef\b/, /\bimport\b/, /:\s*$/, /#.*$/],
      react: [/import.*from.*react/, /<[A-Z]\w*/, /useState|useEffect/],
      typescript: [/:\s*\w+/, /interface\s+\w+/, /type\s+\w+/]
    };
    
    for (const [lang, patternList] of Object.entries(patterns)) {
      if (patternList.some(pattern => pattern.test(code))) {
        return lang;
      }
    }
    
    return 'javascript'; // fallback
  }
  
  /**
   * MANIPULAR CLIQUE EM CÓDIGO
   */
  function handleCodeClick(e) {
    // Implementar funcionalidade de clique em código se necessário
    console.log('Código clicado:', e.target.textContent.substring(0, 100));
  }
  
})();

// Exportar para uso global
window.DevMentorMediaRichIntegration = {
  version: '1.0.0',
  initialized: true,
  components: {
    MediaRichExplanationEngine: !!window.MediaRichExplanationEngine,
    CitationEngine: !!window.CitationEngine,
    InteractivePlayground: !!window.InteractivePlayground,
    VisualMetaphorEngine: !!window.VisualMetaphorEngine
  }
};

console.log('🎬 DevMentor AI Media-Rich Integration carregado!');







