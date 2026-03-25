/**
 * Presets de temas predefinidos
 */

import type { Theme } from "./theme";

/**
 * Tema retro pixel por defecto (estado actual del CSS)
 */
export const retroTheme: Theme = {
  name: "retro",
  colors: {
    bgPrimary: "#10151d",
    bgSecondary: "#162131",
    bgTertiary: "#0e131b",
    frameOuter: "#0a0f15",
    frameInner: "#3b4e66",
    panelBg: "#f1e5b8",
    panelBorder: "#2d2116",
    panelBorder2: "#7b6140",
    textMain: "#17130f",
    textLight: "#f3f2e4",
    accent: "#2c7a6b",
    accent2: "#18443a",
    danger: "#b0462a",
  },
  spacing: {
    xs: "4px",
    sm: "8px",
    md: "12px",
    lg: "16px",
    xl: "24px",
  },
  fontSizes: {
    xs: "7px",
    sm: "8px",
    base: "9px",
    lg: "10px",
    xl: "12px",
    xxl: "13px",
  },
};

/**
 * Tema retro oscuro (variante más oscura)
 */
export const retroDarkTheme: Theme = {
  name: "retro-dark",
  colors: {
    bgPrimary: "#0a0d12",
    bgSecondary: "#0f1319",
    bgTertiary: "#081018",
    frameOuter: "#050810",
    frameInner: "#2b3e56",
    panelBg: "#1a1a1a",
    panelBorder: "#0f0f0f",
    panelBorder2: "#4a4a4a",
    textMain: "#e8e8e8",
    textLight: "#f3f2e4",
    accent: "#3d9680",
    accent2: "#1f5550",
    danger: "#d05030",
  },
  spacing: {
    xs: "4px",
    sm: "8px",
    md: "12px",
    lg: "16px",
    xl: "24px",
  },
  fontSizes: {
    xs: "7px",
    sm: "8px",
    base: "9px",
    lg: "10px",
    xl: "12px",
    xxl: "13px",
  },
};

/**
 * Tema neon futurista (synthwave)
 */
export const neonTheme: Theme = {
  name: "neon",
  colors: {
    bgPrimary: "#0d0221",
    bgSecondary: "#1a0033",
    bgTertiary: "#0f001f",
    frameOuter: "#050011",
    frameInner: "#3d0066",
    panelBg: "#ff006e",
    panelBorder: "#8f0046",
    panelBorder2: "#fb5607",
    textMain: "#0d0221",
    textLight: "#00f5ff",
    accent: "#00f5ff",
    accent2: "#8338ec",
    danger: "#ff006e",
  },
  spacing: {
    xs: "4px",
    sm: "8px",
    md: "12px",
    lg: "16px",
    xl: "24px",
  },
  fontSizes: {
    xs: "7px",
    sm: "8px",
    base: "9px",
    lg: "10px",
    xl: "12px",
    xxl: "13px",
  },
};

/**
 * Tema claro y limpio
 */
export const lightTheme: Theme = {
  name: "light",
  colors: {
    bgPrimary: "#f5f5f5",
    bgSecondary: "#e8e8e8",
    bgTertiary: "#f0f0f0",
    frameOuter: "#d0d0d0",
    frameInner: "#c0c0c0",
    panelBg: "#ffffff",
    panelBorder: "#333333",
    panelBorder2: "#666666",
    textMain: "#1a1a1a",
    textLight: "#555555",
    accent: "#2c7a6b",
    accent2: "#18443a",
    danger: "#cc3333",
  },
  spacing: {
    xs: "4px",
    sm: "8px",
    md: "12px",
    lg: "16px",
    xl: "24px",
  },
  fontSizes: {
    xs: "7px",
    sm: "8px",
    base: "9px",
    lg: "10px",
    xl: "12px",
    xxl: "13px",
  },
};

/**
 * Tema verde matriz (Matrix/Cyberpunk)
 */
export const matrixTheme: Theme = {
  name: "matrix",
  colors: {
    bgPrimary: "#000000",
    bgSecondary: "#0a0a0a",
    bgTertiary: "#050505",
    frameOuter: "#000000",
    frameInner: "#003300",
    panelBg: "#001100",
    panelBorder: "#003300",
    panelBorder2: "#006600",
    textMain: "#00ff00",
    textLight: "#00ff00",
    accent: "#00ff00",
    accent2: "#00cc00",
    danger: "#ff0000",
  },
  spacing: {
    xs: "4px",
    sm: "8px",
    md: "12px",
    lg: "16px",
    xl: "24px",
  },
  fontSizes: {
    xs: "7px",
    sm: "8px",
    base: "9px",
    lg: "10px",
    xl: "12px",
    xxl: "13px",
  },
};

export const THEMES = {
  retro: retroTheme,
  "retro-dark": retroDarkTheme,
  neon: neonTheme,
  light: lightTheme,
  matrix: matrixTheme,
} as const;

export type ThemeName = keyof typeof THEMES;

