# TUI.be Last Minutes Scraper

A command-line web scraper for TUI.be vacation packages. This tool iterates through different departure dates and durations to collect vacation package information and stores it in a local SQLite database.

## Features

- 🔍 Scrapes TUI.be last-minutes vacation packages
- 📅 Iterates through date ranges day by day
- 🌙 Supports multiple duration options (nights)
- 💾 Stores data in SQLite database with duplicate detection
- 🤖 Uses Selenium for JavaScript-rendered content
- ⚙️ Configurable scraping parameters
- 📊 Database statistics

## Data Collected

For each vacation package, the scraper collects:

- **Location**: Country and region
- **Dates**: Start date, end date, duration (nights)
- **Accommodation**: Room type, food type (half board, all-inclusive, etc.)
- **Hotel**: Name, star rating, customer score (out of 10)
- **Pricing**: Starting price, discount percentage
- **Booking**: Link to reservation page
- **Metadata**: Timestamp when scraped

## Requirements

- Python 3.7+
- Google Chrome browser
- ChromeDriver (automatically managed)

## Installation

1. Clone or download this repository

2. Install dependencies:
```bash
pip install -r requirements.txt
```

## Usage

### Basic Usage

Scrape vacation packages for the next 7 days with 7-night duration:

```bash
python main.py --start-date today --days 7 --nights 7
```

### Advanced Usage

Scrape for specific date range with multiple durations:

```bash
python main.py --start-date 2025-11-13 --days 30 --nights 7,14,21
```

Scrape with night range (7 to 14 nights):

```bash
python main.py --start-date today --days 14 --nights 7-14
```

Run in headless mode (no browser GUI):

```bash
python main.py --headless --start-date today --days 7 --nights 7
```

### Command-Line Options

```
Date Parameters:
  --start-date DATE     Start date for departure dates (YYYY-MM-DD, DD/MM/YYYY, or 'today')
  --days N              Number of days to scrape from start date (default: 7)

Duration Parameters:
  --nights SPEC         Duration in nights:
                        - Single: 7
                        - Multiple: 7,14,21
                        - Range: 7-14
                        (default: 7)

Scraping Parameters:
  --max-pages N         Maximum pages per search (default: 10)
  --delay SECONDS       Delay between requests (default: 2.0)
  --airport CODE        Departure airport code (default: BRU)

Browser Parameters:
  --headless            Run browser in headless mode (no GUI)
  --no-headless         Run browser with GUI (for debugging)

Database Parameters:
  --db PATH             SQLite database file (default: tui_vacations.db)

Statistics:
  --stats               Show database statistics and exit
```

### View Statistics

```bash
python main.py --stats
```

## Database Schema

The SQLite database contains a `vacation_packages` table with the following fields:

| Field | Type | Description |
|-------|------|-------------|
| id | INTEGER | Primary key |
| country | TEXT | Destination country |
| region | TEXT | Destination region/area |
| start_date | TEXT | Departure date (ISO format) |
| end_date | TEXT | Return date (ISO format) |
| duration_nights | INTEGER | Duration in nights |
| room_type | TEXT | Type of accommodation |
| food_type | TEXT | Meal plan (e.g., half board, all-inclusive) |
| hotel_stars | INTEGER | Hotel star rating |
| hotel_name | TEXT | Name of the hotel |
| hotel_score | REAL | Customer review score (out of 10) |
| starting_price | REAL | Price in euros |
| discount_percentage | REAL | Discount percentage if applicable |
| booking_link | TEXT | URL to booking page |
| scraped_at | TEXT | Timestamp when data was scraped |

The database includes indexes on `start_date`, `starting_price`, and `country` for efficient queries.

## Examples

### Example 1: Quick Scan

Scrape tomorrow's departures for 7-night vacations:

```bash
python main.py --start-date tomorrow --days 1 --nights 7 --headless
```

### Example 2: Comprehensive Search

Scrape next month with multiple durations:

```bash
python main.py --start-date today --days 30 --nights 7,14,21 --headless --delay 3
```

### Example 3: Specific Date Range

Scrape specific dates with night range:

```bash
python main.py --start-date 2025-12-20 --days 10 --nights 7-14 --max-pages 20
```

## Notes

- The scraper respects rate limiting with configurable delays between requests
- Duplicate packages (same hotel, date, room, and meal plan) are automatically detected
- The browser window can be hidden using `--headless` for automated runs
- Scraping may take time depending on the number of dates and durations
- Press Ctrl+C to safely interrupt the scraping process

## Querying the Database

You can query the SQLite database using any SQLite tool or Python:

```python
import sqlite3

conn = sqlite3.connect('tui_vacations.db')
cursor = conn.cursor()

# Find cheapest packages
cursor.execute("""
    SELECT hotel_name, country, start_date, starting_price
    FROM vacation_packages
    ORDER BY starting_price ASC
    LIMIT 10
""")

for row in cursor.fetchall():
    print(row)

conn.close()
```

## Troubleshooting

### ChromeDriver Issues

If you encounter ChromeDriver issues:
- Ensure Chrome browser is installed
- The `webdriver-manager` package handles ChromeDriver automatically
- Try updating Chrome to the latest version

### No Results Found

If the scraper finds no results:
- Run without `--headless` to see the browser
- Check if the TUI.be website structure has changed
- Verify your internet connection
- Try increasing the `--delay` parameter

### Permission Denied

If you get permission errors:
- Ensure the script is executable: `chmod +x main.py`
- Check write permissions for the database file location

## License

This tool is for educational purposes only. Please respect TUI.be's terms of service and robots.txt when scraping.
