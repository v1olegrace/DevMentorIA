/**
 * DevMentor AI - Quiz Generator
 * Sistema completo de quizzes interativos para testar compreensão
 * 
 * Funcionalidades:
 * - Geração automática de perguntas baseadas no código
 * - Múltiplos tipos de questão (múltipla escolha, código, verdadeiro/falso)
 * - Dificuldade adaptativa baseada no nível do usuário
 * - Feedback imediato e explicações detalhadas
 * - Sistema de pontuação e progresso
 * - Integração com Google Gemini Pro
 */

class QuizGenerator {
  constructor() {
    this.geminiAPI = new GeminiAPI();
    this.questionTypes = {
      multipleChoice: this._generateMultipleChoice.bind(this),
      codeCompletion: this._generateCodeCompletion.bind(this),
      trueFalse: this._generateTrueFalse.bind(this),
      codeAnalysis: this._generateCodeAnalysis.bind(this),
      debugging: this._generateDebugging.bind(this),
      performance: this._generatePerformance.bind(this)
    };
    
    // Templates de perguntas por conceito
    this.questionTemplates = this._initializeQuestionTemplates();
    
    console.log('[QuizGenerator] Inicializado com suporte a Gemini Pro');
  }

  /**
   * GERAR QUIZZES PARA CONCEITOS
   * Cria conjunto completo de perguntas
   */
  async generateQuizzes(concepts, userLevel = 'intermediate') {
    console.log(`[QuizGenerator] Gerando quizzes para ${concepts.length} conceitos...`);
    
    const quizzes = [];
    
    for (const concept of concepts) {
      try {
        // Gerar perguntas usando Gemini Pro
        const conceptQuizzes = await this._generateConceptQuizzes(concept, userLevel);
        quizzes.push(...conceptQuizzes);
        
      } catch (error) {
        console.warn(`[QuizGenerator] Erro ao gerar quiz para ${concept.name}:`, error);
        
        // Fallback para templates
        const fallbackQuiz = this._generateFallbackQuiz(concept, userLevel);
        quizzes.push(fallbackQuiz);
      }
    }
    
    // Limitar número de perguntas
    return quizzes.slice(0, 10);
  }

  /**
   * GERAR QUIZZES PARA CONCEITO ESPECÍFICO COM GEMINI
   */
  async _generateConceptQuizzes(concept, userLevel) {
    const prompt = `
    Você é um especialista em criar perguntas de quiz para programação.
    
    Conceito: ${concept.name}
    Descrição: ${concept.description}
    Nível do usuário: ${userLevel}
    Confiança: ${concept.confidence}
    
    Crie 3 perguntas de quiz variadas que testem o entendimento deste conceito:
    
    1. Uma pergunta de múltipla escolha (4 opções)
    2. Uma pergunta de código (completar código ou encontrar erro)
    3. Uma pergunta de análise (verdadeiro/falso com explicação)
    
    Para cada pergunta, forneça:
    - Texto da pergunta
    - Opções de resposta (se aplicável)
    - Resposta correta
    - Explicação detalhada
    - Dificuldade (easy, medium, hard)
    - Conceitos relacionados
    
    Responda em formato JSON estruturado.
    `;
    
    try {
      const response = await this.geminiAPI.generateContent(prompt);
      const quizData = JSON.parse(response);
      
      return this._processQuizData(quizData, concept);
      
    } catch (error) {
      console.warn('[QuizGenerator] Gemini Pro não disponível, usando templates');
      return this._generateTemplateQuizzes(concept, userLevel);
    }
  }

