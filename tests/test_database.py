"""Unit tests for database module."""

import unittest
import os
import tempfile
from datetime import datetime

from jira_tracker.database.db_manager import DatabaseManager
from jira_tracker.database.schema import create_schema, get_schema_version


class TestDatabaseSchema(unittest.TestCase):
    """Test database schema creation and versioning."""

    def setUp(self):
        """Set up test database."""
        self.temp_db = tempfile.NamedTemporaryFile(delete=False, suffix='.db')
        self.temp_db.close()
        self.db_path = self.temp_db.name

    def tearDown(self):
        """Clean up test database."""
        if os.path.exists(self.db_path):
            os.unlink(self.db_path)

    def test_schema_creation(self):
        """Test that schema is created successfully."""
        db = DatabaseManager(self.db_path)
        with db.get_connection() as conn:
            cursor = conn.cursor()

            # Check that all tables exist
            cursor.execute(
                "SELECT name FROM sqlite_master WHERE type='table'"
            )
            tables = [row[0] for row in cursor.fetchall()]

            expected_tables = [
                'projects', 'issue_types', 'statuses', 'workflows',
                'workflow_transitions', 'field_types', 'field_configurations',
                'issues', 'field_values', 'comments', 'attachments',
                'schema_metadata'
            ]

            for table in expected_tables:
                self.assertIn(table, tables, f"Table {table} not found")

    def test_schema_version(self):
        """Test schema version tracking."""
        db = DatabaseManager(self.db_path)
        with db.get_connection() as conn:
            version = get_schema_version(conn)
            self.assertIsNotNone(version)
            self.assertIsInstance(version, int)
            self.assertGreater(version, 0)


