import { PALETTE } from '../../../shared/theme';
import { contactLinks, profile, sections } from '../../../record/content';
import { drawText, fillRect, glyph, paintFocus, roundRect, SANS, MONO, themeFor } from './toolkit';
import type { Region } from '../regions';

export type PhoneAction = { kind: 'open'; href: string };

export const PHONE_TEX: [number, number] = [512, 1100];

const MARGIN = 26;
const CARD_W = PHONE_TEX[0] - MARGIN * 2;
const CARD_H = 132;
const CARD_GAP = 14;
const LIST_TOP = 452;
const LIST_BOTTOM = 96;

const CONTACT_TINT = sections.find((item) => item.id === 'contact')?.tint ?? PALETTE.rainDeep;

interface Notification {
  app: string;
  body?: string;
  handle?: string;
  href: string;
  icon: 'mail' | 'phone' | 'link' | 'branch' | 'user';
}

function notifications(): Notification[] {
  return contactLinks.map((link) => {
    if (link.href.startsWith('mailto:')) return { app: 'Correo', body: link.label, href: link.href, icon: 'mail' as const };
    if (link.href.startsWith('tel:')) return { app: 'Teléfono', body: link.label, href: link.href, icon: 'phone' as const };
    if (link.href.includes('linkedin')) {
      return { app: 'LinkedIn', body: 'Conectar o enviar mensaje', handle: 'Ana Alonso', href: link.href, icon: 'user' as const };
    }
    if (link.href.includes('github')) {
      return { app: 'GitHub', body: 'Repositorios & Código abierto', handle: '@Ana-Alonso', href: link.href, icon: 'branch' as const };
    }
    return { app: link.label, handle: profile.name, href: link.href, icon: 'user' as const };
  });
}

function clock(now: Date): { time: string; date: string } {
  return {
    time: now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
    date: now.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }),
  };
}

export function paintPhoneScreen(
  ctx: CanvasRenderingContext2D,
  { night, scroll, now, focused }: { night: boolean; scroll: number; now: Date; focused?: string | null },
): { regions: Region<PhoneAction>[]; contentHeight: number; viewport: number } {
  const [W, H] = PHONE_TEX;

  const backdrop = ctx.createLinearGradient(0, 0, W * 0.35, H);
  if (night) {
    backdrop.addColorStop(0, '#0d1016');
    backdrop.addColorStop(0.55, '#141a22');
    backdrop.addColorStop(1, '#0a0d12');
  } else {
    backdrop.addColorStop(0, PALETTE.paper);
    backdrop.addColorStop(0.5, PALETTE.moss);
    backdrop.addColorStop(1, PALETTE.oat);
  }
  fillRect(ctx, backdrop, 0, 0, W, H);

  const ink = night ? '#e7edf5' : PALETTE.ink;
  const dim = night ? '#7b8794' : PALETTE.muted;
  const card = night ? '#1b222c' : `${PALETTE.paper}f2`;
  const edge = night ? '#2c3642' : `${PALETTE.acorn}33`;

  glyph(ctx, 'lock', W / 2, 58, 30, dim);

  const { time, date } = clock(now);
  drawText(ctx, { text: time, x: W / 2, y: 96, size: 116, weight: 200, family: SANS, color: ink, align: 'center' });
  drawText(ctx, {
    text: date.charAt(0).toUpperCase() + date.slice(1),
    x: W / 2,
    y: 232,
    size: 30,
    color: dim,
    align: 'center',
  });
  drawText(ctx, {
    text: profile.role,
    x: W / 2,
    y: 286,
    size: 24,
    weight: 700,
    family: SANS,
    color: night ? '#9fb4c9' : PALETTE.sageDeep,
    align: 'center',
    maxW: W - MARGIN * 2,
  });

  const list = notifications();
  drawText(ctx, {
    text: `${list.length} notificaciones`,
    x: MARGIN,
    y: LIST_TOP - 52,
    size: 22,
    weight: 700,
    family: SANS,
    color: dim,
  });

  const viewport = H - LIST_TOP - LIST_BOTTOM;
  const regions: Region<PhoneAction>[] = [];
  let contentHeight = 0;

  ctx.save();
  ctx.beginPath();
  ctx.rect(0, LIST_TOP, W, viewport);
  ctx.clip();

  list.forEach((item) => {
    const offset = contentHeight;
    contentHeight += CARD_H + CARD_GAP;
    regions.push({ x: MARGIN, y: LIST_TOP + offset, w: CARD_W, h: CARD_H, action: { kind: 'open', href: item.href } });

    const top = LIST_TOP + offset - scroll;
    if (top + CARD_H < LIST_TOP || top > H) return;

    roundRect(ctx, MARGIN, top, CARD_W, CARD_H, 22);
    ctx.fillStyle = card;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = edge;
    ctx.stroke();

    ctx.save();
    ctx.beginPath();
    ctx.arc(MARGIN + 52, top + CARD_H / 2, 26, 0, Math.PI * 2);
    ctx.fillStyle = night ? '#232c38' : PALETTE.oat;
    ctx.fill();
    ctx.restore();
    glyph(ctx, item.icon, MARGIN + 52, top + CARD_H / 2, 30, night ? '#9fc7e8' : PALETTE.sageDeep);

    drawText(ctx, { text: item.app, x: MARGIN + 96, y: top + 24, size: 21, weight: 700, family: SANS, color: dim });

    if (item.handle) {
      const chipMax = CARD_W - 122;
      let chipSize = 25;
      ctx.font = `600 ${chipSize}px ${SANS}`;
      let chipW = Math.ceil(ctx.measureText(item.handle).width) + 36;
      if (chipW > chipMax) {
        chipSize = Math.max(20, Math.floor((25 * (chipMax - 36)) / (chipW - 36)));
        ctx.font = `600 ${chipSize}px ${SANS}`;
        chipW = Math.min(chipMax, Math.ceil(ctx.measureText(item.handle).width) + 36);
      }
      roundRect(ctx, MARGIN + 96, top + 54, chipW, 44, 22);
      ctx.fillStyle = night ? '#232c38' : `${CONTACT_TINT}1f`;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = night ? '#39434f' : `${CONTACT_TINT}59`;
      ctx.stroke();
      drawText(ctx, {
        text: item.handle,
        x: MARGIN + 96 + chipW / 2,
        y: top + 54 + Math.round((44 - chipSize) / 2),
        size: chipSize,
        weight: 600,
        family: SANS,
        color: night ? '#9fc7e8' : CONTACT_TINT,
        align: 'center',
      });
      return;
    }

    ctx.font = `400 27px ${MONO}`;
    const oversize = ctx.measureText(item.body ?? '').width / (CARD_W - 122);
    drawText(ctx, {
      text: item.body ?? '',
      x: MARGIN + 96,
      y: top + 56,
      size: oversize > 1 ? Math.max(20, Math.floor(27 / oversize)) : 27,
      weight: 400,
      family: MONO,
      color: ink,
      maxW: CARD_W - 122,
      lineH: 34,
    });
  });

  ctx.restore();

  paintFocus(ctx, themeFor(night), regions, focused, (action) => action.href, scroll);

  roundRect(ctx, W / 2 - 74, H - 54, 148, 8, 4);
  ctx.fillStyle = night ? '#39434f' : `${PALETTE.acorn}66`;
  ctx.fill();

  return { regions, contentHeight: Math.max(0, contentHeight - CARD_GAP), viewport };
}
