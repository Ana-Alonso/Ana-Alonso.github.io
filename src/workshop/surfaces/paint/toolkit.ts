import { PALETTE } from '../../../shared/theme';
import type { Region } from '../regions';

export interface SurfaceTheme {
  chrome: string;
  chromeDeep: string;
  border: string;
  canvas: string;
  text: string;
  dim: string;
  heading: string;
  marker: string;
  accent: string;
  active: string;
  hover: string;
}

export const LIGHT: SurfaceTheme = {
  chrome: PALETTE.moss,
  chromeDeep: PALETTE.oat,
  border: `${PALETTE.acorn}44`,
  canvas: PALETTE.paper,
  text: PALETTE.ink,
  dim: PALETTE.muted,
  heading: PALETTE.sageDeep,
  marker: PALETTE.acorn,
  accent: PALETTE.sageDeep,
  active: `${PALETTE.sage}66`,
  hover: `${PALETTE.oat}99`,
};

const DARK: SurfaceTheme = {
  chrome: '#22262c',
  chromeDeep: '#181b20',
  border: '#3a4048',
  canvas: '#1b1e23',
  text: '#dfe4ea',
  dim: '#8f97a3',
  heading: '#8fd0a8',
  marker: '#d9b382',
  accent: '#a9c4b1',
  active: '#2f3944',
  hover: '#262c34',
};

export function themeFor(night: boolean): SurfaceTheme {
  return night ? DARK : LIGHT;
}

export const CYANO: SurfaceTheme = {
  chrome: '#2c3d59',
  chromeDeep: '#1a2537',
  border: '#7e97b8',
  canvas: '#22304a',
  text: '#e9eff6',
  dim: '#a9bdd8',
  heading: '#f6fafe',
  marker: '#e9eff6',
  accent: '#dce8f6',
  active: '#3a5070',
  hover: '#2f425f',
};

export const SURFACE_FONTS = [
  '400 24px "IBM Plex Mono"',
  '500 24px "IBM Plex Mono"',
  '200 24px "Nunito Sans"',
  '400 24px "Nunito Sans"',
  '700 24px "Nunito Sans"',
  '400 24px "Chonburi"',
];

export const MONO = '"IBM Plex Mono", ui-monospace, monospace';
export const SANS = '"Nunito Sans", "Segoe UI", sans-serif';
export const DISPLAY = '"Chonburi", "Trebuchet MS", cursive';

export function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

export function fillRect(ctx: CanvasRenderingContext2D, color: string | CanvasGradient, x: number, y: number, w: number, h: number): void {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function focusRing(ctx: CanvasRenderingContext2D, theme: SurfaceTheme, x: number, y: number, w: number, h: number): void {
  ctx.save();
  roundRect(ctx, x - 4, y - 4, w + 8, h + 8, 16);
  ctx.globalAlpha = 0.45;
  ctx.fillStyle = theme.hover;
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.lineWidth = 3;
  ctx.strokeStyle = theme.marker;
  ctx.setLineDash([14, 9]);
  roundRect(ctx, x - 10, y - 10, w + 20, h + 20, 22);
  ctx.stroke();
  ctx.restore();
}

export function paintFocus<A>(
  ctx: CanvasRenderingContext2D,
  theme: SurfaceTheme,
  regions: Region<A>[],
  focused: string | null | undefined,
  hrefOf: (action: A) => string | null,
  shift = 0,
): void {
  if (!focused) return;
  for (const region of regions) {
    if (hrefOf(region.action) === focused) focusRing(ctx, theme, region.x, region.y - shift, region.w, region.h);
  }
}

function chunkWord(ctx: CanvasRenderingContext2D, word: string, maxW: number): string[] {
  const pieces: string[] = [];
  let rest = word;
  while (rest.length > 1) {
    let fit = 1;
    for (let n = 2; n <= rest.length && ctx.measureText(rest.slice(0, n)).width <= maxW; n += 1) fit = n;
    pieces.push(rest.slice(0, fit));
    rest = rest.slice(fit);
  }
  if (rest) pieces.push(rest);
  return pieces;
}

export function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const lines: string[] = [];
  for (const paragraph of text.split('\n')) {
    if (!paragraph) {
      lines.push('');
      continue;
    }
    let line = '';
    for (const word of paragraph.split(/\s+/)) {
      const pieces = ctx.measureText(word).width > maxW ? chunkWord(ctx, word, maxW) : [word];
      pieces.forEach((piece, index) => {
        const trial = (line && index === 0 ? `${line} ` : line) + piece;
        if (line && ctx.measureText(trial).width > maxW) {
          lines.push(line);
          line = piece;
        } else {
          line = trial;
        }
      });
    }
    if (line) lines.push(line);
  }
  return lines;
}

export interface TextOptions {  text: string;
  x: number;
  y: number;
  size: number;
  color: string;
  family?: string;
  weight?: number;
  lineH?: number;
  maxW?: number;
  align?: CanvasTextAlign;
}

export function drawText(ctx: CanvasRenderingContext2D, opts: TextOptions): number {
  const { text, x, y, size, color, family = SANS, weight = 400, maxW, align = 'left' } = opts;
  ctx.font = `${weight} ${size}px ${family}`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = 'top';
  const lineH = opts.lineH ?? Math.round(size * 1.35);
  const lines = maxW ? wrap(ctx, text, maxW) : text.split('\n');
  lines.forEach((line, index) => ctx.fillText(line, x, y + index * lineH));
  ctx.textAlign = 'left';
  return lines.length * lineH;
}

