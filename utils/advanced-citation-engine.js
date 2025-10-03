/**
 * DevMentor AI - Sistema Avançado de Citação de Fontes
 * Busca inteligente e citação de fontes autoritativas
 */

class AdvancedCitationEngine {
  constructor() {
    this.sources = {
      // Documentação oficial
      officialDocs: {
        javascript: [
          { name: 'MDN Web Docs', url: 'https://developer.mozilla.org', priority: 10 },
          { name: 'ECMAScript Specification', url: 'https://tc39.es/ecma262/', priority: 9 }
        ],
        python: [
          { name: 'Python.org Documentation', url: 'https://docs.python.org', priority: 10 },
          { name: 'PEP Index', url: 'https://peps.python.org', priority: 9 }
        ],
        java: [
          { name: 'Oracle Java Documentation', url: 'https://docs.oracle.com/en/java/', priority: 10 },
          { name: 'Java SE API', url: 'https://docs.oracle.com/en/java/javase/', priority: 9 }
        ],
        csharp: [
          { name: 'Microsoft .NET Documentation', url: 'https://docs.microsoft.com/en-us/dotnet/', priority: 10 },
          { name: 'C# Language Reference', url: 'https://docs.microsoft.com/en-us/dotnet/csharp/', priority: 9 }
        ],
        cpp: [
          { name: 'cppreference.com', url: 'https://en.cppreference.com', priority: 10 },
          { name: 'ISO C++ Standard', url: 'https://isocpp.org', priority: 9 }
        ],
        go: [
          { name: 'Go Documentation', url: 'https://golang.org/doc/', priority: 10 },
          { name: 'Go by Example', url: 'https://gobyexample.com', priority: 8 }
        ],
        rust: [
          { name: 'The Rust Book', url: 'https://doc.rust-lang.org/book/', priority: 10 },
          { name: 'Rust Reference', url: 'https://doc.rust-lang.org/reference/', priority: 9 }
        ],
        php: [
          { name: 'PHP Manual', url: 'https://www.php.net/manual/', priority: 10 },
          { name: 'PHP RFC', url: 'https://wiki.php.net/rfc', priority: 8 }
        ]
      },
      
      // Tutoriais e cursos
      tutorials: {
        javascript: [
          { name: 'JavaScript.info', url: 'https://javascript.info', priority: 9 },
          { name: 'Eloquent JavaScript', url: 'https://eloquentjavascript.net', priority: 8 },
          { name: 'You Don\'t Know JS', url: 'https://github.com/getify/You-Dont-Know-JS', priority: 9 }
        ],
        python: [
          { name: 'Real Python', url: 'https://realpython.com', priority: 9 },
          { name: 'Python Tutorial', url: 'https://docs.python.org/3/tutorial/', priority: 8 },
          { name: 'Automate the Boring Stuff', url: 'https://automatetheboringstuff.com', priority: 7 }
        ],
        java: [
          { name: 'Oracle Java Tutorials', url: 'https://docs.oracle.com/javase/tutorial/', priority: 9 },
          { name: 'JavaTpoint', url: 'https://www.javatpoint.com', priority: 7 }
        ]
      },
      
      // Comunidades e fóruns
      communities: [
        { name: 'Stack Overflow', url: 'https://stackoverflow.com', priority: 9 },
        { name: 'Reddit Programming', url: 'https://reddit.com/r/programming', priority: 6 },
        { name: 'Dev.to', url: 'https://dev.to', priority: 7 },
        { name: 'Hacker News', url: 'https://news.ycombinator.com', priority: 6 }
      ],
      
      // Repositórios GitHub
      github: [
        { name: 'GitHub', url: 'https://github.com', priority: 8 },
        { name: 'GitHub Trending', url: 'https://github.com/trending', priority: 6 }
      ],
      
      // Vídeos educacionais
      videos: [
        { name: 'YouTube', url: 'https://youtube.com', priority: 7 },
        { name: 'freeCodeCamp', url: 'https://freecodecamp.org', priority: 8 },
        { name: 'Coursera', url: 'https://coursera.org', priority: 7 },
        { name: 'edX', url: 'https://edx.org', priority: 7 }
      ],
      
      // Livros e artigos
      books: {
        javascript: [
          { name: 'JavaScript: The Good Parts', author: 'Douglas Crockford', priority: 8 },
          { name: 'You Don\'t Know JS', author: 'Kyle Simpson', priority: 9 },
          { name: 'Eloquent JavaScript', author: 'Marijn Haverbeke', priority: 8 }
        ],
        python: [
          { name: 'Python Crash Course', author: 'Eric Matthes', priority: 8 },
          { name: 'Automate the Boring Stuff', author: 'Al Sweigart', priority: 7 },
          { name: 'Fluent Python', author: 'Luciano Ramalho', priority: 9 }
        ]
      }
    };
    
    this.geminiIntegration = null;
    console.log('[AdvancedCitationEngine] Inicializado');
  }

