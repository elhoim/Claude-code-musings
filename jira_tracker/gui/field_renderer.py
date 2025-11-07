"""Field renderer for displaying JIRA fields with similar styling."""

import tkinter as tk
from tkinter import ttk, scrolledtext
from typing import Any, Dict, Optional, Callable
import json
from datetime import datetime
from ..models.field import Field, FieldType


class FieldRenderer:
    """Renders JIRA fields with styling similar to Atlassian JIRA."""

    # JIRA-like color scheme
    COLORS = {
        'bg': '#FFFFFF',
        'bg_secondary': '#F4F5F7',
        'border': '#DFE1E6',
        'border_focus': '#4C9AFF',
        'text': '#172B4D',
        'text_secondary': '#6B778C',
        'label': '#42526E',
        'required': '#DE350B',
        'button': '#0052CC',
        'button_hover': '#0065FF',
        'success': '#00875A',
        'warning': '#FF991F',
        'error': '#DE350B',
    }

    # JIRA-like fonts
    FONTS = {
        'label': ('Segoe UI', 10, 'bold'),
        'field': ('Segoe UI', 10),
        'small': ('Segoe UI', 9),
        'heading': ('Segoe UI', 12, 'bold'),
    }

    def __init__(self, parent: tk.Widget, on_change: Optional[Callable] = None):
        """
        Initialize field renderer.

        Args:
            parent: Parent widget
            on_change: Callback function when field value changes
        """
        self.parent = parent
        self.on_change = on_change
        self.widgets = {}

    def render_field(
        self,
        field: Field,
        value: Any = None,
        row: int = 0
    ) -> Dict[str, tk.Widget]:
        """
        Render a field based on its type.

        Args:
            field: Field to render
            value: Current field value
            row: Grid row position

        Returns:
            Dictionary of created widgets
        """
        field_type = field.field_type
        config = field.configuration

        # Create frame for field
        frame = tk.Frame(self.parent, bg=self.COLORS['bg'])
        frame.grid(row=row, column=0, sticky='ew', padx=10, pady=5)
        frame.columnconfigure(0, weight=1)

        # Create label
        label_text = field_type.name
        if config and config.is_required:
            label_text += ' *'

        label = tk.Label(
            frame,
            text=label_text,
            font=self.FONTS['label'],
            fg=self.COLORS['label'],
            bg=self.COLORS['bg'],
            anchor='w'
        )
        label.grid(row=0, column=0, sticky='w', pady=(0, 5))

        # Add description if available
        if field_type.description:
            desc = tk.Label(
                frame,
                text=field_type.description,
                font=self.FONTS['small'],
                fg=self.COLORS['text_secondary'],
                bg=self.COLORS['bg'],
                anchor='w',
                wraplength=400
            )
            desc.grid(row=1, column=0, sticky='w', pady=(0, 5))

        # Render field based on type
        field_widget = None
        schema_type = field_type.schema_type or field_type.field_type
        custom_type = field_type.schema_custom

        # Get allowed values from config
        allowed_values = []
        if config and config.allowed_values:
            try:
                allowed_values = json.loads(config.allowed_values)
            except:
                pass

        # Handle custom field types
        if custom_type == 'com.atlassian.jira.plugin.system.customfieldtypes:checkbox' or \
           schema_type == 'checkbox':
            # Checkboxes - multiple selection
            field_widget = self._render_checkboxes(frame, value, allowed_values, 2)

        elif custom_type == 'com.atlassian.jira.plugin.system.customfieldtypes:datepicker' or \
             schema_type == 'date':
            # Date picker
            field_widget = self._render_date_field(frame, value, 2)

        elif custom_type == 'com.atlassian.jira.plugin.system.customfieldtypes:datetime' or \
             schema_type == 'datetime':
            # Date time picker
            field_widget = self._render_datetime_field(frame, value, 2)

        elif custom_type == 'com.atlassian.jira.plugin.system.customfieldtypes:labels' or \
             field_type.jira_key == 'labels':
            # Labels - multiple values
            field_widget = self._render_labels_field(frame, value, 2)

        elif custom_type == 'com.atlassian.jira.plugin.system.customfieldtypes:float' or \
             schema_type in ['number', 'integer', 'float']:
            # Number field
            field_widget = self._render_number_field(frame, value, 2)

        elif custom_type == 'com.atlassian.jira.plugin.system.customfieldtypes:radiobuttons':
            # Radio buttons - single selection
            field_widget = self._render_radio_buttons(frame, value, allowed_values, 2)

        elif custom_type == 'com.atlassian.jira.plugin.system.customfieldtypes:cascadingselect':
            # Cascading select - parent-child selection
            field_widget = self._render_cascading_select(frame, value, allowed_values, 2)

        elif custom_type == 'com.atlassian.jira.plugin.system.customfieldtypes:multiselect' or \
             (schema_type == 'array' and 'option' in str(field_type.schema_items)):
            # Select list (multiple choices)
            field_widget = self._render_multi_select(frame, value, allowed_values, 2)

        elif custom_type == 'com.atlassian.jira.plugin.system.customfieldtypes:select' or \
             schema_type in ['option', 'priority', 'status']:
            # Select list (single choice)
            field_widget = self._render_select(frame, value, allowed_values, 2)

        elif custom_type == 'com.atlassian.jira.plugin.system.customfieldtypes:textarea' or \
             field_type.jira_key == 'description':
            # Text field (multi-line)
            field_widget = self._render_textarea(frame, value, 2)

        elif custom_type == 'com.atlassian.jira.plugin.system.customfieldtypes:textfield' or \
             schema_type in ['string', 'text']:
            # Text field (single line)
            field_widget = self._render_textfield(frame, value, 2)

        elif custom_type == 'com.atlassian.jira.plugin.system.customfieldtypes:url':
            # URL field
            field_widget = self._render_url_field(frame, value, 2)

        elif schema_type == 'user':
            field_widget = self._render_user_field(frame, value, 2)

        elif schema_type == 'array':
            field_widget = self._render_multi_select(frame, value, allowed_values, 2)

        else:
            # Default to text field
            field_widget = self._render_textfield(frame, value, 2)

        # Store widget reference
        self.widgets[field_type.jira_key] = {
            'frame': frame,
            'label': label,
            'field': field_widget,
            'field_type': field_type,
        }

        return self.widgets[field_type.jira_key]

    def _render_textfield(
        self,
        parent: tk.Widget,
        value: Any,
        row: int
    ) -> tk.Entry:
        """Render a single-line text field."""
        entry = tk.Entry(
            parent,
            font=self.FONTS['field'],
            fg=self.COLORS['text'],
            bg=self.COLORS['bg'],
            relief=tk.SOLID,
            borderwidth=1,
            highlightthickness=1,
            highlightbackground=self.COLORS['border'],
            highlightcolor=self.COLORS['border_focus']
        )
        entry.grid(row=row, column=0, sticky='ew', pady=(0, 5))

        if value:
            entry.insert(0, str(value))

        if self.on_change:
            entry.bind('<KeyRelease>', lambda e: self.on_change())

        return entry

    def _render_textarea(
        self,
        parent: tk.Widget,
        value: Any,
        row: int
    ) -> scrolledtext.ScrolledText:
        """Render a multi-line text area."""
        text = scrolledtext.ScrolledText(
            parent,
            font=self.FONTS['field'],
            fg=self.COLORS['text'],
            bg=self.COLORS['bg'],
            relief=tk.SOLID,
            borderwidth=1,
            height=6,
            wrap=tk.WORD,
            highlightthickness=1,
            highlightbackground=self.COLORS['border'],
            highlightcolor=self.COLORS['border_focus']
        )
        text.grid(row=row, column=0, sticky='ew', pady=(0, 5))

        if value:
            text.insert('1.0', str(value))

        if self.on_change:
            text.bind('<KeyRelease>', lambda e: self.on_change())

        return text

    def _render_number_field(
        self,
        parent: tk.Widget,
        value: Any,
        row: int
    ) -> tk.Entry:
        """Render a number field."""
        vcmd = (parent.register(self._validate_number), '%P')

        entry = tk.Entry(
            parent,
            font=self.FONTS['field'],
            fg=self.COLORS['text'],
            bg=self.COLORS['bg'],
            relief=tk.SOLID,
            borderwidth=1,
            validate='key',
            validatecommand=vcmd,
            highlightthickness=1,
            highlightbackground=self.COLORS['border'],
            highlightcolor=self.COLORS['border_focus']
        )
        entry.grid(row=row, column=0, sticky='ew', pady=(0, 5))

        if value is not None:
            entry.insert(0, str(value))

        if self.on_change:
            entry.bind('<KeyRelease>', lambda e: self.on_change())

        return entry

    def _render_date_field(
        self,
        parent: tk.Widget,
        value: Any,
        row: int
    ) -> tk.Frame:
        """Render a date picker field."""
        frame = tk.Frame(parent, bg=self.COLORS['bg'])
        frame.grid(row=row, column=0, sticky='ew', pady=(0, 5))

        entry = tk.Entry(
            frame,
            font=self.FONTS['field'],
            fg=self.COLORS['text'],
            bg=self.COLORS['bg'],
            relief=tk.SOLID,
            borderwidth=1,
            width=15,
            highlightthickness=1,
            highlightbackground=self.COLORS['border'],
            highlightcolor=self.COLORS['border_focus']
        )
        entry.pack(side=tk.LEFT, padx=(0, 5))

        if value:
            if isinstance(value, datetime):
                entry.insert(0, value.strftime('%Y-%m-%d'))
            else:
                entry.insert(0, str(value))

        # Add calendar icon button
        btn = tk.Button(
            frame,
            text='📅',
            font=self.FONTS['field'],
            bg=self.COLORS['bg_secondary'],
            relief=tk.SOLID,
            borderwidth=1,
            padx=5
        )
        btn.pack(side=tk.LEFT)

        if self.on_change:
            entry.bind('<KeyRelease>', lambda e: self.on_change())

        return frame

    def _render_datetime_field(
        self,
        parent: tk.Widget,
        value: Any,
        row: int
    ) -> tk.Frame:
        """Render a datetime picker field."""
        frame = tk.Frame(parent, bg=self.COLORS['bg'])
        frame.grid(row=row, column=0, sticky='ew', pady=(0, 5))

        entry = tk.Entry(
            frame,
            font=self.FONTS['field'],
            fg=self.COLORS['text'],
            bg=self.COLORS['bg'],
            relief=tk.SOLID,
            borderwidth=1,
            width=20,
            highlightthickness=1,
            highlightbackground=self.COLORS['border'],
            highlightcolor=self.COLORS['border_focus']
        )
        entry.pack(side=tk.LEFT, padx=(0, 5))

        if value:
            if isinstance(value, datetime):
                entry.insert(0, value.strftime('%Y-%m-%d %H:%M'))
            else:
                entry.insert(0, str(value))

        btn = tk.Button(
            frame,
            text='📅',
            font=self.FONTS['field'],
            bg=self.COLORS['bg_secondary'],
            relief=tk.SOLID,
            borderwidth=1,
            padx=5
        )
        btn.pack(side=tk.LEFT)

        if self.on_change:
            entry.bind('<KeyRelease>', lambda e: self.on_change())

        return frame

    def _render_select(
        self,
        parent: tk.Widget,
        value: Any,
        options: list,
        row: int
    ) -> ttk.Combobox:
        """Render a select dropdown."""
        # Extract option values
        option_values = []
        if options:
            for opt in options:
                if isinstance(opt, dict):
                    option_values.append(opt.get('value', opt.get('name', str(opt))))
                else:
                    option_values.append(str(opt))

        combo = ttk.Combobox(
            parent,
            font=self.FONTS['field'],
            values=option_values,
            state='readonly'
        )
        combo.grid(row=row, column=0, sticky='ew', pady=(0, 5))

        if value:
            if isinstance(value, dict):
                value = value.get('value', value.get('name', ''))
            combo.set(str(value))

        if self.on_change:
            combo.bind('<<ComboboxSelected>>', lambda e: self.on_change())

        return combo

    def _render_multi_select(
        self,
        parent: tk.Widget,
        value: Any,
        options: list,
        row: int
    ) -> tk.Listbox:
        """Render a multi-select listbox."""
        frame = tk.Frame(parent, bg=self.COLORS['bg'])
        frame.grid(row=row, column=0, sticky='ew', pady=(0, 5))

        listbox = tk.Listbox(
            frame,
            font=self.FONTS['field'],
            fg=self.COLORS['text'],
            bg=self.COLORS['bg'],
            relief=tk.SOLID,
            borderwidth=1,
            selectmode=tk.MULTIPLE,
            height=4,
            highlightthickness=1,
            highlightbackground=self.COLORS['border'],
            highlightcolor=self.COLORS['border_focus']
        )
        listbox.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)

        scrollbar = tk.Scrollbar(frame, orient=tk.VERTICAL)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)

        listbox.config(yscrollcommand=scrollbar.set)
        scrollbar.config(command=listbox.yview)

        # Add options
        option_values = []
        if options:
            for opt in options:
                if isinstance(opt, dict):
                    opt_val = opt.get('value', opt.get('name', str(opt)))
                else:
                    opt_val = str(opt)
                option_values.append(opt_val)
                listbox.insert(tk.END, opt_val)

        # Select values
        if value:
            if isinstance(value, list):
                for item in value:
                    item_str = str(item) if not isinstance(item, dict) else item.get('value', '')
                    if item_str in option_values:
                        idx = option_values.index(item_str)
                        listbox.selection_set(idx)

        if self.on_change:
            listbox.bind('<<ListboxSelect>>', lambda e: self.on_change())

        return listbox

    def _render_checkboxes(
        self,
        parent: tk.Widget,
        value: Any,
        options: list,
        row: int
    ) -> tk.Frame:
        """Render checkboxes for multiple selection."""
        frame = tk.Frame(parent, bg=self.COLORS['bg'])
        frame.grid(row=row, column=0, sticky='ew', pady=(0, 5))

        # Store checkbox variables
        checkbox_vars = []

        # Parse selected values
        selected_values = []
        if value:
            if isinstance(value, list):
                selected_values = [str(v) if not isinstance(v, dict) else v.get('value', '')
                                 for v in value]
            else:
                selected_values = [str(value)]

        # Create checkboxes
        for i, opt in enumerate(options):
            if isinstance(opt, dict):
                opt_val = opt.get('value', opt.get('name', str(opt)))
            else:
                opt_val = str(opt)

            var = tk.BooleanVar(value=(opt_val in selected_values))
            checkbox_vars.append((opt_val, var))

            cb = tk.Checkbutton(
                frame,
                text=opt_val,
                variable=var,
                font=self.FONTS['field'],
                fg=self.COLORS['text'],
                bg=self.COLORS['bg'],
                activebackground=self.COLORS['bg'],
                selectcolor=self.COLORS['bg']
            )
            cb.grid(row=i, column=0, sticky='w', pady=2)

            if self.on_change:
                cb.config(command=self.on_change)

        # Store checkbox vars in frame for later retrieval
        frame.checkbox_vars = checkbox_vars

        return frame

    def _render_radio_buttons(
        self,
        parent: tk.Widget,
        value: Any,
        options: list,
        row: int
    ) -> tk.Frame:
        """Render radio buttons for single selection."""
        frame = tk.Frame(parent, bg=self.COLORS['bg'])
        frame.grid(row=row, column=0, sticky='ew', pady=(0, 5))

        # Variable to store selection
        radio_var = tk.StringVar()

        # Set current value
        if value:
            if isinstance(value, dict):
                radio_var.set(value.get('value', value.get('name', '')))
            else:
                radio_var.set(str(value))

        # Create radio buttons
        for i, opt in enumerate(options):
            if isinstance(opt, dict):
                opt_val = opt.get('value', opt.get('name', str(opt)))
            else:
                opt_val = str(opt)

            rb = tk.Radiobutton(
                frame,
                text=opt_val,
                variable=radio_var,
                value=opt_val,
                font=self.FONTS['field'],
                fg=self.COLORS['text'],
                bg=self.COLORS['bg'],
                activebackground=self.COLORS['bg'],
                selectcolor=self.COLORS['bg']
            )
            rb.grid(row=i, column=0, sticky='w', pady=2)

            if self.on_change:
                rb.config(command=self.on_change)

        # Store radio var in frame for later retrieval
        frame.radio_var = radio_var

        return frame

    def _render_cascading_select(
        self,
        parent: tk.Widget,
        value: Any,
        options: list,
        row: int
    ) -> tk.Frame:
        """Render cascading select with parent-child relationship."""
        frame = tk.Frame(parent, bg=self.COLORS['bg'])
        frame.grid(row=row, column=0, sticky='ew', pady=(0, 5))

        # Parent select
        parent_label = tk.Label(
            frame,
            text="Parent:",
            font=self.FONTS['small'],
            fg=self.COLORS['text_secondary'],
            bg=self.COLORS['bg']
        )
        parent_label.grid(row=0, column=0, sticky='w', pady=(0, 2))

        parent_combo = ttk.Combobox(
            frame,
            font=self.FONTS['field'],
            state='readonly',
            width=30
        )
        parent_combo.grid(row=1, column=0, sticky='ew', pady=(0, 5))

        # Child select
        child_label = tk.Label(
            frame,
            text="Child:",
            font=self.FONTS['small'],
            fg=self.COLORS['text_secondary'],
            bg=self.COLORS['bg']
        )
        child_label.grid(row=2, column=0, sticky='w', pady=(0, 2))

        child_combo = ttk.Combobox(
            frame,
            font=self.FONTS['field'],
            state='readonly',
            width=30
        )
        child_combo.grid(row=3, column=0, sticky='ew')

        # Parse cascading options
        parent_options = {}
        if options:
            for opt in options:
                if isinstance(opt, dict):
                    parent_val = opt.get('value', '')
                    children = opt.get('children', [])
                    parent_options[parent_val] = children

        parent_combo['values'] = list(parent_options.keys())

        def on_parent_change(event):
            """Update child options when parent changes."""
            parent_val = parent_combo.get()
            if parent_val in parent_options:
                children = parent_options[parent_val]
                child_values = [c if isinstance(c, str) else c.get('value', '')
                               for c in children]
                child_combo['values'] = child_values
                child_combo.set('')
            if self.on_change:
                self.on_change()

        parent_combo.bind('<<ComboboxSelected>>', on_parent_change)

        # Set current value
        if value and isinstance(value, dict):
            parent_val = value.get('parent', '')
            child_val = value.get('child', '')
            if parent_val:
                parent_combo.set(parent_val)
                on_parent_change(None)
                if child_val:
                    child_combo.set(child_val)

        if self.on_change:
            child_combo.bind('<<ComboboxSelected>>', lambda e: self.on_change())

        # Store combos in frame
        frame.parent_combo = parent_combo
        frame.child_combo = child_combo

        return frame

    def _render_labels_field(
        self,
        parent: tk.Widget,
        value: Any,
        row: int
    ) -> tk.Frame:
        """Render labels field with tag-like display."""
        frame = tk.Frame(parent, bg=self.COLORS['bg'])
        frame.grid(row=row, column=0, sticky='ew', pady=(0, 5))

        # Entry for adding labels
        entry_frame = tk.Frame(frame, bg=self.COLORS['bg'])
        entry_frame.pack(fill=tk.X)

        entry = tk.Entry(
            entry_frame,
            font=self.FONTS['field'],
            fg=self.COLORS['text'],
            bg=self.COLORS['bg'],
            relief=tk.SOLID,
            borderwidth=1,
            highlightthickness=1,
            highlightbackground=self.COLORS['border'],
            highlightcolor=self.COLORS['border_focus']
        )
        entry.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=(0, 5))

        # Labels container
        labels_frame = tk.Frame(frame, bg=self.COLORS['bg'])
        labels_frame.pack(fill=tk.BOTH, expand=True, pady=(5, 0))

        # Store labels list
        labels_list = []

        def add_label(label_text=None):
            """Add a label tag."""
            text = label_text or entry.get().strip()
            if text and text not in labels_list:
                labels_list.append(text)
                render_labels()
                entry.delete(0, tk.END)
                if self.on_change:
                    self.on_change()

        def remove_label(label_text):
            """Remove a label tag."""
            if label_text in labels_list:
                labels_list.remove(label_text)
                render_labels()
                if self.on_change:
                    self.on_change()

        def render_labels():
            """Render label tags."""
            for widget in labels_frame.winfo_children():
                widget.destroy()

            for label_text in labels_list:
                tag_frame = tk.Frame(
                    labels_frame,
                    bg=self.COLORS['bg_secondary'],
                    relief=tk.SOLID,
                    borderwidth=1
                )
                tag_frame.pack(side=tk.LEFT, padx=2, pady=2)

                label = tk.Label(
                    tag_frame,
                    text=label_text,
                    font=self.FONTS['small'],
                    fg=self.COLORS['text'],
                    bg=self.COLORS['bg_secondary'],
                    padx=5,
                    pady=2
                )
                label.pack(side=tk.LEFT)

                close_btn = tk.Label(
                    tag_frame,
                    text='×',
                    font=('Segoe UI', 10, 'bold'),
                    fg=self.COLORS['text_secondary'],
                    bg=self.COLORS['bg_secondary'],
                    cursor='hand2',
                    padx=5,
                    pady=2
                )
                close_btn.pack(side=tk.LEFT)
                close_btn.bind('<Button-1>', lambda e, t=label_text: remove_label(t))

        add_btn = tk.Button(
            entry_frame,
            text='Add',
            font=self.FONTS['field'],
            bg=self.COLORS['button'],
            fg='white',
            relief=tk.SOLID,
            borderwidth=0,
            padx=10,
            command=add_label
        )
        add_btn.pack(side=tk.LEFT)

        entry.bind('<Return>', lambda e: add_label())

        # Initialize with existing labels
        if value:
            if isinstance(value, list):
                for label in value:
                    label_str = str(label) if not isinstance(label, dict) else label.get('value', '')
                    if label_str:
                        labels_list.append(label_str)
            elif isinstance(value, str):
                labels_list.extend(value.split(','))

        render_labels()

        # Store labels list in frame
        frame.labels_list = labels_list
        frame.entry = entry

        return frame

    def _render_url_field(
        self,
        parent: tk.Widget,
        value: Any,
        row: int
    ) -> tk.Frame:
        """Render URL field with validation and link."""
        frame = tk.Frame(parent, bg=self.COLORS['bg'])
        frame.grid(row=row, column=0, sticky='ew', pady=(0, 5))

        entry = tk.Entry(
            frame,
            font=self.FONTS['field'],
            fg=self.COLORS['text'],
            bg=self.COLORS['bg'],
            relief=tk.SOLID,
            borderwidth=1,
            highlightthickness=1,
            highlightbackground=self.COLORS['border'],
            highlightcolor=self.COLORS['border_focus']
        )
        entry.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=(0, 5))

        if value:
            url_str = value if isinstance(value, str) else value.get('url', '')
            entry.insert(0, url_str)

        # Link icon/button
        link_btn = tk.Label(
            frame,
            text='🔗',
            font=self.FONTS['field'],
            fg=self.COLORS['button'],
            bg=self.COLORS['bg'],
            cursor='hand2'
        )
        link_btn.pack(side=tk.LEFT)

        def open_url(event):
            """Open URL in browser."""
            url = entry.get()
            if url:
                import webbrowser
                try:
                    webbrowser.open(url)
                except:
                    pass

        link_btn.bind('<Button-1>', open_url)

        if self.on_change:
            entry.bind('<KeyRelease>', lambda e: self.on_change())

        return frame

    def _render_user_field(
        self,
        parent: tk.Widget,
        value: Any,
        row: int
    ) -> tk.Frame:
        """Render a user picker field."""
        frame = tk.Frame(parent, bg=self.COLORS['bg'])
        frame.grid(row=row, column=0, sticky='ew', pady=(0, 5))

        # User avatar (simulated with label)
        avatar = tk.Label(
            frame,
            text='👤',
            font=self.FONTS['field'],
            bg=self.COLORS['bg_secondary'],
            width=3,
            relief=tk.SOLID,
            borderwidth=1
        )
        avatar.pack(side=tk.LEFT, padx=(0, 5))

        entry = tk.Entry(
            frame,
            font=self.FONTS['field'],
            fg=self.COLORS['text'],
            bg=self.COLORS['bg'],
            relief=tk.SOLID,
            borderwidth=1,
            highlightthickness=1,
            highlightbackground=self.COLORS['border'],
            highlightcolor=self.COLORS['border_focus']
        )
        entry.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)

        if value:
            if isinstance(value, dict):
                display_name = value.get('displayName', value.get('name', ''))
            else:
                display_name = str(value)
            entry.insert(0, display_name)

        if self.on_change:
            entry.bind('<KeyRelease>', lambda e: self.on_change())

        return frame

    @staticmethod
    def _validate_number(value: str) -> bool:
        """Validate number input."""
        if value == '':
            return True
        try:
            float(value)
            return True
        except ValueError:
            return False

    def get_value(self, field_key: str) -> Any:
        """
        Get the current value of a field.

        Args:
            field_key: Field key

        Returns:
            Current field value
        """
        if field_key not in self.widgets:
            return None

        widget = self.widgets[field_key]['field']

        if isinstance(widget, tk.Entry):
            return widget.get()
        elif isinstance(widget, scrolledtext.ScrolledText):
            return widget.get('1.0', tk.END).strip()
        elif isinstance(widget, ttk.Combobox):
            return widget.get()
        elif isinstance(widget, tk.Listbox):
            return [widget.get(i) for i in widget.curselection()]
        elif isinstance(widget, tk.Frame):
            # For composite widgets, try to find entry
            for child in widget.winfo_children():
                if isinstance(child, tk.Entry):
                    return child.get()

        return None

    def set_value(self, field_key: str, value: Any) -> None:
        """
        Set the value of a field.

        Args:
            field_key: Field key
            value: Value to set
        """
        if field_key not in self.widgets:
            return

        widget = self.widgets[field_key]['field']

        if isinstance(widget, tk.Entry):
            widget.delete(0, tk.END)
            widget.insert(0, str(value) if value is not None else '')
        elif isinstance(widget, scrolledtext.ScrolledText):
            widget.delete('1.0', tk.END)
            widget.insert('1.0', str(value) if value is not None else '')
        elif isinstance(widget, ttk.Combobox):
            widget.set(str(value) if value is not None else '')

    def clear_all(self) -> None:
        """Clear all field values."""
        for field_key in self.widgets:
            self.set_value(field_key, None)
