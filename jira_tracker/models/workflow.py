"""Workflow model for JIRA tracker."""

from dataclasses import dataclass
from typing import Optional, Dict, Any, List


@dataclass
class WorkflowTransition:
    """Represents a workflow transition."""

    id: int
    jira_id: Optional[str]
    workflow_id: int
    name: str
    description: Optional[str]
    from_status_id: Optional[int]
    to_status_id: int
    transition_type: Optional[str]
    properties: Optional[str]

    # Joined fields
    from_status: Optional[str] = None
    to_status: Optional[str] = None

    @classmethod
    def from_db_row(cls, row: Dict[str, Any]) -> 'WorkflowTransition':
        """Create a WorkflowTransition from database row."""
        return cls(
            id=row['id'],
            jira_id=row.get('jira_id'),
            workflow_id=row['workflow_id'],
            name=row['name'],
            description=row.get('description'),
            from_status_id=row.get('from_status_id'),
            to_status_id=row['to_status_id'],
            transition_type=row.get('transition_type'),
            properties=row.get('properties'),
            from_status=row.get('from_status'),
            to_status=row.get('to_status'),
        )


@dataclass
class Workflow:
    """Represents a JIRA workflow."""

    id: int
    jira_id: Optional[str]
    name: str
    description: Optional[str]
    is_default: bool
    project_id: Optional[int]

    # Related data
    transitions: List[WorkflowTransition] = None

    @classmethod
    def from_db_row(cls, row: Dict[str, Any]) -> 'Workflow':
        """Create a Workflow from database row."""
        return cls(
            id=row['id'],
            jira_id=row.get('jira_id'),
            name=row['name'],
            description=row.get('description'),
            is_default=bool(row.get('is_default', 0)),
            project_id=row.get('project_id'),
        )

    def to_dict(self) -> Dict[str, Any]:
        """Convert Workflow to dictionary."""
        return {
            'id': self.id,
            'jira_id': self.jira_id,
            'name': self.name,
            'description': self.description,
            'is_default': self.is_default,
            'project_id': self.project_id,
            'transitions': [
                {
                    'id': t.id,
                    'name': t.name,
                    'from_status': t.from_status,
                    'to_status': t.to_status,
                }
                for t in (self.transitions or [])
            ],
        }
