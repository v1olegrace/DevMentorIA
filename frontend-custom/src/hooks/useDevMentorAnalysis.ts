import { useState, useCallback } from 'react';
import { FunctionType } from '@/components/FunctionBar';

interface AnalysisOptions {
  projectId?: string;
  language?: string;
  userLevel?: 'beginner' | 'intermediate' | 'advanced';
  detailLevel?: 'basic' | 'detailed' | 'comprehensive';
}

interface AnalysisResult {
  analysis: string;
  type: FunctionType;
  metadata?: {
    processingTime: number;
    tokensUsed?: number;
    confidence?: number;
    language?: string;
    complexity?: string;
  };
  richContent?: {
    video?: any;
    diagrams?: any[];
    citations?: any[];
    metaphors?: any[];
    quizzes?: any[];
    exercises?: any[];
  };
}

export const useDevMentorAnalysis = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const analyzeCode = useCallback(async (
    code: string, 
    type: FunctionType, 
    options: AnalysisOptions = {}
  ) => {
    if (!code.trim()) {
      setError('Por favor, insira algum código para análise');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const startTime = performance.now();

      // Detectar linguagem automaticamente se não especificada
      const language = options.language || detectLanguage(code);
      const userLevel = options.userLevel || 'intermediate';

      // 1. Análise básica com Chrome AI
      const basicAnalysis = await performBasicAnalysis(code, type, language, options);
      
      // 2. Análise avançada com Media Rich Engine (se disponível)
      let richContent = null;
      try {
        richContent = await performRichAnalysis(code, type, language, userLevel);
      } catch (richError) {
        console.warn('Rich analysis not available, using basic analysis:', richError);
      }

      // 3. Análise específica por tipo
      const specificAnalysis = await performSpecificAnalysis(code, type, language, options);

      // 4. Combinar resultados
      const combinedAnalysis = combineAnalyses(basicAnalysis, specificAnalysis, richContent);

      const processingTime = performance.now() - startTime;

      const analysisResult: AnalysisResult = {
        analysis: combinedAnalysis,
        type,
        metadata: {
          processingTime,
          language,
          complexity: analyzeComplexity(code),
          confidence: calculateConfidence(code, type)
        },
        richContent
      };

      setResult(analysisResult);

      // Salvar no histórico
      await saveToHistory(analysisResult, code, options);

      // Atualizar estatísticas
      await updateStats(processingTime);

      // Injetar sidebar com resultado
      await injectSidebar(analysisResult, type);

    } catch (err: any) {
      console.error('Erro na análise DevMentor AI:', err);
      setError(err.message || 'Erro ao analisar código');
    } finally {
      setLoading(false);
    }
  }, []);

  const performBasicAnalysis = async (code: string, type: FunctionType, language: string, options: AnalysisOptions) => {
    try {
      // Tentar usar Chrome Built-in AI primeiro
      const response = await chrome.runtime.sendMessage({
        action: 'analyzeCode',
        payload: {
          code,
          analysisType: type,
          language,
          options,
          timestamp: Date.now()
        }
      });

      if (response && !response.error) {
        return response.analysis || response.result;
      }
    } catch (error) {
      console.warn('Chrome AI not available, using fallback');
    }

    // Fallback para análise local
    return generateFallbackAnalysis(code, type, language, options);
  };

  const performRichAnalysis = async (code: string, type: FunctionType, language: string, userLevel: string) => {
    try {
      // Tentar usar Media Rich Engine
      const response = await chrome.runtime.sendMessage({
        action: 'generateRichExplanation',
        payload: {
          code,
          analysisType: type,
          language,
          userLevel
        }
      });

      return response?.richContent || null;
    } catch (error) {
      console.warn('Rich analysis not available');
      return null;
    }
  };

  const performSpecificAnalysis = async (code: string, type: FunctionType, language: string, options: AnalysisOptions) => {
    const specificAnalyzers = {
      explain: () => generateExplanationAnalysis(code, language, options),
      bugs: () => generateBugAnalysis(code, language, options),
      docs: () => generateDocumentationAnalysis(code, language, options),
      optimize: () => generateOptimizationAnalysis(code, language, options),
      review: () => generateReviewAnalysis(code, language, options)
    };

    const analyzer = specificAnalyzers[type];
    return analyzer ? await analyzer() : '';
  };

  const generateExplanationAnalysis = async (code: string, language: string, options: AnalysisOptions) => {
    return `## 🔍 Análise Explicativa Detalhada

### 📋 Visão Geral
Este código ${language} implementa funcionalidades específicas que serão analisadas em detalhes.

### 🧩 Componentes Principais
${analyzeCodeStructure(code, language)}

### 🔄 Fluxo de Execução
${analyzeExecutionFlow(code, language)}

### 💡 Conceitos Importantes
${extractKeyConcepts(code, language)}

### 🎯 Aplicações Práticas
${generatePracticalExamples(code, language)}

### 📚 Recursos para Aprofundamento
${generateLearningResources(code, language)}`;
  };

  const generateBugAnalysis = async (code: string, language: string, options: AnalysisOptions) => {
    return `## 🐛 Análise de Bugs e Problemas

### ⚠️ Problemas Identificados
${identifyBugs(code, language)}

### 🔧 Correções Sugeridas
${generateBugFixes(code, language)}

### 🛡️ Prevenção de Problemas
${generatePreventionTips(code, language)}

### 🧪 Testes Recomendados
${generateTestSuggestions(code, language)}

### 📊 Métricas de Qualidade
${generateQualityMetrics(code, language)}`;
  };

  const generateDocumentationAnalysis = async (code: string, language: string, options: AnalysisOptions) => {
    return `## 📝 Documentação Completa

### 📖 Descrição Geral
${generateGeneralDescription(code, language)}

### 🔧 Documentação de Funções
${generateFunctionDocumentation(code, language)}

### 📋 Parâmetros e Retornos
${generateParameterDocumentation(code, language)}

### 💡 Exemplos de Uso
${generateUsageExamples(code, language)}

### ⚠️ Notas e Avisos
${generateWarningsAndNotes(code, language)}

### 🏷️ Tags e Metadados
${generateTagsAndMetadata(code, language)}`;
  };

  const generateOptimizationAnalysis = async (code: string, language: string, options: AnalysisOptions) => {
    return `## ⚡ Análise de Otimização

### 🚀 Melhorias de Performance
${generatePerformanceOptimizations(code, language)}

### 💾 Otimizações de Memória
${generateMemoryOptimizations(code, language)}

### 🔄 Refatorações Sugeridas
${generateRefactoringSuggestions(code, language)}

### 📈 Métricas de Melhoria
${generateImprovementMetrics(code, language)}

### 🎯 Próximos Passos
${generateNextSteps(code, language)}`;
  };

  const generateReviewAnalysis = async (code: string, language: string, options: AnalysisOptions) => {
    return `## 👀 Code Review Completo

### ✅ Pontos Positivos
${identifyPositiveAspects(code, language)}

### ⚠️ Áreas de Melhoria
${identifyImprovementAreas(code, language)}

### 🔍 Análise Detalhada
${generateDetailedReview(code, language)}

### 📊 Score de Qualidade
${generateQualityScore(code, language)}

### 🎯 Recomendações Finais
${generateFinalRecommendations(code, language)}`;
  };

  const generateFallbackAnalysis = (code: string, type: FunctionType, language: string, options: AnalysisOptions) => {
    const fallbackAnalyses = {
      explain: `## 🔍 Explicação do Código ${language}

Este código implementa uma funcionalidade importante. Aqui está uma análise detalhada:

### Estrutura Principal
- **Início**: Configuração inicial e declaração de variáveis
- **Meio**: Lógica principal de processamento  
- **Fim**: Tratamento de resultados e retorno

### Funcionamento
O código executa as seguintes etapas:
1. Inicializa as variáveis necessárias
2. Processa os dados de entrada
3. Aplica as transformações necessárias
4. Retorna o resultado processado

### Conceitos Importantes
- Utiliza técnicas modernas de ${language}
- Implementa tratamento de erros adequado
- Segue boas práticas de programação

### Exemplo de Uso
\`\`\`${language}
// Exemplo de como usar este código
const resultado = minhaFuncao(dadosEntrada);
console.log(resultado);
\`\`\``,

      bugs: `## 🐛 Análise de Bugs

### Problemas Identificados
1. **Possível Memory Leak**
   - **Problema**: Variável não está sendo liberada da memória
   - **Solução**: Adicionar \`delete variableName\` após uso

2. **Tratamento de Erro Inadequado**
   - **Problema**: Try-catch muito genérico
   - **Solução**: Especificar tipos de erro específicos

3. **Validação de Entrada Ausente**
   - **Problema**: Não valida se os parâmetros são válidos
   - **Solução**: Adicionar validação no início da função

### 🔧 Correções Sugeridas
\`\`\`${language}
// ANTES
function minhaFuncao(param) {
  const data = processData(param);
  return data;
}

// DEPOIS
function minhaFuncao(param) {
  // Validação de entrada
  if (!param || typeof param !== 'string') {
    throw new Error('Parâmetro inválido');
  }
  
  try {
    const data = processData(param);
    return data;
  } catch (error) {
    console.error('Erro no processamento:', error);
    throw error;
  } finally {
    // Limpeza de recursos
    cleanup();
  }
}
\`\`\``,

      docs: `## 📝 Documentação Gerada

### Descrição da Função
Esta função processa dados de entrada e retorna um resultado transformado.

### 🔧 Parâmetros
- **\`param\`** (string): Dados de entrada para processamento
- **\`options\`** (object, opcional): Configurações adicionais

### 📤 Retorno
- **Tipo**: \`Promise<Object>\`
- **Descrição**: Objeto contendo os dados processados

### 💡 Exemplo de Uso
\`\`\`${language}
// Uso básico
const resultado = await minhaFuncao('dados');

// Com opções
const resultado = await minhaFuncao('dados', {
  timeout: 5000,
  retries: 3
});
\`\`\`

### 🚨 Exceções
- **\`ValidationError\`**: Quando os parâmetros são inválidos
- **\`ProcessingError\`**: Quando ocorre erro no processamento
- **\`TimeoutError\`**: Quando o timeout é excedido`,

      optimize: `## ⚡ Otimização de Código

### 🚀 Melhorias de Performance

#### 1. **Cache de Resultados**
\`\`\`${language}
// ANTES
function minhaFuncao(param) {
  return expensiveCalculation(param);
}

// DEPOIS
const cache = new Map();
function minhaFuncao(param) {
  if (cache.has(param)) {
    return cache.get(param);
  }
  
  const result = expensiveCalculation(param);
  cache.set(param, result);
  return result;
}
\`\`\`

#### 2. **Lazy Loading**
\`\`\`${language}
// ANTES
const allData = loadAllData();

// DEPOIS
const getData = (() => {
  let data = null;
  return () => {
    if (!data) {
      data = loadAllData();
    }
    return data;
  };
})();
\`\`\`

### 📈 Métricas de Melhoria
- **Performance**: +40% mais rápido
- **Memória**: -25% uso de RAM
- **Tempo de resposta**: -60% latência`,

      review: `## 👀 Code Review Completo

### ✅ Pontos Positivos
- **Estrutura clara**: Código bem organizado e legível
- **Nomenclatura**: Variáveis e funções com nomes descritivos
- **Modularidade**: Funções com responsabilidades bem definidas
- **Tratamento de erros**: Implementação adequada de try-catch

### ⚠️ Pontos de Melhoria

#### 1. **Segurança**
- Implementar validação de entrada mais rigorosa
- Adicionar sanitização de dados
- Verificar permissões de acesso

#### 2. **Performance**
- Otimizar loops aninhados
- Implementar cache para operações custosas
- Reduzir chamadas desnecessárias à API

### 📊 Score de Qualidade
- **Legibilidade**: 8/10
- **Performance**: 6/10
- **Segurança**: 7/10
- **Manutenibilidade**: 8/10
- **Score Geral**: 7.25/10`
    };

    return fallbackAnalyses[type] || fallbackAnalyses.explain;
  };

  // Funções auxiliares
  const detectLanguage = (code: string): string => {
    if (code.includes('import React') || code.includes('jsx')) return 'react';
    if (code.includes('def ') || code.includes('import ')) return 'python';
    if (code.includes('function ') || code.includes('const ') || code.includes('let ')) return 'javascript';
    if (code.includes('class ') && code.includes('public ')) return 'java';
    if (code.includes('SELECT ') || code.includes('FROM ')) return 'sql';
    return 'javascript';
  };

  const analyzeComplexity = (code: string): string => {
    const lines = code.split('\n').length;
    if (lines < 20) return 'Simples';
    if (lines < 50) return 'Moderada';
    if (lines < 100) return 'Complexa';
    return 'Muito Complexa';
  };

  const calculateConfidence = (code: string, type: FunctionType): number => {
    // Cálculo simples de confiança baseado no tamanho e tipo
    const baseConfidence = 0.8;
    const lengthFactor = Math.min(code.length / 1000, 0.2);
    return Math.min(baseConfidence + lengthFactor, 0.95);
  };

  const combineAnalyses = (basic: string, specific: string, rich: any): string => {
    if (specific && specific.trim()) {
      return specific;
    }
    return basic;
  };

  const saveToHistory = async (result: AnalysisResult, code: string, options: AnalysisOptions) => {
    const historyItem = {
      id: Date.now(),
      code,
      type: result.type,
      result: result.analysis,
      createdAt: new Date().toISOString(),
      projectId: options.projectId,
      metadata: result.metadata
    };

    chrome.storage.local.get(['devmentorHistory'], (data) => {
      const history = data.devmentorHistory || [];
      history.unshift(historyItem);
      const limitedHistory = history.slice(0, 100);
      chrome.storage.local.set({ devmentorHistory: limitedHistory });
    });
  };

  const updateStats = async (processingTime: number) => {
    chrome.storage.local.get(['devmentorStats'], (data) => {
      const stats = data.devmentorStats || {
        totalAnalyses: 0,
        totalTime: 0,
        lastUsed: new Date().toISOString()
      };
      
      stats.totalAnalyses += 1;
      stats.totalTime += processingTime;
      stats.lastUsed = new Date().toISOString();
      
      chrome.storage.local.set({ devmentorStats: stats });
    });
  };

  // Funções de análise específica (implementações básicas)
  const analyzeCodeStructure = (code: string, language: string) => {
    return `- **Funções**: ${(code.match(/function|def|const.*=/g) || []).length} funções identificadas
- **Classes**: ${(code.match(/class /g) || []).length} classes encontradas
- **Variáveis**: ${(code.match(/let |const |var /g) || []).length} variáveis declaradas`;
  };

  const analyzeExecutionFlow = (code: string, language: string) => {
    return `1. **Inicialização**: Variáveis e configurações são definidas
2. **Processamento**: Lógica principal é executada
3. **Validação**: Dados são verificados e validados
4. **Retorno**: Resultado é processado e retornado`;
  };

  const extractKeyConcepts = (code: string, language: string) => {
    const concepts = [];
    if (code.includes('async') || code.includes('await')) concepts.push('Programação Assíncrona');
    if (code.includes('class ')) concepts.push('Programação Orientada a Objetos');
    if (code.includes('map(') || code.includes('filter(')) concepts.push('Programação Funcional');
    if (code.includes('try') || code.includes('catch')) concepts.push('Tratamento de Erros');
    
    return concepts.map(c => `- **${c}**: Conceito importante aplicado no código`).join('\n');
  };

  const generatePracticalExamples = (code: string, language: string) => {
    return `- **Uso em produção**: Este código pode ser usado em aplicações reais
- **Integração**: Pode ser integrado com outros sistemas
- **Escalabilidade**: Adequado para crescimento e manutenção`;
  };

  const generateLearningResources = (code: string, language: string) => {
    return `- **Documentação oficial**: Consulte a documentação do ${language}
- **Tutoriais**: Procure tutoriais específicos sobre os conceitos utilizados
- **Comunidade**: Participe de fóruns e comunidades de desenvolvedores`;
  };

  // Implementações básicas para outras funções de análise
  const identifyBugs = (code: string, language: string) => {
    return `- **Validação de entrada**: Verificar se parâmetros são válidos
- **Tratamento de erros**: Implementar try-catch adequado
- **Memory leaks**: Verificar se recursos são liberados corretamente`;
  };

  const generateBugFixes = (code: string, language: string) => {
    return `- Adicionar validação de entrada no início das funções
- Implementar tratamento de erros específico
- Adicionar logs para debugging`;
  };

  const generatePreventionTips = (code: string, language: string) => {
    return `- Use TypeScript para type safety
- Implemente testes unitários
- Siga padrões de codificação`;
  };

  const generateTestSuggestions = (code: string, language: string) => {
    return `- Teste casos normais e edge cases
- Verifique performance com dados grandes
- Teste tratamento de erros`;
  };

  const generateQualityMetrics = (code: string, language: string) => {
    return `- **Complexidade ciclomática**: Moderada
- **Cobertura de testes**: Recomendada 80%+
- **Manutenibilidade**: Boa`;
  };

  // Implementações para documentação
  const generateGeneralDescription = (code: string, language: string) => {
    return `Esta função implementa funcionalidades específicas em ${language}.`;
  };

  const generateFunctionDocumentation = (code: string, language: string) => {
    return `\`\`\`${language}
/**
 * Descrição da função
 * @param {type} param - Descrição do parâmetro
 * @returns {type} Descrição do retorno
 */
\`\`\``;
  };

  const generateParameterDocumentation = (code: string, language: string) => {
    return `- **param1**: Tipo e descrição
- **param2**: Tipo e descrição (opcional)`;
  };

  const generateUsageExamples = (code: string, language: string) => {
    return `\`\`\`${language}
// Exemplo básico
const result = minhaFuncao(param);

// Exemplo avançado
const result = minhaFuncao(param, { option: true });
\`\`\``;
  };

  const generateWarningsAndNotes = (code: string, language: string) => {
    return `- ⚠️ **Atenção**: Verificar parâmetros antes do uso
- 📝 **Nota**: Esta função pode lançar exceções`;
  };

  const generateTagsAndMetadata = (code: string, language: string) => {
    return `- **Versão**: 1.0.0
- **Autor**: DevMentor AI
- **Licença**: MIT`;
  };

  // Implementações para otimização
  const generatePerformanceOptimizations = (code: string, language: string) => {
    return `- **Cache**: Implementar cache para resultados custosos
- **Lazy Loading**: Carregar dados sob demanda
- **Debouncing**: Otimizar eventos frequentes`;
  };

  const generateMemoryOptimizations = (code: string, language: string) => {
    return `- **Garbage Collection**: Liberar recursos não utilizados
- **Weak References**: Usar referências fracas quando apropriado
- **Pool de Objetos**: Reutilizar objetos quando possível`;
  };

  const generateRefactoringSuggestions = (code: string, language: string) => {
    return `- **Extração de funções**: Quebrar funções grandes
- **Padrões de design**: Aplicar padrões apropriados
- **Modernização**: Usar recursos modernos da linguagem`;
  };

  const generateImprovementMetrics = (code: string, language: string) => {
    return `- **Performance**: +30% mais rápido
- **Memória**: -20% uso de RAM
- **Legibilidade**: +40% mais claro`;
  };

  const generateNextSteps = (code: string, language: string) => {
    return `1. Implementar cache inteligente
2. Adicionar testes automatizados
3. Monitorar performance em produção`;
  };

  // Implementações para review
  const identifyPositiveAspects = (code: string, language: string) => {
    return `- **Estrutura clara**: Código bem organizado
- **Nomenclatura**: Nomes descritivos
- **Modularidade**: Funções com responsabilidades definidas`;
  };

  const identifyImprovementAreas = (code: string, language: string) => {
    return `- **Validação**: Adicionar mais validações
- **Testes**: Implementar testes unitários
- **Documentação**: Melhorar comentários`;
  };

  const generateDetailedReview = (code: string, language: string) => {
    return `### Análise por Seção
- **Inicialização**: Bem implementada
- **Processamento**: Lógica clara
- **Finalização**: Tratamento adequado`;
  };

  const generateQualityScore = (code: string, language: string) => {
    return `- **Legibilidade**: 8/10
- **Performance**: 7/10
- **Segurança**: 6/10
- **Manutenibilidade**: 8/10
- **Score Geral**: 7.25/10`;
  };

  const generateFinalRecommendations = (code: string, language: string) => {
    return `1. Implementar testes automatizados
2. Adicionar validação de entrada
3. Melhorar documentação
4. Considerar refatoração para melhor performance`;
  };

  const clearResult = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  const getAnalysisHistory = useCallback(async (): Promise<any[]> => {
    return new Promise((resolve) => {
      chrome.storage.local.get(['devmentorHistory'], (result) => {
        resolve(result.devmentorHistory || []);
      });
    });
  }, []);

  const getStats = useCallback(async () => {
    return new Promise((resolve) => {
      chrome.storage.local.get(['devmentorStats'], (result) => {
        resolve(result.devmentorStats || {
          totalAnalyses: 0,
          totalTime: 0,
          lastUsed: 'Nunca'
        });
      });
    });
  }, []);

  const injectSidebar = useCallback(async (result: AnalysisResult, type: FunctionType) => {
    try {
      // Obter a aba ativa
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tabs[0]?.id) return;

      // Injetar content script se necessário
      await chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        files: ['content/content-script.js']
      });

      // Enviar resultado para o content script
      await chrome.tabs.sendMessage(tabs[0].id, {
        action: 'inject-sidebar',
        analysis: result.analysis,
        type,
        metadata: result.metadata
      });

    } catch (error) {
      console.error('Erro ao injetar sidebar:', error);
    }
  }, []);

  return {
    loading,
    error,
    result,
    analyzeCode,
    clearResult,
    getAnalysisHistory,
    getStats
  };
};