@echo off
chcp 65001 >nul
title Isariza Sabores - Tienda local
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo  No se encontro Node.js. Instala la version LTS ^(20 o superior^) desde https://nodejs.org
  echo  y vuelve a ejecutar este archivo.
  echo.
  pause
  exit /b 1
)

for /f "tokens=1 delims=v." %%v in ('node -v') do set NODEMAJOR=%%v
if %NODEMAJOR% LSS 20 (
  echo  Tu version de Node es muy antigua. Instala Node 20 LTS o superior.
  pause
  exit /b 1
)

if not exist ".env.local" (
  copy ".env.example" ".env.local" >nul
  echo  Se creo .env.local con la configuracion de prueba.
)

if not exist "node_modules" (
  echo  Instalando dependencias ^(solo la primera vez, 1-3 minutos^)...
  call npm install --no-audit --no-fund
  if errorlevel 1 (
    echo  Error instalando dependencias.
    pause
    exit /b 1
  )
)

echo.
echo  ==============================================
echo   Tienda:  http://localhost:3000
echo   Pedidos: http://localhost:3000/admin/pedidos
echo   Para detener: Ctrl + C
echo  ==============================================
echo.
start "" cmd /c "timeout /t 10 >nul & start http://localhost:3000"
call npm run dev
pause