  /**
   * PROCESSAR DADOS DO QUIZ DO GEMINI
   */
  _processQuizData(quizData, concept) {
    const quizzes = [];
    
    quizData.questions.forEach((questionData, index) => {
      const quiz = {
        id: `quiz_${concept.name}_${index}`,
        concept: concept.name,
        type: questionData.type,
        difficulty: questionData.difficulty,
        question: questionData.question,
        options: questionData.options || [],
        correctAnswer: questionData.correctAnswer,
        explanation: questionData.explanation,
        relatedConcepts: questionData.relatedConcepts || [],
        points: this._calculatePoints(questionData.difficulty),
        timeLimit: this._calculateTimeLimit(questionData.difficulty),
        hints: questionData.hints || [],
        metadata: {
          generatedAt: new Date().toISOString(),
          source: 'gemini',
          conceptConfidence: concept.confidence
        }
      };
      
      quizzes.push(quiz);
    });
    
    return quizzes;
  }

  /**
   * GERAR QUIZ DE MÚLTIPLA ESCOLHA
   */
  _generateMultipleChoice(concept, userLevel) {
    const templates = this.questionTemplates[concept.name]?.multipleChoice || 
                     this.questionTemplates.general.multipleChoice;
    
    const template = templates[Math.floor(Math.random() * templates.length)];
    
    return {
      id: `mc_${concept.name}_${Date.now()}`,
      concept: concept.name,
      type: 'multipleChoice',
      difficulty: this._mapUserLevelToDifficulty(userLevel),
      question: template.question.replace('{concept}', concept.name),
      options: template.options,
      correctAnswer: template.correctAnswer,
      explanation: template.explanation.replace('{concept}', concept.name),
      points: this._calculatePoints(this._mapUserLevelToDifficulty(userLevel)),
      timeLimit: 30,
      hints: template.hints || []
    };
  }

  /**
   * GERAR QUIZ DE COMPLETAR CÓDIGO
   */
  _generateCodeCompletion(concept, userLevel) {
    const templates = this.questionTemplates[concept.name]?.codeCompletion || 
                     this.questionTemplates.general.codeCompletion;
    
    const template = templates[Math.floor(Math.random() * templates.length)];
    
    return {
      id: `cc_${concept.name}_${Date.now()}`,
      concept: concept.name,
      type: 'codeCompletion',
      difficulty: this._mapUserLevelToDifficulty(userLevel),
      question: template.question.replace('{concept}', concept.name),
      code: template.code,
      correctAnswer: template.correctAnswer,
      explanation: template.explanation.replace('{concept}', concept.name),
      points: this._calculatePoints(this._mapUserLevelToDifficulty(userLevel)),
      timeLimit: 60,
      hints: template.hints || []
    };
  }

  /**
   * GERAR QUIZ VERDADEIRO/FALSO
   */
  _generateTrueFalse(concept, userLevel) {
    const templates = this.questionTemplates[concept.name]?.trueFalse || 
                     this.questionTemplates.general.trueFalse;
    
    const template = templates[Math.floor(Math.random() * templates.length)];
    
    return {
      id: `tf_${concept.name}_${Date.now()}`,
      concept: concept.name,
      type: 'trueFalse',
      difficulty: this._mapUserLevelToDifficulty(userLevel),
      question: template.question.replace('{concept}', concept.name),
      options: ['Verdadeiro', 'Falso'],
      correctAnswer: template.correctAnswer,
      explanation: template.explanation.replace('{concept}', concept.name),
      points: this._calculatePoints(this._mapUserLevelToDifficulty(userLevel)),
      timeLimit: 20,
      hints: template.hints || []
    };
  }

  /**
   * GERAR QUIZ DE ANÁLISE DE CÓDIGO
   */
  _generateCodeAnalysis(concept, userLevel) {
    return {
      id: `ca_${concept.name}_${Date.now()}`,
      concept: concept.name,
      type: 'codeAnalysis',
      difficulty: this._mapUserLevelToDifficulty(userLevel),
      question: `Analise o seguinte código e identifique o problema principal:`,
      code: this._generateCodeExample(concept),
      correctAnswer: this._getCodeAnalysisAnswer(concept),
      explanation: this._getCodeAnalysisExplanation(concept),
      points: this._calculatePoints(this._mapUserLevelToDifficulty(userLevel)),
      timeLimit: 90,
      hints: this._getCodeAnalysisHints(concept)
    };
  }

