/**
 * DevMentor AI - Complete Media-Rich Demo
 * Demonstração completa de todas as funcionalidades implementadas
 * 
 * Funcionalidades Demonstradas:
 * - MediaRichExplanationEngine
 * - CitationEngine
 * - InteractivePlayground
 * - VisualMetaphorEngine
 * - DiagramGenerator
 * - AIVideoGenerator
 * - QuizGenerator
 * - GeminiProIntegration
 */

class CompleteMediaRichDemo {
  constructor() {
    this.demoData = {
      javascript: {
        code: `
// Exemplo complexo de JavaScript com async/await
async function fetchUserData(userId) {
  try {
    const user = await fetch(\`/api/users/\${userId}\`);
    const posts = await fetch(\`/api/posts?user=\${userId}\`);
    
    const [userData, postsData] = await Promise.all([
      user.json(),
      posts.json()
    ]);
    
    return {
      user: userData,
      posts: postsData,
      timestamp: Date.now()
    };
  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    throw new Error('Falha na requisição');
  }
}

// Uso da função
fetchUserData(123)
  .then(data => console.log('Dados:', data))
  .catch(error => console.error('Erro:', error));
        `,
        language: 'javascript',
        concepts: [
          { name: 'async/await', confidence: 0.9 },
          { name: 'promises', confidence: 0.8 },
          { name: 'error handling', confidence: 0.7 },
          { name: 'destructuring', confidence: 0.6 }
        ]
      },
      
      python: {
        code: `
# Exemplo de Python com list comprehension e decorators
def log_execution(func):
    def wrapper(*args, **kwargs):
        print(f"Executando {func.__name__}")
        result = func(*args, **kwargs)
        print(f"Resultado: {result}")
        return result
    return wrapper

@log_execution
def process_data(data_list):
    """Processa uma lista de dados usando list comprehension"""
    
    # List comprehension para filtrar e transformar dados
    processed = [
        item.upper() 
        for item in data_list 
        if item and len(item) > 2
    ]
    
    # Usando generator expression para economia de memória
    squares = (x**2 for x in range(10) if x % 2 == 0)
    
    return {
        'processed': processed,
        'squares': list(squares),
        'count': len(processed)
    }

# Exemplo de uso
data = ['a', 'hello', 'world', 'b', 'python']
result = process_data(data)
print(result)
        `,
        language: 'python',
        concepts: [
          { name: 'decorators', confidence: 0.9 },
          { name: 'list comprehension', confidence: 0.8 },
          { name: 'generators', confidence: 0.7 },
          { name: 'functions', confidence: 0.6 }
        ]
      },
      
      react: {
        code: `
// Exemplo de componente React com hooks
import React, { useState, useEffect, useCallback } from 'react';

const UserProfile = ({ userId }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Função para buscar dados do usuário
  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(\`/api/users/\${userId}\`);
      
      if (!response.ok) {
        throw new Error('Usuário não encontrado');
      }
      
      const userData = await response.json();
      setUser(userData);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Effect para buscar dados quando o componente monta
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Renderização condicional
  if (loading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error}</div>;
  if (!user) return <div>Usuário não encontrado</div>;

  return (
    <div className="user-profile">
      <h2>{user.name}</h2>
      <p>Email: {user.email}</p>
      <p>Membro desde: {new Date(user.createdAt).toLocaleDateString()}</p>
    </div>
  );
};

export default UserProfile;
        `,
        language: 'react',
        concepts: [
          { name: 'hooks', confidence: 0.9 },
          { name: 'useState', confidence: 0.8 },
          { name: 'useEffect', confidence: 0.8 },
          { name: 'useCallback', confidence: 0.7 }
        ]
      }
    };
    
    this.demoScenarios = [
      { type: 'complexity', name: 'Análise de Complexidade' },
      { type: 'optimization', name: 'Otimização de Performance' },
      { type: 'security', name: 'Análise de Segurança' },
      { type: 'best_practices', name: 'Melhores Práticas' }
    ];
  }

