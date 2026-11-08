import { PALETTE } from '../../../shared/theme';
import { TONE_COLOR, splitBody } from '../../../record/sections/timelineModel';
import { experience, countLabel, sections } from '../../../record/content';
import type { BlockTone } from '../../../shared/types';
import { DISPLAY, drawText, fillRect, glyph, hr, LIGHT, MONO, roundRect, SANS, textHeight } from './toolkit';
import { touchPad, type Region } from '../regions';

export const LOGBOOK_TEX: [number, number] = [700, 960];

export type LogbookAction = 'prev' | 'next';

const [W, H] = LOGBOOK_TEX;
const MARGIN = 54;
const COL_W = W - MARGIN * 2;
const INDENT = 26;
const BULLET_W = COL_W - INDENT;
const BODY_TOP = MARGIN + 90;
const FOOT_TOP = H - 78;
const BODY_H = FOOT_TOP - 30 - BODY_TOP;
const GROUP_GAP = 20;
const BLOCK_GAP = 46;

const experienceSection = sections.find((item) => item.id === 'experience');
const TINT = experienceSection?.tint ?? PALETTE.acornDeep;
const theme = LIGHT;

interface Line {
  text: string;
  x: number;
  size: number;
  weight: number;
  family: string;
  color: string;
  lineH: number;
  lead: number;
  maxW?: number;
  dot?: string;
  h: number;
}

interface Group {
  lines: Line[];
  h: number;
  startsBlock: boolean;
}

function lineHeight(ctx: CanvasRenderingContext2D, line: Omit<Line, 'h'>): number {
  return (
    line.lead +
    textHeight(ctx, { text: line.text, size: line.size, weight: line.weight, family: line.family, lineH: line.lineH, maxW: line.maxW })
  );
}

function makeLine(ctx: CanvasRenderingContext2D, line: Omit<Line, 'h'>): Line {
  return { ...line, h: lineHeight(ctx, line) };
}

function buildGroups(ctx: CanvasRenderingContext2D): Group[] {
  const groups: Group[] = [];

  experience.forEach((block) => {
    const { prose, items } = splitBody(block.body);
    const color = TONE_COLOR[(block.tone ?? 'primary') as BlockTone];
    const head: Line[] = [];

    if (block.period) {
      head.push(makeLine(ctx, { text: block.period.toUpperCase(), x: MARGIN, size: 22, weight: 500, family: MONO, color: theme.dim, lineH: 30, lead: 0 }));
    }
    head.push(makeLine(ctx, { text: block.title, x: MARGIN, size: 38, weight: 700, family: SANS, color: theme.text, lineH: 48, lead: 6, maxW: COL_W }));
    if (block.subtitle) {
      head.push(makeLine(ctx, { text: block.subtitle, x: MARGIN, size: 26, weight: 600, family: SANS, color, lineH: 34, lead: 4, maxW: COL_W }));
    }
    if (prose) {
      head.push(makeLine(ctx, { text: prose, x: MARGIN, size: 30, weight: 400, family: SANS, color: theme.text, lineH: 40, lead: 14, maxW: COL_W }));
    }

    const bullets = items.map((item, position) =>
      makeLine(ctx, {
        text: item,
        x: MARGIN + INDENT,
        size: 30,
        weight: 400,
        family: SANS,
        color: theme.text,
        lineH: 40,
        lead: position === 0 ? 16 : 0,
        maxW: BULLET_W,
        dot: color,
      }),
    );

    const intro = [...head, ...bullets.slice(0, 1)];
    groups.push({ lines: intro, h: intro.reduce((total, line) => total + line.h, 0), startsBlock: true });
    groups.push(...bullets.slice(1).map((line) => ({ lines: [line], h: line.h, startsBlock: false })));
  });

  return groups;
}

function cutPages(groups: Group[]): Group[][] {
  const pages: Group[][] = [];
  let current: Group[] = [];
  let used = 0;

  for (const group of groups) {
    const gap = current.length ? (group.startsBlock ? BLOCK_GAP : GROUP_GAP) : 0;
    if (current.length && used + gap + group.h > BODY_H) {
      pages.push(current);
      current = [];
      used = 0;
    }
    current.push(group);
    used += (current.length > 1 ? (group.startsBlock ? BLOCK_GAP : GROUP_GAP) : 0) + group.h;
  }
  if (current.length) pages.push(current);
  return pages.length ? pages : [[]];
}

const CHIP_W = 64;
const CHIP_H = 44;
const CHIP_GAP = 10;

