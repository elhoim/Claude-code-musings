# YouTube Mind Map Generator 🧠

A modern, Python-based web application that automatically generates interactive, editable mind maps from YouTube video content. Extract key concepts and visualize them in a sleek, hierarchical structure with up to 2-3 levels.

![YouTube Mind Map Generator](https://img.shields.io/badge/Python-3.8+-blue.svg)
![Flask](https://img.shields.io/badge/Flask-3.0-green.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

## ✨ Features

- **🎥 YouTube Integration**: Simply paste any YouTube video URL
- **🤖 AI-Powered Analysis**: Automatically extracts key concepts using OpenAI (with fallback to basic extraction)
- **🎨 Modern, Sleek Interface**: Beautiful gradient design with smooth animations
- **✏️ Fully Editable**: Click on any node to edit, add, or remove concepts
- **📥 Multiple Export Formats**:
  - 🖼️ PNG (high-quality image)
  - 📄 FreeMind (.mm)
  - 📋 XMind (JSON format)
  - 📝 OPML (compatible with many mind map tools)
- **🔍 Zoom Controls**: Zoom in/out and reset view
- **⌨️ Keyboard Shortcuts**: Efficient navigation and editing
- **📱 Responsive Design**: Works on desktop, tablet, and mobile

## 🚀 Quick Start

### Prerequisites

- Python 3.8 or higher
- pip (Python package manager)
- (Optional) OpenAI API key for enhanced concept extraction

### Installation

1. **Clone or navigate to the project directory**:
   ```bash
   cd youtube-mindmap
   ```

2. **Create a virtual environment** (recommended):
   ```bash
   python -m venv venv

   # On Windows:
   venv\Scripts\activate

   # On macOS/Linux:
   source venv/bin/activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables** (optional):
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your OpenAI API key if you want AI-powered concept extraction:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```

   > **Note**: If you don't provide an API key, the app will use a basic keyword extraction algorithm.

5. **Run the application**:
   ```bash
   python app.py
   ```

6. **Open your browser** and navigate to:
   ```
   http://localhost:5000
   ```

## 📖 Usage Guide

### Creating a Mind Map

1. **Paste YouTube URL**: Enter any YouTube video link in the input field
2. **Generate**: Click the "Generate Mind Map" button
3. **Wait**: The app will extract the transcript and analyze key concepts (this may take 10-30 seconds)
4. **View & Edit**: Your interactive mind map will appear!

### Editing the Mind Map

- **Edit Node**: Double-click any node to edit its text
- **Add Child**: Select a node and press `Insert` key
- **Add Sibling**: Select a node and press `Enter` key
- **Delete Node**: Select a node and press `Delete` key
- **Toggle Expand/Collapse**: Click the fold/unfold icon or press `Space`

### Zoom Controls

- **Zoom In**: Click the zoom in button or press `Ctrl/Cmd + +`
- **Zoom Out**: Click the zoom out button or press `Ctrl/Cmd + -`
- **Reset View**: Click the reset button or press `Ctrl/Cmd + 0`

### Exporting

#### PNG Image
- Click "Export PNG" button
- High-quality image will be downloaded

#### Mind Map Formats
- Click "Export Mind Map" dropdown
- Choose your preferred format:
  - **FreeMind (.mm)**: Compatible with FreeMind and Freeplane
  - **XMind (JSON)**: Can be imported into XMind
  - **OPML**: Universal format supported by many tools

## 🏗️ Project Structure

```
youtube-mindmap/
├── app.py                  # Flask application and API endpoints
├── requirements.txt        # Python dependencies
├── .env.example           # Environment variables template
├── README.md              # This file
├── templates/
│   └── index.html         # Main HTML template
└── static/
    ├── css/
    │   └── style.css      # Modern styling
    └── js/
        └── app.js         # Client-side JavaScript
```

## 🔧 Configuration

### Environment Variables

- `OPENAI_API_KEY`: (Optional) Your OpenAI API key for AI-powered concept extraction

### Flask Configuration

Edit `app.py` to modify:
- Port (default: 5000)
- Host (default: 0.0.0.0)
- Max content length
- Debug mode

## 🎨 Customization

### Changing Colors

Edit `static/css/style.css` and modify the CSS variables:
```css
:root {
    --primary-color: #6366f1;
    --secondary-color: #ec4899;
    --background: #0f172a;
    /* ... more variables ... */
}
```

### Adjusting Mind Map Appearance

Edit `static/js/app.js` and modify the jsMind options:
```javascript
const options = {
    view: {
        line_color: '#6366f1',
        line_width: 2
    },
    layout: {
        hspace: 80,
        vspace: 40
    }
};
```

## 🐛 Troubleshooting

### "Could not retrieve transcript"
- **Cause**: Video doesn't have captions/transcript
- **Solution**: Try a different video with available transcripts

### "Invalid YouTube URL"
- **Cause**: URL format not recognized
- **Solution**: Use standard YouTube URLs (youtube.com/watch?v=... or youtu.be/...)

### Concept extraction is basic/generic
- **Cause**: OpenAI API key not configured
- **Solution**: Add your OpenAI API key to `.env` file

### Port 5000 already in use
- **Solution**: Change the port in `app.py`:
  ```python
  app.run(debug=True, host='0.0.0.0', port=8000)
  ```

## 🔒 Privacy & Security

- No data is stored permanently on the server
- Transcripts are processed in-memory only
- OpenAI API calls are made securely over HTTPS
- No video content is downloaded, only transcripts

## 📝 Dependencies

- **Flask**: Web framework
- **youtube-transcript-api**: Extract transcripts from YouTube
- **openai**: AI-powered concept extraction
- **python-dotenv**: Environment variable management
- **jsMind**: Client-side mind map visualization
- **html2canvas**: PNG export functionality

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- [jsMind](https://github.com/hizzgdev/jsmind) for the mind map library
- [youtube-transcript-api](https://github.com/jdepoix/youtube-transcript-api) for transcript extraction
- [Flask](https://flask.palletsprojects.com/) for the web framework
- OpenAI for AI-powered analysis

## 📧 Support

For issues, questions, or suggestions, please open an issue on GitHub.

---

Made with ❤️ and Python
