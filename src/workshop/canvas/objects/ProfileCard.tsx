import { RoundedBox } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { damp } from 'maath/easing';
import { useCallback, useEffect, useRef } from 'react';
import { MeshStandardMaterial } from 'three';
import { profile } from '../../../record/content';
import { usePrefersReducedMotion } from '../../../shared/hooks/usePrefersReducedMotion';
import { useLamp } from '../../store/useLamp';
import { useWorkshop } from '../../store/useWorkshop';
import { PROFILE_SHEET_TEX, paintProfileSheet, type ProfileSheetAction } from '../../surfaces/paint/profileSheet';
import { surfaceLayoutFor } from '../../surfaces/layout';
import { useSurfaceTexture } from '../../surfaces/useSurfaceTexture';
import { useSurfaceScroll } from '../../surfaces/useSurfaceScroll';
import { openHref, useSurfaceActions } from '../../surfaces/useSurfaceActions';
import { useSurfaceFocus } from '../../surfaces/useSurfaceFocus';
import { MIN_TOUCH_PX } from '../../surfaces/regions';
import { Hoverable } from '../furniture/Hoverable';
import { MATERIALS } from '../materials';
import type { Region } from '../../surfaces/regions';

const THICK = 0.0012;
const SHEET_W = 0.105;
const SHEET_H = 0.148;

export function ProfileCard({ position }: { position: [number, number, number] }) {
  const face = useRef<MeshStandardMaterial>(null);
  const photo = useRef<HTMLImageElement | null>(null);
  const level = useRef({ v: 0.07 });
  const size = useThree((state) => state.size);
  const reduce = usePrefersReducedMotion();
  const open = useWorkshop((state) => state.view === 'profileCard');
  const night = useLamp((state) => state.night);
  const regions = useRef<Region<ProfileSheetAction>[] | null>(null);
  const focused = useSurfaceFocus((state) => state.href);

  const { map, markDirty } = useSurfaceTexture({
    tex: PROFILE_SHEET_TEX,
    active: true,
    paint: (ctx) => {
      const layout = surfaceLayoutFor('profileCard', size.width, size.height);
      const painted = paintProfileSheet(ctx, photo.current, focused, MIN_TOUCH_PX * layout.texPerPx, layout.kind === 'sheet');
      regions.current = painted.regions;
      useSurfaceScroll.getState().setExtent('profileCard', painted.contentHeight - painted.viewport, layout.texPerPx);
    },
  });

  useEffect(() => {
    markDirty();
  }, [focused, size.width, size.height, markDirty]);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.decoding = 'async';
    img.onload = markDirty;
    img.src = profile.avatarSrc;
    photo.current = img;
    return () => {
      img.onload = null;
    };
  }, [markDirty]);

  const onAction = useCallback((action: ProfileSheetAction) => openHref(action.href), []);
  const actions = useSurfaceActions({ view: 'profileCard', tex: PROFILE_SHEET_TEX, active: open, regionsRef: regions, onAction });

  useFrame((_, delta) => {
    if (!face.current) return;
    const goal = open ? (night ? 0.2 : 0.09) : night ? 0.12 : 0.07;
    if (reduce) level.current.v = goal;
    else damp(level.current, 'v', goal, 0.25, delta);
    face.current.emissiveIntensity = level.current.v;
  });

  return (
    <Hoverable view="profileCard" position={position} rotation={[0, -0.2, 0]}>
      <RoundedBox args={[SHEET_W, THICK, SHEET_H]} radius={0.0004} smoothness={2} position={[0, THICK / 2, 0]} receiveShadow>
        <meshStandardMaterial color={MATERIALS.porcelain} roughness={0.55} metalness={0} />
      </RoundedBox>

      <mesh position={[0, THICK + 0.0007, 0]} rotation={[-Math.PI / 2, 0, 0]} {...actions}>
        <planeGeometry args={[SHEET_W, SHEET_H]} />
        <meshStandardMaterial
          ref={face}
          map={map}
          emissiveMap={map}
          emissive="#ffffff"
          emissiveIntensity={0.07}
          roughness={0.62}
          metalness={0}
        />
      </mesh>
    </Hoverable>
  );
}