  /**
   * GERAR QUIZ DE DEBUGGING
   */
  _generateDebugging(concept, userLevel) {
    return {
      id: `db_${concept.name}_${Date.now()}`,
      concept: concept.name,
      type: 'debugging',
      difficulty: this._mapUserLevelToDifficulty(userLevel),
      question: `Encontre e corrija o erro no código abaixo:`,
      code: this._generateBuggyCode(concept),
      correctAnswer: this._getCorrectedCode(concept),
      explanation: this._getDebuggingExplanation(concept),
      points: this._calculatePoints(this._mapUserLevelToDifficulty(userLevel)),
      timeLimit: 120,
      hints: this._getDebuggingHints(concept)
    };
  }

  /**
   * GERAR QUIZ DE PERFORMANCE
   */
  _generatePerformance(concept, userLevel) {
    return {
      id: `perf_${concept.name}_${Date.now()}`,
      concept: concept.name,
      type: 'performance',
      difficulty: this._mapUserLevelToDifficulty(userLevel),
      question: `Qual é a complexidade de tempo deste código?`,
      code: this._generatePerformanceCode(concept),
      options: ['O(1)', 'O(n)', 'O(n²)', 'O(log n)'],
      correctAnswer: this._getPerformanceAnswer(concept),
      explanation: this._getPerformanceExplanation(concept),
      points: this._calculatePoints(this._mapUserLevelToDifficulty(userLevel)),
      timeLimit: 45,
      hints: this._getPerformanceHints(concept)
    };
  }

  /**
   * INICIALIZAR TEMPLATES DE PERGUNTAS
   */
  _initializeQuestionTemplates() {
    return {
      // Templates gerais
      general: {
        multipleChoice: [
          {
            question: 'O que é {concept} em programação?',
            options: [
              'Uma estrutura de dados',
              'Um padrão de design',
              'Um conceito fundamental',
              'Uma biblioteca externa'
            ],
            correctAnswer: 2,
            explanation: '{concept} é um conceito fundamental em programação que...',
            hints: ['Pense nos conceitos básicos', 'Considere a definição fundamental']
          }
        ],
        
        codeCompletion: [
          {
            question: 'Complete o código para implementar {concept}:',
            code: '// Implemente {concept} aqui\n',
            correctAnswer: '// Implementação específica',
            explanation: 'A implementação correta de {concept} deve...',
            hints: ['Revise a sintaxe', 'Considere os casos extremos']
          }
        ],
        
        trueFalse: [
          {
            question: '{concept} é sempre necessário em JavaScript.',
            correctAnswer: false,
            explanation: '{concept} não é sempre necessário, depende do contexto...',
            hints: ['Considere diferentes cenários', 'Pense em casos onde não é necessário']
          }
        ]
      },
      
      // Templates específicos por conceito
      'async/await': {
        multipleChoice: [
          {
            question: 'Qual é a principal vantagem do async/await?',
            options: [
              'Melhor performance',
              'Código mais legível',
              'Menor uso de memória',
              'Compatibilidade com navegadores antigos'
            ],
            correctAnswer: 1,
            explanation: 'async/await torna o código assíncrono mais legível e fácil de entender...',
            hints: ['Pense na legibilidade', 'Compare com Promises']
          }
        ],
        
        codeCompletion: [
          {
            question: 'Complete a função assíncrona:',
            code: 'async function fetchData() {\n  const response = await fetch(url);\n  // Complete aqui\n}',
            correctAnswer: 'return await response.json();',
            explanation: 'A função assíncrona deve retornar os dados processados...',
            hints: ['Use await para processar a resposta', 'Retorne os dados']
          }
        ]
      },
      
      'promises': {
        multipleChoice: [
          {
            question: 'O que acontece quando uma Promise é rejeitada?',
            options: [
              'O programa para',
              'Executa o callback .catch()',
              'Retorna undefined',
              'Tenta novamente automaticamente'
            ],
            correctAnswer: 1,
            explanation: 'Quando uma Promise é rejeitada, o callback .catch() é executado...',
            hints: ['Pense no tratamento de erros', 'Considere o fluxo de execução']
          }
        ]
      },
      
      'recursion': {
        multipleChoice: [
          {
            question: 'Qual é a condição essencial para evitar recursão infinita?',
            options: [
              'Usar return',
              'Ter um caso base',
              'Usar loops',
              'Limitar a profundidade'
            ],
            correctAnswer: 1,
            explanation: 'O caso base é essencial para parar a recursão...',
            hints: ['Pense em quando parar', 'Considere o ponto de parada']
          }
        ],
        
        codeCompletion: [
          {
            question: 'Complete a função recursiva para calcular fatorial:',
            code: 'function factorial(n) {\n  if (n <= 1) return 1;\n  // Complete aqui\n}',
            correctAnswer: 'return n * factorial(n - 1);',
            explanation: 'A recursão deve chamar a função com n-1 e multiplicar pelo valor atual...',
            hints: ['Use a definição matemática', 'Chame a função com n-1']
          }
        ]
      }
    };
  }

