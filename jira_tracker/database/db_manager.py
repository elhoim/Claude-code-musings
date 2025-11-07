"""Database manager for SQLite operations."""

import sqlite3
import os
from typing import Optional, List, Dict, Any, Tuple
from contextlib import contextmanager
import threading
from datetime import datetime

from .schema import create_schema, get_schema_version


class DatabaseManager:
    """Manages SQLite database connections and operations."""

    def __init__(self, db_path: str = "jira_tracker.db"):
        """
        Initialize database manager.

        Args:
            db_path: Path to SQLite database file
        """
        self.db_path = db_path
        self._local = threading.local()
        self._lock = threading.Lock()
        self._initialize_database()

    def _initialize_database(self) -> None:
        """Initialize database and create schema if needed."""
        with self.get_connection() as conn:
            create_schema(conn)

    @contextmanager
    def get_connection(self):
        """
        Get a thread-safe database connection.

        Yields:
            sqlite3.Connection: Database connection
        """
        if not hasattr(self._local, 'conn'):
            self._local.conn = sqlite3.connect(
                self.db_path,
                check_same_thread=False,
                timeout=30.0
            )
            self._local.conn.row_factory = sqlite3.Row

        try:
            yield self._local.conn
        except Exception as e:
            self._local.conn.rollback()
            raise

    def execute_query(
        self,
        query: str,
        params: Optional[Tuple] = None,
        fetch_one: bool = False,
        fetch_all: bool = False
    ) -> Any:
        """
        Execute a SQL query.

        Args:
            query: SQL query string
            params: Query parameters
            fetch_one: Whether to fetch one result
            fetch_all: Whether to fetch all results

        Returns:
            Query results or cursor
        """
        with self._lock:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute(query, params or ())

                if fetch_one:
                    return cursor.fetchone()
                elif fetch_all:
                    return cursor.fetchall()
                else:
                    conn.commit()
                    return cursor

    def execute_many(self, query: str, params_list: List[Tuple]) -> None:
        """
        Execute a SQL query with multiple parameter sets.

        Args:
            query: SQL query string
            params_list: List of parameter tuples
        """
        with self._lock:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.executemany(query, params_list)
                conn.commit()

    # Project operations
    def insert_project(self, project_data: Dict[str, Any]) -> int:
        """Insert a project into the database."""
        query = """
            INSERT OR REPLACE INTO projects
            (jira_id, key, name, description, lead, project_type)
            VALUES (?, ?, ?, ?, ?, ?)
        """
        cursor = self.execute_query(
            query,
            (
                project_data.get('jira_id'),
                project_data.get('key'),
                project_data.get('name'),
                project_data.get('description'),
                project_data.get('lead'),
                project_data.get('project_type'),
            )
        )
        return cursor.lastrowid

    # Issue type operations
    def insert_issue_type(self, issue_type_data: Dict[str, Any]) -> int:
        """Insert an issue type into the database."""
        query = """
            INSERT OR REPLACE INTO issue_types
            (jira_id, name, description, icon_url, subtask)
            VALUES (?, ?, ?, ?, ?)
        """
        cursor = self.execute_query(
            query,
            (
                issue_type_data.get('jira_id'),
                issue_type_data.get('name'),
                issue_type_data.get('description'),
                issue_type_data.get('icon_url'),
                issue_type_data.get('subtask', 0),
            )
        )
        return cursor.lastrowid

    # Status operations
    def insert_status(self, status_data: Dict[str, Any]) -> int:
        """Insert a status into the database."""
        query = """
            INSERT OR REPLACE INTO statuses
            (jira_id, name, description, category, color_name)
            VALUES (?, ?, ?, ?, ?)
        """
        cursor = self.execute_query(
            query,
            (
                status_data.get('jira_id'),
                status_data.get('name'),
                status_data.get('description'),
                status_data.get('category'),
                status_data.get('color_name'),
            )
        )
        return cursor.lastrowid

    # Workflow operations
    def insert_workflow(self, workflow_data: Dict[str, Any]) -> int:
        """Insert a workflow into the database."""
        query = """
            INSERT OR REPLACE INTO workflows
            (jira_id, name, description, is_default, project_id)
            VALUES (?, ?, ?, ?, ?)
        """
        cursor = self.execute_query(
            query,
            (
                workflow_data.get('jira_id'),
                workflow_data.get('name'),
                workflow_data.get('description'),
                workflow_data.get('is_default', 0),
                workflow_data.get('project_id'),
            )
        )
        return cursor.lastrowid

    def insert_workflow_transition(self, transition_data: Dict[str, Any]) -> int:
        """Insert a workflow transition into the database."""
        query = """
            INSERT INTO workflow_transitions
            (jira_id, workflow_id, name, description, from_status_id,
             to_status_id, transition_type, properties)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """
        cursor = self.execute_query(
            query,
            (
                transition_data.get('jira_id'),
                transition_data.get('workflow_id'),
                transition_data.get('name'),
                transition_data.get('description'),
                transition_data.get('from_status_id'),
                transition_data.get('to_status_id'),
                transition_data.get('transition_type'),
                transition_data.get('properties'),
            )
        )
        return cursor.lastrowid

    # Field operations
    def insert_field_type(self, field_data: Dict[str, Any]) -> int:
        """Insert a field type into the database."""
        query = """
            INSERT OR REPLACE INTO field_types
            (jira_key, name, description, field_type, custom, orderable,
             navigable, searchable, schema_type, schema_items, schema_system,
             schema_custom, schema_custom_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """
        cursor = self.execute_query(
            query,
            (
                field_data.get('jira_key'),
                field_data.get('name'),
                field_data.get('description'),
                field_data.get('field_type'),
                field_data.get('custom', 0),
                field_data.get('orderable', 1),
                field_data.get('navigable', 1),
                field_data.get('searchable', 1),
                field_data.get('schema_type'),
                field_data.get('schema_items'),
                field_data.get('schema_system'),
                field_data.get('schema_custom'),
                field_data.get('schema_custom_id'),
            )
        )
        return cursor.lastrowid

    def insert_field_configuration(self, config_data: Dict[str, Any]) -> int:
        """Insert a field configuration into the database."""
        query = """
            INSERT INTO field_configurations
            (field_type_id, project_id, issue_type_id, is_required, is_visible,
             default_value, allowed_values, renderer_type, renderer_config)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """
        cursor = self.execute_query(
            query,
            (
                config_data.get('field_type_id'),
                config_data.get('project_id'),
                config_data.get('issue_type_id'),
                config_data.get('is_required', 0),
                config_data.get('is_visible', 1),
                config_data.get('default_value'),
                config_data.get('allowed_values'),
                config_data.get('renderer_type'),
                config_data.get('renderer_config'),
            )
        )
        return cursor.lastrowid

    # Issue operations
    def insert_issue(self, issue_data: Dict[str, Any]) -> int:
        """Insert an issue into the database."""
        query = """
            INSERT OR REPLACE INTO issues
            (jira_id, key, project_id, issue_type_id, status_id, summary,
             description, priority, assignee, reporter, created_date,
             updated_date, resolved_date, due_date, parent_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """
        cursor = self.execute_query(
            query,
            (
                issue_data.get('jira_id'),
                issue_data.get('key'),
                issue_data.get('project_id'),
                issue_data.get('issue_type_id'),
                issue_data.get('status_id'),
                issue_data.get('summary'),
                issue_data.get('description'),
                issue_data.get('priority'),
                issue_data.get('assignee'),
                issue_data.get('reporter'),
                issue_data.get('created_date'),
                issue_data.get('updated_date'),
                issue_data.get('resolved_date'),
                issue_data.get('due_date'),
                issue_data.get('parent_id'),
            )
        )
        return cursor.lastrowid

    def insert_field_value(self, field_value_data: Dict[str, Any]) -> int:
        """Insert a field value into the database."""
        query = """
            INSERT OR REPLACE INTO field_values
            (issue_id, field_type_id, value, value_type)
            VALUES (?, ?, ?, ?)
        """
        cursor = self.execute_query(
            query,
            (
                field_value_data.get('issue_id'),
                field_value_data.get('field_type_id'),
                field_value_data.get('value'),
                field_value_data.get('value_type'),
            )
        )
        return cursor.lastrowid

    # Query operations
    def get_all_projects(self) -> List[Dict[str, Any]]:
        """Get all projects from the database."""
        rows = self.execute_query(
            "SELECT * FROM projects ORDER BY name",
            fetch_all=True
        )
        return [dict(row) for row in rows]

    def get_all_workflows(self) -> List[Dict[str, Any]]:
        """Get all workflows from the database."""
        rows = self.execute_query(
            "SELECT * FROM workflows ORDER BY name",
            fetch_all=True
        )
        return [dict(row) for row in rows]

    def get_workflow_transitions(self, workflow_id: int) -> List[Dict[str, Any]]:
        """Get all transitions for a workflow."""
        rows = self.execute_query(
            """
            SELECT t.*, fs.name as from_status, ts.name as to_status
            FROM workflow_transitions t
            LEFT JOIN statuses fs ON t.from_status_id = fs.id
            JOIN statuses ts ON t.to_status_id = ts.id
            WHERE t.workflow_id = ?
            ORDER BY t.name
            """,
            (workflow_id,),
            fetch_all=True
        )
        return [dict(row) for row in rows]

    def get_all_field_types(self) -> List[Dict[str, Any]]:
        """Get all field types from the database."""
        rows = self.execute_query(
            "SELECT * FROM field_types ORDER BY name",
            fetch_all=True
        )
        return [dict(row) for row in rows]

    def get_issues_by_project(self, project_id: int) -> List[Dict[str, Any]]:
        """Get all issues for a project."""
        rows = self.execute_query(
            """
            SELECT i.*, p.key as project_key, it.name as issue_type_name,
                   s.name as status_name
            FROM issues i
            JOIN projects p ON i.project_id = p.id
            JOIN issue_types it ON i.issue_type_id = it.id
            JOIN statuses s ON i.status_id = s.id
            WHERE i.project_id = ?
            ORDER BY i.key
            """,
            (project_id,),
            fetch_all=True
        )
        return [dict(row) for row in rows]

    def close(self) -> None:
        """Close database connections."""
        if hasattr(self._local, 'conn'):
            self._local.conn.close()
            delattr(self._local, 'conn')
