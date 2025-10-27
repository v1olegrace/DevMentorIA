// Servico para analisar a complexidade de problemas de codigo

import { ComplexityAnalysis, ProblemComplexity, AI_MODELS } from '@/types/ai-config';

interface CodeContext {
  code?: string;
  language?: string;
  action: 'explain' | 'debug' | 'refactor' | 'document' | 'optimize' | 'test';
  errorMessage?: string;
  context?: string;
}

export class ComplexityAnalyzer {
  /**
   * Analisa a complexidade de um problema de codigo
   */
  static analyze(context: CodeContext): ComplexityAnalysis {
    const { code = '', language = 'javascript', action, errorMessage = '', context: additionalContext = '' } = context;

    // Determinar categoria baseado na acao
    const category = this.determineCategory(action);

    // Calcular complexidade
    const complexity = this.calculateComplexity(code, language, action, errorMessage, additionalContext);

    // Estimar tokens necessarios
    const estimatedTokens = this.estimateTokens(code, additionalContext, complexity);

    // Recomendar modelos
    const recommendedModels = this.recommendModels(complexity, category, estimatedTokens);

    // Gerar raciocinio
    const reasoning = this.generateReasoning(complexity, category, code, action);

    return {
      complexity,
      category,
      estimatedTokens,
      recommendedModels,
      reasoning
    };
  }

  /**
   * Determina a categoria do problema
   */
  private static determineCategory(action: string): ComplexityAnalysis['category'] {
    const categoryMap: Record<string, ComplexityAnalysis['category']> = {
      'explain': 'documentation',
      'debug': 'debugging',
      'refactor': 'refactoring',
      'document': 'documentation',
      'optimize': 'refactoring',
      'test': 'debugging'
    };

    return categoryMap[action] || 'frontend';
  }

  /**
   * Calcula a complexidade do problema
   */
  private static calculateComplexity(
    code: string,
    language: string,
    action: string,
    errorMessage: string,
    context: string
  ): ProblemComplexity {
    let score = 0;

    // Tamanho do codigo (0-3 pontos)
    const lines = code.split('\n').length;
    if (lines > 200) score += 3;
    else if (lines > 100) score += 2;
    else if (lines > 50) score += 1;

    // Complexidade ciclomatica estimada (0-3 pontos)
    const ifCount = (code.match(/\b(if|else|switch|case)\b/g) || []).length;
    const loopCount = (code.match(/\b(for|while|do)\b/g) || []).length;
    const complexity = ifCount + loopCount * 2;
    if (complexity > 20) score += 3;
    else if (complexity > 10) score += 2;
    else if (complexity > 5) score += 1;

    // Tipo de acao (0-2 pontos)
    if (action === 'debug' && errorMessage) score += 2;
    else if (action === 'refactor' || action === 'optimize') score += 2;
    else if (action === 'explain') score += 1;

    // Frameworks/bibliotecas complexas (0-2 pontos)
    const complexFrameworks = /\b(react|vue|angular|typescript|graphql|nextjs|nestjs)\b/i;
    if (complexFrameworks.test(code) || complexFrameworks.test(context)) score += 2;

    // Padroes complexos (0-2 pontos)
    const complexPatterns = /\b(async|await|promise|callback|closure|decorator|generic)\b/i;
    if (complexPatterns.test(code)) score += 1;
    const veryComplexPatterns = /\b(rxjs|redux|mobx|websocket|webrtc|webgl)\b/i;
    if (veryComplexPatterns.test(code) || veryComplexPatterns.test(context)) score += 2;

    // Converter pontuacao em complexidade
    if (score >= 10) return 'expert';
    if (score >= 7) return 'complex';
    if (score >= 4) return 'medium';
    return 'simple';
  }

