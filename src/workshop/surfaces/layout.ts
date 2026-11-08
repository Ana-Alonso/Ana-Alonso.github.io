import { MathUtils } from 'three';
import type { ViewId } from '../canvas/views';
import { VIEWS, getView, getAnchor } from '../canvas/views';

export type SurfaceKind = 'full' | 'sheet' | 'none';

export interface SurfaceLayout {
  kind: SurfaceKind;
  d: number;
  framed: boolean;
  texPerPx: number;
}

const MIN_DISTANCE = 0.36;
export const SHEET_BREAKPOINT = 640;
const MIN_READ_CSS_PX = 13;

function fitDistance(radius: number, fovDeg: number, margin = 1.2) {
  const d = (radius * margin) / Math.sin(MathUtils.degToRad(fovDeg) / 2);
  return Math.max(d, 0.5);
}

export function surfacePortrait(view: ViewId): boolean {
  const tex = VIEWS[view].screen?.tex;
  return !!tex && tex[0] / tex[1] <= 1;
}

export function surfaceLayoutFor(view: ViewId, width: number, height: number): SurfaceLayout {
  const isNarrow = width > 0 && width < SHEET_BREAKPOINT;
  const target = getView(view, isNarrow);
  const authored = target.pos.distanceTo(target.center);
  const screen = target.screen;

  if (!screen) return { kind: 'none', d: authored, framed: true, texPerPx: 1 };
  if (width <= 0 || height <= 0) return { kind: 'sheet', d: authored, framed: false, texPerPx: 1 };

  const halfVertical = MathUtils.degToRad(target.fov) / 2;
  const halfHorizontal = Math.atan(Math.tan(halfVertical) * (width / height));
  const [screenW, screenH] = screen.size;

  const portraitViewport = height > width;
  const crossW = portraitViewport ? screenH * screen.upSideways : 0;
  const crossH = portraitViewport ? screenW * screen.rightVertical : 0;

  const legible = (screenH * screen.upAlign + crossH) / (2 * Math.tan(halfVertical) * screen.coverV);
  const fitsWidth = (screenW * screen.xAlign + crossW) / (2 * Math.tan(halfHorizontal));

  const anchor = getAnchor(view as Exclude<ViewId, 'boot' | 'overview'>, isNarrow);
  const minObjectDistance = anchor ? fitDistance(anchor.radius, target.fov) : MIN_DISTANCE;
  const d = Math.min(
    Math.max(legible, fitsWidth, MIN_DISTANCE, minObjectDistance * 0.7),
    authored * 1.5
  );
  const surfacePx = ((screenH * screen.upAlign + crossH) / (2 * Math.tan(halfVertical) * d)) * height;
  const texPerPx = screen.tex[1] / surfacePx;

  return {
    kind: width >= SHEET_BREAKPOINT ? (legible >= fitsWidth ? 'full' : 'sheet') : screen.readPx / texPerPx >= MIN_READ_CSS_PX ? 'full' : 'sheet',
    d,
    framed: legible >= fitsWidth,
    texPerPx,
  };
}
