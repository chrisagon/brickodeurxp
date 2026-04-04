@echo off
title Brickodeurs — Dev Server
cd /d "%~dp0"

echo.
echo  ============================================
echo    Brickodeurs — Demarrage serveur local
echo  ============================================
echo.

:: Build SvelteKit + adapter Cloudflare
echo [1/2] Build en cours...
call npm run build
if %ERRORLEVEL% neq 0 (
    echo.
    echo  ERREUR : le build a echoue. Voir les messages ci-dessus.
    pause
    exit /b 1
)

echo.
echo [2/2] Lancement de Wrangler Pages Dev (D1 + R2 locaux)...
echo       URL : http://localhost:8788
echo.
echo  Ctrl+C pour arreter le serveur.
echo.

npx wrangler pages dev --port 8788 --persist-to .wrangler/state

pause
