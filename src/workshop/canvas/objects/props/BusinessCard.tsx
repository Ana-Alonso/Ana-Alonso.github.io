import { DESK_TOP } from '../../furniture/Desk';
import { PALETTE } from '../../../../shared/theme';

export function BusinessCard({ at, yaw }: { at: readonly [number, number]; yaw: number }) {
  const [w, h] = [0.085, 0.052];

  return (
    <group position={[at[0], DESK_TOP + 0.0005, at[1]]} rotation={[-Math.PI / 2, 0, yaw]}>
      <mesh>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial color={PALETTE.porcelain} roughness={0.8} metalness={0} />
      </mesh>
    </group>
  );
}
