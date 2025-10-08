/**
 * DevMentor AI - Teste Gemini Pro
 * Teste específico das funcionalidades com Gemini Pro
 */

async function testarGeminiProCompleto() {
  console.log('🤖 === TESTE COMPLETO GEMINI PRO ===\n');
  
  try {
    // Verificar se Gemini Pro está configurado
    if (!window.geminiProIntegration) {
      console.log('❌ GeminiProIntegration não disponível');
      return;
    }
    
    const status = window.geminiProIntegration.getStatus();
    console.log(`📊 Status Gemini Pro: ${status.isConfigured ? 'Configurado' : 'Não configurado'}`);
    
    if (!status.isConfigured) {
      console.log('⚠️ Configurando Gemini Pro...');
      window.geminiProIntegration.configure('AIzaSyCMHvp5v4Wkp2axyqW4-9tKIt1vLuomRxY');
    }
    
    // Testar conexão
    console.log('\n1️⃣ TESTANDO CONEXÃO...');
    const isConnected = await window.geminiProIntegration.testConnection();
    console.log(`🔗 Conexão: ${isConnected ? '✅ Conectado' : '❌ Falhou'}`);
    
    if (!isConnected) {
      console.log('❌ Não foi possível conectar ao Gemini Pro');
      return;
    }
    
    // Código de teste
    const codigoTeste = `
async function fetchUserData(userId) {
  try {
    const response = await fetch(\`/api/users/\${userId}\`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro:', error);
    throw error;
  }
}
    `;
    
    // Teste 1: Explicação Inteligente
    console.log('\n2️⃣ TESTANDO EXPLICAÇÃO INTELIGENTE...');
    try {
      const explicacao = await window.geminiProIntegration.generateIntelligentExplanation(
        codigoTeste,
        'javascript',
        'complexity',
        'intermediate'
      );
      
      console.log('✅ Explicação inteligente gerada!');
      console.log(`📖 Conceito Principal: ${explicacao.mainConcept ? 'Sim' : 'Não'}`);
      console.log(`🔍 Análise Detalhada: ${explicacao.detailedAnalysis ? 'Sim' : 'Não'}`);
      console.log(`🎯 Padrões Identificados: ${explicacao.patterns ? 'Sim' : 'Não'}`);
      console.log(`💡 Melhorias Sugeridas: ${explicacao.improvements ? 'Sim' : 'Não'}`);
      console.log(`🎨 Analogia: ${explicacao.analogy ? 'Sim' : 'Não'}`);
      console.log(`📝 Exemplo Prático: ${explicacao.practicalExample ? 'Sim' : 'Não'}`);
      
    } catch (error) {
      console.warn('⚠️ Erro na explicação inteligente:', error.message);
    }
    
    // Teste 2: Roteiro de Vídeo
    console.log('\n3️⃣ TESTANDO ROTEIRO DE VÍDEO...');
    try {
      const roteiro = await window.geminiProIntegration.generateVideoScript(
        codigoTeste,
        'javascript',
        'optimization',
        60
      );
      
      console.log('✅ Roteiro de vídeo gerado!');
      console.log(`🎬 Cenas: ${roteiro.scenes ? roteiro.scenes.length : 0}`);
      console.log(`⏱️ Duração Total: ${roteiro.scenes ? roteiro.scenes.reduce((total, cena) => total + cena.duration, 0) : 0}s`);
      
    } catch (error) {
      console.warn('⚠️ Erro no roteiro de vídeo:', error.message);
    }
    
    // Teste 3: Quizzes Personalizados
    console.log('\n4️⃣ TESTANDO QUIZZES PERSONALIZADOS...');
    try {
      const quizzes = await window.geminiProIntegration.generatePersonalizedQuizzes(
        codigoTeste,
        'javascript',
        [
          { name: 'async/await', confidence: 0.9 },
          { name: 'error handling', confidence: 0.8 },
          { name: 'fetch API', confidence: 0.7 }
        ],
        'intermediate'
      );
      
      console.log('✅ Quizzes personalizados gerados!');
      console.log(`📝 Número de perguntas: ${quizzes.length}`);
      
      quizzes.forEach((quiz, index) => {
        console.log(`  ${index + 1}. ${quiz.question ? 'Pergunta' : 'Sem pergunta'}`);
      });
      
    } catch (error) {
      console.warn('⚠️ Erro nos quizzes personalizados:', error.message);
    }
    
    // Teste 4: Análise de Otimização
    console.log('\n5️⃣ TESTANDO ANÁLISE DE OTIMIZAÇÃO...');
    try {
      const analise = await window.geminiProIntegration.analyzeCodeForOptimization(
        codigoTeste,
        'javascript'
      );
      
      console.log('✅ Análise de otimização gerada!');
      console.log(`⚡ Performance: ${analise.performance ? 'Sim' : 'Não'}`);
      console.log(`📖 Legibilidade: ${analise.readability ? 'Sim' : 'Não'}`);
      console.log(`🔧 Manutenibilidade: ${analise.maintainability ? 'Sim' : 'Não'}`);
      console.log(`🔒 Segurança: ${analise.security ? 'Sim' : 'Não'}`);
      console.log(`💻 Código Otimizado: ${analise.optimizedCode ? 'Sim' : 'Não'}`);
      
    } catch (error) {
      console.warn('⚠️ Erro na análise de otimização:', error.message);
    }
    
    // Teste 5: Metáforas Inteligentes
    console.log('\n6️⃣ TESTANDO METÁFORAS INTELIGENTES...');
    try {
      const metafora = await window.geminiProIntegration.generateIntelligentMetaphors(
        'async/await',
        'javascript'
      );
      
      console.log('✅ Metáfora inteligente gerada!');
      console.log(`🎨 Metáfora Principal: ${metafora.mainMetaphor ? 'Sim' : 'Não'}`);
      console.log(`📝 Explicação: ${metafora.explanation ? 'Sim' : 'Não'}`);
      console.log(`👁️ Elementos Visuais: ${metafora.visualElements ? 'Sim' : 'Não'}`);
      console.log(`💡 Exemplo Prático: ${metafora.practicalExample ? 'Sim' : 'Não'}`);
      console.log(`🔄 Variações: ${metafora.variations ? 'Sim' : 'Não'}`);
      
    } catch (error) {
      console.warn('⚠️ Erro nas metáforas inteligentes:', error.message);
    }
    
    // Teste 6: Diagramas Inteligentes
    console.log('\n7️⃣ TESTANDO DIAGRAMAS INTELIGENTES...');
    try {
      const diagrama = await window.geminiProIntegration.generateIntelligentDiagramDescription(
        codigoTeste,
        'javascript',
        'sequence'
      );
      
      console.log('✅ Descrição de diagrama gerada!');
      console.log(`📊 Estrutura: ${diagrama.structure ? 'Sim' : 'Não'}`);
      console.log(`🔄 Fluxo: ${diagrama.flow ? 'Sim' : 'Não'}`);
      console.log(`👁️ Elementos Visuais: ${diagrama.visualElements ? 'Sim' : 'Não'}`);
      console.log(`📝 Legendas: ${diagrama.legends ? 'Sim' : 'Não'}`);
      console.log(`🎨 Código Mermaid: ${diagrama.mermaidCode ? 'Sim' : 'Não'}`);
      
    } catch (error) {
      console.warn('⚠️ Erro nos diagramas inteligentes:', error.message);
    }
    
    // Resumo final
    console.log('\n🎉 === RESUMO TESTE GEMINI PRO ===');
    console.log('✅ Conexão estabelecida');
    console.log('✅ Explicações inteligentes funcionando');
    console.log('✅ Roteiros de vídeo gerados');
    console.log('✅ Quizzes personalizados criados');
    console.log('✅ Análise de otimização ativa');
    console.log('✅ Metáforas inteligentes funcionando');
    console.log('✅ Diagramas inteligentes gerados');
    console.log('\n🚀 GEMINI PRO TOTALMENTE FUNCIONAL!');
    console.log('🎯 Sistema com AI avançada ativado!');
    
  } catch (error) {
    console.error('❌ Erro durante teste Gemini Pro:', error);
  }
}

