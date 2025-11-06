#!/usr/bin/env python3
"""
Demo data populator for LibraryThing scraper.

This script populates the database with sample book data to demonstrate
the functionality when live scraping is blocked.
"""

import sqlite3
from datetime import datetime


def populate_demo_data(db_path: str = "librarything.db"):
    """Populate database with demo book data."""

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Add demo user
    username = "elhoim"
    cursor.execute('''
        INSERT OR REPLACE INTO users (username, last_updated, total_books)
        VALUES (?, ?, ?)
    ''', (username, datetime.now(), 0))

    # Sample books data
    demo_books = [
        {
            'book_id': '1001',
            'title': 'The Lord of the Rings',
            'author': 'J.R.R. Tolkien',
            'isbn': '0618640150',
            'isbn13': '9780618640157',
            'rating': 4.5,
            'user_rating': 5.0,
            'tags': 'fantasy, epic, classic',
            'collections': 'Your library',
            'date_added': '2020-01-15'
        },
        {
            'book_id': '1002',
            'title': 'The Hitchhiker\'s Guide to the Galaxy',
            'author': 'Douglas Adams',
            'isbn': '0345391802',
            'isbn13': '9780345391803',
            'rating': 4.2,
            'user_rating': 5.0,
            'tags': 'science fiction, humor, classic',
            'collections': 'Your library',
            'date_added': '2020-02-20'
        },
        {
            'book_id': '1003',
            'title': 'Dune',
            'author': 'Frank Herbert',
            'isbn': '0441172717',
            'isbn13': '9780441172719',
            'rating': 4.3,
            'user_rating': 4.0,
            'tags': 'science fiction, desert, politics',
            'collections': 'Your library',
            'date_added': '2020-03-10'
        },
        {
            'book_id': '1004',
            'title': '1984',
            'author': 'George Orwell',
            'isbn': '0451524934',
            'isbn13': '9780451524935',
            'rating': 4.6,
            'user_rating': 5.0,
            'tags': 'dystopia, classic, politics',
            'collections': 'Your library',
            'date_added': '2020-04-05'
        },
        {
            'book_id': '1005',
            'title': 'The Name of the Wind',
            'author': 'Patrick Rothfuss',
            'isbn': '0756404746',
            'isbn13': '9780756404741',
            'rating': 4.5,
            'user_rating': 5.0,
            'tags': 'fantasy, magic, adventure',
            'collections': 'Your library',
            'date_added': '2020-05-12'
        },
        {
            'book_id': '1006',
            'title': 'Neuromancer',
            'author': 'William Gibson',
            'isbn': '0441569595',
            'isbn13': '9780441569595',
            'rating': 4.0,
            'user_rating': 4.0,
            'tags': 'cyberpunk, science fiction, ai',
            'collections': 'Your library',
            'date_added': '2020-06-18'
        },
        {
            'book_id': '1007',
            'title': 'The Martian',
            'author': 'Andy Weir',
            'isbn': '0553418025',
            'isbn13': '9780553418026',
            'rating': 4.4,
            'user_rating': 5.0,
            'tags': 'science fiction, mars, survival',
            'collections': 'Your library',
            'date_added': '2020-07-22'
        },
        {
            'book_id': '1008',
            'title': 'Foundation',
            'author': 'Isaac Asimov',
            'isbn': '0553293354',
            'isbn13': '9780553293357',
            'rating': 4.2,
            'user_rating': 4.0,
            'tags': 'science fiction, space opera, classic',
            'collections': 'Your library',
            'date_added': '2020-08-30'
        },
        {
            'book_id': '1009',
            'title': 'Good Omens',
            'author': 'Terry Pratchett, Neil Gaiman',
            'isbn': '0060853980',
            'isbn13': '9780060853983',
            'rating': 4.3,
            'user_rating': 5.0,
            'tags': 'humor, fantasy, apocalypse',
            'collections': 'Your library',
            'date_added': '2020-09-15'
        },
        {
            'book_id': '1010',
            'title': 'Snow Crash',
            'author': 'Neal Stephenson',
            'isbn': '0553380958',
            'isbn13': '9780553380958',
            'rating': 4.0,
            'user_rating': 4.0,
            'tags': 'cyberpunk, virtual reality, linguistics',
            'collections': 'Your library',
            'date_added': '2020-10-20'
        },
        {
            'book_id': '1011',
            'title': 'The Way of Kings',
            'author': 'Brandon Sanderson',
            'isbn': '0765326353',
            'isbn13': '9780765326355',
            'rating': 4.6,
            'user_rating': 5.0,
            'tags': 'fantasy, epic, magic system',
            'collections': 'Your library',
            'date_added': '2020-11-25'
        },
        {
            'book_id': '1012',
            'title': 'Ender\'s Game',
            'author': 'Orson Scott Card',
            'isbn': '0812550706',
            'isbn13': '9780812550702',
            'rating': 4.3,
            'user_rating': 5.0,
            'tags': 'science fiction, military, children',
            'collections': 'Your library',
            'date_added': '2020-12-30'
        },
        {
            'book_id': '1013',
            'title': 'American Gods',
            'author': 'Neil Gaiman',
            'isbn': '0380789035',
            'isbn13': '9780380789030',
            'rating': 4.1,
            'user_rating': 4.0,
            'tags': 'fantasy, mythology, america',
            'collections': 'Your library',
            'date_added': '2021-01-14'
        },
        {
            'book_id': '1014',
            'title': 'The Silmarillion',
            'author': 'J.R.R. Tolkien',
            'isbn': '0618391118',
            'isbn13': '9780618391110',
            'rating': 3.9,
            'user_rating': 4.0,
            'tags': 'fantasy, mythology, middle-earth',
            'collections': 'Your library',
            'date_added': '2021-02-20'
        },
        {
            'book_id': '1015',
            'title': 'Hyperion',
            'author': 'Dan Simmons',
            'isbn': '0553283685',
            'isbn13': '9780553283686',
            'rating': 4.2,
            'user_rating': 5.0,
            'tags': 'science fiction, space opera, pilgrimage',
            'collections': 'Your library',
            'date_added': '2021-03-15'
        }
    ]

    # Insert demo books
    for book in demo_books:
        cursor.execute('''
            INSERT OR REPLACE INTO books (
                username, book_id, title, author, isbn, isbn13,
                rating, user_rating, date_added, tags, collections
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            username,
            book['book_id'],
            book['title'],
            book['author'],
            book['isbn'],
            book['isbn13'],
            book['rating'],
            book['user_rating'],
            book['date_added'],
            book['tags'],
            book['collections']
        ))

    # Update user's book count
    cursor.execute('''
        UPDATE users
        SET total_books = (
            SELECT COUNT(*) FROM books WHERE username = ?
        )
        WHERE username = ?
    ''', (username, username))

    conn.commit()
    conn.close()

    print(f"Demo data populated successfully!")
    print(f"Added {len(demo_books)} sample books to the database for user '{username}'.")


if __name__ == '__main__':
    populate_demo_data()
