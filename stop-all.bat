@echo off
title Agent Company - Stopping Services

echo.
echo ========================================
echo   Agent Company - Stop Services
echo ========================================
echo.

echo Stopping services by port...
echo.

REM Stop service on port 3002 (Frontend)
echo [1/4] Stopping Frontend (port 3002)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3002" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)
timeout /t 1 /nobreak >nul

REM Stop service on port 3001 (Agent API)
echo [2/4] Stopping Agent API (port 3001)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3001" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)
timeout /t 1 /nobreak >nul

REM Stop service on port 3000 (Forum API)
echo [3/4] Stopping Forum API (port 3000)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)
timeout /t 1 /nobreak >nul

REM Stop Bridge (Python process)
echo [4/4] Stopping Bridge service...
taskkill /F /IM python.exe /FI "WINDOWTITLE eq Bridge*" >nul 2>&1
timeout /t 1 /nobreak >nul

echo.
echo ========================================
echo   All Services Stopped
echo ========================================
echo.
echo Run start-all.bat to restart
echo.
exit
