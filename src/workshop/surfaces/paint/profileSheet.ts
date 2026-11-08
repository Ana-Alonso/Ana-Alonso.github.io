import { PALETTE } from '../../../shared/theme';
import { OBJECT_VIEWS, VIEW_SECTION } from '../../canvas/views';
import { profile, sections } from '../../../record/content';
import { drawText, fillRect, glyph, hr, LIGHT, paintFocus, roundRect, SANS, DISPLAY, type SurfaceTheme } from './toolkit';
import { touchPad, type Region } from '../regions';

export type ProfileSheetAction = { kind: 'open'; href: string };

export const PROFILE_SHEET_TEX: [number, number] = [840, 1184];

const W = PROFILE_SHEET_TEX[0];
const H = PROFILE_SHEET_TEX[1];
const MARGIN = 40;
const BAND_H = 96;
const TEXT_W = W - MARGIN * 2;

const PHOTO = 208;
const PHOTO_X = W - MARGIN - PHOTO;
const HEAD_Y = BAND_H + 34;

const CHIP = { x: MARGIN, y: H - 138, w: 336, h: 82 };

const about = sections.find((item) => item.id === VIEW_SECTION.profileCard);
const TINT = about?.tint ?? PALETTE.acorn;
const WASH = about?.wash ?? PALETTE.paper;

function photoBox(ctx: CanvasRenderingContext2D, photo: HTMLImageElement | null): void {
  // Sombra suave proyectada estilo tarjeta Apple
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
  ctx.shadowBlur = 16;
  ctx.shadowOffsetY = 6;
  roundRect(ctx, PHOTO_X, HEAD_Y, PHOTO, PHOTO, 18);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.restore();

  // Contenedor redondeado moderno
  roundRect(ctx, PHOTO_X, HEAD_Y, PHOTO, PHOTO, 18);
  ctx.save();
  ctx.clip();
  fillRect(ctx, '#f1f3f7', PHOTO_X, HEAD_Y, PHOTO, PHOTO);
  if (photo && photo.naturalWidth) {
    const side = Math.min(photo.naturalWidth, photo.naturalHeight);
    ctx.drawImage(
      photo,
      (photo.naturalWidth - side) / 2,
      (photo.naturalHeight - side) / 2,
      side,
      side,
      PHOTO_X,
      HEAD_Y,
      PHOTO,
      PHOTO,
    );
  } else {
    glyph(ctx, 'user', PHOTO_X + PHOTO / 2, HEAD_Y + PHOTO / 2, 84, `${TINT}88`);
  }
  ctx.restore();

  // Borde exterior fino con micro-brillo
  roundRect(ctx, PHOTO_X, HEAD_Y, PHOTO, PHOTO, 18);
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.stroke();

  roundRect(ctx, PHOTO_X + 0.5, HEAD_Y + 0.5, PHOTO - 1, PHOTO - 1, 18);
  ctx.lineWidth = 1;
  ctx.strokeStyle = `${TINT}44`;
  ctx.stroke();
}

export function paintProfileSheet(
  ctx: CanvasRenderingContext2D,
  photo: HTMLImageElement | null,
  focused?: string | null,
  minTouchPx = 0,
  condensed = false,
): {
  regions: Region<ProfileSheetAction>[];
  contentHeight: number;
  viewport: number;
} {
  const theme: SurfaceTheme = LIGHT;
  fillRect(ctx, theme.canvas, 0, 0, W, H);
  fillRect(ctx, WASH, 0, 0, W, H);

  fillRect(ctx, TINT, 0, 0, W, BAND_H);
  drawText(ctx, { text: (about?.label ?? 'Sobre mí').toUpperCase(), x: MARGIN, y: 32, size: 30, weight: 700, family: SANS, color: theme.canvas });
  const index = OBJECT_VIEWS.indexOf('profileCard') + 1;
  drawText(ctx, {
    text: `pieza ${String(index).padStart(2, '0')} de ${String(OBJECT_VIEWS.length).padStart(2, '0')}`,
    x: W - MARGIN,
    y: 40,
    size: 19,
    weight: 700,
    family: SANS,
    color: `${PALETTE.paper}bb`,
    align: 'right',
  });

  photoBox(ctx, photo);

  const headW = PHOTO_X - MARGIN - 24;
  let y = HEAD_Y;
  y += drawText(ctx, { text: profile.name, x: MARGIN, y, size: 46, weight: 700, family: DISPLAY, color: theme.text, maxW: headW, lineH: 52 });
  y += 6;
  y += drawText(ctx, { text: profile.role, x: MARGIN, y, size: 23, weight: 700, family: SANS, color: theme.dim, maxW: headW, lineH: 29 });
  y += 10;
  y += drawText(ctx, { text: profile.location, x: MARGIN, y, size: 22, family: SANS, color: theme.text, maxW: headW, lineH: 28 });

  y = Math.max(y, HEAD_Y + PHOTO) + 24;
  hr(ctx, `${TINT}33`, MARGIN, y, TEXT_W, 1.5);
  y += 34;

  y += drawText(ctx, { text: profile.tagline, x: MARGIN, y, size: 29, weight: 700, family: SANS, color: theme.text, maxW: TEXT_W, lineH: 38 });

  if (!condensed) {
    y += 22;
    y += drawText(ctx, { text: profile.summary, x: MARGIN, y, size: 25, family: SANS, color: theme.text, maxW: TEXT_W, lineH: 34 });
    y += 30;
    y += drawText(ctx, { text: `Foco · ${profile.focus.length}`, x: MARGIN, y, size: 20, weight: 700, family: SANS, color: theme.dim, lineH: 26 });

    profile.focus.forEach((item) => {
      y += 10;
      fillRect(ctx, TINT, MARGIN + 3, y + 12, 6, 6);
      y += drawText(ctx, { text: item, x: MARGIN + 26, y, size: 24, family: SANS, color: theme.text, maxW: TEXT_W - 26, lineH: 32 });
    });
  }

  const regions: Region<ProfileSheetAction>[] = [];
  if (profile.resumePdf) {
    const chipY = condensed ? Math.min(y + 48, H - MARGIN - CHIP.h) : CHIP.y;
    roundRect(ctx, CHIP.x, chipY, CHIP.w, CHIP.h, 14);
    ctx.fillStyle = TINT;
    ctx.fill();
    glyph(ctx, 'link', CHIP.x + 38, chipY + CHIP.h / 2, 28, theme.canvas);
    drawText(ctx, { text: 'Descargar CV', x: CHIP.x + 68, y: chipY + 25, size: 27, weight: 700, family: SANS, color: theme.canvas });
    regions.push({
      x: CHIP.x,
      y: chipY,
      w: CHIP.w,
      h: CHIP.h,
      action: { kind: 'open', href: profile.resumePdf },
      pad: touchPad(minTouchPx, CHIP.w, CHIP.h),
    });
  }

  paintFocus(ctx, theme, regions, focused, (action) => action.href);

  return { regions, contentHeight: H, viewport: H };
}
