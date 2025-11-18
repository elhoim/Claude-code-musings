# Icons

The extension requires PNG icons in three sizes:
- icon16.png (16x16)
- icon48.png (48x48)
- icon128.png (128x128)

An SVG template is provided in `icon.svg`.

To generate the PNG icons from the SVG, you can use:

```bash
# Using ImageMagick
convert -background none icon.svg -resize 16x16 icon16.png
convert -background none icon.svg -resize 48x48 icon48.png
convert -background none icon.svg -resize 128x128 icon128.png

# Or using Inkscape
inkscape icon.svg -w 16 -h 16 -o icon16.png
inkscape icon.svg -w 48 -h 48 -o icon48.png
inkscape icon.svg -w 128 -h 128 -o icon128.png
```

For development, you can use any placeholder PNG images with the correct dimensions.
