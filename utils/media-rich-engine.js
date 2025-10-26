/**
 * DevMentor AI - Media-Rich Explanation Engine
 * Sistema completo de explicações imersivas com múltiplas mídias
 * 
 * Funcionalidades:
 * - Vídeos AI gerados
 * - Citações automáticas de fontes autoritativas
 * - Playground interativo de código
 * - Metáforas visuais memoráveis
 * - Diagramas Mermaid automáticos
 * - Quizzes interativos
 * - Exercícios práticos
 */

class MediaRichExplanationEngine {
  constructor() {
    this.videoGenerator = new AIVideoGenerator();
    this.citationEngine = new CitationEngine();
    this.playground = new InteractivePlayground();
    this.metaphorEngine = new VisualMetaphorEngine();
    this.diagramGenerator = new DiagramGenerator();
    this.quizGenerator = new QuizGenerator();
    
    // Configurações
    this.config = {
      maxVideoDuration: 60, // segundos
      maxCitations: 10,
      maxQuizzes: 5,
      maxExercises: 3,
      supportedLanguages: ['javascript', 'python', 'typescript', 'react', 'vue', 'nodejs']
    };
    
    console.log('[MediaRichEngine] Inicializado com todas as funcionalidades');
  }

  /**
   * GERAR EXPLICAÇÃO RICA COMPLETA
   * Orquestra todas as funcionalidades para criar experiência imersiva
   */
  async generateRichExplanation(code, analysisType, language, userLevel = 'intermediate') {
    console.log('[MediaRichEngine] Gerando explicação rica completa...');
    
    const startTime = performance.now();
    
    try {
      // 1. Obter explicação base da AI
      const baseExplanation = await this._getBaseExplanation(code, analysisType, language);
      
      // 2. Extrair conceitos-chave
      const concepts = this._extractKeyConcepts(code, baseExplanation, language);
      
      // 3. Gerar todos os componentes de mídia em paralelo
      const [
        video,
        citations,
        metaphors,
        diagrams,
        interactiveElements,
        quizzes,
        exercises,
        relatedExamples
      ] = await Promise.all([
        this._generateVideo(code, baseExplanation, concepts),
        this._findCitations(concepts, language),
        this._selectMetaphors(concepts),
        this._generateDiagrams(code, concepts),
        this._createInteractiveElements(code, language),
        this._generateQuizzes(concepts, userLevel),
        this._generateExercises(concepts, userLevel),
        this._findRelatedExamples(concepts, language)
      ]);
      
      // 4. Montar explicação rica
      const richExplanation = {
        // Conteúdo principal
        text: this._enhanceTextExplanation(baseExplanation, concepts),
        
        // Conteúdo de vídeo
        video: {
          introVideo: video.intro,
          conceptVideos: video.concepts,
          summaryVideo: video.summary,
          totalDuration: video.totalDuration
        },
        
        // Elementos interativos
        interactive: {
          playground: interactiveElements.playground,
          stepDebugger: interactiveElements.debugger,
          visualizer: interactiveElements.visualizer
        },
        
        // Auxiliares de aprendizado
        learning: {
          metaphors: metaphors,
          diagrams: diagrams,
          quizzes: quizzes,
          exercises: exercises
        },
        
        // Citações e recursos
        resources: {
          citations: citations,
          relatedExamples: relatedExamples,
          furtherReading: this._curateFurtherReading(concepts),
          communityLinks: this._findCommunityLinks(concepts, language)
        },
        
        // Metadados
        metadata: {
          language,
          concepts,
          difficulty: this._assessDifficulty(code, concepts),
          estimatedReadingTime: this._estimateReadingTime(baseExplanation),
          generationTime: performance.now() - startTime
        }
      };
      
      // 5. Renderizar experiência completa
      return this._renderRichExplanation(richExplanation);
      
    } catch (error) {
      console.error('[MediaRichEngine] Erro ao gerar explicação rica:', error);
      return this._renderFallbackExplanation(code, analysisType, language);
    }
  }

