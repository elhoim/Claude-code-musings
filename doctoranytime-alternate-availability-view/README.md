# DoctorAnytime Availability Scraper

A command-line Python tool to scrape and track availability data from DoctorAnytime.be specialist profiles. The scraper collects appointment slots for the next 3 months, stores them in a SQLite database, and generates an interactive HTML report.

## Features

- **Multi-language Support**: Scrape in French (default), Dutch, or English
- **Service Selection**: Interactive menu to choose from available services
- **3-Month Availability**: Automatically scrapes appointment slots for the next 3 months
- **SQLite Database**: Persistent storage of all scraped data
- **HTML Reports**: Beautiful, interactive HTML calendar view with direct booking links
- **Rate Limiting**: Built-in delays to be respectful to the website

## Requirements

- Python 3.7+
- Chrome browser
- ChromeDriver

## Installation

### 1. Install Python Dependencies

```bash
pip install -r requirements.txt
```

### 2. Install Chrome and ChromeDriver

#### Ubuntu/Debian
```bash
sudo apt-get update
sudo apt-get install chromium-browser chromium-chromedriver
```

#### macOS
```bash
brew install --cask google-chrome
brew install chromedriver
```

#### Windows
- Download Chrome from: https://www.google.com/chrome/
- Download ChromeDriver from: https://chromedriver.chromium.org/
- Add ChromeDriver to your PATH

## Usage

### Basic Usage (French)

```bash
python scraper.py https://www.doctoranytime.be/d/kinesitherapeute/elena-trifan
```

### Scrape in Dutch

```bash
python scraper.py https://www.doctoranytime.be/d/kinesitherapeute/elena-trifan --language nl
```

### Scrape in English

```bash
python scraper.py https://www.doctoranytime.be/d/kinesitherapeute/elena-trifan --language en
```

### Debug Mode (Show Browser)

```bash
python scraper.py https://www.doctoranytime.be/d/kinesitherapeute/elena-trifan --no-headless
```

### Custom Output File

```bash
python scraper.py https://www.doctoranytime.be/d/kinesitherapeute/elena-trifan --output my_report.html
```

## Command-Line Options

| Option | Short | Description | Default |
|--------|-------|-------------|---------|
| `url` | - | Specialist profile URL (required) | - |
| `--language` | `-l` | Language code: fr, nl, or en | fr |
| `--no-headless` | - | Show browser window (for debugging) | false |
| `--output` | `-o` | Output HTML filename | availability_report.html |

## How It Works

1. **Page Loading**: Opens the specialist's profile page in the selected language
2. **Service Discovery**: Automatically detects available services on the page
3. **User Selection**: Presents an interactive menu to select a service
4. **Data Scraping**: Iterates through calendar dates for the next 3 months
5. **Database Storage**: Saves all data to `availability.db` SQLite database
6. **Report Generation**: Creates an HTML report with all available time slots

## Database Schema

### Tables

#### specialists
- `id`: Primary key
- `name`: Specialist's name
- `specialty`: Medical specialty
- `url`: Profile URL
- `created_at`: Timestamp

#### services
- `id`: Primary key
- `specialist_id`: Foreign key to specialists
- `service_name`: Name of the service
- `service_duration`: Duration (if available)
- `service_price`: Price (if available)

#### availability
- `id`: Primary key
- `service_id`: Foreign key to services
- `date`: Appointment date (YYYY-MM-DD)
- `time`: Time slot (HH:MM)
- `booking_link`: Direct link to book
- `scraped_at`: Timestamp

## Output

### Console Output

The scraper provides real-time feedback:
- Page loading status
- Specialist information
- Available services menu
- Scraping progress
- Summary statistics

### HTML Report

An interactive HTML calendar showing:
- Specialist information
- Selected service details
- Available dates grouped and formatted
- Time slots as clickable booking links
- Responsive design for mobile and desktop

### Example HTML Report

Open `availability_report.html` in any web browser to see:
- Color-coded date sections
- Grid layout of time slots
- Hover effects for better UX
- Direct booking links for each slot

## Example: Elena Trifan (Kinésithérapeute)

```bash
# Scrape availability for Elena Trifan in French
python scraper.py https://www.doctoranytime.be/d/kinesitherapeute/elena-trifan

# The script will:
# 1. Load the page
# 2. Show: "Specialist: Elena Trifan - Kinésithérapeute"
# 3. List available services (e.g., "Consultation de kinésithérapie")
# 4. Prompt: "Select a service (1-N):"
# 5. Scrape 3 months of availability
# 6. Save to database
# 7. Generate HTML report
```

## Troubleshooting

### "Could not initialize Chrome driver"

Make sure Chrome and ChromeDriver are installed:
```bash
# Check Chrome
google-chrome --version  # or chromium --version

# Check ChromeDriver
chromedriver --version
```

### "No services found"

The website structure might have changed. Try:
1. Run with `--no-headless` to see what's happening
2. Check if the page loads correctly
3. The script will offer a default "General Consultation" option

### "No availability data was scraped"

This could mean:
1. No slots are available for the next 3 months
2. The website structure is different than expected
3. Additional login or interaction is required

Try running with `--no-headless` to investigate.

### Rate Limiting

The scraper includes built-in delays to avoid overwhelming the server. If you encounter issues:
- The script waits between page loads
- It navigates dates sequentially
- Consider running during off-peak hours

## Limitations

- **Website Changes**: The scraper relies on HTML structure which may change
- **JavaScript-heavy Sites**: Some interactions might not work in all cases
- **Authentication**: Does not handle login-required pages
- **Booking**: Only provides links; does not complete bookings automatically

## Best Practices

1. **Be Respectful**: Don't run the scraper too frequently
2. **Check Manually**: Verify availability on the actual website before booking
3. **Update Regularly**: Re-run periodically to get fresh data
4. **Backup Data**: The SQLite database persists between runs

## Data Privacy

- All data is stored locally in `availability.db`
- No data is transmitted to third parties
- The script only reads publicly available information
- Booking links point to the official website

## License

This tool is for personal use only. Respect the website's terms of service and robots.txt.

## Support

For issues or questions:
1. Check the troubleshooting section
2. Run with `--no-headless` to debug
3. Review the console output for errors

## Future Enhancements

Possible improvements:
- [ ] Support for multiple specialists
- [ ] Email notifications for new slots
- [ ] Calendar export (iCal format)
- [ ] Comparison between scraping runs
- [ ] Web dashboard instead of static HTML
- [ ] Automatic retry on network errors
- [ ] Support for other booking platforms

## Contributing

Feel free to fork and improve this scraper. When modifying:
1. Test with `--no-headless` first
2. Add appropriate error handling
3. Update this README with changes
4. Be mindful of rate limiting

---

**Disclaimer**: This tool is for personal use. Always verify availability directly on the official website before making appointments. The authors are not responsible for any discrepancies in scraped data.
