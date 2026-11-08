import { DESK_TOP } from '../../furniture/Desk';
import { MATERIALS } from '../../materials';

export function WaterGlass({ at }: { at: readonly [number, number] }) {
  return (
    <group position={[at[0], DESK_TOP + 0.042, at[1]]} castShadow receiveShadow>
      <mesh position={[0, 0.042, 0]}>
        <cylinderGeometry args={[0.024, 0.02, 0.084, 20]} />
        <meshStandardMaterial color={MATERIALS.glassDark} roughness={0.1} metalness={0.35} transparent opacity={0.85} />
      </mesh>
      <mesh position={[0, 0.079, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.02, 20]} />
        <meshStandardMaterial color="#a2d2ff" roughness={0.1} metalness={0.1} transparent opacity={0.55} />
      </mesh>
    </group>
  );
}
