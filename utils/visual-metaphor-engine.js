/**
 * DevMentor AI - Visual Metaphor Engine
 * Sistema de metáforas visuais memoráveis para conceitos de programação
 * 
 * Funcionalidades:
 * - Analogias visuais com objetos do mundo real
 * - Diagramas Mermaid automáticos
 * - Animações interativas
 * - Metáforas personalizadas por linguagem
 * - Sistema de memória visual
 */

class VisualMetaphorEngine {
  constructor() {
    this.metaphors = new Map();
    this.languageSpecificMetaphors = new Map();
    this.animationEngine = new AnimationEngine();
    
    // Inicializar metáforas
    this._initializeMetaphors();
    this._initializeLanguageSpecificMetaphors();
    
    console.log('[VisualMetaphorEngine] Inicializado com metáforas visuais');
  }

  /**
   * INICIALIZAR METÁFORAS BÁSICAS
   * Metáforas universais para conceitos de programação
   */
  _initializeMetaphors() {
    // Estruturas de dados como objetos reais
    this.metaphors.set('array', {
      metaphor: 'Caixas numeradas em uma prateleira',
      image: '📦📦📦📦',
      emoji: '📦',
      explanation: 'Como caixas em uma prateleira, cada array tem posições numeradas (índices) e pode conter algo (valores).',
      diagram: this._createArrayDiagram(),
      animation: 'slideIn',
      difficulty: 'beginner',
      memoryHook: 'Imagine uma prateleira com caixas numeradas de 0 a N',
      realWorldExample: 'Lista de compras, fila de pessoas'
    });

    this.metaphors.set('linked_list', {
      metaphor: 'Cadeia de elos conectados',
      image: '🔗➡️🔗➡️🔗➡️🔗',
      emoji: '🔗',
      explanation: 'Cada elemento (elo) contém dados e aponta para o próximo, formando uma cadeia.',
      diagram: this._createLinkedListDiagram(),
      animation: 'chainConnect',
      difficulty: 'intermediate',
      memoryHook: 'Pense em uma corrente de bicicleta - cada elo conecta ao próximo',
      realWorldExample: 'Cadeia de bicicleta, corrente de eventos'
    });

    this.metaphors.set('stack', {
      metaphor: 'Pilha de pratos',
      image: '🍽️\n🍽️\n🍽️\n🍽️',
      emoji: '🍽️',
      explanation: 'Adicione pratos no topo (push), remova do topo (pop). Último a entrar, primeiro a sair (LIFO).',
      diagram: this._createStackDiagram(),
      animation: 'stackPushPop',
      difficulty: 'beginner',
      memoryHook: 'Lembre-se: você só pode pegar o prato do topo da pilha',
      realWorldExample: 'Pilha de pratos, pilha de livros, undo/redo'
    });

    this.metaphors.set('queue', {
      metaphor: 'Fila de pessoas no banco',
      image: '🏦👤👤👤👤',
      emoji: '🏦',
      explanation: 'Primeira pessoa na fila é atendida primeiro. Primeiro a entrar, primeiro a sair (FIFO).',
      diagram: this._createQueueDiagram(),
      animation: 'queueProcess',
      difficulty: 'beginner',
      memoryHook: 'Como uma fila real - quem chega primeiro é atendido primeiro',
      realWorldExample: 'Fila do banco, fila de impressão, processamento de tarefas'
    });

    this.metaphors.set('hash_table', {
      metaphor: 'Caixa postal com chaves',
      image: '📮🔑📮🔑📮',
      emoji: '📮',
      explanation: 'Cada chave (endereço) leva diretamente à sua caixa postal (valor). Acesso super rápido!',
      diagram: this._createHashTableDiagram(),
      animation: 'hashLookup',
      difficulty: 'intermediate',
      memoryHook: 'Como encontrar uma casa pelo endereço - vai direto ao destino',
      realWorldExample: 'Caixas postais, dicionário, cache de memória'
    });

    this.metaphors.set('tree', {
      metaphor: 'Árvore genealógica',
      image: '🌳\n├─👨\n├─👩\n└─👶',
      emoji: '🌳',
      explanation: 'Começa com uma raiz, cada nó pode ter filhos, formando uma estrutura hierárquica.',
      diagram: this._createTreeDiagram(),
      animation: 'treeGrow',
      difficulty: 'intermediate',
      memoryHook: 'Como uma árvore real - raiz no topo, galhos se espalhando',
      realWorldExample: 'Árvore genealógica, organização de arquivos, hierarquia de empresa'
    });

    this.metaphors.set('graph', {
      metaphor: 'Mapa de cidades conectadas',
      image: '🏙️—🚗—🏙️\n|     |\n🏙️—🚗—🏙️',
      emoji: '🗺️',
      explanation: 'Cidades (nós) conectadas por estradas (arestas). Pode ter caminhos complexos.',
      diagram: this._createGraphDiagram(),
      animation: 'graphTraverse',
      difficulty: 'advanced',
      memoryHook: 'Como um mapa - cidades conectadas por estradas',
      realWorldExample: 'Mapa de cidades, rede social, sistema de rotas'
    });

    // Conceitos de programação
    this.metaphors.set('recursion', {
      metaphor: 'Bonecas russas (Matryoshka)',
      image: '🪆\n└─🪆\n  └─🪆\n    └─🪆',
      emoji: '🪆',
      explanation: 'Cada boneca contém uma versão menor de si mesma, até chegar na menor (caso base).',
      diagram: this._createRecursionDiagram(),
      animation: 'recursionUnfold',
      difficulty: 'intermediate',
      memoryHook: 'Bonecas dentro de bonecas - cada uma chama a próxima menor',
      realWorldExample: 'Bonecas russas, espelhos refletindo espelhos, fatorial'
    });

    this.metaphors.set('closure', {
      metaphor: 'Casa com janelas fechadas',
      image: '🏠\n┌─┐\n│👁️│\n└─┘',
      emoji: '🏠',
      explanation: 'A função "moradora" lembra do ambiente externo mesmo quando a casa "pai" já foi demolida.',
      diagram: this._createClosureDiagram(),
      animation: 'closureCapture',
      difficulty: 'advanced',
      memoryHook: 'Como uma casa que lembra do que estava lá fora quando foi construída',
      realWorldExample: 'Função que lembra de variáveis externas, callbacks'
    });

    this.metaphors.set('async_await', {
      metaphor: 'Pedido em restaurante',
      image: '🍔⏱️☕',
      emoji: '🍔',
      explanation: 'Você faz o pedido (async), espera (await), e pode fazer outras coisas enquanto espera.',
      diagram: this._createAsyncDiagram(),
      animation: 'asyncFlow',
      difficulty: 'intermediate',
      memoryHook: 'Como pedir comida - você espera mas pode fazer outras coisas',
      realWorldExample: 'Pedido de comida, download de arquivo, chamada de API'
    });

    this.metaphors.set('promise', {
      metaphor: 'Cupom de desconto futuro',
      image: '🎫📅💰',
      emoji: '🎫',
      explanation: 'Você recebe um cupom (Promise) que será resgatado no futuro com um valor ou erro.',
      diagram: this._createPromiseDiagram(),
      animation: 'promiseResolve',
      difficulty: 'intermediate',
      memoryHook: 'Como um cupom - você tem a promessa de algo no futuro',
      realWorldExample: 'Cupom de desconto, garantia de produto, contrato'
    });

    this.metaphors.set('callback', {
      metaphor: 'Telefone para ligar depois',
      image: '📞📝⏰',
      emoji: '📞',
      explanation: 'Você deixa seu número (callback) para ser chamado quando algo acontecer.',
      diagram: this._createCallbackDiagram(),
      animation: 'callbackRing',
      difficulty: 'intermediate',
      memoryHook: 'Como deixar seu telefone para ser chamado depois',
      realWorldExample: 'Telefone de emergência, notificação de evento'
    });

    this.metaphors.set('event_loop', {
      metaphor: 'Garçom em restaurante movimentado',
      image: '🍽️👨‍🍳📋',
      emoji: '👨‍🍳',
      explanation: 'O garçom (event loop) pega pedidos da fila, entrega para a cozinha, e volta para pegar mais.',
      diagram: this._createEventLoopDiagram(),
      animation: 'eventLoopCycle',
      difficulty: 'advanced',
      memoryHook: 'Garçom trabalhando - pega pedido, entrega, volta para mais',
      realWorldExample: 'Garçom de restaurante, despachante de eventos'
    });

    this.metaphors.set('memoization', {
      metaphor: 'Caderno de anotações',
      image: '📝💭✅',
      emoji: '📝',
      explanation: 'Quando você calcula algo difícil, anota no caderno. Na próxima vez, só consulta.',
      diagram: this._createMemoizationDiagram(),
      animation: 'memoizationSave',
      difficulty: 'intermediate',
      memoryHook: 'Como anotar resultados para não calcular de novo',
      realWorldExample: 'Caderno de fórmulas, cache de calculadora'
    });

    this.metaphors.set('inheritance', {
      metaphor: 'Herança genética familiar',
      image: '👨‍👩‍👧‍👦\n👨‍👩‍👧\n👨‍👩',
      emoji: '👨‍👩‍👧‍👦',
      explanation: 'Filhos herdam características dos pais, mas podem ter suas próprias características únicas.',
      diagram: this._createInheritanceDiagram(),
      animation: 'inheritanceFlow',
      difficulty: 'intermediate',
      memoryHook: 'Como herança familiar - filhos herdam dos pais',
      realWorldExample: 'Herança genética, hierarquia de veículos'
    });

    this.metaphors.set('polymorphism', {
      metaphor: 'Formas diferentes fazendo a mesma ação',
      image: '🚗🚚🚲\n⬇️\n🏃‍♂️',
      emoji: '🚗',
      explanation: 'Diferentes veículos (formas) podem "mover", mas cada um se move de forma diferente.',
      diagram: this._createPolymorphismDiagram(),
      animation: 'polymorphismAction',
      difficulty: 'intermediate',
      memoryHook: 'Mesma ação, formas diferentes de executar',
      realWorldExample: 'Veículos se movendo, animais fazendo som'
    });
  }

