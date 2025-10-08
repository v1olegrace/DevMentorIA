#!/bin/bash

# DevMentor AI - Security Validation Script
# Verifica se ainda há uso inseguro de eval() ou new Function()

echo "🔍 DevMentor AI - Security Validation"
echo "======================================"

# Contar ocorrências de eval() não bloqueadas
echo "1. Verificando eval() não bloqueados..."
EVAL_COUNT=$(find . -name "*.js" -not -path "./node_modules/*" -not -path "./tests/*" -exec grep -l "eval(" {} \; | wc -l)
EVAL_BLOCKED=$(find . -name "*.js" -not -path "./node_modules/*" -not -path "./tests/*" -exec grep -l "eval(" {} \; | xargs grep -l "blocked\|error\|warn\|throw.*eval" | wc -l)

echo "   Total de arquivos com eval(): $EVAL_COUNT"
echo "   Arquivos com eval() bloqueado: $EVAL_BLOCKED"

if [ $EVAL_COUNT -gt $EVAL_BLOCKED ]; then
    echo "   ❌ PROBLEMA: Há eval() não bloqueados!"
    find . -name "*.js" -not -path "./node_modules/*" -not -path "./tests/*" -exec grep -l "eval(" {} \; | xargs grep -L "blocked\|error\|warn\|throw.*eval"
else
    echo "   ✅ OK: Todos os eval() estão bloqueados"
fi

# Contar ocorrências de new Function() não bloqueadas
echo ""
echo "2. Verificando new Function() não bloqueados..."
FUNCTION_COUNT=$(find . -name "*.js" -not -path "./node_modules/*" -not -path "./tests/*" -exec grep -l "new Function" {} \; | wc -l)
FUNCTION_BLOCKED=$(find . -name "*.js" -not -path "./node_modules/*" -not -path "./tests/*" -exec grep -l "new Function" {} \; | xargs grep -l "blocked\|error\|warn\|throw.*Function" | wc -l)

echo "   Total de arquivos com new Function(): $FUNCTION_COUNT"
echo "   Arquivos com new Function() bloqueado: $FUNCTION_BLOCKED"

if [ $FUNCTION_COUNT -gt $FUNCTION_BLOCKED ]; then
    echo "   ❌ PROBLEMA: Há new Function() não bloqueados!"
    find . -name "*.js" -not -path "./node_modules/*" -not -path "./tests/*" -exec grep -l "new Function" {} \; | xargs grep -L "blocked\|error\|warn\|throw.*Function"
else
    echo "   ✅ OK: Todos os new Function() estão bloqueados"
fi

# Verificar se há regex-blacklist patterns
echo ""
echo "3. Verificando padrões de regex-blacklist..."
BLACKLIST_COUNT=$(find . -name "*.js" -not -path "./node_modules/*" -not -path "./tests/*" -exec grep -l "constructor\|__proto__\|window\|document" {} \; | wc -l)

if [ $BLACKLIST_COUNT -gt 0 ]; then
    echo "   ⚠️  ATENÇÃO: Encontrados padrões de regex-blacklist em $BLACKLIST_COUNT arquivos"
    echo "   Arquivos com regex-blacklist:"
    find . -name "*.js" -not -path "./node_modules/*" -not -path "./tests/*" -exec grep -l "constructor\|__proto__\|window\|document" {} \;
else
    echo "   ✅ OK: Nenhum padrão de regex-blacklist encontrado"
fi

# Verificar se há uso de SafeExpressionEvaluator
echo ""
echo "4. Verificando uso de SafeExpressionEvaluator..."
SAFE_EVAL_COUNT=$(find . -name "*.js" -not -path "./node_modules/*" -not -path "./tests/*" -exec grep -l "__DEVMENTOR_SAFE_EVAL\|SafeExpressionEvaluator" {} \; | wc -l)

if [ $SAFE_EVAL_COUNT -gt 0 ]; then
    echo "   ✅ OK: SafeExpressionEvaluator implementado em $SAFE_EVAL_COUNT arquivos"
else
    echo "   ⚠️  ATENÇÃO: SafeExpressionEvaluator não encontrado"
fi

# Verificar se há uso de stack-based evaluator
echo ""
echo "5. Verificando uso de stack-based evaluator..."
STACK_EVAL_COUNT=$(find . -name "*.js" -not -path "./node_modules/*" -not -path "./tests/*" -exec grep -l "safeStackEvaluate\|stack.*evaluator" {} \; | wc -l)

if [ $STACK_EVAL_COUNT -gt 0 ]; then
    echo "   ✅ OK: Stack-based evaluator implementado em $STACK_EVAL_COUNT arquivos"
else
    echo "   ⚠️  ATENÇÃO: Stack-based evaluator não encontrado"
fi

# Resumo final
echo ""
echo "📋 RESUMO DA VALIDAÇÃO:"
echo "======================="

if [ $EVAL_COUNT -eq $EVAL_BLOCKED ] && [ $FUNCTION_COUNT -eq $FUNCTION_BLOCKED ] && [ $BLACKLIST_COUNT -eq 0 ]; then
    echo "✅ SEGURANÇA VALIDADA: Todas as vulnerabilidades foram corrigidas!"
    echo "   - eval() bloqueados: $EVAL_BLOCKED/$EVAL_COUNT"
    echo "   - new Function() bloqueados: $FUNCTION_BLOCKED/$FUNCTION_COUNT"
    echo "   - regex-blacklist removidos: 0/$BLACKLIST_COUNT"
    echo "   - SafeExpressionEvaluator implementado: $SAFE_EVAL_COUNT arquivos"
    echo "   - Stack-based evaluator implementado: $STACK_EVAL_COUNT arquivos"
    exit 0
else
    echo "❌ PROBLEMAS DE SEGURANÇA ENCONTRADOS:"
    echo "   - eval() não bloqueados: $((EVAL_COUNT - EVAL_BLOCKED))"
    echo "   - new Function() não bloqueados: $((FUNCTION_COUNT - FUNCTION_BLOCKED))"
    echo "   - regex-blacklist encontrados: $BLACKLIST_COUNT"
    exit 1
fi







