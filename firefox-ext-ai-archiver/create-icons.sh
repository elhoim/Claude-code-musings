#!/bin/bash

# Script to generate placeholder icons for the extension
# Requires ImageMagick to be installed

cd "$(dirname "$0")/icons"

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "ImageMagick is not installed. Please install it first:"
    echo "  Ubuntu/Debian: sudo apt-get install imagemagick"
    echo "  macOS: brew install imagemagick"
    echo "  Or use the SVG file with Inkscape"
    exit 1
fi

# Generate PNG icons from SVG
echo "Generating icon16.png..."
convert -background none icon.svg -resize 16x16 icon16.png

echo "Generating icon48.png..."
convert -background none icon.svg -resize 48x48 icon48.png

echo "Generating icon128.png..."
convert -background none icon.svg -resize 128x128 icon128.png

echo "Icons generated successfully!"
ls -lh icon*.png
