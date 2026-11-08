import { education, profile } from '../../../record/content';
import { drawText, fillRect, hr, MONO, roundRect, SANS } from './toolkit';

export const DIPLOMA_TEX: [number, number] = [1200, 850];

const [W, H] = DIPLOMA_TEX;
const MARGIN = 48;
const INNER_MARGIN = MARGIN + 14;

export function paintDiplomaSheet(ctx: CanvasRenderingContext2D): { contentHeight: number; viewport: number } {
  // Fondo de pergamino / papel noble
  fillRect(ctx, '#faf6ef', 0, 0, W, H);

  // Marco exterior ornamental
  ctx.save();
  ctx.strokeStyle = '#8b6f4e';
  ctx.lineWidth = 4;
  ctx.strokeRect(MARGIN, MARGIN, W - MARGIN * 2, H - MARGIN * 2);

  // Marco interior fino
  ctx.strokeStyle = '#8b6f4e88';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(INNER_MARGIN, INNER_MARGIN, W - INNER_MARGIN * 2, H - INNER_MARGIN * 2);

  // Detalles en las esquinas
  const CORNER = 24;
  const corners = [
    [INNER_MARGIN, INNER_MARGIN],
    [W - INNER_MARGIN, INNER_MARGIN],
    [INNER_MARGIN, H - INNER_MARGIN],
    [W - INNER_MARGIN, H - INNER_MARGIN],
  ];
  ctx.strokeStyle = '#4f6b58';
  ctx.lineWidth = 2.5;
  for (const [cx, cy] of corners) {
    const sx = cx === INNER_MARGIN ? 1 : -1;
    const sy = cy === INNER_MARGIN ? 1 : -1;
    ctx.beginPath();
    ctx.moveTo(cx + sx * CORNER, cy);
    ctx.lineTo(cx, cy);
    ctx.lineTo(cx, cy + sy * CORNER);
    ctx.stroke();
  }
  ctx.restore();

  // Encabezado institucional
  let y = MARGIN + 40;
  drawText(ctx, {
    text: 'CERTIFICACIÓN ACADÉMICA Y TÍTULOS',
    x: W / 2,
    y,
    size: 15,
    family: MONO,
    weight: 700,
    color: '#8b6f4e',
    align: 'center',
  });

  y += 28;
  drawText(ctx, {
    text: profile.name.toUpperCase(),
    x: W / 2,
    y,
    size: 34,
    family: SANS,
    weight: 800,
    color: '#2e2a24',
    align: 'center',
  });

  y += 46;
  hr(ctx, '#8b6f4e55', W / 2 - 200, y, 400, 1.5);

  // Bloques de formación (2 títulos)
  y += 28;
  const colW = W - (INNER_MARGIN + 36) * 2;
  const leftX = INNER_MARGIN + 36;

  education.forEach((item, index) => {
    // Fondo de tarjeta suave
    roundRect(ctx, leftX, y, colW, 195, 12);
    ctx.fillStyle = index === 0 ? '#4f6b580d' : '#8b6f4e0c';
    ctx.fill();
    ctx.strokeStyle = index === 0 ? '#4f6b5840' : '#8b6f4e35';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Medalla / Icono decorativo a la izquierda
    const badgeX = leftX + 36;
    const badgeY = y + 42;
    ctx.save();
    ctx.beginPath();
    ctx.arc(badgeX, badgeY, 18, 0, Math.PI * 2);
    ctx.fillStyle = index === 0 ? '#4f6b5825' : '#8b6f4e25';
    ctx.fill();
    ctx.strokeStyle = index === 0 ? '#4f6b58' : '#8b6f4e';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // Texto de la titulación
    const textLeft = leftX + 72;
    const contentW = colW - 90;

    // Periodo (badge superior derecho)
    drawText(ctx, {
      text: item.period ?? '',
      x: leftX + colW - 20,
      y: y + 16,
      size: 14,
      family: MONO,
      weight: 600,
      color: '#4f6b58',
      align: 'right',
    });

    // Título principal
    drawText(ctx, {
      text: item.title,
      x: textLeft,
      y: y + 18,
      size: 20,
      family: SANS,
      weight: 700,
      color: '#2e2a24',
      maxW: contentW - 140,
    });

    // Subtítulo (Universidad / País)
    drawText(ctx, {
      text: item.subtitle ?? '',
      x: textLeft,
      y: y + 48,
      size: 15,
      family: SANS,
      weight: 600,
      color: '#8b6f4e',
      maxW: contentW,
    });

    // Descripción / Cursos relevantes
    drawText(ctx, {
      text: item.body,
      x: textLeft,
      y: y + 78,
      size: 14.5,
      family: SANS,
      color: '#524b42',
      maxW: contentW,
      lineH: 22,
    });

    y += 215;
  });

  // Pie del diploma con sello y firma simbólica
  const footY = H - MARGIN - 48;
  hr(ctx, '#8b6f4e44', INNER_MARGIN + 30, footY - 12, W - (INNER_MARGIN + 30) * 2, 1);

  drawText(ctx, {
    text: 'EXPEDIENTE VERIFICADO · INGENIERÍA DEL SOFTWARE',
    x: INNER_MARGIN + 40,
    y: footY,
    size: 12.5,
    family: MONO,
    color: '#8b6f4e',
  });

  drawText(ctx, {
    text: 'UPNA & UNITBV ERASMUS+',
    x: W - INNER_MARGIN - 40,
    y: footY,
    size: 12.5,
    family: MONO,
    color: '#4f6b58',
    align: 'right',
  });

  return { contentHeight: H, viewport: H };
}
