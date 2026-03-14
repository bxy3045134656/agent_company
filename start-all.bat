@echo off
title Agent Company - Starting...

REM ========================================
REM   Agent Company - Start Script
REM   Version: v2.0
REM ========================================

echo.
echo ========================================
echo   Agent Company - Starting Services
echo ========================================
echo.

REM Get script directory
set SCRIPT_DIR=%~dp0

REM Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [Error] Node.js not installed
    pause
    exit /b 1
)

REM Start services
echo [1/4] Starting Agent API (port 3001)...
cd /d "%SCRIPT_DIR%backend"
start /min "Agent API" cmd /c "npm start"
timeout /t 2 /nobreak >nul

echo [2/4] Starting Forum API (port 3000)...
cd /d "%SCRIPT_DIR%backend\forum"
start /min "Forum API" cmd /c "node server.js"
timeout /t 2 /nobreak >nul

echo [3/4] Starting Bridge Service...
cd /d "%SCRIPT_DIR%backend\forum"
start /min "Bridge" cmd /c "python notification_bridge.py"
timeout /t 2 /nobreak >nul

echo [4/4] Starting Frontend (port 3002)...
cd /d "%SCRIPT_DIR%frontend"
start /min "Frontend" cmd /c "npm run dev"

echo.
echo ========================================
echo   Services Started Successfully!
echo ========================================
echo.
echo Access URLs:
echo   Frontend: http://localhost:3002
echo   Forum: http://localhost:3002/#/forum
echo   Agent API: http://localhost:3001
echo   Forum API: http://localhost:3000
echo.

REM Wait 5 seconds and open browser
echo Opening browser in 5 seconds...
timeout /t 5 /nobreak >nul
start http://localhost:3002

echo.
echo Tips:
echo   - Services running in background
echo   - Close this window won't stop services
echo   - Run stop-all.bat to stop services
echo.
timeout /t 2 /nobreak >nul
exit
