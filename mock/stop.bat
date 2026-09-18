@echo off
set PORT=9999
set PID=

for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%PORT%" ^| findstr "LISTENING"') do set PID=%%a

if not "%PID%"=="" (
    taskkill /PID %PID% /F >nul 2>&1
    echo Moco stopped - PID %PID%
) else (
    echo Moco is not running on port %PORT%
)
