export const colors = {
  primary: {
    default: '#2563EB',
    dark: '#1D4ED8',
  },
  secondary: {
    default: '#10B981',
  },
  accent: {
    default: '#F59E0B',
  },
  background: {
    default: '#FFFFFF',
    subtle: '#F9FAFB',
  },
  surface: {
    default: '#FFFFFF',
  },
  text: {
    default: '#111827',
    secondary: '#4B5563',
    tertiary: '#9CA3AF',
  },
  error: {
    default: '#EF4444',
  },
  success: {
    default: '#22C55E',
  },
  warning: {
    default: '#F59E0B',
  },
  border: {
    default: '#E5E7EB',
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const fontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

export const shadows = {
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardLifted: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
} as const;

export type Colors = typeof colors;
export type Spacing = typeof spacing;
export type FontSizes = typeof fontSizes;
export type BorderRadius = typeof borderRadius;
export type Shadows = typeof shadows;

export interface Theme {
  colors: Colors;
  spacing: Spacing;
  fontSizes: FontSizes;
  borderRadius: BorderRadius;
  shadows: Shadows;
}

export const defaultTheme: Theme = {
  colors,
  spacing,
  fontSizes,
  borderRadius,
  shadows,
};
