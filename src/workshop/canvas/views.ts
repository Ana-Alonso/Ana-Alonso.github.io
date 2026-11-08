import { MathUtils, PerspectiveCamera, Quaternion, Vector3 } from 'three';
import type { SectionId } from '../../shared/types';

export type ViewId = 'boot' | 'overview' | 'profileCard' | 'laptop' | 'stack' | 'blueprint' | 'logbook' | 'dictionary' | 'phone' | 'diploma';

export interface View {
  pos: Vector3;
  center: Vector3;
  dir: Vector3;
  quat: Quaternion;
  fov: number;
  screen?: ScreenFit;
}

export interface ScreenFit {
  size: [number, number];
  tex: [number, number];
  coverV: number;
  readPx: number;
  paged?: boolean;
  upAlign: number;
  xAlign: number;
  upSideways: number;
  rightVertical: number;
}

interface Anchor {
  center: [number, number, number];
  radius: number;
  dir: [number, number, number];
  fov: number;
  up?: [number, number, number];
  screen: {
    size: [number, number];
    tex: [number, number];
    coverV: number;
    readPx: number;
    paged?: boolean;
    up: [number, number, number];
    right: [number, number, number];
  };
}

const rig = new PerspectiveCamera();

function aim(pos: Vector3, target: Vector3, up: Vector3, fov: number): View {
  rig.up.copy(up);
  rig.position.copy(pos);
  rig.lookAt(target);
  const dir = pos.clone().sub(target).normalize();
  const view: View = { pos: pos.clone(), center: target.clone(), dir, quat: rig.quaternion.clone(), fov };
  rig.up.set(0, 1, 0);
  return view;
}

function fitDistance(radius: number, fovDeg: number, margin = 1.7) {
  const d = (radius * margin) / Math.sin(MathUtils.degToRad(fovDeg) / 2);
  return Math.max(d, 0.5);
}

function frame(anchor: Anchor): View {
  const center = new Vector3(...anchor.center);
  const dir = new Vector3(...anchor.dir).normalize();
  const view = aim(center.clone().addScaledVector(dir, fitDistance(anchor.radius, anchor.fov)), center, new Vector3(...(anchor.up ?? [0, 1, 0])), anchor.fov);

  const camUp = new Vector3(0, 1, 0).applyQuaternion(view.quat);
  const camRight = new Vector3(1, 0, 0).applyQuaternion(view.quat);
  const sheetUp = new Vector3(...anchor.screen.up).normalize();
  const sheetRight = new Vector3(...anchor.screen.right).normalize();
  view.screen = {
    size: anchor.screen.size,
    tex: anchor.screen.tex,
    coverV: anchor.screen.coverV,
    readPx: anchor.screen.readPx,
    paged: anchor.screen.paged,
    upAlign: Math.abs(camUp.dot(sheetUp)),
    xAlign: Math.abs(camRight.dot(sheetRight)),
    upSideways: Math.abs(camRight.dot(sheetUp)),
    rightVertical: Math.abs(camUp.dot(sheetRight)),
  };
  return view;
}

export const ANCHORS: Record<Exclude<ViewId, 'boot' | 'overview'>, Anchor> = {
  profileCard: {
    center: [-0.62, 0.74, 0.4],
    radius: 0.0907,
    dir: [0.1, 1, 0.26],
    fov: 11,
    up: [0.19867, 0, -0.98007],
    screen: {
      size: [0.105, 0.148],
      tex: [840, 1184],
      coverV: 0.76,
      readPx: 24,
      up: [0.19867, 0, -0.98007],
      right: [0.98007, 0, 0.19867],
    },
  },
  laptop: {
    center: [0, 1.00, -0.15],
    radius: 0.125,
    dir: [0, 0.4, 1],
    fov: 26,
    screen: { size: [0.4, 0.27], tex: [1024, 692], coverV: 1.0, readPx: 25, up: [0, 0.99, -0.14], right: [1, 0, 0] },
  },
  stack: {
    center: [-0.5, 1.32, -1.494],
    radius: 0.55,
    dir: [0, 0.14, 1],
    fov: 32,
    screen: { size: [0.86, 0.6], tex: [860, 600], coverV: 0.68, readPx: 22, up: [0, 1, 0], right: [1, 0, 0] },
  },
  blueprint: {
    center: [0.7736, 0.7408, -0.3106],
    radius: 0.22,
    dir: [0.0, 1, 0.2],
    fov: 24,
    up: [0.2377, 0, -0.97134],
    screen: { size: [0.44, 0.3], tex: [1320, 900], coverV: 0.82, readPx: 24, paged: true, up: [0.2377, 0, -0.97134], right: [0.97134, 0, 0.2377] },
  },

  logbook: {
    center: [-0.72, 0.74, -0.05],
    radius: 0.16,
    dir: [-0.05, 1, -0.22],
    fov: 34,
    up: [-0.3335, 0, -0.9428],
    screen: { size: [0.146, 0.2], tex: [700, 960], coverV: 0.75, readPx: 30, paged: true, up: [-0.3335, 0, -0.9428], right: [0.942, -0.028, -0.333] },
  },
  dictionary: {
    center: [1.02, 0.74, -0.06],
    radius: 0.18,
    dir: [0.12, 1, 0.42],
    fov: 30,
    up: [0.179, 0, -0.984],
    screen: { size: [0.19, 0.25], tex: [700, 921], coverV: 0.7, readPx: 26, up: [0.179, 0, -0.984], right: [0.984, 0, 0.179] },
  },

  phone: {
    center: [0.82, 0.74, 0.32],
    radius: 0.12,
    dir: [0.1, 1, 0.34],
    fov: 30,
    up: [0.315, 0, -0.949],
    screen: { size: [0.068, 0.146], tex: [512, 1100], coverV: 0.62, readPx: 27, up: [0.315, 0, -0.949], right: [0.949, 0, 0.315] },
  },
  diploma: {
    center: [-1.712, 1.38, -0.35],
    radius: 0.34,
    dir: [1.0, 0.04, 0.0],
    fov: 26,
    up: [0, 1, 0],
    screen: { size: [0.58, 0.42], tex: [1200, 850], coverV: 0.78, readPx: 24, up: [0, 1, 0], right: [0, 0, -1] },
  },
};