  /**
   * INICIALIZAR METÁFORAS ESPECÍFICAS POR LINGUAGEM
   * Metáforas adaptadas para cada linguagem de programação
   */
  _initializeLanguageSpecificMetaphors() {
    // JavaScript específico
    this.languageSpecificMetaphors.set('javascript', {
      'hoisting': {
        metaphor: 'Elevador de declarações',
        image: '🛗📝⬆️',
        explanation: 'Declarações são "elevadas" para o topo do escopo, como um elevador levando pessoas para cima.',
        diagram: this._createHoistingDiagram()
      },
      'prototype': {
        metaphor: 'Árvore genealógica de objetos',
        image: '🌳👨‍👩‍👧‍👦',
        explanation: 'Objetos herdam características através de uma cadeia de protótipos, como uma árvore genealógica.',
        diagram: this._createPrototypeDiagram()
      },
      'this': {
        metaphor: 'Pronome que muda de contexto',
        image: '👤🔄👥',
        explanation: 'Como o pronome "eu" - muda dependendo de quem está falando.',
        diagram: this._createThisDiagram()
      }
    });

    // Python específico
    this.languageSpecificMetaphors.set('python', {
      'list_comprehension': {
        metaphor: 'Receita de bolo condensada',
        image: '🧁📝✨',
        explanation: 'Uma forma compacta de criar listas, como uma receita condensada em uma linha.',
        diagram: this._createListComprehensionDiagram()
      },
      'decorator': {
        metaphor: 'Embrulho de presente',
        image: '🎁🎀✨',
        explanation: 'Envolve uma função com funcionalidade extra, como embrulhar um presente.',
        diagram: this._createDecoratorDiagram()
      },
      'generator': {
        metaphor: 'Máquina de pipoca',
        image: '🍿⚙️',
        explanation: 'Produz valores um por vez quando necessário, como uma máquina de pipoca fazendo uma por vez.',
        diagram: this._createGeneratorDiagram()
      }
    });

    // React específico
    this.languageSpecificMetaphors.set('react', {
      'hooks': {
        metaphor: 'Ganchos para pendurar funcionalidades',
        image: '🪝⚡🔌',
        explanation: 'Ganchos que "penduram" funcionalidades em componentes funcionais.',
        diagram: this._createHooksDiagram()
      },
      'jsx': {
        metaphor: 'HTML com superpoderes',
        image: '🌐⚡🎨',
        explanation: 'HTML que pode executar JavaScript e ter lógica dinâmica.',
        diagram: this._createJSXDiagram()
      },
      'state': {
        metaphor: 'Memória do componente',
        image: '🧠💾🔄',
        explanation: 'Como a memória de uma pessoa - lembra de informações e pode mudá-las.',
        diagram: this._createStateDiagram()
      }
    });
  }

