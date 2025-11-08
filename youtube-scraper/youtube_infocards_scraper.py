#!/usr/bin/env python3
"""
YouTube Info Cards Scraper
A command-line tool to scrape info cards from YouTube videos and store them in SQLite3.
"""

import argparse
import sqlite3
import sys
import json
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional
import yt_dlp


class InfoCardsDatabase:
    """Handles SQLite3 database operations for storing info cards."""

    def __init__(self, db_path: str = "youtube_infocards.db"):
        """Initialize database connection and create tables if needed."""
        self.db_path = db_path
        self.conn = sqlite3.connect(db_path)
        self.cursor = self.conn.cursor()
        self._create_tables()

    def _create_tables(self):
        """Create the necessary tables if they don't exist."""
        self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS videos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                video_id TEXT UNIQUE NOT NULL,
                video_url TEXT NOT NULL,
                video_title TEXT,
                duration INTEGER,
                uploader TEXT,
                upload_date TEXT,
                view_count INTEGER,
                scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')

        self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS info_cards (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                video_id TEXT NOT NULL,
                card_type TEXT,
                card_title TEXT,
                card_url TEXT,
                teaser_text TEXT,
                timestamp_start REAL,
                timestamp_end REAL,
                card_data TEXT,
                scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (video_id) REFERENCES videos(video_id)
            )
        ''')

        self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS end_screens (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                video_id TEXT NOT NULL,
                element_type TEXT,
                element_title TEXT,
                element_url TEXT,
                timestamp_start REAL,
                timestamp_end REAL,
                left REAL,
                top REAL,
                width REAL,
                height REAL,
                element_data TEXT,
                scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (video_id) REFERENCES videos(video_id)
            )
        ''')

        self.conn.commit()

    def insert_video(self, video_data: Dict) -> bool:
        """Insert or update video information."""
        try:
            self.cursor.execute('''
                INSERT OR REPLACE INTO videos
                (video_id, video_url, video_title, duration, uploader, upload_date, view_count)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (
                video_data.get('id'),
                video_data.get('webpage_url'),
                video_data.get('title'),
                video_data.get('duration'),
                video_data.get('uploader'),
                video_data.get('upload_date'),
                video_data.get('view_count')
            ))
            self.conn.commit()
            return True
        except Exception as e:
            print(f"Error inserting video: {e}")
            return False

    def insert_info_card(self, video_id: str, card: Dict) -> bool:
        """Insert an info card into the database."""
        try:
            self.cursor.execute('''
                INSERT INTO info_cards
                (video_id, card_type, card_title, card_url, teaser_text,
                 timestamp_start, timestamp_end, card_data)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                video_id,
                card.get('type'),
                card.get('title'),
                card.get('url'),
                card.get('teaser_text'),
                card.get('start_time'),
                card.get('end_time'),
                json.dumps(card)
            ))
            self.conn.commit()
            return True
        except Exception as e:
            print(f"Error inserting info card: {e}")
            return False

    def insert_end_screen(self, video_id: str, element: Dict) -> bool:
        """Insert an end screen element into the database."""
        try:
            self.cursor.execute('''
                INSERT INTO end_screens
                (video_id, element_type, element_title, element_url,
                 timestamp_start, timestamp_end, left, top, width, height, element_data)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                video_id,
                element.get('type'),
                element.get('title'),
                element.get('url'),
                element.get('startMs', 0) / 1000.0,
                element.get('endMs', 0) / 1000.0,
                element.get('left'),
                element.get('top'),
                element.get('width'),
                element.get('aspectRatio'),
                json.dumps(element)
            ))
            self.conn.commit()
            return True
        except Exception as e:
            print(f"Error inserting end screen: {e}")
            return False

    def get_video_cards(self, video_id: str) -> List[Dict]:
        """Retrieve all info cards for a specific video."""
        self.cursor.execute(
            'SELECT * FROM info_cards WHERE video_id = ?',
            (video_id,)
        )
        columns = [desc[0] for desc in self.cursor.description]
        return [dict(zip(columns, row)) for row in self.cursor.fetchall()]

    def get_video_end_screens(self, video_id: str) -> List[Dict]:
        """Retrieve all end screens for a specific video."""
        self.cursor.execute(
            'SELECT * FROM end_screens WHERE video_id = ?',
            (video_id,)
        )
        columns = [desc[0] for desc in self.cursor.description]
        return [dict(zip(columns, row)) for row in self.cursor.fetchall()]

    def list_all_videos(self) -> List[Dict]:
        """List all videos in the database."""
        self.cursor.execute('SELECT * FROM videos ORDER BY scraped_at DESC')
        columns = [desc[0] for desc in self.cursor.description]
        return [dict(zip(columns, row)) for row in self.cursor.fetchall()]

    def close(self):
        """Close the database connection."""
        self.conn.close()


class YouTubeInfoCardsScraper:
    """Scrapes info cards from YouTube videos using yt-dlp."""

    def __init__(self, db: InfoCardsDatabase):
        """Initialize the scraper with a database connection."""
        self.db = db

    def scrape_video(self, video_url: str, verbose: bool = False) -> Optional[Dict]:
        """
        Scrape info cards from a YouTube video.

        Args:
            video_url: YouTube video URL
            verbose: Enable verbose output

        Returns:
            Dictionary with scraped data or None if failed
        """
        ydl_opts = {
            'quiet': not verbose,
            'no_warnings': not verbose,
            'extract_flat': False,
            'skip_download': True,
            'writeinfojson': False,
        }

        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                print(f"Extracting video information from: {video_url}")
                info = ydl.extract_info(video_url, download=False)

                if not info:
                    print("Failed to extract video information")
                    return None

                video_id = info.get('id')
                print(f"Video ID: {video_id}")
                print(f"Title: {info.get('title')}")

                # Store video information
                self.db.insert_video(info)

                # Extract and store info cards
                cards_count = 0
                if 'cards' in info and info['cards']:
                    print(f"\nFound {len(info['cards'])} info card(s)")
                    for card in info['cards']:
                        if self.db.insert_info_card(video_id, card):
                            cards_count += 1
                            print(f"  - {card.get('type', 'unknown')}: {card.get('title', 'N/A')}")

                # Extract and store end screens
                endscreens_count = 0
                if 'endscreen' in info and info['endscreen']:
                    print(f"\nFound {len(info['endscreen'])} end screen element(s)")
                    for element in info['endscreen']:
                        if self.db.insert_end_screen(video_id, element):
                            endscreens_count += 1
                            print(f"  - {element.get('type', 'unknown')}: {element.get('title', 'N/A')}")

                # Also check for annotations and other interactive elements
                if 'annotations' in info and info['annotations']:
                    print(f"\nFound {len(info['annotations'])} annotation(s)")

                result = {
                    'video_id': video_id,
                    'video_title': info.get('title'),
                    'cards_count': cards_count,
                    'endscreens_count': endscreens_count
                }

                print(f"\nSuccessfully scraped video: {video_id}")
                print(f"Total info cards stored: {cards_count}")
                print(f"Total end screens stored: {endscreens_count}")

                return result

        except Exception as e:
            print(f"Error scraping video: {e}", file=sys.stderr)
            if verbose:
                import traceback
                traceback.print_exc()
            return None


def main():
    """Main entry point for the command-line interface."""
    parser = argparse.ArgumentParser(
        description='Scrape YouTube video info cards and store them in SQLite3',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog='''
Examples:
  # Scrape a single video
  %(prog)s https://www.youtube.com/watch?v=VIDEO_ID

  # Scrape with custom database path
  %(prog)s https://www.youtube.com/watch?v=VIDEO_ID --db my_database.db

  # List all videos in database
  %(prog)s --list

  # Show cards for a specific video
  %(prog)s --show VIDEO_ID
        '''
    )

    parser.add_argument(
        'url',
        nargs='?',
        help='YouTube video URL to scrape'
    )

    parser.add_argument(
        '--db',
        default='youtube_infocards.db',
        help='Path to SQLite database file (default: youtube_infocards.db)'
    )

    parser.add_argument(
        '--list',
        action='store_true',
        help='List all videos in the database'
    )

    parser.add_argument(
        '--show',
        metavar='VIDEO_ID',
        help='Show info cards for a specific video ID'
    )

    parser.add_argument(
        '-v', '--verbose',
        action='store_true',
        help='Enable verbose output'
    )

    args = parser.parse_args()

    # Initialize database
    db = InfoCardsDatabase(args.db)

    try:
        # List videos
        if args.list:
            videos = db.list_all_videos()
            if not videos:
                print("No videos in database")
            else:
                print(f"\nFound {len(videos)} video(s) in database:\n")
                for video in videos:
                    print(f"ID: {video['video_id']}")
                    print(f"Title: {video['video_title']}")
                    print(f"URL: {video['video_url']}")
                    print(f"Scraped: {video['scraped_at']}")
                    print("-" * 80)
            return 0

        # Show specific video
        if args.show:
            cards = db.get_video_cards(args.show)
            endscreens = db.get_video_end_screens(args.show)

            print(f"\nInfo cards for video {args.show}:")
            if not cards:
                print("  No info cards found")
            else:
                for card in cards:
                    print(f"\n  Card #{card['id']}:")
                    print(f"    Type: {card['card_type']}")
                    print(f"    Title: {card['card_title']}")
                    print(f"    URL: {card['card_url']}")
                    print(f"    Timestamp: {card['timestamp_start']}s")

            print(f"\nEnd screens for video {args.show}:")
            if not endscreens:
                print("  No end screens found")
            else:
                for screen in endscreens:
                    print(f"\n  Element #{screen['id']}:")
                    print(f"    Type: {screen['element_type']}")
                    print(f"    Title: {screen['element_title']}")
                    print(f"    URL: {screen['element_url']}")
                    print(f"    Timestamp: {screen['timestamp_start']}s - {screen['timestamp_end']}s")

            return 0

        # Scrape video
        if not args.url:
            parser.print_help()
            return 1

        scraper = YouTubeInfoCardsScraper(db)
        result = scraper.scrape_video(args.url, args.verbose)

        if result:
            return 0
        else:
            return 1

    finally:
        db.close()


if __name__ == '__main__':
    sys.exit(main())