  /**
   * EXECUTAR DEMO COMPLETA
   * Demonstra todas as funcionalidades do sistema
   */
  async runCompleteDemo() {
    console.log('🎬 === DEMO COMPLETA - DEVMENTOR AI MEDIA-RICH ===\n');

    try {
      // 1. Inicializar sistema completo
      console.log('1️⃣ INICIALIZANDO SISTEMA COMPLETO...');
      const initialized = await window.DevMentorHelpers.initializeMediaRichSystem();
      
      if (!initialized) {
        console.error('❌ Falha na inicialização do sistema');
        return;
      }
      
      console.log('✅ Sistema completo inicializado\n');

      // 2. Verificar status de todos os componentes
      console.log('2️⃣ VERIFICANDO STATUS DOS COMPONENTES...');
      const status = window.DevMentorHelpers.getMediaRichSystemStatus();
      this._displaySystemStatus(status);
      console.log('✅ Status verificado\n');

      // 3. Demo para cada linguagem
      for (const [language, data] of Object.entries(this.demoData)) {
        console.log(`3️⃣ DEMO PARA ${language.toUpperCase()}...`);
        await this._demoLanguage(language, data);
        console.log(`✅ Demo ${language} concluída\n`);
      }

      // 4. Demo de funcionalidades específicas
      console.log('4️⃣ DEMO DE FUNCIONALIDADES ESPECÍFICAS...');
      await this._demoSpecificFeatures();
      console.log('✅ Demo de funcionalidades concluída\n');

      // 5. Demo de integração com Gemini Pro
      console.log('5️⃣ DEMO DE INTEGRAÇÃO GEMINI PRO...');
      await this._demoGeminiIntegration();
      console.log('✅ Demo Gemini Pro concluída\n');

      // 6. Resumo final
      console.log('6️⃣ RESUMO FINAL...');
      this._showFinalSummary();

    } catch (error) {
      console.error('❌ Erro durante demo:', error);
    }
  }

  /**
   * DEMO POR LINGUAGEM
   */
  async _demoLanguage(language, data) {
    console.log(`   📝 Código ${language}: ${data.code.length} caracteres`);
    console.log(`   🧠 Conceitos: ${data.concepts.map(c => c.name).join(', ')}`);
    
    for (const scenario of this.demoScenarios) {
      console.log(`   🔍 ${scenario.name}...`);
      
      try {
        // Gerar explicação rica completa
        const explanation = await window.DevMentorHelpers.generateRichExplanation(
          data.code,
          scenario.type,
          data.language,
          'intermediate'
        );
        
        console.log(`   ✅ ${scenario.name} gerada`);
        console.log(`   📊 Tamanho: ${explanation.length} caracteres`);
        
        // Analisar componentes da explicação
        this._analyzeExplanationComponents(explanation, scenario.type);
        
      } catch (error) {
        console.warn(`   ⚠️ Erro em ${scenario.name}:`, error.message);
      }
    }
  }

  /**
   * DEMO DE FUNCIONALIDADES ESPECÍFICAS
   */
  async _demoSpecificFeatures() {
    // Demo de citações
    console.log('   📚 Testando CitationEngine...');
    if (window.citationEngine) {
      const concepts = [
        { name: 'async/await', confidence: 0.9 },
        { name: 'promises', confidence: 0.8 },
        { name: 'error handling', confidence: 0.7 }
      ];
      
      const citations = await window.citationEngine.findCitations(concepts, 'javascript');
      const totalCitations = this._countTotalCitations(citations);
      console.log(`   ✅ ${totalCitations} citações encontradas`);
    }

    // Demo de metáforas visuais
    console.log('   🎨 Testando VisualMetaphorEngine...');
    if (window.visualMetaphorEngine) {
      const metaphors = ['async_await', 'promises', 'recursion', 'closures'];
      metaphors.forEach(concept => {
        const metaphor = window.visualMetaphorEngine.getMetaphor(concept);
        if (metaphor) {
          console.log(`   ✅ Metáfora para ${concept}: ${metaphor.metaphor}`);
        }
      });
    }

    // Demo de playground
    console.log('   🎮 Testando InteractivePlayground...');
    if (window.interactivePlayground) {
      const playgroundHTML = window.interactivePlayground.createPlayground(
        'console.log("Hello World!");',
        'javascript',
        { showVisualizer: true }
      );
      console.log(`   ✅ Playground criado: ${playgroundHTML.length} caracteres`);
    }

    // Demo de diagramas
    console.log('   📊 Testando DiagramGenerator...');
    if (window.diagramGenerator) {
      const code = 'if (condition) { doSomething(); } else { doSomethingElse(); }';
      const diagram = await window.diagramGenerator.autoGenerateDiagram(code, 'complexity');
      if (diagram) {
        console.log(`   ✅ Diagrama ${diagram.type} gerado`);
      }
    }

    // Demo de vídeos AI
    console.log('   🎬 Testando AIVideoGenerator...');
    if (window.aiVideoGenerator) {
      const video = await window.aiVideoGenerator.generateExplanationVideo(
        'console.log("Hello");',
        'Este código imprime uma mensagem',
        { language: 'javascript' }
      );
      console.log(`   ✅ Vídeo gerado: ${video.duration}s`);
    }

    // Demo de quizzes
    console.log('   ✅ Testando QuizGenerator...');
    if (window.quizGenerator) {
      const concepts = [
        { name: 'async/await', confidence: 0.9 },
        { name: 'promises', confidence: 0.8 }
      ];
      const quizzes = await window.quizGenerator.generateQuizzes(concepts, 'intermediate');
      console.log(`   ✅ ${quizzes.length} quizzes gerados`);
    }
  }

