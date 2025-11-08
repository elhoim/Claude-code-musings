from flask import Flask, render_template, request, redirect, url_for, session, jsonify, flash
from functools import wraps
import sqlite3
import hashlib
import os
from datetime import datetime
import re
import requests
from urllib.parse import urlparse, parse_qs

app = Flask(__name__)
app.secret_key = os.urandom(24)
DATABASE = 'netflix_clone.db'

# YouTube API key - in production, use environment variable
# For now, we'll extract info from YouTube URLs without API
YOUTUBE_API_KEY = os.environ.get('YOUTUBE_API_KEY', '')

def get_db():
    """Get database connection"""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initialize database with schema"""
    conn = get_db()
    cursor = conn.cursor()

    # Users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            is_admin INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Playlists table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS playlists (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            youtube_playlist_id TEXT,
            added_by INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (added_by) REFERENCES users(id)
        )
    ''')

    # Videos table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS videos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            youtube_id TEXT UNIQUE NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            thumbnail_url TEXT,
            duration TEXT,
            playlist_id INTEGER,
            added_by INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (playlist_id) REFERENCES playlists(id),
            FOREIGN KEY (added_by) REFERENCES users(id)
        )
    ''')

    # Create default admin user (username: admin, password: admin)
    # In production, change this immediately!
    admin_password = hashlib.sha256('admin'.encode()).hexdigest()
    try:
        cursor.execute('INSERT INTO users (username, password_hash, is_admin) VALUES (?, ?, 1)',
                      ('admin', admin_password))
    except sqlite3.IntegrityError:
        pass  # Admin already exists

    conn.commit()
    conn.close()

def hash_password(password):
    """Hash password using SHA256"""
    return hashlib.sha256(password.encode()).hexdigest()

def login_required(f):
    """Decorator to require login"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

