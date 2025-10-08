/**
 * DevMentor AI - Configuração Gemini Pro
 * Configuração automática com API key fornecida
 */

// Configuração do Gemini Pro
window.GEMINI_CONFIG = {
  model: 'gemini-2.5-flash',  // ✅ MODELO CORRETO
  apiEndpoint: 'https://generativelanguage.googleapis.com/v1beta',
  fallbackModels: [
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-flash-latest'
  ]
};

// Configurar Gemini Pro com a API key fornecida
if (window.geminiProIntegration) {
  try {
    window.geminiProIntegration.configure('AIzaSyCMHvp5v4Wkp2axyqW4-9tKIt1vLuomRxY');
    console.log('✅ Gemini Pro configurado com sucesso!');
    console.log('📋 Modelo:', window.geminiProIntegration.config.model);
    console.log('🌐 Endpoint:', window.geminiProIntegration.config.apiEndpoint);
    
    // Testar conexão
    window.geminiProIntegration.testConnection().then(isConnected => {
      if (isConnected) {
        console.log('🚀 Gemini Pro conectado e funcionando!');
        console.log('🎯 Sistema completo com AI avançada ativado!');
      } else {
        console.warn('⚠️ Gemini Pro configurado mas conexão falhou');
        console.log('💡 Tentando listar modelos disponíveis...');
        window.geminiProIntegration.listAvailableModels();
      }
    });
    
  } catch (error) {
    console.error('❌ Erro ao configurar Gemini Pro:', error);
  }
} else {
  console.warn('⚠️ GeminiProIntegration não disponível ainda');
}

// Configurar sistema principal com Gemini Pro
if (window.devMentorConfig) {
  window.devMentorConfig.configure({
    geminiApiKey: 'AIzaSyCMHvp5v4Wkp2axyqW4-9tKIt1vLuomRxY',
    debug: true,
    showNotifications: true,
    features: {
      citations: true,
      playground: true,
      metaphors: true,
      diagrams: true,
      videos: true,
      quizzes: true,
      geminiIntegration: true
    }
  });
  console.log('⚙️ Sistema configurado com Gemini Pro!');
}

console.log('🤖 Gemini Pro API Key configurada: AIzaSyCMHvp5v4Wkp2axyqW4-9tKIt1vLuomRxY');