  /**
   * OBTER METÁFORA PARA CONCEITO
   * Busca metáfora apropriada para um conceito
   */
  getMetaphor(conceptName, language = 'javascript') {
    const normalizedConcept = conceptName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    
    // Buscar em metáforas específicas da linguagem primeiro
    const languageMetaphors = this.languageSpecificMetaphors.get(language.toLowerCase());
    if (languageMetaphors && languageMetaphors[normalizedConcept]) {
      return languageMetaphors[normalizedConcept];
    }
    
    // Buscar em metáforas universais
    return this.metaphors.get(normalizedConcept) || this._createFallbackMetaphor(conceptName);
  }

  /**
   * RENDERIZAR METÁFORA VISUAL
   * HTML completo com animações e diagramas
   */
  renderMetaphor(metaphor) {
    if (!metaphor) return '';

    return `
      <div class="visual-metaphor" data-metaphor="${metaphor.metaphor}">
        <div class="metaphor-header">
          <h4 class="metaphor-title">
            <span class="metaphor-emoji">${metaphor.emoji || '💡'}</span>
            Analogia Visual
          </h4>
          <div class="metaphor-difficulty ${metaphor.difficulty || 'intermediate'}">
            ${metaphor.difficulty || 'intermediate'}
          </div>
        </div>
        
        <div class="metaphor-content">
          <div class="metaphor-visual">
            <div class="metaphor-image">
              <div class="metaphor-emoji-large">${metaphor.emoji || '💡'}</div>
              <div class="metaphor-label">${metaphor.metaphor}</div>
            </div>
            
            ${metaphor.animation ? `
              <div class="metaphor-animation" data-animation="${metaphor.animation}">
                <button class="play-animation">▶ Reproduzir Animação</button>
              </div>
            ` : ''}
          </div>
          
          <div class="metaphor-explanation">
            <p class="explanation-text">${metaphor.explanation}</p>
            
            ${metaphor.memoryHook ? `
              <div class="memory-hook">
                <span class="hook-icon">🧠</span>
                <span class="hook-text">${metaphor.memoryHook}</span>
              </div>
            ` : ''}
            
            ${metaphor.realWorldExample ? `
              <div class="real-world-example">
                <span class="example-icon">🌍</span>
                <span class="example-text">Exemplo real: ${metaphor.realWorldExample}</span>
              </div>
            ` : ''}
          </div>
          
          ${metaphor.diagram ? `
            <div class="metaphor-diagram">
              <h5>Diagrama Visual:</h5>
              <div class="diagram-container">
                <pre class="mermaid">${metaphor.diagram}</pre>
              </div>
            </div>
          ` : ''}
        </div>
        
        <div class="metaphor-actions">
          <button class="action-btn" data-action="explain-more">
            📖 Explicar Mais
          </button>
          <button class="action-btn" data-action="show-examples">
            💼 Ver Exemplos
          </button>
          <button class="action-btn" data-action="practice">
            🎯 Praticar
          </button>
        </div>
      </div>
    `;
  }