export const ANCHORS_MOBILE: Partial<Record<ViewId, Anchor>> = {
  diploma: {
    center: [-0.5, 1.88, -1.488],
    radius: 0.34,
    dir: [0.0, 0.08, 1.0],
    fov: 26,
    up: [0, 1, 0],
    screen: { size: [0.58, 0.42], tex: [1200, 850], coverV: 0.78, readPx: 24, up: [0, 1, 0], right: [1, 0, 0] },
  },
  logbook: {
    center: [-0.646, 0.75, -0.076],
    radius: 0.12,
    dir: [-0.05, 1, -0.22],
    fov: 34,
    up: [-0.3335, 0, -0.9428],
    screen: { size: [0.146, 0.2], tex: [700, 960], coverV: 0.75, readPx: 30, paged: true, up: [-0.3335, 0, -0.9428], right: [0.942, -0.028, -0.333] },
  },
  laptop: {
    center: [0, 0.895, -0.28],
    radius: 0.27,
    dir: [0, 0.26, 1],
    fov: 28,
    screen: { size: [0.4, 0.27], tex: [1024, 692], coverV: 0.95, readPx: 25, up: [0, 0.99, -0.14], right: [1, 0, 0] },
  },
  dictionary: {
    center: [0.95, 0.76, -0.06],
    radius: 0.28,
    dir: [0.12, 1, 0.42],
    fov: 32,
    up: [0.179, 0, -0.984],
    screen: { size: [0.46, 0.3], tex: [700, 921], coverV: 0.85, readPx: 26, up: [0.179, 0, -0.984], right: [0.984, 0, 0.179] },
  },
};

export function getAnchor(view: Exclude<ViewId, 'boot' | 'overview'>, isNarrow: boolean): Anchor {
  if (isNarrow && ANCHORS_MOBILE[view]) {
    return ANCHORS_MOBILE[view]!;
  }
  return ANCHORS[view];
}

export function getView(view: ViewId, isNarrow: boolean): View {
  if (isNarrow && ANCHORS_MOBILE[view]) {
    return frame(ANCHORS_MOBILE[view]!);
  }
  return VIEWS[view];
}

export const VIEWS: Record<ViewId, View> = {
  boot: aim(new Vector3(-0.05, 2.6, 2.55), new Vector3(-0.05, 1.2, 0.3), new Vector3(0, 1, 0), 44),
  overview: aim(new Vector3(0, 2.3, 2.6), new Vector3(0, 0.6, -0.05), new Vector3(0, 1, 0), 40),
  profileCard: frame(ANCHORS.profileCard),
  laptop: frame(ANCHORS.laptop),
  stack: frame(ANCHORS.stack),
  blueprint: frame(ANCHORS.blueprint),
  logbook: frame(ANCHORS.logbook),
  dictionary: frame(ANCHORS.dictionary),
  phone: frame(ANCHORS.phone),
  diploma: frame(ANCHORS.diploma),
};

export const OBJECT_VIEWS: Exclude<ViewId, 'boot' | 'overview'>[] = [
  'profileCard',
  'logbook',
  'diploma',
  'stack',
  'blueprint',
  'dictionary',
  'phone',
  'laptop',
];

export const VIEW_SECTION: Record<ViewId, SectionId | null> = {
  boot: null,
  overview: null,
  profileCard: 'about',
  laptop: null,
  diploma: 'education',
  stack: 'skills',
  blueprint: 'projects',
  logbook: 'experience',
  dictionary: 'languages',
  phone: 'contact',
};

export const SECTION_VIEW: Record<SectionId, ViewId> = {
  about: 'profileCard',
  education: 'diploma',
  skills: 'stack',
  projects: 'blueprint',
  experience: 'logbook',
  languages: 'dictionary',
  contact: 'phone',
};

export const VIEW_LABEL: Record<ViewId, string> = {
  boot: 'Arranque',
  overview: 'Vista general',
  profileCard: 'Ficha',
  diploma: 'Diploma',
  laptop: 'Terminal',
  stack: 'Pizarra',
  blueprint: 'Blueprint',
  logbook: 'Bitácora',
  dictionary: 'Diccionario',
  phone: 'Teléfono',
};
