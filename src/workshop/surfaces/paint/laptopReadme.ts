import { profile, projects, skillCategories } from '../../../record/content';
import { PALETTE } from '../../../shared/theme';
import type { Region } from '../regions';
import { drawText, fillRect, glyph, hr, MONO, roundRect, SANS, themeFor, type SurfaceTheme } from './toolkit';

export const LAPTOP_TEX: [number, number] = [1024, 692];

const TITLE_H = 30;
const STATUS_H = 24;
const ACTIVITY_W = 44;
const SIDEBAR_W = 180;
const TAB_H = 32;
const BREAD_H = 22;

const EDITOR_X = ACTIVITY_W + SIDEBAR_W;
const TOTAL_EDITOR_W = LAPTOP_TEX[0] - EDITOR_X;
const EDITOR_TOP = TITLE_H + TAB_H + BREAD_H;

// Panel split: arriba README (55%), abajo TERMINAL (45%)
const SPLIT_Y = 370;
const README_H = SPLIT_Y - EDITOR_TOP;
const TERMINAL_BAR_H = 28;
const TERMINAL_TOP = SPLIT_Y + TERMINAL_BAR_H;
const TERMINAL_BOTTOM = LAPTOP_TEX[1] - STATUS_H;
const TERMINAL_H = TERMINAL_BOTTOM - TERMINAL_TOP;

const TEXT_X = EDITOR_X + 16;

const TAB_LABEL = 'README.md';

export type TerminalCommand = 'help' | 'skills' | 'projects' | 'test' | 'cv' | 'contact' | 'clear';

export interface LaptopAction {
  kind: 'cmd';
  cmd: TerminalCommand;
}

export interface TerminalEntry {
  input: string;
  lines: { text: string; color?: string; bold?: boolean }[];
}

export function executeCommand(cmd: string): TerminalEntry {
  const trimmed = cmd.trim().toLowerCase();
  switch (trimmed) {
    case 'help':
    case 'ayuda':
      return {
        input: cmd,
        lines: [
          { text: 'Comandos disponibles en workshop CLI:', bold: true, color: '#8fd0a8' },
          { text: '  skills    → Muestra el stack frontend & arquitectura' },
          { text: '  projects  → Resumen de proyectos destacados' },
          { text: '  test      → Ejecuta suite de tests simulada (QA / TDD)' },
          { text: '  cv        → Abre / descarga el CV en PDF' },
          { text: '  contact   → Muestra datos y enlaces de contacto directo' },
          { text: '  clear     → Limpia la pantalla de la terminal' },
        ],
      };
    case 'skills':
    case 'stack':
      return {
        input: cmd,
        lines: [
          { text: 'STACK TECNOLÓGICO PRINCIPAL:', bold: true, color: '#8fd0a8' },
          ...skillCategories.map((cat) => ({
            text: `  • ${cat.label}: ${cat.skills.join(', ')}`,
          })),
        ],
      };
    case 'projects':
    case 'proyectos':
      return {
        input: cmd,
        lines: [
          { text: 'PROYECTOS DESTACADOS:', bold: true, color: '#8fd0a8' },
          ...projects.slice(0, 3).map((p) => ({
            text: `  ⚡ ${p.title} (${p.tech.slice(0, 4).join(', ')})`,
          })),
          { text: '  (Pasa al plano en la mesa para ver métricas y planos)', color: '#d9b382' },
        ],
      };
    case 'test':
    case 'npm test':
      return {
        input: cmd,
        lines: [
          { text: '$ vitest run --coverage', color: '#a9c4b1' },
          { text: '✓ tests/clean-architecture.spec.ts (4 passed)', color: '#8fd0a8' },
          { text: '✓ tests/webgl-workshop.spec.ts (8 passed)', color: '#8fd0a8' },
          { text: '✓ tests/accessibility-wcag.spec.ts (12 passed)', color: '#8fd0a8' },
          { text: 'Test Files  3 passed (3)', bold: true, color: '#8fd0a8' },
          { text: 'Coverage    98.4% Statements | 100% Core UX', bold: true, color: '#8fd0a8' },
        ],
      };
    case 'cv':
    case 'resume':
      if (typeof window !== 'undefined' && profile.resumePdf) {
        window.open(profile.resumePdf, '_blank');
      }
      return {
        input: cmd,
        lines: [
          { text: 'Descargando Ana_Alonso_resume.pdf...', color: '#8fd0a8' },
          { text: '✓ Archivo abierto en nueva pestaña.', color: '#a9c4b1' },
        ],
      };
    case 'contact':
    case 'contacto':
      return {
        input: cmd,
        lines: [
          { text: 'INFORMACIÓN DE CONTACTO:', bold: true, color: '#8fd0a8' },
          { text: `  • Email:    ${profile.contactEmail}` },
          { text: `  • Ubicación: ${profile.location}` },
          { text: `  • GitHub:   github.com/anaalonso (en el teléfono de la mesa)` },
        ],
      };
    case 'clear':
      return { input: cmd, lines: [] };
    default:
      return {
        input: cmd,
        lines: [
          { text: `bash: comando no encontrado: ${cmd}`, color: '#e06c75' },
          { text: 'Escribe "help" para ver los comandos disponibles.', color: '#8f97a3' },
        ],
      };
  }
}

