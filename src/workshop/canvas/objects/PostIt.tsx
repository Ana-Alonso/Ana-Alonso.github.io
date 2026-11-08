import { RoundedBox, useCursor } from '@react-three/drei';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import { Group, MeshStandardMaterial } from 'three';
import { damp } from 'maath/easing';
import { usePrefersReducedMotion } from '../../../shared/hooks/usePrefersReducedMotion';
import { useLamp } from '../../store/useLamp';
import { useWorkshop } from '../../store/useWorkshop';
import { NOTE_TEX, paintCorkNotes } from '../../surfaces/paint/corkNotes';
import { useSurfaceTexture } from '../../surfaces/useSurfaceTexture';
import { MATERIALS } from '../materials';

const SHEET: [number, number, number] = [0.40, 0.27, 0.006];
const PAPER_EDGE = 0.008;

export function PostIt({
  position,
  label,
  items,
}: {
  position: [number, number, number];
  label: string;
  items: readonly string[];
}) {
  const riser = useRef<Group>(null);
  const face = useRef<MeshStandardMaterial>(null);
  const level = useRef({ v: 0.1 });
  const [hovered, setHovered] = useState(false);
  const open = useWorkshop((state) => state.view === 'stack');
  const night = useLamp((state) => state.night);
  const reduce = usePrefersReducedMotion();
  const raised = hovered && open;
  useCursor(raised);

  const { map, markDirty } = useSurfaceTexture({
    tex: NOTE_TEX,
    active: true,
    paint: (ctx) => paintCorkNotes(ctx, label, items, raised),
  });

  useEffect(markDirty, [raised, label, items, markDirty]);

  useFrame((_, delta) => {
    if (riser.current) {
      const goal = raised ? 0.002 : 0;
      if (reduce) riser.current.position.z = goal;
      else damp(riser.current.position, 'z', goal, 0.12, delta);
    }
    if (face.current) {
      const goal = open ? (night ? 0.3 : 0.12) : night ? 0.2 : 0.1;
      if (reduce) level.current.v = goal;
      else damp(level.current, 'v', goal, 0.25, delta);
      face.current.emissiveIntensity = level.current.v;
    }
  });

  return (
    <group
      position={position}
      onPointerOver={(event: ThreeEvent<PointerEvent>) => {
        if (!open) return;
        event.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      <group ref={riser}>
        <RoundedBox args={SHEET} radius={0.0012} smoothness={2} castShadow receiveShadow>
          <meshStandardMaterial color={MATERIALS.paper} roughness={0.9} metalness={0} />
        </RoundedBox>

        <mesh position={[0, 0, SHEET[2] / 2 + 0.0007]}>
          <planeGeometry args={[SHEET[0] - PAPER_EDGE, SHEET[1] - PAPER_EDGE]} />
          <meshStandardMaterial
            ref={face}
            map={map}
            emissiveMap={map}
            emissive="#ffffff"
            emissiveIntensity={0.1}
            roughness={0.86}
            metalness={0}
          />
        </mesh>

        <mesh position={[0, SHEET[1] / 2 - 0.016, SHEET[2] / 2 + 0.004]} castShadow>
          <sphereGeometry args={[0.0065, 14, 10]} />
          <meshStandardMaterial color={MATERIALS.blushDeep} roughness={0.42} metalness={0.12} />
        </mesh>
      </group>
    </group>
  );
}