  /**
   * CRIAR DIAGRAMAS MERMAID
   * Diagramas específicos para cada conceito
   */
  _createArrayDiagram() {
    return `
      graph LR
        A[Índice 0] -->|valor: 'a'| B[📦]
        C[Índice 1] -->|valor: 'b'| D[📦]
        E[Índice 2] -->|valor: 'c'| F[📦]
        G[Índice 3] -->|valor: 'd'| H[📦]
        style B fill:#4CAF50,color:#fff
        style D fill:#4CAF50,color:#fff
        style F fill:#4CAF50,color:#fff
        style H fill:#4CAF50,color:#fff
    `;
  }

  _createLinkedListDiagram() {
    return `
      graph LR
        A[🔗 Dados A] --> B[🔗 Dados B]
        B --> C[🔗 Dados C]
        C --> D[🔗 Dados D]
        D --> E[null]
        style A fill:#2196F3,color:#fff
        style B fill:#2196F3,color:#fff
        style C fill:#2196F3,color:#fff
        style D fill:#2196F3,color:#fff
        style E fill:#f44336,color:#fff
    `;
  }

  _createStackDiagram() {
    return `
      graph TD
        A[🍽️ Prato 4] --> B[🍽️ Prato 3]
        B --> C[🍽️ Prato 2]
        C --> D[🍽️ Prato 1]
        D --> E[Base]
        style A fill:#FF9800,color:#fff
        style B fill:#FF9800,color:#fff
        style C fill:#FF9800,color:#fff
        style D fill:#FF9800,color:#fff
        style E fill:#795548,color:#fff
    `;
  }