  /**
   * DEMO DE INTEGRAÇÃO GEMINI PRO
   */
  async _demoGeminiIntegration() {
    if (!window.geminiProIntegration) {
      console.log('   ⚠️ Gemini Pro não configurado');
      return;
    }

    const status = window.geminiProIntegration.getStatus();
    console.log(`   📊 Status Gemini Pro: ${status.isConfigured ? 'Configurado' : 'Não configurado'}`);

    if (status.isConfigured) {
      try {
        // Demo de explicação inteligente
        console.log('   🧠 Testando explicação inteligente...');
        const explanation = await window.geminiProIntegration.generateIntelligentExplanation(
          'async function test() { return await fetch("/api"); }',
          'javascript',
          'complexity',
          'intermediate'
        );
        console.log(`   ✅ Explicação inteligente gerada: ${explanation.mainConcept ? 'Sim' : 'Não'}`);

        // Demo de roteiro de vídeo
        console.log('   🎬 Testando roteiro de vídeo...');
        const script = await window.geminiProIntegration.generateVideoScript(
          'const data = await fetch("/api");',
          'javascript',
          'optimization',
          45
        );
        console.log(`   ✅ Roteiro gerado: ${script.scenes ? script.scenes.length : 0} cenas`);

        // Demo de quizzes personalizados
        console.log('   ✅ Testando quizzes personalizados...');
        const quizzes = await window.geminiProIntegration.generatePersonalizedQuizzes(
          'async function test() { return await fetch("/api"); }',
          'javascript',
          [{ name: 'async/await', confidence: 0.9 }],
          'intermediate'
        );
        console.log(`   ✅ Quizzes personalizados: ${quizzes.length} perguntas`);

      } catch (error) {
        console.warn('   ⚠️ Erro na integração Gemini Pro:', error.message);
      }
    } else {
      console.log('   💡 Para usar Gemini Pro, configure com: window.geminiProIntegration.configure("sua-api-key")');
    }
  }

  /**
   * ANALISAR COMPONENTES DA EXPLICAÇÃO
   */
  _analyzeExplanationComponents(explanation, type) {
    const analysis = {
      hasVideo: explanation.includes('video'),
      hasCitations: explanation.includes('citations'),
      hasPlayground: explanation.includes('playground'),
      hasMetaphors: explanation.includes('metaphor'),
      hasDiagrams: explanation.includes('mermaid'),
      hasQuizzes: explanation.includes('quiz'),
      hasExercises: explanation.includes('exercise'),
      hasCommunityLinks: explanation.includes('community'),
      hasFurtherReading: explanation.includes('further-reading')
    };

    const featuresCount = Object.values(analysis).filter(Boolean).length;
    console.log(`   📈 Recursos ativos: ${featuresCount}/9`);
    
    if (featuresCount >= 7) {
      console.log('   🌟 Explicação rica completa!');
    } else if (featuresCount >= 4) {
      console.log('   ⭐ Explicação parcialmente rica');
    } else {
      console.log('   📝 Explicação básica');
    }
  }

