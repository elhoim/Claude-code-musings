# Telegram Archiver

A Python command-line tool to archive Telegram channel messages and media to a local SQLite database.

## Features

- **Archive Telegram channels**: Download all messages from public channels
- **Media archival**: Download and store photos, videos, documents, and other attachments
- **Deduplication**: Files are stored by SHA256 hash to avoid duplicates
- **SQLite database**: All messages stored in a structured, queryable database
- **Resume support**: Re-run archival to fetch new messages without duplicating existing ones
- **Channel statistics**: View archived channel statistics

## Prerequisites

- Python 3.7 or higher
- Telegram account with phone number
- Telegram API credentials (api_id and api_hash)

## Installation

1. Clone or navigate to the telegram-archiver directory:

```bash
cd telegram-archiver
```

2. Install required dependencies:

```bash
pip install -r requirements.txt
```

## Configuration

### Get Telegram API Credentials

1. Go to https://my.telegram.org/auth
2. Log in with your Telegram account
3. Navigate to "API development tools"
4. Create a new application to get your `api_id` and `api_hash`

### Set Up Environment Variables

1. Copy the example environment file:

```bash
cp .env.example .env
```

2. Edit `.env` and fill in your credentials:

```env
TELEGRAM_API_ID=your_api_id_here
TELEGRAM_API_HASH=your_api_hash_here
TELEGRAM_PHONE=+1234567890
```

Alternatively, run the config command to see setup instructions:

```bash
python main.py config
```

## Usage

### Archive a Channel

Archive all messages from a channel:

```bash
python main.py archive @channelname
```

Archive with a limit (e.g., last 1000 messages):

```bash
python main.py archive @channelname --limit 1000
```

Archive without downloading media:

```bash
python main.py archive @channelname --no-media
```

### List Archived Channels

View all archived channels and their statistics:

```bash
python main.py list
```

### First Run

On first run, you'll be prompted to authenticate with Telegram:
1. You'll receive a code via Telegram
2. Enter the code when prompted
3. If you have 2FA enabled, enter your password

After authentication, a session file will be created, and you won't need to authenticate again.

## Database Schema

The tool creates a SQLite database (`telegram_archive.db` by default) with the following tables:

### channels
Stores channel information:
- `id`: Telegram channel ID
- `username`: Channel username
- `title`: Channel title
- `about`: Channel description
- `participants_count`: Number of participants

### messages
Stores all archived messages:
- `id`: Database row ID
- `channel_id`: Reference to channels table
- `message_id`: Telegram message ID
- `date`: Message timestamp
- `text`: Message text
- `from_user_id`: Sender user ID
- `from_user_name`: Sender username/name
- `reply_to_msg_id`: ID of message this replies to
- `views`: View count
- `forwards`: Forward count
- `raw_data`: Complete message data as JSON

### attachments
Links messages to their media files:
- `id`: Database row ID
- `message_id`: Reference to messages table
- `file_sha256`: SHA256 hash of the file
- `file_name`: Original file name
- `file_size`: File size in bytes
- `mime_type`: MIME type
- `media_type`: Type of media (photo, document, etc.)

### files
Stores file metadata (deduplicated):
- `sha256`: SHA256 hash (primary key)
- `file_path`: Path to stored file
- `file_size`: File size in bytes

## File Storage

Media files are stored in the `file-archive/` directory with filenames based on their SHA256 hash. This ensures:
- No duplicate files are stored
- Files can be verified for integrity
- Efficient storage usage

## Examples

### Archive a news channel
```bash
python main.py archive @breakingnews
```

### Archive last 500 messages only
```bash
python main.py archive @mytechchannel --limit 500
```

### Archive messages without media (faster)
```bash
python main.py archive @textchannel --no-media
```

### View archived channels
```bash
python main.py list
```

## File Structure

```
telegram-archiver/
├── main.py              # CLI entry point
├── archiver.py          # Core archival logic
├── database.py          # Database management
├── config.py            # Configuration management
├── requirements.txt     # Python dependencies
├── .env                 # Your configuration (not in git)
├── .env.example         # Example configuration
├── telegram_archive.db  # SQLite database (created on first run)
└── file-archive/        # Media files (created on first run)
    ├── abc123...        # Files named by SHA256 hash
    └── def456...
```

## Troubleshooting

### "Error: TELEGRAM_API_ID not set"
Make sure you've created a `.env` file with your API credentials. Run `python main.py config` for instructions.

### Authentication Issues
- Ensure your phone number includes the country code (e.g., +1234567890)
- Check that you can receive messages on your Telegram account
- Delete the `.session` file and try authenticating again

### Rate Limiting
Telegram may rate-limit your requests. The tool automatically handles this by waiting when rate-limited.

### Channel Not Found
- Verify the channel username is correct
- Ensure the channel is public (private channels require membership)
- Try including or removing the @ symbol

## Privacy and Security

- API credentials are stored locally in `.env` (never commit this file)
- Session files contain authentication tokens (keep them secure)
- All data is stored locally on your machine
- No data is sent to third parties

## License

This tool is provided as-is for archival and backup purposes. Ensure you have the right to archive content from channels before using this tool.

## Contributing

Contributions are welcome! Please ensure:
- Code follows PEP 8 style guidelines
- New features include appropriate documentation
- Database schema changes are backward compatible
