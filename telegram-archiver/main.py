#!/usr/bin/env python3
"""Telegram Archiver - CLI tool to archive Telegram channel messages."""
import argparse
import asyncio
import sys

from config import Config
from archiver import TelegramArchiver


def main():
    """Main entry point for the CLI."""
    parser = argparse.ArgumentParser(
        description='Archive Telegram channel messages to a local SQLite database',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Archive all messages from a channel
  python main.py archive @channelname

  # Archive with a limit of 1000 messages
  python main.py archive @channelname --limit 1000

  # Archive without downloading media
  python main.py archive @channelname --no-media

  # List archived channels
  python main.py list

  # Show configuration instructions
  python main.py config
        """
    )

    subparsers = parser.add_subparsers(dest='command', help='Command to execute')

    # Archive command
    archive_parser = subparsers.add_parser(
        'archive',
        help='Archive messages from a channel'
    )
    archive_parser.add_argument(
        'channel',
        help='Channel username (with or without @)'
    )
    archive_parser.add_argument(
        '--limit',
        type=int,
        default=None,
        help='Maximum number of messages to archive (default: all)'
    )
    archive_parser.add_argument(
        '--no-media',
        action='store_true',
        help='Skip downloading media attachments'
    )

    # List command
    list_parser = subparsers.add_parser(
        'list',
        help='List archived channels'
    )

    # Config command
    config_parser = subparsers.add_parser(
        'config',
        help='Show configuration instructions'
    )

    args = parser.parse_args()

    # Show help if no command specified
    if not args.command:
        parser.print_help()
        sys.exit(1)

    # Load configuration
    config = Config()

    # Handle config command
    if args.command == 'config':
        config.print_instructions()
        sys.exit(0)

    # Validate configuration for other commands
    if not config.validate():
        print("\nConfiguration is incomplete. Run 'python main.py config' for setup instructions.")
        sys.exit(1)

    # Create archiver
    archiver = TelegramArchiver(config)

    # Execute command
    try:
        if args.command == 'archive':
            asyncio.run(run_archive(archiver, args))
        elif args.command == 'list':
            asyncio.run(run_list(archiver))

    except KeyboardInterrupt:
        print("\n\nOperation cancelled by user.")
        sys.exit(1)
    except Exception as e:
        print(f"\nError: {e}")
        sys.exit(1)


async def run_archive(archiver: TelegramArchiver, args):
    """Run the archive command.

    Args:
        archiver: TelegramArchiver instance
        args: Parsed command line arguments
    """
    await archiver.start()

    try:
        await archiver.archive_channel(
            channel_username=args.channel,
            limit=args.limit,
            download_media=not args.no_media
        )
    finally:
        await archiver.stop()


async def run_list(archiver: TelegramArchiver):
    """Run the list command.

    Args:
        archiver: TelegramArchiver instance
    """
    await archiver.start()

    try:
        await archiver.list_channels()
    finally:
        await archiver.stop()


if __name__ == '__main__':
    main()