  /**
   * EXIBIR STATUS DO SISTEMA
   */
  _displaySystemStatus(status) {
    const components = [
      { name: 'MediaRichEngine', status: status.mediaRichEngine },
      { name: 'CitationEngine', status: status.citationEngine },
      { name: 'InteractivePlayground', status: status.interactivePlayground },
      { name: 'VisualMetaphorEngine', status: status.visualMetaphorEngine },
      { name: 'DiagramGenerator', status: status.diagramGenerator },
      { name: 'AIVideoGenerator', status: status.aiVideoGenerator },
      { name: 'QuizGenerator', status: status.quizGenerator },
      { name: 'Estilos CSS', status: status.stylesLoaded }
    ];

    components.forEach(component => {
      const icon = component.status ? '✅' : '❌';
      console.log(`   ${icon} ${component.name}`);
    });

    console.log(`   🎯 Sistema Completo: ${status.allComponentsLoaded ? '✅' : '❌'}`);
  }

  /**
   * CONTAR CITAÇÕES TOTAIS
   */
  _countTotalCitations(citations) {
    return Object.values(citations).reduce((total, category) => 
      total + (category ? category.length : 0), 0
    );
  }

  /**
   * MOSTRAR RESUMO FINAL
   */
  _showFinalSummary() {
    console.log('🏆 === RESUMO FINAL - SISTEMA COMPLETO ===');
    console.log('');
    console.log('✅ FUNCIONALIDADES IMPLEMENTADAS:');
    console.log('   📖 MediaRichExplanationEngine - Sistema principal');
    console.log('   📚 CitationEngine - Citações automáticas');
    console.log('   🎮 InteractivePlayground - Playground de código');
    console.log('   🎨 VisualMetaphorEngine - Metáforas visuais');
    console.log('   📊 DiagramGenerator - Diagramas Mermaid');
    console.log('   🎬 AIVideoGenerator - Vídeos explicativos');
    console.log('   ✅ QuizGenerator - Quizzes interativos');
    console.log('   🎨 Estilos CSS - Interface profissional');
    console.log('   🤖 GeminiProIntegration - AI avançada');
    console.log('');
    console.log('🚀 DIFERENCIAL COMPETITIVO:');
    console.log('   • Multi-sensorial: Texto + Vídeo + Interativo + Visual');
    console.log('   • Autoritativo: Citações de fontes confiáveis');
    console.log('   • Prático: Aprender fazendo');
    console.log('   • Visual: Metáforas e diagramas');
    console.log('   • Verificado: Quizzes e exercícios');
    console.log('   • Conectado: Links para comunidades');
    console.log('   • AI Avançada: Integração com Gemini Pro');
    console.log('');
    console.log('🎯 PRONTO PARA HACKATHON!');
    console.log('   Sistema completo de explicações ricas em mídia');
    console.log('   Implementação modular e extensível');
    console.log('   Interface profissional e responsiva');
    console.log('   Funcionalidades únicas no mercado');
    console.log('   Integração com AI de última geração');
    console.log('');
    console.log('📊 ESTATÍSTICAS:');
    console.log('   • 8 componentes principais implementados');
    console.log('   • 3 linguagens suportadas (JS, Python, React)');
    console.log('   • 4 tipos de análise (complexidade, otimização, segurança, práticas)');
    console.log('   • 6 tipos de diagramas (flowchart, sequence, class, state, er, gantt)');
    console.log('   • 6 tipos de quiz (múltipla escolha, código, verdadeiro/falso, etc.)');
    console.log('   • 15+ metáforas visuais pré-definidas');
    console.log('   • Integração completa com Gemini Pro');
    console.log('');
  }

  /**
   * DEMO RÁPIDA PARA APRESENTAÇÃO
   */
  async runQuickDemo() {
    console.log('⚡ === DEMO RÁPIDA ===\n');

    try {
      // Inicializar sistema
      await window.DevMentorHelpers.initializeMediaRichSystem();
      
      // Demo com código JavaScript
      const data = this.demoData.javascript;
      const explanation = await window.DevMentorHelpers.generateRichExplanation(
        data.code,
        'complexity',
        'javascript',
        'intermediate'
      );
      
      console.log('✅ Explicação rica gerada!');
      console.log(`📊 Tamanho: ${explanation.length} caracteres`);
      
      // Verificar componentes
      const status = window.DevMentorHelpers.getMediaRichSystemStatus();
      const activeComponents = Object.values(status).filter(Boolean).length;
      console.log(`🎯 Componentes ativos: ${activeComponents}/8`);
      
      console.log('🎬 Demo rápida concluída!\n');
      
    } catch (error) {
      console.error('❌ Erro na demo rápida:', error);
    }
  }

