import { ReactNode, useEffect, useRef } from "react";
import { useTheme } from "../theme";

type PixelModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
};

export function PixelModal({ isOpen, onClose, title, children }: PixelModalProps) {
  const { currentTheme } = useTheme();
  const openedAtRef = useRef(0);

  useEffect(() => {
    if (isOpen) {
      openedAtRef.current = Date.now();
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) {
      return;
    }

    // Ignora el primer tap/click residual al abrir el modal desde movil.
    if (Date.now() - openedAtRef.current < 280) {
      return;
    }

    onClose();
  };

  const backdropStyle = {
    position: "fixed" as const,
    inset: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    display: "grid" as const,
    placeItems: "center" as const,
    padding: "16px",
    zIndex: 2000,
  };

  const modalStyle = {
    width: "min(760px, 100%)",
    maxHeight: "min(86vh, 700px)",
    overflow: "auto" as const,
    padding: "18px",
    backgroundColor: currentTheme.colors.panelBg,
    border: `4px solid ${currentTheme.colors.panelBorder}`,
    boxShadow: `0 0 0 4px ${currentTheme.colors.panelBorder2}, 0 0 0 8px ${currentTheme.colors.panelBorder}, 0 12px 0 #433423`,
  };

  const headerStyle = {
    display: "flex" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    gap: "12px",
    marginBottom: "14px",
    paddingBottom: "10px",
    borderBottom: `3px solid ${currentTheme.colors.accent}`,
  };

  return (
    <div 
      style={backdropStyle}
      onClick={handleBackdropClick}
      className="pixel-modal-backdrop"
    >
      <div
        style={modalStyle}
        className="pixel-modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div style={headerStyle} className="pixel-modal-header">
          <h2>{title}</h2>
          <button
            type="button"
            className="pixel-btn"
            onClick={onClose}
            aria-label="Cerrar modal"
          >
            Cerrar
          </button>
        </div>
        <div className="pixel-modal-content">{children}</div>
      </div>
    </div>
  );
}
