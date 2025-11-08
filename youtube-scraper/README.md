# YouTube Info Cards Scraper

A command-line Python tool to scrape info cards and end screens from YouTube videos and store them in a SQLite3 database.

## Features

- Extract info cards from YouTube videos
- Extract end screen elements
- Store all data in a local SQLite3 database
- List all scraped videos
- View stored cards for specific videos
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

### Scrape a video

```bash
python youtube_infocards_scraper.py "https://www.youtube.com/watch?v=VIDEO_ID"
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

## Examples

```bash
# Scrape a video
python youtube_infocards_scraper.py "https://www.youtube.com/watch?v=dQw4w9WgXcQ"

# List all scraped videos
python youtube_infocards_scraper.py --list

# Show cards for a specific video
python youtube_infocards_scraper.py --show dQw4w9WgXcQ

# Use verbose mode for debugging
python youtube_infocards_scraper.py "https://www.youtube.com/watch?v=dQw4w9WgXcQ" -v
```
