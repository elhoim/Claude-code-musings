#!/usr/bin/env python3
"""
Generate placeholder PNG icons for the Firefox extension.
Requires: pip install pillow
"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_icon(size, filename):
    """Create a simple placeholder icon with the given size."""
    # Create image with gradient background
    img = Image.new('RGB', (size, size), color='#667eea')
    draw = ImageDraw.Draw(img)

    # Draw a simple archive box shape
    margin = size // 8
    box_width = size - (margin * 2)
    box_height = size - (margin * 2)

    # Draw outer box
    draw.rectangle(
        [margin, margin, size - margin, size - margin],
        fill='#764ba2',
        outline='white',
        width=max(1, size // 32)
    )

    # Draw inner detail (simplified archive symbol)
    inner_margin = margin + size // 8
    draw.rectangle(
        [inner_margin, inner_margin + size // 6,
         size - inner_margin, inner_margin + size // 4],
        fill='white'
    )

    # Draw arrow pointing down (archive symbol)
    arrow_width = size // 4
    arrow_center = size // 2
    arrow_top = size // 2
    arrow_bottom = size - inner_margin - size // 8

    # Arrow line
    draw.line(
        [arrow_center, arrow_top, arrow_center, arrow_bottom],
        fill='white',
        width=max(2, size // 16)
    )

    # Arrow head
    arrow_head_size = size // 8
    draw.polygon(
        [
            (arrow_center, arrow_bottom),
            (arrow_center - arrow_head_size, arrow_bottom - arrow_head_size),
            (arrow_center + arrow_head_size, arrow_bottom - arrow_head_size)
        ],
        fill='white'
    )

    # Save the image
    img.save(filename, 'PNG')
    print(f"Created {filename} ({size}x{size})")

def main():
    """Generate all required icon sizes."""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    icons_dir = os.path.join(script_dir, 'icons')

    # Create icons directory if it doesn't exist
    os.makedirs(icons_dir, exist_ok=True)

    # Generate icons in different sizes
    sizes = [16, 48, 128]

    for size in sizes:
        filename = os.path.join(icons_dir, f'icon{size}.png')
        create_icon(size, filename)

    print("\nAll icons generated successfully!")
    print("Location:", icons_dir)

if __name__ == '__main__':
    try:
        main()
    except ImportError:
        print("Error: Pillow library not found.")
        print("Install it with: pip install pillow")
        exit(1)
