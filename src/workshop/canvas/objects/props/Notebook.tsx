import { DESK_TOP } from '../../furniture/Desk';

export function Notebook({ at, yaw, color }: { at: readonly [number, number]; yaw: number; color: string }) {
  const [w, h, d] = [0.14, 0.012, 0.1];
  return (
    <mesh position={[at[0], DESK_TOP + 0.02, at[1]]} rotation={[-Math.PI / 2, 0, yaw]}>
      <boxGeometry args={[w, h, d]} />
      <meshStandardMaterial color={color} roughness={0.8} metalness={0} />
    </mesh>
  );
}
