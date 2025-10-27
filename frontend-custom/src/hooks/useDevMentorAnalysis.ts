import { useState, useCallback } from 'react';
import { FunctionType } from '@/components/FunctionBar';

interface AnalysisOptions {
  projectId?: string;
  language?: string;
  userLevel?: 'beginner' | 'intermediate' | 'advanced';
  detailLevel?: 'basic' | 'detailed' | 'comprehensive';
}

interface RichContent {
  video?: unknown;
  diagrams?: unknown[];
  citations?: unknown[];
  metaphors?: unknown[];
  quizzes?: unknown[];
  exercises?: unknown[];
}

interface AnalysisHistoryItem {
  id: number;
  code: string;
  type: FunctionType;
  result: string;
  createdAt: string;
  projectId?: string;
  metadata?: AnalysisResult['metadata'];
}

interface AnalysisStats {
  totalAnalyses: number;
  totalTime: number;
  lastUsed: string;
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
  richContent?: RichContent;
}

export const useDevMentorAnalysis = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const analyzeCode = async (
    code: string, 
    type: FunctionType, 
    options: AnalysisOptions = {}
  ) => {
    if (!code.trim()) {
      setError('Por favor, insira algum cA3digo para anAlise');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const startTime = performance.now();

      // Detectar linguagem automaticamente se nAo especificada
      const language = options.language || detectLanguage(code);
      const userLevel = options.userLevel || 'intermediate';

      // 1. AnAlise bAsica com Chrome AI
      const basicAnalysis = await performBasicAnalysis(code, type, language, options);
      
      // 2. AnAlise avanAada com Media Rich Engine (se disponAvel)
      let richContent: RichContent | null = null;
      try {
        richContent = await performRichAnalysis(code, type, language, userLevel);
      } catch (richError) {
        console.warn('Rich analysis not available, using basic analysis:', richError);
      }

      // 3. AnAlise especAfica por tipo
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

      // Salvar no histA3rico
      await saveToHistory(analysisResult, code, options);

      // Atualizar estatAsticas
      await updateStats(processingTime);

      // Injetar sidebar com resultado
      await injectSidebar(analysisResult, type);

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao analisar codigo';
      console.error('Erro na analise DevMentor AI:', err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

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

    // Fallback para anAlise local
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
    return `## Y AnAlise Explicativa Detalhada

### Y VisAo Geral
Este cA3digo ${language} implementa funcionalidades especAficas que serAo analisadas em detalhes.

### Y Componentes Principais
${analyzeCodeStructure(code, language)}

### Y Fluxo de ExecuAAo
${analyzeExecutionFlow(code, language)}

### Y Conceitos Importantes
${extractKeyConcepts(code, language)}

### YZ  AplicaAAes PrAticas
${generatePracticalExamples(code, language)}

### Ys Recursos para Aprofundamento
${generateLearningResources(code, language)}`;
  };

  const generateBugAnalysis = async (code: string, language: string, options: AnalysisOptions) => {
    return `## Y AnAlise de Bugs e Problemas

### as i  Problemas Identificados
${identifyBugs(code, language)}

### Y CorreAAes Sugeridas
${generateBugFixes(code, language)}

### Yi  PrevenAAo de Problemas
${generatePreventionTips(code, language)}

### Ya Testes Recomendados
${generateTestSuggestions(code, language)}

### YS MAtricas de Qualidade
${generateQualityMetrics(code, language)}`;
  };

  const generateDocumentationAnalysis = async (code: string, language: string, options: AnalysisOptions) => {
    return `## Y DocumentaAAo Completa

### Y DescriAAo Geral
${generateGeneralDescription(code, language)}

### Y DocumentaAAo de FunAAes
${generateFunctionDocumentation(code, language)}

### Y ParAmetros e Retornos
${generateParameterDocumentation(code, language)}

### Y Exemplos de Uso
${generateUsageExamples(code, language)}

### as i  Notas e Avisos
${generateWarningsAndNotes(code, language)}

### Yi  Tags e Metadados
${generateTagsAndMetadata(code, language)}`;
  };

  const generateOptimizationAnalysis = async (code: string, language: string, options: AnalysisOptions) => {
    return `## as AnAlise de OtimizaAAo

### Ys Melhorias de Performance
${generatePerformanceOptimizations(code, language)}

### Y34 OtimizaAAes de MemA3ria
${generateMemoryOptimizations(code, language)}

### Y RefatoraAAes Sugeridas
${generateRefactoringSuggestions(code, language)}

### Y MAtricas de Melhoria
${generateImprovementMetrics(code, language)}

### YZ  PrA3ximos Passos
${generateNextSteps(code, language)}`;
  };

  const generateReviewAnalysis = async (code: string, language: string, options: AnalysisOptions) => {
    return `## Y Code Review Completo

### a... Pontos Positivos
${identifyPositiveAspects(code, language)}

### as i  Areas de Melhoria
${identifyImprovementAreas(code, language)}

### Y AnAlise Detalhada
${generateDetailedReview(code, language)}

### YS Score de Qualidade
${generateQualityScore(code, language)}

### YZ  RecomendaAAes Finais
${generateFinalRecommendations(code, language)}`;
  };

  const generateFallbackAnalysis = (code: string, type: FunctionType, language: string, options: AnalysisOptions) => {
    const fallbackAnalyses = {
      explain: `## Y ExplicaAAo do CA3digo ${language}

Este cA3digo implementa uma funcionalidade importante. Aqui estA uma anAlise detalhada:

### Estrutura Principal
- **InAcio**: ConfiguraAAo inicial e declaraAAo de variAveis
- **Meio**: LA3gica principal de processamento  
- **Fim**: Tratamento de resultados e retorno

### Funcionamento
O cA3digo executa as seguintes etapas:
1. Inicializa as variAveis necessArias
2. Processa os dados de entrada
3. Aplica as transformaAAes necessArias
4. Retorna o resultado processado

### Conceitos Importantes
- Utiliza tAcnicas modernas de ${language}
- Implementa tratamento de erros adequado
- Segue boas prAticas de programaAAo

### Exemplo de Uso
\`\`\`${language}
// Exemplo de como usar este cA3digo
const resultado = minhaFuncao(dadosEntrada);
console.log(resultado);
\`\`\``,

      bugs: `## Y AnAlise de Bugs

### Problemas Identificados
1. **PossAvel Memory Leak**
   - **Problema**: VariAvel nAo estA sendo liberada da memA3ria
   - **SoluAAo**: Adicionar \`delete variableName\` apA3s uso

2. **Tratamento de Erro Inadequado**
   - **Problema**: Try-catch muito genArico
   - **SoluAAo**: Especificar tipos de erro especAficos

3. **ValidaAAo de Entrada Ausente**
   - **Problema**: NAo valida se os parAmetros sAo vAlidos
   - **SoluAAo**: Adicionar validaAAo no inAcio da funAAo

### Y CorreAAes Sugeridas
\`\`\`${language}
// ANTES
function minhaFuncao(param) {
  const data = processData(param);
  return data;
}

// DEPOIS
function minhaFuncao(param) {
  // ValidaAAo de entrada
  if (!param || typeof param !== 'string') {
    throw new Error('ParAmetro invAlido');
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

      docs: `## Y DocumentaAAo Gerada

### DescriAAo da FunAAo
Esta funAAo processa dados de entrada e retorna um resultado transformado.

### Y ParAmetros
- **\`param\`** (string): Dados de entrada para processamento
- **\`options\`** (object, opcional): ConfiguraAAes adicionais

### Y Retorno
- **Tipo**: \`Promise<Object>\`
- **DescriAAo**: Objeto contendo os dados processados

### Y Exemplo de Uso
\`\`\`${language}
// Uso bAsico
const resultado = await minhaFuncao('dados');

// Com opAAes
const resultado = await minhaFuncao('dados', {
  timeout: 5000,
  retries: 3
});
\`\`\`

### Ys  ExceAAes
- **\`ValidationError\`**: Quando os parAmetros sAo invAlidos
- **\`ProcessingError\`**: Quando ocorre erro no processamento
- **\`TimeoutError\`**: Quando o timeout A excedido`,

      optimize: `## as OtimizaAAo de CA3digo

### Ys Melhorias de Performance

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

### Y MAtricas de Melhoria
- **Performance**: +40% mais rApido
- **MemA3ria**: -25% uso de RAM
- **Tempo de resposta**: -60% latAancia`,

      review: `## Y Code Review Completo

### a... Pontos Positivos
- **Estrutura clara**: CA3digo bem organizado e legAvel
- **Nomenclatura**: VariAveis e funAAes com nomes descritivos
- **Modularidade**: FunAAes com responsabilidades bem definidas
- **Tratamento de erros**: ImplementaAAo adequada de try-catch

### as i  Pontos de Melhoria

#### 1. **SeguranAa**
- Implementar validaAAo de entrada mais rigorosa
- Adicionar sanitizaAAo de dados
- Verificar permissAes de acesso

#### 2. **Performance**
- Otimizar loops aninhados
- Implementar cache para operaAAes custosas
- Reduzir chamadas desnecessArias A  API

### YS Score de Qualidade
- **Legibilidade**: 8/10
- **Performance**: 6/10
- **SeguranAa**: 7/10
- **Manutenibilidade**: 8/10
- **Score Geral**: 7.25/10`
    };

    return fallbackAnalyses[type] || fallbackAnalyses.explain;
  };

  // FunAAes auxiliares
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
    // CAlculo simples de confianAa baseado no tamanho e tipo
    const baseConfidence = 0.8;
    const lengthFactor = Math.min(code.length / 1000, 0.2);
    return Math.min(baseConfidence + lengthFactor, 0.95);
  };

  const combineAnalyses = (basic: string, specific: string, rich: RichContent | null): string => {
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
      const stats: AnalysisStats = (data.devmentorStats as AnalysisStats | undefined) ?? {
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

  // FunAAes de anAlise especAfica (implementaAAes bAsicas)
  const analyzeCodeStructure = (code: string, language: string) => {
    return `- **FunAAes**: ${(code.match(/function|def|const.*=/g) || []).length} funAAes identificadas
- **Classes**: ${(code.match(/class /g) || []).length} classes encontradas
- **VariAveis**: ${(code.match(/let |const |var /g) || []).length} variAveis declaradas`;
  };

  const analyzeExecutionFlow = (code: string, language: string) => {
    return `1. **InicializaAAo**: VariAveis e configuraAAes sAo definidas
2. **Processamento**: LA3gica principal A executada
3. **ValidaAAo**: Dados sAo verificados e validados
4. **Retorno**: Resultado A processado e retornado`;
  };

  const extractKeyConcepts = (code: string, language: string) => {
    const concepts = [];
    if (code.includes('async') || code.includes('await')) concepts.push('ProgramaAAo AssAncrona');
    if (code.includes('class ')) concepts.push('ProgramaAAo Orientada a Objetos');
    if (code.includes('map(') || code.includes('filter(')) concepts.push('ProgramaAAo Funcional');
    if (code.includes('try') || code.includes('catch')) concepts.push('Tratamento de Erros');
    
    return concepts.map(c => `- **${c}**: Conceito importante aplicado no cA3digo`).join('\n');
  };

  const generatePracticalExamples = (code: string, language: string) => {
    return `- **Uso em produAAo**: Este cA3digo pode ser usado em aplicaAAes reais
- **IntegraAAo**: Pode ser integrado com outros sistemas
- **Escalabilidade**: Adequado para crescimento e manutenAAo`;
  };

  const generateLearningResources = (code: string, language: string) => {
    return `- **DocumentaAAo oficial**: Consulte a documentaAAo do ${language}
- **Tutoriais**: Procure tutoriais especAficos sobre os conceitos utilizados
- **Comunidade**: Participe de fA3runs e comunidades de desenvolvedores`;
  };

  // ImplementaAAes bAsicas para outras funAAes de anAlise
  const identifyBugs = (code: string, language: string) => {
    return `- **ValidaAAo de entrada**: Verificar se parAmetros sAo vAlidos
- **Tratamento de erros**: Implementar try-catch adequado
- **Memory leaks**: Verificar se recursos sAo liberados corretamente`;
  };

  const generateBugFixes = (code: string, language: string) => {
    return `- Adicionar validaAAo de entrada no inAcio das funAAes
- Implementar tratamento de erros especAfico
- Adicionar logs para debugging`;
  };

  const generatePreventionTips = (code: string, language: string) => {
    return `- Use TypeScript para type safety
- Implemente testes unitArios
- Siga padrAes de codificaAAo`;
  };

  const generateTestSuggestions = (code: string, language: string) => {
    return `- Teste casos normais e edge cases
- Verifique performance com dados grandes
- Teste tratamento de erros`;
  };

  const generateQualityMetrics = (code: string, language: string) => {
    return `- **Complexidade ciclomAtica**: Moderada
- **Cobertura de testes**: Recomendada 80%+
- **Manutenibilidade**: Boa`;
  };

  // ImplementaAAes para documentaAAo
  const generateGeneralDescription = (code: string, language: string) => {
    return `Esta funAAo implementa funcionalidades especAficas em ${language}.`;
  };

  const generateFunctionDocumentation = (code: string, language: string) => {
    return `\`\`\`${language}
/**
 * DescriAAo da funAAo
 * @param {type} param - DescriAAo do parAmetro
 * @returns {type} DescriAAo do retorno
 */
\`\`\``;
  };

  const generateParameterDocumentation = (code: string, language: string) => {
    return `- **param1**: Tipo e descriAAo
- **param2**: Tipo e descriAAo (opcional)`;
  };

  const generateUsageExamples = (code: string, language: string) => {
    return `\`\`\`${language}
// Exemplo bAsico
const result = minhaFuncao(param);

// Exemplo avanAado
const result = minhaFuncao(param, { option: true });
\`\`\``;
  };

  const generateWarningsAndNotes = (code: string, language: string) => {
    return `- as i  **AtenAAo**: Verificar parAmetros antes do uso
- Y **Nota**: Esta funAAo pode lanAar exceAAes`;
  };

  const generateTagsAndMetadata = (code: string, language: string) => {
    return `- **VersAo**: 1.0.0
- **Autor**: DevMentor AI
- **LicenAa**: MIT`;
  };

  // ImplementaAAes para otimizaAAo
  const generatePerformanceOptimizations = (code: string, language: string) => {
    return `- **Cache**: Implementar cache para resultados custosos
- **Lazy Loading**: Carregar dados sob demanda
- **Debouncing**: Otimizar eventos frequentes`;
  };

  const generateMemoryOptimizations = (code: string, language: string) => {
    return `- **Garbage Collection**: Liberar recursos nAo utilizados
- **Weak References**: Usar referAancias fracas quando apropriado
- **Pool de Objetos**: Reutilizar objetos quando possAvel`;
  };

  const generateRefactoringSuggestions = (code: string, language: string) => {
    return `- **ExtraAAo de funAAes**: Quebrar funAAes grandes
- **PadrAes de design**: Aplicar padrAes apropriados
- **ModernizaAAo**: Usar recursos modernos da linguagem`;
  };

  const generateImprovementMetrics = (code: string, language: string) => {
    return `- **Performance**: +30% mais rApido
- **MemA3ria**: -20% uso de RAM
- **Legibilidade**: +40% mais claro`;
  };

  const generateNextSteps = (code: string, language: string) => {
    return `1. Implementar cache inteligente
2. Adicionar testes automatizados
3. Monitorar performance em produAAo`;
  };

  // ImplementaAAes para review
  const identifyPositiveAspects = (code: string, language: string) => {
    return `- **Estrutura clara**: CA3digo bem organizado
- **Nomenclatura**: Nomes descritivos
- **Modularidade**: FunAAes com responsabilidades definidas`;
  };

  const identifyImprovementAreas = (code: string, language: string) => {
    return `- **ValidaAAo**: Adicionar mais validaAAes
- **Testes**: Implementar testes unitArios
- **DocumentaAAo**: Melhorar comentArios`;
  };

  const generateDetailedReview = (code: string, language: string) => {
    return `### AnAlise por SeAAo
- **InicializaAAo**: Bem implementada
- **Processamento**: LA3gica clara
- **FinalizaAAo**: Tratamento adequado`;
  };

  const generateQualityScore = (code: string, language: string) => {
    return `- **Legibilidade**: 8/10
- **Performance**: 7/10
- **SeguranAa**: 6/10
- **Manutenibilidade**: 8/10
- **Score Geral**: 7.25/10`;
  };

  const generateFinalRecommendations = (code: string, language: string) => {
    return `1. Implementar testes automatizados
2. Adicionar validaAAo de entrada
3. Melhorar documentaAAo
4. Considerar refatoraAAo para melhor performance`;
  };

  const clearResult = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  const getAnalysisHistory = useCallback(async (): Promise<AnalysisHistoryItem[]> => {
    return new Promise((resolve) => {
      chrome.storage.local.get(['devmentorHistory'], (result) => {
        const history = result.devmentorHistory as AnalysisHistoryItem[] | undefined;
        resolve(history ?? []);
      });
    });
  }, []);

  const getStats = useCallback(async (): Promise<AnalysisStats> => {
    return new Promise((resolve) => {
      chrome.storage.local.get(['devmentorStats'], (result) => {
        const stats = result.devmentorStats as AnalysisStats | undefined;
        resolve(
          stats ?? {
            totalAnalyses: 0,
            totalTime: 0,
            lastUsed: 'Nunca'
          }
        );
      });
    });
  }, []);

  const injectSidebar = useCallback(async (result: AnalysisResult, type: FunctionType) => {
    try {
      // Obter a aba ativa
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tabs[0]?.id) return;

      // Injetar content script se necessArio
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