  /**
   * Estima tokens necessarios para a resposta
   */
  private static estimateTokens(code: string, context: string, complexity: ProblemComplexity): number {
    const baseTokens = Math.ceil((code.length + context.length) / 4); // ~4 chars por token

    const multipliers: Record<ProblemComplexity, number> = {
      simple: 1.5,
      medium: 2,
      complex: 3,
      expert: 4
    };

    return Math.ceil(baseTokens * multipliers[complexity]);
  }

  /**
   * Recomenda modelos baseado na complexidade e categoria
   */
  private static recommendModels(
    complexity: ProblemComplexity,
    category: ComplexityAnalysis['category'],
    estimatedTokens: number
  ): string[] {
    const models = Object.values(AI_MODELS);

    // Filtrar modelos adequados para a complexidade
    const complexityOrder: ProblemComplexity[] = ['simple', 'medium', 'complex', 'expert'];
    const minComplexityIndex = complexityOrder.indexOf(complexity);

    const suitableModels = models.filter(model => {
      const modelComplexityIndex = complexityOrder.indexOf(model.minComplexity);
      return modelComplexityIndex <= minComplexityIndex && model.maxTokens >= estimatedTokens;
    });

    // Ordenar por forca na categoria especifica
    const sorted = suitableModels.sort((a, b) => {
      const scoreA = a.strengths[category] - (a.costPerToken * 1000000); // Considerar custo
      const scoreB = b.strengths[category] - (b.costPerToken * 1000000);
      return scoreB - scoreA;
    });

    // Retornar top 3 modelos
    return sorted.slice(0, 3).map(m => m.id);
  }

  /**
   * Gera raciocinio da analise
   */
  private static generateReasoning(
    complexity: ProblemComplexity,
    category: string,
    code: string,
    action: string
  ): string {
    const lines = code.split('\n').length;
    const reasons: string[] = [];

    // Complexidade
    const complexityMessages: Record<ProblemComplexity, string> = {
      simple: 'Problema simples que pode ser resolvido com modelos mais rapidos e economicos.',
      medium: 'Problema de complexidade media que requer um modelo balanceado.',
      complex: 'Problema complexo que requer um modelo mais poderoso.',
      expert: 'Problema muito complexo que requer os modelos mais avancados disponiveis.'
    };
    reasons.push(complexityMessages[complexity]);

    // Tamanho
    if (lines > 100) {
      reasons.push(`Codigo extenso (${lines} linhas) requer contexto maior.`);
    }

    // Categoria
    const categoryMessages: Record<string, string> = {
      frontend: 'Otimizado para desenvolvimento frontend (React, Vue, etc).',
      backend: 'Otimizado para desenvolvimento backend e arquitetura.',
      debugging: 'Otimizado para analise de erros e debugging.',
      refactoring: 'Otimizado para refatoracao e melhoria de codigo.',
      documentation: 'Otimizado para explicacoes e documentacao.'
    };
    reasons.push(categoryMessages[category] || '');

    return reasons.filter(Boolean).join(' ');
  }

  /**
   * Detecta a linguagem do codigo
   */
  static detectLanguage(code: string): string {
    // Detectar React/JSX
    if (/<[A-Z][a-zA-Z]*[\s/>]/.test(code) || /import.*from\s+['"]react['"]/.test(code)) {
      return 'react';
    }

    // Detectar TypeScript
    if (/:\s*\w+(\[\])?[;,)]/.test(code) || /interface\s+\w+/.test(code)) {
      return 'typescript';
    }

    // Detectar Python
    if (/def\s+\w+\s*\(/.test(code) || /import\s+\w+/.test(code) && /:\s*$/.test(code)) {
      return 'python';
    }

    // Detectar Java
    if (/public\s+(class|interface)/.test(code) || /System\.out\.println/.test(code)) {
      return 'java';
    }

    // Detectar CSS/SCSS
    if (/\{[^}]*:[^}]*;[^}]*\}/.test(code) && !/function/.test(code)) {
      return 'css';
    }

    // Default: JavaScript
    return 'javascript';
  }
}
