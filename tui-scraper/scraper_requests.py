"""
Alternative HTTP-based scraper for TUI.be using requests + BeautifulSoup.
Falls back to this when Selenium is not available.
"""
import time
import re
import json
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from urllib.parse import urlencode

import requests
from bs4 import BeautifulSoup


class TUIScraperRequests:
    """HTTP-based scraper for TUI.be vacation packages."""

    BASE_URL = "https://www.tui.be/fr/last-minutes"

    def __init__(self, delay: float = 2.0):
        """Initialize scraper.

        Args:
            delay: Delay between requests in seconds
        """
        self.delay = delay
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'fr-BE,fr;q=0.9,en-US;q=0.8,en;q=0.7',
            'Accept-Encoding': 'gzip, deflate, br',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Cache-Control': 'max-age=0',
        })

    def _build_url(
        self,
        date: str,
        nights: int,
        offset: int = 0,
        size: int = 10,
        airport: str = "BRU",
        flexibility: int = 3,
        destination: str = "ALL",
    ) -> str:
        """Build TUI search URL."""
        params = {
            "sort": "cheapestPrice",
            "airport": airport,
            "flexibility": flexibility,
            "nights": nights,
            "destination": destination,
            "date": date,
            "size": size,
            "offset": offset,
            "allowAllAirports": "false",
        }
        return f"{self.BASE_URL}?{urlencode(params)}"

    def scrape_page(
        self, date: str, nights: int, offset: int = 0, size: int = 10
    ) -> List[Dict[str, Any]]:
        """Scrape a single page of results."""
        url = self._build_url(date, nights, offset, size)
        print(f"Fetching: {url}")

        try:
            response = self.session.get(url, timeout=30)
            response.raise_for_status()

            # Parse HTML
            soup = BeautifulSoup(response.content, 'html.parser')

            # Try to extract packages - this is placeholder logic
            # Real implementation would need to inspect the actual HTML structure
            packages = self._extract_packages_from_html(soup, nights)

            time.sleep(self.delay)
            return packages

        except requests.RequestException as e:
            print(f"Error fetching page: {e}")
            return []

    def _extract_packages_from_html(self, soup: BeautifulSoup, nights: int) -> List[Dict[str, Any]]:
        """Extract packages from HTML - placeholder implementation."""
        # This would need to be customized based on actual TUI.be HTML structure
        packages = []

        # Try to find package elements
        # This is a generic approach that would need tuning
        package_elements = soup.find_all(['article', 'div'], class_=re.compile(r'package|card|offer|product', re.I))

        for elem in package_elements:
            try:
                package = {
                    'hotel_name': None,
                    'country': None,
                    'region': None,
                    'start_date': None,
                    'end_date': None,
                    'duration_nights': nights,
                    'room_type': None,
                    'food_type': None,
                    'hotel_stars': None,
                    'hotel_score': None,
                    'starting_price': None,
                    'discount_percentage': None,
                    'booking_link': None,
                }

                # Extract hotel name
                name_elem = elem.find(['h2', 'h3', 'h4'], class_=re.compile(r'name|title|hotel', re.I))
                if name_elem:
                    package['hotel_name'] = name_elem.get_text(strip=True)

                # Extract price
                price_elem = elem.find(class_=re.compile(r'price|amount|cost', re.I))
                if price_elem:
                    price_text = price_elem.get_text(strip=True)
                    price_match = re.search(r'(\d+[\.,]?\d*)', price_text.replace(' ', ''))
                    if price_match:
                        package['starting_price'] = float(price_match.group(1).replace(',', '.'))

                # Extract link
                link_elem = elem.find('a', href=True)
                if link_elem:
                    href = link_elem['href']
                    if href.startswith('http'):
                        package['booking_link'] = href
                    elif href.startswith('/'):
                        package['booking_link'] = f"https://www.tui.be{href}"

                # Only add if we got at least a name or price
                if package['hotel_name'] or package['starting_price']:
                    packages.append(package)

            except Exception as e:
                print(f"Error extracting package: {e}")
                continue

        return packages

    def scrape_all_pages(
        self, date: str, nights: int, max_pages: int = 10
    ) -> List[Dict[str, Any]]:
        """Scrape all pages for a given date and duration."""
        all_packages = []
        page_size = 10

        for page in range(max_pages):
            offset = page * page_size
            packages = self.scrape_page(date, nights, offset, page_size)

            if not packages:
                print(f"No more results at page {page + 1}")
                break

            all_packages.extend(packages)
            print(f"Page {page + 1}: Found {len(packages)} packages")

        return all_packages

    def scrape_date_range(
        self,
        start_date: datetime,
        end_date: datetime,
        nights_list: List[int],
        max_pages: int = 10,
    ) -> List[Dict[str, Any]]:
        """Scrape packages for a date range and multiple durations."""
        all_packages = []
        current_date = start_date

        while current_date <= end_date:
            date_str = current_date.strftime("%d/%m/%Y")
            print(f"\n=== Scraping date: {date_str} ===")

            for nights in nights_list:
                print(f"\n--- Duration: {nights} nights ---")
                packages = self.scrape_all_pages(date_str, nights, max_pages)
                all_packages.extend(packages)
                print(f"Total packages for {nights} nights: {len(packages)}")

            current_date += timedelta(days=1)

        return all_packages

    def __enter__(self):
        """Context manager entry."""
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit."""
        self.session.close()
