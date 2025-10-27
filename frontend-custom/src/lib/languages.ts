/**
 * Programming Languages Definition
 * Complete list of supported programming languages
 */

export interface ProgrammingLanguage {
  id: string;
  name: string;
  category: 'web' | 'backend' | 'mobile' | 'data' | 'systems' | 'other';
  popularity: 'high' | 'medium' | 'low';
  fileExtensions: string[];
  color: string;
}

export const PROGRAMMING_LANGUAGES: ProgrammingLanguage[] = [
  // Web Development
  { id: 'javascript', name: 'JavaScript', category: 'web', popularity: 'high', fileExtensions: ['.js', '.mjs', '.cjs'], color: '#f7df1e' },
  { id: 'typescript', name: 'TypeScript', category: 'web', popularity: 'high', fileExtensions: ['.ts', '.tsx'], color: '#3178c6' },
  { id: 'html', name: 'HTML', category: 'web', popularity: 'high', fileExtensions: ['.html', '.htm'], color: '#e34f26' },
  { id: 'css', name: 'CSS', category: 'web', popularity: 'high', fileExtensions: ['.css', '.scss', '.sass', '.less'], color: '#1572b6' },
  { id: 'react', name: 'React/JSX', category: 'web', popularity: 'high', fileExtensions: ['.jsx', '.tsx'], color: '#61dafb' },
  { id: 'vue', name: 'Vue', category: 'web', popularity: 'high', fileExtensions: ['.vue'], color: '#42b883' },
  { id: 'svelte', name: 'Svelte', category: 'web', popularity: 'medium', fileExtensions: ['.svelte'], color: '#ff3e00' },

  // Backend
  { id: 'python', name: 'Python', category: 'backend', popularity: 'high', fileExtensions: ['.py', '.pyw', '.pyi'], color: '#3776ab' },
  { id: 'java', name: 'Java', category: 'backend', popularity: 'high', fileExtensions: ['.java'], color: '#007396' },
  { id: 'csharp', name: 'C#', category: 'backend', popularity: 'high', fileExtensions: ['.cs', '.csx'], color: '#239120' },
  { id: 'go', name: 'Go', category: 'backend', popularity: 'high', fileExtensions: ['.go'], color: '#00add8' },
  { id: 'rust', name: 'Rust', category: 'backend', popularity: 'medium', fileExtensions: ['.rs'], color: '#ce412b' },
  { id: 'ruby', name: 'Ruby', category: 'backend', popularity: 'medium', fileExtensions: ['.rb', '.rbw'], color: '#cc342d' },
  { id: 'php', name: 'PHP', category: 'backend', popularity: 'high', fileExtensions: ['.php', '.phtml'], color: '#777bb4' },
  { id: 'nodejs', name: 'Node.js', category: 'backend', popularity: 'high', fileExtensions: ['.js', '.mjs'], color: '#339933' },

  // Mobile
  { id: 'kotlin', name: 'Kotlin', category: 'mobile', popularity: 'high', fileExtensions: ['.kt', '.kts'], color: '#7f52ff' },
  { id: 'swift', name: 'Swift', category: 'mobile', popularity: 'high', fileExtensions: ['.swift'], color: '#fa7343' },
  { id: 'dart', name: 'Dart (Flutter)', category: 'mobile', popularity: 'high', fileExtensions: ['.dart'], color: '#0175c2' },
  { id: 'reactnative', name: 'React Native', category: 'mobile', popularity: 'high', fileExtensions: ['.jsx', '.tsx'], color: '#61dafb' },

  // Data Science & ML
  { id: 'r', name: 'R', category: 'data', popularity: 'medium', fileExtensions: ['.r', '.R'], color: '#276dc3' },
  { id: 'julia', name: 'Julia', category: 'data', popularity: 'low', fileExtensions: ['.jl'], color: '#9558b2' },
  { id: 'sql', name: 'SQL', category: 'data', popularity: 'high', fileExtensions: ['.sql'], color: '#cc2927' },
  { id: 'matlab', name: 'MATLAB', category: 'data', popularity: 'medium', fileExtensions: ['.m'], color: '#ff6f00' },

  // Systems Programming
  { id: 'c', name: 'C', category: 'systems', popularity: 'high', fileExtensions: ['.c', '.h'], color: '#555555' },
  { id: 'cpp', name: 'C++', category: 'systems', popularity: 'high', fileExtensions: ['.cpp', '.hpp', '.cc', '.cxx'], color: '#00599c' },
  { id: 'assembly', name: 'Assembly', category: 'systems', popularity: 'low', fileExtensions: ['.asm', '.s'], color: '#6e4c13' },

  // Other Popular Languages
  { id: 'scala', name: 'Scala', category: 'backend', popularity: 'medium', fileExtensions: ['.scala', '.sc'], color: '#dc322f' },
  { id: 'haskell', name: 'Haskell', category: 'other', popularity: 'low', fileExtensions: ['.hs', '.lhs'], color: '#5e5086' },
  { id: 'clojure', name: 'Clojure', category: 'other', popularity: 'low', fileExtensions: ['.clj', '.cljs'], color: '#5881d8' },
  { id: 'elixir', name: 'Elixir', category: 'backend', popularity: 'medium', fileExtensions: ['.ex', '.exs'], color: '#4e2a8e' },
  { id: 'perl', name: 'Perl', category: 'other', popularity: 'low', fileExtensions: ['.pl', '.pm'], color: '#39457e' },
  { id: 'lua', name: 'Lua', category: 'other', popularity: 'medium', fileExtensions: ['.lua'], color: '#000080' },
  { id: 'bash', name: 'Bash/Shell', category: 'systems', popularity: 'high', fileExtensions: ['.sh', '.bash'], color: '#4eaa25' },
  { id: 'powershell', name: 'PowerShell', category: 'systems', popularity: 'medium', fileExtensions: ['.ps1', '.psm1'], color: '#012456' },
  { id: 'graphql', name: 'GraphQL', category: 'web', popularity: 'medium', fileExtensions: ['.graphql', '.gql'], color: '#e10098' },
  { id: 'solidity', name: 'Solidity', category: 'other', popularity: 'medium', fileExtensions: ['.sol'], color: '#363636' },
  { id: 'yaml', name: 'YAML', category: 'other', popularity: 'high', fileExtensions: ['.yaml', '.yml'], color: '#cb171e' },
  { id: 'json', name: 'JSON', category: 'other', popularity: 'high', fileExtensions: ['.json'], color: '#000000' },
  { id: 'markdown', name: 'Markdown', category: 'other', popularity: 'high', fileExtensions: ['.md', '.markdown'], color: '#083fa1' }
];

