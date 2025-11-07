"""Configuration management for JIRA tracker."""

import os
import json
from typing import Dict, Any, Optional
from dataclasses import dataclass, asdict


@dataclass
class Config:
    """Configuration for JIRA tracker."""

    # JIRA connection settings
    jira_url: str = ""
    jira_username: str = ""
    jira_api_token: str = ""

    # Database settings
    db_path: str = "jira_tracker.db"

    # Import settings
    num_processes: int = 4
    batch_size: int = 100

    # GUI settings
    window_width: int = 1200
    window_height: int = 800
    theme: str = "light"

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Config':
        """
        Create Config from dictionary.

        Args:
            data: Configuration dictionary

        Returns:
            Config instance
        """
        return cls(**{
            k: v for k, v in data.items()
            if k in cls.__dataclass_fields__
        })

    def to_dict(self) -> Dict[str, Any]:
        """
        Convert Config to dictionary.

        Returns:
            Configuration dictionary
        """
        return asdict(self)

    def save(self, path: str = "config.json") -> None:
        """
        Save configuration to file.

        Args:
            path: Path to configuration file
        """
        with open(path, 'w') as f:
            json.dump(self.to_dict(), f, indent=2)

    @classmethod
    def load(cls, path: str = "config.json") -> 'Config':
        """
        Load configuration from file.

        Args:
            path: Path to configuration file

        Returns:
            Config instance
        """
        if not os.path.exists(path):
            return cls()

        with open(path, 'r') as f:
            data = json.load(f)

        return cls.from_dict(data)


def load_config(path: Optional[str] = None) -> Config:
    """
    Load configuration from file or environment variables.

    Args:
        path: Optional path to configuration file

    Returns:
        Config instance
    """
    # Load from file
    config_path = path or os.getenv('JIRA_TRACKER_CONFIG', 'config.json')
    config = Config.load(config_path)

    # Override with environment variables
    config.jira_url = os.getenv('JIRA_URL', config.jira_url)
    config.jira_username = os.getenv('JIRA_USERNAME', config.jira_username)
    config.jira_api_token = os.getenv('JIRA_API_TOKEN', config.jira_api_token)
    config.db_path = os.getenv('JIRA_TRACKER_DB', config.db_path)

    return config