  /**
   * DEMO INTERATIVA COM INTERFACE
   */
  async runInteractiveDemo() {
    console.log('🎮 === DEMO INTERATIVA ===\n');
    
    // Criar interface de demo completa
    this._createCompleteDemoInterface();
    
    console.log('✅ Interface de demo criada!');
    console.log('🎯 Use a interface para testar todas as funcionalidades');
  }

  /**
   * CRIAR INTERFACE DE DEMO COMPLETA
   */
  _createCompleteDemoInterface() {
    const demoHTML = `
      <div id="devmentor-complete-demo" style="
        position: fixed;
        top: 20px;
        right: 20px;
        width: 450px;
        max-height: 80vh;
        background: white;
        border: 2px solid #1976d2;
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        z-index: 10000;
        font-family: system-ui, sans-serif;
        overflow-y: auto;
      ">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h2 style="margin: 0; color: #1976d2; font-size: 20px;">🎬 DevMentor AI Complete Demo</h2>
          <button id="close-complete-demo" style="
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: #666;
          ">×</button>
        </div>
        
        <div class="demo-tabs">
          <button class="demo-tab active" data-tab="overview">Visão Geral</button>
          <button class="demo-tab" data-tab="features">Funcionalidades</button>
          <button class="demo-tab" data-tab="test">Testar</button>
        </div>
        
        <div class="demo-content">
          <div class="demo-panel active" id="panel-overview">
            <h3>🚀 Sistema Completo</h3>
            <div id="system-status"></div>
            
            <h4>📊 Estatísticas</h4>
            <div id="system-stats"></div>
            
            <h4>🎯 Componentes</h4>
            <div id="components-list"></div>
          </div>
          
          <div class="demo-panel" id="panel-features">
            <h3>✨ Funcionalidades</h3>
            <div class="features-grid">
              <div class="feature-card">
                <h4>📖 Explicações Ricas</h4>
                <p>Texto + Vídeo + Interativo + Visual</p>
              </div>
              <div class="feature-card">
                <h4>📚 Citações Automáticas</h4>
                <p>Fontes autoritativas e confiáveis</p>
              </div>
              <div class="feature-card">
                <h4>🎮 Playground Interativo</h4>
                <p>Edite e execute código em tempo real</p>
              </div>
              <div class="feature-card">
                <h4>🎨 Metáforas Visuais</h4>
                <p>Analogias memoráveis do mundo real</p>
              </div>
              <div class="feature-card">
                <h4>📊 Diagramas Automáticos</h4>
                <p>Mermaid diagrams gerados automaticamente</p>
              </div>
              <div class="feature-card">
                <h4>🎬 Vídeos AI</h4>
                <p>Explicações em vídeo com narração</p>
              </div>
              <div class="feature-card">
                <h4>✅ Quizzes Inteligentes</h4>
                <p>Testes de compreensão personalizados</p>
              </div>
              <div class="feature-card">
                <h4>🤖 Gemini Pro</h4>
                <p>AI avançada para conteúdo inteligente</p>
              </div>
            </div>
          </div>
          
          <div class="demo-panel" id="panel-test">
            <h3>🧪 Testar Sistema</h3>
            
            <div style="margin-bottom: 15px;">
              <label style="display: block; margin-bottom: 5px; font-weight: 600;">Linguagem:</label>
              <select id="test-language" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="react">React</option>
              </select>
            </div>
            
            <div style="margin-bottom: 15px;">
              <label style="display: block; margin-bottom: 5px; font-weight: 600;">Tipo de Análise:</label>
              <select id="test-analysis" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                <option value="complexity">Complexidade</option>
                <option value="optimization">Otimização</option>
                <option value="security">Segurança</option>
                <option value="best_practices">Melhores Práticas</option>
              </select>
            </div>
            
            <div style="margin-bottom: 15px;">
              <label style="display: block; margin-bottom: 5px; font-weight: 600;">Nível:</label>
              <select id="test-level" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                <option value="beginner">Iniciante</option>
                <option value="intermediate" selected>Intermediário</option>
                <option value="advanced">Avançado</option>
              </select>
            </div>
            
            <button id="test-generate" style="
              width: 100%;
              padding: 12px;
              background: #1976d2;
              color: white;
              border: none;
              border-radius: 6px;
              font-weight: 600;
              cursor: pointer;
              margin-bottom: 15px;
            ">🚀 Gerar Explicação Rica</button>
            
            <div id="test-results" style="
              padding: 15px;
              background: #f5f5f5;
              border-radius: 6px;
              font-size: 14px;
              min-height: 100px;
            ">Clique em "Gerar Explicação Rica" para testar</div>
          </div>
        </div>
      </div>
      
      <style>
        .demo-tabs {
          display: flex;
          margin-bottom: 20px;
          border-bottom: 1px solid #ddd;
        }
        
        .demo-tab {
          flex: 1;
          padding: 10px;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          color: #666;
          border-bottom: 2px solid transparent;
        }
        
        .demo-tab.active {
          color: #1976d2;
          border-bottom-color: #1976d2;
        }
        
        .demo-panel {
          display: none;
        }
        
        .demo-panel.active {
          display: block;
        }
        
        .features-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        
        .feature-card {
          padding: 10px;
          background: #f8f9fa;
          border-radius: 6px;
          border: 1px solid #e9ecef;
        }
        
        .feature-card h4 {
          margin: 0 0 5px 0;
          font-size: 14px;
          color: #1976d2;
        }
        
        .feature-card p {
          margin: 0;
          font-size: 12px;
          color: #666;
        }
      </style>
    `;

    // Remover interface existente
    const existing = document.getElementById('devmentor-complete-demo');
    if (existing) existing.remove();

    // Adicionar nova interface
    document.body.insertAdjacentHTML('beforeend', demoHTML);

    // Configurar event listeners
    this._setupCompleteDemoEventListeners();
  }