function chrome(ctx: CanvasRenderingContext2D, theme: SurfaceTheme): void {
  const [w, h] = LAPTOP_TEX;
  fillRect(ctx, theme.canvas, 0, 0, w, h);

  // Barra de título de la ventana
  fillRect(ctx, theme.chromeDeep, 0, 0, w, TITLE_H);
  [PALETTE.blush, PALETTE.oat, PALETTE.sage].forEach((color, index) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(18 + index * 18, TITLE_H / 2, 5, 0, Math.PI * 2);
    ctx.fill();
  });
  drawText(ctx, {
    text: `${TAB_LABEL} — Portfolio & Terminal — Visual Studio Code`,
    x: w / 2,
    y: 8,
    size: 13,
    family: SANS,
    color: theme.dim,
    align: 'center',
  });

  // Barra de actividades lateral (iconos de VS Code)
  fillRect(ctx, theme.chromeDeep, 0, TITLE_H, ACTIVITY_W, h - TITLE_H - STATUS_H);
  (['file', 'search', 'branch', 'grid'] as const).forEach((kind, index) => {
    const cy = TITLE_H + 34 + index * 46;
    if (index === 0) fillRect(ctx, theme.accent, 0, cy - 16, 2, 32);
    glyph(ctx, kind, ACTIVITY_W / 2, cy, 22, index === 0 ? theme.text : theme.dim);
  });

  // Barra lateral del explorador
  fillRect(ctx, theme.chrome, ACTIVITY_W, TITLE_H, SIDEBAR_W, h - TITLE_H - STATUS_H);
  drawText(ctx, { text: 'EXPLORER', x: ACTIVITY_W + 14, y: TITLE_H + 12, size: 11, family: SANS, weight: 700, color: theme.dim });
  drawText(ctx, { text: 'PORTFOLIO', x: ACTIVITY_W + 14, y: TITLE_H + 38, size: 12, family: SANS, weight: 700, color: theme.text });
  const tree = ['README.md', 'src/workshop', 'public/cv.pdf', 'package.json', 'vite.config.ts'];
  tree.forEach((name, index) => {
    const y = TITLE_H + 62 + index * 26;
    const selected = name === TAB_LABEL;
    if (selected) fillRect(ctx, theme.active, ACTIVITY_W + 6, y - 4, SIDEBAR_W - 12, 23);
    glyph(ctx, name.includes('.') ? 'file' : 'folder', ACTIVITY_W + 24, y + 6, 13, selected ? theme.accent : theme.dim);
    drawText(ctx, { text: name, x: ACTIVITY_W + 38, y, size: 13.5, family: MONO, color: selected ? theme.text : theme.dim });
  });
  hr(ctx, theme.border, ACTIVITY_W + SIDEBAR_W, TITLE_H, 1, h - TITLE_H - STATUS_H);
}