function paintFooter(
  ctx: CanvasRenderingContext2D,
  page: number,
  pages: number,
  regions: Region<LogbookAction>[] | null,
  minTouchPx: number,
): void {
  const y = FOOT_TOP;
  const chipPad = touchPad(minTouchPx, CHIP_W, CHIP_H);
  if (pages > 1) {
    if (page > 0) {
      roundRect(ctx, MARGIN, y, CHIP_W, CHIP_H, 22);
      ctx.fillStyle = TINT;
      ctx.fill();
      glyph(ctx, 'left', MARGIN + CHIP_W / 2, y + CHIP_H / 2, 30, theme.canvas);
      regions?.push({ x: MARGIN, y: page * H + y, w: CHIP_W, h: CHIP_H, action: 'prev', pad: chipPad });
    }
    if (page < pages - 1) {
      const x = MARGIN + CHIP_W + CHIP_GAP;
      roundRect(ctx, x, y, CHIP_W, CHIP_H, 22);
      ctx.fillStyle = TINT;
      ctx.fill();
      glyph(ctx, 'right', x + CHIP_W / 2, y + CHIP_H / 2, 30, theme.canvas);
      regions?.push({ x, y: page * H + y, w: CHIP_W, h: CHIP_H, action: 'next', pad: chipPad });
    }
    ctx.fillStyle = theme.border;
    for (let x = MARGIN + (CHIP_W + CHIP_GAP) * 2 + 6; x < W - MARGIN - 156; x += 10) ctx.fillRect(x, y + CHIP_H / 2 - 1, 4, 2);
  }

  drawText(ctx, {
    text: `pág. ${page + 1} / ${pages}`,
    x: W - MARGIN,
    y: y + 9,
    size: 22,
    family: MONO,
    color: theme.dim,
    align: 'right',
  });
}

function paintPage(
  ctx: CanvasRenderingContext2D,
  groups: Group[],
  page: number,
  pages: number,
  regions: Region<LogbookAction>[] | null,
  minTouchPx = 0,
): void {
  fillRect(ctx, theme.canvas, 0, 0, W, H);
  fillRect(ctx, `${TINT}3d`, MARGIN - 18, BODY_TOP - 40, 2, FOOT_TOP - BODY_TOP + 40);

  if (page === 0) {
    drawText(ctx, {
      text: (experienceSection?.label ?? 'Experiencia').toUpperCase(),
      x: MARGIN,
      y: MARGIN,
      size: 40,
      family: DISPLAY,
      color: theme.heading,
    });
    drawText(ctx, {
      text: countLabel('experience'),
      x: W - MARGIN,
      y: MARGIN + 18,
      size: 20,
      family: MONO,
      color: theme.dim,
      align: 'right',
    });
    hr(ctx, TINT, MARGIN, MARGIN + 66, COL_W, 3);
  } else {
    drawText(ctx, {
      text: (experienceSection?.label ?? 'Experiencia').toUpperCase(),
      x: MARGIN,
      y: MARGIN,
      size: 20,
      family: MONO,
      weight: 500,
      color: theme.dim,
    });
    hr(ctx, `${TINT}66`, MARGIN, MARGIN + 34, COL_W, 2);
  }

  let y = BODY_TOP;
  groups.forEach((group, index) => {
    if (index > 0) y += group.startsBlock ? BLOCK_GAP : GROUP_GAP;
    if (index > 0 && group.startsBlock) hr(ctx, theme.border, MARGIN, y - BLOCK_GAP + 16, COL_W, 2);
    group.lines.forEach((line) => {
      if (line.dot) {
        ctx.beginPath();
        ctx.arc(MARGIN + 5, y + line.lead + Math.round(line.size * 0.55), 5, 0, Math.PI * 2);
        ctx.fillStyle = line.dot;
        ctx.fill();
      }
      drawText(ctx, {
        text: line.text,
        x: line.x,
        y: y + line.lead,
        size: line.size,
        weight: line.weight,
        family: line.family,
        color: line.color,
        lineH: line.lineH,
        maxW: line.maxW,
      });
      y += line.h;
    });
  });

  paintFooter(ctx, page, pages, regions, minTouchPx);
}

export function paintLogbookPage(
  ctx: CanvasRenderingContext2D,
  { page, prev, turn, minTouchPx = 0 }: { page: number; prev: number; turn: number; minTouchPx?: number },
): { regions: Region<LogbookAction>[]; contentHeight: number; viewport: number; pages: number } {
  const pages = cutPages(buildGroups(ctx));
  const total = pages.length;
  const current = Math.min(total - 1, Math.max(0, Math.round(page)));
  const from = Math.min(total - 1, Math.max(0, Math.round(prev)));
  const turning = turn > 0 && from !== current;
  const forward = current > from;
  const base = turning ? (forward ? current : from) : current;
  const lifted = turning ? (forward ? from : current) : -1;
  const k = turning ? (forward ? turn : 1 - turn) : 0;

  const regions: Region<LogbookAction>[] = [];
  paintPage(ctx, pages[base], base, total, turning ? null : regions, minTouchPx);

  if (lifted >= 0 && k > 0.03) {
    const fold = W * k;
    const shadow = ctx.createLinearGradient(fold, 0, fold + 44, 0);
    shadow.addColorStop(0, 'rgba(30, 22, 12, 0.16)');
    shadow.addColorStop(1, 'rgba(30, 22, 12, 0)');
    fillRect(ctx, shadow, fold, 0, 44, H);

    ctx.save();
    ctx.scale(k, 1);
    paintPage(ctx, pages[lifted], lifted, total, null);
    ctx.restore();

    const band = ctx.createLinearGradient(fold - 16, 0, fold + 10, 0);
    band.addColorStop(0, `${PALETTE.paper}00`);
    band.addColorStop(0.5, '#ffffff');
    band.addColorStop(1, `${PALETTE.oat}cc`);
    fillRect(ctx, band, fold - 16, 0, 26, H);
    fillRect(ctx, 'rgba(30, 22, 12, 0.22)', fold - 1, 0, 3, H);
  }

  return { regions, contentHeight: total * H, viewport: H, pages: total };
}
