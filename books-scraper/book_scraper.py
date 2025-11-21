#!/usr/bin/env python3
"""
Books Scraper CLI - Search for books on bookfinder.com and addall.com
Aggregates results and sorts by lowest total cost including shipping.
"""

import sys
import argparse
import requests
from bs4 import BeautifulSoup
from typing import List, Dict, Optional
import time
from urllib.parse import urlencode, quote_plus
import re


class BookResult:
    """Represents a single book result from a seller"""
    def __init__(self, site: str, title: str, seller: str, price: float,
                 shipping: float, total: float, url: str, condition: str = ""):
        self.site = site
        self.title = title
        self.seller = seller
        self.price = price
        self.shipping = shipping
        self.total = total
        self.url = url
        self.condition = condition

    def __repr__(self):
        return (f"BookResult(site={self.site}, seller={self.seller}, "
                f"price={self.price}, shipping={self.shipping}, total={self.total})")


class BookScraper:
    """Base scraper class with common functionality"""

    def __init__(self, debug: bool = False):
        self.debug = debug
        self.session = requests.Session()
        # Enhanced headers to mimic a real browser more closely
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1',
            'Cache-Control': 'max-age=0'
        })

    def make_request(self, url: str, max_retries: int = 3) -> Optional[requests.Response]:
        """Make HTTP request with retry logic"""
        for attempt in range(max_retries):
            try:
                if self.debug:
                    print(f"  Attempt {attempt + 1}/{max_retries}: {url}")

                response = self.session.get(url, timeout=20, allow_redirects=True)

                if response.status_code == 403:
                    if self.debug:
                        print(f"  403 Forbidden - Site is blocking automated requests")
                    if attempt < max_retries - 1:
                        wait_time = (attempt + 1) * 2
                        if self.debug:
                            print(f"  Waiting {wait_time}s before retry...")
                        time.sleep(wait_time)
                        continue

                response.raise_for_status()
                return response

            except requests.RequestException as e:
                if self.debug:
                    print(f"  Request error: {e}")
                if attempt < max_retries - 1:
                    wait_time = (attempt + 1) * 2
                    if self.debug:
                        print(f"  Waiting {wait_time}s before retry...")
                    time.sleep(wait_time)
                else:
                    raise

        return None

    def parse_price(self, price_str: str) -> float:
        """Extract numeric price from string"""
        if not price_str:
            return 0.0
        # Remove currency symbols and extract number
        price_str = price_str.replace('€', '').replace('$', '').replace('£', '').replace(',', '.')
        match = re.search(r'(\d+\.?\d*)', price_str)
        if match:
            return float(match.group(1))
        return 0.0