export function textHeight(
  ctx: CanvasRenderingContext2D,
  { text, size, weight = 400, family = SANS, lineH, maxW }: { text: string; size: number; weight?: number; family?: string; lineH?: number; maxW?: number },
): number {
  ctx.font = `${weight} ${size}px ${family}`;
  const rows = maxW ? wrap(ctx, text, maxW).length : text.split('\n').length;
  return rows * (lineH ?? Math.round(size * 1.35));
}

export function hr(ctx: CanvasRenderingContext2D, color: string, x: number, y: number, w: number, h = 1): void {
  fillRect(ctx, color, x, y, w, h);
}

export function glyph(
  ctx: CanvasRenderingContext2D,
  kind: 'file' | 'folder' | 'search' | 'branch' | 'grid' | 'mail' | 'phone' | 'link' | 'lock' | 'user' | 'left' | 'right',
  cx: number,
  cy: number,
  size: number,
  color: string,
): void {
  const s = size / 2;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = Math.max(1.4, size * 0.09);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.beginPath();
  switch (kind) {
    case 'left':
      ctx.moveTo(cx + s * 0.35, cy - s * 0.55);
      ctx.lineTo(cx - s * 0.35, cy);
      ctx.lineTo(cx + s * 0.35, cy + s * 0.55);
      break;
    case 'right':
      ctx.moveTo(cx - s * 0.35, cy - s * 0.55);
      ctx.lineTo(cx + s * 0.35, cy);
      ctx.lineTo(cx - s * 0.35, cy + s * 0.55);
      break;
    case 'file':
      ctx.moveTo(cx - s * 0.6, cy - s);
      ctx.lineTo(cx + s * 0.25, cy - s);
      ctx.lineTo(cx + s * 0.6, cy - s * 0.62);
      ctx.lineTo(cx + s * 0.6, cy + s);
      ctx.lineTo(cx - s * 0.6, cy + s);
      ctx.closePath();
      break;
    case 'folder':
      ctx.moveTo(cx - s * 0.75, cy - s * 0.5);
      ctx.lineTo(cx - s * 0.2, cy - s * 0.5);
      ctx.lineTo(cx, cy - s * 0.18);
      ctx.lineTo(cx + s * 0.75, cy - s * 0.18);
      ctx.lineTo(cx + s * 0.75, cy + s * 0.6);
      ctx.lineTo(cx - s * 0.75, cy + s * 0.6);
      ctx.closePath();
      break;
    case 'search':
      ctx.arc(cx - s * 0.18, cy - s * 0.18, s * 0.55, 0, Math.PI * 2);
      ctx.moveTo(cx + s * 0.26, cy + s * 0.26);
      ctx.lineTo(cx + s * 0.72, cy + s * 0.72);
      break;
    case 'branch':
      ctx.arc(cx - s * 0.4, cy - s * 0.6, s * 0.26, 0, Math.PI * 2);
      ctx.moveTo(cx - s * 0.4, cy - s * 0.34);
      ctx.lineTo(cx - s * 0.4, cy + s * 0.5);
      ctx.moveTo(cx + s * 0.42, cy - s * 0.5);
      ctx.lineTo(cx + s * 0.42, cy + s * 0.1);
      ctx.bezierCurveTo(cx + s * 0.42, cy + s * 0.5, cx - s * 0.4, cy + s * 0.1, cx - s * 0.4, cy + s * 0.5);
      break;
    case 'grid':
      for (const [ox, oy] of [[-0.5, -0.5], [0.15, -0.5], [-0.5, 0.15], [0.15, 0.15]] as const) {
        ctx.rect(cx + s * ox, cy + s * oy, s * 0.55, s * 0.55);
      }
      break;
    case 'mail':
      ctx.rect(cx - s * 0.8, cy - s * 0.55, s * 1.6, s * 1.1);
      ctx.moveTo(cx - s * 0.8, cy - s * 0.55);
      ctx.lineTo(cx, cy + s * 0.12);
      ctx.lineTo(cx + s * 0.8, cy - s * 0.55);
      break;
    case 'phone':
      ctx.rect(cx - s * 0.45, cy - s * 0.8, s * 0.9, s * 1.6);
      ctx.moveTo(cx - s * 0.12, cy + s * 0.55);
      ctx.lineTo(cx + s * 0.12, cy + s * 0.55);
      break;
    case 'link':
      ctx.arc(cx - s * 0.32, cy, s * 0.36, Math.PI * 0.5, Math.PI * 1.5);
      ctx.arc(cx + s * 0.32, cy, s * 0.36, Math.PI * 1.5, Math.PI * 0.5);
      ctx.moveTo(cx - s * 0.36, cy);
      ctx.lineTo(cx + s * 0.36, cy);
      break;
    case 'lock':
      ctx.rect(cx - s * 0.55, cy - s * 0.1, s * 1.1, s * 0.9);
      ctx.moveTo(cx - s * 0.34, cy - s * 0.1);
      ctx.arc(cx, cy - s * 0.12, s * 0.34, Math.PI, 0);
      break;
    case 'user':
      ctx.arc(cx, cy - s * 0.4, s * 0.34, 0, Math.PI * 2);
      ctx.moveTo(cx + s * 0.62, cy + s * 0.8);
      ctx.arc(cx, cy + s * 0.8, s * 0.62, 0, Math.PI, true);
      break;
  }
  ctx.stroke();
  ctx.restore();
}
