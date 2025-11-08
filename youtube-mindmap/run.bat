@echo off

REM YouTube Mind Map Generator - Run Script (Windows)

echo 🚀 Starting YouTube Mind Map Generator...
echo.

REM Check if virtual environment exists
if not exist "venv" (
    echo 📦 Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo 🔌 Activating virtual environment...
call venv\Scripts\activate.bat

REM Install/update dependencies
echo 📥 Installing dependencies...
pip install -q -r requirements.txt

REM Check for .env file
if not exist ".env" (
    echo ⚠️  Warning: .env file not found. Using basic concept extraction.
    echo    To use AI-powered extraction, copy .env.example to .env and add your OpenAI API key.
    echo.
)

REM Run the application
echo ✅ Starting server on http://localhost:5000
echo    Press Ctrl+C to stop
echo.
python app.py
