import { ReactNode } from "react";
import { useTheme } from "../theme";

type PixelTextProps = {
  children: ReactNode;
  variant?: "body" | "caption" | "title";
  className?: string;
};

export function PixelText({ children, variant = "body", className = "" }: PixelTextProps) {
  const { currentTheme } = useTheme();
  const variantClass = `pixel-text--${variant}`;

  const textStyle = {
    color: currentTheme.colors.textMain,
    fontFamily: "Press Start 2P, monospace",
    margin: 0,
  };

  const elements = {
    body: (
      <p 
        style={{ ...textStyle, fontSize: currentTheme.fontSizes.base, lineHeight: "1.6" }}
        className={`pixel-text ${variantClass} ${className}`.trim()}
      >
        {children}
      </p>
    ),
    caption: (
      <p 
        style={{ ...textStyle, fontSize: currentTheme.fontSizes.sm, lineHeight: "1.5" }}
        className={`pixel-text ${variantClass} ${className}`.trim()}
      >
        {children}
      </p>
    ),
    title: (
      <h3 
        style={{ ...textStyle, fontSize: currentTheme.fontSizes.xxl, marginBottom: "8px", textTransform: "uppercase" }}
        className={`pixel-text ${variantClass} ${className}`.trim()}
      >
        {children}
      </h3>
    ),
  };

  return elements[variant];
}