class BookFinderScraper(BookScraper):
    """Scraper for bookfinder.com"""

    BASE_URL = "https://www.bookfinder.com"

    def search(self, query: str, is_isbn: bool = False) -> List[BookResult]:
        """Search for books on bookfinder.com"""
        results = []

        try:
            # Build search URL
            if is_isbn:
                search_url = f"{self.BASE_URL}/search/?isbn={quote_plus(query)}&destination=be&currency=EUR&mode=basic&st=sr&ac=qr"
            else:
                search_url = f"{self.BASE_URL}/search/?author=&title={quote_plus(query)}&lang=en&destination=be&currency=EUR&mode=basic&st=sr&ac=qr"

            if self.debug:
                print(f"Searching BookFinder: {search_url}")

            # Make request with retry logic
            response = self.make_request(search_url)
            if not response:
                print("Failed to fetch results from BookFinder after retries")
                return results

            # Parse HTML
            soup = BeautifulSoup(response.text, 'html.parser')

            # Find book results - BookFinder uses different layouts
            # Try to find the results container
            results_containers = soup.find_all('div', class_='result-item') or \
                                soup.find_all('tr', class_='result-item') or \
                                soup.find_all('div', class_='item')

            if not results_containers:
                # Try alternative selectors
                results_containers = soup.find_all('div', class_=re.compile(r'result|item|listing'))

            for item in results_containers[:20]:  # Limit to first 20 results
                try:
                    result = self._parse_result_item(item, query)
                    if result:
                        results.append(result)
                except Exception as e:
                    print(f"Error parsing result item: {e}")
                    continue

            if not results:
                print("No results found on BookFinder (parsing may need adjustment)")

        except requests.RequestException as e:
            print(f"Error searching BookFinder: {e}")
        except Exception as e:
            print(f"Unexpected error with BookFinder: {e}")

        return results

    def _parse_result_item(self, item, query: str) -> Optional[BookResult]:
        """Parse a single result item"""
        try:
            # Extract title
            title_elem = item.find('h2') or item.find('a', class_=re.compile(r'title|book'))
            title = title_elem.get_text(strip=True) if title_elem else query

            # Extract seller
            seller_elem = item.find(class_=re.compile(r'seller|vendor|store'))
            seller = seller_elem.get_text(strip=True) if seller_elem else "Unknown Seller"

            # Extract condition
            condition_elem = item.find(class_=re.compile(r'condition'))
            condition = condition_elem.get_text(strip=True) if condition_elem else ""

            # Extract price
            price_elem = item.find(class_=re.compile(r'price'))
            price = self.parse_price(price_elem.get_text(strip=True)) if price_elem else 0.0

            # Extract shipping
            shipping_elem = item.find(class_=re.compile(r'shipping'))
            shipping = self.parse_price(shipping_elem.get_text(strip=True)) if shipping_elem else 0.0

            # Extract URL
            link_elem = item.find('a', href=True)
            url = link_elem['href'] if link_elem else ""
            if url and not url.startswith('http'):
                url = self.BASE_URL + url

            # Calculate total
            total = price + shipping

            if price > 0 and url:
                return BookResult(
                    site="BookFinder",
                    title=title,
                    seller=seller,
                    price=price,
                    shipping=shipping,
                    total=total,
                    url=url,
                    condition=condition
                )
        except Exception as e:
            print(f"Error parsing item: {e}")

        return None


class AddAllScraper(BookScraper):
    """Scraper for addall.com"""

    BASE_URL = "https://www.addall.com"

    def search(self, query: str, is_isbn: bool = False) -> List[BookResult]:
        """Search for books on addall.com"""
        results = []

        try:
            # Build search URL - AddAll uses different search patterns
            if is_isbn:
                search_url = f"{self.BASE_URL}/SuperRare/UsedRare.cgi?isbn={quote_plus(query)}&location=BE&currency=EUR"
            else:
                search_url = f"{self.BASE_URL}/SuperRare/UsedRare.cgi?title={quote_plus(query)}&location=BE&currency=EUR"

            if self.debug:
                print(f"Searching AddAll: {search_url}")

            # Make request with retry logic
            response = self.make_request(search_url)
            if not response:
                print("Failed to fetch results from AddAll after retries")
                return results

            # Parse HTML
            soup = BeautifulSoup(response.text, 'html.parser')

            # Find book results - AddAll typically uses table rows
            results_containers = soup.find_all('tr', class_=re.compile(r'result|item|listing')) or \
                                soup.find_all('div', class_=re.compile(r'result|item'))

            if not results_containers:
                # Try finding all table rows that might contain results
                table = soup.find('table', class_=re.compile(r'result|listing'))
                if table:
                    results_containers = table.find_all('tr')[1:]  # Skip header

            for item in results_containers[:20]:  # Limit to first 20 results
                try:
                    result = self._parse_result_item(item, query)
                    if result:
                        results.append(result)
                except Exception as e:
                    print(f"Error parsing result item: {e}")
                    continue

            if not results:
                print("No results found on AddAll (parsing may need adjustment)")

        except requests.RequestException as e:
            print(f"Error searching AddAll: {e}")
        except Exception as e:
            print(f"Unexpected error with AddAll: {e}")

        return results

    def _parse_result_item(self, item, query: str) -> Optional[BookResult]:
        """Parse a single result item"""
        try:
            # Extract seller
            seller_elem = item.find('td', class_=re.compile(r'seller|vendor|store')) or \
                         item.find('a', class_=re.compile(r'seller|vendor'))
            seller = seller_elem.get_text(strip=True) if seller_elem else "Unknown Seller"

            # Extract condition
            condition_elem = item.find('td', class_=re.compile(r'condition'))
            condition = condition_elem.get_text(strip=True) if condition_elem else ""

            # Extract price
            price_elem = item.find('td', class_=re.compile(r'price')) or \
                        item.find(class_=re.compile(r'price'))
            price = self.parse_price(price_elem.get_text(strip=True)) if price_elem else 0.0

            # Extract shipping
            shipping_elem = item.find('td', class_=re.compile(r'shipping')) or \
                           item.find(class_=re.compile(r'shipping'))
            shipping = self.parse_price(shipping_elem.get_text(strip=True)) if shipping_elem else 0.0

            # Extract total - AddAll often shows total directly
            total_elem = item.find('td', class_=re.compile(r'total'))
            if total_elem:
                total = self.parse_price(total_elem.get_text(strip=True))
            else:
                total = price + shipping

            # Extract URL
            link_elem = item.find('a', href=True)
            url = link_elem['href'] if link_elem else ""
            if url and not url.startswith('http'):
                url = self.BASE_URL + url

            if price > 0 and url:
                return BookResult(
                    site="AddAll",
                    title=query,
                    seller=seller,
                    price=price,
                    shipping=shipping,
                    total=total,
                    url=url,
                    condition=condition
                )
        except Exception as e:
            print(f"Error parsing item: {e}")

        return None


