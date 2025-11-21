# Books Scraper CLI

A command-line tool to search for books on bookfinder.com and addall.com, aggregating results and sorting by lowest total cost (price + shipping).

## Features

- Search by ISBN or book title
- Scrapes both bookfinder.com and addall.com
- Automatically selects Belgium as destination
- Aggregates and sorts results by total cost (price + shipping)
- Displays clickable links to purchase books
- Shows book condition, seller, price, and shipping costs

## Installation

1. Clone the repository and navigate to the books-scraper directory:
```bash
cd books-scraper
```

2. Install required dependencies:
```bash
pip install -r requirements.txt
```

## Usage

### Search by ISBN

```bash
python book_scraper.py --isbn 9780143039433
```

Or using the short flag:
```bash
python book_scraper.py -i 9780143039433
```

### Search by Title

```bash
python book_scraper.py --title "The Great Gatsby"
```

Or using the short flag:
```bash
python book_scraper.py -t "Python Programming"
```

### Search Specific Site

By default, the scraper searches both sites. You can limit to a specific site:

```bash
# Only search BookFinder
python book_scraper.py --isbn 9780143039433 --site bookfinder

# Only search AddAll
python book_scraper.py --title "The Great Gatsby" --site addall
```

### Make it executable

On Linux/Mac, you can make the script executable:
```bash
chmod +x book_scraper.py
./book_scraper.py --isbn 9780143039433
```

## Output

The scraper will display:
- Total number of results found
- Results sorted by total cost (lowest first)
- For each result:
  - Site (BookFinder or AddAll)
  - Book title
  - Condition (if available)
  - Seller name
  - Price in EUR
  - Shipping cost in EUR
  - Total cost (price + shipping)
  - Direct link to purchase

## Example Output

```
Searching for: 9780143039433
Search type: ISBN
Destination: Belgium (BE)
Currency: EUR

Searching BookFinder: https://www.bookfinder.com/search/?isbn=...
Found 15 results from BookFinder

Searching AddAll: https://www.addall.com/SuperRare/UsedRare.cgi?isbn=...
Found 8 results from AddAll

====================================================================================================
Found 23 results, sorted by total cost (price + shipping):
====================================================================================================

1. [BookFinder] The Kite Runner
   Condition: Good
   Seller: Better World Books
   Price: €5.23
   Shipping: €3.50
   TOTAL: €8.73
   Link: https://www.bookfinder.com/...

2. [AddAll] The Kite Runner
   Condition: Very Good
   Seller: AbeBooks
   Price: €7.99
   Shipping: €2.50
   TOTAL: €10.49
   Link: https://www.addall.com/...

...
```

## Notes

- The destination is automatically set to Belgium (BE)
- Prices are displayed in EUR
- The scraper includes rate limiting to be respectful to the websites
- Results are limited to the first 20 from each site
- Some sites may block automated requests or require adjustments to parsing logic
- Web scraping is subject to websites' terms of service

## Troubleshooting

### No results found

If you see "No results found (parsing may need adjustment)", it could mean:
1. The book is not available on that site
2. The website structure has changed and the scraper needs updating
3. The website is blocking automated requests

### Connection errors

If you encounter connection errors:
1. Check your internet connection
2. Try again in a few minutes (rate limiting)
3. Try searching a single site at a time with `--site bookfinder` or `--site addall`

## Requirements

- Python 3.7+
- requests >= 2.31.0
- beautifulsoup4 >= 4.12.0
- lxml >= 4.9.0

## Legal

This tool is for educational purposes. Please respect the websites' terms of service and robots.txt files. Use responsibly and avoid excessive requests that could impact the websites' servers.
