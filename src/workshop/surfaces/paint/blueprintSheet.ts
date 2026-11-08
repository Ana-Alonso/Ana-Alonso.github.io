import { countLabel, profile, projects, sections } from '../../../record/content';
import type { Project } from '../../../shared/types';
import { CYANO, drawText, fillRect, glyph, hr, MONO, paintFocus, roundRect, SANS, textHeight } from './toolkit';
import { touchPad, type Region } from '../regions';

export const BLUEPRINT_TEX: [number, number] = [1320, 900];

export type SheetAction = { kind: 'open'; href: string } | { kind: 'plan'; dir: 1 | -1 } | { kind: 'goto'; plan: number };

const [W, H] = BLUEPRINT_TEX;
const FRAME = 18;
const MARGIN = 46;
const COL_W = W - MARGIN * 2;
const GRID_COL = Math.floor((COL_W - 44) / 2);
const RULE_Y = MARGIN + 62;
const BODY_TOP = RULE_Y + 32;
const FOOT_TOP = H - 92;
const BODY_H = FOOT_TOP - 34 - BODY_TOP;
const GRID_GAP = 30;
const CHIP_W = 64;
const CHIP_H = 44;
const CHIP_GAP = 10;
const PILL_H = 46;
const INDEX_RIGHT = 220;
const INDEX_COL = COL_W - INDEX_RIGHT;

const theme = CYANO;
const section = sections.find((item) => item.id === 'projects');
const LABEL = (section?.label ?? 'Proyectos').toUpperCase();
const COUNT = countLabel('projects');

type Plan = { kind: 'index' } | { kind: 'featured'; project: Project } | { kind: 'grid'; columns: [Project[], Project[]] };

function stroke(ctx: CanvasRenderingContext2D, color: string, width: number): void {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.stroke();
}

function pill(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  label: string,
  { size, weight = 400, family = SANS, ink, edge, fill, icon }: { size: number; weight?: number; family?: string; ink: string; edge: string; fill?: string; icon?: 'link' | 'grid' },
): number {
  ctx.font = `${weight} ${size}px ${family}`;
  const text = Math.ceil(ctx.measureText(label).width);
  const pad = size * 0.7;
  const width = text + pad * 2 + (icon ? size + 8 : 0);
  roundRect(ctx, x, y, width, Math.round(size * 2.1), Math.round(size * 1.05));
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  stroke(ctx, edge, 2);
  if (icon) {
    glyph(ctx, icon, x + pad + size / 2, y + Math.round(size * 1.05), size, ink);
  }
  drawText(ctx, { text: label, x: x + pad + (icon ? size + 8 : 0), y: y + Math.round(size * 0.55), size, weight, family, color: ink });
  return width;
}

function minorHeight(ctx: CanvasRenderingContext2D, project: Project): number {
  return (
    textHeight(ctx, { text: project.title, size: 26, weight: 700, lineH: 34, maxW: GRID_COL }) +
    4 +
    textHeight(ctx, { text: project.description, size: 22, lineH: 28, maxW: GRID_COL }) +
    4 +
    textHeight(ctx, { text: project.tech.join(' · '), size: 18, family: MONO, lineH: 24, maxW: GRID_COL }) +
    10 +
    PILL_H +
    GRID_GAP
  );
}

function planProjects(plan: Plan): Project[] {
  if (plan.kind === 'featured') return [plan.project];
  if (plan.kind === 'grid') return [...plan.columns[0], ...plan.columns[1]];
  return [];
}

function buildPlans(ctx: CanvasRenderingContext2D): { plans: Plan[]; slots: Map<Project, number> } {
  const plans: Plan[] = projects.filter((project) => project.featured).map((project) => ({ kind: 'featured', project }));

  let columns: [Project[], Project[]] = [[], []];
  const heights = [0, 0];
  const flush = () => {
    if (columns[0].length || columns[1].length) plans.push({ kind: 'grid', columns });
    columns = [[], []];
    heights[0] = 0;
    heights[1] = 0;
  };

  projects
    .filter((project) => !project.featured)
    .forEach((project) => {
      const h = minorHeight(ctx, project);
      const shortest = () => (heights[0] <= heights[1] ? 0 : 1);
      let side = shortest();
      if (heights[side] + h > BODY_H && columns[0].length + columns[1].length > 0) {
        flush();
        side = shortest();
      }
      columns[side].push(project);
      heights[side] += h;
    });
  flush();

  const slots = new Map<Project, number>();
  plans.forEach((plan, index) => planProjects(plan).forEach((project) => slots.set(project, index + 1)));
  return { plans: [{ kind: 'index' }, ...plans], slots };
}

