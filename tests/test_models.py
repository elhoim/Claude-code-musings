"""Unit tests for data models."""

import unittest
from datetime import datetime

from jira_tracker.models.issue import Issue
from jira_tracker.models.workflow import Workflow, WorkflowTransition
from jira_tracker.models.field import Field, FieldType, FieldConfiguration


class TestIssueModel(unittest.TestCase):
    """Test Issue model."""

    def test_issue_creation(self):
        """Test creating an Issue instance."""
        issue = Issue(
            id=1,
            jira_id='10001',
            key='TEST-1',
            project_id=1,
            issue_type_id=1,
            status_id=1,
            summary='Test issue'
        )

        self.assertEqual(issue.id, 1)
        self.assertEqual(issue.key, 'TEST-1')
        self.assertEqual(issue.summary, 'Test issue')

    def test_issue_from_db_row(self):
        """Test creating Issue from database row."""
        row = {
            'id': 1,
            'jira_id': '10001',
            'key': 'TEST-1',
            'project_id': 1,
            'issue_type_id': 1,
            'status_id': 1,
            'summary': 'Test issue',
            'description': 'Test description',
            'priority': 'High',
            'assignee': 'John Doe',
            'reporter': 'Jane Smith',
            'created_date': '2024-01-01 10:00:00',
            'updated_date': '2024-01-01 11:00:00',
            'resolved_date': None,
            'due_date': None,
            'parent_id': None,
            'project_key': 'TEST',
            'issue_type_name': 'Story',
            'status_name': 'To Do',
        }

        issue = Issue.from_db_row(row)

        self.assertEqual(issue.id, 1)
        self.assertEqual(issue.key, 'TEST-1')
        self.assertEqual(issue.summary, 'Test issue')
        self.assertEqual(issue.priority, 'High')
        self.assertEqual(issue.project_key, 'TEST')

    def test_issue_to_dict(self):
        """Test converting Issue to dictionary."""
        issue = Issue(
            id=1,
            jira_id='10001',
            key='TEST-1',
            project_id=1,
            issue_type_id=1,
            status_id=1,
            summary='Test issue',
            priority='High'
        )

        issue_dict = issue.to_dict()

        self.assertIsInstance(issue_dict, dict)
        self.assertEqual(issue_dict['id'], 1)
        self.assertEqual(issue_dict['key'], 'TEST-1')
        self.assertEqual(issue_dict['summary'], 'Test issue')
        self.assertEqual(issue_dict['priority'], 'High')


class TestWorkflowModel(unittest.TestCase):
    """Test Workflow model."""

    def test_workflow_creation(self):
        """Test creating a Workflow instance."""
        workflow = Workflow(
            id=1,
            jira_id='wf-001',
            name='Test Workflow',
            description='A test workflow',
            is_default=True,
            project_id=1
        )

        self.assertEqual(workflow.id, 1)
        self.assertEqual(workflow.name, 'Test Workflow')
        self.assertTrue(workflow.is_default)

    def test_workflow_from_db_row(self):
        """Test creating Workflow from database row."""
        row = {
            'id': 1,
            'jira_id': 'wf-001',
            'name': 'Test Workflow',
            'description': 'A test workflow',
            'is_default': 1,
            'project_id': 1,
        }

        workflow = Workflow.from_db_row(row)

        self.assertEqual(workflow.id, 1)
        self.assertEqual(workflow.name, 'Test Workflow')
        self.assertTrue(workflow.is_default)

    def test_workflow_to_dict(self):
        """Test converting Workflow to dictionary."""
        workflow = Workflow(
            id=1,
            jira_id='wf-001',
            name='Test Workflow',
            description='A test workflow',
            is_default=True,
            project_id=1
        )

        workflow_dict = workflow.to_dict()

        self.assertIsInstance(workflow_dict, dict)
        self.assertEqual(workflow_dict['id'], 1)
        self.assertEqual(workflow_dict['name'], 'Test Workflow')

    def test_workflow_transition_creation(self):
        """Test creating a WorkflowTransition instance."""
        transition = WorkflowTransition(
            id=1,
            jira_id='tr-001',
            workflow_id=1,
            name='Start Progress',
            description='Start working',
            from_status_id=1,
            to_status_id=2,
            transition_type='global',
            properties='{}'
        )

        self.assertEqual(transition.id, 1)
        self.assertEqual(transition.name, 'Start Progress')
        self.assertEqual(transition.workflow_id, 1)

    def test_workflow_transition_from_db_row(self):
        """Test creating WorkflowTransition from database row."""
        row = {
            'id': 1,
            'jira_id': 'tr-001',
            'workflow_id': 1,
            'name': 'Start Progress',
            'description': 'Start working',
            'from_status_id': 1,
            'to_status_id': 2,
            'transition_type': 'global',
            'properties': '{}',
            'from_status': 'To Do',
            'to_status': 'In Progress',
        }

        transition = WorkflowTransition.from_db_row(row)

        self.assertEqual(transition.id, 1)
        self.assertEqual(transition.name, 'Start Progress')
        self.assertEqual(transition.from_status, 'To Do')
        self.assertEqual(transition.to_status, 'In Progress')


