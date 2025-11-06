# LibraryThing Catalog Scraper

A command-line Python script to extract and store book data from LibraryThing user catalogs.

## Important Note About Scraping

LibraryThing implements anti-scraping protection that may block automated requests. This project provides **two versions** of the scraper:

1. **scraper.py** - Simple HTTP-based scraper (may be blocked with 403 errors)
2. **scraper_selenium.py** - Browser-based scraper using Selenium (better chance of success, requires Chrome/Chromium)

## Features

- Scrape all books from any public LibraryThing user catalog
- Store book details in a local SQLite3 database
- Update existing catalog data
- View statistics and list books from the database
- Respectful rate limiting to avoid server overload
- Pagination support for large catalogs
- Two scraping methods (HTTP and browser automation)

## Installation

### Basic Installation

1. Install Python dependencies:

```bash
pip install -r requirements.txt
```

### For Selenium Version (Recommended)

2. Install Chromium browser:

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install chromium-browser chromium-chromedriver
```

**macOS:**
```bash
brew install --cask google-chrome
# ChromeDriver will be automatically downloaded by webdriver-manager
```

**Windows:**
- Download and install Google Chrome from https://www.google.com/chrome/
- ChromeDriver will be automatically downloaded by webdriver-manager

### Make Scripts Executable (Optional)

```bash
chmod +x scraper.py scraper_selenium.py
```

## Usage

### Method 1: Simple HTTP Scraper (scraper.py)

This method is simpler but **may be blocked** by LibraryThing's anti-scraping protection (403 errors).

#### Basic scraping

```bash
python scraper.py elhoim
```

#### Update existing catalog

```bash
python scraper.py elhoim --update
```

### Method 2: Selenium Browser Scraper (scraper_selenium.py) - RECOMMENDED

This method uses a real browser to bypass anti-scraping measures. It requires Chrome/Chromium to be installed.

#### Basic scraping

```bash
python scraper_selenium.py elhoim
```

#### Update existing catalog

```bash
python scraper_selenium.py elhoim --update
```

#### Run with visible browser (debug mode)

```bash
python scraper_selenium.py elhoim --no-headless
```

#### Limit number of pages

```bash
python scraper_selenium.py elhoim --max-pages 5
```

### Common Operations (Both Scripts)

#### List books

Display books from the database:

```bash
python scraper.py elhoim --list
# or
python scraper_selenium.py elhoim --list
```

Show more books:

```bash
python scraper.py elhoim --list --limit 50
```

#### View statistics

Show catalog statistics:

```bash
python scraper.py elhoim --stats
```

#### Custom database location

Use a different database file:

```bash
python scraper.py elhoim --db /path/to/custom.db
```

#### Adjust rate limiting

Change the delay between requests:

```bash
python scraper.py elhoim --delay 2.0
# Selenium version defaults to 2.0 seconds
python scraper_selenium.py elhoim --delay 3.0
```

## Database Schema

The scraper creates a SQLite database with two tables:

### users table
- `username` (TEXT, PRIMARY KEY): LibraryThing username
- `last_updated` (TIMESTAMP): Last time the catalog was scraped
- `total_books` (INTEGER): Total number of books in the catalog

### books table
- `id` (INTEGER, PRIMARY KEY): Auto-increment ID
- `username` (TEXT): Owner of the book
- `book_id` (TEXT): LibraryThing book ID
- `title` (TEXT): Book title
- `author` (TEXT): Book author(s)
- `isbn` (TEXT): ISBN-10
- `isbn13` (TEXT): ISBN-13
- `cover_url` (TEXT): URL to book cover image
- `rating` (REAL): Overall LibraryThing rating
- `user_rating` (REAL): User's personal rating
- `date_added` (TEXT): Date the book was added to the catalog
- `tags` (TEXT): User-assigned tags
- `collections` (TEXT): Collections the book belongs to
- `comments` (TEXT): User comments
- `scraped_at` (TIMESTAMP): When the book was scraped

## Command-line Options

```
usage: scraper.py [-h] [--update] [--db DB] [--delay DELAY] [--list]
                  [--limit LIMIT] [--stats]
                  username

