import { useReducer } from "react";
import type { UIState, UIAction } from "../types/events";

const initialUIState: UIState = {
  isPaused: false,
  currentSection: null,
  isModalOpen: false,
};

function uiReducer(state: UIState, action: UIAction): UIState {
  switch (action.type) {
    case "OPEN_MODAL":
      return {
        isPaused: true,
        currentSection: action.payload,
        isModalOpen: true,
      };
    case "CLOSE_MODAL":
      return {
        isPaused: false,
        currentSection: null,
        isModalOpen: false,
      };
    default:
      return state;
  }
}

export function useUIState() {
  return useReducer(uiReducer, initialUIState);
}

