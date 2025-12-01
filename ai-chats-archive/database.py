"""
Database module for AI Chats Archive
Handles SQLite database initialization and transaction management
"""

import sqlite3
import uuid
from datetime import datetime
from contextlib import contextmanager
from typing import Optional, List, Dict, Any


DATABASE_FILE = 'ai_chats_archive.db'


def init_database():
    """Initialize the database with all required tables and configurations"""
    conn = sqlite3.connect(DATABASE_FILE)
    conn.row_factory = sqlite3.Row

    # Enable foreign keys
    conn.execute("PRAGMA foreign_keys = ON")

    # Enable WAL mode for better concurrency
    conn.execute("PRAGMA journal_mode = WAL")

    # Enable synchronous mode for data safety
    conn.execute("PRAGMA synchronous = NORMAL")

    cursor = conn.cursor()

    # Users table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            is_admin INTEGER DEFAULT 0,
            is_active INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # API Keys table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS api_keys (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            key_value TEXT UNIQUE NOT NULL,
            key_name TEXT NOT NULL,
            permissions TEXT NOT NULL CHECK(permissions IN ('read', 'read_write')),
            is_active INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    """)

    # AI Agents table (predefined list)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS ai_agents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            description TEXT
        )
    """)

    # Chats table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS chats (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            ai_agent_id INTEGER NOT NULL,
            external_chat_id TEXT NOT NULL,
            internal_uuid TEXT UNIQUE NOT NULL,
            chat_start_time TIMESTAMP NOT NULL,
            chat_end_time TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (ai_agent_id) REFERENCES ai_agents(id),
            UNIQUE(user_id, ai_agent_id, external_chat_id)
        )
    """)

    # Messages table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            chat_id INTEGER NOT NULL,
            message_type TEXT NOT NULL CHECK(message_type IN ('user', 'ai')),
            content TEXT NOT NULL,
            timestamp TIMESTAMP NOT NULL,
            sequence_number INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE
        )
    """)

    # Artifacts table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS artifacts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            chat_id INTEGER NOT NULL,
            message_id INTEGER,
            artifact_name TEXT NOT NULL,
            artifact_type TEXT NOT NULL,
            artifact_data BLOB NOT NULL,
            version INTEGER NOT NULL DEFAULT 1,
            timestamp TIMESTAMP NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE,
            FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE SET NULL
        )
    """)

    # Create indexes for better performance
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_api_keys_key_value ON api_keys(key_value)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_chats_user_id ON chats(user_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_chats_internal_uuid ON chats(internal_uuid)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_artifacts_chat_id ON artifacts(chat_id)")

    # Insert predefined AI agents if not exists
    predefined_agents = [
        ('ChatGPT', 'OpenAI ChatGPT'),
        ('Gemini', 'Google Gemini'),
        ('Claude', 'Anthropic Claude'),
        ('Perplexity', 'Perplexity AI'),
        ('Manus', 'Manus AI')
    ]

    for agent_name, agent_desc in predefined_agents:
        cursor.execute(
            "INSERT OR IGNORE INTO ai_agents (name, description) VALUES (?, ?)",
            (agent_name, agent_desc)
        )

    conn.commit()
    conn.close()


@contextmanager
def get_db_connection():
    """Context manager for database connections with transaction support"""
    conn = sqlite3.connect(DATABASE_FILE, isolation_level=None)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")

    try:
        conn.execute("BEGIN")
        yield conn
        conn.execute("COMMIT")
    except Exception as e:
        conn.execute("ROLLBACK")
        raise e
    finally:
        conn.close()


def get_db_connection_simple():
    """Get a simple database connection without transaction management"""
    conn = sqlite3.connect(DATABASE_FILE)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def generate_api_key() -> str:
    """Generate a unique API key"""
    return f"aica_{uuid.uuid4().hex}"


def generate_internal_uuid() -> str:
    """Generate an internal UUID for chats"""
    return str(uuid.uuid4())
