@echo off
echo ========================================
echo Starting EMI Calculator
echo ========================================
echo.
echo This will open 2 terminal windows:
echo 1. Backend (FastAPI) - Port 8000
echo 2. Frontend (React) - Port 3000
echo.
echo Press any key to continue...
pause >nul

echo.
echo Starting Backend...
start "EMI Calculator - Backend" cmd /k "cd /d "%~dp0" && start-backend.bat"

echo Waiting 5 seconds for backend to start...
timeout /t 5 /nobreak >nul

echo.
echo Starting Frontend...
start "EMI Calculator - Frontend" cmd /k "cd /d "%~dp0" && start-frontend.bat"

echo.
echo ========================================
echo Both services are starting!
echo ========================================
echo.
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo API Docs: http://localhost:8000/docs
echo.
echo Press any key to exit this window...
pause >nul
