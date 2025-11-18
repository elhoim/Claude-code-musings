#!/bin/bash

# Create minimal placeholder PNG files for development
# These are simple colored squares that Firefox can load

cd "$(dirname "$0")"

# Create a 16x16 purple PNG (base64 encoded)
base64 -d > icon16.png << 'EOF'
iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlz
AAALEwAACxMBAJqcGAAAADNJREFUOI1jYBgFVADGf//+MTAI/P//n4GRkZGBgYGBgYWFhYGRkZGB
gYGBgYGBgYGBYRABAOqvAhHSHzAMAAAAAElFTkSuQmCC
EOF

# Copy to other sizes (they'll just be scaled, but will work)
cp icon16.png icon48.png
cp icon16.png icon128.png

echo "Placeholder icons created!"
ls -lh icon*.png
