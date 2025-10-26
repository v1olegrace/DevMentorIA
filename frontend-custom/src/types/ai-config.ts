// Tipos para configuração de IA com múltiplas keys

export type AIProvider = 'openai' | 'anthropic' | 'google';

export type ProblemComplexity = 'simple' | 'medium' | 'complex' | 'expert';

export interface AIModel {
  id: string;
  name: string;
  provider: AIProvider;
  maxTokens: number;
  costPerToken: number;
  // Força do modelo para diferentes tipos de problemas
  strengths: {
    frontend: number; // 1-10
    backend: number; // 1-10
    debugging: number; // 1-10
    refactoring: number; // 1-10
    documentation: number; // 1-10
  };
  // Complexidade mínima recomendada
  minComplexity: ProblemComplexity;
}

export interface APIKey {
  id: string;
  key: string;
  provider: AIProvider;
  model: string; // ID do modelo
  enabled: boolean;
  // Monitoramento de uso
  usage: {
    tokensUsed: number;
    tokensLimit: number;
    requestsToday: number;
    lastUsed?: Date;
  };
  // Prioridade (1-10, maior = mais prioridade)
  priority: number;
}

export interface AISettings {
  apiKeys: APIKey[];
  autoSelection: boolean; // Selecionar automaticamente baseado em complexidade
  fallbackEnabled: boolean; // Usar fallback quando uma key falhar
  preferredModels: {
    frontend: string[]; // IDs dos modelos preferidos para frontend
    backend: string[];
    debugging: string[];
    refactoring: string[];
    documentation: string[];
  };
}

export interface ComplexityAnalysis {
  complexity: ProblemComplexity;
  category: 'frontend' | 'backend' | 'debugging' | 'refactoring' | 'documentation';
  estimatedTokens: number;
  recommendedModels: string[]; // IDs dos modelos recomendados
  reasoning: string; // Explicação da análise
}

// Modelos disponíveis
export const AI_MODELS: Record<string, AIModel> = {
  // OpenAI
  'gpt-4-turbo': {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'openai',
    maxTokens: 128000,
    costPerToken: 0.00003,
    strengths: {
      frontend: 9,
      backend: 10,
      debugging: 9,
      refactoring: 9,
      documentation: 8
    },
    minComplexity: 'complex'
  },
  'gpt-4': {
    id: 'gpt-4',
    name: 'GPT-4',
    provider: 'openai',
    maxTokens: 8192,
    costPerToken: 0.00006,
    strengths: {
      frontend: 9,
      backend: 10,
      debugging: 9,
      refactoring: 9,
      documentation: 8
    },
    minComplexity: 'medium'
  },
  'gpt-3.5-turbo': {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    provider: 'openai',
    maxTokens: 16385,
    costPerToken: 0.000002,
    strengths: {
      frontend: 7,
      backend: 7,
      debugging: 6,
      refactoring: 7,
      documentation: 8
    },
    minComplexity: 'simple'
  },

  // Anthropic
  'claude-3-opus': {
    id: 'claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'anthropic',
    maxTokens: 200000,
    costPerToken: 0.000075,
    strengths: {
      frontend: 10,
      backend: 10,
      debugging: 10,
      refactoring: 10,
      documentation: 9
    },
    minComplexity: 'expert'
  },
  'claude-3-sonnet': {
    id: 'claude-3-sonnet',
    name: 'Claude 3 Sonnet',
    provider: 'anthropic',
    maxTokens: 200000,
    costPerToken: 0.000015,
    strengths: {
      frontend: 9,
      backend: 9,
      debugging: 9,
      refactoring: 9,
      documentation: 9
    },
    minComplexity: 'medium'
  },
  'claude-3-haiku': {
    id: 'claude-3-haiku',
    name: 'Claude 3 Haiku',
    provider: 'anthropic',
    maxTokens: 200000,
    costPerToken: 0.000001,
    strengths: {
      frontend: 7,
      backend: 7,
      debugging: 7,
      refactoring: 8,
      documentation: 8
    },
    minComplexity: 'simple'
  },

  // Google
  'gemini-1.5-pro': {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'google',
    maxTokens: 1000000,
    costPerToken: 0.0000035,
    strengths: {
      frontend: 9,
      backend: 9,
      debugging: 8,
      refactoring: 8,
      documentation: 9
    },
    minComplexity: 'medium'
  },
  'gemini-1.5-flash': {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    provider: 'google',
    maxTokens: 1000000,
    costPerToken: 0.00000035,
    strengths: {
      frontend: 8,
      backend: 7,
      debugging: 7,
      refactoring: 7,
      documentation: 8
    },
    minComplexity: 'simple'
  },
  'gemini-pro': {
    id: 'gemini-pro',
    name: 'Gemini Pro',
    provider: 'google',
    maxTokens: 30720,
    costPerToken: 0.000001,
    strengths: {
      frontend: 7,
      backend: 7,
      debugging: 6,
      refactoring: 6,
      documentation: 7
    },
    minComplexity: 'simple'
  }
};

// Pesos de complexidade para análise
export const COMPLEXITY_WEIGHTS = {
  simple: 1,
  medium: 2,
  complex: 4,
  expert: 8
};
