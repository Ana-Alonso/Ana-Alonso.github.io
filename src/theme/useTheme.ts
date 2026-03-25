import { useContext } from "react";
import { ThemeContext } from "./ThemeProvider";

export function useTheme() {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error("useTheme debe usarse dentro de un ThemeProvider");
  }

  return context;
}