  /**
   * CONFIGURAR EVENT LISTENERS DA DEMO COMPLETA
   */
  _setupCompleteDemoEventListeners() {
    // Fechar demo
    document.getElementById('close-complete-demo').addEventListener('click', () => {
      document.getElementById('devmentor-complete-demo').remove();
    });

    // Tabs
    document.querySelectorAll('.demo-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        // Remover active de todas as tabs
        document.querySelectorAll('.demo-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.demo-panel').forEach(p => p.classList.remove('active'));
        
        // Adicionar active à tab clicada
        tab.classList.add('active');
        document.getElementById(`panel-${tab.dataset.tab}`).classList.add('active');
        
        // Atualizar conteúdo se necessário
        if (tab.dataset.tab === 'overview') {
          this._updateOverviewPanel();
        }
      });
    });

    // Testar sistema
    document.getElementById('test-generate').addEventListener('click', async () => {
      const language = document.getElementById('test-language').value;
      const analysis = document.getElementById('test-analysis').value;
      const level = document.getElementById('test-level').value;
      const resultsDiv = document.getElementById('test-results');

      resultsDiv.innerHTML = '🔄 Gerando explicação rica...';
      document.getElementById('test-generate').disabled = true;

      try {
        const data = this.demoData[language];
        const explanation = await window.DevMentorHelpers.generateRichExplanation(
          data.code,
          analysis,
          language,
          level
        );

        resultsDiv.innerHTML = `
          ✅ Explicação gerada com sucesso!<br>
          📊 Tamanho: ${explanation.length} caracteres<br>
          🎯 Tipo: ${analysis}<br>
          💻 Linguagem: ${language}<br>
          👤 Nível: ${level}<br>
          <br>
          <strong>Componentes incluídos:</strong><br>
          ${explanation.includes('video') ? '🎬 Vídeo' : ''}
          ${explanation.includes('citations') ? '📚 Citações' : ''}
          ${explanation.includes('playground') ? '🎮 Playground' : ''}
          ${explanation.includes('metaphor') ? '🎨 Metáforas' : ''}
          ${explanation.includes('mermaid') ? '📊 Diagramas' : ''}
          ${explanation.includes('quiz') ? '✅ Quizzes' : ''}
        `;

      } catch (error) {
        resultsDiv.innerHTML = `❌ Erro: ${error.message}`;
      } finally {
        document.getElementById('test-generate').disabled = false;
      }
    });

    // Atualizar painel de visão geral
    this._updateOverviewPanel();
  }

  /**
   * ATUALIZAR PAINEL DE VISÃO GERAL
   */
  _updateOverviewPanel() {
    const status = window.DevMentorHelpers.getMediaRichSystemStatus();
    
    // Status do sistema
    const statusDiv = document.getElementById('system-status');
    if (statusDiv) {
      statusDiv.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px; margin-bottom: 15px;">
          <div style="padding: 5px; background: ${status.mediaRichEngine ? '#4caf50' : '#f44336'}; color: white; border-radius: 4px; font-size: 12px;">
            ${status.mediaRichEngine ? '✅' : '❌'} MediaRichEngine
          </div>
          <div style="padding: 5px; background: ${status.citationEngine ? '#4caf50' : '#f44336'}; color: white; border-radius: 4px; font-size: 12px;">
            ${status.citationEngine ? '✅' : '❌'} CitationEngine
          </div>
          <div style="padding: 5px; background: ${status.interactivePlayground ? '#4caf50' : '#f44336'}; color: white; border-radius: 4px; font-size: 12px;">
            ${status.interactivePlayground ? '✅' : '❌'} InteractivePlayground
          </div>
          <div style="padding: 5px; background: ${status.visualMetaphorEngine ? '#4caf50' : '#f44336'}; color: white; border-radius: 4px; font-size: 12px;">
            ${status.visualMetaphorEngine ? '✅' : '❌'} VisualMetaphorEngine
          </div>
          <div style="padding: 5px; background: ${status.diagramGenerator ? '#4caf50' : '#f44336'}; color: white; border-radius: 4px; font-size: 12px;">
            ${status.diagramGenerator ? '✅' : '❌'} DiagramGenerator
          </div>
          <div style="padding: 5px; background: ${status.aiVideoGenerator ? '#4caf50' : '#f44336'}; color: white; border-radius: 4px; font-size: 12px;">
            ${status.aiVideoGenerator ? '✅' : '❌'} AIVideoGenerator
          </div>
          <div style="padding: 5px; background: ${status.quizGenerator ? '#4caf50' : '#f44336'}; color: white; border-radius: 4px; font-size: 12px;">
            ${status.quizGenerator ? '✅' : '❌'} QuizGenerator
          </div>
          <div style="padding: 5px; background: ${status.stylesLoaded ? '#4caf50' : '#f44336'}; color: white; border-radius: 4px; font-size: 12px;">
            ${status.stylesLoaded ? '✅' : '❌'} Estilos CSS
          </div>
        </div>
        <div style="text-align: center; font-weight: 600; color: ${status.allComponentsLoaded ? '#4caf50' : '#f44336'};">
          Sistema Completo: ${status.allComponentsLoaded ? '✅ Funcionando' : '❌ Incompleto'}
        </div>
      `;
    }

    // Estatísticas
    const statsDiv = document.getElementById('system-stats');
    if (statsDiv) {
      const activeComponents = Object.values(status).filter(Boolean).length;
      statsDiv.innerHTML = `
        <div style="font-size: 14px;">
          <div>📊 Componentes Ativos: ${activeComponents}/8</div>
          <div>🎯 Sistema Completo: ${status.allComponentsLoaded ? 'Sim' : 'Não'}</div>
          <div>🎨 Estilos Carregados: ${status.stylesLoaded ? 'Sim' : 'Não'}</div>
        </div>
      `;
    }

    // Lista de componentes
    const componentsDiv = document.getElementById('components-list');
    if (componentsDiv) {
      const components = [
        'MediaRichExplanationEngine',
        'CitationEngine', 
        'InteractivePlayground',
        'VisualMetaphorEngine',
        'DiagramGenerator',
        'AIVideoGenerator',
        'QuizGenerator',
        'GeminiProIntegration'
      ];
      
      componentsDiv.innerHTML = components.map(comp => `
        <div style="font-size: 12px; margin-bottom: 5px;">
          • ${comp}
        </div>
      `).join('');
    }
  }
}

// Exportar para uso global
window.CompleteMediaRichDemo = CompleteMediaRichDemo;

// Auto-executar demo se solicitado
if (window.location.search.includes('demo=complete')) {
  const demo = new CompleteMediaRichDemo();
  demo.runCompleteDemo();
}