def format_results(results: List[BookResult]) -> None:
    """Format and display results"""
    if not results:
        print("\nNo results found.")
        return

    print(f"\n{'='*100}")
    print(f"Found {len(results)} results, sorted by total cost (price + shipping):")
    print(f"{'='*100}\n")

    for i, result in enumerate(results, 1):
        print(f"{i}. [{result.site}] {result.title}")
        if result.condition:
            print(f"   Condition: {result.condition}")
        print(f"   Seller: {result.seller}")
        print(f"   Price: €{result.price:.2f}")
        print(f"   Shipping: €{result.shipping:.2f}")
        print(f"   TOTAL: €{result.total:.2f}")
        print(f"   Link: {result.url}")
        print()


def main():
    """Main CLI entry point"""
    parser = argparse.ArgumentParser(
        description='Search for books on bookfinder.com and addall.com',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s --isbn 9780143039433
  %(prog)s --title "The Great Gatsby"
  %(prog)s -t "Python Programming"
        """
    )

    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument('--isbn', '-i', help='Search by ISBN')
    group.add_argument('--title', '-t', help='Search by book title')

    parser.add_argument('--site', choices=['bookfinder', 'addall', 'both'],
                       default='both', help='Which site(s) to search (default: both)')

    parser.add_argument('--debug', '-d', action='store_true',
                       help='Enable debug output')

    args = parser.parse_args()

    # Determine search parameters
    is_isbn = args.isbn is not None
    query = args.isbn if is_isbn else args.title

    print(f"Searching for: {query}")
    print(f"Search type: {'ISBN' if is_isbn else 'Title'}")
    print(f"Destination: Belgium (BE)")
    print(f"Currency: EUR\n")

    # Collect results from both sites
    all_results = []

    if args.site in ['bookfinder', 'both']:
        print("Searching BookFinder.com...")
        bookfinder = BookFinderScraper(debug=args.debug)
        bf_results = bookfinder.search(query, is_isbn)
        all_results.extend(bf_results)
        print(f"Found {len(bf_results)} results from BookFinder\n")
        time.sleep(2)  # Rate limiting

    if args.site in ['addall', 'both']:
        print("Searching AddAll.com...")
        addall = AddAllScraper(debug=args.debug)
        aa_results = addall.search(query, is_isbn)
        all_results.extend(aa_results)
        print(f"Found {len(aa_results)} results from AddAll\n")

    # Sort by total cost (lowest first)
    all_results.sort(key=lambda x: x.total)

    # Display results
    format_results(all_results)

    # If no results were found, provide helpful guidance
    if not all_results:
        print("\n" + "="*100)
        print("TROUBLESHOOTING: No results found")
        print("="*100)
        print("""
Possible reasons:
1. The book is not available on these sites
2. Both sites are blocking automated requests (403 errors)
3. The search query needs to be adjusted

Workarounds for blocking:
- Use --debug flag to see detailed connection attempts
- Try searching one site at a time: --site bookfinder or --site addall
- Wait a few minutes between searches (rate limiting)
- Manual search: Visit the URLs shown above in your browser
- Consider using a VPN or different network

For manual searches:
- BookFinder: https://www.bookfinder.com
- AddAll: https://www.addall.com/SuperRare/
        """)

    return 0 if all_results else 1


if __name__ == '__main__':
    sys.exit(main())
