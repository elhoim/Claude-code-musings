"""Database schema definitions for JIRA tracking system."""

import sqlite3
from typing import Optional

SCHEMA_VERSION = 1

# SQL statements for creating tables
CREATE_TABLES = [
    # Projects table
    """
    CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        jira_id TEXT UNIQUE NOT NULL,
        key TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        lead TEXT,
        project_type TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """,

    # Issue types table
    """
    CREATE TABLE IF NOT EXISTS issue_types (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        jira_id TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        icon_url TEXT,
        subtask INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """,

    # Statuses table
    """
    CREATE TABLE IF NOT EXISTS statuses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        jira_id TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        category TEXT,
        color_name TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """,

    # Workflows table
    """
    CREATE TABLE IF NOT EXISTS workflows (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        jira_id TEXT UNIQUE,
        name TEXT NOT NULL,
        description TEXT,
        is_default INTEGER DEFAULT 0,
        project_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    )
    """,

    # Workflow transitions table
    """
    CREATE TABLE IF NOT EXISTS workflow_transitions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        jira_id TEXT,
        workflow_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        from_status_id INTEGER,
        to_status_id INTEGER NOT NULL,
        transition_type TEXT,
        properties TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE CASCADE,
        FOREIGN KEY (from_status_id) REFERENCES statuses(id),
        FOREIGN KEY (to_status_id) REFERENCES statuses(id)
    )
    """,

    # Field types table
    """
    CREATE TABLE IF NOT EXISTS field_types (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        jira_key TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        field_type TEXT NOT NULL,
        custom INTEGER DEFAULT 0,
        orderable INTEGER DEFAULT 1,
        navigable INTEGER DEFAULT 1,
        searchable INTEGER DEFAULT 1,
        schema_type TEXT,
        schema_items TEXT,
        schema_system TEXT,
        schema_custom TEXT,
        schema_custom_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """,

    # Field configurations table
    """
    CREATE TABLE IF NOT EXISTS field_configurations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        field_type_id INTEGER NOT NULL,
        project_id INTEGER,
        issue_type_id INTEGER,
        is_required INTEGER DEFAULT 0,
        is_visible INTEGER DEFAULT 1,
        default_value TEXT,
        allowed_values TEXT,
        renderer_type TEXT,
        renderer_config TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (field_type_id) REFERENCES field_types(id) ON DELETE CASCADE,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (issue_type_id) REFERENCES issue_types(id) ON DELETE CASCADE
    )
    """,

    # Issues table
    """
    CREATE TABLE IF NOT EXISTS issues (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        jira_id TEXT UNIQUE NOT NULL,
        key TEXT UNIQUE NOT NULL,
        project_id INTEGER NOT NULL,
        issue_type_id INTEGER NOT NULL,
        status_id INTEGER NOT NULL,
        summary TEXT NOT NULL,
        description TEXT,
        priority TEXT,
        assignee TEXT,
        reporter TEXT,
        created_date TIMESTAMP,
        updated_date TIMESTAMP,
        resolved_date TIMESTAMP,
        due_date TIMESTAMP,
        parent_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (issue_type_id) REFERENCES issue_types(id),
        FOREIGN KEY (status_id) REFERENCES statuses(id),
        FOREIGN KEY (parent_id) REFERENCES issues(id) ON DELETE CASCADE
    )
    """,

    # Field values table (stores actual field values for issues)
    """
    CREATE TABLE IF NOT EXISTS field_values (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        issue_id INTEGER NOT NULL,
        field_type_id INTEGER NOT NULL,
        value TEXT,
        value_type TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE,
        FOREIGN KEY (field_type_id) REFERENCES field_types(id) ON DELETE CASCADE,
        UNIQUE(issue_id, field_type_id)
    )
    """,

    # Comments table
    """
    CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        jira_id TEXT UNIQUE,
        issue_id INTEGER NOT NULL,
        author TEXT NOT NULL,
        body TEXT NOT NULL,
        created_date TIMESTAMP,
        updated_date TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE
    )
    """,

    # Attachments table
    """
    CREATE TABLE IF NOT EXISTS attachments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        jira_id TEXT UNIQUE,
        issue_id INTEGER NOT NULL,
        filename TEXT NOT NULL,
        author TEXT,
        created_date TIMESTAMP,
        size INTEGER,
        mime_type TEXT,
        content BLOB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE
    )
    """,

    # Schema metadata table
    """
    CREATE TABLE IF NOT EXISTS schema_metadata (
        key TEXT PRIMARY KEY,
        value TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """,
]

# Indexes for better query performance
CREATE_INDEXES = [
    "CREATE INDEX IF NOT EXISTS idx_issues_project ON issues(project_id)",
    "CREATE INDEX IF NOT EXISTS idx_issues_status ON issues(status_id)",
    "CREATE INDEX IF NOT EXISTS idx_issues_type ON issues(issue_type_id)",
    "CREATE INDEX IF NOT EXISTS idx_issues_key ON issues(key)",
    "CREATE INDEX IF NOT EXISTS idx_field_values_issue ON field_values(issue_id)",
    "CREATE INDEX IF NOT EXISTS idx_field_values_field ON field_values(field_type_id)",
    "CREATE INDEX IF NOT EXISTS idx_transitions_workflow ON workflow_transitions(workflow_id)",
    "CREATE INDEX IF NOT EXISTS idx_comments_issue ON comments(issue_id)",
    "CREATE INDEX IF NOT EXISTS idx_attachments_issue ON attachments(issue_id)",
]


def create_schema(conn: sqlite3.Connection) -> None:
    """
    Create the database schema.

    Args:
        conn: SQLite database connection
    """
    cursor = conn.cursor()

    try:
        # Create all tables
        for create_sql in CREATE_TABLES:
            cursor.execute(create_sql)

        # Create indexes
        for index_sql in CREATE_INDEXES:
            cursor.execute(index_sql)

        # Store schema version
        cursor.execute(
            "INSERT OR REPLACE INTO schema_metadata (key, value) VALUES (?, ?)",
            ("schema_version", str(SCHEMA_VERSION))
        )

        conn.commit()

    except sqlite3.Error as e:
        conn.rollback()
        raise Exception(f"Error creating schema: {e}")


def get_schema_version(conn: sqlite3.Connection) -> Optional[int]:
    """
    Get the current schema version.

    Args:
        conn: SQLite database connection

    Returns:
        Schema version number or None if not found
    """
    cursor = conn.cursor()
    try:
        cursor.execute(
            "SELECT value FROM schema_metadata WHERE key = ?",
            ("schema_version",)
        )
        result = cursor.fetchone()
        return int(result[0]) if result else None
    except sqlite3.Error:
        return None
