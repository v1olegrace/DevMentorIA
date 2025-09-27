/**
 * DevMentor AI - Teste de Redaction de Padrões Sensíveis
 * Valida se o logger está redactionando corretamente dados sensíveis
 */

// Teste de redaction
function testLoggerRedaction() {
  console.log('=== TESTE DE REDACTION DE PADRÕES SENSÍVEIS ===');
  
  // Simular logger com redaction
  const logger = {
    debug: (...args) => {
      const redacted = args.map(arg => {
        if (typeof arg === 'string') {
          return arg
            .replace(/api[_-]?key["\s]*[:=]["\s]*[^"'\s,}]+/gi, '[REDACTED]')
            .replace(/secret["\s]*[:=]["\s]*[^"'\s,}]+/gi, '[REDACTED]')
            .replace(/token["\s]*[:=]["\s]*[^"'\s,}]+/gi, '[REDACTED]')
            .replace(/bearer\s+[a-zA-Z0-9\-._~+/]+=*/gi, '[REDACTED]')
            .replace(/[a-zA-Z0-9]{32,}/g, '[REDACTED]');
        }
        return arg;
      });
      console.debug('[TEST]', ...redacted);
    }
  };
  
  // Teste 1: API Key
  console.log('\n--- Teste 1: API Key ---');
  logger.debug('Using API key: sk-1234567890abcdef1234567890abcdef');
  
  // Teste 2: Token Bearer
  console.log('\n--- Teste 2: Bearer Token ---');
  logger.debug('Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
  
  // Teste 3: Secret
  console.log('\n--- Teste 3: Secret ---');
  logger.debug('Database secret: mySecretKey123456789');
  
  // Teste 4: String longa (possível chave)
  console.log('\n--- Teste 4: String Longa ---');
  logger.debug('Hash: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0');
  
  // Teste 5: HTML malicioso
  console.log('\n--- Teste 5: HTML Malicioso ---');
  const maliciousHtml = '<script>alert("XSS")</script><img src="x" onerror="alert(1)">';
  logger.debug('HTML content:', maliciousHtml);
  
  console.log('\n=== TESTE CONCLUÍDO ===');
}

// Executar teste
testLoggerRedaction();

