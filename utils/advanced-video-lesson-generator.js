/**
 * DevMentor AI - Sistema Avançado de Videoaulas com Gemini Pro
 * Geração de conteúdo educacional rico com explicações detalhadas e citações
 */

class AdvancedVideoLessonGenerator {
  constructor() {
    this.geminiIntegration = null;
    this.citationEngine = null;
    this.isInitialized = false;
    
    // Configurações para diferentes tipos de conteúdo
    this.contentTypes = {
      tutorial: {
        duration: '10-15 min',
        structure: ['introdução', 'conceitos', 'exemplos', 'exercícios', 'conclusão'],
        difficulty: ['iniciante', 'intermediário', 'avançado']
      },
      deepDive: {
        duration: '20-30 min',
        structure: ['contexto', 'análise', 'implementação', 'otimização', 'casos de uso'],
        difficulty: ['intermediário', 'avançado']
      },
      quickTip: {
        duration: '3-5 min',
        structure: ['problema', 'solução', 'exemplo'],
        difficulty: ['todos']
      }
    };
    
    console.log('[AdvancedVideoLessonGenerator] Inicializado');
  }

  /**
   * INICIALIZAR SISTEMA
   */
  async initialize() {
    try {
      // Aguardar Gemini Pro estar disponível
      if (window.geminiProIntegration) {
        this.geminiIntegration = window.geminiProIntegration;
      }
      
      // Aguardar Citation Engine estar disponível
      if (window.citationEngine) {
        this.citationEngine = window.citationEngine;
      }
      
      this.isInitialized = true;
      console.log('[AdvancedVideoLessonGenerator] Sistema inicializado com sucesso');
      return true;
    } catch (error) {
      console.error('[AdvancedVideoLessonGenerator] Erro na inicialização:', error);
      return false;
    }
  }

  /**
   * GERAR VIDEOAULA COMPLETA
   */
  async generateCompleteVideoLesson(code, options = {}) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const {
      language = 'javascript',
      contentType = 'tutorial',
      userLevel = 'intermediário',
      focusAreas = ['conceitos', 'prática'],
      includeSources = true,
      includeQuizzes = true,
      includeExercises = true
    } = options;

    console.log(`[AdvancedVideoLessonGenerator] Gerando videoaula: ${contentType} para ${userLevel}`);

