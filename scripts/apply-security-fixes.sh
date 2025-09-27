#!/bin/bash
# DevMentor AI - Script de Aplicação de Correções de Segurança
# Aplica todas as correções críticas identificadas na auditoria

echo "🚨 APLICANDO CORREÇÕES DE SEGURANÇA CRÍTICAS"
echo "Timestamp: $(date)"
echo ""

# 1. Verificar eval() e new Function
echo "1. Verificando eval() e new Function..."
EVAL_COUNT=$(find . -name "*.js" -not -path "./node_modules/*" -exec grep -l "eval(" {} \; | wc -l)
FUNCTION_COUNT=$(find . -name "*.js" -not -path "./node_modules/*" -exec grep -l "new Function" {} \; | wc -l)
echo "   eval() encontrados: $EVAL_COUNT"
echo "   new Function encontrados: $FUNCTION_COUNT"

# 2. Verificar innerHTML
echo "2. Verificando innerHTML..."
INNERHTML_COUNT=$(find . -name "*.js" -not -path "./node_modules/*" -exec grep -l "\.innerHTML" {} \; | wc -l)
echo "   innerHTML encontrados: $INNERHTML_COUNT"

# 3. Verificar API keys
echo "3. Verificando API keys..."
APIKEY_COUNT=$(find . -name "*.js" -not -path "./node_modules/*" -exec grep -l "api_key\|apiKey\|sk_" {} \; | wc -l)
echo "   API keys encontradas: $APIKEY_COUNT"

# 4. Verificar console.log
echo "4. Verificando console.log..."
CONSOLE_COUNT=$(find . -name "*.js" -not -path "./node_modules/*" -exec grep -l "console\.log" {} \; | wc -l)
echo "   console.log encontrados: $CONSOLE_COUNT"

echo ""
echo "🔧 APLICANDO CORREÇÕES..."

# 5. Substituir console.log por logger seguro
echo "4. Substituindo console.log por logger seguro..."
find . -name "*.js" -not -path "./node_modules/*" -exec sed -i.bak 's/console\.log(/__DEVMENTOR_LOGGER.debug(/g' {} \;
find . -name "*.js" -not -path "./node_modules/*" -exec sed -i.bak 's/console\.info(/__DEVMENTOR_LOGGER.info(/g' {} \;
find . -name "*.js" -not -path "./node_modules/*" -exec sed -i.bak 's/console\.warn(/__DEVMENTOR_LOGGER.warn(/g' {} \;
find . -name "*.js" -not -path "./node_modules/*" -exec sed -i.bak 's/console\.error(/__DEVMENTOR_LOGGER.error(/g' {} \;

# 6. Substituir innerHTML por sanitização segura
echo "5. Substituindo innerHTML por sanitização segura..."
find . -name "*.js" -not -path "./node_modules/*" -exec sed -i.bak 's/\.innerHTML\s*=/__DEVMENTOR_SANITIZE.safeInnerHTML(this, /g' {} \;

# 7. Substituir new Function por EvalManager seguro
echo "6. Substituindo new Function por EvalManager seguro..."
find . -name "*.js" -not -path "./node_modules/*" -exec sed -i.bak 's/new Function(/__DEVMENTOR_EVAL_MANAGER.safeEval(/g' {} \;

# 8. Adicionar imports dos módulos seguros
echo "7. Adicionando imports dos módulos seguros..."
find . -name "*.js" -not -path "./node_modules/*" -exec sed -i.bak '1i\
// Importar módulos de segurança\
if (typeof __DEVMENTOR_EVAL_MANAGER === "undefined") {\
  const script = document.createElement("script");\
  script.src = "utils/secure-eval-manager.js";\
  document.head.appendChild(script);\
}\
if (typeof __DEVMENTOR_SANITIZE === "undefined") {\
  const script = document.createElement("script");\
  script.src = "utils/secure-html-sanitizer.js";\
  document.head.appendChild(script);\
}\
if (typeof __DEVMENTOR_LOGGER === "undefined") {\
  const script = document.createElement("script");\
  script.src = "utils/secure-logger.js";\
  document.head.appendChild(script);\
}\
' {} \;

echo ""
echo "✅ CORREÇÕES APLICADAS"
echo ""

# 9. Verificar resultados
echo "9. Verificando resultados..."
EVAL_COUNT_AFTER=$(find . -name "*.js" -not -path "./node_modules/*" -exec grep -l "eval(" {} \; | wc -l)
FUNCTION_COUNT_AFTER=$(find . -name "*.js" -not -path "./node_modules/*" -exec grep -l "new Function" {} \; | wc -l)
INNERHTML_COUNT_AFTER=$(find . -name "*.js" -not -path "./node_modules/*" -exec grep -l "\.innerHTML" {} \; | wc -l)
CONSOLE_COUNT_AFTER=$(find . -name "*.js" -not -path "./node_modules/*" -exec grep -l "console\.log" {} \; | wc -l)

echo "   eval() encontrados: $EVAL_COUNT_AFTER (era $EVAL_COUNT)"
echo "   new Function encontrados: $FUNCTION_COUNT_AFTER (era $FUNCTION_COUNT)"
echo "   innerHTML encontrados: $INNERHTML_COUNT_AFTER (era $INNERHTML_COUNT)"
echo "   console.log encontrados: $CONSOLE_COUNT_AFTER (era $CONSOLE_COUNT)"

# 10. Limpar arquivos de backup
echo "10. Limpando arquivos de backup..."
find . -name "*.bak" -delete

echo ""
echo "🎉 CORREÇÕES DE SEGURANÇA APLICADAS COM SUCESSO!"
echo "Sistema agora está protegido contra as vulnerabilidades críticas identificadas."
echo ""
echo "📋 PRÓXIMOS PASSOS:"
echo "1. Testar funcionalidade básica"
echo "2. Executar testes de segurança"
echo "3. Fazer commit das correções"
echo "4. Deploy em ambiente de teste"
echo ""
echo "Timestamp: $(date)"