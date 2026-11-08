import { useFrame } from '@react-three/fiber';
import { damp3 } from 'maath/easing';
import { useRef, type ReactNode } from 'react';
import { Group, Vector3 } from 'three';
import { usePrefersReducedMotion } from '../../shared/hooks/usePrefersReducedMotion';
import { useWorkshop } from '../store/useWorkshop';
import { getAnchor, OBJECT_VIEWS, type ViewId } from './views';

const DROP = 0.34;
const SMOOTH = 0.22;

type PieceView = Exclude<ViewId, 'boot' | 'overview'>;

const ZERO: [number, number, number] = [0, 0, 0];
const markPoint = new Vector3();

export function Placed({ view, children }: { view: PieceView; children: ReactNode }) {
  const group = useRef<Group>(null);
  const published = useRef<{ x: number; y: number } | null>(null);
  const index = OBJECT_VIEWS.indexOf(view);
  const reduce = usePrefersReducedMotion();
  const booted = useWorkshop((state) => state.booted);
  const placed = useWorkshop((state) => state.placed);
  const setMark = useWorkshop((state) => state.setMark);

  const landed = reduce || booted || placed > index;
  const falling = !reduce && !booted && placed === index + 1;

  useFrame((state, delta) => {
    if (!group.current) return;
    group.current.visible = landed;
    if (landed) damp3(group.current.position, ZERO, SMOOTH, delta);
    else group.current.position.set(0, DROP, 0);

    if (!falling) {
      published.current = null;
      return;
    }
    const isNarrow = state.size.width < 640;
    const anchor = getAnchor(view, isNarrow);
    state.camera.updateMatrixWorld();
    markPoint.set(anchor.center[0], anchor.center[1] + anchor.radius + 0.05, anchor.center[2]).project(state.camera);
    const x = (markPoint.x * 0.5 + 0.5) * 100;
    const y = (0.5 - markPoint.y * 0.5) * 100;
    const last = published.current;
    if (last && Math.abs(last.x - x) < 0.15 && Math.abs(last.y - y) < 0.15) return;
    published.current = { x, y };
    setMark({ view, x, y });
  });

  return <group ref={group} visible={false}>{children}</group>;
}
