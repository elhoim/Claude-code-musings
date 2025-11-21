# Advanced Usage and Anti-Blocking Strategies

## Understanding Web Scraping Challenges

Both bookfinder.com and addall.com implement anti-scraping measures to protect their servers from automated requests. This is a common and legitimate practice. This document explains the challenges and potential solutions.

## Common Issues

### 403 Forbidden Errors

When you see:
```
Error searching BookFinder: 403 Client Error: Forbidden
```

This means the website has detected and blocked your automated request. Websites use various techniques:
- IP-based rate limiting
- User-Agent detection
- Behavioral analysis
- CAPTCHA challenges
- Cookie/session validation

## Built-in Mitigations

The scraper includes several features to work around basic blocking:

1. **Browser-like Headers**: Mimics a real Chrome browser
2. **Retry Logic**: Automatically retries failed requests with delays
3. **Rate Limiting**: Waits between requests to different sites
4. **Session Management**: Maintains cookies across requests

## Advanced Solutions

### Option 1: Use Debug Mode

Enable debug output to see what's happening:
```bash
python book_scraper.py --isbn 9780143039433 --debug
```

This shows:
- Exact URLs being requested
- Number of retry attempts
- Specific error messages

### Option 2: Manual Browser Search

If automated scraping fails, use the URLs for manual searching:

**BookFinder ISBN Search:**
```
https://www.bookfinder.com/search/?isbn=YOUR_ISBN&destination=be&currency=EUR
```

**BookFinder Title Search:**
```
https://www.bookfinder.com/search/?title=YOUR_TITLE&destination=be&currency=EUR
```

**AddAll ISBN Search:**
```
https://www.addall.com/SuperRare/UsedRare.cgi?isbn=YOUR_ISBN&location=BE&currency=EUR
```

**AddAll Title Search:**
```
https://www.addall.com/SuperRare/UsedRare.cgi?title=YOUR_TITLE&location=BE&currency=EUR
```

### Option 3: Using Selenium (Browser Automation)

For sites with strong anti-scraping measures, you can use Selenium to control a real browser:

1. Install Selenium:
```bash
pip install selenium webdriver-manager
```

2. Create a Selenium-based scraper (see `selenium_scraper.py` example below)

### Option 4: API Alternatives

Consider using official APIs when available:
- Google Books API
- Open Library API
- ISBNdb API
- Amazon Product Advertising API

These provide structured data without scraping concerns.

## Selenium Example

Create `selenium_scraper.py`:

```python
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
import time

def search_with_selenium(isbn):
    # Setup Chrome options
    chrome_options = Options()
    chrome_options.add_argument('--headless')  # Run in background
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')

    # Initialize driver
    driver = webdriver.Chrome(
        service=Service(ChromeDriverManager().install()),
        options=chrome_options
    )

    try:
        # Navigate to BookFinder
        url = f"https://www.bookfinder.com/search/?isbn={isbn}&destination=be&currency=EUR"
        driver.get(url)

        # Wait for results to load
        time.sleep(3)

        # Extract results
        results = driver.find_elements(By.CLASS_NAME, 'result-item')

        for result in results:
            try:
                title = result.find_element(By.CLASS_NAME, 'title').text
                price = result.find_element(By.CLASS_NAME, 'price').text
                print(f"{title}: {price}")
            except:
                continue

    finally:
        driver.quit()

# Usage
search_with_selenium("9780143039433")
```

## Rate Limiting Best Practices

To be respectful to the websites:

1. **Add delays between requests**:
```python
time.sleep(2)  # Wait 2 seconds between requests
```

2. **Limit concurrent requests**: Don't run multiple instances simultaneously

3. **Cache results**: Save results locally to avoid repeated requests

4. **Use during off-peak hours**: Less likely to trigger rate limiting

## Legal and Ethical Considerations

### Important Notes:

1. **Terms of Service**: Always review and comply with websites' Terms of Service
2. **robots.txt**: Respect the robots.txt file directives
3. **Rate Limiting**: Don't overload servers with requests
4. **Personal Use**: This tool is intended for personal, educational use
5. **Commercial Use**: May require permission or violate ToS

### Check robots.txt:
```bash
curl https://www.bookfinder.com/robots.txt
curl https://www.addall.com/robots.txt
```

## Alternative Approaches

### 1. Browser Extensions
Create a browser extension that compares prices while you browse normally.

### 2. Bookmarklet
Use JavaScript bookmarklets to extract data from pages you're already viewing:

```javascript
javascript:(function(){
  var results = document.querySelectorAll('.result-item');
  results.forEach(r => {
    console.log(r.querySelector('.title').textContent);
  });
})();
```

### 3. Request Access
Contact the websites to request:
- API access
- Data partnership
- Affiliate program that provides price data

## Proxy and VPN Solutions

If you need to make more requests:

### Using Proxies:
```python
proxies = {
    'http': 'http://proxy-server:port',
    'https': 'https://proxy-server:port'
}
response = requests.get(url, proxies=proxies)
```

### Rotating User Agents:
```python
import random

user_agents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ...',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) ...',
    # Add more user agents
]

headers = {'User-Agent': random.choice(user_agents)}
```

## Troubleshooting Checklist

- [ ] Is your internet connection working?
- [ ] Can you access the sites in a regular browser?
- [ ] Have you waited a few minutes since your last request?
- [ ] Are you using the latest version of the scraper?
- [ ] Have you tried with `--debug` flag?
- [ ] Have you tried searching just one site at a time?
- [ ] Is your ISBN/title correctly formatted?

## Getting Help

If you continue to have issues:

1. Check if the site is accessible in your browser
2. Try a different network (mobile hotspot, VPN)
3. Consider using the manual URLs provided in the troubleshooting output
4. Look into Selenium-based alternatives
5. Explore official API alternatives

## Future Enhancements

Potential improvements to this scraper:

- [ ] Implement Selenium support
- [ ] Add proxy rotation
- [ ] Implement caching layer
- [ ] Add more book search sites (AbeBooks, Alibris, etc.)
- [ ] Create a web UI
- [ ] Add price history tracking
- [ ] Implement notification system for price drops
- [ ] Add support for more countries/currencies

## Resources

- [Requests Documentation](https://requests.readthedocs.io/)
- [Beautiful Soup Documentation](https://www.crummy.com/software/BeautifulSoup/bs4/doc/)
- [Selenium Documentation](https://selenium-python.readthedocs.io/)
- [Web Scraping Best Practices](https://www.scrapehero.com/web-scraping-best-practices/)
