import { CanvasTexture, LinearMipmapLinearFilter, RepeatWrapping, SRGBColorSpace } from 'three';
import { PALETTE } from '../../shared/theme';

type Painter = (ctx: CanvasRenderingContext2D, w: number, h: number) => void;

function make(size: [number, number], repeat: [number, number], paint: Painter): CanvasTexture {
  const [w, h] = size;
  const node = document.createElement('canvas');
  node.width = w;
  node.height = h;
  const ctx = node.getContext('2d');
  if (ctx) paint(ctx, w, h);
  const tex = new CanvasTexture(node);
  tex.colorSpace = SRGBColorSpace;
  tex.wrapS = tex.wrapT = RepeatWrapping;
  tex.repeat.set(repeat[0], repeat[1]);
  tex.minFilter = LinearMipmapLinearFilter;
  tex.generateMipmaps = true;
  tex.anisotropy = 8;
  return tex;
}

export function wallpaperTexture(metersPerTile: number): CanvasTexture {
  return make([512, 512], [1 / metersPerTile, 1 / metersPerTile], (ctx, w, h) => {
    // Fondo mate estilo yeso/lino arquitectónico contemporáneo (Apple Studio vibe)
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#f8f9fa');
    bg.addColorStop(0.5, '#f3f4f6');
    bg.addColorStop(1, '#ebeef2');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // Microtextura sutil de grano estucado
    ctx.fillStyle = '#00000004';
    for (let i = 0; i < 4000; i++) {
      const rx = (i * 127) % w;
      const ry = (i * 311) % h;
      ctx.fillRect(rx, ry, 1.5, 1.5);
    }

    // Paneles arquitectónicos con finas juntas de sombra muy suaves
    ctx.strokeStyle = '#d5dae240';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(w / 2, 0);
    ctx.lineTo(w / 2, h);
    ctx.stroke();

    ctx.strokeStyle = '#ffffff80';
    ctx.beginPath();
    ctx.moveTo(w / 2 + 1, 0);
    ctx.lineTo(w / 2 + 1, h);
    ctx.stroke();
  });
}

export function parquetTexture(metersX: number, metersY: number): CanvasTexture {
  return make([1024, 512], [1 / metersX, 1 / metersY], (ctx, w, h) => {
    // Parqué de roble natural nórdico con vetas orgánicas y biselado
    ctx.fillStyle = '#bca082';
    ctx.fillRect(0, 0, w, h);

    const rows = 4;
    const plankH = h / rows;
    const plankW = w / 2;
    // Variación sutil y armónica de tonos de madera natural
    const plankTones = ['#c8ad8f', '#bfa383', '#d0b597', '#b59979'];

    for (let r = 0; r < rows; r += 1) {
      const shift = (r % 2) * (plankW / 2);
      for (let k = -1; k * plankW < w + plankW; k += 1) {
        const x = shift + k * plankW;
        const toneIdx = ((r * 2 + k) % plankTones.length + plankTones.length) % plankTones.length;
        ctx.fillStyle = plankTones[toneIdx];
        ctx.fillRect(x + 1.5, r * plankH + 1.5, plankW - 3, plankH - 3);

        // Biselado perimetral de sombra e iluminación (efecto tabla real 3D)
        ctx.fillStyle = 'rgba(0,0,0,0.12)';
        ctx.fillRect(x, r * plankH + plankH - 1.5, plankW, 1.5);
        ctx.fillRect(x + plankW - 1.5, r * plankH, 1.5, plankH);

        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.fillRect(x, r * plankH, plankW, 1.5);
        ctx.fillRect(x, r * plankH, 1.5, plankH);

        // Vetas finas longitudinales continuas con ondas naturales
        ctx.strokeStyle = 'rgba(88, 62, 38, 0.08)';
        ctx.lineWidth = 1;
        for (let g = 0; g < 8; g += 1) {
          const gy = r * plankH + 8 + g * (plankH / 9);
          ctx.beginPath();
          ctx.moveTo(x + 4, gy);
          const cp1x = x + plankW * 0.25;
          const cp1y = gy + Math.sin(g * 1.5) * 4;
          const cp2x = x + plankW * 0.75;
          const cp2y = gy - Math.cos(g * 1.2) * 4;
          ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x + plankW - 4, gy);
          ctx.stroke();
        }
      }
    }
  });
}