Scrape book catalogs from LibraryThing

positional arguments:
  username         LibraryThing username to scrape

optional arguments:
  -h, --help       show this help message and exit
  --update         Update existing books in database
  --db DB          Path to SQLite database file (default: librarything.db)
  --delay DELAY    Delay between requests in seconds (default: 1.0)
  --list           List books from the database
  --limit LIMIT    Number of books to list (default: 10)
  --stats          Show statistics for the user
```

## Examples

### Selenium Scraper Examples (Recommended)

```bash
# Initial scrape with Selenium
python scraper_selenium.py elhoim

# Update catalog (refresh existing data)
python scraper_selenium.py elhoim --update

# Scrape only first 3 pages
python scraper_selenium.py elhoim --max-pages 3

# Run with visible browser for debugging
python scraper_selenium.py elhoim --no-headless

# List first 20 books
python scraper_selenium.py elhoim --list --limit 20

# Check statistics
python scraper_selenium.py elhoim --stats
```

### Simple Scraper Examples

```bash
# Initial scrape (may fail with 403)
python scraper.py elhoim

# Update catalog (refresh existing data)
python scraper.py elhoim --update

# Use custom database with slower rate limiting
python scraper.py elhoim --db mybooks.db --delay 2.0
```

## Troubleshooting

### Issue: 403 Forbidden Error

**Problem:** LibraryThing is blocking automated requests.

**Solutions:**
1. Use the Selenium version instead:
   ```bash
   python scraper_selenium.py elhoim
   ```

2. Ensure Chrome/Chromium is installed:
   ```bash
   sudo apt-get install chromium-browser
   ```

3. Try increasing the delay:
   ```bash
   python scraper_selenium.py elhoim --delay 5.0
   ```

### Issue: Selenium WebDriver Error

**Problem:** Chrome/ChromeDriver not found or incompatible.

**Solutions:**
1. Install Chromium browser (see Installation section above)

2. If ChromeDriver version mismatch, reinstall webdriver-manager:
   ```bash
   pip uninstall webdriver-manager
   pip install webdriver-manager --upgrade
   ```

3. Use --no-headless to see what's happening:
   ```bash
   python scraper_selenium.py elhoim --no-headless
   ```

### Issue: No Books Found

**Possible causes:**
- The user's catalog is private
- The page structure has changed
- Network issues

**Solutions:**
1. Verify the catalog is publicly accessible in a browser
2. Try with --no-headless to see the browser output
3. Check your internet connection

## Alternative Methods

If automated scraping doesn't work, consider these alternatives:

### 1. LibraryThing Export (Official)

LibraryThing provides an official export feature for your **own** catalog:

1. Log in to LibraryThing
2. Go to "More" → "Export books"
3. Download as tab-delimited or JSON format
4. Import into the database using a custom import script

### 2. Browser Developer Tools

For small catalogs, you can manually save the HTML:

1. Open the catalog page in a browser
2. Right-click → "Save As" → "Webpage, Complete"
3. Use the scraper to parse the saved HTML file (modify script to accept local files)

### 3. RSS/JSON Feeds

Some LibraryThing pages offer RSS feeds or JSON data. Check the page source for alternative data sources.

## Notes

- The scraper respects LibraryThing's servers by including rate limiting
- Only public catalogs can be scraped
- The Selenium version is more reliable but requires more resources
- If scraping fails repeatedly, consider the alternative methods above

## Default Configuration

By default, the scripts:
- Create a database named `librarything.db` in the current directory
- Use appropriate rate limiting (1s for simple scraper, 2s for Selenium)
- Support pagination for large catalogs
- Store comprehensive book metadata

## Legal and Ethical Considerations

This tool is intended for personal use and educational purposes. Please:
- Only scrape public catalogs
- Respect LibraryThing's terms of service
- Use appropriate rate limiting to avoid server overload
- Consider using LibraryThing's official export features if you're exporting your own data
