#!/bin/bash

# AI Chats Archive - Virtual Environment Initialization Script

VENV_DIR="venv"

# Check if virtual environment exists
if [ ! -d "$VENV_DIR" ]; then
    echo "Creating virtual environment..."
    python3 -m venv "$VENV_DIR"
    if [ $? -ne 0 ]; then
        echo "Failed to create virtual environment"
        exit 1
    fi
fi

# Activate virtual environment
echo "Activating virtual environment..."
source "$VENV_DIR/bin/activate"

# Install/update dependencies
if [ -f "requirements.txt" ]; then
    echo "Installing dependencies..."
    pip install -q --upgrade pip
    pip install -q -r requirements.txt
fi

echo "Virtual environment activated and ready!"
echo "Current Python: $(which python)"
echo "Python version: $(python --version)"
