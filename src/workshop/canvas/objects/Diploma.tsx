import { RoundedBox } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { damp } from 'maath/easing';
import { useEffect, useRef } from 'react';
import { MeshStandardMaterial } from 'three';
import { usePrefersReducedMotion } from '../../../shared/hooks/usePrefersReducedMotion';
import { useLamp } from '../../store/useLamp';
import { useWorkshop } from '../../store/useWorkshop';
import { DIPLOMA_TEX, paintDiplomaSheet } from '../../surfaces/paint/diplomaSheet';
import { useSurfaceScroll } from '../../surfaces/useSurfaceScroll';
import { useSurfaceTexture } from '../../surfaces/useSurfaceTexture';
import { Hoverable } from '../furniture/Hoverable';
import { MATERIALS } from '../materials';

import { useThree } from '@react-three/fiber';
import { SHEET_BREAKPOINT } from '../../surfaces/layout';

const FRAME_W = 0.58;
const FRAME_H = 0.42;
const THICK = 0.016;
const MOULDING = 0.022;

const DESKTOP_POS: [number, number, number] = [-1.712, 1.38, -0.35];
const DESKTOP_ROT: [number, number, number] = [0, Math.PI / 2, 0];

const MOBILE_POS: [number, number, number] = [-0.5, 1.88, -1.488];
const MOBILE_ROT: [number, number, number] = [0, 0, 0];

export function Diploma({ position }: { position?: [number, number, number] }) {
  const width = useThree((state) => state.size.width);
  const isNarrow = width < SHEET_BREAKPOINT;

  const resolvedPos = position ?? (isNarrow ? MOBILE_POS : DESKTOP_POS);
  const resolvedRot = isNarrow ? MOBILE_ROT : DESKTOP_ROT;

  const face = useRef<MeshStandardMaterial>(null);
  const level = useRef({ v: 0.06 });
  const open = useWorkshop((state) => state.view === 'diploma');
  const night = useLamp((state) => state.night);
  const reduce = usePrefersReducedMotion();

  const { map, markDirty } = useSurfaceTexture({
    tex: DIPLOMA_TEX,
    active: open,
    paint: (ctx) => {
      paintDiplomaSheet(ctx);
      useSurfaceScroll.getState().setExtent('diploma', 0, 1);
    },
  });

  useEffect(() => {
    markDirty();
  }, [open, markDirty]);

  useFrame((_, delta) => {
    if (!face.current) return;
    const goal = open ? (night ? 0.22 : 0.08) : night ? 0.04 : 0.02;
    if (reduce) level.current.v = goal;
    else damp(level.current, 'v', goal, 0.25, delta);
    face.current.emissiveIntensity = level.current.v;
  });

  // Modo móvil: pared frontal encima de la pizarra (Z = -1.5, rot 0). Modo PC: pared izquierda original (X = -1.712, rot 90°)
  return (
    <Hoverable view="diploma" position={resolvedPos} rotation={resolvedRot}>
      {/* Moldura superior e inferior de madera noble */}
      <RoundedBox args={[FRAME_W, MOULDING, THICK]} radius={0.003} smoothness={2} position={[0, FRAME_H / 2 - MOULDING / 2, 0]} castShadow>
        <meshStandardMaterial color={MATERIALS.woodDeep} roughness={0.48} metalness={0.05} />
      </RoundedBox>
      <RoundedBox args={[FRAME_W, MOULDING, THICK]} radius={0.003} smoothness={2} position={[0, -(FRAME_H / 2 - MOULDING / 2), 0]} castShadow>
        <meshStandardMaterial color={MATERIALS.woodDeep} roughness={0.48} metalness={0.05} />
      </RoundedBox>

      {/* Molduras laterales */}
      <RoundedBox args={[MOULDING, FRAME_H - MOULDING * 2, THICK]} radius={0.003} smoothness={2} position={[FRAME_W / 2 - MOULDING / 2, 0, 0]} castShadow>
        <meshStandardMaterial color={MATERIALS.woodDeep} roughness={0.48} metalness={0.05} />
      </RoundedBox>
      <RoundedBox args={[MOULDING, FRAME_H - MOULDING * 2, THICK]} radius={0.003} smoothness={2} position={[-(FRAME_W / 2 - MOULDING / 2), 0, 0]} castShadow>
        <meshStandardMaterial color={MATERIALS.woodDeep} roughness={0.48} metalness={0.05} />
      </RoundedBox>

      {/* Fondo / Passe-partout */}
      <mesh position={[0, 0, 0.002]}>
        <planeGeometry args={[FRAME_W - MOULDING * 2, FRAME_H - MOULDING * 2]} />
        <meshStandardMaterial color={MATERIALS.porcelain} roughness={0.92} metalness={0} />
      </mesh>

      {/* Superficie del diploma */}
      <mesh position={[0, 0, 0.005]}>
        <planeGeometry args={[FRAME_W - MOULDING * 2 - 0.02, FRAME_H - MOULDING * 2 - 0.02]} />
        <meshStandardMaterial
          ref={face}
          map={map}
          emissiveMap={map}
          emissive="#ffffff"
          emissiveIntensity={0.06}
          roughness={0.85}
          metalness={0}
        />
      </mesh>
    </Hoverable>
  );
}