  /**
   * OBTER EXPLICAÇÃO BASE DA AI
   * Usa o sistema AI existente do DevMentor
   */
  async _getBaseExplanation(code, analysisType, language) {
    // Simula chamada para AI existente
    const explanations = {
      'complexity': `Este código implementa um padrão **${analysisType}** em **${language}**. Vamos analisar cada parte:

**Estrutura Principal:**
- A função principal utiliza conceitos avançados de programação
- Implementa padrões de design eficientes
- Otimizada para performance e legibilidade

**Conceitos-Chave:**
- **Async/Await**: Para operações assíncronas
- **Error Handling**: Tratamento robusto de erros
- **Data Processing**: Manipulação eficiente de dados

**Melhores Práticas:**
- Código limpo e bem documentado
- Separação de responsabilidades
- Testabilidade alta`,

      'optimization': `**Análise de Otimização:**

Este código pode ser otimizado em várias áreas:

**Performance:**
- Reduzir complexidade de tempo de O(n²) para O(n)
- Implementar cache para operações repetitivas
- Usar estruturas de dados mais eficientes

**Memória:**
- Evitar vazamentos de memória
- Implementar garbage collection adequado
- Otimizar uso de closures

**Legibilidade:**
- Simplificar lógica complexa
- Adicionar comentários explicativos
- Refatorar em funções menores`,

      'security': `**Análise de Segurança:**

**Vulnerabilidades Identificadas:**
- Possível injection attack
- Falta de validação de entrada
- Exposição de dados sensíveis

**Recomendações:**
- Implementar sanitização de dados
- Adicionar validação rigorosa
- Usar HTTPS para comunicação
- Implementar autenticação adequada`
    };

    return explanations[analysisType] || explanations['complexity'];
  }

