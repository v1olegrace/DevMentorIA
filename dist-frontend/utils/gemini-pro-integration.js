/**
 * DevMentor AI - Google Gemini Pro Integration
 * Configuração e integração com Google Gemini Pro para funcionalidades avançadas
 * 
 * Funcionalidades:
 * - Geração de explicações mais inteligentes
 * - Criação de vídeos com roteiros AI
 * - Geração de quizzes personalizados
 * - Análise de código mais profunda
 * - Sugestões de otimização
 */

class GeminiProIntegration {
  constructor() {
    this.config = {
      apiKey: null,
      model: 'gemini-2.5-flash',  // ✅ MODELO CORRETO E DISPONÍVEL
      apiEndpoint: 'https://generativelanguage.googleapis.com/v1beta',
      maxRetries: 3,
      retryDelay: 1000
    };
    this.isConfigured = false;
    
    // Configurações padrão
    this.defaultConfig = {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 2048,
      safetySettings: [
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
          category: 'HARM_CATEGORY_HATE_SPEECH',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        }
      ]
    };
    
    console.log('[GeminiProIntegration] Inicializado');
  }

  /**
   * CONFIGURAR API KEY
   * Define a chave da API do Google Gemini Pro
   */
  configure(apiKey, modelOverride = null) {
    if (!apiKey || typeof apiKey !== 'string') {
      throw new Error('API key inválida');
    }
    
    this.config.apiKey = apiKey;
    
    // Permitir override do modelo
    if (modelOverride) {
      this.config.model = modelOverride;
    }
    
    this.isConfigured = true;
    
    console.log(`[GeminiProIntegration] Configurado com modelo: ${this.config.model}`);
    
    // Testar conexão
    this.testConnection();
  }

  /**
   * TESTAR CONEXÃO
   * Verifica se a API está funcionando
   */
  async testConnection() {
    if (!this.isConfigured) {
      console.error('[GeminiProIntegration] Sistema não configurado');
      return false;
    }

    try {
      console.log(`[GeminiProIntegration] Testando conexão com modelo: ${this.config.model}`);
      const response = await this.generateContent('Responda apenas: OK');
      console.log('[GeminiProIntegration] ✅ Conexão bem-sucedida!');
      return response && response.length > 0;
    } catch (error) {
      console.error('[GeminiProIntegration] Erro na conexão:', error);
      console.log('[GeminiProIntegration] 💡 Listando modelos disponíveis...');
      await this.listAvailableModels();
      return false;
    }
  }

  /**
   * LISTAR MODELOS DISPONÍVEIS
   * Verifica quais modelos estão disponíveis na API
   */
  async listAvailableModels() {
    if (!this.isConfigured) {
      throw new Error('Gemini Pro não configurado. Use configure(apiKey) primeiro.');
    }

    try {
      const response = await fetch(`${this.config.apiEndpoint}/models?key=${this.config.apiKey}`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      const modelNames = data.models.map(m => m.name.replace('models/', ''));
      
      console.log('📋 Modelos disponíveis:', modelNames.join(', '));
      
      // Filtrar apenas modelos de geração de conteúdo
      const generativeModels = data.models.filter(m => 
        m.supportedGenerationMethods?.includes('generateContent')
      );
      
      console.log('📋 Modelos para generateContent:', 
        generativeModels.map(m => m.name.replace('models/', '')).join(', ')
      );
      
      return data.models;
    } catch (error) {
      console.error('❌ Erro ao listar modelos:', error);
      return [];
    }
  }

  /**
   * GERAR CONTEÚDO
   * Método principal para gerar conteúdo com Gemini Pro
   */
  async generateContent(prompt, options = {}) {
    if (!this.isConfigured) {
      throw new Error('Gemini Pro não configurado. Use configure(apiKey) primeiro.');
    }

    const config = { ...this.defaultConfig, ...options };

    try {
      const response = await fetch(`${this.config.apiEndpoint}/models/${this.config.model}:generateContent?key=${this.config.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: config.temperature,
            topK: config.topK,
            topP: config.topP,
            maxOutputTokens: config.maxOutputTokens,
          },
          safetySettings: config.safetySettings
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Gemini API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error('Resposta inválida da API');
      }

      return data.candidates[0].content.parts[0].text;

    } catch (error) {
      console.error('[GeminiProIntegration] Erro na geração:', error);
      throw error;
    }
  }

  /**
   * GERAR EXPLICAÇÃO INTELIGENTE DE CÓDIGO
   * Usa Gemini Pro para criar explicações mais sofisticadas
   */
  async generateIntelligentExplanation(code, language, analysisType, userLevel) {
    const prompt = `
    Você é um especialista em programação e educação. Analise o seguinte código ${language} e crie uma explicação educacional completa.

    Código:
    \`\`\`${language}
    ${code}
    \`\`\`

    Tipo de análise: ${analysisType}
    Nível do usuário: ${userLevel}

    Crie uma explicação que:
    1. Seja apropriada para o nível ${userLevel}
    2. Explique o conceito principal de forma clara
    3. Identifique padrões e técnicas importantes
    4. Sugira melhorias quando apropriado
    5. Use analogias do mundo real quando útil
    6. Inclua exemplos práticos

    Formato da resposta:
    - **Conceito Principal**: [explicação do conceito]
    - **Análise Detalhada**: [análise linha por linha]
    - **Padrões Identificados**: [padrões de design/código]
    - **Melhorias Sugeridas**: [sugestões de otimização]
    - **Analogia**: [analogia do mundo real]
    - **Exemplo Prático**: [exemplo de uso]

    Responda em português brasileiro.
    `;

    try {
      const explanation = await this.generateContent(prompt, {
        temperature: 0.8,
        maxOutputTokens: 3072
      });
      
      return this._parseExplanation(explanation);
      
    } catch (error) {
      console.warn('[GeminiProIntegration] Erro na explicação inteligente:', error);
      return this._createFallbackExplanation(code, language, analysisType);
    }
  }

  /**
   * GERAR ROTEIRO DE VÍDEO
   * Cria roteiro detalhado para vídeos explicativos
   */
  async generateVideoScript(code, language, analysisType, duration = 60) {
    const prompt = `
    Crie um roteiro detalhado para um vídeo educacional de programação.

    Código para explicar:
    \`\`\`${language}
    ${code}
    \`\`\`

    Tipo de análise: ${analysisType}
    Duração do vídeo: ${duration} segundos

    O roteiro deve incluir:

    1. **Introdução (10-15s)**:
       - Apresentação do problema/conceito
       - Contexto e importância

    2. **Visão Geral (15-20s)**:
       - Explicação geral do código
       - Conceitos principais

    3. **Análise Detalhada (25-35s)**:
       - Explicação linha por linha
       - Destaque de conceitos importantes
       - Demonstração visual

    4. **Conclusão (5-10s)**:
       - Resumo dos pontos principais
       - Próximos passos

    Para cada seção, forneça:
    - Narração (texto para falar)
    - Elementos visuais (código, diagramas, animações)
    - Pontos de foco (linhas específicas)
    - Timing preciso

    Formato JSON estruturado.
    `;

    try {
      const script = await this.generateContent(prompt, {
        temperature: 0.7,
        maxOutputTokens: 2048
      });
      
      return JSON.parse(script);
      
    } catch (error) {
      console.warn('[GeminiProIntegration] Erro no roteiro:', error);
      return this._createFallbackScript(code, language, duration);
    }
  }

  /**
   * GERAR QUIZZES PERSONALIZADOS
   * Cria perguntas de quiz baseadas no código
   */
  async generatePersonalizedQuizzes(code, language, concepts, userLevel) {
    const prompt = `
    Crie perguntas de quiz personalizadas para testar o entendimento deste código.

    Código:
    \`\`\`${language}
    ${code}
    \`\`\`

    Conceitos identificados: ${concepts.map(c => c.name).join(', ')}
    Nível do usuário: ${userLevel}

    Crie 5 perguntas variadas:

    1. **Múltipla Escolha**: Pergunta sobre conceito principal
    2. **Completar Código**: Preencher parte do código
    3. **Verdadeiro/Falso**: Afirmação sobre o código
    4. **Análise de Erro**: Identificar problema no código
    5. **Otimização**: Sugerir melhoria

    Para cada pergunta, forneça:
    - Texto da pergunta
    - Opções de resposta (se aplicável)
    - Resposta correta
    - Explicação detalhada
    - Dificuldade (easy, medium, hard)
    - Conceitos testados

    Formato JSON estruturado.
    `;

    try {
      const quizzes = await this.generateContent(prompt, {
        temperature: 0.8,
        maxOutputTokens: 3072
      });
      
      return JSON.parse(quizzes);
      
    } catch (error) {
      console.warn('[GeminiProIntegration] Erro nos quizzes:', error);
      return this._createFallbackQuizzes(concepts);
    }
  }

  /**
   * ANALISAR CÓDIGO PARA OTIMIZAÇÃO
   * Identifica oportunidades de melhoria
   */
  async analyzeCodeForOptimization(code, language) {
    const prompt = `
    Analise o seguinte código ${language} e identifique oportunidades de otimização.

    Código:
    \`\`\`${language}
    ${code}
    \`\`\`

    Forneça uma análise detalhada incluindo:

    1. **Performance**:
       - Complexidade de tempo e espaço
       - Gargalos identificados
       - Sugestões de otimização

    2. **Legibilidade**:
       - Clareza do código
       - Sugestões de refatoração
       - Melhores práticas

    3. **Manutenibilidade**:
       - Estrutura do código
       - Acoplamento e coesão
       - Sugestões de melhoria

    4. **Segurança**:
       - Vulnerabilidades potenciais
       - Boas práticas de segurança

    5. **Código Otimizado**:
       - Versão melhorada do código
       - Explicação das mudanças

    Formato estruturado com exemplos de código.
    `;

    try {
      const analysis = await this.generateContent(prompt, {
        temperature: 0.6,
        maxOutputTokens: 3072
      });
      
      return this._parseOptimizationAnalysis(analysis);
      
    } catch (error) {
      console.warn('[GeminiProIntegration] Erro na análise:', error);
      return this._createFallbackAnalysis(code);
    }
  }

  /**
   * GERAR METÁFORAS VISUAIS INTELIGENTES
   * Cria analogias mais sofisticadas
   */
  async generateIntelligentMetaphors(concept, language) {
    const prompt = `
    Crie uma metáfora visual inteligente para explicar o conceito de programação "${concept}" em ${language}.

    A metáfora deve:
    - Ser memorável e fácil de entender
    - Usar objetos/processos do mundo real
    - Explicar claramente o conceito
    - Incluir elementos visuais
    - Ser apropriada para diferentes níveis

    Forneça:
    1. **Metáfora Principal**: Analogia central
    2. **Explicação**: Como a metáfora se relaciona com o conceito
    3. **Elementos Visuais**: Objetos/imagens para ilustrar
    4. **Exemplo Prático**: Aplicação da metáfora
    5. **Variações**: Diferentes formas de explicar o mesmo conceito

    Seja criativo e use analogias únicas e envolventes.
    `;

    try {
      const metaphor = await this.generateContent(prompt, {
        temperature: 0.9,
        maxOutputTokens: 1536
      });
      
      return this._parseMetaphor(metaphor);
      
    } catch (error) {
      console.warn('[GeminiProIntegration] Erro na metáfora:', error);
      return this._createFallbackMetaphor(concept);
    }
  }

  /**
   * GERAR DIAGRAMAS INTELIGENTES
   * Cria descrições de diagramas mais sofisticadas
   */
  async generateIntelligentDiagramDescription(code, language, diagramType) {
    const prompt = `
    Crie uma descrição detalhada para um diagrama ${diagramType} que explique este código ${language}.

    Código:
    \`\`\`${language}
    ${code}
    \`\`\`

    O diagrama deve:
    - Mostrar claramente o fluxo/estrutura do código
    - Destacar elementos importantes
    - Ser apropriado para o tipo ${diagramType}
    - Incluir legendas e anotações
    - Ser educativo e claro

    Forneça:
    1. **Estrutura do Diagrama**: Elementos principais
    2. **Fluxo/Relacionamentos**: Como os elementos se conectam
    3. **Elementos Visuais**: Cores, formas, ícones
    4. **Legendas**: Textos explicativos
    5. **Código Mermaid**: Implementação em Mermaid.js

    Foque na clareza educacional.
    `;

    try {
      const description = await this.generateContent(prompt, {
        temperature: 0.7,
        maxOutputTokens: 2048
      });
      
      return this._parseDiagramDescription(description);
      
    } catch (error) {
      console.warn('[GeminiProIntegration] Erro no diagrama:', error);
      return this._createFallbackDiagram(diagramType);
    }
  }

  // Métodos auxiliares para parsing
  _parseExplanation(explanation) {
    // Parsear explicação estruturada
    const sections = {
      mainConcept: this._extractSection(explanation, 'Conceito Principal'),
      detailedAnalysis: this._extractSection(explanation, 'Análise Detalhada'),
      patterns: this._extractSection(explanation, 'Padrões Identificados'),
      improvements: this._extractSection(explanation, 'Melhorias Sugeridas'),
      analogy: this._extractSection(explanation, 'Analogia'),
      practicalExample: this._extractSection(explanation, 'Exemplo Prático')
    };
    
    return {
      ...sections,
      fullText: explanation,
      generatedAt: new Date().toISOString()
    };
  }

  _extractSection(text, sectionName) {
    const regex = new RegExp(`\\*\\*${sectionName}\\*\\*:?\\s*([\\s\\S]*?)(?=\\*\\*|$)`, 'i');
    const match = text.match(regex);
    return match ? match[1].trim() : '';
  }

  _parseOptimizationAnalysis(analysis) {
    return {
      performance: this._extractSection(analysis, 'Performance'),
      readability: this._extractSection(analysis, 'Legibilidade'),
      maintainability: this._extractSection(analysis, 'Manutenibilidade'),
      security: this._extractSection(analysis, 'Segurança'),
      optimizedCode: this._extractSection(analysis, 'Código Otimizado'),
      fullAnalysis: analysis
    };
  }

  _parseMetaphor(metaphor) {
    return {
      mainMetaphor: this._extractSection(metaphor, 'Metáfora Principal'),
      explanation: this._extractSection(metaphor, 'Explicação'),
      visualElements: this._extractSection(metaphor, 'Elementos Visuais'),
      practicalExample: this._extractSection(metaphor, 'Exemplo Prático'),
      variations: this._extractSection(metaphor, 'Variações'),
      fullMetaphor: metaphor
    };
  }

  _parseDiagramDescription(description) {
    return {
      structure: this._extractSection(description, 'Estrutura do Diagrama'),
      flow: this._extractSection(description, 'Fluxo/Relacionamentos'),
      visualElements: this._extractSection(description, 'Elementos Visuais'),
      legends: this._extractSection(description, 'Legendas'),
      mermaidCode: this._extractSection(description, 'Código Mermaid'),
      fullDescription: description
    };
  }

  // Métodos de fallback
  _createFallbackExplanation(code, language, analysisType) {
    return {
      mainConcept: `Este código ${language} implementa ${analysisType}`,
      detailedAnalysis: 'Análise detalhada não disponível',
      patterns: 'Padrões não identificados',
      improvements: 'Sugestões não disponíveis',
      analogy: 'Analogia não disponível',
      practicalExample: 'Exemplo não disponível',
      fullText: `Explicação básica para código ${language}`,
      fallback: true
    };
  }

  _createFallbackScript(code, language, duration) {
    return {
      scenes: [
        {
          id: 'intro',
          duration: Math.floor(duration * 0.2),
          narration: 'Vamos analisar este código',
          visualElements: ['code']
        },
        {
          id: 'analysis',
          duration: Math.floor(duration * 0.6),
          narration: 'Explicação do código',
          visualElements: ['code_animation']
        },
        {
          id: 'conclusion',
          duration: Math.floor(duration * 0.2),
          narration: 'Conclusão',
          visualElements: ['code']
        }
      ],
      fallback: true
    };
  }

  _createFallbackQuizzes(concepts) {
    return concepts.map(concept => ({
      question: `O que você sabe sobre ${concept.name}?`,
      type: 'multipleChoice',
      options: ['É importante', 'É útil', 'É complexo', 'Todas as anteriores'],
      correctAnswer: 3,
      explanation: `${concept.name} é um conceito importante`,
      difficulty: 'medium',
      fallback: true
    }));
  }

  _createFallbackAnalysis(code) {
    return {
      performance: 'Análise de performance não disponível',
      readability: 'Análise de legibilidade não disponível',
      maintainability: 'Análise de manutenibilidade não disponível',
      security: 'Análise de segurança não disponível',
      optimizedCode: code,
      fullAnalysis: 'Análise completa não disponível',
      fallback: true
    };
  }

  _createFallbackMetaphor(concept) {
    return {
      mainMetaphor: `${concept} é como um conceito importante`,
      explanation: 'Explicação não disponível',
      visualElements: 'Elementos visuais não disponíveis',
      practicalExample: 'Exemplo não disponível',
      variations: 'Variações não disponíveis',
      fullMetaphor: `Metáfora básica para ${concept}`,
      fallback: true
    };
  }

  _createFallbackDiagram(diagramType) {
    return {
      structure: 'Estrutura não disponível',
      flow: 'Fluxo não disponível',
      visualElements: 'Elementos visuais não disponíveis',
      legends: 'Legendas não disponíveis',
      mermaidCode: `graph TD\n  A[Início] --> B[Processo]\n  B --> C[Fim]`,
      fullDescription: `Diagrama ${diagramType} básico`,
      fallback: true
    };
  }

  /**
   * OBTER STATUS DA INTEGRAÇÃO
   */
  getStatus() {
    return {
      isConfigured: this.isConfigured,
      hasApiKey: !!this.config.apiKey,
      model: this.config.model,
      endpoint: this.config.apiEndpoint
    };
  }

  /**
   * LIMPAR CONFIGURAÇÃO
   */
  clearConfiguration() {
    this.apiKey = null;
    this.isConfigured = false;
    console.log('[GeminiProIntegration] Configuração limpa');
  }
}

// Instância global
window.geminiProIntegration = new GeminiProIntegration();

// Exportar para uso global
window.GeminiProIntegration = GeminiProIntegration;

// Auto-configuração se API key estiver disponível
if (typeof process !== 'undefined' && process.env && process.env.GEMINI_API_KEY) {
  window.geminiProIntegration.configure(process.env.GEMINI_API_KEY);
} else {
  // No navegador, não temos acesso a process.env
  console.log('[GeminiProIntegration] Aguardando configuração manual da API key');
}

console.log('🤖 Gemini Pro Integration carregado!');
