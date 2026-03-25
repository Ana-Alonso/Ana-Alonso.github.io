import { useEffect, useState } from "react";
import type { PoiDestination } from "../game/poiConfig";
import { TRAVEL_TELEPORT_MS, TRAVEL_FINISH_MS } from "../constants/timing";
import type { TeleportPlayerDetail } from "../types/events";

export function useTravelState() {
  const [isTraveling, setIsTraveling] = useState(false);
  const [travelTarget, setTravelTarget] = useState<PoiDestination | null>(null);

  useEffect(() => {
    if (!isTraveling || !travelTarget) {
      return;
    }

    const teleportTimer = window.setTimeout(() => {
      const detail: TeleportPlayerDetail = { poiId: travelTarget.id };
      window.dispatchEvent(
        new CustomEvent<TeleportPlayerDetail>("teleport-player", { detail })
      );
    }, TRAVEL_TELEPORT_MS);

    const finishTimer = window.setTimeout(() => {
      setIsTraveling(false);
      setTravelTarget(null);
    }, TRAVEL_FINISH_MS);

    return () => {
      window.clearTimeout(teleportTimer);
      window.clearTimeout(finishTimer);
    };
  }, [isTraveling, travelTarget]);

  return { isTraveling, travelTarget, setIsTraveling, setTravelTarget };
}

