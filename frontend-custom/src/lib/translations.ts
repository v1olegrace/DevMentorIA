// Sistema de localização para DevMentorAI
export interface Translations {
  // Header
  title: string;
  subtitle: string;
  projectLabel: string;
  codePlaceholder: string;
  
  // Buttons
  analyze: string;
  analyzing: string;
  save: string;
  load: string;
  
  // Messages
  pleaseEnterCode: string;
  analysisLoaded: string;
  analysisSaved: string;
  analysisCompleted: string;
  
  // Views
  analyzer: string;
  history: string;
  
  // Settings
  theme: string;
  language: string;
  light: string;
  dark: string;
  auto: string;
  system: string;
  
  // Languages
  portuguese: string;
  english: string;
  spanish: string;
  french: string;
  german: string;
  italian: string;
  japanese: string;
  chinese: string;
  
  // Shortcuts
  shortcutHint: string;
  
  // Errors
  error: string;
  success: string;
}

export const translations: Record<string, Translations> = {
  pt: {
    title: "Como posso ajudar você hoje?",
    subtitle: "Cole seu código ou faça uma pergunta",
    projectLabel: "Projeto",
    codePlaceholder: "Ex: Como otimizar este código? O que este código faz?",
    
    analyze: "Gerar Análise",
    analyzing: "Analisando código...",
    save: "Salvar",
    load: "Carregar",
    
    pleaseEnterCode: "Por favor, insira algum código para análise",
    analysisLoaded: "Análise carregada!",
    analysisSaved: "Análise salva com sucesso!",
    analysisCompleted: "Análise concluída!",
    
    analyzer: "Analisador",
    history: "Histórico",
    
    theme: "Tema",
    language: "Idioma",
    light: "Claro",
    dark: "Escuro",
    auto: "Automático",
    system: "Sistema",
    
    portuguese: "Português",
    english: "English",
    spanish: "Español",
    french: "Français",
    german: "Deutsch",
    italian: "Italiano",
    japanese: "日本語",
    chinese: "中文",
    
    shortcutHint: "Pressione Ctrl + Enter para analisar rapidamente",
    
    error: "Erro",
    success: "Sucesso"
  },
  
  en: {
    title: "How can I help you today?",
    subtitle: "Paste your code or ask a question",
    projectLabel: "Project",
    codePlaceholder: "Ex: How to optimize this code? What does this code do?",
    
    analyze: "Generate Analysis",
    analyzing: "Analyzing code...",
    save: "Save",
    load: "Load",
    
    pleaseEnterCode: "Please enter some code for analysis",
    analysisLoaded: "Analysis loaded!",
    analysisSaved: "Analysis saved successfully!",
    analysisCompleted: "Analysis completed!",
    
    analyzer: "Analyzer",
    history: "History",
    
    theme: "Theme",
    language: "Language",
    light: "Light",
    dark: "Dark",
    auto: "Auto",
    system: "System",
    
    portuguese: "Português",
    english: "English",
    spanish: "Español",
    french: "Français",
    german: "Deutsch",
    italian: "Italiano",
    japanese: "日本語",
    chinese: "中文",
    
    shortcutHint: "Press Ctrl + Enter to analyze quickly",
    
    error: "Error",
    success: "Success"
  },
  
  es: {
    title: "¿Cómo puedo ayudarte hoy?",
    subtitle: "Pega tu código o haz una pregunta",
    projectLabel: "Proyecto",
    codePlaceholder: "Ej: ¿Cómo optimizar este código? ¿Qué hace este código?",
    
    analyze: "Generar Análisis",
    analyzing: "Analizando código...",
    save: "Guardar",
    load: "Cargar",
    
    pleaseEnterCode: "Por favor, ingresa algún código para análisis",
    analysisLoaded: "¡Análisis cargado!",
    analysisSaved: "¡Análisis guardado con éxito!",
    analysisCompleted: "¡Análisis completado!",
    
    analyzer: "Analizador",
    history: "Historial",
    
    theme: "Tema",
    language: "Idioma",
    light: "Claro",
    dark: "Oscuro",
    auto: "Automático",
    system: "Sistema",
    
    portuguese: "Português",
    english: "English",
    spanish: "Español",
    french: "Français",
    german: "Deutsch",
    italian: "Italiano",
    japanese: "日本語",
    chinese: "中文",
    
    shortcutHint: "Presiona Ctrl + Enter para analizar rápidamente",
    
    error: "Error",
    success: "Éxito"
  }
};

export default translations;