  /**
   * GERAR QUIZ DE FALLBACK
   */
  _generateFallbackQuiz(concept, userLevel) {
    return {
      id: `fallback_${concept.name}_${Date.now()}`,
      concept: concept.name,
      type: 'multipleChoice',
      difficulty: this._mapUserLevelToDifficulty(userLevel),
      question: `O que você sabe sobre ${concept.name}?`,
      options: [
        'É um conceito importante',
        'É usado em programação',
        'Tem aplicações práticas',
        'Todas as anteriores'
      ],
      correctAnswer: 3,
      explanation: `${concept.name} é um conceito fundamental com várias aplicações...`,
      points: 10,
      timeLimit: 30,
      hints: ['Considere todas as opções', 'Pense nas aplicações'],
      metadata: {
        generatedAt: new Date().toISOString(),
        source: 'fallback',
        conceptConfidence: concept.confidence
      }
    };
  }

  /**
   * GERAR QUIZZES COM TEMPLATES
   */
  _generateTemplateQuizzes(concept, userLevel) {
    const quizzes = [];
    
    // Gerar um quiz de cada tipo usando templates
    const types = ['multipleChoice', 'codeCompletion', 'trueFalse'];
    
    types.forEach(type => {
      const generator = this.questionTypes[type];
      if (generator) {
        const quiz = generator(concept, userLevel);
        quizzes.push(quiz);
      }
    });
    
    return quizzes;
  }

  // Métodos auxiliares para geração de conteúdo
  _generateCodeExample(concept) {
    const examples = {
      'async/await': `
async function fetchUserData(id) {
  const response = await fetch(\`/api/users/\${id}\`);
  return response.json();
}`,
      'promises': `
fetch('/api/data')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error(error));`,
      'recursion': `
function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}`
    };
    
    return examples[concept.name] || '// Código de exemplo';
  }

  _getCodeAnalysisAnswer(concept) {
    const answers = {
      'async/await': 'Falta tratamento de erro',
      'promises': 'Callback hell',
      'recursion': 'Falta caso base'
    };
    
    return answers[concept.name] || 'Problema de lógica';
  }

  _getCodeAnalysisExplanation(concept) {
    return `O código tem um problema relacionado a ${concept.name}. A solução correta seria...`;
  }

  _getCodeAnalysisHints(concept) {
    return [
      'Analise cada linha cuidadosamente',
      'Considere casos extremos',
      'Verifique a lógica de controle'
    ];
  }

  _generateBuggyCode(concept) {
    const buggyExamples = {
      'async/await': `
async function fetchData() {
  const response = fetch('/api/data');
  return response.json();
}`,
      'recursion': `
function factorial(n) {
  return n * factorial(n - 1);
}`
    };
    
    return buggyExamples[concept.name] || '// Código com bug';
  }

