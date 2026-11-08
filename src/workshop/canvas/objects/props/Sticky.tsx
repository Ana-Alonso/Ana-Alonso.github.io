import { DESK_TOP } from '../../furniture/Desk';
import { PALETTE } from '../../../../shared/theme';

const PAPER_LIFT = 0.02;

export function Sticky({ at, yaw }: { at: readonly [number, number]; yaw: number }) {
  return (
    <mesh position={[at[0], DESK_TOP + PAPER_LIFT, at[1]]} rotation={[-Math.PI / 2, 0, yaw]}>
      <meshStandardMaterial color={PALETTE.porcelain} roughness={0.8} metalness={0} />
    </mesh>
  );
}
