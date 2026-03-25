import { MAP_ASSETS } from "../assets/map";
import type { MapPoiData } from "../types";

export type PoiSection = "Casa" | "Universidad" | "Fábrica" | "Cabina";

export type PoiDestination = {
  id: number;
  section: PoiSection;
  navLabel: string;
  mapLabel: string;
  x: number;
  y: number;
};

const poiData = MAP_ASSETS.poiPointsRaw as MapPoiData;

const SECTION_BY_POI_ID: Record<number, PoiSection> = {
  0: "Casa",
  1: "Universidad",
  2: "Fábrica",
  3: "Cabina",
};

const NAV_LABEL_BY_POI_ID: Record<number, string> = {
  0: "Casa",
  1: "Formación",
  2: "Skills",
  3: "Contacto",
};

const MAP_LABEL_BY_POI_ID: Record<number, string> = {
  0: "Casa",
  1: "Uni",
  2: "Skills",
  3: "Contacto",
};

export const POI_MAP_WIDTH = poiData.map_metadata.width;
export const POI_MAP_HEIGHT = poiData.map_metadata.height;

export const POI_DESTINATIONS: PoiDestination[] = poiData.points
  .filter((point) => SECTION_BY_POI_ID[point.id])
  .map((point) => ({
    id: point.id,
    section: SECTION_BY_POI_ID[point.id],
    navLabel: NAV_LABEL_BY_POI_ID[point.id] || SECTION_BY_POI_ID[point.id],
    mapLabel: MAP_LABEL_BY_POI_ID[point.id] || SECTION_BY_POI_ID[point.id],
    x: point.x,
    y: point.y,
  }));

export const DEFAULT_SPAWN_POI_ID = 0;

export function getPoiDestinationById(id: number): PoiDestination | undefined {
  return POI_DESTINATIONS.find((poi) => poi.id === id);
}