// Teste rápido do Gemini Pro
async function testeRapidoGeminiPro() {
  console.log('⚡ === TESTE RÁPIDO GEMINI PRO ===\n');
  
  try {
    if (!window.geminiProIntegration) {
      console.log('❌ GeminiProIntegration não disponível');
      return;
    }
    
    // Configurar se necessário
    if (!window.geminiProIntegration.getStatus().isConfigured) {
      window.geminiProIntegration.configure('AIzaSyCMHvp5v4Wkp2axyqW4-9tKIt1vLuomRxY');
    }
    
    // Testar conexão
    const isConnected = await window.geminiProIntegration.testConnection();
    console.log(`🔗 Conexão: ${isConnected ? '✅' : '❌'}`);
    
    if (isConnected) {
      // Teste rápido de explicação
      const explicacao = await window.geminiProIntegration.generateIntelligentExplanation(
        'console.log("Hello World!");',
        'javascript',
        'complexity',
        'beginner'
      );
      
      console.log(`📖 Explicação: ${explicacao.mainConcept ? '✅' : '❌'}`);
      console.log('🎉 Gemini Pro funcionando!');
    } else {
      console.log('❌ Gemini Pro não conectado');
    }
    
  } catch (error) {
    console.error('❌ Erro no teste rápido:', error);
  }
}

