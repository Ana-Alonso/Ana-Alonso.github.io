import { useFrame, useThree } from '@react-three/fiber';
import { damp } from 'maath/easing';
import { useEffect, useRef } from 'react';
import { Mesh, MeshBasicMaterial } from 'three';
import { usePrefersReducedMotion } from '../../../shared/hooks/usePrefersReducedMotion';
import { useLamp } from '../../store/useLamp';
import { useWorkshop } from '../../store/useWorkshop';
import { BLUEPRINT_TEX, paintBlueprintSheet, type SheetAction } from '../../surfaces/paint/blueprintSheet';
import { MIN_TOUCH_PX, type Region } from '../../surfaces/regions';
import { surfaceLayoutFor } from '../../surfaces/layout';
import { useSurfaceScroll } from '../../surfaces/useSurfaceScroll';
import { useSurfaceTexture } from '../../surfaces/useSurfaceTexture';
import { openHref, useSurfaceActions } from '../../surfaces/useSurfaceActions';
import { useSurfaceFocus } from '../../surfaces/useSurfaceFocus';
import { Hoverable } from '../furniture/Hoverable';
import { MATERIALS } from '../materials';

const SHEET: [number, number] = [0.44, 0.3];
const CONTACT_Z = 0.045;

export function Blueprint({ position }: { position: [number, number, number] }) {
  const sheet = useRef<Mesh>(null);
  const face = useRef<MeshBasicMaterial>(null);
  const unroll = useRef({ v: 0 });
  const level = useRef({ v: 0.9 });
  const shown = useRef(0);
  const clickable = useRef(false);
  const regions = useRef<Region<SheetAction>[] | null>(null);
  const followed = useRef<string | null>(null);
  const size = useThree((state) => state.size);
  const reduce = usePrefersReducedMotion();
  const open = useWorkshop((state) => state.view === 'blueprint');
  const night = useLamp((state) => state.night);
  const focused = useSurfaceFocus((state) => state.href);

  const { map, markDirty } = useSurfaceTexture({
    tex: BLUEPRINT_TEX,
    active: open,
    paint: (ctx) => {
      const layout = surfaceLayoutFor('blueprint', size.width, size.height);
      const painted = paintBlueprintSheet(ctx, { plan: shown.current, focused, minTouchPx: MIN_TOUCH_PX * layout.texPerPx });
      const max = painted.contentHeight - painted.viewport;
      useSurfaceScroll.getState().setExtent('blueprint', max, layout.texPerPx);
      regions.current = painted.regions;
      if (focused && followed.current !== focused) {
        followed.current = focused;
        const target = painted.targets.find((item) => item.href === focused);
        if (target && target.plan !== shown.current && max > 0) {
          useSurfaceScroll.getState().scrollTo('blueprint', (target.plan * BLUEPRINT_TEX[1]) / max);
        }
      }
    },
  });

  useEffect(() => {
    if (!focused) followed.current = null;
    markDirty();
  }, [open, focused, size.width, size.height, markDirty]);

  const onAction = (action: SheetAction) => {
    if (action.kind === 'open') {
      openHref(action.href);
      return;
    }
    const scroll = useSurfaceScroll.getState();
    if (action.kind === 'goto') {
      scroll.scrollTo('blueprint', (action.plan * BLUEPRINT_TEX[1]) / scroll.max);
      return;
    }
    scroll.scrollBy('blueprint', (action.dir * BLUEPRINT_TEX[1]) / scroll.scale);
  };

  const actions = useSurfaceActions({
    view: 'blueprint',
    tex: BLUEPRINT_TEX,
    active: open,
    regionsRef: regions,
    onAction,
    enabledRef: clickable,
  });

  useFrame((_, delta) => {
    const scroll = useSurfaceScroll.getState();
    const wanted = scroll.view === 'blueprint' ? Math.round(scroll.offset / BLUEPRINT_TEX[1]) : 0;

    if (reduce) {
      if (wanted !== shown.current) {
        shown.current = wanted;
        markDirty();
      }
      unroll.current.v = open ? 1 : 0;
    } else {
      const goal = open && wanted === shown.current ? 1 : 0;
      // Inercia fluida elástica estilo resorte Apple
      damp(unroll.current, 'v', goal, 0.42, delta);
      if (Math.abs(unroll.current.v - goal) < 2e-4) unroll.current.v = goal;
      if (unroll.current.v === 0 && wanted !== shown.current) {
        shown.current = wanted;
        markDirty();
      }
    }

    const p = unroll.current.v;
    clickable.current = p === 1;
    if (sheet.current) {
      sheet.current.visible = p > 0.004;
      sheet.current.scale.y = p;
      sheet.current.position.z = CONTACT_Z + (SHEET[1] / 2) * p;
    }
    if (face.current) {
      map.repeat.set(1, Math.max(p, 0.001));
      const brightness = open ? (night ? 0.72 : 0.92) : night ? 0.42 : 0.82;
      if (reduce) level.current.v = brightness;
      else damp(level.current, 'v', brightness, 0.25, delta);
      face.current.color.setScalar(level.current.v);
    }
  });

  return (
    <Hoverable view="blueprint" position={position} rotation={[0, -0.24, 0]}>
      <group rotation={[0, 0, Math.PI / 2]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.033, 0.033, 0.46, 28]} />
          <meshStandardMaterial color={MATERIALS.paper} roughness={0.86} metalness={0} />
        </mesh>
        <mesh position={[0.012, 0, 0.012]}>
          <cylinderGeometry args={[0.024, 0.024, 0.465, 20]} />
          <meshStandardMaterial color={MATERIALS.porcelain} roughness={0.9} />
        </mesh>
      </group>

      <mesh rotation={[0, Math.PI / 2, 0]} castShadow>
        <torusGeometry args={[0.036, 0.0035, 8, 28]} />
        <meshStandardMaterial color={MATERIALS.blushDeep} roughness={0.55} metalness={0.12} />
      </mesh>

      <mesh ref={sheet} position={[0, 0.0008, CONTACT_Z + SHEET[1] / 2]} rotation={[-Math.PI / 2, 0, 0]} visible={false} {...actions}>
        <planeGeometry args={SHEET} />
        <meshBasicMaterial ref={face} map={map} toneMapped={false} color="white" />
      </mesh>
    </Hoverable>
  );
}
