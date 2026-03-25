import { createContext, ReactNode, useCallback, useEffect, useState } from "react";
import type { Theme } from "./theme";
import { themeToCSS } from "./theme";
import { THEMES, type ThemeName } from "./presets";

type ThemeContextType = {
  currentTheme: Theme;
  themeName: ThemeName;
  setTheme: (name: ThemeName) => void;
};

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

type ThemeProviderProps = {
  children: ReactNode;
  defaultTheme?: ThemeName;
};

export function ThemeProvider({ children, defaultTheme = "retro" }: ThemeProviderProps) {
  const [themeName, setThemeState] = useState<ThemeName>(defaultTheme);

  const currentTheme = THEMES[themeName];

  const setTheme = useCallback((name: ThemeName) => {
    setThemeState(name);
    localStorage.setItem("theme", name);
  }, []);

  useEffect(() => {
    const cssVars = themeToCSS(currentTheme);
    const root = document.documentElement;

    Object.entries(cssVars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  }, [currentTheme]);

  // Cargar tema guardado en localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as ThemeName | null;
    if (savedTheme && savedTheme in THEMES) {
      setTheme(savedTheme);
    }
  }, [setTheme]);

  return (
    <ThemeContext.Provider value={{ currentTheme, themeName, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