/**
 * Get language by ID
 */
export function getLanguageById(id: string): ProgrammingLanguage | undefined {
  return PROGRAMMING_LANGUAGES.find(lang => lang.id === id);
}

/**
 * Get language by file extension
 */
export function getLanguageByExtension(extension: string): ProgrammingLanguage | undefined {
  return PROGRAMMING_LANGUAGES.find(lang =>
    lang.fileExtensions.includes(extension.toLowerCase())
  );
}

/**
 * Get languages by category
 */
export function getLanguagesByCategory(category: ProgrammingLanguage['category']): ProgrammingLanguage[] {
  return PROGRAMMING_LANGUAGES.filter(lang => lang.category === category);
}

/**
 * Get popular languages
 */
export function getPopularLanguages(): ProgrammingLanguage[] {
  return PROGRAMMING_LANGUAGES.filter(lang => lang.popularity === 'high');
}

/**
 * Detect language from code content (basic heuristics)
 */
export function detectLanguage(code: string): ProgrammingLanguage | undefined {
  // Simple heuristics
  if (code.includes('function') && code.includes('{')) {
    if (code.includes('const ') || code.includes('let ')) return getLanguageById('javascript');
    if (code.includes('def ')) return getLanguageById('python');
  }

  if (code.includes('public class ')) return getLanguageById('java');
  if (code.includes('<?php')) return getLanguageById('php');
  if (code.includes('import React')) return getLanguageById('react');
  if (code.includes('fn main()')) return getLanguageById('rust');
  if (code.includes('func ') && code.includes('package ')) return getLanguageById('go');

  // Default to JavaScript if unsure
  return getLanguageById('javascript');
}