  /**
   * EXTRAIR CONCEITOS-CHAVE
   * Identifica conceitos importantes no código
   */
  _extractKeyConcepts(code, explanation, language) {
    const concepts = [];
    
    // Padrões de conceitos por linguagem
    const conceptPatterns = {
      javascript: {
        'async/await': /\b(async|await)\b/i,
        'promises': /\b(Promise|\.then|\.catch)\b/i,
        'closures': /function.*function|=>\s*{/,
        'callbacks': /\(\s*\w+\s*\)\s*=>/,
        'arrow functions': /=>/,
        'destructuring': /{\s*\w+\s*}/,
        'spread operator': /\.\.\./,
        'template literals': /`.*\${/,
        'classes': /\bclass\s+\w+/,
        'modules': /\b(import|export)\b/
      },
      python: {
        'list comprehension': /\[\s*\w+\s+for\s+\w+\s+in/,
        'decorators': /@\w+/,
        'generators': /\byield\b/,
        'context managers': /\bwith\s+\w+/,
        'lambda functions': /\blambda\b/,
        'f-strings': /f["']/,
        'type hints': /:\s*\w+/,
        'dataclasses': /\b@dataclass\b/
      },
      react: {
        'hooks': /\b(useState|useEffect|useContext)\b/,
        'jsx': /<[A-Z]\w*>/,
        'props': /\bprops\b/,
        'state': /\bstate\b/,
        'lifecycle': /\b(componentDidMount|componentWillUnmount)\b/
      }
    };

    const patterns = conceptPatterns[language.toLowerCase()] || conceptPatterns.javascript;
    
    for (const [concept, pattern] of Object.entries(patterns)) {
      if (pattern.test(code)) {
        concepts.push({
          name: concept,
          confidence: 0.8,
          lines: this._findConceptLines(code, pattern),
          description: this._getConceptDescription(concept, language)
        });
      }
    }

    // Extrair conceitos da explicação (texto em negrito)
    const explainedConcepts = explanation.match(/\*\*([^*]+)\*\*/g);
    if (explainedConcepts) {
      explainedConcepts.forEach(match => {
        const concept = match.replace(/\*\*/g, '').trim();
        if (concept.length > 3 && !concepts.find(c => c.name === concept)) {
          concepts.push({
            name: concept,
            confidence: 0.6,
            lines: [],
            description: `Conceito importante: ${concept}`
          });
        }
      });
    }

    return concepts.slice(0, 5); // Top 5 conceitos
  }

  /**
   * GERAR VÍDEO EXPLICATIVO
   * Cria vídeo com narração AI e animações
   */
  async _generateVideo(code, explanation, concepts) {
    try {
      return await this.videoGenerator.generateExplanationVideo(code, explanation, {
        concepts,
        duration: this.config.maxVideoDuration,
        includeSubtitles: true,
        includeAnimations: true
      });
    } catch (error) {
      console.warn('[MediaRichEngine] Falha ao gerar vídeo:', error);
      return this._createFallbackVideo(code, concepts);
    }
  }

  /**
   * ENCONTRAR CITAÇÕES
   * Busca fontes autoritativas para os conceitos
   */
  async _findCitations(concepts, language) {
    try {
      const citations = await this.citationEngine.findCitations(concepts, language);
      return citations.slice(0, this.config.maxCitations);
    } catch (error) {
      console.warn('[MediaRichEngine] Falha ao buscar citações:', error);
      return this._createFallbackCitations(concepts, language);
    }
  }

  /**
   * SELECIONAR METÁFORAS VISUAIS
   * Escolhe analogias memoráveis para os conceitos
   */
  async _selectMetaphors(concepts) {
    const metaphors = [];
    
    for (const concept of concepts.slice(0, 3)) {
      const metaphor = this.metaphorEngine.getMetaphor(concept.name);
      if (metaphor) {
        metaphors.push(metaphor);
      }
    }
    
    return metaphors;
  }

  /**
   * GERAR DIAGRAMAS
   * Cria diagramas Mermaid para visualizar o código
   */
  async _generateDiagrams(code, concepts) {
    try {
      const diagrams = [];
      
      // Diagrama de fluxo
      const flowchart = await this.diagramGenerator.generateFlowchart(code, concepts);
      if (flowchart) diagrams.push(flowchart);
      
      // Diagrama de sequência (se aplicável)
      const sequence = await this.diagramGenerator.generateSequenceDiagram(code, concepts);
      if (sequence) diagrams.push(sequence);
      
      return diagrams;
    } catch (error) {
      console.warn('[MediaRichEngine] Falha ao gerar diagramas:', error);
      return [];
    }
  }

  /**
   * CRIAR ELEMENTOS INTERATIVOS
   * Playground e visualizador de código
   */
  async _createInteractiveElements(code, language) {
    return {
      playground: {
        code: code,
        language: language,
        suggestions: this._generateCodeSuggestions(code, language),
        testCases: this._generateTestCases(code, language)
      },
      debugger: {
        steps: this._createDebugSteps(code),
        breakpoints: this._suggestBreakpoints(code)
      },
      visualizer: {
        steps: this._createVisualizationSteps(code),
        variables: this._extractVariables(code)
      }
    };
  }

  /**
   * GERAR QUIZZES
   * Testes de compreensão interativos
   */
  async _generateQuizzes(concepts, userLevel) {
    try {
      return await this.quizGenerator.generateQuizzes(concepts, userLevel);
    } catch (error) {
      console.warn('[MediaRichEngine] Falha ao gerar quizzes:', error);
      return this._createFallbackQuizzes(concepts);
    }
  }

  /**
   * GERAR EXERCÍCIOS
   * Desafios práticos de codificação
   */
  async _generateExercises(concepts, userLevel) {
    const exercises = [];
    
    for (const concept of concepts.slice(0, this.config.maxExercises)) {
      exercises.push({
        id: `exercise-${concept.name}`,
        title: `Prática: ${concept.name}`,
        description: this._generateExerciseDescription(concept, userLevel),
        difficulty: this._mapUserLevelToDifficulty(userLevel, concept),
        starterCode: this._generateStarterCode(concept),
        hints: this._generateExerciseHints(concept, userLevel),
        solution: this._generateExerciseSolution(concept),
        testCases: this._generateTestCasesForExercise(concept)
      });
    }
    
    return exercises;
  }

  /**
   * ENCONTRAR EXEMPLOS RELACIONADOS
   * Código real de produção relacionado
   */
  async _findRelatedExamples(concepts, language) {
    // Simula busca por exemplos reais
    return concepts.slice(0, 3).map(concept => ({
      title: `Exemplo Real: ${concept.name}`,
      description: `Implementação de ${concept.name} em projeto de produção`,
      url: `https://github.com/examples/${concept.name}`,
      source: 'GitHub',
      rating: 4.5,
      preview: '/assets/examples/preview.jpg'
    }));
  }

