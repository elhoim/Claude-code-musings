#!/bin/bash

# YouTube Mind Map Generator - Run Script

echo "🚀 Starting YouTube Mind Map Generator..."
echo ""

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔌 Activating virtual environment..."
source venv/bin/activate

# Install/update dependencies
echo "📥 Installing dependencies..."
pip install -q -r requirements.txt

# Check for .env file
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found. Using basic concept extraction."
    echo "   To use AI-powered extraction, copy .env.example to .env and add your OpenAI API key."
    echo ""
fi

# Run the application
echo "✅ Starting server on http://localhost:5000"
echo "   Press Ctrl+C to stop"
echo ""
python app.py
