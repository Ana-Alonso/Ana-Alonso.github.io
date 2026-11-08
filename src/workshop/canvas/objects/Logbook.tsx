import { RoundedBox } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { damp } from 'maath/easing';
import { useEffect, useRef } from 'react';
import { MeshStandardMaterial } from 'three';
import { usePrefersReducedMotion } from '../../../shared/hooks/usePrefersReducedMotion';
import { useLamp } from '../../store/useLamp';
import { useWorkshop } from '../../store/useWorkshop';
import { LOGBOOK_TEX, paintLogbookPage, type LogbookAction } from '../../surfaces/paint/logbookPages';
import { MIN_TOUCH_PX, type Region } from '../../surfaces/regions';
import { surfaceLayoutFor } from '../../surfaces/layout';
import { useSurfaceScroll } from '../../surfaces/useSurfaceScroll';
import { useSurfaceTexture } from '../../surfaces/useSurfaceTexture';
import { useSurfaceActions } from '../../surfaces/useSurfaceActions';
import { Hoverable } from '../furniture/Hoverable';
import { MATERIALS } from '../materials';

const PAGE: [number, number, number] = [0.152, 0.01, 0.205];
const SHEET: [number, number] = [0.146, 0.2];

export function Logbook({ position }: { position: [number, number, number] }) {
  const face = useRef<MeshStandardMaterial>(null);
  const level = useRef({ v: 0.1 });
  const regions = useRef<Region<LogbookAction>[] | null>(null);
  const shown = useRef(0);
  const from = useRef(0);
  const turn = useRef({ v: 0 });
  const size = useThree((state) => state.size);
  const reduce = usePrefersReducedMotion();
  const open = useWorkshop((state) => state.view === 'logbook');
  const night = useLamp((state) => state.night);

  const { map, markDirty } = useSurfaceTexture({
    tex: LOGBOOK_TEX,
    active: open,
    paint: (ctx) => {
      const layout = surfaceLayoutFor('logbook', size.width, size.height);
      const painted = paintLogbookPage(ctx, { page: shown.current, prev: from.current, turn: turn.current.v, minTouchPx: MIN_TOUCH_PX * layout.texPerPx });
      useSurfaceScroll.getState().setExtent('logbook', painted.contentHeight - painted.viewport, layout.texPerPx);
      regions.current = painted.regions;
    },
  });

  useEffect(() => {
    markDirty();
  }, [open, size.width, size.height, markDirty]);

  const onAction = (action: LogbookAction) => {
    const scroll = useSurfaceScroll.getState();
    scroll.scrollBy('logbook', ((action === 'next' ? 1 : -1) * LOGBOOK_TEX[1]) / scroll.scale);
  };

  const actions = useSurfaceActions({ view: 'logbook', tex: LOGBOOK_TEX, active: open, regionsRef: regions, onAction });

  useFrame((_, delta) => {
    const scroll = useSurfaceScroll.getState();
    const wanted = scroll.view === 'logbook' ? Math.round(scroll.offset / LOGBOOK_TEX[1]) : 0;
    if (wanted !== shown.current) {
      from.current = shown.current;
      shown.current = wanted;
      turn.current.v = reduce ? 0 : 1;
    }
    if (turn.current.v > 0) {
      if (reduce) turn.current.v = 0;
      else {
        damp(turn.current, 'v', 0, 0.3, delta);
        if (turn.current.v < 1e-3) turn.current.v = 0;
      }
      markDirty();
    }

    if (face.current) {
      const brightness = open ? (night ? 0.34 : 0.14) : night ? 0.2 : 0.1;
      if (reduce) level.current.v = brightness;
      else damp(level.current, 'v', brightness, 0.25, delta);
      face.current.emissiveIntensity = level.current.v;
    }
  });

  return (
    <Hoverable view="logbook" position={position} rotation={[0, 0.34, 0]}>
      <RoundedBox args={[0.335, 0.006, 0.218]} radius={0.0028} smoothness={3} position={[0, 0.003, 0]} receiveShadow castShadow>
        <meshStandardMaterial color={MATERIALS.rainDeep} roughness={0.62} metalness={0.08} />
      </RoundedBox>

      {[-1, 1].map((side) => (
        <group key={`pag-${side}`} rotation={[0, 0, side * -0.028]} position={[side * 0.079, 0.011, 0]}>
          <RoundedBox args={PAGE} radius={0.003} smoothness={2} castShadow>
            <meshStandardMaterial color={MATERIALS.paper} roughness={0.88} metalness={0} />
          </RoundedBox>

          {side === 1 ? (
            <mesh position={[0, 0.0065, 0]} rotation={[-Math.PI / 2, 0, 0]} {...actions}>
              <planeGeometry args={SHEET} />
              <meshStandardMaterial
                ref={face}
                map={map}
                emissiveMap={map}
                emissive="#ffffff"
                emissiveIntensity={0.1}
                roughness={0.62}
                metalness={0}
              />
            </mesh>
          ) : null}
        </group>
      ))}

      <RoundedBox args={[0.014, 0.009, 0.218]} radius={0.002} smoothness={2} position={[0, 0.008, 0]}>
        <meshStandardMaterial color={MATERIALS.rainDeep} roughness={0.6} />
      </RoundedBox>

      <group position={[-0.07, 0.021, 0.01]} rotation={[0, -Math.PI / 2, Math.PI / 2]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.0042, 0.0042, 0.135, 10]} />
          <meshStandardMaterial color={MATERIALS.brass} roughness={0.4} metalness={0.5} />
        </mesh>
        <mesh position={[0, 0.072, 0]}>
          <coneGeometry args={[0.0042, 0.014, 10]} />
          <meshStandardMaterial color={MATERIALS.ink} roughness={0.7} />
        </mesh>
      </group>
    </Hoverable>
  );
}