  _createQueueDiagram() {
    return `
      graph LR
        A[👤 Pessoa 1] --> B[👤 Pessoa 2]
        B --> C[👤 Pessoa 3]
        C --> D[👤 Pessoa 4]
        E[🏦 Atendente] --> A
        style A fill:#4CAF50,color:#fff
        style B fill:#4CAF50,color:#fff
        style C fill:#4CAF50,color:#fff
        style D fill:#4CAF50,color:#fff
        style E fill:#2196F3,color:#fff
    `;
  }

  _createHashTableDiagram() {
    return `
      graph TD
        A[🔑 Chave: 'nome'] --> B[📮 Valor: 'João']
        C[🔑 Chave: 'idade'] --> D[📮 Valor: 25]
        E[🔑 Chave: 'cidade'] --> F[📮 Valor: 'SP']
        style A fill:#9C27B0,color:#fff
        style C fill:#9C27B0,color:#fff
        style E fill:#9C27B0,color:#fff
        style B fill:#4CAF50,color:#fff
        style D fill:#4CAF50,color:#fff
        style F fill:#4CAF50,color:#fff
    `;
  }

  _createTreeDiagram() {
    return `
      graph TD
        A[🌳 Raiz] --> B[🌿 Galho 1]
        A --> C[🌿 Galho 2]
        B --> D[🍃 Folha 1]
        B --> E[🍃 Folha 2]
        C --> F[🍃 Folha 3]
        style A fill:#8BC34A,color:#fff
        style B fill:#8BC34A,color:#fff
        style C fill:#8BC34A,color:#fff
        style D fill:#4CAF50,color:#fff
        style E fill:#4CAF50,color:#fff
        style F fill:#4CAF50,color:#fff
    `;
  }

  _createGraphDiagram() {
    return `
      graph TD
        A[🏙️ Cidade A] --- B[🏙️ Cidade B]
        B --- C[🏙️ Cidade C]
        A --- D[🏙️ Cidade D]
        C --- D
        B --- D
        style A fill:#FF5722,color:#fff
        style B fill:#FF5722,color:#fff
        style C fill:#FF5722,color:#fff
        style D fill:#FF5722,color:#fff
    `;
  }

  _createRecursionDiagram() {
    return `
      graph TD
        A[🪆 Boneca Grande] --> B[🪆 Boneca Média]
        B --> C[🪆 Boneca Pequena]
        C --> D[🪆 Boneca Mínima]
        D --> E[🏁 Caso Base]
        style A fill:#E91E63,color:#fff
        style B fill:#E91E63,color:#fff
        style C fill:#E91E63,color:#fff
        style D fill:#E91E63,color:#fff
        style E fill:#4CAF50,color:#fff
    `;
  }

  _createClosureDiagram() {
    return `
      graph TD
        A[🏠 Função Externa] --> B[👁️ Função Interna]
        B --> C[💾 Variável Capturada]
        A --> D[❌ Função Externa Destruída]
        B --> E[✅ Ainda Acessa Variável]
        style A fill:#FF9800,color:#fff
        style B fill:#4CAF50,color:#fff
        style C fill:#2196F3,color:#fff
        style D fill:#f44336,color:#fff
        style E fill:#4CAF50,color:#fff
    `;
  }

  _createAsyncDiagram() {
    return `
      sequenceDiagram
        participant C as Cliente
        participant R as Restaurante
        participant K as Cozinha
        
        C->>R: 🍔 Fazer Pedido
        R->>K: 📝 Enviar para Cozinha
        C->>C: ☕ Fazer outras coisas
        K->>R: ✅ Comida Pronta
        R->>C: 🍽️ Entregar Pedido
    `;
  }

  _createPromiseDiagram() {
    return `
      graph LR
        A[🎫 Promise Criada] --> B[⏳ Pendente]
        B --> C[✅ Resolvida]
        B --> D[❌ Rejeitada]
        C --> E[💰 Valor]
        D --> F[🚫 Erro]
        style A fill:#9C27B0,color:#fff
        style B fill:#FF9800,color:#fff
        style C fill:#4CAF50,color:#fff
        style D fill:#f44336,color:#fff
        style E fill:#4CAF50,color:#fff
        style F fill:#f44336,color:#fff
    `;
  }

