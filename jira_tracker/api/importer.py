"""Multi-process JIRA data importer for efficient data import."""

import multiprocessing as mp
from typing import List, Dict, Any, Optional
import json
import logging
from functools import partial

from .jira_client import JiraClient
from ..database.db_manager import DatabaseManager

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class JiraImporter:
    """Multi-process importer for JIRA data."""

    def __init__(
        self,
        jira_url: str,
        username: str,
        api_token: str,
        db_path: str = "jira_tracker.db",
        num_processes: Optional[int] = None
    ):
        """
        Initialize JIRA importer.

        Args:
            jira_url: JIRA instance URL
            username: JIRA username
            api_token: JIRA API token
            db_path: Path to SQLite database
            num_processes: Number of processes to use (default: CPU count)
        """
        self.jira_url = jira_url
        self.username = username
        self.api_token = api_token
        self.db_path = db_path
        self.num_processes = num_processes or mp.cpu_count()

        # Initialize clients
        self.jira_client = JiraClient(jira_url, username, api_token)
        self.db_manager = DatabaseManager(db_path)

    def import_all(self, project_keys: Optional[List[str]] = None) -> Dict[str, Any]:
        """
        Import all data from JIRA.

        Args:
            project_keys: List of project keys to import (None = all projects)

        Returns:
            Dictionary with import statistics
        """
        logger.info("Starting full JIRA import")

        stats = {
            'projects': 0,
            'issue_types': 0,
            'statuses': 0,
            'workflows': 0,
            'transitions': 0,
            'fields': 0,
            'field_configs': 0,
            'issues': 0,
        }

        # Step 1: Import metadata (single-threaded)
        logger.info("Step 1: Importing metadata")
        stats.update(self._import_metadata())

        # Step 2: Import projects
        logger.info("Step 2: Importing projects")
        projects = self._import_projects(project_keys)
        stats['projects'] = len(projects)

        # Step 3: Import workflows for projects
        logger.info("Step 3: Importing workflows")
        workflow_stats = self._import_workflows_parallel(projects)
        stats['workflows'] = workflow_stats['workflows']
        stats['transitions'] = workflow_stats['transitions']

        # Step 4: Import field configurations for projects
        logger.info("Step 4: Importing field configurations")
        stats['field_configs'] = self._import_field_configs_parallel(projects)

        # Step 5: Import issues for projects (multi-process)
        logger.info("Step 5: Importing issues")
        stats['issues'] = self._import_issues_parallel(projects)

        logger.info(f"Import complete! Stats: {stats}")
        return stats

    def _import_metadata(self) -> Dict[str, int]:
        """Import global metadata (issue types, statuses, fields)."""
        stats = {'issue_types': 0, 'statuses': 0, 'fields': 0}

        # Import issue types
        issue_types = self.jira_client.get_issue_types()
        for issue_type in issue_types:
            self.db_manager.insert_issue_type({
                'jira_id': issue_type['id'],
                'name': issue_type['name'],
                'description': issue_type.get('description', ''),
                'icon_url': issue_type.get('iconUrl', ''),
                'subtask': 1 if issue_type.get('subtask', False) else 0,
            })
        stats['issue_types'] = len(issue_types)

        # Import statuses
        statuses = self.jira_client.get_statuses()
        for status in statuses:
            self.db_manager.insert_status({
                'jira_id': status['id'],
                'name': status['name'],
                'description': status.get('description', ''),
                'category': status.get('statusCategory', {}).get('name', ''),
                'color_name': status.get('statusCategory', {}).get('colorName', ''),
            })
        stats['statuses'] = len(statuses)

        # Import fields
        fields = self.jira_client.get_fields()
        for field in fields:
            schema = field.get('schema', {})
            self.db_manager.insert_field_type({
                'jira_key': field['id'],
                'name': field['name'],
                'description': field.get('description', ''),
                'field_type': schema.get('type', 'string'),
                'custom': 1 if field.get('custom', False) else 0,
                'orderable': 1 if field.get('orderable', True) else 0,
                'navigable': 1 if field.get('navigable', True) else 0,
                'searchable': 1 if field.get('searchable', True) else 0,
                'schema_type': schema.get('type'),
                'schema_items': schema.get('items'),
                'schema_system': schema.get('system'),
                'schema_custom': schema.get('custom'),
                'schema_custom_id': schema.get('customId'),
            })
        stats['fields'] = len(fields)

        return stats

    def _import_projects(
        self,
        project_keys: Optional[List[str]] = None
    ) -> List[Dict[str, Any]]:
        """Import projects from JIRA."""
        all_projects = self.jira_client.get_projects()

        # Filter projects if specified
        if project_keys:
            all_projects = [
                p for p in all_projects
                if p['key'] in project_keys
            ]

        for project in all_projects:
            # Get detailed project info
            details = self.jira_client.get_project_details(project['key'])

            self.db_manager.insert_project({
                'jira_id': project['id'],
                'key': project['key'],
                'name': project['name'],
                'description': details.get('description', ''),
                'lead': details.get('lead', {}).get('displayName', ''),
                'project_type': project.get('projectTypeKey', ''),
            })

        return all_projects

    def _import_workflows_parallel(
        self,
        projects: List[Dict[str, Any]]
    ) -> Dict[str, int]:
        """Import workflows using parallel processing."""
        stats = {'workflows': 0, 'transitions': 0}

        # Get workflows (may be global or project-specific)
        try:
            workflows = self.jira_client.get_workflows()

            for workflow in workflows:
                # Insert workflow
                workflow_id_db = self.db_manager.insert_workflow({
                    'jira_id': workflow.get('id', {}).get('name', ''),
                    'name': workflow.get('id', {}).get('name', workflow.get('name', '')),
                    'description': workflow.get('description', ''),
                    'is_default': 0,
                    'project_id': None,
                })
                stats['workflows'] += 1

                # Get and import transitions
                workflow_jira_id = workflow.get('id', {}).get('name', '')
                if workflow_jira_id:
                    transitions = self.jira_client.get_workflow_transitions(
                        workflow_jira_id
                    )

                    for transition in transitions:
                        # Get status IDs from database
                        from_status_name = transition.get('from', [{}])[0].get('name')
                        to_status_name = transition.get('to', {}).get('name')

                        from_status_id = None
                        if from_status_name:
                            from_status = self.db_manager.execute_query(
                                "SELECT id FROM statuses WHERE name = ?",
                                (from_status_name,),
                                fetch_one=True
                            )
                            if from_status:
                                from_status_id = from_status[0]

                        to_status_id = None
                        if to_status_name:
                            to_status = self.db_manager.execute_query(
                                "SELECT id FROM statuses WHERE name = ?",
                                (to_status_name,),
                                fetch_one=True
                            )
                            if to_status:
                                to_status_id = to_status[0]

                        if to_status_id:
                            self.db_manager.insert_workflow_transition({
                                'jira_id': transition.get('id', ''),
                                'workflow_id': workflow_id_db,
                                'name': transition.get('name', ''),
                                'description': transition.get('description', ''),
                                'from_status_id': from_status_id,
                                'to_status_id': to_status_id,
                                'transition_type': transition.get('type', ''),
                                'properties': json.dumps(transition.get('properties', {})),
                            })
                            stats['transitions'] += 1

        except Exception as e:
            logger.error(f"Error importing workflows: {e}")

        return stats

    def _import_field_configs_parallel(
        self,
        projects: List[Dict[str, Any]]
    ) -> int:
        """Import field configurations using parallel processing."""
        total_configs = 0

        # Use multiprocessing pool
        with mp.Pool(processes=self.num_processes) as pool:
            func = partial(
                _import_field_configs_worker,
                self.jira_url,
                self.username,
                self.api_token,
                self.db_path
            )

            results = pool.map(func, [p['key'] for p in projects])
            total_configs = sum(results)

        return total_configs

    def _import_issues_parallel(
        self,
        projects: List[Dict[str, Any]]
    ) -> int:
        """Import issues using parallel processing."""
        total_issues = 0

        # Use multiprocessing pool
        with mp.Pool(processes=self.num_processes) as pool:
            func = partial(
                _import_issues_worker,
                self.jira_url,
                self.username,
                self.api_token,
                self.db_path
            )

            results = pool.map(func, [p['key'] for p in projects])
            total_issues = sum(results)

        return total_issues


