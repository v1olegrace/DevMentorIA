/**
 * DevMentor AI - EvalManager Seguro
 * Substitui eval() e new Function() por execução segura
 * Implementação baseada nas recomendações de auditoria
 */

(function(global) {
  if (!global) return;
  if (global.__DEVMENTOR_EVAL_MANAGER) return;
  
  const forbidden = /(constructor|__proto__|window|document|eval|Function|process|require|module|global|this|arguments|with|debugger|yield|await|async|delete|new|super|import|export)/i;
  let fallback = null;
  
  function isSafe(expr) {
    if (typeof expr !== 'string') return false;
    if (forbidden.test(expr)) return false;
    // Permitir apenas tokens básicos (números, identificadores, operadores, parênteses, JSON-like)
    if (/[^0-9a-zA-Z_ \t+\-*/%().,<>=!&|?:'"\[\]\{\},]/.test(expr)) return false;
    return true;
  }
  
  function safeEval(expr, context = {}) {
    if (!isSafe(expr)) {
      if (fallback) return fallback(expr, context);
      throw new Error('Expression not allowed locally. Register fallback.');
    }
    
    const replaced = expr.replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)\b/g, m => {
      return Object.prototype.hasOwnProperty.call(context, m) ? JSON.stringify(context[m]) : m;
    });
    
    // Verificação final
    if (forbidden.test(replaced)) {
      if (fallback) return fallback(expr, context);
      throw new Error('Forbidden tokens in expression.');
    }
    
    return Function('"use strict"; return (' + replaced + ')')();
  }
  
  const manager = {
    safeEval,
    registerFallback(fn) { fallback = fn; },
    enableUnsafeForDev() { /* explicit - apenas para desenvolvimento */ }
  };
  
  global.__DEVMENTOR_EVAL_MANAGER = manager;
})(typeof globalThis !== 'undefined' ? globalThis : this);