export function deskWoodTexture(metersX: number, metersY: number): CanvasTexture {
  return make([1024, 512], [1 / metersX, 1 / metersY], (ctx, w, h) => {
    // Madera de roble claro escandinavo con vetas aterciopeladas
    const base = ctx.createLinearGradient(0, 0, w, 0);
    base.addColorStop(0, '#e5dacf');
    base.addColorStop(0.35, '#ded2c5');
    base.addColorStop(0.7, '#e8ddd2');
    base.addColorStop(1, '#e2d6c9');
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, w, h);

    // Micro-poro de madera natural
    ctx.fillStyle = 'rgba(70, 48, 30, 0.025)';
    for (let i = 0; i < 3500; i++) {
      const rx = (i * 73) % w;
      const ry = (i * 197) % h;
      ctx.fillRect(rx, ry, 2, 1);
    }

    // Vetas sutiles horizontales de roble
    for (let i = 0; i < 28; i++) {
      const y = (i * (h / 28)) + ((i * 17) % 7);
      ctx.strokeStyle = i % 3 === 0 ? 'rgba(102, 74, 50, 0.045)' : 'rgba(255, 255, 255, 0.06)';
      ctx.lineWidth = i % 2 === 0 ? 1.5 : 1;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(w * 0.25, y + 2.5, w * 0.75, y - 2.5, w, y);
      ctx.stroke();
    }
  });
}

export function rugTexture(): CanvasTexture {
  return make([256, 256], [1, 1], (ctx, w, h) => {
    ctx.fillStyle = PALETTE.rainDeep;
    ctx.fillRect(0, 0, w, h);

    for (let y = 0; y < h; y += 8) {
      for (let x = 0; x < w; x += 8) {
        ctx.fillStyle = (x / 8 + y / 8) % 2 ? `${PALETTE.oat}33` : `${PALETTE.sage}26`;
        ctx.fillRect(x, y, 6, 6);
      }
    }

    ctx.strokeStyle = `${PALETTE.blushSoft}cc`;
    ctx.lineWidth = 5;
    ctx.strokeRect(14, 14, w - 28, h - 28);
    ctx.strokeStyle = `${PALETTE.oat}88`;
    ctx.lineWidth = 2;
    ctx.strokeRect(26, 26, w - 52, h - 52);
  });
}

export function corkTexture(metersPerTile: number): CanvasTexture {
  return make([512, 512], [1 / metersPerTile, 1 / metersPerTile], (ctx, w, h) => {
    // Fondo base de corcho natural prensado de grano fino
    const bg = ctx.createRadialGradient(w / 2, h / 2, 20, w / 2, h / 2, w * 0.7);
    bg.addColorStop(0, '#cda77d');
    bg.addColorStop(1, '#be9466');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    const wrap: readonly [number, number][] = [
      [0, 0],
      [-w, 0],
      [0, -h],
      [-w, -h],
    ];

    let seed = 48271;
    const next = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };

    // Manchas orgánicas de densidad celular de corcho
    for (let s = 0; s < 18; s += 1) {
      const x = next() * w;
      const y = next() * h;
      const r = 18 + next() * 28;
      for (const [ox, oy] of wrap) {
        const spot = ctx.createRadialGradient(x + ox, y + oy, 0, x + ox, y + oy, r);
        spot.addColorStop(0, 'rgba(112, 78, 48, 0.22)');
        spot.addColorStop(0.6, 'rgba(112, 78, 48, 0.08)');
        spot.addColorStop(1, 'rgba(112, 78, 48, 0)');
        ctx.fillStyle = spot;
        ctx.fillRect(x + ox - r, y + oy - r, r * 2, r * 2);
      }
    }

    // Granulado fino de partículas de corteza
    for (let i = 0; i < 2800; i += 1) {
      const x = next() * w;
      const y = next() * h;
      const size = 1 + next() * 2.2;
      const toneVal = next();
      if (toneVal < 0.45) {
        ctx.fillStyle = 'rgba(74, 50, 30, 0.28)';
      } else if (toneVal < 0.75) {
        ctx.fillStyle = 'rgba(235, 218, 192, 0.35)';
      } else {
        ctx.fillStyle = 'rgba(164, 126, 88, 0.25)';
      }
      for (const [ox, oy] of wrap) ctx.fillRect(x + ox, y + oy, size, size);
    }
  });
}

