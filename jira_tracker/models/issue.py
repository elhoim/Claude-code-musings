"""Issue model for JIRA tracker."""

from dataclasses import dataclass
from typing import Optional, Dict, Any
from datetime import datetime


@dataclass
class Issue:
    """Represents a JIRA issue."""

    id: int
    jira_id: str
    key: str
    project_id: int
    issue_type_id: int
    status_id: int
    summary: str
    description: Optional[str] = None
    priority: Optional[str] = None
    assignee: Optional[str] = None
    reporter: Optional[str] = None
    created_date: Optional[datetime] = None
    updated_date: Optional[datetime] = None
    resolved_date: Optional[datetime] = None
    due_date: Optional[datetime] = None
    parent_id: Optional[int] = None

    # Joined fields (populated from related tables)
    project_key: Optional[str] = None
    issue_type_name: Optional[str] = None
    status_name: Optional[str] = None

    @classmethod
    def from_db_row(cls, row: Dict[str, Any]) -> 'Issue':
        """
        Create an Issue instance from a database row.

        Args:
            row: Dictionary containing database row data

        Returns:
            Issue instance
        """
        return cls(
            id=row['id'],
            jira_id=row['jira_id'],
            key=row['key'],
            project_id=row['project_id'],
            issue_type_id=row['issue_type_id'],
            status_id=row['status_id'],
            summary=row['summary'],
            description=row.get('description'),
            priority=row.get('priority'),
            assignee=row.get('assignee'),
            reporter=row.get('reporter'),
            created_date=row.get('created_date'),
            updated_date=row.get('updated_date'),
            resolved_date=row.get('resolved_date'),
            due_date=row.get('due_date'),
            parent_id=row.get('parent_id'),
            project_key=row.get('project_key'),
            issue_type_name=row.get('issue_type_name'),
            status_name=row.get('status_name'),
        )

    def to_dict(self) -> Dict[str, Any]:
        """
        Convert Issue to dictionary.

        Returns:
            Dictionary representation
        """
        return {
            'id': self.id,
            'jira_id': self.jira_id,
            'key': self.key,
            'project_id': self.project_id,
            'issue_type_id': self.issue_type_id,
            'status_id': self.status_id,
            'summary': self.summary,
            'description': self.description,
            'priority': self.priority,
            'assignee': self.assignee,
            'reporter': self.reporter,
            'created_date': str(self.created_date) if self.created_date else None,
            'updated_date': str(self.updated_date) if self.updated_date else None,
            'resolved_date': str(self.resolved_date) if self.resolved_date else None,
            'due_date': str(self.due_date) if self.due_date else None,
            'parent_id': self.parent_id,
            'project_key': self.project_key,
            'issue_type_name': self.issue_type_name,
            'status_name': self.status_name,
        }