  /**
   * INICIALIZAR COM GEMINI PRO
   */
  async initialize() {
    if (window.geminiProIntegration) {
      this.geminiIntegration = window.geminiProIntegration;
    }
    console.log('[AdvancedCitationEngine] Sistema inicializado');
  }

  /**
   * BUSCAR FONTES INTELIGENTES PARA CÓDIGO
   */
  async findIntelligentSources(code, language, context = {}) {
    const {
      userLevel = 'intermediário',
      focusAreas = ['conceitos', 'prática'],
      includeAI = true
    } = context;

    console.log(`[AdvancedCitationEngine] Buscando fontes para ${language} (${userLevel})`);

    try {
      let sources = {
        officialDocs: [],
        tutorials: [],
        stackOverflow: [],
        github: [],
        videos: [],
        books: [],
        articles: [],
        tools: []
      };

      // 1. Fontes baseadas em regras (sempre incluídas)
      sources = this.getRuleBasedSources(code, language, userLevel);

      // 2. Fontes geradas por AI (se disponível)
      if (includeAI && this.geminiIntegration) {
        const aiSources = await this.generateAISources(code, language, userLevel, focusAreas);
        sources = this.mergeSources(sources, aiSources);
      }

      // 3. Buscar fontes específicas do código
      const specificSources = await this.findCodeSpecificSources(code, language);
      sources = this.mergeSources(sources, specificSources);

      // 4. Priorizar e filtrar fontes
      const prioritizedSources = this.prioritizeSources(sources, userLevel);

      console.log('[AdvancedCitationEngine] Fontes encontradas:', Object.keys(prioritizedSources).map(k => `${k}: ${prioritizedSources[k].length}`).join(', '));
      return prioritizedSources;

    } catch (error) {
      console.error('[AdvancedCitationEngine] Erro na busca:', error);
      return this.getFallbackSources(language);
    }
  }

  /**
   * FONTES BASEADAS EM REGRAS
   */
  getRuleBasedSources(code, language, userLevel) {
    const sources = {
      officialDocs: [],
      tutorials: [],
      stackOverflow: [],
      github: [],
      videos: [],
      books: [],
      articles: [],
      tools: []
    };

    // Documentação oficial (sempre incluída)
    if (this.sources.officialDocs[language]) {
      sources.officialDocs = this.sources.officialDocs[language].map(doc => ({
        title: doc.name,
        url: doc.url,
        description: `Documentação oficial do ${language}`,
        relevanceScore: doc.priority,
        type: 'official',
        category: 'documentation'
      }));
    }

    // Tutoriais baseados no nível
    if (this.sources.tutorials[language]) {
      sources.tutorials = this.sources.tutorials[language]
        .filter(tutorial => this.isRelevantForLevel(tutorial, userLevel))
        .map(tutorial => ({
          title: tutorial.name,
          url: tutorial.url,
          description: `Tutorial de ${language}`,
          relevanceScore: tutorial.priority,
          type: 'tutorial',
          category: 'learning'
        }));
    }

    // Livros recomendados
    if (this.sources.books[language]) {
      sources.books = this.sources.books[language]
        .filter(book => this.isRelevantForLevel(book, userLevel))
        .map(book => ({
          title: book.name,
          author: book.author,
          description: `Livro recomendado sobre ${language}`,
          relevanceScore: book.priority,
          type: 'book',
          category: 'learning'
        }));
    }

    return sources;
  }

