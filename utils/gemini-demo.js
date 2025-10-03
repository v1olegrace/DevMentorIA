/**
 * DevMentor AI - Demo Gemini Pro
 * Demonstração das funcionalidades com Gemini Pro
 */

// Demo rápida do Gemini Pro
async function demoGeminiPro() {
  console.log('🤖 === DEMO GEMINI PRO ===\n');
  
  try {
    // Verificar se está configurado
    if (!window.geminiProIntegration) {
      console.log('❌ Gemini Pro não disponível');
      return;
    }
    
    const status = window.geminiProIntegration.getStatus();
    if (!status.isConfigured) {
      console.log('⚠️ Configurando Gemini Pro...');
      window.geminiProIntegration.configure('AIzaSyCMHvp5v4Wkp2axyqW4-9tKIt1vLuomRxY');
    }
    
    // Testar conexão
    const isConnected = await window.geminiProIntegration.testConnection();
    console.log(`🔗 Conexão: ${isConnected ? '✅ Conectado' : '❌ Falhou'}`);
    
    if (!isConnected) {
      console.log('❌ Não foi possível conectar ao Gemini Pro');
      return;
    }
    
    // Demo de explicação inteligente
    console.log('\n📖 Gerando explicação inteligente...');
    const explicacao = await window.geminiProIntegration.generateIntelligentExplanation(
      'async function fetchData() { return await fetch("/api"); }',
      'javascript',
      'complexity',
      'intermediate'
    );
    
    console.log('✅ Explicação gerada!');
    console.log(`📝 Conceito: ${explicacao.mainConcept || 'N/A'}`);
    console.log(`🔍 Análise: ${explicacao.detailedAnalysis ? 'Sim' : 'Não'}`);
    console.log(`💡 Melhorias: ${explicacao.improvements ? 'Sim' : 'Não'}`);
    
    // Demo de roteiro de vídeo
    console.log('\n🎬 Gerando roteiro de vídeo...');
    const roteiro = await window.geminiProIntegration.generateVideoScript(
      'console.log("Hello World!");',
      'javascript',
      'optimization',
      30
    );
    
    console.log('✅ Roteiro gerado!');
    console.log(`🎬 Cenas: ${roteiro.scenes ? roteiro.scenes.length : 0}`);
    
    // Demo de quizzes
    console.log('\n✅ Gerando quizzes...');
    const quizzes = await window.DevMentorGeminiTests.generatePersonalizedQuizzes(
      'function test() { return "hello"; }',
      'javascript',
      [{ name: 'functions', confidence: 0.9 }],
      'beginner'
    );
    
    console.log('✅ Quizzes gerados!');
    console.log(`📝 Perguntas: ${quizzes.length}`);
    
    console.log('\n🎉 DEMO GEMINI PRO CONCLUÍDA!');
    console.log('🚀 Sistema com AI avançada funcionando!');
    
  } catch (error) {
    console.error('❌ Erro na demo:', error);
  }
}

// Exportar para uso global
window.demoGeminiPro = demoGeminiPro;

console.log('🤖 Demo Gemini Pro carregada!');
console.log('📋 Execute: window.demoGeminiPro()');







