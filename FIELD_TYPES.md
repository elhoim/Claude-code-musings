# JIRA Custom Field Types Support

This document describes how the JIRA Issue Tracker system handles all JIRA Core custom field types with proper rendering.

## Supported Custom Field Types

### 1. Checkboxes (Multiple Selection)
**Type**: `com.atlassian.jira.plugin.system.customfieldtypes:checkbox`

**Description**: Allows selecting multiple values from a predefined list.

**Rendering**: Renders as a series of checkbox widgets, where users can select multiple options. Each option appears as a separate checkbox with its label.

**Usage**:
- Define allowed values in field configuration
- Values are stored as a list of selected options
- User can select/deselect any combination

**Example Configuration**:
```python
field_config = {
    'field_type': 'checkbox',
    'allowed_values': ['Option A', 'Option B', 'Option C']
}
```

### 2. Date Picker
**Type**: `com.atlassian.jira.plugin.system.customfieldtypes:datepicker`

**Description**: Allows selecting a date from a calendar picker.

**Rendering**: Renders as a text input field with a calendar icon button. The input accepts date in YYYY-MM-DD format.

**Usage**:
- Click calendar icon to select date
- Manual entry supported
- Stores date in ISO format

**Date Format**: `YYYY-MM-DD` (e.g., `2024-01-15`)

### 3. Date Time Picker
**Type**: `com.atlassian.jira.plugin.system.customfieldtypes:datetime`

**Description**: Allows selecting both date and time.

**Rendering**: Renders as a text input field with calendar icon. Accepts both date and time.

**Usage**:
- Combined date and time selection
- Format: YYYY-MM-DD HH:MM
- 24-hour time format

**DateTime Format**: `YYYY-MM-DD HH:MM` (e.g., `2024-01-15 14:30`)

### 4. Labels
**Type**: `com.atlassian.jira.plugin.system.customfieldtypes:labels`

**Description**: Allows adding multiple labels to facilitate issue categorization and search.

**Rendering**: Renders as an input field with "Add" button and displays labels as removable tags below. Each tag has an × button for removal.

**Usage**:
- Type label text and press Enter or click Add
- Labels appear as tags
- Click × on any tag to remove it
- Supports multiple labels per issue

**How to Create**:
```python
labels = ['bug', 'frontend', 'urgent']
# Renders as: [bug ×] [frontend ×] [urgent ×]
```

### 5. Number Field
**Type**: `com.atlassian.jira.plugin.system.customfieldtypes:float`

**Description**: Stores and validates a floating point number.

**Rendering**: Renders as a text input field with numeric validation. Only allows numbers and decimal points.

**Usage**:
- Enter numeric values (integers or decimals)
- Validation prevents non-numeric input
- Supports negative numbers
- Precision preserved

**Example Values**: `42`, `3.14159`, `-17.5`

### 6. Radio Buttons (Single Selection)
**Type**: `com.atlassian.jira.plugin.system.customfieldtypes:radiobuttons`

**Description**: Allows selecting one value from a predefined list.

**Rendering**: Renders as a series of radio button widgets. Only one option can be selected at a time.

**Usage**:
- Define allowed values in configuration
- User can select exactly one option
- Selecting a new option deselects the previous

**How to Configure**:
```python
field_config = {
    'field_type': 'radiobuttons',
    'allowed_values': ['Low', 'Medium', 'High', 'Critical']
}
```

### 7. Select List (Cascading)
**Type**: `com.atlassian.jira.plugin.system.customfieldtypes:cascadingselect`

**Description**: Allows selecting values based on parent-child relationship.

**Rendering**: Renders as two dropdown menus (parent and child). Child options change based on parent selection.

**Usage**:
- First select parent value
- Child dropdown populates with relevant options
- Both values required for complete selection

**How to Configure Cascading Options**:
```python
cascading_options = [
    {
        'value': 'Hardware',
        'children': ['Laptop', 'Desktop', 'Server']
    },
    {
        'value': 'Software',
        'children': ['Operating System', 'Application', 'Driver']
    }
]
```

**Example**:
- Parent: "Hardware" → Child options: "Laptop", "Desktop", "Server"
- Parent: "Software" → Child options: "Operating System", "Application", "Driver"

### 8. Select List (Multiple Choices)
**Type**: `com.atlassian.jira.plugin.system.customfieldtypes:multiselect`

**Description**: Allows selecting multiple values from a list.

**Rendering**: Renders as a listbox with scrollbar where multiple items can be selected (Ctrl+Click or Shift+Click).

**Usage**:
- Hold Ctrl to select multiple individual items
- Hold Shift to select range of items
- Click selected item to deselect

**How to Configure**:
```python
field_config = {
    'field_type': 'multiselect',
    'allowed_values': ['Red', 'Green', 'Blue', 'Yellow', 'Orange']
}
```