  _createCallbackDiagram() {
    return `
      sequenceDiagram
        participant A as Aplicação
        participant E as Evento
        participant C as Callback
        
        A->>E: 📞 Registrar Callback
        E->>E: ⏰ Aguardar Evento
        E->>C: 🔔 Chamar Callback
        C->>A: 📋 Executar Ação
    `;
  }

  _createEventLoopDiagram() {
    return `
      graph TD
        A[📋 Call Stack] --> B[🔄 Event Loop]
        B --> C[📝 Task Queue]
        C --> D[⏰ Timer Queue]
        D --> E[📡 I/O Queue]
        E --> A
        style A fill:#4CAF50,color:#fff
        style B fill:#2196F3,color:#fff
        style C fill:#FF9800,color:#fff
        style D fill:#9C27B0,color:#fff
        style E fill:#FF5722,color:#fff
    `;
  }

  _createMemoizationDiagram() {
    return `
      graph LR
        A[❓ Pergunta] --> B{📝 Já Calculado?}
        B -->|Sim| C[📖 Consultar Cache]
        B -->|Não| D[🧮 Calcular]
        D --> E[💾 Salvar no Cache]
        E --> F[📤 Retornar Resultado]
        C --> F
        style A fill:#FF9800,color:#fff
        style B fill:#2196F3,color:#fff
        style C fill:#4CAF50,color:#fff
        style D fill:#9C27B0,color:#fff
        style E fill:#4CAF50,color:#fff
        style F fill:#4CAF50,color:#fff
    `;
  }

  _createInheritanceDiagram() {
    return `
      graph TD
        A[👨‍👩‍👧‍👦 Classe Pai] --> B[👨‍👩‍👧 Classe Filha]
        B --> C[👨‍👩 Classe Neto]
        A --> D[👨‍👩‍👧‍👦 Outro Filho]
        style A fill:#8BC34A,color:#fff
        style B fill:#4CAF50,color:#fff
        style C fill:#2E7D32,color:#fff
        style D fill:#4CAF50,color:#fff
    `;
  }

  _createPolymorphismDiagram() {
    return `
      graph TD
        A[🚗 Veículo] --> B[🚙 Carro]
        A --> C[🚚 Caminhão]
        A --> D[🚲 Bicicleta]
        B --> E[🏃‍♂️ mover()]
        C --> F[🏃‍♂️ mover()]
        D --> G[🏃‍♂️ mover()]
        style A fill:#2196F3,color:#fff
        style B fill:#4CAF50,color:#fff
        style C fill:#FF9800,color:#fff
        style D fill:#9C27B0,color:#fff
        style E fill:#4CAF50,color:#fff
        style F fill:#FF9800,color:#fff
        style G fill:#9C27B0,color:#fff
    `;
  }

  // Diagramas específicos por linguagem
  _createHoistingDiagram() {
    return `
      graph TD
        A[📝 Código Original] --> B[⬆️ Declarações Elevadas]
        B --> C[📋 Execução]
        style A fill:#FF9800,color:#fff
        style B fill:#2196F3,color:#fff
        style C fill:#4CAF50,color:#fff
    `;
  }

  _createPrototypeDiagram() {
    return `
      graph TD
        A[👤 Objeto] --> B[🔗 __proto__]
        B --> C[👨‍👩‍👧‍👦 Prototype]
        C --> D[🔗 __proto__]
        D --> E[👨‍👩‍👧‍👦 Object.prototype]
        style A fill:#4CAF50,color:#fff
        style B fill:#2196F3,color:#fff
        style C fill:#FF9800,color:#fff
        style D fill:#2196F3,color:#fff
        style E fill:#9C27B0,color:#fff
    `;
  }

  _createThisDiagram() {
    return `
      graph LR
        A[👤 Contexto 1] --> B[🔄 this = A]
        C[👤 Contexto 2] --> D[🔄 this = C]
        E[👤 Contexto 3] --> F[🔄 this = E]
        style A fill:#4CAF50,color:#fff
        style C fill:#FF9800,color:#fff
        style E fill:#9C27B0,color:#fff
        style B fill:#2196F3,color:#fff
        style D fill:#2196F3,color:#fff
        style F fill:#2196F3,color:#fff
    `;
  }

  _createListComprehensionDiagram() {
    return `
      graph LR
        A[📝 Loop Tradicional] --> B[✨ List Comprehension]
        B --> C[📦 Lista Resultado]
        style A fill:#FF9800,color:#fff
        style B fill:#4CAF50,color:#fff
        style C fill:#2196F3,color:#fff
    `;
  }

