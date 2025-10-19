@echo off
echo ========================================
echo Advanced EMI Calculator Pro
echo ========================================
echo.
echo Starting Backend Server...
start cmd /k "cd backend && python advanced_main.py"
timeout /t 3 /nobreak > nul
echo.
echo Starting Frontend Server...
start cmd /k "cd frontend && npm start"
echo.
echo ========================================
echo Both servers are starting...
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo ========================================
echo.
echo Press any key to exit this window...
pause > nul