  /**
   * GERAR FONTES COM AI
   */
  async generateAISources(code, language, userLevel, focusAreas) {
    const prompt = `Analise este código e sugira fontes de aprendizado específicas:

CÓDIGO:
\`\`\`${language}
${code}
\`\`\`

NÍVEL: ${userLevel}
FOCO: ${focusAreas.join(', ')}

Sugira fontes específicas organizadas por categoria. Para cada fonte, inclua:
- title: título da fonte
- url: URL (se aplicável)
- description: descrição breve
- relevanceScore: relevância de 1-10
- type: tipo da fonte
- category: categoria

Categorias: officialDocs, tutorials, stackOverflow, github, videos, books, articles, tools

Responda APENAS com JSON válido.`;

    try {
      const response = await this.geminiIntegration.generateContent(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('[AdvancedCitationEngine] Erro na geração AI:', error);
      return {};
    }
  }

  /**
   * BUSCAR FONTES ESPECÍFICAS DO CÓDIGO
   */
  async findCodeSpecificSources(code, language) {
    const sources = {
      stackOverflow: [],
      github: [],
      articles: [],
      tools: []
    };

    // Analisar conceitos no código
    const concepts = this.extractConceptsFromCode(code, language);
    
    // Buscar no Stack Overflow (simulado)
    concepts.forEach(concept => {
      sources.stackOverflow.push({
        title: `${concept} - Stack Overflow`,
        url: `https://stackoverflow.com/questions/tagged/${concept}`,
        description: `Perguntas e respostas sobre ${concept}`,
        relevanceScore: 8,
        type: 'stackoverflow',
        category: 'community'
      });
    });

    // Buscar repositórios GitHub (simulado)
    concepts.forEach(concept => {
      sources.github.push({
        title: `Repositórios sobre ${concept}`,
        url: `https://github.com/search?q=${concept}+${language}`,
        description: `Código de exemplo e projetos sobre ${concept}`,
        relevanceScore: 7,
        type: 'github',
        category: 'code'
      });
    });

    return sources;
  }

  /**
   * EXTRAIR CONCEITOS DO CÓDIGO
   */
  extractConceptsFromCode(code, language) {
    const concepts = [];
    
    // Padrões comuns por linguagem
    const patterns = {
      javascript: [
        { pattern: /function\s+(\w+)/g, concept: 'functions' },
        { pattern: /class\s+(\w+)/g, concept: 'classes' },
        { pattern: /async\s+function/g, concept: 'async-await' },
        { pattern: /Promise/g, concept: 'promises' },
        { pattern: /\.map\(/g, concept: 'array-methods' },
        { pattern: /\.filter\(/g, concept: 'array-methods' },
        { pattern: /\.reduce\(/g, concept: 'array-methods' },
        { pattern: /const\s+\{.*\}\s*=/g, concept: 'destructuring' },
        { pattern: /import.*from/g, concept: 'modules' },
        { pattern: /export/g, concept: 'modules' }
      ],
      python: [
        { pattern: /def\s+(\w+)/g, concept: 'functions' },
        { pattern: /class\s+(\w+)/g, concept: 'classes' },
        { pattern: /async\s+def/g, concept: 'async-await' },
        { pattern: /yield/g, concept: 'generators' },
        { pattern: /lambda/g, concept: 'lambda-functions' },
        { pattern: /list\(/g, concept: 'list-comprehension' },
        { pattern: /dict\(/g, concept: 'dictionaries' },
        { pattern: /import\s+(\w+)/g, concept: 'modules' },
        { pattern: /from\s+(\w+)\s+import/g, concept: 'modules' }
      ],
      java: [
        { pattern: /public\s+class\s+(\w+)/g, concept: 'classes' },
        { pattern: /public\s+static\s+void\s+main/g, concept: 'main-method' },
        { pattern: /interface\s+(\w+)/g, concept: 'interfaces' },
        { pattern: /extends\s+(\w+)/g, concept: 'inheritance' },
        { pattern: /implements\s+(\w+)/g, concept: 'interfaces' },
        { pattern: /try\s*\{/g, concept: 'exception-handling' },
        { pattern: /catch\s*\(/g, concept: 'exception-handling' },
        { pattern: /List<\w+>/g, concept: 'generics' },
        { pattern: /Map<\w+,\w+>/g, concept: 'generics' }
      ]
    };

    if (patterns[language]) {
      patterns[language].forEach(({ pattern, concept }) => {
        if (pattern.test(code) && !concepts.includes(concept)) {
          concepts.push(concept);
        }
      });
    }

    return concepts.slice(0, 5); // Limitar a 5 conceitos
  }

  /**
   * MESCLAR FONTES
   */
  mergeSources(baseSources, newSources) {
    const merged = { ...baseSources };
    
    Object.keys(newSources).forEach(category => {
      if (merged[category]) {
        merged[category] = [...merged[category], ...newSources[category]];
      } else {
        merged[category] = newSources[category] || [];
      }
    });

    return merged;
  }

  /**
   * PRIORIZAR FONTES
   */
  prioritizeSources(sources, userLevel) {
    const prioritized = {};
    
    Object.keys(sources).forEach(category => {
      prioritized[category] = sources[category]
        .sort((a, b) => {
          // Priorizar por relevância
          const scoreA = a.relevanceScore || 5;
          const scoreB = b.relevanceScore || 5;
          
          // Ajustar por nível do usuário
          const levelMultiplierA = this.getLevelMultiplier(a, userLevel);
          const levelMultiplierB = this.getLevelMultiplier(b, userLevel);
          
          return (scoreB * levelMultiplierB) - (scoreA * levelMultiplierA);
        })
        .slice(0, 10); // Limitar a 10 por categoria
    });

    return prioritized;
  }

  /**
   * MULTIPLICADOR POR NÍVEL
   */
  getLevelMultiplier(source, userLevel) {
    const levelMap = {
      'iniciante': { officialDocs: 1.2, tutorials: 1.3, books: 1.1, videos: 1.2 },
      'intermediário': { officialDocs: 1.1, tutorials: 1.0, books: 1.0, videos: 1.0 },
      'avançado': { officialDocs: 1.0, tutorials: 0.8, books: 1.1, videos: 0.9 }
    };

    const multipliers = levelMap[userLevel] || levelMap['intermediário'];
    return multipliers[source.category] || 1.0;
  }

  /**
   * VERIFICAR RELEVÂNCIA PARA NÍVEL
   */
  isRelevantForLevel(source, userLevel) {
    const levelMap = {
      'iniciante': [1, 2, 3, 4, 5],
      'intermediário': [3, 4, 5, 6, 7],
      'avançado': [5, 6, 7, 8, 9, 10]
    };

    const relevantScores = levelMap[userLevel] || levelMap['intermediário'];
    return relevantScores.includes(source.priority);
  }

  /**
   * GERAR CITAÇÃO FORMATADA
   */
  formatCitation(source, format = 'markdown') {
    switch (format) {
      case 'markdown':
        return `[${source.title}](${source.url}) - ${source.description}`;
      case 'html':
        return `<a href="${source.url}" target="_blank">${source.title}</a> - ${source.description}`;
      case 'text':
        return `${source.title}: ${source.url} - ${source.description}`;
      default:
        return source;
    }
  }

  /**
   * GERAR BIBLIOGRAFIA COMPLETA
   */
  generateBibliography(sources, format = 'markdown') {
    let bibliography = '';
    
    Object.keys(sources).forEach(category => {
      if (sources[category].length > 0) {
        bibliography += `\n## ${this.getCategoryTitle(category)}\n\n`;
        
        sources[category].forEach(source => {
          bibliography += `- ${this.formatCitation(source, format)}\n`;
        });
      }
    });

    return bibliography;
  }

  /**
   * TÍTULO DA CATEGORIA
   */
  getCategoryTitle(category) {
    const titles = {
      officialDocs: '📚 Documentação Oficial',
      tutorials: '🎓 Tutoriais e Cursos',
      stackOverflow: '💬 Stack Overflow',
      github: '💻 Repositórios GitHub',
      videos: '🎥 Vídeos Educacionais',
      books: '📖 Livros Recomendados',
      articles: '📰 Artigos Técnicos',
      tools: '🛠️ Ferramentas'
    };
    
    return titles[category] || category;
  }

  /**
   * FONTES DE FALLBACK
   */
  getFallbackSources(language) {
    return {
      officialDocs: [
        {
          title: `Documentação oficial ${language}`,
          url: '#',
          description: 'Documentação oficial da linguagem',
          relevanceScore: 10,
          type: 'official',
          category: 'documentation'
        }
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

  /**
   * OBTER STATUS
   */
  getStatus() {
    return {
      hasGeminiIntegration: !!this.geminiIntegration,
      availableLanguages: Object.keys(this.sources.officialDocs),
      totalSources: Object.values(this.sources).reduce((total, category) => {
        if (typeof category === 'object' && !Array.isArray(category)) {
          return total + Object.values(category).reduce((sum, items) => sum + items.length, 0);
        }
        return total + (Array.isArray(category) ? category.length : 0);
      }, 0)
    };
  }
}

// Inicializar globalmente
if (typeof window !== 'undefined') {
  window.advancedCitationEngine = new AdvancedCitationEngine();
  console.log('📚 Advanced Citation Engine carregado!');
}







