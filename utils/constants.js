/**
 * DevMentor AI - Constants and Configuration
 * Centralized configuration for the entire extension
 */

// Extension Configuration - Safe namespace
if (!window.DEVMENTOR_CONFIG) {
  window.DEVMENTOR_CONFIG = {
  
  // Extension Info
  APP_NAME: 'DevMentor AI',
  VERSION: '1.0.0',
  
  // UI Configuration
  UI: {
    SIDEBAR_WIDTH: '420px',
    ANIMATION_DURATION: 300,
    SIDEBAR_Z_INDEX: 999999,
    LOADING_TIMEOUT: 30000, // 30 seconds max loading
    
    // Theme Colors
    COLORS: {
      PRIMARY: '#0066cc',
      SECONDARY: '#4CAF50', 
      BACKGROUND: '#1e1e1e',
      SURFACE: '#2d2d2d',
      TEXT_PRIMARY: '#ffffff',
      TEXT_SECONDARY: '#b0b0b0',
      ERROR: '#f44336',
      WARNING: '#ff9800',
      SUCCESS: '#4caf50'
    }
  },
  
  // AI Configuration
  AI: {
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000, // ms
    SESSION_TIMEOUT: 300000, // 5 minutes
    MAX_CODE_LENGTH: 10000, // characters
    MAX_SCREENSHOT_SIZE: 5 * 1024 * 1024, // 5MB
    
    // System Prompts
    PROMPTS: {
      EXPLAIN: `You are DevMentor AI, an expert programming mentor focused on education.
        Analyze the provided code and explain it clearly for learning purposes.
        Structure your response with:
        1. Brief overview of what the code does
        2. Step-by-step explanation of key parts
        3. Important concepts or patterns used
        4. Time/space complexity if relevant
        5. Potential improvements or alternatives
        
        Keep explanations educational, encouraging, and beginner-friendly while being technically accurate.`,
        
      DEBUG: `You are DevMentor AI, a debugging expert.
        Analyze the provided code for potential issues:
        1. Syntax errors or typos
        2. Logic bugs and edge cases
        3. Performance issues
        4. Security vulnerabilities
        5. Memory leaks or resource issues
        6. Best practice violations
        
        For each issue found, provide:
        - Clear description of the problem
        - Specific line references when possible
        - Suggested fixes with explanations
        - Why the fix improves the code
        
        If no issues are found, suggest potential optimizations or improvements.`,
        
      DOCUMENT: `You are DevMentor AI, a technical documentation expert.
        Generate comprehensive documentation for the provided code:
        1. Function/class/module descriptions
        2. Parameter details with types and purposes
        3. Return value explanations
        4. Usage examples
        5. JSDoc/docstring format when appropriate
        6. Edge cases and error handling
        
        Make documentation clear, complete, and maintainable.`,
        
      REFACTOR: `You are DevMentor AI, a code quality expert.
        Analyze the provided code and suggest improvements:
        1. Code structure and organization
        2. Design patterns that could be applied
        3. Performance optimizations
        4. Readability improvements
        5. Maintainability enhancements
        6. Modern language features that could be used
        
        Explain the benefits of each suggestion and provide example implementations.`,
        
      MULTIMODAL: `You are DevMentor AI analyzing a code image/screenshot.
        Extract and explain the visible code:
        1. Transcribe the code if readable
        2. Identify the programming language
        3. Explain what the code does
        4. Point out any visible issues
        5. Suggest improvements if appropriate
        
        If the image is unclear or contains non-code content, explain what you can see and ask for clarification.`
    }
  },
  
  // Supported Programming Languages
  LANGUAGES: {
    javascript: {
      name: 'JavaScript',
      extensions: ['.js', '.jsx', '.mjs', '.es6'],
      keywords: ['function', 'const', 'let', 'var', 'class', 'import', 'export', 'async', 'await'],
      frameworks: ['React', 'Vue', 'Angular', 'Node.js', 'Express']
    },
    python: {
      name: 'Python', 
      extensions: ['.py', '.pyx', '.pyw', '.pyi'],
      keywords: ['def', 'class', 'import', 'from', 'if', 'elif', 'else', 'for', 'while', 'try', 'except'],
      frameworks: ['Django', 'Flask', 'FastAPI', 'Pandas', 'NumPy']
    },
    java: {
      name: 'Java',
      extensions: ['.java'],
      keywords: ['public', 'private', 'protected', 'class', 'interface', 'extends', 'implements', 'import'],
      frameworks: ['Spring', 'Android', 'Maven', 'Gradle']
    },
    cpp: {
      name: 'C++',
      extensions: ['.cpp', '.cc', '.cxx', '.c++', '.hpp', '.h'],
      keywords: ['#include', 'using', 'namespace', 'class', 'struct', 'public:', 'private:', 'protected:'],
      frameworks: ['STL', 'Boost', 'Qt']
    },
    csharp: {
      name: 'C#',
      extensions: ['.cs'],
      keywords: ['using', 'namespace', 'class', 'struct', 'interface', 'public', 'private', 'protected'],
      frameworks: ['.NET', 'ASP.NET', 'Entity Framework', 'Xamarin']
    },
    php: {
      name: 'PHP',
      extensions: ['.php', '.php3', '.php4', '.php5', '.phtml'],
      keywords: ['<?php', 'function', 'class', 'namespace', 'use', 'public', 'private', 'protected'],
      frameworks: ['Laravel', 'Symfony', 'CodeIgniter', 'WordPress']
    },
    go: {
      name: 'Go',
      extensions: ['.go'],
      keywords: ['package', 'import', 'func', 'var', 'const', 'type', 'struct', 'interface'],
      frameworks: ['Gin', 'Echo', 'Fiber', 'GORM']
    },
    rust: {
      name: 'Rust',
      extensions: ['.rs'],
      keywords: ['fn', 'let', 'mut', 'struct', 'enum', 'impl', 'trait', 'use', 'mod'],
      frameworks: ['Actix', 'Rocket', 'Tokio', 'Serde']
    },
    typescript: {
      name: 'TypeScript',
      extensions: ['.ts', '.tsx'],
      keywords: ['interface', 'type', 'enum', 'namespace', 'declare', 'function', 'class', 'import'],
      frameworks: ['Angular', 'NestJS', 'TypeORM']
    },
    html: {
      name: 'HTML',
      extensions: ['.html', '.htm', '.xhtml'],
      keywords: ['<!DOCTYPE', '<html', '<head', '<body', '<div', '<span', '<script', '<style'],
      frameworks: ['Bootstrap', 'Tailwind CSS', 'Bulma']
    },
    css: {
      name: 'CSS',
      extensions: ['.css', '.scss', '.sass', '.less'],
      keywords: ['@media', '@import', '@keyframes', 'display:', 'position:', 'color:', 'background:'],
      frameworks: ['Bootstrap', 'Tailwind', 'SCSS', 'PostCSS']
    },
    sql: {
      name: 'SQL',
      extensions: ['.sql'],
      keywords: ['SELECT', 'FROM', 'WHERE', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'ALTER', 'DROP'],
      frameworks: ['MySQL', 'PostgreSQL', 'SQLite', 'MongoDB']
    }
  },
  
  // Context Menu Items
  CONTEXT_MENU: {
    EXPLAIN: {
      id: 'devmentor-explain',
      title: 'Explain Code',
      icon: 'AI'
    },
    DEBUG: {
      id: 'devmentor-debug',
      title: '🐛 Find Bugs & Issues',
      icon: '🐛'
    },
    DOCUMENT: {
      id: 'devmentor-document',
      title: 'Generate Documentation', 
      icon: 'Doc'
    },
    REFACTOR: {
      id: 'devmentor-refactor',
      title: 'Suggest Refactoring',
      icon: 'Opt'
    },
    SCREENSHOT: {
      id: 'devmentor-screenshot',
      title: '📷 Analyze Screenshot',
      icon: '📷'
    }
  },
  
  // Error Messages
  ERRORS: {
    AI_NOT_AVAILABLE: 'Chrome Built-in AI is not available. Please ensure you have Chrome Canary with AI features enabled.',
    CODE_TOO_LONG: 'Selected code is too long. Please select a smaller portion (max 10,000 characters).',
    PROCESSING_FAILED: 'Failed to process your request. Please try again.',
    SCREENSHOT_TOO_LARGE: 'Screenshot is too large. Please use an image smaller than 5MB.',
    UNSUPPORTED_FORMAT: 'Unsupported file format. Please use PNG, JPEG, or WebP.',
    SESSION_EXPIRED: 'AI session expired. Starting a new session...',
    NETWORK_ERROR: 'Network error occurred. Please check your connection.',
    GENERIC_ERROR: 'An unexpected error occurred. Please try again.'
  },
  
  // Success Messages
  SUCCESS: {
    CODE_EXPLAINED: 'Code explanation generated successfully!',
    BUGS_FOUND: 'Bug analysis completed!',
    DOCS_GENERATED: 'Documentation generated successfully!',
    REFACTOR_SUGGESTIONS: 'Refactoring suggestions ready!',
    SCREENSHOT_ANALYZED: 'Screenshot analysis completed!'
  },
  
  // Loading Messages
  LOADING: {
    INITIALIZING: 'Initializing DevMentor AI...',
    ANALYZING: 'Analyzing your code...',
    DEBUGGING: 'Scanning for bugs and issues...',
    DOCUMENTING: 'Generating documentation...',
    REFACTORING: 'Analyzing for improvements...',
    PROCESSING_IMAGE: 'Processing screenshot...'
  },
  
  // Storage Keys
  STORAGE: {
    USER_PREFERENCES: 'devmentor_user_prefs',
    AI_SESSIONS: 'devmentor_ai_sessions',
    USAGE_STATS: 'devmentor_usage_stats',
    LAST_USED: 'devmentor_last_used'
  },
  
  // Feature Flags
  FEATURES: {
    MULTIMODAL_ENABLED: true,
    SCREENSHOT_ANALYSIS: true,
    BATCH_PROCESSING: false, // Future feature
    TEAM_SHARING: false, // Future feature
    CUSTOM_PROMPTS: false // Future feature
  }
  };

  // Freeze the configuration to prevent modifications
  Object.freeze(window.DEVMENTOR_CONFIG);
}