function paintFrame(ctx: CanvasRenderingContext2D): void {
  ctx.save();
  ctx.beginPath();
  ctx.rect(FRAME, FRAME, W - FRAME * 2, H - FRAME * 2);
  stroke(ctx, theme.marker, 2.5);
  ctx.beginPath();
  ctx.rect(FRAME + 9, FRAME + 9, W - (FRAME + 9) * 2, H - (FRAME + 9) * 2);
  stroke(ctx, theme.border, 1.5);
  ctx.restore();

  const inner = FRAME + 9;
  for (const [cx, cy] of [
    [inner, inner],
    [W - inner, inner],
    [inner, H - inner],
    [W - inner, H - inner],
  ] as const) {
    ctx.beginPath();
    ctx.moveTo(cx - 13, cy);
    ctx.lineTo(cx + 13, cy);
    ctx.moveTo(cx, cy - 13);
    ctx.lineTo(cx, cy + 13);
    stroke(ctx, theme.marker, 1.5);
  }
}

function paintHeader(ctx: CanvasRenderingContext2D, caption: string): void {
  glyph(ctx, 'grid', MARGIN + 15, MARGIN + 19, 30, theme.marker);
  drawText(ctx, { text: LABEL, x: MARGIN + 42, y: MARGIN, size: 30, weight: 700, color: theme.heading });
  drawText(ctx, { text: caption.toUpperCase(), x: W - MARGIN, y: MARGIN + 4, size: 20, family: MONO, color: theme.dim, align: 'right' });
  hr(ctx, theme.marker, MARGIN, RULE_Y, COL_W, 2.5);
  hr(ctx, theme.border, MARGIN, RULE_Y + 6, COL_W, 1.5);
}

function paintFeatured(
  ctx: CanvasRenderingContext2D,
  project: Project,
  page: number,
  regions: Region<SheetAction>[],
  minTouchPx: number,
): void {
  let y = BODY_TOP;
  const titleW = COL_W - 190;
  y += drawText(ctx, { text: project.title, x: MARGIN, y, size: 34, weight: 700, color: theme.heading, lineH: 42, maxW: titleW });
  roundRect(ctx, W - MARGIN - 160, BODY_TOP + 4, 160, 36, 18);
  stroke(ctx, theme.accent, 2);
  drawText(ctx, { text: 'DESTACADO', x: W - MARGIN - 80, y: BODY_TOP + 12, size: 18, family: MONO, weight: 500, color: theme.accent, align: 'center' });

  y += 8;
  hr(ctx, theme.border, MARGIN, y, COL_W, 1.5);
  y += 22;

  y += drawText(ctx, { text: project.description, x: MARGIN, y, size: 24, color: theme.text, lineH: 32, maxW: COL_W }) + 18;

  project.metrics?.forEach((metric) => {
    fillRect(ctx, theme.marker, MARGIN + 2, Math.round(y + 10), 9, 9);
    y += drawText(ctx, { text: metric, x: MARGIN + 26, y, size: 22, color: theme.dim, lineH: 29, maxW: COL_W - 26 }) + 10;
  });
  y += 8;

  let px = MARGIN;
  let py = y;
  project.tech.forEach((item) => {
    ctx.font = `500 20px ${MONO}`;
    const pillW = Math.ceil(ctx.measureText(item).width) + 34;
    if (px + pillW > W - MARGIN) {
      px = MARGIN;
      py += 46;
    }
    roundRect(ctx, px, py, pillW, 40, 8);
    stroke(ctx, theme.border, 1.5);
    drawText(ctx, { text: item, x: px + 17, y: py + 9, size: 20, weight: 500, family: MONO, color: theme.accent });
    px += pillW + 12;
  });
  y = py + 40 + 26;

  let lx = MARGIN;
  project.links.forEach((link) => {
    const width = pill(ctx, lx, y, link.label, { size: 22, weight: 700, ink: theme.heading, edge: theme.marker, icon: 'link' });
    regions.push({ x: lx, y: page * H + y, w: width, h: PILL_H, action: { kind: 'open', href: link.href }, pad: touchPad(minTouchPx, width, PILL_H) });
    lx += width + 16;
  });
  y += PILL_H + 22;

  if (project.note) {
    const alto = textHeight(ctx, { text: project.note, size: 22, lineH: 28, maxW: COL_W - 20 });
    ctx.fillStyle = theme.border;
    for (let dot = 0; dot < alto; dot += 8) ctx.fillRect(MARGIN + 2, y + dot, 2, 4);
    drawText(ctx, { text: project.note, x: MARGIN + 20, y, size: 22, color: theme.dim, lineH: 28, maxW: COL_W - 20 });
  }
}

