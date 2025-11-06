#!/usr/bin/env python3
"""
LibraryThing Catalog Scraper (Selenium Version)

Uses Selenium WebDriver to bypass anti-scraping measures by using a real browser.
"""

import argparse
import sqlite3
import sys
import time
from datetime import datetime
from typing import List, Dict, Optional

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException, WebDriverException
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup


class LibraryThingScraperSelenium:
    """Scraper for LibraryThing user catalogs using Selenium."""

    BASE_URL = "https://www.librarything.com"

    def __init__(self, db_path: str = "librarything.db", delay: float = 2.0, headless: bool = True):
        """
        Initialize the scraper.

        Args:
            db_path: Path to SQLite database file
            delay: Delay between requests in seconds
            headless: Run browser in headless mode
        """
        self.db_path = db_path
        self.delay = delay
        self.headless = headless
        self.driver = None
        self._init_database()

    def _init_browser(self):
        """Initialize Selenium WebDriver."""
        chrome_options = Options()

        if self.headless:
            chrome_options.add_argument("--headless=new")

        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-blink-features=AutomationControlled")
        chrome_options.add_argument("--window-size=1920,1080")
        chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
        chrome_options.add_experimental_option('useAutomationExtension', False)

        # Randomize user agent
        chrome_options.add_argument(
            'user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
            '(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
        )

        try:
            # Use webdriver-manager to automatically install ChromeDriver
            service = Service(ChromeDriverManager().install())
            self.driver = webdriver.Chrome(service=service, options=chrome_options)
            # Remove webdriver property
            self.driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
            print("Browser initialized successfully")
        except WebDriverException as e:
            print(f"\nError initializing browser: {e}", file=sys.stderr)
            print("\nPossible solutions:", file=sys.stderr)
            print("1. Install Chromium/Chrome browser:", file=sys.stderr)
            print("   sudo apt-get install chromium-browser", file=sys.stderr)
            print("   or", file=sys.stderr)
            print("   sudo apt-get install google-chrome-stable", file=sys.stderr)
            print("\n2. For Docker/headless environments, install additional dependencies:", file=sys.stderr)
            print("   sudo apt-get install chromium-browser chromium-chromedriver", file=sys.stderr)
            print("\n3. Use the simple scraper.py instead (may not work if site blocks it):", file=sys.stderr)
            print("   python scraper.py elhoim", file=sys.stderr)
            sys.exit(1)
        except Exception as e:
            print(f"Unexpected error: {e}", file=sys.stderr)
            sys.exit(1)

    def _init_database(self):
        """Initialize the SQLite database with required tables."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                username TEXT PRIMARY KEY,
                last_updated TIMESTAMP,
                total_books INTEGER DEFAULT 0
            )
        ''')

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

        cursor.execute('CREATE INDEX IF NOT EXISTS idx_books_username ON books(username)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_books_title ON books(title)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_books_author ON books(author)')

        conn.commit()
        conn.close()

    def _fetch_page(self, url: str) -> Optional[str]:
        """
        Fetch page HTML using Selenium.

        Args:
            url: URL to fetch

        Returns:
            Page HTML or None if failed
        """
        try:
            print(f"Fetching: {url}")
            self.driver.get(url)

            # Wait for page to load
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.TAG_NAME, "body"))
            )

            time.sleep(self.delay)  # Additional delay for dynamic content
            return self.driver.page_source

        except TimeoutException:
            print(f"Timeout loading page: {url}", file=sys.stderr)
            return None
        except Exception as e:
            print(f"Error fetching {url}: {e}", file=sys.stderr)
            return None

    def _extract_book_data(self, row) -> Optional[Dict]:
        """Extract book data from a catalog row."""
        try:
            book_data = {}

            # Extract book ID
            book_id = row.get('id', '')
            if book_id.startswith('book_'):
                book_data['book_id'] = book_id.replace('book_', '')

            # Extract title
            title_elem = row.find('a', class_='title')
            if not title_elem:
                title_elem = row.find(class_='booktitle')
            if not title_elem:
                title_elem = row.find('a', href=lambda x: x and '/work/' in str(x))
            if title_elem:
                book_data['title'] = title_elem.get_text(strip=True)

            # Extract author
            author_elem = row.find('a', class_='author')
            if not author_elem:
                author_elem = row.find(class_='person')
            if not author_elem:
                author_elem = row.find('a', href=lambda x: x and '/author/' in str(x))
            if author_elem:
                book_data['author'] = author_elem.get_text(strip=True)

            # Extract cover URL
            cover_elem = row.find('img', class_='cover')
            if not cover_elem:
                cover_elem = row.find('img', src=True)
            if cover_elem and cover_elem.get('src'):
                src = cover_elem['src']
                if not src.startswith('http'):
                    src = self.BASE_URL + src if src.startswith('/') else self.BASE_URL + '/' + src
                book_data['cover_url'] = src

            # Extract ratings
            rating_elem = row.find(class_='rating')
            if rating_elem:
                rating_text = rating_elem.get_text(strip=True)
                try:
                    book_data['rating'] = float(rating_text)
                except ValueError:
                    pass

            # Extract user rating
            user_rating_elem = row.find('span', class_='user_rating')
            if not user_rating_elem:
                user_rating_elem = row.find('div', class_='stars')
            if user_rating_elem:
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

    def _parse_catalog_page(self, html: str) -> List[Dict]:
        """Parse books from catalog page HTML."""
        soup = BeautifulSoup(html, 'html.parser')
        books = []

        # Try different selectors
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

        # Try table rows if no divs found
        if not books:
            rows = soup.find_all('tr', class_=['book', 'entry'])
            if rows:
                print(f"Found {len(rows)} books in table rows")
                for row in rows:
                    book_data = self._extract_book_data(row)
                    if book_data:
                        books.append(book_data)

        return books

    def scrape_user_catalog(self, username: str, update: bool = False, max_pages: int = None) -> int:
        """
        Scrape all books from a user's catalog.

        Args:
            username: LibraryThing username
            update: If True, update existing records
            max_pages: Maximum number of pages to scrape (None for all)

        Returns:
            Number of books scraped
        """
        print(f"\nScraping catalog for user: {username}")
        print(f"Mode: {'Update' if update else 'New scrape'}")
        print("=" * 60)

        self._init_browser()

        catalog_url = f"{self.BASE_URL}/catalog/{username}"
        total_books = 0
        page_num = 1

        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        cursor.execute('''
            INSERT INTO users (username, last_updated, total_books)
            VALUES (?, ?, 0)
            ON CONFLICT(username) DO UPDATE SET last_updated = ?
        ''', (username, datetime.now(), datetime.now()))

        try:
            current_url = catalog_url

            while current_url and (max_pages is None or page_num <= max_pages):
                print(f"\nPage {page_num}:")

                html = self._fetch_page(current_url)
                if not html:
                    print(f"Failed to fetch page {page_num}, stopping.")
                    break

                books = self._parse_catalog_page(html)

                if not books:
                    print(f"No books found on page {page_num}")
                    break

                print(f"Found {len(books)} books on page {page_num}")

                # Insert books into database
                for book in books:
                    try:
                        if update:
                            cursor.execute('''
                                INSERT INTO books (
                                    username, book_id, title, author, isbn, isbn13,
                                    cover_url, rating, user_rating, date_added,
                                    tags, collections, comments
                                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                                ON CONFLICT(username, book_id) DO UPDATE SET
                                    title = excluded.title,
                                    author = excluded.author,
                                    rating = excluded.rating,
                                    user_rating = excluded.user_rating,
                                    tags = excluded.tags,
                                    scraped_at = CURRENT_TIMESTAMP
                            ''', (
                                username, book.get('book_id', ''), book.get('title', ''),
                                book.get('author', ''), book.get('isbn', ''), book.get('isbn13', ''),
                                book.get('cover_url', ''), book.get('rating'), book.get('user_rating'),
                                book.get('date_added', ''), book.get('tags', ''),
                                book.get('collections', ''), book.get('comments', '')
                            ))
                        else:
                            cursor.execute('''
                                INSERT OR IGNORE INTO books (
                                    username, book_id, title, author, isbn, isbn13,
                                    cover_url, rating, user_rating, date_added,
                                    tags, collections, comments
                                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                            ''', (
                                username, book.get('book_id', ''), book.get('title', ''),
                                book.get('author', ''), book.get('isbn', ''), book.get('isbn13', ''),
                                book.get('cover_url', ''), book.get('rating'), book.get('user_rating'),
                                book.get('date_added', ''), book.get('tags', ''),
                                book.get('collections', ''), book.get('comments', '')
                            ))

                        total_books += 1

                    except sqlite3.Error as e:
                        print(f"Database error for book '{book.get('title', 'Unknown')}': {e}")

                conn.commit()

                # Check for next page
                try:
                    next_button = self.driver.find_elements(By.LINK_TEXT, "next")
                    if not next_button:
                        next_button = self.driver.find_elements(By.CLASS_NAME, "next")

                    if next_button and next_button[0].is_enabled():
                        current_url = next_button[0].get_attribute('href')
                        page_num += 1
                    else:
                        break
                except NoSuchElementException:
                    break

        finally:
            if self.driver:
                self.driver.quit()
                print("\nBrowser closed")

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
        """Get statistics for a user's catalog."""
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
            return {'total_books': result[0], 'last_updated': result[1]}
        return None

    def list_books(self, username: str, limit: int = 10):
        """List books from a user's catalog."""
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
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description='Scrape book catalogs from LibraryThing using Selenium',
        formatter_class=argparse.RawDescriptionHelpFormatter
    )

    parser.add_argument('username', help='LibraryThing username to scrape')
    parser.add_argument('--update', action='store_true', help='Update existing books')
    parser.add_argument('--db', default='librarything.db', help='Database file path')
    parser.add_argument('--delay', type=float, default=2.0, help='Delay between requests (seconds)')
    parser.add_argument('--list', action='store_true', help='List books from database')
    parser.add_argument('--limit', type=int, default=10, help='Number of books to list')
    parser.add_argument('--stats', action='store_true', help='Show user statistics')
    parser.add_argument('--max-pages', type=int, help='Maximum pages to scrape')
    parser.add_argument('--no-headless', action='store_true', help='Show browser window')

    args = parser.parse_args()

    scraper = LibraryThingScraperSelenium(
        db_path=args.db,
        delay=args.delay,
        headless=not args.no_headless
    )

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
        scraper.scrape_user_catalog(args.username, update=args.update, max_pages=args.max_pages)
        stats = scraper.get_user_stats(args.username)
        if stats:
            print(f"\nDatabase now contains {stats['total_books']} books for '{args.username}'")


if __name__ == '__main__':
    main()
