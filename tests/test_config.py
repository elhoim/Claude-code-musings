"""Unit tests for configuration module."""

import unittest
import os
import tempfile
import json

from jira_tracker.config.config import Config, load_config


class TestConfig(unittest.TestCase):
    """Test Config class."""

    def test_config_creation(self):
        """Test creating a Config instance with defaults."""
        config = Config()

        self.assertEqual(config.jira_url, "")
        self.assertEqual(config.jira_username, "")
        self.assertEqual(config.db_path, "jira_tracker.db")
        self.assertEqual(config.num_processes, 4)

    def test_config_with_values(self):
        """Test creating a Config instance with values."""
        config = Config(
            jira_url="https://example.atlassian.net",
            jira_username="user@example.com",
            jira_api_token="token123",
            db_path="custom.db",
            num_processes=8
        )

        self.assertEqual(config.jira_url, "https://example.atlassian.net")
        self.assertEqual(config.jira_username, "user@example.com")
        self.assertEqual(config.jira_api_token, "token123")
        self.assertEqual(config.db_path, "custom.db")
        self.assertEqual(config.num_processes, 8)

    def test_config_from_dict(self):
        """Test creating Config from dictionary."""
        data = {
            'jira_url': 'https://example.atlassian.net',
            'jira_username': 'user@example.com',
            'jira_api_token': 'token123',
            'db_path': 'custom.db',
            'num_processes': 8,
        }

        config = Config.from_dict(data)

        self.assertEqual(config.jira_url, 'https://example.atlassian.net')
        self.assertEqual(config.jira_username, 'user@example.com')
        self.assertEqual(config.num_processes, 8)

    def test_config_to_dict(self):
        """Test converting Config to dictionary."""
        config = Config(
            jira_url="https://example.atlassian.net",
            jira_username="user@example.com",
            db_path="custom.db"
        )

        config_dict = config.to_dict()

        self.assertIsInstance(config_dict, dict)
        self.assertEqual(config_dict['jira_url'], 'https://example.atlassian.net')
        self.assertEqual(config_dict['jira_username'], 'user@example.com')
        self.assertEqual(config_dict['db_path'], 'custom.db')

    def test_config_save_and_load(self):
        """Test saving and loading config to/from file."""
        # Create temp config file
        temp_file = tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.json')
        temp_file.close()

        try:
            # Create and save config
            config = Config(
                jira_url="https://example.atlassian.net",
                jira_username="user@example.com",
                jira_api_token="token123",
                db_path="custom.db",
                num_processes=6
            )

            config.save(temp_file.name)

            # Load config
            loaded_config = Config.load(temp_file.name)

            self.assertEqual(loaded_config.jira_url, config.jira_url)
            self.assertEqual(loaded_config.jira_username, config.jira_username)
            self.assertEqual(loaded_config.jira_api_token, config.jira_api_token)
            self.assertEqual(loaded_config.db_path, config.db_path)
            self.assertEqual(loaded_config.num_processes, config.num_processes)

        finally:
            if os.path.exists(temp_file.name):
                os.unlink(temp_file.name)

    def test_config_load_nonexistent_file(self):
        """Test loading config from non-existent file returns defaults."""
        config = Config.load('nonexistent_config.json')

        # Should return default config
        self.assertEqual(config.jira_url, "")
        self.assertEqual(config.db_path, "jira_tracker.db")

    def test_load_config_function(self):
        """Test load_config function."""
        # Create temp config file
        temp_file = tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.json')

        config_data = {
            'jira_url': 'https://example.atlassian.net',
            'jira_username': 'user@example.com',
            'jira_api_token': 'token123',
        }

        with open(temp_file.name, 'w') as f:
            json.dump(config_data, f)

        try:
            config = load_config(temp_file.name)

            self.assertEqual(config.jira_url, 'https://example.atlassian.net')
            self.assertEqual(config.jira_username, 'user@example.com')

        finally:
            if os.path.exists(temp_file.name):
                os.unlink(temp_file.name)

    def test_load_config_with_env_override(self):
        """Test that environment variables override config file."""
        # Set environment variables
        os.environ['JIRA_URL'] = 'https://env.atlassian.net'
        os.environ['JIRA_USERNAME'] = 'envuser@example.com'

        try:
            config = load_config()

            self.assertEqual(config.jira_url, 'https://env.atlassian.net')
            self.assertEqual(config.jira_username, 'envuser@example.com')

        finally:
            # Clean up environment variables
            if 'JIRA_URL' in os.environ:
                del os.environ['JIRA_URL']
            if 'JIRA_USERNAME' in os.environ:
                del os.environ['JIRA_USERNAME']


if __name__ == '__main__':
    unittest.main()