function paintGrid(
  ctx: CanvasRenderingContext2D,
  columns: [Project[], Project[]],
  page: number,
  regions: Region<SheetAction>[],
  minTouchPx: number,
): void {
  const ruleX = MARGIN + GRID_COL + 22;
  hr(ctx, theme.border, ruleX, BODY_TOP, 1.5, BODY_H - 40);

  columns.forEach((column, side) => {
    const x = MARGIN + side * (GRID_COL + 44);
    let y = BODY_TOP;
    column.forEach((project) => {
      y += drawText(ctx, { text: project.title, x, y, size: 26, weight: 700, color: theme.heading, lineH: 34, maxW: GRID_COL }) + 4;
      y += drawText(ctx, { text: project.description, x, y, size: 22, color: theme.text, lineH: 28, maxW: GRID_COL }) + 4;
      y += drawText(ctx, { text: project.tech.join(' · '), x, y, size: 18, family: MONO, weight: 500, color: theme.accent, lineH: 24, maxW: GRID_COL }) + 10;
      const width = pill(ctx, x, y, project.links[0]?.label ?? '', { size: 20, weight: 700, ink: theme.heading, edge: theme.marker, icon: 'link' });
      const href = project.links[0]?.href;
      if (href) regions.push({ x, y: page * H + y, w: width, h: PILL_H, action: { kind: 'open', href }, pad: touchPad(minTouchPx, width, PILL_H) });
      y += PILL_H + GRID_GAP;
    });
  });
}

function paintIndex(
  ctx: CanvasRenderingContext2D,
  entries: Project[],
  slots: Map<Project, number>,
  page: number,
  regions: Region<SheetAction>[],
  minTouchPx: number,
): void {
  const ROW = Math.floor(BODY_H / Math.max(1, entries.length));

  entries.forEach((project, index) => {
    const target = slots.get(project) ?? 0;
    const rowY = BODY_TOP + index * ROW;
    if (index > 0) hr(ctx, theme.border, MARGIN, rowY - 2, COL_W, 1.5);

    const titleY = rowY + 12;
    const titleH = drawText(ctx, { text: project.title, x: MARGIN, y: titleY, size: 26, weight: 700, color: theme.heading, lineH: 34, maxW: INDEX_COL });

    let lineY = titleY + titleH + 4;
    const descH = textHeight(ctx, { text: project.description, size: 20, lineH: 26, maxW: INDEX_COL });
    if (descH <= 26) {
      lineY += drawText(ctx, { text: project.description, x: MARGIN, y: lineY, size: 20, color: theme.text, lineH: 26, maxW: INDEX_COL });
    } else {
      const tech = project.tech.join(' · ');
      if (textHeight(ctx, { text: tech, size: 18, family: MONO, weight: 500, lineH: 24, maxW: INDEX_COL }) <= 24) {
        lineY += drawText(ctx, { text: tech, x: MARGIN, y: lineY, size: 18, family: MONO, weight: 500, color: theme.accent, lineH: 24, maxW: INDEX_COL });
      }
      if (project.metrics?.length) {
        fillRect(ctx, theme.marker, MARGIN + 2, lineY + 6, 9, 9);
        drawText(ctx, { text: `${project.metrics.length} métricas en su plano`, x: MARGIN + 26, y: lineY, size: 18, color: theme.dim, lineH: 24, maxW: INDEX_COL - 26 });
      }
    }

    const midY = rowY + Math.round(ROW / 2);
    drawText(ctx, { text: `PLANO ${target + 1}`, x: W - MARGIN - 52, y: midY - 11, size: 22, family: MONO, weight: 500, color: theme.heading, align: 'right' });
    glyph(ctx, 'right', W - MARGIN - 18, midY, 26, theme.marker);

    regions.push({
      x: MARGIN,
      y: page * H + rowY,
      w: COL_W,
      h: ROW,
      action: { kind: 'goto', plan: target },
      pad: touchPad(minTouchPx, COL_W, ROW),
    });
  });
}

