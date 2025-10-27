/**
 * i18n Configuration for DevMentor AI
 * Multilingual support for UI
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translation resources
const resources = {
  'pt-BR': {
    translation: {
      // Common
      common: {
        loading: 'Carregando...',
        error: 'Erro',
        success: 'Sucesso',
        cancel: 'Cancelar',
        save: 'Salvar',
        close: 'Fechar',
        back: 'Voltar',
        next: 'Próximo',
        search: 'Buscar',
        settings: 'Configurações'
      },

      // Popup
      popup: {
        title: 'DevMentor AI',
        subtitle: 'Assistente de Código com IA',
        searchPlaceholder: 'Faça sua pergunta...',
        analyzeButton: 'Analisar Código Selecionado',
        analyzing: 'Analisando...',
        selectCode: 'Selecione código na página',
        chooseAnalysis: 'Escolha o tipo de análise:',
        shortcuts: 'Atalhos',
        history: 'Histórico',
        analytics: 'Analytics'
      },

      // Functions
      functions: {
        explain: 'Explicar',
        bugs: 'Bugs',
        docs: 'Docs',
        optimize: 'Otimizar',
        review: 'Revisar',
        refactor: 'Refatorar',
        translate: 'Traduzir',
        test: 'Testar'
      },

      // AI Status
      aiStatus: {
        ready: 'IA Pronta',
        unavailable: 'IA Indisponível',
        initializing: 'Inicializando...',
        error: 'Erro na IA'
      },

      // Gamification
      gamification: {
        level: 'Nível',
        xp: 'XP',
        nextLevel: 'Próximo Nível',
        badges: 'Emblemas',
        achievements: 'Conquistas',
        streak: 'Sequência',
        challenges: 'Desafios',
        leaderboard: 'Ranking',
        rewards: 'Recompensas',
        skills: 'Habilidades',
        progress: 'Progresso'
      },

      // Settings
      settings: {
        title: 'Configurações',
        subtitle: 'Configure o DevMentor de acordo com suas preferências',

        // Tabs
        tabs: {
          api: 'API Keys',
          interface: 'Interface',
          analysis: 'Análise',
          languages: 'Linguagens',
          account: 'Conta',
          advanced: 'Avançado',
          github: 'GitHub'
        },

        // API
        api: {
          title: 'Configuração de Tokens',
          description: 'Configure seus tokens para integrações externas',
          github: 'GitHub Token',
          testConnection: 'Testar Conexão'
        },

        // Interface
        interface: {
          theme: 'Tema',
          language: 'Idioma',
          fontSize: 'Tamanho da Fonte',
          showLineNumbers: 'Mostrar números de linha',
          autoSave: 'Salvar automaticamente',
          animations: 'Animações',
          soundEffects: 'Efeitos Sonoros'
        },

        // Languages
        languages: {
          title: 'Linguagens de Programação',
          description: 'Selecione as linguagens que você quer analisar',
          selectAll: 'Selecionar Todas',
          deselectAll: 'Desmarcar Todas',
          popular: 'Populares',
          all: 'Todas'
        },

        // Analysis
        analysis: {
          maxTokens: 'Máximo de Tokens',
          temperature: 'Temperatura',
          timeout: 'Timeout (segundos)',
          autoAnalyze: 'Análise automática ao colar código',
          detailLevel: 'Nível de Detalhes',
          includeExamples: 'Incluir Exemplos',
          codeStyle: 'Estilo de Código'
        },

        // Advanced
        advanced: {
          debugMode: 'Modo Debug',
          logLevel: 'Nível de Log',
          cacheEnabled: 'Habilitar cache',
          experimentalFeatures: 'Funcionalidades experimentais',
          exportSettings: 'Exportar Configurações',
          importSettings: 'Importar Configurações',
          resetSettings: 'Resetar Configurações'
        }
      },

      // Storytelling
      storytelling: {
        title: 'Modo Storytelling',
        subtitle: 'Aprenda código através de histórias',
        start: 'Iniciar História',
        continue: 'Continuar',
        restart: 'Recomeçar',
        chapter: 'Capítulo',
        scene: 'Cena',
        character: 'Personagem',
        narration: 'Narração'
      },

      // GitHub Integration
      github: {
        title: 'Integração GitHub',
        searchRepo: 'Buscar Repositório',
        repoInfo: 'Informações do Repositório',
        similarCode: 'Código Similar',
        popularPatterns: 'Padrões Populares',
        stars: 'Estrelas',
        forks: 'Forks',
        language: 'Linguagem',
        license: 'Licença',
        topics: 'Tópicos'
      },

      // Messages
      messages: {
        codeSelected: 'Código selecionado',
        analysisComplete: 'Análise concluída! Verifique o resultado na página.',
        error: 'Erro ao processar análise',
        noCode: 'Por favor, selecione algum código na página primeiro',
        settingsSaved: 'Configurações salvas com sucesso',
        githubConnected: 'GitHub conectado com sucesso',
        tokenRequired: 'Token necessário para esta ação'
      }
    }
  },

  'en-US': {
    translation: {
      // Common
      common: {
        loading: 'Loading...',
        error: 'Error',
        success: 'Success',
        cancel: 'Cancel',
        save: 'Save',
        close: 'Close',
        back: 'Back',
        next: 'Next',
        search: 'Search',
        settings: 'Settings'
      },

      // Popup
      popup: {
        title: 'DevMentor AI',
        subtitle: 'AI-powered Code Assistant',
        searchPlaceholder: 'Ask your question...',
        analyzeButton: 'Analyze Selected Code',
        analyzing: 'Analyzing...',
        selectCode: 'Select code on the page',
        chooseAnalysis: 'Choose analysis type:',
        shortcuts: 'Shortcuts',
        history: 'History',
        analytics: 'Analytics'
      },

      // Functions
      functions: {
        explain: 'Explain',
        bugs: 'Bugs',
        docs: 'Docs',
        optimize: 'Optimize',
        review: 'Review',
        refactor: 'Refactor',
        translate: 'Translate',
        test: 'Test'
      },

      // AI Status
      aiStatus: {
        ready: 'AI Ready',
        unavailable: 'AI Unavailable',
        initializing: 'Initializing...',
        error: 'AI Error'
      },

      // Gamification
      gamification: {
        level: 'Level',
        xp: 'XP',
        nextLevel: 'Next Level',
        badges: 'Badges',
        achievements: 'Achievements',
        streak: 'Streak',
        challenges: 'Challenges',
        leaderboard: 'Leaderboard',
        rewards: 'Rewards',
        skills: 'Skills',
        progress: 'Progress'
      },

      // Settings
      settings: {
        title: 'Settings',
        subtitle: 'Configure DevMentor according to your preferences',

        // Tabs
        tabs: {
          api: 'API Keys',
          interface: 'Interface',
          analysis: 'Analysis',
          languages: 'Languages',
          account: 'Account',
          advanced: 'Advanced',
          github: 'GitHub'
        },

        // API
        api: {
          title: 'Token Configuration',
          description: 'Configure your tokens for external integrations',
          github: 'GitHub Token',
          testConnection: 'Test Connection'
        },

        // Interface
        interface: {
          theme: 'Theme',
          language: 'Language',
          fontSize: 'Font Size',
          showLineNumbers: 'Show line numbers',
          autoSave: 'Auto save',
          animations: 'Animations',
          soundEffects: 'Sound Effects'
        },

        // Languages
        languages: {
          title: 'Programming Languages',
          description: 'Select languages you want to analyze',
          selectAll: 'Select All',
          deselectAll: 'Deselect All',
          popular: 'Popular',
          all: 'All'
        },

        // Analysis
        analysis: {
          maxTokens: 'Max Tokens',
          temperature: 'Temperature',
          timeout: 'Timeout (seconds)',
          autoAnalyze: 'Auto analyze on paste',
          detailLevel: 'Detail Level',
          includeExamples: 'Include Examples',
          codeStyle: 'Code Style'
        },

        // Advanced
        advanced: {
          debugMode: 'Debug Mode',
          logLevel: 'Log Level',
          cacheEnabled: 'Enable cache',
          experimentalFeatures: 'Experimental features',
          exportSettings: 'Export Settings',
          importSettings: 'Import Settings',
          resetSettings: 'Reset Settings'
        }
      },

      // Storytelling
      storytelling: {
        title: 'Storytelling Mode',
        subtitle: 'Learn code through stories',
        start: 'Start Story',
        continue: 'Continue',
        restart: 'Restart',
        chapter: 'Chapter',
        scene: 'Scene',
        character: 'Character',
        narration: 'Narration'
      },

      // GitHub Integration
      github: {
        title: 'GitHub Integration',
        searchRepo: 'Search Repository',
        repoInfo: 'Repository Information',
        similarCode: 'Similar Code',
        popularPatterns: 'Popular Patterns',
        stars: 'Stars',
        forks: 'Forks',
        language: 'Language',
        license: 'License',
        topics: 'Topics'
      },

      // Messages
      messages: {
        codeSelected: 'Code selected',
        analysisComplete: 'Analysis complete! Check the result on the page.',
        error: 'Error processing analysis',
        noCode: 'Please select some code on the page first',
        settingsSaved: 'Settings saved successfully',
        githubConnected: 'GitHub connected successfully',
        tokenRequired: 'Token required for this action'
      }
    }
  },

  'es-ES': {
    translation: {
      common: {
        loading: 'Cargando...',
        error: 'Error',
        success: 'Éxito',
        cancel: 'Cancelar',
        save: 'Guardar',
        close: 'Cerrar',
        back: 'Volver',
        next: 'Siguiente',
        search: 'Buscar',
        settings: 'Configuración'
      },
      popup: {
        title: 'DevMentor AI',
        subtitle: 'Asistente de Código con IA',
        searchPlaceholder: 'Haz tu pregunta...',
        analyzeButton: 'Analizar Código',
        analyzing: 'Analizando...',
        selectCode: 'Selecciona código',
        chooseAnalysis: 'Tipo de análisis:',
        shortcuts: 'Atajos',
        history: 'Historial',
        analytics: 'Analíticas'
      },
      functions: { explain: 'Explicar', bugs: 'Errores', docs: 'Docs', optimize: 'Optimizar', review: 'Revisar' },
      aiStatus: { ready: 'IA Lista', unavailable: 'IA No Disponible', initializing: 'Inicializando...' },
      gamification: { level: 'Nivel', xp: 'XP', badges: 'Insignias', streak: 'Racha' },
      settings: { title: 'Configuración', subtitle: 'Configurar preferencias' },
      messages: { analysisComplete: 'Análisis completo', noCode: 'Selecciona código primero' }
    }
  },

  'zh-CN': {
    translation: {
      common: { loading: '加载中...', error: '错误', success: '成功', cancel: '取消', save: '保存', close: '关闭', back: '返回', next: '下一步', search: '搜索', settings: '设置' },
      popup: { title: 'DevMentor AI', subtitle: 'AI代码助手', searchPlaceholder: '提出您的问题...', analyzeButton: '分析代码', analyzing: '分析中...', selectCode: '选择代码', chooseAnalysis: '选择分析类型：', shortcuts: '快捷键', history: '历史', analytics: '分析' },
      functions: { explain: '解释', bugs: '错误', docs: '文档', optimize: '优化', review: '审查' },
      aiStatus: { ready: 'AI就绪', unavailable: 'AI不可用', initializing: '初始化中...' },
      gamification: { level: '等级', xp: '经验值', badges: '徽章', streak: '连胜' },
      settings: { title: '设置', subtitle: '配置您的偏好' },
      messages: { analysisComplete: '分析完成', noCode: '请先选择代码' }
    }
  },

  'hi-IN': {
    translation: {
      common: { loading: 'लोड हो रहा है...', error: 'त्रुटि', success: 'सफलता', cancel: 'रद्द करें', save: 'सहेजें', close: 'बंद करें', back: 'वापस', next: 'अगला', search: 'खोजें', settings: 'सेटिंग्स' },
      popup: { title: 'DevMentor AI', subtitle: 'AI कोड सहायक', searchPlaceholder: 'अपना सवाल पूछें...', analyzeButton: 'कोड का विश्लेषण करें', analyzing: 'विश्लेषण कर रहे हैं...', selectCode: 'कोड चुनें', chooseAnalysis: 'विश्लेषण प्रकार:', shortcuts: 'शॉर्टकट', history: 'इतिहास', analytics: 'विश्लेषण' },
      functions: { explain: 'समझाएं', bugs: 'बग', docs: 'डॉक्स', optimize: 'अनुकूलित करें', review: 'समीक्षा' },
      aiStatus: { ready: 'AI तैयार', unavailable: 'AI उपलब्ध नहीं', initializing: 'आरंभ हो रहा है...' },
      gamification: { level: 'स्तर', xp: 'XP', badges: 'बैज', streak: 'स्ट्रीक' },
      settings: { title: 'सेटिंग्स', subtitle: 'अपनी प्राथमिकताएँ कॉन्फ़िगर करें' },
      messages: { analysisComplete: 'विश्लेषण पूर्ण', noCode: 'पहले कोड चुनें' }
    }
  },

  'it-IT': {
    translation: {
      common: { loading: 'Caricamento...', error: 'Errore', success: 'Successo', cancel: 'Annulla', save: 'Salva', close: 'Chiudi', back: 'Indietro', next: 'Avanti', search: 'Cerca', settings: 'Impostazioni' },
      popup: { title: 'DevMentor AI', subtitle: 'Assistente Codice AI', searchPlaceholder: 'Fai la tua domanda...', analyzeButton: 'Analizza Codice', analyzing: 'Analizzando...', selectCode: 'Seleziona codice', chooseAnalysis: 'Tipo di analisi:', shortcuts: 'Scorciatoie', history: 'Cronologia', analytics: 'Analisi' },
      functions: { explain: 'Spiega', bugs: 'Bug', docs: 'Docs', optimize: 'Ottimizza', review: 'Revisiona' },
      aiStatus: { ready: 'AI Pronta', unavailable: 'AI Non Disponibile', initializing: 'Inizializzazione...' },
      gamification: { level: 'Livello', xp: 'XP', badges: 'Badge', streak: 'Serie' },
      settings: { title: 'Impostazioni', subtitle: 'Configura le tue preferenze' },
      messages: { analysisComplete: 'Analisi completata', noCode: 'Seleziona prima il codice' }
    }
  },

  'fr-FR': {
    translation: {
      common: { loading: 'Chargement...', error: 'Erreur', success: 'Succès', cancel: 'Annuler', save: 'Sauvegarder', close: 'Fermer', back: 'Retour', next: 'Suivant', search: 'Rechercher', settings: 'Paramètres' },
      popup: { title: 'DevMentor AI', subtitle: 'Assistant Code IA', searchPlaceholder: 'Posez votre question...', analyzeButton: 'Analyser le Code', analyzing: 'Analyse...', selectCode: 'Sélectionner code', chooseAnalysis: 'Type d\'analyse:', shortcuts: 'Raccourcis', history: 'Historique', analytics: 'Analytiques' },
      functions: { explain: 'Expliquer', bugs: 'Bugs', docs: 'Docs', optimize: 'Optimiser', review: 'Réviser' },
      aiStatus: { ready: 'IA Prête', unavailable: 'IA Indisponible', initializing: 'Initialisation...' },
      gamification: { level: 'Niveau', xp: 'XP', badges: 'Badges', streak: 'Série' },
      settings: { title: 'Paramètres', subtitle: 'Configurez vos préférences' },
      messages: { analysisComplete: 'Analyse terminée', noCode: 'Sélectionnez d\'abord le code' }
    }
  },

  'de-DE': {
    translation: {
      common: { loading: 'Laden...', error: 'Fehler', success: 'Erfolg', cancel: 'Abbrechen', save: 'Speichern', close: 'Schließen', back: 'Zurück', next: 'Weiter', search: 'Suchen', settings: 'Einstellungen' },
      popup: { title: 'DevMentor AI', subtitle: 'KI-Code-Assistent', searchPlaceholder: 'Stellen Sie Ihre Frage...', analyzeButton: 'Code Analysieren', analyzing: 'Analysiere...', selectCode: 'Code auswählen', chooseAnalysis: 'Analysetyp:', shortcuts: 'Verknüpfungen', history: 'Verlauf', analytics: 'Analytik' },
      functions: { explain: 'Erklären', bugs: 'Fehler', docs: 'Docs', optimize: 'Optimieren', review: 'Überprüfen' },
      aiStatus: { ready: 'KI Bereit', unavailable: 'KI Nicht Verfügbar', initializing: 'Initialisierung...' },
      gamification: { level: 'Ebene', xp: 'XP', badges: 'Abzeichen', streak: 'Serie' },
      settings: { title: 'Einstellungen', subtitle: 'Ihre Präferenzen konfigurieren' },
      messages: { analysisComplete: 'Analyse abgeschlossen', noCode: 'Bitte zuerst Code auswählen' }
    }
  },

  'ja-JP': {
    translation: {
      common: { loading: '読み込み中...', error: 'エラー', success: '成功', cancel: 'キャンセル', save: '保存', close: '閉じる', back: '戻る', next: '次へ', search: '検索', settings: '設定' },
      popup: { title: 'DevMentor AI', subtitle: 'AIコードアシスタント', searchPlaceholder: '質問を入力...', analyzeButton: 'コードを分析', analyzing: '分析中...', selectCode: 'コードを選択', chooseAnalysis: '分析タイプ：', shortcuts: 'ショートカット', history: '履歴', analytics: '分析' },
      functions: { explain: '説明', bugs: 'バグ', docs: 'ドキュメント', optimize: '最適化', review: 'レビュー' },
      aiStatus: { ready: 'AI準備完了', unavailable: 'AI利用不可', initializing: '初期化中...' },
      gamification: { level: 'レベル', xp: 'XP', badges: 'バッジ', streak: '連続' },
      settings: { title: '設定', subtitle: '設定を構成' },
      messages: { analysisComplete: '分析完了', noCode: 'まずコードを選択してください' }
    }
  },

  'ko-KR': {
    translation: {
      common: { loading: '로딩 중...', error: '오류', success: '성공', cancel: '취소', save: '저장', close: '닫기', back: '뒤로', next: '다음', search: '검색', settings: '설정' },
      popup: { title: 'DevMentor AI', subtitle: 'AI 코드 도우미', searchPlaceholder: '질문하세요...', analyzeButton: '코드 분석', analyzing: '분석 중...', selectCode: '코드 선택', chooseAnalysis: '분석 유형:', shortcuts: '단축키', history: '기록', analytics: '분석' },
      functions: { explain: '설명', bugs: '버그', docs: '문서', optimize: '최적화', review: '검토' },
      aiStatus: { ready: 'AI 준비됨', unavailable: 'AI 사용 불가', initializing: '초기화 중...' },
      gamification: { level: '레벨', xp: 'XP', badges: '배지', streak: '연속' },
      settings: { title: '설정', subtitle: '환경 설정' },
      messages: { analysisComplete: '분석 완료', noCode: '먼저 코드를 선택하세요' }
    }
  },

  'ru-RU': {
    translation: {
      common: { loading: 'Загрузка...', error: 'Ошибка', success: 'Успех', cancel: 'Отмена', save: 'Сохранить', close: 'Закрыть', back: 'Назад', next: 'Далее', search: 'Поиск', settings: 'Настройки' },
      popup: { title: 'DevMentor AI', subtitle: 'ИИ Помощник Кода', searchPlaceholder: 'Задайте вопрос...', analyzeButton: 'Анализировать Код', analyzing: 'Анализ...', selectCode: 'Выбрать код', chooseAnalysis: 'Тип анализа:', shortcuts: 'Ярлыки', history: 'История', analytics: 'Аналитика' },
      functions: { explain: 'Объяснить', bugs: 'Ошибки', docs: 'Документы', optimize: 'Оптимизировать', review: 'Проверить' },
      aiStatus: { ready: 'ИИ Готов', unavailable: 'ИИ Недоступен', initializing: 'Инициализация...' },
      gamification: { level: 'Уровень', xp: 'XP', badges: 'Значки', streak: 'Серия' },
      settings: { title: 'Настройки', subtitle: 'Настройте ваши предпочтения' },
      messages: { analysisComplete: 'Анализ завершен', noCode: 'Сначала выберите код' }
    }
  },

  'ar-SA': {
    translation: {
      common: { loading: 'جاري التحميل...', error: 'خطأ', success: 'نجاح', cancel: 'إلغاء', save: 'حفظ', close: 'إغلاق', back: 'رجوع', next: 'التالي', search: 'بحث', settings: 'الإعدادات' },
      popup: { title: 'DevMentor AI', subtitle: 'مساعد الكود بالذكاء الاصطناعي', searchPlaceholder: 'اطرح سؤالك...', analyzeButton: 'تحليل الكود', analyzing: 'جاري التحليل...', selectCode: 'اختر الكود', chooseAnalysis: 'نوع التحليل:', shortcuts: 'اختصارات', history: 'السجل', analytics: 'التحليلات' },
      functions: { explain: 'شرح', bugs: 'أخطاء', docs: 'مستندات', optimize: 'تحسين', review: 'مراجعة' },
      aiStatus: { ready: 'الذكاء الاصطناعي جاهز', unavailable: 'الذكاء الاصطناعي غير متاح', initializing: 'جاري التهيئة...' },
      gamification: { level: 'المستوى', xp: 'XP', badges: 'الشارات', streak: 'السلسلة' },
      settings: { title: 'الإعدادات', subtitle: 'تكوين تفضيلاتك' },
      messages: { analysisComplete: 'اكتمل التحليل', noCode: 'اختر الكود أولاً' }
    }
  }
};

// Initialize i18n
i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'pt-BR', // Default language
    fallbackLng: 'en-US',
    interpolation: {
      escapeValue: false // React already escapes
    }
  });

export default i18n;
