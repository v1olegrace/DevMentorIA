/**
 * DevMentor AI - Code Analyzer
 * Lightweight analysis to validate selections and provide quick insights
 */

class CodeAnalyzer {
  constructor() {}

  quickAnalyze(code, filename = '') {
    const sanitized = window.DevMentorHelpers?.sanitizeCode(code) || { code: '', isValid: false };
    const looksLikeCode = !!sanitized.isValid;

    const detection = window.LanguageDetector
      ? window.LanguageDetector.detect(sanitized.code, filename)
      : { language: 'auto', confidence: 0.2 };

    const stats = this.getStats(sanitized.code);

    return {
      looksLikeCode,
      language: detection.language,
      confidence: detection.confidence,
      stats,
      reason: sanitized.reason
    };
  }

  getStats(code) {
    if (!code) return { lines: 0, chars: 0 };
    return {
      lines: code.split('\n').length,
      chars: code.length
    };
  }
}

window.CodeAnalyzer = CodeAnalyzer;




