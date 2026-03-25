export type CollisionArea = {
  id?: string;
  group?: "water" | "building" | "forest" | string;
  x: number;
  y: number;
  width: number;
  height: number;
  type?: string;
};

export type RawCollisionArea = {
  x: number;
  y: number;
  w: number;
  h: number;
  tipo?: string;
  fuente?: string;
};


export type RawColisionesData = {
  colisiones: RawCollisionArea[];
  por_tipo: Record<string, RawCollisionArea[]>;
};


export type MapPoiType = "spawn_point" | "interest_point" | string;

export type MapPoiPoint = {
  id: number;
  type: MapPoiType;
  x: number;
  y: number;
};

export type MapPoiMetadata = {
  file: string;
  width: number;
  height: number;
  total_points: number;
  generated_at: string;
};

export type MapPoiData = {
  map_metadata: MapPoiMetadata;
  points: MapPoiPoint[];
};

