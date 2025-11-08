# Netflix Clone - Admin YouTube Video Manager

A Netflix-style web application that allows admin users to add and manage YouTube videos and playlists. Built with Python Flask and SQLite3.

## Features

- **Admin Authentication**: Secure login system for admin users
- **YouTube Video Integration**: Add individual YouTube videos by URL
- **YouTube Playlist Support**: Create playlists and organize videos
- **Netflix-style UI**: Modern, responsive interface inspired by Netflix
- **SQLite Database**: Lightweight database for storing users, videos, and playlists
- **Video Management**: View, organize, and delete videos through admin panel

## Installation

### Prerequisites

- Python 3.7 or higher
- pip (Python package installer)

### Setup

1. Navigate to the project directory:
```bash
cd netflix-clone
```

2. Install required dependencies:
```bash
pip install -r requirements.txt
```

3. Run the application:
```bash
python app.py
```

4. Open your browser and navigate to:
```
http://localhost:5000
```

## Default Credentials

**Username**: `admin`
**Password**: `admin`

> **Important**: Change the default admin password immediately in production!

## Usage

### For Admins

1. **Login**: Use the default credentials to access the admin panel
2. **Add Videos**:
   - Go to Admin Panel
   - Enter a YouTube video URL (e.g., `https://www.youtube.com/watch?v=VIDEO_ID`)
   - Optionally assign it to a playlist
   - Click "Add Video"

3. **Create Playlists**:
   - Go to Admin Panel
   - Enter a YouTube playlist URL (e.g., `https://www.youtube.com/playlist?list=PLAYLIST_ID`)
   - Give it a custom name (optional)
   - Click "Add Playlist"
   - Add videos to the playlist using the "Add Video" form

4. **Manage Content**:
   - View all videos and playlists in the admin panel
   - Delete videos or playlists as needed
   - Monitor statistics (total videos, playlists)

### For Users

1. **Browse**: View all available videos on the home page
2. **Playlists**: Click on a playlist to see all videos in it
3. **Watch**: Click on any video thumbnail to watch it
4. **YouTube**: Videos are embedded from YouTube

## Project Structure

```
netflix-clone/
├── app.py                  # Main Flask application
├── requirements.txt        # Python dependencies
├── netflix_clone.db       # SQLite database (auto-created)
├── static/
│   ├── css/
│   │   └── style.css      # Netflix-style CSS
│   ├── js/
│   │   └── main.js        # JavaScript functionality
│   └── images/            # (empty, for future use)
└── templates/
    ├── base.html          # Base template
    ├── index.html         # Home page
    ├── login.html         # Login page
    ├── admin.html         # Admin panel
    ├── watch.html         # Video player page
    └── playlist.html      # Playlist view
```

## Database Schema

### Users Table
- `id`: Primary key
- `username`: Unique username
- `password_hash`: SHA256 hashed password
- `is_admin`: Admin flag (0 or 1)
- `created_at`: Timestamp

### Videos Table
- `id`: Primary key
- `youtube_id`: YouTube video ID (unique)
- `title`: Video title
- `description`: Video description
- `thumbnail_url`: Thumbnail image URL
- `duration`: Video duration
- `playlist_id`: Foreign key to playlists (optional)
- `added_by`: Foreign key to users
- `created_at`: Timestamp

### Playlists Table
- `id`: Primary key
- `name`: Playlist name
- `description`: Playlist description
- `youtube_playlist_id`: YouTube playlist ID
- `added_by`: Foreign key to users
- `created_at`: Timestamp

## Features in Detail

### YouTube Integration

The application extracts video information using:
- **YouTube oEmbed API**: No API key required for basic video info
- **URL Parsing**: Supports various YouTube URL formats
- **Thumbnail Retrieval**: Automatic thumbnail fetching

Supported URL formats:
- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `https://www.youtube.com/embed/VIDEO_ID`
- `https://www.youtube.com/playlist?list=PLAYLIST_ID`

### Security Features

- Password hashing using SHA256
- Session-based authentication
- Admin-only routes protected with decorators
- CSRF protection (via Flask)
- SQL injection prevention (parameterized queries)

## Customization

### Adding a YouTube API Key

For enhanced features (like auto-fetching playlist videos), set the `YOUTUBE_API_KEY` environment variable:

```bash
export YOUTUBE_API_KEY="your-api-key-here"
python app.py
```

### Changing the Default Admin Password

1. Login as admin
2. Modify the database directly or add a password change feature
3. Or edit `app.py` and change the default password in `init_db()`

### Styling

Edit `/static/css/style.css` to customize the appearance. The current theme uses Netflix's color scheme:
- Red: `#e50914`
- Black: `#141414`
- Dark Gray: `#181818`

## Troubleshooting

### Port Already in Use
If port 5000 is already in use, edit `app.py` and change the port:
```python
app.run(debug=True, host='0.0.0.0', port=5001)
```

### Videos Not Loading
- Check your internet connection
- Verify the YouTube URL is valid
- Some videos may be region-restricted

### Database Errors
If you encounter database errors, delete `netflix_clone.db` and restart the app to recreate it.

## Technology Stack

- **Backend**: Python Flask
- **Database**: SQLite3
- **Frontend**: HTML5, CSS3, JavaScript
- **APIs**: YouTube oEmbed API

## Future Enhancements

- User registration and authentication
- User favorites and watch history
- Search functionality
- Video categories and tags
- Comments and ratings
- Automatic playlist video fetching (requires YouTube API key)
- Video upload support
- Multi-language support

## License

Educational project - free to use and modify.

## Credits

Created as a demonstration of full-stack web development with Flask and SQLite.