class TestDatabaseManager(unittest.TestCase):
    """Test DatabaseManager operations."""

    def setUp(self):
        """Set up test database."""
        self.temp_db = tempfile.NamedTemporaryFile(delete=False, suffix='.db')
        self.temp_db.close()
        self.db_path = self.temp_db.name
        self.db = DatabaseManager(self.db_path)

    def tearDown(self):
        """Clean up test database."""
        self.db.close()
        if os.path.exists(self.db_path):
            os.unlink(self.db_path)

    def test_insert_project(self):
        """Test inserting a project."""
        project_data = {
            'jira_id': 'proj-001',
            'key': 'TEST',
            'name': 'Test Project',
            'description': 'A test project',
            'lead': 'Test User',
            'project_type': 'software',
        }

        project_id = self.db.insert_project(project_data)
        self.assertIsNotNone(project_id)
        self.assertGreater(project_id, 0)

        # Verify project was inserted
        projects = self.db.get_all_projects()
        self.assertEqual(len(projects), 1)
        self.assertEqual(projects[0]['key'], 'TEST')
        self.assertEqual(projects[0]['name'], 'Test Project')

    def test_insert_issue_type(self):
        """Test inserting an issue type."""
        issue_type_data = {
            'jira_id': 'it-001',
            'name': 'Story',
            'description': 'User story',
            'icon_url': 'http://example.com/icon.png',
            'subtask': 0,
        }

        issue_type_id = self.db.insert_issue_type(issue_type_data)
        self.assertIsNotNone(issue_type_id)
        self.assertGreater(issue_type_id, 0)

    def test_insert_status(self):
        """Test inserting a status."""
        status_data = {
            'jira_id': 'st-001',
            'name': 'To Do',
            'description': 'Work not started',
            'category': 'new',
            'color_name': 'blue',
        }

        status_id = self.db.insert_status(status_data)
        self.assertIsNotNone(status_id)
        self.assertGreater(status_id, 0)

    def test_insert_workflow(self):
        """Test inserting a workflow."""
        # First create a project
        project_id = self.db.insert_project({
            'jira_id': 'proj-001',
            'key': 'TEST',
            'name': 'Test Project',
        })

        workflow_data = {
            'jira_id': 'wf-001',
            'name': 'Standard Workflow',
            'description': 'Standard workflow for software projects',
            'is_default': 1,
            'project_id': project_id,
        }

        workflow_id = self.db.insert_workflow(workflow_data)
        self.assertIsNotNone(workflow_id)
        self.assertGreater(workflow_id, 0)

        # Verify workflow was inserted
        workflows = self.db.get_all_workflows()
        self.assertEqual(len(workflows), 1)
        self.assertEqual(workflows[0]['name'], 'Standard Workflow')

    def test_insert_workflow_transition(self):
        """Test inserting a workflow transition."""
        # Create prerequisites
        project_id = self.db.insert_project({
            'jira_id': 'proj-001',
            'key': 'TEST',
            'name': 'Test Project',
        })

        workflow_id = self.db.insert_workflow({
            'jira_id': 'wf-001',
            'name': 'Test Workflow',
            'project_id': project_id,
        })

        from_status_id = self.db.insert_status({
            'jira_id': 'st-001',
            'name': 'To Do',
        })

        to_status_id = self.db.insert_status({
            'jira_id': 'st-002',
            'name': 'In Progress',
        })

        transition_data = {
            'jira_id': 'tr-001',
            'workflow_id': workflow_id,
            'name': 'Start Progress',
            'description': 'Start working on the issue',
            'from_status_id': from_status_id,
            'to_status_id': to_status_id,
            'transition_type': 'global',
            'properties': '{}',
        }

        transition_id = self.db.insert_workflow_transition(transition_data)
        self.assertIsNotNone(transition_id)
        self.assertGreater(transition_id, 0)

        # Verify transition was inserted
        transitions = self.db.get_workflow_transitions(workflow_id)
        self.assertEqual(len(transitions), 1)
        self.assertEqual(transitions[0]['name'], 'Start Progress')

    def test_insert_field_type(self):
        """Test inserting a field type."""
        field_data = {
            'jira_key': 'summary',
            'name': 'Summary',
            'description': 'Issue summary',
            'field_type': 'string',
            'custom': 0,
            'orderable': 1,
            'navigable': 1,
            'searchable': 1,
            'schema_type': 'string',
        }

        field_id = self.db.insert_field_type(field_data)
        self.assertIsNotNone(field_id)
        self.assertGreater(field_id, 0)

        # Verify field was inserted
        fields = self.db.get_all_field_types()
        self.assertEqual(len(fields), 1)
        self.assertEqual(fields[0]['name'], 'Summary')

    def test_insert_issue(self):
        """Test inserting an issue."""
        # Create prerequisites
        project_id = self.db.insert_project({
            'jira_id': 'proj-001',
            'key': 'TEST',
            'name': 'Test Project',
        })

        issue_type_id = self.db.insert_issue_type({
            'jira_id': 'it-001',
            'name': 'Story',
        })

        status_id = self.db.insert_status({
            'jira_id': 'st-001',
            'name': 'To Do',
        })

        issue_data = {
            'jira_id': 'iss-001',
            'key': 'TEST-1',
            'project_id': project_id,
            'issue_type_id': issue_type_id,
            'status_id': status_id,
            'summary': 'Test issue',
            'description': 'This is a test issue',
            'priority': 'Medium',
            'assignee': 'Test User',
            'reporter': 'Test Reporter',
            'created_date': '2024-01-01 10:00:00',
            'updated_date': '2024-01-01 10:00:00',
        }

        issue_id = self.db.insert_issue(issue_data)
        self.assertIsNotNone(issue_id)
        self.assertGreater(issue_id, 0)

        # Verify issue was inserted
        issues = self.db.get_issues_by_project(project_id)
        self.assertEqual(len(issues), 1)
        self.assertEqual(issues[0]['key'], 'TEST-1')
        self.assertEqual(issues[0]['summary'], 'Test issue')

    def test_insert_field_value(self):
        """Test inserting field values."""
        # Create prerequisites
        project_id = self.db.insert_project({
            'jira_id': 'proj-001',
            'key': 'TEST',
            'name': 'Test Project',
        })

        issue_type_id = self.db.insert_issue_type({
            'jira_id': 'it-001',
            'name': 'Story',
        })

        status_id = self.db.insert_status({
            'jira_id': 'st-001',
            'name': 'To Do',
        })

        issue_id = self.db.insert_issue({
            'jira_id': 'iss-001',
            'key': 'TEST-1',
            'project_id': project_id,
            'issue_type_id': issue_type_id,
            'status_id': status_id,
            'summary': 'Test issue',
        })

        field_type_id = self.db.insert_field_type({
            'jira_key': 'customfield_001',
            'name': 'Custom Field',
            'field_type': 'string',
        })

        field_value_data = {
            'issue_id': issue_id,
            'field_type_id': field_type_id,
            'value': 'Test value',
            'value_type': 'string',
        }

        field_value_id = self.db.insert_field_value(field_value_data)
        self.assertIsNotNone(field_value_id)
        self.assertGreater(field_value_id, 0)

    def test_get_all_projects(self):
        """Test getting all projects."""
        # Insert multiple projects
        for i in range(3):
            self.db.insert_project({
                'jira_id': f'proj-{i}',
                'key': f'TEST{i}',
                'name': f'Test Project {i}',
            })

        projects = self.db.get_all_projects()
        self.assertEqual(len(projects), 3)

    def test_get_all_workflows(self):
        """Test getting all workflows."""
        # Insert workflow
        self.db.insert_workflow({
            'jira_id': 'wf-001',
            'name': 'Test Workflow',
        })

        workflows = self.db.get_all_workflows()
        self.assertEqual(len(workflows), 1)
        self.assertEqual(workflows[0]['name'], 'Test Workflow')

    def test_get_all_field_types(self):
        """Test getting all field types."""
        # Insert field types
        for i in range(3):
            self.db.insert_field_type({
                'jira_key': f'field{i}',
                'name': f'Field {i}',
                'field_type': 'string',
            })

        fields = self.db.get_all_field_types()
        self.assertEqual(len(fields), 3)


if __name__ == '__main__':
    unittest.main()
