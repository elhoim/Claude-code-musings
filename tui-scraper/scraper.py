"""
Web scraper for TUI.be last-minutes vacation packages.
"""
import time
import re
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from urllib.parse import urlencode, quote

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from webdriver_manager.chrome import ChromeDriverManager


class TUIScraper:
    """Scraper for TUI.be vacation packages."""

    BASE_URL = "https://www.tui.be/fr/last-minutes"

    def __init__(self, headless: bool = True, delay: float = 2.0):
        """Initialize scraper.

        Args:
            headless: Run browser in headless mode
            delay: Delay between requests in seconds
        """
        self.headless = headless
        self.delay = delay
        self.driver = None

    def _setup_driver(self):
        """Setup Chrome driver with appropriate options."""
        chrome_options = Options()
        if self.headless:
            chrome_options.add_argument("--headless")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--window-size=1920,1080")
        chrome_options.add_argument(
            "user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
            "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )

        service = Service(ChromeDriverManager().install())
        self.driver = webdriver.Chrome(service=service, options=chrome_options)

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
        """Build TUI search URL.

        Args:
            date: Departure date in DD/MM/YYYY format
            nights: Duration in nights
            offset: Pagination offset
            size: Results per page
            airport: Departure airport code
            flexibility: Date flexibility in days
            destination: Destination code

        Returns:
            Complete URL
        """
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

    def _extract_package_data(self, element) -> Optional[Dict[str, Any]]:
        """Extract data from a package element.

        Args:
            element: Selenium WebElement for a package

        Returns:
            Dictionary with package data or None if extraction fails
        """
        try:
            data = {}

            # Extract hotel name
            try:
                data["hotel_name"] = element.find_element(
                    By.CSS_SELECTOR, "[data-testid='hotel-name'], .hotel-name, h2, h3"
                ).text.strip()
            except NoSuchElementException:
                data["hotel_name"] = None

            # Extract location (country, region)
            try:
                location_text = element.find_element(
                    By.CSS_SELECTOR, "[data-testid='location'], .location, .destination"
                ).text.strip()
                # Try to split into country and region
                parts = location_text.split(",")
                if len(parts) >= 2:
                    data["region"] = parts[0].strip()
                    data["country"] = parts[1].strip()
                else:
                    data["country"] = location_text
                    data["region"] = None
            except NoSuchElementException:
                data["country"] = None
                data["region"] = None

            # Extract dates
            try:
                date_text = element.find_element(
                    By.CSS_SELECTOR, "[data-testid='dates'], .dates, .date-range"
                ).text.strip()
                # Parse dates (format may vary)
                data["start_date"] = None
                data["end_date"] = None
                data["duration_nights"] = None
            except NoSuchElementException:
                data["start_date"] = None
                data["end_date"] = None
                data["duration_nights"] = None

            # Extract room type
            try:
                data["room_type"] = element.find_element(
                    By.CSS_SELECTOR, "[data-testid='room-type'], .room-type, .accommodation"
                ).text.strip()
            except NoSuchElementException:
                data["room_type"] = None

            # Extract food type
            try:
                data["food_type"] = element.find_element(
                    By.CSS_SELECTOR, "[data-testid='board-type'], .board-type, .meal-plan"
                ).text.strip()
            except NoSuchElementException:
                data["food_type"] = None

            # Extract hotel stars
            try:
                stars_text = element.find_element(
                    By.CSS_SELECTOR, "[data-testid='stars'], .stars, .rating"
                ).get_attribute("innerHTML")
                stars_match = re.search(r"(\d+)", stars_text)
                data["hotel_stars"] = int(stars_match.group(1)) if stars_match else None
            except (NoSuchElementException, AttributeError, ValueError):
                data["hotel_stars"] = None

            # Extract score
            try:
                score_text = element.find_element(
                    By.CSS_SELECTOR, "[data-testid='score'], .score, .review-score"
                ).text.strip()
                score_match = re.search(r"(\d+\.?\d*)", score_text)
                data["hotel_score"] = float(score_match.group(1)) if score_match else None
            except (NoSuchElementException, AttributeError, ValueError):
                data["hotel_score"] = None

            # Extract price
            try:
                price_text = element.find_element(
                    By.CSS_SELECTOR, "[data-testid='price'], .price, .amount"
                ).text.strip()
                price_match = re.search(r"(\d+[\.,]?\d*)", price_text.replace(" ", ""))
                if price_match:
                    data["starting_price"] = float(price_match.group(1).replace(",", "."))
                else:
                    data["starting_price"] = None
            except (NoSuchElementException, AttributeError, ValueError):
                data["starting_price"] = None

            # Extract discount
            try:
                discount_text = element.find_element(
                    By.CSS_SELECTOR, "[data-testid='discount'], .discount, .reduction"
                ).text.strip()
                discount_match = re.search(r"(\d+)", discount_text)
                data["discount_percentage"] = (
                    float(discount_match.group(1)) if discount_match else None
                )
            except (NoSuchElementException, AttributeError, ValueError):
                data["discount_percentage"] = None

            # Extract booking link
            try:
                link_element = element.find_element(By.CSS_SELECTOR, "a[href]")
                href = link_element.get_attribute("href")
                if href and href.startswith("http"):
                    data["booking_link"] = href
                else:
                    data["booking_link"] = None
            except NoSuchElementException:
                data["booking_link"] = None

            return data

        except Exception as e:
            print(f"Error extracting package data: {e}")
            return None

    def scrape_page(
        self, date: str, nights: int, offset: int = 0, size: int = 10
    ) -> List[Dict[str, Any]]:
        """Scrape a single page of results.

        Args:
            date: Departure date in DD/MM/YYYY format
            nights: Duration in nights
            offset: Pagination offset
            size: Results per page

        Returns:
            List of package dictionaries
        """
        url = self._build_url(date, nights, offset, size)
        print(f"Scraping: {url}")

        try:
            self.driver.get(url)
            time.sleep(self.delay)

            # Wait for content to load
            try:
                WebDriverWait(self.driver, 10).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, "body"))
                )
            except TimeoutException:
                print("Timeout waiting for page to load")
                return []

            # Try different selectors for package elements
            package_selectors = [
                "[data-testid='package-card']",
                ".package-card",
                ".vacation-package",
                "[class*='package']",
                "article",
            ]

            packages = []
            for selector in package_selectors:
                elements = self.driver.find_elements(By.CSS_SELECTOR, selector)
                if elements:
                    print(f"Found {len(elements)} packages using selector: {selector}")
                    for element in elements:
                        package_data = self._extract_package_data(element)
                        if package_data:
                            # Add search parameters
                            package_data["duration_nights"] = nights
                            packages.append(package_data)
                    break

            if not packages:
                print("No packages found on this page")

            return packages

        except Exception as e:
            print(f"Error scraping page: {e}")
            return []

    def scrape_all_pages(
        self, date: str, nights: int, max_pages: int = 10
    ) -> List[Dict[str, Any]]:
        """Scrape all pages for a given date and duration.

        Args:
            date: Departure date in DD/MM/YYYY format
            nights: Duration in nights
            max_pages: Maximum number of pages to scrape

        Returns:
            List of all packages found
        """
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

            # Be respectful with delays
            time.sleep(self.delay)

        return all_packages

    def scrape_date_range(
        self,
        start_date: datetime,
        end_date: datetime,
        nights_list: List[int],
        max_pages: int = 10,
    ) -> List[Dict[str, Any]]:
        """Scrape packages for a date range and multiple durations.

        Args:
            start_date: Start date for departures
            end_date: End date for departures
            nights_list: List of durations to search
            max_pages: Maximum pages per search

        Returns:
            List of all packages found
        """
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

    def start(self):
        """Start the scraper (setup driver)."""
        if not self.driver:
            self._setup_driver()

    def stop(self):
        """Stop the scraper (close driver)."""
        if self.driver:
            self.driver.quit()
            self.driver = None

    def __enter__(self):
        """Context manager entry."""
        self.start()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit."""
        self.stop()
