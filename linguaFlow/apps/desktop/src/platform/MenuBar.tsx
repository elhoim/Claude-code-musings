/**
 * Desktop menu bar integration (Phase 3)
 *
 * Provides native menu bar items for:
 * - File: Import media, Export progress
 * - Edit: Preferences, Keyboard shortcuts
 * - View: Toggle sidebar, Zoom
 * - Learn: Start lesson, Review cards, Practice drill
 * - Help: Documentation, Report issue
 *
 * Implementation will use react-native-windows Menu/MenuBar components
 * and react-native-macos NSMenu integration.
 */

export interface MenuBarConfig {
  items: MenuItem[];
}

export interface MenuItem {
  label: string;
  shortcut?: string;
  action?: () => void;
  submenu?: MenuItem[];
}

export function getDefaultMenuConfig(): MenuBarConfig {
  return {
    items: [
      {
        label: 'File',
        submenu: [
          { label: 'Import Media', shortcut: 'Ctrl+I' },
          { label: 'Export Progress', shortcut: 'Ctrl+E' },
          { label: 'Quit', shortcut: 'Ctrl+Q' },
        ],
      },
      {
        label: 'Learn',
        submenu: [
          { label: 'Continue Story', shortcut: 'Ctrl+Shift+S' },
          { label: 'Review Cards', shortcut: 'Ctrl+R' },
          { label: 'Start Drill', shortcut: 'Ctrl+D' },
          { label: 'Grammar Map', shortcut: 'Ctrl+G' },
        ],
      },
      {
        label: 'Help',
        submenu: [
          { label: 'Documentation' },
          { label: 'Report Issue' },
          { label: 'About LinguaFlow' },
        ],
      },
    ],
  };
}
