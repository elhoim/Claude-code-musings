# JIRA Issue Tracker

A Python-based issue tracking system that imports workflows, transitions, and field types from Atlassian JIRA with multiprocessing support and a graphical user interface.

## Features

- **Full JIRA Data Import**: Import projects, issues, workflows, transitions, field types, and configurations
- **Multiprocessing**: Efficient parallel data import using Python's multiprocessing
- **SQLite3 Database**: Local storage with comprehensive schema
- **JIRA-like GUI**: Field rendering that closely mimics Atlassian JIRA's interface
- **Field Type Support**: Handles all JIRA field types (text, number, date, select, user, etc.)
- **Workflow Management**: Import and display workflow transitions
- **Search & Filter**: Search issues and filter by project

## Architecture

```
jira_tracker/
├── api/                    # JIRA API integration
│   ├── jira_client.py     # REST API client
│   └── importer.py        # Multiprocess importer
├── database/              # Database layer
│   ├── schema.py          # SQLite schema definitions
│   └── db_manager.py      # Database operations
├── models/                # Data models
│   ├── issue.py           # Issue model
│   ├── workflow.py        # Workflow model
│   └── field.py           # Field model
├── gui/                   # Graphical interface
│   ├── main_window.py     # Main application window
│   └── field_renderer.py  # JIRA-style field rendering
├── config/                # Configuration
│   └── config.py          # Config management
└── utils/                 # Utilities
    └── logger.py          # Logging setup
```

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Claude-code-musings
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

Python 3.8+ is required. The GUI uses tkinter which comes with Python.

## Configuration

Create a `config.json` file (optional):

```json
{
  "jira_url": "https://your-domain.atlassian.net",
  "jira_username": "your-email@example.com",
  "jira_api_token": "your-api-token",
  "db_path": "jira_tracker.db",
  "num_processes": 4,
  "window_width": 1200,
  "window_height": 800
}
```

Or use environment variables:
```bash
export JIRA_URL="https://your-domain.atlassian.net"
export JIRA_USERNAME="your-email@example.com"
export JIRA_API_TOKEN="your-api-token"
export JIRA_TRACKER_DB="jira_tracker.db"
```

## Usage

### GUI Mode (Default)

Launch the graphical interface:

```bash
python main.py
```

Or explicitly:
```bash
python main.py --mode gui --db-path jira_tracker.db
```

The GUI provides:
- Project selector
- Issue browser with search
- JIRA-style issue detail view
- Field rendering matching JIRA's look and feel

### Import Mode

Import data from JIRA:

```bash
python main.py --mode import \
  --jira-url "https://your-domain.atlassian.net" \
  --username "your-email@example.com" \
  --api-token "your-api-token" \
  --projects PROJ1 PROJ2
```

Import all projects:
```bash
python main.py --mode import \
  --jira-url "https://your-domain.atlassian.net" \
  --username "your-email@example.com" \
  --api-token "your-api-token"
```

Specify number of parallel processes:
```bash
python main.py --mode import \
  --jira-url "https://your-domain.atlassian.net" \
  --username "your-email@example.com" \
  --api-token "your-api-token" \
  --processes 8
```

### Test Mode

Test JIRA connection:

```bash
python main.py --mode test \
  --jira-url "https://your-domain.atlassian.net" \
  --username "your-email@example.com" \
  --api-token "your-api-token"
```

## Database Schema

The SQLite database includes tables for:

- **Projects**: JIRA projects
- **Issue Types**: Bug, Story, Task, etc.
- **Statuses**: To Do, In Progress, Done, etc.
- **Workflows**: Workflow definitions
- **Workflow Transitions**: State transitions
- **Field Types**: All system and custom fields
- **Field Configurations**: Project/issue type specific configs
- **Issues**: Issue data
- **Field Values**: Dynamic field values
- **Comments**: Issue comments
- **Attachments**: File attachments

## JIRA API Token

To generate a JIRA API token:

1. Go to https://id.atlassian.com/manage-profile/security/api-tokens
2. Click "Create API token"
3. Give it a label and copy the token
4. Use your email as username and the token as password

## Multiprocessing Architecture

The importer uses Python's multiprocessing to parallelize:

- Field configuration imports per project
- Issue imports per project
- Each project is processed by a separate worker process
- Thread-safe database operations with connection pooling

## Field Rendering

The GUI renders JIRA fields with similar styling:

- **Text fields**: Single-line input with JIRA colors
- **Text areas**: Multi-line with scrolling (for descriptions)
- **Number fields**: Validated numeric input
- **Date/DateTime**: Date picker with calendar icon
- **Select/Dropdown**: Combobox with allowed values
- **Multi-select**: Listbox with multiple selection
- **User picker**: User field with avatar icon
- **Labels**: Bold field names with required indicators (*)

## Command-Line Options

```
--mode {gui,import,test}     Application mode (default: gui)
--config PATH                Path to configuration file
--jira-url URL               JIRA instance URL
--username USER              JIRA username/email
--api-token TOKEN            JIRA API token
--db-path PATH               SQLite database path
--projects PROJ [PROJ ...]   Project keys to import
--processes N                Number of parallel processes
--verbose                    Enable verbose logging
```

## Example Workflow

1. **Test connection**:
```bash
python main.py --mode test \
  --jira-url "https://mycompany.atlassian.net" \
  --username "user@mycompany.com" \
  --api-token "ABC123..."
```

2. **Import specific projects**:
```bash
python main.py --mode import \
  --jira-url "https://mycompany.atlassian.net" \
  --username "user@mycompany.com" \
  --api-token "ABC123..." \
  --projects MYPROJ DEMO \
  --processes 4
```

3. **Launch GUI**:
```bash
python main.py
```

4. **Browse and search issues** in the GUI

## Development

### Project Structure

- `jira_tracker/`: Main package
- `main.py`: Entry point
- `requirements.txt`: Dependencies
- `config.json`: Optional configuration

### Running Tests

```bash
pytest tests/
```

### Code Formatting

```bash
black jira_tracker/ main.py
flake8 jira_tracker/ main.py
```

## Troubleshooting

### Connection Issues

- Verify JIRA URL format: `https://your-domain.atlassian.net`
- Check API token is valid and not expired
- Ensure username is your full email address
- Check network/firewall allows HTTPS to JIRA

### Import Issues

- Some JIRA APIs require specific permissions
- Workflow import may fail if user lacks admin permissions
- Increase `--processes` for faster import on multi-core systems
- Check logs with `--verbose` for detailed error messages

### GUI Issues

- Ensure tkinter is installed (comes with Python on most systems)
- On Linux: `sudo apt-get install python3-tk`
- Database must be populated with `--mode import` first

## License

MIT License - See LICENSE file for details

## Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

For issues and questions:
- Open an issue on GitHub
- Check the JIRA API documentation: https://developer.atlassian.com/cloud/jira/platform/rest/v3/

## Acknowledgments

Built with:
- Python 3.8+
- SQLite3
- tkinter
- requests library
- JIRA REST API v3
