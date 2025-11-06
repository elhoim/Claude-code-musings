"""
TUI.be Last Minutes Scraper

A command-line web scraper for TUI.be vacation packages.
"""

__version__ = "1.0.0"
__author__ = "Claude Code"

from .database import TUIDatabase
from .scraper import TUIScraper

__all__ = ["TUIDatabase", "TUIScraper"]
