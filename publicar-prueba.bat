@echo off
chcp 65001 >nul
title Isariza Sabores - Publicar version de prueba (Vercel)
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo  Instala Node.js 20 LTS desde https://nodejs.org y vuelve a intentar.
  pause & exit /b 1
)

echo.
echo  Publicacion de PRUEBA gratuita en Vercel (plan Hobby).
echo  - La primera vez se abrira el navegador para iniciar sesion o crear la cuenta
echo    (puedes entrar con GitHub, Google o correo).
echo  - Responde Enter a las preguntas para aceptar los valores por defecto.
echo  - Los pagos usan el SIMULADOR, salvo que configures llaves sandbox de Wompi en Vercel.
echo.
set /p ADMINPASS= Escribe una clave para el panel /admin/pedidos: 
if "%ADMINPASS%"=="" set ADMINPASS=isariza-prueba

call npx --yes vercel@latest deploy --prod ^
  -e PAYMENT_SIMULATOR=true ^
  -e ADMIN_USER=admin ^
  -e ADMIN_PASSWORD=%ADMINPASS% ^
  -e WOMPI_ENV=sandbox

echo.
echo  Listo. La URL publica aparece arriba (termina en .vercel.app).
echo  Panel de pedidos: <URL>/admin/pedidos  (usuario: admin)
pause
