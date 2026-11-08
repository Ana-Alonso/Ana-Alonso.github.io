export interface Region<T> {
  x: number;
  y: number;
  w: number;
  h: number;
  action: T;
  pad?: number;
}

export const MIN_TOUCH_PX = 44;

export function touchPad(minTouchPx: number, w: number, h: number): number {
  const pad = (minTouchPx - Math.min(w, h)) / 2;
  return pad > 0 ? Math.round(pad) : 0;
}

export function hitRegion<T>(
  regions: Region<T>[],
  uv: { x: number; y: number },
  tex: [number, number],
  scroll: number,
): T | null {
  const px = uv.x * tex[0];
  const py = (1 - uv.y) * tex[1];
  const contentY = py + Math.round(scroll);
  const inside = (region: Region<T>, pad: number) =>
    px >= region.x - pad &&
    px <= region.x + region.w + pad &&
    contentY >= region.y - pad &&
    contentY <= region.y + region.h + pad;

  for (const region of regions) if (inside(region, 0)) return region.action;
  for (const region of regions) if (region.pad && inside(region, region.pad)) return region.action;
  return null;
}