# Worker functions for multiprocessing
def _import_field_configs_worker(
    jira_url: str,
    username: str,
    api_token: str,
    db_path: str,
    project_key: str
) -> int:
    """Worker function to import field configurations for a project."""
    try:
        jira_client = JiraClient(jira_url, username, api_token)
        db_manager = DatabaseManager(db_path)

        configs = jira_client.get_field_configurations(project_key)

        # Get project ID and issue type IDs from database
        project = db_manager.execute_query(
            "SELECT id FROM projects WHERE key = ?",
            (project_key,),
            fetch_one=True
        )

        if not project:
            return 0

        project_id = project[0]
        count = 0

        for config in configs:
            # Get field type ID
            field = db_manager.execute_query(
                "SELECT id FROM field_types WHERE jira_key = ?",
                (config['field_key'],),
                fetch_one=True
            )

            if not field:
                continue

            field_type_id = field[0]

            # Get issue type ID
            issue_type = db_manager.execute_query(
                "SELECT id FROM issue_types WHERE jira_id = ?",
                (config['issue_type_id'],),
                fetch_one=True
            )

            if not issue_type:
                continue

            issue_type_id = issue_type[0]

            db_manager.insert_field_configuration({
                'field_type_id': field_type_id,
                'project_id': project_id,
                'issue_type_id': issue_type_id,
                'is_required': 1 if config.get('required', False) else 0,
                'is_visible': 1,
                'default_value': json.dumps(config.get('default_value')),
                'allowed_values': json.dumps(config.get('allowed_values', [])),
                'renderer_type': config.get('schema', {}).get('type'),
                'renderer_config': json.dumps(config.get('schema', {})),
            })
            count += 1

        logger.info(f"Imported {count} field configs for project {project_key}")
        return count

    except Exception as e:
        logger.error(f"Error importing field configs for {project_key}: {e}")
        return 0


