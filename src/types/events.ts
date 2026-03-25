export type InteractionHintDetail = {
  isInteractive: boolean;
  section: string | null;
  poiId: number | null;
};

export type OpenUiDetail = {
  section: string;
};

export type TeleportPlayerDetail = {
  poiId: number;
};

export type MobileDirection = "up" | "down" | "left" | "right";

export type TouchMoveDetail = {
  direction: MobileDirection;
  isActive: boolean;
};

export type TouchInteractDetail = {
  requestedAt: number;
};

export type UIState = {
  isPaused: boolean;
  currentSection: string | null;
  isModalOpen: boolean;
};

export type UIAction =
  | { type: "OPEN_MODAL"; payload: string }
  | { type: "CLOSE_MODAL" };

