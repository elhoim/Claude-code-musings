#!/usr/bin/env python3
"""
TUI.be Last Minutes Scraper - Command Line Interface

This script scrapes vacation packages from TUI.be and stores them in a SQLite database.
"""
import argparse
import sys
from datetime import datetime, timedelta
from typing import List

from database import TUIDatabase
from scraper import TUIScraper


def parse_date(date_str: str) -> datetime:
    """Parse date string in various formats.

    Args:
        date_str: Date string (YYYY-MM-DD, DD/MM/YYYY, 'today', or 'tomorrow')

    Returns:
        datetime object

    Raises:
        ValueError: If date format is invalid
    """
    if date_str.lower() == "today":
        return datetime.now()
    elif date_str.lower() == "tomorrow":
        return datetime.now() + timedelta(days=1)

    # Try different formats
    for fmt in ["%Y-%m-%d", "%d/%m/%Y", "%d-%m-%Y"]:
        try:
            return datetime.strptime(date_str, fmt)
        except ValueError:
            continue

    raise ValueError(f"Invalid date format: {date_str}. Use YYYY-MM-DD, DD/MM/YYYY, 'today', or 'tomorrow'")


def parse_nights(nights_str: str) -> List[int]:
    """Parse nights parameter.

    Args:
        nights_str: Nights specification (e.g., '7', '7,14', '7-14')

    Returns:
        List of night values

    Raises:
        ValueError: If format is invalid
    """
    if "," in nights_str:
        # Comma-separated list
        return [int(n.strip()) for n in nights_str.split(",")]
    elif "-" in nights_str and nights_str.count("-") == 1:
        # Range
        start, end = nights_str.split("-")
        return list(range(int(start), int(end) + 1))
    else:
        # Single value
        return [int(nights_str)]


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description="Scrape vacation packages from TUI.be last-minutes",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Scrape for tomorrow, 7 nights
  %(prog)s --start-date tomorrow --days 1 --nights 7

  # Scrape next 7 days, multiple durations
  %(prog)s --start-date today --days 7 --nights 7,14

  # Scrape with date range for nights 7-14
  %(prog)s --start-date 2025-11-13 --days 30 --nights 7-14

  # Use existing database, headless mode
  %(prog)s --db mydata.db --headless --start-date today --days 3 --nights 7
        """,
    )

    # Date parameters
    parser.add_argument(
        "--start-date",
        type=str,
        default="today",
        help="Start date for departure dates (YYYY-MM-DD, DD/MM/YYYY, 'today', or 'tomorrow')",
    )

    parser.add_argument(
        "--days",
        type=int,
        default=7,
        help="Number of days to scrape from start date (default: 7)",
    )

    # Duration parameters
    parser.add_argument(
        "--nights",
        type=str,
        default="7",
        help="Duration in nights: single value (7), comma-separated (7,14), or range (7-14). Default: 7",
    )

    # Scraping parameters
    parser.add_argument(
        "--max-pages",
        type=int,
        default=10,
        help="Maximum number of pages to scrape per search (default: 10)",
    )

    parser.add_argument(
        "--delay",
        type=float,
        default=2.0,
        help="Delay between requests in seconds (default: 2.0)",
    )

    parser.add_argument(
        "--airport",
        type=str,
        default="BRU",
        help="Departure airport code (default: BRU)",
    )

    # Browser parameters
    parser.add_argument(
        "--headless",
        action="store_true",
        help="Run browser in headless mode (no GUI)",
    )

    parser.add_argument(
        "--no-headless",
        action="store_true",
        help="Run browser with GUI (useful for debugging)",
    )

    # Database parameters
    parser.add_argument(
        "--db",
        type=str,
        default="tui_vacations.db",
        help="SQLite database file path (default: tui_vacations.db)",
    )

    # Statistics
    parser.add_argument(
        "--stats",
        action="store_true",
        help="Show database statistics and exit",
    )

    args = parser.parse_args()

    # Handle stats mode
    if args.stats:
        with TUIDatabase(args.db) as db:
            count = db.get_package_count()
            print(f"Database: {args.db}")
            print(f"Total packages: {count}")
        return 0

    # Parse dates
    try:
        start_date = parse_date(args.start_date)
    except ValueError as e:
        print(f"Error: {e}", file=sys.stderr)
        return 1

    end_date = start_date + timedelta(days=args.days - 1)

    # Parse nights
    try:
        nights_list = parse_nights(args.nights)
    except ValueError as e:
        print(f"Error parsing nights: {e}", file=sys.stderr)
        return 1

    # Determine headless mode
    headless = not args.no_headless if args.no_headless else args.headless

    # Print configuration
    print("=" * 60)
    print("TUI.be Last Minutes Scraper")
    print("=" * 60)
    print(f"Start date:    {start_date.strftime('%Y-%m-%d')}")
    print(f"End date:      {end_date.strftime('%Y-%m-%d')}")
    print(f"Days:          {args.days}")
    print(f"Nights:        {', '.join(map(str, nights_list))}")
    print(f"Max pages:     {args.max_pages}")
    print(f"Delay:         {args.delay}s")
    print(f"Airport:       {args.airport}")
    print(f"Headless:      {headless}")
    print(f"Database:      {args.db}")
    print("=" * 60)

    # Initialize database
    try:
        db = TUIDatabase(args.db)
        db.connect()
        print(f"✓ Database initialized: {args.db}")
    except Exception as e:
        print(f"Error initializing database: {e}", file=sys.stderr)
        return 1

    # Initialize scraper
    print("Initializing web scraper...")
    try:
        scraper = TUIScraper(headless=headless, delay=args.delay)
        scraper.start()
        print("✓ Scraper initialized")
    except Exception as e:
        print(f"Error initializing scraper: {e}", file=sys.stderr)
        db.close()
        return 1

    # Start scraping
    try:
        print("\nStarting scrape...")
        print("-" * 60)

        current_date = start_date
        total_found = 0
        total_saved = 0

        while current_date <= end_date:
            date_str = current_date.strftime("%d/%m/%Y")
            print(f"\n📅 Date: {date_str}")

            for nights in nights_list:
                print(f"  🌙 {nights} nights...")

                packages = scraper.scrape_all_pages(date_str, nights, args.max_pages)
                total_found += len(packages)

                # Save to database
                saved = 0
                for package in packages:
                    if db.insert_package(package):
                        saved += 1

                total_saved += saved
                print(f"    Found: {len(packages)}, New: {saved}, Duplicates: {len(packages) - saved}")

            current_date += timedelta(days=1)

        print("-" * 60)
        print(f"\n✓ Scraping complete!")
        print(f"  Total found:      {total_found}")
        print(f"  Total saved:      {total_saved}")
        print(f"  Duplicates:       {total_found - total_saved}")
        print(f"  Database:         {args.db}")

    except KeyboardInterrupt:
        print("\n\n⚠ Interrupted by user")
        return 130

    except Exception as e:
        print(f"\n\n✗ Error during scraping: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        return 1

    finally:
        print("\nCleaning up...")
        scraper.stop()
        db.close()
        print("✓ Done")

    return 0


if __name__ == "__main__":
    sys.exit(main())
