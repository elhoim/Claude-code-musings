"""Database module for Telegram message archival."""
import sqlite3
from datetime import datetime
from typing import Optional, List, Dict, Any
import json


class Database:
    """SQLite database manager for archived messages."""

    def __init__(self, db_path: str = "telegram_archive.db"):
        """Initialize database connection.

        Args:
            db_path: Path to SQLite database file
        """
        self.db_path = db_path
        self.conn = sqlite3.connect(db_path)
        self.conn.row_factory = sqlite3.Row
        self.cursor = self.conn.cursor()
        self._create_tables()

    def _create_tables(self):
        """Create database tables if they don't exist."""
        # Channels table
        self.cursor.execute("""
            CREATE TABLE IF NOT EXISTS channels (
                id INTEGER PRIMARY KEY,
                username TEXT,
                title TEXT,
                about TEXT,
                participants_count INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Messages table
        self.cursor.execute("""
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY,
                channel_id INTEGER NOT NULL,
                message_id INTEGER NOT NULL,
                date TIMESTAMP NOT NULL,
                text TEXT,
                from_user_id INTEGER,
                from_user_name TEXT,
                reply_to_msg_id INTEGER,
                views INTEGER,
                forwards INTEGER,
                raw_data TEXT,
                archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (channel_id) REFERENCES channels(id),
                UNIQUE(channel_id, message_id)
            )
        """)

        # Attachments table
        self.cursor.execute("""
            CREATE TABLE IF NOT EXISTS attachments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                message_id INTEGER NOT NULL,
                file_sha256 TEXT NOT NULL,
                file_name TEXT,
                file_size INTEGER,
                mime_type TEXT,
                media_type TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (message_id) REFERENCES messages(id),
                UNIQUE(message_id, file_sha256)
            )
        """)

        # Files table (deduplicated storage)
        self.cursor.execute("""
            CREATE TABLE IF NOT EXISTS files (
                sha256 TEXT PRIMARY KEY,
                file_path TEXT NOT NULL,
                file_size INTEGER NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Create indexes for better query performance
        self.cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_messages_channel
            ON messages(channel_id)
        """)

        self.cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_messages_date
            ON messages(date)
        """)

        self.cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_attachments_message
            ON attachments(message_id)
        """)

        self.cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_attachments_sha256
            ON attachments(file_sha256)
        """)

        self.conn.commit()

    def add_channel(self, channel_id: int, username: str, title: str,
                    about: str = None, participants_count: int = None):
        """Add or update a channel in the database.

        Args:
            channel_id: Telegram channel ID
            username: Channel username
            title: Channel title
            about: Channel description
            participants_count: Number of participants
        """
        self.cursor.execute("""
            INSERT INTO channels (id, username, title, about, participants_count)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                username = excluded.username,
                title = excluded.title,
                about = excluded.about,
                participants_count = excluded.participants_count,
                updated_at = CURRENT_TIMESTAMP
        """, (channel_id, username, title, about, participants_count))
        self.conn.commit()

    def add_message(self, channel_id: int, message_id: int, date: datetime,
                   text: str = None, from_user_id: int = None,
                   from_user_name: str = None, reply_to_msg_id: int = None,
                   views: int = None, forwards: int = None,
                   raw_data: dict = None) -> int:
        """Add a message to the database.

        Args:
            channel_id: Channel ID
            message_id: Message ID
            date: Message date
            text: Message text
            from_user_id: Sender user ID
            from_user_name: Sender user name
            reply_to_msg_id: ID of message this is replying to
            views: View count
            forwards: Forward count
            raw_data: Raw message data as dict

        Returns:
            Database row ID of inserted message
        """
        raw_json = json.dumps(raw_data) if raw_data else None

        self.cursor.execute("""
            INSERT INTO messages (
                channel_id, message_id, date, text, from_user_id,
                from_user_name, reply_to_msg_id, views, forwards, raw_data
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(channel_id, message_id) DO UPDATE SET
                text = excluded.text,
                views = excluded.views,
                forwards = excluded.forwards,
                raw_data = excluded.raw_data
        """, (channel_id, message_id, date, text, from_user_id,
              from_user_name, reply_to_msg_id, views, forwards, raw_json))

        self.conn.commit()
        return self.cursor.lastrowid

    def add_attachment(self, message_id: int, file_sha256: str,
                      file_name: str = None, file_size: int = None,
                      mime_type: str = None, media_type: str = None):
        """Add an attachment record.

        Args:
            message_id: Database message ID
            file_sha256: SHA256 hash of file
            file_name: Original file name
            file_size: File size in bytes
            mime_type: MIME type
            media_type: Media type (photo, video, document, etc.)
        """
        self.cursor.execute("""
            INSERT INTO attachments (
                message_id, file_sha256, file_name, file_size,
                mime_type, media_type
            )
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(message_id, file_sha256) DO NOTHING
        """, (message_id, file_sha256, file_name, file_size,
              mime_type, media_type))
        self.conn.commit()

    def add_file(self, sha256: str, file_path: str, file_size: int):
        """Add a file record to the files table.

        Args:
            sha256: SHA256 hash of file
            file_path: Path where file is stored
            file_size: File size in bytes
        """
        self.cursor.execute("""
            INSERT INTO files (sha256, file_path, file_size)
            VALUES (?, ?, ?)
            ON CONFLICT(sha256) DO NOTHING
        """, (sha256, file_path, file_size))
        self.conn.commit()

    def file_exists(self, sha256: str) -> bool:
        """Check if a file with given SHA256 already exists.

        Args:
            sha256: SHA256 hash to check

        Returns:
            True if file exists, False otherwise
        """
        self.cursor.execute(
            "SELECT 1 FROM files WHERE sha256 = ?", (sha256,)
        )
        return self.cursor.fetchone() is not None

    def get_message_db_id(self, channel_id: int, message_id: int) -> Optional[int]:
        """Get database ID for a message.

        Args:
            channel_id: Channel ID
            message_id: Telegram message ID

        Returns:
            Database row ID or None if not found
        """
        self.cursor.execute("""
            SELECT id FROM messages
            WHERE channel_id = ? AND message_id = ?
        """, (channel_id, message_id))
        result = self.cursor.fetchone()
        return result[0] if result else None

    def get_channel_stats(self, channel_id: int) -> Dict[str, Any]:
        """Get statistics for a channel.

        Args:
            channel_id: Channel ID

        Returns:
            Dictionary with channel statistics
        """
        self.cursor.execute("""
            SELECT
                COUNT(*) as message_count,
                MIN(date) as first_message,
                MAX(date) as last_message
            FROM messages
            WHERE channel_id = ?
        """, (channel_id,))

        result = self.cursor.fetchone()

        self.cursor.execute("""
            SELECT COUNT(*) as attachment_count
            FROM attachments a
            JOIN messages m ON a.message_id = m.id
            WHERE m.channel_id = ?
        """, (channel_id,))

        attachments = self.cursor.fetchone()

        return {
            'message_count': result['message_count'],
            'first_message': result['first_message'],
            'last_message': result['last_message'],
            'attachment_count': attachments['attachment_count']
        }

    def close(self):
        """Close database connection."""
        self.conn.close()
