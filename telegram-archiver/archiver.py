"""Telegram message archiver."""
import asyncio
import hashlib
import os
from pathlib import Path
from typing import Optional, List
from datetime import datetime

from telethon import TelegramClient
from telethon.tl.types import (
    Channel, MessageMediaPhoto, MessageMediaDocument,
    MessageMediaWebPage, User
)
from telethon.errors import FloodWaitError

from database import Database
from config import Config


class TelegramArchiver:
    """Archiver for Telegram messages and attachments."""

    def __init__(self, config: Config):
        """Initialize the archiver.

        Args:
            config: Configuration object
        """
        self.config = config
        self.client = TelegramClient(
            config.session_name,
            config.api_id,
            config.api_hash
        )
        self.db = Database(config.db_path)
        self.file_archive_dir = Path(config.file_archive_dir)
        self.file_archive_dir.mkdir(parents=True, exist_ok=True)

    async def start(self):
        """Start the Telegram client and authenticate."""
        await self.client.start(phone=self.config.phone)
        print("Connected to Telegram successfully!")

    async def stop(self):
        """Stop the client and close database."""
        await self.client.disconnect()
        self.db.close()

    async def join_channel(self, channel_username: str) -> Optional[Channel]:
        """Join a channel and return the channel entity.

        Args:
            channel_username: Channel username (with or without @)

        Returns:
            Channel entity or None if failed
        """
        try:
            # Remove @ if present
            if channel_username.startswith('@'):
                channel_username = channel_username[1:]

            # Get the channel entity
            entity = await self.client.get_entity(channel_username)

            if isinstance(entity, Channel):
                print(f"Joined channel: {entity.title}")

                # Save channel info to database
                self.db.add_channel(
                    channel_id=entity.id,
                    username=channel_username,
                    title=entity.title,
                    about=getattr(entity, 'about', None),
                    participants_count=getattr(entity, 'participants_count', None)
                )

                return entity
            else:
                print(f"Error: {channel_username} is not a channel")
                return None

        except Exception as e:
            print(f"Error joining channel {channel_username}: {e}")
            return None

    def _calculate_sha256(self, file_path: Path) -> str:
        """Calculate SHA256 hash of a file.

        Args:
            file_path: Path to file

        Returns:
            SHA256 hash as hex string
        """
        sha256_hash = hashlib.sha256()
        with open(file_path, "rb") as f:
            for byte_block in iter(lambda: f.read(4096), b""):
                sha256_hash.update(byte_block)
        return sha256_hash.hexdigest()

    async def _download_media(self, message, message_db_id: int) -> Optional[str]:
        """Download media from a message and save with SHA256 filename.

        Args:
            message: Telegram message object
            message_db_id: Database ID of the message

        Returns:
            SHA256 hash of the file or None if no media
        """
        if not message.media:
            return None

        try:
            # Determine media type and get file info
            media_type = None
            file_name = None
            mime_type = None
            file_size = None

            if isinstance(message.media, MessageMediaPhoto):
                media_type = 'photo'
                file_name = f'photo_{message.id}.jpg'
                mime_type = 'image/jpeg'

            elif isinstance(message.media, MessageMediaDocument):
                media_type = 'document'
                doc = message.media.document
                file_size = doc.size

                # Get file name from attributes
                for attr in doc.attributes:
                    if hasattr(attr, 'file_name'):
                        file_name = attr.file_name
                        break

                if not file_name:
                    file_name = f'document_{message.id}'

                mime_type = doc.mime_type

            elif isinstance(message.media, MessageMediaWebPage):
                # Skip web page previews
                return None

            else:
                # Other media types
                media_type = type(message.media).__name__
                file_name = f'{media_type}_{message.id}'

            # Download to temporary file
            temp_file = self.file_archive_dir / f'temp_{message.id}'
            path = await self.client.download_media(message, file=str(temp_file))

            if path:
                # Calculate SHA256
                sha256 = self._calculate_sha256(Path(path))

                # Final file path
                final_path = self.file_archive_dir / sha256

                # Check if file already exists
                if not self.db.file_exists(sha256):
                    # Move temp file to final location
                    os.rename(path, final_path)

                    # Get actual file size
                    if not file_size:
                        file_size = final_path.stat().st_size

                    # Add to files table
                    self.db.add_file(
                        sha256=sha256,
                        file_path=str(final_path.relative_to(Path.cwd())),
                        file_size=file_size
                    )
                    print(f"  Downloaded: {file_name} -> {sha256}")
                else:
                    # File already exists, remove temp file
                    if os.path.exists(path):
                        os.remove(path)
                    print(f"  Skipped (duplicate): {file_name} -> {sha256}")

                # Add attachment record
                self.db.add_attachment(
                    message_id=message_db_id,
                    file_sha256=sha256,
                    file_name=file_name,
                    file_size=file_size,
                    mime_type=mime_type,
                    media_type=media_type
                )

                return sha256

        except FloodWaitError as e:
            print(f"  Rate limited. Waiting {e.seconds} seconds...")
            await asyncio.sleep(e.seconds)
            return await self._download_media(message, message_db_id)

        except Exception as e:
            print(f"  Error downloading media: {e}")
            return None

        return None

    async def archive_channel(self, channel_username: str,
                             limit: Optional[int] = None,
                             download_media: bool = True):
        """Archive all messages from a channel.

        Args:
            channel_username: Channel username
            limit: Maximum number of messages to archive (None for all)
            download_media: Whether to download media attachments
        """
        channel = await self.join_channel(channel_username)
        if not channel:
            return

        print(f"\nArchiving messages from {channel.title}...")
        print(f"Download media: {download_media}")
        if limit:
            print(f"Limit: {limit} messages")

        message_count = 0
        media_count = 0

        try:
            async for message in self.client.iter_messages(channel, limit=limit):
                # Extract message data
                message_text = message.message if message.message else None

                # Get sender info
                from_user_id = None
                from_user_name = None

                if message.sender:
                    if isinstance(message.sender, User):
                        from_user_id = message.sender.id
                        from_user_name = message.sender.username or \
                                        f"{message.sender.first_name or ''} {message.sender.last_name or ''}".strip()

                # Save message to database
                message_db_id = self.db.add_message(
                    channel_id=channel.id,
                    message_id=message.id,
                    date=message.date,
                    text=message_text,
                    from_user_id=from_user_id,
                    from_user_name=from_user_name,
                    reply_to_msg_id=message.reply_to_msg_id if hasattr(message, 'reply_to_msg_id') else None,
                    views=message.views if hasattr(message, 'views') else None,
                    forwards=message.forwards if hasattr(message, 'forwards') else None,
                    raw_data=message.to_dict() if hasattr(message, 'to_dict') else None
                )

                message_count += 1

                # Download media if present
                if download_media and message.media:
                    sha256 = await self._download_media(message, message_db_id)
                    if sha256:
                        media_count += 1

                # Progress update every 100 messages
                if message_count % 100 == 0:
                    print(f"Processed {message_count} messages, {media_count} media files...")

        except Exception as e:
            print(f"Error archiving channel: {e}")

        print(f"\nArchiving complete!")
        print(f"Total messages: {message_count}")
        print(f"Total media files: {media_count}")

        # Print channel statistics
        stats = self.db.get_channel_stats(channel.id)
        print(f"\nChannel Statistics:")
        print(f"  Messages in DB: {stats['message_count']}")
        print(f"  Attachments: {stats['attachment_count']}")
        print(f"  Date range: {stats['first_message']} to {stats['last_message']}")

    async def list_channels(self):
        """List all archived channels."""
        self.db.cursor.execute("""
            SELECT id, username, title, participants_count, updated_at
            FROM channels
            ORDER BY updated_at DESC
        """)

        channels = self.db.cursor.fetchall()

        if not channels:
            print("No channels archived yet.")
            return

        print("\nArchived Channels:")
        print("-" * 80)

        for channel in channels:
            stats = self.db.get_channel_stats(channel['id'])
            print(f"\nChannel: {channel['title']}")
            print(f"  Username: @{channel['username']}")
            print(f"  Messages: {stats['message_count']}")
            print(f"  Attachments: {stats['attachment_count']}")
            print(f"  Last updated: {channel['updated_at']}")
