import { useCursor } from '@react-three/drei';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Group } from 'three';
import { damp } from 'maath/easing';
import { usePrefersReducedMotion } from '../../../shared/hooks/usePrefersReducedMotion';
import { useWorkshop } from '../../store/useWorkshop';
import type { ViewId } from '../views';

export interface Mount {
  axis?: 'y' | 'z';
  lift?: number;
}

export function Hoverable({
  view,
  position,
  rotation = [0, 0, 0],
  mount,
  children,
}: {
  view: ViewId;
  position: [number, number, number];
  rotation?: [number, number, number];
  mount?: Mount;
  children: ReactNode;
}) {
  const { axis = 'y', lift = 0.014 } = mount ?? {};
  const riser = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);
  const go = useWorkshop((state) => state.go);
  const setHoveredPiece = useWorkshop((state) => state.setHoveredPiece);
  const active = useWorkshop((state) => state.view === view);
  const reduce = usePrefersReducedMotion();
  useCursor(hovered && !active);

  useFrame((_, delta) => {
    if (!riser.current) return;
    const raised = hovered && !active ? lift : 0;
    if (reduce) riser.current.position[axis] = raised;
    else damp(riser.current.position, axis, raised, 0.12, delta);
  });

  return (
    <group
      position={position}
      rotation={rotation}
      onClick={(event: ThreeEvent<MouseEvent>) => {
        event.stopPropagation();
        setHoveredPiece(null);
        go(view);
      }}
      onPointerOver={(event: ThreeEvent<PointerEvent>) => {
        event.stopPropagation();
        setHovered(true);
        if (!active) setHoveredPiece(view);
      }}
      onPointerOut={() => {
        setHovered(false);
        setHoveredPiece(null);
      }}
    >
      <group ref={riser}>{children}</group>
    </group>
  );
}
