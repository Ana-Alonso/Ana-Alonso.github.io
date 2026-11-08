import { RoundedBox } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { MeshStandardMaterial } from 'three';
import { damp } from 'maath/easing';
import { skillCategories } from '../../../record/content';
import { PALETTE } from '../../../shared/theme';
import { usePrefersReducedMotion } from '../../../shared/hooks/usePrefersReducedMotion';
import { useLamp } from '../../store/useLamp';
import { useWorkshop } from '../../store/useWorkshop';
import { Hoverable } from '../furniture/Hoverable';
import { MATERIALS } from '../materials';
import { corkTexture } from '../textures';
import { PostIt } from './PostIt';

const BOARD: [number, number, number] = [0.94, 0.70, 0.016];
const MOULDING = 0.03;
const BOARD_Z = 0.012;
const MOULDING_Z = 0.0295;
const NOTE_Z = 0.0235;
const COLUMN = 0.44;
const ROW = 0.31;

const NOTES = skillCategories.map((category, index) => ({
  ...category,
  position: [
    (index % 2) * COLUMN - COLUMN / 2,
    ROW / 2 - Math.floor(index / 2) * ROW,
    NOTE_Z,
  ] as [number, number, number],
}));

const FRAME = [
  { args: [BOARD[0], MOULDING, MOULDING] as [number, number, number], x: 0, y: BOARD[1] / 2 - MOULDING / 2 },
  { args: [BOARD[0], MOULDING, MOULDING] as [number, number, number], x: 0, y: -(BOARD[1] / 2 - MOULDING / 2) },
  { args: [MOULDING, BOARD[1] - MOULDING * 2, MOULDING] as [number, number, number], x: BOARD[0] / 2 - MOULDING / 2, y: 0 },
  { args: [MOULDING, BOARD[1] - MOULDING * 2, MOULDING] as [number, number, number], x: -(BOARD[0] / 2 - MOULDING / 2), y: 0 },
];

export function Whiteboard({ position }: { position: [number, number, number] }) {
  const cork = useRef<MeshStandardMaterial>(null);
  const level = useRef({ v: 0.06 });
  const texture = useMemo(() => corkTexture(0.3), []);
  const night = useLamp((state) => state.night);
  const open = useWorkshop((state) => state.view === 'stack');
  const reduce = usePrefersReducedMotion();

  useEffect(() => () => texture.dispose(), [texture]);

  useFrame((_, delta) => {
    if (!cork.current) return;
    const goal = open ? (night ? 0.2 : 0.09) : night ? 0.13 : 0.06;
    if (reduce) level.current.v = goal;
    else damp(level.current, 'v', goal, 0.25, delta);
    cork.current.emissiveIntensity = level.current.v;
  });

  return (
    <Hoverable view="stack" position={position} mount={{ axis: 'z', lift: 0.004 }}>
      <RoundedBox args={BOARD} radius={0.006} smoothness={2} position={[0, 0, BOARD_Z]} receiveShadow>
        <meshStandardMaterial
          ref={cork}
          map={texture}
          emissive={PALETTE.lampWash}
          emissiveMap={texture}
          emissiveIntensity={0.06}
          roughness={0.92}
          metalness={0}
        />
      </RoundedBox>

      {FRAME.map((piece, index) => (
        <RoundedBox
          key={`marco-${index}`}
          args={piece.args}
          radius={0.008}
          smoothness={2}
          position={[piece.x, piece.y, MOULDING_Z]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial color={MATERIALS.woodDeep} roughness={0.55} metalness={0.05} />
        </RoundedBox>
      ))}

      {NOTES.map((note) => (
        <PostIt key={note.label} position={note.position} label={note.label} items={note.skills} />
      ))}
    </Hoverable>
  );
}
