import { RoundedBox } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { damp } from 'maath/easing';
import { useCallback, useEffect, useRef, useState } from 'react';
import { MeshBasicMaterial } from 'three';
import { usePrefersReducedMotion } from '../../../shared/hooks/usePrefersReducedMotion';
import { useLamp } from '../../store/useLamp';
import { useWorkshop } from '../../store/useWorkshop';
import { PHONE_TEX, paintPhoneScreen, type PhoneAction } from '../../surfaces/paint/phoneLock';
import { surfaceLayoutFor } from '../../surfaces/layout';
import { useSurfaceTexture } from '../../surfaces/useSurfaceTexture';
import { useSurfaceScroll } from '../../surfaces/useSurfaceScroll';
import { openHref, useSurfaceActions } from '../../surfaces/useSurfaceActions';
import { useSurfaceFocus } from '../../surfaces/useSurfaceFocus';
import { Hoverable } from '../furniture/Hoverable';
import { MATERIALS } from '../materials';
import type { Region } from '../../surfaces/regions';

export function Phone({ position }: { position: [number, number, number] }) {
  const screen = useRef<MeshBasicMaterial>(null);
  const level = useRef({ v: 0.05 });
  const size = useThree((state) => state.size);
  const reduce = usePrefersReducedMotion();
  const open = useWorkshop((state) => state.view === 'phone');
  const night = useLamp((state) => state.night);
  const scroll = useSurfaceScroll((state) => (state.view === 'phone' ? state.offset : 0));
  const regions = useRef<Region<PhoneAction>[] | null>(null);
  const followed = useRef<string | null>(null);
  const focused = useSurfaceFocus((state) => state.href);
  const [minuteTick, setMinuteTick] = useState(0);

  const { map, markDirty } = useSurfaceTexture({
    tex: PHONE_TEX,
    active: open,
    paint: (ctx) => {
      const painted = paintPhoneScreen(ctx, { night, scroll, now: new Date(), focused });
      regions.current = painted.regions;
      const max = painted.contentHeight - painted.viewport;
      const layout = surfaceLayoutFor('phone', size.width, size.height);
      useSurfaceScroll.getState().setExtent('phone', max, layout.texPerPx);
      if (focused && followed.current !== focused) {
        followed.current = focused;
        const region = painted.regions.find((item) => item.action.href === focused);
        if (region && max > 0) {
          const wanted = Math.max(0, Math.min(max, region.y - (painted.viewport - region.h) / 2));
          useSurfaceScroll.getState().scrollTo('phone', wanted / max);
        }
      }
    },
  });

  useEffect(() => {
    let timer = 0;
    const schedule = () => {
      const now = new Date();
      const ms = (60 - now.getSeconds()) * 1000 - now.getMilliseconds() + 250;
      timer = window.setTimeout(() => {
        setMinuteTick((tick) => tick + 1);
        schedule();
      }, ms);
    };
    schedule();
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!focused) followed.current = null;
    markDirty();
  }, [night, open, scroll, focused, minuteTick, size.width, size.height, markDirty]);

  const onAction = useCallback((action: PhoneAction) => openHref(action.href), []);
  const actions = useSurfaceActions({ view: 'phone', tex: PHONE_TEX, active: open, regionsRef: regions, onAction });

  useFrame((_, delta) => {
    if (!screen.current) return;
    const brightness = open ? (night ? 0.62 : 0.9) : night ? 0.16 : 0.05;
    if (reduce) level.current.v = brightness;
    else damp(level.current, 'v', brightness, 0.25, delta);
    screen.current.color.setScalar(level.current.v);
  });

  return (
    <Hoverable view="phone" position={position} rotation={[0, -0.32, 0]}>
      {/* Chasis principal de aluminio con cristal trasero */}
      <RoundedBox args={[0.078, 0.012, 0.158]} radius={0.005} smoothness={5} position={[0, 0.006, 0]} castShadow receiveShadow>
        <meshPhysicalMaterial color={MATERIALS.glassDark} roughness={0.16} metalness={0.35} clearcoat={1} clearcoatRoughness={0.06} />
      </RoundedBox>

      {/* Módulo de cámara trasera (Camera bump) y lentes */}
      <group position={[-0.022, 0.001, -0.052]}>
        <RoundedBox args={[0.026, 0.002, 0.034]} radius={0.002} smoothness={3} position={[0, 0, 0]}>
          <meshStandardMaterial color="#1a1c22" roughness={0.3} metalness={0.6} />
        </RoundedBox>
        <mesh position={[0, 0.001, -0.008]} rotation={[-Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.004, 0.004, 0.001, 16]} />
          <meshPhysicalMaterial color="#0b0c10" roughness={0.1} metalness={0.8} clearcoat={1} />
        </mesh>
        <mesh position={[0, 0.001, 0.008]} rotation={[-Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.004, 0.004, 0.001, 16]} />
          <meshPhysicalMaterial color="#0b0c10" roughness={0.1} metalness={0.8} clearcoat={1} />
        </mesh>
      </group>

      {/* Pantalla frontal OLED con bisel fino */}
      <mesh position={[0, 0.0125, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.072, 0.152]} />
        <meshBasicMaterial color="#050608" />
      </mesh>
      <mesh position={[0, 0.0135, 0]} rotation={[-Math.PI / 2, 0, 0]} {...actions}>
        <planeGeometry args={[0.068, 0.146]} />
        <meshBasicMaterial ref={screen} map={map} color="#ffffff" toneMapped={false} />
      </mesh>
    </Hoverable>
  );
}