    try {
      // 1. Análise do código com Gemini Pro
      const codeAnalysis = await this.analyzeCodeWithGemini(code, language, userLevel);
      
      // 2. Geração de fontes importantes
      const sources = includeSources ? await this.generateImportantSources(code, language) : [];
      
      // 3. Criação do roteiro de vídeo
      const videoScript = await this.generateVideoScript(code, codeAnalysis, contentType, userLevel);
      
      // 4. Geração de quizzes (se solicitado)
      const quizzes = includeQuizzes ? await this.generateEducationalQuizzes(code, language, userLevel) : [];
      
      // 5. Criação de exercícios práticos (se solicitado)
      const exercises = includeExercises ? await this.generatePracticalExercises(code, language, userLevel) : [];

      // 6. Montagem da videoaula completa
      const completeLesson = {
        metadata: {
          title: this.generateLessonTitle(codeAnalysis.mainConcept, contentType),
          duration: this.contentTypes[contentType].duration,
          difficulty: userLevel,
          language: language,
          createdAt: new Date().toISOString()
        },
        codeAnalysis: codeAnalysis,
        videoScript: videoScript,
        sources: sources,
        quizzes: quizzes,
        exercises: exercises,
        summary: await this.generateLessonSummary(codeAnalysis, videoScript)
      };

      console.log('[AdvancedVideoLessonGenerator] Videoaula gerada com sucesso');
      return completeLesson;

    } catch (error) {
      console.error('[AdvancedVideoLessonGenerator] Erro na geração:', error);
      throw error;
    }
  }

  /**
   * ANÁLISE PROFUNDA DO CÓDIGO COM GEMINI PRO
   */
  async analyzeCodeWithGemini(code, language, userLevel) {
    const prompt = `Você é um especialista em educação de programação. Analise este código e forneça uma análise educacional completa.

CÓDIGO:
\`\`\`${language}
${code}
\`\`\`

NÍVEL DO USUÁRIO: ${userLevel}

Forneça uma análise JSON com:
1. mainConcept: conceito principal em uma frase
2. keyConcepts: array de conceitos-chave (máximo 5)
3. complexityLevel: nível de complexidade (1-10)
4. learningObjectives: objetivos de aprendizagem (array)
5. prerequisites: pré-requisitos necessários (array)
6. commonMistakes: erros comuns (array)
7. bestPractices: melhores práticas (array)
8. realWorldApplications: aplicações no mundo real (array)
9. codeExplanation: explicação linha por linha
10. performanceNotes: notas sobre performance
11. securityConsiderations: considerações de segurança
12. testingSuggestions: sugestões de testes

Responda APENAS com JSON válido, sem markdown.`;

    try {
      const response = await this.geminiIntegration.generateContent(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('[AdvancedVideoLessonGenerator] Erro na análise:', error);
      return this.getFallbackAnalysis(code, language);
    }
  }

  /**
   * GERAÇÃO DE FONTES IMPORTANTES
   */
  async generateImportantSources(code, language) {
    const prompt = `Identifique as fontes mais importantes para aprender sobre os conceitos neste código:

CÓDIGO:
\`\`\`${language}
${code}
\`\`\`

Forneça um JSON com fontes organizadas por categoria:
1. officialDocs: documentação oficial (MDN, Python.org, etc.)
2. tutorials: tutoriais recomendados
3. stackOverflow: perguntas relevantes do Stack Overflow
4. github: repositórios GitHub relevantes
5. videos: vídeos educacionais (YouTube, etc.)
6. books: livros recomendados
7. articles: artigos técnicos
8. tools: ferramentas relacionadas

Para cada fonte, inclua: title, url, description, relevanceScore (1-10)

Responda APENAS com JSON válido.`;

    try {
      const response = await this.geminiIntegration.generateContent(prompt);
      const aiSources = JSON.parse(response);
      
      // Combinar com Citation Engine se disponível
      let engineSources = [];
      if (this.citationEngine) {
        engineSources = await this.citationEngine.findSources(code, language);
      }
      
      // Mesclar e priorizar fontes
      return this.mergeAndPrioritizeSources(aiSources, engineSources);
    } catch (error) {
      console.error('[AdvancedVideoLessonGenerator] Erro na geração de fontes:', error);
      return this.getFallbackSources(language);
    }
  }

  /**
   * GERAÇÃO DE ROTEIRO DE VÍDEO
   */
  async generateVideoScript(code, analysis, contentType, userLevel) {
    const prompt = `Crie um roteiro detalhado para uma videoaula educacional sobre este código:

CÓDIGO:
\`\`\`${analysis.language || 'javascript'}
${code}
\`\`\`

ANÁLISE: ${JSON.stringify(analysis)}
TIPO DE CONTEÚDO: ${contentType}
NÍVEL: ${userLevel}

Crie um roteiro JSON com:
1. introduction: introdução (30-60 segundos)
2. conceptExplanation: explicação dos conceitos (2-5 minutos)
3. codeWalkthrough: análise do código (3-8 minutos)
4. examples: exemplos práticos (2-4 minutos)
5. commonPitfalls: armadilhas comuns (1-2 minutos)
6. bestPractices: melhores práticas (1-2 minutos)
7. conclusion: conclusão e próximos passos (30-60 segundos)

Para cada seção, inclua:
- duration: duração estimada em segundos
- narration: texto para narração
- visuals: descrição dos elementos visuais
- codeHighlights: partes do código para destacar
- animations: animações sugeridas

Responda APENAS com JSON válido.`;

    try {
      const response = await this.geminiIntegration.generateContent(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('[AdvancedVideoLessonGenerator] Erro no roteiro:', error);
      return this.getFallbackScript(code, contentType);
    }
  }

  /**
   * GERAÇÃO DE QUIZZES EDUCACIONAIS
   */
  async generateEducationalQuizzes(code, language, userLevel) {
    const prompt = `Crie quizzes educacionais para testar o conhecimento sobre este código:

CÓDIGO:
\`\`\`${language}
${code}
\`\`\`

NÍVEL: ${userLevel}

Crie um array JSON de quizzes, cada um com:
- id: identificador único
- type: tipo (multipleChoice, trueFalse, codeCompletion, debugging)
- difficulty: dificuldade (1-5)
- question: pergunta
- options: opções (para multiple choice)
- correctAnswer: resposta correta
- explanation: explicação detalhada
- learningObjective: objetivo de aprendizagem
- timeLimit: tempo limite em segundos

Inclua pelo menos 5 quizzes de diferentes tipos e dificuldades.

Responda APENAS com JSON válido.`;

    try {
      const response = await this.geminiIntegration.generateContent(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('[AdvancedVideoLessonGenerator] Erro nos quizzes:', error);
      return this.getFallbackQuizzes();
    }
  }

  /**
   * GERAÇÃO DE EXERCÍCIOS PRÁTICOS
   */
  async generatePracticalExercises(code, language, userLevel) {
    const prompt = `Crie exercícios práticos para aplicar os conceitos deste código:

CÓDIGO:
\`\`\`${language}
${code}
\`\`\`

NÍVEL: ${userLevel}

Crie um array JSON de exercícios, cada um com:
- id: identificador único
- title: título do exercício
- description: descrição detalhada
- difficulty: dificuldade (1-5)
- type: tipo (modification, extension, debugging, optimization)
- starterCode: código inicial (opcional)
- expectedOutput: saída esperada
- hints: dicas (array)
- solution: solução completa
- learningGoals: objetivos de aprendizagem
- estimatedTime: tempo estimado em minutos

Inclua pelo menos 3 exercícios de diferentes tipos.

Responda APENAS com JSON válido.`;

    try {
      const response = await this.geminiIntegration.generateContent(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('[AdvancedVideoLessonGenerator] Erro nos exercícios:', error);
      return this.getFallbackExercises();
    }
  }

  /**
   * GERAÇÃO DE RESUMO DA AULA
   */
  async generateLessonSummary(analysis, script) {
    const prompt = `Crie um resumo executivo desta videoaula:

ANÁLISE: ${JSON.stringify(analysis)}
ROTEIRO: ${JSON.stringify(script)}

Forneça um JSON com:
1. keyTakeaways: principais aprendizados (array)
2. nextSteps: próximos passos recomendados (array)
3. relatedTopics: tópicos relacionados (array)
4. practiceRecommendations: recomendações de prática (array)
5. additionalResources: recursos adicionais (array)

Responda APENAS com JSON válido.`;

    try {
      const response = await this.geminiIntegration.generateContent(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('[AdvancedVideoLessonGenerator] Erro no resumo:', error);
      return this.getFallbackSummary();
    }
  }

  /**
   * MESCLAR E PRIORIZAR FONTES
   */
  mergeAndPrioritizeSources(aiSources, engineSources) {
    const merged = {
      officialDocs: [...(aiSources.officialDocs || []), ...(engineSources.filter(s => s.type === 'official'))],
      tutorials: [...(aiSources.tutorials || []), ...(engineSources.filter(s => s.type === 'tutorial'))],
      stackOverflow: [...(aiSources.stackOverflow || []), ...(engineSources.filter(s => s.type === 'stackoverflow'))],
      github: [...(aiSources.github || []), ...(engineSources.filter(s => s.type === 'github'))],
      videos: [...(aiSources.videos || []), ...(engineSources.filter(s => s.type === 'video'))],
      books: aiSources.books || [],
      articles: [...(aiSources.articles || []), ...(engineSources.filter(s => s.type === 'article'))],
      tools: aiSources.tools || []
    };

    // Ordenar por relevância
    Object.keys(merged).forEach(category => {
      merged[category] = merged[category]
        .sort((a, b) => (b.relevanceScore || 5) - (a.relevanceScore || 5))
        .slice(0, 10); // Limitar a 10 por categoria
    });

    return merged;
  }

  /**
   * GERAR TÍTULO DA AULA
   */
  generateLessonTitle(mainConcept, contentType) {
    const typeMap = {
      tutorial: 'Tutorial',
      deepDive: 'Análise Profunda',
      quickTip: 'Dica Rápida'
    };
    
    return `${typeMap[contentType] || 'Aula'}: ${mainConcept}`;
  }

  // MÉTODOS DE FALLBACK
  getFallbackAnalysis(code, language) {
    return {
      mainConcept: 'Conceito principal do código',
      keyConcepts: ['programação', 'lógica'],
      complexityLevel: 5,
      learningObjectives: ['Entender o código', 'Aplicar conceitos'],
      prerequisites: ['Conhecimento básico de programação'],
      commonMistakes: ['Erros de sintaxe'],
      bestPractices: ['Código limpo'],
      realWorldApplications: ['Desenvolvimento de software'],
      codeExplanation: 'Explicação básica do código',
      performanceNotes: 'Considerações de performance',
      securityConsiderations: 'Aspectos de segurança',
      testingSuggestions: 'Sugestões de testes'
    };
  }

  getFallbackSources(language) {
    return {
      officialDocs: [
        { title: `Documentação oficial ${language}`, url: '#', description: 'Documentação oficial', relevanceScore: 10 }
      ],
      tutorials: [],
      stackOverflow: [],
      github: [],
      videos: [],
      books: [],
      articles: [],
      tools: []
    };
  }

  getFallbackScript(code, contentType) {
    return {
      introduction: { duration: 30, narration: 'Introdução à aula', visuals: 'Título e código' },
      conceptExplanation: { duration: 180, narration: 'Explicação dos conceitos', visuals: 'Diagramas' },
      codeWalkthrough: { duration: 300, narration: 'Análise do código', visuals: 'Código destacado' },
      examples: { duration: 120, narration: 'Exemplos práticos', visuals: 'Exemplos de código' },
      conclusion: { duration: 30, narration: 'Conclusão', visuals: 'Resumo' }
    };
  }

  getFallbackQuizzes() {
    return [
      {
        id: 'quiz-1',
        type: 'multipleChoice',
        difficulty: 3,
        question: 'Qual é o conceito principal deste código?',
        options: ['A', 'B', 'C', 'D'],
        correctAnswer: 'A',
        explanation: 'Explicação básica',
        learningObjective: 'Compreensão básica',
        timeLimit: 60
      }
    ];
  }

  getFallbackExercises() {
    return [
      {
        id: 'exercise-1',
        title: 'Exercício Prático',
        description: 'Modifique o código para...',
        difficulty: 3,
        type: 'modification',
        hints: ['Dica 1', 'Dica 2'],
        learningGoals: ['Aplicar conceitos'],
        estimatedTime: 15
      }
    ];
  }

  getFallbackSummary() {
    return {
      keyTakeaways: ['Conceito principal aprendido'],
      nextSteps: ['Próximos tópicos'],
      relatedTopics: ['Tópicos relacionados'],
      practiceRecommendations: ['Praticar mais'],
      additionalResources: ['Recursos adicionais']
    };
  }

  /**
   * OBTER STATUS DO SISTEMA
   */
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      hasGeminiIntegration: !!this.geminiIntegration,
      hasCitationEngine: !!this.citationEngine,
      availableContentTypes: Object.keys(this.contentTypes)
    };
  }
}

// Inicializar globalmente
if (typeof window !== 'undefined') {
  window.advancedVideoLessonGenerator = new AdvancedVideoLessonGenerator();
  console.log('🎬 Advanced Video Lesson Generator carregado!');
}