function tabs(ctx: CanvasRenderingContext2D, theme: SurfaceTheme): void {
  const w = 46 + TAB_LABEL.length * 9;
  fillRect(ctx, theme.canvas, EDITOR_X, TITLE_H, w, TAB_H);
  fillRect(ctx, theme.accent, EDITOR_X, TITLE_H, w, 2);
  glyph(ctx, 'file', EDITOR_X + 18, TITLE_H + TAB_H / 2, 14, theme.accent);
  drawText(ctx, { text: TAB_LABEL, x: EDITOR_X + 32, y: TITLE_H + 8, size: 14, family: SANS, color: theme.text });
  fillRect(ctx, theme.chrome, EDITOR_X + w, TITLE_H, LAPTOP_TEX[0] - EDITOR_X - w, TAB_H);
  hr(ctx, theme.border, EDITOR_X, TITLE_H + TAB_H, LAPTOP_TEX[0] - EDITOR_X, 1);
  drawText(ctx, { text: `portfolio › ${TAB_LABEL}`, x: TEXT_X, y: TITLE_H + TAB_H + 4, size: 13, family: SANS, color: theme.dim });
  hr(ctx, theme.border, EDITOR_X, EDITOR_TOP, LAPTOP_TEX[0] - EDITOR_X, 1);
}

function paintReadmeDoc(ctx: CanvasRenderingContext2D, theme: SurfaceTheme, regions: Region<LaptopAction>[]): void {
  ctx.save();
  ctx.beginPath();
  ctx.rect(EDITOR_X, EDITOR_TOP, TOTAL_EDITOR_W, README_H);
  ctx.clip();

  let y = EDITOR_TOP + 12;

  // H1: Taller & Terminal Interactiva
  drawText(ctx, { text: '# Workshop 3D & Developer Terminal', x: TEXT_X, y, size: 24, weight: 700, family: SANS, color: theme.heading });
  y += 32;

  // Introducción clara para RRHH y Reclutadores
  drawText(ctx, {
    text: 'Bienvenido/a al portfolio interactivo de Ana Alonso (Ingeniería del Software).',
    x: TEXT_X,
    y,
    size: 17,
    weight: 600,
    family: SANS,
    color: theme.text,
  });
  y += 24;
  drawText(ctx, {
    text: 'Diseñado con React 19, Three.js y arquitectura limpia. Puedes explorar los objetos de la mesa o ejecutar comandos abajo:',
    x: TEXT_X,
    y,
    size: 15,
    family: SANS,
    color: theme.dim,
  });
  y += 28;

  // Botones rápidos de comando clicables
  drawText(ctx, { text: 'ACCESOS DIRECTOS (haz clic para ejecutar en terminal):', x: TEXT_X, y, size: 14, family: MONO, weight: 700, color: theme.marker });
  y += 22;

  const quickButtons: { label: string; cmd: TerminalCommand }[] = [
    { label: 'npm test', cmd: 'test' },
    { label: 'skills', cmd: 'skills' },
    { label: 'projects', cmd: 'projects' },
    { label: 'descargar cv', cmd: 'cv' },
    { label: 'contact', cmd: 'contact' },
  ];

  let btnX = TEXT_X;
  quickButtons.forEach((btn) => {
    ctx.font = `600 14px ${MONO}`;
    const txtW = ctx.measureText(btn.label).width;
    const btnW = txtW + 22;
    const btnH = 30;

    roundRect(ctx, btnX, y, btnW, btnH, 6);
    ctx.fillStyle = theme.active;
    ctx.fill();
    ctx.strokeStyle = theme.accent;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    drawText(ctx, { text: btn.label, x: btnX + 11, y: y + 7, size: 14, family: MONO, weight: 600, color: theme.accent });

    regions.push({
      x: btnX,
      y,
      w: btnW,
      h: btnH,
      action: { kind: 'cmd', cmd: btn.cmd },
    });

    btnX += btnW + 12;
  });

  ctx.restore();
}

