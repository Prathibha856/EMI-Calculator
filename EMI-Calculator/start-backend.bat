@echo off
echo ========================================
echo Starting EMI Calculator Backend
echo ========================================
echo.

cd backend

echo Activating virtual environment...
if exist venv\Scripts\activate.bat (
    call venv\Scripts\activate.bat
) else (
    echo Creating virtual environment...
    python -m venv venv
    call venv\Scripts\activate.bat
    echo Installing dependencies...
    pip install -r requirements.txt
)

echo.
echo Starting FastAPI server...
echo Backend will be available at: http://localhost:8000
echo API Documentation: http://localhost:8000/docs
echo.

uvicorn advanced_main:app --reload --host 0.0.0.0 --port 8000