  _getCorrectedCode(concept) {
    const corrections = {
      'async/await': `
async function fetchData() {
  const response = await fetch('/api/data');
  return response.json();
}`,
      'recursion': `
function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}`
    };
    
    return corrections[concept.name] || '// Código corrigido';
  }

  _getDebuggingExplanation(concept) {
    return `O erro estava relacionado a ${concept.name}. A correção envolve...`;
  }

  _getDebuggingHints(concept) {
    return [
      'Procure por palavras-chave relacionadas',
      'Verifique a sintaxe',
      'Considere o fluxo de execução'
    ];
  }

  _generatePerformanceCode(concept) {
    const performanceExamples = {
      'recursion': `
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n-1) + fibonacci(n-2);
}`,
      'loops': `
for (let i = 0; i < n; i++) {
  for (let j = 0; j < n; j++) {
    console.log(i, j);
  }
}`
    };
    
    return performanceExamples[concept.name] || '// Código para análise';
  }

  _getPerformanceAnswer(concept) {
    const answers = {
      'recursion': 'O(2^n)',
      'loops': 'O(n²)'
    };
    
    return answers[concept.name] || 'O(n)';
  }

  _getPerformanceExplanation(concept) {
    return `A complexidade deste código é determinada por ${concept.name}...`;
  }

  _getPerformanceHints(concept) {
    return [
      'Conte o número de operações',
      'Considere loops aninhados',
      'Analise a estrutura de controle'
    ];
  }

  // Métodos auxiliares gerais
  _mapUserLevelToDifficulty(userLevel) {
    const mapping = {
      beginner: 'easy',
      intermediate: 'medium',
      advanced: 'hard'
    };
    return mapping[userLevel] || 'medium';
  }

  _calculatePoints(difficulty) {
    const points = {
      easy: 10,
      medium: 20,
      hard: 30
    };
    return points[difficulty] || 20;
  }

  _calculateTimeLimit(difficulty) {
    const limits = {
      easy: 30,
      medium: 60,
      hard: 90
    };
    return limits[difficulty] || 60;
  }

