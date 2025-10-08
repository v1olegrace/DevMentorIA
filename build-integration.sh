#!/bin/bash

# 🚀 DevMentor AI - Build Script
# Script para construir e integrar o frontend React com a extensão Chrome

echo "🚀 Iniciando build do DevMentor AI..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log colorido
log() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar se estamos no diretório correto
if [ ! -f "manifest.json" ]; then
    error "Execute este script no diretório raiz do DevMentor AI"
    exit 1
fi

# 1. Instalar dependências do frontend React
log "Instalando dependências do frontend React..."
cd frontend-custom

if [ ! -f "package.json" ]; then
    error "package.json não encontrado no frontend-custom"
    exit 1
fi

# Instalar dependências
if command -v npm &> /dev/null; then
    npm install
elif command -v yarn &> /dev/null; then
    yarn install
elif command -v pnpm &> /dev/null; then
    pnpm install
else
    error "Nenhum gerenciador de pacotes encontrado (npm, yarn, pnpm)"
    exit 1
fi

# 2. Build do frontend React
log "Construindo frontend React..."
npm run build

if [ $? -ne 0 ]; then
    error "Falha no build do frontend React"
    exit 1
fi

success "Frontend React construído com sucesso!"

# 3. Voltar para o diretório raiz
cd ..

# 4. Copiar arquivos necessários
log "Copiando arquivos para integração..."

# Criar diretório dist-frontend se não existir
mkdir -p dist-frontend

# Copiar arquivos do build
if [ -d "frontend-custom/dist" ]; then
    cp -r frontend-custom/dist/* dist-frontend/
elif [ -d "frontend-custom/dist-frontend" ]; then
    cp -r frontend-custom/dist-frontend/* dist-frontend/
else
    error "Diretório de build não encontrado"
    exit 1
fi

# 5. Copiar assets necessários
log "Copiando assets..."
cp -r assets dist-frontend/
cp -r content dist-frontend/
cp -r background dist-frontend/
cp -r utils dist-frontend/

# 6. Atualizar manifest.json para desenvolvimento
log "Atualizando manifest.json..."
cp manifest.json dist-frontend/manifest.json

# 7. Criar arquivo de configuração de desenvolvimento
log "Criando configuração de desenvolvimento..."
cat > dist-frontend/dev-config.json << EOF
{
  "development": true,
  "version": "1.0.0",
  "buildDate": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "frontend": "React + TypeScript + Vite",
  "backend": "DevMentor AI Chrome Extension"
}
EOF

# 8. Verificar estrutura final
log "Verificando estrutura final..."
if [ -f "dist-frontend/popup.html" ] && [ -f "dist-frontend/options.html" ]; then
    success "Estrutura de build verificada com sucesso!"
else
    error "Arquivos essenciais não encontrados no build"
    exit 1
fi

# 9. Mostrar resumo
echo ""
echo "🎉 Build concluído com sucesso!"
echo ""
echo "📁 Estrutura final:"
echo "   dist-frontend/"
echo "   ├── popup.html          # Popup da extensão"
echo "   ├── options.html       # Página de configurações"
echo "   ├── popup.js           # Script do popup React"
echo "   ├── options.js         # Script das opções React"
echo "   ├── manifest.json      # Manifest da extensão"
echo "   ├── assets/            # Ícones e estilos"
echo "   ├── content/           # Content scripts"
echo "   ├── background/        # Service workers"
echo "   └── utils/             # Utilitários DevMentor AI"
echo ""
echo "🚀 Para testar a extensão:"
echo "   1. Abra chrome://extensions/"
echo "   2. Ative o 'Modo do desenvolvedor'"
echo "   3. Clique em 'Carregar sem compactação'"
echo "   4. Selecione a pasta 'dist-frontend'"
echo ""
echo "✨ Sua extensão DevMentor AI está pronta!"
