"""JIRA API client for fetching data from Atlassian JIRA."""

import requests
from requests.auth import HTTPBasicAuth
from typing import List, Dict, Any, Optional
import json
from urllib.parse import urljoin
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class JiraClient:
    """Client for interacting with JIRA REST API."""

    def __init__(
        self,
        base_url: str,
        username: str,
        api_token: str,
        verify_ssl: bool = True
    ):
        """
        Initialize JIRA client.

        Args:
            base_url: JIRA instance base URL (e.g., https://your-domain.atlassian.net)
            username: JIRA username or email
            api_token: JIRA API token
            verify_ssl: Whether to verify SSL certificates
        """
        self.base_url = base_url.rstrip('/')
        self.auth = HTTPBasicAuth(username, api_token)
        self.verify_ssl = verify_ssl
        self.session = requests.Session()
        self.session.auth = self.auth
        self.session.verify = verify_ssl

        # Set default headers
        self.session.headers.update({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        })

    def _make_request(
        self,
        endpoint: str,
        method: str = 'GET',
        params: Optional[Dict] = None,
        data: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """
        Make a request to JIRA API.

        Args:
            endpoint: API endpoint
            method: HTTP method
            params: Query parameters
            data: Request body data

        Returns:
            Response JSON data

        Raises:
            requests.exceptions.RequestException: If request fails
        """
        url = urljoin(self.base_url, endpoint)

        try:
            response = self.session.request(
                method=method,
                url=url,
                params=params,
                json=data
            )
            response.raise_for_status()
            return response.json() if response.content else {}

        except requests.exceptions.RequestException as e:
            logger.error(f"Request failed: {e}")
            raise

    def get_projects(self) -> List[Dict[str, Any]]:
        """
        Get all projects from JIRA.

        Returns:
            List of project dictionaries
        """
        logger.info("Fetching projects from JIRA")
        try:
            projects = self._make_request('/rest/api/3/project')
            logger.info(f"Fetched {len(projects)} projects")
            return projects
        except Exception as e:
            logger.error(f"Error fetching projects: {e}")
            return []

    def get_project_details(self, project_key: str) -> Dict[str, Any]:
        """
        Get detailed information about a project.

        Args:
            project_key: Project key

        Returns:
            Project details dictionary
        """
        logger.info(f"Fetching details for project {project_key}")
        return self._make_request(f'/rest/api/3/project/{project_key}')

    def get_issue_types(self) -> List[Dict[str, Any]]:
        """
        Get all issue types from JIRA.

        Returns:
            List of issue type dictionaries
        """
        logger.info("Fetching issue types from JIRA")
        try:
            issue_types = self._make_request('/rest/api/3/issuetype')
            logger.info(f"Fetched {len(issue_types)} issue types")
            return issue_types
        except Exception as e:
            logger.error(f"Error fetching issue types: {e}")
            return []

    def get_statuses(self) -> List[Dict[str, Any]]:
        """
        Get all statuses from JIRA.

        Returns:
            List of status dictionaries
        """
        logger.info("Fetching statuses from JIRA")
        try:
            statuses = self._make_request('/rest/api/3/status')
            logger.info(f"Fetched {len(statuses)} statuses")
            return statuses
        except Exception as e:
            logger.error(f"Error fetching statuses: {e}")
            return []

    def get_workflows(self, project_key: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Get workflows from JIRA.

        Args:
            project_key: Optional project key to get workflows for specific project

        Returns:
            List of workflow dictionaries
        """
        logger.info("Fetching workflows from JIRA")
        try:
            # Get workflow schemes
            params = {}
            if project_key:
                params['projectKey'] = project_key

            # Note: This endpoint might require different permissions
            workflows = self._make_request(
                '/rest/api/3/workflow/search',
                params=params
            )

            if 'values' in workflows:
                logger.info(f"Fetched {len(workflows['values'])} workflows")
                return workflows['values']

            return []
        except Exception as e:
            logger.error(f"Error fetching workflows: {e}")
            return []

    def get_workflow_transitions(
        self,
        workflow_id: str
    ) -> List[Dict[str, Any]]:
        """
        Get transitions for a specific workflow.

        Args:
            workflow_id: Workflow ID

        Returns:
            List of transition dictionaries
        """
        logger.info(f"Fetching transitions for workflow {workflow_id}")
        try:
            # Get workflow details which includes transitions
            workflow = self._make_request(
                f'/rest/api/3/workflow/{workflow_id}'
            )

            transitions = []
            if 'transitions' in workflow:
                transitions = workflow['transitions']

            logger.info(f"Fetched {len(transitions)} transitions")
            return transitions
        except Exception as e:
            logger.error(f"Error fetching workflow transitions: {e}")
            return []

    def get_fields(self) -> List[Dict[str, Any]]:
        """
        Get all fields (system and custom) from JIRA.

        Returns:
            List of field dictionaries
        """
        logger.info("Fetching fields from JIRA")
        try:
            fields = self._make_request('/rest/api/3/field')
            logger.info(f"Fetched {len(fields)} fields")
            return fields
        except Exception as e:
            logger.error(f"Error fetching fields: {e}")
            return []

    def get_field_configurations(
        self,
        project_key: str
    ) -> List[Dict[str, Any]]:
        """
        Get field configurations for a project.

        Args:
            project_key: Project key

        Returns:
            List of field configuration dictionaries
        """
        logger.info(f"Fetching field configurations for project {project_key}")
        try:
            # Get createmeta which contains field configurations
            meta = self._make_request(
                '/rest/api/3/issue/createmeta',
                params={
                    'projectKeys': project_key,
                    'expand': 'projects.issuetypes.fields'
                }
            )

            configurations = []
            if 'projects' in meta:
                for project in meta['projects']:
                    if 'issuetypes' in project:
                        for issue_type in project['issuetypes']:
                            if 'fields' in issue_type:
                                for field_key, field_data in issue_type['fields'].items():
                                    config = {
                                        'field_key': field_key,
                                        'issue_type_id': issue_type['id'],
                                        'required': field_data.get('required', False),
                                        'schema': field_data.get('schema', {}),
                                        'allowed_values': field_data.get('allowedValues', []),
                                        'default_value': field_data.get('defaultValue'),
                                    }
                                    configurations.append(config)

            logger.info(f"Fetched {len(configurations)} field configurations")
            return configurations
        except Exception as e:
            logger.error(f"Error fetching field configurations: {e}")
            return []

    def get_issues(
        self,
        project_key: str,
        start_at: int = 0,
        max_results: int = 50
    ) -> Dict[str, Any]:
        """
        Get issues for a project.

        Args:
            project_key: Project key
            start_at: Starting index for pagination
            max_results: Maximum number of results to return

        Returns:
            Dictionary containing issues and pagination info
        """
        logger.info(f"Fetching issues for project {project_key} (start={start_at})")
        try:
            jql = f'project = {project_key} ORDER BY created DESC'

            result = self._make_request(
                '/rest/api/3/search',
                params={
                    'jql': jql,
                    'startAt': start_at,
                    'maxResults': max_results,
                    'fields': '*all'
                }
            )

            logger.info(
                f"Fetched {len(result.get('issues', []))} issues "
                f"(total: {result.get('total', 0)})"
            )
            return result
        except Exception as e:
            logger.error(f"Error fetching issues: {e}")
            return {'issues': [], 'total': 0}

    def get_all_issues(self, project_key: str) -> List[Dict[str, Any]]:
        """
        Get all issues for a project (handles pagination).

        Args:
            project_key: Project key

        Returns:
            List of all issues
        """
        all_issues = []
        start_at = 0
        max_results = 100

        while True:
            result = self.get_issues(project_key, start_at, max_results)
            issues = result.get('issues', [])

            if not issues:
                break

            all_issues.extend(issues)

            total = result.get('total', 0)
            start_at += len(issues)

            if start_at >= total:
                break

        logger.info(f"Fetched total of {len(all_issues)} issues for {project_key}")
        return all_issues

    def get_issue_comments(self, issue_key: str) -> List[Dict[str, Any]]:
        """
        Get comments for an issue.

        Args:
            issue_key: Issue key

        Returns:
            List of comment dictionaries
        """
        logger.info(f"Fetching comments for issue {issue_key}")
        try:
            result = self._make_request(
                f'/rest/api/3/issue/{issue_key}/comment'
            )

            comments = result.get('comments', [])
            logger.info(f"Fetched {len(comments)} comments")
            return comments
        except Exception as e:
            logger.error(f"Error fetching comments: {e}")
            return []

    def test_connection(self) -> bool:
        """
        Test the connection to JIRA.

        Returns:
            True if connection is successful, False otherwise
        """
        try:
            self._make_request('/rest/api/3/myself')
            logger.info("Successfully connected to JIRA")
            return True
        except Exception as e:
            logger.error(f"Failed to connect to JIRA: {e}")
            return False
