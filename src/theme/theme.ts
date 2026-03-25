/**
 * Definición del sistema de temas type-safe
 * Todos los colores y valores se definen aquí
 */

export type ThemeColors = {
  // Backgrounds
  bgPrimary: string;
  bgSecondary: string;
  bgTertiary: string;
  
  // Frames
  frameOuter: string;
  frameInner: string;
  
  // Panels
  panelBg: string;
  panelBorder: string;
  panelBorder2: string;
  
  // Text
  textMain: string;
  textLight: string;
  
  // Accents
  accent: string;
  accent2: string;
  danger: string;
};

export type ThemeSpacing = {
  xs: string;  // 4px
  sm: string;  // 8px
  md: string;  // 12px
  lg: string;  // 16px
  xl: string;  // 24px
};

export type ThemeFontSizes = {
  xs: string;    // 7px
  sm: string;    // 8px
  base: string;  // 9px
  lg: string;    // 10px
  xl: string;    // 12px
  xxl: string;   // 13px
};

export type Theme = {
  name: string;
  colors: ThemeColors;
  spacing: ThemeSpacing;
  fontSizes: ThemeFontSizes;
};

/**
 * Convierte el objeto de tema a variables CSS
 */
export function themeToCSS(theme: Theme): Record<string, string> {
  return {
    // Colors
    "--bg-1": theme.colors.bgPrimary,
    "--bg-2": theme.colors.bgSecondary,
    "--bg-3": theme.colors.bgTertiary,
    "--frame-outer": theme.colors.frameOuter,
    "--frame-inner": theme.colors.frameInner,
    "--panel-bg": theme.colors.panelBg,
    "--panel-border": theme.colors.panelBorder,
    "--panel-border-2": theme.colors.panelBorder2,
    "--text-main": theme.colors.textMain,
    "--text-light": theme.colors.textLight,
    "--accent": theme.colors.accent,
    "--accent-2": theme.colors.accent2,
    "--danger": theme.colors.danger,
    
    // Spacing
    "--spacing-xs": theme.spacing.xs,
    "--spacing-sm": theme.spacing.sm,
    "--spacing-md": theme.spacing.md,
    "--spacing-lg": theme.spacing.lg,
    "--spacing-xl": theme.spacing.xl,
    
    // Font Sizes
    "--font-xs": theme.fontSizes.xs,
    "--font-sm": theme.fontSizes.sm,
    "--font-base": theme.fontSizes.base,
    "--font-lg": theme.fontSizes.lg,
    "--font-xl": theme.fontSizes.xl,
    "--font-xxl": theme.fontSizes.xxl,
  };
}

