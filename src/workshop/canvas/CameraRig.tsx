import { useFrame } from '@react-three/fiber';
import { damp, damp3, dampQ } from 'maath/easing';
import { MathUtils, Vector3, type PerspectiveCamera } from 'three';
import type { View } from './views';
import { useWorkshop } from '../store/useWorkshop';
import { SHEET_BREAKPOINT, surfaceLayoutFor, type SurfaceKind } from '../surfaces/layout';
import { overlaySize } from '../overlay/size';
import { getView, VIEW_SECTION, type ViewId } from './views';

const SMOOTH_PAN = 0.44;
const SMOOTH_BOOT = 1.05;

const goal = new Vector3();
const sideways = new Vector3();
const upright = new Vector3();

function fitToAspect(target: View, aspect: number, out: Vector3): Vector3 {
  const halfVertical = MathUtils.degToRad(target.fov) / 2;
  const halfHorizontal = Math.atan(Math.tan(halfVertical) * aspect);
  const push = Math.min(Math.max(1, Math.sin(halfVertical) / Math.sin(halfHorizontal)), 2.5);
  return out.copy(target.pos).sub(target.center).multiplyScalar(push).add(target.center);
}

const RAIL_COVER = 0.44;
const RAIL_MAX_PX = 460;

function overlayInsets(kind: SurfaceKind, width: number, height: number) {
  const narrow = width < SHEET_BREAKPOINT;
  const sheet = kind === 'sheet';
  const rail = !narrow && sheet;
  return {
    top: narrow && sheet ? overlaySize.bar : 0,
    bottom: rail ? 0 : narrow && sheet ? Math.min(overlaySize.caption, height * 0.45) : overlaySize.bar,
    left: rail ? overlaySize.barWidth : 0,
    right: narrow || !sheet ? 0 : Math.min(RAIL_MAX_PX, width * RAIL_COVER),
  };
}

function clearDrawer(target: View, out: Vector3, kind: SurfaceKind, width: number, height: number): void {
  const distance = out.distanceTo(target.center);
  const visible = 2 * distance * Math.tan(MathUtils.degToRad(target.fov) / 2);
  const unitsPerPixel = visible / height;
  const up = upright.set(0, 1, 0).applyQuaternion(target.quat);
  const insets = overlayInsets(kind, width, height);

  const bandCenter = (insets.top + (height - insets.bottom)) / 2;
  out.addScaledVector(up, (bandCenter - height / 2) * unitsPerPixel);
  const side = (insets.right - insets.left) / 2;
  if (side !== 0) out.addScaledVector(sideways.set(1, 0, 0).applyQuaternion(target.quat), side * unitsPerPixel);
}

export function CameraRig({ reducedMotion = false }: { reducedMotion?: boolean }) {
  const view = useWorkshop((state) => state.view);
  const booted = useWorkshop((state) => state.booted);

  useFrame((state, delta) => {
    const camera = state.camera as PerspectiveCamera;
    const active: ViewId = booted ? view : 'boot';
    const { width, height } = state.size;
    const isNarrow = width < SHEET_BREAKPOINT;
    const target = getView(active, isNarrow);
    const smoothTime = booted ? SMOOTH_PAN : SMOOTH_BOOT;
    const layout = surfaceLayoutFor(active, width, height);

    const wanted = target.screen
      ? goal.copy(target.center).addScaledVector(target.dir, layout.d)
      : fitToAspect(target, width / height, goal);
    if (booted && VIEW_SECTION[active]) clearDrawer(target, wanted, layout.kind, width, height);

    if (reducedMotion) {
      camera.position.copy(wanted);
      camera.quaternion.copy(target.quat);
      if (camera.fov !== target.fov) {
        camera.fov = target.fov;
        camera.updateProjectionMatrix();
      }
      return;
    }

    damp3(camera.position, wanted, smoothTime, delta);
    dampQ(camera.quaternion, target.quat, smoothTime, delta);
    if (damp(camera, 'fov', target.fov, smoothTime, delta)) camera.updateProjectionMatrix();
  });

  return null;
}
