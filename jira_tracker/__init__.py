"""
JIRA Issue Tracking System

A Python-based issue tracking system that imports workflows, transitions,
and field types from Atlassian JIRA with multiprocessing support.
"""

__version__ = "1.0.0"
__author__ = "JIRA Tracker Team"

from .database.db_manager import DatabaseManager
from .api.jira_client import JiraClient
from .models.issue import Issue
from .models.workflow import Workflow
from .models.field import Field

__all__ = [
    'DatabaseManager',
    'JiraClient',
    'Issue',
    'Workflow',
    'Field',
]
