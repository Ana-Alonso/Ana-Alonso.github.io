import { useState } from "react";
import { useTheme, THEMES } from "../theme";
import { PixelButton } from "../ui";

export function ThemeSwitcher() {
  const { themeName, setTheme } = useTheme();
  const themeNames = Object.keys(THEMES) as Array<keyof typeof THEMES>;
  const [isMinimized, setIsMinimized] = useState(true);

  return (
    <div className={`theme-switcher${isMinimized ? " is-minimized" : ""}`}>
      <PixelButton
        variant="ghost"
        onClick={() => setIsMinimized((prev) => !prev)}
        className="theme-switcher-btn theme-switcher-toggle"
        title={isMinimized ? "Mostrar temas" : "Minimizar temas"}
      >
        {isMinimized ? "🎨" : "✕"}
      </PixelButton>

      {!isMinimized &&
        themeNames.map((name) => (
          <PixelButton
            key={name}
            variant={themeName === name ? "primary" : "ghost"}
            onClick={() => setTheme(name)}
            className="theme-switcher-btn"
            title={name}
          >
            {name.charAt(0).toUpperCase()}
          </PixelButton>
        ))}
    </div>
  );
}