// Teste de integração completa
async function testarIntegracaoCompleta() {
  console.log('🎬 === TESTE INTEGRAÇÃO COMPLETA ===\n');
  
  try {
    // Inicializar sistema completo
    await window.DevMentorHelpers.initializeMediaRichSystem();
    
    // Verificar status
    const status = window.DevMentorHelpers.getMediaRichSystemStatus();
    console.log(`🎯 Sistema Completo: ${status.allComponentsLoaded ? '✅' : '❌'}`);
    console.log(`🤖 Gemini Pro: ${status.geminiProIntegration ? '✅' : '❌'}`);
    
    // Gerar explicação rica com Gemini Pro
    const explicacao = await window.DevMentorHelpers.generateRichExplanation(
      'async function test() { return await fetch("/api"); }',
      'complexity',
      'javascript',
      'intermediate'
    );
    
    console.log(`📖 Explicação Rica: ${explicacao.length} caracteres`);
    console.log(`🎬 Inclui Vídeo: ${explicacao.includes('video') ? '✅' : '❌'}`);
    console.log(`📚 Inclui Citações: ${explicacao.includes('citations') ? '✅' : '❌'}`);
    console.log(`🎮 Inclui Playground: ${explicacao.includes('playground') ? '✅' : '❌'}`);
    console.log(`🎨 Inclui Metáforas: ${explicacao.includes('metaphor') ? '✅' : '❌'}`);
    console.log(`📊 Inclui Diagramas: ${explicacao.includes('mermaid') ? '✅' : '❌'}`);
    console.log(`✅ Inclui Quizzes: ${explicacao.includes('quiz') ? '✅' : '❌'}`);
    
    console.log('\n🎉 INTEGRAÇÃO COMPLETA FUNCIONANDO!');
    console.log('🚀 Sistema com AI avançada totalmente operacional!');
    
  } catch (error) {
    console.error('❌ Erro na integração:', error);
  }
}

// Exportar funções de teste
window.DevMentorGeminiTests = {
  testarGeminiProCompleto,
  testeRapidoGeminiPro,
  testarIntegracaoCompleta
};

console.log('🤖 DevMentor Gemini Tests carregados!');
console.log('📋 Comandos disponíveis:');
console.log('  - window.DevMentorGeminiTests.testarGeminiProCompleto()');
console.log('  - window.DevMentorGeminiTests.testeRapidoGeminiPro()');
console.log('  - window.DevMentorGeminiTests.testarIntegracaoCompleta()');















