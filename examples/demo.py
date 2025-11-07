#!/usr/bin/env python3
"""
Demo script showing how to use the JIRA Tracker programmatically.
"""

import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from jira_tracker.database.db_manager import DatabaseManager
from jira_tracker.api.jira_client import JiraClient
from jira_tracker.api.importer import JiraImporter
from jira_tracker.models.issue import Issue
from jira_tracker.models.workflow import Workflow
from jira_tracker.config.config import load_config


def demo_database_operations():
    """Demonstrate database operations."""
    print("=" * 60)
    print("Database Operations Demo")
    print("=" * 60)

    db = DatabaseManager("demo.db")

    # Insert sample project
    project_id = db.insert_project({
        'jira_id': 'proj-001',
        'key': 'DEMO',
        'name': 'Demo Project',
        'description': 'A demo project for testing',
        'lead': 'John Doe',
        'project_type': 'software',
    })
    print(f"✓ Created project with ID: {project_id}")

    # Insert sample issue type
    issue_type_id = db.insert_issue_type({
        'jira_id': 'it-001',
        'name': 'Story',
        'description': 'User story',
        'icon_url': 'https://example.com/story.png',
        'subtask': 0,
    })
    print(f"✓ Created issue type with ID: {issue_type_id}")

    # Insert sample status
    status_id = db.insert_status({
        'jira_id': 'st-001',
        'name': 'To Do',
        'description': 'Work not started',
        'category': 'new',
        'color_name': 'blue',
    })
    print(f"✓ Created status with ID: {status_id}")

    # Insert sample issue
    issue_id = db.insert_issue({
        'jira_id': 'iss-001',
        'key': 'DEMO-1',
        'project_id': project_id,
        'issue_type_id': issue_type_id,
        'status_id': status_id,
        'summary': 'Sample issue for demo',
        'description': 'This is a demo issue',
        'priority': 'Medium',
        'assignee': 'Jane Smith',
        'reporter': 'John Doe',
        'created_date': '2024-01-01 10:00:00',
        'updated_date': '2024-01-01 10:00:00',
    })
    print(f"✓ Created issue with ID: {issue_id}")

    # Query data
    print("\n" + "=" * 60)
    print("Querying Data")
    print("=" * 60)

    projects = db.get_all_projects()
    print(f"\n✓ Found {len(projects)} project(s)")
    for proj in projects:
        print(f"  - {proj['key']}: {proj['name']}")

    issues = db.get_issues_by_project(project_id)
    print(f"\n✓ Found {len(issues)} issue(s)")
    for iss in issues:
        print(f"  - {iss['key']}: {iss['summary']}")
        print(f"    Status: {iss['status_name']}")
        print(f"    Assignee: {iss['assignee']}")

    # Clean up
    os.remove("demo.db")
    print("\n✓ Demo database cleaned up")


def demo_jira_client():
    """Demonstrate JIRA client usage (requires credentials)."""
    print("\n" + "=" * 60)
    print("JIRA Client Demo")
    print("=" * 60)

    # Load configuration
    config = load_config()

    if not all([config.jira_url, config.jira_username, config.jira_api_token]):
        print("⚠ JIRA credentials not configured")
        print("  Set environment variables or create config.json")
        print("  Required: JIRA_URL, JIRA_USERNAME, JIRA_API_TOKEN")
        return

    print(f"\n✓ Connecting to: {config.jira_url}")

    client = JiraClient(
        config.jira_url,
        config.jira_username,
        config.jira_api_token
    )

    # Test connection
    if not client.test_connection():
        print("✗ Connection failed!")
        return

    print("✓ Connected successfully!")

    # Fetch projects
    print("\n" + "-" * 60)
    projects = client.get_projects()
    print(f"✓ Found {len(projects)} project(s)")
    for proj in projects[:5]:  # Show first 5
        print(f"  - {proj['key']}: {proj['name']}")

    if len(projects) > 5:
        print(f"  ... and {len(projects) - 5} more")

    # Fetch issue types
    print("\n" + "-" * 60)
    issue_types = client.get_issue_types()
    print(f"✓ Found {len(issue_types)} issue type(s)")
    for it in issue_types[:5]:
        print(f"  - {it['name']}")

    if len(issue_types) > 5:
        print(f"  ... and {len(issue_types) - 5} more")

    # Fetch fields
    print("\n" + "-" * 60)
    fields = client.get_fields()
    print(f"✓ Found {len(fields)} field(s)")

    system_fields = [f for f in fields if not f.get('custom', False)]
    custom_fields = [f for f in fields if f.get('custom', False)]

    print(f"  - System fields: {len(system_fields)}")
    print(f"  - Custom fields: {len(custom_fields)}")

    print("\n✓ JIRA client demo completed")


def demo_importer():
    """Demonstrate the importer (requires credentials)."""
    print("\n" + "=" * 60)
    print("Importer Demo")
    print("=" * 60)

    config = load_config()

    if not all([config.jira_url, config.jira_username, config.jira_api_token]):
        print("⚠ JIRA credentials not configured")
        return

    print(f"✓ Initializing importer")
    print(f"  - JIRA URL: {config.jira_url}")
    print(f"  - Processes: {config.num_processes}")

    importer = JiraImporter(
        config.jira_url,
        config.jira_username,
        config.jira_api_token,
        "demo_import.db",
        config.num_processes
    )

    print("\n⚠ Note: Full import not run in demo")
    print("  To run a full import, use:")
    print("  python main.py --mode import")

    # Clean up
    if os.path.exists("demo_import.db"):
        os.remove("demo_import.db")


def main():
    """Run all demos."""
    print("\n")
    print("╔" + "═" * 58 + "╗")
    print("║" + " " * 15 + "JIRA Tracker Demo" + " " * 25 + "║")
    print("╚" + "═" * 58 + "╝")
    print()

    try:
        # Demo 1: Database operations (always works)
        demo_database_operations()

        # Demo 2: JIRA client (requires credentials)
        demo_jira_client()

        # Demo 3: Importer overview
        demo_importer()

        print("\n" + "=" * 60)
        print("✓ All demos completed!")
        print("=" * 60)
        print("\nNext steps:")
        print("  1. Configure your JIRA credentials")
        print("  2. Run: python main.py --mode import")
        print("  3. Run: python main.py (to launch GUI)")
        print()

    except KeyboardInterrupt:
        print("\n\n⚠ Demo interrupted by user")
    except Exception as e:
        print(f"\n✗ Error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == '__main__':
    main()
