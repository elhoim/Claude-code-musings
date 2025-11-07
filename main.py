#!/usr/bin/env python3
"""
JIRA Issue Tracker - Main Entry Point

A Python-based issue tracking system that imports workflows, transitions,
and field types from Atlassian JIRA with multiprocessing support.
"""

import argparse
import sys
import logging

from jira_tracker.database.db_manager import DatabaseManager
from jira_tracker.api.jira_client import JiraClient
from jira_tracker.api.importer import JiraImporter
from jira_tracker.config.config import load_config
from jira_tracker.utils.logger import setup_logger


def main():
    """Main entry point for the application."""
    parser = argparse.ArgumentParser(
        description='JIRA Issue Tracker - Import and manage JIRA issues locally'
    )

    parser.add_argument(
        '--mode',
        choices=['gui', 'import', 'test'],
        default='gui',
        help='Application mode (default: gui)'
    )

    parser.add_argument(
        '--config',
        type=str,
        help='Path to configuration file'
    )

    parser.add_argument(
        '--jira-url',
        type=str,
        help='JIRA instance URL'
    )

    parser.add_argument(
        '--username',
        type=str,
        help='JIRA username'
    )

    parser.add_argument(
        '--api-token',
        type=str,
        help='JIRA API token'
    )

    parser.add_argument(
        '--db-path',
        type=str,
        default='jira_tracker.db',
        help='Path to SQLite database (default: jira_tracker.db)'
    )

    parser.add_argument(
        '--projects',
        type=str,
        nargs='+',
        help='List of project keys to import (default: all)'
    )

    parser.add_argument(
        '--processes',
        type=int,
        help='Number of parallel processes for import'
    )

    parser.add_argument(
        '--verbose',
        action='store_true',
        help='Enable verbose logging'
    )

    args = parser.parse_args()

    # Setup logging
    log_level = logging.DEBUG if args.verbose else logging.INFO
    logger = setup_logger(level=log_level)

    # Load configuration
    config = load_config(args.config)

    # Override config with command-line arguments
    if args.jira_url:
        config.jira_url = args.jira_url
    if args.username:
        config.jira_username = args.username
    if args.api_token:
        config.jira_api_token = args.api_token
    if args.db_path:
        config.db_path = args.db_path
    if args.processes:
        config.num_processes = args.processes

    logger.info(f"Starting JIRA Tracker in {args.mode} mode")

    try:
        if args.mode == 'gui':
            # Start GUI application (import only when needed)
            try:
                from jira_tracker.gui.main_window import MainWindow
                logger.info("Launching GUI application")
                app = MainWindow(config.db_path)
                app.run()
            except ImportError as e:
                logger.error("GUI mode requires tkinter to be installed")
                logger.error("On Ubuntu/Debian: sudo apt-get install python3-tk")
                logger.error("On Fedora: sudo dnf install python3-tkinter")
                logger.error("On macOS/Windows: tkinter comes with Python")
                sys.exit(1)

        elif args.mode == 'import':
            # Run import
            if not all([config.jira_url, config.jira_username, config.jira_api_token]):
                logger.error(
                    "JIRA connection details required for import. "
                    "Provide via config file, environment variables, or command-line args."
                )
                sys.exit(1)

            logger.info("Starting JIRA import")
            importer = JiraImporter(
                config.jira_url,
                config.jira_username,
                config.jira_api_token,
                config.db_path,
                config.num_processes
            )

            stats = importer.import_all(args.projects)

            logger.info("Import completed successfully!")
            logger.info(f"Statistics: {stats}")

        elif args.mode == 'test':
            # Test connection
            if not all([config.jira_url, config.jira_username, config.jira_api_token]):
                logger.error("JIRA connection details required for test")
                sys.exit(1)

            logger.info("Testing JIRA connection")
            client = JiraClient(
                config.jira_url,
                config.jira_username,
                config.jira_api_token
            )

            if client.test_connection():
                logger.info("Connection successful!")

                # Show some stats
                projects = client.get_projects()
                logger.info(f"Found {len(projects)} projects")

                issue_types = client.get_issue_types()
                logger.info(f"Found {len(issue_types)} issue types")

                fields = client.get_fields()
                logger.info(f"Found {len(fields)} fields")
            else:
                logger.error("Connection failed!")
                sys.exit(1)

    except KeyboardInterrupt:
        logger.info("Application interrupted by user")
        sys.exit(0)
    except Exception as e:
        logger.exception(f"Error: {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()