  /**
   * RENDERIZAR EXPLICAÇÃO RICA
   * HTML completo com todas as funcionalidades
   */
  _renderRichExplanation(explanation) {
    return `
      <div class="devmentor-rich-explanation">
        <!-- Hero Section com Vídeo -->
        <section class="explanation-hero">
          <div class="hero-content">
            <h2 class="hero-title">
              ${this._getAnalysisTitle(explanation.metadata)}
            </h2>
            <div class="hero-meta">
              <span class="difficulty ${explanation.metadata.difficulty}">
                ${explanation.metadata.difficulty}
              </span>
              <span class="reading-time">
                ⏱️ ${explanation.metadata.estimatedReadingTime} min
              </span>
              <span class="concepts-count">
                🧠 ${explanation.metadata.concepts.length} conceitos
              </span>
            </div>
          </div>
          
          ${explanation.video.introVideo ? `
            <div class="hero-video">
              <video 
                src="${explanation.video.introVideo.url}" 
                poster="${explanation.video.introVideo.thumbnail}"
                controls
                class="intro-video"
              >
                <track kind="captions" src="${explanation.video.introVideo.subtitles}" />
              </video>
              <div class="video-overlay">
                <button class="play-button">▶</button>
                <div class="video-duration">${this._formatDuration(explanation.video.introVideo.duration)}</div>
              </div>
            </div>
          ` : ''}
        </section>

        <!-- Navegação Rápida -->
        <nav class="explanation-nav">
          <div class="nav-tabs">
            <button class="nav-tab active" data-section="explanation">
              📖 Explicação
            </button>
            <button class="nav-tab" data-section="playground">
              🎮 Teste
            </button>
            <button class="nav-tab" data-section="visualize">
              🎨 Visualizar
            </button>
            <button class="nav-tab" data-section="learn">
              🎓 Aprender Mais
            </button>
            <button class="nav-tab" data-section="quiz">
              ✅ Teste-se
            </button>
          </div>
        </nav>

        <!-- Seções de Conteúdo -->
        <div class="explanation-sections">
          
          <!-- Seção 1: Explicação de Texto -->
          <section class="section-panel active" id="section-explanation">
            <div class="section-content">
              ${this._renderTextExplanation(explanation.text, explanation.metadata.concepts)}
              
              <!-- Metáforas Visuais Inline -->
              ${explanation.learning.metaphors.map(metaphor => 
                this.metaphorEngine.renderMetaphor(metaphor)
              ).join('')}
              
              <!-- Diagramas Inline -->
              ${explanation.learning.diagrams.map(diagram => 
                this._renderDiagram(diagram)
              ).join('')}
              
              <!-- Vídeos de Conceitos (inline) -->
              ${explanation.video.conceptVideos.map(video => `
                <div class="concept-video-inline">
                  <h4 class="concept-title">${video.concept}</h4>
                  <video src="${video.url}" controls poster="${video.thumbnail}">
                    <track kind="captions" src="${video.subtitles}" />
                  </video>
                </div>
              `).join('')}
            </div>
          </section>

          <!-- Seção 2: Playground Interativo -->
          <section class="section-panel" id="section-playground">
            ${this.playground.createPlayground(
              explanation.interactive.playground.code,
              explanation.metadata.language,
              { showVisualizer: true }
            )}
            
            <div class="playground-tips">
              <h4>💡 Tente Estas Modificações:</h4>
              <ul class="modification-suggestions">
                ${explanation.interactive.playground.suggestions.map(suggestion => `
                  <li class="suggestion">
                    <button class="apply-suggestion" data-code="${suggestion.code}">
                      Aplicar
                    </button>
                    <span class="suggestion-text">${suggestion.description}</span>
                  </li>
                `).join('')}
              </ul>
            </div>
          </section>

          <!-- Seção 3: Visualização -->
          <section class="section-panel" id="section-visualize">
            <div class="visualizer-container">
              ${this._renderStepByStepVisualizer(explanation.interactive.visualizer)}
            </div>
            
            <div class="visualizer-controls">
              <button class="viz-btn" data-action="prev">⏮ Anterior</button>
              <button class="viz-btn" data-action="play">▶ Play</button>
              <button class="viz-btn" data-action="next">Próximo ⏭</button>
              <input 
                type="range" 
                class="viz-slider" 
                min="0" 
                max="${explanation.interactive.visualizer.steps.length - 1}" 
                value="0"
              />
              <span class="step-indicator">
                Passo <span id="currentStep">1</span> de ${explanation.interactive.visualizer.steps.length}
              </span>
            </div>
            
            <div class="step-explanation">
              <h4 id="stepTitle">Passo 1: Inicialização</h4>
              <p id="stepDescription">Iniciando a execução...</p>
              <div class="variable-state" id="variableState">
                <!-- Atualizado dinamicamente -->
              </div>
            </div>
          </section>

          <!-- Seção 4: Aprender Mais (Citações e Recursos) -->
          <section class="section-panel" id="section-learn">
            ${this.citationEngine.generateCitationBlock(explanation.resources.citations)}
            
            <!-- Exemplos Relacionados -->
            <div class="related-examples">
              <h3 class="section-title">
                <span class="icon">💼</span>
                Exemplos do Mundo Real
              </h3>
              <div class="examples-grid">
                ${explanation.resources.relatedExamples.map(example => `
                  <div class="example-card">
                    <div class="example-preview">
                      <img src="${example.preview}" alt="${example.title}" />
                      <div class="example-overlay">
                        <button class="view-example">Ver Código</button>
                      </div>
                    </div>
                    <div class="example-info">
                      <h4 class="example-title">${example.title}</h4>
                      <p class="example-description">${example.description}</p>
                      <div class="example-meta">
                        <span class="example-source">${example.source}</span>
                        <span class="example-rating">⭐ ${example.rating}</span>
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Leitura Adicional -->
            <div class="further-reading">
              <h3 class="section-title">
                <span class="icon">📚</span>
                Mergulhe Mais Fundo
              </h3>
              <div class="reading-list">
                ${explanation.resources.furtherReading.map(resource => `
                  <a href="${resource.url}" class="reading-item" target="_blank">
                    <div class="reading-icon">${resource.icon}</div>
                    <div class="reading-content">
                      <h4 class="reading-title">${resource.title}</h4>
                      <p class="reading-description">${resource.description}</p>
                      <span class="reading-type">${resource.type}</span>
                    </div>
                  </a>
                `).join('')}
              </div>
            </div>

            <!-- Links da Comunidade -->
            <div class="community-section">
              <h3 class="section-title">
                <span class="icon">👥</span>
                Junte-se à Comunidade
              </h3>
              <div class="community-links">
                ${explanation.resources.communityLinks.map(link => `
                  <a href="${link.url}" class="community-link" target="_blank">
                    <span class="community-icon">${link.icon}</span>
                    <span class="community-name">${link.name}</span>
                    <span class="community-members">${link.members} membros</span>
                  </a>
                `).join('')}
              </div>
            </div>
          </section>

          <!-- Seção 5: Quiz e Exercícios -->
          <section class="section-panel" id="section-quiz">
            <div class="quiz-container">
              <h3 class="quiz-title">
                <span class="icon">✅</span>
                Teste Seu Entendimento
              </h3>
              
              ${explanation.learning.quizzes.map((quiz, index) => `
                <div class="quiz-question" data-question="${index}">
                  <div class="question-header">
                    <span class="question-number">Pergunta ${index + 1}</span>
                    <span class="question-difficulty ${quiz.difficulty}">
                      ${quiz.difficulty}
                    </span>
                  </div>
                  <div class="question-text">${quiz.question}</div>
                  <div class="question-options">
                    ${quiz.options.map((option, optIndex) => `
                      <label class="option">
                        <input 
                          type="radio" 
                          name="quiz-${index}" 
                          value="${optIndex}"
                        />
                        <span class="option-text">${option}</span>
                      </label>
                    `).join('')}
                  </div>
                  <button class="check-answer" data-correct="${quiz.correctIndex}">
                    Verificar Resposta
                  </button>
                  <div class="answer-feedback" style="display: none;">
                    <div class="feedback-content"></div>
                    <div class="feedback-explanation">${quiz.explanation}</div>
                  </div>
                </div>
              `).join('')}
            </div>

            <!-- Exercícios Práticos -->
            <div class="exercises-container">
              <h3 class="exercises-title">
                <span class="icon">💪</span>
                Exercícios Práticos
              </h3>
              
              ${explanation.learning.exercises.map((exercise, index) => `
                <div class="exercise-card">
                  <div class="exercise-header">
                    <h4 class="exercise-title">${exercise.title}</h4>
                    <span class="exercise-difficulty ${exercise.difficulty}">
                      ${exercise.difficulty}
                    </span>
                  </div>
                  <div class="exercise-description">${exercise.description}</div>
                  <div class="exercise-starter">
                    <h5>Código Inicial:</h5>
                    <pre><code>${exercise.starterCode}</code></pre>
                  </div>
                  <div class="exercise-hints">
                    <button class="show-hints">💡 Mostrar Dicas</button>
                    <div class="hints-content" style="display: none;">
                      ${exercise.hints.map((hint, hintIndex) => `
                        <div class="hint">
                          <strong>Dica ${hintIndex + 1}:</strong> ${hint}
                        </div>
                      `).join('')}
                    </div>
                  </div>
                  <button class="start-exercise" data-exercise="${index}">
                    Iniciar Exercício
                  </button>
                </div>
              `).join('')}
            </div>
          </section>
        </div>

        <!-- Barra de Ações Flutuante -->
        <div class="floating-actions">
          <button class="fab-action" data-action="bookmark" title="Favoritar">
            <span class="icon">🔖</span>
          </button>
          <button class="fab-action" data-action="share" title="Compartilhar">
            <span class="icon">🔗</span>
          </button>
          <button class="fab-action" data-action="print" title="Imprimir">
            <span class="icon">🖨️</span>
          </button>
          <button class="fab-action" data-action="download" title="Baixar PDF">
            <span class="icon">📥</span>
          </button>
        </div>

        <!-- Rastreador de Progresso -->
        <div class="progress-tracker">
          <div class="progress-bar">
            <div class="progress-fill" style="width: 0%"></div>
          </div>
          <div class="progress-label">0% concluído</div>
        </div>
      </div>
    `;
  }

  // Métodos auxiliares
  _getAnalysisTitle(metadata) {
    const titles = {
      complexity: 'Análise de Complexidade',
      optimization: 'Otimização de Código',
      security: 'Análise de Segurança',
      performance: 'Análise de Performance',
      best_practices: 'Melhores Práticas'
    };
    return titles[metadata.analysisType] || 'Análise de Código';
  }

  _formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}s`;
  }

