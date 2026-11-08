import { Quaternion, Vector3 } from 'three';
import { DESK_TOP } from './Desk';

type Vec = [number, number, number];
type Quat = [number, number, number, number];
type Arm = { mid: Vec; quat: Quat; length: number; radius: number; castShadow: boolean };

export const LAMP_BASE: Vec = [-0.98, DESK_TOP, -0.5];

const J1: Vec = [0, 0.022, 0];
const J2: Vec = [0, 0.28, 0];
const J3: Vec = [0.165, 0.6, 0.1725];
const J4: Vec = [0.0395, 0.56, 0.385];

export const LAMP_JOINTS: Vec[] = [J1, J2, J3, J4];

// Punto donde cae el haz de la lámpara en modo noche. Está en una zona libre
// del escritorio, lejos del logbook ([-0.74, DESK_TOP, 0.02]), para que la luz
// no le dé de encima sobre las páginas y siga siendo legible.
const POOL: Vec = [0.88, 0, 0.75];

export const LAMP_SHADE_L = 0.1;

const Y_AXIS = new Vector3(0, 1, 0);
const Z_AXIS = new Vector3(0, 0, 1);

function segment(from: Vec, to: Vec, radius: number, castShadow: boolean): Arm {
  const a = new Vector3(...from);
  const dir = new Vector3(...to).sub(a);
  const length = dir.length();
  const q = new Quaternion().setFromUnitVectors(Y_AXIS, dir.clone().normalize());
  return {
    mid: [a.x + dir.x / 2, a.y + dir.y / 2, a.z + dir.z / 2],
    quat: [q.x, q.y, q.z, q.w],
    length,
    radius,
    castShadow,
  };
}

function along(from: Vec, toward: Vec, length: number) {
  const a = new Vector3(...from);
  const dir = new Vector3(...toward).sub(a).normalize();
  const q = new Quaternion().setFromUnitVectors(Y_AXIS, dir);
  const end = a.clone().addScaledVector(dir, length);
  const face = new Quaternion().setFromUnitVectors(Z_AXIS, dir);
  return {
    mid: [a.x + dir.x * (length / 2), a.y + dir.y * (length / 2), a.z + dir.z * (length / 2)] as Vec,
    quat: [q.x, q.y, q.z, q.w] as Quat,
    end: [end.x, end.y, end.z] as Vec,
    facing: [face.x, face.y, face.z, face.w] as Quat,
  };
}

const ARM_1 = segment(J1, J2, 0.0075, true);
const ARM_2 = segment(J2, J3, 0.007, true);
const ARM_3 = segment(J3, J4, 0.007, false);

export const LAMP_ARMS: Arm[] = [ARM_1, ARM_2, ARM_3];

export const LAMP_SHADE = along(J4, POOL, LAMP_SHADE_L);

const world = (p: Vec): Vec => [LAMP_BASE[0] + p[0], LAMP_BASE[1] + p[1], LAMP_BASE[2] + p[2]];

export const LAMP_BULB = world(LAMP_SHADE.end);
export const LAMP_POOL = world(POOL);