  _createDecoratorDiagram() {
    return `
      graph TD
        A[🎁 Decorator] --> B[🎀 Função Original]
        B --> C[✨ Função Melhorada]
        style A fill:#9C27B0,color:#fff
        style B fill:#4CAF50,color:#fff
        style C fill:#FF9800,color:#fff
    `;
  }

  _createGeneratorDiagram() {
    return `
      graph LR
        A[🍿 Generator] --> B[⚙️ yield]
        B --> C[📤 Valor 1]
        B --> D[📤 Valor 2]
        B --> E[📤 Valor 3]
        style A fill:#4CAF50,color:#fff
        style B fill:#2196F3,color:#fff
        style C fill:#FF9800,color:#fff
        style D fill:#FF9800,color:#fff
        style E fill:#FF9800,color:#fff
    `;
  }

  _createHooksDiagram() {
    return `
      graph TD
        A[⚛️ Componente] --> B[🪝 useState]
        A --> C[🪝 useEffect]
        A --> D[🪝 useContext]
        B --> E[💾 Estado]
        C --> F[🔄 Efeito]
        D --> G[🌐 Contexto]
        style A fill:#61DAFB,color:#fff
        style B fill:#4CAF50,color:#fff
        style C fill:#FF9800,color:#fff
        style D fill:#9C27B0,color:#fff
        style E fill:#4CAF50,color:#fff
        style F fill:#FF9800,color:#fff
        style G fill:#9C27B0,color:#fff
    `;
  }

  _createJSXDiagram() {
    return `
      graph LR
        A[🌐 HTML] --> B[⚡ JavaScript]
        B --> C[🎨 JSX]
        C --> D[⚛️ React Element]
        style A fill:#E34F26,color:#fff
        style B fill:#F7DF1E,color:#000
        style C fill:#61DAFB,color:#fff
        style D fill:#4CAF50,color:#fff
    `;
  }

  _createStateDiagram() {
    return `
      graph TD
        A[🧠 Estado Inicial] --> B[🔄 Ação]
        B --> C[🧠 Novo Estado]
        C --> D[🎨 Re-render]
        D --> A
        style A fill:#4CAF50,color:#fff
        style B fill:#FF9800,color:#fff
        style C fill:#2196F3,color:#fff
        style D fill:#9C27B0,color:#fff
    `;
  }

  /**
   * CRIAR METÁFORA DE FALLBACK
   * Quando não há metáfora específica
   */
  _createFallbackMetaphor(conceptName) {
    return {
      metaphor: `Conceito: ${conceptName}`,
      emoji: '💡',
      explanation: `Este é um conceito importante de programação chamado ${conceptName}.`,
      difficulty: 'intermediate',
      memoryHook: `Lembre-se: ${conceptName} é um conceito fundamental`,
      realWorldExample: 'Aplicável em muitos contextos de programação'
    };
  }

  /**
   * INICIALIZAR ANIMAÇÕES
   * Configurar sistema de animações
   */
  initializeAnimations() {
    document.addEventListener('click', (e) => {
      if (e.target.matches('.play-animation')) {
        const animationContainer = e.target.closest('.metaphor-animation');
        const animationType = animationContainer.dataset.animation;
        this._playAnimation(animationType, animationContainer);
      }
    });
  }

  /**
   * REPRODUZIR ANIMAÇÃO
   * Executar animação específica
   */
  _playAnimation(animationType, container) {
    const animations = {
      slideIn: () => this._animateSlideIn(container),
      chainConnect: () => this._animateChainConnect(container),
      stackPushPop: () => this._animateStackPushPop(container),
      queueProcess: () => this._animateQueueProcess(container),
      hashLookup: () => this._animateHashLookup(container),
      treeGrow: () => this._animateTreeGrow(container),
      graphTraverse: () => this._animateGraphTraverse(container),
      recursionUnfold: () => this._animateRecursionUnfold(container),
      closureCapture: () => this._animateClosureCapture(container),
      asyncFlow: () => this._animateAsyncFlow(container),
      promiseResolve: () => this._animatePromiseResolve(container),
      callbackRing: () => this._animateCallbackRing(container),
      eventLoopCycle: () => this._animateEventLoopCycle(container),
      memoizationSave: () => this._animateMemoizationSave(container),
      inheritanceFlow: () => this._animateInheritanceFlow(container),
      polymorphismAction: () => this._animatePolymorphismAction(container)
    };

    const animation = animations[animationType];
    if (animation) {
      animation();
    }
  }

