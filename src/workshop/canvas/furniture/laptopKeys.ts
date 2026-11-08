const FIELD_W = 0.38;
const FIELD_Z = -0.128;
const ROW_PITCH = 0.026;
const CAP_D = 0.0225;
const CAP_H = 0.0022;
const GAP = 0.002;
const WELL_TOP = 0.0175;

// Fila 0: Teclas de función (F1-F12 + Esc + TouchID) con menor fondo
// Filas 1-5: Numérica, QWERTY, Home, Modificadores, Barra espaciadora y flechas
const ROWS: { units: number[]; d?: number }[] = [
  { units: [1.2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.2], d: 0.0135 },
  { units: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.6] },
  { units: [1.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.1] },
  { units: [1.8, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.8] },
  { units: [2.3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.3] },
  { units: [1.3, 1.1, 1.3, 5.2, 1.3, 1.1, 0.9, 0.9, 0.9] },
];

export interface Keycap {
  position: [number, number, number];
  scale: [number, number, number];
}

export const KEYCAPS: Keycap[] = ROWS.flatMap((row, index) => {
  const step = FIELD_W / row.units.reduce((total, unit) => total + unit, 0);
  let x = -FIELD_W / 2;
  const d = row.d ?? CAP_D;
  return row.units.map((unit) => {
    const cap: Keycap = {
      position: [x + (unit * step) / 2, WELL_TOP + CAP_H / 2, FIELD_Z + index * ROW_PITCH],
      scale: [unit * step - GAP, CAP_H, d],
    };
    x += unit * step;
    return cap;
  });
});

export const KEY_FIELD = {
  z: FIELD_Z + ((ROWS.length - 1) * ROW_PITCH) / 2,
  w: FIELD_W + 0.012,
  d: (ROWS.length - 1) * ROW_PITCH + CAP_D + 0.012,
};
