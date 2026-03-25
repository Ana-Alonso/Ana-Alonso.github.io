import { useCallback, useState } from "react";
import Phaser from "phaser";
import {
  DEFAULT_SPAWN_POI_ID,
  getPoiDestinationById,
  POI_DESTINATIONS,
  POI_MAP_HEIGHT,
  POI_MAP_WIDTH,
  type PoiDestination,
} from "../game/poiConfig";
import {
  useGameScenePause,
  useInteractionHint,
  useOpenUIEvent,
  useTravelState,
  useUIState,
} from "../hooks";
import { normalizeSection } from "../utils/section";

type AppControllerViewModel = {
  uiState: ReturnType<typeof useUIState>[0];
  hudMessage: string | null;
  activePoiId: number | null;
  isTraveling: boolean;
  travelTarget: PoiDestination | null;
  handleGameReady: (gameInstance: Phaser.Game) => void;
  handleSelectPoi: (poiId: number) => void;
  closeModal: () => void;
  points: typeof POI_DESTINATIONS;
  mapWidth: number;
  mapHeight: number;
};

export function useAppController(): AppControllerViewModel {
  const [uiState, dispatch] = useUIState();
  const [game, setGame] = useState<Phaser.Game | null>(null);
  const [hudMessage, setHudMessage] = useState<string | null>(null);
  const [activePoiId, setActivePoiId] = useState<number | null>(DEFAULT_SPAWN_POI_ID);
  const { isTraveling, travelTarget, setIsTraveling, setTravelTarget } = useTravelState();

  const handleGameReady = useCallback((gameInstance: Phaser.Game): void => {
    setGame(gameInstance);
  }, []);

  useOpenUIEvent((section) => {
    dispatch({ type: "OPEN_MODAL", payload: normalizeSection(section) });
  });

  useInteractionHint((message, poiId) => {
    setHudMessage(message);
    if (typeof poiId === "number") {
      setActivePoiId(poiId);
    }
  });

  useGameScenePause(game, uiState.isModalOpen);

  const handleSelectPoi = useCallback(
    (poiId: number): void => {
      const destination = getPoiDestinationById(poiId);
      if (!destination || isTraveling) {
        return;
      }

      if (uiState.isModalOpen) {
        dispatch({ type: "CLOSE_MODAL" });
      }

      setHudMessage(null);
      setTravelTarget(destination);
      setIsTraveling(true);
      setActivePoiId(destination.id);
    },
    [dispatch, isTraveling, setIsTraveling, setTravelTarget, uiState.isModalOpen],
  );

  const closeModal = useCallback(() => {
    dispatch({ type: "CLOSE_MODAL" });
  }, [dispatch]);

  return {
    uiState,
    hudMessage,
    activePoiId,
    isTraveling,
    travelTarget,
    handleGameReady,
    handleSelectPoi,
    closeModal,
    points: POI_DESTINATIONS,
    mapWidth: POI_MAP_WIDTH,
    mapHeight: POI_MAP_HEIGHT,
  };
}


