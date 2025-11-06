#!/usr/bin/env python3
"""
DoctorAnytime Availability Scraper

This script scrapes availability data from DoctorAnytime.be for a specific specialist
and stores the results in a SQLite database, then generates an HTML report.
"""

import argparse
import sqlite3
import time
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import sys
import os

try:
    from selenium import webdriver
    from selenium.webdriver.common.by import By
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    from selenium.webdriver.chrome.options import Options
    from selenium.common.exceptions import TimeoutException, NoSuchElementException
except ImportError:
    print("Error: Selenium is not installed. Please run: pip install selenium")
    sys.exit(1)


class DoctorAnytimeScraper:
    """Scraper for DoctorAnytime availability data."""

    LANGUAGE_CODES = {
        'fr': 'fr-BE',
        'nl': 'nl-BE',
        'en': 'en-BE'
    }

    def __init__(self, url: str, language: str = 'fr', headless: bool = True):
        """
        Initialize the scraper.

        Args:
            url: The specialist profile URL
            language: Language code (fr, nl, en)
            headless: Run browser in headless mode
        """
        self.url = url
        self.language = language
        self.headless = headless
        self.driver = None
        self.db_path = 'availability.db'

    def setup_driver(self):
        """Setup Selenium WebDriver with appropriate options."""
        chrome_options = Options()

        if self.headless:
            chrome_options.add_argument('--headless')

        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--disable-blink-features=AutomationControlled')
        chrome_options.add_argument('--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')

        # Set language preference
        if self.language in self.LANGUAGE_CODES:
            chrome_options.add_argument(f'--lang={self.LANGUAGE_CODES[self.language]}')

        try:
            self.driver = webdriver.Chrome(options=chrome_options)
        except Exception as e:
            print(f"Error: Could not initialize Chrome driver: {e}")
            print("\nPlease ensure Chrome and ChromeDriver are installed.")
            print("You can install ChromeDriver using:")
            print("  - Ubuntu/Debian: sudo apt-get install chromium-chromedriver")
            print("  - Or download from: https://chromedriver.chromium.org/")
            sys.exit(1)

    def setup_database(self):
        """Create SQLite database and tables."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        # Create tables
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS specialists (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                specialty TEXT,
                url TEXT UNIQUE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS services (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                specialist_id INTEGER,
                service_name TEXT NOT NULL,
                service_duration TEXT,
                service_price TEXT,
                FOREIGN KEY (specialist_id) REFERENCES specialists(id),
                UNIQUE(specialist_id, service_name)
            )
        ''')

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS availability (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                service_id INTEGER,
                date TEXT NOT NULL,
                time TEXT NOT NULL,
                booking_link TEXT,
                scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (service_id) REFERENCES services(id),
                UNIQUE(service_id, date, time)
            )
        ''')

        conn.commit()
        conn.close()

    def load_page(self):
        """Load the specialist page."""
        print(f"Loading page: {self.url}")

        # Adjust URL for language
        if self.language != 'fr':
            # Check if URL already has language parameter
            if '?' in self.url:
                self.url += f'&lang={self.language}'
            else:
                self.url += f'?lang={self.language}'

        self.driver.get(self.url)
        time.sleep(3)  # Wait for page to load

    def get_specialist_info(self) -> Dict[str, str]:
        """Extract specialist information from the page."""
        info = {
            'name': 'Unknown',
            'specialty': 'Unknown'
        }

        try:
            # Try to find specialist name
            name_selectors = [
                "h1",
                "[class*='doctor-name']",
                "[class*='specialist-name']",
                "[data-testid='doctor-name']"
            ]

            for selector in name_selectors:
                try:
                    element = self.driver.find_element(By.CSS_SELECTOR, selector)
                    if element.text.strip():
                        info['name'] = element.text.strip()
                        break
                except NoSuchElementException:
                    continue

            # Try to find specialty
            specialty_selectors = [
                "[class*='specialty']",
                "[class*='profession']",
                "h2"
            ]

            for selector in specialty_selectors:
                try:
                    element = self.driver.find_element(By.CSS_SELECTOR, selector)
                    if element.text.strip() and element.text.strip() != info['name']:
                        info['specialty'] = element.text.strip()
                        break
                except NoSuchElementException:
                    continue

            print(f"Specialist: {info['name']} - {info['specialty']}")

        except Exception as e:
            print(f"Warning: Could not extract specialist info: {e}")

        return info

    def get_services(self) -> List[Dict[str, str]]:
        """Extract available services from the page."""
        services = []

        try:
            print("Looking for available services...")
            time.sleep(2)

            # Common selectors for service listings
            service_selectors = [
                "[class*='service']",
                "[class*='appointment-type']",
                "[class*='consultation']",
                "button[class*='booking']",
                "[role='button']"
            ]

            elements = []
            for selector in service_selectors:
                try:
                    found = self.driver.find_elements(By.CSS_SELECTOR, selector)
                    if found:
                        elements.extend(found)
                except Exception:
                    continue

            # Try to extract service information
            seen = set()
            for element in elements:
                try:
                    text = element.text.strip()
                    if text and len(text) > 3 and text not in seen:
                        service = {
                            'name': text,
                            'duration': '',
                            'price': ''
                        }

                        # Try to find duration and price in nearby elements
                        try:
                            parent = element.find_element(By.XPATH, '..')
                            parent_text = parent.text

                            # Look for duration patterns (e.g., "30 min", "1h")
                            import re
                            duration_match = re.search(r'\d+\s*(min|h|hour|minute)', parent_text, re.IGNORECASE)
                            if duration_match:
                                service['duration'] = duration_match.group(0)

                            # Look for price patterns (e.g., "€50", "50€")
                            price_match = re.search(r'€\s*\d+|\d+\s*€', parent_text)
                            if price_match:
                                service['price'] = price_match.group(0)
                        except Exception:
                            pass

                        services.append(service)
                        seen.add(text)

                except Exception:
                    continue

            if not services:
                print("Warning: Could not find services automatically.")
                print("The page might use a different structure.")
                # Add a default service option
                services.append({
                    'name': 'General Consultation (Default)',
                    'duration': '',
                    'price': ''
                })

        except Exception as e:
            print(f"Error extracting services: {e}")
            services.append({
                'name': 'General Consultation (Default)',
                'duration': '',
                'price': ''
            })

        return services

    def select_service(self, services: List[Dict[str, str]]) -> Optional[Dict[str, str]]:
        """Let user select a service from available options."""
        if not services:
            print("No services found!")
            return None

        print("\nAvailable services:")
        for i, service in enumerate(services, 1):
            duration = f" ({service['duration']})" if service['duration'] else ""
            price = f" - {service['price']}" if service['price'] else ""
            print(f"{i}. {service['name']}{duration}{price}")

        while True:
            try:
                choice = input(f"\nSelect a service (1-{len(services)}): ").strip()
                index = int(choice) - 1
                if 0 <= index < len(services):
                    return services[index]
                else:
                    print(f"Please enter a number between 1 and {len(services)}")
            except ValueError:
                print("Please enter a valid number")
            except KeyboardInterrupt:
                print("\nCancelled by user")
                return None

    def click_service(self, service_name: str):
        """Click on a service button/element."""
        try:
            # Try to find and click the service element
            elements = self.driver.find_elements(By.XPATH, f"//*[contains(text(), '{service_name}')]")

            for element in elements:
                try:
                    # Check if element is clickable
                    if element.is_displayed() and element.is_enabled():
                        element.click()
                        time.sleep(2)
                        return True
                except Exception:
                    continue

            return False
        except Exception as e:
            print(f"Could not click service: {e}")
            return False

    def scrape_availability(self, months: int = 3) -> List[Dict[str, str]]:
        """
        Scrape availability for the next N months.

        Args:
            months: Number of months to scrape

        Returns:
            List of availability slots
        """
        availability_data = []

        print(f"\nScraping availability for the next {months} months...")

        try:
            # Look for calendar/date picker
            date_selectors = [
                "[class*='calendar']",
                "[class*='date-picker']",
                "[class*='schedule']",
                "[type='date']"
            ]

            # Look for time slot elements
            time_selectors = [
                "[class*='time-slot']",
                "[class*='appointment-time']",
                "button[class*='time']",
                "[data-time]"
            ]

            start_date = datetime.now()
            end_date = start_date + timedelta(days=months * 30)

            current_date = start_date
            while current_date <= end_date:
                date_str = current_date.strftime('%Y-%m-%d')

                try:
                    # Try to navigate to specific date
                    # This is highly dependent on the website structure
                    # We'll look for available slots on the current view

                    time.sleep(1)  # Rate limiting

                    # Try to find time slots
                    for selector in time_selectors:
                        try:
                            slots = self.driver.find_elements(By.CSS_SELECTOR, selector)

                            for slot in slots:
                                try:
                                    time_text = slot.text.strip()
                                    if time_text and ':' in time_text:
                                        # Try to get booking link
                                        booking_link = ''
                                        try:
                                            if slot.tag_name == 'a':
                                                booking_link = slot.get_attribute('href')
                                            else:
                                                parent_link = slot.find_element(By.XPATH, './ancestor::a[1]')
                                                booking_link = parent_link.get_attribute('href')
                                        except Exception:
                                            pass

                                        availability_data.append({
                                            'date': date_str,
                                            'time': time_text,
                                            'booking_link': booking_link or self.url
                                        })
                                except Exception:
                                    continue

                            if slots:
                                break  # Found slots with this selector

                        except Exception:
                            continue

                    # Try to navigate to next day
                    try:
                        next_buttons = self.driver.find_elements(By.CSS_SELECTOR,
                            "button[class*='next'], [class*='arrow-right'], [aria-label*='next']")

                        clicked = False
                        for btn in next_buttons:
                            if btn.is_displayed():
                                btn.click()
                                time.sleep(1)
                                clicked = True
                                break

                        if not clicked:
                            # If we can't navigate, increment date manually
                            current_date += timedelta(days=1)
                    except Exception:
                        current_date += timedelta(days=1)

                except Exception as e:
                    print(f"Error scraping date {date_str}: {e}")
                    current_date += timedelta(days=1)
                    continue

            print(f"Found {len(availability_data)} available time slots")

        except Exception as e:
            print(f"Error during scraping: {e}")

        return availability_data

    def save_to_database(self, specialist_info: Dict, service: Dict, availability: List[Dict]):
        """Save scraped data to SQLite database."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        try:
            # Insert specialist
            cursor.execute('''
                INSERT OR REPLACE INTO specialists (name, specialty, url)
                VALUES (?, ?, ?)
            ''', (specialist_info['name'], specialist_info['specialty'], self.url))

            specialist_id = cursor.lastrowid
            if specialist_id == 0:  # Already exists
                cursor.execute('SELECT id FROM specialists WHERE url = ?', (self.url,))
                specialist_id = cursor.fetchone()[0]

            # Insert service
            cursor.execute('''
                INSERT OR REPLACE INTO services (specialist_id, service_name, service_duration, service_price)
                VALUES (?, ?, ?, ?)
            ''', (specialist_id, service['name'], service.get('duration', ''), service.get('price', '')))

            service_id = cursor.lastrowid
            if service_id == 0:
                cursor.execute('''
                    SELECT id FROM services WHERE specialist_id = ? AND service_name = ?
                ''', (specialist_id, service['name']))
                service_id = cursor.fetchone()[0]

            # Insert availability
            for slot in availability:
                cursor.execute('''
                    INSERT OR REPLACE INTO availability (service_id, date, time, booking_link)
                    VALUES (?, ?, ?, ?)
                ''', (service_id, slot['date'], slot['time'], slot['booking_link']))

            conn.commit()
            print(f"\nData saved to database: {self.db_path}")

        except Exception as e:
            print(f"Error saving to database: {e}")
            conn.rollback()
        finally:
            conn.close()

    def generate_html_report(self, output_file: str = 'availability_report.html'):
        """Generate HTML report from database."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        try:
            # Get all data
            cursor.execute('''
                SELECT
                    s.name as specialist_name,
                    s.specialty,
                    s.url,
                    sv.service_name,
                    sv.service_duration,
                    sv.service_price,
                    a.date,
                    a.time,
                    a.booking_link,
                    a.scraped_at
                FROM availability a
                JOIN services sv ON a.service_id = sv.id
                JOIN specialists s ON sv.specialist_id = s.id
                ORDER BY a.date, a.time
            ''')

            rows = cursor.fetchall()

            if not rows:
                print("No data found in database")
                return

            # Group by date
            dates_dict = {}
            specialist_name = rows[0][0]
            specialty = rows[0][1]
            service_name = rows[0][3]

            for row in rows:
                date = row[6]
                time_slot = row[7]
                booking_link = row[8]

                if date not in dates_dict:
                    dates_dict[date] = []

                dates_dict[date].append({
                    'time': time_slot,
                    'link': booking_link
                })

            # Generate HTML
            html = f'''<!DOCTYPE html>
<html lang="{self.language}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Availability Report - {specialist_name}</title>
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}

        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f5f5f5;
            padding: 20px;
        }}

        .container {{
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }}

        header {{
            border-bottom: 3px solid #007bff;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }}

        h1 {{
            color: #007bff;
            font-size: 2em;
            margin-bottom: 10px;
        }}

        .subtitle {{
            color: #666;
            font-size: 1.1em;
        }}

        .meta {{
            background: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 30px;
        }}

        .meta p {{
            margin: 5px 0;
        }}

        .date-section {{
            margin-bottom: 30px;
            border: 1px solid #dee2e6;
            border-radius: 8px;
            overflow: hidden;
        }}

        .date-header {{
            background: #007bff;
            color: white;
            padding: 15px 20px;
            font-size: 1.2em;
            font-weight: 600;
        }}

        .time-slots {{
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 10px;
            padding: 20px;
            background: white;
        }}

        .time-slot {{
            display: block;
            padding: 12px;
            text-align: center;
            background: #f8f9fa;
            border: 2px solid #dee2e6;
            border-radius: 5px;
            text-decoration: none;
            color: #333;
            font-weight: 500;
            transition: all 0.3s;
        }}

        .time-slot:hover {{
            background: #007bff;
            color: white;
            border-color: #007bff;
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0,123,255,0.3);
        }}

        .summary {{
            background: #e7f3ff;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
            border-left: 4px solid #007bff;
        }}

        .summary h2 {{
            color: #007bff;
            margin-bottom: 10px;
        }}

        footer {{
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #dee2e6;
            text-align: center;
            color: #666;
            font-size: 0.9em;
        }}

        @media (max-width: 768px) {{
            .time-slots {{
                grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
            }}

            .container {{
                padding: 15px;
            }}
        }}
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>{specialist_name}</h1>
            <p class="subtitle">{specialty}</p>
        </header>

        <div class="meta">
            <p><strong>Service:</strong> {service_name}</p>
            <p><strong>Report Generated:</strong> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
            <p><strong>Language:</strong> {self.language.upper()}</p>
        </div>

        <div class="summary">
            <h2>Summary</h2>
            <p><strong>Total Available Dates:</strong> {len(dates_dict)}</p>
            <p><strong>Total Time Slots:</strong> {len(rows)}</p>
        </div>

        <div class="availability">
'''

            # Add date sections
            for date, slots in sorted(dates_dict.items()):
                # Format date nicely
                try:
                    date_obj = datetime.strptime(date, '%Y-%m-%d')
                    formatted_date = date_obj.strftime('%A, %B %d, %Y')
                except:
                    formatted_date = date

                html += f'''
            <div class="date-section">
                <div class="date-header">{formatted_date}</div>
                <div class="time-slots">
'''

                for slot in sorted(slots, key=lambda x: x['time']):
                    html += f'''                    <a href="{slot['link']}" class="time-slot" target="_blank">{slot['time']}</a>
'''

                html += '''                </div>
            </div>
'''

            html += f'''        </div>

        <footer>
            <p>Generated by DoctorAnytime Availability Scraper</p>
            <p>Data scraped from <a href="{self.url}" target="_blank">{self.url}</a></p>
        </footer>
    </div>
</body>
</html>'''

            # Write to file
            with open(output_file, 'w', encoding='utf-8') as f:
                f.write(html)

            print(f"\nHTML report generated: {output_file}")
            print(f"Open it in your browser to view the availability calendar")

        except Exception as e:
            print(f"Error generating HTML report: {e}")
        finally:
            conn.close()

    def run(self):
        """Main execution flow."""
        try:
            print("DoctorAnytime Availability Scraper")
            print("=" * 50)

            # Setup
            self.setup_database()
            self.setup_driver()

            # Load page
            self.load_page()

            # Get specialist info
            specialist_info = self.get_specialist_info()

            # Get services
            services = self.get_services()

            if not services:
                print("Could not find any services. Please check the page manually.")
                return

            # Let user select service
            selected_service = self.select_service(services)

            if not selected_service:
                return

            print(f"\nSelected service: {selected_service['name']}")

            # Try to click on service if needed
            self.click_service(selected_service['name'])

            # Scrape availability
            availability = self.scrape_availability(months=3)

            if not availability:
                print("\nWarning: No availability data was scraped.")
                print("This could be because:")
                print("  1. There are no available slots")
                print("  2. The website structure is different than expected")
                print("  3. Additional interactions are needed on the page")
                print("\nPlease check the page manually or adjust the scraper.")

            # Save to database
            self.save_to_database(specialist_info, selected_service, availability)

            # Generate HTML report
            self.generate_html_report()

            print("\n" + "=" * 50)
            print("Scraping completed successfully!")

        except KeyboardInterrupt:
            print("\n\nScraping interrupted by user")
        except Exception as e:
            print(f"\nError during execution: {e}")
            import traceback
            traceback.print_exc()
        finally:
            if self.driver:
                self.driver.quit()


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description='Scrape availability data from DoctorAnytime.be',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog='''
Examples:
  # Scrape in French (default)
  python scraper.py https://www.doctoranytime.be/d/kinesitherapeute/elena-trifan

  # Scrape in Dutch
  python scraper.py https://www.doctoranytime.be/d/kinesitherapeute/elena-trifan --language nl

  # Scrape in English with visible browser
  python scraper.py https://www.doctoranytime.be/d/kinesitherapeute/elena-trifan --language en --no-headless
        '''
    )

    parser.add_argument('url', help='The specialist profile URL')
    parser.add_argument('--language', '-l',
                       choices=['fr', 'nl', 'en'],
                       default='fr',
                       help='Language for scraping (default: fr)')
    parser.add_argument('--no-headless',
                       action='store_true',
                       help='Show browser window (useful for debugging)')
    parser.add_argument('--output', '-o',
                       default='availability_report.html',
                       help='Output HTML file name (default: availability_report.html)')

    args = parser.parse_args()

    # Create scraper and run
    scraper = DoctorAnytimeScraper(
        url=args.url,
        language=args.language,
        headless=not args.no_headless
    )

    scraper.db_path = 'availability.db'
    scraper.run()

    # Generate report with custom output name if specified
    if args.output != 'availability_report.html':
        scraper.generate_html_report(args.output)


if __name__ == '__main__':
    main()
