# YouTube Info Cards Scraper

A command-line Python tool to scrape info cards and end screens from YouTube videos and store them in a SQLite3 database.

## Features

- Extract info cards from YouTube videos
- Extract end screen elements
- **Scrape entire channels** - Download info cards from all videos in a channel
- Store all data in a local SQLite3 database
- List all scraped videos
- View stored cards for specific videos
- Batch processing with progress tracking
- Rate limiting protection with configurable delays
- No YouTube API key required (uses unofficial API via yt-dlp)

## Installation

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Make the script executable (optional):
```bash
chmod +x youtube_infocards_scraper.py
```

## Usage

### Scrape a single video

```bash
python youtube_infocards_scraper.py "https://www.youtube.com/watch?v=VIDEO_ID"
```

### Scrape all videos from a channel

You can scrape entire channels using the channel handle, ID, or URL:

```bash
# Using channel handle
python youtube_infocards_scraper.py --channel @ChannelHandle

# Using channel ID (starts with UC)
python youtube_infocards_scraper.py --channel UCxxxxxxxxxxxxxxxxxxxxx

# Using full channel URL
python youtube_infocards_scraper.py --channel "https://www.youtube.com/c/ChannelName"
```

### Limit number of videos from a channel

```bash
# Scrape only the first 50 videos
python youtube_infocards_scraper.py --channel @ChannelHandle --limit 50
```

### Adjust delay between requests

```bash
# Wait 2 seconds between each video (default is 1 second)
python youtube_infocards_scraper.py --channel @ChannelHandle --delay 2.0
```

### Use a custom database file

```bash
python youtube_infocards_scraper.py "https://www.youtube.com/watch?v=VIDEO_ID" --db custom_db.db
```

### List all videos in database

```bash
python youtube_infocards_scraper.py --list
```

### Show info cards for a specific video

```bash
python youtube_infocards_scraper.py --show VIDEO_ID
```

### Enable verbose output

```bash
python youtube_infocards_scraper.py "https://www.youtube.com/watch?v=VIDEO_ID" --verbose
```

## Database Schema

The script creates three tables:

### videos
- `id`: Primary key
- `video_id`: YouTube video ID
- `video_url`: Full video URL
- `video_title`: Video title
- `duration`: Video duration in seconds
- `uploader`: Channel name
- `upload_date`: Upload date
- `view_count`: Number of views
- `scraped_at`: Timestamp when scraped

### info_cards
- `id`: Primary key
- `video_id`: Foreign key to videos table
- `card_type`: Type of card (video, playlist, channel, link, poll)
- `card_title`: Card title
- `card_url`: Card URL
- `teaser_text`: Teaser text shown with card
- `timestamp_start`: When card appears (seconds)
- `timestamp_end`: When card disappears (seconds)
- `card_data`: Full JSON data
- `scraped_at`: Timestamp when scraped

### end_screens
- `id`: Primary key
- `video_id`: Foreign key to videos table
- `element_type`: Type of end screen element
- `element_title`: Element title
- `element_url`: Element URL
- `timestamp_start`: Start time (seconds)
- `timestamp_end`: End time (seconds)
- `left`, `top`, `width`, `height`: Position and size
- `element_data`: Full JSON data
- `scraped_at`: Timestamp when scraped

## Requirements

- Python 3.7+
- yt-dlp

## Notes

- Info cards are interactive elements that appear during a video
- End screens are elements that appear at the end of videos
- Not all videos have info cards or end screens
- The script uses yt-dlp's unofficial YouTube API, so it doesn't require API credentials
- Data is stored locally in SQLite3 for easy querying and analysis
- Channel scraping includes automatic rate limiting (1 second delay by default) to avoid being blocked
- Channel scraping can be interrupted with Ctrl+C and will show progress up to that point
- The script automatically skips re-scraping videos that are already in the database (based on video_id)

## Examples

```bash
# Scrape a single video
python youtube_infocards_scraper.py "https://www.youtube.com/watch?v=dQw4w9WgXcQ"

# Scrape entire channel
python youtube_infocards_scraper.py --channel @YouTubeCreators

# Scrape first 100 videos from a channel with 2-second delay
python youtube_infocards_scraper.py --channel UCxxxxxxxxxxxxx --limit 100 --delay 2.0

# List all scraped videos
python youtube_infocards_scraper.py --list

# Show cards for a specific video
python youtube_infocards_scraper.py --show dQw4w9WgXcQ

# Use verbose mode for debugging
python youtube_infocards_scraper.py "https://www.youtube.com/watch?v=dQw4w9WgXcQ" -v

# Scrape channel and store in custom database
python youtube_infocards_scraper.py --channel @ChannelHandle --db my_channel_data.db
```
