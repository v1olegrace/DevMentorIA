/**
 * DevMentor AI - Media-Rich Explanation Demo
 * Demonstração completa das funcionalidades de explicação rica
 */

class MediaRichDemo {
  constructor() {
    this.demoCode = {
      javascript: `
// Exemplo de código JavaScript complexo
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
      
      python: `
# Exemplo de código Python com list comprehension
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

# Decorator para logging
def log_execution(func):
    def wrapper(*args, **kwargs):
        print(f"Executando {func.__name__}")
        result = func(*args, **kwargs)
        print(f"Resultado: {result}")
        return result
    return wrapper

@log_execution
def calculate_fibonacci(n):
    if n <= 1:
        return n
    return calculate_fibonacci(n-1) + calculate_fibonacci(n-2)
      `,
      
      react: `
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
      `
    };
    
    this.demoScenarios = [
      {
        title: 'Análise de Complexidade',
        type: 'complexity',
        description: 'Analisa a complexidade algorítmica do código'
      },
      {
        title: 'Otimização de Performance',
        type: 'optimization', 
        description: 'Identifica oportunidades de otimização'
      },
      {
        title: 'Análise de Segurança',
        type: 'security',
        description: 'Detecta vulnerabilidades de segurança'
      },
      {
        title: 'Melhores Práticas',
        type: 'best_practices',
        description: 'Sugere melhorias de código'
      }
    ];
  }

  /**
   * EXECUTAR DEMO COMPLETA
   * Demonstra todas as funcionalidades do sistema
   */
  async runCompleteDemo() {
    console.log('🎬 === DEMO COMPLETA - DEVMENTOR AI MEDIA-RICH ===\n');

    try {
      // 1. Inicializar sistema
      console.log('1️⃣ INICIALIZANDO SISTEMA...');
      const initialized = await window.DevMentorHelpers.initializeMediaRichSystem();
      
      if (!initialized) {
        console.error('❌ Falha na inicialização do sistema');
        return;
      }
      
      console.log('✅ Sistema inicializado com sucesso\n');

      // 2. Verificar status
      console.log('2️⃣ VERIFICANDO STATUS DO SISTEMA...');
      const status = window.DevMentorHelpers.getMediaRichSystemStatus();
      console.log('Status:', status);
      console.log('✅ Todos os componentes carregados\n');

      // 3. Demo para cada linguagem
      for (const [language, code] of Object.entries(this.demoCode)) {
        console.log(`3️⃣ DEMO PARA ${language.toUpperCase()}...`);
        await this._demoLanguage(language, code);
        console.log(`✅ Demo ${language} concluída\n`);
      }

      // 4. Demo de funcionalidades específicas
      console.log('4️⃣ DEMO DE FUNCIONALIDADES ESPECÍFICAS...');
      await this._demoSpecificFeatures();
      console.log('✅ Demo de funcionalidades concluída\n');

      // 5. Resumo final
      console.log('5️⃣ RESUMO FINAL...');
      this._showFinalSummary();

    } catch (error) {
      console.error('❌ Erro durante demo:', error);
    }
  }

  /**
   * DEMO POR LINGUAGEM
   * Demonstra funcionalidades para uma linguagem específica
   */
  async _demoLanguage(language, code) {
    console.log(`   📝 Código ${language}: ${code.length} caracteres`);
    
    for (const scenario of this.demoScenarios) {
      console.log(`   🔍 ${scenario.title}...`);
      
      try {
        const explanation = await window.DevMentorHelpers.generateRichExplanation(
          code,
          scenario.type,
          language,
          'intermediate'
        );
        
        console.log(`   ✅ ${scenario.title} gerada`);
        console.log(`   📊 Tamanho da explicação: ${explanation.length} caracteres`);
        
        // Simular análise da explicação
        this._analyzeExplanation(explanation, scenario.type);
        
      } catch (error) {
        console.warn(`   ⚠️ Erro em ${scenario.title}:`, error.message);
      }
    }
  }

  /**
   * DEMO DE FUNCIONALIDADES ESPECÍFICAS
   * Demonstra componentes individuais
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
      console.log(`   ✅ ${this._countTotalCitations(citations)} citações encontradas`);
    }

    // Demo de metáforas visuais
    console.log('   🎨 Testando VisualMetaphorEngine...');
    if (window.visualMetaphorEngine) {
      const metaphors = ['async_await', 'promises', 'recursion'];
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
  }

  /**
   * ANALISAR EXPLICAÇÃO
   * Analisa a qualidade da explicação gerada
   */
  _analyzeExplanation(explanation, type) {
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
    console.log('🏆 === RESUMO FINAL ===');
    console.log('');
    console.log('✅ FUNCIONALIDADES IMPLEMENTADAS:');
    console.log('   📖 Explicações de texto enriquecidas');
    console.log('   🎬 Vídeos AI gerados (simulados)');
    console.log('   📚 Citações automáticas de fontes autoritativas');
    console.log('   🎮 Playground interativo de código');
    console.log('   🎨 Metáforas visuais memoráveis');
    console.log('   📊 Diagramas Mermaid automáticos');
    console.log('   ✅ Quizzes interativos');
    console.log('   💪 Exercícios práticos');
    console.log('   🎨 Estilos CSS profissionais');
    console.log('');
    console.log('🚀 DIFERENCIAL COMPETITIVO:');
    console.log('   • Multi-sensorial: Texto + Vídeo + Interativo');
    console.log('   • Autoritativo: Citações de fontes confiáveis');
    console.log('   • Prático: Aprender fazendo');
    console.log('   • Visual: Metáforas e diagramas');
    console.log('   • Verificado: Quizzes e exercícios');
    console.log('   • Conectado: Links para comunidades');
    console.log('');
    console.log('🎯 PRONTO PARA HACKATHON!');
    console.log('   Sistema completo de explicações ricas em mídia');
    console.log('   Implementação modular e extensível');
    console.log('   Interface profissional e responsiva');
    console.log('   Funcionalidades únicas no mercado');
    console.log('');
  }

  /**
   * DEMO RÁPIDA
   * Demo simplificada para apresentação
   */
  async runQuickDemo() {
    console.log('⚡ === DEMO RÁPIDA ===\n');

    try {
      // Inicializar sistema
      await window.DevMentorHelpers.initializeMediaRichSystem();
      
      // Demo com código JavaScript
      const code = this.demoCode.javascript;
      const explanation = await window.DevMentorHelpers.generateRichExplanation(
        code,
        'complexity',
        'javascript',
        'intermediate'
      );
      
      console.log('✅ Explicação rica gerada!');
      console.log(`📊 Tamanho: ${explanation.length} caracteres`);
      console.log('🎬 Demo concluída!\n');
      
    } catch (error) {
      console.error('❌ Erro na demo rápida:', error);
    }
  }

  /**
   * DEMO INTERATIVA
   * Permite ao usuário testar diferentes cenários
   */
  async runInteractiveDemo() {
    console.log('🎮 === DEMO INTERATIVA ===\n');
    
    // Criar interface de demo
    this._createDemoInterface();
    
    console.log('✅ Interface de demo criada!');
    console.log('🎯 Use a interface para testar diferentes cenários');
  }

  /**
   * CRIAR INTERFACE DE DEMO
   * Interface web para testar funcionalidades
   */
  _createDemoInterface() {
    const demoHTML = `
      <div id="devmentor-demo-interface" style="
        position: fixed;
        top: 20px;
        right: 20px;
        width: 400px;
        background: white;
        border: 2px solid #1976d2;
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        z-index: 10000;
        font-family: system-ui, sans-serif;
      ">
        <h3 style="margin: 0 0 15px 0; color: #1976d2;">🎬 DevMentor AI Demo</h3>
        
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 600;">Linguagem:</label>
          <select id="demo-language" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="react">React</option>
          </select>
        </div>
        
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 600;">Tipo de Análise:</label>
          <select id="demo-analysis" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
            <option value="complexity">Complexidade</option>
            <option value="optimization">Otimização</option>
            <option value="security">Segurança</option>
            <option value="best_practices">Melhores Práticas</option>
          </select>
        </div>
        
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 600;">Nível do Usuário:</label>
          <select id="demo-level" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
            <option value="beginner">Iniciante</option>
            <option value="intermediate" selected>Intermediário</option>
            <option value="advanced">Avançado</option>
          </select>
        </div>
        
        <button id="demo-generate" style="
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
        
        <div id="demo-status" style="
          padding: 10px;
          background: #f5f5f5;
          border-radius: 4px;
          font-size: 14px;
          min-height: 50px;
        ">Clique em "Gerar Explicação Rica" para começar</div>
        
        <button id="demo-close" style="
          position: absolute;
          top: 10px;
          right: 10px;
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
          color: #666;
        ">×</button>
      </div>
    `;

    // Remover interface existente
    const existing = document.getElementById('devmentor-demo-interface');
    if (existing) existing.remove();

    // Adicionar nova interface
    document.body.insertAdjacentHTML('beforeend', demoHTML);

    // Configurar event listeners
    this._setupDemoEventListeners();
  }

  /**
   * CONFIGURAR EVENT LISTENERS DA DEMO
   */
  _setupDemoEventListeners() {
    const generateBtn = document.getElementById('demo-generate');
    const closeBtn = document.getElementById('demo-close');
    const statusDiv = document.getElementById('demo-status');

    generateBtn.addEventListener('click', async () => {
      const language = document.getElementById('demo-language').value;
      const analysis = document.getElementById('demo-analysis').value;
      const level = document.getElementById('demo-level').value;

      statusDiv.innerHTML = '🔄 Gerando explicação rica...';
      generateBtn.disabled = true;

      try {
        const code = this.demoCode[language];
        const explanation = await window.DevMentorHelpers.generateRichExplanation(
          code,
          analysis,
          language,
          level
        );

        statusDiv.innerHTML = `
          ✅ Explicação gerada com sucesso!<br>
          📊 Tamanho: ${explanation.length} caracteres<br>
          🎯 Tipo: ${analysis}<br>
          💻 Linguagem: ${language}<br>
          👤 Nível: ${level}
        `;

      } catch (error) {
        statusDiv.innerHTML = `❌ Erro: ${error.message}`;
      } finally {
        generateBtn.disabled = false;
      }
    });

    closeBtn.addEventListener('click', () => {
      document.getElementById('devmentor-demo-interface').remove();
    });
  }
}

// Exportar para uso global
window.MediaRichDemo = MediaRichDemo;

// Auto-executar demo se solicitado
if (window.location.search.includes('demo=true')) {
  const demo = new MediaRichDemo();
  demo.runQuickDemo();
}







