import React, { createContext, useContext } from 'react';
import { defaultTheme, type Theme } from './tokens';

export {
  colors,
  spacing,
  fontSizes,
  borderRadius,
  shadows,
  defaultTheme,
  type Theme,
  type Colors,
  type Spacing,
  type FontSizes,
  type BorderRadius,
  type Shadows,
} from './tokens';

const ThemeContext = createContext<Theme>(defaultTheme);

export interface ThemeProviderProps {
  theme?: Theme;
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  theme = defaultTheme,
  children,
}) => {
  return React.createElement(ThemeContext.Provider, { value: theme }, children);
};

export const useTheme = (): Theme => {
  return useContext(ThemeContext);
};
