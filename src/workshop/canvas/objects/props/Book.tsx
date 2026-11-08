import { DESK_TOP } from '../../furniture/Desk';

export function Book({ size, color, yaw, lift }: { size: [number, number, number]; color: string; yaw: number; lift: number }) {
  const [w, h, d] = size;
  return (
    <mesh position={[0, DESK_TOP + lift, 0]} rotation={[-Math.PI / 2, 0, yaw]}>
      <boxGeometry args={[w, h, d]} />
      <meshStandardMaterial color={color} roughness={0.8} metalness={0} />
    </mesh>
  );
}