function paintTerminal(
  ctx: CanvasRenderingContext2D,
  history: TerminalEntry[],
  currentInput: string,
  cursorVisible: boolean,
): void {
  // Barra superior de la terminal
  fillRect(ctx, '#181b20', EDITOR_X, SPLIT_Y, TOTAL_EDITOR_W, TERMINAL_BAR_H);
  hr(ctx, '#3a4048', EDITOR_X, SPLIT_Y, TOTAL_EDITOR_W, 1);

  // Tabs de panel
  const tabs = ['PROBLEMS  0', 'OUTPUT', 'DEBUG CONSOLE', 'TERMINAL', 'PORTS'];
  let tabX = EDITOR_X + 16;
  tabs.forEach((t) => {
    const isTerm = t === 'TERMINAL';
    ctx.font = `${isTerm ? '700' : '500'} 11.5px ${SANS}`;
    drawText(ctx, {
      text: t,
      x: tabX,
      y: SPLIT_Y + 7,
      size: 11.5,
      weight: isTerm ? 700 : 500,
      family: SANS,
      color: isTerm ? '#dfe4ea' : '#8f97a3',
    });
    if (isTerm) {
      fillRect(ctx, '#8fd0a8', tabX, SPLIT_Y + TERMINAL_BAR_H - 2, ctx.measureText(t).width, 2);
    }
    tabX += ctx.measureText(t).width + 20;
  });

  // Fondo de la consola terminal
  fillRect(ctx, '#14161a', EDITOR_X, TERMINAL_TOP, TOTAL_EDITOR_W, TERMINAL_H);

  // Contenido de la terminal
  ctx.save();
  ctx.beginPath();
  ctx.rect(EDITOR_X + 12, TERMINAL_TOP + 8, TOTAL_EDITOR_W - 24, TERMINAL_H - 16);
  ctx.clip();

  // Calcular líneas a mostrar (las más recientes al fondo)
  const allRenderLines: { text: string; color?: string; bold?: boolean }[] = [];
  history.forEach((entry) => {
    allRenderLines.push({ text: `ana@workshop:~$ ${entry.input}`, color: '#8fd0a8', bold: true });
    entry.lines.forEach((l) => allRenderLines.push(l));
  });

  // Añadir la línea actual en edición
  allRenderLines.push({
    text: `ana@workshop:~$ ${currentInput}${cursorVisible ? '█' : ' '}`,
    color: '#dfe4ea',
    bold: true,
  });

  const LINE_HEIGHT = 22;
  const maxVisibleLines = Math.floor((TERMINAL_H - 16) / LINE_HEIGHT);
  const startIdx = Math.max(0, allRenderLines.length - maxVisibleLines);
  const visibleLines = allRenderLines.slice(startIdx);

  let curY = TERMINAL_TOP + 10;
  visibleLines.forEach((line) => {
    drawText(ctx, {
      text: line.text,
      x: EDITOR_X + 16,
      y: curY,
      size: 15.5,
      family: MONO,
      weight: line.bold ? 700 : 500,
      color: line.color ?? '#c5ccd6',
    });
    curY += LINE_HEIGHT;
  });

  ctx.restore();
}

function statusBar(ctx: CanvasRenderingContext2D, theme: SurfaceTheme): void {
  const [w, h] = LAPTOP_TEX;
  fillRect(ctx, theme.chromeDeep, 0, h - STATUS_H, w, STATUS_H);
  const items = ['main*', 'UTF-8', 'TypeScript', 'Node v22.4', 'Prettier'];
  let x = 14;
  for (const item of items) {
    drawText(ctx, { text: item, x, y: h - STATUS_H + 5, size: 12, family: SANS, color: theme.dim });
    x += ctx.measureText(item).width + 24;
  }
  drawText(ctx, { text: 'Ana Alonso Portfolio CLI', x: w - 14, y: h - STATUS_H + 5, size: 12, family: SANS, color: theme.dim, align: 'right' });
}

export function paintLaptopScreen(
  ctx: CanvasRenderingContext2D,
  {
    night,
    history,
    currentInput,
    cursorVisible,
  }: {
    night: boolean;
    history: TerminalEntry[];
    currentInput: string;
    cursorVisible: boolean;
  },
): { contentHeight: number; viewport: number; regions: Region<LaptopAction>[] } {
  const theme = themeFor(night);
  chrome(ctx, theme);
  tabs(ctx, theme);

  const regions: Region<LaptopAction>[] = [];
  paintReadmeDoc(ctx, theme, regions);
  paintTerminal(ctx, history, currentInput, cursorVisible);
  statusBar(ctx, theme);

  return { contentHeight: LAPTOP_TEX[1], viewport: LAPTOP_TEX[1], regions };
}
