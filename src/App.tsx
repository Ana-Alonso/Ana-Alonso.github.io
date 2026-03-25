import GameContainer from "./components/GameContainer";
import InteractionMap from "./components/InteractionMap";
import MobileControls from "./components/MobileControls";
import TravelLoadingOverlay from "./components/TravelLoadingOverlay";
import UIModal from "./components/UIModal";
import { ThemeSwitcher } from "./components/ThemeSwitcher";
import { useAppController } from "./app/useAppController";
import "./styles/retro-ui.css";

export default function App() {
  const {
    uiState,
    hudMessage,
    activePoiId,
    isTraveling,
    travelTarget,
    handleGameReady,
    handleSelectPoi,
    closeModal,
    points,
    mapWidth,
    mapHeight,
  } = useAppController();

  return (
    <main className="app-shell">
      <ThemeSwitcher />

      <section className="game-frame">
        <GameContainer onGameReady={handleGameReady} />
        <InteractionMap
          points={points}
          mapWidth={mapWidth}
          mapHeight={mapHeight}
          activePoiId={activePoiId}
          onSelectPoi={handleSelectPoi}
          disabled={isTraveling}
        />
        {hudMessage && <div className="pixel-hud">{hudMessage}</div>}
        <MobileControls disabled={isTraveling || uiState.isModalOpen} />
      </section>

      {isTraveling && travelTarget && (
        <TravelLoadingOverlay destinationLabel={travelTarget.navLabel} />
      )}

      {uiState.isModalOpen && uiState.currentSection && (
        <UIModal
          section={uiState.currentSection}
          onClose={closeModal}
        />
      )}
    </main>
  );
}
