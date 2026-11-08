import { PALETTE } from '../../../shared/theme';
import { countLabel, languages, sections } from '../../../record/content';
import { DISPLAY, drawText, fillRect, hr, LIGHT, MONO, SANS } from './toolkit';

export const DICTIONARY_TEX: [number, number] = [700, 921];

const [W, H] = DICTIONARY_TEX;
const MARGIN = 54;
const COL_W = W - MARGIN * 2;

const BEADS = 10;
const BEAD_R = 18;
const BEAD_GAP = 14;

const language = sections.find((item) => item.id === 'languages');
const TINT = language?.tint ?? PALETTE.blushDeep;
const WASH = language?.wash ?? PALETTE.blush;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

function beadRow(ctx: CanvasRenderingContext2D, x: number, y: number, filled: number): void {
  for (let index = 0; index < BEADS; index += 1) {
    const cx = x + BEAD_R + index * (BEAD_R * 2 + BEAD_GAP);
    ctx.beginPath();
    ctx.arc(cx, y + BEAD_R, BEAD_R, 0, Math.PI * 2);
    ctx.fillStyle = index < filled ? TINT : WASH;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = index < filled ? TINT : `${PALETTE.acorn}59`;
    ctx.stroke();
  }
}

export function paintDictionaryPage(ctx: CanvasRenderingContext2D, { reveal }: { reveal: number }): {
  contentHeight: number;
  viewport: number;
} {
  const theme = LIGHT;
  fillRect(ctx, theme.canvas, 0, 0, W, H);

  drawText(ctx, { text: (language?.label ?? 'Idiomas').toUpperCase(), x: MARGIN, y: MARGIN, size: 60, family: DISPLAY, color: theme.heading });
  drawText(ctx, {
    text: countLabel('languages'),
    x: W - MARGIN,
    y: MARGIN + 26,
    size: 22,
    family: MONO,
    color: theme.dim,
    align: 'right',
  });
  hr(ctx, TINT, MARGIN, MARGIN + 86, COL_W, 3);

  let y = MARGIN + 122;
  languages.forEach((item, index) => {
    const local = clamp01((reveal - index * 0.18) / 0.6);
    const filled = Math.round(Math.round((item.proficiency / 100) * BEADS) * local);

    const head = drawText(ctx, { text: item.name, x: MARGIN, y, size: 48, family: DISPLAY, color: theme.heading, maxW: COL_W, lineH: 56 });
    const meta = drawText(ctx, {
      text: `${item.level}${item.cefr ? ` · ${item.cefr}` : ''}`,
      x: MARGIN,
      y: y + head + 4,
      size: 26,
      family: SANS,
      color: theme.dim,
      maxW: COL_W,
      lineH: 34,
    });
    beadRow(ctx, MARGIN, y + head + meta + 18, filled);

    y += head + meta + 18 + BEAD_R * 2 + 40;
    if (index < languages.length - 1) hr(ctx, theme.border, MARGIN, y - 28, COL_W, 2);
  });

  const foot = H - 132;
  hr(ctx, theme.border, MARGIN, foot - 20, COL_W, 2);
  drawText(ctx, {
    text: 'CEFR · Marco Común Europeo de Referencia para las lenguas',
    x: MARGIN,
    y: foot,
    size: 22,
    family: SANS,
    color: theme.dim,
    maxW: COL_W,
    lineH: 30,
  });

  return { contentHeight: H, viewport: H };
}
