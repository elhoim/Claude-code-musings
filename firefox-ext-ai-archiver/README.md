# Claude.ai Conversation Archiver

A Firefox extension that archives your Claude.ai conversations and artifacts to a local database. Never lose your important conversations, code snippets, or generated artifacts again!

## Features

- **Automatic Conversation Extraction**: Captures all messages in a Claude.ai conversation
- **Artifact Archiving**: Downloads and stores code blocks, documents, and other artifacts
- **Local Storage**: Uses IndexedDB (SQLite-like structure) for local, private storage
- **Easy Export**: Export your entire database as JSON for backup or analysis
- **Context Menu Integration**: Right-click to quickly archive any conversation
- **Statistics Dashboard**: Track your archived conversations, messages, and artifacts
- **Privacy-Focused**: All data stays local on your machine

## Installation

### From Source (Development)

1. Clone or download this repository
2. Generate icon files (see `icons/README.md` for instructions)
3. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
4. Click "Load Temporary Add-on"
5. Navigate to the extension directory and select `manifest.json`

### For Distribution

Package the extension:
```bash
cd firefox-ext-ai-archiver
zip -r claude-archiver.zip * -x "*.git*" "*.md" "node_modules/*"
```

Then submit to [Firefox Add-ons](https://addons.mozilla.org/developers/).

## Usage

### Quick Start

1. Navigate to any conversation on [Claude.ai](https://claude.ai)
2. Click the extension icon in your toolbar
3. Click "Archive Current Conversation"
4. Your conversation is now safely archived!

### Features in Detail

#### Archiving Conversations

**Method 1: Extension Popup**
- Click the extension icon
- Click "Archive Current Conversation"
- View statistics and confirmation message

**Method 2: Context Menu**
- Right-click anywhere on a Claude.ai conversation page
- Select "Archive this Claude conversation"
- Receive a notification when archiving completes

#### Viewing Archived Conversations

1. Click the extension icon
2. Click "View Archived Conversations"
3. Browse your archived conversations by date
4. Click any conversation to open it on Claude.ai

#### Exporting Your Data

1. Click the extension icon
2. Click "Export Database"
3. Choose where to save the exported JSON file
4. Your data includes:
   - All conversation metadata
   - Complete message history
   - All archived artifacts
   - Timestamps and URLs

## Database Schema

The extension uses IndexedDB with the following structure:

### Conversations Table
- `id`: Auto-increment primary key
- `conversation_id`: Unique Claude conversation ID
- `url`: Full URL to the conversation
- `title`: Conversation title
- `created_at`: ISO 8601 timestamp
- `updated_at`: ISO 8601 timestamp

### Messages Table
- `id`: Auto-increment primary key
- `conversation_id`: Foreign key to conversations
- `message_index`: Position in conversation
- `role`: "user" or "assistant"
- `content`: Plain text content
- `html_content`: HTML formatted content
- `created_at`: ISO 8601 timestamp

### Artifacts Table
- `id`: Auto-increment primary key
- `conversation_id`: Foreign key to conversations
- `artifact_index`: Position in conversation
- `type`: "code", "svg", "image", "text"
- `language`: Programming language (for code)
- `content`: Plain text content
- `html_content`: HTML formatted content
- `created_at`: ISO 8601 timestamp

## Technical Details

### Permissions

The extension requires the following permissions:

- `storage`: For IndexedDB access
- `unlimitedStorage`: To store large conversations
- `downloads`: To export the database
- `activeTab`: To extract content from Claude.ai
- `https://claude.ai/*`: Host permission for Claude.ai

### Architecture

```
┌─────────────────┐
│   Content       │  Extracts conversation data from DOM
│   Script        │  Sends to background script
│  (content.js)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Background    │  Handles database operations
│   Script        │  Manages context menu
│ (background.js) │  Processes save/retrieve requests
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Database      │  IndexedDB wrapper
│   Module        │  CRUD operations
│ (database.js)   │  Export functionality
└─────────────────┘
         │
         ▼
┌─────────────────┐
│   Popup UI      │  User interface
│  (popup.html/   │  Statistics display
│   .js/.css)     │  Action buttons
└─────────────────┘
```

### File Structure

```
firefox-ext-ai-archiver/
├── manifest.json          # Extension configuration
├── background.js          # Background service worker
├── content.js            # Content script for Claude.ai
├── database.js           # IndexedDB wrapper module
├── popup.html            # Extension popup UI
├── popup.css             # Popup styling
├── popup.js              # Popup functionality
├── icons/                # Extension icons
│   ├── icon.svg         # SVG source
│   ├── icon16.png       # 16x16 icon
│   ├── icon48.png       # 48x48 icon
│   └── icon128.png      # 128x128 icon
└── README.md            # This file
```

## Development

### Prerequisites

- Firefox 109 or later (for Manifest V3 support)
- Basic understanding of JavaScript and browser extensions

### Building from Source

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd firefox-ext-ai-archiver
   ```

2. Generate icon files (requires ImageMagick or Inkscape):
   ```bash
   cd icons
   # Follow instructions in icons/README.md
   ```

3. Load in Firefox:
   - Open `about:debugging#/runtime/this-firefox`
   - Click "Load Temporary Add-on"
   - Select `manifest.json`

### Testing

1. Navigate to [Claude.ai](https://claude.ai)
2. Start or open a conversation
3. Open the extension popup
4. Test archiving functionality
5. Check browser console for any errors
6. Verify data in IndexedDB using Firefox DevTools

### Debugging

**View Extension Logs:**
- Open `about:debugging#/runtime/this-firefox`
- Find "Claude.ai Conversation Archiver"
- Click "Inspect" to open DevTools

**View IndexedDB:**
- Open Firefox DevTools (F12)
- Go to "Storage" tab
- Navigate to "IndexedDB" > "ClaudeConversationsDB"

**Common Issues:**

1. **Extraction fails**: Check if Claude.ai's DOM structure has changed
2. **Database errors**: Clear IndexedDB and try again
3. **Permission errors**: Ensure extension has proper permissions

## Privacy & Security

- **Local Storage**: All data is stored locally in IndexedDB
- **No Network Requests**: Extension doesn't send data anywhere
- **No Tracking**: No analytics or telemetry
- **Open Source**: All code is available for review

## Limitations

- Currently works only on Firefox (Chrome version would require adaptation)
- Relies on Claude.ai's DOM structure (may break with UI updates)
- Large conversations may take a moment to archive
- IndexedDB has browser-imposed storage limits (usually several GB)

## Future Enhancements

Potential features for future versions:

- [ ] Full-text search across archived conversations
- [ ] Tag and categorize conversations
- [ ] Bulk export/import functionality
- [ ] Markdown export for individual conversations
- [ ] Cloud sync options (optional)
- [ ] Chrome/Edge compatibility
- [ ] Automatic periodic archiving
- [ ] Conversation comparison and diff tools

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

### Development Guidelines

1. Follow existing code style
2. Test thoroughly on Firefox
3. Update documentation for new features
4. Ensure backward compatibility with existing databases

## License

MIT License - See LICENSE file for details

## Acknowledgments

- Built for the Claude.ai community
- Inspired by the need to preserve important AI conversations
- Uses IndexedDB for efficient local storage

## Support

For issues, questions, or feature requests:
- Open an issue on GitHub
- Check existing issues for solutions
- Review the debugging section above

## Changelog

### Version 1.0.0 (Initial Release)
- Conversation extraction from Claude.ai
- Artifact archiving (code blocks, etc.)
- IndexedDB storage with SQLite-like schema
- Extension popup with statistics
- Context menu integration
- Database export functionality
- Local-only, privacy-focused design