function paintFooter(
  ctx: CanvasRenderingContext2D,
  plan: number,
  pages: number,
  regions: Region<SheetAction>[],
  minTouchPx: number,
): void {
  const y = FOOT_TOP;
  const chipPad = touchPad(minTouchPx, CHIP_W, CHIP_H);
  if (pages > 1) {
    if (plan > 0) {
      roundRect(ctx, MARGIN, y, CHIP_W, CHIP_H, 22);
      ctx.fillStyle = theme.active;
      ctx.fill();
      stroke(ctx, theme.marker, 2);
      glyph(ctx, 'left', MARGIN + CHIP_W / 2, y + CHIP_H / 2, 30, theme.text);
      regions.push({ x: MARGIN, y: plan * H + y, w: CHIP_W, h: CHIP_H, action: { kind: 'plan', dir: -1 }, pad: chipPad });
    }
    if (plan < pages - 1) {
      const x = MARGIN + CHIP_W + CHIP_GAP;
      roundRect(ctx, x, y, CHIP_W, CHIP_H, 22);
      ctx.fillStyle = theme.active;
      ctx.fill();
      stroke(ctx, theme.marker, 2);
      glyph(ctx, 'right', x + CHIP_W / 2, y + CHIP_H / 2, 30, theme.text);
      regions.push({ x, y: plan * H + y, w: CHIP_W, h: CHIP_H, action: { kind: 'plan', dir: 1 }, pad: chipPad });
    }
    ctx.fillStyle = theme.border;
    for (let dot = MARGIN + (CHIP_W + CHIP_GAP) * 2 + 6; dot < W - MARGIN - 450; dot += 10) ctx.fillRect(dot, y + CHIP_H / 2 - 1, 4, 2);
  }

  const boxW = 430;
  const boxX = W - MARGIN - boxW;
  ctx.save();
  ctx.beginPath();
  ctx.rect(boxX, y - 6, boxW, 56);
  stroke(ctx, theme.marker, 2);
  ctx.beginPath();
  ctx.moveTo(boxX + boxW * 0.5, y - 6);
  ctx.lineTo(boxX + boxW * 0.5, y + 50);
  stroke(ctx, theme.border, 1.5);
  ctx.restore();
  drawText(ctx, { text: `PLANO ${plan + 1} / ${pages}`, x: boxX + 16, y: y + 2, size: 22, family: MONO, weight: 500, color: theme.heading });
  drawText(ctx, { text: LABEL, x: boxX + 16, y: y + 28, size: 16, family: MONO, color: theme.dim });
  drawText(ctx, { text: 'AUTORA', x: boxX + boxW * 0.5 + 14, y: y + 2, size: 16, family: MONO, weight: 500, color: theme.dim });
  drawText(ctx, { text: profile.name.toUpperCase(), x: boxX + boxW * 0.5 + 14, y: y + 24, size: 18, family: MONO, weight: 500, color: theme.accent });
}

export function paintBlueprintSheet(
  ctx: CanvasRenderingContext2D,
  { plan, focused, minTouchPx = 0 }: { plan: number; focused?: string | null; minTouchPx?: number },
): {
  regions: Region<SheetAction>[];
  contentHeight: number;
  viewport: number;
  pages: number;
  targets: { href: string; plan: number }[];
} {
  const { plans, slots } = buildPlans(ctx);
  const pages = plans.length;
  const current = Math.min(pages - 1, Math.max(0, Math.round(plan)));
  const entry = plans[current];
  const caption =
    entry.kind === 'index'
      ? `Índice · ${COUNT}`
      : entry.kind === 'featured'
        ? COUNT
        : 'Ficha de proyectos';

  fillRect(ctx, theme.canvas, 0, 0, W, H);
  paintFrame(ctx);
  paintHeader(ctx, caption);

  const regions: Region<SheetAction>[] = [];
  if (entry.kind === 'index') paintIndex(ctx, projects.filter((project) => slots.has(project)), slots, current, regions, minTouchPx);
  else if (entry.kind === 'featured') paintFeatured(ctx, entry.project, current, regions, minTouchPx);
  else paintGrid(ctx, entry.columns, current, regions, minTouchPx);

  paintFooter(ctx, current, pages, regions, minTouchPx);
  paintFocus(ctx, theme, regions, focused, (action) => (action.kind === 'open' ? action.href : null), current * H);

  const targets = plans.flatMap((item, index) => planProjects(item).flatMap((project) => project.links.map((link) => ({ href: link.href, plan: index }))));

  return { regions, contentHeight: pages * H, viewport: H, pages, targets };
}