def _import_issues_worker(
    jira_url: str,
    username: str,
    api_token: str,
    db_path: str,
    project_key: str
) -> int:
    """Worker function to import issues for a project."""
    try:
        jira_client = JiraClient(jira_url, username, api_token)
        db_manager = DatabaseManager(db_path)

        issues = jira_client.get_all_issues(project_key)

        # Get project ID from database
        project = db_manager.execute_query(
            "SELECT id FROM projects WHERE key = ?",
            (project_key,),
            fetch_one=True
        )

        if not project:
            return 0

        project_id = project[0]
        count = 0

        for issue in issues:
            fields = issue.get('fields', {})

            # Get issue type ID
            issue_type = db_manager.execute_query(
                "SELECT id FROM issue_types WHERE jira_id = ?",
                (fields.get('issuetype', {}).get('id', ''),),
                fetch_one=True
            )

            if not issue_type:
                continue

            issue_type_id = issue_type[0]

            # Get status ID
            status = db_manager.execute_query(
                "SELECT id FROM statuses WHERE jira_id = ?",
                (fields.get('status', {}).get('id', ''),),
                fetch_one=True
            )

            if not status:
                continue

            status_id = status[0]

            # Insert issue
            issue_id_db = db_manager.insert_issue({
                'jira_id': issue['id'],
                'key': issue['key'],
                'project_id': project_id,
                'issue_type_id': issue_type_id,
                'status_id': status_id,
                'summary': fields.get('summary', ''),
                'description': fields.get('description', ''),
                'priority': fields.get('priority', {}).get('name', ''),
                'assignee': fields.get('assignee', {}).get('displayName', ''),
                'reporter': fields.get('reporter', {}).get('displayName', ''),
                'created_date': fields.get('created'),
                'updated_date': fields.get('updated'),
                'resolved_date': fields.get('resolutiondate'),
                'due_date': fields.get('duedate'),
                'parent_id': None,  # Handle parent later
            })

            # Insert field values
            for field_key, field_value in fields.items():
                # Get field type ID
                field_type = db_manager.execute_query(
                    "SELECT id FROM field_types WHERE jira_key = ?",
                    (field_key,),
                    fetch_one=True
                )

                if field_type:
                    field_type_id = field_type[0]

                    # Determine value type and serialize
                    value_type = type(field_value).__name__
                    value_str = json.dumps(field_value) if field_value is not None else None

                    db_manager.insert_field_value({
                        'issue_id': issue_id_db,
                        'field_type_id': field_type_id,
                        'value': value_str,
                        'value_type': value_type,
                    })

            count += 1

        logger.info(f"Imported {count} issues for project {project_key}")
        return count

    except Exception as e:
        logger.error(f"Error importing issues for {project_key}: {e}")
        return 0
