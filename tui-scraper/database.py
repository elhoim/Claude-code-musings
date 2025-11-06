"""
Database module for storing TUI vacation package data.
"""
import sqlite3
from datetime import datetime
from typing import Optional, Dict, Any
import os


class TUIDatabase:
    """Handles SQLite database operations for TUI scraper."""

    def __init__(self, db_path: str = "tui_vacations.db"):
        """Initialize database connection.

        Args:
            db_path: Path to SQLite database file
        """
        self.db_path = db_path
        self.conn = None
        self.cursor = None

    def connect(self):
        """Create database connection and initialize schema."""
        self.conn = sqlite3.connect(self.db_path)
        self.cursor = self.conn.cursor()
        self._create_tables()

    def _create_tables(self):
        """Create database tables if they don't exist."""
        self.cursor.execute("""
            CREATE TABLE IF NOT EXISTS vacation_packages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                country TEXT,
                region TEXT,
                start_date TEXT,
                end_date TEXT,
                duration_nights INTEGER,
                room_type TEXT,
                food_type TEXT,
                hotel_stars INTEGER,
                hotel_name TEXT,
                hotel_score REAL,
                starting_price REAL,
                discount_percentage REAL,
                booking_link TEXT,
                scraped_at TEXT,
                UNIQUE(hotel_name, start_date, room_type, food_type)
            )
        """)

        # Create index for faster queries
        self.cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_start_date
            ON vacation_packages(start_date)
        """)

        self.cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_price
            ON vacation_packages(starting_price)
        """)

        self.cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_country
            ON vacation_packages(country)
        """)

        self.conn.commit()

    def insert_package(self, package_data: Dict[str, Any]) -> bool:
        """Insert a vacation package into the database.

        Args:
            package_data: Dictionary containing package information

        Returns:
            True if inserted, False if duplicate
        """
        try:
            self.cursor.execute("""
                INSERT INTO vacation_packages (
                    country, region, start_date, end_date, duration_nights,
                    room_type, food_type, hotel_stars, hotel_name, hotel_score,
                    starting_price, discount_percentage, booking_link, scraped_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                package_data.get('country'),
                package_data.get('region'),
                package_data.get('start_date'),
                package_data.get('end_date'),
                package_data.get('duration_nights'),
                package_data.get('room_type'),
                package_data.get('food_type'),
                package_data.get('hotel_stars'),
                package_data.get('hotel_name'),
                package_data.get('hotel_score'),
                package_data.get('starting_price'),
                package_data.get('discount_percentage'),
                package_data.get('booking_link'),
                datetime.now().isoformat()
            ))
            self.conn.commit()
            return True
        except sqlite3.IntegrityError:
            # Duplicate entry
            return False

    def get_package_count(self) -> int:
        """Get total number of packages in database.

        Returns:
            Count of packages
        """
        self.cursor.execute("SELECT COUNT(*) FROM vacation_packages")
        return self.cursor.fetchone()[0]

    def get_packages_by_date_range(self, start_date: str, end_date: str):
        """Get packages within a date range.

        Args:
            start_date: Start date in ISO format
            end_date: End date in ISO format

        Returns:
            List of package records
        """
        self.cursor.execute("""
            SELECT * FROM vacation_packages
            WHERE start_date >= ? AND start_date <= ?
            ORDER BY starting_price ASC
        """, (start_date, end_date))
        return self.cursor.fetchall()

    def close(self):
        """Close database connection."""
        if self.conn:
            self.conn.close()

    def __enter__(self):
        """Context manager entry."""
        self.connect()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit."""
        self.close()