### 9. Select List (Single Choice)
**Type**: `com.atlassian.jira.plugin.system.customfieldtypes:select`

**Description**: Allows selecting one value from a dropdown list.

**Rendering**: Renders as a combobox dropdown menu. User can select exactly one option.

**Usage**:
- Click dropdown to see all options
- Select one option
- Value displayed in closed dropdown

**How to Configure**:
```python
field_config = {
    'field_type': 'select',
    'allowed_values': ['To Do', 'In Progress', 'Done', 'Blocked']
}
```

### 10. Text Field (Multi-line)
**Type**: `com.atlassian.jira.plugin.system.customfieldtypes:textarea`

**Description**: Creates an unlimited text area for long text with many lines.

**Rendering**: Renders as a scrollable text area with word wrap. Height adjustable, supports multiple lines.

**Usage**:
- Enter long text descriptions
- Supports line breaks (Enter key)
- Scrollbar appears when needed
- Word wrapping enabled

**Characteristics**:
- No character limit
- Preserves formatting
- Supports newlines

### 11. Text Field (Single Line)
**Type**: `com.atlassian.jira.plugin.system.customfieldtypes:textfield`

**Description**: Creates a text box for one-line text, max 255 characters including spaces.

**Rendering**: Renders as a single-line text input field.

**Usage**:
- Enter short text (max 255 chars)
- Single line only (no line breaks)
- Suitable for names, titles, short descriptions

**Character Limit**: 255 characters (including spaces)

### 12. URL Field
**Type**: `com.atlassian.jira.plugin.system.customfieldtypes:url`

**Description**: Allows entering and visiting URLs.

**Rendering**: Renders as a text input field with a link icon button (🔗). Clicking the link icon opens the URL in browser.

**Usage**:
- Enter complete URL (e.g., https://example.com)
- Click link icon to open in default browser
- Validates URL format

**URL Format**: Should start with `http://` or `https://`

**Example**: `https://github.com/user/repo`

## Field Type Detection

The system detects field types in the following order:

1. **Custom Type Match**: Checks `schema_custom` for exact JIRA custom field type
2. **Schema Type Match**: Checks `schema_type` for standard types
3. **Field Key Match**: Special handling for known fields (e.g., 'description', 'labels')
4. **Default Fallback**: Uses text field as default

## Implementation Details

### Field Renderer

The `FieldRenderer` class in `jira_tracker/gui/field_renderer.py` handles all field type rendering with JIRA-like styling:

```python
from jira_tracker.gui.field_renderer import FieldRenderer

renderer = FieldRenderer(parent_widget)
renderer.render_field(field, value, row)
```

### JIRA-like Styling

All fields use consistent styling matching Atlassian JIRA:
- **Colors**: JIRA color palette (blues, grays)
- **Fonts**: Segoe UI font family
- **Borders**: Subtle borders with focus states
- **Spacing**: Consistent padding and margins

### Value Retrieval

Get field values after user input:

```python
value = renderer.get_value('field_key')
```

For different field types:
- **Text fields**: Returns string
- **Select lists**: Returns selected value string
- **Multi-select**: Returns list of selected values
- **Checkboxes**: Returns list of checked values
- **Radio buttons**: Returns selected value
- **Cascading select**: Returns dict with 'parent' and 'child'
- **Labels**: Returns list of labels
- **URL**: Returns URL string

## Database Storage

All field types are stored in the `field_types` table with:
- `jira_key`: Unique field identifier
- `name`: Display name
- `field_type`: Base field type
- `schema_type`: Schema type from JIRA
- `schema_custom`: Custom field type identifier
- `custom`: Boolean indicating if custom field

Field configurations stored in `field_configurations` table with:
- `field_type_id`: Reference to field type
- `allowed_values`: JSON array of options
- `default_value`: Default value
- `is_required`: Required field indicator
- `renderer_type`: Rendering hint
- `renderer_config`: Additional rendering configuration

## Testing

Comprehensive tests for field rendering in `tests/test_field_rendering.py`:

```bash
python -m unittest tests.test_field_rendering -v
```

## Examples

See `examples/field_types_demo.py` for working examples of all field types.

## API Integration

The JIRA client automatically fetches field metadata:

```python
from jira_tracker.api.jira_client import JiraClient

client = JiraClient(url, username, token)
fields = client.get_fields()

for field in fields:
    print(f"{field['name']}: {field.get('schema', {}).get('custom', 'standard')}")
```

## Conclusion

This JIRA Issue Tracker system provides complete support for all JIRA Core custom field types with faithful rendering that closely mimics the Atlassian JIRA user interface. Each field type is properly handled with appropriate widgets, validation, and styling.