def admin_required(f):
    """Decorator to require admin privileges"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return redirect(url_for('login'))

        conn = get_db()
        user = conn.execute('SELECT is_admin FROM users WHERE id = ?',
                          (session['user_id'],)).fetchone()
        conn.close()

        if not user or not user['is_admin']:
            flash('Admin privileges required', 'error')
            return redirect(url_for('index'))
        return f(*args, **kwargs)
    return decorated_function

def extract_youtube_video_id(url):
    """Extract YouTube video ID from URL"""
    patterns = [
        r'(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)',
        r'youtube\.com\/watch\?.*v=([^&\n?#]+)'
    ]

    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    return None

def extract_youtube_playlist_id(url):
    """Extract YouTube playlist ID from URL"""
    parsed = urlparse(url)
    if 'list' in parse_qs(parsed.query):
        return parse_qs(parsed.query)['list'][0]
    return None

def get_video_info(video_id):
    """Get video information from YouTube (using oembed or scraping)"""
    try:
        # Use YouTube oEmbed API - no API key required
        oembed_url = f'https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={video_id}&format=json'
        response = requests.get(oembed_url, timeout=5)

        if response.status_code == 200:
            data = response.json()
            return {
                'title': data.get('title', f'YouTube Video {video_id}'),
                'thumbnail': data.get('thumbnail_url', f'https://img.youtube.com/vi/{video_id}/maxresdefault.jpg'),
                'author': data.get('author_name', 'Unknown')
            }
    except Exception as e:
        print(f"Error fetching video info: {e}")

    # Fallback to basic info
    return {
        'title': f'YouTube Video {video_id}',
        'thumbnail': f'https://img.youtube.com/vi/{video_id}/maxresdefault.jpg',
        'author': 'Unknown'
    }

@app.route('/')
def index():
    """Home page showing all videos"""
    conn = get_db()

    # Get all playlists
    playlists = conn.execute('SELECT * FROM playlists ORDER BY created_at DESC').fetchall()

    # Get all videos
    videos = conn.execute('''
        SELECT v.*, p.name as playlist_name
        FROM videos v
        LEFT JOIN playlists p ON v.playlist_id = p.id
        ORDER BY v.created_at DESC
    ''').fetchall()

    conn.close()

    return render_template('index.html', videos=videos, playlists=playlists)

@app.route('/login', methods=['GET', 'POST'])
def login():
    """Login page"""
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        password_hash = hash_password(password)

        conn = get_db()
        user = conn.execute('SELECT * FROM users WHERE username = ? AND password_hash = ?',
                          (username, password_hash)).fetchone()
        conn.close()

        if user:
            session['user_id'] = user['id']
            session['username'] = user['username']
            session['is_admin'] = user['is_admin']
            flash('Login successful!', 'success')
            return redirect(url_for('index'))
        else:
            flash('Invalid credentials', 'error')

    return render_template('login.html')

@app.route('/logout')
def logout():
    """Logout"""
    session.clear()
    flash('Logged out successfully', 'success')
    return redirect(url_for('index'))

@app.route('/admin')
@admin_required
def admin_panel():
    """Admin panel"""
    conn = get_db()

    # Get statistics
    video_count = conn.execute('SELECT COUNT(*) as count FROM videos').fetchone()['count']
    playlist_count = conn.execute('SELECT COUNT(*) as count FROM playlists').fetchone()['count']

    # Get recent videos
    recent_videos = conn.execute('''
        SELECT v.*, u.username, p.name as playlist_name
        FROM videos v
        LEFT JOIN users u ON v.added_by = u.id
        LEFT JOIN playlists p ON v.playlist_id = p.id
        ORDER BY v.created_at DESC
        LIMIT 10
    ''').fetchall()

    # Get all playlists
    playlists = conn.execute('''
        SELECT p.*, u.username, COUNT(v.id) as video_count
        FROM playlists p
        LEFT JOIN users u ON p.added_by = u.id
        LEFT JOIN videos v ON v.playlist_id = p.id
        GROUP BY p.id
        ORDER BY p.created_at DESC
    ''').fetchall()

    conn.close()

    return render_template('admin.html',
                         video_count=video_count,
                         playlist_count=playlist_count,
                         recent_videos=recent_videos,
                         playlists=playlists)

@app.route('/admin/add_video', methods=['POST'])
@admin_required
def add_video():
    """Add a YouTube video"""
    youtube_url = request.form.get('youtube_url')
    playlist_id = request.form.get('playlist_id')

    if not youtube_url:
        flash('YouTube URL is required', 'error')
        return redirect(url_for('admin_panel'))

    video_id = extract_youtube_video_id(youtube_url)

    if not video_id:
        flash('Invalid YouTube URL', 'error')
        return redirect(url_for('admin_panel'))

    # Get video information
    video_info = get_video_info(video_id)

    conn = get_db()
    try:
        conn.execute('''
            INSERT INTO videos (youtube_id, title, description, thumbnail_url, playlist_id, added_by)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (video_id, video_info['title'], video_info.get('author', ''),
              video_info['thumbnail'], playlist_id if playlist_id else None, session['user_id']))
        conn.commit()
        flash(f'Video "{video_info["title"]}" added successfully!', 'success')
    except sqlite3.IntegrityError:
        flash('Video already exists', 'error')
    finally:
        conn.close()

    return redirect(url_for('admin_panel'))

@app.route('/admin/add_playlist', methods=['POST'])
@admin_required
def add_playlist():
    """Add a YouTube playlist"""
    playlist_url = request.form.get('playlist_url')
    playlist_name = request.form.get('playlist_name')

    if not playlist_url:
        flash('Playlist URL is required', 'error')
        return redirect(url_for('admin_panel'))

    youtube_playlist_id = extract_youtube_playlist_id(playlist_url)

    if not youtube_playlist_id:
        flash('Invalid YouTube playlist URL', 'error')
        return redirect(url_for('admin_panel'))

    conn = get_db()

    # Create playlist
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO playlists (name, youtube_playlist_id, added_by)
        VALUES (?, ?, ?)
    ''', (playlist_name or f'Playlist {youtube_playlist_id}', youtube_playlist_id, session['user_id']))

    playlist_id = cursor.lastrowid

    # Note: To fetch videos from playlist, you would need YouTube API key
    # For now, we just create the playlist structure
    # Users can manually add videos to this playlist

    conn.commit()
    conn.close()

    flash(f'Playlist created! You can now add videos to it.', 'success')
    return redirect(url_for('admin_panel'))

@app.route('/admin/delete_video/<int:video_id>', methods=['POST'])
@admin_required
def delete_video(video_id):
    """Delete a video"""
    conn = get_db()
    conn.execute('DELETE FROM videos WHERE id = ?', (video_id,))
    conn.commit()
    conn.close()

    flash('Video deleted successfully', 'success')
    return redirect(url_for('admin_panel'))

@app.route('/admin/delete_playlist/<int:playlist_id>', methods=['POST'])
@admin_required
def delete_playlist(playlist_id):
    """Delete a playlist"""
    conn = get_db()
    # Set playlist_id to NULL for videos in this playlist
    conn.execute('UPDATE videos SET playlist_id = NULL WHERE playlist_id = ?', (playlist_id,))
    conn.execute('DELETE FROM playlists WHERE id = ?', (playlist_id,))
    conn.commit()
    conn.close()

    flash('Playlist deleted successfully', 'success')
    return redirect(url_for('admin_panel'))

@app.route('/watch/<youtube_id>')
def watch(youtube_id):
    """Watch a video"""
    conn = get_db()
    video = conn.execute('SELECT * FROM videos WHERE youtube_id = ?', (youtube_id,)).fetchone()
    conn.close()

    if not video:
        flash('Video not found', 'error')
        return redirect(url_for('index'))

    return render_template('watch.html', video=video)

@app.route('/playlist/<int:playlist_id>')
def playlist(playlist_id):
    """View playlist"""
    conn = get_db()

    playlist = conn.execute('SELECT * FROM playlists WHERE id = ?', (playlist_id,)).fetchone()

    if not playlist:
        flash('Playlist not found', 'error')
        conn.close()
        return redirect(url_for('index'))

    videos = conn.execute('''
        SELECT * FROM videos
        WHERE playlist_id = ?
        ORDER BY created_at DESC
    ''', (playlist_id,)).fetchall()

    conn.close()

    return render_template('playlist.html', playlist=playlist, videos=videos)

if __name__ == '__main__':
    init_db()
    app.run(debug=True, host='0.0.0.0', port=5000)
