/**
 * DevMentor AI - Teste de Sanitização HTML
 * Valida se o HTMLSanitizer está removendo conteúdo malicioso
 */

// Simular HTMLSanitizer básico
function testHTMLSanitization() {
  console.log('=== TESTE DE SANITIZAÇÃO HTML ===');
  
  function sanitizeHTML(html) {
    if (typeof html !== 'string') return '';
    
    // Remover tags perigosas
    let sanitized = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^>]*>.*?<\/iframe>/gi, '')
      .replace(/<object\b[^>]*>.*?<\/object>/gi, '')
      .replace(/<embed\b[^>]*>/gi, '')
      .replace(/<form\b[^>]*>.*?<\/form>/gi, '')
      .replace(/<input\b[^>]*>/gi, '')
      .replace(/<button\b[^>]*>.*?<\/button>/gi, '');
    
    // Remover atributos perigosos
    sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
    sanitized = sanitized.replace(/\s*javascript:\s*[^"'\s>]*/gi, '');
    sanitized = sanitized.replace(/\s*vbscript:\s*[^"'\s>]*/gi, '');
    
    return sanitized;
  }
  
  // Teste 1: Script malicioso
  console.log('\n--- Teste 1: Script Malicioso ---');
  const maliciousScript = '<script>alert("XSS")</script><p>Conteúdo seguro</p>';
  const sanitized1 = sanitizeHTML(maliciousScript);
  console.log('Original:', maliciousScript);
  console.log('Sanitizado:', sanitized1);
  console.log('✅ Script removido:', !sanitized1.includes('<script>'));
  
  // Teste 2: Atributo onclick
  console.log('\n--- Teste 2: Atributo onclick ---');
  const onclickHtml = '<div onclick="alert(1)">Clique aqui</div>';
  const sanitized2 = sanitizeHTML(onclickHtml);
  console.log('Original:', onclickHtml);
  console.log('Sanitizado:', sanitized2);
  console.log('✅ onclick removido:', !sanitized2.includes('onclick'));
  
  // Teste 3: Iframe malicioso
  console.log('\n--- Teste 3: Iframe Malicioso ---');
  const maliciousIframe = '<iframe src="javascript:alert(1)"></iframe><p>Texto</p>';
  const sanitized3 = sanitizeHTML(maliciousIframe);
  console.log('Original:', maliciousIframe);
  console.log('Sanitizado:', sanitized3);
  console.log('✅ Iframe removido:', !sanitized3.includes('<iframe'));
  
  // Teste 4: HTML seguro (deve permanecer)
  console.log('\n--- Teste 4: HTML Seguro ---');
  const safeHtml = '<p>Texto <strong>negrito</strong> e <em>itálico</em></p>';
  const sanitized4 = sanitizeHTML(safeHtml);
  console.log('Original:', safeHtml);
  console.log('Sanitizado:', sanitized4);
  console.log('✅ HTML seguro preservado:', sanitized4 === safeHtml);
  
  // Teste 5: URL javascript
  console.log('\n--- Teste 5: URL javascript ---');
  const jsUrl = '<a href="javascript:alert(1)">Link malicioso</a>';
  const sanitized5 = sanitizeHTML(jsUrl);
  console.log('Original:', jsUrl);
  console.log('Sanitizado:', sanitized5);
  console.log('✅ javascript: removido:', !sanitized5.includes('javascript:'));
  
  console.log('\n=== TESTE CONCLUÍDO ===');
}

// Executar teste
testHTMLSanitization();

