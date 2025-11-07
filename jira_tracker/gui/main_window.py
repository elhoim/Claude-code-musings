"""Main window for JIRA tracker application."""

import tkinter as tk
from tkinter import ttk, messagebox, scrolledtext
from typing import Optional, Dict, Any, List
import json

from ..database.db_manager import DatabaseManager
from ..models.issue import Issue
from ..models.workflow import Workflow
from ..models.field import Field, FieldType, FieldConfiguration
from .field_renderer import FieldRenderer


class MainWindow:
    """Main application window for JIRA tracker."""

    def __init__(self, db_path: str = "jira_tracker.db"):
        """
        Initialize main window.

        Args:
            db_path: Path to SQLite database
        """
        self.db_manager = DatabaseManager(db_path)

        # Create main window
        self.root = tk.Tk()
        self.root.title("JIRA Issue Tracker")
        self.root.geometry("1200x800")

        # Configure style
        self._configure_style()

        # Create menu bar
        self._create_menu()

        # Create main layout
        self._create_layout()

        # Load initial data
        self.load_projects()

    def _configure_style(self):
        """Configure application styling."""
        style = ttk.Style()
        style.theme_use('clam')

        # Configure colors similar to JIRA
        self.root.configure(bg='#F4F5F7')

        style.configure(
            'TButton',
            background='#0052CC',
            foreground='white',
            borderwidth=0,
            padding=10
        )

        style.configure(
            'TLabel',
            background='#F4F5F7',
            foreground='#172B4D',
            font=('Segoe UI', 10)
        )

        style.configure(
            'Header.TLabel',
            font=('Segoe UI', 14, 'bold'),
            foreground='#172B4D'
        )

    def _create_menu(self):
        """Create menu bar."""
        menubar = tk.Menu(self.root)
        self.root.config(menu=menubar)

        # File menu
        file_menu = tk.Menu(menubar, tearoff=0)
        menubar.add_cascade(label="File", menu=file_menu)
        file_menu.add_command(label="Import from JIRA", command=self.show_import_dialog)
        file_menu.add_separator()
        file_menu.add_command(label="Exit", command=self.root.quit)

        # View menu
        view_menu = tk.Menu(menubar, tearoff=0)
        menubar.add_cascade(label="View", menu=view_menu)
        view_menu.add_command(label="Projects", command=self.show_projects_view)
        view_menu.add_command(label="Workflows", command=self.show_workflows_view)
        view_menu.add_command(label="Fields", command=self.show_fields_view)

        # Help menu
        help_menu = tk.Menu(menubar, tearoff=0)
        menubar.add_cascade(label="Help", menu=help_menu)
        help_menu.add_command(label="About", command=self.show_about)

    def _create_layout(self):
        """Create main layout."""
        # Create paned window
        self.paned = tk.PanedWindow(
            self.root,
            orient=tk.HORIZONTAL,
            sashwidth=5,
            bg='#DFE1E6'
        )
        self.paned.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)

        # Left panel - Project/Issue list
        self.left_panel = tk.Frame(self.paned, bg='white', width=300)
        self._create_left_panel()
        self.paned.add(self.left_panel)

        # Right panel - Issue details
        self.right_panel = tk.Frame(self.paned, bg='white')
        self._create_right_panel()
        self.paned.add(self.right_panel)

    def _create_left_panel(self):
        """Create left panel with project and issue list."""
        # Header
        header = ttk.Label(
            self.left_panel,
            text="Projects & Issues",
            style='Header.TLabel'
        )
        header.pack(fill=tk.X, padx=10, pady=10)

        # Project selector
        project_frame = tk.Frame(self.left_panel, bg='white')
        project_frame.pack(fill=tk.X, padx=10, pady=5)

        ttk.Label(project_frame, text="Project:").pack(side=tk.LEFT, padx=(0, 5))

        self.project_combo = ttk.Combobox(
            project_frame,
            state='readonly',
            width=20
        )
        self.project_combo.pack(side=tk.LEFT, fill=tk.X, expand=True)
        self.project_combo.bind('<<ComboboxSelected>>', self.on_project_selected)

        # Issue list
        list_frame = tk.Frame(self.left_panel, bg='white')
        list_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=5)

        # Search box
        search_frame = tk.Frame(list_frame, bg='white')
        search_frame.pack(fill=tk.X, pady=(0, 5))

        ttk.Label(search_frame, text="Search:").pack(side=tk.LEFT, padx=(0, 5))

        self.search_var = tk.StringVar()
        self.search_entry = tk.Entry(
            search_frame,
            textvariable=self.search_var,
            font=('Segoe UI', 10)
        )
        self.search_entry.pack(side=tk.LEFT, fill=tk.X, expand=True)
        self.search_var.trace('w', self.on_search_changed)

        # Issue listbox
        self.issue_listbox = tk.Listbox(
            list_frame,
            font=('Segoe UI', 10),
            bg='white',
            fg='#172B4D',
            selectmode=tk.SINGLE
        )
        self.issue_listbox.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        self.issue_listbox.bind('<<ListboxSelect>>', self.on_issue_selected)

        scrollbar = tk.Scrollbar(list_frame, orient=tk.VERTICAL)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)

        self.issue_listbox.config(yscrollcommand=scrollbar.set)
        scrollbar.config(command=self.issue_listbox.yview)

    def _create_right_panel(self):
        """Create right panel with issue details."""
        # Header
        header_frame = tk.Frame(self.right_panel, bg='white')
        header_frame.pack(fill=tk.X, padx=10, pady=10)

        self.issue_key_label = ttk.Label(
            header_frame,
            text="Select an issue",
            style='Header.TLabel'
        )
        self.issue_key_label.pack(side=tk.LEFT)

        # Status badge
        self.status_label = tk.Label(
            header_frame,
            text="",
            font=('Segoe UI', 9, 'bold'),
            bg='#DFE1E6',
            fg='#172B4D',
            padx=10,
            pady=5
        )
        self.status_label.pack(side=tk.RIGHT)

        # Separator
        ttk.Separator(self.right_panel, orient=tk.HORIZONTAL).pack(
            fill=tk.X,
            padx=10,
            pady=5
        )

        # Scrollable content area
        canvas = tk.Canvas(self.right_panel, bg='white', highlightthickness=0)
        scrollbar = tk.Scrollbar(
            self.right_panel,
            orient=tk.VERTICAL,
            command=canvas.yview
        )

        self.content_frame = tk.Frame(canvas, bg='white')

        self.content_frame.bind(
            "<Configure>",
            lambda e: canvas.configure(scrollregion=canvas.bbox("all"))
        )

        canvas.create_window((0, 0), window=self.content_frame, anchor="nw")
        canvas.configure(yscrollcommand=scrollbar.set)

        canvas.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)

        # Bind mouse wheel
        canvas.bind_all("<MouseWheel>", lambda e: canvas.yview_scroll(
            int(-1 * (e.delta / 120)), "units"
        ))

    def load_projects(self):
        """Load projects into the combo box."""
        projects = self.db_manager.get_all_projects()

        self.projects = {p['key']: p for p in projects}

        self.project_combo['values'] = [p['key'] for p in projects]

        if projects:
            self.project_combo.current(0)
            self.on_project_selected(None)

    def on_project_selected(self, event):
        """Handle project selection."""
        project_key = self.project_combo.get()
        if not project_key or project_key not in self.projects:
            return

        project = self.projects[project_key]
        self.load_issues(project['id'])

    def load_issues(self, project_id: int):
        """Load issues for a project."""
        self.issues = self.db_manager.get_issues_by_project(project_id)

        self.issue_listbox.delete(0, tk.END)

        for issue in self.issues:
            display = f"{issue['key']} - {issue['summary']}"
            self.issue_listbox.insert(tk.END, display)

    def on_search_changed(self, *args):
        """Handle search text change."""
        search_text = self.search_var.get().lower()

        if not search_text:
            self.issue_listbox.delete(0, tk.END)
            for issue in self.issues:
                display = f"{issue['key']} - {issue['summary']}"
                self.issue_listbox.insert(tk.END, display)
            return

        self.issue_listbox.delete(0, tk.END)

        for issue in self.issues:
            if (search_text in issue['key'].lower() or
                search_text in issue['summary'].lower()):
                display = f"{issue['key']} - {issue['summary']}"
                self.issue_listbox.insert(tk.END, display)

    def on_issue_selected(self, event):
        """Handle issue selection."""
        selection = self.issue_listbox.curselection()
        if not selection:
            return

        index = selection[0]
        issue_key = self.issue_listbox.get(index).split(' - ')[0]

        # Find issue in loaded issues
        issue = None
        for iss in self.issues:
            if iss['key'] == issue_key:
                issue = iss
                break

        if issue:
            self.display_issue(issue)

    def display_issue(self, issue: Dict[str, Any]):
        """Display issue details."""
        # Clear content frame
        for widget in self.content_frame.winfo_children():
            widget.destroy()

        # Update header
        self.issue_key_label.config(text=f"{issue['key']}")
        self.status_label.config(text=issue['status_name'])

        # Create field renderer
        renderer = FieldRenderer(self.content_frame)

        row = 0

        # Summary
        summary_field = Field(
            field_type=FieldType(
                id=0,
                jira_key='summary',
                name='Summary',
                description='Issue summary',
                field_type='string',
                custom=False,
                orderable=True,
                navigable=True,
                searchable=True,
                schema_type='string',
                schema_items=None,
                schema_system=None,
                schema_custom=None,
                schema_custom_id=None
            ),
            configuration=FieldConfiguration(
                id=0,
                field_type_id=0,
                project_id=issue['project_id'],
                issue_type_id=issue['issue_type_id'],
                is_required=True,
                is_visible=True,
                default_value=None,
                allowed_values=None,
                renderer_type='text',
                renderer_config=None
            )
        )
        renderer.render_field(summary_field, issue['summary'], row)
        row += 1

        # Description
        desc_field = Field(
            field_type=FieldType(
                id=1,
                jira_key='description',
                name='Description',
                description='Detailed description',
                field_type='string',
                custom=False,
                orderable=True,
                navigable=True,
                searchable=True,
                schema_type='string',
                schema_items=None,
                schema_system=None,
                schema_custom=None,
                schema_custom_id=None
            )
        )
        renderer.render_field(desc_field, issue['description'], row)
        row += 1

        # Priority
        priority_field = Field(
            field_type=FieldType(
                id=2,
                jira_key='priority',
                name='Priority',
                description='Issue priority',
                field_type='option',
                custom=False,
                orderable=True,
                navigable=True,
                searchable=True,
                schema_type='priority',
                schema_items=None,
                schema_system=None,
                schema_custom=None,
                schema_custom_id=None
            ),
            configuration=FieldConfiguration(
                id=2,
                field_type_id=2,
                project_id=issue['project_id'],
                issue_type_id=issue['issue_type_id'],
                is_required=False,
                is_visible=True,
                default_value=None,
                allowed_values=json.dumps([
                    'Highest', 'High', 'Medium', 'Low', 'Lowest'
                ]),
                renderer_type='select',
                renderer_config=None
            )
        )
        renderer.render_field(priority_field, issue['priority'], row)
        row += 1

        # Assignee
        assignee_field = Field(
            field_type=FieldType(
                id=3,
                jira_key='assignee',
                name='Assignee',
                description='Person assigned to this issue',
                field_type='user',
                custom=False,
                orderable=True,
                navigable=True,
                searchable=True,
                schema_type='user',
                schema_items=None,
                schema_system=None,
                schema_custom=None,
                schema_custom_id=None
            )
        )
        renderer.render_field(assignee_field, issue['assignee'], row)
        row += 1

        # Reporter
        reporter_field = Field(
            field_type=FieldType(
                id=4,
                jira_key='reporter',
                name='Reporter',
                description='Person who reported this issue',
                field_type='user',
                custom=False,
                orderable=True,
                navigable=True,
                searchable=True,
                schema_type='user',
                schema_items=None,
                schema_system=None,
                schema_custom=None,
                schema_custom_id=None
            )
        )
        renderer.render_field(reporter_field, issue['reporter'], row)
        row += 1

        # Additional info
        info_frame = tk.Frame(self.content_frame, bg='white')
        info_frame.grid(row=row, column=0, sticky='ew', padx=10, pady=10)

        info_text = f"""
Created: {issue.get('created_date', 'N/A')}
Updated: {issue.get('updated_date', 'N/A')}
Type: {issue.get('issue_type_name', 'N/A')}
        """.strip()

        info_label = tk.Label(
            info_frame,
            text=info_text,
            font=('Segoe UI', 9),
            fg='#6B778C',
            bg='white',
            justify=tk.LEFT
        )
        info_label.pack(anchor='w')

    def show_import_dialog(self):
        """Show import dialog."""
        dialog = tk.Toplevel(self.root)
        dialog.title("Import from JIRA")
        dialog.geometry("400x250")
        dialog.transient(self.root)
        dialog.grab_set()

        ttk.Label(dialog, text="JIRA URL:").grid(
            row=0, column=0, padx=10, pady=10, sticky='w'
        )
        url_entry = ttk.Entry(dialog, width=40)
        url_entry.grid(row=0, column=1, padx=10, pady=10)

        ttk.Label(dialog, text="Username:").grid(
            row=1, column=0, padx=10, pady=10, sticky='w'
        )
        user_entry = ttk.Entry(dialog, width=40)
        user_entry.grid(row=1, column=1, padx=10, pady=10)

        ttk.Label(dialog, text="API Token:").grid(
            row=2, column=0, padx=10, pady=10, sticky='w'
        )
        token_entry = ttk.Entry(dialog, width=40, show='*')
        token_entry.grid(row=2, column=1, padx=10, pady=10)

        def do_import():
            url = url_entry.get()
            username = user_entry.get()
            token = token_entry.get()

            if not all([url, username, token]):
                messagebox.showerror("Error", "All fields are required")
                return

            dialog.destroy()
            messagebox.showinfo(
                "Import",
                "Import functionality would start here.\n"
                "This would use the JiraImporter class to fetch data."
            )

        ttk.Button(dialog, text="Import", command=do_import).grid(
            row=3, column=0, columnspan=2, pady=20
        )

    def show_projects_view(self):
        """Show projects view."""
        projects = self.db_manager.get_all_projects()

        info = "Projects:\n\n"
        for p in projects:
            info += f"{p['key']}: {p['name']}\n"

        messagebox.showinfo("Projects", info if projects else "No projects found")

    def show_workflows_view(self):
        """Show workflows view."""
        workflows = self.db_manager.get_all_workflows()

        info = "Workflows:\n\n"
        for w in workflows:
            info += f"{w['name']}\n"

        messagebox.showinfo("Workflows", info if workflows else "No workflows found")

    def show_fields_view(self):
        """Show fields view."""
        fields = self.db_manager.get_all_field_types()

        info = "Field Types:\n\n"
        for f in fields[:20]:  # Limit to first 20
            info += f"{f['name']} ({f['field_type']})\n"

        if len(fields) > 20:
            info += f"\n... and {len(fields) - 20} more"

        messagebox.showinfo("Fields", info if fields else "No fields found")

    def show_about(self):
        """Show about dialog."""
        messagebox.showinfo(
            "About",
            "JIRA Issue Tracker v1.0\n\n"
            "A Python-based issue tracking system that imports\n"
            "workflows, transitions, and field types from\n"
            "Atlassian JIRA with multiprocessing support."
        )

    def run(self):
        """Start the application."""
        self.root.mainloop()