  /**
   * RENDERIZAR QUIZ
   * Cria HTML para exibir quiz
   */
  renderQuiz(quiz) {
    return `
      <div class="quiz-container" data-quiz-id="${quiz.id}">
        <div class="quiz-header">
          <div class="quiz-meta">
            <span class="quiz-concept">${quiz.concept}</span>
            <span class="quiz-difficulty ${quiz.difficulty}">${quiz.difficulty}</span>
            <span class="quiz-points">${quiz.points} pts</span>
            <span class="quiz-time">${quiz.timeLimit}s</span>
          </div>
          <div class="quiz-timer" id="timer-${quiz.id}">
            <span class="time-remaining">${quiz.timeLimit}</span>
          </div>
        </div>
        
        <div class="quiz-question">
          <h3>${quiz.question}</h3>
          
          ${quiz.code ? `
            <div class="quiz-code">
              <pre><code>${quiz.code}</code></pre>
            </div>
          ` : ''}
        </div>
        
        <div class="quiz-options">
          ${this._renderQuizOptions(quiz)}
        </div>
        
        <div class="quiz-actions">
          <button class="submit-quiz" data-quiz-id="${quiz.id}">
            Enviar Resposta
          </button>
          <button class="show-hints" data-quiz-id="${quiz.id}">
            💡 Dicas
          </button>
        </div>
        
        <div class="quiz-feedback" id="feedback-${quiz.id}" style="display: none;">
          <div class="feedback-content"></div>
          <div class="feedback-explanation"></div>
        </div>
        
        <div class="quiz-hints" id="hints-${quiz.id}" style="display: none;">
          ${quiz.hints.map((hint, index) => `
            <div class="hint-item">
              <span class="hint-number">${index + 1}</span>
              <span class="hint-text">${hint}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  _renderQuizOptions(quiz) {
    switch (quiz.type) {
      case 'multipleChoice':
      case 'trueFalse':
        return quiz.options.map((option, index) => `
          <label class="quiz-option">
            <input type="radio" name="quiz-${quiz.id}" value="${index}">
            <span class="option-text">${option}</span>
          </label>
        `).join('');
        
      case 'codeCompletion':
        return `
          <div class="code-input">
            <textarea 
              name="quiz-${quiz.id}" 
              placeholder="Digite sua resposta aqui..."
              rows="5"
            ></textarea>
          </div>
        `;
        
      case 'codeAnalysis':
        return `
          <div class="analysis-input">
            <textarea 
              name="quiz-${quiz.id}" 
              placeholder="Descreva o problema encontrado..."
              rows="3"
            ></textarea>
          </div>
        `;
        
      case 'debugging':
        return `
          <div class="debugging-input">
            <textarea 
              name="quiz-${quiz.id}" 
              placeholder="Digite o código corrigido..."
              rows="8"
            ></textarea>
          </div>
        `;
        
      case 'performance':
        return quiz.options.map((option, index) => `
          <label class="quiz-option">
            <input type="radio" name="quiz-${quiz.id}" value="${index}">
            <span class="option-text">${option}</span>
          </label>
        `).join('');
        
      default:
        return '<p>Tipo de quiz não suportado</p>';
    }
  }

  /**
   * VERIFICAR RESPOSTA
   */
  checkAnswer(quiz, userAnswer) {
    const isCorrect = this._compareAnswers(quiz, userAnswer);
    
    return {
      isCorrect,
      score: isCorrect ? quiz.points : 0,
      feedback: this._generateFeedback(quiz, userAnswer, isCorrect),
      explanation: quiz.explanation
    };
  }

  _compareAnswers(quiz, userAnswer) {
    switch (quiz.type) {
      case 'multipleChoice':
      case 'trueFalse':
      case 'performance':
        return parseInt(userAnswer) === quiz.correctAnswer;
        
      case 'codeCompletion':
      case 'codeAnalysis':
      case 'debugging':
        return this._compareCodeAnswers(quiz.correctAnswer, userAnswer);
        
      default:
        return false;
    }
  }

  _compareCodeAnswers(correctAnswer, userAnswer) {
    // Comparação básica de código (pode ser melhorada)
    const normalize = (code) => code.toLowerCase().replace(/\s+/g, ' ').trim();
    return normalize(correctAnswer) === normalize(userAnswer);
  }

  _generateFeedback(quiz, userAnswer, isCorrect) {
    if (isCorrect) {
      return `✅ Correto! Você entendeu ${quiz.concept} perfeitamente.`;
    } else {
      return `❌ Incorreto. Revise o conceito de ${quiz.concept} e tente novamente.`;
    }
  }

  /**
   * OBTER ESTATÍSTICAS DO QUIZ
   */
  getQuizStats(quizzes) {
    const totalQuizzes = quizzes.length;
    const totalPoints = quizzes.reduce((sum, quiz) => sum + quiz.points, 0);
    const averageDifficulty = quizzes.reduce((sum, quiz) => {
      const difficultyScores = { easy: 1, medium: 2, hard: 3 };
      return sum + difficultyScores[quiz.difficulty];
    }, 0) / totalQuizzes;
    
    const conceptsCovered = [...new Set(quizzes.map(quiz => quiz.concept))];
    
    return {
      totalQuizzes,
      totalPoints,
      averageDifficulty: Math.round(averageDifficulty * 10) / 10,
      conceptsCovered: conceptsCovered.length,
      estimatedTime: quizzes.reduce((sum, quiz) => sum + quiz.timeLimit, 0)
    };
  }
}

// Exportar para uso global
window.QuizGenerator = QuizGenerator;


























