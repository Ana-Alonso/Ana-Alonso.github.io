import { PALETTE } from '../../../shared/theme';
import { drawText, fillRect, LIGHT, MONO, SANS, wrap, type SurfaceTheme } from './toolkit';

export const NOTE_TEX: [number, number] = [400, 270];

const W = NOTE_TEX[0];
const H = NOTE_TEX[1];
const PAD = 22;
const HEAD = 25;
const BODY = 22;
const GAP = 12;

function dottedLeader(ctx: CanvasRenderingContext2D, y: number): void {
  ctx.fillStyle = `${PALETTE.acorn}8c`;
  for (let x = PAD; x <= W - PAD; x += 6) {
    ctx.beginPath();
    ctx.arc(x, y, 1.1, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function paintCorkNotes(
  ctx: CanvasRenderingContext2D,
  label: string,
  items: readonly string[],
  hovered: boolean,
): void {
  const theme: SurfaceTheme = LIGHT;
  fillRect(ctx, hovered ? PALETTE.oat : theme.canvas, 0, 0, W, H);

  const shade = ctx.createLinearGradient(0, H - 54, 0, H);
  shade.addColorStop(0, `${PALETTE.acorn}00`);
  shade.addColorStop(1, `${PALETTE.acorn}3d`);
  ctx.fillStyle = shade;
  ctx.fillRect(0, H - 54, W, 54);

  ctx.font = `500 ${HEAD}px ${SANS}`;
  const title = wrap(ctx, label, W - PAD * 2);
  const leader = PAD + title.length * 29 + 9;
  const bodyTop = leader + GAP;

  drawText(ctx, {
    text: label,
    x: PAD,
    y: PAD,
    size: HEAD,
    weight: 500,
    family: SANS,
    color: PALETTE.acornDeep,
    lineH: 29,
  });
  dottedLeader(ctx, leader);

  const text = items.join(' · ');
  const maxW = W - PAD * 2;
  let size = BODY;
  let lines: string[] = [];
  for (;;) {
    ctx.font = `400 ${size}px ${MONO}`;
    lines = wrap(ctx, text, maxW);
    if (size === 18 || bodyTop + lines.length * Math.round(size * 1.4) <= H - PAD) break;
    size -= 1;
  }

  const lineH = Math.round(size * 1.4);
  lines.forEach((line, index) => {
    drawText(ctx, { text: line, x: PAD, y: bodyTop + index * lineH, size, family: MONO, color: theme.text, lineH });
  });
}
