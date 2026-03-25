import { useState } from "react";
import { useTheme } from "../theme";
import type { PoiDestination } from "../game/poiConfig";

type InteractionMapProps = {
  points: PoiDestination[];
  mapWidth: number;
  mapHeight: number;
  activePoiId: number | null;
  onSelectPoi: (poiId: number) => void;
  disabled?: boolean;
};

function toPercent(value: number, total: number): string {
  if (!total) {
    return "0%";
  }
  return `${(value / total) * 100}%`;
}

export default function InteractionMap({
  points,
  mapWidth,
  mapHeight,
  activePoiId,
  onSelectPoi,
  disabled,
}: InteractionMapProps) {
  const [isMinimized, setIsMinimized] = useState(true);
  const { currentTheme } = useTheme();
  const mapContentId = "poi-map-content";

  const headerStyle = {
    display: "flex" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    gap: "8px",
    marginBottom: "8px",
  };

  const titleStyle = {
    margin: 0,
    fontSize: currentTheme.fontSizes.sm,
    color: currentTheme.colors.textLight,
    fontFamily: "Press Start 2P, monospace",
  };

  const toggleStyle = {
    fontFamily: "inherit",
    fontSize: currentTheme.fontSizes.xs,
    padding: "5px 7px",
    color: currentTheme.colors.textLight,
    background: currentTheme.colors.frameInner,
    border: `2px solid ${currentTheme.colors.frameOuter}`,
    cursor: "pointer",
    boxShadow: `0 2px 0 ${currentTheme.colors.frameOuter}`,
  };

  const canvasStyle = {
    position: "relative" as const,
    width: "100%",
    aspectRatio: "1 / 1",
    minHeight: "250px",
    background: `radial-gradient(circle at 30% 55%, rgba(${hexToRgb(currentTheme.colors.accent)}, 0.38), transparent 60%), radial-gradient(circle at 67% 40%, rgba(${hexToRgb(currentTheme.colors.panelBorder2)}, 0.34), transparent 55%), ${currentTheme.colors.bgSecondary}`,
    border: `2px solid ${currentTheme.colors.frameInner}`,
    overflow: "hidden" as const,
  };

  const dotStyle = (isActive: boolean) => ({
    position: "absolute" as const,
    transform: "translate(-50%, -86%)",
    minWidth: "48px",
    minHeight: "18px",
    padding: "3px 6px",
    fontFamily: "inherit",
    fontSize: currentTheme.fontSizes.xs,
    color: isActive ? currentTheme.colors.accent2 : currentTheme.colors.textMain,
    background: isActive ? currentTheme.colors.accent : currentTheme.colors.panelBg,
    border: `2px solid ${currentTheme.colors.frameOuter}`,
    boxShadow: `0 0 0 2px rgba(${hexToRgb(currentTheme.colors.frameInner)}, 0.65)`,
    textTransform: "uppercase" as const,
    cursor: "pointer",
    textDecoration: "none",
  });

  return (
    <aside
      className={`poi-map${isMinimized ? " is-minimized" : ""}`}
      aria-label="Mapa de interaccion"
      style={{ background: `rgba(${hexToRgb(currentTheme.colors.bgPrimary)}, 0.95)` }}
    >
      <div style={headerStyle} className="poi-map-header">
        <h3 style={titleStyle} className="poi-map-title">
          Mapa
        </h3>
        <button
          type="button"
          style={toggleStyle}
          className="poi-map-toggle"
          onClick={() => setIsMinimized((prev) => !prev)}
          aria-expanded={!isMinimized}
          aria-controls={mapContentId}
        >
          {isMinimized ? "▼" : "▲"}
        </button>
      </div>

      {!isMinimized && (
        <div id={mapContentId} style={canvasStyle} className="poi-map-canvas">
          {points.map((point) => {
            const isActive = point.id === activePoiId;
            return (
              <button
                key={point.id}
                type="button"
                style={{
                  ...dotStyle(isActive),
                  left: toPercent(point.x, mapWidth),
                  top: toPercent(point.y, mapHeight),
                }}
                className={`poi-map-dot${isActive ? " is-active" : ""}`}
                onClick={() => onSelectPoi(point.id)}
                disabled={disabled}
                aria-label={`Parada de bus: ${point.navLabel}`}
                title={`Parada: ${point.mapLabel}`}
              >
                <span>{point.mapLabel}</span>
              </button>
            );
          })}
        </div>
      )}
    </aside>
  );
}

// Utilidad para convertir hex a rgb string
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return "59, 104, 127";
  return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
}