  _estimateReadingTime(text) {
    const wordsPerMinute = 200;
    const wordCount = text.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  }

  _assessDifficulty(code, concepts) {
    const complexityScore = concepts.length * 0.2;
    const codeLengthScore = Math.min(code.length / 1000, 1) * 0.3;
    const patternScore = this._analyzePatternComplexity(code) * 0.5;
    
    const totalScore = complexityScore + codeLengthScore + patternScore;
    
    if (totalScore < 0.3) return 'beginner';
    if (totalScore < 0.6) return 'intermediate';
    return 'advanced';
  }

  _analyzePatternComplexity(code) {
    const complexPatterns = [
      /async\s+function/,
      /class\s+\w+/,
      /\b(?:map|filter|reduce)\s*\(/,
      /\.then\s*\(/,
      /try\s*{[\s\S]*?catch/,
      /function\s*\([^)]*\)\s*{[\s\S]*?function/
    ];
    
    const matches = complexPatterns.filter(pattern => pattern.test(code));
    return matches.length / complexPatterns.length;
  }

  _mapUserLevelToDifficulty(userLevel, concept) {
    const mapping = {
      beginner: 'easy',
      intermediate: 'medium',
      advanced: 'hard'
    };
    return mapping[userLevel] || 'medium';
  }

  // Métodos de fallback para quando APIs externas falham
  _createFallbackVideo(code, concepts) {
    return {
      intro: {
        url: '/assets/videos/fallback-intro.mp4',
        thumbnail: '/assets/videos/fallback-thumb.jpg',
        duration: 30,
        subtitles: '/assets/videos/fallback-subtitles.vtt'
      },
      concepts: [],
      summary: null,
      totalDuration: 30
    };
  }

  _createFallbackCitations(concepts, language) {
    return {
      official: [{
        type: 'official_documentation',
        source: 'MDN',
        title: `${language} Documentation`,
        url: `https://developer.mozilla.org/en-US/docs/Web/${language.toUpperCase()}`,
        description: 'Documentação oficial',
        authority: 1.0
      }],
      community: [],
      tutorials: [],
      examples: [],
      academic: []
    };
  }

  _createFallbackQuizzes(concepts) {
    return concepts.slice(0, 3).map((concept, index) => ({
      concept: concept.name,
      difficulty: 'medium',
      question: `O que é ${concept.name}?`,
      options: [
        'Um conceito de programação',
        'Uma função JavaScript',
        'Um padrão de design',
        'Uma estrutura de dados'
      ],
      correctIndex: 0,
      explanation: `${concept.name} é um conceito importante em programação.`
    }));
  }

  _renderFallbackExplanation(code, analysisType, language) {
    return `
      <div class="devmentor-fallback-explanation">
        <h2>Análise de Código</h2>
        <div class="fallback-content">
          <pre><code>${code}</code></pre>
          <p>Análise: ${analysisType}</p>
          <p>Linguagem: ${language}</p>
        </div>
      </div>
    `;
  }
}

// Exportar para uso global
window.MediaRichExplanationEngine = MediaRichExplanationEngine;


























