"""Configuration management for Telegram Archiver."""
import os
from pathlib import Path
from dotenv import load_dotenv


class Config:
    """Configuration manager for Telegram Archiver."""

    def __init__(self):
        """Initialize configuration from environment variables."""
        # Load .env file if it exists
        load_dotenv()

        # Telegram API credentials
        self.api_id = os.getenv('TELEGRAM_API_ID')
        self.api_hash = os.getenv('TELEGRAM_API_HASH')
        self.phone = os.getenv('TELEGRAM_PHONE')

        # Session file
        self.session_name = os.getenv('SESSION_NAME', 'telegram_archiver')

        # Database file
        self.db_path = os.getenv('DB_PATH', 'telegram_archive.db')

        # File archive directory
        self.file_archive_dir = os.getenv('FILE_ARCHIVE_DIR', 'file-archive')

        # Create file archive directory if it doesn't exist
        Path(self.file_archive_dir).mkdir(parents=True, exist_ok=True)

    def validate(self) -> bool:
        """Validate that required configuration is present.

        Returns:
            True if configuration is valid, False otherwise
        """
        if not self.api_id:
            print("Error: TELEGRAM_API_ID not set")
            return False

        if not self.api_hash:
            print("Error: TELEGRAM_API_HASH not set")
            return False

        if not self.phone:
            print("Error: TELEGRAM_PHONE not set")
            return False

        return True

    def print_instructions(self):
        """Print instructions for setting up configuration."""
        print("""
Telegram Archiver Configuration
================================

To use this tool, you need to set up your Telegram API credentials.

1. Get your API credentials:
   - Go to https://my.telegram.org/auth
   - Log in with your phone number
   - Go to 'API development tools'
   - Create a new application to get your api_id and api_hash

2. Create a .env file in the telegram-archiver directory with:

TELEGRAM_API_ID=your_api_id
TELEGRAM_API_HASH=your_api_hash
TELEGRAM_PHONE=your_phone_number_with_country_code

Example:
TELEGRAM_API_ID=12345678
TELEGRAM_API_HASH=abcdef1234567890abcdef1234567890
TELEGRAM_PHONE=+1234567890

Optional settings:
SESSION_NAME=telegram_archiver  # Session file name
DB_PATH=telegram_archive.db     # Database file path
FILE_ARCHIVE_DIR=file-archive   # Directory for attachments
        """)
