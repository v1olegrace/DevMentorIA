# 🚀 DevMentor AI - Build Script (PowerShell)
# Script para construir e integrar o frontend React com a extensão Chrome

Write-Host "🚀 Iniciando build do DevMentor AI..." -ForegroundColor Blue

# Verificar se estamos no diretório correto
if (-not (Test-Path "manifest.json")) {
    Write-Host "❌ Execute este script no diretório raiz do DevMentor AI" -ForegroundColor Red
    exit 1
}

# 1. Instalar dependências do frontend React
Write-Host "📦 Instalando dependências do frontend React..." -ForegroundColor Yellow
Set-Location "frontend-custom"

if (-not (Test-Path "package.json")) {
    Write-Host "❌ package.json não encontrado no frontend-custom" -ForegroundColor Red
    exit 1
}

# Verificar gerenciador de pacotes
if (Get-Command npm -ErrorAction SilentlyContinue) {
    npm install
} elseif (Get-Command yarn -ErrorAction SilentlyContinue) {
    yarn install
} elseif (Get-Command pnpm -ErrorAction SilentlyContinue) {
    pnpm install
} else {
    Write-Host "❌ Nenhum gerenciador de pacotes encontrado (npm, yarn, pnpm)" -ForegroundColor Red
    exit 1
}

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Falha na instalação das dependências" -ForegroundColor Red
    exit 1
}

# 2. Build do frontend React
Write-Host "🔨 Construindo frontend React..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Falha no build do frontend React" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Frontend React construído com sucesso!" -ForegroundColor Green

# 3. Voltar para o diretório raiz
Set-Location ".."

# 4. Copiar arquivos necessários
Write-Host "📁 Copiando arquivos para integração..." -ForegroundColor Yellow

# Criar diretório dist-frontend se não existir
if (-not (Test-Path "dist-frontend")) {
    New-Item -ItemType Directory -Name "dist-frontend" | Out-Null
}

# Copiar arquivos do build
if (Test-Path "frontend-custom/dist") {
    Copy-Item -Path "frontend-custom/dist/*" -Destination "dist-frontend/" -Recurse -Force
} elseif (Test-Path "frontend-custom/dist-frontend") {
    Copy-Item -Path "frontend-custom/dist-frontend/*" -Destination "dist-frontend/" -Recurse -Force
} else {
    Write-Host "❌ Diretório de build não encontrado" -ForegroundColor Red
    exit 1
}

# 5. Copiar assets necessários
Write-Host "🎨 Copiando assets..." -ForegroundColor Yellow
Copy-Item -Path "assets" -Destination "dist-frontend/" -Recurse -Force
Copy-Item -Path "content" -Destination "dist-frontend/" -Recurse -Force
Copy-Item -Path "background" -Destination "dist-frontend/" -Recurse -Force
Copy-Item -Path "utils" -Destination "dist-frontend/" -Recurse -Force

# 6. Atualizar manifest.json para desenvolvimento
Write-Host "📋 Atualizando manifest.json..." -ForegroundColor Yellow
Copy-Item -Path "manifest.json" -Destination "dist-frontend/manifest.json" -Force

# 7. Criar arquivo de configuração de desenvolvimento
Write-Host "⚙️ Criando configuração de desenvolvimento..." -ForegroundColor Yellow
$buildDate = Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ"
$config = @{
    development = $true
    version = "1.0.0"
    buildDate = $buildDate
    frontend = "React + TypeScript + Vite"
    backend = "DevMentor AI Chrome Extension"
} | ConvertTo-Json -Depth 2

$config | Out-File -FilePath "dist-frontend/dev-config.json" -Encoding UTF8

# 8. Verificar estrutura final
Write-Host "🔍 Verificando estrutura final..." -ForegroundColor Yellow
if ((Test-Path "dist-frontend/popup.html") -and (Test-Path "dist-frontend/options.html")) {
    Write-Host "✅ Estrutura de build verificada com sucesso!" -ForegroundColor Green
} else {
    Write-Host "❌ Arquivos essenciais não encontrados no build" -ForegroundColor Red
    exit 1
}

# 9. Mostrar resumo
Write-Host ""
Write-Host "🎉 Build concluído com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "📁 Estrutura final:" -ForegroundColor Cyan
Write-Host "   dist-frontend/"
Write-Host "   ├── popup.html          # Popup da extensão"
Write-Host "   ├── options.html       # Página de configurações"
Write-Host "   ├── popup.js           # Script do popup React"
Write-Host "   ├── options.js         # Script das opções React"
Write-Host "   ├── manifest.json      # Manifest da extensão"
Write-Host "   ├── assets/            # Ícones e estilos"
Write-Host "   ├── content/           # Content scripts"
Write-Host "   ├── background/        # Service workers"
Write-Host "   └── utils/             # Utilitários DevMentor AI"
Write-Host ""
Write-Host "🚀 Para testar a extensão:" -ForegroundColor Cyan
Write-Host "   1. Abra chrome://extensions/"
Write-Host "   2. Ative o 'Modo do desenvolvedor'"
Write-Host "   3. Clique em 'Carregar sem compactação'"
Write-Host "   4. Selecione a pasta 'dist-frontend'"
Write-Host ""
Write-Host "✨ Sua extensão DevMentor AI está pronta!" -ForegroundColor Green













