@echo off
if "%1"=="" (
    echo ========================================
    echo  ERRO: Username do GitHub necessário!
    echo ========================================
    echo.
    echo Uso: setup-github.bat SEU_USERNAME
    echo.
    echo Exemplo: setup-github.bat joaosilva
    echo.
    pause
    exit /b 1
)

set USERNAME=%1

echo ========================================
echo  DevMentor AI - GitHub Setup
echo ========================================
echo.
echo Username: %USERNAME%
echo Repository: devmentor-ai-hackathon
echo.

echo Conectando ao GitHub...
git remote add origin https://github.com/%USERNAME%/devmentor-ai-hackathon.git

echo.
echo Configurando branch principal...
git branch -M main

echo.
echo Fazendo push inicial...
git push -u origin main

echo.
echo ========================================
echo  🎉 SUCESSO! Repositório público criado!
echo ========================================
echo.
echo 🔗 Link do repositório:
echo https://github.com/%USERNAME%/devmentor-ai-hackathon
echo.
echo 📋 Próximos passos para o hackathon:
echo 1. Compartilhar link com seu amigo
echo 2. Testar instalação da extensão
echo 3. Praticar apresentação (5 minutos)
echo 4. Abrir demo: examples/premium-demo.html
echo.
echo 🏆 Boa sorte no hackathon!
echo.
pause
