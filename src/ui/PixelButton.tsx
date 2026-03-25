import { ButtonHTMLAttributes, ReactNode } from "react";
import { useTheme } from "../theme";

type PixelButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "danger" | "ghost";
};

export function PixelButton({
  children,
  variant = "primary",
  className = "",
  ...props
}: PixelButtonProps) {
  const { currentTheme } = useTheme();

  const baseClass = "pixel-btn";
  const variantClass = variant ? `pixel-btn--${variant}` : "";
  const finalClass = `${baseClass} ${variantClass} ${className}`.trim();

  const buttonStyles = {
    primary: {
      backgroundColor: currentTheme.colors.danger,
      borderColor: currentTheme.colors.danger,
      color: currentTheme.colors.textLight,
    },
    danger: {
      backgroundColor: currentTheme.colors.danger,
      borderColor: currentTheme.colors.danger,
      color: currentTheme.colors.textLight,
    },
    ghost: {
      backgroundColor: "transparent",
      borderColor: currentTheme.colors.frameInner,
      color: currentTheme.colors.textLight,
    },
  };

  return (
    <button 
      className={finalClass} 
      style={buttonStyles[variant]}
      {...props}
    >
      {children}
    </button>
  );
}