const SKY: [number, number] = [256, 320];
export function skyDayTexture(): CanvasTexture {
  return make(SKY, [1, 1], (ctx, w, h) => {
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, PALETTE.sunPane);
    sky.addColorStop(0.62, '#e8f0f6');
    sky.addColorStop(1, PALETTE.porcelain);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = `${PALETTE.rainDeep}2e`;
    const roofs: [number, number, number, number][] = [
      [0, 236, 74, 84],
      [66, 252, 58, 68],
      [118, 224, 62, 96],
      [172, 248, 84, 72],
    ];
    for (const [x, y, cw, ch] of roofs) ctx.fillRect(x, y, cw, ch);

    ctx.fillStyle = `${PALETTE.rainDeep}44`;
    for (const [x, y, cw] of roofs) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + cw / 2, y - 16);
      ctx.lineTo(x + cw, y);
      ctx.closePath();
      ctx.fill();
    }
  });
}

export function skyNightTexture(): CanvasTexture {
  return make(SKY, [1, 1], (ctx, w, h) => {
    // Cielo nocturno profundo estilo Apple macOS / iOS con degradado cósmico
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, '#06080e');
    sky.addColorStop(0.4, '#0c121e');
    sky.addColorStop(0.75, '#121b2d');
    sky.addColorStop(1, '#1b2438');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    // Luna con halo suave y brillo atmosférico
    const moonX = w * 0.7;
    const moonY = h * 0.22;
    const moonR = 24;

    const halo = ctx.createRadialGradient(moonX, moonY, moonR * 0.5, moonX, moonY, moonR * 2.8);
    halo.addColorStop(0, '#eaf2ff33');
    halo.addColorStop(0.5, '#b9d2f815');
    halo.addColorStop(1, '#00000000');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonR * 2.8, 0, Math.PI * 2);
    ctx.fill();

    // Luna creciente estética
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0e1624';
    ctx.beginPath();
    ctx.arc(moonX + 11, moonY - 5, moonR * 0.9, 0, Math.PI * 2);
    ctx.fill();

    // Estrellas tenues parpadeantes con diferentes opacidades
    for (let i = 0; i < 48; i += 1) {
      const x = ((i * 89 + 17) % (w - 20)) + 10;
      const y = ((i * 47 + 23) % (h * 0.65)) + 8;
      const alpha = 0.25 + 0.65 * Math.sin(i * 1.7);
      ctx.fillStyle = `rgba(224, 238, 255, ${Math.max(0.15, alpha)})`;
      const size = i % 7 === 0 ? 2 : 1;
      ctx.fillRect(x, y, size, size);
    }

    // Gotas de lluvia estilizadas con estela translúcida
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 55; i += 1) {
      const x = (i * 29) % w;
      const y = (i * 59) % h;
      const grad = ctx.createLinearGradient(x, y, x - 4, y + 18);
      grad.addColorStop(0, 'rgba(186, 215, 255, 0.45)');
      grad.addColorStop(1, 'rgba(186, 215, 255, 0.05)');
      ctx.strokeStyle = grad;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - 4, y + 18);
      ctx.stroke();
    }
  });
}
