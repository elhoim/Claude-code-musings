#!/usr/bin/env python3
"""
Example Selenium-based scraper for BookFinder
This uses a real browser to bypass some anti-scraping measures.

Installation:
    pip install selenium webdriver-manager

Usage:
    python selenium_example.py
"""

import sys
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
import time
import re


class SeleniumBookFinder:
    """Selenium-based scraper for BookFinder"""

    def __init__(self, headless: bool = True):
        """
        Initialize the Selenium driver

        Args:
            headless: Run browser in background (no window)
        """
        chrome_options = Options()

        if headless:
            chrome_options.add_argument('--headless')

        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--disable-blink-features=AutomationControlled')
        chrome_options.add_experimental_option('excludeSwitches', ['enable-automation'])
        chrome_options.add_experimental_option('useAutomationExtension', False)

        # Initialize driver
        self.driver = webdriver.Chrome(
            service=Service(ChromeDriverManager().install()),
            options=chrome_options
        )

        # Modify navigator.webdriver flag
        self.driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")

    def search_isbn(self, isbn: str):
        """Search for a book by ISBN"""
        url = f"https://www.bookfinder.com/search/?isbn={isbn}&destination=be&currency=EUR&mode=basic&st=sr&ac=qr"

        print(f"Navigating to: {url}")
        self.driver.get(url)

        # Wait for page to load
        time.sleep(3)

        # Try to find results
        try:
            # Wait for results to appear
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.CLASS_NAME, "result"))
            )

            # Extract results
            results = self._extract_results()

            return results

        except Exception as e:
            print(f"Error finding results: {e}")
            print("\nPage source preview:")
            print(self.driver.page_source[:500])
            return []

    def search_title(self, title: str):
        """Search for a book by title"""
        url = f"https://www.bookfinder.com/search/?title={title}&destination=be&currency=EUR&mode=basic&st=sr&ac=qr"

        print(f"Navigating to: {url}")
        self.driver.get(url)

        # Wait for page to load
        time.sleep(3)

        try:
            # Wait for results
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.CLASS_NAME, "result"))
            )

            results = self._extract_results()
            return results

        except Exception as e:
            print(f"Error finding results: {e}")
            return []

    def _extract_results(self):
        """Extract book results from the current page"""
        results = []

        # Try different selectors for results
        result_elements = self.driver.find_elements(By.CSS_SELECTOR, '.result, .result-item, .item')

        print(f"Found {len(result_elements)} result elements")

        for elem in result_elements[:20]:  # Limit to first 20
            try:
                # Extract text content
                text = elem.text

                # Try to find link
                try:
                    link = elem.find_element(By.TAG_NAME, 'a').get_attribute('href')
                except:
                    link = "N/A"

                # Simple parsing - you'd need to adjust based on actual HTML structure
                result = {
                    'text': text,
                    'link': link
                }

                results.append(result)

            except Exception as e:
                print(f"Error extracting result: {e}")
                continue

        return results

    def close(self):
        """Close the browser"""
        self.driver.quit()

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.close()


def main():
    """Example usage"""
    print("Selenium BookFinder Example")
    print("=" * 60)

    # Example: Search by ISBN
    isbn = "9780143039433"  # The Kite Runner

    print(f"\nSearching for ISBN: {isbn}")
    print("(This will take a few seconds...)\n")

    try:
        with SeleniumBookFinder(headless=False) as scraper:  # Set to False to see browser
            results = scraper.search_isbn(isbn)

            print(f"\nFound {len(results)} results:")
            print("=" * 60)

            for i, result in enumerate(results, 1):
                print(f"\n{i}. {result['text'][:200]}...")
                print(f"   Link: {result['link']}")

            # Keep browser open for a moment to see results
            if not scraper.driver.capabilities.get('headless'):
                print("\n(Browser will close in 5 seconds...)")
                time.sleep(5)

    except Exception as e:
        print(f"Error: {e}")
        return 1

    return 0


if __name__ == '__main__':
    sys.exit(main())