  // Implementações básicas de animações
  _animateSlideIn(container) {
    container.style.animation = 'slideIn 1s ease-in-out';
  }

  _animateChainConnect(container) {
    container.style.animation = 'chainConnect 2s ease-in-out';
  }

  _animateStackPushPop(container) {
    container.style.animation = 'stackPushPop 1.5s ease-in-out';
  }

  _animateQueueProcess(container) {
    container.style.animation = 'queueProcess 2s ease-in-out';
  }

  _animateHashLookup(container) {
    container.style.animation = 'hashLookup 1s ease-in-out';
  }

  _animateTreeGrow(container) {
    container.style.animation = 'treeGrow 3s ease-in-out';
  }

  _animateGraphTraverse(container) {
    container.style.animation = 'graphTraverse 2.5s ease-in-out';
  }

  _animateRecursionUnfold(container) {
    container.style.animation = 'recursionUnfold 3s ease-in-out';
  }

  _animateClosureCapture(container) {
    container.style.animation = 'closureCapture 2s ease-in-out';
  }

  _animateAsyncFlow(container) {
    container.style.animation = 'asyncFlow 2s ease-in-out';
  }

  _animatePromiseResolve(container) {
    container.style.animation = 'promiseResolve 1.5s ease-in-out';
  }

  _animateCallbackRing(container) {
    container.style.animation = 'callbackRing 1s ease-in-out';
  }

  _animateEventLoopCycle(container) {
    container.style.animation = 'eventLoopCycle 3s ease-in-out infinite';
  }

  _animateMemoizationSave(container) {
    container.style.animation = 'memoizationSave 1.5s ease-in-out';
  }

  _animateInheritanceFlow(container) {
    container.style.animation = 'inheritanceFlow 2s ease-in-out';
  }

  _animatePolymorphismAction(container) {
    container.style.animation = 'polymorphismAction 2s ease-in-out';
  }
}

// Engine de animações
class AnimationEngine {
  constructor() {
    this.animations = new Map();
    this._initializeAnimations();
  }

  _initializeAnimations() {
    // Implementar animações CSS personalizadas
    const animationCSS = `
      @keyframes slideIn {
        from { transform: translateX(-100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      
      @keyframes chainConnect {
        0% { transform: scale(0.8); opacity: 0; }
        50% { transform: scale(1.1); opacity: 0.8; }
        100% { transform: scale(1); opacity: 1; }
      }
      
      @keyframes stackPushPop {
        0% { transform: translateY(0); }
        50% { transform: translateY(-20px); }
        100% { transform: translateY(0); }
      }
      
      @keyframes queueProcess {
        0% { transform: translateX(0); }
        100% { transform: translateX(100px); }
      }
      
      @keyframes hashLookup {
        0% { transform: scale(1); }
        50% { transform: scale(1.2); }
        100% { transform: scale(1); }
      }
      
      @keyframes treeGrow {
        0% { transform: scale(0); opacity: 0; }
        100% { transform: scale(1); opacity: 1; }
      }
      
      @keyframes graphTraverse {
        0% { opacity: 0.3; }
        50% { opacity: 1; }
        100% { opacity: 0.3; }
      }
      
      @keyframes recursionUnfold {
        0% { transform: scale(1); }
        50% { transform: scale(0.8); }
        100% { transform: scale(1); }
      }
      
      @keyframes closureCapture {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
      }
      
      @keyframes asyncFlow {
        0% { transform: translateX(0); }
        100% { transform: translateX(200px); }
      }
      
      @keyframes promiseResolve {
        0% { opacity: 0; }
        100% { opacity: 1; }
      }
      
      @keyframes callbackRing {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      @keyframes eventLoopCycle {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      @keyframes memoizationSave {
        0% { transform: scale(1); }
        50% { transform: scale(1.2); }
        100% { transform: scale(1); }
      }
      
      @keyframes inheritanceFlow {
        0% { transform: translateY(0); }
        100% { transform: translateY(-30px); }
      }
      
      @keyframes polymorphismAction {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
      }
    `;

    // Injetar CSS de animações
    if (window.DevMentorHelpers) {
      window.DevMentorHelpers.injectCSS(animationCSS, 'metaphor-animations');
    }
  }
}

// Exportar para uso global
window.VisualMetaphorEngine = VisualMetaphorEngine;
window.AnimationEngine = AnimationEngine;