class TestFieldModel(unittest.TestCase):
    """Test Field model."""

    def test_field_type_creation(self):
        """Test creating a FieldType instance."""
        field_type = FieldType(
            id=1,
            jira_key='summary',
            name='Summary',
            description='Issue summary',
            field_type='string',
            custom=False,
            orderable=True,
            navigable=True,
            searchable=True,
            schema_type='string',
            schema_items=None,
            schema_system=None,
            schema_custom=None,
            schema_custom_id=None
        )

        self.assertEqual(field_type.id, 1)
        self.assertEqual(field_type.jira_key, 'summary')
        self.assertEqual(field_type.name, 'Summary')
        self.assertFalse(field_type.custom)

    def test_field_type_from_db_row(self):
        """Test creating FieldType from database row."""
        row = {
            'id': 1,
            'jira_key': 'summary',
            'name': 'Summary',
            'description': 'Issue summary',
            'field_type': 'string',
            'custom': 0,
            'orderable': 1,
            'navigable': 1,
            'searchable': 1,
            'schema_type': 'string',
            'schema_items': None,
            'schema_system': None,
            'schema_custom': None,
            'schema_custom_id': None,
        }

        field_type = FieldType.from_db_row(row)

        self.assertEqual(field_type.id, 1)
        self.assertEqual(field_type.name, 'Summary')
        self.assertFalse(field_type.custom)

    def test_field_configuration_creation(self):
        """Test creating a FieldConfiguration instance."""
        config = FieldConfiguration(
            id=1,
            field_type_id=1,
            project_id=1,
            issue_type_id=1,
            is_required=True,
            is_visible=True,
            default_value='Default',
            allowed_values='["A", "B", "C"]',
            renderer_type='select',
            renderer_config='{}'
        )

        self.assertEqual(config.id, 1)
        self.assertTrue(config.is_required)
        self.assertTrue(config.is_visible)

    def test_field_configuration_from_db_row(self):
        """Test creating FieldConfiguration from database row."""
        row = {
            'id': 1,
            'field_type_id': 1,
            'project_id': 1,
            'issue_type_id': 1,
            'is_required': 1,
            'is_visible': 1,
            'default_value': 'Default',
            'allowed_values': '["A", "B", "C"]',
            'renderer_type': 'select',
            'renderer_config': '{}',
        }

        config = FieldConfiguration.from_db_row(row)

        self.assertEqual(config.id, 1)
        self.assertTrue(config.is_required)

    def test_field_creation(self):
        """Test creating a Field instance."""
        field_type = FieldType(
            id=1,
            jira_key='priority',
            name='Priority',
            description='Issue priority',
            field_type='option',
            custom=False,
            orderable=True,
            navigable=True,
            searchable=True,
            schema_type='priority',
            schema_items=None,
            schema_system=None,
            schema_custom=None,
            schema_custom_id=None
        )

        config = FieldConfiguration(
            id=1,
            field_type_id=1,
            project_id=1,
            issue_type_id=1,
            is_required=True,
            is_visible=True,
            default_value='Medium',
            allowed_values='["Low", "Medium", "High"]',
            renderer_type='select',
            renderer_config='{}'
        )

        field = Field(field_type=field_type, configuration=config)

        self.assertEqual(field.field_type.name, 'Priority')
        self.assertEqual(field.configuration.default_value, 'Medium')

    def test_field_to_dict(self):
        """Test converting Field to dictionary."""
        field_type = FieldType(
            id=1,
            jira_key='priority',
            name='Priority',
            description='Issue priority',
            field_type='option',
            custom=False,
            orderable=True,
            navigable=True,
            searchable=True,
            schema_type='priority',
            schema_items=None,
            schema_system=None,
            schema_custom=None,
            schema_custom_id=None
        )

        config = FieldConfiguration(
            id=1,
            field_type_id=1,
            project_id=1,
            issue_type_id=1,
            is_required=True,
            is_visible=True,
            default_value='Medium',
            allowed_values='["Low", "Medium", "High"]',
            renderer_type='select',
            renderer_config='{}'
        )

        field = Field(field_type=field_type, configuration=config)
        field_dict = field.to_dict()

        self.assertIsInstance(field_dict, dict)
        self.assertEqual(field_dict['name'], 'Priority')
        self.assertTrue(field_dict['is_required'])
        self.assertEqual(field_dict['default_value'], 'Medium')


if __name__ == '__main__':
    unittest.main()
