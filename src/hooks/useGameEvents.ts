import { useEffect } from "react";
import type { InteractionHintDetail, OpenUiDetail } from "../types/events";

type OnInteractionHintCallback = (
  message: string | null,
  poiId: number | null
) => void;

export function useInteractionHint(onUpdate: OnInteractionHintCallback) {
  useEffect(() => {
    const onInteractionHint = (event: Event): void => {
      const customEvent = event as CustomEvent<InteractionHintDetail>;
      const section = customEvent.detail?.section;
      const isInteractive = customEvent.detail?.isInteractive;
      const poiId = customEvent.detail?.poiId;

      if (isInteractive && section) {
        onUpdate(
          `Zona: ${section}. Pulsa E/Enter o toca Interactuar en movil.`,
          poiId ?? null
        );
        return;
      }

      onUpdate(null, null);
    };

    window.addEventListener("interaction-hint", onInteractionHint);
    return () => window.removeEventListener("interaction-hint", onInteractionHint);
  }, [onUpdate]);
}

export function useOpenUIEvent(onOpen: (section: string) => void) {
  useEffect(() => {
    const onOpenUi = (event: Event): void => {
      const customEvent = event as CustomEvent<OpenUiDetail>;
      const section = customEvent.detail?.section;
      if (section) {
        onOpen(section);
      }
    };

    window.addEventListener("open-ui", onOpenUi);
    return () => window.removeEventListener("open-ui", onOpenUi);
  }, [onOpen]);
}
