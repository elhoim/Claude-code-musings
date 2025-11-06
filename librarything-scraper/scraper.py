#!/usr/bin/env python3
"""
LibraryThing Catalog Scraper

A command-line tool to scrape and store book data from LibraryThing user catalogs.
"""

import argparse
import sqlite3
import sys
import time
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Optional
from urllib.parse import urljoin, urlparse, parse_qs

import requests
from bs4 import BeautifulSoup


class LibraryThingScraper:
    """Scraper for LibraryThing user catalogs."""

    BASE_URL = "https://www.librarything.com"

    def __init__(self, db_path: str = "librarything.db", delay: float = 1.0):
        """
        Initialize the scraper.

        Args:
            db_path: Path to SQLite database file
            delay: Delay between requests in seconds (respect rate limiting)
        """
        self.db_path = db_path
        self.delay = delay
        self.session = requests.Session()
        # More realistic browser headers
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1',
            'Cache-Control': 'max-age=0',
        })
        self._init_database()

    def _init_database(self):
        """Initialize the SQLite database with required tables."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        # Create users table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                username TEXT PRIMARY KEY,
                last_updated TIMESTAMP,
                total_books INTEGER DEFAULT 0
            )
        ''')

        # Create books table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS books (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL,
                book_id TEXT,
                title TEXT NOT NULL,
                author TEXT,
                isbn TEXT,
                isbn13 TEXT,
                cover_url TEXT,
                rating REAL,
                user_rating REAL,
                date_added TEXT,
                tags TEXT,
                collections TEXT,
                comments TEXT,
                scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (username) REFERENCES users(username),
                UNIQUE(username, book_id)
            )
        ''')

        # Create indexes for better query performance
        cursor.execute('''
            CREATE INDEX IF NOT EXISTS idx_books_username
            ON books(username)
        ''')

        cursor.execute('''
            CREATE INDEX IF NOT EXISTS idx_books_title
            ON books(title)
        ''')

        cursor.execute('''
            CREATE INDEX IF NOT EXISTS idx_books_author
            ON books(author)
        ''')

        conn.commit()
        conn.close()

    def _fetch_page(self, url: str, max_retries: int = 3) -> Optional[BeautifulSoup]:
        """
        Fetch and parse a web page with retry logic.

        Args:
            url: URL to fetch
            max_retries: Maximum number of retry attempts

        Returns:
            BeautifulSoup object or None if request failed
        """
        for attempt in range(max_retries):
            try:
                print(f"Fetching: {url}" + (f" (attempt {attempt + 1}/{max_retries})" if attempt > 0 else ""))
                response = self.session.get(url, timeout=30, allow_redirects=True)

                if response.status_code == 403:
                    print(f"Access forbidden (403). LibraryThing may be blocking automated access.", file=sys.stderr)
                    print(f"Suggestion: Visit the URL manually in a browser and check if it's accessible:", file=sys.stderr)
                    print(f"  {url}", file=sys.stderr)
                    return None

                response.raise_for_status()
                time.sleep(self.delay)  # Respect rate limiting
                return BeautifulSoup(response.content, 'html.parser')

            except requests.RequestException as e:
                if attempt < max_retries - 1:
                    wait_time = 2 ** attempt  # Exponential backoff: 1s, 2s, 4s
                    print(f"Error fetching (attempt {attempt + 1}/{max_retries}): {e}", file=sys.stderr)
                    print(f"Waiting {wait_time}s before retry...", file=sys.stderr)
                    time.sleep(wait_time)
                else:
                    print(f"Error fetching {url} after {max_retries} attempts: {e}", file=sys.stderr)
                    return None

        return None

    def _extract_book_data(self, row) -> Optional[Dict]:
        """
        Extract book data from a catalog row.

        Args:
            row: BeautifulSoup element representing a book row

        Returns:
            Dictionary with book data or None if extraction failed
        """
        try:
            book_data = {}

            # Extract book ID from the row
            book_id = row.get('id', '')
            if book_id.startswith('book_'):
                book_data['book_id'] = book_id.replace('book_', '')

            # Extract title
            title_elem = row.find('a', class_='title')
            if not title_elem:
                title_elem = row.find(class_='booktitle')
            if title_elem:
                book_data['title'] = title_elem.get_text(strip=True)

            # Extract author
            author_elem = row.find('a', class_='author')
            if not author_elem:
                author_elem = row.find(class_='person')
            if author_elem:
                book_data['author'] = author_elem.get_text(strip=True)

            # Extract cover URL
            cover_elem = row.find('img', class_='cover')
            if not cover_elem:
                cover_elem = row.find('img', src=True)
            if cover_elem and cover_elem.get('src'):
                book_data['cover_url'] = urljoin(self.BASE_URL, cover_elem['src'])

            # Extract rating
            rating_elem = row.find(class_='rating')
            if rating_elem:
                rating_text = rating_elem.get_text(strip=True)
                try:
                    book_data['rating'] = float(rating_text)
                except ValueError:
                    pass

            # Extract user rating (stars given by the user)
            user_rating_elem = row.find('span', class_='user_rating')
            if not user_rating_elem:
                user_rating_elem = row.find('div', class_='stars')
            if user_rating_elem:
                # Count filled stars
                stars = user_rating_elem.find_all('span', class_='star_filled')
                if stars:
                    book_data['user_rating'] = float(len(stars))

            # Extract tags
            tags_elem = row.find_all('a', class_='tag')
            if tags_elem:
                book_data['tags'] = ', '.join([tag.get_text(strip=True) for tag in tags_elem])

            # Extract collections
            collections_elem = row.find('span', class_='collections')
            if collections_elem:
                book_data['collections'] = collections_elem.get_text(strip=True)

            # Extract date added
            date_elem = row.find('span', class_='date_added')
            if date_elem:
                book_data['date_added'] = date_elem.get_text(strip=True)

            return book_data if book_data.get('title') else None

        except Exception as e:
            print(f"Error extracting book data: {e}", file=sys.stderr)
            return None

    def _parse_catalog_page(self, soup: BeautifulSoup) -> List[Dict]:
        """
        Parse books from a catalog page.

        Args:
            soup: BeautifulSoup object of the catalog page

        Returns:
            List of book dictionaries
        """
        books = []

        # Try different possible selectors for book rows
        selectors = [
            {'class': 'book'},
            {'class': 'bookavcol'},
            {'class': 'catalogentry'},
            {'id': lambda x: x and x.startswith('book_')}
        ]

        for selector in selectors:
            rows = soup.find_all('div', selector)
            if rows:
                print(f"Found {len(rows)} books using selector: {selector}")
                for row in rows:
                    book_data = self._extract_book_data(row)
                    if book_data:
                        books.append(book_data)
                break

        # If no books found with div, try tr (table rows)
        if not books:
            rows = soup.find_all('tr', class_=['book', 'entry'])
            if rows:
                print(f"Found {len(rows)} books in table rows")
                for row in rows:
                    book_data = self._extract_book_data(row)
                    if book_data:
                        books.append(book_data)

        return books

    def _get_next_page_url(self, soup: BeautifulSoup, current_url: str) -> Optional[str]:
        """
        Find the URL for the next page of results.

        Args:
            soup: BeautifulSoup object of the current page
            current_url: Current page URL

        Returns:
            URL of next page or None if no next page
        """
        # Look for pagination links
        next_link = soup.find('a', string=lambda x: x and 'next' in x.lower())
        if not next_link:
            next_link = soup.find('a', class_='next')
        if not next_link:
            # Look for numbered pagination
            pagination = soup.find('div', class_='pagination')
            if pagination:
                links = pagination.find_all('a')
                for link in links:
                    if link.get_text(strip=True).isdigit():
                        # Get the last numbered link
                        next_link = link

        if next_link and next_link.get('href'):
            return urljoin(self.BASE_URL, next_link['href'])

        return None

    def scrape_user_catalog(self, username: str, update: bool = False) -> int:
        """
        Scrape all books from a user's catalog.

        Args:
            username: LibraryThing username
            update: If True, update existing records; if False, skip existing

        Returns:
            Number of books scraped
        """
        print(f"\nScraping catalog for user: {username}")
        print(f"Mode: {'Update' if update else 'New scrape'}")
        print("=" * 60)

        catalog_url = f"{self.BASE_URL}/catalog/{username}"
        total_books = 0
        page_num = 1

        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        # Update or create user record
        cursor.execute('''
            INSERT INTO users (username, last_updated, total_books)
            VALUES (?, ?, 0)
            ON CONFLICT(username) DO UPDATE SET last_updated = ?
        ''', (username, datetime.now(), datetime.now()))

        current_url = catalog_url

        while current_url:
            print(f"\nPage {page_num}:")
            soup = self._fetch_page(current_url)

            if not soup:
                print(f"Failed to fetch page {page_num}, stopping.")
                break

            books = self._parse_catalog_page(soup)

            if not books:
                print(f"No books found on page {page_num}")
                # Try to continue to next page anyway
                current_url = self._get_next_page_url(soup, current_url)
                if current_url:
                    page_num += 1
                    continue
                else:
                    break

            print(f"Found {len(books)} books on page {page_num}")

            # Insert books into database
            for book in books:
                try:
                    if update:
                        # Update or insert
                        cursor.execute('''
                            INSERT INTO books (
                                username, book_id, title, author, isbn, isbn13,
                                cover_url, rating, user_rating, date_added,
                                tags, collections, comments
                            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                            ON CONFLICT(username, book_id) DO UPDATE SET
                                title = excluded.title,
                                author = excluded.author,
                                isbn = excluded.isbn,
                                isbn13 = excluded.isbn13,
                                cover_url = excluded.cover_url,
                                rating = excluded.rating,
                                user_rating = excluded.user_rating,
                                date_added = excluded.date_added,
                                tags = excluded.tags,
                                collections = excluded.collections,
                                comments = excluded.comments,
                                scraped_at = CURRENT_TIMESTAMP
                        ''', (
                            username,
                            book.get('book_id', ''),
                            book.get('title', ''),
                            book.get('author', ''),
                            book.get('isbn', ''),
                            book.get('isbn13', ''),
                            book.get('cover_url', ''),
                            book.get('rating'),
                            book.get('user_rating'),
                            book.get('date_added', ''),
                            book.get('tags', ''),
                            book.get('collections', ''),
                            book.get('comments', '')
                        ))
                    else:
                        # Insert only if not exists
                        cursor.execute('''
                            INSERT OR IGNORE INTO books (
                                username, book_id, title, author, isbn, isbn13,
                                cover_url, rating, user_rating, date_added,
                                tags, collections, comments
                            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        ''', (
                            username,
                            book.get('book_id', ''),
                            book.get('title', ''),
                            book.get('author', ''),
                            book.get('isbn', ''),
                            book.get('isbn13', ''),
                            book.get('cover_url', ''),
                            book.get('rating'),
                            book.get('user_rating'),
                            book.get('date_added', ''),
                            book.get('tags', ''),
                            book.get('collections', ''),
                            book.get('comments', '')
                        ))

                    total_books += 1

                except sqlite3.Error as e:
                    print(f"Database error for book '{book.get('title', 'Unknown')}': {e}")

            conn.commit()

            # Find next page
            next_url = self._get_next_page_url(soup, current_url)
            if next_url and next_url != current_url:
                current_url = next_url
                page_num += 1
            else:
                break

        # Update total books count
        cursor.execute('''
            UPDATE users
            SET total_books = (
                SELECT COUNT(*) FROM books WHERE username = ?
            )
            WHERE username = ?
        ''', (username, username))

        conn.commit()
        conn.close()

        print("\n" + "=" * 60)
        print(f"Scraping complete! Total books processed: {total_books}")

        return total_books

    def get_user_stats(self, username: str) -> Optional[Dict]:
        """
        Get statistics for a user's catalog.

        Args:
            username: LibraryThing username

        Returns:
            Dictionary with user statistics
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        cursor.execute('''
            SELECT total_books, last_updated
            FROM users
            WHERE username = ?
        ''', (username,))

        result = cursor.fetchone()
        conn.close()

        if result:
            return {
                'total_books': result[0],
                'last_updated': result[1]
            }
        return None

    def list_books(self, username: str, limit: int = 10):
        """
        List books from a user's catalog.

        Args:
            username: LibraryThing username
            limit: Maximum number of books to display
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        cursor.execute('''
            SELECT title, author, user_rating, tags
            FROM books
            WHERE username = ?
            ORDER BY scraped_at DESC
            LIMIT ?
        ''', (username, limit))

        books = cursor.fetchall()
        conn.close()

        if books:
            print(f"\nBooks for user '{username}' (showing {len(books)}):")
            print("=" * 80)
            for i, (title, author, rating, tags) in enumerate(books, 1):
                print(f"{i}. {title}")
                if author:
                    print(f"   Author: {author}")
                if rating:
                    print(f"   Rating: {'★' * int(rating)}{'☆' * (5 - int(rating))}")
                if tags:
                    print(f"   Tags: {tags}")
                print()
        else:
            print(f"No books found for user '{username}'")


def main():
    """Main entry point for the CLI."""
    parser = argparse.ArgumentParser(
        description='Scrape book catalogs from LibraryThing',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog='''
Examples:
  %(prog)s elhoim                    # Scrape books for user 'elhoim'
  %(prog)s elhoim --update           # Update existing catalog
  %(prog)s elhoim --list             # List scraped books
  %(prog)s elhoim --stats            # Show catalog statistics
  %(prog)s elhoim --db mybooks.db    # Use custom database file
        '''
    )

    parser.add_argument(
        'username',
        help='LibraryThing username to scrape'
    )

    parser.add_argument(
        '--update',
        action='store_true',
        help='Update existing books in database'
    )

    parser.add_argument(
        '--db',
        default='librarything.db',
        help='Path to SQLite database file (default: librarything.db)'
    )

    parser.add_argument(
        '--delay',
        type=float,
        default=1.0,
        help='Delay between requests in seconds (default: 1.0)'
    )

    parser.add_argument(
        '--list',
        action='store_true',
        help='List books from the database'
    )

    parser.add_argument(
        '--limit',
        type=int,
        default=10,
        help='Number of books to list (default: 10)'
    )

    parser.add_argument(
        '--stats',
        action='store_true',
        help='Show statistics for the user'
    )

    args = parser.parse_args()

    scraper = LibraryThingScraper(db_path=args.db, delay=args.delay)

    if args.list:
        scraper.list_books(args.username, limit=args.limit)
    elif args.stats:
        stats = scraper.get_user_stats(args.username)
        if stats:
            print(f"\nStatistics for user '{args.username}':")
            print(f"  Total books: {stats['total_books']}")
            print(f"  Last updated: {stats['last_updated']}")
        else:
            print(f"No data found for user '{args.username}'")
    else:
        scraper.scrape_user_catalog(args.username, update=args.update)

        # Show stats after scraping
        stats = scraper.get_user_stats(args.username)
        if stats:
            print(f"\nDatabase now contains {stats['total_books']} books for '{args.username}'")


if __name__ == '__main__':
    main()
