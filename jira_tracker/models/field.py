"""Field model for JIRA tracker."""

from dataclasses import dataclass
from typing import Optional, Dict, Any


@dataclass
class FieldType:
    """Represents a JIRA field type."""

    id: int
    jira_key: str
    name: str
    description: Optional[str]
    field_type: str
    custom: bool
    orderable: bool
    navigable: bool
    searchable: bool
    schema_type: Optional[str]
    schema_items: Optional[str]
    schema_system: Optional[str]
    schema_custom: Optional[str]
    schema_custom_id: Optional[int]

    @classmethod
    def from_db_row(cls, row: Dict[str, Any]) -> 'FieldType':
        """Create a FieldType from database row."""
        return cls(
            id=row['id'],
            jira_key=row['jira_key'],
            name=row['name'],
            description=row.get('description'),
            field_type=row['field_type'],
            custom=bool(row.get('custom', 0)),
            orderable=bool(row.get('orderable', 1)),
            navigable=bool(row.get('navigable', 1)),
            searchable=bool(row.get('searchable', 1)),
            schema_type=row.get('schema_type'),
            schema_items=row.get('schema_items'),
            schema_system=row.get('schema_system'),
            schema_custom=row.get('schema_custom'),
            schema_custom_id=row.get('schema_custom_id'),
        )


@dataclass
class FieldConfiguration:
    """Represents a field configuration for a project/issue type."""

    id: int
    field_type_id: int
    project_id: Optional[int]
    issue_type_id: Optional[int]
    is_required: bool
    is_visible: bool
    default_value: Optional[str]
    allowed_values: Optional[str]
    renderer_type: Optional[str]
    renderer_config: Optional[str]

    @classmethod
    def from_db_row(cls, row: Dict[str, Any]) -> 'FieldConfiguration':
        """Create a FieldConfiguration from database row."""
        return cls(
            id=row['id'],
            field_type_id=row['field_type_id'],
            project_id=row.get('project_id'),
            issue_type_id=row.get('issue_type_id'),
            is_required=bool(row.get('is_required', 0)),
            is_visible=bool(row.get('is_visible', 1)),
            default_value=row.get('default_value'),
            allowed_values=row.get('allowed_values'),
            renderer_type=row.get('renderer_type'),
            renderer_config=row.get('renderer_config'),
        )


@dataclass
class Field:
    """Represents a field with its configuration."""

    field_type: FieldType
    configuration: Optional[FieldConfiguration] = None

    def to_dict(self) -> Dict[str, Any]:
        """Convert Field to dictionary."""
        return {
            'id': self.field_type.id,
            'jira_key': self.field_type.jira_key,
            'name': self.field_type.name,
            'description': self.field_type.description,
            'field_type': self.field_type.field_type,
            'custom': self.field_type.custom,
            'is_required': self.configuration.is_required if self.configuration else False,
            'is_visible': self.configuration.is_visible if self.configuration else True,
            'default_value': self.configuration.default_value if self.configuration else None,
        }
